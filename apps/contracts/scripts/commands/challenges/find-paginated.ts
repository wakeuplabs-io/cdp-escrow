import { configByNetwork, ipfsClient } from "../../../config.js";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow.js";

export const findChallengesCommand = new Command("find-challenges")
  .description("Get all challenges")
  .option("--start-index <number>", "The start index", "0")
  .option("--count <number>", "The number of challenges", "10")
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

    // get challenges
    const challenges = await escrowService.getChallengesPaginated(
      Number(options.startIndex),
      Number(options.count)
    );
    console.log(challenges);
  });
