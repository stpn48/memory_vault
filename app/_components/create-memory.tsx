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
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { catchErrorAsync } from "@/lib/catch-error";
import { useMutation } from "convex/react";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "../../components/dropzone";

type Props = {};

export function CreateMemory({}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    setOpen(false);

    setFiles([]);
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
      <DialogTrigger asChild>
        <Button className="fixed right-6 bottom-6 h-14 w-14 rounded-full p-0 shadow-lg transition-all hover:scale-110 hover:shadow-xl">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-full p-2">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Create New Memory</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Capture this moment with text and images
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="content" className="text-foreground text-sm font-medium">
              What&apos;s on your mind?
            </label>

            <Textarea
              id="content"
              className="border-muted/50 focus:border-primary/50 min-h-[120px] resize-none"
              name="content"
              placeholder="Write about your memory, thought, or experience..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">Add Images (Optional)</label>

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
          </div>

          {files.length > 0 && (
            <Card className="border-muted/50">
              <CardContent className="p-4">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span className="font-medium">{files.length}</span>
                  <span>image{files.length !== 1 ? "s" : ""} selected</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="bg-destructive/10 rounded-lg p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFiles([]);
                setOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Memory
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
