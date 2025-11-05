// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Types.sol";

abstract contract BaseStorage {
    //User management
    mapping(address => Structs.User) public users;
    mapping(string => Structs.Team) public teamsByName;
    mapping(string => Structs.Player) public playersByName;
    address[] internal allPlayerWalletAddresses;

    mapping(uint256 => Structs.TransferOffer) public offers;
    mapping(address => Structs.TransferOffer[]) public teamOffers;
    mapping(address => Structs.TransferOffer[]) public playerOffers;
    mapping(address => uint256[]) public playerOfferIds;
    mapping(address => uint256[]) public teamOfferIds;

    // ID counters
    uint256 internal nextTeamId = 1;
    uint256 internal nextPlayerId = 1;
    uint256 internal nextOfferId = 1;

    // Constants
    string constant FREE_AGENT = unicode"szabadúszó";
}