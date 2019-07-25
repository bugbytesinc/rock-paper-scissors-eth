# Rock Paper Scissors Design Patterns

## General Architecture

For simplicity’s sake, this project deferred to the design patterns encouraged 
by the tools as a starting base.  Since the author already knew *Angular*, that
was the choice for the UI framework in browser (realizing that most people will 
choose React in this space, sorry).  Using commands like `truffle init` go a
long way into implementing good practices for the structure of projects and
underlying deployment approaches.  On the user interface side, `ng new` provided
the same structure to setup good patterns and practices.  The structure of the
truffle and angular projects first followed typical conventions expected from
their respective communities.

## Security

The intent of this project was not to produce a encrypt/reveal or submarining
implementation of the Rock Paper Scissors game; but to produce something that
is open to invite clever players to game the platform itself to gain an advantage.
That is why I *DID NOT* implement the withdraw pattern for payouts, instead,
implementing a push approach for payouts (deliberately using send in some cases).
This can lead to some clever attempts in trying to deny the other winning player
of funds.  In many places I followed defensive practices of updating state before
performing `address.transfer` to help defray the chance of a re-entrance attack.
Didn’t want to make it a free-for-all.

## Library

The nature of the game mechanics needed to account for a first-in-first-out queue
of players that happened to submit the same move at close intervals needed to pile
up and wait for other player’s plays to match wins and losses.  Due to time
constraints, I chose to implement the queue as a child contract instead of using
the `using QueueLib for QueueLib.Queue` type of pattern as similarly demonstrated
in https://blog.aragon.org/library-driven-development-in-solidity-2bebcaf88736/
for example.  The choice of using a child contract has worked out well, it would
be interesting to try it as a library instead.

**Please See** the `LibraryDemo.sol` and `TestLibraryDemo.sol` files demonstrating
the use of a contract library with associated tests to meet the project 
requirements since a library project was not leveraged in the main project's
contract.

## Modifiers

The contracts generally follow an owner pattern where certain method calls are
restricted to the owner.  I *DID NOT* implement modifiers in general because I
wanted error messages differ slightly for each revert based upon state and method
being called.  A modifier would have made all error messages of a certain class
be uniform.  Specifically, in the case of owner, this may have been ok to use
a modifier.

## Circuit Breaker

There is a circuit breaker in the game mechanic.  If too many players continue to play
the identical move (say always play `Rock`) without any players to match and resolve
the play rounds, eventually the contract will stop accepting the “opening move” that
is “piling up” in the contract.  This is to keep things from getting too weird and
having too much value tied up in the contract waiting to be paid out.  The actual value
of the maximum number of duplicate plays to queue up is settable by the owner of
the contract.

## Ending the Game

A choice was made to *not* implement `selfdestruct` on the contract but simply set a
flag closing the game, returning un-played bets and allowing the owner to withdraw
the remaining value from the contract.  Once the end flag is set, the contract reverts
any attempts at calling the play method.  This choice was made so that if a player
accidentally calls the contract in a closed state, all they will lose is their gas,
not the whole value transferred as the call.  Destroying the contract would create
a black hole if I understand the docs correctly.  Also if funds are accidentally sent
to the contract, keeping it alive but closed allows the owner to retrieve them.
