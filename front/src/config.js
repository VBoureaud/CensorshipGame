const config = {
  "api": "https://127.0.0.1:8080",
  "version": "0.0.1",
  "LOCAL": {
    "CHAIN_ID": 1337,
    "RPC": "http://127.0.0.1:8545",
    "NATIVE_DECIMAL": '18',
    "STABLE_DECIMAL": '6',
  },
  "PROD": {
    "CHAIN_ID": 4,
    "RPC": "https://rinkeby.infura.io/v3/",
    "NATIVE_DECIMAL": '18',
    "STABLE_DECIMAL": '6',
  },
}

export default config;