/**
 * gen-og.mjs — generates public/og.png using node-canvas
 * Run: node scripts/gen-og.mjs
 * Requires: npm install -D canvas
 */
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../public/og.png");

const W = 1200, H = 630;
const cv = createCanvas(W, H);
const x = cv.getContext("2d");

/* ── background ── */
x.fillStyle = "#080d18";
x.fillRect(0, 0, W, H);

/* ── subtle vignette ── */
const vig = x.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 900);
vig.addColorStop(0, "rgba(12,22,44,0)");
vig.addColorStop(1, "rgba(4,8,16,0.55)");
x.fillStyle = vig;
x.fillRect(0, 0, W, H);

/* ── left accent bar ── */
const bar = x.createLinearGradient(0, 0, 0, H);
bar.addColorStop(0, "#3b82f6");
bar.addColorStop(1, "#1e3a6e");
x.fillStyle = bar;
x.fillRect(0, 0, 5, H);

/* ── helpers ── */
const SERIF = "Georgia, serif";
const MONO = "monospace";
const SANS = "Arial, sans-serif";

function roundRect(ctx, rx, ry, rw, rh, r) {
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + r, r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.arcTo(rx + rw, ry + rh, rx + rw - r, ry + rh, r);
    ctx.lineTo(rx + r, ry + rh);
    ctx.arcTo(rx, ry + rh, rx, ry + rh - r, r);
    ctx.lineTo(rx, ry + r);
    ctx.arcTo(rx, ry, rx + r, ry, r);
    ctx.closePath();
}

/* ═══════════════════════════════════
   LEFT SIDE — headline block
═══════════════════════════════════ */

const LX = 64;

/* Logo wordmark */
x.font = `300 17px ${SERIF}`;
x.fillStyle = "rgba(255,255,255,0.30)";
x.fillText("Know", LX, 58);
const w1 = x.measureText("Know").width;
x.font = `italic 600 17px ${SERIF}`;
x.fillStyle = "#3b82f6";
x.fillText("Your", LX + w1 + 1, 58);
const w2 = x.measureText("Your").width;
x.font = `italic 700 17px ${SERIF}`;
x.fillStyle = "rgba(255,255,255,0.85)";
x.fillText("Pay", LX + w1 + w2 + 2, 58);

/* Eyebrow label */
x.font = `600 11px ${MONO}`;
x.fillStyle = "rgba(96,165,250,0.6)";
x.letterSpacing = "3px";
x.fillText("SALARY ANALYSIS", LX, 130);
x.letterSpacing = "0px";

/* Headline line 1 — ultra-thin serif */
x.font = `300 72px ${SERIF}`;
x.fillStyle = "rgba(255,255,255,0.88)";
x.fillText("Find out what", LX, 218);

/* Headline line 2 — bold italic accent */
x.font = `italic bold 72px ${SERIF}`;
x.fillStyle = "#60a5fa";
x.fillText("you're worth.", LX, 308);

/* Divider */
x.strokeStyle = "rgba(59,130,246,0.35)";
x.lineWidth = 1.5;
x.beginPath();
x.moveTo(LX, 340);
x.lineTo(LX + 360, 340);
x.stroke();

/* Sub-copy */
x.font = `400 16px ${SANS}`;
x.fillStyle = "rgba(255,255,255,0.38)";
x.fillText("free  ·  3 minutes  ·  100% anonymous", LX, 374);

/* CTA button */
roundRect(x, LX, 404, 268, 48, 8);
x.fillStyle = "#1e56a0";
x.fill();
x.font = `bold 15px ${SANS}`;
x.fillStyle = "#ffffff";
x.fillText("Check what I'm worth  →", LX + 20, 433);

/* ✓ trust badges */
x.font = `400 12px ${SANS}`;
x.fillStyle = "rgba(255,255,255,0.32)";
["✓ Free forever", "✓ Anonymous", "✓ No signup spam"].forEach((t, i) => {
    x.fillText(t, LX + i * 140, 478);
});

/* Bottom URL */
x.font = `500 13px ${MONO}`;
x.fillStyle = "rgba(255,255,255,0.18)";
x.fillText("knowyourpay.in", LX, 598);

/* ═══════════════════════════════════
   RIGHT SIDE — mini UI card
═══════════════════════════════════ */

const CX = 690, CY = 60, CW = 450, CH = 510;

/* Card shadow */
x.shadowColor = "rgba(0,0,0,0.6)";
x.shadowBlur = 60;
x.shadowOffsetY = 20;
roundRect(x, CX, CY, CW, CH, 14);
x.fillStyle = "#0d1525";
x.fill();
x.shadowBlur = 0; x.shadowOffsetY = 0;

/* Card border */
roundRect(x, CX, CY, CW, CH, 14);
x.strokeStyle = "rgba(255,255,255,0.09)";
x.lineWidth = 1;
x.stroke();

/* ── Card header ── */
x.font = `700 8px ${MONO}`;
x.fillStyle = "rgba(255,255,255,0.25)";
x.letterSpacing = "2px";
x.fillText("YOUR VERDICT", CX + 22, CY + 30);
x.letterSpacing = "0px";

x.font = `300 19px ${SERIF}`;
x.fillStyle = "rgba(255,255,255,0.80)";
x.fillText("You're underpaid by", CX + 22, CY + 60);
x.font = `italic bold 19px ${SERIF}`;
x.fillStyle = "#f87171";
x.fillText("₹6–8L this year.", CX + 22, CY + 86);

/* UNDERPAID pill badge */
roundRect(x, CX + 340, CY + 20, 88, 22, 4);
x.fillStyle = "#450a0a";
x.fill();
x.font = `bold 9px ${SANS}`;
x.fillStyle = "#f87171";
x.fillText("UNDERPAID", CX + 355, CY + 35);

/* section divider */
x.strokeStyle = "rgba(255,255,255,0.07)";
x.lineWidth = 1;
x.beginPath();
x.moveTo(CX, CY + 105);
x.lineTo(CX + CW, CY + 105);
x.stroke();

/* ── Bar chart ── */
x.font = `700 8px ${MONO}`;
x.fillStyle = "rgba(255,255,255,0.2)";
x.letterSpacing = "1px";
x.fillText("MARKET RANGE  ·  SR. PM  ·  BENGALURU", CX + 22, CY + 125);
x.letterSpacing = "0px";

const bars = [
    { pct: 32, val: "₹18L", lbl: "Low", isYou: false },
    { pct: 55, val: "₹28L", lbl: "Avg", isYou: false },
    { pct: 42, val: "₹22L", lbl: "YOU", isYou: true },
    { pct: 75, val: "₹38L", lbl: "Strong", isYou: false },
    { pct: 100, val: "₹52L", lbl: "Top", isYou: false },
];

const barAreaTop = CY + 140;
const barAreaH = 140;
const barW = 62, barGap = 18;
const totalBarW = bars.length * barW + (bars.length - 1) * barGap;
const barX0 = CX + (CW - totalBarW) / 2;

bars.forEach((b, i) => {
    const bx = barX0 + i * (barW + barGap);
    const bh = Math.round((b.pct / 100) * barAreaH);
    const by = barAreaTop + barAreaH - bh;

    /* bar fill */
    const grad = x.createLinearGradient(0, by, 0, by + bh);
    if (b.isYou) {
        grad.addColorStop(0, "#fca5a5");
        grad.addColorStop(1, "#dc2626");
    } else {
        grad.addColorStop(0, "rgba(147,197,253,0.55)");
        grad.addColorStop(1, "rgba(147,197,253,0.15)");
    }
    roundRect(x, bx, by, barW, bh, 4);
    x.fillStyle = grad;
    x.fill();

    /* value label */
    x.font = `${b.isYou ? "700" : "600"} 10px ${MONO}`;
    x.fillStyle = b.isYou ? "#fff" : "rgba(255,255,255,0.38)";
    x.textAlign = "center";
    x.fillText(b.val, bx + barW / 2, by - 5);

    /* name label */
    x.font = `${b.isYou ? "800" : "600"} 9px ${SANS}`;
    x.fillStyle = b.isYou ? "#fff" : "rgba(255,255,255,0.22)";
    x.fillText(b.lbl, bx + barW / 2, barAreaTop + barAreaH + 16);
    x.textAlign = "left";
});

/* section divider */
x.strokeStyle = "rgba(255,255,255,0.07)";
x.lineWidth = 1;
x.beginPath();
x.moveTo(CX, barAreaTop + barAreaH + 32);
x.lineTo(CX + CW, barAreaTop + barAreaH + 32);
x.stroke();

/* ── Gameplan boxes ── */
const gpTop = barAreaTop + barAreaH + 44;
const gpData = [
    { val: "₹34L", lbl: "Ask for", col: "#60a5fa" },
    { val: "₹30L", lbl: "Aim for", col: "#34d399" },
    { val: "₹26L", lbl: "Walk away", col: "#f87171" },
];
const gpW = 118, gpH = 62, gpGap = 16;
const gpX0 = CX + (CW - (3 * gpW + 2 * gpGap)) / 2;
gpData.forEach((g, i) => {
    const gx = gpX0 + i * (gpW + gpGap);
    roundRect(x, gx, gpTop, gpW, gpH, 8);
    x.fillStyle = "rgba(255,255,255,0.04)";
    x.fill();
    x.strokeStyle = "rgba(255,255,255,0.08)";
    x.lineWidth = 1;
    x.stroke();

    x.font = `700 20px ${MONO}`;
    x.fillStyle = g.col;
    x.textAlign = "center";
    x.fillText(g.val, gx + gpW / 2, gpTop + 30);

    x.font = `700 8px ${SANS}`;
    x.fillStyle = "rgba(255,255,255,0.25)";
    x.fillText(g.lbl.toUpperCase(), gx + gpW / 2, gpTop + 50);
    x.textAlign = "left";
});

/* ─ write file ─ */
const buf = cv.toBuffer("image/png");
writeFileSync(OUT, buf);
console.log("✓ OG image written to", OUT);
