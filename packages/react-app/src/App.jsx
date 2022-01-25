import { Alert, Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useBurnerSigner,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import { Account, Header, ThemeSwitch, Faucet, FaucetHint } from "./components";
import { NETWORKS, ALCHEMY_KEY, DEBUG_TRANSACTIONS } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, Queue, Profile, Matches, Messages } from "./views";
import { useStaticJsonRPC } from "./hooks";
// header and footer
import Footer from "./components/Footer";
const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.matic; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const NETWORKCHECK = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = ["matic"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  /// 📡 What chain are your contracts deployed to?
  const targetNetwork = NETWORKS[selectedNetwork]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;
  // load all your providers
  const localProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);
  const mainnetProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setIsLoggedIn(false);
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;

  // Use a local faucet for debug mode instead of a network transaction
  const tx = DEBUG_TRANSACTIONS ? Transactor(localProvider, gasPrice) : Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));
    setIsLoggedIn(true);

    provider.on("chainChanged", chainId => {
      // console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      // console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      // console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [isLoggedIn, setIsLoggedIn] = DEBUG_TRANSACTIONS
    ? useState(true)
    : useState(Boolean(web3Modal && web3Modal.cachedProvider));

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function getUserProfile() {
      if (address && readContracts && readContracts.FriendrChain) {
        try {
          const res = await readContracts.FriendrChain.getUserProfile(address);
          debugger;
          // Check for non-nil created TS
          if (res && res.created_ts._hex !== "0x00") {
            setUserProfile(res);
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          console.log("ERROR IN FETCHING USER PROFILE IN MAIN PAGE LOAD", e);
          setUserProfile(null);
        }
      }
    }
    getUserProfile();
  }, [address, readContracts]);

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userProfile={userProfile} />

      <Switch>
        <Route exact path="/">
          <Home
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            address={address}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
          />
        </Route>
        <Route exact path="/queue">
          <Queue
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            address={address}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
        <Route exact path="/matches">
          <Matches
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            address={address}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
        <Route exact path="/messages">
          <Messages
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            sender={address}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          {/*TODO(@kk,@dallon): Minimized is set to true, which hides account balance. Can set to false later*/}
          <Account
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
            minimized={true}
          />
        </div>
      </div>
      <Footer />
      <br />
    </div>
  );
}

export default App;
