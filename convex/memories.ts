import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createMemory = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const newTaskId = await ctx.db.insert("memories", {
      content: args.content,
      userId,
    });

    return newTaskId;
  },
});

export const getUserMemories = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const memories = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    memories.sort((a, b) => b._creationTime - a._creationTime);

    return memories;
  },
});
