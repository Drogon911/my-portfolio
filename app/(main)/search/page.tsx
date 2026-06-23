"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { musicLibrary } from "@/app/data/musicLibrary";
import Fuse from "fuse.js";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import PlayButton from "@/app/components/PlayButton";
import { usePlayer } from "@/app/contexts/PlayerContext";
import GlassPage from "@/app/components/GlassPage";

const allTracks = musicLibrary.flatMap((album) =>
  album.tracks.map((track) => ({
    ...track,
    albumId: album.id,
    albumTitle: album.title,
  })),
);

// Стабильные ссылки на плейлисты по альбому — чтобы не создавать новый массив
// на каждый рендер результата поиска (иначе ломается React.memo у PlayButton).
const playlistByAlbumId = musicLibrary.reduce<Record<number, typeof allTracks>>(
  (acc, album) => {
    acc[album.id] = allTracks.filter((t) => t.albumId === album.id);
    return acc;
  },
  {},
);

const fuse = new Fuse(allTracks, {
  keys: [
    { name: "title", weight: 2 },
    { name: "artist", weight: 1.5 },
    { name: "albumTitle", weight: 1 },
  ],
  threshold: 0.35,
  distance: 100,
  includeScore: true,
});

function SearchContent() {
  const { currentTrack } = usePlayer();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<typeof allTracks>(() =>
    initialQuery ? fuse.search(initialQuery).map((r) => r.item) : []
  );

  const handleSearch = (q: string) => {
    setQuery(q);
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
    if (q.trim() === "") {
      setResults([]);
      return;
    }
    setResults(fuse.search(q).map((r) => r.item));
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    router.replace("/search", { scroll: false });
  };

  const isActive = (id: number) => currentTrack?.id === id;

  return (
    <GlassPage className="min-h-screen w-full">
      {/* Шапка */}
      <div className="mb-8">
        <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">
          Поиск
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-1">
          Найди свой трек
        </h1>
        <p className="text-muted">Введи название песни или исполнителя</p>
      </div>

      {/* Строка поиска */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="w-5 h-5 text-subtle" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Например: «Eskimo Callboy» или «Prom Night»..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 shadow-sm
            focus:shadow-md focus:border-accent/50 focus:ring-1 focus:ring-accent/30
            text-foreground placeholder-subtle focus:outline-none transition-all duration-200"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-subtle hover:text-muted transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Результаты */}
      {query && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Найдено: {results.length}{" "}
            {results.length === 1 ? "трек" : "треков"}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/8">
              <p className="text-muted text-lg">Ничего не найдено</p>
              <p className="text-subtle mt-2">Попробуйте изменить запрос</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((track) => {
                const active = isActive(track.id);
                return (
                  <div
                    key={track.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border group
                      ${active ? "bg-accent/10 border-accent/20" : "bg-white/5 border-white/8 hover:bg-white/10"}`}
                  >
                    <div className="relative w-10 h-10 rounded-md overflow-hidden shadow-md shrink-0">
                      <Image
                        src={track.cover}
                        alt={track.title}
                        fill
                        className={`object-cover transition-all duration-200 ${active ? "brightness-75" : ""}`}
                        sizes="40px"
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
                          ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <PlayButton
                          trackId={track.id}
                          track={track}
                          playlistTracks={playlistByAlbumId[track.albumId]}
                          isCompact
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/album/${track.albumId}`}
                        className="block transition"
                      >
                        <p className={`font-medium truncate transition-colors ${active ? "text-accent" : "text-foreground group-hover:text-accent"}`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-muted truncate">
                          {track.artist}
                        </p>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Подсказка когда нет запроса */}
      {!query && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/8">
          <Search className="w-12 h-12 text-subtle mx-auto mb-4" />
          <p className="text-muted text-lg">
            Начните вводить название песни или исполнителя
          </p>
          <p className="text-subtle mt-2">
            Например: «Eskimo Callboy» или «Prom Night»
          </p>
        </div>
      )}
    </GlassPage>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<GlassPage className="min-h-screen w-full">{null}</GlassPage>}>
      <SearchContent />
    </Suspense>
  );
}
