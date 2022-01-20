// Followed instructions here: https://dev.to/emanuelferreira/how-to-deploy-smart-contract-to-rinkeby-testnet-using-infura-and-hardhat-5ddj
const {ethers, upgrades} = require("hardhat"); //import the hardhat

async function main() {
    const [deployer] = await ethers.getSigners(); //get the account to deploy the contract

    console.log("Deploying contracts with the account:", deployer.address); 

    const FriendrChainFactory = await ethers.getContractFactory("FriendrChain", deployer);
    const FriendrChain = await upgrades.deployProxy(FriendrChainFactory, [], {
        initializer: "initialize",
    });
    await FriendrChain.deployed();

    console.log("FriendrChain deployed to:", FriendrChain.address); // Returning the contract address on the rinkeby
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });