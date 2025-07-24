"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated } from "convex/react";
import { CreateMemory } from "./_components/create-memory";
import { Memories } from "./_components/memories";
import { AvatarMenu } from "./_components/avatar-menu";

export default function Home() {
  const { signOut } = useAuthActions();
  return (
    <div className="p-4 flex flex-col gap-4">
      <Authenticated>
        <Button onClick={() => signOut()}>sign out</Button>
      </Authenticated>

      <section className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Memories</h1>

        <CreateMemory />

        <AvatarMenu />
      </section>
      <Memories />
    </div>
  );
}
