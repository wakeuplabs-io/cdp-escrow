import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { QueryKeyFactory } from "@/lib/queries";
import { Challenge } from "@/types/challenges";

export const useChallenges = () => {
  return useInfiniteQuery({
    queryKey: QueryKeyFactory.challenges(),
    queryFn: async ({ pageParam }) => {
      return {
        challenges: [] as Challenge[],
        hasNextPage: false,
        nextPage: 0,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
  });
};

export const useCreateChallenge = () => {
  return useMutation({
    mutationFn: async () => {
      return 1;
    },
  });
};