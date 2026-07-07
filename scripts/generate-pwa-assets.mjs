import { mkdirSync, existsSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const splashDir = resolve(publicDir, "splash");
const srcAssetsDir = resolve(root, "src", "assets");

// Fonte: SVG do livro dourado (vetorial). Tile = cantos arredondados / fora transparente.
// Maskable = ouro preenchendo todo o quadrado (o Android aplica a própria máscara).
const tileSvg = readFileSync(resolve(publicDir, "logo.svg"));
const maskableSvg = readFileSync(resolve(publicDir, "logo-maskable.svg"));

// fundo claro (verde bem suave) usado só nas splash screens
const background = { r: 240, g: 253, b: 244, alpha: 1 };
const backgroundHex = "#f0fdf4";

if (!existsSync(splashDir)) {
  mkdirSync(splashDir, { recursive: true });
}

const renderPng = (svg, size) => sharp(svg).resize(size, size).png();

const ICONS = [
  { name: "icon-192.png", size: 192, svg: tileSvg },
  { name: "icon-512.png", size: 512, svg: tileSvg },
  { name: "icon-512-maskable.png", size: 512, svg: maskableSvg },
  { name: "apple-touch-icon-180.png", size: 180, svg: tileSvg },
  { name: "favicon-32.png", size: 32, svg: tileSvg },
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

const generateIcon = async ({ name, size, svg }) => {
  await renderPng(svg, size).toFile(resolve(publicDir, name));
  console.log(`icon ${name} (${size}x${size})`);
};

const generateSplash = async ([width, height]) => {
  const logoSize = Math.round(Math.min(width, height) * 0.35);
  const logo = await renderPng(tileSvg, logoSize).toBuffer();
  const left = Math.round((width - logoSize) / 2);
  const top = Math.round((height - logoSize) / 2);
  const fileName = `apple-splash-${width}x${height}.png`;
  await sharp({
    create: { width, height, channels: 4, background },
  })
    .composite([{ input: logo, top, left }])
    .png()
    .toFile(resolve(splashDir, fileName));
  console.log(`splash ${fileName}`);
};

const run = async () => {
  console.log(`Source: logo.svg / logo-maskable.svg`);
  console.log(`Splash background: ${backgroundHex}\n`);

  for (const icon of ICONS) {
    await generateIcon(icon);
  }

  // logo.png (usada como <img> dentro do app) a partir do tile
  const logoPng = resolve(publicDir, "logo.png");
  await renderPng(tileSvg, 512).toFile(logoPng);
  copyFileSync(logoPng, resolve(srcAssetsDir, "logo.png"));
  console.log("logo.png (public + src/assets)");

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
