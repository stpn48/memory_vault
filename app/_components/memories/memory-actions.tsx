import { Dropzone } from "@/components/dropzone";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";
import { MemoryWithUrls } from "@/types/types";
import { Ellipsis, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { validateContent } from "../create-memory";
import {
  deleteMemoryImagesFromUploadThing,
  deleteUploadThingFiles,
} from "@/app/actions/uploadthing-actions";
import { catchErrorAsync } from "@/lib/catch-error";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export function MemoryActions({ memory }: { memory: MemoryWithUrls }) {
  const [editMemoryDialogOpen, setEditMemoryDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="group absolute top-4 right-10">
          <Ellipsis className="text-muted-foreground group-hover:text-primary size-4 transition-all" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Memory Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditMemoryDialogOpen(true)}>
            Edit Memory
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">DeleteMemory</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editMemoryDialogOpen && (
        <EditMemoryDialog
          memory={memory}
          editMemoryDialogOpen={editMemoryDialogOpen}
          setEditMemoryDialogOpen={setEditMemoryDialogOpen}
        />
      )}
    </>
  );
}

function EditMemoryDialog({
  memory,
  setEditMemoryDialogOpen,
  editMemoryDialogOpen,
}: {
  memory: MemoryWithUrls;
  setEditMemoryDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMemoryDialogOpen: boolean;
}) {
  const [content, setContent] = useState(memory.content);
  const [originalImages, setOriginalImages] = useState<string[]>(memory.imageUrls);
  const [originalImagesToDelete, setOriginalImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [date, setDate] = useState<Date>(new Date(memory.date));
  const [hasChangesWarningOpen, setHasChangesWarningOpen] = useState(false);

  const { hasChanges } = useHasChanges({
    initialContent: memory.content,
    newContent: content,
    initialFiles: memory.imageUrls,
    newFiles: newImages,
  });

  const { startUpload, isUploading: uploadThingUploading } = useUploadThing("imageUploader");

  const editMemory = useMutation(api.memories.editMemory);

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

  async function handleEditMemory() {
    if (!validateContent(content)) {
      toast.error("Invalid content");
      return;
    }

    toast.promise(
      async () => {
        // delete images
        if (originalImagesToDelete.length > 0) {
          const { error: deleteFilesError, success } =
            await deleteMemoryImagesFromUploadThing(originalImagesToDelete);

          if (success) toast.success("Images deleted successfully");

          if (deleteFilesError) {
            toast.error(`Failed to delete images: ${deleteFilesError} `);
            return;
          }
        }

        let newImagesUrls: string[] = [];

        // upload new images
        if (newImages.length > 0 && newImages.length + originalImages.length <= 5) {
          const { error: uploadError } = await catchErrorAsync(async () => {
            const uploadResults = await startUpload(newImages);

            if (!uploadResults) {
              throw new Error("Failed to upload images");
            }

            newImagesUrls = uploadResults.map((result) => result.ufsUrl);
          });

          if (uploadError) {
            toast.error(`Failed to upload images: ${uploadError}`);
            return;
          }
        }

        const finalImageUrls = [...originalImages, ...newImagesUrls];

        const { error: editMemoryError } = await catchErrorAsync(async () => {
          await editMemory({
            id: memory._id,
            content,
            imageUrls: finalImageUrls,
            date: date.getTime(),
          });
        });

        if (editMemoryError) {
          toast.error(`Failed to edit memory: ${editMemoryError}`);
          return;
        }
      },
      {
        error: "Failed to edit memory",
        loading: "Editing memory...",
        success: "Memory edited successfully",
      },
    );

    setEditMemoryDialogOpen(false);
  }

  function removeFile(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeOriginalImage(index: number) {
    const imageUrl = originalImages[index];
    setOriginalImagesToDelete((prev) => [...prev, imageUrl]);
    setOriginalImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen && hasChanges) {
      setHasChangesWarningOpen(true);
    } else {
      setEditMemoryDialogOpen(newOpen);
    }
  }

  function handleDiscardChanges() {
    setEditMemoryDialogOpen(false);
  }

  function handleFileUpload(accepted: File[]) {
    if (accepted.length + newImages.length + originalImages.length > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }

    setNewImages((prev) => [...prev, ...accepted]);
  }

  return (
    <>
      <Dialog open={editMemoryDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div>
                <DialogTitle className="text-xl font-semibold">Edit Memory</DialogTitle>
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

              {newImages.length + originalImages.length < 5 && (
                <Dropzone
                  onDrop={handleFileUpload}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                />
              )}

              {newImages.length >= 5 && (
                <div className="text-muted-foreground border-muted rounded-lg border-2 border-dashed p-4 text-center text-sm">
                  Maximum 5 images reached
                </div>
              )}

              {/* File Preview */}
              {newImages.length + originalImages.length > 0 && (
                <Card className="border-muted/50 flex-shrink-0">
                  <CardContent>
                    <div className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
                      <span className="font-medium">
                        {newImages.length + originalImages.length}
                      </span>
                      <span>image{newImages.length + originalImages.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                      {originalImages.map((url, index) => (
                        <div key={`file-${index}`} className="group relative">
                          <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeOriginalImage(index)}
                            className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {newImages.map((file, index) => (
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
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleEditMemory} disabled={uploadThingUploading}>
              Edit Memory
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

function useHasChanges({
  newContent,
  initialContent,
  newFiles,
  initialFiles,
}: {
  initialContent: string;
  newContent: string;
  newFiles: File[];
  initialFiles: string[];
}) {
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (newContent !== initialContent || initialFiles.length !== newFiles.length) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [newContent, newFiles, initialContent, initialFiles]);

  return { hasChanges };
}
