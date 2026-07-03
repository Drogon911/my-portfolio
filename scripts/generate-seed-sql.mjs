// generate-seed-sql.mjs
// Генерирует supabase/seed.sql из статического каталога app/data/musicLibrary.ts.
// Запуск: node scripts/generate-seed-sql.mjs
// Результат прогоняется в Supabase SQL Editor (под ролью postgres → обходит RLS).
//
// Идемпотентно: на каждой таблице `on conflict do nothing`, поэтому повторный
// прогон не создаёт дублей. type у всех релизов = 'album' (как в плане);
// при желании поправить отдельные релизы (например, сингл Monofluid) — вручную.

import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { musicLibrary } from "../app/data/musicLibrary.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "supabase", "seed.sql");

// RU→latin транслитерация для slug (текущие имена латинские, но задел на будущее).
const translitMap = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(name) {
  return name
    .toLowerCase()
    .split("")
    .map((ch) => (ch in translitMap ? translitMap[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Экранирование строки для SQL-литерала ('' вместо ').
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

// То же, но для пути к файлу в Storage: снимаем ведущий '/' — в БД путь
// хранится относительным (albums/album-N/..), URL строит app/lib/storage.ts.
const qp = (s) => q(String(s).replace(/^\/+/, ""));

// ── Уникальные исполнители ────────────────────────────────────
const artistSlugs = new Map(); // name → slug
for (const album of musicLibrary) {
  if (!artistSlugs.has(album.artist)) {
    artistSlugs.set(album.artist, slugify(album.artist));
  }
}

const lines = [];
lines.push("-- seed.sql — сгенерировано scripts/generate-seed-sql.mjs. Не редактировать вручную.");
lines.push("-- Прогонять ПОСЛЕ 0001_core_schema.sql. Идемпотентно (on conflict do nothing).");
lines.push("");

// ── Исполнители ───────────────────────────────────────────────
lines.push("-- Исполнители");
lines.push("insert into public.artists (name, slug) values");
lines.push(
  [...artistSlugs.entries()]
    .map(([name, slug]) => `  (${q(name)}, ${q(slug)})`)
    .join(",\n") + "\non conflict (slug) do nothing;",
);
lines.push("");

// ── Релизы ────────────────────────────────────────────────────
lines.push("-- Релизы (artist_id через подзапрос по slug; legacy_id = старый Album.id)");
lines.push(
  "insert into public.releases (artist_id, title, type, cover_url, legacy_id) values",
);
lines.push(
  musicLibrary
    .map((album) => {
      const slug = artistSlugs.get(album.artist);
      return `  ((select id from public.artists where slug = ${q(slug)}), ${q(album.title)}, 'album', ${qp(album.cover)}, ${album.id})`;
    })
    .join(",\n") + "\non conflict (legacy_id) do nothing;",
);
lines.push("");

// ── Треки ─────────────────────────────────────────────────────
lines.push("-- Треки (release_id через подзапрос по legacy_id; position = порядок в альбоме)");
lines.push(
  "insert into public.tracks (release_id, title, audio_url, cover_url, position, legacy_id) values",
);
const trackRows = [];
for (const album of musicLibrary) {
  album.tracks.forEach((track, i) => {
    trackRows.push(
      `  ((select id from public.releases where legacy_id = ${album.id}), ${q(track.title)}, ${qp(track.src)}, ${qp(track.cover)}, ${i + 1}, ${track.id})`,
    );
  });
}
lines.push(trackRows.join(",\n") + "\non conflict (legacy_id) do nothing;");
lines.push("");

writeFileSync(outPath, lines.join("\n"), "utf8");

const trackCount = musicLibrary.reduce((n, a) => n + a.tracks.length, 0);
console.log(`✓ ${outPath}`);
console.log(`  ${artistSlugs.size} исполнителей, ${musicLibrary.length} релизов, ${trackCount} треков`);
