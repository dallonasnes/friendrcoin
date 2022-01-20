// deploy/00_deploy_your_contract.js

const { ethers, upgrades } = require("hardhat");

const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  const chainId = await getChainId();
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
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
    }
  });

  var FriendrChain = await ethers.getContractAt("FriendrChain", deployResult.address, owner);

  let wallets = [];
  // Create Test Profiles
  for (let i = 0; i < 10; i++){
    const wallet = await ethers.Wallet.createRandom();
    const address = wallet.getAddress();
    wallets.push(wallet);
    await FriendrChain.createUserProfileFlow(address, "Test" + i.toString(), "", "bio", "https://www.youtube.com/c/sinqueso/videos");
  }

  console.log("FINISHED CREATING PROFILES")
  console.log("ProfileCount:", await FriendrChain.profileCount());

  // Have a few swipe right on the web client default wallet
  await FriendrChain.swipeRight(wallets[0].getAddress(), "0x88b97e35aAcC5B4C96914E56cb7DfCB565e685aA")
  await FriendrChain.swipeRight(wallets[2].getAddress(), "0x88b97e35aAcC5B4C96914E56cb7DfCB565e685aA")
  await FriendrChain.swipeRight(wallets[6].getAddress(), "0x88b97e35aAcC5B4C96914E56cb7DfCB565e685aA")

  // Have some accounts match with each other and send public messages
  await FriendrChain.swipeRight(wallets[0].getAddress(), wallets[2].getAddress())
  await FriendrChain.swipeRight(wallets[2].getAddress(), wallets[0].getAddress())
  await FriendrChain.swipeRight(wallets[2].getAddress(), wallets[6].getAddress())
  await FriendrChain.swipeRight(wallets[6].getAddress(), wallets[2].getAddress())

  await FriendrChain.sendMessage(wallets[2].getAddress(), wallets[0].getAddress(), "Are you a crypto kitty? Cuz I'm feline a connection between us.", true);
  await FriendrChain.sendMessage(wallets[2].getAddress(), wallets[6].getAddress(), "Baby, I ain't going for no pump and dump.", true);

  for (let i = 0; i < 489; i++){
    await FriendrChain.voteOnPublicMessage(0, true);
    if (i < 328) await FriendrChain.voteOnPublicMessage(0, false);
  }

  for (let i = 0; i < 39; i++){
    await FriendrChain.voteOnPublicMessage(1, true);
    if (i < 8) await FriendrChain.voteOnPublicMessage(1, false);
  }

  

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    // wait for etherscan to be ready to verify
    await sleep(15000);
    await run("verify:verify", {
      address: FriendrChain.address,
      contract: "contracts/FriendrChain.sol:FriendrChain",
      contractArguments: [],
    });
  }
};
module.exports.tags = ["FriendrChain"];
