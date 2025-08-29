import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { configByNetwork, ipfsClient, walletClientByNetwork } from "../../../config";

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
      ipfsClient,
      config.chain.contracts?.multicall3?.address as `0x${string}`,
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl
    );

    // Create submission
    console.log("⚡ Creating submission...");
    const createTx = await escrowService.prepareCreateSubmission(
      {
        challengeId: BigInt(options.challengeId),
        contact: options.contact,
        description: options.body,
      }
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
