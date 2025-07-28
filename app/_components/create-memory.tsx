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
import { useMutation } from "convex/react";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {};

export function CreateMemory({}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createMemory = useMutation(api.memories.createMemory);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const content = formData.get("content") as string;

    if (!content) {
      setError("Memory content is required.");
      return;
    }

    if (content.length > 350) {
      setError("Memory content must be less than 350 characters.");
      return;
    }

    if (content.length < 1) {
      setError("Memory content must be at least 1 character.");
      return;
    }

    setError(null);

    setIsLoading(true);
    await createMemory({ content });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Memory</DialogTitle>
          <DialogDescription>
            Create a new memory. Drop an image or write some text.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Textarea
            disabled={isLoading}
            name="content"
            placeholder="Write your memory here"
          ></Textarea>

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
