"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { catchErrorAsync } from "@/lib/catch-error";
import { getItem, setItem } from "@/lib/local-storage";
import { useUploadThing } from "@/lib/uploadthing";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "../../components/dropzone";

export function CreateMemory() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(getItem("new-memory-content-draft") || "");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [hasChangesWarningOpen, setHasChangesWarningOpen] = useState(false);

  const { hasChanges } = useHasChanges({ content, files });
  const createMemory = useMutation(api.memories.createMemory);
  const { startUpload, isUploading: uploadThingUploading } = useUploadThing("imageUploader");

  // Save content to localStorage on change
  useEffect(() => {
    setItem("new-memory-content-draft", content);
  }, [content]);

  // Prevent browser navigation/close when uploading or has changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasChanges || uploadThingUploading) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, uploadThingUploading]);

  function validateContent(content: string) {
    if (!content) {
      toast.error("Memory content is required.");
      return false;
    }

    if (content.length > 9999) {
      toast.error("Memory content must be less than 10000 characters.");
      return false;
    }

    if (content.length < 1) {
      toast.error("Memory content must be at least 1 character.");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateContent(content)) {
      return;
    }

    setOpen(false);
    let uploadedUrls: string[] = [];

    toast.promise(
      async () => {
        // Upload files if any
        if (files.length > 0) {
          const { error } = await catchErrorAsync(async () => {
            const uploadResults = await startUpload(files);

            if (uploadResults) {
              uploadedUrls = uploadResults.map((result) => result.ufsUrl);
            }
          });

          if (error) {
            toast.error("Failed to upload images. Please try again.");
            return;
          }
        }

        await createMemory({
          content,
          imageUrls: uploadedUrls,
          date: date.getTime(),
        });
      },
      {
        success: "Memory created successfully.",
        error: "Failed to create memory. Please try again.",
        loading: "Creating memory...",
      },
    );

    resetState();
  }

  function resetState() {
    setContent("");
    setDate(new Date());
    setFiles([]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen && hasChanges) {
      setHasChangesWarningOpen(true);
    } else {
      setOpen(newOpen);
    }
  }

  function handleDiscardChanges() {
    resetState();
    setOpen(false);
    setHasChangesWarningOpen(false);
  }

  function handleFileUpload(accepted: File[]) {
    if (accepted.length + files.length > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }
    setFiles((prev) => [...prev, ...accepted]);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="fixed right-6 bottom-6 h-14 w-14 rounded-full p-0 shadow-lg transition-all hover:scale-110 hover:shadow-xl">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div>
                <DialogTitle className="text-xl font-semibold">Create New Memory</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Capture a moment with text and images
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <section className="flex flex-col gap-8 overflow-auto p-1">
            {/* Content Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="content" className="text-foreground text-sm font-medium">
                What&apos;s on your mind?
              </label>
              <Textarea
                id="content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-muted/50 focus:border-primary/50 min-h-[120px] resize-none"
                placeholder="Write about your memory, thought, or experience..."
              />
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">Add Images (Optional)</label>

              {files.length < 5 && (
                <Dropzone
                  onDrop={handleFileUpload}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                />
              )}

              {files.length >= 5 && (
                <div className="text-muted-foreground border-muted rounded-lg border-2 border-dashed p-4 text-center text-sm">
                  Maximum 5 images reached
                </div>
              )}

              {/* File Preview */}
              {files.length > 0 && (
                <Card className="border-muted/50 flex-shrink-0">
                  <CardContent>
                    <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
                      <span className="font-medium">{files.length}</span>
                      <span>image{files.length !== 1 ? "s" : ""} selected</span>
                    </div>
                    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
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

            {/* Date Picker */}
            <DatePicker value={date} onChange={setDate} />
          </section>

          {/* Action Buttons */}
          <section className="bg-background border-border mt-4 flex w-full flex-shrink-0 gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetState();
                setOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={uploadThingUploading}>
              Create Memory
            </Button>
          </section>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={hasChangesWarningOpen} onOpenChange={setHasChangesWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function useHasChanges({ content, files }: { content: string; files: File[] }) {
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (content.length > 0 || files.length > 0) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [content, files]);

  return { hasChanges };
}
