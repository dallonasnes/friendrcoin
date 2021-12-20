import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { HeaderButton } from "../components/styles/Button";
import { ButtonLink } from "./styles/Links";
import { Nav } from "./styles/Navs";
import { BoxH2, Logo } from "../components/styles/Headings";
import { FlexDiv } from "../components/styles/Div";
import { LogoImg } from "./styles/Img";

// TODO(@kk) - can use "antd" library for styling

const getNotLoggedInButtons = () => {
  return ["About Us", "How It Works", "Contact"].map(text => (
    <HeaderButton background="transparent" hoverBackground="#dba38b">
      <ButtonLink to={`/${text.toLowerCase().replace(" ", "-")}`}>{text}</ButtonLink>
    </HeaderButton>
  ));
};

const getLoggedInButtons = () => {
  return ["Dashboard", "Queue", "Profile", "Messages"].map(text => (
    <HeaderButton background="transparent" hoverBackground="#dba38b">
      <ButtonLink to={`/${text.toLowerCase().replace(" ", "-")}`}>{text}</ButtonLink>
    </HeaderButton>
  ));
};

// TODO: can change isLoggedIn between true and false for testing views
export default function Header({ isLoggedIn }) {
  return (
    <Nav justifyContent="space-between" padding="30px">
      <FlexDiv>
        <Logo href="https://github.com/dallonasnes/tinder-chain" target="_blank" rel="noopener noreferrer">
        Matchcoin</Logo>
        <LogoImg alt="Matchcoin Logo" src={"../../logo-matchcoin.svg"} />
      </FlexDiv>
      <FlexDiv marginRight="200px">{isLoggedIn ? getLoggedInButtons() : getNotLoggedInButtons()}</FlexDiv>
    </Nav>
  );
}
