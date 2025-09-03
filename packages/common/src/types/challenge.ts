import { Address, parseEther } from "viem";
import { z } from "zod";

export const challengeStatusSchema = z.enum(["active", "pending", "completed"]);

export const challengeMetadataSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(100, "Description must be at least 100 characters"),
});

export const challengeSchema = z.object({
  id: z.number(),
  status: challengeStatusSchema,
  endsAt: z.date(),
  createdAt: z.date(),
  poolSize: z.bigint().gte(parseEther("1"), "Pool size must be at least 1 USDC"),
  metadata: challengeMetadataSchema,
  admin: z.custom<Address>(),
});

export const setChallengerProfileSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  website: z.string().min(1, "Website must be at least 1 character"),
  logoURI: z.string().min(1, "Logo URI must be at least 1 character"),
});

export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;
export type ChallengeMetadata = z.infer<typeof challengeMetadataSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type SetChallengerProfile = z.infer<typeof setChallengerProfileSchema>;
export type ChallengerProfile = SetChallengerProfile & { verified: boolean };

