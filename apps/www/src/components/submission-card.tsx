import { cn, shortenAddress } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import { CheckIcon, StarIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import { SubmissionStatusBadge } from "./status-badge";

export const SubmissionCard = ({
  submission,
  isResolving,
  isWinner,
  isIneligible,
  onMarkAsWinner,
  onMarkAsIneligible,
  onMarkAsAcceptable,
}: {
  submission: Submission;
  isResolving: boolean;
  isWinner: boolean;
  isIneligible: boolean;
  onMarkAsWinner: () => void;
  onMarkAsIneligible: () => void;
  onMarkAsAcceptable: () => void;
}) => {
  const awarded = isWinner || submission.status === "awarded";
  const ineligible = isIneligible || submission.status === "ineligible";

  return (
    <div className="w-full py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/avatar.webp"
            alt="avatar"
            className="rounded-full"
            width={32}
            height={32}
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {shortenAddress(submission.creator)}
              </span>
              {!isResolving && (
                <SubmissionStatusBadge
                  status={
                    awarded
                      ? "awarded"
                      : ineligible
                      ? "ineligible"
                      : submission.status
                  }
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground space-x-2">
              #{submission.id} on {submission.createdAt.toLocaleDateString()} by{" "}
              {submission.creatorContact}
            </div>
          </div>
        </div>

        {isResolving && (
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAsWinner}
              className={cn(
                "text-green-500 rounded-full border border-green-500 h-7 w-7 flex items-center justify-center",
                { "bg-green-500/10": isWinner }
              )}
            >
              <StarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onMarkAsIneligible}
              className={cn(
                "text-red-500 rounded-full border border-red-500 h-7 w-7 flex items-center justify-center",
                { "bg-red-500/10": isIneligible }
              )}
            >
              <XIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onMarkAsAcceptable}
              className={cn(
                "text-zinc-500 rounded-full border border-zinc-500 h-7 w-7 flex items-center justify-center",
                { "bg-zinc-500/10": !isWinner && !isIneligible }
              )}
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        <Markdown>{submission.metadata.description}</Markdown>
      </div>
    </div>
  );
};
