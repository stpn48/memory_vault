import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // Your other tables...
  memories: defineTable({
    userId: v.id("users"),
    content: v.string(),
    imageUrls: v.array(v.string()),
    date: v.number(),
  }),
});

export default schema;
