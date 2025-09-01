import { useResolveChallenge } from "@/hooks/challenges";
import { Challenge } from "@cdp/common/src/types/challenge";
import { Button } from "./ui/button";

export const ResolveButton: React.FC<{
  challenge: Challenge;
  winners: string[];
  ineligible: string[];
  isAdmin: boolean;
}> = ({ challenge, winners, ineligible, isAdmin }) => {
  const { mutateAsync: resolveChallenge, isPending: isResolvingChallenge } =
    useResolveChallenge();

  const canResolve = challenge.status === "pending" && isAdmin;

  return (
    <Button
      variant="outline"
      className="rounded-full w-full"
      disabled={isResolvingChallenge || !canResolve}
      onClick={() =>
        resolveChallenge({
          challengeId: BigInt(challenge.id),
          winners: winners.map((winner) => BigInt(winner)),
          ineligible: ineligible.map((ineligible) => BigInt(ineligible)),
        })
      }
    >
      {isResolvingChallenge ? "Resolving..." : "Resolve Challenge"}
    </Button>
  );
};
