"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated } from "convex/react";
import { CreateMemory } from "./_components/create-memory";

export default function Home() {
  const { signOut } = useAuthActions();
  return (
    <div>
      zmrd
      <CreateMemory />
      <Authenticated>
        <Button onClick={() => signOut()}>sign out</Button>
      </Authenticated>
    </div>
  );
}
