import { Button } from "./ui/button";

export const ClaimButton: React.FC<{
  challengeId: number;
}> = ({  }) => {
  return (
    <Button variant="outline" className="rounded-full w-full">
      Claim
    </Button>
  );
};
