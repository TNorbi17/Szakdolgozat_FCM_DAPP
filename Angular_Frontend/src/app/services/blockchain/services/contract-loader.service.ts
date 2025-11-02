import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import * as UserManagementContract from '../../../../assets/FootballManagement.json';

@Injectable({
  providedIn: 'root',
})
export class ContractLoaderService {
  private contractInstance: Contract<AbiItem[]> | undefined;

  loadContract(web3: Web3): Contract<AbiItem[]> {
    const networkId = Object.keys(
      (UserManagementContract as any).networks
    )[0];
    const contractAddress = (UserManagementContract as any).networks[
      networkId
    ]?.address;

    if (!contractAddress) {
      throw new Error(
        'Contract address not found. Ensure truffle migrate was successful.'
      );
    }

    const contractAbi: AbiItem[] = (UserManagementContract as any)
      .abi as AbiItem[];

    this.contractInstance = new web3.eth.Contract(
      contractAbi,
      contractAddress
    );
    console.log('Smart Contract loaded:', this.contractInstance);

    return this.contractInstance;
  }

  getContract(): Contract<AbiItem[]> | undefined {
    return this.contractInstance;
  }
}