import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

// Album covers from musicLibrary.ts
const albumCovers = [
  "/albums/album-1/eskimo-callboy-ep-2010.jpg",
  "/albums/album-2/vegas-cover.jpg",
  "/albums/album-3/take-to-the-skies.jpg",
  "/albums/album-4/error-error.jpg",
  "/albums/album-5/fcgacmaaigwtuc.jpg",
  "/albums/album-6/monofluid.jpg",
];

for (const coverPath of albumCovers) {
  const input = path.join(publicDir, coverPath);
  const output = path.join(publicDir, path.dirname(coverPath), "cover-blur.jpg");

  await sharp(input)
    .resize(64, 64, { fit: "cover" })
    .blur(8)
    .jpeg({ quality: 80 })
    .toFile(output);

  console.log(`✓ ${coverPath} → cover-blur.jpg`);
}

console.log("Done.");
