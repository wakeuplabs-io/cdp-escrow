

import { z } from "zod";

export const challengeStatusSchema = z.enum(["active", "passed", "rejected"]);

export const challengeMetadataSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  body: z
    .string()
    .min(1, "Proposal description is required")
    .min(10, "Description must be at least 10 characters")
    .max(10000, "Description must be less than 10,000 characters"),
  deadline: z
    .date()
    .refine(
      (date: Date) => date > new Date(),
      "Deadline must be in the future"
    ),
});

export const challengeSchema = z.object({
  id: z.number().int().positive(),
  metadata: challengeMetadataSchema,
  deadline: z.date(),
  createdAt: z.date(),
  status: challengeStatusSchema,
});

// Address validation schema (reusable)
export const zkAddressSchema = z
  .string()
  .min(1, "Address is required")
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid ZK address format");

// Exported TypeScript types
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;
export type ChallengeMetadata = z.infer<typeof challengeMetadataSchema>;
export type Challenge = z.infer<typeof challengeSchema>;

