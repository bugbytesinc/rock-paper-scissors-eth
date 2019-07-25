# Rock Paper Scissors Ethereum

A Rock Paper Scissors Ethereum DApp Game for fun and silliness.

http://rpsdemo.azurewebsites.net/ (Mainnet, Rospten & Rinkeby)

Each player stakes a bet of ether with a *Rock*, *Paper*, or *Scissors*.  If they
are the first player, they wait for the next player, if they are the second player
the can either win lose or draw.  The winner receives their bet back plus half of
the losing player's bet, plus half of the contrat's reamaining uncommitted balance.
If the play is a draw, then both player wait for the next player.  The player ahead
in line gets to play agains the next player, they win or lose as described above.
Eventually there is a circuit-breaker (defaults to 20) plays of the same move, after
which the contract will not accept that move until the number of waiting players
having that move resolves below the threshold.  The owner of the contract can change
this number at any time.

The owner of the contract can close play at any time and refund the blance of any
waiting players.  The running "1/2" balance of ethere on the contract can be 
claimed by the owner of the contract after that time.

**NOTE**: PART OF THE GAME IS GAMING THE SYSTEM!!!  You are welcome to produce
contracts or automated systems that play against this contract to see how a 
miner can be bribed to put your play ahead of others.  Also you can try to 
perform out of gas attacks if you wish, but you may lose your ether in the
process.  The contract protects against some skullduggery, but not all of it,
you can try to deny your opponet their due either with a mutually assured loss
of ether gas attack.  PLAY AT YOUR OWN RISK!  You've been warned.

This repository is a final project submission for the 
[Blockchain Developer Bootcamp Spring 2019](https://consensys.net/academy/).  

## Live Deployment

There is a working deployment of this project located at 
(http://rpsdemo.azurewebsites.net/). The RPS contract has been
deployed on the *Ropsten* network.

## Development Environment Setup

This section describes how to setup this project for development.

### Development Tools

The following development tools are needed to build and test this project:

* [Node/Npm](https://nodejs.org/en/) (Versions 12.6.0/6.9.0 or better)
* [Truffle Suite](https://www.trufflesuite.com/) (Version 5.0.26, with Solidity 0.5.0)
* [Ganache CLI](https://www.npmjs.com/package/ganache-cli) (Version 6.4.5, with ganache-core 2.5.7)
* [Angular CLI](https://cli.angular.io/) (Version 8.1.1)

Installation of these tools is outside the scope of this document, please consult 
each tool's respective documentation for installation details for your system.

### Clone this Repository

First clone the repository from github:

```bash
git clone https://github.com/bugbytesinc/rock-paper-scissors-eth.git
```

and change into the cloned directory.

There are two main directories inside the project directory `angular` and `truffle`.
The `truffle` directory contains the project's Solidity files defining the smart
contracts for this project.  The `angular` directory contains the source code for
an angular application that can access the smart contract once deployed (with the
help of `MetaMask` or some other web3 provider).  Additionally, there is a file 
`ganache-mnemonic.md` describing some suggested settings for starting the ganache
cli to make development a bit easier.

### Start the development blockchain

Before moving to compiling contracts, start the development node (as described
in the `ganache-mnemonic.md` file):

```bash
ganache-cli --mnemonic "pill stable agent parade produce undo open hope real choice isolate expand"  --networkId 4200
```
(At this time, it might be useful to add some of the accounts enumerated in the
startup output into your `MetaMask` or other web3 provider.)

### Compile, Test and Deploy Smart Contracts

Before launching the user interface, it is necessary to compile and deploy the 
smart contracts to the development blockchain.  Open a shell and change to the 
truffle directory.  Compile the contracts:

```bash
truffle compile
```

Then, for good measure, run the contract integration and unit tests:

```bash
truffle test
```

If all goes well, all the tests should pass.  There are two major components
tested by the suite of tests using `JavaScript` and `Solidity` tests:  the
first is a helper contract `BetQueue` which manages a list of duplicate bets
as a part of the game mechanic.  The other contract `RockPaperScissors` is the
main contract that users interact with to play the game.

Assuming the tests pass, we can deploy the contracts to the local
development blockchain:

```bash
truffle migrate
```

At this point, there is a manual step, we need to copy down the contract address
that the `RockPaperScissors` contract was deployed at.  We need this to configure
the angular application startup so it knows which contract instance to call.

Look for `Deploying 'RockPaperScissors'` in the output, and then `contract address:`:

```
2_deploy_contracts.js
=====================

   Deploying 'RockPaperScissors'
   -----------------------------
   > transaction hash:    0x402ac2afc1c7d20a2bdd107cdbb93204cd8bd21f398ffe73355e3ec3079567f8
   > Blocks: 0            Seconds: 0
   > contract address:    0x1A8a498852Be9d219df9aC3bD94E6De26BC3880f
   > block number:        144
   > block timestamp:     1564070343
   > account:             0x483C616a022923D270FC6Fa04F2885beE4e24F9a
   > balance:             98.08806048
   > gas used:            2200922
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.04401844 ETH
```

In the example above, the contract address is `0x1A8a498852Be9d219df9aC3bD94E6De26BC3880f`, 
copy this value somewhere, we will need it again shortly.

### Setup Angular Website development.

Next, we switch to the `angular` directory to proceed with setting up UI development.

First, we need to re-install node dependencies identified in the `package.json` file
since they are not stored in the git repository:

```bash
npm install
```

Next, we need to tell the angular application the location of the smart contract on the
development blockchain.  Open up the `src\index.html` file in your favorite editor.  Find
the `<script>` tag in the header of the file and update the network id `4200` with the
address of the smart contract.  Using the address captured above, file should look similar
to the following afterwards:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rock Paper Scissors</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script>window.rpsAddresses = {'4200' : '0x1A8a498852Be9d219df9aC3bD94E6De26BC3880f'};</script>
</head>
<body>
  <rps-root>
    <div class="please-connect">
      <h1>Welcome to Rock Paper Scissors.</h1>
      <div>Please Connect your Metamask or other Web3 provider.</div>
    </div>
  </rps-root>
</body>
</html>
```

The value `4200` corresponds to the command line argument when starting the development
blockchain as described in the `ganache-mnimonic.md` file.  If you choose a different
network ID (or deploy to a test network), you should modify the value or add a separate
mapping in the `window.rpsAddresses` object.

### Running the Development Web Server

Since Angular CLI comes with its own development server, it is not necessary to use
a 3rd party hosting platform.  To start the server, issue the following:

```bash
npm start
```

After a few moments, a message will appear indicating the server is running:

```
Date: 2019-07-25T16:26:11.671Z - Hash: e779fa3f305197ae00c8 - Time: 12170ms
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
i ｢wdm｣: Compiled successfully.
```

Navigate to (http://localhost:4200), you should be greeted by the following message:

```
Welcome to Rock Paper Scissors.
Please Connect your Metamask or other Web3 provider.
```

At this point, you will need to go to  `MetaMask` and authorize a connection with the website.
Also, if you have not connected your `MetaMask` to the `ganache-cli` develoment blockchain
yet, you will also need to do that and then refresh the page for the UI to pick up the change
in network.

After successfully  connecting `MetaMask` with the development blockchain and website, you
should see three separate buttons allowing you to make a move in the game, this ultimately
calls the `play` method in the smart contract.  If you win, you will receive a payout the sum
of your wager, half the losing player's wager and half the uncommitted running balance in the
contract.  As bets rise, this value rises, as bets fall this value falls.  There is an estimated
minimum payout displayed on the page, this is only a guess, and it can be rather off at times.

Note: since there is only so much time, not all of the failure paths have been covered, if the
`index.html` file is misconfigured with a bad contract address, the site will come up and
allow a minimum bet of 0.  This is not correct.  Attempting to play will result with `MetaMask`
producing an error regarding the address not being an contract.  If this happens, please
double check the network ID and contract address configuration for mismatches.

## Packaging for Deployment

Truffle's [Networks and App Ceployments](https://www.trufflesuite.com/docs/truffle/advanced/networks-and-app-deployment)
page provides a good overview on how to deploy contracts to networks.  We refer the reader to this
documentation for deploying to a test network.

The Angular CLI provides production build services.  To prepare the production javascript issue
the following at the command line:

```bash
npm run build
```

The compiled results will be placed in the `angular\dist` folder.  These contents should be
copied to a static web server or other static content delivery system.  There is no back-end
service required for the UI to run, all the implementation happens in the user's browser and
`MetaMask`.

## Project Contract Library Requirement

**Please See** the `LibraryDemo.sol` and `TestLibraryDemo.sol` files demonstrating
the use of a contract library with associated tests to meet the project 
requirements since a library project was not leveraged in the main project's
contract.
