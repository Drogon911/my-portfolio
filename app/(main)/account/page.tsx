import Image from "next/image";
import { createClient } from "@/app/lib/supabase/server";
import GlassPage from "@/app/components/GlassPage";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import SignOutButton from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Гость — приглашение войти.
  if (!user) {
    return (
      <GlassPage className="min-h-screen w-full">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Аккаунт
        </h1>
        <p className="text-muted mb-8 max-w-md">
          Войди, чтобы сохранять избранное, собирать плейлисты и видеть свою
          историю прослушиваний.
        </p>
        <GoogleSignInButton />
      </GlassPage>
    );
  }

  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const name = meta.full_name ?? meta.name ?? user.email ?? "Пользователь";
  const avatar = meta.avatar_url ?? meta.picture ?? null;

  return (
    <GlassPage className="min-h-screen w-full">
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
        Аккаунт
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-xl">
        <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden ring-1 ring-white/15 bg-surface-2">
          {avatar ? (
            <Image src={avatar} alt={name} fill className="object-cover" sizes="96px" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-3xl font-semibold text-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="text-center sm:text-left min-w-0">
          <p className="text-2xl font-semibold text-foreground truncate">{name}</p>
          {user.email && (
            <p className="text-muted mt-1 truncate">{user.email}</p>
          )}
          <div className="mt-5">
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Заготовки под будущие разделы аккаунта */}
      <p className="text-subtle text-sm mt-8">
        Скоро здесь появятся избранное, плейлисты и история прослушиваний.
      </p>
    </GlassPage>
  );
}
