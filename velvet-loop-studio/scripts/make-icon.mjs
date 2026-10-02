// Generates build/icon.png (512px) and build/icon.ico (PNG-in-ICO) with no dependencies.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const S = 512;
const px = new Uint8Array(S * S * 4);
const mix = (a, b, t) => a + (b - a) * t;

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    const nx = (x + 0.5) / S - 0.5, ny = (y + 0.5) / S - 0.5;
    // rounded square
    const r = 0.16, ax = Math.abs(nx) - (0.5 - r), ay = Math.abs(ny) - (0.5 - r);
    const d = Math.hypot(Math.max(ax, 0), Math.max(ay, 0)) + Math.min(Math.max(ax, ay), 0) - r;
    if (d > 0) continue;
    const g = Math.min(1, Math.hypot(nx, ny + 0.2) * 1.6);
    let R = mix(46, 10, g), G = mix(12, 8, g), B = mix(24, 12, g);
    // velvet ring
    const rr = Math.hypot(nx, ny);
    const ring = Math.abs(rr - 0.30);
    if (ring < 0.055) {
      const t = 1 - ring / 0.055;
      R = mix(R, 226, t); G = mix(G, 52, t); B = mix(B, 96, t);
    }
    // chrome pole
    if (Math.abs(nx) < 0.022 && Math.abs(ny) < 0.38) {
      const t = 0.5 + nx / 0.044;
      const v = 60 + 195 * Math.exp(-Math.pow((t - 0.35) / 0.18, 2));
      R = G = B = v;
    }
    px[i] = R; px[i + 1] = G; px[i + 2] = B; px[i + 3] = 255;
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  Buffer.from(px.buffer, y * S * 4, S * 4).copy(raw, y * (S * 4 + 1) + 1);
}
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
]);

// ICO container holding the 512px PNG (Vista+ supports PNG entries; 0 = 256+ px in the header).
const head = Buffer.alloc(22);
head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head[6] = 0; head[7] = 0; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);

mkdirSync('build', { recursive: true });
writeFileSync('build/icon.png', png);
writeFileSync('build/icon.ico', Buffer.concat([head, png]));
console.log('wrote build/icon.png, build/icon.ico');
