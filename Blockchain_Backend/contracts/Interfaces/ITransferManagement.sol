// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../Types.sol";

interface ITransferManagement {
    event TransferOfferCreated(
        uint256 indexed offerId,
        address indexed teamAddress,
        address indexed playerAddress,
        address deciderAddress
    );
    event TransferOfferStatusChanged(
        uint256 indexed offerId,
        Enums.OfferStatus newStatus,
        address indexed playerAddress,
        address indexed teamAddress
    );
    event PlayerSigned(
        address indexed playerAddress,
        string playerName,
        address indexed teamAddress,
        string teamName
    );
    event PlayerReleased(
        address indexed playerAddress,
        string playerName,
        address indexed oldTeamAddress,
        string oldTeamName
    );

    function createTransferOffer(
        address _playerWalletAddress,
        string memory _playerName,
        uint256 _contractExpiresTimestamp
    ) external payable;

    function acceptTransferOffer(uint256 _offerId) external;

    function rejectTransferOffer(uint256 _offerId) external;

    function releasePlayer(string memory _playerName) external payable;
    function releasePlayerByTeam(string memory _playerName) external payable;
}