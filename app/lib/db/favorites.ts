import type { SupabaseClient } from "@supabase/supabase-js";
import type { Track } from "@/app/lib/db/types";
import { storageUrl } from "@/app/lib/storage";

// Слой избранного. Функции принимают клиент параметром, чтобы работать и на
// сервере (страница /favorites), и в браузере (FavoritesContext).
// RLS «favorites own» сам ограничивает выборку строками текущего пользователя.

/** Публичные legacy_id избранных треков — для состояния в контексте. */
export async function getFavoriteTrackIds(
  supabase: SupabaseClient,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("favorite_tracks")
    .select("tracks(legacy_id)");

  if (error) throw new Error(`getFavoriteTrackIds: ${error.message}`);

  return (data ?? [])
    .map((r) => (r.tracks as unknown as { legacy_id: number } | null)?.legacy_id)
    .filter((id): id is number => id != null);
}

type FavRow = {
  tracks: {
    legacy_id: number;
    title: string;
    audio_url: string;
    cover_url: string | null;
    releases: {
      legacy_id: number;
      cover_url: string | null;
      artists: { name: string } | null;
    } | null;
  } | null;
};

/** Избранные треки в форме Track (новые сверху) — для страницы /favorites. */
export async function getFavoriteTracks(
  supabase: SupabaseClient,
): Promise<Track[]> {
  const { data, error } = await supabase
    .from("favorite_tracks")
    .select(
      "created_at, tracks(legacy_id, title, audio_url, cover_url, releases(legacy_id, cover_url, artists(name)))",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getFavoriteTracks: ${error.message}`);

  return (data as unknown as FavRow[])
    .map((r) => r.tracks)
    .filter((t): t is NonNullable<FavRow["tracks"]> => t != null)
    .map((t) => {
      // cover_url трека опционален — иначе берём обложку релиза.
      const coverPath = t.cover_url ?? t.releases?.cover_url;
      return {
        id: t.legacy_id,
        title: t.title,
        artist: t.releases?.artists?.name ?? "",
        src: storageUrl(t.audio_url),
        cover: coverPath ? storageUrl(coverPath) : "",
        albumId: t.releases?.legacy_id ?? 0,
      };
    });
}
