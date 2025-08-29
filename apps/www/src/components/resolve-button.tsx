import { useResolveChallenge } from "@/hooks/challenges";
import { Button } from "./ui/button";

export const ResolveButton: React.FC<{
  challengeId: number;
  winners: string[];
  ineligible: string[];
}> = ({ challengeId, winners, ineligible }) => {
  const { mutateAsync: resolveChallenge, isPending: isResolvingChallenge } =
    useResolveChallenge();

  return (
    <Button
      variant="outline"
      className="rounded-full w-full"
      onClick={() =>
        resolveChallenge({
          challengeId: BigInt(challengeId),
          winners: winners.map((winner) => BigInt(winner)),
          ineligible: ineligible.map((ineligible) => BigInt(ineligible)),
        })
      }
    >
      {isResolvingChallenge ? "Resolving..." : "Resolve Challenge"}
    </Button>
  );
};
