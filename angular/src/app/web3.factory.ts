import { InjectionToken } from '@angular/core';
import Web3 from 'web3';

export const WEB3 = new InjectionToken<Web3>('web3');

export function provideWeb3() {
    try {
        const provider = ('ethereum' in window) ? window['ethereum'] : Web3.givenProvider;
        return new Web3(provider);
    } catch (err) {
        throw new Error('Non-Ethereum browser detected. You should consider trying Mist or MetaMask!');
    }
}

export async function initWeb3(web3: Web3) {
    if ('enable' in web3.currentProvider) {
        await web3.currentProvider.enable();
    }
    if (web3.eth.accounts.length > 0) {
        web3.eth.defaultAccount = web3.eth.accounts[0];
    }
}