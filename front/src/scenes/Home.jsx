import { Spin, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { addslashes } from "../utils";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from 'react-terminal-ui';
import Web3Context from "../store/web3Context";
import Doughnut from "../components/Doughnut";
import VoteSteps from "../components/VoteSteps";

//import Web2Context from "../store/web2Context";
import config from "../config.js";
import "./Home.css";

export default function Home(props) {
  const [isAuth, setIsAuth] = useState(false);  
  //const [inGame, setInGame] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [lineData, setLineData] = useState([
    <TerminalOutput></TerminalOutput>,
  ]);
  const {
    loading,
    loadingGame,
    canVote,
    account,
    inGame,
    round,
    stillAlive,
    gameOver,
    initWeb3Modal,
    joinGame,
    reveal,
    getStatus,
    playersList,
    voteToSave,
    getColor,
    claimWinnings,
  } = useContext(Web3Context);

  // DidMount
  useEffect(() => {
    let ld = [...lineData];
    ld.push(helpFn(commands));
    //ld.push(commands['vote'].action());
    //ld.push(commands['join'].action(null, 'bob'));
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
    <TerminalOutput key={0}>Welcome to the <b>Censhorship Game</b>!&#128075;&#128377;&#127942;</TerminalOutput>,
    <TerminalOutput key={1}>Join the game and try to make your color team survive.</TerminalOutput>,
    <TerminalOutput key={2}>We are deployed on <b>Optimism Goerli</b>.</TerminalOutput>,
    <TerminalOutput key={3}></TerminalOutput>,
    <TerminalOutput key={4}>How does it work ?</TerminalOutput>,
    ...Object.keys(commands)
    .filter(elt => commands[elt].display)
    .filter(elt => commands[elt].auth ? isAuth : true)
    .filter(elt => commands[elt].game ? inGame : true)
    .map((elt, index) => <TerminalOutput key={index + 5}><span className="command">{elt}</span> {commands[elt].description}</TerminalOutput>),
  ]);

  const connectFn = () => {
    if (account)
      return <>Connected on {account.network.name} - {account.network.chainId} with {account.address}</>;
    else
      initWeb3Modal();
    return <></>;
  }

  const handleVote = (listVote, changeTeam) => {
    const listVoteSorted = [];
    const addresses = listVote.map(elt => elt.address).sort();
    let i = 0;
    while (listVoteSorted.length !== listVote.length) {
      const current = addresses[listVoteSorted.length];
      if (listVote[i].address === current) {
        listVoteSorted.push(listVote[i]);
        i = 0;
      } else {
        i++;
      }
    }

    const weightSorted = listVoteSorted.map(elt => elt.value);
    voteToSave(addresses, weightSorted, changeTeam, (opt) => {
      setReadOnly(false);
      if (opt) message.success('Processing complete!');
      else message.error('Fail during process.');
      clearInput();
    });
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
      action: (commands, name) => { joinGame(name, (text) => addInput([<TerminalInput>join {name}</TerminalInput>, text])) },
      description: 'join a new game.',
      auth: true,
      game: false,
      display: true,
      needArg: true,
      example: 'join username'
    },
    status: {
      action: () => { 
        getStatus((listPlayers, listDead, round, roundForVote, stillAlive, timer) => addInput([
          <TerminalInput>status</TerminalInput>,
          <TerminalOutput>{!timer ? <>The game didn't start yet</> : <>The game is running since {parseInt(timer)} minutes</>}</TerminalOutput>,
          <Doughnut values={listDead} />,
          <TerminalOutput>There is <b>{listDead[0]}</b> members censured from team red and <b>{listDead[1]}</b> from team blue.</TerminalOutput>,
          <TerminalOutput style={{ display: !gameOver ? 'block' : 'none' }}>{!gameOver ? <>We are in <b>{round % 2 ? 'reveal mode' : 'Wave ' + round}</b>. You are <b>{stillAlive ? 'alive' : 'dead'}</b>.</> : <></>}</TerminalOutput>,
          <TerminalOutput>Total <b>{listPlayers.length}</b> players.</TerminalOutput>,
          <TerminalOutput style={{ display: !gameOver ? 'block' : 'none' }}>{!gameOver && roundForVote ? <>Time to vote !</> : <>Not time to vote</>}</TerminalOutput>,
          <TerminalOutput style={{ display: gameOver ? 'block' : 'none' }}>{gameOver && <>Game is close.</>}</TerminalOutput>,
        ]));
      },
      description: 'display the game status.',
      auth: true,
      game: false,
      display: true,
    },
    vote: {
      action: () => {
        const noVoteTime = <>You cannot vote yet.</>;
        const voteTime = (<VoteSteps
          account={account}
          listVote={playersList.map((elt, id) => ({ id, ...elt, vote: 0 }))}
          onConfirm={handleVote}
        />);
        if (canVote) setReadOnly(true);
        return canVote ? voteTime : noVoteTime;
      },
      description: 'confirm your choices.',
      auth: true,
      game: true,
      display: true,
    },
    reveal: {
      action: () => {
        if (!(round % 2) || stillAlive) return (<>You cannot reveal yet.</>);
        else if (round % 2) {
          reveal((message) => addInput([
            <TerminalInput>reveal</TerminalInput>,
            <TerminalOutput>{message}</TerminalOutput>,
          ]))
        }
      },
      description: 'reveal your identity.',
      auth: true,
      game: true,
      display: true,
    },
    claim: {
      action: () => { claimWinnings((text) => addInput([<TerminalInput>claim</TerminalInput>, text])) },
      description: 'get your rewards.',
      auth: true,
      game: true,
      display: true,
    },
    color: {
      action: () => { getColor((text) => addInput([<TerminalInput>color</TerminalInput>, text])) },
      description: 'get your color.',
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
    rules: {
      action: () => [
        <TerminalOutput key="0"><b>{'Rules of the game'}</b></TerminalOutput>,
        <TerminalOutput key="1">{'- there are 2 teams = 2 colors'}</TerminalOutput>,
        <TerminalOutput key="2">{'- when the game starts you get assigned a color '}</TerminalOutput>,
        <TerminalOutput key="3">{'  - you are the only one knowing your color'}</TerminalOutput>,
        <TerminalOutput key="4">{'- every round you can choose which participant you want to save'}</TerminalOutput>,
        <TerminalOutput key="5">{'- the goal of the game is to be on the winning team/color'}</TerminalOutput>,
        <TerminalOutput key="6">{'- the rounds (voting period) repeat until the last person is “killed”'}</TerminalOutput>,
        <TerminalOutput key="7">{'- each round you are assigned 100 points, choose:'}</TerminalOutput>,
        <TerminalOutput key="8">{' - who you want to save from the list of participants'}</TerminalOutput>,
        <TerminalOutput key="9">{'   - can’t vote for yourself '}</TerminalOutput>,
        <TerminalOutput key="10">{'   - there’s a limited time to vote (10min), or until every player has voted '}</TerminalOutput>,
        <TerminalOutput key="11">{' - a value (points) to assign to each participant you want to save'}</TerminalOutput>,
        <TerminalOutput key="12">{'    - keep in mind it’s quadratic voting '}</TerminalOutput>,
        <TerminalOutput key="13">{' - if you want to flip side (change color) '}</TerminalOutput>,
        <TerminalOutput key="14">{'    - only if you’re not dead'}</TerminalOutput>,
        <TerminalOutput key="15">{'    - nobody will know...'}</TerminalOutput>,
      ],
      description: 'rules of the game.',
      auth: false,
      game: false,
      display: true,
    },
    contact: {
      action: () => [
        <TerminalOutput>Built at ETHBrno 2022 - v{config.version}</TerminalOutput>,
        <TerminalOutput>Find us on <a rel="noreferrer" target="_blank" href="https://github.com/VBoureaud/CensorshipGame">Github</a></TerminalOutput>,
      ],
      description: 'keep in touch.',
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
    const userInput = input.toLocaleLowerCase().trim().split(' ')[0];
    const params = input.toLocaleLowerCase().trim().split(' ').length > 1 ? input.toLocaleLowerCase().trim().split(' ')[1] : '';

    if (readOnly || loadingGame)
      ld.push(<TerminalOutput>You need to finish or wait for your current process before continuing.</TerminalOutput>);
    else if (keys.indexOf(userInput) === -1)
      ld.push(<TerminalOutput>Unrecognized command</TerminalOutput>);
    else if (userInput === 'clear')
      ld = [];
    else {
      if ((commands[userInput].auth && !isAuth)
      || (commands[userInput].game && !inGame))
        ld.push(<TerminalOutput>Need permissions</TerminalOutput>);
      else if (commands[userInput].needArg && !params)
        ld.push(<TerminalOutput>Format should be: {commands[userInput].example}</TerminalOutput>);
      else {
        ld.push(commands[userInput].action(commands, addslashes(params)));
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
        style={{ zIndex: 1 }}
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
