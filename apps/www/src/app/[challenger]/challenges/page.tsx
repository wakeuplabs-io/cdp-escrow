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
import Image from "next/image";
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
        <div className="flex  items-center justify-between h-[72px] max-w-5xl mx-auto">
          <Logo width={150} height={46} />

          <AccountManager />
        </div>
      </div>

      {profile ? (
        <div>
          <div
            className="py-10 border-b relative bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                profile.logoURI === "" ? "/avatar.webp" : profile.logoURI
              })`,
            }}
          >
            <div className="absolute inset-0 backdrop-blur-3xl bg-black/30"></div>

            <div className="max-w-5xl mx-auto flex items-center justify-end gap-2 z-40 h-10">
              {isProfileAdmin && (
                <>
                  <CreateChallengeButton className="z-10" />

                  <EditProfile profile={profile}>
                    <button className="flex items-center gap-2 rounded-full border h-[46px] w-[46px] shrink-0 justify-center z-10 bg-white">
                      <SettingsIcon className="h-4 w-4" />
                    </button>
                  </EditProfile>
                </>
              )}
            </div>
          </div>

          <div className="max-w-5xl mx-auto relative py-6">
            <div className="border-2 border-white bg-white w-[80px] rounded-md overflow-hidden -mt-20">
              <Image
                src={profile.logoURI === "" ? "/avatar.webp" : profile.logoURI}
                alt="challenges"
                width={80}
                height={80}
              />
            </div>

            <div className="mt-4">
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

              <p className="mt-1">{profile.description}</p>
            </div>

            {profile.website !== "" && (
              <button
                className="mt-6"
                onClick={() => {
                  window.open(profile.website ?? "", "_blank");
                }}
              >
                <GlobeIcon className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="">
          <div className="max-w-5xl mx-auto flex items-center justify-end py-6">
            <CreateChallengeButton />
          </div>
        </div>
      )}

      <div className=" mx-auto">
        <div className="uppercase text-sm font-medium text-muted-foreground py-2 max-w-5xl mx-auto">
          Challenges
        </div>

        <hr />

        <div className="  max-w-5xl mx-auto">
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
