import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ValidationUtil, DataMapper } from '../utils';
import { TransferOffer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  async createTransferOffer(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerWalletAddress: string,
    playerName: string,
    contractExpires: Date,
    transferFeeInEth: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const contractExpiresTimestamp = DataMapper.dateToTimestamp(
      contractExpires
    );
    const transferFeeInWei = web3.utils.toWei(transferFeeInEth, 'ether');

    return contract.methods['createTransferOffer'](
      playerWalletAddress,
      playerName,
      contractExpiresTimestamp
    ).send({ from: account, value: transferFeeInWei });
  }

  async getPlayerTransferOffers(
    contract: Contract<AbiItem[]>,
    playerWalletAddress: string
  ): Promise<TransferOffer[]> {
    ValidationUtil.validateContract(contract);
    try {
      const offersData = (await contract.methods['getPlayerTransferOffers'](
        playerWalletAddress
      ).call()) as any[];
      return DataMapper.mapTransferOffers(offersData);
    } catch (error) {
      console.error('Error fetching transfer offers:', error);
      throw error;
    }
  }

 async acceptTransferOffer(
    contract: Contract<AbiItem[]>,
    account: string,
    offerId: number
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return new Promise((resolve, reject) => {
      contract.methods['acceptTransferOffer'](offerId)
        .send({ from: account })
        .on('receipt', async (receipt: any) => {
          try {
            await this.waitForBlocks(1);
            resolve(receipt);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  }


 async rejectTransferOffer(
    contract: Contract<AbiItem[]>,
    account: string,
    offerId: number
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return new Promise((resolve, reject) => {
      contract.methods['rejectTransferOffer'](offerId)
        .send({ from: account })
        .on('receipt', async (receipt: any) => {
          console.log('Transaction successful:', receipt);


          try {
            await this.waitForBlocks(2);
            resolve(receipt);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: any) => {
          console.error('Transaction failed:', error);
          reject(error);
        });
    });
  }


  private waitForBlocks(blocks: number): Promise<void> {
    return new Promise((resolve) => {
      const blockTime = 3000; 
      setTimeout(resolve, blocks * blockTime);
    });
  }
  async extendContract(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerName: string,
    newContractExpires: Date,
    transferFeeInEth: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const newContractExpiresTimestamp = DataMapper.dateToTimestamp(
      newContractExpires
    );
    const transferFeeInWei = web3.utils.toWei(transferFeeInEth, 'ether');

    return new Promise((resolve, reject) => {
      contract.methods['extendContract'](
        playerName,
        newContractExpiresTimestamp
      )
        .send({ from: account, value: transferFeeInWei })
        .on('receipt', (receipt: any) => resolve(receipt))
        .on('error', (error: any) => reject(error));
    });
  }

  async getTeamTransferOffers(
    contract: Contract<AbiItem[]>,
    teamWalletAddress: string
  ): Promise<TransferOffer[]> {
    ValidationUtil.validateContract(contract);
    try {
      const offersData = (await contract.methods['getTeamTransferOffers'](
        teamWalletAddress
      ).call()) as any[];
      return DataMapper.mapTransferOffers(offersData);
    } catch (error) {
      console.error(
        `Error fetching transfer offers for team ${teamWalletAddress}:`,
        error
      );
      throw error;
    }
  }

  async getTeamOutgoingOffers(
  contract: Contract<AbiItem[]>,
  teamWalletAddress: string
): Promise<TransferOffer[]> {
  ValidationUtil.validateContract(contract);
  try {
    const offersData = (await contract.methods['getTeamOutgoingOffers'](
      teamWalletAddress
    ).call()) as any[];
    return DataMapper.mapTransferOffers(offersData);
  } catch (error) {
    console.error(
      `Error fetching outgoing offers for team ${teamWalletAddress}:`,
      error
    );
    throw error;
  }
}
}