export type ChallengeStatus = "active" | "completed";

export type Challenge = {
  id: number;
  status: "active" | "completed";
  endsAt: Date;
  createdAt: Date;
  poolSize: bigint;
  metadata: {
    title: string;
    description: string;
  };
};