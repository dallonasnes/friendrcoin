import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
const { ethers } = require("ethers");
import { useUserProviderAndSigner } from "eth-hooks";

// TODO: instead set up event listener for swipeMatch event
const checkForMatch = () => {
  const isMatch = true; // TODO: await query for match
  return isMatch;
};

const fetchProfiles = async ({
  queue,
  setQueue,
  didFetchLastPage,
  setDidFetchLastPage,
  address,
  readContracts,
  limit,
  offset,
  setOffset,
}) => {
  {
    if (queue.length <= 2 && !didFetchLastPage && readContracts && readContracts.TinderChain) {
      // have at least two before fetching more
      const [nextPage, nextOffset] = await readContracts.TinderChain.getUnseenProfiles(address, limit, offset);
      if (nextPage && nextPage.length > 0) {
        const tmpQueue = queue.concat(nextPage);
        setQueue(tmpQueue);
      }
      if (nextOffset === offset || nextPage.length < limit) {
        setDidFetchLastPage(true);
      }
      setOffset(nextOffset);
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
    debugger;
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
    const [currentProfile, setCurrentProfile] = useState({});
    const [isFirstProfile, setIsFirstProfile] = useState(true);
    const [offset, setOffset] = useState(0);
    const [didFetchLastPage, setDidFetchLastPage] = useState(false);
    const limit = 5;
    // TODO: is offset the correct re-calc trigger
    useEffect(() => {
      fetchProfiles({
        queue,
        setQueue,
        didFetchLastPage,
        setDidFetchLastPage,
        address,
        readContracts,
        limit,
        offset,
        setOffset,
      });
    }, [readContracts, queue.length]);

    const handleSwipe = ({ isRightSwipe }) => {
      if (queue.length > 0) {
        setCurrentProfile(queue.shift());
      } else {
        // TODO: maybe need to fetch again in here
        setCurrentProfile({});
      }
      showNextProfile();
    };

    const getFirstProfile = () => {
      if (isFirstProfile) {
        setCurrentProfile(queue.shift());
        setIsFirstProfile(false);
      }
    };

    // TODO: @(kk) setup component that builds card from profile + photos
    // needs to allows swiping between the images
    const showNextProfile = () => {
      if (currentProfile.name) {
        // TODO: from profile we can get name, photos to fetch from CDN, bio, etc
        return (
          <div style={{ marginTop: "20px" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
            <p>{currentProfile.name}</p>
          </div>
        );
      } else if (didFetchLastPage) {
        return <div>You've seen all the profiles!</div>;
      } else {
        if (queue.length > 0) {
          getFirstProfile();
        } else {
          return <div>Need to fetch more profiles</div>;
        }
      }
    };

    return (
      <div>
        {yourLocalBalance ? "Start Swiping, Get Matching" : "Sorry, No Token No Matchy"}
        {yourLocalBalance ? (
          showNextProfile()
        ) : (
          <div style={{ marginTop: "20px", filter: "blur(8px)" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
          </div>
        )}

        {yourLocalBalance ? (
          <>
            <Button style={{ backgroundColor: "red" }} onClick={() => handleSwipe({ isRightSwipe: false })}>
              <img alt="x" src={"../../x-mark.svg"} />
            </Button>
            <Button style={{ backgroundColor: "red" }} onClick={() => handleSwipe({ isRightSwipe: true })}>
              <img alt="heart" src={"../../heart.svg"} />
            </Button>
          </>
        ) : (
          <Button>Get More Tokens</Button>
        )}
      </div>
    );
  };

  return <>{swipePage({ writeContracts, readContracts, address, faucetTx })}</>;
}
