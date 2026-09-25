// Owner-only. Header: Authorization: Bearer <owner's login token>
// POST { op: 'list' }                         -> all devices
// POST { op: 'approve'|'reject'|'revoke', id } -> change one device
import { CORS, json, env, db, publicDevice } from '../_shared.ts';

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
