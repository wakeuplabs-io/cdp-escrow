import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { erc20Service } from "../config";

export function useBalance(user?: Address | null) {
  return useQuery({
    queryKey: ["balance", user],
    queryFn: () => erc20Service.getBalance(user as Address),
    // initialData: 0n,
    // enabled: !!user,
  });
}
