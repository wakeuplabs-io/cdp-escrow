"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSetChallengerProfile } from "@/hooks/challenges";
import { ChallengerProfile } from "@cdp/common/src/types/challenge";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const EditProfile: React.FC<{
  profile: ChallengerProfile;
  children: React.ReactNode;
}> = ({ children, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [website, setWebsite] = useState(profile.website);


  const { mutateAsync: setProfile, isPending } = useSetChallengerProfile();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfile({ name, description, website, logoURI: "" }).then(() => {
      setIsOpen(false);
      toast.success("Profile updated successfully");
    }).catch((error) => {
      toast.error("Failed to update profile");
      console.error(error);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[360px] rounded-3xl p-4 gap-0 pb-10">
        <div className=" mb-4 w-full flex justify-between">
          <DialogClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-full bg-muted h-4 w-4 flex items-center justify-center">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <DialogTitle className="text-center font-medium text-base mb-6">
          Edit Profile
        </DialogTitle>

        <DialogDescription className="text-sm text-muted-foreground text-center mb-6">
          Edit your profile information
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-2">
              <span className="text-xs text-muted-foreground absolute left-4 top-1">
                Name
              </span>
              <input
                className="text-sm text-muted-foreground outline-none w-full"
                placeholder="Acme DAO"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-2">
              <span className="text-xs text-muted-foreground absolute left-4 top-1">
                Description
              </span>
              <input
                className="text-sm text-muted-foreground outline-none w-full"
                placeholder="Acme DAO"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-2">
              <span className="text-xs text-muted-foreground absolute left-4 top-1">
                Website
              </span>
              <input
                className="text-sm text-muted-foreground outline-none w-full"
                placeholder="https://acme.dao"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
