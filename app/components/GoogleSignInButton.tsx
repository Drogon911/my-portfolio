"use client";

import { LogIn } from "lucide-react";
import { createClient } from "@/app/lib/supabase/browser";

const DEFAULT_STYLE =
  "flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-foreground font-semibold shadow-sm hover:bg-white/15 hover:scale-[1.02] active:scale-95 transition-all duration-200";

export default function GoogleSignInButton({
  className = DEFAULT_STYLE,
  label = "Войти через Google",
}: {
  className?: string;
  label?: string;
}) {
  const signIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <button onClick={signIn} className={className}>
      <LogIn size={18} />
      {label}
    </button>
  );
}
