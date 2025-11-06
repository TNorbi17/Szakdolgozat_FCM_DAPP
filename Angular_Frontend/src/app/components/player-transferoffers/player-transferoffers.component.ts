import { Component, OnInit } from '@angular/core';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';

import { Router } from '@angular/router';

import Web3 from 'web3';


import { SessionService } from '../../services/blockchain/services/session.service';
import { Web3InitService } from '../../services/blockchain/services/web3-init.service';

import {
  UserSession,
  TransferOffer,

} from '../../services/blockchain/models/interfaces';
import { OfferStatus, UserType } from '../../services/blockchain/models/enums';




@Component({
  selector: 'app-player-transferoffers.component',
  standalone: false,
  templateUrl: './player-transferoffers.component.html',
  styleUrl: './player-transferoffers.component.css',
})
export class PlayerTransferoffersComponent implements OnInit {
currentUser: UserSession | null = null;
  transferOffers: TransferOffer[] = [];
  pendingOffers: TransferOffer[] = [];
  acceptedOffers: TransferOffer[] = [];
  rejectedOffers: TransferOffer[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  offerStatusEnum = OfferStatus;
  private web3: Web3 | undefined;
 activeTab: 'pending' | 'accepted' | 'rejected' = 'pending';
  constructor(
    private authService: SessionService,
    private blockchainService: BlockchainService,
    private web3InitService: Web3InitService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = this.authService.currentUserValue;
    this.web3 = this.web3InitService.getWeb3();

    if (!this.currentUser || this.currentUser.userType !== UserType.Player) {
      this.errorMessage = 'Ez az oldal csak játékosok számára érhető el.';
      return;
    }

    try {
      await this.blockchainService.getContractReadyPromise();
      await this.loadTransferOffers();
    } catch (error: any) {
      console.error('Hiba az ajánlatok betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni az ajánlatokat: ${
        error.message || error.toString()
      }`;
    }
  }

 async loadTransferOffers(): Promise<void> {
    if (this.currentUser && this.currentUser.walletAddress) {
      const allOffers = await this.blockchainService.getPlayerTransferOffers(
        this.currentUser.walletAddress
      );

      this.pendingOffers = allOffers.filter(
        offer => offer.status === this.offerStatusEnum.Pending
      );
      this.acceptedOffers = allOffers.filter(
        offer => offer.status === this.offerStatusEnum.Accepted
      );
      this.rejectedOffers = allOffers.filter(
        offer => offer.status === this.offerStatusEnum.Rejected
      );

      console.log('Függőben lévő ajánlatok:', this.pendingOffers);
      console.log('Elfogadott ajánlatok:', this.acceptedOffers);
      console.log('Elutasított ajánlatok:', this.rejectedOffers);

      if (allOffers.length === 0) {
        this.successMessage = 'Nincsenek korábbi vagy függőben lévő ajánlataid.';
      }
    }
  
  }

  async acceptOffer(offerId: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.blockchainService.acceptTransferOffer(offerId);
      this.successMessage =
        'Ajánlat sikeresen elfogadva! A profilod frissítve lett.';
      await this.updatePlayerSession(); 
      await this.loadTransferOffers(); 
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      console.error('Hiba az ajánlat elfogadásakor:', error);
      let displayMessage = 'Hiba az ajánlat elfogadásakor.';
      if (error.message && error.message.includes('Offer is not pending.')) {
        displayMessage =
          'Ez az ajánlat már nem függőben van (elfogadva vagy elutasítva).';
      } else if (
        error.message &&
        error.message.includes('Player is already signed to a team')
      ) {
        displayMessage =
          'Már igazolva van egy csapathoz. Kérjük frissítse az oldalt.';
      } else if (error.message && error.message.includes('execution reverted')) {
        const revertReasonMatch = error.message.match(
          /reverted with reason string '([^']*)'/
        );
        if (revertReasonMatch && revertReasonMatch[1]) {
          displayMessage = `Ajánlat elfogadása sikertelen: ${revertReasonMatch[1]}`;
        } else {
          displayMessage =
            'Ajánlat elfogadása sikertelen: A tranzakció visszagördült.';
        }
      } else {
        displayMessage = `Ajánlat elfogadása sikertelen: ${
          error.message || error.toString()
        }`;
      }
      this.errorMessage = displayMessage;
    }
  }






 formatFeeInEth(feeInWei: string | undefined): string {
  console.log('feeInWei:', feeInWei);
  console.log('web3:', this.web3);

  if (!feeInWei || !this.web3) {
    console.warn('Missing fee or web3 instance');
    return '0';
  }

  const ethValue = this.web3.utils.fromWei(String(feeInWei), 'ether');
  console.log('Converted ETH:', ethValue);
  return ethValue;
}

  async rejectOffer(offerId: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.blockchainService.rejectTransferOffer(offerId);
      this.successMessage = 'Ajánlat sikeresen elutasítva!';
      await this.loadTransferOffers();
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      console.error('Hiba az ajánlat elutasításakor:', error);
      let displayMessage = 'Hiba az ajánlat elutasításakor.';
      if (error.message && error.message.includes('Offer is not pending.')) {
        displayMessage =
          'Ez az ajánlat már nem függőben van (elfogadva vagy elutasítva).';
      } else if (error.message && error.message.includes('execution reverted')) {
        const revertReasonMatch = error.message.match(
          /reverted with reason string '([^']*)'/
        );
        if (revertReasonMatch && revertReasonMatch[1]) {
          displayMessage = `Ajánlat elutasítása sikertelen: ${revertReasonMatch[1]}`;
        } else {
          displayMessage =
            'Ajánlat elutasítása sikertelen: A tranzakció visszagördült.';
        }
      } else {
        displayMessage = `Ajánlat elutasítása sikertelen: ${
          error.message || error.toString()
        }`;
      }
      this.errorMessage = displayMessage;
    }
  }
selectTab(tab: 'pending' | 'accepted' | 'rejected'): void {
    this.activeTab = tab;
  }
  private async updatePlayerSession(): Promise<void> {
    if (this.currentUser && this.currentUser.walletAddress) {
      try {
        await this.blockchainService.getContractReadyPromise();
        const userData = await this.blockchainService.getUserByAddress(
          this.currentUser.walletAddress
        );
        const playerDetails = await this.blockchainService.getPlayerByName(
          userData[4]
        ); 

        const timestampBigInt = BigInt(String(userData[5]));
        const timestampMilliseconds = Number(timestampBigInt * 1000n);

        
        const updatedUserSession: UserSession = {
          walletAddress: userData[0],
          userType: Number(userData[1]),
          email: userData[2],
          registrationTimestamp: new Date(timestampMilliseconds),
          name: userData[4],
          position: playerDetails.position, 
          teamName: playerDetails.teamName, 
          dateOfBirth: playerDetails.dateOfBirth, 
        };
        this.authService.login(updatedUserSession); 
      } catch (error) {
        console.error(
          'Failed to update player session after offer acceptance:',
          error
        );
      }
    }
  }
}
