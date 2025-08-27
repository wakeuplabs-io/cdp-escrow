import { configByNetwork, publicClientByNetwork } from "../../../config.js";
import { escrowAbi } from "../../abis/escrow.js";
import { Command } from "commander";

export const findChallengeByIdCommand = new Command("find-challenge")
  .description("Get a challenge by ID")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const challengeId = options.challengeId;

    const challenge = await publicClient.readContract({
      address: configByNetwork[network].escrowAddress,
      abi: escrowAbi,
      functionName: "getChallenge",
      args: [BigInt(challengeId)],
    });

    console.log(challenge);
  });
