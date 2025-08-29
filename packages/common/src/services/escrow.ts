import {
  Address,
  PublicClient,
  createPublicClient,
  decodeEventLog,
  encodeEventTopics,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  http,
} from "viem";
import { escrowAbi } from "../abis/escrow";
import { Challenge, ChallengeStatus } from "../types/challenge";
import { Submission, SubmissionStatus } from "../types/submission";
import { TxParameters } from "../types/tx";
import { IpfsClient } from "./ipfs";

export type CreateChallengeParams = {
  title: string;
  description: string;
  poolSize: bigint;
  endDate: Date;
};

export type ResolveChallengeParams = {
  challengeId: bigint;
  winners: bigint[];
  ineligible: bigint[];
};

export type CreateSubmissionParams = {
  challengeId: bigint;
  contact: string;
  description: string;
};

export type WithdrawParams = {
  amount: bigint;
  to: string;
};

export type ApproveParams = {
  amount: bigint;
};

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
      status:
        challenge.status === 0
          ? endsAt > new Date()
            ? "active"
            : "pending"
          : "completed",
      endsAt: endsAt,
      createdAt: new Date(Number(challenge.createdAt) * 1000),
      poolSize: challenge.poolSize,
      metadata: {
        title: metadata.title,
        description: metadata.description,
      },
      admin: challenge.admin,
    };
  }

  // TODO: turn into multicall instead
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
          admin: challenge.admin,
        };
      })
    );

    return data;
  }

  async prepareApprove({ amount }: ApproveParams) {
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
  }: CreateChallengeParams) {
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
          BigInt(Math.floor(endDate.getTime() / 1000)),
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
    params: ResolveChallengeParams
  ): Promise<TxParameters> {
    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "resolveChallenge",
        args: [params.challengeId, params.winners, params.ineligible],
      }),
      value: 0n,
    };
  }

  async prepareCreateSubmission(
    params: CreateSubmissionParams
  ): Promise<TxParameters> {
    const submissionURI = await this.ipfsClient.uploadJSON({
      description: params.description,
    });

    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "createSubmission",
        args: [params.challengeId, params.contact, submissionURI],
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

  async hasSubmission(challengeId: bigint, user: Address): Promise<boolean> {
    return await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "submitted",
      args: [challengeId, user],
    });
  }

  async getSubmissionsCount(challengeId: bigint): Promise<number> {
    const count = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getSubmissionsCount",
      args: [challengeId],
    });
    return Number(count);
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
      functionName: "getBalance",
      args: [address],
    });
  }

  async prepareWithdraw(params: WithdrawParams): Promise<TxParameters> {
    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "withdraw",
        args: [params.amount, getAddress(params.to)],
      }),
      value: 0n,
    };
  }
}
