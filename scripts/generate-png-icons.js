import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(width, height, drawFn) {
  // 8-byte signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace 0

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image scanlines
  // Each line has 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon rendering functions
function getIconPixel(x, y, size, isMaskable = false) {
  // Normalize coordinates 0..1
  const nx = x / size;
  const ny = y / size;

  // Background gradient: from #0077ed (0, 119, 237) to #005bb5 (0, 91, 181)
  const bgR = 0;
  const bgG = Math.round(119 - ny * 28);
  const bgB = Math.round(237 - ny * 56);

  if (!isMaskable) {
    // Rounded squircle corner check (corner radius ~ 22%)
    const cr = 0.22;
    const dx = nx < cr ? cr - nx : nx > 1 - cr ? nx - (1 - cr) : 0;
    const dy = ny < cr ? cr - ny : ny > 1 - cr ? ny - (1 - cr) : 0;
    if (dx > 0 && dy > 0 && Math.hypot(dx, dy) > cr) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Draw 3D-isometric package in center (scale 0.58)
  const cx = 0.5;
  const cy = 0.5;
  const px = (nx - cx) * 2;
  const py = (ny - cy) * 2;

  // Isometric cube geometry:
  // Top face: rhombus
  // py < -0.1, |px| < 0.6, etc.
  // Isometric projection:
  // X axis: [0.707, 0.4]
  // Y axis: [-0.707, 0.4]
  // Z axis: [0, -0.8]
  
  // Package geometry:
  const isTop = py < 0 && Math.abs(px) * 0.55 + Math.abs(py + 0.3) < 0.45;
  const isLeft = px <= 0 && px > -0.55 && py >= -0.3 + px * 0.45 && py <= 0.45 + px * 0.45;
  const isRight = px > 0 && px < 0.55 && py >= -0.3 - px * 0.45 && py <= 0.45 - px * 0.45;

  if (isTop) {
    // Tape on top
    const isTape = Math.abs(px * 0.8 + py * 1.2) < 0.08 || Math.abs(px) < 0.06;
    if (isTape) {
      return [0, 113, 227, 255]; // Blue tape #0071e3
    }
    return [255, 255, 255, 255]; // Top face white
  }

  if (isLeft) {
    // Left side slight shadow
    return [226, 237, 250, 255];
  }

  if (isRight) {
    // Right side deeper shadow
    // Check for small green badge on right side:
    const bdx = px - 0.32;
    const bdy = py - 0.2;
    if (Math.hypot(bdx, bdy) < 0.1) {
      return [52, 199, 89, 255]; // Apple Emerald green
    }
    return [199, 222, 250, 255];
  }

  // Shadow under package
  const sdx = px;
  const sdy = (py - 0.55) * 2.5;
  if (Math.hypot(sdx, sdy) < 0.5) {
    return [
      Math.max(0, bgR - 15),
      Math.max(0, bgG - 25),
      Math.max(0, bgB - 35),
      255
    ];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
console.log('Generating PWA icons...');

const icon192 = generatePng(192, 192, (x, y, s) => getIconPixel(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = generatePng(512, 512, (x, y, s) => getIconPixel(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = generatePng(512, 512, (x, y, s) => getIconPixel(x, y, s, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleTouch = generatePng(180, 180, (x, y, s) => getIconPixel(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Also generate a small 64x64 favicon
const faviconPng = generatePng(64, 64, (x, y, s) => getIconPixel(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconPng);

console.log('All icons generated successfully!');
