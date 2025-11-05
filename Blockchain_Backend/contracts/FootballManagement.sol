// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "./QueryManagement.sol";
import "./TransferManagement.sol";
import "./RewardPenaltyManagement.sol";
import "./WeeklyPaymentManagement.sol";
import "./UserManagement.sol";

contract FootballManagement is
    QueryManagement,
    UserManagement,
    TransferManagement,
    RewardPenaltyManagement,
    WeeklyPaymentManagement
{
   
}