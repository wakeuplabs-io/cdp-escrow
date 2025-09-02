import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { erc20Service, NETWORK } from "../config";

export function useBalance(user?: Address | null) {
  return useQuery({
    queryKey: ["balance", user],
    queryFn: () => erc20Service.getBalance(user as Address),
    refetchInterval: 1000,
  });
}

export function useWithdraw() {
  const { currentUser } = useCurrentUser();
  const { sendUserOperation } = useSendUserOperation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: { amount: bigint; to: Address }) => {
      const smartAccount = currentUser?.evmSmartAccounts?.[0];
      if (!smartAccount) {
        throw new Error("No smart account found");
      }

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: NETWORK,
        calls: [await erc20Service.prepareTransfer(props.amount, props.to)],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });
      
      queryClient.invalidateQueries({ queryKey: ["balance", smartAccount] });
      
      return { userOperationHash: result.userOperationHash };
    },
  });
}
