import { PinataIpfs } from "@cdp/common/src/services/ipfs";
import "dotenv/config";
import {
  Chain,
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

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
    privateKey: (process.env.BASE_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001") as `0x${string}`,
    escrowAddress: (process.env.BASE_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    erc20Address: (process.env.BASE_ERC20_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
  "base-sepolia": {
    chain: baseSepolia,
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    privateKey: (process.env.BASE_SEPOLIA_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001") as `0x${string}`,
    escrowAddress: (process.env.BASE_SEPOLIA_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    erc20Address: (process.env.BASE_SEPOLIA_ERC20_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
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
  process.env.PINATA_JWT || "dummy-jwt-for-testing",
  process.env.PINATA_GATEWAY || "https://dummy-gateway.pinata.cloud"
);
