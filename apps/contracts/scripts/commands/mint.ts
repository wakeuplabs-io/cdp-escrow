import "dotenv/config";
import { parseEther, getAddress } from "viem";
import {
  configByNetwork,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../config.js";
import { erc20Abi } from "../abis/erc20.js";
import { Command } from "commander";

export const mintCommand = new Command("mint")
  .description("Mint tokens")
  .option("--to <address>", "The address to mint tokens to")
  .option("--amount <number>", "The amount of tokens to mint")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    console.log(`⚡ Minting ${options.amount} wei tokens to ${options.to}...`);
    const mintTx = await walletClient.writeContract({
      address: configByNetwork[network].erc20Address,
      abi: erc20Abi,
      functionName: "mint",
      args: [getAddress(options.to), parseEther(options.amount)],
    });

    console.log("📝 Transaction hash:", mintTx);
    await publicClient.waitForTransactionReceipt({ hash: mintTx });

    console.log("🎉 Minting completed successfully!");
  });
