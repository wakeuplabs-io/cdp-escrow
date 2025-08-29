import { Address } from "viem";

export const QueryKeyFactory = {
  challenge: (challengeId: number) => ["challenges", challengeId],
  challenges: () => ["challenges"],
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
  hasSubmission: (challengeId: number, user: Address) => [
    "has-submission",
    challengeId,
    user,
  ],
};
