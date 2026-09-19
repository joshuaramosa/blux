// Genera los íconos PWA a partir de public/img/logo.png
// Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "fs/promises";

const SRC = "public/img/logo.png";
const OUT = "public/icons";
const BRAND_BG = "#E4572E"; // theme color Blux

await mkdir(OUT, { recursive: true });

const base = sharp(SRC).flatten({ background: BRAND_BG });

const jobs = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

// Íconos normales: logo contenido
for (const { name, size } of jobs) {
  await base
    .clone()
    .resize(size, size, { fit: "contain", background: BRAND_BG })
    .png()
    .toFile(`${OUT}/${name}`);
  console.log(`✓ ${name}`);
}

// Maskable: logo más pequeño con margen de seguridad (zona segura ~80%)
{
  const size = 512;
  const inner = Math.round(size * 0.62);
  const logo = await base
    .clone()
    .resize(inner, inner, { fit: "contain", background: BRAND_BG })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`${OUT}/maskable-512.png`);
  console.log("✓ maskable-512.png");
}
