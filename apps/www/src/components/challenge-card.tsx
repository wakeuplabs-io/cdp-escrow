import { shortenAddress } from "@/lib/utils";
import { Challenge } from "@cdp/common/src/types/challenge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { ChallengeStatusIcon } from "./status-badge";

export const ChallengeCard: React.FC<{
  challenge: Challenge;
}> = ({ challenge }) => {

  const timeString = useMemo(() => {
    if (challenge.status === "active") {
      return formatDistanceToNow(new Date(challenge.endsAt)) + " left";
    }
    return formatDistanceToNow(challenge.endsAt) + " ago";
  }, [challenge.endsAt, challenge.status]);

  return (
    <div className="flex items-center justify-between w-full gap-2 py-[14px]">
      <Link href={`challenges/${challenge.id}`}>
        <div className="flex items-center gap-2">
          <ChallengeStatusIcon status={challenge.status} />
          <span className="text-lg font-bold my-1">
            {challenge.metadata.title}
          </span>
        </div>

        <div className="text-muted-foreground text-sm">
          #{challenge.id} by {shortenAddress(challenge.admin)} · {timeString}
        </div>
      </Link>
    </div>
  );
};