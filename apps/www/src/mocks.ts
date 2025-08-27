import { Challenge } from "@/types/challenges";

export const mockChallenges: Challenge[] = [
  {
    id: 1,
    deadline: new Date(),
    status: "active",
    metadata: {
      title: "Challenge 1",
      body: "Description 1",
      deadline: new Date(),
    },
    author: "author1",
    createdAt: new Date(),
  },
];