"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Disc, Heart } from "lucide-react";

const navItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Плейлисты", href: "/playlists", icon: Library, activePatterns: ["/playlist/"] },
  { name: "Альбомы", href: "/albums", icon: Disc, activePatterns: ["/album/"] },
  { name: "Избранное", href: "/favorites", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.href === pathname) return true;
    if (item.activePatterns) {
      return item.activePatterns.some((p) => pathname?.startsWith(p));
    }
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-base border-t border-white/10 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer min-w-11 min-h-11 justify-center
                ${active ? "text-white" : "text-muted hover:text-white"}`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span className={`text-[10px] font-medium ${active ? "text-white" : "text-muted"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
