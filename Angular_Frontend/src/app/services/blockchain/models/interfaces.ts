import {PlayerPosition,OfferStatus } from './enums';
export interface PlayerDetails {
  id: number;
  name: string;
  position: PlayerPosition;
  dateOfBirth: Date;
  walletAddress: string;
  email: string;
  teamName: string;
  registrationTimestamp: Date;
  isFreeAgent: boolean;
  contractExpires: Date;
}
export interface UserSession {
  walletAddress: string;
  userType: number;
  email: string;
  name: string;
  registrationTimestamp: Date;
  foundationYear?: number;
  position?: PlayerPosition;
  teamName?: string;
  dateOfBirth?: Date;
  isFreeAgent?: boolean;
  contractExpires?: Date;
  sessionInfo?: {
    isTemporary: boolean;
  };
}

export interface TransferOffer {
  offerId: number;
  teamWalletAddress: string;
  teamName: string;
  playerWalletAddress: string;
  playerName: string;
  status: OfferStatus;
  timestamp: Date;
  transferFee?: string;
  contractExpires: Date;
  deciderAddress: string;
  currentTeamWalletAddress: string;
}