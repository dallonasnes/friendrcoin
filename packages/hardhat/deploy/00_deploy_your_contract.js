// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("TinderChain", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  // Getting a previously deployed contract
  const TinderChain = await ethers.getContract("TinderChain", deployer);

  // TODO: create test profiles here
  for (let i = 0; i < 10; i++){
    const wallet = await ethers.Wallet.createRandom();
    const address = wallet.getAddress();
    await TinderChain.createUserProfileFlow(address, "Test" + i.toString(), "image1", "image2", "image3", "bio");
  }
  console.log("FINISHED CREATING PROFILES")
  console.log("ProfileCount:", await TinderChain.profileCount());

  /*  await TinderChain.setPurpose("Hello");
  
    To take ownership of TinderChain using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // TinderChain.transferOwnership(YOUR_ADDRESS_HERE);

    //const TinderChain = await ethers.getContractAt('TinderChain', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const TinderChain = await deploy("TinderChain", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const TinderChain = await deploy("TinderChain", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    // wait for etherscan to be ready to verify
    await sleep(15000);
    await run("verify:verify", {
      address: TinderChain.address,
      contract: "contracts/TinderChain.sol:TinderChain",
      contractArguments: [],
    });
  }
};
module.exports.tags = ["TinderChain"];
