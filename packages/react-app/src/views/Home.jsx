import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import { BoxH2 } from "../components/H2";
import { FakeMessageBox, ChatLog, MessageRow } from "../components/Box";

const fakeInputData = [
  {
    idx: 1,
    img: "../../avatar1.svg",
    adr: "0x66bc2...57F",
    text: "Are you a crypto kitty? Cuz I'm feline a connection between us.",
    up: 679,
    down: 115,
  },
  {
    idx: 2,
    img: "../../avatar2.svg",
    adr: "0x66bc2...57F",
    text: "Baby, I ain't going for no pump and dump.",
    up: 555,
    down: 56,
  },
  {
    idx: 3,
    img: "../../avatar3.svg",
    adr: "0x66bc2...57F",
    text: "Don't fall for other shitcoins, go for this smart contract.",
    up: 435,
    down: 76,
  },
  {
    idx: 4,
    img: "../../avatar4.svg",
    adr: "0x66bc2...57F",
    text: "Coinbase is not good enough, let's go to third base.",
    up: 235,
    down: 189,
  },
  {
    idx: 5,
    img: "../../avatar5.svg",
    adr: "0x66bc2...57F",
    text: "I am tether to your USD, because I could peg to you 100%.",
    up: 128,
    down: 99,
  },
];

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
        {populateDashboard()}
      </div>
      <h2>Tokenized Love</h2>
      <h4>Reap the rewards of matching and</h4>
      <h4>'Playing the game'</h4>
    </div>
  );
};

// TODO(@kk) - this should vertically align, i had some trouble with it :/
const populateRecentMatches = () => {
  return ["../../avatar1.svg", "../../avatar2.svg", "../../avatar3.svg", "../../avatar4.svg"].map(img => {
    return <img style={{ display: "vertical-align" }} alt="Match avatar" src={img} />;
  });
};

// TODO: does this need to be async?
const realData = ({ userAddr, userName, balance }) => {
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(true);

  return (
    <div>
      <div style={{ display: "inline-block", margin: "5px", marginBottom: "10px" }}>
        <img alt="Profile avatar" src={"../../profileAvatar.svg"} />
        <div style={{ display: "inline-block", margin: "5px" }}>
          <BoxH2 style={{ margin: "5px" }}>Hello: {userName}</BoxH2>
          <div style={{ margin: "5px" }}>Your Balance: {balance}</div>
        </div>
        <div style={{ display: "inline-block", marginLeft: "500px", marginRight: "5px" }}>
          <Button style={{ display: "vertical-align" }}>Explore messages </Button>
        </div>
      </div>

      <div style={{ display: "inline-block", margin: "5px" }}>
        <div
          style={{
            display: "inline-block",
            border: "1px solid #cccccc",
            padding: 16,
            width: "20%",
            height: "75%",
            margin: "auto",
            marginTop: 64,
          }}
        >
          Recent Matches
        </div>
        <div>{populateRecentMatches()}</div>

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
          {populateDashboard(showGlobalDashboard ? fakeInputData : fakeInputData.filter(elem => elem.adr === userAddr))}
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

export default function Home({ isLoggedIn, userAddr }) {
  return (
    <>
      {/*TODO: uncomment next line for toggling between logged in/out in test */}
      {/*isLoggedIn ? realData() : fakeData()*/}
      {realData({ userAddr, userName: "Fake Name!", balance: "100 million!" })}
    </>
  );
}
