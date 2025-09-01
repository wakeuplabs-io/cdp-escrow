"use client";

  import { useUserSubmissions } from "@/hooks/submissions";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { Button } from "./ui/button";

export const SubmitButton: React.FC<{
  challenge: Challenge;
}> = ({ challenge }) => {
  const router = useRouter();
  const { evmAddress } = useEvmAddress();
  const { data: userSubmissions } = useUserSubmissions(challenge.id, evmAddress);

  const hasSubmission = useMemo(() => userSubmissions?.some(
    (submission) => submission.challengeId === challenge.id
  ), [userSubmissions, challenge.id]);

  return (
    <>
      <div data-tooltip-id="submit-solution-tooltip" className="w-full">
        <Button
          variant="outline"
          disabled={hasSubmission}
          onClick={() => {
            router.push(`/challenges/${challenge.id}/submit`);
          }}
          className="w-full rounded-full"
        >
          Submit your solution
        </Button>
      </div>

      {hasSubmission && (
        <Tooltip
          id="submit-solution-tooltip"
          content="You have already submitted"
        />
      )}
    </>
  );
};
