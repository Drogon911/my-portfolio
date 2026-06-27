// Проверка слоя app/lib/db/catalog.ts на живой БД.
// Запуск: npx tsx --env-file=.env.local scripts/test-catalog.ts
// (Node читает .env.local, tsx компилирует TS и резолвит alias @/ из tsconfig.)

import { getAlbums, getAlbum, getTrack } from "@/app/lib/db/catalog";

async function main() {
  const albums = await getAlbums();
  console.log(`getAlbums() → ${albums.length} релизов`);
  for (const a of albums) {
    console.log(`  [${a.id}] ${a.artist} — ${a.title} (${a.tracks.length} треков)`);
  }

  const album = await getAlbum(2);
  console.log(`\ngetAlbum(2) → ${album?.artist} — ${album?.title}`);
  console.log(`  первый трек: ${album?.tracks[0]?.title} | src=${album?.tracks[0]?.src}`);

  const track = await getTrack(404);
  console.log(`\ngetTrack(404) → ${track?.title}`);
  console.log(`  albumId=${track?.albumId} cover=${track?.cover}`);

  const missing = await getAlbum(999);
  console.log(`\ngetAlbum(999) → ${missing} (ожидаем null)`);
}

main();
