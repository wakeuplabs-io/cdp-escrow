import "dotenv/config";
import { decodeEventLog, encodeEventTopics, erc20Abi, parseEther } from "viem";
import {
  configByNetwork,
  ipfsClient,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../../config.js";
import { escrowAbi } from "../../abis/escrow.js";
import { Command } from "commander";

export const createChallengeCommand = new Command("create-challenge")
  .description("Create a challenge")
  .option("--description <string>", "The description of the challenge")
  .option("--title <string>", "The title of the challenge")
  .option("--pool-size <string>", "The pool size in usdc")
  .option("--end-date <string>", "The end date of the challenge")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    const escrowAddress = configByNetwork[network].escrowAddress;

    // Pin the metadata as json to ipfs
    const metadataURI = await ipfsClient.uploadJSON({
      description: options.description,
      title: options.title,
      poolSize: options.poolSize,
      endDate: Math.floor(new Date(options.endDate).getTime() / 1000),
    });

    // approve the escrow to spend the tokens
    console.log("⚡ Approving escrow to spend tokens...");
    const approveTx = await walletClient.writeContract({
      address: configByNetwork[network].erc20Address,
      abi: erc20Abi,
      functionName: "approve",
      args: [escrowAddress, parseEther(options.poolSize)],
    });
    console.log("📝 Transaction hash:", approveTx);
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    // Create challenge
    console.log("⚡ Creating challenge...");
    const createTx = await walletClient.writeContract({
      address: escrowAddress,
      abi: escrowAbi,
      functionName: "createChallenge",
      args: [
        metadataURI,
        parseEther(options.poolSize),
        BigInt(Math.floor(new Date(options.endDate).getTime() / 1000)),
      ],
    });
    console.log("📝 Transaction hash:", createTx);

    // extract challenge id from the transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: createTx,
    });

    // Find and decode the matching log
    const [challengeCreatedTopic] = encodeEventTopics({
      abi: escrowAbi,
      eventName: "ChallengeCreated",
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

    console.log("📊 Challenge ID:", (decoded.args as any).challengeId);
  });
