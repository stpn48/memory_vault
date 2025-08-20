import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Doc } from "@/convex/_generated/dataModel";
import { MemoryWithUrls } from "@/types/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Clock, Images } from "lucide-react";
import { ImageGrid } from "./image-grid";
import { MemoryActions } from "./memory-actions";

export function Memory({ memory }: { memory: MemoryWithUrls }) {
  return (
    <Dialog>
      <DialogTrigger>
        <MemoryCard memory={memory} />
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-full !max-w-screen flex-col p-8 md:w-[90vh] lg:w-[80vw] lg:flex-row">
        <VisuallyHidden>
          <DialogTitle>Memory Details</DialogTitle>
        </VisuallyHidden>

        {/* Content section */}
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

        <MemoryActions memory={memory} />
      </DialogContent>
    </Dialog>
  );
}

function MemoryCard({ memory }: { memory: MemoryWithUrls }) {
  return (
    <div className="border-border hover:border-primary/30 cursor-pointer space-y-3 rounded-lg border p-4 transition-all hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-foreground line-clamp-3 text-start text-sm leading-relaxed">
          {memory.content.length > 100 ? `${memory.content.substring(0, 100)}...` : memory.content}
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
          {new Date(memory.date).toLocaleTimeString(undefined, {
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
  );
}

function MemoryDate({ memory }: { memory: Doc<"memories"> & { imageUrls: (string | null)[] } }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4" />

      <span>
        {new Date(memory.date).toLocaleString(undefined, {
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
