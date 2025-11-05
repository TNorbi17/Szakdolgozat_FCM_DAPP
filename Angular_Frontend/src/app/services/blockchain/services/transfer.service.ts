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

}
