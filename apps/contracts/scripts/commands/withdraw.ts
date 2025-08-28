import "dotenv/config";
import { parseEther } from "viem";
import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../config.js";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow.js";
import { privateKeyToAccount } from "viem/accounts";

export const withdrawCommand = new Command("withdraw")
  .description("Withdraw tokens")
  .option("--amount <number>", "The amount of tokens to withdraw")
  .option("--to <address>", "The address to withdraw tokens to")
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

    console.log(`⚡ Withdrawing tokens...`);
    const withdrawTx = await escrowService.prepareWithdraw(
      parseEther(options.amount),
      options.to
    );
    const withdrawTxHash = await walletClient.sendTransaction({
      ...withdrawTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Withdrawing completed successfully!");
    console.log("📝 Transaction hash:", withdrawTxHash);
  });
