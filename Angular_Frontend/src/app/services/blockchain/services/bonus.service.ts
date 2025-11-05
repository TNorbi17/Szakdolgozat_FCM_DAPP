import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { Bonus } from '../models';
import { ValidationUtil } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class BonusService {
  async giveBonus(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerWalletAddress: string,
    amountInEth: string | number,
    message: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const weiAmount = web3.utils.toWei(amountInEth.toString(), 'ether');

    return contract.methods['giveBonus'](playerWalletAddress, message).send({
      from: account,
      value: weiAmount,
    });
  }

  async getPlayerBonuses(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<Bonus[]> {
    ValidationUtil.validateContract(contract);

    const rawBonuses: unknown = await contract.methods['getPlayerBonuses'](
      playerWalletAddress
    ).call();

    if (!Array.isArray(rawBonuses)) {
      console.error('Expected array but received:', rawBonuses);
      return [];
    }

    return (rawBonuses as any[]).map((b) => ({
      bonusId: Number(b[0]),
      teamWalletAddress: b[1],
      teamName: b[2],
      playerWalletAddress: b[3],
      amount: b[4].toString(),
      message: b[5],
      timestamp: Number(b[6]),
    }));
  }
}