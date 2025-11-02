import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SessionService } from './services/blockchain/services/blockchain.service';
import { Footer } from './components/footer/footer.component';
import { Home } from './components/home/home.component';
import { Login } from './components/login/login';
import { Gyik } from './components/gyik/gyik';
import { PlayerDashboard } from './components/player-dashboard/player-dashboard';
import { PlayerTransferoffers } from './components/player-transferoffers/player-transferoffers';
import { PlayerSearch } from './components/player-search/player-search';
import { Profile } from './components/profile/profile';
import { Register } from './components/register/register';
import { TeamDashboard } from './components/team-dashboard/team-dashboard';
import { TeamTranzactions } from './components/team-tranzactions/team-tranzactions';
import { LoginComponent } from './components/login/login.component';
import { GyikComponent } from './components/gyik/gyik.component';
import { PlayerDashboardComponent } from './components/player-dashboard/player-dashboard.component';
import { PlayerTransferoffersComponent } from './components/player-transferoffers/player-transferoffers.component';
import { PlayerSearchComponent } from './components/player-search/player-search.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { TeamDashboardComponent } from './components/team-dashboard/team-dashboard.component';
import { TeamTranzactionsComponent } from './components/team-tranzactions/team-tranzactions.component';
@NgModule({
  declarations: [
    App,
    Footer,
    Home,
    Login,
    Gyik,
    PlayerDashboard,
    PlayerTransferoffers,
    PlayerSearch,
    Profile,
    Register,
    TeamDashboard,
    TeamTranzactions,
    LoginComponent,
    GyikComponent,
    PlayerDashboardComponent,
    PlayerTransferoffersComponent,
    PlayerSearchComponent,
    ProfileComponent,
    RegisterComponent,
    TeamDashboardComponent,
    TeamTranzactionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
   SessionService
  ],
  bootstrap: [App]
})
export class AppModule { }
