// POST { device_id, device_secret, token? }
// Tells the app whether this phone may be used. On first check after approval it
// issues the access token (returned once) plus the key that unlocks the rate data.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing server setting: ${name}`);
  return v;
}

function db() {
  // Newer Supabase projects provide SUPABASE_SECRET_KEYS (a JSON map of sb_secret_ keys);
  // older ones provide SUPABASE_SERVICE_ROLE_KEY. Either bypasses RLS.
  let key = Deno.env.get('SERVICE_KEY') || '';
  if (!key) {
    try {
      const m = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
      key = (m.default || Object.values(m)[0] || '') as string;
    } catch { /* ignore */ }
  }
  if (!key) key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!key) throw new Error('Missing server setting: service key');
  return createClient(env('SUPABASE_URL'), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function randomToken(bytes = 32): string {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function clean(s: unknown, max: number): string {
  return String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function publicDevice(d: Record<string, unknown>) {
  return {
    id: d.id, device_id: d.device_id, name: d.name, phone: d.phone, email: d.email, model: d.model, platform: d.platform,
    status: d.status, created_at: d.created_at, decided_at: d.decided_at, decided_via: d.decided_via,
    last_seen: d.last_seen,
  };
}

// ---- function ----

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const deviceId = String(b.device_id || '');
    const secret = String(b.device_secret || '');
    const token = b.token ? String(b.token) : '';
    if (!UUID_RE.test(deviceId) || secret.length < 32) return json({ error: 'Invalid device.' }, 400);

    const sb = db();
    const { data: d, error } = await sb.from('devices').select('*').eq('device_id', deviceId).maybeSingle();
    if (error) throw error;
    if (!d) return json({ status: 'unknown' });
    if (!safeEqual(d.secret_hash, await sha256(secret))) return json({ status: 'locked' });

    await sb.from('devices').update({ last_seen: new Date().toISOString() }).eq('id', d.id);

    if (d.status !== 'approved') return json({ status: d.status });

    // Approved.
    if (!d.token_hash) {
      // First pick-up after (re-)approval: issue a fresh token.
      const fresh = randomToken();
      const { data: set, error: e2 } = await sb.from('devices').update({ token_hash: await sha256(fresh) })
        .eq('id', d.id).eq('status', 'approved').is('token_hash', null).select('id');
      if (e2) throw e2;
      if (!set || set.length === 0) return json({ status: 'locked' }); // lost a race with another check
      return json({ status: 'approved', token: fresh, data_key: env('DATA_KEY') });
    }
    if (token && safeEqual(d.token_hash, await sha256(token))) {
      return json({ status: 'approved', data_key: env('DATA_KEY') });
    }
    // A token was already issued but this request does not hold it.
    return json({ status: 'locked' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Server error. Please try again.' }, 500);
  }
});
