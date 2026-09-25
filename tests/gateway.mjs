// Stand-in for Supabase: static files, /rest/v1 -> PostgREST, /functions/v1 -> Deno,
// /auth/v1 -> tiny fake auth (codes written to emails.log), /resend -> captures emails.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { sign } from './keys.mjs';
const REPO = process.env.REPO || process.cwd();
const ROOTS = { '/app/': REPO + '/www', '/docs/': REPO + '/docs' };
const LOG = process.env.EMAIL_LOG || 'emails.log';
const MIME = { '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.enc': 'application/octet-stream', '.json': 'application/json' };
const codes = {}; const users = {};
function body(req) { return new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(Buffer.concat(c))); }); }
function proxy(req, res, port, p, buf) {
  const pr = http.request({ host: '127.0.0.1', port, path: p, method: req.method, headers: { ...req.headers, host: '127.0.0.1' } }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  pr.on('error', (e) => { res.writeHead(502); res.end(String(e)); });
  pr.end(buf);
}
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const buf = await body(req);
  if (u.pathname.endsWith('/config.js')) {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    return res.end(`window.APP_CONFIG = { SUPABASE_URL: 'http://127.0.0.1:8080', SUPABASE_KEY: '${fs.readFileSync(process.env.ANON_FILE || 'anon.txt','utf8').trim()}', MAX_OFFLINE_DAYS: 30 };`);
  }
  for (const [pre, dir] of Object.entries(ROOTS)) {
    if (u.pathname.startsWith(pre)) {
      let f = path.join(dir, u.pathname.slice(pre.length) || 'index.html');
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f));
    }
  }
  if (process.env.DOWN === '1' || fs.existsSync(process.env.DOWN_FLAG || '/tmp/server_down')) { res.writeHead(503); return res.end('{}'); }
  if (u.pathname.startsWith('/rest/v1')) return proxy(req, res, 3001, u.pathname.slice(8) + u.search, buf);
  if (u.pathname.startsWith('/functions/v1/')) return proxy(req, res, 8001, u.pathname + u.search, buf);
  if (u.pathname === '/resend') {
    fs.appendFileSync(LOG, buf.toString() + '\n');
    res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"id":"x"}');
  }
  if (u.pathname.startsWith('/auth/v1/')) {
    const j = buf.length ? JSON.parse(buf) : {};
    const send = (s, o) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    const op = u.pathname.slice(9);
    if (op === 'otp') { const c = String(Math.floor(100000 + Math.random() * 900000)); codes[j.email] = c; fs.appendFileSync(LOG, JSON.stringify({ otp: c, to: j.email }) + '\n'); return send(200, {}); }
    if (op === 'verify') {
      if (codes[j.email] !== j.token) return send(403, { msg: 'Token has expired or is invalid' });
      delete codes[j.email];
      const id = 'u-' + j.email; users[id] = j.email;
      const at = sign({ sub: id, email: j.email, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 });
      return send(200, { access_token: at, refresh_token: 'r-' + id, expires_in: 3600, user: { id, email: j.email } });
    }
    if (op === 'token') { const id = String(j.refresh_token || '').slice(2); if (!users[id]) return send(400, {}); return send(200, { access_token: sign({ sub: id, email: users[id], role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }), refresh_token: j.refresh_token, expires_in: 3600, user: { id, email: users[id] } }); }
    if (op === 'user') {
      const tok = (req.headers.authorization || '').replace('Bearer ', '');
      try { const p = JSON.parse(Buffer.from(tok.split('.')[1], 'base64url')); if (!users[p.sub]) throw 0; return send(200, { id: p.sub, email: p.email, email_confirmed_at: '2026-01-01T00:00:00Z', aud: 'authenticated', role: 'authenticated' }); }
      catch { return send(401, { msg: 'invalid JWT' }); }
    }
  }
  res.writeHead(404); res.end();
}).listen(8080, () => console.log('gateway :8080'));
