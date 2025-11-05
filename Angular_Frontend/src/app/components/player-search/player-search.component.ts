import { Component, OnInit } from '@angular/core';

import {
  BlockchainService,



} from '../../services/blockchain/services/blockchain.service';
import { Router } from '@angular/router';

import { UserType,PlayerPosition } from '../../services/blockchain/models/enums';
import { SessionService } from '../../services/blockchain/services/session.service';
import {
  UserSession,
PlayerDetails
} from '../../services/blockchain/models/interfaces';
@Component({
  selector: 'app-player-search',
  standalone: false,
  templateUrl: './player-search.component.html',
  styleUrls: ['./player-search.component.css'],
})
export class PlayerSearchComponent implements OnInit {
  currentUser: UserSession | null = null;
  allPlayers: PlayerDetails[] = [];
  filteredPlayers: PlayerDetails[] = [];
  selectedPlayer: PlayerDetails | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  selectedPosition: string = 'all';
  minAge: number | null = null;
  maxAge: number | null = null;
  filterByStatus: string = 'all';
  transferFee: number | null = null;
  contractExpiresDate: string | null = null;
   

  PlayerPositionEnum = PlayerPosition;

  constructor(
    private authService: SessionService,
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser || this.currentUser.userType !== UserType.Team) {
      this.errorMessage = 'Ez az oldal csak csapatok számára érhető el.';
      alert("Az oldal használatához be kell jelentkezni. Csak csapatok láthathják az oldalt.")
      this.router.navigate(['/profile']);
      return;
    }
    try {
      await this.blockchainService.getContractReadyPromise();
      await this.loadAllPlayers();
     
    } catch (error: any) {
      console.error('Hiba a játékosok betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni a játékosokat: ${
        error.message || error.toString()
      }`;
    }
  }

  async loadAllPlayers(): Promise<void> {
    this.allPlayers = await this.blockchainService.getAllPlayers();

    this.applyFilters();
    
    console.log('Összes játékos betöltve:', this.allPlayers);
    if (this.allPlayers.length === 0) {
      this.errorMessage = 'Jelenleg nincsenek regisztrált játékosok.';
    } else {
      this.errorMessage = '';
    }
  }

  applyFilters(): void {
    let players = [...this.allPlayers];
    if (this.searchTerm) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.selectedPosition !== 'all') {
      players = players.filter(
        p => p.position.toString() === this.selectedPosition
      );
    }
    if (this.minAge !== null && this.minAge > 0) {
      players = players.filter(
        p => this.calculateAge(p.dateOfBirth) >= this.minAge!
      );
    }
    if (this.maxAge !== null && this.maxAge > 0) {
      players = players.filter(
        p => this.calculateAge(p.dateOfBirth) <= this.maxAge!
      );
    }
    if (this.filterByStatus === 'free') {
      players = players.filter(p => p.isFreeAgent);
    } else if (this.filterByStatus === 'signed') {
      players = players.filter(p => !p.isFreeAgent);
    }
    this.filteredPlayers = players;
    if (
      this.selectedPlayer &&
      !this.filteredPlayers.find(
        p => p.walletAddress === this.selectedPlayer?.walletAddress
      )
    ) {
      this.selectedPlayer = null;
    }
  }

  
  onPlayerSelect(player: PlayerDetails): void {
    this.selectedPlayer = player;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closePlayerDetails(): void {
    this.selectedPlayer = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async makeOffer(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedPlayer) {
      this.errorMessage = 'Kérjük, válasszon ki egy játékost!';
      return;
    }
    
   
    if (this.transferFee === null || this.transferFee <= 0) {
      this.errorMessage = 'Kérjük, adjon meg érvényes átigazolási díjat (0-nál nagyobb ETH-ban).';
      return;
    }
    if (!this.contractExpiresDate) {
      this.errorMessage = 'Kérjük, adja meg a szerződés lejárati dátumát.';
      return;
    }
    const expires = new Date(this.contractExpiresDate);
    if (expires <= new Date()) {
      this.errorMessage = 'A lejárati dátumnak a jövőben kell lennie.';
      return;
    }

    try {
      await this.blockchainService.createTransferOffer(
        this.selectedPlayer.walletAddress,
        this.selectedPlayer.name,
        expires,
        this.transferFee.toString()
      );
      this.successMessage = `Ajánlat sikeresen elküldve ${this.selectedPlayer.name} játékosnak!`;
      this.transferFee = null;
      this.contractExpiresDate = null;
      await this.loadAllPlayers();
      this.selectedPlayer = null;
    } catch (error: any) {
      console.error('Hiba az ajánlat létrehozásakor:', error);
      let displayMessage = 'Hiba az ajánlat létrehozásakor.';
      if (error.message && error.message.includes('execution reverted')) {
        const revertReasonMatch = error.message.match(/reverted with reason string '([^']*)'/);
        if (revertReasonMatch && revertReasonMatch[1]) {
          displayMessage = `Ajánlat sikertelen: ${revertReasonMatch[1]}`;
        } else {
          displayMessage = 'Ajánlat sikertelen: A tranzakció visszagördült.';
        }
      } else {
        displayMessage = `Ajánlat sikertelen: ${error.message || error.toString()}`;
      }
      this.errorMessage = displayMessage;
    }
  }

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
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}