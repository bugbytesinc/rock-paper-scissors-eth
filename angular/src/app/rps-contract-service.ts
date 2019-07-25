import { Injectable, Inject, NgZone } from '@angular/core';
import { WEB3 } from './web3.factory';
import Web3 from 'web3';

import contractDefinition from '../../../truffle/build/contracts/RockPaperScissors.json';
import { BehaviorSubject, Observable } from 'rxjs';
import { Move } from './move';
import { IRound } from './round';

@Injectable()
export class RpsContractService {

    public address: string;
    public minimumBet: number;
    public balance$: Observable<number>;
    public openingMove$: Observable<Move>;
    public openingMoveFull$: Observable<boolean>;
    public lastRound$: Observable<IRound>;
    public isWorking$: Observable<boolean>;

    private contract: any;
    private balanceSource = new BehaviorSubject<number>(0);
    private openingMoveSource = new BehaviorSubject<Move>(Move.None);
    private openingMoveFullSource = new BehaviorSubject<boolean>(false);
    private lastRoundSource = new BehaviorSubject<IRound>(null);
    private isWorkingSouce = new BehaviorSubject<boolean>(false);
    private workingCount = 0;

    constructor(@Inject(WEB3) private web3: Web3, private zone: NgZone) {
        this.balance$ = this.balanceSource.asObservable();
        this.openingMove$ = this.openingMoveSource.asObservable();
        this.openingMoveFull$ = this.openingMoveFullSource.asObservable();
        this.lastRound$ = this.lastRoundSource.asObservable();
        this.isWorking$ = this.isWorkingSouce.asObservable();
    }

    async init() {
        const network = await this.web3.version.network;
        this.address = (window['rpsAddresses'] || {})[network];
        if (this.address) {
            this.contract = (this.web3.eth.contract(contractDefinition.abi)).at(this.address);
            this.minimumBet = await this.getMinimumBet();
            this.balanceSource.next(await this.getBalance(this.address));
            this.openingMoveSource.next(await this.getOpeningMove());
            this.contract.WinnerPayout({}, (error, result) => {
                this.zone.run(async () => {
                    this.lastRoundSource.next({
                        winner: result.args.winner,
                        move: <Move>result.args.move.toNumber(),
                        loser: result.args.loser,
                        payout: result.args.payout.toNumber()
                    })
                    this.balanceSource.next(await this.getBalance(this.address));
                    this.openingMoveSource.next(await this.getOpeningMove());
                    this.openingMoveFullSource.next(false);
                });
            });
            this.contract.WinnerForefit({}, (error, result) => {
                this.zone.run(async () => {
                    this.lastRoundSource.next({
                        winner: result.args.winner,
                        move: <Move>result.args.move.toNumber(),
                        loser: result.args.loser,
                        payout: 0
                    })
                    this.balanceSource.next(await this.getBalance(this.address));
                    this.openingMoveSource.next(await this.getOpeningMove());
                    this.openingMoveFullSource.next(false);
                });
            });
            this.contract.OpeningMove({}, (error, result) => {
                this.zone.run(async () => {
                    this.openingMoveSource.next(<Move>result.args.move.toNumber());
                    this.openingMoveFullSource.next(result.args.maxReached);
                });
            });
        }
    }

    async play(move: Move, bet: number): Promise<boolean> {
        let result = false;
        this.workingCount++;
        this.isWorkingSouce.next(true);
        try {
            await this.makePlay(move, bet);
            result = true;
        } catch (ex) {
            console.log(ex);
            const search = "Error: VM Exception while processing transaction: revert ";
            let message = ex.message || 'An Error Occurred with your move.';
            let match = message.indexOf(search);
            if(match > 0) {
                message = message.substring(match+search.length);
            }
            alert(message);
        }
        finally {
            this.isWorkingSouce.next(--this.workingCount !== 0);
            return result;
        }
    }

    private async getMinimumBet(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.contract.minimumBet.call((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.toNumber());
                }
            });
        });
    }

    private async getOpeningMove(): Promise<Move> {
        return new Promise((resolve, reject) => {
            this.contract.openingMove.call((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(<Move>result.toNumber());
                }
            });
        });
    }

    private async getBalance(address: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, (err, balance) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(balance.toNumber());
                }
            });
        });
    }

    private async makePlay(move: Move, bet: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let moveValue = this.web3.toBigNumber(move);
            let betValue = this.web3.toBigNumber(bet);
            this.contract.play(moveValue, { value: betValue }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

export async function initRpsContractService(rps: RpsContractService) {
    await rps.init();
}
