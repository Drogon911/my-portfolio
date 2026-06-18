"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

// Временные данные для избранного (позже подключим к контексту)
const demoFavorites = [
  {
    id: 1,
    title: "Intro",
    artist: "Eskimo Callboy",
    albumId: 1,
    cover: "/cover1a.jpg",
  },
  {
    id: 2,
    title: "Antichrist Sex Pornstyle",
    artist: "Eskimo Callboy",
    albumId: 1,
    cover: "/cover2a.jpg",
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(demoFavorites);

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((track) => track.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
        <h1 className="text-3xl font-bold text-gray-800">Избранное</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            У вас пока нет избранных треков
          </p>
          <p className="text-gray-400 mt-2">
            Нажмите на сердечко рядом с песней, чтобы добавить её сюда
          </p>
          <Link
            href="/albums"
            className="inline-block mt-6 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
          >
            Перейти к альбомам
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/50 hover:bg-pink-100/50 transition group"
            >
              <div className="relative w-10 h-10 rounded-md overflow-hidden shadow-md shrink-0">
                <Image
                  src={track.cover}
                  alt={track.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/album/${track.albumId}`}
                  className="block group-hover:text-pink-600 transition"
                >
                  <p className="font-medium text-gray-800 truncate">
                    {track.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {track.artist}
                  </p>
                </Link>
              </div>
              <button
                onClick={() => removeFavorite(track.id)}
                className="text-gray-400 hover:text-red-500 transition p-2"
                title="Удалить из избранного"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>
              <button className="text-pink-500 hover:text-pink-700 transition px-3 py-2">
                ▶ Слушать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
