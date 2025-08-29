import { configByNetwork, ipfsClient } from "../../../config";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow";

export const findChallengeByIdCommand = new Command("find-challenge")
  .description("Get a challenge by ID")
  .option("--challenge-id <string>", "The challenge ID")
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

    // get challenge
    const challenge = await escrowService.getChallengeById(
      Number(options.challengeId)
    );
    console.log(challenge);
  });
