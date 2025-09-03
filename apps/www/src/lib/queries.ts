import { Address } from "viem";

export const QueryKeyFactory = {
  challenger: (challenger: Address) => ["challenger", challenger],
  challenge: (challengeId: number) => ["challenge", challengeId],
  challenges: (challenger?: string) => ["challenges", challenger],
  submissionCount: (challengeId: number) => [
    "submissions",
    "count",
    challengeId,
  ],
  submission: (challengeId: number, submissionId: number) => [
    "submissions",
    challengeId,
    submissionId,
  ],
  submissions: (challengeId: number) => ["submissions", challengeId],
  userSubmissions: (challengeId: number, user: Address) => [
    "user-submissions",
    challengeId,
    user,
  ],
  claimable: (challengeId: number, user: Address) => [
    "claimable",
    challengeId,
    user,
  ],
  winnerSubmissions: (challengeId: number) => ["winner-submissions", challengeId],
  ineligibleSubmissions: (challengeId: number) => [
    "ineligible-submissions",
    challengeId,
  ],
};
