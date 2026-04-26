"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const albums = [
  {
    id: 1,
    name: "EP 2010",
    artist: "Eskimo Callboy",
    cover: "/eskimo-callboy-ep-2010.jpg",
    accentColor: "from-pink-400 to-rose-500",
  },
  {
    id: 2,
    name: "Vegas",
    artist: "Eskimo Callboy",
    cover: "/vegas-cover.jpg",
    accentColor: "from-purple-500 to-indigo-600",
  },
  // сюда добавишь другие альбомы позже
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextAlbum = () => {
    setCurrentIndex((prev) => (prev + 1) % albums.length);
  };

  const prevAlbum = () => {
    setCurrentIndex((prev) => (prev - 1 + albums.length) % albums.length);
  };

  const currentAlbum = albums[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-violet-600 mb-2 text-center">
        Вечеринка уже идёт!!!
      </h1>
      <p className="text-gray-500 mb-12 text-center">
        Листай пластинки → нажимай на обложку
      </p>

      <div className="relative w-full max-w-md flex items-center justify-center">
        <button
          onClick={prevAlbum}
          className="absolute left-0 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-pink-300/40 backdrop-blur-md text-white text-xl hover:bg-pink-500/70 hover:scale-110 transition-all duration-200 shadow-md"
        >
          ◀
        </button>

        <Link href={`/player/${currentAlbum.id}`}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              if (info.offset.x < -50) nextAlbum();
              if (info.offset.x > 50) prevAlbum();
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, rotateY: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 30, scale: 0.8 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="cursor-pointer group"
              >
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={currentAlbum.cover}
                    alt={currentAlbum.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-bold text-center mt-4 bg-gradient-to-r bg-clip-text text-transparent from-pink-600 to-rose-600">
                  {currentAlbum.name}
                </h2>
                <p className="text-gray-600 text-center">{currentAlbum.artist}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Link>

        <button
          onClick={nextAlbum}
          className="absolute right-0 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-pink-300/40 backdrop-blur-md text-white text-xl hover:bg-pink-500/70 hover:scale-110 transition-all duration-200 shadow-md"
        >
          ▶
        </button>
      </div>

      <div className="flex gap-3 mt-10">
        {albums.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-pink-600" : "w-2 bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}