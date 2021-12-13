import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/dallonasnes/toy-coin" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 TinderChain"
        subTitle="forkable Ethereum dev stack focused on fast product iteration"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
