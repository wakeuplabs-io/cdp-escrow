import { cn, shortenAddress } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import Image from "next/image";
import Markdown from "react-markdown";
import { SubmissionStatusBadge } from "./status-badge";
import { Button } from "./ui/button";

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
            <Button
              onClick={onMarkAsWinner}
              variant="outline"
              className={cn(
                "rounded-full border h-8 w-8 flex items-center justify-center hover:bg-muted",
                { "bg-gray-100 border-gray-300": isWinner }
              )}
            >
              🏆
            </Button>
            <Button
              onClick={onMarkAsAcceptable}
              variant="outline"
              className={cn(
                "rounded-full border h-8 w-8 flex items-center justify-center hover:bg-muted",
                { "bg-gray-100 border-gray-300": !isWinner && !isIneligible }
              )}
            >
              👍🏼
            </Button>
            <Button
              onClick={onMarkAsIneligible}
              variant="outline"
              className={cn(
                "rounded-full border h-8 w-8 flex items-center justify-center hover:bg-muted",
                { "bg-gray-100 border-gray-300": isIneligible }
              )}
            >
              👎🏼
            </Button>
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        <Markdown>{submission.metadata.description}</Markdown>
      </div>
    </div>
  );
};
