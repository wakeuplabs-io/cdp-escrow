import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import { privateKeyToAccount } from "viem/accounts";
import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../../config";

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
      ipfsClient,
      config.chain.contracts?.multicall3?.address as `0x${string}`,
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl
    );

    // resolve challenge
    const resolveTx = await escrowService.prepareResolveChallenge(
      {
        challengeId: BigInt(options.challengeId),
        winners: options.winners.split(",").map(BigInt),
        ineligible: options.ineligible.split(",").map(BigInt),
      }
    );
    const resolveTxHash = await walletClient.sendTransaction({
      ...resolveTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Challenge resolved successfully!");
    console.log("📝 Transaction hash:", resolveTxHash);
  });
