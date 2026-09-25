// POST { device_id, device_secret, token? }
// Tells the app whether this phone may be used. On first check after approval it
// issues the access token (returned once) plus the key that unlocks the rate data.
import { CORS, json, env, db, sha256, safeEqual, randomToken, UUID_RE } from '../_shared.ts';

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
