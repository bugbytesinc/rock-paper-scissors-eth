import { Component, OnInit, Inject } from '@angular/core';
import { RpsContractService } from '../rps-contract-service';
import { Move } from '../move';
import Web3 from 'web3';
import { WEB3 } from '../web3.factory';

@Component({
  selector: 'rps-play-maker',
  templateUrl: './play-maker.component.html',
  styleUrls: ['./play-maker.component.scss']
})
export class PlayMakerComponent implements OnInit {

  public minBet: number = 0;
  public bet: number = 0;
  public processing = false;
  public validInput = true;
  constructor(@Inject(WEB3) private web3: Web3, private rpsService: RpsContractService) { }

  ngOnInit() {
    this.bet = this.minBet = this.web3.fromWei(this.rpsService.minimumBet, 'ether');
    this.rpsService.isWorking$.subscribe(w => this.processing = w);
  }

  onBetChanged(value) {
    this.bet = parseFloat(value);
    this.validInput = this.bet >= this.minBet;
  }

  playRock() {
    if (this.validInput && !this.processing) {
      this.rpsService.play(Move.Rock, this.web3.toWei(this.bet, 'ether'));
    }
  }

  playPaper() {
    if (this.validInput && !this.processing) {
      this.rpsService.play(Move.Paper, this.web3.toWei(this.bet, 'ether'));
    }
  }

  playScissors() {
    if (this.validInput && !this.processing) {
      this.rpsService.play(Move.Scissors, this.web3.toWei(this.bet, 'ether'));
    }
  }
}
