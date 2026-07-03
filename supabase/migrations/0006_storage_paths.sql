-- 0006_storage_paths.sql
-- Переход на Supabase Storage: пути к файлам теперь относительные.
--
-- Раньше audio_url/cover_url хранили путь под public/ вида '/albums/album-1/..'.
-- Файлы переехали в bucket `media` с той же структурой (albums/album-N/..),
-- а публичный URL собирает app/lib/storage.ts. Здесь убираем ведущий '/',
-- чтобы значение совпало с ключом объекта в Storage.
--
-- Идемпотентно: ltrim повторно ничего не портит; ltrim(NULL) = NULL, поэтому
-- необязательные обложки остаются пустыми.

update public.tracks
  set audio_url = ltrim(audio_url, '/'),
      cover_url = ltrim(cover_url, '/');

update public.releases
  set cover_url = ltrim(cover_url, '/');
