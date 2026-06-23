"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import type { Track } from "@/app/data/musicLibrary";

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Track, playlist?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Прогресс обновляется 60 раз/сек, поэтому он живёт в отдельном контексте —
// чтобы перерисовывались только сами полоски прогресса, а не всё дерево плеера.
const PlayerProgressContext = createContext<number>(0);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};

export const usePlayerProgress = () => useContext(PlayerProgressContext);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Громкость с сохранением в localStorage
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('player_volume');
      if (saved !== null) {
        return Math.max(0, Math.min(1, parseFloat(saved)));
      }
    }
    return 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('player_muted');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });
  const previousVolumeRef = useRef(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const queueRef = useRef(queue);
  
  // Для плавного прогресса
  const rafIdRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const animationActiveRef = useRef(false);
  
  // Храним функцию в ref, чтобы избежать циклических зависимостей
  const updateProgressSmoothRef = useRef<(() => void) | null>(null);

  // Синхронизируем refs с состоянием
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Сохранение громкости в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_volume', String(volume));
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_muted', String(isMuted));
    }
  }, [isMuted]);

  // Синхронизация громкости с аудиоэлементом (без пересоздания)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // --- Плавная анимация прогресса (60fps) ---
  const updateProgressSmooth = useCallback(() => {
    if (!audioRef.current || isSeekingRef.current || !animationActiveRef.current) {
      return;
    }

    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      const currentTime = audio.currentTime;
      
      if (Math.abs(currentTime - lastProgressRef.current) > 0.01) {
        setProgress(currentTime);
        lastProgressRef.current = currentTime;
      }
    }

    if (!audio.paused && !audio.ended) {
      rafIdRef.current = requestAnimationFrame(updateProgressSmoothRef.current!);
    } else {
      animationActiveRef.current = false;
      rafIdRef.current = null;
    }
  }, []);

  // Сохраняем функцию в ref после её создания
  useEffect(() => {
    updateProgressSmoothRef.current = updateProgressSmooth;
  }, [updateProgressSmooth]);

  const startSmoothProgress = useCallback(() => {
    if (!audioRef.current) return;
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (!audioRef.current.paused && !audioRef.current.ended) {
      animationActiveRef.current = true;
      rafIdRef.current = requestAnimationFrame(updateProgressSmoothRef.current!);
    }
  }, []);

  const stopSmoothProgress = useCallback(() => {
    animationActiveRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // --- Управление громкостью ---
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolumeRef.current);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, setVolume]);

  // --- Безопасный play ---
  const safePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      startSmoothProgress();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Playback interrupted');
      } else {
        console.error('Playback error:', error);
      }
    }
  }, [startSmoothProgress]);

  // --- Переключение треков ---
  const nextTrack = useCallback(() => {
    const currentQ = queueRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentQ.length === 0 || currentIdx + 1 >= currentQ.length) {
      setIsPlaying(false);
      stopSmoothProgress();
      return;
    }
    
    const nextIdx = currentIdx + 1;
    const next = currentQ[nextIdx];
    
    setCurrentIndex(nextIdx);
    setCurrentTrack(next);
    
    if (audioRef.current) {
      audioRef.current.src = next.src;
      audioRef.current.load();
      safePlay();
      setIsPlaying(true);
    }
  }, [safePlay, stopSmoothProgress]);

  const prevTrack = useCallback(() => {
    const currentQ = queueRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentQ.length === 0 || currentIdx - 1 < 0) return;
    
    const prevIdx = currentIdx - 1;
    const prev = currentQ[prevIdx];
    
    setCurrentIndex(prevIdx);
    setCurrentTrack(prev);
    
    if (audioRef.current) {
      audioRef.current.src = prev.src;
      audioRef.current.load();
      safePlay();
      setIsPlaying(true);
    }
  }, [safePlay]);

  // --- Воспроизведение трека ---
  const playTrack = useCallback((track: Track, playlist?: Track[]) => {
    if (playlist) {
      setQueue(playlist);
      const index = playlist.findIndex(t => t.id === track.id);
      setCurrentIndex(index);
      queueRef.current = playlist;
      currentIndexRef.current = index;
    }

    if (currentTrack?.id === track.id && audioRef.current) {
      safePlay();
      setIsPlaying(true);
      return;
    }

    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.load();
      safePlay();
      setIsPlaying(true);
    }
  }, [currentTrack?.id, safePlay]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopSmoothProgress();
    } else {
      safePlay();
      setIsPlaying(true);
    }
  }, [isPlaying, safePlay, stopSmoothProgress]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current || isNaN(time)) return;
    
    isSeekingRef.current = true;
    audioRef.current.currentTime = time;
    setProgress(time);
    lastProgressRef.current = time;
    
    if (audioRef.current.paused) {
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
      return;
    }
    
    stopSmoothProgress();
    
    setTimeout(() => {
      isSeekingRef.current = false;
      if (audioRef.current && !audioRef.current.paused) {
        startSmoothProgress();
      }
    }, 50);
  }, [stopSmoothProgress, startSmoothProgress]);

  // --- ИНИЦИАЛИЗАЦИЯ AUDIO ---
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.preload = "auto";
    audio.volume = volume;

    const onDurationChange = () => {
      if (audioRef.current && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    };
    
    const onEnded = () => {
      const currentQ = queueRef.current;
      const currentIdx = currentIndexRef.current;
      
      if (currentQ.length > 0 && currentIdx + 1 < currentQ.length) {
        nextTrack();
      } else {
        setIsPlaying(false);
        setProgress(0);
        lastProgressRef.current = 0;
        stopSmoothProgress();
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      startSmoothProgress();
    };
    
    const onPause = () => {
      setIsPlaying(false);
      stopSmoothProgress();
    };
    
    const onError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      stopSmoothProgress();
    };

    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      stopSmoothProgress();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextTrack, startSmoothProgress, stopSmoothProgress]);

  const value = useMemo<PlayerContextType>(
    () => ({
      currentTrack,
      isPlaying,
      duration,
      volume,
      isMuted,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      seekTo,
      setVolume,
      toggleMute,
    }),
    [
      currentTrack,
      isPlaying,
      duration,
      volume,
      isMuted,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      seekTo,
      setVolume,
      toggleMute,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      <PlayerProgressContext.Provider value={progress}>
        {children}
      </PlayerProgressContext.Provider>
    </PlayerContext.Provider>
  );
};