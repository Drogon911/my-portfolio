import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "./contexts/PlayerContext";

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
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
