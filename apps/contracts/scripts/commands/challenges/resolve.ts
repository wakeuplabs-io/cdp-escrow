import {
  configByNetwork,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../../config.js";
import { escrowAbi } from "../../abis/escrow.js";
import { Command } from "commander";

export const resolveChallengeCommand = new Command("resolve-challenge")
  .description("Resolve a challenge")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--winners <string>", "The winners addresses")
  .option("--invalid-submissions <string>", "The invalid submissions addresses")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    const challengeId = options.challengeId;
    const winners = options.winners;
    const invalidSubmissions = options.invalidSubmissions;

    const resolveTx = await walletClient.writeContract({
      address: configByNetwork[network].escrowAddress,
      abi: escrowAbi,
      functionName: "resolveChallenge",
      args: [
        BigInt(challengeId),
        winners as `0x${string}`[],
        invalidSubmissions.map(BigInt),
      ],
    });

    console.log("📝 Transaction hash:", resolveTx);
    await publicClient.waitForTransactionReceipt({ hash: resolveTx });

    console.log("🎉 Challenge resolved successfully!");
  });
