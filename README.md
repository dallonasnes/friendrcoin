# TinderChain

## Developers
Allocation of 1000 TinderCoin to reward qualifying PRs. Be sure to clarify scope and requirements in open issues before beginning work.

## How to run
#### Docker
1. See readme in `docker` dir
#### Locally
1. Run `yarn install` in the root dir
2. Run `yarn chain` in one terminal
3. Once the first terminal is dumping ETH network logs, run `yarn deploy` in the second terminal
4. When the second terminal finishes, run `yarn start` in that terminal to start the web app

## File structure
Solidity code lives in `packages/hardhat/contracts` and `packages/react-app` houses the FE code

## Docs

[Design doc](https://docs.google.com/document/d/1dK7VgTm8u8EnxTcnLr6IJ1oO5Dabo6-Zlrjw39kxWdQ/edit?usp=sharing)

[Marketing doc](https://docs.google.com/document/d/1j1zncLV9bOxah-RwL6pvQE5fU5MIwoYLLpjnd2uhyH8/edit?usp=sharing)

[Figma](https://www.figma.com/file/AQxlyKqiQvVT5SKpTLV2js/Tinder-Chain?node-id=8%3A233)
