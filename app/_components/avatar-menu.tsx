"use client";

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
import { CircleUser, LogOut, Settings } from "lucide-react";

type Props = {};

export function AvatarMenu({}: Props) {
  const currentUser = useQuery(api.auth.currentUser);

  const { signOut } = useAuthActions();

  if (currentUser === undefined) {
    // loading
    return;
  }

  if (!currentUser) {
    return;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
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
        <DropdownMenuItem className="flex items-center gap-2">
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex group items-center text-red-500 focus:text-red-400"
          onClick={signOut}
        >
          <LogOut className="size-4 group-hover:text-red-400 text-red-500" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
