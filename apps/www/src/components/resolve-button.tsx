import { useResolveChallenge } from "@/hooks/challenges";
import { Challenge } from "@cdp/common/src/types/challenge";
import { Submission } from "@cdp/common/src/types/submission";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useCallback, useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const ResolveButton: React.FC<{
  challenge: Challenge;
  submissions: Submission[];
  winners: string[];
  ineligible: string[];
}> = ({ challenge, submissions, winners, ineligible }) => {
  const { evmAddress } = useEvmAddress();
  const { mutateAsync: resolveChallenge, isPending: isResolvingChallenge } =
    useResolveChallenge();

  const isAdmin = useMemo(() => {
    return challenge.admin === evmAddress;
  }, [challenge.admin, evmAddress]);

  const onClaim = useCallback(() => {
    if (
      winners.length > 0 &&
      ineligible.length > 0 &&
      !window.confirm(
        "You haven't pick any winners or ineligible submissions. The reward will be split equally between the remaining submissions. Are you sure?"
      )
    ) {
      return;
    }

    resolveChallenge({
      challengeId: challenge.id,
      winners: winners.map((winner) => BigInt(winner)),
      ineligible: ineligible.map((ineligible) => BigInt(ineligible)),
    }).then(({ userOperationHash }) => {
      toast.success("Challenge resolved successfully with user operation hash: " + userOperationHash);
    });
  }, [challenge.id, winners, ineligible, resolveChallenge]);

  // only admins can resolve challenges
  if (!isAdmin) return null;
  return (
    <>
      <div data-tooltip-id="resolve-button-tooltip">
        <Button
          variant="outline"
          className="rounded-full w-full"
          disabled={isResolvingChallenge || challenge.status !== "pending"}
          onClick={onClaim}
        >
          {isResolvingChallenge
            ? "Resolving..."
            : submissions.length === 0
            ? "No submissions. Claim funds back"
            : "Resolve Challenge"}
        </Button>
      </div>

      {challenge.status === "completed" && (
        <Tooltip
          id="resolve-button-tooltip"
          content="Challenge already resolved"
        />
      )}
    </>
  );
};
