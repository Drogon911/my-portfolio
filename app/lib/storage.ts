// Единая точка построения URL к файлам в Supabase Storage.
//
// В БД хранится короткий относительный путь (напр. "albums/album-1/track-1.mp3"),
// а публичный URL собирается здесь. Домен не размазан по данным, и будущий
// переход на signed URL меняет только эту функцию.

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

/** Публичный URL файла в bucket `media` по относительному пути из БД. */
export function storageUrl(path: string): string {
  return `${BASE}/${path}`;
}
