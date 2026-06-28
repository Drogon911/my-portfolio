import { createBrowserClient } from "@supabase/ssr";

// Клиент Supabase для client-компонентов (хранит сессию в cookies через браузер).
// Используется для входа/выхода и подписки на изменения сессии.
// createBrowserClient мемоизирует инстанс, так что вызывать можно свободно.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
