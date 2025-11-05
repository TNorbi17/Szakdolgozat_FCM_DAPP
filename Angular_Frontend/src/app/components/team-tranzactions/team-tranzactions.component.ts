import { Component, OnInit } from '@angular/core';
import {  BlockchainService} from '../../services/blockchain/services/blockchain.service';
import { Router } from '@angular/router';
import { SessionService } from '../../services/blockchain/services/session.service';
import {UserSession,Transaction,PlayerDetails,TransferOffer,} from '../../services/blockchain/models/interfaces';
import { UserType, OfferStatus } from '../../services/blockchain/models/enums';

@Component({
  selector: 'app-team-transactions',
  standalone: false,
  templateUrl: './team-transactions.component.html',
  styleUrls: ['./team-transactions.component.css'],
})

export class TeamTranzactionsComponent implements OnInit {

  currentUser: UserSession | null = null;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  filterType: 'all' | 'bonus' | 'penalty' = 'all';
  teamPlayers: PlayerDetails[] = [];
  players: PlayerDetails[] = [];
  selectedPlayerName: string = 'all';
  selectedPost: string = 'all';
  minAge: number | null = null;
  maxAge: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoadingOffers: boolean = false;
  isProcessingOffer: boolean = false;
  offerStatusEnum = OfferStatus;
  pendingTeamOffers: TransferOffer[] = [];
  acceptedTeamOffers: TransferOffer[] = [];
  rejectedTeamOffers: TransferOffer[] = [];
  OfferStatus = OfferStatus;
  isLoading: boolean = false;
  pendingOutgoingOffers: TransferOffer[] = [];
  acceptedOutgoingOffers: TransferOffer[] = [];
  rejectedOutgoingOffers: TransferOffer[] = [];
  offerDirection: 'incoming' | 'outgoing' = 'incoming';
  targetTeamNames: Map<number, string> = new Map();

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
      await this.loadTransactions();
      await this.loadPlayers();  // ÚJ: Játékosok betöltése
      this.applyFilter();
      await this.loadTeamOffers();
      await this.loadOutgoingOffers();
    } catch (error: any) {
      console.error('Hiba a tranzakciók betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni a tranzakciókat: ${error.message || error.toString()}`;
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


  async loadAllOffers(): Promise<void> {
    await Promise.all([
      this.loadTeamOffers(),
      this.loadOutgoingOffers()
    ]);
  }

  async loadOutgoingOffers(): Promise<void> {
    if (!this.currentUser?.walletAddress) return;

    try {
      const allOutgoingOffers =
        await this.blockchainService.getTeamOutgoingOffers(
          this.currentUser.walletAddress
        );
 await this.loadTargetTeamNames(allOutgoingOffers);
      

      this.pendingOutgoingOffers = allOutgoingOffers.filter(
        (offer) => offer.status === OfferStatus.Pending
      );

      this.acceptedOutgoingOffers = allOutgoingOffers.filter(
        (offer) => offer.status === OfferStatus.Accepted
      );

      this.rejectedOutgoingOffers = allOutgoingOffers.filter(
        (offer) => offer.status === OfferStatus.Rejected
      );

     
    } catch (error: any) {
      console.error('[LoadOutgoing] Hiba:', error);
      this.errorMessage = `Hiba a kimenő ajánlatok betöltésekor: ${
        error.message || ''
      }`;
    }
  }

  async loadTargetTeamNames(offers: TransferOffer[]): Promise<void> {
    const uniqueAddresses = new Set<string>();
    
    



    const promises = Array.from(uniqueAddresses).map(async (address) => {
      try {
        
        const user = await this.blockchainService.getUserByAddress(address);
      
        
        const teamName = user.entityName || user[4] || 'Ismeretlen csapat';
        
        offers.forEach(offer => {
          if (offer.currentTeamWalletAddress === address) {
            this.targetTeamNames.set(offer.offerId, teamName);
          }
        });
      } catch (error) {
      
        offers.forEach(offer => {
          if (offer.currentTeamWalletAddress === address) {
            this.targetTeamNames.set(offer.offerId, 'Hiba: ' + error);
          }
        });
      }
    });

    await Promise.all(promises);
  
  }


  getTargetTeamName(offer: TransferOffer): string {
    return this.targetTeamNames.get(offer.offerId) || 'Szabadúszó';
  }


  async loadTransactions(): Promise<void> {
      if (this.currentUser && this.currentUser.name) {
        this.transactions = await this.blockchainService.getTeamTransactions(this.currentUser.name);
        
        if (this.transactions.length === 0) {
          this.errorMessage = 'Még nincsenek tranzakciók.';
        } else {
          this.errorMessage = '';
        }
        this.applyFilter();
      }
  }

  
  async loadPlayers(): Promise<void> {
      if (this.currentUser && this.currentUser.name) {
        this.players = await this.blockchainService.getTeamPlayersDetails(this.currentUser.name);  // Feltételezett metódus – implementáld!
        // Ha nincs ilyen metódus, hardcoded példa: this.players = [{name: 'Játékos1', post: 'csatár', age: 25}, ...];
      }
  }

  applyFilter(): void {
      console.log('Szűrés fut: filterType=', this.filterType, 'name=', this.selectedPlayerName, 'post=', this.selectedPost, 'age min/max=', this.minAge, this.maxAge);
      
      let filtered = this.transactions;

      // Típus szűrés
      if (this.filterType !== 'all') {
        filtered = filtered.filter(tx => tx.type === this.filterType);
      }

      // Név szűrés
      if (this.selectedPlayerName !== 'all') {
        filtered = filtered.filter(tx => tx.playerName === this.selectedPlayerName);
      }

      

      this.filteredTransactions = filtered;
  }

    // ÚJ: Getter az egyedi nevekhez (select opciók)
  get uniquePlayerNames(): string[] {
      return [...new Set(this.transactions.map(tx => tx.playerName))].sort();
  }

    // Segédfüggvények (változatlanok)
  formatEth(wei?: string): string {
    if (!wei) return '0';
    return this.blockchainService.getWeb3()?.utils.fromWei(wei, 'ether') || '0';
  }

  formatDate(timestamp: number): string {
      return new Date(timestamp * 1000).toLocaleDateString('hu-HU');
    }
  switchOfferDirection(direction: 'incoming' | 'outgoing'): void {
      this.offerDirection = direction;
      console.log('[Direction] Váltás:', direction);
  }

  /***************************statisztaika */
    get totalBonusEth(): string {
    const sum = this.transactions
      .filter(tx => tx.type === 'bonus')
      .reduce((acc, tx) => acc + parseFloat(this.formatEth(tx.amount || '0')), 0);
    return sum.toFixed(2);
  }

  get totalPenaltyEth(): string {
    const sum = this.transactions
      .filter(tx => tx.type === 'penalty')
      .reduce((acc, tx) => acc + parseFloat(this.formatEth(tx.amount || '0')), 0);
    return sum.toFixed(2);
  }

  get totalEth(): string {
    const sum = parseFloat(this.totalPenaltyEth) -parseFloat(this.totalBonusEth) ;
    return sum.toFixed(2);
  }


  get filteredTotalBonusEth(): string {
      const sum = this.filteredTransactions
        .filter(tx => tx.type === 'bonus')
        .reduce((acc, tx) => acc + parseFloat(this.formatEth(tx.amount || '0')), 0);
      return sum.toFixed(2);
  }

    get filteredTotalPenaltyEth(): string {
      const sum = this.filteredTransactions
        .filter(tx => tx.type === 'penalty')
        .reduce((acc, tx) => acc + parseFloat(this.formatEth(tx.amount || '0')), 0);
      return sum.toFixed(2);
  }

    get filteredTotalEth(): string {
      const sum = parseFloat(this.filteredTotalPenaltyEth) - parseFloat(this.filteredTotalBonusEth);
      return sum.toFixed(2);
  }


  //Transzfer válasz
  async acceptOffer(offer: TransferOffer): Promise<void> {
      if (this.isProcessingOffer) {
        return;
      }

      this.isProcessingOffer = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Optimista UI frissítés - azonnal frissítjük a felületet
      const originalStatus = offer.status;
      offer.status = OfferStatus.Accepted; // Használd az enum értéket

      try {
        await this.blockchainService.acceptTransferOffer(offer.offerId);

        this.successMessage = 'Ajánlat sikeresen elfogadva!';

        // Várjunk 5 másodpercet, majd frissítsük a valós állapotot a blokkláncból
        setTimeout(async () => {
          try {
            await this.loadAllOffers();
            await this.loadTransactions(); // Frissítsd a tranzakciókat is
            console.log('[Accept] Ajánlatok és tranzakciók frissítve');
          } catch (error) {
            console.error('[Accept] Hiba a frissítés közben:', error);
          }
        }, 5000);
      } catch (error: any) {
        
        // Visszaállítjuk az eredeti állapotot hiba esetén
        offer.status = originalStatus;
        this.errorMessage = `Hiba: ${error.message || 'Ismeretlen hiba'}`;
      } finally {
        this.isProcessingOffer = false;
      }
    }
  async rejectOffer(offer: TransferOffer): Promise<void> {
      if (this.isProcessingOffer) {
        return;
      }

      this.isProcessingOffer = true;
      this.errorMessage = '';
      this.successMessage = '';

      const originalStatus = offer.status;
      offer.status = OfferStatus.Rejected;
      

      try {
        

        await this.blockchainService.rejectTransferOffer(offer.offerId);

        this.successMessage = 'Ajánlat sikeresen elutasítva!';

        setTimeout(async () => {
          try {
            await this.loadAllOffers(); 
          } catch (error) {
          }
        }, 5000);
      } catch (error: any) {
        console.error('[Reject] Hiba történt:', error);
        offer.status = originalStatus;
        this.errorMessage = `Hiba: ${error.message || 'Ismeretlen hiba'}`;
      } finally {
        this.isProcessingOffer = false;
      }
    }

  async loadTeamOffers(): Promise<void> {
    if (!this.currentUser?.walletAddress) return;

    try {
      this.isLoadingOffers = true;

      const allTeamOffers = await this.blockchainService.getTeamTransferOffers(
        this.currentUser.walletAddress
      );

      

      // Szűrés státusz szerint
      this.pendingTeamOffers = allTeamOffers.filter(
        (offer) => offer.status === OfferStatus.Pending
      );

      this.acceptedTeamOffers = allTeamOffers.filter(
        (offer) => offer.status === OfferStatus.Accepted
      );

      this.rejectedTeamOffers = allTeamOffers.filter(
        (offer) => offer.status === OfferStatus.Rejected
      );

    
    } catch (error: any) {
      this.errorMessage = `Hiba az ajánlatok betöltésekor: ${error.message || ''}`;
    } finally {
      this.isLoadingOffers = false;
    }
  }

  /****************************Transzfer****************************/

  activeOfferTab: 'pending' | 'accepted' | 'rejected' = 'pending';

  switchOfferTab(tab: 'pending' | 'accepted' | 'rejected'): void {
      this.activeOfferTab = tab;
  }

  get activeOffers(): TransferOffer[] {
      const isIncoming = this.offerDirection === 'incoming';

      switch (this.activeOfferTab) {
        case 'pending':
          return isIncoming ? this.pendingTeamOffers : this.pendingOutgoingOffers;
        case 'accepted':
          return isIncoming ? this.acceptedTeamOffers : this.acceptedOutgoingOffers;
        case 'rejected':
          return isIncoming ? this.rejectedTeamOffers : this.rejectedOutgoingOffers;
        default:
          return [];
      }
   }

  get totalPendingOffers(): number {
      return this.offerDirection === 'incoming'
        ? this.pendingTeamOffers.length
        : this.pendingOutgoingOffers.length;
   }

  get totalAcceptedOffers(): number {
      return this.offerDirection === 'incoming'
        ? this.acceptedTeamOffers.length
        : this.acceptedOutgoingOffers.length;
   }

  get totalRejectedOffers(): number {
      return this.offerDirection === 'incoming'
        ? this.rejectedTeamOffers.length
        : this.rejectedOutgoingOffers.length;
    }




//UI - megjelenés
  get activeTabLabel(): string {
    switch (this.activeOfferTab) {
      case 'pending':
        return 'Függőben';
      case 'accepted':
        return 'Elfogadva';
      case 'rejected':
        return 'Elutasítva';
      default:
        return '';
    }
  }


  get activeTabIcon(): string {
    switch (this.activeOfferTab) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '';
    }
  }


}