import { Component, OnInit, Inject } from '@angular/core';
import { RpsContractService } from '../rps-contract-service';
import { Move } from '../move';
import Web3 from 'web3';
import { WEB3 } from '../web3.factory';

@Component({
  selector: 'rps-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss']
})
export class GameStatusComponent implements OnInit {
  
  public openingMove = Move.None;
  public openingMoveFull = false;
  public minPayout = 0;
  
  private halfOfMinimumBet = 0;
  
  constructor(@Inject(WEB3) private web3: Web3, private rpsService: RpsContractService) { }

  ngOnInit() {
    this.halfOfMinimumBet = this.rpsService.minimumBet / 2;
    this.rpsService.openingMove$.subscribe(move => this.openingMove = move);
    this.rpsService.openingMoveFull$.subscribe(full => this.openingMoveFull = full);
    this.rpsService.balance$.subscribe(balance => this.minPayout = this.web3.fromWei(Math.floor(balance/2 + this.halfOfMinimumBet),'ether'));
  }

  get openingMoveText() {
    switch(this.openingMove) {
      case Move.None: return "None";
      case Move.Rock: return "Rock";
      case Move.Paper: return "Paper";
      case Move.Scissors: return "Scissors";
    }
    return '';
  }
}
