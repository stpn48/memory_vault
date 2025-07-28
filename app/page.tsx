"use client";

import { Input } from "@/components/ui/input";
import { AvatarMenu } from "./_components/avatar-menu";
import { CreateMemory } from "./_components/create-memory";
import { Memories } from "./_components/memories";

export default function Home() {
  return (
    <div className="p-4 min-h-screen flex flex-col gap-10">
      <section className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Memories</h1>

        <Input className="w-[300px]" placeholder="search a memory" />

        <AvatarMenu />
      </section>

      <Memories />

      <CreateMemory />
    </div>
  );
}
