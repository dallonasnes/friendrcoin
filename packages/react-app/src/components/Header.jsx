import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { LoggedInButton } from "./Button";
import { ButtonLink } from "./Links";

const getNotLoggedInButtons = () => {
  return ["Home", "About the Project"].map(text =>
    text === "Home" ? (
      <a href="/">
        <LoggedInButton>
          <ButtonLink to={"/"}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ) : (
      <a href="https://github.com/dallonasnes/friendrcoin" target="_blank">
        <LoggedInButton>
          <ButtonLink to={"https://github.com/dallonasnes/friendrcoin"}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ),
  );
};

const getLoggedInButtons = () => {
  return ["Home", "Queue", "Matches"].map(text =>
    text === "Home" ? (
      <a href="/">
        <LoggedInButton>
          <ButtonLink to={"/"}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ) : (
      <LoggedInButton>
        <Link to={`/${text.toLowerCase().replaceAll(" ", "-")}`}>{text}</Link>
      </LoggedInButton>
    ),
  );
};

export default function Header({ userProfile }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "30px" }}>
      <a href="/">
        FriendrCoin
        <img alt="FriendrCoin Logo" src={"../../logo-friendrcoin.svg"} />
      </a>
      <div>{userProfile !== null ? getLoggedInButtons() : getNotLoggedInButtons()}</div>
      <div></div>
    </div>
  );
}
