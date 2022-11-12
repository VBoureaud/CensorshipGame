import { Spin, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from 'react-terminal-ui';
import Web3Context from "../store/web3Context";
import Doughnut from "../components/Doughnut";
import VoteList from "../components/VoteList";
import VoteSteps from "../components/VoteSteps";

//import Web2Context from "../store/web2Context";
//import config from "../config.js";
import "./Home.css";

export default function Home(props) {
  const [isAuth, setIsAuth] = useState(false);  
  const [inGame, setInGame] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [lineData, setLineData] = useState([
    <TerminalOutput>Welcome to Censhorship Game!&#128075;&#128377;&#127942;</TerminalOutput>,
    <TerminalOutput>Join the game and try to make your color team survive.</TerminalOutput>,
    <TerminalOutput></TerminalOutput>,
  ]);
  const {
    loading,
    account,
    initWeb3Modal,
  } = useContext(Web3Context);

  // DidMount
  useEffect(() => {
    let ld = [...lineData];
    ld.push(helpFn(commands));
    //ld.push(commands['vote'].action());
    setLineData(ld);
  }, []);

  // Did Connect
  useEffect(() => {
    if (account && !isAuth) {
      setIsAuth(true);
      addInput([
        'Welcome ' + account.address,
        'Connected on ' + account.network.name + ' - ' + account.network.chainId
      ]);
    }
  }, [account]);

  const helpFn = (commands) => ([
    <TerminalOutput key={0}>How does it work ?</TerminalOutput>,
    ...Object.keys(commands)
    .filter(elt => commands[elt].display)
    .filter(elt => commands[elt].auth ? isAuth : true)
    .filter(elt => commands[elt].game ? inGame : true)
    .map((elt, index) => <TerminalOutput key={index + 1}><span className="command">{elt}</span> {commands[elt].description}</TerminalOutput>),
  ]);

  const connectFn = () => {
    if (account)
      return <>Connected on {account.network.name} - {account.network.chainId} with {account.address}</>;
    else
      initWeb3Modal();
    return <></>;
  }

  const handleVote = (listVote, changeTeam) => {
    console.log({ listVote });
    console.log({ changeTeam });
    setReadOnly(false);
    message.success('Processing complete!');
    clearInput();
  }

  const commands = {
    ls: {
      action: () => <>total 0</>,
      description: '',
      auth: false,
      game: false,
      display: false,
    },
    pwd: {
      action: () => <>/navigator/{navigator.appCodeName}</>,
      description: '',
      auth: false,
      game: false,
      display: false,
    },
    connect: {
      action: connectFn,
      description: 'connect your wallet.',
      auth: false,
      game: false,
      display: true,
    },
    join: {
      action: () => [],
      description: 'join the game.',
      auth: true,
      game: false,
      display: true,
    },
    status: {
      action: () => <>
        <Doughnut values={[10,15]} />
        <TerminalOutput>There is <b>10</b> members censured from team blue and <b>15</b> from team red.</TerminalOutput>
        <TerminalOutput>We are <b>Wave 3</b>. You are still <b>alive</b>.</TerminalOutput>
        <TerminalOutput>Time to vote !</TerminalOutput>
      </>,
      description: 'display the game status.',
      auth: false,
      game: false,
      display: true,
    },
    vote: {
      action: () => 
        <VoteSteps
          onConfirm={handleVote}
        />,
      description: 'confirm your choices.',
      auth: true,
      game: true,
      display: true,
    },
    reveal: {
      action: () => [],
      description: 'reveal your identity.',
      auth: true,
      game: true,
      display: true,
    },
    /*flip: {
      action: () => [],
      description: 'change team.',
      auth: true,
      game: true,
      display: true,
    },*/
    claim: {
      action: () => [],
      description: 'get your rewards.',
      auth: true,
      game: true,
      display: true,
    },
    clear: {
      action: () => [],
      description: 'clean the display.',
      auth: false,
      game: false,
      display: true,
    },
    help: {
      action: helpFn,
      description: 'help function.',
      auth: false,
      game: false,
      display: true,
    },
  };

  function addInput (lines) {
    let ld = [...lineData];
    ld.push(...lines);
    setLineData(ld);
  }

  function clearInput () {
    setLineData([]);
  }

  function onInput (input) {
    let ld = [...lineData];
    ld.push(<TerminalInput>{input}</TerminalInput>);
    const keys = Object.keys(commands);
    const userInput = input.toLocaleLowerCase().trim();
    if (readOnly)
      ld.push(<TerminalOutput>You need to finish your voting process before continuing.</TerminalOutput>);
    else if (keys.indexOf(userInput) === -1)
      ld.push(<TerminalOutput>Unrecognized command</TerminalOutput>);
    else if (userInput === 'clear')
      ld = [];
    else {
      if ((commands[userInput].auth && !isAuth)
      || (commands[userInput].game && !inGame))
        ld.push(<TerminalOutput>Need permissions</TerminalOutput>);
      else {
        ld.push(commands[userInput].action(commands));
        if (userInput === 'vote') setReadOnly(true);
      }
    }
    setLineData(ld);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: '100vh',
      }}
    >
      <Spin 
        tip="Loading..."
        spinning={loading}>
        <Terminal
          name='Censhorship Game'
          colorMode={ ColorMode.Dark }
          onInput={ onInput }>
          { lineData.map((elt, index) => <span key={index}>{elt}</span>) }
        </Terminal>
      </Spin>
    </div>
  );
}
