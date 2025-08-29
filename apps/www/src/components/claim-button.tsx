import { Button } from "./ui/button";

export const ClaimButton: React.FC<{
  challengeId: number;
}> = ({ challengeId }) => {
  // const 

  return (
    <Button variant="outline" className="rounded-full w-full">
      Claim
    </Button>
  );
};
