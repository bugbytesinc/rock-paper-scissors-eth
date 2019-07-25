import { Component, Inject, OnInit } from '@angular/core';
import { WEB3 } from './web3.factory';
import Web3 from 'web3';
import { RpsContractService } from './rps-contract-service';

@Component({
  selector: 'rps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public connectedToWeb3 = false;
  public contractFound = false;

  constructor(@Inject(WEB3) private web3: Web3, private rpsService: RpsContractService) { }

  ngOnInit() {    
    this.connectedToWeb3 = this.web3.isConnected();
    this.contractFound = !!this.rpsService.address;
  }
}