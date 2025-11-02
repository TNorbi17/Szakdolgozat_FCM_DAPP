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
    data: { userType: UserType.Team } // Csak csapatoknak
  },
  {
    path: 'app-faq',
    component: GyikComponent,
  },
  {
    path: 'player-notifications',
    component: PlayerTransferoffersComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Player } // Csak játékosoknak
  },
  {
    path: 'tranz',
    component: PlayerDashboardComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Player } // Csak játékosoknak
  },
  {
    path: 'tranzcsap',
    component: TeamTranzactionsComponent,
    canActivate: [authGuard],
    data: { userType: UserType.Team } // Csak játékosoknak
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


