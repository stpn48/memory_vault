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
        placeholder="Search a memory"
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

      <DialogContent className="flex max-h-[80%] min-h-[40%] flex-col gap-10 overflow-auto">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Memory details</DialogTitle>
          </VisuallyHidden>
          <DialogDescription className="text-foreground text-sm">
            {memory.content}
          </DialogDescription>
        </DialogHeader>
        <MemoryImages memory={memory} />
        <MemoryDate memory={memory} />
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
  return memory.imageUrls.length > 0 ? (
    <div className="flex w-full flex-1 items-center justify-center">
      <ImagesStack imageUrls={memory.imageUrls} />
    </div>
  ) : (
    <NoImages />
  );
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
function ImagesStack({ imageUrls }: { imageUrls: (string | null)[] }) {
  const [imageSliderImageIndex, setImageSliderImageIndex] = useState<number | null>(null);

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <ImagePreviewGroup imageUrls={imageUrls} />
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] w-full !max-w-screen overflow-auto border-0 bg-transparent p-10 lg:w-[80%]">
          <ImageGrid imageUrls={imageUrls} setImageSliderImageIndex={setImageSliderImageIndex} />
          <ImageSlider
            imageSliderImageIndex={imageSliderImageIndex}
            setImageSliderImageIndex={setImageSliderImageIndex}
            imageUrls={imageUrls}
          />
        </DialogContent>
      </Dialog>
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

// Component: Image Grid
function ImageGrid({
  imageUrls,
  setImageSliderImageIndex,
}: {
  imageUrls: (string | null)[];
  setImageSliderImageIndex: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {imageUrls.map((url, i) => {
        if (!url) return null;

        return (
          <div
            onClick={() => setImageSliderImageIndex(i)}
            key={i}
            className="relative h-[250px] w-full cursor-pointer overflow-hidden rounded-lg border shadow transition-all hover:scale-102"
          >
            <img src={url} alt={`memory-preview-${i}`} className="h-full w-full object-cover" />
          </div>
        );
      })}
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

  return createPortal(
    isOpen && (
      <div
        onClick={() => setImageSliderImageIndex(null)}
        className="pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50"
      >
        <SliderButton
          direction="left"
          onClick={() =>
            setImageSliderImageIndex((prev) => (prev !== null ? Math.max(prev - 1, 0) : null))
          }
        />
        <img
          onClick={(e) => e.stopPropagation()}
          src={imageUrls[imageSliderImageIndex!]}
          alt="memory-preview"
          className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-lg"
        />
        <SliderButton
          direction="right"
          onClick={() =>
            setImageSliderImageIndex((prev) =>
              prev !== null ? Math.min(prev + 1, imageUrls.length - 1) : null,
            )
          }
        />
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
  query = query.trim().toLowerCase();

  return days
    .map((day) => {
      const filteredMemories = day.memories.filter((memory) =>
        memory.content.trim().toLowerCase().includes(query),
      );

      return filteredMemories.length > 0 ? { ...day, memories: filteredMemories } : null;
    })
    .filter((day) => day !== null) as { creationDate: string; memories: MemoryWithUrls[] }[];
}
