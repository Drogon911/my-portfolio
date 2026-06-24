"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassPage from "@/app/components/GlassPage";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { musicLibrary } from "@/app/data/musicLibrary";

const albums = musicLibrary.map(({ id, title, artist, cover }) => ({
  id,
  title,
  artist,
  cover,
  // Предрендеренная размытая обложка (64×64 + blur в sharp) — заменяет CSS blur-3xl в рантайме.
  // Генерируется один раз скриптом: node scripts/generate-blurred-covers.mjs
  coverBlur: cover.replace(/\/[^/]+\.jpg$/, "/cover-blur.jpg"),
}));

const albumVariants = (isMobile: boolean) => ({
  initial: (dir: number) => ({
    opacity: 0,
    x: isMobile ? 0 : dir === 1 ? 200 : -200,
    rotateY: isMobile ? 0 : dir === 1 ? -30 : 30,
    scale: isMobile ? 0.92 : 0.8,
  }),
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeInOut" as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: isMobile ? 0 : dir === 1 ? -200 : 200,
    rotateY: isMobile ? 0 : dir === 1 ? 30 : -30,
    scale: isMobile ? 0.92 : 0.8,
    transition: { duration: 0.25, ease: "easeInOut" as const },
  }),
});

export default function AlbumsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const isMobile = useIsMobile();
  const isHydrated = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("lastAlbumIndex");
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 0 && parsed < albums.length) {
        // Синхронизация из localStorage только после монтирования —
        // на сервере всегда индекс 0, иначе будет hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentIndex(parsed);
      }
    }
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem("lastAlbumIndex", currentIndex.toString());
  }, [currentIndex]);

  const nextAlbum = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % albums.length);
  };

  const prevAlbum = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + albums.length) % albums.length);
  };

  const currentAlbum = albums[currentIndex];
  const variants = useMemo(() => albumVariants(isMobile), [isMobile]);

  return (
    <GlassPage className="relative h-230 flex flex-col items-center justify-center overflow-hidden p-6">
      {/* Фон — предрендеренный blur (64×64 JPEG, CSS blur = 0).
          mode="sync" = кроссфейд: два лёгких слоя одновременно — теперь это почти бесплатно. */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentAlbum.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: "easeInOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <Image
            src={currentAlbum.coverBlur}
            alt=""
            fill
            aria-hidden
            className="object-cover saturate-150"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-bg-base/75" />
        </motion.div>
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative z-10 text-5xl md:text-7xl font-thin text-foreground mb-2 text-center tracking-tight"
      >
        Любимые альбомы
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="relative z-10 text-muted mb-12 text-center"
      >
        Листай пластинки → нажимай на обложку
      </motion.p>

      <div className="relative z-10 w-full max-w-md flex items-center justify-center gap-3 md:gap-0">
        <button
          onClick={prevAlbum}
          aria-label="Предыдущий альбом"
          className="shrink-0 md:absolute md:left-0 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/8 backdrop-blur-sm text-muted active:bg-white/20 transition-all duration-200 shadow-lg border border-white/10 hover:bg-white/15 hover:text-foreground hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className="cursor-grab active:cursor-grabbing will-change-transform"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) {
                setDirection(1);
                nextAlbum();
              } else if (info.offset.x > 50) {
                setDirection(-1);
                prevAlbum();
              }
            }}
          >
            <Link href={`/album/${currentAlbum.id}`} className="group block w-44 md:w-80">
              <div className="relative w-44 h-44 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-105">
                <Image
                  src={currentAlbum.cover}
                  alt={currentAlbum.title}
                  fill
                  className="object-cover pointer-events-none select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  sizes="(max-width: 768px) 176px, 320px"
                  priority
                />
              </div>
              <h2 className="text-xl font-semibold text-center mt-4 text-foreground line-clamp-2 break-all">
                {currentAlbum.title}
              </h2>
              <p className="text-muted text-sm text-center mt-1 truncate">{currentAlbum.artist}</p>
            </Link>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={nextAlbum}
          aria-label="Следующий альбом"
          className="shrink-0 md:absolute md:right-0 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/8 backdrop-blur-sm text-muted active:bg-white/20 transition-all duration-200 shadow-lg border border-white/10 hover:bg-white/15 hover:text-foreground hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 flex gap-3 mt-10">
        {albums.map((album, idx) => (
          <button
            key={album.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            aria-label={`Альбом ${album.title}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-accent" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </GlassPage>
  );
}
