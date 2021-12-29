import Checkbox from "antd/lib/checkbox/Checkbox";
import React, { useState, useEffect } from "react";
const { ethers } = require("ethers");
import { useLocation } from "react-router-dom";

const fetchMessages = async ({
  queue,
  setQueue,
  didFetchLastPage,
  setDidFetchLastPage,
  sender,
  recipient,
  readContracts,
  limit,
  offset,
  setOffset,
}) => {
  {
    if (!didFetchLastPage && readContracts && readContracts.TinderChain) {
      // have at least two before fetching more
      const [nextPage, nextOffset] = await readContracts.TinderChain.getRecentMessagesForMatch(
        sender,
        recipient,
        limit,
        offset,
      );
      if (nextPage && nextPage.length > 0) {
        const tmpQueue = queue.concat(nextPage);
        setQueue(tmpQueue);
      }
      if (parseInt(nextOffset._hex) === offset || nextPage.length < limit) {
        setDidFetchLastPage(true);
      }
      setOffset(parseInt(nextOffset._hex));
    }
  }
};

export default function Messages({ isLoggedIn, sender, readContracts, writeContracts, tx, faucetTx }) {
  const location = useLocation();
  const recipient = location.search.substring(1);
  const [queue, setQueue] = useState([]); // TODO: default shape
  const [offset, setOffset] = useState(0);
  const [didFetchLastPage, setDidFetchLastPage] = useState(false);
  const limit = 5;
  useEffect(() => {
    fetchMessages({
      queue,
      setQueue,
      didFetchLastPage,
      setDidFetchLastPage,
      sender,
      recipient,
      readContracts,
      limit,
      offset,
      setOffset,
    });
  }, [readContracts, offset]);

  const _sendMessage = ({ messageText, isPublic }) => {
    faucetTx({
      to: sender,
      value: ethers.utils.parseEther("0.01"),
    });
    faucetTx(writeContracts.TinderChain.sendMessage(sender, recipient, messageText, isPublic));
    // Now need to refresh page to pick up the sent message
    setTimeout(() => document.location.reload(), 200);
  };

  // add timeout on calls to prevent nonce issue with transactions
  const sendMessage = () => {
    // get message text
    const messageText = document.getElementsByClassName("message-box")[0].value;
    if (messageText === "") {
      alert("You clicked send without putting any text");
      return;
    }
    const isPublic = document.getElementById("public-checkbox").checked;
    setTimeout(() => _sendMessage({ messageText, isPublic }), 500);
  };

  const renderMessagesPage = () => {
    return (
      <>
        {queue.map(message => {
          return <p>{message.text}</p>;
        })}
        <div>
          <input class="message-box"></input>
          <Checkbox id="public-checkbox">Public</Checkbox>
          <button onClick={() => sendMessage()}>Send</button>
        </div>
      </>
    );
  };

  return <>{queue.length > 0 ? renderMessagesPage() : <div>Loading your message history</div>}</>;
}
