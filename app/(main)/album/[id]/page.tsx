import { notFound } from "next/navigation";
import { getAlbum } from "@/app/lib/db/catalog";
import AlbumView from "./AlbumView";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(Number(id));

  if (!album) notFound();

  return <AlbumView album={album} />;
}
