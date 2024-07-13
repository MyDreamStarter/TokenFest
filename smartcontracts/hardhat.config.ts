require("dotenv").config();
import dotenv from "dotenv"
dotenv.config();
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-truffle5"
import "@nomiclabs/hardhat-waffle"
import "hardhat-gas-reporter"
import "solidity-coverage"

import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'

import { task } from "hardhat/config"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// TESTNET
const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL || "https://baseSepolia-mumbai.g.alchemy.com/v2/api-key"
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ETH-RPC-URL"
// MAINNET
const baseSepolia_RPC_URL = process.env.baseSepolia_RPC_URL || "https://baseSepolia-mainnet.g.alchemy.com/v2/api-key"

const MNEMONIC = process.env.MNEMONIC || "ajkskjfjksjkf ssfaasff asklkfl klfkas dfklhao asfj sfk klsfjs fkjs"
const PRIVATE_KEY = process.env.PRIVATE_KEY

const baseSepoliaSCAN_API_KEY = process.env.baseSepoliaSCAN_API_KEY || "lklsdkskldjklgdklkld"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key"


module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    // TESTNET NETWORKS
    maticmum: {
      networkId: 80001,
      url: MATICMUM_RPC_URL,
      accounts: [PRIVATE_KEY],
      // accounts: {
      //   mnemonic: MNEMONIC,
      // },
    },
    sepolia: {
      networkId: 11155111,
      url: SEPOLIA_RPC_URL,
      accounts : [PRIVATE_KEY],
      // accounts: {
      //   mnemonic: MNEMONIC,
      // },
    },
    // MAINNET NETWORKS
    baseSepolia: {
      networkId: 137,
      url: baseSepolia_RPC_URL,
      // accounts: [`0x${ETH_PRIVATE_KEY}`],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      baseSepoliaMumbai : baseSepoliaSCAN_API_KEY,
      sepolia : ETHERSCAN_API_KEY
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};