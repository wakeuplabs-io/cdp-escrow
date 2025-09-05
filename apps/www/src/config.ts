import { Erc20Service } from "@cdp/common/src/services/erc20";
import { EscrowService } from "@cdp/common/src/services/escrow";
import { PinataIpfs } from "@cdp/common/src/services/ipfs";
import { Address, createPublicClient, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";

// validate all env variables are set
const requiredEnvVariables = [
  "NEXT_PUBLIC_NETWORK",
  "NEXT_PUBLIC_PINATA_JWT",
  "NEXT_PUBLIC_PINATA_GATEWAY",
  "NEXT_PUBLIC_ESCROW_ADDRESS",
  "NEXT_PUBLIC_ERC20_ADDRESS",
  "NEXT_PUBLIC_RPC_URL",
  "NEXT_PUBLIC_CDP_BUNDLER_URL",
  "NEXT_PUBLIC_CDP_PROJECT_ID",
  "NEXT_PUBLIC_CDP_CREATE_ACCOUNT_TYPE"
];

requiredEnvVariables.forEach((envVariable) => {
  if (!process.env[envVariable]) {
    throw new Error(`${envVariable} is not set`);
  }
});

export const TOKEN_DECIMALS = 18;

export const CDP_CREATE_ACCOUNT_TYPE = process.env.NEXT_PUBLIC_CDP_CREATE_ACCOUNT_TYPE as "evm-smart" | "evm-eoa";
export const CDP_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID as string;
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as "base" | "base-sepolia";
export const MULTICALL_ADDRESS = "0xca11bde05977b3631167028862be2a173976ca11"; // for base and base-sepolia
export const CDP_BASE_URL = "https://api.developer.coinbase.com";

export const ipfsClient = new PinataIpfs(
  process.env.NEXT_PUBLIC_PINATA_JWT as string,
  process.env.NEXT_PUBLIC_PINATA_GATEWAY as string
);

export const escrowService = new EscrowService(
  ipfsClient,
  MULTICALL_ADDRESS,
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS as Address,
  process.env.NEXT_PUBLIC_ERC20_ADDRESS as Address,
  process.env.NEXT_PUBLIC_RPC_URL as string,
);

export const erc20Service = new Erc20Service(
  process.env.NEXT_PUBLIC_ERC20_ADDRESS as Address,
  process.env.NEXT_PUBLIC_RPC_URL as string
);

export const bundlerClient = createBundlerClient({
  client: createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_RPC_URL as string), 
  }),
  transport: http(process.env.NEXT_PUBLIC_CDP_BUNDLER_URL as string), 
});

export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL as string),
});