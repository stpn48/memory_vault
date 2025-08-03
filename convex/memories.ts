import { formatDate } from "@/lib/utils";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MemoryWithUrls } from "@/types/types";

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

    const page = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .paginate(paginationOpts);

    const memoriesWithUrls = await Promise.all(
      page.page.map(async (memory) => {
        const imageUrls = await Promise.all(
          (memory.imageIds ?? []).map((id) => ctx.storage.getUrl(id)),
        );
        return { ...memory, imageUrls };
      }),
    );

    // group by date
    let currDate = memoriesWithUrls.length
      ? formatDate(memoriesWithUrls[0]._creationTime)
      : null;

    const grouped: {
      creationDate: string;
      memories: MemoryWithUrls[];
    }[] = currDate ? [{ creationDate: currDate, memories: [] }] : [];

    for (const memory of memoriesWithUrls) {
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

    return {
      ...page,
      page: grouped,
    };
  },
});

export const createUploadUrl = mutation(async ({ storage }) => {
  return await storage.generateUploadUrl();
});
