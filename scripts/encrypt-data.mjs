// Encrypts the rate data so it is unreadable inside the APK without the server-held key.
// Usage: node scripts/encrypt-data.mjs <items.json> <meta.json> <out.enc> [expl.json]   (key read from .secrets/DATA_KEY.txt)
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const [itemsPath, metaPath, outPath, explPath] = process.argv.slice(2);
const keyB64 = fs.readFileSync('.secrets/DATA_KEY.txt', 'utf8').trim();
const key = Buffer.from(keyB64, 'base64');
if (key.length !== 32) throw new Error('DATA_KEY must be 32 bytes');
const data = { items: JSON.parse(fs.readFileSync(itemsPath)), meta: JSON.parse(fs.readFileSync(metaPath)) };
if (explPath) data.expl = JSON.parse(fs.readFileSync(explPath));
const payload = JSON.stringify(data);
const gz = zlib.gzipSync(Buffer.from(payload), { level: 9 });
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]);
fs.writeFileSync(outPath, Buffer.concat([Buffer.from('CPWD1'), iv, body]));
console.log('plain', payload.length, 'gz', gz.length, 'enc', body.length + 17);
