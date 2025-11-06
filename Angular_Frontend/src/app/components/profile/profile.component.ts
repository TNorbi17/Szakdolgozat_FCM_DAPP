import { Component, OnDestroy, OnInit } from '@angular/core';
import { SessionService,BlockchainService } from '../../services/blockchain/services/blockchain.service';
import { Router } from '@angular/router';
import {
  UserSession,
} from '../../services/blockchain/models/interfaces';
import { UserType, PlayerPosition } from '../../services/blockchain/models/enums';import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: UserSession | null = null;
  userDetails: UserSession | null = null;
  errorMessage: string = '';
  userTypeEnum = UserType; 
  isLoading: boolean = false;
  successMessage: string = '';
  
  releaseFee: number | null = null;
  public today: Date = new Date();
  private autoRefreshSub?: Subscription;
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private blockchainService: BlockchainService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = this.sessionService.currentUserValue;

    if (!this.currentUser)
    {
      this.router.navigate(['/login']);
      return;
    }
  
    await this.loadProfileData();
    setTimeout(() => {
        this.checkAndPromptContractRenewal();
      }, 5000);

  }

  
  async loadProfileData(): Promise<void> {
    if (!this.currentUser) return;
    this.isLoading = true;
    try {
      await this.blockchainService.getContractReadyPromise();

      const userData = await this.blockchainService.getUserByAddress(
        this.currentUser.walletAddress
      );

      const timestampBigInt = BigInt(String(userData[5]));
      const timestampMilliseconds = Number(timestampBigInt * 1000n);

      // UserSession objektum létrehozása
      this.userDetails = {
        walletAddress: userData[0],
        userType: Number(userData[1]),
        email: userData[2],
        name: userData[4], // A passwordHash-t kihagyjuk
        registrationTimestamp: new Date(timestampMilliseconds),
      };

      if (this.userDetails.userType === this.userTypeEnum.Team) {
        const teamData = await this.blockchainService.getTeamByName(
          this.userDetails.name
        );
        this.userDetails.foundationYear = Number(teamData[2]);
      } else if (this.userDetails.userType === this.userTypeEnum.Player) {
        const playerData = await this.blockchainService.getPlayerByName(
          this.userDetails.name
        );
        this.userDetails.position = playerData.position;
        this.userDetails.teamName = playerData.teamName;
        this.userDetails.dateOfBirth = playerData.dateOfBirth;
        this.userDetails.contractExpires = playerData.contractExpires; 
        this.userDetails.isFreeAgent = playerData.isFreeAgent;

        // ÚJ: Büntetések ellenőrzése
        try {
          this.userDetails.hasUnpaidPenalties = await this.blockchainService.hasUnpaidPenalties(
            this.userDetails.walletAddress
          );
          
          if (this.userDetails.hasUnpaidPenalties) {
            this.userDetails.unpaidPenaltiesCount = await this.blockchainService.getUnpaidPenaltiesCount(
              this.userDetails.walletAddress
            );
            this.userDetails.unpaidPenaltiesAmount = await this.blockchainService.getUnpaidPenaltiesAmount(
              this.userDetails.walletAddress
            );
          } else {
            this.userDetails.unpaidPenaltiesCount = 0;
            this.userDetails.unpaidPenaltiesAmount = '0';
          }
        } catch (penaltyError) {
          console.warn('Nem sikerült betölteni a büntetési adatokat:', penaltyError);
          // Alapértelmezett értékek beállítása, ha nem sikerül a betöltés
          this.userDetails.hasUnpaidPenalties = false;
          this.userDetails.unpaidPenaltiesCount = 0;
          this.userDetails.unpaidPenaltiesAmount = '0';
        }
      }
      
    } catch (error: any) {
      this.errorMessage =
        'Nem sikerült betölteni a profil adatokat. Próbálja újra később.';
    } finally {
      this.isLoading = false;
    }
  }

  async onUpdateStatus(): Promise<void> {
    if (this.userDetails && this.userDetails.name && this.userDetails.userType === this.userTypeEnum.Player)
    {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await this.blockchainService.updatePlayerContractStatus(this.userDetails.name);
        await this.loadProfileData(); 
        this.successMessage = 'Státusz sikeresen frissítve!';
      } catch (error: any) {
        this.errorMessage = 'Jelenleg nem lehet frissíteni a státuszt. Aktív szerződés esetén ez a művelet, illetve szabadúszóként nem hajtható végre.';
      } finally {
        this.isLoading = false;
      }
    }
  }
//refaktorálni
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


private checkAndPromptContractRenewal(): void {
  if(this.userDetails && this.userDetails.contractExpires && this.userDetails.contractExpires < new Date() && !this.userDetails.isFreeAgent)
  {
    alert('Lejárt a szerződésed, a klub elhagyásához fogadd el a szerződést');

    this.handleContractRenewal();
  }
}

private async handleContractRenewal(): Promise<void> {
  console.log('Szerződés frissítése...');
  
  try {
    await this.blockchainService.refreshExpiredContracts();
    await this.loadProfileData();
    this.successMessage = 'A lejárt szerződésed sikeresen frissült.';
  } catch (err: any) {
    setTimeout(() => {
      this.checkAndPromptContractRenewal();
    }, 5000);
  }
}

 ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }


  async releasePlayer(): Promise<void> {
    if (!this.userDetails || this.userDetails.userType !== UserType.Player)
    {
      this.errorMessage = 'Ezt a funkciót csak játékosok használhatják.';
      return;
    }
    if (this.userDetails.isFreeAgent)
    {
      this.errorMessage = 'Már szabadúszó vagy.';
      return;
    }
    if (this.releaseFee === null || this.releaseFee <= 0)
    {
      this.errorMessage = 'Kérjük, adjon meg érvényes felmondási díjat (legalább 1 wei ETH).';
      return;
    }

    const confirmRelease = confirm(`Biztos vagy benne, hogy fel akarsz bontani szerződést? A díj: ${this.releaseFee} ETH`);
    if (!confirmRelease)
    {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.blockchainService.releasePlayer(this.userDetails.name, this.releaseFee.toString());
      this.successMessage = 'Szerződés felbontva! Szabadúszó lettél.';
      await this.loadProfileData();
      this.releaseFee = null; 
    } catch (error: any) {
      let displayMessage = 'Hiba a szerződés felbontásakor.';
      this.errorMessage = displayMessage;
    } finally {
      this.isLoading = false;
    }
  }
}