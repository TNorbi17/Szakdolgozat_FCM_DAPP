import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TeamDashboardComponent } from './components/team-dashboard/team-dashboard.component';
import { PlayerSearchComponent } from './components/player-search/player-search.component';
import { PlayerTransferoffersComponent } from './components/player-transferoffers/player-transferoffers.component'; 
import { GyikComponent } from './components/gyik/gyik.component';
import { PlayerDashboardComponent } from './components/player-dashboard/player-dashboard.component';
import { TeamTranzactionsComponent } from './components/team-tranzactions/team-tranzactions.component';
import { authGuard } from './guards/auth-guard';
import { UserType } from './services/blockchain/models/enums';
import { PaymentHistoryComponent } from './components/player-payment-history/payment-history.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'team-dashboard',
    component: TeamDashboardComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Team } 
  },
  {
    path: 'player-search',
    component: PlayerSearchComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Team }
  },
  {
    path: 'app-faq',
    component: GyikComponent,
  },
  {
    path: 'player-notifications',
    component: PlayerTransferoffersComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Player } 
  },
  {
    path: 'tranz',
    component: PlayerDashboardComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Player }
  },
  {
    path: 'tranzcsap',
    component: TeamTranzactionsComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Team } 
  },
  {
    path: 'pmhistory',
    component: PaymentHistoryComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Player }
    
  },
  
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


