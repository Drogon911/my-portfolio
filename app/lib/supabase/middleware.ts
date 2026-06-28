import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Рефреш сессии на каждом запросе: читает cookies из запроса, при необходимости
// обновляет токен и прокидывает свежие cookies в ответ. Без этого серверные
// компоненты могут получать протухшую сессию. Стандартный паттерн @supabase/ssr.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ВАЖНО: getUser() обязателен — он триггерит рефреш токена.
  await supabase.auth.getUser();

  return response;
}
