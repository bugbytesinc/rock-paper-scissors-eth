pragma solidity ^0.5.0;
/// @title A Queue for Players
/// @author Jason Fabrit @bugbytesinc
/// @notice Implements a helper contract for first-in-first-out
/// queue of players having identical moves.  Tracks the address
/// of the player and their bet.  Pvoides helper methods to the
/// parent contract for reporting the number of players in the
/// queue and the amount of value they have claim of (this is
/// necessary in the computation of the payout.)
contract BetQueue {
    /// @title Associates addresses with amounts
    /// @notice Links an account with their bet, does not need
    /// to contain the `Move` which is managed by the parent 
    /// contract.
    struct Bet {
        address payable player;
        uint amount;
    }
    /// @title Map of indicies to entries
    /// @dev we use a mapping with indices instead
    /// of pushing/popping an array of structs.
    mapping(uint256 => Bet) private queue;
    /// @title The index of the next player to dequeue.
    uint256 private first = 1;
    /// @title The index of the last player ot dequeue.
    uint256 private last = 0;
    /// @title The owner of the contract (parent `RockPaperScissors` contract).
    /// @notice Only the owner of the contract is allowed to change state.
    address owner;
    /// @title Queue Constructor
    /// @notice Captures the owner of the contract, only the owner can change state.
    constructor() public
    {
        owner = msg.sender;
    }
    /// @title Enqueue a Play
    /// @notice Adds a player's play to the end of the queue.
    /// @dev only the owner may call this method.
    /// @param player address of the player
    /// @param amount value of the player's bet
    function enqueue(address payable player, uint amount) public {
        require(msg.sender == owner, 'Access Denied');
        last += 1;
        queue[last] = Bet(player,amount);
    }
    /// @title Dequeus a Play
    /// @notice Removes the oldest play from the queue.
    /// @dev reverts if an attempt is made to deueue when the queue is empty.
    /// Only the owner may call this method.
    /// @return player address fo the player
    /// @return amount the original value of hte player's bet.
    function dequeue() public returns (address payable player, uint amount) {
        require(msg.sender == owner, 'Access Denied');
        require(!isEmpty(),'Queue is empty');
        (player,amount) = (queue[first].player,queue[first].amount);
        delete queue[first];
        first += 1;
        if(last < first) {
            first = 1;
            last = 0;
        }
    }
    /// @title Number of records in the queue.
    /// @dev only the owner may call this method.
    /// @return the number of records in the queue.
    function count() public view returns (uint total) {
        require(msg.sender == owner, 'Access Denied');
        return last - first + 1;
    }
    /// @title Total value of bets from players in queue.
    /// @notice Enumerates the players in the queu and returns the
    /// sum of the value of all the bets associated with the players.
    /// @dev only the owner may call this method.
    /// @return total the total value of the bets for the players contained
    /// within this queue.
    function totalAmount() public view returns (uint total)
    {
        require(msg.sender == owner, 'Access Denied');
        total = 0;
        for(uint i = first; i <= last; i ++ ) {
            total = total + queue[i].amount;
        }
    }
    /// @title Is Empty
    /// @notice Returns `true` if the queue is empty, has no players.
    /// @dev only the owner may call this method.
    /// @return `true` if there are no players in the queue, `false` if
    /// there are one or more.
    function isEmpty() public view returns (bool) {
        require(msg.sender == owner, 'Access Denied');
        return last < first;
    }
}