import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
const { ethers } = require("ethers");


// TODO: instead set up event listener for swipeMatch event
const checkForMatch = () => {
  const isMatch = true; // TODO: await query for match
  return isMatch;
};

// TODO: should figure out how to gen new address/wallet
const genMoreAddresses = async ({ count, writeContracts, address, faucetTx }) => {
  console.log("GEN ADDRESSES CALLED");
  if (address && writeContracts && writeContracts.TinderChain) {
    console.log("IN IF CHECK WITH ADDRSS", address);
    // util for test generating more accounts
    // address = address.substring(0, address.length - 11) + Math.random().toString(36).slice(2);
    for (let i = 0; i < count; i++) {
      try {
        faucetTx({
          to: address,
          value: ethers.utils.parseEther("0.01"),
        });
        faucetTx(
          writeContracts.TinderChain.createUserProfileFlow(
            address,
            "This is my test name!",
            "image1",
            "image2",
            "image3",
            "bio",
          ),
        );

        console.log("JUST CREATED CONTRACT WITH ADDRESS:", address);
      } catch (e) {
        console.log(e);
      }
    }
  }
};

// TODO: yourLocalBalance should refer to tinder token balance

// TODO: can change yourLocalBalance between 0 and 1 to test different views
// TODO: can test "match" page by clicking on heart button (user must have at least 1 token in yourLocalBalance variable)
// ^ it uses a timer so shows for 5 seconds with a button to start message, then goes back to match screen
export default function Queue({ isLoggedIn, address, readContracts, writeContracts, tx, faucetTx, yourLocalBalance }) {
  const [didJustMatch, setDidJustMatch] = useState(false);
  const matchPage = () => {
    setTimeout(() => setDidJustMatch(false), 5000);
    return (
      <div>
        <div>
          <h2>Congrats! Issa match</h2>
          <div style={{ display: "inline-block" }}>
            <div style={{ display: "inline-block" }}>
              <img style={{ margin: "10px" }} alt="match1" src={"../../profileAvatar.svg"} />
              <p>+1 $MATCH</p>
            </div>
            <img style={{ margin: "10px", backgroundColor: "red" }} alt="heart" src={"../../heart.svg"} />
            <div style={{ display: "inline-block" }}>
              <img style={{ margin: "10px" }} alt="match1" src={"../../profileAvatar.svg"} />
              <p>+1 $MATCH</p>
            </div>
          </div>
        </div>
        <Button>Say hi! Don't be shy!</Button>
      </div>
    );
  };

  const swipePage = ({ writeContracts, readContracts, address, faucetTx }) => {
    const [queue, setQueue] = useState([]); // TODO: default shape
    const limit = 10;
    let offset = 0;
    let didFetchLastPage = false;
    // TODO: is offset the correct re-calc trigger
    useEffect(() => {
      async function fetchProfiles() {
        if (queue.length <= 2 && !didFetchLastPage && readContracts && readContracts.TinderChain) {
          // have at least two before fetching more
          const [nextPage, nextOffset] = await readContracts.TinderChain.getUnseenProfiles(address, limit, offset);
          debugger;
          queue.push.apply(nextPage);
          setQueue(queue);
          if (nextOffset === offset || nextPage.length < limit) {
            didFetchLastPage = true;
          }
        }
      }
      fetchProfiles();
    }, [queue]);

    const handleSwipe = ({ isRightSwipe }) => {
      queue.pop(0);
      setQueue(queue);
      return isRightSwipe ? checkForMatch() : true;
    };

    // TODO: @(kk) setup component that builds card from profile + photos
    // needs to allows swiping between the images
    const showNextProfileInQueue = () => {
      if (queue.length) {
        const profileAddress = queue[0]._address;
        console.log(profileAddress);
        // TODO: from profile we can get name, photos to fetch from CDN, bio, etc
        return (
          <div style={{ marginTop: "20px" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
          </div>
        );
      } else {
        return <div>You've seen all the profiles!</div>;
      }
    };

    useEffect(() => {
      if (writeContracts && writeContracts.TinderChain) {
        async function genProfiles() {
          await genMoreAddresses({ count: 10, writeContracts, address, faucetTx });
        }
        genProfiles();
      }
    }, [writeContracts, writeContracts.TinderChain, address]);

    return (
      <div>
        {yourLocalBalance ? "Start Swiping, Get Matching" : "Sorry, No Token No Matchy"}
        {yourLocalBalance ? (
          showNextProfileInQueue()
        ) : (
          <div style={{ marginTop: "20px", filter: "blur(8px)" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
          </div>
        )}

        {yourLocalBalance ? (
          <>
            <Button style={{ backgroundColor: "red" }} onClick={() => handleClick({ isRightSwipe: false })}>
              <img alt="x" src={"../../x-mark.svg"} />
            </Button>
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => (handleSwipe({ isRightSwipe: true }) ? setDidJustMatch(true) : setDidJustMatch(false))}
            >
              <img alt="heart" src={"../../heart.svg"} />
            </Button>
          </>
        ) : (
          <Button>Get More Tokens</Button>
        )}
      </div>
    );
  };

  return <>{didJustMatch ? matchPage() : swipePage({ writeContracts, readContracts, address, faucetTx })}</>;
}
