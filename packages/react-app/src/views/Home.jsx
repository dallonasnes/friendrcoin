import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import { H1, BoxH2 } from "../components/styles/Headings";
import { FakeMessageBox, ChatLog, MessageRow } from "../components/styles/Box";
import { FlexDiv } from "../components/styles/Div";
import { Icon, Avatar, DashboardAvatar, LogoImg } from "../components/styles/Img";
import { MessageBoxButton } from "../components/styles/Button";

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
          <FlexDiv>{row.idx}</FlexDiv>
          <Avatar alt="avatar" src={row.img} />
          <div style={{ display: "inline-block" }}>{row.adr}</div>
          <ChatLog backgroundColor="#E2A8A8">{row.text}</ChatLog>
          <Icon alt="thumbUp" src={"../../thumbUp.svg"}/>
          <FlexDiv justifyContent="space-around" marginRight="15px">{row.up}</FlexDiv>
          <Icon alt="thumbDown" src={"../../thumbDown.svg"} />
          <FlexDiv justifyContent="space-around">{row.down}</FlexDiv>
        </MessageRow>
        <br />
      </>
    ) : (
      <>
        <MessageRow>
          <FlexDiv>{row.idx}</FlexDiv>
          <Avatar alt="avatar" src={row.img} />
          <div style={{ display: "inline-block", margin: "5px" }}>{row.adr}</div>
          <ChatLog backgroundColor="#E47B7B">{row.text}</ChatLog>
          <Icon alt="thumbUp" src={"../../thumbUp.svg"} />
          <FlexDiv justifyContent="space-around" marginRight="15px">{row.up}</FlexDiv>
          <Icon alt="thumbDown" src={"../../thumbDown.svg"} />
          <FlexDiv justifyContent="space-around">{row.down}</FlexDiv>
        </MessageRow>
        <br />
      </>
    );
  });
};

const fakeData = () => {
  return (
    <FlexDiv>
      <FlexDiv>
        <h2>Top Voted Messages</h2>
        <Divider />
        {populateDashboard()}
      </FlexDiv>
      <H1>Tokenized Love</H1>
      <h4>Reap the rewards of matching and</h4>
      <h4>'Playing the game'</h4>
    </FlexDiv>
  );
};

// TODO(@kk) - this should vertically align, i had some trouble with it :/
const populateRecentMatches = () => {
  return ["../../avatar1.svg", "../../avatar2.svg", "../../avatar3.svg", "../../avatar4.svg"].map(img => {
    return <Avatar alt="Match avatar" src={img}/>;
  });
};

// TODO: does this need to be async?
const realData = ({ userAddr, userName, balance }) => {
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(true);

  return (
    // Hero box container
    <FlexDiv flexDirection="column" padding="0 35px" width="100%" alignItems="center">

      {/* Hero top container */}
      <FlexDiv width="100%" justifyContent="space-between" alignItems="center" marginBottom="30px">

        <FlexDiv alignItems="center">
          <DashboardAvatar alt="Profile avatar" src={"../../profileAvatar.svg"} style={{ marginRight: "30px" }}/>
          <FlexDiv flexDirection="column">
            <BoxH2>Hello: {userName}</BoxH2>
            <FlexDiv>Your Balance: {balance}</FlexDiv>
          </FlexDiv>
        </FlexDiv>

        <FlexDiv>
          {/* TODO: Link to messages view */}
          <BoxH2>Explore messages </BoxH2>
          <Icon alt="arrow-right" src={"../../arrow-right.svg"} marginLeft="30px" marginRight="30px" />
        </FlexDiv>

      </FlexDiv>

      <FlexDiv justifyContent="center" alignItems="center" width="100%" marginBottom="15px">
        <H1 marginRight="30px">Tokenized Love</H1>
        <BoxH2>Reap the rewards of matching and</BoxH2>
        <BoxH2>'Playing the game'</BoxH2>
      </FlexDiv>

      {/* Matches and messages container */}
      <FlexDiv>
        <FlexDiv
          marginRight="50px"
          flexDirection="column"
          width="200px"
          padding="25px"
          background="#e5caca"
          alignItems="center"
          borderRadius="40px"
        >
          <BoxH2 marginBottom="25px">Recent Matches</BoxH2>
          <FlexDiv flexDirection="column" height="100%" justifyContent="space-between">{populateRecentMatches()}</FlexDiv>
        </FlexDiv>


        <FakeMessageBox>
          <FlexDiv justifyContent="space-between" marginBottom="25px">
            <BoxH2>Top Voted Messages</BoxH2>
            <MessageBoxButton onClick={() => setShowGlobalDashboard(!showGlobalDashboard)}>Toggle Personal/Global View</MessageBoxButton>
          </FlexDiv>
          {populateDashboard(showGlobalDashboard ? fakeInputData : fakeInputData.filter(elem => elem.adr === userAddr))}
        </FakeMessageBox>
      </FlexDiv>

    </FlexDiv>
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
