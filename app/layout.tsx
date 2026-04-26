import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Вечеринка уже идёт!!! | Музыкальный сервис",
  description:
    "Слушай альбомы Eskimo Callboy: EP 2010, Vegas и другие. Уникальный музыкальный сервис с анимациями и красивым дизайном.",
  generator: "Твой музыкальный сервис",
  openGraph: {
    title: "Вечеринка уже идёт!!!",
    description:
      "Музыкальный сервис с альбомами Eskimo Callboy. Качай треки, листай пластинки, наслаждайся качественным звуком.",
    url: "https://my-portfolio-delta-olive-73.vercel.app",
    siteName: "Музыкальный сервис",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Вечеринка уже идёт!!!",
    description: "Слушай Eskimo Callboy в уникальном плеере.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
