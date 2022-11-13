import React, {useEffect, useState} from "react";
import { message } from "antd";
import { ethers, BigNumber } from "ethers";
import { generateNonce } from "../utils";
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import { storageData, getStorage, rmStorage } from './localStorage';

import config from "../config.js";

import GameContractArtifact from "../contracts/GameContract.json";
import GameContractAddress from "../contracts/GameContract_address.json";

const Web3Context = React.createContext({
    web3: null,
    signer: null,
    account: null,
    round: null,
    playersList: null,
    loading: false,
    canVote: false,
    gameOver: false,
    inGame: false,

    initWeb3Modal: () => {},
    resetGame: () => {},
    getStatus: () => {},
    joinGame: () => {},
    voteToSave: () => {},
    reveal: () => {},
    getColor: () => {},
    claimWinnings: () => {},
});

export const Web3ContextProvider = (props) => {
    const [web3, setWeb3] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [playersList, setPlayersList] = useState([]);
    const [canVote, setCanVote] = useState(false);
    const [round, setRound] = useState(0);
    const [inGame, setInGame] = useState(false);
    const [stillAlive, setStillAlive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingGame, setLoadingGame] = useState(false);
    const [gameContract, setGameContract] = useState(null);
    const [initEvent, setInitEvent] = useState(false);

    useEffect(() => {
        const initUrlWeb3 = async () => {
            setLoading(true)
            try {
                const provider = new ethers.providers.JsonRpcProvider(config.PROD.RPC);
                setWeb3(provider);
                console.log("No web3 instance injected, using Local web3.");
                initContracts(provider);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false)
            }
        }

        !web3 && initUrlWeb3()
    }, [web3]);

    useEffect(() => {
        if (window.ethereum) {
           window.ethereum.on('accountsChanged', accounts => window.location.reload())
           window.ethereum.on('chainChanged', () => window.location.reload())
           //window.ethereum.on('connect', (connectInfo) => { console.log({connectInfo}); })
        }
    }, [])

    useEffect(() => {
        if (!loading && !initEvent && gameContract && account && signer) {
            setInitEvent(true);
            gameContract.on("GameStarted", (startTime, random) => {
                message.open({
                    content: 'Game officially started.',
                    className: 'custom-class',
                    style: {
                      marginTop: '10%',
                    },
                });
                setInGame(true);
                setCanVote(true);
            });
            gameContract.on("EndRound", (round)=> {
                message.open({
                    content: 'The current round just done.',
                    className: 'custom-class',
                    style: {
                      marginTop: '10%',
                    },
                });
                setCanVote(!(round % 2));
                getStatus();
            });
            gameContract.on("PlayerRevealed", (player, team)=> {
                message.open({
                    content: 'A Player just reveal.',
                    className: 'custom-class',
                    style: {
                      marginTop: '10%',
                    },
                });
                getStatus();
            });
            gameContract.on("PlayerFlipped", (player)=> {
                message.open({
                    content: 'A Player just flipped.',
                    className: 'custom-class',
                    style: {
                      marginTop: '10%',
                    },
                });
                getStatus();
            });

            getStatus();
        }
    }, [loading, gameContract, account, signer])

    const initContracts = (provider) => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            GameContractAddress.Contract,
            GameContractArtifact.abi,
            signer);
        setGameContract(contract);
    }

    const initWeb3Modal = async () => {
        try {
            setLoading(true)
            const providerOptions = {
                walletlink: {
                    package: CoinbaseWalletSDK,
                    options: {
                        appName: "CenshorshipGame",
                        infuraId: ''
                    }
                },
                walletconnect: {
                    package: WalletConnect,
                    options: {
                        infuraId: ''
                    }
                }
            };

            const web3Modal = new Web3Modal({
                cacheProvider: true,// optional
                providerOptions // required
            });

            const instance = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(instance);
            const network = await provider.getNetwork();
            const signer = provider.getSigner();
            const balance = await signer.getBalance();
            const address = await signer.getAddress();
            const txCount = await signer.getTransactionCount();
            const newAcc = {
                balance: ethers.utils.formatEther(balance._hex),
                address,
                txCount,
                network,
            };
            setWeb3(provider);
            setSigner(signer);
            setAccount(newAcc);
            initContracts(provider);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false)
        }
    }

    const resetGame = () => {
        rmStorage('user_nonce');
        rmStorage('user_nonce2');
    }

    const getStatus = async (callback) => {
        try {
            console.log('getStatus');
            setLoadingGame(true);
            const playersAddr = await gameContract.playersList();
            const playersName = await gameContract.namesList();
            let redTeamCount = await gameContract.redTeamCount();
            redTeamCount = BigNumber.from(redTeamCount._hex).toString();
            let blueTeamCount = await gameContract.blueTeamCount();
            blueTeamCount = BigNumber.from(blueTeamCount._hex).toString();
            const stillAlive = await gameContract.stillAlive();
            let cutOffPoint = await gameContract.cutOffPoint();
            cutOffPoint = BigNumber.from(cutOffPoint._hex).toString();
            const round = await gameContract.round();
            const didVote = await gameContract.didVote();
            let gameStart = await gameContract.gameStart();
            gameStart = BigNumber.from(gameStart._hex).toString() + '000';
            const now = new Date().getTime();
            const timer = parseInt(gameStart) > 0 ? (parseInt(now) - parseInt(gameStart)) / 1000 / 60 : 0;
            const realRound = BigNumber.from(round._hex).toString();
            const roundForVote = !(realRound % 2);

            if (didVote && canVote) setCanVote(false);
            else if (!didVote && !canVote && round % 2 === 0 && parseInt(gameStart) > 0) setCanVote(true);
            console.log({ didVote });
            console.log({ canVote });
            console.log({ round });
            console.log({ gameStart });
            console.log({ redTeamCount });
            console.log({ blueTeamCount });
            console.log({ stillAlive });
            console.log({ gameOver: cutOffPoint === 0 && round > 0 });

            const listPlayers = playersAddr.map((elt, index) => ({ name: playersName[index], address: elt }));
            setGameOver(cutOffPoint === 0 && round)
            console.log({ inGame: !(cutOffPoint === 0 && round) && parseInt(gameStart) > 0 });
            setInGame(!(cutOffPoint === 0 && round) && parseInt(gameStart) > 0)
            setPlayersList(listPlayers);
            setRound(realRound);
            setStillAlive(stillAlive);
            console.log({ listPlayers });
            if (callback) 
                callback(
                    listPlayers,
                    [redTeamCount, blueTeamCount],
                    realRound,
                    roundForVote,
                    stillAlive,
                    timer);
        }
        catch (e) {
            console.log({ e });
            setLoadingGame(false);
        }

    }

    const joinGame = async (name, callback) => {
        try {
            console.log('joinGame');
            const playersAddr = await gameContract.playersList();
            if (playersAddr.indexOf(account.address) !== -1) {
                if (callback) callback('You already in the game.');
                return false;
            }

            setLoadingGame(true);
            const nonce = generateNonce();
            const nonce2 = generateNonce();
            await storageData('user_nonce', nonce);
            await storageData('user_nonce2', nonce2);
            const keccak = ethers.utils.solidityKeccak256(['bytes32', 'bytes32'], [ nonce, nonce2 ]);
            console.log({ nonce });
            console.log({ nonce2 });
            console.log({ keccak });
            const tx = await gameContract.joinGame(
                keccak,
                name,
                { gasPrice: ethers.utils.parseUnits('0.001', 'gwei'), gasLimit: 300000 }
            );

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback('You joined the game.');
                getStatus();
            });
            //if (callback) callback('Fail to join the game');
            //console.log('Fail to join the game');
        }
        catch (e) {
            console.log({ e });
            if (callback) callback('Fail to join the game');
            setLoadingGame(false);
        }
    }

    const voteToSave = async (players, weights, changeTeam, callback) => {
        try {
            setLoadingGame(true);
            const tx = await gameContract.voteToSave(
                players,
                weights,
                changeTeam,
                { gasPrice: ethers.utils.parseUnits('0.001', 'gwei'), gasLimit: 3000000 }
            );
            
            tx.wait().then(() => {
                setLoadingGame(false);
                setCanVote(false);
                if (callback) callback(true);
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback(false);
            setLoadingGame(false);
        }
    }

    const reveal = async (callback) => {
        try {
            setLoadingGame(true);
            const seed = await getStorage('user_nonce');
            const nonce = await getStorage('user_nonce2');
            const tx = await gameContract.reveal(
                seed,
                nonce,
                { gasPrice: ethers.utils.parseUnits('0.001', 'gwei'), gasLimit: 3000000 });

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback('You successfully reveal yourself.');
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback('Fail to reveal.');
            setLoadingGame(false);
        }
    }

    const getColor = async (callback) => {
        try {
            setLoadingGame(true);
            const seed = await getStorage('user_nonce');
            const color = await gameContract.getMyColor(seed);
            if (callback) callback('Your color is: ' + (color ? 'Red' : 'Blue'));
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback('Fail to get your color.');
            setLoadingGame(false);
        }
    }

    const claimWinnings = async (callback) => {
        try {
            setLoadingGame(true);
            const tx = await gameContract.claimWinnings({ gasPrice: ethers.utils.parseUnits('0.001', 'gwei'), gasLimit: 3000000 });

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback("YOUR TEAM WIN");
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback("YOUR TEAM FAIL");
            setLoadingGame(false);
        }
    }

    return (
        <Web3Context.Provider
            value={{
                web3,
                signer,
                loading,
                canVote,
                inGame,
                round,
                account,
                gameOver,
                playersList,
                initWeb3Modal,
                resetGame,
                getStatus,
                joinGame,
                voteToSave,
                reveal,
                getColor,
                claimWinnings,
            }}>
            {props.children}
        </Web3Context.Provider>
    )
}

export default Web3Context;