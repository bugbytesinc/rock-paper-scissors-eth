pragma solidity ^0.5.0;

/// @title An abbrievated Safe Math library
/// @notice Borrowed SafeMath methods from zepplin project:
/// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol
library SafeMath {
    /// @title Safe Subtraction
    /// @notice perfoms a subtraction that catches undeflow errors and reverts.
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }
    /// @title Safe Addition
    /// @notice performs an addition of two uints that catches overflow errors and reverts.
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
}
/// @title Demo Contract using a Library Contract
/// @notice Demonstrates some safe and unsafe math transactions
/// via using or not using a math library.
contract LibraryDemo {
    // Reference the SafeMath library defined above
    using SafeMath for uint256;

    /// @title the total balance of the treasury, shoudl match the sum of accounts
    uint256 public totalBalance;
    /// @title total number of accounts held by the contract
    uint256 public accounts;
    /// @title individual balances for accounts
    mapping(uint256 => uint256) public balances;
    /// @title constructor, sets up the intial balance
    /// @param initialBalance the total supply of currency
    constructor(uint256 initialBalance, uint256 initialAccountCount) public {
        // Account 0 is the treasury, receives all of initial balance
        accounts = initialAccountCount;
        balances[0] = totalBalance = initialBalance;
    }
    /// @title perform an unprotected transfer of funds
    /// @notice performs an unprotected transfer, over/underflow will not be caught.
    function unsafeTransfer( uint256 amount, uint256 from, uint256 to) public {
        require(from < accounts, "From Account is invalid.");
        require(to < accounts, "To Account is invalid.");
        balances[from] -= amount;
        balances[to] += amount;
    }
    /// @title perform an protectedtransfer of funds
    /// @notice performs an transfer where over/underflow will cause a revert
    /// This uses the functions referenced by the library and are not part of
    /// this contract proper.
    function safeTransfer(uint256 amount, uint256 from, uint256 to) public {
        require(from < accounts, "From Account is invalid.");
        require(to < accounts, "To Account is invalid.");
        balances[from] = balances[from].sub(amount);
        balances[to] = balances[to].add(amount);
    }
    /// @title tally the sums in all the budgets (without checking for overflow)
    /// @notice this is useful in an audit to confirm all the coins
    /// are accounted for and none have been generated out of thin air.
    function unsafeTallyBudgets() public view returns (uint256) {
        uint256 total = 0;
        for(uint i = 0; i < accounts; i ++ ) {
            total = total += balances[i];
        }
        return total;
    }
    /// @title tally the sums in all the budgets (safely checking for overflow)
    /// @notice this is useful in an audit to confirm all the coins
    /// are accounted for and none have been generated out of thin air.
    function safeTallyBudgets() public view returns (uint256) {
        uint256 total = 0;
        for(uint i = 0; i < accounts; i ++ ) {
            total = total.add(balances[i]);
        }
        return total;
    }
}