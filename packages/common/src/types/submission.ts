import { Address } from "viem";
import { z } from "zod";

export const submissionStatusSchema = z.enum([
  "pending",
  "ineligible", 
  "accepted",
  "awarded"
]);

export const submissionMetadataSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters")
});

export const submissionSchema = z.object({
  id: z.number(),
  creator: z.custom<Address>(),
  creatorContact: z.string(),
  status: submissionStatusSchema,
  createdAt: z.date(),
  metadata: submissionMetadataSchema
});

export const userSubmissionSchema = z.object({
  submissionId: z.number(),
  challengeId: z.number(),
});

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
export type SubmissionMetadata = z.infer<typeof submissionMetadataSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type UserSubmission = z.infer<typeof userSubmissionSchema>;