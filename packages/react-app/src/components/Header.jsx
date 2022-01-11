import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { LoggedInButton } from "./Button";
import { ButtonLink } from "./Links";
import SizeContext from "antd/lib/config-provider/SizeContext";

const getNotLoggedInButtons = () => {
  return ["Home", "About Us", "How It Works", "Contact"].map(text =>
    text === "Home" ? (
      <a href={"/"}>
        <LoggedInButton>
          <ButtonLink to={"/"}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ) : (
      <a href={`/${text.toLowerCase().replaceAll(" ", "-")}`}>
        <LoggedInButton>
          <ButtonLink to={`/${text.toLowerCase().replaceAll(" ", "-")}`}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ),
  );
};

const getLoggedInButtons = () => {
  return ["Home", "Queue", "Matches"].map(text =>
    text === "Home" ? (
      <a href={"/"}>
        <LoggedInButton>
          <ButtonLink to={"/"}>{text}</ButtonLink>
        </LoggedInButton>
      </a>
    ) : (
      <a href={`/${text.toLowerCase().replaceAll(" ", "-")}`}>
        <LoggedInButton>
          <Link to={`/${text.toLowerCase().replaceAll(" ", "-")}`}>{text}</Link>
        </LoggedInButton>
      </a>
    ),
  );
};

export default function Header({ isLoggedIn, setIsLoggedIn, userProfile }) {
  console.log("HEADER LOGGED IN:", isLoggedIn);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "30px" }}>
      <a href="/" style={{"font-size": "clamp(2rem, 1.5vw, 4rem)"}}>
        Matchcoin
      </a>
      <a><img alt="Matchcoin Logo" src={"../../logo-matchcoin.svg"} style={{"padding-left": "-50%"}}/></a>
      <div>{userProfile !== null ? getLoggedInButtons() : getNotLoggedInButtons()}</div>
      <div></div>
    </div>
  );
}
