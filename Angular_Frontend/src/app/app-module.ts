import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing-module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppComponent } from './app.component';
import { SessionService } from './services/blockchain/services/blockchain.service';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { GyikComponent } from './components/gyik/gyik.component';
import { PlayerDashboardComponent } from './components/player-dashboard/player-dashboard.component';
import { PlayerTransferoffersComponent } from './components/player-transferoffers/player-transferoffers.component';
import { PlayerSearchComponent } from './components/player-search/player-search.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { TeamDashboardComponent } from './components/team-dashboard/team-dashboard.component';
import { TeamTranzactionsComponent } from './components/team-tranzactions/team-tranzactions.component';
import { HomeComponent } from './components/home/home.component';
import { PaymentHistoryComponent } from './components/player-payment-history/payment-history.component';
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    GyikComponent,
    PlayerDashboardComponent,
    PlayerTransferoffersComponent,
    PlayerSearchComponent,
    ProfileComponent,
    RegisterComponent,
    TeamDashboardComponent,
    TeamTranzactionsComponent,
    PaymentHistoryComponent
  ],
  imports: [
    BrowserModule,MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    AppRoutingModule,FormsModule,ReactiveFormsModule,MatDialogModule
  ],
  providers: [
   SessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
