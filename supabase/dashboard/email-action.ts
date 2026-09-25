// POST { t, op: 'peek' | 'confirm' }
// Backs the confirmation page opened from the APPROVE / REJECT email buttons.
// 'peek' shows who is asking (does not use the link). 'confirm' carries out the
// action and burns BOTH links for that request, so each link works only once.

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
  const key = Deno.env.get('SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error('Missing server setting: SUPABASE_SERVICE_ROLE_KEY');
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
    const t = String(b.t || '');
    const op = b.op === 'confirm' ? 'confirm' : 'peek';
    if (t.length < 20) return json({ error: 'This link is not valid.' }, 400);

    const sb = db();
    const { data: tok, error } = await sb.from('action_tokens').select('*').eq('token_hash', await sha256(t)).maybeSingle();
    if (error) throw error;
    if (!tok) return json({ error: 'This link is not valid.' }, 404);
    if (tok.used_at) return json({ error: 'This link has already been used.' }, 410);
    if (new Date(tok.expires_at).getTime() < Date.now()) return json({ error: 'This link has expired (links last 48 hours). Use the Admin screen in the app instead.' }, 410);

    const { data: d, error: e2 } = await sb.from('devices').select('*').eq('id', tok.device_row).single();
    if (e2) throw e2;

    if (op === 'peek') return json({ action: tok.action, device: publicDevice(d) });

    // Burn both links for this request (only if still unused — prevents double use).
    const { data: burned, error: e3 } = await sb.from('action_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('device_row', d.id).is('used_at', null).select('token_hash');
    if (e3) throw e3;
    if (!burned || !burned.some((x: { token_hash: string }) => x.token_hash === tok.token_hash)) {
      return json({ error: 'This link has already been used.' }, 410);
    }

    if (d.status !== 'pending') {
      return json({ action: tok.action, result: 'already_decided', device: publicDevice(d) });
    }
    const newStatus = tok.action === 'approve' ? 'approved' : 'rejected';
    const { data: upd, error: e4 } = await sb.from('devices')
      .update({ status: newStatus, token_hash: null, decided_at: new Date().toISOString(), decided_via: 'email' })
      .eq('id', d.id).select('*').single();
    if (e4) throw e4;
    return json({ action: tok.action, result: 'done', device: publicDevice(upd) });
  } catch (err) {
    console.error(err);
    return json({ error: 'Server error. Please try again.' }, 500);
  }
});
