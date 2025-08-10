"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { MemoryWithUrls } from "@/types/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePaginatedQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";

// Component: Memories
export function Memories() {
  const {
    results: days,
    status,
    loadMore,
  } = usePaginatedQuery(api.memories.getUserMemories, {}, { initialNumItems: 10 });

  const [query, setQuery] = useState("");

  // Handle loading state
  if (status === "LoadingFirstPage") {
    return <LoadingSkeleton />;
  }

  // Handle empty state
  if (days.length === 0) {
    return <EmptyState />;
  }

  // Filter memories based on the query
  const filteredDays = filterByQuery(days, query);

  return (
    <div className="flex flex-col gap-8">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="absolute top-4 right-1/2 left-1/2 w-[300px] -translate-x-1/2"
        placeholder="Search a memory or date"
      />

      {filteredDays.map((day) => (
        <DaySection key={day.creationDate} day={day} />
      ))}

      {status === "CanLoadMore" && <LoadMoreButton loadMore={loadMore} />}
    </div>
  );
}

// Component: Day Section
function DaySection({ day }: { day: { creationDate: string; memories: MemoryWithUrls[] } }) {
  return (
    <div className="flex flex-col gap-4">
      <p>{day.creationDate}</p>
      <hr />
      <div className="flex flex-wrap items-center gap-4">
        {day.memories.map((memory) => (
          <MemoryCard key={memory._id} memory={memory} />
        ))}
      </div>
    </div>
  );
}

// Component: Memory Card
function MemoryCard({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return (
    <Dialog>
      <div className="flex w-[300px] flex-col gap-[2px]">
        <DialogTrigger>
          <MemoryPreview memory={memory} />
        </DialogTrigger>
        <MemoryDate memory={memory} />
      </div>

      <DialogContent className="flex max-h-[80%] min-h-[40%] w-full !max-w-screen flex-col gap-10 overflow-auto md:flex-row lg:w-[90%]">
        <DialogHeader className="flex-1 overflow-scroll">
          <VisuallyHidden>
            <DialogTitle>Memory details</DialogTitle>
          </VisuallyHidden>

          <DialogDescription className="text-foreground text-justify text-sm">
            {memory.content}
          </DialogDescription>

          <MemoryDate memory={memory} />
        </DialogHeader>

        <MemoryImages memory={memory} />
      </DialogContent>
    </Dialog>
  );
}

// Component: Memory Preview
function MemoryPreview({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return (
    <div className="ring-secondary flex w-full cursor-pointer items-center justify-between rounded-lg border-2 p-3 text-sm hover:ring-2">
      {memory.content.length > 20 ? `${memory.content.substring(0, 20)}...` : memory.content}

      {memory.imageIds.length > 0 && (
        <div className="flex items-center gap-1 text-xs">
          <p className="text-muted-foreground">{memory.imageIds.length}</p>
          <Images className="text-muted-foreground size-4" />
        </div>
      )}
    </div>
  );
}

// Component: Memory Date
function MemoryDate({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return (
    <div className="flex flex-row-reverse">
      <p className="text-secondary-foreground/50 text-xs">
        from:{" "}
        {new Date(memory._creationTime).toLocaleString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </p>
    </div>
  );
}

// Component: Memory Images
function MemoryImages({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return memory.imageUrls.length > 0 ? <ImageGrid imageUrls={memory.imageUrls} /> : <NoImages />;
}

// Component: No Images
function NoImages() {
  return (
    <div className="flex min-h-[300px] flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Images className="text-muted-foreground size-4" />
        <span className="text-muted-foreground text-xs">No Images for this memory...</span>
      </div>
    </div>
  );
}

// Component: Images Stack
function ImageGrid({ imageUrls }: { imageUrls: (string | null)[] }) {
  const [imageSliderImageIndex, setImageSliderImageIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2">
        <img
          onClick={() => setImageSliderImageIndex(0)}
          src={imageUrls[0] || ""}
          alt="memory-preview"
          className="border-border h-[400px] cursor-pointer rounded-md border object-cover shadow-md transition-all hover:scale-101 hover:contrast-105"
        />

        <div className="grid grid-cols-3 gap-2">
          {imageUrls.slice(1, 3).map((url, i) => {
            if (!url) return null;

            return (
              <img
                onClick={() => setImageSliderImageIndex(i + 1)}
                key={i}
                src={url}
                alt={`memory-preview-${i}`}
                className="border-border h-[150px] cursor-pointer rounded-md border object-cover shadow-md transition-all hover:scale-102"
              />
            );
          })}

          {imageUrls.length > 3 && (
            <div
              onClick={() => setImageSliderImageIndex(3)}
              className="relative flex h-[150px] w-full cursor-pointer items-center justify-center transition-all hover:scale-102"
            >
              {imageUrls.slice(3).map((url, i) => (
                <img
                  className="border-border absolute h-[120px] w-[90%] rounded-md border object-cover"
                  key={i}
                  style={{ rotate: `${i * 7}deg` }}
                  src={url || ""}
                  alt="image"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageSlider
        imageSliderImageIndex={imageSliderImageIndex}
        setImageSliderImageIndex={setImageSliderImageIndex}
        imageUrls={imageUrls}
      />
    </>
  );
}

// Component: Image Preview Group
function ImagePreviewGroup({ imageUrls }: { imageUrls: (string | null)[] }) {
  return (
    <div className="group relative h-[200px] w-[250px] cursor-pointer">
      {imageUrls.map((url, i) => {
        if (!url) return null;

        return (
          <img
            key={i}
            src={url}
            alt="memory-preview"
            className={cn(
              "absolute top-0 left-0 h-full w-full rounded-md border object-cover shadow transition-transform duration-300",
              i === 0 &&
                "z-30 -translate-x-0.5 -rotate-1 group-hover:-translate-x-2 group-hover:-rotate-6",
              i === 1 &&
                "z-20 translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-2",
              i === 2 &&
                "z-10 translate-x-1 rotate-1 group-hover:translate-x-3 group-hover:rotate-6",
            )}
          />
        );
      })}
      <div className="group-hover:border-primary group-hover:shadow-primary/40 absolute inset-0 rounded-md border border-transparent transition-all duration-300 group-hover:shadow-lg" />
    </div>
  );
}

// Component: Image Slider
function ImageSlider({
  imageSliderImageIndex,
  setImageSliderImageIndex,
  imageUrls,
}: {
  imageSliderImageIndex: number | null;
  setImageSliderImageIndex: Dispatch<SetStateAction<number | null>>;
  imageUrls: (string | null)[];
}) {
  const isOpen = imageSliderImageIndex !== null;
  const len = imageUrls.length;

  return createPortal(
    isOpen && (
      <div
        onClick={() => setImageSliderImageIndex(null)}
        className="pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-black/50"
      >
        <div className="flex flex-1 items-center">
          <SliderButton
            direction="left"
            onClick={() =>
              setImageSliderImageIndex((prev) =>
                prev === null ? null : prev === 0 ? len - 1 : prev - 1,
              )
            }
          />

          <img
            onClick={(e) => e.stopPropagation()}
            src={imageUrls[imageSliderImageIndex!] || ""}
            alt="memory-preview"
            className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-lg"
          />

          <SliderButton
            direction="right"
            onClick={() =>
              setImageSliderImageIndex((prev) =>
                prev === null ? null : prev === len - 1 ? 0 : prev + 1,
              )
            }
          />
        </div>

        <div className="grid w-1/2 grid-cols-5 gap-4 p-4">
          {imageUrls.map((url, i) => (
            <img
              onClick={(e) => {
                e.stopPropagation();
                setImageSliderImageIndex(i);
              }}
              className={cn(
                "border-border h-[120px] w-full cursor-pointer rounded-md border object-cover transition-all hover:scale-102",
                {
                  "ring-accent ring-ring ring ring-2": i === imageSliderImageIndex,
                },
              )}
              alt="memory-preview"
              key={i}
              src={url || ""}
            />
          ))}
        </div>
      </div>
    ),
    document.body,
  );
}

// Component: Slider Button
function SliderButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`bg-secondary/50 hover:bg-secondary/60 absolute ${
        direction === "left" ? "left-4" : "right-4"
      } flex cursor-pointer items-center justify-center rounded-full p-2`}
    >
      <Icon className="text-muted-foreground" />
    </button>
  );
}

// Component: Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="flex w-full flex-col gap-[2px]" key={i}>
          <Skeleton className="h-[40px] w-full" />
          <div className="flex flex-row-reverse">
            <Skeleton className="h-[16px] w-[150px] !rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Empty State
function EmptyState() {
  return (
    <div className="mb-20 flex w-full flex-1 flex-col items-center justify-center">
      <p className="text-secondary-foreground/50 text-xs">No memories yet...</p>
    </div>
  );
}

// Component: Load More Button
function LoadMoreButton({ loadMore }: { loadMore: (numItems: number) => void }) {
  return (
    <button onClick={() => loadMore(10)} className="bg-primary mt-4 rounded p-2 text-white">
      Load more
    </button>
  );
}

// Utility: Filter Memories by Query
function filterByQuery(
  days: { creationDate: string; memories: MemoryWithUrls[] }[],
  query: string,
): { creationDate: string; memories: MemoryWithUrls[] }[] {
  // Normalize the query string
  query = query.trim().toLowerCase();

  return days
    .map((day) => {
      // Check if the day matches the query
      const isDateMatch = new Date(day.creationDate)
        .toLocaleDateString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
        .toString()
        .includes(query);

      if (isDateMatch) {
        return day;
      }

      // Filter memories that match the query
      const filteredMemories = day.memories.filter((memory) =>
        memory.content.trim().toLowerCase().includes(query),
      );

      // Include the day if either the date matches or there are matching memories
      if (filteredMemories.length > 0) {
        return {
          ...day,
          memories: filteredMemories,
        };
      }

      return null; // Exclude days with no matches
    })
    .filter((day) => day !== null) as { creationDate: string; memories: MemoryWithUrls[] }[];
}
