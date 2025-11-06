import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/blockchain/services/session.service';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';
import { UserSession, PaymentHistory } from '../../services/blockchain/models/interfaces';
import { UserType } from '../../services/blockchain/models/enums';

@Component({
  selector: 'app-payment-history',
  standalone: false,
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  currentUser: UserSession | null = null;
  paymentHistory: PaymentHistory[] = [];
  weeklyPaymentsOnly: PaymentHistory[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  showOnlyWeekly: boolean = false;
  sortBy: 'date' | 'amount' | 'team' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  totalPayments: number = 0;
  totalAmountReceived: number = 0;
  averageWeeklyPayment: number = 0;
  lastPaymentDate: Date | null = null;

  constructor(
    private sessionService: SessionService,
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = this.sessionService.currentUserValue;

    if (!this.currentUser || this.currentUser.userType !== UserType.Player) {
      this.errorMessage = 'Ez az oldal csak játékosok számára érhető el.';
      this.router.navigate(['/profile']);
      return;
    }

    try {
      await this.blockchainService.getContractReadyPromise();
      await this.loadPaymentHistory();
      this.calculateStatistics();
    } catch (error: any) {
      console.error('Hiba a fizetési előzmények betöltésekor:', error);
      this.errorMessage = `Nem sikerült betölteni a fizetési előzményeket: ${
        error.message || error.toString()
      }`;
    } finally {
      this.isLoading = false;
    }
  }

  async loadPaymentHistory(): Promise<void> {
    if (!this.currentUser?.walletAddress) return;

    try {
      this.paymentHistory = await this.blockchainService.getPlayerPaymentHistory(
        this.currentUser.walletAddress
      );
      
      this.weeklyPaymentsOnly = await this.blockchainService.getPlayerWeeklyPaymentsOnly(
        this.currentUser.walletAddress
      );
      
      this.sortPayments();
    } catch (error) {
      console.error('Error loading payment history:', error);
      throw error;
    }
  }

  getDisplayedPayments(): PaymentHistory[] {
    return this.showOnlyWeekly ? this.weeklyPaymentsOnly : this.paymentHistory;
  }

  sortPayments(): void {
    const payments = this.getDisplayedPayments();
    
    payments.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = a.paymentTimestamp.getTime() - b.paymentTimestamp.getTime();
          break;
        case 'amount':
          comparison = a.amountEth - b.amountEth;
          break;
        case 'team':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  changeSorting(newSortBy: 'date' | 'amount' | 'team'): void {
    if (this.sortBy === newSortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = newSortBy;
      this.sortDirection = 'desc';
    }
    this.sortPayments();
  }

  togglePaymentFilter(): void {
    this.showOnlyWeekly = !this.showOnlyWeekly;
    this.sortPayments();
    this.calculateStatistics();
  }

  calculateStatistics(): void {
    const payments = this.getDisplayedPayments();
    
    this.totalPayments = payments.length;
    this.totalAmountReceived = payments.reduce((sum, payment) => sum + payment.amountEth, 0);
    
    if (this.weeklyPaymentsOnly.length > 0) {
      this.averageWeeklyPayment = this.weeklyPaymentsOnly.reduce(
        (sum, payment) => sum + payment.amountEth, 0
      ) / this.weeklyPaymentsOnly.length;
      
      this.lastPaymentDate = this.weeklyPaymentsOnly
        .sort((a, b) => b.paymentTimestamp.getTime() - a.paymentTimestamp.getTime())[0]
        ?.paymentTimestamp || null;
    }
  }



  getPaymentTypeText(paymentType: string): string {
    switch (paymentType) {
      case 'weekly': return 'Heti fizetés';
      default: return 'Egyéb';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  trackByPaymentId(index: number, payment: PaymentHistory): number {
    return payment.id;
  }
}