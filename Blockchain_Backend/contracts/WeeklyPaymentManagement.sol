// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Storage.sol";
import "./Conditions.sol";
import "./Interfaces/IWeeklyPaymentManagement.sol";

contract WeeklyPaymentManagement is
    BaseStorage,
    Conditions,
    IWeeklyPaymentManagement
{
    function setWeeklyPayment(address _playerAddress, uint256 _amountWei)
        external
        override
        onlyTeam
    {
        require(_playerAddress != address(0), "Invalid address");
        require(_amountWei > 0, "Amount must be > 0");

        Structs.Player memory player = playersByName[
            users[_playerAddress].entityName
        ];
        require(bytes(player.name).length != 0, "Player not found");
        
        Structs.WeeklyPayment storage existingPayment = playerWeeklyPayments[
            _playerAddress
        ];
        
        uint256 lastPayment = 0;
        uint256 lastPaid = 0;
        uint256 paymentId = nextWeeklyPaymentId;

        if (existingPayment.id != 0 && existingPayment.active) {
            lastPayment = existingPayment.lastPaymentTimestamp;
            lastPaid = existingPayment.lastPaidAmount; 
            paymentId = existingPayment.id;
        } else {
            nextWeeklyPaymentId++;
        }

        playerWeeklyPayments[_playerAddress] = Structs.WeeklyPayment({
            id: paymentId,
            teamAddress: msg.sender,
            playerAddress: _playerAddress,
            amountWei: _amountWei,
            lastPaymentTimestamp: lastPayment,
            lastPaidAmount: lastPaid,
            active: true
        });

        emit WeeklyPaymentSet(
            paymentId,
            msg.sender,
            _playerAddress,
            _amountWei
        );
    }

    function executeWeeklyPayment(address _playerAddress)
        external
        payable
        override
        onlyTeam
    {
        Structs.WeeklyPayment storage wp = playerWeeklyPayments[_playerAddress];

        require(wp.active, "No active payment");
        require(wp.teamAddress == msg.sender, "Not your payment");
        require(
            block.timestamp - wp.lastPaymentTimestamp >= 1 weeks,
            "Already paid in last 7 days"
        );
        require(msg.value == wp.amountWei, "Incorrect ETH amount");

        wp.lastPaymentTimestamp = block.timestamp;
        wp.lastPaidAmount = msg.value;
        payable(wp.playerAddress).transfer(wp.amountWei);

        emit WeeklyPaymentExecuted(
            wp.id,
            msg.sender,
            wp.playerAddress,
            wp.amountWei,
            block.timestamp
        );
    }

    function stopWeeklyPayment(address _playerAddress)
        external
        override
        onlyTeam
    {
        Structs.WeeklyPayment storage wp = playerWeeklyPayments[_playerAddress];
        require(wp.teamAddress == msg.sender, "Not owner");
        require(wp.active, "Already inactive");

        wp.active = false;
        emit WeeklyPaymentStopped(wp.id, msg.sender, _playerAddress);
    }

    function getWeeklyPaymentForPlayer(address _playerAddress)
        external
        view
        override
        returns (Structs.WeeklyPayment memory)
    {
        return playerWeeklyPayments[_playerAddress];
    }
}