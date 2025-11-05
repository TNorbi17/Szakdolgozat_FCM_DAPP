import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockchainService,SessionService } from '../../services/blockchain/services/blockchain.service';
type UserType = 'player' | 'team';
interface RegistrationFormData {
  userType: UserType;
  email: string;
  password: string;
  confirmPassword: string;
  teamName?: string;
  foundationYear?: number;
  playerName?: string;
  position?: number;
  dateOfBirth?: string;
  walletAddress: string;
}
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
    
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  userType: UserType = 'player';
  errorMessage = '';
  currentAccount?: string;

  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly MIN_FOUNDATION_YEAR = 1800;

  constructor(
    private fb: FormBuilder,
    private blockchainService: BlockchainService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.registrationForm = this.createForm();
  }

  async ngOnInit(): Promise<void> {
    if (this.sessionService.isLoggedIn()) {
      await this.router.navigate(['/profile']);
      return;
    }

    await this.initializeBlockchain();
    this.setupUserTypeListener();
    this.toggleValidators();
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        userType: ['player'],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)],
        ],
        confirmPassword: ['', Validators.required],
        teamName: [''],
        foundationYear: [''],
        playerName: [''],
        position: [null],
        dateOfBirth: [''],
        walletAddress: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private async initializeBlockchain(): Promise<void> {
    try {
      await this.blockchainService.getContractReadyPromise();
      this.currentAccount = this.blockchainService.getAccount();

      if (this.currentAccount) {
        this.registrationForm.patchValue({
          walletAddress: this.currentAccount,
        });
      }
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      this.errorMessage =
        'Hiba történt a blockchain kapcsolat inicializálásakor.';
    }
  }

  private setupUserTypeListener(): void {
    this.registrationForm
      .get('userType')
      ?.valueChanges.subscribe((value: UserType) => {
        this.userType = value;
        this.toggleValidators();
      });
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private toggleValidators(): void {
    const controls = {
      teamName: this.registrationForm.get('teamName'),
      foundationYear: this.registrationForm.get('foundationYear'),
      playerName: this.registrationForm.get('playerName'),
      position: this.registrationForm.get('position'),
      dateOfBirth: this.registrationForm.get('dateOfBirth'),
    };

    if (this.userType === 'team') {
      this.setTeamValidators(controls);
    } else {
      this.setPlayerValidators(controls);
    }

    Object.values(controls).forEach(control =>
      control?.updateValueAndValidity()
    );
  }

  private setTeamValidators(controls: Record<string, any>): void {
    controls['teamName']?.setValidators([Validators.required]);
    controls['foundationYear']?.setValidators([
      Validators.required,
      Validators.min(this.MIN_FOUNDATION_YEAR),
      Validators.max(new Date().getFullYear()),
    ]);
    controls['playerName']?.clearValidators();
    controls['position']?.clearValidators();
    controls['dateOfBirth']?.clearValidators();
  }

  private setPlayerValidators(controls: Record<string, any>): void {
    controls['playerName']?.setValidators([Validators.required]);
    controls['position']?.setValidators([Validators.required]);
    controls['dateOfBirth']?.setValidators([Validators.required]);
    controls['teamName']?.clearValidators();
    controls['foundationYear']?.clearValidators();
  }

  async onSubmit(): Promise<void> {
    this.clearMessages();

    if (!this.validateForm()) {
      return;
    }

    const formData: RegistrationFormData = this.registrationForm.value;

    try {
      await this.performRegistration(formData);
      this.showSuccessAlert('Sikeres regisztráció!');
      await this.handleSuccessfulNavigation();
    } catch (error: any) {
     
      this.handleRegistrationError(error);
    }
  }

  private clearMessages(): void {
    this.errorMessage = '';
    
  }

  private validateForm(): boolean {
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Kérjük, ellenőrizze az űrlap adatait.';
      this.logFormErrors();
      return false;
    }
    return true;
  }

  private logFormErrors(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const controlErrors = this.registrationForm.get(key)?.errors;
      if (controlErrors) {
        console.error(`${key} errors:`, controlErrors);
      }
    });
  }

  private async performRegistration(
    formData: RegistrationFormData
  ): Promise<void> {
    await this.blockchainService.getContractReadyPromise();
    console.log('Blockchain service ready for registration...');

    const passwordHash = await this.blockchainService.hashPassword(
      formData.password
    );

    if (this.userType === 'team') {
      await this.registerTeam(formData, passwordHash);
    } else {
      await this.registerPlayer(formData, passwordHash);
    }
  }

  private async registerTeam(
    formData: RegistrationFormData,
    passwordHash: string
  ): Promise<void> {
    await this.blockchainService.registerTeam(
      formData.teamName!,
      formData.foundationYear!,
      formData.email,
      passwordHash,
      formData.walletAddress
    );
    
  }

  private async registerPlayer(
    formData: RegistrationFormData,
    passwordHash: string
  ): Promise<void> {
    const dateOfBirthTimestamp = this.convertDateToTimestamp(
      formData.dateOfBirth!
    );

    await this.blockchainService.registerPlayer(
      formData.playerName!,
      formData.position!,
      dateOfBirthTimestamp,
      formData.email,
      passwordHash,
      formData.walletAddress
    );
  
  }

  private convertDateToTimestamp(date: string): number {
    return Math.floor(new Date(date).getTime() / 1000);
  }


  private async handleSuccessfulNavigation(): Promise<void> {
    await this.router.navigate(['/login']);
  }

  private showSuccessAlert(message: string): void {
    alert(message);
  }
  private showError(message: string): void {
    alert(message);
  }



  private handleRegistrationError(error: any): void {

 if (error.message.includes('execution reverted')) {
    const reason = this.extractRevertReason(error.message);
    if (reason.includes('Wallet address already registered')) {
      this.showError('Ez a MetaMask cím már regisztrált.');
    } else if (reason.includes('Email already taken')) {
      this.showError('Ez az e-mail cím már regisztrált.');
    } else if (reason.includes('Internal JSON-RPC error')) {
      this.showError('Ez a csapatnév már foglalt.');
    } else if (reason.includes('Player name already taken')) {
      this.showError('Ez a játékosnév már foglalt.');
    } else {
    
      this.showError(reason);
    }
  } else {
    
    this.showError('Regisztráció sikertelen. Próbálja újra később.');
    
  } 
  }

  private extractRevertReason(errorMessage: string): string {
    const match = errorMessage.match(/reverted with reason string '([^']*)'/);
    return match?.[1]
      ? `Regisztráció sikertelen: ${match[1]}`
      : 'Regisztráció sikertelen: Egyéb blokklánc hiba történt.';
  }
}