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
import { Plus, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "../../components/dropzone";
import { useUploadThing } from "@/lib/uploadthing";

type Props = {};

export function CreateMemory({}: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createMemory = useMutation(api.memories.createMemory);
  const { startUpload, isUploading: uploadThingUploading } = useUploadThing("imageUploader");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const content = formData.get("content") as string;

    if (!content) {
      toast.error("Memory content is required.");
      return;
    }

    if (content.length > 9999) {
      toast.error("Memory content must be less than 10000 characters.");
      return;
    }

    if (content.length < 1) {
      toast.error("Memory content must be at least 1 character.");
      return;
    }

    // Upload files if any
    let uploadedUrls: string[] = [];

    if (files.length > 0) {
      setIsUploading(true);

      const { error } = await catchErrorAsync(async () => {
        const uploadResults = await startUpload(files);

        if (uploadResults) {
          uploadedUrls = uploadResults.map((result) => result.ufsUrl);
        }
      });

      if (error) {
        toast.error("Failed to upload imgaes. Please try again.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    const allImageUrls = [...imageUrls, ...uploadedUrls];

    await createMemory({
      content,
      imageUrls: allImageUrls,
    });

    toast.success("Memory created successfully!");
    setFiles([]);
    setImageUrls([]);
    setOpen(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed right-6 bottom-6 h-14 w-14 rounded-full p-0 shadow-lg transition-all hover:scale-110 hover:shadow-xl">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
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

        <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-6 overflow-y-auto">
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

              {files.length + imageUrls.length < 5 && (
                <Dropzone
                  onDrop={(accepted) => {
                    if (accepted.length + files.length + imageUrls.length > 5) {
                      toast.error("You can upload up to 5 images only.");
                      return;
                    }
                    setFiles((prev) => [...prev, ...accepted]);
                  }}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                />
              )}

              {files.length + imageUrls.length >= 5 && (
                <div className="text-muted-foreground border-muted rounded-lg border-2 border-dashed p-4 text-center text-sm">
                  Maximum 5 images reached
                </div>
              )}
            </div>

            {(files.length > 0 || imageUrls.length > 0) && (
              <Card className="border-muted/50 flex-shrink-0">
                <CardContent className="">
                  <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
                    <span className="font-medium">{files.length + imageUrls.length}</span>
                    <span>image{files.length + imageUrls.length !== 1 ? "s" : ""} selected</span>
                  </div>
                  <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                    {/* Show uploaded image URLs */}
                    {imageUrls.map((url, index) => (
                      <div key={`url-${index}`} className="group relative">
                        <img
                          src={url}
                          alt={`Uploaded image ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Show files to be uploaded */}
                    {files.map((file, index) => (
                      <div key={`file-${index}`} className="group relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`File ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-shrink-0 gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFiles([]);
                setImageUrls([]);
                setOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isUploading || uploadThingUploading}>
              {isUploading || uploadThingUploading ? "Uploading..." : "Create Memory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
