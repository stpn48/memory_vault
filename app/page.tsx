"use client";

import { AvatarMenu } from "./_components/avatar-menu";
import { CreateMemory } from "./_components/create-memory";
import { Memories } from "./_components/memories/memories";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-8 p-6">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Memory Vault</h1>

        <div className="w-[500px]"></div>

        <AvatarMenu />
      </section>

      <Memories />

      <CreateMemory />
    </div>
  );
}
