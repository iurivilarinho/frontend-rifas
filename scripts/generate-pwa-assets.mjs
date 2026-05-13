import { mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const splashDir = resolve(publicDir, "splash");

const source = resolve(publicDir, "logo.png");
const background = { r: 240, g: 253, b: 244, alpha: 1 };
const backgroundHex = "#f0fdf4";

if (!existsSync(splashDir)) {
  mkdirSync(splashDir, { recursive: true });
}

const ICONS = [
  { name: "icon-192.png", size: 192, padding: 0.1 },
  { name: "icon-512.png", size: 512, padding: 0.1 },
  { name: "icon-512-maskable.png", size: 512, padding: 0.2 },
  { name: "apple-touch-icon-180.png", size: 180, padding: 0.1 },
  { name: "favicon-32.png", size: 32, padding: 0 },
];

const SPLASHES = [
  [2048, 2732], [2732, 2048],
  [1668, 2388], [2388, 1668],
  [1536, 2048], [2048, 1536],
  [1290, 2796], [2796, 1290],
  [1179, 2556], [2556, 1179],
  [1170, 2532], [2532, 1170],
  [1242, 2688], [2688, 1242],
  [828, 1792], [1792, 828],
  [1125, 2436], [2436, 1125],
  [750, 1334], [1334, 750],
];

const generateIcon = async ({ name, size, padding }) => {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round(size * padding);
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(resolve(publicDir, name));
  console.log(`icon ${name} (${size}x${size})`);
};

const generateSplash = async ([width, height]) => {
  const logoSize = Math.round(Math.min(width, height) * 0.35);
  const logo = await sharp(source)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const left = Math.round((width - logoSize) / 2);
  const top = Math.round((height - logoSize) / 2);
  const fileName = `apple-splash-${width}x${height}.png`;
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, top, left }])
    .png()
    .toFile(resolve(splashDir, fileName));
  console.log(`splash ${fileName}`);
};

const run = async () => {
  console.log(`Source: ${source}`);
  console.log(`Background: ${backgroundHex}\n`);
  for (const icon of ICONS) {
    await generateIcon(icon);
  }
  console.log("");
  for (const splash of SPLASHES) {
    await generateSplash(splash);
  }
  console.log("\nDone.");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
