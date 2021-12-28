import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { LoggedInButton } from "./Button";
import { ButtonLink } from "./Links";

const getNotLoggedInButtons = () => {
  return ["About Us", "How It Works", "Contact"].map(text => (
    <LoggedInButton>
      <ButtonLink to={`/${text.toLowerCase().replace(" ", "-")}`}>{text}</ButtonLink>
    </LoggedInButton>
  ));
};

const getLoggedInButtons = () => {
  return ["Dashboard", "Queue", "Profile", "Messages"].map(text => (
    <LoggedInButton>
      <Link to={`/${text.toLowerCase().replace(" ", "-")}`}>{text}</Link>
    </LoggedInButton>
  ));
};

export default function Header({ isLoggedIn, setIsLoggedIn }) {
  console.log("HEADER LOGGED IN:", isLoggedIn);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "30px" }}>
      <a href="https://github.com/dallonasnes/tinder-chain" target="_blank" rel="noopener noreferrer">
        Matchcoin
        <img alt="Matchcoin Logo" src={"../../logo-matchcoin.svg"} />
      </a>
      <div>{isLoggedIn ? getLoggedInButtons() : getNotLoggedInButtons()}</div>
      <div></div>
    </div>
  );
}
