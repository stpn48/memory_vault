import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { formatDate } from "@/lib/utils";

export const createMemory = mutation({
  args: { content: v.string(), imageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.imageIds.length > 5) {
      throw new Error("Max 5 images allowed");
    }

    const newTaskId = await ctx.db.insert("memories", {
      content: args.content,
      userId,
      imageIds: args.imageIds,
    });

    return newTaskId;
  },
});

type MemoryWithUrls = Doc<"memories"> & { imageUrls: (string | null)[] };

export const getUserMemories = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const memories = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    memories.sort((a, b) => b._creationTime - a._creationTime);

    // Add signed URLs for each memory's images
    const memoriesWithUrls = await Promise.all(
      memories.map(async (memory) => {
        const imageUrls = await Promise.all(
          (memory.imageIds ?? []).map((id) => ctx.storage.getUrl(id)),
        );
        return { ...memory, imageUrls };
      }),
    );

    if (memoriesWithUrls.length === 0) return [];

    let currDate = formatDate(memoriesWithUrls[0]._creationTime);

    const memoriesCalendarOrder: {
      creationDate: string; // grouped by date string
      memories: MemoryWithUrls[];
    }[] = [{ creationDate: currDate, memories: [] }];

    for (const memory of memoriesWithUrls) {
      const memoryDate = formatDate(memory._creationTime);

      if (currDate === memoryDate) {
        memoriesCalendarOrder[memoriesCalendarOrder.length - 1].memories.push(
          memory,
        );
      } else {
        currDate = memoryDate;
        memoriesCalendarOrder.push({
          creationDate: currDate,
          memories: [memory],
        });
      }
    }

    return memoriesCalendarOrder;
  },
});

export const createUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});
