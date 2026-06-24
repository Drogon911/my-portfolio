"use client";

import { useParams } from "next/navigation";
import { musicLibrary } from "@/app/data/musicLibrary";
import { usePlayer } from "@/app/contexts/PlayerContext";
import Image from "next/image";
import TrackRow from "@/app/components/TrackRow";
import GlassPage from "@/app/components/GlassPage";
import BackButton from "@/app/components/BackButton";

export default function AlbumPage() {
  const params = useParams();
  const id = Number(params.id);
  const album = musicLibrary.find(album => album.id === id);
  const { currentTrack } = usePlayer();

  if (!album) {
    return (
      <GlassPage className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted text-lg">Альбом не найден</p>
      </GlassPage>
    );
  }

  return (
    <GlassPage className="min-h-screen w-full">
      <BackButton href="/albums" />
      {/* Шапка альбома */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-end mt-8 mb-6 md:mb-12 p-5 md:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-xl">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-2xl overflow-hidden shrink-0 ring-1 ring-white/10">
          <Image
            src={album.cover}
            alt={album.title}
            width={192}
            height={192}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div className="text-center md:text-left w-full min-w-0">
          <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">
            Альбом
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-2 wrap-break-word">
            {album.title}
          </h1>
          <p className="text-muted text-lg mb-1 truncate">{album.artist}</p>
          <p className="text-subtle text-sm">
            {album.tracks.length} треков
          </p>
        </div>
      </div>

      {/* Список треков */}
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-subtle text-sm border-b border-white/10">
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