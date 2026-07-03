// Заливка медиа-каталога (mp3 + обложки + blur) в Supabase Storage.
//
// Одноразовая миграция файлов из public/albums/ в bucket `media`. Сохраняет
// ту же структуру путей (albums/album-N/...), поэтому blur-логика в UI
// (cover.replace(...)) продолжает работать, а в БД путь совпадает с тем, что
// строит app/lib/storage.ts.
//
// Запуск (Node 20.6+, нативный --env-file, без зависимостей):
//   node --env-file=.env.local scripts/upload-to-storage.mjs
//
// Требует в .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (secret! только локально, не коммитить)
//
// Идемпотентно: создаёт bucket если нет, заливает с upsert — повторный запуск
// безопасен.

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "media";
const SOURCE_DIR = fileURLToPath(new URL("../public/albums", import.meta.url));

const CONTENT_TYPES = {
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Не заданы NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Запуск: node --env-file=.env.local scripts/upload-to-storage.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Рекурсивно собирает все файлы внутри dir.
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = join(dir, e.name);
      return e.isDirectory() ? walk(full) : Promise.resolve([full]);
    }),
  );
  return files.flat();
}

async function ensureBucket() {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    console.log(`Bucket "${BUCKET}" уже существует.`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (error) throw new Error(`createBucket: ${error.message}`);
  console.log(`Bucket "${BUCKET}" создан (public).`);
}

async function main() {
  await ensureBucket();

  const files = await walk(SOURCE_DIR);
  console.log(`Найдено файлов: ${files.length}. Заливаю в "${BUCKET}"...`);

  let ok = 0;
  for (const file of files) {
    // albums/album-N/...  — тот же путь, что хранится в БД (без bucket).
    const key = "albums/" + relative(SOURCE_DIR, file).split(sep).join("/");
    const body = await readFile(file);
    const contentType = CONTENT_TYPES[extname(file).toLowerCase()];

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, body, { contentType, upsert: true });

    if (error) {
      console.error(`  ✗ ${key}: ${error.message}`);
    } else {
      ok += 1;
      console.log(`  ✓ ${key}`);
    }
  }

  console.log(`Готово: ${ok}/${files.length} файлов залито.`);
  if (ok !== files.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
