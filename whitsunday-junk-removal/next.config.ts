import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a lockfile in a parent folder isn't picked up
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["@react-pdf/renderer"],
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
