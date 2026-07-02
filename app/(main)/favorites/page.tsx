import GlassPage from "@/app/components/GlassPage";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import FavoritesList from "./FavoritesList";
import { createClient } from "@/app/lib/supabase/server";
import { getFavoriteTracks } from "@/app/lib/db/favorites";
import { Heart } from "lucide-react";
import Link from "next/link";

const header = (
  <div className="flex items-center gap-3 mb-8">
    <Heart className="w-8 h-8 text-accent fill-accent" />
    <h1 className="text-3xl font-semibold text-foreground">Избранное</h1>
  </div>
);

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Гость — приглашение войти.
  if (!user) {
    return (
      <GlassPage className="min-h-screen">
        {header}
        <div className="text-center py-12 md:py-16 bg-white/5 rounded-2xl border border-white/8">
          <Heart className="w-14 h-14 md:w-16 md:h-16 text-subtle mx-auto mb-4" />
          <p className="text-muted text-lg">Войдите, чтобы сохранять любимые треки</p>
          <p className="text-subtle mt-2 text-sm md:text-base px-4">
            Избранное привязано к вашему аккаунту
          </p>
          <div className="mt-6 flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>
      </GlassPage>
    );
  }

  const tracks = await getFavoriteTracks(supabase);

  // Залогинен, но пусто.
  if (tracks.length === 0) {
    return (
      <GlassPage className="min-h-screen">
        {header}
        <div className="text-center py-12 md:py-16 bg-white/5 rounded-2xl border border-white/8">
          <Heart className="w-14 h-14 md:w-16 md:h-16 text-subtle mx-auto mb-4" />
          <p className="text-muted text-lg">У вас пока нет избранных треков</p>
          <p className="text-subtle mt-2 text-sm md:text-base px-4">
            Нажмите на сердечко рядом с песней, чтобы добавить её сюда
          </p>
          <Link
            href="/albums"
            className="inline-block mt-6 px-6 py-2 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition cursor-pointer"
          >
            Перейти к альбомам
          </Link>
        </div>
      </GlassPage>
    );
  }

  // Есть избранное.
  return (
    <GlassPage className="min-h-screen">
      {header}
      <FavoritesList tracks={tracks} />
    </GlassPage>
  );
}
