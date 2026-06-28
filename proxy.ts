import { type NextRequest } from "next/server";
import { updateSession } from "@/app/lib/supabase/middleware";

// Next 16: конвенция middleware → proxy. Рефрешит сессию Supabase до рендера.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Прогоняем на всех маршрутах, кроме статики и картинок —
  // там сессию рефрешить незачем.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
};
