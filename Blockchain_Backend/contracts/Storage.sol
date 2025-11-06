// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Types.sol";

abstract contract BaseStorage {
    // User management
    mapping(address => Structs.User) public users;
    mapping(string => Structs.Team) public teamsByName;
    mapping(string => Structs.Player) public playersByName;
    address[] internal allPlayerWalletAddresses;

    // Transfer offers
    mapping(uint256 => Structs.TransferOffer) public offers;
    mapping(address => Structs.TransferOffer[]) public teamOffers;
    mapping(address => Structs.TransferOffer[]) public playerOffers;
    mapping(address => uint256[]) public playerOfferIds;
    mapping(address => uint256[]) public teamOfferIds;

    
    mapping(address => Structs.Bonus[]) public playerBonuses;
    mapping(address => Structs.Penalty[]) public playerPenalties;
    mapping(uint256 => Structs.Penalty) public penalties;
    mapping(address => Structs.PaymentHistory[]) public playerPaymentHistory;

    mapping(address => Structs.WeeklyPayment) public playerWeeklyPayments;

    // ID counters
    uint256 internal nextTeamId = 1;
    uint256 internal nextPlayerId = 1;
    uint256 internal nextOfferId = 1;
    uint256 internal nextBonusId = 1;
    uint256 internal nextPenaltyId = 1;
    uint256 internal nextWeeklyPaymentId = 1;
    uint256 internal nextPaymentHistoryId = 1;

    // Constants
    string constant FREE_AGENT = unicode"szabadúszó";

    function _hasUnpaidPenalties(address _playerWalletAddress)
        internal
        view
        returns (bool)
    {
        Structs.Penalty[] storage penalties = playerPenalties[_playerWalletAddress];
        
        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].paid) {
                return true;
            }
        }
        
        return false;
    }
}