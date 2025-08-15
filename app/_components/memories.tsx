"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { MemoryWithUrls } from "@/types/types";
import { usePaginatedQuery } from "convex/react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Images, Search } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";

// Component: Memories
export function Memories() {
  const {
    results: days,
    status,
    loadMore,
  } = usePaginatedQuery(api.memories.getUserMemories, {}, { initialNumItems: 3 });

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
      {/* Search Bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-background/50 border-muted/50 focus:border-primary/50 placeholder:text-muted-foreground h-12 pl-10"
          placeholder="Search memories or dates..."
        />
      </div>

      {/* Memories Grid */}
      <div className="space-y-8">
        {filteredDays.map((day) => (
          <DaySection key={day.creationDate} day={day} />
        ))}
      </div>

      {status === "CanLoadMore" && <LoadMoreButton loadMore={loadMore} />}
    </div>
  );
}

function DaySection({ day }: { day: { creationDate: string; memories: MemoryWithUrls[] } }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4" />
          {day.creationDate}
        </div>
        <Badge variant="secondary" className="text-xs">
          {day.memories.length} {day.memories.length === 1 ? "memory" : "memories"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <DialogTrigger>
        <div className="border-border hover:border-primary/30 cursor-pointer space-y-3 rounded-lg border p-4 transition-all hover:scale-[1.02] hover:shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <p className="text-foreground line-clamp-3 text-start text-sm leading-relaxed">
              {memory.content.length > 100
                ? `${memory.content.substring(0, 100)}...`
                : memory.content}
            </p>

            {memory.imageUrls.length > 0 && (
              <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1">
                <Images className="text-primary h-3 w-3" />
                <span className="text-primary text-xs font-medium">{memory.imageUrls.length}</span>
              </div>
            )}
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(memory._creationTime).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {memory.imageUrls.length > 0 && (
              <div className="flex -space-x-1">
                {memory.imageUrls.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className="border-background bg-muted h-6 w-6 overflow-hidden rounded-full border-2"
                  >
                    <img
                      src={url || ""}
                      alt=""
                      width={24}
                      height={24}
                      style={{ objectFit: "cover" }}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}
                {memory.imageUrls.length > 3 && (
                  <div className="border-background bg-muted flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium">
                    +{memory.imageUrls.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-full !max-w-screen flex-col p-8 md:w-[90vh] lg:w-[80vw] lg:flex-row">
        {/* Content Section */}
        <div className="flex flex-1 flex-col gap-4 overflow-scroll">
          <h2 className="text-foreground text-xl font-semibold">Memory Details</h2>

          <p className="text-foreground flex-1 overflow-y-auto text-base leading-relaxed whitespace-pre-wrap">
            {memory.content}
          </p>

          <MemoryDate memory={memory} />
        </div>

        {/* Images Section */}
        <div className="min-w-0 flex-1">
          <ImageGrid imageUrls={memory.imageUrls} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component: Memory Date
function MemoryDate({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4" />
      <span>
        {new Date(memory._creationTime).toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </span>
    </div>
  );
}

function ImageGrid({ imageUrls }: { imageUrls: (string | null)[] }) {
  const [imageSliderImageIndex, setImageSliderImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    // Remove failed image from the list
    console.warn(`Failed to load image at index ${index}`);
  };

  return imageUrls.length > 0 ? (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-foreground text-lg font-medium">Images</h3>

        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative">
            {!loadedImages.has(0) && (
              <div className="bg-muted absolute inset-0 animate-pulse rounded-xl" />
            )}
            <Image
              onClick={() => setImageSliderImageIndex(0)}
              src={imageUrls[0] || ""}
              alt="memory-preview"
              width={400}
              height={300}
              className={`h-[300px] w-full cursor-pointer rounded-xl border object-cover shadow-md transition-all hover:scale-[1.02] hover:shadow-lg lg:h-[400px] ${
                loadedImages.has(0) ? "opacity-100" : "opacity-0"
              }`}
              style={{ objectFit: "cover" }}
              loading="lazy"
              onLoad={() => handleImageLoad(0)}
              onError={() => handleImageError(0)}
            />
          </div>

          {/* Thumbnail Grid under main image*/}
          <div className="flex w-full justify-center gap-3">
            {imageUrls.slice(1, 3).map((url, i) => {
              if (!url) return null;
              const imageIndex = i + 1;

              return (
                <div key={i} className="max-w-1/2 flex-1">
                  {!loadedImages.has(imageIndex) && (
                    <div className="bg-muted absolute inset-0 flex-1 animate-pulse rounded-lg" />
                  )}

                  <img
                    onClick={() => setImageSliderImageIndex(imageIndex)}
                    src={url}
                    alt={`memory-preview-${i}`}
                    className={`h-[120px] w-full cursor-pointer rounded-lg border object-cover shadow-sm transition-all hover:scale-105 hover:shadow-md ${
                      loadedImages.has(imageIndex) ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(imageIndex)}
                    onError={() => handleImageError(imageIndex)}
                  />
                </div>
              );
            })}

            {imageUrls.length > 4 && (
              <div
                onClick={() => setImageSliderImageIndex(4)}
                className="bg-muted/50 flex h-[120px] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border transition-all hover:scale-105 hover:shadow-md"
              >
                <Images className="mx-auto h-6 w-6 text-white" />
                <p className="text-xs font-medium text-white">+{imageUrls.length - 3} more</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageSlider
        imageSliderImageIndex={imageSliderImageIndex}
        setImageSliderImageIndex={setImageSliderImageIndex}
        imageUrls={imageUrls}
      />
    </div>
  ) : (
    <div className="border-muted bg-muted/20 flex min-h-[400px] flex-1 items-center justify-center rounded-xl border-2 border-dashed">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <Images className="text-muted-foreground h-8 w-8" />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-lg font-medium">No Images</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            This memory doesn&apos;t have any images attached
          </p>
        </div>
      </div>
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
        className="pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="flex flex-1 items-center justify-center">
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
            className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-2xl"
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

        <div className="grid w-full max-w-2xl grid-cols-5 gap-3 p-6">
          {imageUrls.map((url, i) => (
            <img
              onClick={(e) => {
                e.stopPropagation();
                setImageSliderImageIndex(i);
              }}
              className={cn(
                "h-20 w-full cursor-pointer rounded-lg border-2 object-cover transition-all hover:scale-105",
                {
                  "border-primary ring-primary/50 ring-2": i === imageSliderImageIndex,
                  "border-muted/50": i !== imageSliderImageIndex,
                },
              )}
              alt="memory-preview"
              key={i}
              src={url || ""}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
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
      className={`absolute bg-white/10 hover:bg-white/20 ${
        direction === "left" ? "left-6" : "right-6"
      } flex h-12 w-12 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm transition-all`}
    >
      <Icon className="h-6 w-6 text-white" />
    </button>
  );
}

// Component: Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, dayIndex) => (
        <div key={dayIndex} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Empty State
function EmptyState() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-16">
      <div className="space-y-4 text-center">
        <div className="bg-muted/50 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <Images className="text-muted-foreground h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground text-lg font-semibold">No memories yet</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Start capturing your precious moments by creating your first memory
          </p>
        </div>
      </div>
    </div>
  );
}

// Component: Load More Button
function LoadMoreButton({ loadMore }: { loadMore: (numItems: number) => void }) {
  return (
    <div className="flex justify-center pt-8">
      <button
        onClick={() => loadMore(10)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-3 font-medium shadow-lg transition-all hover:scale-105"
      >
        Load more memories
      </button>
    </div>
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
