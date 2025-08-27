"use client";

import { cn } from "@/lib/utils";
import { SendHorizontalIcon } from "lucide-react";
import Markdown from "react-markdown";
import { useState, useMemo } from "react";
import { useCallback } from "react";
import { BackButton } from "@/components/back-button";
import { toast } from "sonner";
import { Tooltip } from "react-tooltip";
import { challengeMetadataSchema } from "@/types/challenges";
import { useCreateChallenge } from "@/hooks/challenges";
import { useRouter } from "next/navigation";

export default function CreateChallengePage() {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState(false);

  const router = useRouter();

  const { mutateAsync: createChallenge, isPending: isCreatingChallenge } =
    useCreateChallenge();

  const onCreateChallenge = useCallback(async () => {
    // submit is disabled if validation fails, so here we can assume it's valid
    try {
      const challengeId = await createChallenge();
      router.push(`/challenges/${challengeId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create challenge", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [title, body, createChallenge, router]);

  const validation = useMemo(() => {
    const result = challengeMetadataSchema.safeParse({
      title,
      body,
    });

    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors = result.error.issues.map((issue) => issue.message);
    return { isValid: false, errors };
  }, [title, body]);

  const errorMessage = validation.errors[0];

  return (
    <div className="">
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <BackButton to="/" />

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

      <div className="flex divide-x min-h-screen">
        <div className="p-6 pb-20 w-full">
          {/* Title input */}
          <div className="bg-muted p-4 rounded-lg relative mb-4">
            <span className="text-xs text-muted-foreground absolute left-4 top-2">
              Contact
            </span>
            <input
              type="text"
              value={title}
              placeholder="Contact email"
              className="w-full h-full outline-none mt-4"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>


          {/* Body input */}
          <div className="mb-6">
            <div className="flex gap-2  mb-3 font-bold">
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
              <div className="prose border rounded-lg p-4">
                <Markdown>{body}</Markdown>
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full outline-none bg-muted p-4 rounded-lg"
                placeholder="Write your markdown challenge here..."
                rows={10}
              />
            )}
          </div>


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
