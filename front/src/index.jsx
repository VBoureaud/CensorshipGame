import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Web3ContextProvider} from "./store/web3Context";

ReactDOM.render(
  <>
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  </>,
  document.getElementById('root')
);
