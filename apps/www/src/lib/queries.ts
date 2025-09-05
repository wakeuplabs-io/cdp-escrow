import { Address } from "viem";

export const QueryKeyFactory = {
  challenger: (challenger: Address) => ["challenger", challenger],
  challenge: (challengeId: number) => ["challenges", "detail", challengeId],
  challenges: (challenger?: string) => ["challenges", "list", challenger],
  submissionCount: (challengeId: number) => [
    "submissions",
    "count",
    challengeId,
  ],
  submission: (challengeId: number, submissionId: number) => [
    "submissions",
    "detail",
    challengeId,
    submissionId,
  ],
  submissions: (challengeId: number) => ["submissions", "list", challengeId],
  userSubmissions: (challengeId: number, user: Address) => [
    "user-submissions",
    "list",
    challengeId,
    user,
  ],
  claimable: (challengeId: number, user: Address) => [
    "claimable",
    challengeId,
    user,
  ],
};
