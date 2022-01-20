// Followed instructions here: https://dev.to/emanuelferreira/how-to-deploy-smart-contract-to-rinkeby-testnet-using-infura-and-hardhat-5ddj
const {ethers, upgrades} = require("hardhat"); //import the hardhat

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const {deployer} = await getNamedAccounts();
  const {deploy} = deployments;
  console.log("DEPLOYER",deployer);
  console.log("BALANCE BEFORE:", (await ethers.provider.getBalance(deployer)).toString())
  const deployResult = await deploy('FriendrChain', {
    from: deployer,
    proxy: {
        owner: deployer,
        proxyContract: "OpenZeppelinTransparentProxy",
        viaAdminContract: "DefaultProxyAdmin",
        execute: {
            init: {methodName: "initialize", args: []},
            onUpgrade: {methodName: "", args: []}
        }
    },
    log: true
  });
  var owner = await ethers.getSigner(); // get first elem of accounts array
  console.log("OWNER", owner.address);
  console.log("DEPLOY RESULT ADDRESS", deployResult.address);
  var FriendrChain = await ethers.getContractAt("FriendrChain", deployResult.address, owner);
  console.log("BALANCE AFTER:", (await ethers.provider.getBalance(deployer)).toString())
  console.log("FriendrChain deployed to:", FriendrChain.address); // Returning the contract address on the rinkeby
  console.log("FriendrCoin address:", await FriendrChain.getTokenAddress());
}

module.exports.tags = ["FriendrChain"];