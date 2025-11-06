import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/blockchain/services/session.service';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';
import {
  UserSession,
  PlayerDetails,
} from '../../services/blockchain/models/interfaces';
import {
  UserType,
  PlayerPosition,
} from '../../services/blockchain/models/enums';



@Component({
  selector: 'app-team-dashboard',
  standalone: false,
  templateUrl: './team-dashboard.component.html',
  styleUrls: ['./team-dashboard.component.css'],
})
export class TeamDashboardComponent implements OnInit {
  currentUser: UserSession | null = null;
  teamPlayers: PlayerDetails[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  bonusAmounts: { [wallet: string]: number } = {};
  bonusMessages: { [wallet: string]: string } = {};
  penaltyAmounts: { [wallet: string]: number } = {};
  penaltyMessages: { [wallet: string]: string } = {};

  today: Date = new Date();
  isLoading: boolean = false;

  constructor(
    private sessionService: SessionService,
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
     this.currentUser = this.sessionService.currentUserValue;

    if (!this.currentUser || this.currentUser.userType !== UserType.Team) {
      this.errorMessage = 'Ez az oldal csak csapatok számára érhető el.';
      this.router.navigate(['/profile']);
      return;
    }

    try {
      await this.blockchainService.getContractReadyPromise();
      await this.loadTeamPlayers();
      await this.loadAllDailyPaymentStates();
    } catch (error: any) {
      console.error('Hiba a csapat játékosainak betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni a csapat játékosait: ${
        error.message || error.toString()
      }`;
    }
  }
async loadAllDailyPaymentStates(): Promise<void> {
  for (const player of this.teamPlayers) {
   
    try {
      await this.loadDailyPaymentState(player.walletAddress);
    } catch (error) {
    }
  }
  
  
}
  async loadTeamPlayers(): Promise<void> {
    if (this.currentUser && this.currentUser.name) {
      this.teamPlayers = await this.blockchainService.getTeamPlayersDetails(
        this.currentUser.name
      );
      console.log('Csapat játékosai:', this.teamPlayers);
      if (this.teamPlayers.length === 0) {
        this.errorMessage = 'Még nincsenek játékosai a csapatnak.';
      } else {
        this.errorMessage = '';
      }
    }
  }


  async giveBonusToPlayer(playerWallet: string): Promise<void> {
    const amount = this.bonusAmounts[playerWallet];
    const message = this.bonusMessages[playerWallet];

    if (!amount || amount <= 0) {
      this.errorMessage = 'Érvénytelen bónusz összeg (minimum 0.001 ETH).';
      return;
    }
    if (!message) {
      this.errorMessage = 'Megjegyzés kötelező.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.blockchainService.giveBonus(playerWallet, amount, message);
      this.successMessage = `Bónusz sikeresen elküldve a játékosnak (${amount} ETH)!`;

    } catch (error: any) {
      this.errorMessage = `Hiba a bónusz küldésekor: ${error.message || error.toString()}`;
    } finally {
      this.isLoading = false;
    }
  }


  async createPenaltyForPlayer(playerWallet: string): Promise<void> {
    const amount = this.penaltyAmounts[playerWallet];
    const message = this.penaltyMessages[playerWallet];

    if (!amount || amount <= 0) {
      this.errorMessage = 'Érvénytelen büntetés összeg (minimum 0.001 ETH).';
      return;
    }
    if (!message) {
      this.errorMessage = 'Megjegyzés kötelező.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.blockchainService.createPenalty(playerWallet, amount, message);
      this.successMessage = `Büntetés sikeresen létrehozva (${amount} ETH)! A játékos értesítve lesz.`;
  
    } catch (error: any) {
      this.errorMessage = `Hiba a büntetés létrehozásakor: ${error.message || error.toString()}`;
    } finally {
      this.isLoading = false;
    }
  }

//refaktorálás
  getPlayerPositionText(position?: PlayerPosition): string {
    if (position === undefined) return 'N/A';
    switch (position) {
      case PlayerPosition.Goalkeeper: return 'Kapus';
      case PlayerPosition.Defender: return 'Védő';
      case PlayerPosition.Midfielder: return 'Középpályás';
      case PlayerPosition.Attacker: return 'Támadó';
      default: return 'Ismeretlen';
    }
  }

  
  calculateAge(birthDate: Date): number {
    
    if (!birthDate || isNaN(birthDate.getTime())) {
        return 0; 
    }
    const today = new Date();
    const birth = new Date(birthDate); 
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }








expandedPlayerId: string | null = null;

  togglePlayerDetails(walletAddress: string): void {
    if (this.expandedPlayerId === walletAddress) {
      this.expandedPlayerId = null;
    } else {
      this.expandedPlayerId = walletAddress;
    }
  }

  isPlayerExpanded(walletAddress: string): boolean {
    return this.expandedPlayerId === walletAddress;
  }



dailyAmounts: { [wallet: string]: number } = {};
dailyPaymentStates: { [wallet: string]: { amountEth: number; lastPaymentTimestamp: Date | null ;lastPaidAmount?: number;} } = {};


async setDailyPayment(playerWallet: string): Promise<void> {
  const amount = this.dailyAmounts[playerWallet];
  if (!amount || amount <= 0) {
    this.errorMessage = 'Érvénytelen összeg (minimum 0.001 ETH).';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  try {
    
    const previousState = this.dailyPaymentStates[playerWallet];
    
    await this.blockchainService.setWeeklyPayment(
      playerWallet,
      amount.toString()
    );
    
    if (previousState && previousState.lastPaymentTimestamp) {
      this.successMessage = `Napi fizetés összege frissítve: ${amount} ETH. Az utolsó fizetés dátuma megmaradt.`;
      

      setTimeout(async () => {
        await this.loadDailyPaymentState(playerWallet);
        
        if (!this.dailyPaymentStates[playerWallet]?.lastPaymentTimestamp 
            && previousState.lastPaymentTimestamp) {
          this.dailyPaymentStates[playerWallet] = {
            amountEth: amount,
            lastPaymentTimestamp: previousState.lastPaymentTimestamp
          };
        }
      }, 1000);
    } else {
      this.successMessage = `Napi fizetés sikeresen beállítva: ${amount} ETH`;
      await this.loadDailyPaymentState(playerWallet);
    }
  } catch (error: any) {
    this.errorMessage = `Hiba történt: ${error.message || error.toString()}`;
  } finally {
    this.isLoading = false;
  }
}


async executeDailyPayment(playerWallet: string): Promise<void> {
  await this.blockchainService.executeWeeklyPayment(playerWallet);
  this.successMessage = 'Napi fizetés sikeresen elküldve!';
  await this.loadDailyPaymentState(playerWallet);
}


async stopDailyPayment(playerWallet: string): Promise<void> {
  await this.blockchainService.stopWeeklyPayment(playerWallet);
  await this.loadDailyPaymentState(playerWallet);
}


async loadDailyPaymentState(playerWallet: string): Promise<void> {
  try {
   
    
    const state = await this.blockchainService.getWeeklyPaymentForPlayer(
      playerWallet
    );
    
  
    if (state && state.amountEth && parseFloat(state.amountEth) > 0) {
      this.dailyPaymentStates[playerWallet] = {
        amountEth: parseFloat(state.amountEth),
        lastPaymentTimestamp: state.lastPaymentTimestamp,
        lastPaidAmount: state.lastPaidAmount 
          ? parseFloat(state.lastPaidAmount) 
          : undefined
      };
      
      
    } else {
      
    }
  } catch (error) {
    
  }
}


isOverdue(playerWallet: string): boolean {
  const state = this.dailyPaymentStates[playerWallet];
  if (!state || !state.lastPaymentTimestamp) return true;
  const daysPassed = Math.floor(
    (new Date().getTime() - state.lastPaymentTimestamp.getTime()) / (1000 * 3600 * 24)
  );
  return daysPassed > 14;
}


releaseAmounts: { [wallet: string]: number } = {};
showReleaseForm: { [wallet: string]: boolean } = {};

toggleReleaseForm(playerWallet: string): void {
  this.showReleaseForm[playerWallet] = !this.showReleaseForm[playerWallet];
}

async releasePlayerByTeam(playerWallet: string): Promise<void> {
  const player = this.teamPlayers.find(p => p.walletAddress === playerWallet);
  if (!player) {
    this.errorMessage = 'Játékos nem található.';
    return;
  }

  const amount = this.releaseAmounts[playerWallet];
  if (!amount || amount <= 0) {
    this.errorMessage = 'Érvénytelen kártérítési összeg (minimum 0.001 ETH).';
    return;
  }

  const confirmed = confirm(
    `Biztosan el szeretné küldeni ${player.name} játékost? ` +
    `Kártérítésként ${amount} ETH kerül átutalásra a játékosnak.`
  );

  if (!confirmed) return;

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  try {
    await this.blockchainService.releasePlayerByTeam(player.name, amount.toString());
    this.successMessage = `${player.name} sikeresen elküldve! ${amount} ETH kártérítés elküldve.`;

    await this.loadTeamPlayers();
    
    delete this.releaseAmounts[playerWallet];
    delete this.showReleaseForm[playerWallet];
    this.isLoading = false;
    
  } catch (error: any) {
    this.errorMessage = `Hiba a játékos elküldésekor: ${error.message || error.toString()}`;
  } finally {
    this.isLoading = false;
  }
}
}