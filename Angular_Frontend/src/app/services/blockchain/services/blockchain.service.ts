import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import {
  PlayerDetails,
  TransferOffer,
  UserType,
  Bonus,
  Penalty,
  Transaction,
  WeeklyPayment
  
} from '../models';
import { Web3InitService } from './web3-init.service';
import { ContractLoaderService } from './contract-loader.service';
import { PwdhashService } from './pwdhash.service';
import { TransferService } from './transfer.service';
import { SessionService } from './session.service';
import { RegistrationService } from './registration.service';
import { PlayerService } from './player.service';
import { PenaltyService } from './penalty.service';
import { TeamService } from './team.service';
import { BonusService } from './bonus.service';
import { TransactionService } from './transaction.service';
import {  WeeklyPaymentService } from './weekly-payment.service';


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
    private transferService: TransferService,
    private hashpwd: PwdhashService,
    private penaltyService: PenaltyService,
    private bonusService: BonusService,
     private transactionService: TransactionService,
     private weeklyPaymentService: WeeklyPaymentService
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

  //profil szerződés frissítés
  async refreshExpiredContracts(): Promise<any> {
    await this.getContractReadyPromise();
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.playerService.refreshExpiredContracts(this.contract, this.account);
  }

  //Átigazolások

  async createTransferOffer(
    playerWalletAddress: string,
    playerName: string,
    contractExpires: Date,
    transferFeeInEth: string
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.transferService.createTransferOffer(
      this.contract,
      this.account,
      this.web3,
      playerWalletAddress,
      playerName,
      contractExpires,
      transferFeeInEth
    );
  }
async getPlayerTransferOffers(
    playerWalletAddress: string
  ): Promise<TransferOffer[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.transferService.getPlayerTransferOffers(
      this.contract,
      playerWalletAddress
    );
  }

  async acceptTransferOffer(offerId: number): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.transferService.acceptTransferOffer(
      this.contract,
      this.account,
      offerId
    );
  }

  async rejectTransferOffer(offerId: number): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.transferService.rejectTransferOffer(
      this.contract,
      this.account,
      offerId
    );
  }

  async extendContract(
    playerName: string,
    newContractExpires: Date,
    transferFeeInEth: string
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.transferService.extendContract(
      this.contract,
      this.account,
      this.web3,
      playerName,
      newContractExpires,
      transferFeeInEth
    );
  }

  async getTeamTransferOffers(
    teamWalletAddress: string
  ): Promise<TransferOffer[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.transferService.getTeamTransferOffers(
      this.contract,
      teamWalletAddress
    );
  }
  async getTeamOutgoingOffers(
  teamWalletAddress: string
): Promise<TransferOffer[]> {
  if (!this.contract) throw new Error('Contract not loaded');
  return this.transferService.getTeamOutgoingOffers(
    this.contract,
    teamWalletAddress
  );
}


//Büntetések
  async createPenalty(
    playerWalletAddress: string,
    amountInEth: string | number,
    message: string
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.penaltyService.createPenalty(
      this.contract,
      this.account,
      this.web3,
      playerWalletAddress,
      amountInEth,
      message
    );
  }

  async getPlayerPenalties(
    playerWalletAddress: string
  ): Promise<Penalty[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.penaltyService.getPlayerPenalties(
      this.contract,
      playerWalletAddress
    );
  }

  async payPenalty(
    penaltyId: number,
    amountInEth: string | number
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.penaltyService.payPenalty(
      this.contract,
      this.account,
      this.web3,
      penaltyId,
      amountInEth
    );
  }

  //Bónuzok
  async giveBonus(
    playerWalletAddress: string,
    amountInEth: string | number,
    message: string
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.bonusService.giveBonus(
      this.contract,
      this.account,
      this.web3,
      playerWalletAddress,
      amountInEth,
      message
    );
  }

  async getPlayerBonuses(playerWalletAddress: string): Promise<Bonus[]> {
    if (!this.contract) throw new Error('Contract not loaded');
    return this.bonusService.getPlayerBonuses(
      this.contract,
      playerWalletAddress
    );
  }

  //tranzakció megjelenítés
  async getTeamTransactions(teamName: string): Promise<Transaction[]> {
      if (!this.contract) throw new Error('Contract not loaded');

      const players = await this.getTeamPlayersDetails(teamName);

      return this.transactionService.getTeamTransactions(
        this.contract,
        players
      );
    }
    async setWeeklyPayment(
    playerWallet: string,
    amountEth: string
  ): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }
    return this.weeklyPaymentService.setWeeklyPayment(
      this.contract,
      this.account,
      this.web3,
      playerWallet,
      amountEth
    );
  }

  async executeWeeklyPayment(playerWallet: string): Promise<any> {
    if (!this.contract || !this.account || !this.web3) {
      throw new Error('Contract, account or web3 not loaded');
    }

    const weeklyPayment = await this.getWeeklyPaymentForPlayer(playerWallet);

    return this.weeklyPaymentService.executeWeeklyPayment(
      this.contract,
      this.account,
      this.web3,
      playerWallet,
      weeklyPayment
    );
  }

  async stopWeeklyPayment(playerWallet: string): Promise<any> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or account not loaded');
    }
    return this.weeklyPaymentService.stopWeeklyPayment(
      this.contract,
      this.account,
      playerWallet
    );
  }

  async getWeeklyPaymentForPlayer(
    playerWallet: string
  ): Promise<WeeklyPayment> {
    if (!this.contract || !this.web3) {
      throw new Error('Contract or web3 not loaded');
    }
    return this.weeklyPaymentService.getWeeklyPaymentForPlayer(
      this.contract,
      this.web3,
      playerWallet
    );
  }

  // A BlockchainService-ben hozzáadni:

async hasUnpaidPenalties(playerWalletAddress: string): Promise<boolean> {
  if (!this.contract) throw new Error('Contract not loaded');
  return this.penaltyService.hasUnpaidPenalties(this.contract, playerWalletAddress);
}

async getUnpaidPenaltiesCount(playerWalletAddress: string): Promise<number> {
  if (!this.contract) throw new Error('Contract not loaded');
  return this.penaltyService.getUnpaidPenaltiesCount(this.contract, playerWalletAddress);
}

async getUnpaidPenaltiesAmount(playerWalletAddress: string): Promise<string> {
  if (!this.contract || !this.web3) throw new Error('Contract or web3 not loaded');
  return this.penaltyService.getUnpaidPenaltiesAmount(this.contract, this.web3, playerWalletAddress);
}
  
}

export { Web3InitService, SessionService };
