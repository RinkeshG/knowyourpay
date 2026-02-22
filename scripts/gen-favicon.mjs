/**
 * gen-favicon.mjs — generates favicon PNGs using node-canvas
 * Run: node scripts/gen-favicon.mjs
 */
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));

function makeFavicon(size) {
    const cv = createCanvas(size, size);
    const x = cv.getContext("2d");
    const pad = Math.round(size * 0.1);

    /* Dark rounded bg */
    const r = Math.round(size * 0.22);
    x.beginPath();
    x.moveTo(r, 0); x.lineTo(size - r, 0);
    x.arcTo(size, 0, size, r, r);
    x.lineTo(size, size - r);
    x.arcTo(size, size, size - r, size, r);
    x.lineTo(r, size);
    x.arcTo(0, size, 0, size - r, r);
    x.lineTo(0, r);
    x.arcTo(0, 0, r, 0, r);
    x.closePath();
    x.fillStyle = "#0a0f1a";
    x.fill();

    /* "K" letter in brand blue — large, centered */
    const fontSize = Math.round(size * 0.55);
    x.font = `italic bold ${fontSize}px Georgia, serif`;
    x.fillStyle = "#60a5fa";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("K", size / 2, size / 2 + Math.round(size * 0.02));

    return cv.toBuffer("image/png");
}

/* Generate all sizes */
writeFileSync(join(__dir, "../public/favicon-16.png"), makeFavicon(16));
writeFileSync(join(__dir, "../public/favicon-32.png"), makeFavicon(32));
writeFileSync(join(__dir, "../public/apple-touch-icon.png"), makeFavicon(180));

console.log("✓ Favicons generated: 16, 32, 180px");
