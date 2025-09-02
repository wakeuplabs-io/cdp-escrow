import { Erc20Service } from "@cdp/common/src/services/erc20";
import { EscrowService } from "@cdp/common/src/services/escrow";
import { PinataIpfs } from "@cdp/common/src/services/ipfs";
import { Address, createPublicClient, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";

export const TOKEN_DECIMALS = 18;

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as "base" | "base-sepolia";

export const ipfsClient = new PinataIpfs(
  process.env.NEXT_PUBLIC_PINATA_JWT as string,
  process.env.NEXT_PUBLIC_PINATA_GATEWAY as string
);

export const escrowService = new EscrowService(
  ipfsClient,
  "0xca11bde05977b3631167028862be2a173976ca11", // for base and base-sepolia
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