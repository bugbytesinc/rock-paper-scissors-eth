var BetQueue = artifacts.require("./BetQueue.sol")
let { catchRevert } = require("./exceptionsHelpers.js");
const asBN = web3.utils.toBN;

/**
 * Bet Queue Helper Contract Tests
 */
contract('BetQueue', function(accounts) {

    const owner = accounts[0];   // Owner of the Contract
    const alice = accounts[1];   // Player 'Alice'
    const bob = accounts[2];     // Player 'Bob'
    const chris = accounts[2];   // Player 'Chris'

    const minBet = asBN(100000); // Minimum Bet for testing purposes
    let instance;                // Instance of the contract to test
    
    /**
     * Before each test, create a new deployment of the BetQueue Contract
     */
    beforeEach(async () => {
        instance = await BetQueue.new({from: owner});
    })
    /**
     * Test the totalAmount() method.
     */
    describe("totalAmount()", async() => {
        /**
         * Only the owner can call the method.
         */
        it('can only be called by owner', async()=>{
            await catchRevert(instance.totalAmount({from: alice}));
        });
        /**
         * Since the queue is empty upon creation, the total value 
         * should be zero as well.
         */
        it('should be zero when first initialized', async()=>{
            const total = await instance.totalAmount();
            assert.equal(total.toString(),"0","Total Amount of Empty Queue should be zero.");
        });
        /**
         * Ensure that the summation of bets of players
         * in the queue works as expected.
         */
        it('should sum bets in queue', async()=>{
            let bet1 = minBet.muln(2);
            let totalBet = bet1;
            await instance.enqueue(alice,bet1);
            assert.equal(totalBet.toString(),(await instance.totalAmount()).toString(),"Total Bet Mismatch");

            let bet2 = minBet.muln(4);
            totalBet = totalBet.add(bet2);
            await instance.enqueue(bob,bet2);
            assert.equal(totalBet.toString(),(await instance.totalAmount()).toString(),"Total Bet Mismatch");

            let bet3 = minBet.muln(5);
            totalBet = totalBet.add(bet3);
            await instance.enqueue(alice,bet3);
            assert.equal(totalBet.toString(),(await instance.totalAmount()).toString(),"Total Bet Mismatch");

            totalBet = totalBet.sub(bet1);
            await instance.dequeue();
            assert.equal(totalBet.toString(),(await instance.totalAmount()).toString(),"Total Bet Mismatch");

            totalBet = totalBet.sub(bet2);
            await instance.dequeue();
            assert.equal(totalBet.toString(),(await instance.totalAmount()).toString(),"Total Bet Mismatch");

            await instance.dequeue();
            assert.equal("0",(await instance.totalAmount()).toString(),"Total Bet Mismatch");
        });
    });
    /**
     * Test the isEmpty() method.
     */
    describe("isEmpty()", async() => {
        /**
         * Only the owner can call the method.
         */
        it('can only be called by owner', async()=>{
            await catchRevert(instance.isEmpty({from: alice}));
        });
        /**
         * Since the queue is empty upon creation, 
         * isEmpty() should return true when newly created.
         */
        it('should be true when first initialized', async()=>{
            assert.equal(true,await instance.isEmpty(),"Initial state of the queue should be empty.");
        });
        /**
         * Ensure that adding players to the queue causes
         * the isEmpty() to return false until the queue
         * is once again empty.
         */
        it('should be false when queue is not empty', async()=>{
            assert.equal(true,await instance.isEmpty(),"Initial state of the queue should be empty.");
            
            await instance.enqueue(alice,minBet);
            assert.equal(false,await instance.isEmpty(),"Should return false for not empty.");

            await instance.enqueue(bob,minBet);
            assert.equal(false,await instance.isEmpty(),"Should return false for not empty.");

            await instance.enqueue(chris,minBet);
            assert.equal(false,await instance.isEmpty(),"Should return false for not empty.");

            await instance.dequeue();
            assert.equal(false,await instance.isEmpty(),"Should return false for not empty.");

            await instance.dequeue();
            assert.equal(false,await instance.isEmpty(),"Should return false for not empty.");

            await instance.dequeue();
            assert.equal(true,await instance.isEmpty(),"Should return true after emptied.");
        });
    });
    /**
     * Test enqueueing of records.
     */
    describe("enqueue()", async() => {
        /**
         * Only the owner can call the method.
         */
        it('can only be called by owner', async()=>{
            await catchRevert(instance.enqueue(bob, minBet, {from: alice}));
        });
        /**
         * Can enqueue a record without error
         */
        it('can enqueue', async()=>{
            await instance.enqueue(bob, minBet);
        });
        /**
         * Can enqueue a record multiple times without error.
         */
        it('can enqueue multiple times', async()=>{
            await instance.enqueue(alice, minBet);
            await instance.enqueue(bob, minBet);
            await instance.enqueue(chris, minBet);
        });
    });
    /**
     * Test dequeueing records
     */
    describe("dequeue()", async() => {
        /**
         * Only the owner can call the method.
         */
        it('can only be called by owner', async()=>{
            await instance.enqueue(bob, minBet);
            await catchRevert(instance.dequeue({from: alice}));
        });
        /**
         * Check to see that the dequeued record 
         * retrieved the queue matches what was put in.
         */
        it('can dequeue', async()=>{
            await instance.enqueue(bob, minBet);
            let result = await instance.dequeue.call();
            assert.equal(bob.toString(),result.player.toString(),"Did not dequeue the account that was enqueued.");
            assert.equal(minBet.toString(),result.amount.toString(),"Dequeued Bet did not match enqueued bet.");
        });
        /**
         * Test the fist-in-first out capabilities
         * of the queue from a batch queue then batch dequeue
         */
        it('can dequeue first in first out', async()=>{
            let list = [
                {player: alice, amount: minBet},
                {player: bob, amount: minBet.muln(2)},
                {player: chris, amount: minBet.muln(3)},
                {player: bob, amount: minBet.muln(4)},
                {player: alice, amount: minBet.muln(5)},
                {player: chris, amount: minBet.muln(6)},
            ];
            for(let i = 0; i < list.length; i ++ ) {
                await instance.enqueue(list[i].player, list[i].amount);    
            }
            for(let i = 0; i < list.length; i ++ ) {
                let result = await instance.dequeue.call(); // Runs method but won't commit change blockchain
                assert.equal(list[i].player.toString(),result.player.toString(),`Did not dequeue the account[${i}] that was enqueued.`);
                assert.equal(list[i].amount.toString(),result.amount.toString(),`Dequeued Bet[${i}] did not match enqueued bet.`);
                await instance.dequeue(); // Now call it for real to mutate the blockchain
            }
            assert.equal(true,(await instance.isEmpty()),'Queue should be drained.');
        });
        /**
         * Test the fist-in-first out capabilities
         * of the queue from an interleaved use case.
         */
        it('can dequeue first in first out while interleaving', async()=>{
            const list = [
                {player: alice, amount: minBet},
                {player: bob, amount: minBet.muln(2)},
                {player: chris, amount: minBet.muln(3)},
                {player: bob, amount: minBet.muln(4)},
                {player: alice, amount: minBet.muln(5)},
                {player: chris, amount: minBet.muln(6)},
                {player: bob, amount: minBet.muln(4)},
                {player: chris, amount: minBet.muln(6)},
                {player: chris, amount: minBet.muln(7)},
                {player: chris, amount: minBet.muln(6)},
                {player: bob, amount: minBet.muln(10)},
                {player: alice, amount: minBet.muln(5)},
            ];
            const bound1 = Math.floor(list.length / 3);
            const bound2 = bound1 * 2;
            for(let i = 0; i < bound1; i ++ ) {
                await instance.enqueue(list[i].player, list[i].amount);    
            }
            for(let i = bound1; i < bound2; i ++ ) {
                let result = await instance.dequeue.call(); // Runs method but won't commit change blockchain
                assert.equal(list[i-bound1].player.toString(),result.player.toString(),`Did not dequeue the account[${i-bound1}] that was enqueued.`);
                assert.equal(list[i-bound1].amount.toString(),result.amount.toString(),`Dequeued Bet[${i-bound1}] did not match enqueued bet.`);
                await instance.dequeue(); // Now call it for real to mutate the blockchain
                await instance.enqueue(list[i].player, list[i].amount);    
            }
            for(let i = bound2; i < list.length; i ++ ) {
                let result = await instance.dequeue.call(); // Runs method but won't commit change blockchain
                assert.equal(list[i-bound2+bound1].player.toString(),result.player.toString(),`Did not dequeue the account[${i-bound2+bound1}] that was enqueued.`);
                assert.equal(list[i-bound2+bound1].amount.toString(),result.amount.toString(),`Dequeued Bet[${i-bound2+bound1}] did not match enqueued bet.`);
                await instance.dequeue(); // Now call it for real to mutate the blockchain
                await instance.enqueue(list[i].player, list[i].amount);    
            }
            for(let i = bound2; i < list.length; i ++ ) {
                let result = await instance.dequeue.call(); // Runs method but won't commit change blockchain
                assert.equal(list[i].player.toString(),result.player.toString(),`Did not dequeue the account[${i}] that was enqueued.`);
                assert.equal(list[i].amount.toString(),result.amount.toString(),`Dequeued Bet[${i}] did not match enqueued bet.`);
                await instance.dequeue(); // Now call it for real to mutate the blockchain
            }
            assert.equal(true,(await instance.isEmpty()),'Queue should be drained.');
        });
    });
    /**
     * Test queue count method.
     */
    describe("count()", async() => {
        /**
         * Only the owner can call the method.
         */
        it('can only be called by owner', async()=>{
            await catchRevert(instance.count({from: alice}));
        });
        /**
         * When created, the queue is empty, so count should be 0
         */
        it('should be zero when first initialized', async()=>{
            const total = await instance.count();
            assert.equal(total.toString(),"0","Count of Empty Queue should be zero.");
        });
        /**
         * Test to ensure the count tracks with the number
         * of records queued and dequeued.
         */
        it('should track the size of the queue', async()=>{
            let bet = minBet.muln(2);
            await instance.enqueue(alice,bet);
            assert.equal("1",(await instance.count()).toString(),"Size count mismatch.");

            await instance.enqueue(bob,bet);
            assert.equal("2",(await instance.count()).toString(),"Size count mismatch.");

            await instance.enqueue(alice,bet);
            assert.equal("3",(await instance.count()).toString(),"Size count mismatch.");

            await instance.dequeue();
            assert.equal("2",(await instance.count()).toString(),"Size count mismatch.");

            await instance.enqueue(alice,bet);
            assert.equal("3",(await instance.count()).toString(),"Size count mismatch.");

            await instance.dequeue();
            assert.equal("2",(await instance.count()).toString(),"Size count mismatch.");

            await instance.dequeue();
            assert.equal("1",(await instance.count()).toString(),"Size count mismatch.");

            await instance.dequeue();
            assert.equal("0",(await instance.count()).toString(),"Count Should be 0 after all bets dequeued.");
        });
    });
});