import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import Web3 from 'web3';

import { AppComponent } from './app.component';
import { WEB3, provideWeb3, initWeb3 } from './web3.factory';
import { WalletInfoComponent } from './wallet-info/wallet-info.component';
import { initRpsContractService, RpsContractService } from './rps-contract-service';
import { GameStatusComponent } from './game-status/game-status.component';
import { PlayMakerComponent } from './play-maker/play-maker.component';
import { PlayStatusComponent } from './play-status/play-status.component';

export function initializeServices(web3: Web3, rps: RpsContractService) {
  return async () => {
    await initWeb3(web3);
    await initRpsContractService(rps);
  };
}

@NgModule({
  declarations: [
    AppComponent,
    WalletInfoComponent,
    GameStatusComponent,
    PlayMakerComponent,
    PlayStatusComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    RpsContractService,
    { provide: WEB3, useFactory: provideWeb3 },
    { provide: APP_INITIALIZER, useFactory: initializeServices, deps: [WEB3, RpsContractService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
