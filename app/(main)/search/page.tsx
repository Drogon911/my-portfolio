import { Suspense } from "react";
import { getAllTracks } from "@/app/lib/db/catalog";
import GlassPage from "@/app/components/GlassPage";
import SearchContent from "./SearchContent";

export default async function SearchPage() {
  const allTracks = await getAllTracks();

  return (
    <Suspense fallback={<GlassPage className="min-h-screen w-full">{null}</GlassPage>}>
      <SearchContent allTracks={allTracks} />
    </Suspense>
  );
}
