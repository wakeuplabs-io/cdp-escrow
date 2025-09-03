"use client";

import { useUserSubmissions } from "@/hooks/submissions";
import { Challenge } from "@cdp/common/src/types/challenge";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
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
    if (challenge.status !== "active")
      return {
        isValid: false,
        message: "Challenge is not active",
      };

    return { isValid: true, message: "" };
  }, [challenge]);

  if (isAdmin) return null;
  return (
    <Button
      variant="outline"
      tooltip={!validation.isValid ? validation.message : undefined}
      disabled={!validation.isValid || hasSubmission}
      onClick={() => {
        router.push(`/${challenge.admin}/challenges/${challenge.id}/submit`);
      }}
      className="w-full rounded-full"
    >
      {hasSubmission ? "Already submitted" : "Submit your solution"}
    </Button>
  );
};
