import { Address, parseEther } from "viem";
import { z } from "zod";

export const challengeStatusSchema = z.enum(["active", "pending", "completed"]);

export const challengeMetadataSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(100),
});

export const challengeSchema = z.object({
  id: z.number(),
  status: challengeStatusSchema,
  endsAt: z.date(),
  createdAt: z.date(),
  poolSize: z.bigint().gte(parseEther("1")),
  metadata: challengeMetadataSchema,
  admin: z.custom<Address>(),
});

export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;
export type ChallengeMetadata = z.infer<typeof challengeMetadataSchema>;
export type Challenge = z.infer<typeof challengeSchema>;

