// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../Types.sol";

interface IWeeklyPaymentManagement {
    event WeeklyPaymentSet(
        uint256 indexed paymentId,
        address indexed team,
        address indexed player,
        uint256 amountWei
    );
    event WeeklyPaymentExecuted(
        uint256 indexed paymentId,
        address indexed team,
        address indexed player,
        uint256 amountWei,
        uint256 timestamp
    );
    event WeeklyPaymentStopped(
        uint256 indexed paymentId,
        address indexed team,
        address indexed player
    );

    function setWeeklyPayment(address _playerAddress, uint256 _amountWei)
        external;

    function executeWeeklyPayment(address _playerAddress) external payable;

    function stopWeeklyPayment(address _playerAddress) external;

    function getWeeklyPaymentForPlayer(address _playerAddress)
        external
        view
        returns (Structs.WeeklyPayment memory);
}