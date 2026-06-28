"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); // сбросить server-кэш, чтобы /account увидел гостя
  };

  return (
    <button
      onClick={signOut}
      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-foreground font-semibold shadow-sm hover:bg-white/15 hover:scale-[1.02] active:scale-95 transition-all duration-200"
    >
      <LogOut size={18} />
      Выйти
    </button>
  );
}
