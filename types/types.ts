import { Doc } from "@/convex/_generated/dataModel";

export type MemoryWithUrls = Doc<"memories"> & { imageUrls: (string | null)[] };
