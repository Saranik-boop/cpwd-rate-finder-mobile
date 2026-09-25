// CI only: replaces the encrypted rate data with a small FAKE dataset encrypted with a throwaway
// key, so the cloud test can unlock the app without ever seeing the real key. Prints the key.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const items = [
  { id: 1, item_no: '13.2.1', description: '15 mm cement plaster on the rough side of single or half brick wall of mix : 1:4 (1 cement: 4 fine sand)', unit: 'sqm', rate: 399.45, category: 'Finishing', schedule: 'CPWD',
    breakdown: { components: [{ code: '3.4', description: 'Rate as per Item Number 3.4 of Sub Head: Mortars', quantity: 0.18, unit: 'cum', rate: 8000, amount: 1440 }],
      summary: [{ label: 'Total', amount: 399.45 }] } },
  { id: 2, item_no: '2.13.2.1', description: 'Excavating trenches of required width for pipes, cables, etc', unit: 'm', rate: 603.2, category: 'Earth Work', schedule: 'CPWD' },
  { id: 3, item_no: '14.32.1', description: 'Providing and fixing bright finished brass double acting spring hinges', unit: 'each', rate: 851.85, category: 'Repairs to Building', schedule: 'CPWD' },
];
const meta = { categories: ['Finishing', 'Earth Work', 'Repairs to Building'], schedules: ['CPWD'], schedule_counts: { CPWD: 3 }, count: 3 };
const key = crypto.randomBytes(32);
const gz = zlib.gzipSync(Buffer.from(JSON.stringify({ items, meta })));
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]);
const out = Buffer.concat([Buffer.from('CPWD1'), iv, body]);
for (const p of ['www/data.enc', 'docs/app/data.enc']) fs.writeFileSync(p, out);
process.stdout.write(key.toString('base64'));
