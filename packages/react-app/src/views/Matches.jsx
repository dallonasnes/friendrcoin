import React, { useState, useEffect } from "react";
const { ethers } = require("ethers");

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

const renderMatches = ({ queue }) => {
  return queue.map(profile => {
    return (
      <div style={{ marginTop: "20px" }}>
        <img alt="temp" src={"../../queueAvatar.svg"} />
        <p>{profile.name}</p>
      </div>
    );
  });
};

export default function Matches({ isLoggedIn, address, readContracts }) {
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

  return <>{queue.length > 0 ? renderMatches({ queue }) : <div>No matches at the moment</div>}</>;
}
