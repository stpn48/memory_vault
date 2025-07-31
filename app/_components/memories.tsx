"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";

type Props = {};

export function Memories({}: Props) {
  const userMemories = useQuery(api.memories.getUserMemories);
  console.log(userMemories);

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
    <div className={"flex flex-col gap-8"}>
      {userMemories.map((day) => (
        <div className="flex flex-col gap-4" key={day.creationDate}>
          <p>{day.creationDate}</p>

          <hr />

          <div className="flex items-center gap-4 flex-wrap">
            {day.memories.map((memory) => (
              <MemoryCard memory={memory} key={memory._id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemoryCard({
  memory,
}: {
  memory: Doc<"memories"> & { imageUrls: (string | null)[] };
}) {
  return (
    <Dialog>
      <div className="flex w-[300px] flex-col gap-[2px]">
        <DialogTrigger>
          <div className="border-2 flex justify-between text-sm items-center rounded-lg cursor-pointer hover:ring-2 ring-secondary p-3 w-full">
            {memory.content.length > 20
              ? `${memory.content.substring(0, 20)}...`
              : memory.content}

            {memory.imageIds.length > 0 && (
              <div className="flex text-xs items-center gap-1">
                <p className="text-muted-foreground">
                  {memory.imageIds.length}
                </p>
                <Images className="text-muted-foreground size-4" />
              </div>
            )}
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
            })}
          </p>
        </div>
      </div>

      <DialogContent className="max-h-[80%] min-h-[40%] overflow-auto gap-10 flex flex-col">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Memory details</DialogTitle>
          </VisuallyHidden>
          <DialogDescription className="text-foreground text-sm">
            {memory.content}
          </DialogDescription>
        </DialogHeader>
        {memory.imageUrls.length > 0 && (
          <div className="flex flex-1 items-center justify-center w-full">
            <ImagesStack imageUrls={memory.imageUrls} />
          </div>
        )}
        {memory.imageUrls.length === 0 && (
          <div className="flex-1 min-h-[300px] flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Images className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                No Images for this memory...
              </span>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          from:{" "}
          {new Date(memory._creationTime).toLocaleString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ImagesStack({ imageUrls }: { imageUrls: (string | null)[] }) {
  const [imageSliderImageIndex, setImageSliderImageIndex] = useState<
    number | null
  >(null);

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div className="relative w-[250px] h-[200px] group cursor-pointer">
            {imageUrls.map((url, i) => {
              if (!url) return null;

              return (
                <img
                  key={i}
                  src={url}
                  alt="memory-preview"
                  className={cn(
                    "absolute top-0 left-0 w-full h-full object-cover rounded-md border shadow transition-transform duration-300",
                    i === 0 &&
                      "z-30 -rotate-1 -translate-x-0.5 group-hover:-rotate-6 group-hover:-translate-x-2",
                    i === 1 &&
                      "z-20 translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-2",
                    i === 2 &&
                      "z-10 rotate-1 translate-x-1 group-hover:rotate-6 group-hover:translate-x-3",
                  )}
                />
              );
            })}

            {/* glow effect on hover */}
            <div className="absolute inset-0 rounded-md border border-transparent group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300" />
          </div>
        </DialogTrigger>

        <DialogContent className="max-h-[80vh] w-full lg:w-[80%] !max-w-screen p-10 bg-transparent border-0 overflow-auto">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Memory Images</DialogTitle>
              <DialogDescription>
                All images in this memory, click one to open the image slider
                and view them in detail
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, i) => {
              if (!url) return null;

              return (
                <div
                  onClick={() => setImageSliderImageIndex(i)}
                  key={i}
                  className="relative cursor-pointer hover:scale-102 transition-all  w-full h-[250px] overflow-hidden rounded-lg border shadow"
                >
                  <img
                    src={url}
                    alt={`memory-preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
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
    <>
      {isOpen && (
        <div
          onClick={() => setImageSliderImageIndex(null)}
          className="fixed inset-0 w-screen h-screen  bg-black/50 flex justify-center items-center pointer-events-auto z-50"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImageSliderImageIndex((prev) => {
                if (prev === null) return null;

                return prev > 0 ? prev - 1 : 4;
              });
            }}
            className="bg-secondary/50 flex justify-center items-center cursor-pointer hover:bg-secondary/60 p-2 absolute left-4 rounded-full "
          >
            <ChevronLeft className="text-muted-foreground" />
          </button>

          <img
            onClick={(e) => e.stopPropagation()}
            src={imageUrls[imageSliderImageIndex!]}
            alt="memory-preview"
            className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setImageSliderImageIndex((prev) => {
                if (prev === null) return null;

                return prev < 4 ? prev + 1 : 0;
              });
            }}
            className="bg-secondary/50 flex justify-center absolute right-4 items-center cursor-pointer hover:bg-secondary/60 p-2 rounded-full "
          >
            <ChevronRight className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* <Dialog
        open={imageSliderImageIndex !== null}
        onOpenChange={() => setImageSliderImageIndex(null)}
      >
        <DialogContent className="max-h-[90vh] items-center lg:w-[80%] flex justify-center w-full !max-w-screen p-10 bg-transparent border-0 overflow-auto">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Image slider dialog</DialogTitle>
              <DialogDescription>
                Image slider dialog to view all images in this memory in detail
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>


          <div>
            <img
              src={`${imageUrls[imageSliderImageIndex!]}`}
              alt="memory-preview"
            />
          </div>

          <button
            onClick={() =>
              setImageSliderImageIndex((prev) => {
                if (prev === null) return null;

                return prev < 4 ? prev + 1 : 0;
              })
            }
            className="bg-secondary/50 flex justify-center items-center cursor-pointer hover:bg-secondary/60 p-2 rounded-full "
          >
            <ChevronRight className="text-muted-foreground" />
          </button>
        </DialogContent>
      </Dialog> */}
    </>,
    document.body,
  );
}
