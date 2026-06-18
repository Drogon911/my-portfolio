"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { usePlayer } from "@/app/contexts/PlayerContext";

const VolumeIcon = ({
  level,
  className = "w-5 h-5",
}: {
  level: "off" | "low" | "high";
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {level === "off" ? (
      <>
        <path d="M3 8v8h4l5 4V4L7 8H3z" />
        <line x1="21" y1="3" x2="3" y2="21" />
      </>
    ) : level === "low" ? (
      <>
        <path d="M3 8v8h4l5 4V4L7 8H3z" />
        <path d="M17 8c1.5 1.5 1.5 6 0 7.5" />
      </>
    ) : (
      <>
        <path d="M3 8v8h4l5 4V4L7 8H3z" />
        <path d="M17 8c1.5 1.5 1.5 6 0 7.5" />
        <path d="M20 5c2.5 2.5 2.5 11 0 13.5" />
      </>
    )}
  </svg>
);

export default function PlayerPage() {
  const params = useParams();
  const albumId = params.id as string;
  const isMobile = useIsMobile();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.push(`/album/${albumId}`), 350);
  };

  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = usePlayer();

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const handleSeek = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || !duration) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      seekTo((x / rect.width) * duration);
    },
    [duration, seekTo],
  );

  const onMouseDown = (e: React.MouseEvent) => {
    const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    handleSeek(e.clientX);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
    const onEnd = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    handleSeek(e.touches[0].clientX);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  };

  const handleVolumeSeek = useCallback(
    (clientY: number) => {
      if (!volumeBarRef.current) return;
      const rect = volumeBarRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      setVolume(1 - y / rect.height);
    },
    [setVolume],
  );

  const onVolumeMouseDown = (e: React.MouseEvent) => {
    const onMove = (ev: MouseEvent) => handleVolumeSeek(ev.clientY);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    handleVolumeSeek(e.clientY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onVolumeTouchStart = (e: React.TouchEvent) => {
    const onMove = (ev: TouchEvent) => handleVolumeSeek(ev.touches[0].clientY);
    const onEnd = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    handleVolumeSeek(e.touches[0].clientY);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  };

  if (!currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ничего не воспроизводится</p>
          <Link href="/" className="text-pink-500 hover:underline">
            ← На главную
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <motion.div
      className="min-h-screen flex flex-col relative overflow-hidden"
      initial={{ y: "100%" }}
      animate={{ y: isExiting ? "100%" : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
    >
      {/* Анимированный градиент — замирает на паузе */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(-45deg, #fbcfe8, #db2777, #9333ea, #db2777, #fbcfe8)",
          backgroundSize: "300% 300%",
          animation: "gradientFlow 8s ease infinite",
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      />
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-purple-500/40 transition-all duration-300 border border-white/30 shadow-lg"
        >
          ← К альбому
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AnimatePresence mode="wait">
            {isMobile ? (
              <motion.div
                key={currentTrack.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) nextTrack();
                  if (info.offset.x > 50) prevTrack();
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="cursor-grab active:cursor-grabbing will-change-transform"
              >
                <div
                  className={`relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm transition-all duration-700 ${
                    isPlaying
                      ? "shadow-[0_0_60px_rgba(219,39,119,0.6)] scale-105"
                      : "shadow-2xl"
                  }`}
                >
                  <Image
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    fill
                    className="object-cover pointer-events-none select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentTrack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm will-change-transform transition-all duration-700 ${
                  isPlaying
                    ? "shadow-[0_0_60px_rgba(219,39,119,0.6)] scale-105"
                    : "shadow-2xl"
                }`}
              >
                <Image
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  fill
                  className="object-cover pointer-events-none select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.h1
              key={currentTrack.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="text-3xl md:text-4xl font-bold text-white mt-8 text-center drop-shadow-lg"
            >
              {currentTrack.title}
            </motion.h1>
          </AnimatePresence>
          <p className="text-pink-100 mt-2 text-center drop-shadow">
            {currentTrack.artist}
          </p>
        </div>

        <div className="w-full bg-white/20 backdrop-blur-lg border-t border-white/30 shadow-2xl rounded-t-3xl p-6 pb-8">
          <div className="max-w-4xl mx-auto w-full">
            {/* Кастомный прогресс-бар */}
            <div
              ref={progressBarRef}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="relative w-full h-8 -my-1 cursor-pointer group"
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-3 bg-white/30 rounded-full pointer-events-none" />
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-3 bg-white rounded-full pointer-events-none will-change-transform"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute w-5 h-5 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/80 mt-3 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto w-full mt-6">
            {/* Кнопки управления — по центру */}
            <div className="flex gap-8 items-center justify-center">
              <button
                onClick={prevTrack}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 active:bg-pink-600 transition-all text-white shadow-md"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-white hover:bg-pink-50 active:bg-pink-100 transition-all shadow-lg text-pink-600"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-0.5" />
                )}
              </button>
              <button
                onClick={nextTrack}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 active:bg-pink-600 transition-all text-white shadow-md"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Вертикальный слайдер громкости — справа от прогресс-бара */}
            <div className="absolute left-full ml-130 -top-22 flex flex-col items-center gap-2">
              <div
                ref={volumeBarRef}
                onMouseDown={onVolumeMouseDown}
                onTouchStart={onVolumeTouchStart}
                className="relative w-10 h-32 cursor-pointer group"
              >
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full bg-white/30 rounded-full pointer-events-none" />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 bg-white rounded-full pointer-events-none will-change-[height]"
                  style={{ height: `${isMuted ? 0 : volume * 100}%` }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                  style={{
                    bottom: `calc(${isMuted ? 0 : volume * 100}% - 10px)`,
                  }}
                />
              </div>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 transition-all text-white"
              >
                <VolumeIcon
                  level={
                    isMuted || volume === 0
                      ? "off"
                      : volume < 0.5
                        ? "low"
                        : "high"
                  }
                  className="w-7 h-7"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
