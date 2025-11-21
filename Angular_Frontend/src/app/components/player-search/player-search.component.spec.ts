import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerSearchComponent } from './player-search.component';
import { Router } from '@angular/router';
import { SessionService } from '../../services/blockchain/services/session.service';
import { BlockchainService } from '../../services/blockchain/services/blockchain.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserType, PlayerPosition } from '../../services/blockchain/models/enums';

describe('PlayerSearchComponent tesztek', () => {
  let component: PlayerSearchComponent;
  let fixture: ComponentFixture<PlayerSearchComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockBlockchainService: jasmine.SpyObj<BlockchainService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSessionService = jasmine.createSpyObj('SessionService', [], {
      currentUserValue: { walletAddress: '0xAAA', userType: UserType.Team, name: 'Teszt Team' }
    });
    mockBlockchainService = jasmine.createSpyObj('BlockchainService', [
      'getContractReadyPromise',
      'getAllPlayers',
      'createTransferOffer'
    ]);

    await TestBed.configureTestingModule({
      declarations: [PlayerSearchComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
        { provide: BlockchainService, useValue: mockBlockchainService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('a komponenst sikeresen létre kell hozni', () => {
    expect(component).toBeTruthy();
  });

  it('calculateAge helyesen számítja ki az életkort', () => {
    const birth = new Date();
    birth.setFullYear(birth.getFullYear() - 25);
    expect(component.calculateAge(birth)).toBe(25);
  });

  it('getPlayerPositionText visszaadja a pozíció nevét', () => {
    expect(component.getPlayerPositionText(PlayerPosition.Attacker)).toBe('Támadó');
    expect(component.getPlayerPositionText(undefined)).toBe('N/A');
  });

  it('applyFilters kiszűri a játékosokat név alapján', () => {
    component.allPlayers = [
      { name: 'Messi', position: 3, dateOfBirth: new Date('1990-01-01'), isFreeAgent: true } as any,
      { name: 'Ronaldo', position: 3, dateOfBirth: new Date('1990-01-01'), isFreeAgent: false } as any
    ];
    component.searchTerm = 'ron';
    component.applyFilters();
    expect(component.filteredPlayers.length).toBe(1);
    expect(component.filteredPlayers[0].name).toBe('Ronaldo');
  });

  it('makeOffer hibát ad, ha nincs kiválasztott játékos', async () => {
    component.selectedPlayer = null;
    await component.makeOffer();
    expect(component.errorMessage).toContain('válasszon ki egy játékost');
  });

  it('makeOffer hibát ad, ha érvénytelen díj van megadva', async () => {
    component.selectedPlayer = { name: 'Messi', walletAddress: '0x123' } as any;
    component.transferFee = null;
    await component.makeOffer();
    expect(component.errorMessage).toContain('érvényes átigazolási díjat');
  });

  it('makeOffer hibát ad, ha lejárati dátum nincs megadva', async () => {
    component.selectedPlayer = { name: 'Messi', walletAddress: '0x123' } as any;
    component.transferFee = 10;
    component.contractExpiresDate = null;
    await component.makeOffer();
    expect(component.errorMessage).toContain('lejárati dátumát');
  });

  it('makeOffer sikeres futás esetén meghívja a blockchainService.createTransferOffer metódust', async () => {
    mockBlockchainService.createTransferOffer.and.returnValue(Promise.resolve());
    mockBlockchainService.getContractReadyPromise.and.returnValue(Promise.resolve());

    component.selectedPlayer = { name: 'Messi', walletAddress: '0x123' } as any;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    component.transferFee = 2;
    component.contractExpiresDate = futureDate.toISOString();

    await component.makeOffer();

    expect(mockBlockchainService.createTransferOffer).toHaveBeenCalled();
    expect(component.successMessage).toContain('Ajánlat sikeresen');
  });
});