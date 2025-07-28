"use client";

import { AvatarMenu } from "./_components/avatar-menu";
import { CreateMemory } from "./_components/create-memory";
import { Memories } from "./_components/memories";

export default function Home() {
  return (
    <div className="p-4 min-h-screen flex flex-col gap-4">
      <section className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Memories</h1>

        <CreateMemory />

        <AvatarMenu />
      </section>

      <Memories />
    </div>
  );
}
