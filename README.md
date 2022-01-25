# FriendrCoin
Also known as the Metaverse's first dating app, FriendrCoin is a decentralized friend-matching application built on top of Ethereum. The dAPP supports creating a profile, swiping on other profiles, matching, messaging and selecting messages to be shown on the public dashboard. Public dashboard messages have voting functionality where upvotes pay one FriendrCoin to the author's wallet and downvotes remove one FriendrCoin from the author's wallet (negative balance not allowed).

Each right swipe costs 1 FriendrCoin and a match returns that FriendrCoin to your wallet. Left swipes are free. Note that creating/editing your profile, swiping, messaging and voting are transactions that incur a gas fee payable in Matic.

This dApp is deployed on [Polygon mainnet](https://polygon.technology/) polygon gas fees are quite low (less than 0.01 USD on average, compared to ~$100 USD on Ethereum mainnet). Note that gas fees are paid in [Matic](https://coinmarketcap.com/currencies/polygon/). You can get small amounts of Matic from the [matic faucet](https://matic.supply/). To do so, be sure you have added Polygon Mainnet as a network in your Metamask wallet by following [these](https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/) instructions.

You can trade or provide liquidity for FriendrCoin on [Quickswap](https://quickswap.exchange/). Note that you may need to import the token by pasting in the below coin address.

Contract address: `0xc1cDb7cD85692E49728bBDD1e74905bbafa2d888`

Coin address: `0x351A1D8463d076501fcd366f51F21FD521094F7E`

## Developers
Allocation of 1000 FriendrCoin to reward qualifying PRs. Be sure to clarify scope and requirements in open issues before beginning work.

## How to run
#### Docker
1. See readme in `docker` dir
#### Locally
1. Run `yarn install` in the root dir
2. Run `yarn chain` in one terminal
3. Once the first terminal is dumping ETH network logs, run `yarn deploy` in the second terminal
4. When the second terminal finishes, run `yarn start` in that terminal to start the web app

#### BE Test Suite
1. Run `yarn test`

#### Test deployments
Notice that in `packages/hardhat/deploy` there are two files - one for local and one for a remote network.

Right now, running `yarn deploy` will run both, which is not what you want. If you want to run locally, delete the test file `01_deploy_your_contract_to_test.js` but DO NOT COMMIT THAT DELETION. Similarly, if you want to deploy to a network, delete the local file but DO NOT COMMIT THAT DELETION. To deploy to a test net, eg rinkeby, run `yarn deploy --network rinkeby` after setting up your `test_prv_key.txt` file with your deploy wallet's private key. Do not commit private keys.

## File structure
Solidity code lives in `packages/hardhat/contracts` and `packages/react-app` houses the FE code

## Docs

[Design doc](https://docs.google.com/document/d/1dK7VgTm8u8EnxTcnLr6IJ1oO5Dabo6-Zlrjw39kxWdQ/edit?usp=sharing)

[Marketing doc](https://docs.google.com/document/d/1j1zncLV9bOxah-RwL6pvQE5fU5MIwoYLLpjnd2uhyH8/edit?usp=sharing)

[Figma](https://www.figma.com/file/AQxlyKqiQvVT5SKpTLV2js/Friendr-Chain?node-id=8%3A233)
