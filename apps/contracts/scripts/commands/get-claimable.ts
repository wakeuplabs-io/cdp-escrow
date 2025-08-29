import { EscrowService } from "@cdp/common/src/services/escrow.js";
import { Command } from "commander";
import "dotenv/config";
import { formatEther } from "viem";
import { configByNetwork, ipfsClient } from "../../config.js";

export const getClaimableCommand = new Command("get-claimable")
  .description("Get claimable")
  .option("--address <address>", "The address to get balance for")
  .option("--challenge-id <number>", "The challenge ID")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const config = configByNetwork[network];

    // instantiate services
    const escrowService = new EscrowService(
      ipfsClient,
      config.chain.contracts?.multicall3?.address as `0x${string}`,
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl
    );

    console.log(`⚡ Getting claimable...`);
    const claimable = await escrowService.getClaimable(options.challengeId, options.address);
    console.log("🎉 Claimable:", formatEther(claimable));
  });
