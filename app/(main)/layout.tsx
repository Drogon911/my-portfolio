"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Disc, Heart, Search } from "lucide-react";
import MiniPlayer from "@/app/components/MiniPlayer";
import BottomNav from "@/app/components/BottomNav";
import SidebarAccount from "@/app/components/SidebarAccount";

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
    <div className="flex min-h-screen bg-bg-base">
      {/* Сайдбар — только десктоп */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 p-6 border-r border-white/10 bg-bg-base flex-col">
        {/* Логотип Party */}
        <Link href="/" className="block px-2 mb-10 group">
          <span className="text-5xl font-black tracking-wide text-accent transition-all duration-500 group-hover:scale-105 group-hover:text-accent-hover">
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
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-muted hover:bg-white/5 hover:text-white"
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

        {/* Профиль / вход — низ сайдбара */}
        <SidebarAccount />
      </aside>

      {/* Контент */}
      <main className="flex-1 min-w-0 ml-0 md:ml-72 p-4 md:p-6 pb-32 md:pb-6 overflow-x-hidden">{children}</main>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}
