import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // CSV imports and markdown edits; file uploads go straight to Supabase Storage
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
