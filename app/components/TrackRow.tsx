"use client";

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

export default function TrackRow({
  track,
  index,
  variant,
  tracks,
  isPlaying,
}: TrackRowProps) {
  const baseRowClasses = `group grid grid-cols-12 gap-4 items-center px-5 py-3 rounded-xl transition-all duration-200 border border-white/50 cursor-pointer
    ${
      isPlaying
        ? "bg-pink-100/70 shadow-md"
        : "bg-white/30 hover:bg-pink-100/50 hover:shadow-md"
    }`;

  if (variant === "album") {
    return (
      <div className={baseRowClasses}>
        <div className="col-span-1 flex items-center justify-start">
          {!isPlaying && (
            <span className="text-gray-400 text-sm font-mono group-hover:hidden">
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
        <div className="col-span-11">
          <p
            className={`font-medium truncate ${isPlaying ? "text-pink-800" : "text-gray-800"}`}
          >
            {track.title}
          </p>
          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
        </div>
      </div>
    );
  }

  // variant === "playlist"
  return (
    <div className={baseRowClasses}>
      <div className="col-span-2 md:col-span-1 flex items-center justify-start">
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
      <div className="col-span-10 md:col-span-11">
        <p
          className={`font-medium truncate ${isPlaying ? "text-pink-800" : "text-gray-800"}`}
        >
          {track.title}
        </p>
        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
      </div>
    </div>
  );
}
