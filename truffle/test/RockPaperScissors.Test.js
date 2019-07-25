var RockPaperScissors = artifacts.require("./RockPaperScissors.sol")
let { catchRevert, catchInvalidOpcode } = require("./exceptionsHelpers.js");

const asBN = web3.utils.toBN;
const getBalance = async (account) => asBN(await web3.eth.getBalance(account));
const getGas = async (receipt) => asBN(receipt.receipt.gasUsed).mul(asBN((await web3.eth.getTransaction(receipt.tx)).gasPrice));
/**
 * General tests for the RockPaperScissors unit tests.
 */
contract('RockPaperScissors', function(accounts) {

    const owner = accounts[0];  // Contract Owner Account
    const alice = accounts[1];  // Player 'Alice'
    const bob = accounts[2];    // Player 'Bob'

    // BigNumber representations matching the Move enumeration used for ABI communcation
    const moves = {             
        none: asBN(0),
        rock: asBN(1),
        paper: asBN(2),
        Scissors: asBN(3)
    }
    
    const minBet = asBN(1000000); // Minimum Bet for testing purposes
    let instance;                 // Instance of the contract to test

    /**
     * Before each test, instantiate the contract.
     */
    beforeEach(async () => {
        instance = await RockPaperScissors.new(minBet,{from: owner});
    });
    /**
     * Generally test view functions.
     */
    describe("public contract information", async() => {
        /**
         * Minimum bet should be visible and match what was passed in in the constructor.
         */
        it('should expose the minimum bet', async()=>{
            const contractMinBet = await instance.minimumBet();
            assert.equal(minBet.toString(),contractMinBet,'minimum bet value does not match constructor.');
        });
        /**
         * Test opening move matches Rock when played.
         */
        it('should expose the opening Rock move', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const openingMove = await instance.openingMove()
            assert.equal(openingMove.toString(),moves.rock.toString(),'Did not expose opening move Rock');
        });
        /**
         * Test opening move matches Paper when played.
         */
        it('should expose the opening Paper move', async()=>{
            await instance.play(moves.paper,{from: alice, value: minBet});
            const openingMove = await instance.openingMove()
            assert.equal(openingMove.toString(),moves.paper.toString(),'Did not expose opening move Rock');
        });
        /**
         * Test Opening Move mastches Scissors when played.
         */
        it('should expose the opening Scissors move', async()=>{
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            const openingMove = await instance.openingMove()
            assert.equal(openingMove.toString(),moves.Scissors.toString(),'Did not expose opening move Rock');
        });
        /**
         * Newly created contracts should be 'open'.
         */
        it('should expose the open status', async()=>{
            const isOpen = await instance.open()
            assert.equal(isOpen,true,'Expected an open state for newly created.');
        });
        /**
         * After closing a RPS contract, `open` should return `false`.
         */
        it('open status is false after ended', async()=>{
            await instance.end();
            const isOpen = await instance.open()
            assert.equal(isOpen,false,'Expected a closed state after end is called.');
        });
    })
    /**
     * Generally test events emitted for opening moves.
     */
    describe("initial moves", async() => {
        /**
         * Ensure Opening Move for Rock emits properly.
         */
        it('should emit the opening Rock move', async()=>{
            const tx = await instance.play(moves.rock,{from: alice, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.rock.toString(),'The Event argument move should be Rock');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });
        /**
         * Ensure Opening Move for Paper emits properly.
         */
        it('should emit the opening Paper move', async()=>{
            const tx = await instance.play(moves.paper,{from: alice, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.paper.toString(),'The Event argument move should be Paper');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });
        /**
         * Ensure Opening Move for Scissors emits properly.
         */
        it('should emit the opening Scissors move', async()=>{
            const tx = await instance.play(moves.Scissors,{from: alice, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.Scissors.toString(),'The Event argument move should be Scissors');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });    
        /**
         * Invalid moves are reverted
         */
        it('should revert for invalid Move of None', async()=>{
            const error = await catchRevert(instance.play(moves.none,{from: alice, value: minBet}));
            assert.equal(error.reason,'Move is invalid.','Unexpected Revert Message');
        });
        /**
         * Invalid moves outside of the Move enum revert too.
         */
        it('should throw invalid opcode for invalid Move value', async()=>{
            await catchInvalidOpcode(instance.play(asBN(4),{from: alice, value: minBet}));
        });
        /**
         * Opening moves do not win, so `play` should return false.
         */
        it('should return false (because did not win)', async()=>{
            const result = await instance.play.call(moves.rock,{from: alice, value: minBet});
            assert.equal(result,false,'Opening Move should return false because it did not "win".');
        });
    });
    /**
     * Generally test duplicate moves.
     */
    describe("duplicate moves", async() => {    
        /**
         * Duplicate Rock move still emits proper opening move event.
         */
        it('should emit the opening Rock move for duplicate entry', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const tx = await instance.play(moves.rock,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.rock.toString(),'The Event argument move should be Rock');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });
        /**
         * Duplicate Paper move still emits proper opening move event.
         */
        it('should emit the opening Paper move for duplicate entry', async()=>{
            await instance.play(moves.paper,{from: alice, value: minBet});
            const tx = await instance.play(moves.paper,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.paper.toString(),'The Event argument move should be Paper');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });
        /**
         * Duplicate Scissors move still emits proper opening move event.
         */
        it('should emit the opening Scissors move for duplicate entry', async()=>{
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            const tx = await instance.play(moves.Scissors,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.Scissors.toString(),'The Event argument move should be Scissors');
            assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
        });    
        /**
         * Duplicate move by its nature does not win, so method should return false.
         */
        it('second opening/duplicate move returns false (because did not win)', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const result = await instance.play.call(moves.rock,{from: bob, value: minBet});
            assert.equal(result,false,'Second opening/duplicate move should return false because it did not "win".');
        });
        /**
         * Test the limits of the circuit breaker (default settings) that prevents too many
         * moves of the same type from piling up.
         */
        it('should fail duplicate play after default maximum has been reached', async()=>{
            for(let i = 0; i < 19; i ++ ) {
                const tx = await instance.play(moves.Scissors,{from: alice, value: minBet});
                const event = tx.receipt.logs[0];
                assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
            }
            // 20th Time, Event should indicate queue is full
            const tx = await instance.play(moves.Scissors,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'OpeningMove','Name of Event should be OpeningMove');
            assert.equal(event.args.move.toString(),moves.Scissors.toString(),'The Event argument move should be Scissors');
            assert.equal(event.args.maxReached,true,'The Event Argument should indicate max has not been reached yet.')
            // 21st Time, should fail.
            const error = await catchRevert(instance.play(moves.Scissors,{from: bob, value: minBet}));
            assert.equal(error.reason,'Too Many Bets of the same type.','Unexpected Revert Message');
        });    
        /**
         * Test the limits of the circuit breaker with a custom setting set by owner that prevents too many
         * moves of the same type from piling up.
         */
        it('should fail duplicate play after default maximum has been reached', async()=>{
            const testCount = 10;
            await instance.setMaxQueueSize(testCount);
            for(let i = 0; i < testCount-1; i ++ ) {
                const tx = await instance.play(moves.Scissors,{from: alice, value: minBet});
                const event = tx.receipt.logs[0];
                assert.equal(event.args.maxReached,false,'The Event Argument should indicate max has not been reached yet.')
            }
            // Event should indicate queue is full
            const tx = await instance.play(moves.Scissors,{from: bob, value: minBet});
            const event = tx.receipt.logs[0];
            assert.equal(event.args.maxReached,true,'The Event Argument should indicate max has not been reached yet.')
            // Over Filled, should fail.
            const error = await catchRevert(instance.play(moves.Scissors,{from: bob, value: minBet}));
            assert.equal(error.reason,'Too Many Bets of the same type.','Unexpected Revert Message');
        });    
    });
    /**
     * Check the general game mechanics, which move beats which move.
     */
    describe("game mechanics", async() => {
        /**
         * Rock beats Scisssors
         */
        it('rock beats Scissors', async()=>{
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            const result = await instance.play.call(moves.rock,{from: bob, value: minBet});
            assert.equal(result,true,'Rock should beat Scissors.');
        });
        /**
         * Rock loses to paper.
         */
        it('rock loses to paper', async()=>{
            await instance.play(moves.paper,{from: alice, value: minBet});
            const result = await instance.play.call(moves.rock,{from: bob, value: minBet});
            assert.equal(result,false,'Rock should loose to paper.');
        });
        /**
         * Paper beats Rock
         */
        it('paper beats rock', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const result = await instance.play.call(moves.paper,{from: bob, value: minBet});
            assert.equal(result,true,'Paper should beat rock.');
        });
        /**
         * Paper loses to Scissors
         */
        it('paper loses to Scissors', async()=>{
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            const result = await instance.play.call(moves.paper,{from: bob, value: minBet});
            assert.equal(result,false,'Paper should lose to Scissors.');
        });
        /**
         * Scissors beats Paper
         */
        it('Scissors beats paper', async()=>{
            await instance.play(moves.paper,{from: alice, value: minBet});
            const result = await instance.play.call(moves.Scissors,{from: bob, value: minBet});
            assert.equal(result,true,'Scissors should beat paper.');
        });
        /**
         * Scissors lose to Rock
         */
        it('Scissors loses to rock', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const result = await instance.play.call(moves.Scissors,{from: bob, value: minBet});
            assert.equal(result,false,'Scissors should lose to rock.');
        });
        /**
         * Generally compute and trace the value of payouts for
         * a test scenario of rounds.  The winner receives their
         * bet back, plus half of the bet of the loser plus half of
         * the running uncomitted total of the contract.  (The uncomitted
         * total is the value of the contract minus the total value of
         * reamining bets left in the queue, they haven't played yet so
         * we should not give away their ether, although that would be a 
         * cool way to punish duplicate plays.)
         */
        it('computes proper payout', async()=>{
            const getPayoutForPlay = async (address,move,bet) => {
                const tx = await instance.play(move,{from: address, value: bet});
                const event = tx.receipt.logs[0];
                assert.equal(event.event,'WinnerPayout','Name of Event should be WinnerPayout');
                return event.args.payout;
            }

            let expectedPayout = minBet.muln(1.5);
            let expectedBalance = minBet.muln(0.5);
            await instance.play(moves.rock,{from: alice, value: minBet});
            assert.equal((await getPayoutForPlay(bob,moves.paper,minBet)).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");

            expectedPayout = minBet.muln(1.75);  // 1 + 0.5 + 0.5/2
            expectedBalance = minBet.muln(0.75); // 0.5 + 0.5/2
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            assert.equal((await getPayoutForPlay(bob,moves.paper,minBet)).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");            

            expectedPayout = minBet.muln(1.875);  // 1 + 0.5 + 0.75/2
            expectedBalance = minBet.muln(0.875); // 0.5 + 0.75/2
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            assert.equal((await getPayoutForPlay(bob,moves.rock,minBet)).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");            

            // start betting at 2x

            expectedPayout = minBet.muln(3.4375);  // 2 + 1 + 0.875/2
            expectedBalance = minBet.muln(1.4375); // 1 + 0.875/2
            await instance.play(moves.rock,{from: alice, value: minBet.muln(2)});
            assert.equal((await getPayoutForPlay(bob,moves.paper,minBet.muln(2))).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");

            expectedPayout = minBet.muln(3.71875);  // 2 + 1 + 1.4375/2
            expectedBalance = minBet.muln(1.71875); // 1 + 1.4375/2
            await instance.play(moves.Scissors,{from: alice, value: minBet.muln(2)});
            assert.equal((await getPayoutForPlay(bob,moves.paper,minBet.muln(2))).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");            

            // uneven bet (loser: 4x, winner 2x)

            expectedPayout = minBet.muln(4.859375);  // 2 + 2 + 1.71875/2
            expectedBalance = minBet.muln(2.859375); // 2 + 1.71875/2
            await instance.play(moves.rock,{from: alice, value: minBet.muln(4)});
            assert.equal((await getPayoutForPlay(bob,moves.paper,minBet.muln(2))).toString(),expectedPayout.toString(),"Payout Mismatch");
            assert.equal((await getBalance(instance.address)).toString(),expectedBalance.toString(),"Unexpected Running Balance");
        });
    });
    /**
     * Generally test from the perspective of a losing play (second player loses).
     */
    describe("losing moves", async() => {
        /**
         * Losing a play should return false.
         */
        it('should return "false"', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const result = await instance.play.call(moves.Scissors,{from: bob, value: minBet});
            assert.equal(result,false,'losing a round should return "true".');
        });
        /**
         * Check that the proper event is emitted after the play.
         */
        it('emit an event.', async()=>{
            await instance.play(moves.Scissors,{from: alice, value: minBet});
            const tx = await instance.play(moves.paper,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'WinnerPayout','Name of Event should be WinnerPayout');
            assert.equal(event.args.winner.toString(),alice.toString(),'Winner should be alice.');
            assert.equal(event.args.loser.toString(),bob.toString(),'Loser should be bob.');
            assert.equal(event.args.move.toString(),moves.Scissors.toString(),'The winning move should be Scissors.');
            assert.equal(event.args.payout,minBet*1.5,'Payout did not match');
        });
        /**
         * Check to ensure the proper payout was given to the winner (opponent).
         */
        it('opponent balance increases by payout', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            let balanceBefore = await getBalance(alice);
            const tx = await instance.play(moves.Scissors,{from: bob, value: minBet});
            const event = tx.receipt.logs[0];
            const payout = asBN(event.args.payout);
            let balanceAfter = await getBalance(alice);
            assert.equal(balanceBefore.add(payout).toString(),balanceAfter.toString(),"Expected Alice's account to increase by minBet");
        });
        /**
         * Check to ensure that the losing player's balance goes down appropriatelly.
         */
        it('balance decreases by bet and gas', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            let balanceBefore = await getBalance(bob);
            const receipt = await instance.play(moves.Scissors,{from: bob, value: minBet});
            const gas = await getGas(receipt);
            let balanceAfter = await getBalance(bob);
            assert.equal(balanceBefore.sub(minBet).sub(gas).toString(),balanceAfter.toString(),"Expected Bob's account to be less the bet and gas.");
        });
    });
    /**
     * Generally test from the perspective of a winning play (second player wins).
     */
    describe("winning moves", async() => {
        /**
         * Winning a round shoudl return true.
         */
        it('should return "true"', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const result = await instance.play.call(moves.paper,{from: bob, value: minBet});
            assert.equal(result,true,'Winning a round should return "true".');
        });
        /**
         * Ensure the proper WinnerPayout event is generated.
         */
        it('emit an event.', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            const tx = await instance.play(moves.paper,{from: bob, value: minBet});
            assert.equal(tx.receipt.logs.length,1,'Should Emit One Event');
            const event = tx.receipt.logs[0];
            assert.equal(event.event,'WinnerPayout','Name of Event should be WinnerPayout');
            assert.equal(event.args.winner.toString(),bob.toString(),'Winner should be bob.');
            assert.equal(event.args.loser.toString(),alice.toString(),'Loser should be alice.');
            assert.equal(event.args.move.toString(),moves.paper.toString(),'The winning move should be paper.');
            assert.equal(event.args.payout,minBet*1.5,'Payout did not match');
        });
        /**
         * Check to see that the opponent's balance decreases by the appropriate
         * amount after the play is resolved.
         */
        it('oponent balance decreases by bet and gas', async()=>{
            let balanceBeforePlay = await getBalance(alice);
            const receipt = await instance.play(moves.rock,{from: alice, value: minBet});
            const gas = await getGas(receipt);
            let balanceAfterPlay = await getBalance(alice);            
            await instance.play(moves.paper,{from: bob, value: minBet});
            let balanceAfterLosing = await getBalance(alice);            
            assert.equal(balanceBeforePlay.sub(minBet).sub(gas).toString(),balanceAfterPlay.toString(),"After making opening move, alice balance should be reduced by bet and gas.");
            assert.equal(balanceAfterPlay.toString(),balanceAfterLosing.toString(),"After losing round, Alice's balance does not increase.");
        });
        /**
         * Check to see that the winning player's account has a net
         * increas appropriate for winning (minus gas).
         */
        it('balance increases by net payout (total payout minus gas and original bet)', async()=>{
            await instance.play(moves.rock,{from: alice, value: minBet});
            let balanceBeforePlay = await getBalance(bob);
            const receipt = await instance.play(moves.paper,{from: bob, value: minBet});
            const event = receipt.receipt.logs[0];
            const payout = asBN(event.args.payout);
            const gas = await getGas(receipt);
            let balanceAfter = await getBalance(bob);
            assert.equal(balanceBeforePlay.sub(minBet).sub(gas).add(payout).toString(),balanceAfter.toString(),"Bob's account should have a net gain due to winning.");            
        });
    });
    /**
     * Generally test the affects of closing the game.
     */
    describe("closing game", async() => {
        /**
         * Only the owner may call this method.
         */
        it("can't be done by non-owner", async()=>{
            const error = await catchRevert(instance.end({from: alice}));
            assert.equal(error.reason,'Access Denied','Unexpected Revert Message');
        });        
        /**
         * It is important to emit the closed event so players
         * don't accidentally waste gas.
         */
        it('emits an event', async()=>{
            const receipt = await instance.end({from: owner});
            const event = receipt.receipt.logs[0];
            assert.equal(event.event,'GameClosed','Name of Event should be GameClosed');
        });
        /**
         * Attempts to return a single unplayed bet in the queue upon ending the game.
         */
        it("returns unplayed bet", async()=>{
            const bet = minBet.muln(2);
            let balanceBeforePlay = await getBalance(alice);
            const gas = await getGas(await instance.play(moves.rock,{from: alice, value: bet}));
            const receipt = await instance.end({from: owner});
            const event = receipt.receipt.logs[0];
            assert.equal(event.event,'GameClosed','Name of Event should be GameClosed');
            let balanceAfterClosing = await getBalance(alice);
            assert.equal(balanceBeforePlay.sub(gas).toString(),balanceAfterClosing.toString(),"Alice's account should only have net spent gas.");
        });        
        /**
         * Attempts to return all the unplayed bets in the bet queue
         * upon ending the game.
         * 
         * Note: while we don't test it here, failed transfers will not
         * cause the whole method to fail, but if the owner does not
         * provide sufficient gas due to a large queue size, there may
         * be a problem.
         */
        it("returns unplayed bets", async()=>{
            let aliceBalanceBeforePlay = await getBalance(alice);
            let bobBalanceBeforePlay = await getBalance(bob);
            const aliceGas = await getGas(await instance.play(moves.rock,{from: alice, value: minBet.muln(2)}));
            const bobGas = await getGas(await instance.play(moves.rock,{from: bob, value: minBet.muln(3)}));
            const receipt = await instance.end({from: owner});
            const event = receipt.receipt.logs[0];
            assert.equal(event.event,'GameClosed','Name of Event should be GameClosed');
            let aliceBalanceAfterClosing = await getBalance(alice);
            assert.equal(aliceBalanceBeforePlay.sub(aliceGas).toString(),aliceBalanceAfterClosing.toString(),"Alice's account should only have net spent gas.");
            let bobBalanceAfterClosing = await getBalance(bob);
            assert.equal(bobBalanceBeforePlay.sub(bobGas).toString(),bobBalanceAfterClosing.toString(),"Bob's account should only have net spent gas.");
        });
        /**
         * Ending the game should only happen once.
         */
        it('ending twice is should raise error.', async()=>{
            await instance.end({from: owner});
            const error = await catchRevert(instance.end({from: owner}));
            assert.equal(error.reason,'Game is already finished.','Unexpected Revert Message');
        });
    });
    /**
     * Generally test the ability to withdraw funds as owner after game is closed.
     */
    describe("withdrawing remaining balance", async() => {
        /**
         * Cannot withdraw funds from a running game.
         */
        it("can't withdraw from running game", async()=>{
            const error = await catchRevert(instance.withdraw({from: owner}));
            assert.equal(error.reason,'Game is still running.','Unexpected Revert Message');
        });        
        /**
         * Only the owner may call this method.
         */
        it("can't withdraw if not owner", async()=>{
            await instance.end({from: owner});
            const error = await catchRevert(instance.withdraw({from: alice}));
            assert.equal(error.reason,'Access Denied','Unexpected Revert Message');
        });        
        /**
         * Returns the balance of the contract (minus gas).
         */
        it("withdraws the balance (minus gas)", async()=>{
            const balance = minBet.muln(10);
            await instance.sendTransaction({from:owner, value: balance });
            await instance.end({from: owner});
            let balanceBeforeWithdraw = await getBalance(owner);
            const receipt = await instance.withdraw({from: owner});
            const gas = await getGas(receipt);
            let balanceAfterWithdraw = await getBalance(owner);
            assert.equal(balanceBeforeWithdraw.add(balance).sub(gas).toString(),balanceAfterWithdraw.toString(),"Remaining Balance was not returned to owner.");
        });        
    });
});