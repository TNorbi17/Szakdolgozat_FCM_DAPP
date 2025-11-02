import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SessionService } from './services/blockchain/services/blockchain.service';
import { Footer } from './components/footer/footer';
import { Home } from './components/home/home';
@NgModule({
  declarations: [
    App,
    Footer,
    Home
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
