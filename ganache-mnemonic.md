# Example Ganache CLI Parameters

Starting `ganache-cli` with a deterministic set of accounts
can be helpful for testing and configuration of the development
environment.  If the ganache blockchain is started with these
parameters each time, `MetaMask` accounts need only be imported
once for example.  The same goal can be accomplished by using
the GUI version of Ganache and settting up a workspace.

The following command is used for local development purposes 
for this project.  This is optional:

```bash
ganache-cli --mnemonic "pill stable agent parade produce undo open hope real choice isolate expand"  --networkId 4200
```

Note the network ID of `4200` this matches one of the 
network IDs in the base configuration of the `index.html`
file in the Angular Project.

When started, the following keys are generated from the mnemonic:

```
Ganache CLI v6.4.5 (ganache-core: 2.5.7)

Available Accounts
==================
(0) 0x483c616a022923d270fc6fa04f2885bee4e24f9a (~100 ETH)
(1) 0xedea73f4535f45930ea57b6fb304304a3feb9a56 (~100 ETH)
(2) 0x3c3e8099d99af15bdbb05c2484e6602871e1e47e (~100 ETH)
(3) 0xef55742025ec855543805e9c462bbdb2be5c2dd3 (~100 ETH)
(4) 0x59fe18994dbe8c503533bc29d5257fdcebb63f11 (~100 ETH)
(5) 0x50c97a498ee551accfe6fe092eaccd525394ce81 (~100 ETH)
(6) 0xd1da8a6418ec192beffe1c452a01fd3a05009154 (~100 ETH)
(7) 0x222f9768a6ab5475d45fb7439a63e9e8c86e3921 (~100 ETH)
(8) 0xc34ad838bd2c356e34f74967d4624d8b8d29ad55 (~100 ETH)
(9) 0x32e82f0e32b79b1afa6f15e84c94d8265049fa11 (~100 ETH)

Private Keys
==================
(0) 0x72e93b54fcf84367db08befd31bc5b5fab3e367744b15016ae9567727623cfa7
(1) 0x43de1da82c69f0b664af26a6625d39be2f903556b1d53924b9c5166a6a437485
(2) 0x0648cce34201c773f43e18aec278e2f6fcdcc3fbd381fc45088736fe92970418
(3) 0xed2adefa718882ef92c4c482eb2e8c68be7aeb5319177db4180575f1364b3547
(4) 0x28ad889b19a14bdb5937ad176ac70153a4bf8d997a1315ac76916500beb2c9dd
(5) 0xc92012a561b2eaeec805319a181c06a7aad0afd368e79bdced15fcb02626d901
(6) 0x3d98895eee1de29bc08163ab5176750bb4a9029c5e1e41828b40f2c7d96c954b
(7) 0xb8fc049b7c31fda6c9609a7502c2a8ca95329b14188045791ffe8d39cb6bf90f
(8) 0xd23fbd1c1cf6b934e27d599724f12b7c4781f6bccadf82a0875dab3dc72c4b2c
(9) 0x8a9c1a76feb53d1356752e0237595ec80f2e039b856855021d5dc6fc9d5ca34e

HD Wallet
==================
Mnemonic:      pill stable agent parade produce undo open hope real choice isolate expand
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Price
==================
20000000000

Gas Limit
==================
6721975

Listening on 127.0.0.1:8545
```