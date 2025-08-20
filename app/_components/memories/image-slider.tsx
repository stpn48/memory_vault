"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";

export function ImageSlider({
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
