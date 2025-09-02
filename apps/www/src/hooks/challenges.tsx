import { bundlerClient } from "@/config";
import {
  CreateChallengeParams,
  ResolveChallengeParams,
} from "@cdp/common/src/services/escrow";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { escrowService, NETWORK } from "../config";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateChallengeParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: NETWORK,
        calls: [
          await escrowService.prepareApprove({
            amount: props.poolSize,
          }),
          await escrowService.prepareCreateChallenge(props)
        ],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      // recover challenge id
      const receipt = await bundlerClient.waitForUserOperationReceipt({ hash: result.userOperationHash });
      const challengeId = await escrowService.recoverChallengeId(receipt.logs);

      // store in cache
      const challenge = await escrowService.getChallengeById(challengeId);
      queryClient.setQueryData(QueryKeyFactory.challenge(challengeId), challenge);

      return challengeId;
    },
  });
};

export const useResolveChallenge = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: ResolveChallengeParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: NETWORK,
        calls: [await escrowService.prepareResolveChallenge(props)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });
      await bundlerClient.waitForUserOperationReceipt({ hash: result.userOperationHash });

      const challenge = await escrowService.getChallengeById(props.challengeId);
      queryClient.setQueryData(QueryKeyFactory.challenge(props.challengeId), challenge);

      return { userOperationHash: result.userOperationHash };
    },
  });
};
