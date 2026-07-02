"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { createClient } from "@/app/lib/supabase/browser";
import { getFavoriteTrackIds } from "@/app/lib/db/favorites";

type FavoritesContextType = {
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  isFavorite: () => false,
  toggle: () => {},
  ready: false,
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  // Загружаем избранное при входе; при выходе — очищаем.
  useEffect(() => {
    if (!user) {
      // Сброс избранного при выходе — синхронизация с внешним состоянием (auth).
      /* eslint-disable react-hooks/set-state-in-effect */
      setIds(new Set());
      setReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    let cancelled = false;
    getFavoriteTrackIds(createClient())
      .then((list) => {
        if (!cancelled) setIds(new Set(list));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorite = useCallback((id: number) => ids.has(id), [ids]);

  const toggle = useCallback((id: number) => {
    const flip = (set: Set<number>) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    };
    // Оптимистично меняем состояние, затем шлём RPC; при ошибке откатываем.
    setIds(flip);
    createClient()
      .rpc("toggle_favorite", { p_legacy_id: id })
      .then(({ error }) => {
        if (error) setIds(flip);
      });
  }, []);

  const value = useMemo(
    () => ({ isFavorite, toggle, ready }),
    [isFavorite, toggle, ready],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
