const config = {
  "api": "https://127.0.0.1:8080",
  "version": "0.1.0",
  "LOCAL": {
    "CHAIN_ID": 1337,
    "RPC": "http://127.0.0.1:8545",
    "NATIVE_DECIMAL": '18',
    "STABLE_DECIMAL": '6',
  },
  "PROD": {
    "CHAIN_ID": 10,
    //"RPC": "https://opt-mainnet.g.alchemy.com/v2/ztRhUG0m12snNlL1UcxtBzYMtv9yCs0f",
    "RPC": "https://opt-goerli.g.alchemy.com/v2/khOwzTpgLhQosFzHkANN1t504QNzdBqJ",
    "NATIVE_DECIMAL": '18',
    "STABLE_DECIMAL": '6',
  },
}

export default config;