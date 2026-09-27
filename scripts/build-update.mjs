// Publishes the current screens + rate data as a live update for the Android app.
// Output: docs/update/bundle-<version>.zip and docs/update/manifest.json (served by GitHub Pages).
// Installed apps check the manifest, download the zip, verify its SHA-256 and switch to it.
// Usage: node scripts/build-update.mjs "short note shown to users" [min_build]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const note = process.argv[2] || 'New rates and improvements';
const minBuild = Number(process.argv[3] || 0);
const verSrc = fs.readFileSync('www/version.js', 'utf8');
// optional 3rd argument publishes the bundle under a newer version number than www/version.js
const version = Number(process.argv[4] || (/APP_WEB_VERSION\s*=\s*(\d+)/.exec(verSrc) || [])[1]);
if (!version) throw new Error('www/version.js has no APP_WEB_VERSION');

// --- minimal ZIP writer (deflate) ---
const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function zip(files) {
  const parts = [], central = []; let offset = 0;
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    parts.push(local, nameBuf, comp);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10);
    cen.writeUInt32LE(0, 12); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cenBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cenBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cenBuf, end]);
}

const files = [];
(function walk(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name), r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(p, r);
    else if (r === 'version.js') files.push({ name: r, data: Buffer.from(fs.readFileSync(p, 'utf8').replace(/APP_WEB_VERSION\s*=\s*\d+/, 'APP_WEB_VERSION = ' + version)) });
    else files.push({ name: r, data: fs.readFileSync(p) });
  }
})('www', '');
const buf = zip(files);
const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
const OUT = 'docs/update';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^bundle-\d+\.zip$/.test(f)) fs.rmSync(path.join(OUT, f)); // keep only the latest
const zipName = `bundle-${version}.zip`;
fs.writeFileSync(path.join(OUT, zipName), buf);
const manifest = {
  web: {
    version, notes: note, sha256, min_build: minBuild,
    url: `https://saranik-boop.github.io/cpwd-rate-finder-mobile/update/${zipName}`,
    published: new Date().toISOString(),
  },
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`update bundle ${zipName}: ${files.length} files, ${(buf.length / 1048576).toFixed(2)} MB, sha256 ${sha256.slice(0, 12)}…`);
