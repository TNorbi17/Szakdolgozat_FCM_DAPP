// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";

abstract contract Modifiers is BaseStorage {
    modifier onlyTeamOwner(address _teamWalletAddress) {
        require(
            users[msg.sender].walletAddress == _teamWalletAddress,
            "Only the team owner can call this function."
        );
        require(
            users[msg.sender].userType == Enums.UserType.Team,
            "Only team accounts can call this function."
        );
        _;
    }

    modifier onlyPlayer(address _playerWalletAddress) {
        require(
            users[msg.sender].walletAddress == _playerWalletAddress,
            "Only the player can call this function."
        );
        require(
            users[msg.sender].userType == Enums.UserType.Player,
            "Only player accounts can call this function."
        );
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address.");
        _;
    }

    modifier userNotExists(address _address) {
        require(
            users[_address].walletAddress == address(0),
            "Wallet address already registered."
        );
        _;
    }

    modifier onlyTeam() {
        require(
            users[msg.sender].userType == Enums.UserType.Team,
            "Only teams can call this function."
        );
        _;
    }

    modifier onlyPlayerAccount() {
        require(
            users[msg.sender].userType == Enums.UserType.Player,
            "Only players can call this function."
        );
        _;
    }
}