"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Images } from "lucide-react";

type Props = {};

export function Memories({}: Props) {
  const userMemories = useQuery(api.memories.getUserMemories);

  if (userMemories === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="flex flex-col w-full gap-[2px]" key={i}>
            <Skeleton className="h-[40px] w-full" />
            <div className="flex flex-row-reverse">
              <Skeleton className="h-[16px] !rounded-sm w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (userMemories.length === 0) {
    return (
      <div className="mb-20 w-full flex-1 flex flex-col items-center justify-center">
        <p className="text-xs text-secondary-foreground/50">
          No memories yet...
        </p>
      </div>
    );
  }

  return (
    <div className={"flex justify-center gap-8 flex-wrap"}>
      {userMemories.map((memory) => (
        <MemoryCard memory={memory} key={memory._id} />
      ))}
    </div>
  );
}

function MemoryCard({ memory }: { memory: Doc<"memories"> }) {
  return (
    <Dialog>
      <div className="flex w-[300px] flex-col gap-[2px]">
        <DialogTrigger>
          <div className="border-2 flex justify-between text-sm items-center rounded-lg cursor-pointer hover:ring-2 ring-secondary p-3 w-full">
            {memory.content.length > 20
              ? `${memory.content.substring(0, 20)}...`
              : memory.content}

            <div className="flex text-secondary text-xs items-center gap-1">
              0
              <Images className="text-secondary size-4" />
            </div>
          </div>
        </DialogTrigger>

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

      <DialogContent className="max-h-[80%] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogDescription>
            <p>{memory.content}</p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[300px] flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <Images className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              No Images for this memory...
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
