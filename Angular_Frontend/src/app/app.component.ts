import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  Web3InitService,
  SessionService
} from './services/blockchain/services/blockchain.service';
import { UserSession } from './services/blockchain/models/interfaces';
import { UserType } from './services/blockchain/models/enums';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FCM-DAPP';
  isMenuOpen = false;
  currentUser: UserSession | null = null;
  windowWidth = window.innerWidth;
  userTypeEnum = UserType;

  private currentUserSubscription?: Subscription;
  private readonly MOBILE_BREAKPOINT = 768;

  constructor(
    private authService: SessionService,
    private router: Router,
    private web3InitService: Web3InitService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.web3InitService.initialize();

    this.currentUser = this.authService.currentUserValue;
    this.updateMenuState();

    this.subscribeToUserChanges();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.windowWidth = window.innerWidth;
    this.updateMenuState();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    if (this.isMobileView()) {
      this.isMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private subscribeToUserChanges(): void {
    this.currentUserSubscription = this.authService.currentUser.subscribe(
      (user) => {
        this.currentUser = user;
        this.updateMenuState();
       
      }
    );
  }

  

  private updateMenuState(): void {
    if (!this.isMobileView()) {
      this.isMenuOpen = false;
    }
  }

  private isMobileView(): boolean {
    return this.windowWidth < this.MOBILE_BREAKPOINT;
  }
}