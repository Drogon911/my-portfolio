"use client";

import { memo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import PlayButton from "./PlayButton";
import FavoriteButton from "./FavoriteButton";
import { usePlayer } from "@/app/contexts/PlayerContext";
import type { Track } from "@/app/lib/db/types";

interface TrackRowProps {
  track: Track;
  index: number;
  variant: "album" | "playlist";
  tracks: Track[];
  isPlaying: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default memo(function TrackRow({
  track,
  index,
  variant,
  tracks,
  isPlaying,
}: TrackRowProps) {
  const { currentTrack, isPlaying: isGlobalPlaying, playTrack, togglePlay } = usePlayer();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const isActivelyPlaying = isPlaying && isGlobalPlaying;

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    const t = setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 550);
    timeoutsRef.current.push(t);

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  // База — flex; album-вариант добавляет md:grid для выравнивания колонок #/название/действие.
  // playlist-вариант остаётся на flex, чтобы обложка была вплотную к тексту на любой ширине.
  const baseRowClasses = `relative group flex gap-3 md:gap-4 items-center px-4 md:px-5 py-3 rounded-xl transition-all duration-200 border cursor-pointer overflow-hidden
    ${
      isPlaying
        ? "bg-accent/10 border-accent/20"
        : "bg-white/5 border-white/8 hover:bg-white/10"
    }`;

  const rippleNodes = ripples.map(r => (
    <span
      key={r.id}
      className="ripple-anim pointer-events-none absolute rounded-full bg-white/15"
      style={{ left: r.x, top: r.y, width: 80, height: 80 }}
    />
  ));

  if (variant === "album") {
    const playBtnClass = isActivelyPlaying
      ? "block"
      : isPlaying
        ? "hidden md:block"
        : "hidden md:group-hover:block";

    return (
      <div className={`${baseRowClasses} md:grid md:grid-cols-12`} onClick={handleRowClick}>
        {rippleNodes}
        <div className="shrink-0 md:col-span-1 flex items-center justify-start w-8 md:w-auto">
          {!isPlaying && (
            <span className="text-subtle text-sm font-mono md:group-hover:hidden">
              {index + 1}
            </span>
          )}
          <div className={playBtnClass}>
            <PlayButton
              trackId={track.id}
              track={track}
              playlistTracks={tracks}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 md:col-span-10">
          <p className={`font-medium truncate ${isPlaying ? "text-accent" : "text-foreground"}`}>
            {track.title}
          </p>
          <p className="text-sm text-muted truncate">{track.artist}</p>
        </div>
        <div className="shrink-0 md:col-span-1 flex justify-end">
          <FavoriteButton trackId={track.id} className="p-2" />
        </div>
      </div>
    );
  }

  // variant === "playlist"
  const coverOverlayClass = isActivelyPlaying
    ? "opacity-100"
    : isPlaying
      ? "opacity-0 md:opacity-100"
      : "opacity-0 md:group-hover:opacity-100";

  return (
    <div className={baseRowClasses} onClick={handleRowClick}>
      {rippleNodes}
      <div className="shrink-0 flex items-center justify-start">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md shrink-0">
          <Image
            src={track.cover}
            alt={track.title}
            fill
            className={`object-cover transition-all duration-200 ${isPlaying ? "brightness-75" : ""}`}
            sizes="(max-width: 768px) 96px, 128px"
          />
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${coverOverlayClass}`}>
            <PlayButton
              trackId={track.id}
              track={track}
              playlistTracks={tracks}
              isCompact={true}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isPlaying ? "text-accent" : "text-foreground"}`}>
          {track.title}
        </p>
        <p className="text-sm text-muted truncate">{track.artist}</p>
      </div>
      <div className="shrink-0 flex justify-end">
        <FavoriteButton trackId={track.id} className="p-2" />
      </div>
    </div>
  );
});
