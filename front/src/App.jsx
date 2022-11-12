import React, {useContext} from 'react';
import Web3Context from "./store/web3Context";
import config from "./config";

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import "antd/dist/antd.css";
import { Layout, Typography } from "antd";

import Home from "./scenes/Home";

const { Footer } = Layout;
const { Text } = Typography;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
  },
  header: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    padding: 0,
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerContainer: {
    maxWidth: '1056px',
    padding: '0 16px',
    margin: 'auto',
    display: "flex",
    flexWrap: "wrap",
    height: '100%',
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
  },
  rightHeader: {
    display: 'flex',
    alignItems: 'center'
  },
  accountBox: {
    background: '#333',
    color: 'white',
    padding: '0 14px',
    boxSizing: 'border-box',
    borderRadius: '13px',
    lineHeight: '35px',
    letterSpaccing: '1px',
    marginRight: '2px',
    position: 'relative',
    top: '8px',
  },
};

function App() {
  const {
    web3,
    signer,
  } = useContext(Web3Context);
  const isLogged = (web3 && signer);

  return (
    <Layout>
      <Router>
        {/*<div style={styles.header}>
          <div style={styles.headerContainer}>
            <Link to="/" style={{ display: "flex", flexDirection: "column", lineHeight: "15px", color: '#333' }}>
              <Title style={{ lineHeight: '35px', margin: 0 }} level={5}>Ruse</Title>
              <p>Time to Ruse on <b>Rinkeby.</b></p>
            </Link>
            <div style={styles.rightHeader}>
              {!account && <p style={styles.accountBox}>
                <span rel="noreferrer" style={{ cursor: 'pointer', color: 'white' }} onClick={initWeb3Modal}>Connect your wallet</span>
              </p>}
              {account && <p style={styles.accountBox}>
                {account.network.name} - {account.network.chainId}
              </p>}
              {account && <p style={styles.accountBox}>
                {account.address.slice(0, 5) + '...' + account.address.slice(account.address.length - 5, account.address.length)}
              </p>}
              <p style={styles.accountBox}>
                <a rel="noreferrer" style={{ color: 'white' }} target="_blank" href="https://twitter.com/p_pfinance">Twitter</a>
              </p>
            </div>
          </div>
        </div>*/}

        <div style={styles.content}>
          <Switch>
            <Route exact path="/">
              <Home isLogged={isLogged} />
            </Route>
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer style={{ textAlign: "center", background: "#252a33" }}>
        <Text style={{ display: "block", color: "white" }}>Built at ETHBrno 2022 - v{config.version}</Text>
        <Text style={{ display: "block", color: "white" }}>Find us on <a rel="noreferrer" target="_blank" href="https://github.com/VBoureaud/CensorshipGame">Github</a></Text>
      </Footer>
    </Layout>
  );
}

export default App;
