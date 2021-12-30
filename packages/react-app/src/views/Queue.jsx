import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
const { ethers } = require("ethers");
import { useUserProviderAndSigner } from "eth-hooks";

// TODO: this doesn't seem to return correct value based on test data. perhaps due to replication lag
const checkForMatch = async ({ readContracts, swiper, swipee, didJustMatch, setDidJustMatch }) => {
  console.log("looking for match!");
  console.log("swiper", swiper);
  console.log("swipee", swipee);
  const isMatch = await readContracts.TinderChain.getIsMatch(swiper, swipee);
  debugger;
  console.log("Is match?", isMatch);
  setDidJustMatch(isMatch);
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
  isLoggedIn,
}) => {
  {
    if (queue.length <= 2 && !didFetchLastPage && readContracts && readContracts.TinderChain) {
      // have at least two before fetching more
      // and if user is not logged in, then isBurner wallet is true
      try {
        const [nextPage, nextOffset] = await readContracts.TinderChain.getUnseenProfiles(
          address,
          limit,
          offset,
          !isLoggedIn,
        );
        if (nextPage && nextPage.length > 0) {
          const tmpQueue = queue.concat(nextPage);
          setQueue(tmpQueue);
        }
        if (parseInt(nextOffset._hex) === offset || nextPage.length < limit) {
          setDidFetchLastPage(true);
        }
        setOffset(parseInt(nextOffset._hex));
      } catch (e) {
        console.log(e);
        if (e.toString().toLowerCase().includes("indexed beyond those that exist")) {
          setDidFetchLastPage(true);
        }
      }
    }
  }
};

// TODO: yourLocalBalance should refer to tinder token balance

// TODO: can change yourLocalBalance between 0 and 1 to test different views
// TODO: can test "match" page by clicking on heart button (user must have at least 1 token in yourLocalBalance variable)
// ^ it uses a timer so shows for 5 seconds with a button to start message, then goes back to match screen
export default function Queue({
  isLoggedIn,
  userProfile,
  address,
  readContracts,
  writeContracts,
  tx,
  faucetTx,
  yourLocalBalance,
}) {
  console.log("QUEUE IS-LOGGED-IN", isLoggedIn);

  const loggedInView = ({ yourLocalBalance, userProfile, handleSwipe, showNextProfile }) => {
    return userProfile === null ? (
      <div>
        <h2>You must create a profile to begin</h2>
        <h2>You can do that on the home page</h2>
        <div style={{ marginTop: "20px", filter: "blur(8px)" }}>
          <img alt="temp" src={"../../queueAvatar.svg"} />
        </div>
      </div>
    ) : (
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
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => handleSwipe({ isRightSwipe: false, isLoggedIn: true })}
            >
              <img alt="x" src={"../../x-mark.svg"} />
            </Button>
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => handleSwipe({ isRightSwipe: true, isLoggedIn: true })}
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

  const burnerWalletView = ({ yourLocalBalance, userProfile, handleSwipe, showNextProfile }) => {
    return userProfile === null ? (
      <div>
        <h2>You must create a temporary profile to begin</h2>
        <h2>You can do that on the home page</h2>
        <div style={{ marginTop: "20px", filter: "blur(8px)" }}>
          <img alt="temp" src={"../../queueAvatar.svg"} />
        </div>
      </div>
    ) : (
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
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => handleSwipe({ isRightSwipe: false, isLoggedIn: false })}
            >
              <img alt="x" src={"../../x-mark.svg"} />
            </Button>
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => handleSwipe({ isRightSwipe: true, isLoggedIn: false })}
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

  const swipePage = ({ isLoggedIn, writeContracts, readContracts, address, faucetTx }) => {
    const [queue, setQueue] = useState([]); // TODO: default shape
    const [currentProfile, setCurrentProfile] = useState({});
    const [isFirstProfile, setIsFirstProfile] = useState(true);
    const [offset, setOffset] = useState(0);
    const [didFetchLastPage, setDidFetchLastPage] = useState(false);
    const limit = 5;
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
        isLoggedIn,
      });
    }, [readContracts, queue.length]);

    const _handleSwipe = ({ isRightSwipe, isLoggedIn, swipedProfile }) => {
      if (isLoggedIn) {
        // TODO: remove faucet TX if real account
        // first make sure account has enough for transaction
        faucetTx({
          to: address,
          value: ethers.utils.parseEther("0.01"),
        });

        isRightSwipe
          ? faucetTx(writeContracts.TinderChain.swipeRight(address, swipedProfile._address))
          : faucetTx(writeContracts.TinderChain.swipeLeft(address, swipedProfile._address));

        if (isRightSwipe) {
          // TODO: debug this
          // Not using await here because we will re-render if this method sets the isMatch state field
          // checkForMatch({readContracts, swiper: address, swipee: currentProfile._address, didJustMatch, setDidJustMatch})
        }
      }
    };

    // use timeout to avoid nonce transaction error when fast subsequent swipes
    const handleSwipe = ({ isRightSwipe, isLoggedIn }) => {
      let swipedProfile = { ...currentProfile };
      if (queue.length > 0) {
        setCurrentProfile(queue.shift());
      } else {
        setCurrentProfile({});
      }
      showNextProfile();
      setTimeout(() => _handleSwipe({ isRightSwipe, isLoggedIn, swipedProfile }), 1000);
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
        console.log("FIRST IMAGE: ", currentProfile.images[0]);
        // TODO: from profile we can get name, photos to fetch from CDN, bio, etc
        return (
          <div style={{ marginTop: "20px" }}>
            <img
              alt="Default avatar"
              src={currentProfile.images[0] !== "" ? currentProfile.images[0] : "../../queueAvatar.svg"}
            />
            <p>{currentProfile.name}</p>
            <p>{currentProfile.bio}</p>
          </div>
        );
      } else if (didFetchLastPage) {
        return <div>You've seen all the profiles!</div>;
      } else {
        if (queue.length > 0) {
          getFirstProfile();
        } else {
          debugger;
          // TODO: i think we should never enter into this case right?
          return <div>Need to fetch more profiles</div>;
        }
      }
    };

    // TODO: if logged in, can meaningfully swipe. if not logged in && has profile, can swipe but no network calls
    return isLoggedIn
      ? loggedInView({ yourLocalBalance, userProfile, handleSwipe, showNextProfile })
      : burnerWalletView({ yourLocalBalance, userProfile, handleSwipe, showNextProfile });
  };

  return <>{swipePage({ isLoggedIn, writeContracts, readContracts, address, faucetTx })}</>;
}
