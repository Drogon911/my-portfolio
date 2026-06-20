"use client";

import { usePlayer } from "@/app/contexts/PlayerContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useRef, useCallback, useState } from "react";
import VolumeIcon from "@/app/components/VolumeIcon";
import { formatTime } from "@/app/utils/formatTime";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    duration,
    seekTo,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = usePlayer();

  const router = useRouter();
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Состояния для tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  // Перемотка при клике
  const handleSeek = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || !duration) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = x / rect.width;
      const newTime = percent * duration;
      seekTo(newTime);
    },
    [duration, seekTo],
  );

  const onMouseDown = (e: React.MouseEvent) => {
    const handleMouseMove = (moveEvent: MouseEvent) =>
      handleSeek(moveEvent.clientX);
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    handleSeek(e.clientX);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const currentTimeFormatted = formatTime(progress);

  return (
    <div
      className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 md:left-72 cursor-pointer"
      onClick={() => router.push(`/player/${currentTrack.albumId}`)}
    >
      <div className="relative bg-bg-base/85 backdrop-blur-md border-t border-white/10 rounded-t-2xl shadow-xl transition-all duration-300">
        {/* Прогресс-бар с tooltip */}
        <div className="px-5 md:px-6" onClick={(e) => e.stopPropagation()}>
          <div
            ref={progressBarRef}
            onMouseDown={onMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-4 -my-1.5 cursor-pointer group"
          >
            {/* Фон прогресс-бара */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-white/12 rounded-full pointer-events-none" />

            {/* Заполненная часть */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-white rounded-full pointer-events-none will-change-transform"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Кружок-ползунок */}
            <div
              className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 -translate-y-1/2 transition-opacity duration-150 opacity-0 group-hover:opacity-100"
              style={{ left: `clamp(0px, calc(${progressPercent}% - 5px), calc(100% - 10px))` }}
            />

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="absolute bottom-6 left-0 transform -translate-x-1/2 bg-surface text-foreground text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50 transition-opacity duration-150 border border-white/10"
                style={{ left: `${progressPercent}%` }}
              >
                {currentTimeFormatted}
              </div>
            )}
          </div>
        </div>

        {/* Основной контент */}
        <div className="px-5 py-3 md:px-6 md:py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-4">
            {/* Левая колонка - информация о треке */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-start">
                <Link
                  href={`/album/${currentTrack.albumId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block max-w-full truncate text-sm md:text-base font-semibold text-foreground hover:text-accent transition-colors duration-200"
                >
                  {currentTrack.title}
                </Link>
                <Link
                  href={`/album/${currentTrack.albumId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block max-w-full truncate text-xs md:text-sm text-muted"
                >
                  {currentTrack.artist}
                </Link>
              </div>
            </div>

            {/* Центральные кнопки управления */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevTrack();
                }}
                className="flex shrink-0 items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/8 hover:bg-white/15 shadow-md text-muted hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="flex shrink-0 items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-accent hover:bg-accent-hover shadow-lg shadow-accent/25 text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextTrack();
                }}
                className="flex shrink-0 items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/8 hover:bg-white/15 shadow-md text-muted hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Правая колонка - громкость (только десктоп) */}
            <div className="hidden md:flex items-center justify-end gap-3 min-w-35">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={
                  isMuted || volume === 0 ? "Включить звук" : "Выключить звук"
                }
              >
                <VolumeIcon
                  level={isMuted || volume === 0 ? "off" : volume < 0.5 ? "low" : "high"}
                  className="w-7 h-7 text-muted transition-all duration-200"
                />
              </button>

              <div className="relative flex items-center w-24 h-6 group">
                {/* Фоновая линия */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-white/12 rounded-full pointer-events-none" />

                {/* Заполненная линия — без transition для скорости */}
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-white rounded-full pointer-events-none will-change-transform"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />

                {/* Ползунок */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full h-6 rounded-lg appearance-none cursor-pointer bg-transparent
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3.5 
                    [&::-webkit-slider-thumb]:h-3.5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:duration-200
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:active:scale-95
                    [&::-moz-range-thumb]:w-3.5
                    [&::-moz-range-thumb]:h-3.5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-none
                    [&::-moz-range-thumb]:shadow-md
                    [&::-moz-range-thumb]:transition-all
                    [&::-moz-range-thumb]:duration-200
                    [&::-moz-range-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:active:scale-95
                    [&::-webkit-slider-runnable-track]:bg-transparent
                    [&::-moz-range-track]:bg-transparent"
                  style={{ background: "transparent" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
