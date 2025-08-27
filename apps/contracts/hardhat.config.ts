import "dotenv/config";
import { type HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configByNetwork } from "./config.js";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    "base-mainnet": {
      type: "http",
      url: configByNetwork["base-mainnet"].rpcUrl,
      accounts: [configByNetwork["base-mainnet"].privateKey],
    },
    "base-sepolia": {
      type: "http",
      url: configByNetwork["base-sepolia"].rpcUrl,
      accounts: [configByNetwork["base-sepolia"].privateKey],
    },
  },
};

export default config;
