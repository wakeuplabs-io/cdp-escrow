import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import { privateKeyToAccount } from "viem/accounts";
import {
  configByNetwork,
  ipfsClient,
  walletClientByNetwork,
} from "../../../config";

export const setProfileCommand = new Command("set-profile")
  .description("Set profile")
  .option("--name <string>", "The name")
  .option("--description <string>", "The description")
  .option("--website <string>", "The website")
  .option("--logoURI <string>", "The logo URI")
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

    console.log(`⚡ Setting profile...`);
    const setProfileTx = await escrowService.prepareSetProfile({
      name: options.name,
      description: options.description,
      website: options.website,
      logoURI: options.logoURI,
    });
    const setProfileTxHash = await walletClient.sendTransaction({
      ...setProfileTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });
    console.log("🎉 Setting profile completed successfully!");
    console.log("📝 Transaction hash:", setProfileTxHash);
  });
