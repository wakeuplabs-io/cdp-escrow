import { bundlerClient, escrowService } from "@/config";
import { QueryKeyFactory } from "@/lib/queries";
import {
  ClaimParams,
  CreateSubmissionParams,
} from "@cdp/common/src/services/escrow";
import { Submission } from "@cdp/common/src/types/submission";
import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Address } from "viem";

export const useSubmission = (challengeId: number, submissionId: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.submission(challengeId, submissionId),
    queryFn: async (): Promise<Submission> => {
      const submission = await escrowService.getSubmissionById(
        BigInt(challengeId),
        BigInt(submissionId)
      );
      return submission;
    },
  });
};

export const useSubmissions = (challengeId: number) => {
  return useInfiniteQuery({
    queryKey: QueryKeyFactory.submissions(challengeId),
    queryFn: async ({
      pageParam,
    }): Promise<{
      submissions: Submission[];
      hasNextPage: boolean;
      nextPage: number;
    }> => {
      const count = await escrowService.getSubmissionsCount(
        BigInt(challengeId)
      );
      const submissions = await escrowService.getSubmissionsPaginated(
        BigInt(challengeId),
        pageParam * 10,
        10
      );

      return {
        submissions,
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

export const useSubmissionCount = (challengeId: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.submissionCount(challengeId),
    queryFn: () => escrowService.getSubmissionsCount(BigInt(challengeId)),
  });
};

export const useUserSubmissions = (
  challengeId: number,
  user: Address | null
) => {
  return useQuery({
    queryKey: QueryKeyFactory.userSubmissions(challengeId, user as Address),
    queryFn: () => escrowService.getUserSubmissions(user as Address),
    enabled: !!user,
  });
};

export const useCreateSubmission = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateSubmissionParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: "base-sepolia",
        calls: [await escrowService.prepareCreateSubmission(props)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: result.userOperationHash,
      });
      const submissionId = await escrowService.recoverSubmissionId(
        receipt.logs
      );

      queryClient.invalidateQueries({
        queryKey: QueryKeyFactory.submissions(props.challengeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeyFactory.userSubmissions(
          props.challengeId,
          smartAccount
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeyFactory.submissionCount(props.challengeId),
      });

      return { submissionId, userOperationHash: result.userOperationHash };
    },
  });
};

export const useClaimable = (challengeId: number, user: Address | null) => {
  return useQuery({
    queryKey: QueryKeyFactory.claimable(challengeId, user as Address),
    queryFn: () =>
      escrowService.getClaimable(BigInt(challengeId), user as Address),
    enabled: !!user,
  });
};

export const useClaim = () => {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: ClaimParams) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: "base-sepolia",
        calls: [await escrowService.prepareClaim(props)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      queryClient.setQueryData(
        QueryKeyFactory.claimable(props.challengeId, smartAccount),
        0n
      );

      return { userOperationHash: result.userOperationHash };
    },
  });
};


export const useWinnerSubmissions = (challengeId: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.winnerSubmissions(challengeId),
    queryFn: () => escrowService.getWinnerSubmissions(challengeId),
  });
};

export const useIneligibleSubmissions = (challengeId: number) => {
  return useQuery({
    queryKey: QueryKeyFactory.ineligibleSubmissions(challengeId),
    queryFn: () => escrowService.getIneligibleSubmissions(challengeId),
  });
};