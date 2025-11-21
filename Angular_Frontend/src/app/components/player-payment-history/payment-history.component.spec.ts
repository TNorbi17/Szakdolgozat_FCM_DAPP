import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentHistoryComponent } from './payment-history.component';
import { Router } from '@angular/router';
import { SessionService } from '../../services/blockchain/services/session.service';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserType } from '../../services/blockchain/models/enums';

describe('PaymentHistoryComponent (egyszerű teszt)', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockBlockchainService: jasmine.SpyObj<BlockchainService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSessionService = jasmine.createSpyObj('SessionService', [], {
      currentUserValue: { walletAddress: '0xABC', userType: UserType.Player }
    });
    mockBlockchainService = jasmine.createSpyObj('BlockchainService', [
      'getContractReadyPromise',
      'getPlayerPaymentHistory',
      'getPlayerWeeklyPaymentsOnly'
    ]);

    await TestBed.configureTestingModule({
      declarations: [PaymentHistoryComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
        { provide: BlockchainService, useValue: mockBlockchainService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('a komponenst sikeresen létre kell hozni', () => {
    expect(component).toBeTruthy();
  });

  it('calculateStatistics helyesen számol', () => {
    const now = new Date();
    component.paymentHistory = [
      { id: 1, amountEth: 1, paymentTimestamp: now, teamName: 'A' } as any,
      { id: 2, amountEth: 2, paymentTimestamp: now, teamName: 'B' } as any
    ];
    component.weeklyPaymentsOnly = component.paymentHistory;

    component.calculateStatistics();

    expect(component.totalPayments).toBe(2);
    expect(component.totalAmountReceived).toBe(3);
    expect(component.averageWeeklyPayment).toBe(1.5);
    expect(component.lastPaymentDate).toEqual(now);
  });

  it('getPaymentTypeText visszaadja a megfelelő értéket', () => {
    expect(component.getPaymentTypeText('weekly')).toBe('Heti fizetés');
    expect(component.getPaymentTypeText('other')).toBe('Egyéb');
  });
});