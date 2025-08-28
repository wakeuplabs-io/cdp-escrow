import "dotenv/config";
import { configByNetwork, ipfsClient } from "../../config.js";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow.js";
import { formatEther } from "viem";

export const balanceCommand = new Command("balance")
  .description("Get balance")
  .option("--address <address>", "The address to get balance for")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const config = configByNetwork[network];

    // instantiate services
    const escrowService = new EscrowService(
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl,
      ipfsClient
    );

    console.log(`⚡ Getting balance...`);
    const balance = await escrowService.getBalance(options.address);
    console.log("🎉 Balance:", formatEther(balance));
  });
