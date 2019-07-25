# Avoiding Common Attacks

It is a bit ironic that this document discusses means to avoid attacks
against the game contract when the game mechanic itself deliberately 
leaves a few openings for skullduggery to see if someone manages to take
advantage of them.  Generally speaking, our best attempt were made at
securing the contract with the above consideration in mind.

## Ownership

Privileged/Administration functions are limited to the original deployer
of the contract.  The contracts do not provide a means to change this
relationship.

## Private Information

While anyone can read the blockchain and determine the value of the private
variables, many variables were still kept private to help keep prying
contracts from having easy access to the values.

## Re-Entrancy

The re-entrancy attack was considered in the design where possible (albeit we
did not use the `withdrawal pattern` for reasons stated in the design patterns
doc.)  Typically all state variables in the contract are updated to their new
values prior to the contract attempting to transfer value (which could result
in a call-back thru an attacking contract instance).  Attempted to implement
the Checks-Effects-Interactions pattern.

## Gas-Limit

Indeed, there are places in this contract where the gas limit could interfere
with a payout.  The most notable situation is where a player can deliberately
submit a losing play, but not provide enough gas to cause the transfer of value
to the other player (the winner) to fail.  This can also be exacerbated if the
winning player is a contract and tries to consume more gas than is allocated
for the transfer.  If either of these two things happen, the contract emits a
WinnerForefit event notifying everyone that the ether was forfeited (not lost,
but returns to the contract and consumed over time by future payouts).

Additionally, the limit on number of queued plays attempts to limit the maximum
gas that could be used to compute the total value stored for uncommitted plays,
the larger the queue, the more gas is needed for the computation.

## Tx-Origin

The contract does not use tx.origin


