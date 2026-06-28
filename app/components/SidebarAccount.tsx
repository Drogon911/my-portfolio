"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

// Имя и аватар берём из метаданных провайдера (Google кладёт full_name/name,
// avatar_url/picture). Хелперы локальные — профиль в БД нам тут не нужен.
function displayName(meta: Record<string, unknown>, fallback: string) {
  return (
    (meta.full_name as string) ?? (meta.name as string) ?? fallback
  );
}
function avatarUrl(meta: Record<string, unknown>) {
  return (meta.avatar_url as string) ?? (meta.picture as string) ?? null;
}

export default function SidebarAccount() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-14 rounded-xl bg-white/5 animate-pulse" />;
  }

  if (!user) {
    return <GoogleSignInButton className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-foreground font-semibold shadow-sm hover:bg-white/15 hover:scale-[1.02] active:scale-95 transition-all duration-200" />;
  }

  const meta = user.user_metadata ?? {};
  const name = displayName(meta, user.email ?? "Профиль");
  const avatar = avatarUrl(meta);

  return (
    <Link
      href="/account"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 group"
    >
      <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/15 bg-surface-2">
        {avatar ? (
          <Image src={avatar} alt={name} fill className="object-cover" sizes="40px" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-foreground font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground transition-colors">
          {name}
        </p>
        <p className="truncate text-xs text-muted">Профиль</p>
      </div>
    </Link>
  );
}
