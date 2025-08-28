import { Address } from "viem";

export type SubmissionStatus = "pending" | "ineligible" | "accepted" | "awarded";


export type Submission = {
  id: number;
  creator: Address;
  creatorContact: string;
  status: SubmissionStatus;
  createdAt: Date;
  metadata: {
    title: string;
    description: string;
  };
};