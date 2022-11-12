import React, {useEffect, useState} from "react";
import { ethers, utils } from "ethers";
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
    loading: false,

    initWeb3Modal: () => {},
    resetGame: () => {},
    getStatus: () => {},
    joinGame: () => {},
    voteToSave: () => {},
    reveal: () => {},
    flip: () => {},
    claimWinnings: () => {},
});

export const Web3ContextProvider = (props) => {
    const [web3, setWeb3] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingGame, setLoadingGame] = useState(false);
    const [gameContract, setGameContract] = useState(null);

    useEffect(() => {
        const rand = ethers.Wallet.createRandom();
        console.log({ rand });
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

    const initContracts = (provider) => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            GameContractAddress.Contract,
            GameContractArtifact.abi,
            signer);
        setGameContract(contract);
        console.log({ contract });
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
        window.location.href = window.location.href;
    }

    const getStatus = async (callback) => {
        try {
            console.log('getStatus');
            setLoadingGame(true);
            const playersAddr = await gameContract.playersList();
            const playersName = await gameContract.namesList();
            const round = await gameContract.round();
            const gameStart = await gameContract.gameStart();
            console.log({ round });
            console.log({ gameStart });
            const listPlayers = playersAddr.map((elt, index) => ({ name: playersName[index], address: elt }));
            console.log({ listPlayers });
            if (callback) callback(listPlayers);
            //console.log('Fail to join the game');
        }
        catch (e) {
            console.log({ e });
            //if (callback) callback('Fail to join the game');
            console.log('Fail');
            setLoadingGame(false);
        }

    }

    const joinGame = async (name, callback) => {
        try {
            console.log('joinGame');
            setLoadingGame(true);
            const nonce = generateNonce();
            const nonce2 = generateNonce();
            await storageData('user_nonce', nonce);
            await storageData('user_nonce2', nonce2);

            console.log({ nonce });
            console.log({ nonce2 });
            const keccak = ethers.utils.solidityKeccak256(['bytes32', 'bytes32'], [ nonce, nonce2 ]);
            console.log({ keccak });
            const tx = await gameContract.joinGame(
                keccak,
                name,
            );

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback('You joined the game.');
                console.log('You joined the game.');
            });
            //if (callback) callback('Fail to join the game');
            //console.log('Fail to join the game');
        }
        catch (e) {
            console.log({ e });
            if (callback) callback('Fail to join the game');
            console.log('Fail to join the game');
            setLoadingGame(false);
        }
    }

    const voteToSave = async (players, weights, callback) => {
        try {
            const playersSorted = players.sort();
            setLoadingGame(true);
            const tx = await gameContract.voteToSave(players, weights);
            
            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback(true);
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback(false);
            setLoadingGame(false);
        }
    }

    const reveal = async (seed, nonce, callback) => {
        try {
            setLoadingGame(true);
            const tx = await gameContract.reveal(seed, nonce);

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback(true);
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback(false);
            setLoadingGame(false);
        }
    }

    const flip = async (callback) => {
        try {
            setLoadingGame(true);
            const tx = await gameContract.flip();

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback(true);
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback(false);
            setLoadingGame(false);
        }
    }


    const claimWinnings = async (callback) => {
        try {
            setLoadingGame(true);
            const tx = await gameContract.claimWinnings();

            tx.wait().then(() => {
                setLoadingGame(false);
                if (callback) callback(true);
            });
            setLoadingGame(false);
        } catch (e) {
            console.log({ e });
            if (callback) callback(false);
            setLoadingGame(false);
        }
    }

    return (
        <Web3Context.Provider
            value={{
                web3,
                signer,
                loading,
                account,
                initWeb3Modal,
                resetGame,
                getStatus,
                joinGame,
                voteToSave,
                reveal,
                flip,
                claimWinnings,
            }}>
            {props.children}
        </Web3Context.Provider>
    )
}

export default Web3Context;