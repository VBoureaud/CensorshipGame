import React, {useEffect, useState} from "react";
import { ethers, utils } from "ethers";
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";

import config from "../config.js";

//import NftContractArtifact from "../contracts/NftContract.json";
//import NftContractAddress from "../contracts/NftContract_address.json";

const Web3Context = React.createContext({
    web3: null,
    signer: null,
    account: null,
    loading: false,

    initWeb3Modal: () => {},
});

export const Web3ContextProvider = (props) => {
    const [web3, setWeb3] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initUrlWeb3 = async () => {
            setLoading(true)
            try {
                const provider = new ethers.providers.JsonRpcProvider(config.PROD.RPC);
                setWeb3(provider);
                console.log("No web3 instance injected, using Local web3.");
                //initContracts(provider);
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
        /*const nftContract = new ethers.Contract(
            NftContractAddress.Contract,
            NftContractArtifact.abi,
            signer);
        setNftContract(nftContract);*/
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
            //initContracts(provider);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false)
        }
    }

    return (
        <Web3Context.Provider
            value={{
                web3,
                signer,
                loading,
                initWeb3Modal,
                account,
            }}>
            {props.children}
        </Web3Context.Provider>
    )
}

export default Web3Context;