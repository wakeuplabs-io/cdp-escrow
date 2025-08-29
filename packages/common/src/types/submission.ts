import { Address } from "viem";
import { z } from "zod";

export const submissionStatusSchema = z.enum([
  "pending",
  "ineligible", 
  "accepted",
  "awarded"
]);

export const submissionMetadataSchema = z.object({
  description: z.string()
});

export const submissionSchema = z.object({
  id: z.number(),
  creator: z.custom<Address>(),
  creatorContact: z.string(),
  status: submissionStatusSchema,
  createdAt: z.date(),
  metadata: submissionMetadataSchema
});

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
export type SubmissionMetadata = z.infer<typeof submissionMetadataSchema>;
export type Submission = z.infer<typeof submissionSchema>;