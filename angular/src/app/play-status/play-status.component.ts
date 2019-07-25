import { Component, OnInit, Inject } from '@angular/core';
import { RpsContractService } from '../rps-contract-service';
import { WEB3 } from '../web3.factory';
import Web3 from 'web3';
import { IRound } from '../round';
import { Move } from '../move';
import { WebElement } from 'protractor';

@Component({
  selector: 'rps-play-status',
  templateUrl: './play-status.component.html',
  styleUrls: ['./play-status.component.scss']
})
export class PlayStatusComponent implements OnInit {

  public playerAddress = '';
  public latestStatus: IRound = null;
  public isWinner = false;
  public isLoser = false;

  constructor(@Inject(WEB3) private web3: Web3, private rpsService: RpsContractService) { }

  ngOnInit() {
    this.playerAddress = this.web3.eth.defaultAccount;
    this.rpsService.lastRound$.subscribe( round => {
      this.isWinner = false;
      this.isLoser = false;
      if(round) {
        if(this.playerAddress === round.winner) {
          this.isWinner = true;
        } else if(this.playerAddress == round.loser) {
          this.isLoser = true;
        }
        this.latestStatus = round;  
      }
    });
  }

  get moveText() : string {
    if(this.latestStatus) {
      switch(this.latestStatus.move) {
        case Move.Rock: return "Rock";
        case Move.Paper: return "Paper";
        case Move.Scissors: return "Scissors";
      }
    }
    return '';
  }

  get payout() : number {
    if(this.latestStatus) {
      return this.web3.fromWei(this.latestStatus.payout,'ether');
    }
    return 0;
  }
}
