"use client";

import { memo } from "react";
import Image from "next/image";
import PlayButton from "./PlayButton";
import type { Track } from "@/app/data/musicLibrary";
interface TrackRowProps {
  track: Track;
  index: number;
  variant: "album" | "playlist";
  tracks: Track[];
  isPlaying: boolean;
}

export default memo(function TrackRow({
  track,
  index,
  variant,
  tracks,
  isPlaying,
}: TrackRowProps) {
  const baseRowClasses = `group flex md:grid md:grid-cols-12 gap-3 md:gap-4 items-center px-4 md:px-5 py-3 rounded-xl transition-all duration-200 border cursor-pointer
    ${
      isPlaying
        ? "bg-accent/10 border-accent/20"
        : "bg-white/5 border-white/8 hover:bg-white/10"
    }`;

  if (variant === "album") {
    return (
      <div className={baseRowClasses}>
        <div className="shrink-0 md:col-span-1 flex items-center justify-start w-8 md:w-auto">
          {!isPlaying && (
            <span className="text-subtle text-sm font-mono group-hover:hidden">
              {index + 1}
            </span>
          )}
          <div className={!isPlaying ? "hidden group-hover:block" : "block"}>
            <PlayButton
              trackId={track.id}
              track={track}
              playlistTracks={tracks}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 md:col-span-11">
          <p
            className={`font-medium truncate ${isPlaying ? "text-accent" : "text-foreground"}`}
          >
            {track.title}
          </p>
          <p className="text-sm text-muted truncate">{track.artist}</p>
        </div>
      </div>
    );
  }

  // variant === "playlist"
  return (
    <div className={baseRowClasses}>
      <div className="shrink-0 md:col-span-1 flex items-center justify-start">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md shrink-0">
          <Image
            src={track.cover}
            alt={track.title}
            fill
            className={`object-cover transition-all duration-200 ${isPlaying ? "brightness-75" : ""}`}
            sizes="(max-width: 768px) 96px, 128px"
          />
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
            ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
          >
            <PlayButton
              trackId={track.id}
              track={track}
              playlistTracks={tracks}
              isCompact={true}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 md:col-span-11">
        <p
          className={`font-medium truncate ${isPlaying ? "text-accent" : "text-foreground"}`}
        >
          {track.title}
        </p>
        <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
      </div>
    </div>
  );
});
