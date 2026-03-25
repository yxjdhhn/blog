import { createHash } from 'node:crypto';

export function createProceduralLocalImageProvider() {
  return {
    name: 'procedural-local',
    async generateHeroImage(input) {
      const palette = derivePalette(input);
      const svg = buildSvg(input, palette);

      return {
        buffer: Buffer.from(svg),
        extension: '.svg',
        status: 'complete',
      };
    },
  };
}

function buildSvg(input, palette) {
  const ribbons = [
    ribbonPath(0.18, 0.28, 0.62, 0.1),
    ribbonPath(0.12, 0.6, 0.78, -0.08),
    ribbonPath(0.2, 0.82, 0.64, 0.06),
  ];

  const chipCount = Math.min(4, Math.max(2, (input.tags?.length ?? 0) || 2));
  const chips = Array.from({ length: chipCount }, (_, index) => {
    const x = 110 + index * 190;
    const width = 150 + (index % 2) * 16;
    return `<rect x="${x}" y="110" rx="24" ry="24" width="${width}" height="52" fill="${palette.chipFill}" />
<rect x="${x + 24}" y="128" rx="8" ry="8" width="${width - 48}" height="16" fill="${palette.chipAccent}" />`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
    <linearGradient id="orb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.orbStart}" />
      <stop offset="100%" stop-color="${palette.orbEnd}" />
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)" />
  <circle cx="1220" cy="220" r="220" fill="url(#orb)" opacity="0.82" />
  <circle cx="360" cy="760" r="310" fill="${palette.softOrb}" opacity="0.88" />
  <rect x="110" y="96" width="420" height="80" rx="32" fill="${palette.panelFill}" opacity="0.92" />
  ${chips}
  <rect x="110" y="654" width="640" height="118" rx="36" fill="${palette.panelFill}" opacity="0.9" />
  <rect x="144" y="690" width="320" height="22" rx="11" fill="${palette.panelAccent}" opacity="0.95" />
  <rect x="144" y="728" width="524" height="18" rx="9" fill="${palette.panelAccent}" opacity="0.52" />
  ${ribbons.map((path) => `<path d="${path}" stroke="${palette.ribbon}" stroke-width="26" stroke-linecap="round" opacity="0.58"/>`).join('\n')}
</svg>`;
}

function ribbonPath(startX, startY, endX, bend) {
  const scaleX = 1536;
  const scaleY = 1024;
  const x1 = startX * scaleX;
  const y1 = startY * scaleY;
  const x2 = (startX + 0.18) * scaleX;
  const y2 = (startY + bend) * scaleY;
  const x3 = (endX - 0.18) * scaleX;
  const y3 = (startY - bend) * scaleY;
  const x4 = endX * scaleX;
  const y4 = (startY + bend * 0.3) * scaleY;
  return `M ${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`;
}

function derivePalette(input) {
  const seed = [input.slug, input.category ?? '', ...(input.tags ?? [])].join('|');
  const hash = createHash('sha256').update(seed).digest();
  const primaryHue = hash[0] % 360;
  const secondaryHue = (primaryHue + 42 + (hash[1] % 48)) % 360;
  const accentHue = (primaryHue + 190 + (hash[2] % 40)) % 360;

  return {
    bgStart: hsl(primaryHue, 74, 55),
    bgEnd: hsl(secondaryHue, 63, 44),
    orbStart: hsl(accentHue, 72, 78),
    orbEnd: hsl((accentHue + 38) % 360, 74, 63),
    softOrb: hsl((primaryHue + 10) % 360, 68, 71),
    ribbon: `hsla(${accentHue} 95% 96% / 0.56)`,
    panelFill: `hsla(${(secondaryHue + 200) % 360} 42% 96% / 0.18)`,
    panelAccent: `hsla(${accentHue} 92% 97% / 0.72)`,
    chipFill: `hsla(${(primaryHue + 180) % 360} 46% 96% / 0.18)`,
    chipAccent: `hsla(${accentHue} 92% 98% / 0.76)`,
  };
}

function hsl(h, s, l) {
  return `hsl(${h} ${s}% ${l}%)`;
}
