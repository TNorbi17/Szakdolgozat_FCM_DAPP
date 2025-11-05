// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";
import "./Modifiers.sol";
import "./Interfaces/IRewardPenaltyManagement.sol";
import "./Libraries.sol";

contract RewardPenaltyManagement is
    BaseStorage,
    Modifiers,
    IRewardPenaltyManagement
{
    using TeamLibrary for Structs.Team;

    function giveBonus(address _playerWalletAddress, string memory _message)
        external
        payable
        override
        onlyTeamOwner(msg.sender)
    {
        require(msg.value > 0, "Bonus amount must be > 0.");

        Structs.Team storage team = teamsByName[users[msg.sender].entityName];
        require(bytes(team.name).length != 0, "Team not found.");
        require(
            team.hasPlayer(_playerWalletAddress),
            "Player not in your team."
        );

        Structs.Player storage player = playersByName[
            users[_playerWalletAddress].entityName
        ];
        require(
            player.walletAddress == _playerWalletAddress,
            "Player not found."
        );

        uint256 newBonusId = nextBonusId++;
        Structs.Bonus memory bonus = Structs.Bonus(
            newBonusId,
            msg.sender,
            team.name,
            _playerWalletAddress,
            msg.value,
            _message,
            block.timestamp
        );

        playerBonuses[_playerWalletAddress].push(bonus);
        payable(_playerWalletAddress).transfer(msg.value);

        emit BonusGiven(
            newBonusId,
            msg.sender,
            _playerWalletAddress,
            msg.value,
            _message
        );
    }

    function createPenalty(
        address _playerWalletAddress,
        uint256 _amount,
        string memory _message
    ) external override onlyTeamOwner(msg.sender) {
        require(_amount > 0, "Penalty amount must be > 0.");

        Structs.Team storage team = teamsByName[users[msg.sender].entityName];
        require(bytes(team.name).length != 0, "Team not found.");
        require(
            team.hasPlayer(_playerWalletAddress),
            "Player not in your team."
        );

        Structs.Player storage player = playersByName[
            users[_playerWalletAddress].entityName
        ];
        require(
            player.walletAddress == _playerWalletAddress,
            "Player not found."
        );

        uint256 newPenaltyId = nextPenaltyId++;
        Structs.Penalty memory penalty = Structs.Penalty(
            newPenaltyId,
            msg.sender,
            team.name,
            _playerWalletAddress,
            _amount,
            _message,
            block.timestamp,
            false
        );

        playerPenalties[_playerWalletAddress].push(penalty);
        penalties[newPenaltyId] = penalty;

        emit PenaltyCreated(
            newPenaltyId,
            msg.sender,
            _playerWalletAddress,
            _amount,
            _message
        );
    }

    function payPenalty(uint256 _penaltyId)
        external
        payable
        override
        onlyPlayer(msg.sender)
    {
        Structs.Penalty storage penalty = penalties[_penaltyId];
        require(penalty.penaltyId != 0, "Penalty not found.");
        require(
            penalty.playerWalletAddress == msg.sender,
            "Not your penalty."
        );
        require(!penalty.paid, "Already paid.");
        require(msg.value == penalty.amount, "Incorrect payment amount.");

        payable(penalty.teamWalletAddress).transfer(msg.value);
        penalty.paid = true;

        for (uint i = 0; i < playerPenalties[msg.sender].length; i++) {
            if (playerPenalties[msg.sender][i].penaltyId == _penaltyId) {
                playerPenalties[msg.sender][i].paid = true;
                break;
            }
        }

        emit PenaltyPaid(
            _penaltyId,
            msg.sender,
            penalty.teamWalletAddress,
            msg.value
        );
    }
}