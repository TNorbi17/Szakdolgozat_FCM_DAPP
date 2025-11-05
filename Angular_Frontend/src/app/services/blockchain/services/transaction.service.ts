import { Injectable } from '@angular/core';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { Transaction, PlayerDetails } from '../models';
import { ValidationUtil } from '../utils';
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
}