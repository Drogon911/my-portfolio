"use client";

import { useParams } from "next/navigation";
import { musicLibrary } from "@/app/data/musicLibrary";
import { usePlayer } from "@/app/contexts/PlayerContext";
import Image from "next/image";
import TrackRow from "@/app/components/TrackRow";

export default function PlaylistPage() {
  const params = useParams();
  const id = Number(params.id);
  // TODO: Позже здесь будут данные из Supabase
  // Пока используем те же альбомы как заглушки
  const playlist = musicLibrary.find(album => album.id === id);
  const { currentTrack } = usePlayer();

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Плейлист не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-pink-50 to-violet-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Шапка плейлиста */}
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end mb-12 p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-2xl overflow-hidden shrink-0 ring-2 ring-white/50">
            <Image
              src={playlist.cover}
              alt={playlist.title}
              width={192}
              height={192}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-pink-600 text-sm font-semibold uppercase tracking-wider mb-2">
              Плейлист
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-2">
              {playlist.title}
            </h1>
            <p className="text-gray-600 text-lg mb-1">{playlist.artist}</p>
            <p className="text-gray-500 text-sm">
              {playlist.tracks.length} треков
            </p>
          </div>
        </div>

        {/* Список треков */}
        <div className="space-y-3">
          {playlist.tracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              variant="playlist"
              tracks={playlist.tracks}
              isPlaying={currentTrack?.id === track.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
