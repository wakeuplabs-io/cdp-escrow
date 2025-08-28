import {
  decodeEventLog,
  encodeFunctionData,
  encodeEventTopics,
  getAddress,
  erc20Abi,
  Address,
  PublicClient,
  http,
  createPublicClient,
} from "viem";
import { escrowAbi } from "../abis/escrow.js";
import { IpfsClient } from "./ipfs.js";
import { Challenge, ChallengeStatus } from "../types/challenge.js";
import { Submission, SubmissionStatus } from "../types/submission.js";
import { TxParameters } from "../types/tx.js";

export class EscrowService {
  private readonly publicClient: PublicClient;

  constructor(
    private readonly escrowAddress: Address,
    private readonly erc20Address: Address,
    private readonly rpcUrl: string,
    private readonly ipfsClient: IpfsClient
  ) {
    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
  }

  async getChallengesCount(): Promise<number> {
    const count = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getChallengesCount",
    });
    return Number(count);
  }

  async getChallengeById(id: number): Promise<Challenge> {
    const challenge = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getChallenge",
      args: [BigInt(id)],
    });
    const endsAt = new Date(Number(challenge.endsAt) * 1000);

    const metadata = (await this.ipfsClient.downloadJSON(
      challenge.metadataUri
    )) as any;

    return {
      id: Number(id),
      status: endsAt > new Date() ? "active" : ("completed" as ChallengeStatus),
      endsAt: endsAt,
      createdAt: new Date(Number(challenge.createdAt) * 1000),
      poolSize: challenge.poolSize,
      metadata: {
        title: metadata.title,
        description: metadata.description,
      },
    };
  }

  async getChallengesPaginated(
    startIndex: number,
    count: number
  ): Promise<Challenge[]> {
    const challenges = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getChallenges",
      args: [BigInt(startIndex), BigInt(count)],
    });

    const data = await Promise.all(
      challenges.map(async (challenge, index) => {
        const metadata = (await this.ipfsClient.downloadJSON(
          challenge.metadataUri
        )) as any;

        return {
          id: Number(startIndex + index),
          status:
            new Date(Number(challenge.endsAt) * 1000) > new Date()
              ? "active"
              : ("completed" as ChallengeStatus),
          endsAt: new Date(Number(challenge.endsAt) * 1000),
          createdAt: new Date(Number(challenge.createdAt) * 1000),
          poolSize: challenge.poolSize,
          metadata: {
            title: metadata.title,
            description: metadata.description,
          },
        };
      })
    );

    return data;
  }

  async prepareApprove(amount: bigint) {
    return {
      to: this.erc20Address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [this.escrowAddress, amount],
      }),
      value: 0n,
      chain: null,
    };
  }

  async prepareCreateChallenge({
    title,
    description,
    poolSize,
    endDate,
  }: {
    title: string;
    description: string;
    poolSize: bigint;
    endDate: string;
  }) {
    // Pin the metadata as json to ipfs
    const metadataURI = await this.ipfsClient.uploadJSON({
      title: title,
      description: description,
    });

    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "createChallenge",
        args: [
          metadataURI,
          poolSize,
          BigInt(Math.floor(new Date(endDate).getTime() / 1000)),
        ],
      }),
      value: 0n,
      chain: null,
    };
  }

  async recoverChallengeId(txHash: `0x${string}`): Promise<bigint> {
    // extract challenge id from the transaction receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Find and decode the matching log
    const [challengeCreatedTopic] = encodeEventTopics({
      abi: escrowAbi,
      eventName: "ChallengeCreated",
    });
    const log = receipt.logs.find(
      (log) => log.topics[0] === challengeCreatedTopic
    );
    if (!log) throw new Error("Log not found");

    const decoded = decodeEventLog({
      abi: escrowAbi,
      data: log.data,
      topics: log.topics,
    });

    return (decoded.args as any).challengeId;
  }

  async prepareResolveChallenge(
    challengeId: bigint,
    winners: bigint[],
    invalidSubmissions: bigint[]
  ): Promise<TxParameters> {
    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "resolveChallenge",
        args: [challengeId, winners, invalidSubmissions],
      }),
      value: 0n,
    };
  }

  async prepareCreateSubmission(
    challengeId: bigint,
    contact: string,
    description: string
  ): Promise<TxParameters> {
    const submissionURI = await this.ipfsClient.uploadJSON({
      description: description,
    });

    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "createSubmission",
        args: [challengeId, contact, submissionURI],
      }),
      value: 0n,
    };
  }

  async recoverSubmissionId(txHash: `0x${string}`): Promise<bigint> {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Find and decode the matching log
    const [submissionCreatedTopic] = encodeEventTopics({
      abi: escrowAbi,
      eventName: "SubmissionCreated",
    });
    const log = receipt.logs.find(
      (log) => log.topics[0] === submissionCreatedTopic
    );
    if (!log) throw new Error("Log not found");

    const decoded = decodeEventLog({
      abi: escrowAbi,
      data: log.data,
      topics: log.topics,
    });

    return (decoded.args as any).submissionId;
  }

  async getSubmissionById(
    challengeId: bigint,
    submissionId: bigint
  ): Promise<Submission> {
    const submission = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getSubmission",
      args: [challengeId, submissionId],
    });
    const metadata = (await this.ipfsClient.downloadJSON(
      submission.metadataUri
    )) as any;

    return {
      id: Number(submissionId),
      creator: submission.creator,
      creatorContact: submission.creatorContact,
      createdAt: new Date(Number(submission.createdAt) * 1000),
      status: {
        [0]: "pending",
        [1]: "accepted",
        [2]: "awarded",
        [3]: "ineligible",
      }[Number(submission.status)] as SubmissionStatus, // TODO: check if this is correct
      metadata: {
        title: metadata.title,
        description: metadata.description,
      },
    };
  }

  async getSubmissionsPaginated(
    challengeId: bigint,
    startIndex: number,
    count: number
  ): Promise<Submission[]> {
    const submissions = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getSubmissions",
      args: [challengeId, BigInt(startIndex), BigInt(count)],
    });

    return await Promise.all(
      submissions.map(async (submission, index) => {
        const metadata = (await this.ipfsClient.downloadJSON(
          submission.metadataUri
        )) as any;

        return {
          id: Number(startIndex + index),
          creator: submission.creator,
          creatorContact: submission.creatorContact,
          createdAt: new Date(Number(submission.createdAt) * 1000),
          status: {
            [0]: "pending",
          }[Number(submission.status)] as SubmissionStatus,
          metadata: {
            title: metadata.title,
            description: metadata.description,
          },
        };
      })
    );
  }

  async getBalance(address: Address): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "balanceOf",
      args: [address],
    });
  }

  async prepareWithdraw(amount: bigint, to: string): Promise<TxParameters> {
    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "withdraw",
        args: [amount, getAddress(to)],
      }),
      value: 0n,
    };
  }
}
