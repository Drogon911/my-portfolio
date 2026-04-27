"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";

const albums = [
  {
    id: 1,
    name: "EP 2010",
    artist: "Eskimo Callboy",
    cover: "/eskimo-callboy-ep-2010.jpg",
    tracks: [
      { id: 1, title: "Intro", src: "/track1.mp3", cover: "/cover1a.jpg" },
      {
        id: 2,
        title: "Antichrist Sex Pornstyle",
        src: "/track2.mp3",
        cover: "/cover2a.jpg",
      },
      {
        id: 3,
        title: "Monsieur Moustache vs. Clitcat",
        src: "/track3.mp3",
        cover: "/cover3.jpg",
      },
      {
        id: 4,
        title: "Hey Mrs. Dramaqueen",
        src: "/track4.mp3",
        cover: "/cover4.jpg",
      },
      { id: 5, title: "Prom Night", src: "/track5.mp3", cover: "/cover5.jpg" },
      { id: 6, title: "Outro", src: "/track6.mp3", cover: "/cover6.jpg" },
    ],
  },
  {
    id: 2,
    name: "Vegas",
    artist: "Eskimo Callboy",
    cover: "/vegas-cover.jpg",
    tracks: [
      {
        id: 1,
        title: "Bury Me in Vegas",
        src: "/track1v.mp3",
        cover: "/cover1v.jpg",
      },
      {
        id: 2,
        title: "The Kerosene Dance",
        src: "/track2v.mp3",
        cover: "/cover2v.jpg",
      },
      { id: 3, title: "Internude", src: "/track3v.mp3", cover: "/cover3v.jpg" },
      {
        id: 4,
        title: "Is Anyone Up",
        src: "/track4v.mp3",
        cover: "/cover4v.jpg",
      },
      {
        id: 5,
        title: "Wonderbra Boulevard",
        src: "/track5v.mp3",
        cover: "/cover5v.jpg",
      },
      {
        id: 6,
        title: "Legendary Sleeping Assault",
        src: "/track6v.mp3",
        cover: "/cover6v.jpg",
      },
      {
        id: 7,
        title: "Light the Skyline",
        src: "/track7v.mp3",
        cover: "/cover7v.jpg",
      },
      {
        id: 8,
        title: "5$ Bitchcore",
        src: "/track8v.mp3",
        cover: "/cover8v.jpg",
      },
      {
        id: 9,
        title: "Transilvanian Cunthunger",
        src: "/track9v.mp3",
        cover: "/cover9v.jpg",
      },
      {
        id: 10,
        title: "Muffin Purper-Gurk",
        src: "/track10v.mp3",
        cover: "/cover10v.jpg",
      },
      {
        id: 11,
        title: "Snow Covered Polaroids",
        src: "/track11v.mp3",
        cover: "/cover11v.jpg",
      },
    ],
  },
];

export default function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const albumId = id;
  const album = albums.find((a) => a.id === Number(albumId)) || albums[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const isMobile = useIsMobile();

  const currentTrack = album.tracks[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const nextTrack = () => {
    if (currentTrackIndex < album.tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Ошибка play:", e));
    }
  }, [currentTrackIndex]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-purple-500/40 transition-all duration-300 border border-white/30 shadow-lg"
        >
          ← На главную
        </Link>
      </div>

      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            "linear-gradient(135deg, #fbcfe8, #db2777, #fbcfe8, #db2777, #fbcfe8)",
          backgroundSize: "400% 400%",
          animation: isPlaying ? "gradientFlow 12s ease infinite" : "none",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AnimatePresence mode="wait">
            {isMobile ? (
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  if (info.offset.x < -50) nextTrack();
                  if (info.offset.x > 50) prevTrack();
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  key={currentTrackIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm"
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
              </motion.div>
            ) : (
              <motion.div
                key={currentTrackIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm"
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
            {album.name} — {album.artist}
          </p>
        </div>

        <div className="w-full bg-white/20 backdrop-blur-lg border-t border-white/30 shadow-2xl rounded-t-3xl p-6 pb-8">
          <div className="max-w-2xl mx-auto w-full">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(progress / (duration || 1)) * 100}%, #fbcfe8 ${(progress / (duration || 1)) * 100}%, #fbcfe8 100%)`,
              }}
            />
            <div className="flex justify-between text-sm text-white mt-2 font-medium drop-shadow">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex gap-8 justify-center items-center mt-6">
            <button
              onClick={prevTrack}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 active:bg-pink-600 transition-all text-white shadow-md"
              aria-label="Предыдущий трек"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-white hover:bg-pink-50 active:bg-pink-100 transition-all shadow-lg text-pink-600"
              aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
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
              aria-label="Следующий трек"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <audio
            ref={audioRef}
            src={currentTrack.src}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={nextTrack}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </div>
  );
}
