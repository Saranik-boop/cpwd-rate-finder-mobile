import crypto from 'node:crypto';
export const SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
export function sign(payload) {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const h = b({ alg: 'HS256', typ: 'JWT' }), p = b(payload);
  const s = crypto.createHmac('sha256', SECRET).update(h + '.' + p).digest('base64url');
  return `${h}.${p}.${s}`;
}
export const SERVICE = sign({ role: 'service_role', iss: 'test', exp: 9999999999 });
export const ANON = sign({ role: 'anon', iss: 'test', exp: 9999999999 });
