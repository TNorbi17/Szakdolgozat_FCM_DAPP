// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../Types.sol";

interface IUserManagement {
    event UserRegistered(
        address indexed walletAddress,
        Enums.UserType userType
    );
    event TeamRegistered(string teamName, address indexed walletAddress);
    event PlayerRegistered(
        string playerName,
        address indexed walletAddress,
        string teamName
    );
    event ContractsRefreshed(uint256 count);

    function registerTeam(
        string memory _teamName,
        uint256 _foundationYear,
        string memory _email,
        string memory _passwordHash,
        address _walletAddress
    ) external;

    function registerPlayer(
        string memory _playerName,
        Enums.PlayerPosition _position,
        uint256 _dateOfBirth,
        string memory _email,
        string memory _passwordHash,
        address _walletAddress
    ) external;
}