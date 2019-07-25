pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/RockPaperScissors.sol";

/// @title RockPaperScissors Tests
/// @notice Provides some tests along side the JavaScript
/// for testing the behavior of the `RockPaperScissors` Contract.
contract TestRockPaperScissors {
    /// @title Contract instance being tested.
    RockPaperScissors rps;
    /// @title Initial Balance given to this testing Contract
    uint public initialBalance = 1000000000;
    /// @title Minimum Bet sent into the constructor.
    uint minimumBet = 1000;
    /// @title Default Payable Function
    /// @notice since this contract receives "wins" from the RPS contact
    /// it must implement a default payable function.
    function () external payable {}
    /// @title Test Setup
    /// @notice Creates a new contract to test before each test.
    function beforeEach() public {
        rps = new RockPaperScissors(minimumBet);
    }
    /// @title Minimum Bet is Exposed
    /// @notice Ensure the contract exposes the proper minimum bet value.
    function testMinBet() public {
        uint rpsMinimumBet = rps.minimumBet();
        Assert.equal(rpsMinimumBet,minimumBet,"Minimum Bet did not match expected value.");
    }
    /// @title Opening Move is None
    /// @notice Ensure a new contract starts with an opening move of `None`.
    function testOpeningMoveWhenEmpty() public {
        uint openingMove = uint(rps.openingMove());
        Assert.equal(openingMove,0,"Expected an opening move of none.");
    }
    /// @title Playable Contract expoese 'open'.
    /// @notice Ensure a contract returns `true` for `open()` when it is new.
    function testInitialOpenValue() public {
        bool isOpen = rps.open();
        Assert.equal(isOpen,true,"Minimum Bet did not match expected value.");
    }
    /// @title Play games in quick sucession
    /// @notice Check the return values from various plays for expected wins/loss return values.
    function testPlayScenario() public {
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Rock),false,"Opening Move should return false");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Rock),false,"Duplicate move does not win");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),true,"Paper Beats Rock");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Scissors),false,"Scissors Looses to Rock");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Scissors),false,"Initial Play Scissors");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Rock),true,"Rock Beats Scissors");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),false,"Initial Play Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),false,"Duplicate Play Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),false,"Duplicate Play Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),false,"Duplicate Play Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Paper),false,"Rock Loses to Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Scissors),true,"Scissors Beats Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Scissors),true,"Scissors Beats Paper");
        Assert.equal(rps.play.value(minimumBet)(RockPaperScissors.Move.Scissors),true,"Scissors Beats Paper");
    }
}