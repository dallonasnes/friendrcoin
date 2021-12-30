import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
      try {
        const [nextPage, nextOffset] = await readContracts.TinderChain.getRecentMatches(address, limit, offset);
        if (nextPage && nextPage.length > 0) {
          const tmpQueue = queue.concat(nextPage);
          setQueue(tmpQueue);
        }
        if (parseInt(nextOffset._hex) === offset || nextPage.length < limit) {
          setDidFetchLastPage(true);
        }
        setOffset(parseInt(nextOffset._hex));
      } catch (e) {
        console.log(e);
      }
    }
  }
};

const renderMatches = ({ queue }) => {
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

export default function Matches({ isLoggedIn, address, readContracts }) {
  console.log("MATCHES IS-LOGGED-IN", isLoggedIn);
  const [queue, setQueue] = useState([]);
  const [offset, setOffset] = useState(0);
  const [didFetchLastPage, setDidFetchLastPage] = useState(false);
  const limit = 100;
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
        renderMatches({ queue })
      ) : isLoggedIn ? (
        <div>No matches at the moment</div>
      ) : (
        <div>No matches at the moment. Connect your wallet for better luck</div>
      )}
    </>
  );
}
