import "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import { configByNetwork } from "./config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    "base-mainnet": {
      url: configByNetwork["base-mainnet"].rpcUrl,
      accounts: [configByNetwork["base-mainnet"].privateKey],
    },
    "base-sepolia": {
      url: configByNetwork["base-sepolia"].rpcUrl,
      accounts: [configByNetwork["base-sepolia"].privateKey],
    },
  },
};

export default config;
