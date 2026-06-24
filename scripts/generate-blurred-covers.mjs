import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const albumsDir = path.join(publicDir, "albums");

// Album covers → cover-blur.jpg (used on /albums carousel page)
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

// Track covers → <name>-blur.jpg (used on /player page background)
// Finds all cover*.jpg files in album dirs, skips already-generated blur files.
const albumDirs = readdirSync(albumsDir).filter((d) =>
  statSync(path.join(albumsDir, d)).isDirectory()
);

for (const albumDir of albumDirs) {
  const dirPath = path.join(albumsDir, albumDir);
  const trackCovers = readdirSync(dirPath).filter(
    (f) => f.endsWith(".jpg") && !f.includes("-blur") && f !== "cover-blur.jpg"
  );

  for (const file of trackCovers) {
    const input = path.join(dirPath, file);
    const output = path.join(dirPath, file.replace(".jpg", "-blur.jpg"));

    await sharp(input)
      .resize(64, 64, { fit: "cover" })
      .blur(8)
      .jpeg({ quality: 80 })
      .toFile(output);

    console.log(`✓ /albums/${albumDir}/${file} → ${file.replace(".jpg", "-blur.jpg")}`);
  }
}

console.log("Done.");
