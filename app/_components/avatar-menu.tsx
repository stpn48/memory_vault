"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { CircleUser, LogOut } from "lucide-react";
import { Settings } from "./settings";
import { useState } from "react";

type Props = {};

export function AvatarMenu({}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentUser = useQuery(api.auth.currentUser);

  const { signOut } = useAuthActions();

  if (currentUser === undefined) {
    return (
      <Avatar>
        <AvatarFallback className="animate-pulse"></AvatarFallback>
      </Avatar>
    );
  }

  if (!currentUser) {
    return;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarImage src={currentUser.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom">
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 text-foreground"
          >
            <CircleUser className="size-4" />
            {currentUser.email}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2"
          >
            <SettingsIcon className="size-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex group items-center text-red-500 focus:text-red-400"
            onClick={signOut}
          >
            <LogOut className="size-4 group-hover:text-red-400 text-red-500" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Settings open={settingsOpen} setOpen={setSettingsOpen} />
    </>
  );
}
