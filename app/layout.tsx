import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "./contexts/PlayerContext";
import { AuthProvider } from "./contexts/AuthContext";

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
          <PlayerProvider>{children}</PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
