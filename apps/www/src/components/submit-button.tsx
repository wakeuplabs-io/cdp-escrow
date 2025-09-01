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
  const { data: userSubmissions } = useUserSubmissions(
    challenge.id,
    evmAddress
  );

  const isAdmin = useMemo(() => {
    return challenge.admin === evmAddress;
  }, [challenge.admin, evmAddress]);

  const hasSubmission = useMemo(
    () =>
      userSubmissions?.some(
        (submission) => submission.challengeId === challenge.id
      ),
    [userSubmissions, challenge.id]
  );

  const validation = useMemo(() => {
    const hasSubmission = userSubmissions?.some(
      (submission) => submission.challengeId === challenge.id
    );

    if (hasSubmission)
      return {
        isValid: false,
        message: "You have already submitted",
      };

    if (challenge.status !== "active")
      return {
        isValid: false,
        message: "Challenge is not active",
      };

    return { isValid: true, message: "" };
  }, [userSubmissions, challenge.status]);

  if (isAdmin) return null;
  return (
    <>
      <div data-tooltip-id="submit-solution-tooltip" className="w-full">
        <Button
          variant="outline"
          disabled={!validation.isValid}
          onClick={() => {
            router.push(`/challenges/${challenge.id}/submit`);
          }}
          className="w-full rounded-full"
        >
          Submit your solution
        </Button>
      </div>

      {!validation.isValid && (
        <Tooltip id="submit-solution-tooltip" content={validation.message} />
      )}
    </>
  );
};
