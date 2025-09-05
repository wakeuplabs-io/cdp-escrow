import { TOKEN_DECIMALS } from "@/config";
import { useResolveChallenge } from "@/hooks/challenges";
import { Challenge } from "@cdp/common/src/types/challenge";
import { Submission } from "@cdp/common/src/types/submission";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";

export const ResolveButton: React.FC<{
  challenge: Challenge;
  winners: Submission[];
  ineligible: Submission[];
  submissionsCount: number;
}> = ({ challenge, winners, ineligible, submissionsCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: resolveChallenge, isPending: isResolvingChallenge } =
    useResolveChallenge();

  const onResolve = useCallback(() => {
    if (!challenge) return;

    setIsOpen(false);
    resolveChallenge({
      challengeId: challenge!.id,
      winners: winners.map((winner) => BigInt(winner.id)),
      ineligible: ineligible.map((ineligible) => BigInt(ineligible.id)),
    }).then(({ userOperationHash }) => {
      toast.success(
        "Challenge resolved successfully with user operation hash: " +
          userOperationHash
      );
    }).catch((error) => {
      toast.error("Failed to resolve challenge: " + error.message);
    });
  }, [challenge, winners, ineligible, resolveChallenge]);

  const acceptableCount = useMemo(() => {
    return submissionsCount - winners.length - ineligible.length;
  }, [submissionsCount, winners, ineligible]);

  const winnerAmount = useMemo(() => {
    if (winners.length === 0) {
      return 0n;
    }

    let poolPortion = 70n;
    if (acceptableCount === 0) {
      poolPortion = 100n;
    }

    return (challenge.poolSize * poolPortion) / 100n / BigInt(winners.length);
  }, [challenge, winners, acceptableCount]);

  const acceptableAmount = useMemo(() => {
    if (acceptableCount === 0) {
      return 0n;
    }

    let poolPortion = 30n;
    if (winners.length === 0) {
      poolPortion = 100n;
    }

    return (challenge.poolSize * poolPortion) / 100n / BigInt(acceptableCount);
  }, [challenge, winners, acceptableCount]);

  const errors = useMemo(() => {
    if (winners.length === 0 && ineligible.length === 0) {
      return ["You must select at least one winner or ineligible submission"];
    }
    return [];
  }, [winners, ineligible]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          tooltip={errors.join("\n")}
          disabled={isResolvingChallenge || errors.length > 0}
          className="rounded-full mx-auto h-12 px-10"
          size="lg"
        >
          {isResolvingChallenge ? "Resolving..." : "Resolve"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Challenge</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          {ineligible.length === submissionsCount ? (
            <div>
              All submissions marked as ineligible. You&apos;ll get your funds back.
            </div>
          ) : (
            <div>
              You selected {winners.length} winners, {ineligible.length}{" "}
              ineligible submissions, and {acceptableCount} acceptable
              submissions. So the pool will be distributed as follows:{" "}
              {formatUnits(winnerAmount, TOKEN_DECIMALS)} USDC for winners, {0}{" "}
              USDC for ineligible submissions, and{" "}
              {formatUnits(acceptableAmount, TOKEN_DECIMALS)} USDC for
              acceptable submissions.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onResolve}>
            {isResolvingChallenge ? "Resolving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
