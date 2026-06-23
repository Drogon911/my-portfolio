"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
}

export default function BackButton({ href, onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = onClick ?? (href ? () => router.push(href) : () => router.back());

  return (
    <button
      onClick={handleClick}
      aria-label="Назад"
      className="absolute top-4 left-4 z-20 flex items-center justify-center px-3 py-2 rounded-xl bg-white/8 border border-white/10 shadow-lg text-muted hover:bg-white/15 hover:text-foreground hover:scale-105 active:bg-white/20 transition-all duration-200"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
