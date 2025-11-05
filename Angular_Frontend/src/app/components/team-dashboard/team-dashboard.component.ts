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

    } catch (error: any) {
      console.error('Hiba a csapat játékosainak betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni a csapat játékosait: ${
        error.message || error.toString()
      }`;
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


}