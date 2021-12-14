import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/dallonasnes/tinder-chain" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 TinderChain"
        subTitle="Tinder on ethereum with token rewards for best messages"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
