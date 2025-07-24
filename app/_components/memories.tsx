"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader } from "lucide-react";

type Props = {};

export function Memories({}: Props) {
  const userMemories = useQuery(api.memories.getUserMemories);

  if (userMemories === undefined) {
    return (
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-xs animate-pulse text-secondary-foreground/50">
            Loading
          </p>
          <Loader className="animate-spin size-4" />
        </div>
      </div>
    );
  }

  const isGrid = userMemories.length > 3;

  return (
    <div
      className={
        isGrid
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          : "flex gap-4 flex-wrap"
      }
    >
      {userMemories.map((memory) => (
        <div
          className="flex flex-col gap-[2px]"
          key={memory._id}
          style={{ width: isGrid ? "100%" : "300px" }}
        >
          <div className="border-2 text-sm rounded-lg cursor-pointer hover:ring-2 ring-secondary p-2 w-full">
            {memory.content.length > 20
              ? `${memory.content.substring(0, 20)}...`
              : memory.content}
          </div>
          <div className="flex flex-row-reverse">
            <p className="text-xs text-secondary-foreground/50">
              from:{" "}
              {new Date(memory._creationTime).toLocaleString(undefined, {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}{" "}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
