import { cn } from "@/lib/utils";
import { ChallengeStatus } from "@cdp/common/src/types/challenge";
import { SubmissionStatus } from "@cdp/common/src/types/submission";
import { ClockIcon, MinusCircleIcon } from "@heroicons/react/24/solid";
import { CheckIcon, RadioIcon, StarIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { Tooltip } from "react-tooltip";

export const ChallengeStatusIcon: React.FC<{
  status: ChallengeStatus;
  className?: string;
}> = ({ status, className }) => {
  if (status === "active") {
    return (
      <RadioIcon
        className={cn("w-[18px] h-[18px] text-green-500", className)}
      />
    );
  }
  if (status === "pending") {
    return (
      <ClockIcon
        className={cn("w-[18px] h-[18px] text-yellow-500", className)}
      />
    );
  }
  if (status === "completed") {
    return (
      <MinusCircleIcon
        className={cn("w-[18px] h-[18px] text-gray-900", className)}
      />
    );
  }

  return null;
};

export const ChallengeStatusBadge: React.FC<{
  status: ChallengeStatus;
  className?: string;
}> = ({ status, className }) => {
  const statusText = useMemo(() => {
    if (status === "active") return "Active";
    if (status === "completed") return "Completed";
    if (status === "pending") return "Pending Resolution";
    return "";
  }, [status]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full mb-6 text-white px-2 pr-3 py-1 w-min text-nowrap",
        status === "active"
          ? "bg-green-500"
          : status === "pending"
          ? "bg-yellow-500"
          : "bg-gray-900",
        className
      )}
    >
      <ChallengeStatusIcon status={status} className="text-white" />
      <span className="uppercase text-xs font-medium">{statusText}</span>
    </div>
  );
};

export const SubmissionStatusBadge: React.FC<{
  status: SubmissionStatus;
  className?: string;
}> = ({ status }) => {
  const icon = {
    awarded: <StarIcon className="w-2 h-2 fill-white" />,
    ineligible: <XIcon className="w-2 h-2" />,
    accepted: <CheckIcon className="w-2 h-2" />,
    pending: <ClockIcon className="w-2 h-2" />,
  } as const;

  const bgColor = {
    awarded: "bg-green-600",
    ineligible: "bg-red-500",
    accepted: "bg-zinc-500",
    pending: "bg-yellow-500",
  } as const;

  const tooltip = {
    awarded: "Winner",
    ineligible: "Ineligible",
    accepted: "Accepted",
    pending: "Pending",
  } as const;

  return (
    <>
      <span
        data-tooltip-id="submission-status-tooltip"
        className={cn(
          "text-xs rounded-full h-4 w-4 text-white font-medium flex items-center justify-center",
          bgColor[status]
        )}
      >
        {icon[status]}
      </span>

      <Tooltip id="submission-status-tooltip" content={tooltip[status]} />
    </>
  );
};
