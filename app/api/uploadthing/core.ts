import { api } from "@/convex/_generated/api";
import { auth } from "@/convex/auth";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "8MB",
      maxFileCount: 5, // Allow up to 5 images
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      try {
        // Get the auth token from the request
        const token = await convexAuthNextjsToken();
        if (!token) {
          throw new UploadThingError("UNAUTHORIZED");
        }

        // Set the token for the Convex client
        convex.setAuth(token);

        // Fetch the current user from Convex
        const user = await convex.query(api.auth.currentUser);
        if (!user) {
          throw new UploadThingError("UNAUTHORIZED");
        }

        return { userId: user._id };
      } catch (error) {
        console.error("Auth error in UploadThing middleware:", error);
        throw new UploadThingError("UNAUTHORIZED");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
