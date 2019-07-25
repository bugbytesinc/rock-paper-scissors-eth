const errorString = "VM Exception while processing transaction: ";

/**
 * Helper Function to test exceptions in async functions
 * 
 * @param {Promise<any>} promise The async or Promise to check
 * @param {string} reason A search string to look for with error messages
 * 
 * @throws `null` if no exception was thrown by promise, or the original
 * error if it does not match the expected error message.
 */
async function tryCatch(promise, reason) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected a VM exception but did not get one");
        assert(error.message.search(errorString + reason) >= 0, "Expected an error containing '" + errorString + reason + "' but got '" + error.message + "' instead");
        return error;
    }
};
/**
 * Package various flavors of the `tryCatch` helper method.
 */
module.exports = {
    catchRevert            : async function(promise) {return await tryCatch(promise, "revert"             );},
    catchOutOfGas          : async function(promise) {return await tryCatch(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {return await tryCatch(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {return await tryCatch(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {return await tryCatch(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {return await tryCatch(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {return await tryCatch(promise, "static state change");},
};
