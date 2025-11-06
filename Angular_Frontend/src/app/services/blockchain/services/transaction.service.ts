// src/app/services/blockchain/services/transaction.service.ts

import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { 
  Transaction, 
  PlayerDetails, 
  PaymentHistory, 
  TeamPaymentStatistics,
  PaymentFilter 
} from '../models';
import { ValidationUtil, DataMapper } from '../utils';
import { BonusService } from './bonus.service';
import { PenaltyService } from './penalty.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(
    private bonusService: BonusService,
    private penaltyService: PenaltyService
  ) {}

  async getTeamTransactions(
    contract: Contract<AbiItem[]>,
    players: PlayerDetails[]
  ): Promise<Transaction[]> {
    ValidationUtil.validateContract(contract);

    const transactions: Transaction[] = [];

    for (const player of players) {
      const bonuses = await this.bonusService.getPlayerBonuses(
        contract,
        player.walletAddress
      );
      const penalties = await this.penaltyService.getPlayerPenalties(
        contract,
        player.walletAddress
      );

      bonuses.forEach((bonus) => {
        transactions.push({
          ...bonus,
          type: 'bonus',
          playerName: player.name,
        });
      });

      penalties.forEach((penalty) => {
        transactions.push({
          ...penalty,
          type: 'penalty',
          playerName: player.name,
        });
      });
    }

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    return transactions;
  }

  
async getPlayerPaymentHistory(
  contract: Contract<AbiItem[]>,
  web3: Web3,
  playerWalletAddress: string
): Promise<PaymentHistory[]> {
  ValidationUtil.validateContract(contract);
  ValidationUtil.validateWeb3(web3);

  try {
    const paymentData = await contract.methods['getPlayerPaymentHistory'](
      playerWalletAddress
    ).call();
    
    
    
    if (!paymentData || !Array.isArray(paymentData)) {
      console.warn('No payment data or invalid data format received:', paymentData);
      return [];
    }
    
    return DataMapper.mapPaymentHistories(paymentData as any[], web3);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

  async getPlayerWeeklyPaymentsOnly(
    contract: Contract<AbiItem[]>,
    web3: Web3,
    playerWalletAddress: string
  ): Promise<PaymentHistory[]> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateWeb3(web3);

    try {
      const paymentData = await contract.methods['getPlayerWeeklyPaymentsOnly'](
        playerWalletAddress
      ).call();
      
      if (!paymentData || !Array.isArray(paymentData)) {
        console.warn('No weekly payment data or invalid data format received:', paymentData);
        return [];
      }
      
      return DataMapper.mapPaymentHistories(paymentData as any[], web3);
    } catch (error) {
      console.error('Error fetching weekly payments:', error);
      return [];
    }
  }

 

  
  filterAndSortPayments(
    payments: PaymentHistory[],
    filters: PaymentFilter = {},
    sortBy: 'date' | 'amount' | 'team' | 'type' = 'date',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): PaymentHistory[] {
    let filteredPayments = [...payments];

    if (filters.paymentType) {
      filteredPayments = DataMapper.filterPaymentsByType(
        filteredPayments, 
        filters.paymentType
      );
    }

    if (filters.teamName) {
      filteredPayments = DataMapper.getPaymentsByTeam(
        filteredPayments, 
        filters.teamName
      );
    }

    if (filters.dateFrom && filters.dateTo) {
      filteredPayments = DataMapper.getPaymentsInDateRange(
        filteredPayments,
        filters.dateFrom,
        filters.dateTo
      );
    }

    return DataMapper.sortPayments(filteredPayments, sortBy, sortDirection);
  }

  
}