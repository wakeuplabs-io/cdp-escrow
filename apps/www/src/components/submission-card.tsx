import { cn, shortenAddress } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import {
  BanIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  TrophyIcon,
} from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import { Tooltip } from "react-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const SubmissionCard = ({
  submission,
  isAdmin,
  isWinner,
  isIneligible,
  onMarkAsWinner,
  onMarkAsIneligible,
  onMarkAsAcceptable,
}: {
  submission: Submission;
  isAdmin: boolean;
  isWinner: boolean;
  isIneligible: boolean;
  onMarkAsWinner: () => void;
  onMarkAsIneligible: () => void;
  onMarkAsAcceptable: () => void;
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/avatar.webp"
            alt="avatar"
            className="w-[32px] h-[32px] rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span>{shortenAddress(submission.creator)}</span>
              <span
                data-tooltip-id="submission-status-tooltip"
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 text-white font-medium",
                  isWinner
                    ? "bg-green-500"
                    : isIneligible
                    ? "bg-red-500"
                    : "bg-yellow-500"
                )}
              >
                {isWinner ? (
                  <TrophyIcon className="w-3 h-3" />
                ) : isIneligible ? (
                  <BanIcon className="w-3 h-3" />
                ) : (
                  <CheckIcon className="w-3 h-3" />
                )}
              </span>

              <Tooltip
                id="submission-status-tooltip"
                content={
                  isWinner
                    ? "Winner"
                    : isIneligible
                    ? "Ineligible"
                    : "Acceptable"
                }
              />
            </div>
            <div className="text-xs text-muted-foreground space-x-2">
              {submission.createdAt.toLocaleDateString()} · #{submission.id}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger disabled={!isAdmin} asChild>
              <button className="disabled:opacity-50 disabled:cursor-not-allowed">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="left">
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={onMarkAsIneligible}>
                    Mark as Ineligible
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMarkAsWinner}>
                    Mark as Winner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMarkAsAcceptable}>
                    Mark as Acceptable
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="prose prose-sm max-w-2xl py-4">
        <Markdown>{submission.metadata.description}</Markdown>
      </div>
    </div>
  );
};
