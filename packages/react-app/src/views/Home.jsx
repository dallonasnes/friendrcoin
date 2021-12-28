import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { BoxH2 } from "../components/H2";
import { FakeMessageBox, ChatLog, MessageRow } from "../components/Box";
import { FAKE_DASHBOARD_DATA } from "../constants";
const { ethers } = require("ethers");

// TODO(@dallon): use helper fns to reduce code duplication
const populateDashboard = data => {
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
          <img alt="thumbUp" src={"../../thumbUp.svg"} />
          <div style={{ display: "inline-block", margin: "5px" }}>{row.up}</div>
          <img alt="thumbDown" src={"../../thumbDown.svg"} />
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
          <img alt="thumbUp" src={"../../thumbUp.svg"} />
          <div style={{ display: "inline-block", margin: "5px" }}>{row.up}</div>
          <img alt="thumbDown" src={"../../thumbDown.svg"} />
          <div style={{ display: "inline-block", margin: "5px" }}>{row.down}</div>
        </MessageRow>
        <br />
      </>
    );
  });
};

const fakeData = () => {
  return (
    <div>
      <div
        style={{ border: "1px solid #cccccc", padding: 16, width: "75%", height: "75%", margin: "auto", marginTop: 64 }}
      >
        <h2>Top Voted Messages</h2>
        <Divider />
        {populateDashboard(FAKE_DASHBOARD_DATA)}
      </div>
      <h2>Tokenized Love</h2>
      <h4>Reap the rewards of matching and</h4>
      <h4>'Playing the game'</h4>
    </div>
  );
};

const loadData = ({ isLoggedIn, setIsLoggedIn, readContracts, writeContracts, tx, faucetTx, address }) => {
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(true);
  const [profile, setProfile] = useState(null); // TODO: use default profile here
  const [didFetch, setDidFetch] = useState(false);
  useEffect(() => {
    async function getUserProfile() {
      if (readContracts && readContracts.TinderChain) {
        try {
          const res = await readContracts.TinderChain.getUserProfile(address);
          setProfile(res);
          console.log("pfoile is set");
        } catch (e) {
          console.log("error here:", e);
        }
      }
    }
    getUserProfile();
  }, [address, readContracts]);

  if (profile && !didFetch) {
    if (profile.created_ts._hex === "0x00") {
      console.log("building profile transaction");
      if (isLoggedIn) {
        tx(
          writeContracts.TinderChain.createUserProfileFlow(
            address,
            "This is my test name!",
            "image1",
            "image2",
            "image3",
            "bio",
          ),
        );
        console.log("real tx done");
      } else {
        // load faucet eth and make transaction
        try {
          faucetTx({
            to: address,
            value: ethers.utils.parseEther("0.01"),
          });
          faucetTx(
            writeContracts.TinderChain.createUserProfileFlow(address, "name", "image1", "image2", "image3", "bio"),
          );
        } catch (e) {
          console.log("error:", e);
        }

        console.log("faucet done");
      }
      setDidFetch(true);
      console.log("finished profile transaction");
    } else {
      console.log("need to display profile");
      // now need to fetch token balance and any other needed data
    }
    setIsLoggedIn(true);
  } else {
    return fakeData();
  }

  return (
    <div>
      <div style={{ display: "inline-block", margin: "5px", marginBottom: "10px" }}>
        <img alt="Profile avatar" src={"../../profileAvatar.svg"} />
        <div style={{ display: "inline-block", margin: "5px" }}>
          <BoxH2 style={{ margin: "5px" }}>Hello: {profile.name}</BoxH2>
          <div style={{ margin: "5px" }}>Your Balance: 10</div>
        </div>
        <div style={{ display: "inline-block", marginLeft: "500px", marginRight: "5px" }}>
          <Button style={{ display: "vertical-align" }}>Explore messages </Button>
        </div>
      </div>

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
          {populateDashboard(showGlobalDashboard ? FAKE_DASHBOARD_DATA : FAKE_DASHBOARD_DATA.filter(elem => elem.adr === address))}
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

export default function Home({ isLoggedIn, setIsLoggedIn, readContracts, writeContracts, tx, faucetTx, address }) {
  return loadData({ isLoggedIn, setIsLoggedIn, readContracts, writeContracts, tx, faucetTx, address });
}
