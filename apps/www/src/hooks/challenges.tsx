import { bundlerClient } from "@/config";
import {
  CreateChallengeParams,
  ResolveChallengeParams,
} from "@cdp/common/src/services/escrow";
import {
  Challenge,
  ChallengerProfile,
  SetChallengerProfile,
} from "@cdp/common/src/types/challenge";
import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Address } from "viem";
import { escrowService, NETWORK } from "../config";
import { QueryKeyFactory } from "../lib/queries";

export const useChallenge = (id: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.challenge(id),
    queryFn: (): Promise<Challenge> => escrowService.getChallengeById(id),
  });
};

export const useChallengerProfile = (challenger?: Address | "all") => {
  return useQuery({
    queryKey: QueryKeyFactory.challenger(challenger as Address),
    queryFn: (): Promise<ChallengerProfile | null> =>
      challenger === "all"
        ? Promise.resolve(null)
        : escrowService.getChallengerProfile(challenger as Address),
  });
};

export const useSetChallengerProfile = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: SetChallengerProfile) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: NETWORK,
        calls: [await escrowService.prepareSetProfile(profile)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      queryClient.setQueryData(
        QueryKeyFactory.challenger(smartAccount),
        (old: ChallengerProfile | null) =>
          old ? { ...old, ...profile } : { ...profile, verified: false }
      );

      return result.userOperationHash;
    },
  });
};

export const useChallenges = (challenger: Address | "all") => {
  return useInfiniteQuery({
    queryKey: QueryKeyFactory.challenges(challenger),
    queryFn: async ({
      pageParam,
    }): Promise<{
      challenges: Challenge[];
      hasNextPage: boolean;
      nextPage: number;
    }> => {
      const count = await escrowService.getChallengesCount(
        challenger === "all" ? undefined : challenger
      );
      const challenges = await escrowService.getChallengesPaginated(
        pageParam * 10,
        10,
        challenger === "all" ? undefined : challenger
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
          await escrowService.prepareCreateChallenge(props),
        ],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      // recover challenge id
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: result.userOperationHash,
      });
      const challengeId = await escrowService.recoverChallengeId(receipt.logs);

      // invalidate cached queries
      queryClient.invalidateQueries({
        queryKey: QueryKeyFactory.challenges(smartAccount),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeyFactory.challenges(),
      });

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
      await bundlerClient.waitForUserOperationReceipt({
        hash: result.userOperationHash,
      });

      const challenge = await escrowService.getChallengeById(props.challengeId);
      queryClient.setQueryData(
        QueryKeyFactory.challenge(props.challengeId),
        challenge
      );

      return { userOperationHash: result.userOperationHash };
    },
  });
};
