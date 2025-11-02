import { Injectable } from '@angular/core';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ValidationUtil } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  async registerTeam(
    contract: Contract<AbiItem[]>,
    account: string,
    teamName: string,
    foundationYear: number,
    email: string,
    passwordHash: string,
    walletAddress: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return contract.methods['registerTeam'](
      teamName,
      foundationYear,
      email,
      passwordHash,
      walletAddress
    ).send({ from: account });
  }

  async registerPlayer(
    contract: Contract<AbiItem[]>,
    account: string,
    playerName: string,
    position: number,
    dateOfBirth: number,
    email: string,
    passwordHash: string,
    walletAddress: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return contract.methods['registerPlayer'](
      playerName,
      position,
      dateOfBirth,
      email,
      passwordHash,
      walletAddress
    ).send({ from: account });
  }
}