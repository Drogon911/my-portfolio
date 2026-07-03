import type { NextConfig } from "next";

// Хост Supabase Storage выводим из URL проекта, чтобы не хардкодить.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Аватары Google-аккаунтов (lh3/lh4/... .googleusercontent.com).
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Обложки из Supabase Storage (public bucket `media`).
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
