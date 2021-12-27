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
    if (queue.length <= 2 && !didFetchLastPage && readContracts && readContracts.TinderChain) {
      // have at least two before fetching more
      const [nextPage, nextOffset] = await readContracts.TinderChain.getRecentMatches(address, limit, offset);
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

const renderMessages = ({ queue }) => {
  return queue.map(message => {
    return (
      <div style={{ marginTop: "20px" }}>
        <p>{message.text}</p>
        <p>{message.created_ts}</p>
      </div>
    );
  });
};

export default function Messages({ isLoggedIn, sender, readContracts }) {
  debugger;
  const location = useLocation();
  const { recipient } = location.state;
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

  return <>{queue.length > 0 ? renderMessages({ queue }) : <div>No messages at the moment</div>}</>;
}
