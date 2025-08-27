import { shortenAddress } from "@/lib/utils";
import { useMemo } from "react";
import { StatusIcon } from "./status-badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Challenge } from "@/types/challenges";

export const ChallengeCard: React.FC<{
  challenge: Challenge;
}> = ({ challenge }) => {

  const totalSubmissions = 0;

  const timeString = useMemo(() => {
    if (challenge.status === "active") {
      return formatDistanceToNow(new Date(challenge.deadline)) + " left";
    }
    return formatDistanceToNow(challenge.deadline) + " ago";
  }, [challenge.deadline]);

  return (
    <div className="flex items-center justify-between w-full gap-2 py-[14px]">
      <Link href={`challenges/${challenge.id}`}>
        <div className="flex items-center gap-2">
          <StatusIcon status={challenge.status} />
          <span className="text-lg font-bold my-1">
            {challenge.metadata.title}
          </span>
        </div>

        <div className="text-muted-foreground text-sm">
          #{challenge.id} by {shortenAddress(challenge.author)} · {totalSubmissions}{" "}
          submissions · {timeString}
        </div>
      </Link>
    </div>
  );
};