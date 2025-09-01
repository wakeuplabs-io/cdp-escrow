import { useClaimable } from "@/hooks/submissions";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { Tooltip } from "react-tooltip";
import { Button } from "./ui/button";

export const ClaimButton: React.FC<{
  challenge: Challenge;
}> = ({ challenge }) => {
  const { evmAddress } = useEvmAddress();
  const { data: claimable } = useClaimable(challenge.id, evmAddress);

  return (
    <>
      <Button
        variant="outline"
        className="rounded-full w-full"
        id="claim-button-tooltip"
        disabled={!claimable}
      >
        Claim Reward
      </Button>

      {!claimable && (
        <Tooltip
          id="claim-button-tooltip"
          content={
            challenge.status === "active"
              ? "Submissions are still open"
              : challenge.status === "pending"
              ? "Waiting for admin resolution"
              : "You have either claimed your prize or your submission was not accepted"
          }
        />
      )}
    </>
  );
};
