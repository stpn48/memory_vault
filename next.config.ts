import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://robust-yak-185.convex.cloud/api/storage/**")],
  } /* config options here */,
};

export default nextConfig;
