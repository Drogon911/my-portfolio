import { createClient } from "@supabase/supabase-js";

// Публичный клиент Supabase (anon-ключ). Подходит для чтения каталога —
// таблицы releases/tracks/artists открыты на SELECT через RLS.
// Для авторизации и серверных сессий позже добавим @supabase/ssr отдельно.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Не заданы NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — проверь .env.local",
  );
}

export const supabase = createClient(url, anonKey);
