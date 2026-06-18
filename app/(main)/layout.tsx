"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Disc, Heart, Search } from "lucide-react";
import MiniPlayer from "@/app/components/MiniPlayer";

const navItems = [
  { name: "Поиск", href: "/search", icon: Search },
  { name: "Главная", href: "/", icon: Home },
  {
    name: "Плейлисты",
    href: "/playlists",
    icon: Library,
    activePatterns: ["/playlist/"],
  },
  { name: "Альбомы", href: "/albums", icon: Disc, activePatterns: ["/album/"] },
  { name: "Избранное", href: "/favorites", icon: Heart },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Функция для проверки, активен ли пункт меню
  const isActive = (item: (typeof navItems)[0]) => {
    if (item.href === pathname) return true;
    if (item.activePatterns) {
      return item.activePatterns.some((pattern) =>
        pathname?.startsWith(pattern),
      );
    }
    return false;
  };

  return (
    <div className="flex min-h-screen bg-[#FDF2F8]">
      {/* Фиксированный сайдбар */}
      <aside className="fixed left-0 top-0 h-full w-72 p-6 border-r border-gray-200/30 bg-[#FDF2F8] flex flex-col">
        {/* Логотип Party */}
        <Link href="/" className="block px-2 mb-10 group">
          <span className="text-5xl font-black tracking-wide bg-linear-to-r from-pink-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md transition-all duration-500 group-hover:scale-105 group-hover:from-pink-500 group-hover:to-pink-500">
            Party
          </span>
          <p className="text-[11px] font-medium text-pink-400/80 tracking-wider mt-1 ml-0.5">
            music streaming
          </p>
        </Link>

        {/* Навигация */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    active
                      ? "bg-white/50 text-pink-600 shadow-sm"
                      : "text-gray-600 hover:bg-white/30 hover:text-pink-500"
                  }
                `}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                <span
                  className={`font-medium ${active ? "font-semibold" : ""}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Контент */}
      <main className="flex-1 ml-72 p-6">{children}</main>
      <MiniPlayer />
    </div>
  );
}
