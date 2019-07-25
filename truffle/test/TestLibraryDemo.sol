pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/LibraryDemo.sol";

/// @title Unit Tests Exercising the Library Demo Contract
contract TestLibraryDemo {
    /// @title arbitrary total number of units.
    uint private total = 1000000;
    /// @title arbitrary total number of acocunts.
    uint private count = 10;
    /// @title The LibraryDemo contract (system under test)
    LibraryDemo private sut;
    /// @title Create a new LibraryDemo contract before each test.
    /// @notice Called before each test
    function beforeEach() public {
        sut = new LibraryDemo(total, count);
    }
    /// @title Test newly initialized demo object
    /// @notice This test confirms initial balances.
    function testEmptyDemo() public {
        Assert.equal(sut.totalBalance(),total,"Expected total Balance to match Initial Balance.");
        Assert.equal(sut.safeTallyBudgets(),total,"Expected total Balance to match Initial Balance.");
    }
    /// @title Small Unsafe Transfer
    /// @notice This tests a small transfer, one that does not cause an overflow
    /// and therefore does not lose or create money and the tallys at the end match.
    /// This does not leverage the SafeMath library.
    function testSmallUnsafeTransfer() public {
        uint256 amount = 1000;
        sut.unsafeTransfer(amount,0,1);
        Assert.equal(sut.balances(0),total-amount,"Unexpected Balance");
        Assert.equal(sut.balances(1),amount,"Unexpected Balance.");
        Assert.equal(sut.unsafeTallyBudgets(),total,"Tally did not match expected total.");
        Assert.equal(sut.safeTallyBudgets(),total,"Tally did not match expected total.");
    }
    /// @title Large Unsafe Transfer
    /// @notice This tests a large transfer, one that causes overflow and underflow and
    /// corrupts the data, but the transfer method underlying did not use the SafeMath library
    /// and therefore computation continues until the safeTally method is called, which shows
    /// that the SafeMath library causes a revert.
    function testLargeUnsafeTransfer() public {
        bool result;
        uint256 zero = 0;
        uint256 amount = zero - 1000; // Cause overflow to get huge number.
        sut.unsafeTransfer(amount,0,1);
        Assert.equal(sut.balances(0),total-amount,"Unexpected Balance");
        Assert.equal(sut.balances(1),amount,"Unexpected Balance.");
        Assert.equal(sut.unsafeTallyBudgets(),total,"Tally did not match expected total.");
        (result, ) = address(sut).call(abi.encodePacked(sut.safeTallyBudgets.selector));
        Assert.isFalse(result, "safeTallyBudgets should cause a revert");
    }
    /// @title Small Safe Transfer
    /// @notice Perform a small transfer, one that stays within the bounds of the int256
    /// values, safe and unsafe methods execute without issue nor corrupting data.
    function testSmallSafeTransfer() public {
        uint256 amount = 1000;
        sut.safeTransfer(amount,0,1);
        Assert.equal(sut.balances(0),total-amount,"Unexpected Balance");
        Assert.equal(sut.balances(1),amount,"Unexpected Balance.");
        Assert.equal(sut.unsafeTallyBudgets(),total,"Tally did not match expected total.");
        Assert.equal(sut.safeTallyBudgets(),total,"Tally did not match expected total.");
    }
    /// @title Large Safe Transfer
    /// @notice Peform a transfer that is too large for the int256, notice that the
    /// safe transfer method (the one that uses the SafeMath library calls) will not
    /// execute because doing so would cause overflow and undefflow errors.
    function testLargeSafeTransfer() public {
        bool result;
        uint256 zero = 0;
        uint256 amount = zero - 1000; // Cause overflow to get huge number.
        (result,) = address(sut).call(abi.encodePacked(sut.safeTransfer.selector,amount,uint256(0),uint256(1)));
        Assert.isFalse(result, "safeTransfer should cause a revert");
    }
    /// @title Move More Money than Exists
    /// @notice Attempts to move more money than exists in the treasury, this will cause an
    /// undeflow with the treasury's account because it is an unsigned integer, however using
    /// the SafeMath library to peform the debit, the contract reverts without corrupting data.
    function testMoveMoreThanTotalTreasury() public {
        bool result;
        uint256 amount = 2 * total;
        (result,) = address(sut).call(abi.encodePacked(sut.safeTransfer.selector,amount,uint256(0),uint256(1)));
        Assert.isFalse(result, "safeTransfer should cause a revert");
    }
}