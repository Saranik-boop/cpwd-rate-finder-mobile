// Owner-only. Header: Authorization: Bearer <owner's login token>
// POST { op: 'list' }                         -> all devices
// POST { op: 'approve'|'reject'|'revoke', id } -> change one device

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
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'Please log in as the owner.' }, 401);

    const sb = db();
    const { data: u, error: ue } = await sb.auth.getUser(jwt);
    const owner = env('OWNER_EMAIL').trim().toLowerCase();
    if (ue || !u?.user || !u.user.email_confirmed_at || (u.user.email || '').toLowerCase() !== owner) {
      return json({ error: 'Only the owner can use this screen.' }, 403);
    }

    const b = await req.json().catch(() => ({}));
    const op = String(b.op || 'list');

    if (op === 'list') {
      const { data, error } = await sb.from('devices').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return json({ devices: (data || []).map(publicDevice) });
    }

    const map: Record<string, string> = { approve: 'approved', reject: 'rejected', revoke: 'revoked' };
    if (!map[op]) return json({ error: 'Unknown action.' }, 400);
    const id = String(b.id || '');
    if (!id) return json({ error: 'Missing device.' }, 400);

    // Any change clears the access token: an approved phone picks up a new one,
    // a revoked/rejected phone loses the one it had.
    const { data: upd, error } = await sb.from('devices')
      .update({ status: map[op], token_hash: null, decided_at: new Date().toISOString(), decided_via: 'admin' })
      .eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    if (!upd) return json({ error: 'Device not found.' }, 404);
    // Any unused email links for this request are now pointless — burn them.
    await sb.from('action_tokens').update({ used_at: new Date().toISOString() }).eq('device_row', id).is('used_at', null);
    return json({ device: publicDevice(upd) });
  } catch (err) {
    console.error(err);
    return json({ error: 'Server error. Please try again.' }, 500);
  }
});
