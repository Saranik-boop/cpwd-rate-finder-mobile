"""End-to-end test of the locked app against the local stand-in server."""
import json, os, re, subprocess, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://127.0.0.1:8080')
APP = BASE + os.environ.get('APP_PATH', '/app/index.html')
LOG = os.environ.get('EMAIL_LOG', os.path.abspath('emails.log'))
OWNER = 'saranikbanerjee5805@gmail.com'
results = []
ENGINE = os.environ.get('ENGINE', 'chromium')
PW = None


def ok(name, cond, extra=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (('  -- ' + str(extra)) if extra and not cond else ''))


def psql(sql):
    return subprocess.run(['psql', '-h', os.environ.get('PGHOST', '/tmp'), '-p', os.environ.get('PGPORT', '5433'), '-U', 'postgres', '-tAc', sql], capture_output=True, text=True).stdout.strip()


def emails():
    out = []
    if os.path.exists(LOG):
        for line in open(LOG):
            try: out.append(json.loads(line))
            except Exception: pass
    return out


def links_for(name):
    for e in reversed(emails()):
        if 'html' in e and name in e['subject']:
            return dict(re.findall(r'\?a=(approve|reject)&amp;t=([A-Za-z0-9_-]+)', e['html']))
    return {}


def last_otp(to):
    for e in reversed(emails()):
        if e.get('otp') and e.get('to') == to: return e['otp']


def visible(page, sel):
    return page.locator(sel).is_visible()


def wait_screen(page, sel, t=15000):
    page.wait_for_selector(sel, state='visible', timeout=t)


def phone(browser):
    if ENGINE == 'webkit':
        ctx = browser.new_context(**PW.devices['iPhone 13'])
    else:
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.errors = []
    pg.on('pageerror', lambda e: pg.errors.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and pg.errors.append(m.text))
    if os.environ.get('VERBOSE'):
        pg.on('console', lambda m: print('  [console]', m.type, m.text))
        pg.on('pageerror', lambda e: print('  [pageerror]', e))
    return ctx, pg


def request(pg, name, ph, email=''):
    pg.goto(APP)
    wait_screen(pg, '#scrRequest')
    pg.fill('#reqName', name); pg.fill('#reqPhone', ph); pg.fill('#reqEmail', email)
    pg.click('#reqBtn')


def admin_login(pg, email):
    pg.locator('.brand-mark:visible').first.click(click_count=1)
    for _ in range(4): pg.locator('.brand-mark:visible').first.click()
    wait_screen(pg, '#admin')
    wait_screen(pg, '#admEmailForm')
    pg.fill('#admEmail', email); pg.click('#admSendBtn')
    wait_screen(pg, '#admCodeForm')
    pg.fill('#admCode', last_otp(email)); pg.click('#admVerifyBtn')


if os.path.exists(LOG): os.remove(LOG)
if os.path.exists('/tmp/server_down'): os.remove('/tmp/server_down')
psql('delete from devices')

with sync_playwright() as p:
    PW = p
    b = (p.webkit if ENGINE == 'webkit' else p.chromium).launch()

    # ---------- Phone A: request, approve by email ----------
    ctxA, A = phone(b)
    A.goto(APP)
    wait_screen(A, '#scrRequest')
    ok('first launch shows Request Access', visible(A, '#scrRequest') and not visible(A, '#app'))
    A.fill('#reqName', 'Ravi Kumar'); A.fill('#reqPhone', '12345'); A.click('#reqBtn')
    ok('bad phone number is rejected in app', visible(A, '#reqErr'))
    A.fill('#reqPhone', '9876543210'); A.fill('#reqEmail', 'ravi@example.com'); A.click('#reqBtn')
    wait_screen(A, '#scrWaiting')
    ok('after request shows Waiting for approval', visible(A, '#scrWaiting') and not visible(A, '#app'))
    ok('search is not usable while waiting', A.locator('#fItemNo').is_hidden())
    L = links_for('Ravi Kumar')
    ok('email sent with approve + reject links', 'approve' in L and 'reject' in L, L)
    e = [x for x in emails() if 'html' in x][-1]
    ok('email goes to owner', e['to'] == [OWNER], e['to'])
    ok('email shows name, phone, device, time', all(s in e['html'] for s in ['Ravi Kumar', '9876543210', 'Requested']))
    ok('db stores hashes, not the device secret',
       psql("select length(secret_hash) from devices where name='Ravi Kumar'") == '64')

    W = ctxA.new_page()
    W.goto(f"{BASE}/docs/approve.html?a=approve&t={L['approve']}")
    W.wait_for_selector('#go')
    ok('approve page shows who is asking', 'Ravi Kumar' in W.inner_text('#card'))
    ok('opening the link alone does not approve (scanner-safe)', psql("select status from devices where name='Ravi Kumar'") == 'pending')
    W.click('#go'); W.wait_for_selector('text=Done')
    ok('approve link approves', psql("select status from devices where name='Ravi Kumar'") == 'approved')
    W.goto(f"{BASE}/docs/approve.html?a=approve&t={L['approve']}"); W.wait_for_selector('.result.bad')
    ok('approve link cannot be reused', 'already been used' in W.inner_text('#card'))
    W.goto(f"{BASE}/docs/approve.html?a=reject&t={L['reject']}"); W.wait_for_selector('.result.bad')
    ok('reject link dead after approve', 'already been used' in W.inner_text('#card'))
    W.close()

    A.click('#waitCheck')
    wait_screen(A, '#app')
    A.wait_for_selector('#loading', state='hidden')
    A.fill('#fItemNo', '13.2.1'); time.sleep(0.6)
    ok('approved phone unlocks and search works', '399.45' in A.inner_text('#list'))
    A.locator('.ra-btn').first.click()
    ok('rate analysis still works', A.locator('.p-ra').first.is_visible())
    ok('footer TCD1 still there', A.locator('#app .foot .tag').inner_text() == 'TCD1')
    tokA = A.evaluate("localStorage.getItem('cpwd.token')")
    ok('access token stored after approval', tokA and len(tokA) > 30)
    A.reload(); wait_screen(A, '#app')
    ok('reopening needs no login', visible(A, '#app'))

    # ---------- Phone B: request, reject by email ----------
    ctxB, B = phone(b)
    request(B, 'Stranger', '9000000001')
    wait_screen(B, '#scrWaiting')
    LB = links_for('Stranger')
    W = ctxB.new_page(); W.goto(f"{BASE}/docs/approve.html?a=reject&t={LB['reject']}"); W.wait_for_selector('#go'); W.click('#go'); W.wait_for_selector('text=Done'); W.close()
    B.click('#waitCheck'); wait_screen(B, '#scrRejected')
    ok('rejected phone stays blocked', visible(B, '#scrRejected') and not visible(B, '#app'))
    B.reload(); wait_screen(B, '#scrRejected')
    ok('rejected phone cannot re-request by reopening', visible(B, '#scrRejected'))

    # ---------- Expired link ----------
    ctxC, C = phone(b)
    request(C, 'Late Person', '9000000002')
    wait_screen(C, '#scrWaiting')
    LC = links_for('Late Person')
    psql("update action_tokens set expires_at = now() - interval '1 hour' where device_row = (select id from devices where name='Late Person')")
    W = ctxC.new_page(); W.goto(f"{BASE}/docs/approve.html?a=approve&t={LC['approve']}"); W.wait_for_selector('.result.bad')
    ok('expired link refused', 'expired' in W.inner_text('#card')); W.close()

    # ---------- Admin on phone A ----------
    admin_login(A, OWNER)
    wait_screen(A, '#admPanel')
    A.wait_for_selector('.dcard')
    ok('admin sees pending request', 'Late Person' in A.inner_text('#admList'))
    A.click('[data-tab=approved]')
    ok('admin approved list marks this phone', 'This phone' in A.inner_text('#admList'))
    A.click('[data-tab=blocked]')
    ok('admin blocked list shows rejected', 'Stranger' in A.inner_text('#admList'))
    A.click('[data-tab=pending]')
    A.locator('.dcard', has_text='Late Person').locator('.dbtn.approve').click()
    time.sleep(0.8)
    ok('admin approve works', psql("select status from devices where name='Late Person'") == 'approved')
    C.click('#waitCheck'); wait_screen(C, '#app')
    ok('phone approved from admin unlocks', visible(C, '#app'))

    # Revoke C from admin (two taps)
    A.click('[data-tab=approved]')
    rv = A.locator('.dcard', has_text='Late Person').locator('.dbtn.revoke')
    rv.click(); ok('revoke asks for a second tap', 'Tap again' in rv.inner_text())
    rv.click(); time.sleep(0.8)
    ok('revoke saved on server', psql("select status from devices where name='Late Person'") == 'revoked')
    ok('revoke clears token on server', psql("select token_hash is null from devices where name='Late Person'") == 't')
    C.reload(); wait_screen(C, '#scrLocked')
    ok('revoked phone locked on next open', visible(C, '#scrLocked') and not visible(C, '#app'))
    ok('revoked phone lost its data key', C.evaluate("localStorage.getItem('cpwd.data_key')") is None)

    # Revoke while app is open -> locked on return to foreground
    A.locator('.dcard', has_text='Late Person')  # noop
    A.click('#adminClose')
    psql("update devices set status='approved', token_hash=null where name='Late Person'")
    C.click('#scrLocked [data-recheck]'); wait_screen(C, '#app')
    psql("update devices set status='revoked', token_hash=null where name='Late Person'")
    C.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false}); window.dispatchEvent(new Event('x'))")
    C.evaluate("document.dispatchEvent(new Event('visibilitychange'))")  # < 60s since last check: no recheck
    time.sleep(1)
    ok('no network spam on quick app switches', visible(C, '#app'))
    C.evaluate("Date.now = (orig => () => orig() + 120000)(Date.now); document.dispatchEvent(new Event('visibilitychange'))")
    wait_screen(C, '#scrLocked')
    ok('revoked while open -> locked when app is reopened', visible(C, '#scrLocked'))

    # ---------- Offline behaviour on phone A ----------
    open('/tmp/server_down', 'w').close()
    A.reload(); wait_screen(A, '#app')
    ok('approved phone works offline', visible(A, '#app'))
    A.evaluate("localStorage.setItem('cpwd.last_ok', String(Date.now() - 31*24*3600*1000))")
    A.reload(); wait_screen(A, '#scrOffline')
    ok('offline > 30 days -> must go online', visible(A, '#scrOffline') and not visible(A, '#app'))
    os.remove('/tmp/server_down')
    A.click('#scrOffline [data-recheck]'); wait_screen(A, '#app')
    ok('back online -> re-checks and unlocks', visible(A, '#app'))
    ok('last check time refreshed', A.evaluate("Date.now() - Number(localStorage.getItem('cpwd.last_ok')) < 60000"))

    # ---------- Tampering ----------
    A.evaluate("localStorage.setItem('cpwd.token', 'forged-token-value-xxxxxxxxxxxxxxxxxxxxxxx')")
    A.reload(); wait_screen(A, '#scrLocked')
    ok('forged token -> locked', visible(A, '#scrLocked'))
    ok('without server key the data cannot be read',
       A.evaluate("fetch('data.enc').then(r=>r.arrayBuffer()).then(b=>new TextDecoder().decode(new Uint8Array(b)).includes('cement'))") is False)

    # Fresh install on the same phone = new identity = new approval
    ctxA2, A2 = phone(b)
    A2.goto(APP); wait_screen(A2, '#scrRequest')
    ok('reinstall / new phone must request again', visible(A2, '#scrRequest'))

    # ---------- Non-owner cannot use admin ----------
    admin_login(A2, 'someone.else@example.com')
    A2.wait_for_selector('#admErr:visible', timeout=10000)
    ok('non-owner is refused admin', 'Only the owner' in A2.inner_text('#admErr'))
    ok('non-owner session discarded', A2.evaluate("localStorage.getItem('cpwd.owner_session')") is None)

    # Admin API cannot be used without owner login
    r = A2.evaluate("fetch('/functions/v1/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:'{\"op\":\"list\"}'}).then(r=>r.status)")
    ok('admin API refuses anonymous calls', r == 401, r)
    r = A2.evaluate("fetch('/rest/v1/devices',{headers:{apikey:APP_CONFIG.SUPABASE_KEY, Authorization:'Bearer '+APP_CONFIG.SUPABASE_KEY}}).then(r=>r.status)")
    ok('public key cannot read the device table', r in (401, 403), r)

    errs = A.errors + B.errors + C.errors + A2.errors
    errs = [x for x in errs if 'Failed to load resource' not in x]
    ok('no script errors', not errs, errs[:3])

    A.screenshot(path='shot_locked.png')
    b.close()

n=sum(1 for _, r in results if r)
print(f"\n{n}/{len(results)} passed")
import sys
sys.exit(0 if n == len(results) else 1)
