// Makes one self-contained file per function (the Supabase dashboard editor takes a single file).
import fs from 'node:fs';
const shared = fs.readFileSync('supabase/functions/_shared.ts', 'utf8')
  .replace(/^\/\/.*\n/gm, '').replace(/^export /gm, '');
fs.mkdirSync('supabase/dashboard', { recursive: true });
for (const fn of ['device-request', 'device-status', 'email-action', 'admin']) {
  const src = fs.readFileSync(`supabase/functions/${fn}/index.ts`, 'utf8')
    .replace(/^import \{[^}]*\} from '\.\.\/_shared\.ts';\n/m, '');
  const header = src.match(/^(\/\/.*\n)+/)[0];
  fs.writeFileSync(`supabase/dashboard/${fn}.ts`, header + '\n' + shared.trim() + '\n\n// ---- function ----\n' + src.slice(header.length));
}
console.log('bundled');
