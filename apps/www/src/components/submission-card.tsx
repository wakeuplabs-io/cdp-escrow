import { shortenAddress } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import {
  EllipsisVerticalIcon
} from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import { SubmissionStatusBadge } from "./status-badge";
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
          <div>
            <div className="flex items-center gap-2">
              <span>{shortenAddress(submission.creator)}</span>
              <SubmissionStatusBadge status={isWinner ? "awarded" : isIneligible ? "ineligible" : "accepted"} />
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

      <div className="prose prose-sm max-w-2xl">
        <Markdown>{submission.metadata.description}</Markdown>
      </div>
    </div>
  );
};
