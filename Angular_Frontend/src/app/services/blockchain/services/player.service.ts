import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ValidationUtil, DataMapper } from '../utils';
import { PlayerDetails } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  async getPlayerByName(
    contract: Contract<AbiItem[]>,
    playerName: string
  ): Promise<PlayerDetails> {
    ValidationUtil.validateContract(contract);
    const playerData = await contract.methods['getPlayerByName'](
      playerName
    ).call();
    return DataMapper.mapPlayer(playerData);
  }

  async getAllPlayers(
    contract: Contract<AbiItem[]>
  ): Promise<PlayerDetails[]> {
    ValidationUtil.validateContract(contract);
    try {
      const playersData = (await contract.methods[
        'getAllPlayers'
      ]().call()) as any[];
      return DataMapper.mapPlayers(playersData);
    } catch (error) {
      console.error('Error fetching all players:', error);
      throw error;
    }
  }

  async getFreeAgents(
    contract: Contract<AbiItem[]>
  ): Promise<PlayerDetails[]> {
    ValidationUtil.validateContract(contract);
    try {
      const freeAgentsData = (await contract.methods[
        'getFreeAgents'
      ]().call()) as any[];
      return DataMapper.mapPlayers(freeAgentsData);
    } catch (error) {
      console.error('Error fetching free agents:', error);
      throw error;
    }
  }

  async releasePlayer(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerName: string,
    feeInEth: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const feeInWei = web3.utils.toWei(feeInEth, 'ether');

    return new Promise((resolve, reject) => {
        contract.methods['releasePlayer'](playerName)
        .send({ from: account, value: feeInWei })
        .on('transactionHash', (hash: string) => {
          console.log('Transaction sent! Hash:', hash);
        })
        .on('receipt', (receipt: any) => {
          console.log('Transaction successful:', receipt);
          resolve(receipt);
        })
        .on('error', (error: any) => {
          console.error('Transaction failed:', error);
          reject(error);
        });
    });
  }

  async updatePlayerContractStatus(
    contract: Contract<AbiItem[]>,
    account: string,
    playerName: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return new Promise((resolve, reject) => {
      contract.methods['updatePlayerContractStatus'](playerName)
        .send({ from: account })
        .on('receipt', (receipt: any) => resolve(receipt))
        .on('error', (error: any) => reject(error));
    });
  }

async refreshExpiredContracts(
  contract: Contract<AbiItem[]>,
  account: string
): Promise<any> {
  ValidationUtil.validateContract(contract);
  ValidationUtil.validateAccount(account);

  return new Promise((resolve, reject) => {
    contract.methods['refreshExpiredContracts']()
      .send({ from: account })
      .on('transactionHash', (hash: string) => {
      })
      .on('receipt', (receipt: any) => {
        resolve(receipt);
      })
      .on('error', (error: any) => {
        reject(error);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}
  async releasePlayerByTeam(
  contract: Contract<AbiItem[]>,
  account: string,
  web3: Web3,
  playerName: string,
  compensationInEth: string
): Promise<any> {
  ValidationUtil.validateAll(contract, account, web3);
  
  const compensationInWei = web3.utils.toWei(compensationInEth, 'ether');
  
  return new Promise((resolve, reject) => {
    contract.methods['releasePlayerByTeam'](playerName)
      .send({ from: account, value: compensationInWei })
      .on('receipt', (receipt: any) => {
        console.log('Player released by team:', receipt);
        resolve(receipt);
      })
      .on('error', (error: any) => {
        console.error('Release failed:', error);
        reject(error);
      });
  });
}

}