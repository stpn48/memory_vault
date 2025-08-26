import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://yyfiwf8o8d.ufs.sh/f/**")],
  },

  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
