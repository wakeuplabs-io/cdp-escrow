import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import "dotenv/config";
import {
  configByNetwork,
  ipfsClient,
} from "../../../config";

export const findProfileCommand = new Command("find-profile")
  .description("Get profile by address")
  .option("--address <address>", "The address to get profile for")
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

    console.log(`⚡ Getting profile...`);
    const profile = await escrowService.getChallengerProfile(options.address);

    console.log("🎉 Profile retrieved successfully!");
    console.log("📝 Profile:", profile);
  });
