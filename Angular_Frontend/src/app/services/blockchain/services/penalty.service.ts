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

  async hasUnpaidPenalties(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<boolean> {
    ValidationUtil.validateContract(contract); // CSAK contract ellenőrzés

    try {
      const result: unknown = await contract.methods[
        'hasUnpaidPenalties'
      ](playerWalletAddress).call();
      
      return Boolean(result);
    } catch (error: any) {
      console.error('Error checking unpaid penalties:', error);
      throw new Error('Nem sikerült ellenőrizni a kifizetetlen büntetéseket.');
    }
  }

  async getUnpaidPenaltiesCount(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<number> {
    ValidationUtil.validateContract(contract); // CSAK contract ellenőrzés

    try {
      const result: unknown = await contract.methods[
        'getUnpaidPenaltiesCount'
      ](playerWalletAddress).call();
      
      return Number(result);
    } catch (error: any) {
      console.error('Error getting unpaid penalties count:', error);
      throw new Error('Nem sikerült lekérdezni a kifizetetlen büntetések számát.');
    }
  }

  async getUnpaidPenaltiesAmount(
    contract: Contract<AbiItem[]>,
    web3: Web3,
    playerWalletAddress: string
  ): Promise<string> {
    ValidationUtil.validateContract(contract); // CSAK contract ellenőrzés
    ValidationUtil.validateWeb3(web3); // CSAK web3 ellenőrzés

    try {
      const result: unknown = await contract.methods[
        'getUnpaidPenaltiesAmount'
      ](playerWalletAddress).call();
      
      return web3.utils.fromWei(result as string, 'ether');
    } catch (error: any) {
      console.error('Error getting unpaid penalties amount:', error);
      throw new Error('Nem sikerült lekérdezni a kifizetetlen büntetések összegét.');
    }
  }

  // Segédfunkció a kifizetetlen büntetések lekérdezésére
  async getUnpaidPenalties(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<Penalty[]> {
    ValidationUtil.validateContract(contract);

    const allPenalties = await this.getPlayerPenalties(contract, playerWalletAddress);
    return allPenalties.filter(penalty => !penalty.paid);
  }



}