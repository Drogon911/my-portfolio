"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { usePlayer, usePlayerProgress } from "@/app/contexts/PlayerContext";
import VolumeIcon from "@/app/components/VolumeIcon";
import BackButton from "@/app/components/BackButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import { formatTime } from "@/app/utils/formatTime";

// Изолированная полоса прогресса — только она подписана на 60fps-обновления,
// поэтому остальной плеер (и дерево Framer Motion) не перерисовывается при проигрывании.
function PlayerProgressBar({
  duration,
  seekTo,
}: {
  duration: number;
  seekTo: (time: number) => void;
}) {
  const progress = usePlayerProgress();
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Кастомный прогресс-бар */}
      <div
        ref={progressBarRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="relative w-full h-8 -my-1 cursor-pointer group"
      >
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-3 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-white/30" />
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-r-full will-change-transform"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div
          className="absolute w-5 h-5 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            left: `clamp(0px, calc(${progressPercent}% - 10px), calc(100% - 20px))`,
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-white/80 mt-3 font-medium">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  const isMobile = useIsMobile();
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.back(), 350);
  };

  const {
    currentTrack,
    isPlaying,
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
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <p className="text-muted mb-4">Ничего не воспроизводится</p>
          <Link href="/" className="text-accent hover:underline">
            ← На главную
          </Link>
        </div>
      </div>
    );
  }

  const coverBlur = currentTrack.cover.replace(/\.jpg$/, "-blur.jpg");

  return (
    <motion.div
      className="min-h-screen flex flex-col relative overflow-hidden"
      initial={{ y: "100%" }}
      animate={{ y: isExiting ? "100%" : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
    >
      {/* Фон — предрендеренный blur обложки трека (64×64 JPEG, растянутый через object-cover).
          Кроссфейд при смене трека через AnimatePresence mode="sync". */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentTrack.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.4, ease: "easeInOut" },
          }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <Image
            src={coverBlur}
            alt=""
            fill
            aria-hidden
            className="object-cover saturate-150"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-bg-base/80" />
        </motion.div>
      </AnimatePresence>

      <BackButton onClick={handleBack} />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="relative flex-1 flex flex-col items-center justify-center p-6">
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
                  className={`relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-white/10 transition-all duration-700 ${
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
                className={`relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-white/10 will-change-transform transition-all duration-700 ${
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
          {/* Избранное — absolute внизу по центру верхней зоны: вне потока,
              поэтому обложка и название остаются строго на своих местах. */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <FavoriteButton
              trackId={currentTrack.id}
              size={28}
              className="w-14 h-14 bg-white/15 hover:bg-white/25 shadow-md"
              activeClass="fill-white text-white"
              idleClass="text-white/80 hover:text-white transition-colors"
            />
          </div>
        </div>

        <div className="w-full bg-white/20 border-t border-white/30 shadow-2xl rounded-t-3xl p-6 pb-8">
          <PlayerProgressBar duration={duration} seekTo={seekTo} />

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
