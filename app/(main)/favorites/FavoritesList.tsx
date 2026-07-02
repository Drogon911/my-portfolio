"use client";

import { usePlayer } from "@/app/contexts/PlayerContext";
import TrackRow from "@/app/components/TrackRow";
import type { Track } from "@/app/lib/db/types";

// Клиентская обёртка: TrackRow подсвечивает играющий трек через usePlayer,
// а весь массив избранного служит очередью для плеера.
export default function FavoritesList({ tracks }: { tracks: Track[] }) {
  const { currentTrack } = usePlayer();

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          variant="playlist"
          tracks={tracks}
          isPlaying={currentTrack?.id === track.id}
        />
      ))}
    </div>
  );
}
