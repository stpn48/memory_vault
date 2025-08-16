import { formatDate } from "@/lib/utils";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DayWithMemories, MemoryWithUrls } from "@/types/types";
import { Doc } from "./_generated/dataModel";

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

export const getUserMemories = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await getAuthUserId(ctx);

    // Get all memories for the user
    const allMemories = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    // Group by date first
    const groupedByDate = groupMemoriesByDate(allMemories);
    
    // Then paginate the grouped results
    const startIndex = paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0;
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedDays = groupedByDate.slice(startIndex, endIndex);
    
    // Add image URLs to the paginated results
    const daysWithUrls: DayWithMemories[] = await Promise.all(
      paginatedDays.map(async (day) => ({
        ...day,
        memories: await Promise.all(
          day.memories.map(async (memory) => {
            const imageUrls = await Promise.all(
              (memory.imageIds).map((id) => ctx.storage.getUrl(id)),
            );
            return { ...memory, imageUrls };
          }),
        ),
      })),
    );

    return {
      page: daysWithUrls,
      isDone: endIndex >= groupedByDate.length,
      continueCursor: endIndex < groupedByDate.length ? endIndex.toString() : "",
    };
  },
});

export const createUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});

function groupMemoriesByDate(memories: Doc<"memories">[]) {
  if (memories.length === 0) return [];

  // Group by date
  let currDate = formatDate(memories[0]._creationTime);

  const grouped: {
    creationDate: string;
    memories: Doc<"memories">[];
  }[] = [{ creationDate: currDate, memories: [] }];

  for (const memory of memories) {
    const memoryDate = formatDate(memory._creationTime);

    if (currDate === memoryDate) {
      grouped[grouped.length - 1].memories.push(memory);
    } else {
      currDate = memoryDate;
      grouped.push({
        creationDate: currDate,
        memories: [memory],
      });
    }
  }

  return grouped;
}
