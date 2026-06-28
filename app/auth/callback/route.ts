import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// Куда Google возвращает пользователя после согласия. Обмениваем code на сессию
// (PKCE) и редиректим обратно в приложение.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Код отсутствует или обмен не удался — уводим на аккаунт с пометкой ошибки.
  return NextResponse.redirect(`${origin}/account?error=auth`);
}
