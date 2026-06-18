"use client";

import { useState } from "react";
import { musicLibrary } from "@/app/data/musicLibrary";
import Fuse from "fuse.js";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import PlayButton from "@/app/components/PlayButton";
import { usePlayer } from "@/app/contexts/PlayerContext";

const allTracks = musicLibrary.flatMap((album) =>
  album.tracks.map((track) => ({
    ...track,
    albumId: album.id,
    albumTitle: album.title,
  })),
);

const fuseOptions = {
  keys: [
    { name: "title", weight: 2 },
    { name: "artist", weight: 1.5 },
    { name: "albumTitle", weight: 1 },
  ],
  threshold: 0.35,
  distance: 100,
  includeScore: true,
};

const fuse = new Fuse(allTracks, fuseOptions);

export default function SearchPage() {
  const { currentTrack } = usePlayer();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof allTracks>([]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }
    const fuseResults = fuse.search(searchQuery);
    setResults(fuseResults.map((r) => r.item));
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const isPlaying = (trackId: number) => currentTrack?.id === trackId;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Поиск</h1>
      <p className="text-gray-500 mb-8">Найди свою любимую песню</p>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Название трека или исполнитель..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm focus:shadow-md focus:border-pink-300 focus:ring-1 focus:ring-pink-300 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {query && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Найдено: {results.length} {results.length === 1 ? "трек" : "треков"}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50">
              <p className="text-gray-500 text-lg">Ничего не найдено</p>
              <p className="text-gray-400 mt-2">Попробуйте изменить запрос</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((track) => {
                const active = isPlaying(track.id);
                return (
                  <div
                    key={track.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-white/50 group
                      ${
                        active
                          ? "bg-pink-100/70 shadow-md"
                          : "bg-white/40 hover:bg-pink-100/50 hover:shadow-md"
                      }
                    `}
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
                        ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                      `}
                      >
                        <PlayButton
                          trackId={track.id}
                          track={track}
                          playlistTracks={allTracks.filter(
                            (t) => t.albumId === track.albumId,
                          )}
                          isCompact={true}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/album/${track.albumId}`}
                        className="block group-hover:text-pink-600 transition"
                      >
                        <p
                          className={`font-medium truncate ${active ? "text-pink-800" : "text-gray-800"}`}
                        >
                          {track.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
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

      {!query && (
        <div className="text-center py-16 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Начните вводить название песни или исполнителя
          </p>
          <p className="text-gray-400 mt-2">
            Например: «Eskimo Callboy» или «Prom Night»
          </p>
        </div>
      )}
    </div>
  );
}
