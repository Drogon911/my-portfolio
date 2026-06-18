"use client";

import { useParams } from "next/navigation";
import { musicLibrary } from "@/app/data/musicLibrary";
import { usePlayer } from "@/app/contexts/PlayerContext";
import Image from "next/image";
import TrackRow from "@/app/components/TrackRow";
import GlassPage from "@/app/components/GlassPage";

export default function AlbumPage() {
  const params = useParams();
  const id = Number(params.id);
  const album = musicLibrary.find(album => album.id === id);
  const { currentTrack } = usePlayer();

  if (!album) {
    return (
      <GlassPage className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Альбом не найден</p>
      </GlassPage>
    );
  }

  return (
    <GlassPage className="min-h-screen w-full">
      {/* Шапка альбома — ОСТАЁМСЯ КАК БЫЛО */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end mb-12 p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-2xl overflow-hidden shrink-0 ring-2 ring-white/50">
          <Image
            src={album.cover}
            alt={album.title}
            width={192}
            height={192}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div className="text-center md:text-left">
          <p className="text-pink-600 text-sm font-semibold uppercase tracking-wider mb-2">
            Альбом
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-2">
            {album.title}
          </h1>
          <p className="text-gray-600 text-lg mb-1">{album.artist}</p>
          <p className="text-gray-500 text-sm">
            {album.tracks.length} треков
          </p>
        </div>
      </div>

      {/* Список треков */}
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-gray-500 text-sm border-b border-gray-200/50">
          <div className="col-span-1">#</div>
          <div className="col-span-9">Название</div>
          <div className="col-span-2 text-right"></div>
        </div>

        {album.tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            variant="album"
            tracks={album.tracks}
            isPlaying={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </GlassPage>
  );
}