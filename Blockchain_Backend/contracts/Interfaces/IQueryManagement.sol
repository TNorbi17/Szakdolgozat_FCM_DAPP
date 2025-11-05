// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../Types.sol";
interface IQueryManagement {
    function getUserByAddress(address _walletAddress)
        external
        view
        returns (
            address,
            Enums.UserType,
            string memory,
            string memory,
            string memory,
            uint256
        );

    function getTeamByName(string memory _teamName)
        external
        view
        returns (
            uint256,
            string memory,
            uint256,
            address,
            string memory,
            uint256,
            address[] memory
        );

    function getPlayerByName(string memory _playerName)
        external
        view
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
        );

    function getAllPlayers() external view returns (Structs.Player[] memory);

    function getFreeAgents() external view returns (Structs.Player[] memory);

    function getPlayerTransferOffers(address _playerWalletAddress)
        external
        view
        returns (Structs.TransferOffer[] memory);

    function getTeamTransferOffers(address _teamWalletAddress)
        external
        view
        returns (Structs.TransferOffer[] memory);

    function getTeamPlayersAddresses(string memory _teamName)
        external
        view
        returns (address[] memory);

    function getTeamPlayersDetails(string memory _teamName)
        external
        view
        returns (Structs.Player[] memory);

    function getPlayerBonuses(address _playerWalletAddress)
        external
        view
        returns (Structs.Bonus[] memory);

    function getPlayerPenalties(address _playerWalletAddress)
        external
        view
        returns (Structs.Penalty[] memory);
    function getTeamOutgoingOffers(address _teamWalletAddress)
        external
        view
        returns (Structs.TransferOffer[] memory);
}