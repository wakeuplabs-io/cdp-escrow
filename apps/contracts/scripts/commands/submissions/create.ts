import "dotenv/config";
import {
  configByNetwork,
  ipfsClient,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../../config.js";
import { escrowAbi } from "../../abis/escrow.js";
import { Command } from "commander";
import { decodeEventLog, encodeEventTopics } from "viem";

export const createSubmissionCommand = new Command("create-submission")
  .description("Create a submission")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--body <string>", "The submission body")
  .option("--contact <string>", "The contact details")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const walletClient = walletClientByNetwork[network];
    const publicClient = publicClientByNetwork[network];

    const escrowAddress = configByNetwork[network].escrowAddress;

    // pin the submission to ipfs
    const submissionURI = await ipfsClient.uploadJSON({
      submission: options.body,
    });

    // Create submission
    console.log("⚡ Creating submission...");
    const createTx = await walletClient.writeContract({
      address: escrowAddress,
      abi: escrowAbi,
      functionName: "createSubmission",
      args: [BigInt(options.challengeId), options.contact, submissionURI],
    });
    console.log("📝 Transaction hash:", createTx);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: createTx,
    });

    // Find and decode the matching log
    const [challengeCreatedTopic] = encodeEventTopics({
      abi: escrowAbi,
      eventName: "SubmissionCreated",
    });
    const log = receipt.logs.find(
      (log) => log.topics[0] === challengeCreatedTopic
    );
    if (!log) throw new Error("Log not found");

    const decoded = decodeEventLog({
      abi: escrowAbi,
      data: log.data,
      topics: log.topics,
    });

    console.log("📊 Submission ID:", (decoded.args as any).submissionId);
  });
