"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { createClient } from "@/app/lib/supabase/browser";
import { getFavoriteTrackIds } from "@/app/lib/db/favorites";

// Внешний стор избранного.
//
// Держит Set публичных legacy-id и набор подписчиков. Каждая FavoriteButton
// подписывается на СВОЙ boolean через useSyncExternalStore, поэтому лайк одного
// трека перерисовывает только его кнопку, а не все сердечки на экране разом
// (как было бы, живи состояние в значении контекста). Та же философия, что и
// разделение PlayerContext ради 60fps.

let favorites = new Set<number>();
let ready = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Клиент Supabase создаём лениво и один раз (не на каждый клик). getClient
// вызывается только из браузерных путей (эффект загрузки, обработчик клика),
// поэтому createBrowserClient не трогает cookies во время SSR.
let client: ReturnType<typeof createClient> | null = null;
function getClient() {
  return (client ??= createClient());
}

function toggle(id: number) {
  const wasFavorite = favorites.has(id);

  // Оптимистично применяем новое состояние (новый Set — иммутабельно).
  const next = new Set(favorites);
  if (wasFavorite) next.delete(id);
  else next.add(id);
  favorites = next;
  emit();

  getClient()
    .rpc("toggle_favorite", { p_legacy_id: id })
    .then(({ error }) => {
      if (!error) return;
      // Откат к явному прежнему присутствию id, не затирая другие лайки,
      // которые пользователь мог сделать за это время.
      const rollback = new Set(favorites);
      if (wasFavorite) rollback.add(id);
      else rollback.delete(id);
      favorites = rollback;
      emit();
    });
}

/** Подписка на состояние одного трека — возвращает стабильный boolean. */
export function useIsFavorite(id: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => favorites.has(id),
    () => false, // server snapshot: до гидрации избранное неизвестно
  );
}

/** Стабильные экшены + флаг готовности (ссылки не меняются между рендерами). */
export function useFavoritesActions(): { toggle: (id: number) => void; ready: boolean } {
  const isReady = useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
  return { toggle, ready: isReady };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Грузим избранное при входе; при выходе — очищаем.
  useEffect(() => {
    if (!user) {
      favorites = new Set();
      ready = true;
      emit();
      return;
    }
    let cancelled = false;
    getFavoriteTrackIds(getClient())
      .then((list) => {
        if (!cancelled) favorites = new Set(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          ready = true;
          emit();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return <>{children}</>;
}
