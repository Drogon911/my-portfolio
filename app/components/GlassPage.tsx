import { ReactNode } from "react";

interface GlassPageProps {
  children: ReactNode;
  className?: string;
}

export default function GlassPage({ children, className = "" }: GlassPageProps) {
  return (
    <div className={`relative bg-white/8 border border-white/10 rounded-3xl p-6 md:p-8 glass-surface ${className}`}>
      {children}
    </div>
  );
}
