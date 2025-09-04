"use client";

import { AccountManager } from "@/components/account-manager";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Address } from "viem";

export default function Page({
  params,
}: {
  params: Promise<{ id: string; challenger: Address }>;
}) {
  const router = useRouter();
  const { id, challenger } = React.use(params);
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
        router.push(`/${challenger}/challenges/${id}`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create submission", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      });
  }, [id, description, contact, createSubmission, router, challenger]);

  const validation = useMemo(() => {
    if (!contact) {
      return { isValid: false, errors: ["Contact is required"] };
    } else if (challenge?.status !== "active") {
      return { isValid: false, errors: ["Challenge is not active"] };
    } else if (challenge?.admin === evmAddress) {
      return {
        isValid: false,
        errors: ["You are the admin of this challenge"],
      };
    } else if (!evmAddress) {
      return { isValid: false, errors: ["Please connect your wallet"] };
    }

    const result = submissionMetadataSchema.safeParse({
      description,
    });
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }, [description, contact, challenge?.status, challenge?.admin, evmAddress]);

  const errorMessage = useMemo(() => validation.errors[0], [validation.errors]);

  return (
    <div className="">
      <div className="border-b">
        <div className="flex max-w-7xl mx-auto items-center justify-between h-[72px]">
          <Link
            href=".."
            className="flex items-center justify-center h-[46px] w-[46px]  border rounded-full"
          >
            <MoveLeftIcon className="w-4 h-4" />
          </Link>

          <AccountManager />
        </div>
      </div>

      <div className="min-h-screen max-w-5xl mx-auto">
        {/* How it works */}
        <div className="pt-10 mb-6">
          <div className="font-bold mb-2 text-xl">Create Submission</div>
          <div className="text-sm text-muted-foreground">
            Upload your work before the deadline. You can share a repo, design
            file, demo link, document, or any format requested in the challenge.
            Add a short note about your submission and your email so we can
            contact you if you win.
          </div>
        </div>

        {/* Create submission form */}
        <div className="mb-10 w-full">
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
          <div className="mb-2">
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

          <div className="text-xs text-muted-foreground">
            Examples: GitHub repo, Figma/Canva link, Loom video, PDF/Doc, live
            demo URL.
          </div>
        </div>

        {/* submit and cancel buttons */}
        <div className="flex justify-end gap-2 mb-20">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => router.push(`/${challenger}/challenges/${id}`)}
          >
            Cancel
          </Button>

          <Button
            tooltip={errorMessage}
            disabled={!validation.isValid || isCreatingSubmission}
            onClick={onCreateSubmission}
            className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isCreatingSubmission ? "Creating..." : "Submit"}</span>
            <SendHorizontalIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
