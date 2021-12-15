const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("TinderChain", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  beforeEach(async () => {
    const TinderChain = await ethers.getContractFactory("TinderChain");
    myContract = await TinderChain.deploy();
  });

  describe("Deployment", () => {
    it("should deploy with correct values", async () => {
      // assert that contract is approved to transact
      // assert that init values in constructor are correct
    });

    it("should give contract owner 20% of tokens", async () => {
      // assert that contract is approved to transact
      // assert that the contract wallet has 800million tokens
      // assert that deployer wallet has 200million tokens
    });

    it("should give contract wallet 80% of tokens", async () => {
      // assert that contract is approved to transact
      // assert that the contract wallet has 800million tokens
      // assert that deployer wallet has 200million tokens
    });
  });

  describe("Onboarding Flow", () => {
    it("should allow a new user to sign up", async () => {
      // pass in args
    });

    it("should allow contract to transact on behalf of new user", async () => {

    });

    it("should prevent an existing user from signing up again", async () => {

    });

    it("should send 10 tokens to a new user's wallet", async () => {

    });

    it("should increase the total number of profiles on each new user signup", async () => {

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
