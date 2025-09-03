import { useClaim, useClaimable } from "@/hooks/submissions";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useCallback, useMemo } from "react";
import { Button } from "./ui/button";

export const ClaimButton: React.FC<{
  challenge: Challenge;
}> = ({ challenge }) => {
  const { evmAddress } = useEvmAddress();
  const { data: claimable } = useClaimable(challenge.id, evmAddress);
  const { mutateAsync: claim, isPending: isClaiming } = useClaim();

  const onClaim = useCallback(() => {
    claim({ challengeId: challenge.id });
  }, [challenge.id, claim]);

  const isAdmin = useMemo(() => {
    return challenge.admin === evmAddress;
  }, [challenge.admin, evmAddress]);

  // admins can't claim rewards
  if (isAdmin) return null;
  return (
    <Button
      variant="outline"
      className="rounded-full w-full"
      tooltip={
        challenge.status === "active"
          ? "Submissions are still open"
          : challenge.status === "pending"
          ? "Waiting for admin resolution"
          : "You have either claimed your prize or your submission was not accepted"
      }
      disabled={!claimable || isClaiming}
      onClick={onClaim}
    >
      {isClaiming ? "Claiming..." : "Claim Reward"}
    </Button>
  );
};
