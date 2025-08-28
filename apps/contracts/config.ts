import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  PublicClient,
  WalletClient,
  Chain,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { PinataIpfs } from "@cdp/common/src/services/ipfs.js";

export type Network = "base-mainnet" | "base-sepolia";

export const configByNetwork: Record<
  Network,
  {
    chain: Chain;
    rpcUrl: string;
    privateKey: `0x${string}`;
    escrowAddress: `0x${string}`;
    erc20Address: `0x${string}`;
  }
> = {
  "base-mainnet": {
    chain: base,
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    privateKey: process.env.BASE_PRIVATE_KEY as `0x${string}`,
    escrowAddress: process.env.BASE_ESCROW_ADDRESS as `0x${string}`,
    erc20Address: process.env.BASE_ERC20_ADDRESS as `0x${string}`,
  },
  "base-sepolia": {
    chain: baseSepolia,
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY as `0x${string}`,
    escrowAddress: process.env.BASE_SEPOLIA_ESCROW_ADDRESS as `0x${string}`,
    erc20Address: process.env.BASE_SEPOLIA_ERC20_ADDRESS as `0x${string}`,
  },
};

export const publicClientByNetwork: Record<Network, PublicClient> = {
  "base-mainnet": createPublicClient({
    chain: base,
    transport: http(),
  }) as any,
  "base-sepolia": createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }) as any,
};

export const walletClientByNetwork: Record<Network, WalletClient> = {
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
