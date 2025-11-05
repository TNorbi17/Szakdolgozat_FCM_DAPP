import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockchainService,SessionService } from '../../services/blockchain/services/blockchain.service';
import{UserSession} from '../../services/blockchain/models/interfaces';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  userTypeEnum = { Player: 0, Team: 1 };
private accountChangeSubscription?: () => void;

  constructor(
    private fb: FormBuilder,
    private blockchainService: BlockchainService,
    private authService: SessionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      walletAddress: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private showSuccessAlert(message: string): void {
    alert(message);
  }


  async ngOnInit(): Promise<void> {

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }

    try {
      await this.blockchainService.getContractReadyPromise();
      const account = this.blockchainService.getAccount();
      if (account)
        {
        this.loginForm.get('walletAddress')?.setValue(account);
      }
       this.setupAccountChangeListener();
    } catch (error) {
      console.error('Failed to initialize blockchain service for login:', error);
      this.errorMessage =
        'Hiba történt a blockchain kapcsolat inicializálásakor.';
    }

    
  }
  private setupAccountChangeListener(): void {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          this.loginForm.get('walletAddress')?.setValue(accounts[0]);
        } else {
      
          this.loginForm.get('walletAddress')?.setValue('');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup funkció mentése
      this.accountChangeSubscription = () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }

  ngOnDestroy(): void {
    // Leiratkozás az eseményről
    if (this.accountChangeSubscription) {
      this.accountChangeSubscription();
    }
  }
  async onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Kérjük, adja meg a MetaMask címet és a jelszót.';
      return;
    }

    const { walletAddress, password } = this.loginForm.value;

    try {
      await this.blockchainService.getContractReadyPromise();
      const passwordHash = await this.blockchainService.hashPassword(password);
      const userData = await this.blockchainService.getUserByAddress(
        walletAddress
      );

      if (userData[3] === passwordHash) {
        const userTypeNumber = Number(userData[1]);
        const entityName = userData[4];

        const timestampBigInt = BigInt(String(userData[5]));
        const timestampMilliseconds = Number(timestampBigInt * 1000n);

        let sessionUser: UserSession = {
          walletAddress: userData[0],
          userType: userTypeNumber,
          email: userData[2],
          registrationTimestamp: new Date(timestampMilliseconds),
          name: entityName,
        };

        if (userTypeNumber === this.userTypeEnum.Team) {
          const teamData = await this.blockchainService.getTeamByName(
            entityName
          );
          sessionUser.foundationYear = Number(teamData[2]); // Biztonságosabb Number()-be tenni
        } else if (userTypeNumber === this.userTypeEnum.Player) {
          // VÁLTOZÁS: Hozzáférés a tulajdonságokhoz név alapján
          const playerData = await this.blockchainService.getPlayerByName(
            entityName
          );
          sessionUser.position = playerData.position;
          sessionUser.teamName = playerData.teamName;
          sessionUser.dateOfBirth = playerData.dateOfBirth; // Az új mező elmentése a session-be
        }

        this.authService.login(sessionUser);
        this.successMessage = 'Sikeres bejelentkezés!';
        this.showSuccessAlert('Sikeres login!');
        this.router.navigate(['/profile']);
        
      } else {
        this.errorMessage = 'Érvénytelen MetaMask cím vagy jelszó.';
      }
    } catch (error: any) {

      console.error('Login failed:',error);

      if (error.message.includes('Execution prevented because the circuit breaker is open')) {
        this.errorMessage = 'Jelentkezzen be a metamaszk fiókjába.';
      } 
      if (error.message.includes('Returned error: Internal JSON-RPC error.')) {
        this.errorMessage = 'Ilyen Metamaszk címmel nincs felhasználó regisztrálva.';
      }
      if (error.message.includes('Returned error: Failed to fetch')) {
        this.errorMessage = 'Nem fut a blokklánc.';
      }
        
      
    }
  }

}