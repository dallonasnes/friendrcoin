import React, { useState, useEffect } from "react";
const { ethers } = require("ethers");
import { Messages } from ".";
import { Link } from "react-router-dom";
import { Button } from "antd";

const fetchMatches = async ({
  queue,
  setQueue,
  didFetchLastPage,
  setDidFetchLastPage,
  address,
  readContracts,
  limit,
  offset,
  setOffset,
}) => {
  {
    if (!didFetchLastPage && readContracts && readContracts.TinderChain) {
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

// On click I want to move to the message view

const renderMatches = ({ queue, address, readContracts, writeContracts, tx, faucetTx, yourLocalBalance }) => {
  return queue.map(profile => {
    return (
      <Link to={"/messages?" + profile._address}>
        <div style={{ marginTop: "20px" }}>
          <img alt="temp" src={"../../queueAvatar.svg"} />
          <p>{profile.name}</p>
        </div>
      </Link>
    );
  });
};

export default function Matches({
  isLoggedIn,
  address,
  readContracts,
  writeContracts,
  tx,
  faucetTx,
  yourLocalBalance,
}) {
  console.log("MATCHES IS-LOGGED-IN", isLoggedIn);
  const [queue, setQueue] = useState([]); // TODO: default shape
  const [offset, setOffset] = useState(0);
  const [didFetchLastPage, setDidFetchLastPage] = useState(false);
  const limit = 5;
  useEffect(() => {
    fetchMatches({
      queue,
      setQueue,
      didFetchLastPage,
      setDidFetchLastPage,
      address,
      readContracts,
      limit,
      offset,
      setOffset,
    });
  }, [readContracts, offset]);

  return (
    <>
      {queue.length > 0 ? (
        renderMatches({ queue, address, readContracts, writeContracts, tx, faucetTx, yourLocalBalance })
      ) : (
        <div>No matches at the moment</div>
      )}
    </>
  );
}
