"use client";

import { AccountManager } from "@/components/account-manager";
import { ChallengeCard } from "@/components/challenge-card";
import { CreateChallengeButton } from "@/components/create-challenge-button";
import { EditProfile } from "@/components/edit-profile";
import { Logo } from "@/components/logo";
import { useChallengerProfile, useChallenges } from "@/hooks/challenges";
import { useCopyToClipboard } from "@/hooks/copy";
import { useInfiniteScroll } from "@/hooks/infinite-scroll";
import { shortenAddress } from "@/lib/utils";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { CheckIcon, CopyIcon, GlobeIcon, SettingsIcon } from "lucide-react";
import React, { useMemo } from "react";
import { Address } from "viem";

export default function ChallengesPage({
  params,
}: {
  params: Promise<{ challenger: Address | "all" }>;
}) {
  const { challenger } = React.use(params);

  const { evmAddress } = useEvmAddress();
  const { data, fetchNextPage, hasNextPage, isPending } =
    useChallenges(challenger);
  const { data: profile } = useChallengerProfile(challenger);
  const { copyToClipboard, copied } = useCopyToClipboard();

  const loadMoreRef = useInfiniteScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage
  );

  const sortedChallenges = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.challenges)
        .sort((a, b) => b.id - a.id) ?? []
    );
  }, [data]);

  const isProfileAdmin = useMemo(() => {
    return challenger === evmAddress;
  }, [evmAddress, challenger]);

  return (
    <div>
      <div className="border-b">
        <div className="flex  items-center justify-between h-[72px] max-w-7xl mx-auto">
          <Logo width={150} height={46} />

          <AccountManager />
        </div>
      </div>

      {profile ? (
        <div className="border-b">
          <div
            className="py-10 border-b relative bg-cover bg-center"
            style={{
              backgroundImage: `url(/avatar.webp)`,
            }}
          >
            <div className="absolute inset-0 backdrop-blur-3xl bg-black/30"></div>
          </div>

          <div className="max-w-7xl mx-auto relative py-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {profile.name === ""
                  ? shortenAddress(challenger as Address)
                  : profile.name}
              </h1>
              <div className="text-sm text-muted-foreground space-x-1 mt-1">
                <span>{shortenAddress(challenger as Address)}</span>
                <button
                  onClick={() => copyToClipboard(challenger as Address)}
                  disabled={copied}
                >
                  {copied ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    <CopyIcon className="w-3 h-3" />
                  )}
                </button>
              </div>

              <p className="mt-1 text-sm">{profile.description}</p>
            </div>

            <div className="flex items-center gap-4 mt-6">
              {profile.website !== "" && (
                <button
                  onClick={() => {
                    if (profile.website === "") return;
                    window.open(
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`,
                      "_blank"
                    );
                  }}
                >
                  <GlobeIcon className="text-muted-foreground w-5 h-5" />
                </button>
              )}

              {isProfileAdmin && (
                <EditProfile profile={profile}>
                  <button>
                    <SettingsIcon className="text-muted-foreground w-5 h-5" />
                  </button>
                </EditProfile>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto flex items-center justify-between py-4">
            <div className="uppercase text-sm font-medium text-muted-foreground py-2">
              Challenges
            </div>

            {isProfileAdmin && <CreateChallengeButton />}
          </div>
        </div>
      ) : (
        <div className="border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-6">
            <div className="uppercase text-sm font-medium text-muted-foreground py-2">
              Challenges
            </div>

            <CreateChallengeButton />
          </div>
        </div>
      )}

      <div className=" mx-auto">
        <div className="  max-w-7xl mx-auto">
          <div className="divide-y">
            {sortedChallenges.map((challenge, id) => (
              <ChallengeCard key={id} challenge={challenge} />
            ))}
          </div>

          <div ref={loadMoreRef} className="py-4 text-muted-foreground text-sm">
            {isPending && <span>Loading more...</span>}

            {!isPending && sortedChallenges.length === 0 && (
              <span>No challenges found</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
