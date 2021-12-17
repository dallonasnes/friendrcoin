import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";

const checkForMatch = () => {
  const isMatch = true; // TODO: await query for match
  return isMatch;
};

// TODO: can change yourLocalBalance between 0 and 1 to test different views
// TODO: can test "match" page by clicking on heart button (user must have at least 1 token in yourLocalBalance variable)
// ^ it uses a timer so shows for 5 seconds with a button to start message, then goes back to match screen
export default function Queue({ yourLocalBalance }) {
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

  const swipePage = () => {
    return (
      <div>
        {yourLocalBalance ? "Start Swiping, Get Matching" : "Sorry, No Token No Matchy"}
        {yourLocalBalance ? (
          <div style={{ marginTop: "20px" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
          </div>
        ) : (
          <div style={{ marginTop: "20px", filter: "blur(8px)" }}>
            <img alt="temp" src={"../../queueAvatar.svg"} />
          </div>
        )}

        {yourLocalBalance ? (
          <>
            <Button style={{ backgroundColor: "red" }}>
              <img alt="x" src={"../../x-mark.svg"} />
            </Button>
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => (checkForMatch() ? setDidJustMatch(true) : setDidJustMatch(false))}
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

  return <>{didJustMatch ? matchPage() : swipePage()}</>;
}
