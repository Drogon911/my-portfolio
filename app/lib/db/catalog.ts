import { cache } from "react";
import { supabase } from "@/app/lib/supabase/client";
import type { Album, Track } from "@/app/lib/db/types";

// Плоский трек с названием альбома — форма, нужная нечёткому поиску.
export type SearchTrack = Track & { albumTitle: string };

// Слой доступа к каталогу — «шов» между БД и UI.
// Возвращает те же формы Album / Track, что компоненты потребляют сейчас,
// поэтому замена статического musicLibrary на эти функции не трогает разметку.
//
// Публичный id = legacy_id (старый числовой id из musicLibrary), чтобы
// маршруты /album/[id] и /player/[id] продолжали работать без изменений.

// ── Формы строк из Supabase ───────────────────────────────────
type TrackRow = {
  legacy_id: number;
  title: string;
  audio_url: string;
  cover_url: string | null;
  position: number;
};

type ReleaseRow = {
  legacy_id: number;
  title: string;
  cover_url: string | null;
  artists: { name: string } | null;
  tracks: TrackRow[];
};

const RELEASE_SELECT =
  "legacy_id, title, cover_url, artists(name), tracks(legacy_id, title, audio_url, cover_url, position)";

// ── Маппинг строк БД → формы UI ───────────────────────────────
function toTrack(
  row: TrackRow,
  albumId: number,
  artist: string,
  releaseCover: string | null,
): Track {
  return {
    id: row.legacy_id,
    title: row.title,
    artist,
    src: row.audio_url,
    // cover_url трека опционален — если пусто, берём обложку релиза.
    cover: row.cover_url ?? releaseCover ?? "",
    albumId,
  };
}

function toAlbum(row: ReleaseRow): Album {
  const artist = row.artists?.name ?? "";
  const tracks = [...row.tracks]
    .sort((a, b) => a.position - b.position)
    .map((t) => toTrack(t, row.legacy_id, artist, row.cover_url));

  return {
    id: row.legacy_id,
    title: row.title,
    artist,
    cover: row.cover_url ?? "",
    tracks,
  };
}

// ── Публичный API слоя ────────────────────────────────────────
// Функции обёрнуты в React cache() — повторные вызовы в рамках одного
// серверного рендера дедуплицируются (одна и та же выборка не бьёт в БД дважды).

/** Все релизы с треками, отсортированные по legacy_id. */
export const getAlbums = cache(async (): Promise<Album[]> => {
  const { data, error } = await supabase
    .from("releases")
    .select(RELEASE_SELECT)
    .order("legacy_id");

  if (error) throw new Error(`getAlbums: ${error.message}`);
  return (data as unknown as ReleaseRow[]).map(toAlbum);
});

/** Плоский список всех треков с названием альбома — для нечёткого поиска. */
export const getAllTracks = cache(async (): Promise<SearchTrack[]> => {
  const albums = await getAlbums();
  return albums.flatMap((album) =>
    album.tracks.map((track) => ({ ...track, albumTitle: album.title })),
  );
});

/** Один релиз по публичному id (legacy_id) или null, если не найден. */
export const getAlbum = cache(async (id: number): Promise<Album | null> => {
  const { data, error } = await supabase
    .from("releases")
    .select(RELEASE_SELECT)
    .eq("legacy_id", id)
    .maybeSingle();

  if (error) throw new Error(`getAlbum(${id}): ${error.message}`);
  return data ? toAlbum(data as unknown as ReleaseRow) : null;
});

/** Один трек по публичному id (legacy_id) или null, если не найден. */
export const getTrack = cache(async (id: number): Promise<Track | null> => {
  const { data, error } = await supabase
    .from("tracks")
    .select(
      "legacy_id, title, audio_url, cover_url, position, releases(legacy_id, cover_url, artists(name))",
    )
    .eq("legacy_id", id)
    .maybeSingle();

  if (error) throw new Error(`getTrack(${id}): ${error.message}`);
  if (!data) return null;

  const row = data as unknown as TrackRow & {
    releases: { legacy_id: number; cover_url: string | null; artists: { name: string } | null };
  };

  return toTrack(
    row,
    row.releases.legacy_id,
    row.releases.artists?.name ?? "",
    row.releases.cover_url,
  );
});
