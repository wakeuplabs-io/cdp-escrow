import { configByNetwork, publicClientByNetwork } from "../../../config.js";
import { escrowAbi } from "../../abis/escrow.js";
import { Command } from "commander";

export const getSubmissionByIdCommand = new Command("find-submission")
  .description("Get a submission by ID")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--submission-id <string>", "The submission ID")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const challengeId = options.challengeId;
    const submissionId = options.submissionId;

    const submission = await publicClient.readContract({
      address: configByNetwork[network].escrowAddress,
      abi: escrowAbi,
      functionName: "getSubmission",
      args: [BigInt(challengeId), BigInt(submissionId)],
    });

    console.log(submission);
  });
