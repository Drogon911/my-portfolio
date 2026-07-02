import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "./contexts/PlayerContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

export const metadata: Metadata = {
  title: "Музыкальный сервис",
  description: "Слушай музыку с нами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <AuthProvider>
          <FavoritesProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
