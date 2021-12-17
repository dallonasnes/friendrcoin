import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";

const setNickname = ({ nickname }) => {
  // TODO: write this
  return true;
};

export default function Profile({ walletAddr, nickName }) {
  return (
    <>
      <div>
        <h1>Your Profile</h1>
        <div style={{ display: "inline-block" }}>
          <h2>Wallet Address *</h2>
        </div>
        <div style={{ display: "inline-block" }}>
          <h2>Your nickname</h2>
          <Input onChange={e => setNickname(e)}></Input>
          <Button>click here for more info</Button>
          <br />,
        </div>
      </div>
    </>
  );
}
