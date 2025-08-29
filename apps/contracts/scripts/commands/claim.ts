import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../config";

export const claimCommand = new Command("claim")
  .description("Claim tokens")
  .option("--challenge-id <number>", "The challenge ID")
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

    console.log(`⚡ Claiming tokens...`);
    const claimTx = await escrowService.prepareClaim(
      { challengeId: options.challengeId }
    );
    const claimTxHash = await walletClient.sendTransaction({
      ...claimTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Claiming completed successfully!");
    console.log("📝 Transaction hash:", claimTxHash);
  });
