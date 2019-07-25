# Rock Paper Scissor Game Scenarios

A Rock Paper Scissors Ethereum DApp Game for fun and silliness.

The idea behind this project is to place yet another implementation of the classic
Rock, Paper, Scissors game onto the blockchain.  To add to the intrigue, players
must ante a minimum bet with their play.  If they win the round, they receive half
of the losing players ante plus some extra ether from the contract (in addition to
refunding their ante).  If they lose, they get nothing.  The game is done in the open,
there is no hide/reveal pattern; this creates a potential race condition which adds
intrigue to the game to see who can craft plays that get mined to the players advantage.

There are basically two classes of users of this system:  *Players* and (one) *Administrator* (per contract).

## Players

There is only one state changing interaction a player can perform with the system,
and that’s placing a bet.  The Player chooses which move to make (Rock, Paper, or Scissors)
plus the amount to wager (subject to a minimum amount specified by the contract) and submits
that transaction to the system.  After submission, one of three things happen: win, lose, wait.

#### Winning

If another player has submitted their play ahead in time to the current player; and the current
player’s play beats the previous player’s play, the current player wins.  They receive their
bet back, half of the losing player’s bet and a portion of the remaining balance in the contract.

#### Losing

Opposite of above, if the player submits a play after that happens to be a losing move relative
to the previous move, the player receives nothing outside of a notification from the system they lost.

#### Wait

If the player is the “first” to move, then they wait for another player to submit a move, they
could either win or lose depending how blocks are mined.  Also, if they happen to play a move
identical to the “first” move already recorded by the system, they get in line behind that first
move and wait for the game ahead in priority to theirs to be settled before their move is considered.

### Play Scenario

Players can play by two means: by using the a web interface or interacting with the contract directly.
Calling the contract directly (the `play` method) is outside the scope of this document, we will
briefly touch on the web interface.  It is the intent to make interacting as easy as possible.
It is desired to create a web single page application that interacts with `MetaMask` and submits
plays directly to the network.  The steps should be roughly as follows:

* User goes to website supporting the game.
* Website asks user for permission to connect with MetaMask
* User approves the connection.
* Website looks up network (from MetaMask) to map to a contract address
* If successful, the site presents a user interface to user (or an error describing why it can’t connect to a contract):
  * The page contains three big buttons, each representing a play: Rock, Paper or Scissors
  * Also presents an input box for the ante, defaulted to the minimum amount specified by the contract.
  * It should also include information displaying whether or not an Initial play has been made (or if the system is waiting for that first play)
  * Also, other information should be displayed such as contract address details, user account’s address, network versions etc.
* The user decides how much to wager and enters the value in ether in the input box.
* The user then decides which play to make and clicks on the appropriate button
* `MetaMask` should then pop up to confirm the user whishes to submit the play transaction to the network.
* Assuming the user approves; the user interface updates and waits for confirmation of the transaction.
* After the play is resolved by the miner, the user interface updates with the disposition of the play attempt.

As an aside, the user interface should listen to other contract events and adjust as appropriate.

## Administrator

The administrator (or owner) of the contract has more control over the workings of the contract,
they should be able to:

* Create new RockPaperScissor contracts (they become the owner).
* Set the maximum limit on how many identical plays can be stacked.
* Terminate game play, returning balances to unresolved plays by other players.
* Withdraw the remainder contract balance after game play has been terminated.

Since the administrator/owner is assumed to be an advanced user, we will not, at this time, create a web user interface 
to support these functions thru MetaMask.  The owner of the contract can call the appropriate methods 
on the contract directly using blockchain client tools at their disposal.
