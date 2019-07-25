import { Component, OnInit, Inject } from '@angular/core';
import { WEB3 } from '../web3.factory';
import Web3 from 'web3';

@Component({
  selector: 'rps-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.scss']
})
export class WalletInfoComponent implements OnInit {

  public web3version = '';
  public networkName = '';
  public protocolVesion = '';
  public account = '';
  public contractAddress = '';

  constructor(@Inject(WEB3) private web3: Web3) {
  }

  async ngOnInit() {
    this.web3version = this.web3.version.api;
    const id = await this.web3.version.network;
    this.networkName = this.getNetworkName(id);
    this.account = this.web3.eth.defaultAccount;
    if(id) {
      const addresses = window['rpsAddresses'];
      if(addresses) {
        this.contractAddress = addresses[id];
      }      
    }
  }

  private getNetworkName(id: string): string {
    switch (id) {
      case '1': return "Mainnet";
      case '2': return "Morden";
      case '3': return "Ropsten";
      case '4': return "Rinkeby";
      case '42': return "Kovan"
    }
    return "Custom Network " + id;
  }
}
