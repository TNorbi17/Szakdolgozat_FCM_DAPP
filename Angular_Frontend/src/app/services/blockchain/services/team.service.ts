import { Injectable } from '@angular/core';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ValidationUtil, DataMapper } from '../utils';
import { PlayerDetails, UserType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  async getTeamByName(
    contract: Contract<AbiItem[]>,
    teamName: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    return contract.methods['getTeamByName'](teamName).call();
  }

  async getTeamPlayersDetails(
    contract: Contract<AbiItem[]>,
    teamName: string
  ): Promise<PlayerDetails[]> {
    ValidationUtil.validateContract(contract);
    try {
      const playersData = (await contract.methods['getTeamPlayersDetails'](
        teamName
      ).call()) as any[];
      return DataMapper.mapPlayers(playersData);
    } catch (error) {
      console.error('Error fetching team players:', error);
      throw error;
    }
  }

  async getUserByAddress(
    contract: Contract<AbiItem[]>,
    walletAddress: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    return contract.methods['getUserByAddress'](walletAddress).call();
  }

  async getUserType(
    contract: Contract<AbiItem[]>,
    walletAddress: string
  ): Promise<UserType> {
    ValidationUtil.validateContract(contract);
    const userType = await contract.methods['getUserType'](
      walletAddress
    ).call();
    return Number(userType) as UserType;
  }
}