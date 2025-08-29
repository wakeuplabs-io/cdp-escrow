import { configByNetwork, ipfsClient } from "../../../config";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow";

export const getSubmissionByIdCommand = new Command("find-submission")
  .description("Get a submission by ID")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--submission-id <string>", "The submission ID")
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

    // get submission
    const submission = await escrowService.getSubmissionById(
      BigInt(options.challengeId),
      BigInt(options.submissionId)
    );

    console.log(submission);
  });
