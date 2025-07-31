"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { catchErrorAsync } from "@/lib/catch-error";
import { useMutation } from "convex/react";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropzone } from "../../components/dropzone";

type Props = {};

export function CreateMemory({}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const createMemory = useMutation(api.memories.createMemory);
  const createUploadUrl = useMutation(api.memories.createUploadUrl);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const content = formData.get("content") as string;

    if (!content) {
      setError("Memory content is required.");
      return;
    }

    if (content.length > 9999) {
      setError("Memory content must be less than 10000 characters.");
      return;
    }

    if (content.length < 1) {
      setError("Memory content must be at least 1 character.");
      return;
    }

    const imageIds: Id<"_storage">[] = [];

    for (const file of files) {
      // Ask Convex for an upload URL
      const uploadUrl = await createUploadUrl();

      // POST file to the upload URL
      const { error: uploadImageError } = await catchErrorAsync(async () => {
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await res.json();
        imageIds.push(storageId as Id<"_storage">);
      });

      if (uploadImageError) {
        setError(uploadImageError);
        return;
      }
    }

    setError(null);

    setIsLoading(true);
    await createMemory({ content, imageIds });
    setIsLoading(false);

    setOpen(false);
  };

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        className="absolute bottom-4 right-4 cursor-pointer "
      >
        <Button className="rounded-full w-10 h-10 hover:scale-105 transition-all p-4">
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%]">
        <DialogHeader>
          <DialogTitle>New Memory</DialogTitle>
          <DialogDescription>
            Create a new memory. Drop an image or write some text.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Textarea
            className="overflow-scroll resize-none !max-h-[300px]"
            disabled={isLoading}
            name="content"
            placeholder="Write your memory here"
          ></Textarea>

          <Dropzone
            onDrop={(accepted) => {
              if (accepted.length + files.length > 5) {
                setError("You can upload up to 5 images only.");
                return;
              }
              setFiles((prev) => [...prev, ...accepted]);
            }}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
          />

          <p>{files.length}</p>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="w-full flex gap-2 flex-row-reverse">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  <p>Creating...</p>
                </>
              ) : (
                "Create"
              )}
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
