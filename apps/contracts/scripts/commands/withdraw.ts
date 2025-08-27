import "dotenv/config";
import { parseEther } from "viem";
import {
  configByNetwork,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../config.js";
import { escrowAbi } from "../abis/escrow.js";
import { Command } from "commander";

export const withdrawCommand = new Command("withdraw")
  .description("Withdraw tokens")
  .option("--amount <number>", "The amount of tokens to withdraw")
  .option("--to <address>", "The address to withdraw tokens to")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    console.log(`⚡ Withdrawing tokens...`);
    const withdrawTx = await walletClient.writeContract({
      address: configByNetwork[network].escrowAddress,
      abi: escrowAbi,
      functionName: "withdraw",
      args: [parseEther(options.amount), options.to],
    });

    console.log("📝 Transaction hash:", withdrawTx);
    await publicClient.waitForTransactionReceipt({ hash: withdrawTx });

    console.log("🎉 Withdrawing completed successfully!");
  });
