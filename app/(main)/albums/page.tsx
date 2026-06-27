import { getAlbums } from "@/app/lib/db/catalog";
import AlbumsCarousel, { type CarouselAlbum } from "./AlbumsCarousel";

export default async function AlbumsPage() {
  const albums = await getAlbums();

  // Предрендеренная размытая обложка (64×64 + blur в sharp) — заменяет CSS blur-3xl
  // в рантайме. Генерируется скриптом: node scripts/generate-blurred-covers.mjs
  const carouselAlbums: CarouselAlbum[] = albums.map(
    ({ id, title, artist, cover }) => ({
      id,
      title,
      artist,
      cover,
      coverBlur: cover.replace(/\/[^/]+\.jpg$/, "/cover-blur.jpg"),
    }),
  );

  return <AlbumsCarousel albums={carouselAlbums} />;
}
