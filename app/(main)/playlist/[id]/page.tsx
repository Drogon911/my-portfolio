import { notFound } from "next/navigation";
import { getAlbum } from "@/app/lib/db/catalog";
import PlaylistView from "./PlaylistView";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Пока плейлист — это релиз-заглушка; позже заменим на данные из таблицы playlists.
  const playlist = await getAlbum(Number(id));

  if (!playlist) notFound();

  return <PlaylistView playlist={playlist} />;
}
