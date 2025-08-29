import {
  CreateChallengeParams,
  ResolveChallengeParams,
} from "@cdp/common/src/services/escrow";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { escrowService } from "../config";
import { QueryKeyFactory } from "../lib/queries";

export const useChallenge = (id: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.challenge(id),
    queryFn: (): Promise<Challenge> => escrowService.getChallengeById(id),
  });
};

export const useChallenges = () => {
  return useInfiniteQuery({
    queryKey: QueryKeyFactory.challenges(),
    queryFn: async ({
      pageParam,
    }): Promise<{
      challenges: Challenge[];
      hasNextPage: boolean;
      nextPage: number;
    }> => {
      const count = await escrowService.getChallengesCount();
      const challenges = await escrowService.getChallengesPaginated(
        pageParam * 10,
        10
      );

      return {
        challenges,
        hasNextPage: pageParam * 10 + 10 < count,
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
  });
};

export const useCreateChallenge = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();

  return useMutation({
    mutationFn: async (props: CreateChallengeParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: "base-sepolia",
        calls: [await escrowService.prepareCreateChallenge(props)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      return result.userOperationHash;
    },
  });
};

export const useResolveChallenge = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();

  return useMutation({
    mutationFn: async (props: ResolveChallengeParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: "base-sepolia",
        calls: [await escrowService.prepareResolveChallenge(props)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      return result.userOperationHash;
    },
  });
};
