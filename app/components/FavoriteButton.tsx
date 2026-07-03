"use client";

import { memo } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useIsFavorite, useFavoritesActions } from "@/app/contexts/FavoritesContext";

// Сердечко добавления в избранное. Гость → уводим на вход (/account).
// Залогинен → оптимистичный toggle через контекст.
function FavoriteButton({
  trackId,
  size = 18,
  className = "",
  activeClass = "fill-accent text-accent",
  idleClass = "text-muted hover:text-accent transition-colors",
}: {
  trackId: number;
  size?: number;
  className?: string;
  // Цвета иконки переопределяются для тёмного фона (плеер на градиенте).
  activeClass?: string;
  idleClass?: string;
}) {
  const { user } = useAuth();
  const active = useIsFavorite(trackId);
  const { toggle } = useFavoritesActions();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // не запускать проигрывание при клике по строке трека
    if (!user) {
      router.push("/account");
      return;
    }
    toggle(trackId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      className={`flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart size={size} className={active ? activeClass : idleClass} />
    </button>
  );
}

export default memo(FavoriteButton);
