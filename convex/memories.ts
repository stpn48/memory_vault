import { formatDate } from "@/lib/utils";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const createMemory = mutation({
  args: { content: v.string(), imageUrls: v.array(v.string()), date: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.imageUrls.length > 5) {
      throw new Error("Max 5 images allowed");
    }

    const newMemoryId = await ctx.db.insert("memories", {
      content: args.content,
      userId,
      imageUrls: args.imageUrls,
      date: args.date,
    });

    return newMemoryId;
  },
});

export const deleteMemory = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const memory = await ctx.db.get(args.id);

    if (!memory) {
      throw new Error("Memory not found");
    }

    if (memory.userId !== userId) {
      throw new Error("Not authorized to delete this memory");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const editMemory = mutation({
  args: {
    id: v.id("memories"),
    content: v.string(),
    imageUrls: v.array(v.string()),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.imageUrls.length > 5) {
      throw new Error("Max 5 images allowed");
    }

    const memory = await ctx.db.get(args.id);

    if (!memory) {
      throw new Error("Memory not found");
    }

    if (memory.userId !== userId) {
      throw new Error("Not authorized to edit this memory");
    }

    await ctx.db.patch(args.id, {
      content: args.content,
      imageUrls: args.imageUrls,
      date: args.date,
    });

    return args.id;
  },
});

export const getUserMemories = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await getAuthUserId(ctx);

    // Get memories for the user
    const allMemories = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Sort by user-selected date in descending order
    allMemories.sort((a, b) => b.date - a.date);

    // Group by date first
    const groupedByDate = groupMemoriesByDate(allMemories);

    // Then paginate the grouped results
    const startIndex = paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0;
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedDays = groupedByDate.slice(startIndex, endIndex);

    return {
      page: paginatedDays,
      isDone: endIndex >= groupedByDate.length,
      continueCursor: endIndex < groupedByDate.length ? endIndex.toString() : "",
    };
  },
});

function groupMemoriesByDate(memories: Doc<"memories">[]) {
  if (memories.length === 0) return [];

  // Group by date
  let currDate = formatDate(memories[0].date);

  const grouped: {
    creationDate: string;
    memories: Doc<"memories">[];
  }[] = [{ creationDate: currDate, memories: [] }];

  for (const memory of memories) {
    const memoryDate = formatDate(memory.date);

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
