import {
  Address,
  createPublicClient,
  decodeEventLog,
  encodeEventTopics,
  encodeFunctionData,
  erc20Abi,
  http,
  Log,
  PublicClient,
} from "viem";
import { escrowAbi } from "../abis/escrow";
import { Challenge } from "../types/challenge";
import { Submission, UserSubmission } from "../types/submission";
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

export type ClaimParams = {
  challengeId: bigint;
};

export type ApproveParams = {
  amount: bigint;
};

const CHALLENGE_STATUS_MAP = {
  [0]: "active",
  [1]: "pending",
  [2]: "completed",
} as const;

const SUBMISSION_STATUS_MAP = {
  [0]: "pending",
  [1]: "accepted",
  [2]: "awarded",
  [3]: "ineligible",
} as const;

export class EscrowService {
  private readonly publicClient: PublicClient;

  constructor(
    private readonly ipfsClient: IpfsClient,
    private readonly multicallAddress: Address,
    private readonly escrowAddress: Address,
    private readonly erc20Address: Address,
    private readonly rpcUrl: string
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
        CHALLENGE_STATUS_MAP[
          challenge.status as keyof typeof CHALLENGE_STATUS_MAP
        ],
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

  async getChallengesPaginated(
    startIndex: number,
    count: number
  ): Promise<Challenge[]> {
    try {
    const challengesCount = await this.getChallengesCount();
    if (startIndex >= challengesCount) {
      return [];
    }

    // if the count is greater than the number of challenges, set the count to the number of challenges
    if (startIndex + count > challengesCount) {
      count = challengesCount - startIndex;
    }

    // use multicall to get all the challenges
    const challenges = (
      await this.publicClient.multicall({
        contracts: Array.from({ length: count }, (_, i) => ({
          address: this.escrowAddress,
          abi: escrowAbi,
          functionName: "getChallenge",
          args: [BigInt(startIndex + i)],
        })),
        multicallAddress: this.multicallAddress,
      })
    )
      .filter((challenge) => challenge.status === "success")
      .map(({ result: challenge }) => challenge as any);

    const data: Challenge[] = await Promise.all(
      challenges.map(async (challenge, index) => {
        const metadata = (await this.ipfsClient.downloadJSON(
          challenge.metadataUri
        )) as any;

        return {
          id: Number(startIndex + index),
          status:
            CHALLENGE_STATUS_MAP[
              challenge.status as keyof typeof CHALLENGE_STATUS_MAP
            ],
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
    } catch (error) {
      console.error("Error getting challenges paginated", error);
      return [];
    }
  }

  async getAllowance(address: Address): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.erc20Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, this.escrowAddress],
    });
  }

  async prepareApprove({ amount }: ApproveParams) {
    return {
      to: this.erc20Address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [this.escrowAddress, amount],
      }),
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
    };
  }

  async recoverChallengeId(logs: Log[]): Promise<bigint> {
    // Find and decode the matching log
    const [challengeCreatedTopic] = encodeEventTopics({
      abi: escrowAbi,
      eventName: "ChallengeCreated",
    });
    const log = logs.find(
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

  async getSubmissionsCount(challengeId: bigint): Promise<number> {
    const count = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getSubmissionsCount",
      args: [challengeId],
    });
    return Number(count);
  }

  async getUserSubmissions(user: Address): Promise<UserSubmission[]> {
    const submissions = await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getUserSubmissions",
      args: [user],
    });

    return submissions.map((submission) => ({
      submissionId: Number(submission.submissionId),
      challengeId: Number(submission.challengeId),
    }));
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
      status:
        SUBMISSION_STATUS_MAP[
          submission.status as keyof typeof SUBMISSION_STATUS_MAP
        ],
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
    const submissionCount = await this.getSubmissionsCount(challengeId);
    if (startIndex >= submissionCount) {
      return [];
    }

    if (startIndex + count > submissionCount) {
      count = submissionCount - startIndex;
    }

    const submissions = (
      await this.publicClient.multicall({
        contracts: Array.from({ length: count }, (_, i) => ({
          address: this.escrowAddress,
          abi: escrowAbi,
          functionName: "getSubmission",
          args: [challengeId, BigInt(startIndex + i)],
        })),
        multicallAddress: this.multicallAddress,
      })
    )
      .filter((submission) => submission.status === "success")
      .map(({ result: submission }) => submission as any);

    const data: Submission[] = await Promise.all(
      submissions.map(async (submission, index) => {
        const metadata = (await this.ipfsClient.downloadJSON(
          submission.metadataUri
        )) as any;

        return {
          id: Number(startIndex + index),
          creator: submission.creator,
          creatorContact: submission.creatorContact,
          createdAt: new Date(Number(submission.createdAt) * 1000),
          status:
            SUBMISSION_STATUS_MAP[
              submission.status as keyof typeof SUBMISSION_STATUS_MAP
            ],
          metadata: {
            description: metadata.description,
          },
        };
      })
    );

    return data;
  }

  async getClaimable(challengeId: bigint, address: Address): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.escrowAddress,
      abi: escrowAbi,
      functionName: "getClaimable",
      args: [challengeId, address],
    });
  }

  async prepareClaim(params: ClaimParams): Promise<TxParameters> {
    return {
      to: this.escrowAddress,
      data: encodeFunctionData({
        abi: escrowAbi,
        functionName: "claim",
        args: [params.challengeId],
      }),
      value: 0n,
    };
  }
}
