// Loads the four bundled dashboard functions into one Deno server on :8001, routed by path.
const realServe = Deno.serve.bind(Deno);
const handlers: Record<string, (r: Request) => Response | Promise<Response>> = {};
let current = '';
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (h: any) => { handlers[current] = h; return {}; };
for (const fn of ['device-request', 'device-status', 'email-action', 'admin']) {
  current = fn;
  await import(`${Deno.env.get('REPO')}/supabase/dashboard/${fn}.ts`);
}
realServe({ port: 8001 }, (req) => {
  const name = new URL(req.url).pathname.split('/').filter(Boolean).pop()!;
  const h = handlers[name];
  return h ? h(req) : new Response('no fn', { status: 404 });
});
