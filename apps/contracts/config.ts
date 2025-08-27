import "dotenv/config";
import { createWalletClient, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { PinataIpfs } from "./scripts/utils/ipfs.js";

export const configByNetwork = {
  "base-mainnet": {
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    privateKey: process.env.BASE_PRIVATE_KEY as `0x${string}`,
    escrowAddress: process.env.BASE_ESCROW_ADDRESS as `0x${string}`,
    erc20Address: process.env.BASE_ERC20_ADDRESS as `0x${string}`,
  },
  "base-sepolia": {
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY as `0x${string}`,
    escrowAddress: process.env.BASE_SEPOLIA_ESCROW_ADDRESS as `0x${string}`,
    erc20Address: process.env.BASE_SEPOLIA_ERC20_ADDRESS as `0x${string}`,
  },
};

export const publicClientByNetwork = {
  "base-mainnet": createPublicClient({
    chain: base,
    transport: http(),
  }),
  "base-sepolia": createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }),
};

export const walletClientByNetwork = {
  "base-mainnet": createWalletClient({
    chain: base,
    transport: http(),
    account: privateKeyToAccount(configByNetwork["base-mainnet"].privateKey),
  }),
  "base-sepolia": createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(configByNetwork["base-sepolia"].privateKey),
  }),
};



export const ipfsClient = new PinataIpfs(
  process.env.PINATA_JWT as string,
  process.env.PINATA_GATEWAY as string
);