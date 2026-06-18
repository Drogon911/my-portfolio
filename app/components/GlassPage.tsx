"use client";

import { ReactNode } from "react";

interface GlassPageProps {
  children: ReactNode;
  className?: string;
}

export default function GlassPage({
  children,
  className = "",
}: GlassPageProps) {
  return (
    <div
      className={`
        relative 
        bg-white/60 
        rounded-3xl 
        p-6 md:p-8
        ${className}
      `}
      style={{
        // Градиентный контур через box-shadow
        boxShadow: `
          inset 0 0 0 1px rgba(255,255,255,0.8),
          inset 0 0 0 2px rgba(255,255,255,0.3),
          0 8px 32px rgba(0,0,0,0.06)
        `,
      }}
    >
      {/* Контент */}
      {children}
    </div>
  );
}
