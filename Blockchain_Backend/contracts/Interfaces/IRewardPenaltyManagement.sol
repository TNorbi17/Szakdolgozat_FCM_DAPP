// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../Types.sol";

interface IRewardPenaltyManagement {
    event BonusGiven(
        uint256 indexed bonusId,
        address indexed teamAddress,
        address indexed playerAddress,
        uint256 amount,
        string message
    );
    event PenaltyCreated(
        uint256 indexed penaltyId,
        address indexed teamAddress,
        address indexed playerAddress,
        uint256 amount,
        string message
    );
    event PenaltyPaid(
        uint256 indexed penaltyId,
        address indexed playerAddress,
        address indexed teamAddress,
        uint256 amount
    );

    function giveBonus(address _playerWalletAddress, string memory _message)
        external
        payable;

    function createPenalty(
        address _playerWalletAddress,
        uint256 _amount,
        string memory _message
    ) external;

    function payPenalty(uint256 _penaltyId) external payable;
}