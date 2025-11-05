// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";
import "./Interfaces/IQueryManagement.sol";


contract QueryManagement is BaseStorage, IQueryManagement {
    function getUserByAddress(address _walletAddress)
        external
        view
        override
        returns (
            address,
            Enums.UserType,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Structs.User storage user = users[_walletAddress];
        require(user.walletAddress != address(0), "User not found.");
        return (
            user.walletAddress,
            user.userType,
            user.email,
            user.passwordHash,
            user.entityName,
            user.registrationTimestamp
        );
    }

    function getTeamByName(string memory _teamName)
        external
        view
        override
        returns (
            uint256,
            string memory,
            uint256,
            address,
            string memory,
            uint256,
            address[] memory
        )
    {
        Structs.Team storage team = teamsByName[_teamName];
        require(bytes(team.name).length != 0, "Team not found.");
        return (
            team.id,
            team.name,
            team.foundationYear,
            team.walletAddress,
            team.email,
            team.registrationTimestamp,
            team.players
        );
    }

    function getPlayerByName(string memory _playerName)
        external
        view
        override
        returns (
            uint256,
            string memory,
            Enums.PlayerPosition,
            uint256,
            address,
            string memory,
            string memory,
            uint256,
            bool,
            uint256
        )
    {
        Structs.Player storage player = playersByName[_playerName];
        require(bytes(player.name).length != 0, "Player not found.");
        return (
            player.id,
            player.name,
            player.position,
            player.dateOfBirth,
            player.walletAddress,
            player.email,
            player.teamName,
            player.registrationTimestamp,
            player.isFreeAgent,
            player.contractExpires
        );
    }

    function getAllPlayers()
        external
        view
        override
        returns (Structs.Player[] memory)
    {
        Structs.Player[] memory allPlayers = new Structs.Player[](
            allPlayerWalletAddresses.length
        );

        for (uint256 i = 0; i < allPlayerWalletAddresses.length; i++) {
            address playerWallet = allPlayerWalletAddresses[i];
            string memory playerName = users[playerWallet].entityName;
            allPlayers[i] = playersByName[playerName];
        }

        return allPlayers;
    }

    function getFreeAgents()
        external
        view
        override
        returns (Structs.Player[] memory)
    {
        uint256 freeAgentCount = 0;
        for (uint256 i = 0; i < allPlayerWalletAddresses.length; i++) {
            address playerWallet = allPlayerWalletAddresses[i];
            if (
                users[playerWallet].walletAddress != address(0) &&
                users[playerWallet].userType == Enums.UserType.Player
            ) {
                Structs.Player storage player = playersByName[
                    users[playerWallet].entityName
                ];
                if (player.isFreeAgent) {
                    freeAgentCount++;
                }
            }
        }

        Structs.Player[] memory freeAgents = new Structs.Player[](
            freeAgentCount
        );
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < allPlayerWalletAddresses.length; i++) {
            address playerWallet = allPlayerWalletAddresses[i];
            if (
                users[playerWallet].walletAddress != address(0) &&
                users[playerWallet].userType == Enums.UserType.Player
            ) {
                Structs.Player storage player = playersByName[
                    users[playerWallet].entityName
                ];
                if (player.isFreeAgent) {
                    freeAgents[currentIndex] = player;
                    currentIndex++;
                }
            }
        }
        return freeAgents;
    }

    function getTeamPlayersAddresses(string memory _teamName)
        external
        view
        override
        returns (address[] memory)
    {
        Structs.Team storage team = teamsByName[_teamName];
        require(bytes(team.name).length != 0, "Team not found.");
        return team.players;
    }

    function getTeamPlayersDetails(string memory _teamName)
        external
        view
        override
        returns (Structs.Player[] memory)
    {
        Structs.Team storage team = teamsByName[_teamName];
        require(bytes(team.name).length != 0, "Team not found.");

        Structs.Player[] memory playerDetails = new Structs.Player[](
            team.players.length
        );
        for (uint256 i = 0; i < team.players.length; i++) {
            address playerWallet = team.players[i];
            require(
                users[playerWallet].walletAddress != address(0),
                "Player wallet not found in users mapping."
            );
            require(
                users[playerWallet].userType == Enums.UserType.Player,
                "Wallet address is not a player."
            );

            string memory playerName = users[playerWallet].entityName;
            playerDetails[i] = playersByName[playerName];
        }
        return playerDetails;
    }
function getPlayerTransferOffers(address _playerWalletAddress)
        external
        view
        override
        returns (Structs.TransferOffer[] memory)
    {
        Structs.TransferOffer[] storage offersForPlayer = playerOffers[
            _playerWalletAddress
        ];

        Structs.TransferOffer[]
            memory freshOffers = new Structs.TransferOffer[](
                offersForPlayer.length
            );

        for (uint i = 0; i < offersForPlayer.length; i++) {
            uint offerId = offersForPlayer[i].offerId;
            freshOffers[i] = offers[offerId];
        }

        return freshOffers;
    }

    function getTeamTransferOffers(address _teamWalletAddress)
    external
    view
    override
    returns (Structs.TransferOffer[] memory)
{
    require(
        users[_teamWalletAddress].userType == Enums.UserType.Team,
        "Address is not a team."
    );
    
 
    Structs.TransferOffer[] storage offersForTeam = teamOffers[_teamWalletAddress];
    
    Structs.TransferOffer[] memory freshOffers = new Structs.TransferOffer[](
        offersForTeam.length
    );
    
    for (uint i = 0; i < offersForTeam.length; i++) {
        uint offerId = offersForTeam[i].offerId;
        freshOffers[i] = offers[offerId];  
    }
    
    return freshOffers;
}
    
}