import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import { configByNetwork, ipfsClient } from "../../../config";

export const getSubmissionsPaginatedCommand = new Command("find-submissions")
  .description("Get submissions paginated")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--start-index <number>", "The start index", "0")
  .option("--count <number>", "The number of submissions", "10")
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
    
    // get submissions
    const submissions = await escrowService.getSubmissionsPaginated(
      BigInt(options.challengeId),
      Number(options.startIndex),
      Number(options.count)
    );

    console.log(submissions);
  });
