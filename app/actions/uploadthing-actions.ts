"use server";

import { UTApi } from "uploadthing/server";
import { catchErrorAsync } from "@/lib/catch-error";

// Initialize UTApi
const utapi = new UTApi();

export async function deleteUploadThingFiles(fileKeys: string | string[]) {
  const { error } = await catchErrorAsync(async () => {
    const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];

    if (keys.length === 0) {
      return { success: false, error: "No file keys provided" };
    }

    const response = await utapi.deleteFiles(keys);

    return { success: true, response };
  });

  if (error) {
    console.error("Error deleting UploadThing files:", error);
    return { success: false, error: "Failed to delete UploadThing files" };
  }

  return { success: true };
}

export async function deleteMemoryImagesFromUploadThing(imageUrls: string[]) {
  const { error } = await catchErrorAsync(async () => {
    const fileKeys = imageUrls.map((url) => {
      const parts = url.split("/");

      return parts[parts.length - 1]; // Get the file key from the URL
    });

    if (fileKeys.length > 0) {
      const deleteResult = await deleteUploadThingFiles(fileKeys);

      if (!deleteResult.success) {
        return { success: false, error: "Failed to delete images" };
      }
    }

    return { success: true };
  });

  if (error) {
    console.error("Error deleting memory images:", error);
    return { success: false, error: "Failed to delete memory images" };
  }

  return { success: true };
}
