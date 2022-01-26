import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { BoxH2 } from "../components/H2";
import { FakeMessageBox, ChatLog, MessageRow } from "../components/Box";
import { FAKE_DASHBOARD_DATA, DEBUG_TRANSACTIONS } from "../constants";
const { ethers } = require("ethers");
import { Profile } from "./";

const _handleVote = ({ address, isUpvote, tx, writeContracts, messageIdx }) => {
  try {
    // fill wallet for transactions if in debug mode
    if (DEBUG_TRANSACTIONS) {
      tx({
        to: address,
        value: ethers.utils.parseEther("0.1"),
      });
    }
    tx(writeContracts.FriendrChain.voteOnPublicMessage(parseInt(messageIdx), isUpvote));
    setTimeout(() => window.location.reload(), 500);
  } catch (e) {
    console.log(e);
  }
};

const handleVote = ({ address, isUpvote, tx, writeContracts, isLoggedIn, publicMessages, messageIdx, userProfile }) => {
  if (isLoggedIn && userProfile !== null) {
    setTimeout(
      () => _handleVote({ address, isUpvote, tx, writeContracts, isLoggedIn, publicMessages, messageIdx }),
      500,
    );
  } else if (!isLoggedIn) {
    alert("Hook up your crypto wallet to make your vote count!");
  } else {
    // userProfile !== null
    alert("Create your profile before you can vote");
  }
};

const populateDashboard = ({ address, data, tx, writeContracts, isLoggedIn, userProfile }) => {
  if (!data || data.length === 0) return <div>No messages to show</div>;
  return data.map(row => {
    return (
      <>
        <MessageRow>
          <div style={{ display: "inline-block", margin: "5px" }}>
            {row.idx._hex ? parseInt(row.idx._hex) : row.idx}
          </div>
          <img alt="author image" src={row.img ? row.img : row.authorImg} />
          <div style={{ display: "inline-block" }}>{row.author}</div>
          <ChatLog backgroundColor={row.idx % 2 === 0 ? "#E2A8A8" : "#E47B7B"}>
            {row.text ? row.text : row.message.text}
          </ChatLog>
          <button
            onClick={() =>
              handleVote({
                userProfile,
                isUpvote: true,

                tx,
                writeContracts,
                isLoggedIn,
                address,
                publicMessages: data,
                messageIdx: row.idx._hex,
              })
            }
          >
            <img alt="thumbUp" src={"../../thumbUp.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.up ? row.up : parseInt(row.upvotes._hex)}</div>
          <button
            onClick={() =>
              handleVote({
                userProfile,
                isUpvote: false,

                address,
                tx,
                writeContracts,
                isLoggedIn,
                publicMessages: data,
                messageIdx: row.idx._hex,
              })
            }
          >
            <img alt="thumbDown" src={"../../thumbDown.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>
            {row.down ? row.down : parseInt(row.downvotes._hex)}
          </div>
        </MessageRow>
        <br />
      </>
    );
  });
};

const getPublicMessages = async ({
  publicMessages,
  setPublicMessages,
  offset,
  setOffset,
  didFetchLastPage,
  setDidFetchLastPage,
  readContracts,
  limit,
}) => {
  if (!didFetchLastPage && readContracts && readContracts.FriendrChain) {
    try {
      const [nextPage, nextOffset] = await readContracts.FriendrChain.getPublicMessages(limit, offset);
      if (nextPage && nextPage.length > 0) {
        // HACK: this page loads again after userProfile loads, then fetches the first page twice
        // need to make sure the we don't duplicate messages on screen
        const unseenMessages = nextPage.filter(newMessage => {
          for (let i = 0; i < publicMessages.length; i++) {
            if (parseInt(newMessage.idx._hex) === parseInt(publicMessages[i].idx._hex)) return false;
          }
          return true;
        });
        const _publicMessages = publicMessages.concat(unseenMessages);
        setPublicMessages(_publicMessages);
      }
      if (parseInt(nextOffset._hex) === offset || nextPage.length < limit) {
        setDidFetchLastPage(true);
      }
      setOffset(parseInt(nextOffset._hex));
    } catch (e) {
      if (e.toString().toLowerCase().includes("indexed beyond those that exist")) {
        // do nothing for now
        setDidFetchLastPage(true);
      } else {
        console.log(e);
      }
    }
  }
};

const loadData = ({ isLoggedIn, userProfile, readContracts, writeContracts, tx, address }) => {
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(true);
  const [publicMessages, setPublicMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [didFetchLastPage, setDidFetchLastPage] = useState(false);
  const limit = 100;

  useEffect(() => {
    getPublicMessages({
      publicMessages,
      setPublicMessages,
      offset,
      setOffset,
      didFetchLastPage,
      setDidFetchLastPage,
      address,
      readContracts,
      limit,
    });
  }, [readContracts, publicMessages.length]);

  return (
    <div>
      <div style={{ display: "inline-block", margin: "5px" }}>
        <FakeMessageBox>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <BoxH2>Top Voted Messages</BoxH2>
            <Button onClick={() => setShowGlobalDashboard(!showGlobalDashboard)}>Toggle Personal/Global View</Button>
          </div>
          <Divider />
          {populateDashboard(
            isLoggedIn
              ? showGlobalDashboard
                ? { data: publicMessages, writeContracts, isLoggedIn, address, userProfile, tx }
                : {
                    data: publicMessages.filter(elem => elem.author === address),

                    writeContracts,
                    isLoggedIn,
                    address,
                    userProfile,
                    tx,
                  }
              : showGlobalDashboard
              ? { data: FAKE_DASHBOARD_DATA, writeContracts, isLoggedIn, address, userProfile, tx }
              : {
                  data: FAKE_DASHBOARD_DATA.filter(elem => elem.author === address),

                  writeContracts,
                  isLoggedIn,
                  address,
                  userProfile,
                },
          )}
        </FakeMessageBox>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <h2>Tokenized Love</h2>
        <h4>Reap the rewards of matching and</h4>
        <h4>'Playing the game'</h4>
      </div>
    </div>
  );
};

export default function Home({
  isLoggedIn,
  userProfile,
  setUserProfile,
  setIsLoggedIn,
  readContracts,
  writeContracts,
  tx,
  address,
}) {
  return (
    <>
      <Profile
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        address={address}
        readContracts={readContracts}
        writeContracts={writeContracts}
        tx={tx}
      />
      {loadData({ isLoggedIn, userProfile, readContracts, writeContracts, tx, address })}
    </>
  );
}
