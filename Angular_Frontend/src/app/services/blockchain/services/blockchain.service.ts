import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import {
  PlayerDetails,
  
  UserType,
  
} from '../models';
import { Web3InitService } from './web3-init.service';
import { ContractLoaderService } from './contract-loader.service';
import { PwdhashService } from './pwdhash.service';
import { SessionService } from './session.service';
import { RegistrationService } from './registration.service';
import { PlayerService } from './player.service';
import { TeamService } from './team.service';


@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  private web3: Web3 | undefined;
  private contract: Contract<AbiItem[]> | undefined;
  private account: string | undefined;

  private contractReadyPromise: Promise<void>;
  private resolveContractReady: (() => void) | undefined;
  private rejectContractReady: ((reason?: any) => void) | undefined;

  constructor(
    private web3InitService: Web3InitService,
    private contractLoaderService: ContractLoaderService,
    private registrationService: RegistrationService,
    private playerService: PlayerService,
    private teamService: TeamService,
    private hashpwd: PwdhashService,
  ) {
    this.contractReadyPromise = new Promise((resolve, reject) => {
      this.resolveContractReady = resolve;
      this.rejectContractReady = reject;
    });

    this.initializeBlockchain();
  }

  //WEB3 inicializáslás

  private async initializeBlockchain(): Promise<void> {
    try {
      const { web3, account } = await this.web3InitService.initialize();
      this.web3 = web3;
      this.account = account;

      this.contract = this.contractLoaderService.loadContract(web3);

      if (this.resolveContractReady) {
        this.resolveContractReady();
      }
    } catch (error) {
      console.error('Failed to initialize blockchain:', error);
      if (this.rejectContractReady) {
        this.rejectContractReady(error);
      }
    }
  }

  async getContractReadyPromise(): Promise<void> {
    return this.contractReadyPromise;
  }

  //web3 lekérdezés

  getAccount(): string | undefined {
    return this.account;
  }

  getContract(): Contract<AbiItem[]> | undefined {
    return this.contract;
  }

  getWeb3(): Web3 | undefined {
    return this.web3;
  }

  //pwd titkosítás

  async hashPassword(password: string): Promise<string> {
    return this.hashpwd.hashPassword(password);
  }

  //Regisztráció

  async registerTeam(
    teamName: string,
    foundationYear: number,
    email: string,
    passwordHash: string,
    walletAddress: string
  ): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.registrationService.registerTeam(
      this.contract,
      this.account,
      teamName,
      foundationYear,
      email,
      passwordHash,
      walletAddress
    );
  }

  async registerPlayer(
    playerName: string,
    position: number,
    dateOfBirth: number,
    email: string,
    passwordHash: string,
    walletAddress: string
  ): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.registrationService.registerPlayer(
      this.contract,
      this.account,
      playerName,
      position,
      dateOfBirth,
      email,
      passwordHash,
      walletAddress
    );
  }

  //Játékos lekérdezés

  async getPlayerByName(playerName: string): Promise<PlayerDetails> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.playerService.getPlayerByName(this.contract, playerName);
  }

  async getAllPlayers(): Promise<PlayerDetails[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.playerService.getAllPlayers(this.contract);
  }

  async getFreeAgents(): Promise<PlayerDetails[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.playerService.getFreeAgents(this.contract);
  }

  async releasePlayer(playerName: string, feeInEth: string): Promise<any> {
    await this.getContractReadyPromise();
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.playerService.releasePlayer(
      this.contract,
      this.account,
      this.web3,
      playerName,
      feeInEth
    );
  }

  async updatePlayerContractStatus(playerName: string): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.playerService.updatePlayerContractStatus(
      this.contract,
      this.account,
      playerName
    );
  }

  //Csapat lekérdezések

  async getTeamByName(teamName: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.teamService.getTeamByName(this.contract, teamName);
  }

  async getTeamPlayersDetails(teamName: string): Promise<PlayerDetails[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.teamService.getTeamPlayersDetails(this.contract, teamName);
  }

  async getUserByAddress(walletAddress: string): Promise<any> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.teamService.getUserByAddress(this.contract, walletAddress);
  }

  async getUserType(walletAddress: string): Promise<UserType> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.teamService.getUserType(this.contract, walletAddress);
  }


  
}

export { Web3InitService, SessionService };
