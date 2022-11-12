import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Web3ContextProvider} from "./store/web3Context";
import {Web2ContextProvider} from "./store/web2Context";

ReactDOM.render(
  <>
    <Web3ContextProvider>
      <Web2ContextProvider>
        <App />
      </Web2ContextProvider>
    </Web3ContextProvider>
  </>,
  document.getElementById('root')
);
