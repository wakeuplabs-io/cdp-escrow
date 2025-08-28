import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../../config.js";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow.js";
import { privateKeyToAccount } from "viem/accounts";

export const resolveChallengeCommand = new Command("resolve-challenge")
  .description("Resolve a challenge")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--winners <string>", "The winners submissions id separated by comma")
  .option(
    "--ineligible <string>",
    "The ineligible submissions id separated by comma"
  )
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const config = configByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    // instantiate services
    const escrowService = new EscrowService(
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl,
      ipfsClient
    );

    // resolve challenge
    const resolveTx = await escrowService.prepareResolveChallenge(
      BigInt(options.challengeId),
      options.winners.split(",").map(BigInt),
      options.ineligible.split(",").map(BigInt)
    );
    const resolveTxHash = await walletClient.sendTransaction({
      ...resolveTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Challenge resolved successfully!");
    console.log("📝 Transaction hash:", resolveTxHash);
  });
