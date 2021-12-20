const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("TinderChain", function () {
  let myContract;
  let owner, addr1, addr2, addr3;

  const [name1, name2, name3] = ["addr1", "addr2", "addr3"];
  const [img1, img2, img3] = ["img1", "img2", "img3"];
  const [bio1, bio2, bio3] = ["bio1", "bio2", "bio3"];

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  beforeEach(async () => {
    const TinderChain = await ethers.getContractFactory("TinderChain");
    myContract = await TinderChain.deploy();
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
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
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      const profile = await myContract.getUserProfile(addr1.address);
      expect(profile.name).to.equal(name1);
      expect(profile.bio).to.equal(bio1);
      expect(profile._address).to.equal(addr1.address);
      expect(profile.images).to.eql([img1, img2, img3]);
      expect(Number(profile.created_ts)).to.be.greaterThan(0);
      expect(Number(profile.deleted_ts)).to.equal(0);
    });

    it("should allow only owner to create a profile for another wallet", async () => {
      // works for contract owner
      await myContract.createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      const profile = await myContract.getUserProfile(addr1.address);
      expect(profile.name).to.equal(name1);
      expect(profile.bio).to.equal(bio1);
      expect(profile._address).to.equal(addr1.address);
      expect(profile.images).to.eql([img1, img2, img3]);
      expect(Number(profile.created_ts)).to.be.greaterThan(0);
      expect(Number(profile.deleted_ts)).to.equal(0);

      // doesn't work for non-contract owner
      await expect(myContract.connect(addr1).createUserProfileFlow(addr2.address, name1, img1, img2, img3, bio1)).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow contract to transact on behalf of new user", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      expect(await myContract.getTokenBalanceOfUser(addr1.address)).to.equal(10);
      expect(await myContract.getTokenBalanceOfUser(myContract.address)).to.equal(1000*1000*800 - 10);

    });

    it("should prevent an existing user from signing up again", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(owner).createUserProfileFlow(owner.address, name1, img1, img2, img3, bio1);
      await expect(myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1)).to.be.revertedWith("Cannot create a profile that already exists.");
    });

    it("should increase the total number of profiles on each new user signup", async () => {
      expect(await myContract.connect(addr1).profileCount()).to.equal(0);
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      expect(await myContract.profileCount()).to.equal(1);
      await myContract.connect(owner).createUserProfileFlow(owner.address, name1, img1, img2, img3, bio1);
      expect(await myContract.profileCount()).to.equal(2);
    });
  });

  describe("Login Flow", () => {
    it("should allow an existing user to fetch their own profile", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(Number(profile.created_ts)).to.be.greaterThan(0);
    });

    it("should allow only the contract owner to fetch someone else's profile", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      const profile = await myContract.getUserProfile(addr1.address);
      expect(Number(profile.created_ts)).to.be.greaterThan(0);
      // fails for someone else
      await expect(myContract.connect(addr2).getUserProfile(addr1.address)).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow an existing user to see how many swipe tokens they have", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      expect (await myContract.connect(addr1).getTokenBalanceOfUser(addr1.address)).to.equal(10);
    });

    it("should allow only the contract owner to see how many swipe tokens someone else has", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      expect (await myContract.getTokenBalanceOfUser(addr1.address)).to.equal(10);
      // doesn't work for a different address
      await (expect(myContract.connect(addr2).getTokenBalanceOfUser(addr1.address))).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow an existing user to edit any of their own images", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr1).editProfileImageAtIndex(addr1.address, 0, "fake image");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.images).to.eql(["fake image", img2, img3]);
    });

    it("should allow only the contract owner to edit someone else's images", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      await myContract.editProfileImageAtIndex(addr1.address, 0, "fake image");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(await profile.images).to.eql(["fake image", img2, img3]);
      // doesn't work for another acct
      await expect(myContract.connect(addr2).editProfileImageAtIndex(addr1.address, 0, "fake image")).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow an existing user to delete any of their images", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr1).deleteProfileImageAtIndex(addr1.address, 0);
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.images).to.eql(["", img2, img3]);
    });

    it("should allow only the contract owner to delete someone else's images", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      await myContract.deleteProfileImageAtIndex(addr1.address, 0);
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(await profile.images).to.eql(["", img2, img3]);
      // doesn't work for another acct
      await expect(myContract.connect(addr2).deleteProfileImageAtIndex(addr1.address, 0)).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow an existing user to edit their profile bio", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr1).editProfileBio(addr1.address, "hello world");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.bio).to.equal("hello world");
    });

    it("should allow only the contract owner to edit someone else's profile bio", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      await myContract.editProfileBio(addr1.address, "hello world");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.bio).to.equal("hello world");
      // doesn't work for another acct
      await expect(myContract.connect(addr2).editProfileBio(addr1.address, "hello world")).to.be.revertedWith("Caller is neither the target address or owner.");
    });

    it("should allow an existing user to edit their profile name", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr1).editProfileName(addr1.address, "hello world");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.name).to.equal("hello world");
    });

    it("should allow only the contract owner to edit someone else's profile bio", async () => {
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      // works for owner
      await myContract.editProfileName(addr1.address, "hello world");
      const profile = await myContract.connect(addr1).getUserProfile(addr1.address);
      expect(profile.name).to.equal("hello world");
      // doesn't work for another acct
      await expect(myContract.connect(addr2).editProfileName(addr1.address, "hello world")).to.be.revertedWith("Caller is neither the target address or owner.");
    });
  });

  describe("Queue and Swipe Flow", () => {
    it("should fetch only not-yet-swiped profiles for logged in user", async () => {
      // create 3 accounts
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr2).createUserProfileFlow(addr2.address, name2, img1, img2, img3, bio2);
      await myContract.connect(addr3).createUserProfileFlow(addr3.address, name3, img1, img2, img3, bio3);

      // each account should see only other 2 accounts in the queue
      let [acct1UnseenProfiles, acct1Offset] = await myContract.connect(addr1).getUnseenProfiles(addr1.address, 10, 0);
      let [acct2UnseenProfiles, acct2Offset] = await myContract.connect(addr2).getUnseenProfiles(addr2.address, 10, 0);
      let [acct3UnseenProfiles, acct3Offset] = await myContract.connect(addr3).getUnseenProfiles(addr3.address, 10, 0);

      expect(acct1UnseenProfiles.map((profile) => profile._address)).to.eql([addr2.address, addr3.address]);
      expect(acct1Offset).to.equal(3);

      expect(acct2UnseenProfiles.map((profile) => profile._address)).to.eql([addr1.address, addr3.address]);
      expect(acct2Offset).to.equal(3);

      expect(acct3UnseenProfiles.map((profile) => profile._address)).to.eql([addr1.address, addr2.address]);
      expect(acct3Offset).to.equal(3);

      // acct1 swipes left on acct2 and acct3
      await myContract.connect(addr1).swipeLeft(addr1.address, addr2.address);
      await myContract.connect(addr1).swipeLeft(addr1.address, addr3.address);
      // there should be no unseen profiles left
      [acct1UnseenProfiles, acct1Offset] = await myContract.connect(addr1).getUnseenProfiles(addr1.address, 10, 0);
      expect(acct1UnseenProfiles.length).to.equal(0);
      expect(acct1Offset).to.equal(3);

      // acct2 swipes on acct1
      await myContract.connect(addr2).swipeLeft(addr2.address, addr1.address);
      // there should be only one unseen profile left (addr3)
      [acct2UnseenProfiles, acct2Offset] = await myContract.connect(addr2).getUnseenProfiles(addr2.address, 10, 0);
      expect(acct2UnseenProfiles.length).to.equal(1);
      expect(acct2UnseenProfiles[0]._address).to.equal(addr3.address);
      expect(acct2Offset).to.equal(3);

      // acct3 doesn't swipe
      [acct3UnseenProfiles, acct3Offset] = await myContract.connect(addr3).getUnseenProfiles(addr3.address, 10, 0);
      expect(acct3UnseenProfiles.length).to.equal(2);
      expect(acct3UnseenProfiles.map((profile) => profile._address)).to.eql([addr1.address, addr2.address]);
      expect(acct3Offset).to.equal(3);

    });

    it.skip("should not fetch deleted profiles for the queue", async () => {
      // TODO: setup endpoint for deleted profile
    });

    it("should fetch distinct pages of unseen profiles", async () => {
      // create 3 accounts
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr2).createUserProfileFlow(addr2.address, name2, img1, img2, img3, bio2);
      await myContract.connect(addr3).createUserProfileFlow(addr3.address, name3, img1, img2, img3, bio3);

      // get page 1 of unseen profiles
      const [firstPageUnseenProfiles, firstPageOffset] = await myContract.connect(addr1).getUnseenProfiles(addr1.address, 1, 0);
      // get page 2 of unseen profiles
      const [secondPageUnseenProfiles, secondPageOffset] = await myContract.connect(addr1).getUnseenProfiles(addr1.address, 1, firstPageOffset);

      // each page should have exactly one profile
      expect(firstPageUnseenProfiles.length).to.equal(1);
      expect(secondPageUnseenProfiles.length).to.equal(1);
      // there should be no intersection between the pages
      expect(secondPageUnseenProfiles.filter((profile) => profile._address === firstPageUnseenProfiles[0]._address).length === 0);
      // expect secondPageOffset to be 3 because we should have skipped over addr1 self address in queue
      expect(secondPageOffset).to.equal(3);

    });

    it("should charge a token for a right swipe that does not immediately result in a match", async () => {
      // create 2 accounts
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr2).createUserProfileFlow(addr2.address, name2, img1, img2, img3, bio2);

      const startTokenCount1 = await myContract.connect(addr1).getTokenBalanceOfUser(addr1.address);
      const startTokenCount2 = await myContract.connect(addr2).getTokenBalanceOfUser(addr2.address);

      await myContract.connect(addr1).swipeRight(addr1.address, addr2.address);

      // assert both swiper and swipee still have correct number of tokens
      const endTokenCount1 = await myContract.connect(addr1).getTokenBalanceOfUser(addr1.address);
      const endTokenCount2 = await myContract.connect(addr2).getTokenBalanceOfUser(addr2.address);

      expect(endTokenCount1).to.equal(startTokenCount1 - 1);
      expect(endTokenCount2).to.equal(startTokenCount2);
    });

    it("should not charge a token for a left swipe", async () => {
      // create two profiles
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr2).createUserProfileFlow(addr2.address, name2, img1, img2, img3, bio2);

      // get start token count for first two profiles
      const startTokenCount1 = await myContract.connect(addr1).getTokenBalanceOfUser(addr1.address);
      const startTokenCount2 = await myContract.connect(addr2).getTokenBalanceOfUser(addr2.address);

      // use first profile to swipe left
      await myContract.connect(addr1).swipeLeft(addr1.address, addr2.address);

      // assert both swiper and swipee still have same number of tokens
      const endTokenCount1 = await myContract.connect(addr1).getTokenBalanceOfUser(addr1.address);
      const endTokenCount2 = await myContract.connect(addr2).getTokenBalanceOfUser(addr2.address);
      
      expect(startTokenCount1).to.equal(endTokenCount1);
      expect(startTokenCount2).to.equal(endTokenCount2);
    });

    it("should not charge a token for a right swipe that immediately results in a match", async () => {

    });

    it("should return a token to original right-swiper wallet if they later match with that profile", async () => {

    });

    it("should not allow someone with no tokens to swipe right", async () => {

    });

    it("should allow only the contract owner to swipe for a different account", async () => {
      // TODO: do this for right swipe to assert who gets charged when contract owner swipes for a different account
    });

    it("should allow only the contract owner to view the unseen profile queue different account", async () => {
      // create two accounts
      await myContract.connect(addr1).createUserProfileFlow(addr1.address, name1, img1, img2, img3, bio1);
      await myContract.connect(addr2).createUserProfileFlow(addr2.address, name2, img1, img2, img3, bio2);

      // owner can fetch for addr1
      const [unseenProfiles, firstPageOffset] = await myContract.getUnseenProfiles(addr1.address, 10, 0);
      expect(unseenProfiles.length).to.equal(1);
      expect(firstPageOffset).to.equal(2);

      // addr2 cannot fetch for addr1
      await expect(myContract.connect(addr2).getUnseenProfiles(addr1.address, 10, 0)).to.be.revertedWith("Caller is neither the target address or owner.");
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
