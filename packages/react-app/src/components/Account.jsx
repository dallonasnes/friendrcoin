import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";
import { WalletButton } from "../components/styles/Button";

/*
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

  <Account
    address={address}
    localProvider={localProvider}
    userProvider={userProvider}
    mainnetProvider={mainnetProvider}
    price={price}
    web3Modal={web3Modal}
    loadWeb3Modal={loadWeb3Modal}
    logoutOfWeb3Modal={logoutOfWeb3Modal}
    blockExplorer={blockExplorer}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide price={price} of ether and get your balance converted to dollars
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
*/

export default function Account({
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  const { currentTheme } = useThemeSwitcher();

  return (
    <div>
      {minimized ? (
        ""
      ) : (
        <span>
          {address ? (
            <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
          ) : (
            "Connecting..."
          )}
          <Balance address={address} provider={localProvider} price={price} />
          <Wallet
            address={address}
            provider={localProvider}
            signer={userSigner}
            ensProvider={mainnetProvider}
            price={price}
            color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
          />
        </span>
      )}
      {web3Modal &&
        (web3Modal?.cachedProvider ? (
          // eslint-disable-next-line prettier/prettier
          <WalletButton
            background="#E95353"
            hoverBackground="#E5CACA"
            key="logoutbutton"
            onClick={logoutOfWeb3Modal}
          >
            Logout
          </WalletButton>
        ) : (
          <WalletButton
          background="#E95353"
          hoverBackground="#E5CACA"
            key="loginbutton"
            /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
            onClick={loadWeb3Modal}
          >
            Connect
          </WalletButton>
        ))}
    </div>
  );
}
