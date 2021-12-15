const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);



describe("TinderChain", function () {
  let myContract;
  let owner;
  let addr1;

  const name1 = "addr1";
  const [img1, img2, img3] = ["img1", "img2", "img3"];
  const bio1 = "bio";

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  beforeEach(async () => {
    const TinderChain = await ethers.getContractFactory("TinderChain");
    myContract = await TinderChain.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("should deploy with correct values", async () => {
      expect(await myContract.profileCount()).to.equal(0);
      expect(await myContract.publicMessageCount()).to.equal(0);
      expect(await myContract.getInitTokenReward()).to.equal(10);
      expect(await myContract.getDefaultApprovalAmt()).to.equal(1000);
      expect(await myContract.defaultMessageText()).to.equal("This is the beginning of your message history.");
    });

    it("should give contract owner 20% of tokens", async () => {
      expect(await myContract.getTokenBalanceOfUser(owner.address)).to.equal(1000*1000*200);
    });

    it("should give contract wallet 80% of tokens", async () => {
      expect(await myContract.getTokenBalanceOfUser(myContract.address)).to.equal(1000*1000*800);

    });
  });

  describe("Onboarding Flow", () => {
    it("should allow a new user to sign up", async () => {
      await myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      const profile = await myContract.getUserProfile(addr1.address);
      expect(profile.name).to.equal(name1);
      expect(profile.bio).to.equal(bio1);
      expect(profile._address).to.equal(addr1.address);
      expect(profile.images).to.eql([img1, img2, img3]);
      expect(Number(profile.created_ts)).to.be.greaterThan(0);
      expect(Number(profile.deleted_ts)).to.equal(0);
    });

    it("should allow contract to transact on behalf of new user", async () => {
      await myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      expect(await myContract.getTokenBalanceOfUser(addr1.address)).to.equal(10);
      expect(await myContract.getTokenBalanceOfUser(myContract.address)).to.equal(1000*1000*800 - 10);
    });

    it("should prevent an existing user from signing up again", async () => {
      await myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.createUserProfileFlow(owner.address, name1, img1, img2, img3, bio1);
      await expect(myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1)).to.be.revertedWith("Cannot create a profile that already exists.");
    });

    it("should increase the total number of profiles on each new user signup", async () => {
      expect(await myContract.profileCount()).to.equal(0);
      await myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      expect(await myContract.profileCount()).to.equal(1);
      await myContract.createUserProfileFlow(owner.address, name1, img1, img2, img3, bio1);
      expect(await myContract.profileCount()).to.equal(2);
    });
  });

  describe("Login Flow", () => {
    it("should allow an existing user to fetch their own profile", async () => {

    });

    it("should allow only the contract owner to fetch someone else's profile", async () => {

    });

    it("should allow an existing user to see how many swipe tokens they have", async () => {

    });

    it("should allow only the contract owner to see how many swipe tokens someone else has", async () => {

    });

    it("should allow an existing user to edit any of their own images", async () => {

    });

    it("should allow only the contract owner to edit someone else's images", async () => {

    });

    it("should allow an existing user to delete any of their images", async () => {

    });

    it("should allow only the contract owner to delete someone else's images", async () => {

    });

    it("should allow an existing user to edit their profile bio", async () => {

    });

    it("should allow only the contract owner to edit someone else's profile bio", async () => {

    });

    it("should allow an existing user to edit their profile name", async () => {

    });

    it("should allow only the contract owner to edit someone else's profile bio", async () => {

    });
  });

  describe("Queue and Swipe Flow", () => {
    it("should fetch only not-yet-swiped profiles for logged in user", async () => {

    });

    it("should not fetch deleted profiles for the queue", async () => {

    });

    it("should fetch distinct pages of unseen profiles", async () => {

    });

    it("should charge a token for a right swipe that does not immediately result in a match", async () => {

    });

    it("should not charge a token for a left swipe", async () => {

    });

    it("should not charge a token for a right swipe that immediately results in a match", async () => {

    });

    it("should return a token to original right-swiper wallet if they later match with that profile", async () => {

    });

    it("should not allow someone with no tokens to swipe right", async () => {

    });

    it("should allow only the contract owner to swipe for a different account", async () => {

    });
  });

  describe("Messaging flow", () => {
    it("should allow user to fetch all recent matches", async () => {

    });

    it("should only allow contract owner to fetch someone else's matches", async () => {

    });

    it("should allow user to message a match", async () => {

    });

    it("should register a messageSent event when a message is sent", async () => {

    });

    it("should user to receive a message from a match", async () => {

    });

    it("should not allow someone to message someone they haven't matched with", async () => {

    });

    it("should not increase publicMessageCount if a private message is sent", async () => {

    });

    it("should increase publicMessageCount if a public message is sent", async () => {

    });

    it("should register a publicMessageSent event if a public message is sent", async () => {

    });

    it("should not register a publicMessageSent event if a private message is sent", async () => {

    });
  });

  describe("Message Voting Flow", () => {
    it("should allow a user to vote on a public message", async () => {

    });

    it("should correctly reflect a message's vote count following a vote", async () => {

    });

    it("should corrrectly update a public message's vote count following a vote", async () => {

    });

    it("should not allow a user to vote on their own public message", async () => {

    });

    it("should not allow a user to vote more than once on a single public message", async () => {

    });

    it("should emit a messageVoted event on a public message vote", async () => {

    });

    it("should send a token from contract wallet to the vote author's wallet if their message is upvoted", async () => {

    });

    it("should send a token from the vote author's wallet to the contract wallet if their message is downvoted (non-negative)", async () => {

    });

    it("should not send a token from the vote author's wallet if their message is downvoted below 0", async () => {

    });
  });

  describe("Setters and getters", () => {
    it("should only allow contract owner to read and write init token reward", async () => {

    });

    it("should only allow contract owner to read and write default approval limit", async () => {

    });

    it("should only allow contract owner to write default message text", async () => {

    });
  });
});
