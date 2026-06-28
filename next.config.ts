import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Аватары Google-аккаунтов (lh3/lh4/... .googleusercontent.com).
    remotePatterns: [
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
