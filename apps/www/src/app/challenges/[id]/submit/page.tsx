"use client";

import { AccountManager } from "@/components/account-manager";
import { useChallenge } from "@/hooks/challenges";
import { useCreateSubmission } from "@/hooks/submissions";
import { cn } from "@/lib/utils";
import { submissionMetadataSchema } from "@cdp/common/src/types/submission";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { MoveLeftIcon, SendHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { evmAddress } = useEvmAddress();

  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);

  const { data: challenge } = useChallenge(Number(id));
  const { mutateAsync: createSubmission, isPending: isCreatingSubmission } =
    useCreateSubmission();

  const onCreateSubmission = useCallback(async () => {
    // submit is disabled if validation fails, so here we can assume it's valid
    createSubmission({
      challengeId: Number(id),
      contact,
      description: description,
    })
      .then(({ userOperationHash }) => {
        toast.success(
          "Submission created successfully with user operation hash: " +
            userOperationHash
        );
        router.push(`/challenges/${id}`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create submission", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      });
  }, [id, description, contact, createSubmission, router]);

  const validation = useMemo(() => {
    if (!contact) {
      return { isValid: false, errors: ["Contact is required"] };
    }
    if (challenge?.status !== "active") {
      return { isValid: false, errors: ["Challenge is not active"] };
    }
    if (challenge?.admin === evmAddress) {
      return {
        isValid: false,
        errors: ["You are the admin of this challenge"],
      };
    }
    if (!evmAddress) {
      return { isValid: false, errors: ["Please connect your wallet"] };
    }

    const result = submissionMetadataSchema.safeParse({
      description,
    });

    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors = result.error.issues.map((issue) => issue.message);
    return { isValid: false, errors };
  }, [description, contact, challenge?.status, challenge?.admin, evmAddress]);

  const errorMessage = useMemo(() => validation.errors[0], [validation.errors]);

  return (
    <div className="">
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <Link
          href="/"
          className="flex items-center justify-center h-[46px] w-[46px]  border rounded-full"
        >
          <MoveLeftIcon className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2">
          <AccountManager />

          <button
            disabled={!validation.isValid || isCreatingSubmission}
            onClick={onCreateSubmission}
            className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            data-tooltip-id="error-tooltip"
          >
            <span>{isCreatingSubmission ? "Creating..." : "Submit"}</span>
            <SendHorizontalIcon className="w-4 h-4" />
          </button>

          {!validation.isValid && (
            <Tooltip id="error-tooltip" content={errorMessage} />
          )}
        </div>
      </div>

      <div className="flex min-h-screen max-w-2xl mx-auto">
        <div className="p-6 pb-20 w-full">
          {/* Title input */}
          <div className="bg-muted p-4 rounded-lg relative mb-4">
            <span className="text-xs text-muted-foreground absolute left-4 top-2">
              Contact
            </span>
            <input
              type="text"
              value={contact}
              placeholder="Contact email"
              className="w-full h-full outline-none mt-4"
              onChange={(e) => setContact(e.target.value)}
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
              <div className=" border rounded-lg p-4">
                <div className="prose">
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
