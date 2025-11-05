import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';
import { Router } from '@angular/router';
import { SessionService } from '../../services/blockchain/services/session.service';
import {UserSession, Bonus, Penalty,} from '../../services/blockchain/models/interfaces';
import { UserType } from '../../services/blockchain/models/enums';
import { formatEth, formatDate } from '../utils/format.utils';

@Component({
  selector: 'app-player-dashboard',
  standalone: false,
  templateUrl: './player-dashboard.component.html',
  styleUrls: ['./player-dashboard.component.css'],
})

export class PlayerDashboardComponent implements OnInit {
  currentUser: UserSession | null = null;
  bonuses: Bonus[] = [];
  penalties: Penalty[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private sessionService: SessionService,
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    this.currentUser = this.sessionService.currentUserValue;

    if (!this.currentUser || this.currentUser.userType !== UserType.Player)
    {
      this.errorMessage = 'Ez az oldal csak játékosok számára érhető el.';
      this.router.navigate(['/profile']);
      return;
    }

    try {
      await this.blockchainService.getContractReadyPromise();
      await this.loadBonusesAndPenalties();
      
    } catch (error: any) {
      console.error('Hiba a adatok betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni az adatokat: ${error.message || error.toString()}`;
    }
  }

  async loadBonusesAndPenalties(): Promise<void> {
    if (this.currentUser && this.currentUser.walletAddress)
    {
      this.bonuses = await this.blockchainService.getPlayerBonuses(this.currentUser.walletAddress);
      this.penalties = await this.blockchainService.getPlayerPenalties(this.currentUser.walletAddress);
      
      if (this.bonuses.length === 0 && this.penalties.length === 0)
      {
        this.errorMessage = 'Még nincsenek bónuszok vagy büntetések.';
      }
      else
      {
        this.errorMessage = '';
      }
    }
  }

  async payPenalty(penaltyId: number, amount: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.blockchainService.payPenalty(penaltyId, amount);
      this.successMessage = `Büntetés sikeresen fizetve (${amount} ETH)!`;
      await this.loadBonusesAndPenalties();
    } catch (error: any) {
      this.errorMessage = `Hiba a fizetéskor: ${error.message || error.toString()}`;
    } finally {
      this.isLoading = false;
    }
  }

//UI
formatEth = (wei: string) => formatEth(wei, this.blockchainService.getWeb3());
formatDate = formatDate;
  
}