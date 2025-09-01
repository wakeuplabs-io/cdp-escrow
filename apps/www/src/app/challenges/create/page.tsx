"use client";

import { AccountManager } from "@/components/account-manager/account-manager";
import { BackButton } from "@/components/back-button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TOKEN_DECIMALS } from "@/config";
import { useCreateChallenge } from "@/hooks/challenges";
import { cn } from "@/lib/utils";
import { challengeMetadataSchema } from "@cdp/common/src/types/challenge";
import { ChevronDownIcon, SendHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import { parseUnits } from "viem";

export default function CreateChallengePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [endsAt, setEndsAt] = useState<Date>(new Date());
  const [poolSize, setPoolSize] = useState("");

  const router = useRouter();

  const { mutateAsync: createChallenge, isPending: isCreatingChallenge } =
    useCreateChallenge();

  const onCreateChallenge = useCallback(async () => {
    // submit is disabled if validation fails, so here we can assume it's valid
    try {
      const challengeId = await createChallenge({
        title,
        description,
        poolSize: parseUnits(poolSize, TOKEN_DECIMALS),
        endDate: endsAt,
      });
      router.push(`/challenges/${challengeId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create challenge", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [title, description, endsAt, createChallenge, router]);

  const validation = useMemo(() => {
    if (Number(poolSize) < 1) {
      return {
        isValid: false,
        errors: ["Pool size must be greater than 1 USDC"],
      };
    }

    if (endsAt < new Date()) {
      return { isValid: false, errors: ["Deadline must be in the future"] };
    }

    const result = challengeMetadataSchema.safeParse({
      title,
      description,
    });

    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors = result.error.issues.map((issue) => issue.message);
    return { isValid: false, errors };
  }, [title, description, poolSize, endsAt]);

  const errorMessage = validation.errors[0];

  return (
    <div className="">
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <BackButton to="/" />

        <div className="flex items-center gap-2">
          <AccountManager />

          <button
            disabled={!validation.isValid || isCreatingChallenge}
            onClick={onCreateChallenge}
            className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            data-tooltip-id="error-tooltip"
          >
            <span>{isCreatingChallenge ? "Creating..." : "Publish"}</span>
            <SendHorizontalIcon className="w-4 h-4" />
          </button>

          {!validation.isValid && (
            <Tooltip id="error-tooltip" content={errorMessage} />
          )}
        </div>
      </div>

      <div className="flex min-h-screen max-w-4xl mx-auto">
        <div className="p-6 pb-20 w-full">
          {/* Title input */}
          <div className="bg-muted p-4 rounded-lg relative mb-4">
            <span className="text-xs text-muted-foreground absolute left-4 top-2">
              Title
            </span>
            <input
              type="text"
              value={title}
              placeholder="Challenge title"
              className="w-full h-full outline-none mt-4"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Title input */}
          <div className="bg-muted p-4 rounded-lg relative mb-4">
            <span className="text-xs text-muted-foreground absolute left-4 top-2">
              Pool Size (USDC)
            </span>
            <input
              type="text"
              value={poolSize}
              placeholder="Pool size"
              className="w-full h-full outline-none mt-4"
              onChange={(e) => setPoolSize(e.target.value)}
            />
          </div>

          {/* Deadline */}
          <div className="mb-6">
            <div className="flex gap-4">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    id="date-picker"
                    className="bg-muted p-4 rounded-lg relative min-w-[200px] w-full"
                  >
                    <span className="text-xs text-muted-foreground absolute left-4 top-2">
                      Deadline date
                    </span>
                    <div className="flex items-center justify-between mt-4">
                      {endsAt ? endsAt.toDateString() : "Select date"}
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endsAt}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) {
                        setEndsAt(date);
                        setCalendarOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div className="bg-muted p-4 rounded-lg relative">
                <span className="text-xs text-muted-foreground absolute left-4 top-2">
                  Deadline time
                </span>
                <input
                  type="time"
                  id="time-picker"
                  value={endsAt.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const newDeadline = new Date(endsAt);
                    newDeadline.setHours(hours, minutes, 0);
                    setEndsAt(newDeadline);
                  }}
                  className="w-full outline-none mt-4 pr-4 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Body input */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3 font-bold">
              <button
                className={cn(
                  "uppercase text-sm",
                  preview ? "text-muted-foreground" : ""
                )}
                onClick={() => setPreview(false)}
              >
                Write
              </button>
              <button
                className={cn(
                  "uppercase text-sm",
                  !preview ? "text-muted-foreground" : ""
                )}
                onClick={() => setPreview(true)}
              >
                Preview
              </button>
            </div>

            {preview ? (
              <div className="w-full border rounded-lg p-10">
                <div className="prose prose-sm max-w-2xl">
                  <Markdown>{description}</Markdown>
                </div>
              </div>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-full outline-none bg-muted p-4 rounded-lg"
                placeholder="Write your markdown challenge here..."
                rows={10}
              />
            )}
          </div>

          {/* How it works */}
          <div className="">
            <div className="font-medium mb-2">How it works</div>
            <div className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
              assumenda eum aperiam facere. Incidunt natus sunt voluptatem sit
              at sapiente fugiat voluptatum recusandae repellendus voluptatibus
              non quibusdam sed, facere dolorum.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
