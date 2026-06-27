"use client";

import { memo } from "react";
import { usePlayer } from "@/app/contexts/PlayerContext";
import type { Track } from "@/app/lib/db/types";
import { Play } from "lucide-react";

interface PlayButtonProps {
  trackId: number;
  track: Track;
  playlistTracks: Track[];
  isCompact?: boolean;
}

export default memo(function PlayButton({
  trackId,
  track,
  playlistTracks,
  isCompact = false,
}: PlayButtonProps) {
  const {
    currentTrack,
    isPlaying: isGlobalPlaying,
    playTrack,
    togglePlay,
  } = usePlayer();

  // Трек играет только если это текущий трек И он действительно воспроизводится
  const isTrackPlaying = currentTrack?.id === trackId && isGlobalPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack?.id === trackId) {
      togglePlay();
    } else {
      playTrack(track, playlistTracks);
    }
  };

  if (isTrackPlaying) {
    // Активное состояние: пульсирующие столбики (анимация волн)
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <div className="flex items-center justify-center gap-0.5">
          <div
            className="w-1 h-2 bg-accent rounded-full animate-[wave_0.8s_ease-in-out_infinite]"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-1 h-4 bg-accent rounded-full animate-[wave_0.8s_ease-in-out_infinite]"
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className="w-1 h-3 bg-accent rounded-full animate-[wave_0.8s_ease-in-out_infinite]"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="w-1 h-2 bg-accent rounded-full animate-[wave_0.8s_ease-in-out_infinite]"
            style={{ animationDelay: "0.45s" }}
          />
        </div>
      </div>
    );
  }

  // Неактивное состояние (трек не играет)
  if (isCompact) {
    // Компактная версия (плейлист) — без блюра, простая полупрозрачная кнопка
    return (
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 shadow-md hover:bg-accent/40 hover:scale-105 transition-all duration-200"
      >
        <Play className="w-4 h-4 fill-white text-white transition-transform duration-200 group-hover:scale-105" />
      </button>
    );
  }

  // Полная версия (альбом) — с блюром как было
  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/8 border border-accent/20 shadow-md hover:bg-accent/20 hover:scale-105 transition-all duration-200 group"
    >
      <Play className="w-4 h-4 fill-white text-white transition-transform group-hover:scale-105" />
    </button>
  );
});
