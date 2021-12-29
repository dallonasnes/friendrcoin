import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { BoxH2 } from "../components/H2";
import { FakeMessageBox, ChatLog, MessageRow } from "../components/Box";
import { FAKE_DASHBOARD_DATA } from "../constants";
const { ethers } = require("ethers");
import { Profile } from "./";

// TODO
const handleVote = ({ isUpvote, faucetTx, writeContracts }) => {
  alert("needs to make api calls if user is logged in");
};

// TODO(@dallon): use helper fns to reduce code duplication
const populateDashboard = ({ data, faucetTx, writeContracts }) => {
  return data.map(row => {
    return row.idx % 2 === 0 ? (
      // TODO(@kk) -- for even set text pink, for odd then red
      // TODO: also this may work better for alignment as a grid or with strict margins per column
      <>
        <MessageRow>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.idx}</div>
          <img alt="avatar" src={row.img} />
          <div style={{ display: "inline-block" }}>{row.adr}</div>
          <ChatLog backgroundColor="#E2A8A8">{row.text}</ChatLog>
          <button onClick={() => handleVote({ isUpvote: true, faucetTx, writeContracts })}>
            <img alt="thumbUp" src={"../../thumbUp.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.up}</div>
          <button onClick={() => handleVote({ isUpvote: false, faucetTx, writeContracts })}>
            <img alt="thumbDown" src={"../../thumbDown.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.down}</div>
        </MessageRow>
        <br />
      </>
    ) : (
      <>
        <MessageRow>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.idx}</div>
          <img alt="avatar" src={row.img} />
          <div style={{ display: "inline-block", margin: "5px" }}>{row.adr}</div>
          <ChatLog backgroundColor="#E47B7B">{row.text}</ChatLog>
          <button onClick={() => handleVote({ isUpvote: true, faucetTx, writeContracts })}>
            <img alt="thumbUp" src={"../../thumbUp.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.up}</div>
          <button onClick={() => handleVote({ isUpvote: false, faucetTx, writeContracts })}>
            <img alt="thumbDown" src={"../../thumbDown.svg"} />
          </button>
          <div style={{ display: "inline-block", margin: "5px" }}>{row.down}</div>
        </MessageRow>
        <br />
      </>
    );
  });
};

const fakeData = ({ writeContracts, faucetTx }) => {
  return (
    <div>
      <div
        style={{ border: "1px solid #cccccc", padding: 16, width: "75%", height: "75%", margin: "auto", marginTop: 64 }}
      >
        <h2>Top Voted Messages</h2>
        <Divider />
        {populateDashboard({ data: FAKE_DASHBOARD_DATA, writeContracts, faucetTx })}
      </div>
      <h2>Tokenized Love</h2>
      <h4>Reap the rewards of matching and</h4>
      <h4>'Playing the game'</h4>
    </div>
  );
};

const getPublicMessages = ({
  publicMessages,
  setPublicMessages,
  didFetchLastPage,
  setDidFetchLastPage,
  address,
  readContracts,
  limit,
  offset,
  setOffset,
}) => {
  if (!didFetchLastPage && readContracts && readContracts.TinderChain) {
    // have at least two before fetching more
    const [nextPage, nextOffset] = await readContracts.TinderChain.getPublicMessages(
      limit,
      offset,
    );
    if (nextPage && nextPage.length > 0) {
      const _publicMessages = publicMessages.concat(nextPage);
      setPublicMessages(_publicMessages);
    }
    if (nextOffset === offset || nextPage.length < limit) {
      setDidFetchLastPage(true);
    }
    setOffset(nextOffset);
  }
};

const loadData = ({ isLoggedIn, userProfile, setIsLoggedIn, readContracts, writeContracts, tx, faucetTx, address }) => {
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(true);
  const [publicMessages, setPublicMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [didFetchLastPage, setDidFetchLastPage] = useState(false);
  const limit = 5;
  useEffect(() => {
    getPublicMessages({
      publicMessages,
      setPublicMessages,
      didFetchLastPage,
      setDidFetchLastPage,
      address,
      readContracts,
      limit,
      offset,
      setOffset,
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
                ? publicMessages
                : publicMessages.filter(elem => elem.sender === address)
              : showGlobalDashboard
              ? FAKE_DASHBOARD_DATA
              : FAKE_DASHBOARD_DATA.filter(elem => elem.adr === address),
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
  faucetTx,
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
        faucetTx={faucetTx}
      />
      {loadData({ isLoggedIn, userProfile, setIsLoggedIn, readContracts, writeContracts, tx, faucetTx, address })}
    </>
  );
}
