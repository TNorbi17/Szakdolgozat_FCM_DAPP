// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

library Enums {

    enum UserType {
        Player,
        Team
    }

    enum OfferStatus {
        Pending,
        Accepted,
        Rejected
    }

    enum PlayerPosition {
        Goalkeeper,
        Defender,
        Midfielder,
        Attacker
    }
}

library Structs {
    struct User {
        address walletAddress;
        Enums.UserType userType;
        string email;
        string passwordHash;
        string entityName;
        uint256 registrationTimestamp;
    }

    struct Team {
        uint256 id;
        string name;
        uint256 foundationYear;
        address walletAddress;
        string email;
        uint256 registrationTimestamp;
        address[] players;
    }

    struct Player {
        uint256 id;
        string name;
        Enums.PlayerPosition position;
        uint256 dateOfBirth;
        address walletAddress;
        string email;
        string teamName;
        uint256 registrationTimestamp;
        bool isFreeAgent;
        uint256 contractExpires;
    }

    struct TransferOffer {
        uint256 offerId;
        address teamWalletAddress;
        string teamName;
        address playerWalletAddress;
        string playerName;
        Enums.OfferStatus status;
        uint256 timestamp;
        uint256 transferFee;
        uint256 contractExpires;
        address deciderAddress;
        address currentTeamWalletAddress;
    }
 

}