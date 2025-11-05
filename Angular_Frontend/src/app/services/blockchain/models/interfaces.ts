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
export interface TeamDetails {
  id: number;
  name: string;
  foundationYear: number;
  walletAddress: string;
  email: string;
  registrationTimestamp: Date;
  players: string[];
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

export interface Bonus {
  bonusId: number;
  teamWalletAddress: string;
  teamName: string;
  playerWalletAddress: string;
  amount: string;
  message: string;
  timestamp: number;
}

export interface Penalty {
  penaltyId: number;
  teamWalletAddress: string;
  teamName: string;
  playerWalletAddress: string;
  amount: string;
  message: string;
  timestamp: number;
  paid: boolean;
}
export type Transaction =
  | (Bonus & { type: 'bonus'; playerName: string })
  | (Penalty & { type: 'penalty'; playerName: string });