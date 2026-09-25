// POST { device_id, device_secret, name, phone, email?, model?, platform? }
// Records an access request and emails the owner one-time APPROVE / REJECT links.
import { CORS, json, env, db, sha256, safeEqual, randomToken, esc, clean, UUID_RE } from '../_shared.ts';

const LINK_HOURS = 48;
const MAX_PENDING = 50; // simple spam guard

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const deviceId = String(b.device_id || '');
    const secret = String(b.device_secret || '');
    const name = clean(b.name, 80);
    const phone = clean(b.phone, 20).replace(/[^\d+]/g, '');
    const email = clean(b.email, 120);
    const model = clean(b.model, 80);
    const platform = clean(b.platform, 40);

    if (!UUID_RE.test(deviceId) || secret.length < 32) return json({ error: 'Invalid device.' }, 400);
    if (name.length < 2) return json({ error: 'Please enter your name.' }, 400);
    if (!/^\+?\d{10,15}$/.test(phone)) return json({ error: 'Please enter a valid phone number (10 digits, or with country code).' }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'That email address does not look right.' }, 400);

    const sb = db();
    const secretHash = await sha256(secret);

    const { data: existing, error: e1 } = await sb.from('devices').select('*').eq('device_id', deviceId).maybeSingle();
    if (e1) throw e1;
    if (existing) {
      if (!safeEqual(existing.secret_hash, secretHash)) return json({ error: 'Invalid device.' }, 403);
      // Already known: never re-open a rejected/revoked device from the phone side.
      return json({ status: existing.status === 'approved' ? 'approved' : existing.status });
    }

    const { count, error: e2 } = await sb.from('devices').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    if (e2) throw e2;
    if ((count ?? 0) >= MAX_PENDING) return json({ error: 'Too many pending requests. Please try again later.' }, 429);

    const { data: row, error: e3 } = await sb.from('devices').insert({
      device_id: deviceId, secret_hash: secretHash, name, phone, email: email || null, model: model || null,
      platform: platform || null, status: 'pending',
    }).select('*').single();
    if (e3) throw e3;

    const approveTok = randomToken();
    const rejectTok = randomToken();
    const expires = new Date(Date.now() + LINK_HOURS * 3600 * 1000).toISOString();
    const { error: e4 } = await sb.from('action_tokens').insert([
      { token_hash: await sha256(approveTok), device_row: row.id, action: 'approve', expires_at: expires },
      { token_hash: await sha256(rejectTok), device_row: row.id, action: 'reject', expires_at: expires },
    ]);
    if (e4) throw e4;

    const page = env('APPROVE_PAGE_URL');
    const when = new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    const btn = (href: string, label: string, bg: string) =>
      `<a href="${esc(href)}" style="display:inline-block;padding:12px 26px;margin:0 6px 8px 0;border-radius:8px;background:${bg};color:#ffffff;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;font-size:15px">${label}</a>`;
    const rowHtml = (k: string, v: string) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#64707d;font-size:14px">${k}</td><td style="padding:6px 0;font-size:14px;font-weight:600">${esc(v || '—')}</td></tr>`;
    const html = `
      <div style="font-family:Arial,sans-serif;color:#1c2430;max-width:520px">
        <h2 style="margin:0 0 4px;font-size:19px">New access request — CPWD Rate Finder</h2>
        <p style="margin:0 0 16px;color:#64707d;font-size:14px">Someone installed the app and is asking to use it.</p>
        <table style="border-collapse:collapse;margin-bottom:18px">
          ${rowHtml('Name', name)}${rowHtml('Phone', phone)}${rowHtml('Email', email)}
          ${rowHtml('Device', model)}${rowHtml('System', platform)}${rowHtml('Requested', when + ' IST')}
        </table>
        ${btn(`${page}?a=approve&t=${approveTok}`, 'APPROVE', '#0f6e4f')}
        ${btn(`${page}?a=reject&t=${rejectTok}`, 'REJECT', '#b3261e')}
        <p style="margin:14px 0 0;color:#64707d;font-size:12.5px">Each button opens a confirmation page. The links work once and expire in ${LINK_HOURS} hours.
        You can also approve, reject or revoke any phone later from the Admin screen in the app.</p>
      </div>`;

    // The request is already saved; if the email fails it still shows in the Admin screen.
    try {
      const r = await fetch(Deno.env.get('RESEND_API_URL') || 'https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('EMAIL_FROM') || 'CPWD Rate Finder <onboarding@resend.dev>',
          to: [env('OWNER_EMAIL')],
          subject: `Access request: ${name} (${model || 'phone'})`,
          html,
        }),
      });
      if (!r.ok) console.error('Resend error', r.status, await r.text());
    } catch (mailErr) {
      console.error('Email not sent', mailErr);
    }

    return json({ status: 'pending' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Server error. Please try again.' }, 500);
  }
});
