// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";
import "./Conditions.sol";
import "./Interfaces/ITransferManagement.sol";
import "./Libraries.sol";

contract TransferManagement is
    BaseStorage,
    Conditions,
    ITransferManagement
{
    using TeamLibrary for Structs.Team;
    using PlayerLibrary for Structs.Player;

    function createTransferOffer(
        address _playerWalletAddress,
        string memory _playerName,
        uint256 _contractExpiresTimestamp
    ) external payable override onlyTeam {
        require(msg.value > 0, "Transfer fee must be > 0.");
        require(
            _contractExpiresTimestamp > block.timestamp,
            "Expiration must be in the future."
        );

        Structs.Player storage player = playersByName[_playerName];
        require(
            player.walletAddress == _playerWalletAddress,
            "Player not found or wallet mismatch."
        );
        player.updateContractStatus(teamsByName);

        Structs.Team storage offeringTeam = teamsByName[
            users[msg.sender].entityName
        ];
        require(bytes(offeringTeam.name).length != 0, "Team not found.");
        require(
            keccak256(abi.encodePacked(player.teamName)) !=
                keccak256(abi.encodePacked(offeringTeam.name)),
            "Cannot make an offer to your own player."
        );

        uint256 newOfferId = nextOfferId++;
        address decider;
        address currentTeamAddr = address(0);

        if (player.isFreeAgent) {
            decider = player.walletAddress;
        } else {
            Structs.Team storage currentTeam = teamsByName[player.teamName];
            require(
                bytes(currentTeam.name).length != 0,
                "Player's current team not found."
            );
            decider = currentTeam.walletAddress;
            currentTeamAddr = currentTeam.walletAddress;
        }

        offers[newOfferId] = Structs.TransferOffer(
            newOfferId,
            msg.sender,
            offeringTeam.name,
            _playerWalletAddress,
            _playerName,
            Enums.OfferStatus.Pending,
            block.timestamp,
            msg.value,
            _contractExpiresTimestamp,
            decider,
            currentTeamAddr
        );

        if (player.isFreeAgent) {
            playerOffers[decider].push(offers[newOfferId]);
        } else {
            teamOffers[decider].push(offers[newOfferId]);
        }

        playerOfferIds[_playerWalletAddress].push(newOfferId);
        teamOfferIds[msg.sender].push(newOfferId);

        emit TransferOfferCreated(
            newOfferId,
            msg.sender,
            _playerWalletAddress,
            decider
        );
    }

    function acceptTransferOffer(uint256 _offerId) external override {
        Structs.TransferOffer storage offer = offers[_offerId];
        require(offer.offerId != 0, "Offer not found.");
        require(
            offer.deciderAddress == msg.sender,
            "Not authorized to decide."
        );
        require(offer.status == Enums.OfferStatus.Pending, "Not pending.");

        Structs.Player storage player = playersByName[offer.playerName];
        Structs.Team storage newTeam = teamsByName[offer.teamName];

        if (player.isFreeAgent) {
            require(
                offer.currentTeamWalletAddress == address(0),
                "Logic error: Free agent has a team."
            );
            payable(player.walletAddress).transfer(offer.transferFee);
            _rejectOtherPendingOffersForPlayer(
                player.walletAddress,
                _offerId
            );
        } else {
            require(
                offer.currentTeamWalletAddress != address(0),
                "Logic error: Contracted player has no team."
            );
            Structs.Team storage oldTeam = teamsByName[player.teamName];
            require(oldTeam.walletAddress == msg.sender, "Not the old team.");

            payable(oldTeam.walletAddress).transfer(offer.transferFee);
            oldTeam.removePlayerFromTeam(player.walletAddress);

            emit PlayerReleased(
                player.walletAddress,
                player.name,
                oldTeam.walletAddress,
                oldTeam.name
            );
        }

        player.signPlayerToTeam(offer.teamName, offer.contractExpires);
        newTeam.addPlayerToTeam(player.walletAddress);
        offer.status = Enums.OfferStatus.Accepted;

        emit TransferOfferStatusChanged(
            _offerId,
            Enums.OfferStatus.Accepted,
            msg.sender,
            offer.teamWalletAddress
        );
        emit PlayerSigned(
            player.walletAddress,
            player.name,
            offer.teamWalletAddress,
            offer.teamName
        );
    }

    function rejectTransferOffer(uint256 _offerId) external override {
        Structs.TransferOffer storage offer = offers[_offerId];
        require(offer.offerId != 0, "Offer not found.");
        require(
            offer.deciderAddress == msg.sender,
            "Not authorized to decide."
        );
        require(offer.status == Enums.OfferStatus.Pending, "Not pending.");

        offer.status = Enums.OfferStatus.Rejected;
        payable(offer.teamWalletAddress).transfer(offer.transferFee);

        emit TransferOfferStatusChanged(
            _offerId,
            Enums.OfferStatus.Rejected,
            msg.sender,
            offer.teamWalletAddress
        );
    }

    function releasePlayer(string memory _playerName)
        external
        payable
        override
        onlyPlayerAccount
    {
        Structs.Player storage player = playersByName[_playerName];
        player.updateContractStatus(teamsByName);

        require(player.walletAddress == msg.sender, "Not your player.");
        require(!player.isFreeAgent, "Already a free agent.");
        require(
            player.contractExpires > 0,
            "No active contract to release."
        );
         require(
        PlayerLibrary.canReleaseFromTeam(player, playerPenalties),
        "Cannot release with unpaid penalties."
    );

        Structs.Team storage currentTeam = teamsByName[player.teamName];
        require(bytes(currentTeam.name).length != 0, "Team not found.");
        require(msg.value > 0, "Release fee must be > 0.");

        payable(currentTeam.walletAddress).transfer(msg.value);

        string memory oldTeamName = player.teamName;
        address oldTeamAddr = currentTeam.walletAddress;

        player.makePlayerFreeAgent();
        currentTeam.removePlayerFromTeam(player.walletAddress);

        emit PlayerReleased(
            player.walletAddress,
            player.name,
            oldTeamAddr,
            oldTeamName
        );
    }

    function _rejectOtherPendingOffersForPlayer(
        address _playerAddress,
        uint256 _acceptedOfferId
    ) internal {
        for (uint256 i = 0; i < playerOffers[_playerAddress].length; i++) {
            Structs.TransferOffer storage otherOffer = offers[
                playerOffers[_playerAddress][i].offerId
            ];
            if (
                otherOffer.offerId != _acceptedOfferId &&
                otherOffer.status == Enums.OfferStatus.Pending
            ) {
                payable(otherOffer.teamWalletAddress).transfer(
                    otherOffer.transferFee
                );
                otherOffer.status = Enums.OfferStatus.Rejected;
                emit TransferOfferStatusChanged(
                    otherOffer.offerId,
                    Enums.OfferStatus.Rejected,
                    _playerAddress,
                    otherOffer.teamWalletAddress
                );
            }
        }
    }

    function releasePlayerByTeam(string memory _playerName) 
    external 
    payable 
    override 
    onlyTeam 
{
    require(msg.value > 0, "Compensation must be > 0.");
    
    Structs.Player storage player = playersByName[_playerName];
    require(bytes(player.name).length != 0, "Player not found.");
    require(!player.isFreeAgent, "Player is already a free agent.");
    
    Structs.Team storage currentTeam = teamsByName[users[msg.sender].entityName];
    require(bytes(currentTeam.name).length != 0, "Team not found.");
    require(
        keccak256(abi.encodePacked(player.teamName)) == 
        keccak256(abi.encodePacked(currentTeam.name)), 
        "Player is not in your team."
    );
    
    payable(player.walletAddress).transfer(msg.value);
    
    string memory oldTeamName = player.teamName;
    address oldTeamAddr = currentTeam.walletAddress;
    
    player.makePlayerFreeAgent();
    currentTeam.removePlayerFromTeam(player.walletAddress);
    
    emit PlayerReleased(
        player.walletAddress,
        player.name,
        oldTeamAddr,
        oldTeamName
    );
}
}