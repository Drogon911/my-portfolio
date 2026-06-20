import GlassPage from "@/app/components/GlassPage";
import { Library } from "lucide-react";

export default function PlaylistsPage() {
  return (
    <GlassPage className="min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Library className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-semibold text-foreground">Плейлисты</h1>
      </div>

      <div className="text-center py-12 md:py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/8">
        <Library className="w-14 h-14 md:w-16 md:h-16 text-subtle mx-auto mb-4" />
        <p className="text-muted text-lg">Пока нет плейлистов</p>
        <p className="text-subtle mt-2 text-sm md:text-base px-4">
          Здесь будут ваши личные плейлисты после подключения аккаунта
        </p>
      </div>
    </GlassPage>
  );
}
