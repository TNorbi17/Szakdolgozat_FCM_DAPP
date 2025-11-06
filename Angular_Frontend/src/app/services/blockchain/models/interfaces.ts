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
  hasUnpaidPenalties?: boolean;
  unpaidPenaltiesCount?: number;
  unpaidPenaltiesAmount?: string;
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
  hasUnpaidPenalties?: boolean;
  unpaidPenaltiesCount?: number;
  unpaidPenaltiesAmount?: string;
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

export interface WeeklyPayment {
  id: number;
  teamAddress: string;
  playerAddress: string;
  amountEth: string;
  active: boolean;
  lastPaymentTimestamp: Date | null;
  lastPaidAmount?: string;

}

export interface PaymentHistory {
  id: number;
  teamAddress: string;
  teamName: string;
  playerAddress: string;
  amountWei: string;
  amountEth: number;
  paymentTimestamp: Date;
  paymentType: string;
}

export type Transaction =
  | (Bonus & { type: 'bonus'; playerName: string })
  | (Penalty & { type: 'penalty'; playerName: string });


  export interface PaymentStatistics {
  total: {
    count: number;
    amount: number;
    average: number;
  };
  weekly: {
    count: number;
    amount: number;
    average: number;
  };
  bonuses: {
    count: number;
    amount: number;
    average: number;
  };
  penaltyRefunds: {
    count: number;
    amount: number;
    average: number;
  };
  lastPaymentDate: Date | null;
  uniqueTeams: string[];
}

export interface TeamPaymentStatistics {
  totalPaidOut: number;
  totalWeeklyPayments: number;
  totalBonuses: number;
  totalPenalties: number;
  playerCount: number;
  averagePerPlayer: number;
  paymentsByPlayer: { [playerName: string]: number };
}

export interface PaymentFilter {
  paymentType?: string;
  teamName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}