import "dotenv/config";
import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../../config.js";
import { Command } from "commander";
import { EscrowService } from "@cdp/common/src/services/escrow.js";
import { privateKeyToAccount } from "viem/accounts";

export const createSubmissionCommand = new Command("create-submission")
  .description("Create a submission")
  .option("--challenge-id <string>", "The challenge ID")
  .option("--body <string>", "The submission body")
  .option("--contact <string>", "The contact details")
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

    // Create submission
    console.log("⚡ Creating submission...");
    const createTx = await escrowService.prepareCreateSubmission(
      BigInt(options.challengeId),
      options.contact,
      options.body
    );
    const createTxHash = await walletClient.sendTransaction({
      ...createTx,
      account: privateKeyToAccount(config.privateKey),
      chain: config.chain,
    });

    const submissionId = await escrowService.recoverSubmissionId(createTxHash);

    console.log("🎉 Submission created successfully!");
    console.log("📊 Submission ID:", submissionId);
    console.log("📝 Transaction hash:", createTxHash);
  });
