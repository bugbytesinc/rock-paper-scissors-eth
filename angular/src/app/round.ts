import { Move } from './move';

export interface IRound {
    winner: string;
    move: Move;
    loser: string;
    payout: number;
}
