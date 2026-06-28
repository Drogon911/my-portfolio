import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Клиент Supabase для server-компонентов и route handlers.
// Читает/обновляет сессию через cookies (в Next 16 cookies() асинхронный).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // В server-компонентах запись cookies может быть запрещена —
          // тогда обновление сессии берёт на себя middleware. Глушим ошибку.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // вызвано из Server Component — игнорируем
          }
        },
      },
    },
  );
}
