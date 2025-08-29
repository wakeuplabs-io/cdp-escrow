import { EscrowService } from "@cdp/common/src/services/escrow";
import { Command } from "commander";
import "dotenv/config";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  configByNetwork,
  ipfsClient,
  publicClientByNetwork,
  walletClientByNetwork,
} from "../../../config";

export const createChallengeCommand = new Command("create-challenge")
  .description("Create a challenge")
  .option("--description <string>", "The description of the challenge")
  .option("--title <string>", "The title of the challenge")
  .option("--pool-size <string>", "The pool size in usdc")
  .option("--end-date <string>", "The end date of the challenge")
  .option("--network <string>", "The network to use", "base-sepolia")
  .action(async (options) => {
    const network = options.network as keyof typeof configByNetwork;
    const publicClient = publicClientByNetwork[network];
    const walletClient = walletClientByNetwork[network];
    const config = configByNetwork[network];
    const signer = privateKeyToAccount(config.privateKey);

    // instantiate services
    const escrowService = new EscrowService(
      ipfsClient,
      config.chain.contracts?.multicall3?.address as `0x${string}`,
      config.escrowAddress,
      config.erc20Address,
      config.rpcUrl
    );

    const allowance = await escrowService.getAllowance(signer.address);

    if (allowance < parseEther(options.poolSize)) {
      // approve the escrow to spend the tokens
      console.log("⚡ Approving escrow to spend tokens...");
      const approveTx = await escrowService.prepareApprove({
        amount: parseEther(options.poolSize),
      });
      console.log(approveTx, parseEther(options.poolSize));
      const approveTxHash = await walletClient.sendTransaction({
        ...approveTx,
        account: signer,
        chain: config.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      console.log("📝 Transaction hash:", approveTxHash);
    }

    // Create challenge
    console.log("⚡ Creating challenge...");
    const createTx = await escrowService.prepareCreateChallenge({
      title: options.title,
      description: options.description,
      poolSize: parseEther(options.poolSize),
      endDate: new Date(options.endDate),
    });
    const createTxHash = await walletClient.sendTransaction({
      ...createTx,
      account: signer,
      chain: config.chain,
    });
    const challengeId = await escrowService.recoverChallengeId(createTxHash);

    console.log("📊 Challenge ID:", challengeId);
    console.log("📝 Transaction hash:", createTxHash);
  });
