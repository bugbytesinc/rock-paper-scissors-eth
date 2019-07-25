pragma solidity ^0.5.0;

import "./BetQueue.sol";
/// @title Rock Paper Scissors DApp Game for fun silliness.
/// @author Jason Fabritz @bugbytesinc
/// @notice Part of the game is to game the system, there
/// is behavior in this contract that would generally be
/// considered a security hole.  (You can't submarine for
/// example, and there are paths that result in transfer
/// failues when actors are deliberately malicous.)
contract RockPaperScissors
{
    /// @title Enumerates the potential play moves.
    /// @dev the 0 value is None which makes a convenient dfault
    enum Move
    {
        None,
        Rock,
        Paper,
        Scissors
    }
    /// @title Winner Payout Event
    /// @notice Emitted when a play resolves with a winner and loser
    /// @param winner the address of the winner
    /// @param move the winning move
    /// @param loser the address of the losing address
    /// @param payout the total ethere paid to the winer, includes their original bet
    event WinnerPayout(address winner, Move move, address loser, uint payout);
    /// @title Winner Forefit Event
    /// @notice Emitted when an attempt to pay a winer fails for whatever reason
    /// @dev This can happen due to a deliberate attack by the winner with a
    /// from a bad acting contract, or it could be from out-of-gas attack.
    /// @param winner the address of the winner
    /// @param move the winning move
    /// @param loser the address of the losing address
    /// @param payout the total ethere paid to the winer, which will always be zero.
    event WinnerForefit(address winner, Move move, address loser, uint payout);
    /// @title Opening Move Event
    /// @notice Emitted when a player makes an opening move (there are no other
    /// moves stored in the contract), or the player makes the same move that is
    /// already been played, in which case the play 'gets in line' for resolution.
    /// The contract will have a limit at which only so many duplicate moves can
    /// be made before the contract reverts further attempts.  The limit will be
    /// indicated by turning the `maxReached` value `true`.  Without plays
    /// resolving, any more duplicate plays will be reverted by the contract.
    /// @dev when `maxReached` returns `false`, the UI can allow additional duplicate
    /// plays.  When it reads `true` the UI should prevent duplicate plays as this
    /// will just waste gas.
    /// @param move The move that was made
    /// @param maxReached a flag indicating the contract will no longer accept
    /// plays with this type of move until pending plays resolve.
    event OpeningMove(Move move, bool maxReached);
    /// @title Refund Failure Occurred
    /// @notice Emitted when the contract is being closed and an attempt to refund
    /// a pending players bet failed.  This can happen if the player is a contract
    /// and ran out of gas, or for other reasons.  Either way, the ether is lost to
    /// the player at that point and must be refunded manually if desired.
    /// @param player address of the player that had the refund reverted.
    /// @param bet the value of the attempted refund.
    event RefundFailure(address player, uint bet);
    /// @title Game is closed for playing, calling `play` will revert.
    /// @notice Emitted when the owner of the contract closes the game and attempts
    /// to refund any unresolved plays.  This effectively shuts down the game.
    /// After the game is closed, the owner my withdraw any remaining funds from the
    /// contract.
    event GameClosed();
    /// @title Owner of the contract.
    /// @notice A number of functions on the contract require authorization from the owner
    address payable private owner;
    /// @title Que of opening moves, first-in-first-out, of unresolved (duplicate) plays.
    /// @dev This is implemented by a child contract for convenience.
    BetQueue private openingMovers;
    /// @title The minimum allowed bet.
    /// @notice All bets must be at least this value for the `play` method to accept the move.
    uint public minimumBet;
    /// @title The current opening move
    /// @notice This represents the opening move of a round.
    /// @dev this is public knowledge, anyone can see what the opening move is.
    Move public openingMove;
    /// @title The contract is open and accepting moves.
    /// @notice when `true` the contract allows playing, once set to `false` no other
    /// plays can be made.
    bool public open;
    /// @title The maximum number of duplicate plays.
    /// @notice The maximum number of duplicate plays that are allowed to queue up
    /// at one time, after which a circuit breaker kicks in and disallows that particular
    /// move until such time as plays have been resolved.
    uint private maxQueueCount;
    /// @title Rock Paper Scissors Contract Constructor
    /// @notice Constructs the contract and initializes the queue.
    /// @param minBet the minimum bet required when making a move by calling `play`.
    constructor(uint minBet) public
    {
        require(minBet>0,'Minimum Bet must be greater than zero.');
        owner = msg.sender;
        openingMove = Move.None;
        openingMovers = new BetQueue();
        minimumBet = minBet;
        open = true;
        maxQueueCount = 20;
    }
    /// @title Payable default function allowing deposits.
    /// @notice Allows anyone to add value to the running balance of the
    /// contract, thus temporarily boosting payouts from wins.
    function() external payable { }
    /// @title Play a move or Rock, Paper or Scissors.
    /// @notice Makes a move of Rock, Paper or Scissors.  The method
    /// is payable and requires a minimum bet indicated by `minimmumBet`.
    /// If the play resolves, a `WinnerPayout` event is emitted, if it
    /// is the first play in a round an `OpeningMove` event will be emitted.
    /// @dev if the queue of unresolved plays equals or exceeds the
    /// `maxQueueCount` the contract call will be reverted.  Also, if the
    /// game is closed, the call will be reverted.  If the bet is lower
    /// than the minimum, the play will be reverted.
    /// @param move The player's move, Rock, Paper, or Scissors.
    /// @return a boolean value, `true` if this play wins, `false` if the
    /// play does not win, or is an opening move.
    function play(Move move) public payable returns (bool isWinner)
    {
        require(open, 'Game is finished.');
        require(msg.value >= minimumBet,'Bet is too low.');
        require(move == Move.Rock || move == Move.Paper || move == Move.Scissors,'Move is invalid.');
        isWinner = false;
        if(openingMove == Move.None)
        {
            openingMove = move;
            openingMovers.enqueue(msg.sender,msg.value);
            emit OpeningMove(openingMove, false);
        }
        else if(move == openingMove)
        {
            require(openingMovers.count() < maxQueueCount, "Too Many Bets of the same type.");
            openingMovers.enqueue(msg.sender,msg.value);
            emit OpeningMove(openingMove, openingMovers.count() >= maxQueueCount);
        }
        else
        {
            (address payable otherPlayer, uint otherBet) = openingMovers.dequeue();
            Move otherMove = openingMove;
            if(openingMovers.isEmpty()) {
                openingMove = Move.None;
            }
            uint payout = (address(this).balance - msg.value - otherBet - openingMovers.totalAmount())/2;
            if((move == Move.Rock && otherMove == Move.Scissors) || (move == Move.Paper && otherMove == Move.Rock) || (move == Move.Scissors && otherMove == Move.Paper))
            {
                isWinner = true;
                payout = payout + msg.value + otherBet / 2;
                emit WinnerPayout(msg.sender, move, otherPlayer, payout);
                // If transfer fails, whole play reverts.
                msg.sender.transfer(payout);
            }
            else
            {
                payout = payout + msg.value/2 + otherBet;
                if(otherPlayer.send(payout)) {
                    emit WinnerPayout(otherPlayer, otherMove, msg.sender, payout);
                } else {
                    // Winner Bad Actor? Loser Out of Gas? Money kept in
                    // running total.  Yes, the loser could be a bad actor
                    // not send enough gas to cause this to happen.
                    // Leave it as part of the skullduggery nature of the game.
                    emit WinnerForefit(otherPlayer, otherMove, msg.sender, payout);
                }
            }
        }
    }
    /// @title Set Maximum Number of Allowed Unresolved Plays
    /// @notice Allows the owner to specifiy the number of unresolved
    /// plays the contract will allow to be held at one time.  Acts as
    /// a circuit breaker against one or many players loading up on one
    /// particular move.
    /// @dev only the owner of the contract may call this function.
    /// @param maxSize the maximum number of plays allowed in the queue.
    function setMaxQueueSize(uint maxSize) external {
        require(owner == msg.sender, 'Access Denied');
        require(maxSize > 0, 'Size must be greater than zero.');
        maxQueueCount = maxSize;
    }
    /// @title Ends the Game
    /// @notice Ends the game, returning any unresolved plays to their
    /// originating addresses, if possible.  If transfers fail, a
    /// `RefundFailure` event will be raised and it will be up to the
    /// owner of the contract to manually resolve any issues.
    /// @dev Only the owner of the contract may call this method.
    function end() external
    {
        require(owner == msg.sender, 'Access Denied');
        require(open, 'Game is already finished.');
        open = false;
        openingMove = Move.None;
        while(!openingMovers.isEmpty())
        {
            (address payable player, uint bet) = openingMovers.dequeue();
            if(!player.send(bet))
            {
                emit RefundFailure(player,bet);
            }
        }
        emit GameClosed();
    }
    /// @title Withdraws any remaining contract ballance.
    /// @notice Sends any remaining contract value to the owner of the
    /// contract.  May only be called after play has been suspened by
    /// calling teh `end()` method.
    /// @dev Only the owner of the contract may call this method, after
    /// the game has been ended.
    function withdraw() external
    {
        require(owner == msg.sender, 'Access Denied');
        require(!open, 'Game is still running.');
        uint balance = address(this).balance;
        if(balance > 0) {
            owner.transfer(balance);
        }
    }
}