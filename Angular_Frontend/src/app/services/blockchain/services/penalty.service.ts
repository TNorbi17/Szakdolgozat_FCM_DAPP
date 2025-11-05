import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { Penalty } from '../models';
import { ValidationUtil } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class PenaltyService {
  async createPenalty(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerWalletAddress: string,
    amountInEth: string | number,
    message: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const weiAmount = web3.utils.toWei(amountInEth.toString(), 'ether');

    return contract.methods['createPenalty'](
      playerWalletAddress,
      weiAmount,
      message
    ).send({ from: account });
  }

  async getPlayerPenalties(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<Penalty[]> {
    ValidationUtil.validateContract(contract);

    const rawPenalties: unknown = await contract.methods[
      'getPlayerPenalties'
    ](playerWalletAddress).call();

    if (!Array.isArray(rawPenalties)) {
      console.error('Expected array but received:', rawPenalties);
      return [];
    }

    return (rawPenalties as any[]).map((p) => ({
      penaltyId: Number(p[0]),
      teamWalletAddress: p[1],
      teamName: p[2],
      playerWalletAddress: p[3],
      amount: p[4].toString(),
      message: p[5],
      timestamp: Number(p[6]),
      paid: p[7],
    }));
  }

  async payPenalty(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    penaltyId: number,
    amountInEth: string | number
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const weiAmount = web3.utils.toWei(amountInEth.toString(), 'ether');

    return contract.methods['payPenalty'](penaltyId).send({
      from: account,
      value: weiAmount,
    });
  }
}