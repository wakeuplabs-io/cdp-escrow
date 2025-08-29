import { Erc20Service } from "@cdp/common/src/services/erc20";
import { Command } from "commander";
import "dotenv/config";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { configByNetwork, walletClientByNetwork } from "../../config";

export const mintCommand = new Command("mint")
  .description("Mint tokens")
  .option("--to <address>", "The address to mint tokens to")
  .option("--amount <number>", "The amount of tokens to mint")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const config = configByNetwork[network];
    const walletClient = walletClientByNetwork[network];

    // instantiate services
    const erc20Service = new Erc20Service(
      config.erc20Address,
      config.rpcUrl
    );

    console.log(`⚡ Minting ${options.amount} wei tokens to ${options.to}...`);
    const mintTx = await erc20Service.prepareMint(
      parseEther(options.amount),
      options.to
    );
    const mintTxHash = await walletClient.sendTransaction({
      ...mintTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Minting completed successfully!");
    console.log("📝 Transaction hash:", mintTxHash);
  });
