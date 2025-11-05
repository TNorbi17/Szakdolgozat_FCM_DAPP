// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";
import "./Conditions.sol";
import "./Interfaces/IUserManagement.sol";
import "./Libraries.sol";

contract UserManagement is BaseStorage, Modifiers, IUserManagement,TransferManagement {
    using PlayerLibrary for Structs.Player;
    using TeamLibrary for Structs.Team;
    function registerTeam(
        string memory _teamName,
        uint256 _foundationYear,
        string memory _email,
        string memory _passwordHash,
        address _walletAddress
    )
        external
        override
        userNotExists(_walletAddress)
        validAddress(_walletAddress)
    {
        require(
            bytes(teamsByName[_teamName].name).length == 0,
            "Team name already taken."
        );

        users[_walletAddress] = Structs.User(
            _walletAddress,
            Enums.UserType.Team,
            _email,
            _passwordHash,
            _teamName,
            block.timestamp
        );

        teamsByName[_teamName] = Structs.Team(
            nextTeamId++,
            _teamName,
            _foundationYear,
            _walletAddress,
            _email,
            block.timestamp,
            new address[](0)
        );

        emit UserRegistered(_walletAddress, Enums.UserType.Team);
        emit TeamRegistered(_teamName, _walletAddress);
    }

    function registerPlayer(
        string memory _playerName,
        Enums.PlayerPosition _position,
        uint256 _dateOfBirth,
        string memory _email,
        string memory _passwordHash,
        address _walletAddress
    )
        external
        override
        userNotExists(_walletAddress)
        validAddress(_walletAddress)
    {
        require(
            bytes(playersByName[_playerName].name).length == 0,
            "Player name already taken."
        );

        users[_walletAddress] = Structs.User(
            _walletAddress,
            Enums.UserType.Player,
            _email,
            _passwordHash,
            _playerName,
            block.timestamp
        );

        playersByName[_playerName] = Structs.Player(
            nextPlayerId++,
            _playerName,
            _position,
            _dateOfBirth,
            _walletAddress,
            _email,
            FREE_AGENT,
            block.timestamp,
            true,
            0
        );

        allPlayerWalletAddresses.push(_walletAddress);

        emit UserRegistered(_walletAddress, Enums.UserType.Player);
        emit PlayerRegistered(_playerName, _walletAddress, FREE_AGENT);
    }  

 function refreshExpiredContracts() external {
        uint256 updatedCount = 0;

        for (uint256 i = 0; i < allPlayerWalletAddresses.length; i++) {
            address playerWallet = allPlayerWalletAddresses[i];
            Structs.User storage user = users[playerWallet];

            if (user.userType != Enums.UserType.Player) continue;

            Structs.Player storage player = playersByName[user.entityName];

            bool updated = player.updateContractStatus(teamsByName);
            if (updated) {
                updatedCount++;
            }
        }

        require(updatedCount > 0, "No expired contracts found.");
        emit ContractsRefreshed(updatedCount);
    }
     
}