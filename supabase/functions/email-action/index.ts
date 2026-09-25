// POST { t, op: 'peek' | 'confirm' }
// Backs the confirmation page opened from the APPROVE / REJECT email buttons.
// 'peek' shows who is asking (does not use the link). 'confirm' carries out the
// action and burns BOTH links for that request, so each link works only once.
import { CORS, json, db, sha256, publicDevice } from '../_shared.ts';

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
