import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Create a server-side Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export { convex, api };
