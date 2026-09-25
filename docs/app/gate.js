// Access control for CPWD Rate Finder.
// - Every phone gets a random device ID + secret (kept in Android secure storage).
// - The server keeps the approval list; the rate data in this app is encrypted and
//   only unlocks with a key the server hands to approved phones.
// - Checks with the server on every open (and on return to the app) when online.
// - Offline, an approved phone keeps working for up to MAX_OFFLINE_DAYS since its
//   last successful check, then must go online again.
(function () {
  'use strict';

  var CFG = window.APP_CONFIG || {};
  var API = String(CFG.SUPABASE_URL || '').replace(/\/+$/, '');
  var MAX_OFFLINE_MS = (CFG.MAX_OFFLINE_DAYS || 30) * 24 * 3600 * 1000;
  var RECHECK_MS = 60 * 1000; // re-check on resume if last check is older than this
  var $ = function (id) { return document.getElementById(id); };

  // ---------------- secure storage ----------------
  var CX = window.capacitorExports || {};
  var Cap = CX.Capacitor || window.Capacitor;
  var native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var SS = native && CX.registerPlugin ? CX.registerPlugin('SecureStoragePlugin') : null;
  var DevicePlugin = native && CX.registerPlugin ? CX.registerPlugin('Device') : null;
  var store = {
    get: function (k) {
      if (SS) return SS.get({ key: k }).then(function (r) { return r && r.value != null ? r.value : null; }, function () { return null; });
      try { return Promise.resolve(localStorage.getItem('cpwd.' + k)); } catch (e) { return Promise.resolve(null); }
    },
    set: function (k, v) {
      if (SS) return SS.set({ key: k, value: String(v) }).catch(function () {});
      try { localStorage.setItem('cpwd.' + k, String(v)); } catch (e) {}
      return Promise.resolve();
    },
    del: function (k) {
      if (SS) return SS.remove({ key: k }).catch(function () {});
      try { localStorage.removeItem('cpwd.' + k); } catch (e) {}
      return Promise.resolve();
    }
  };

  // ---------------- helpers ----------------
  function b64url(bytes) {
    var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.from(b, function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; }
  }
  var toastT;
  function toast(m) { var t = $('gtoast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 1800); }

  // Calls a server function. Resolves {ok, status, data} or {offline:true}.
  function call(fn, body, authToken) {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 12000);
    var headers = { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_KEY };
    if (authToken) headers.Authorization = 'Bearer ' + authToken;
    return fetch(API + '/functions/v1/' + fn, { method: 'POST', headers: headers, body: JSON.stringify(body || {}), signal: ctl.signal })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          // 5xx / gateway problems (server asleep or down) are treated like being offline.
          if (r.status >= 500 || r.status === 404 && !data.error) return { offline: true, serverDown: true };
          return { ok: r.ok, status: r.status, data: data };
        });
      }, function () { return { offline: true }; })
      .finally(function () { clearTimeout(timer); });
  }

  // ---------------- screens ----------------
  var SCREENS = ['scrChecking', 'scrRequest', 'scrWaiting', 'scrRejected', 'scrLocked', 'scrOffline', 'scrError'];
  function show(id) {
    $('app').hidden = true;
    $('gate').hidden = false;
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    stopWaitPoll();
    if (id === 'scrWaiting') startWaitPoll();
  }

  // ---------------- device identity ----------------
  var dev = { id: null, secret: null };
  function ensureIdentity() {
    return Promise.all([store.get('dev_id'), store.get('dev_secret')]).then(function (v) {
      if (v[0] && v[1]) { dev.id = v[0]; dev.secret = v[1]; return; }
      dev.id = uuid();
      dev.secret = b64url(crypto.getRandomValues(new Uint8Array(32)));
      // A brand-new identity: forget anything left over.
      return Promise.all([
        store.set('dev_id', dev.id), store.set('dev_secret', dev.secret),
        store.del('token'), store.del('data_key'), store.del('status'), store.del('last_ok')
      ]);
    });
  }
  function deviceInfo() {
    var D = DevicePlugin;
    if (D) {
      return D.getInfo().then(function (i) {
        var model = [i.manufacturer, i.model].filter(Boolean).join(' ');
        return { model: model, platform: (i.operatingSystem || '') + ' ' + (i.osVersion || '') };
      }, function () { return { model: 'Unknown phone', platform: '' }; });
    }
    // Web version (iPhone etc.): best-effort description from the browser.
    var ua = navigator.userAgent || '';
    var ios = ua.match(/(iPhone|iPad|iPod).*?OS (\d+)[_.](\d+)/);
    if (ios) return Promise.resolve({ model: 'Apple ' + ios[1], platform: 'iOS ' + ios[2] + '.' + ios[3] + ' (web app)' });
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return Promise.resolve({ model: 'Apple iPad', platform: 'iPadOS (web app)' });
    var and = ua.match(/Android (\d+[\d.]*);\s*([^;)]+)/);
    if (and) return Promise.resolve({ model: and[2].trim(), platform: 'Android ' + and[1] + ' (web app)' });
    var m = ua.match(/\(([^)]+)\)/);
    return Promise.resolve({ model: m ? m[1].split(';')[0].trim() : 'Browser', platform: 'web app' });
  }

  function wipeAccess(status) {
    return Promise.all([store.del('token'), store.del('data_key'), store.del('last_ok'), status ? store.set('status', status) : store.del('status')]);
  }

  // ---------------- main flow ----------------
  var unlocked = false;
  var lastCheck = 0;

  function start() {
    show('scrChecking');
    return ensureIdentity().then(check);
  }

  function check() {
    return Promise.all([store.get('token'), store.get('status'), store.get('data_key'), store.get('last_ok')]).then(function (v) {
      var token = v[0], status = v[1], dataKey = v[2], lastOk = Number(v[3] || 0);
      return call('device-status', { device_id: dev.id, device_secret: dev.secret, token: token || undefined }).then(function (r) {
        lastCheck = Date.now();
        if (r.offline) return offlinePath(status, dataKey, lastOk, r.serverDown);
        if (!r.ok) return fail(r.data && r.data.error);
        return handleStatus(r.data, status);
      });
    });
  }

  function handleStatus(d, prevStatus) {
    switch (d.status) {
      case 'approved': {
        var saves = [store.set('status', 'approved'), store.set('last_ok', String(Date.now()))];
        if (d.token) saves.push(store.set('token', d.token));
        if (d.data_key) saves.push(store.set('data_key', d.data_key));
        return Promise.all(saves).then(function () { return unlock(d.data_key); });
      }
      case 'pending':
        return store.set('status', 'pending').then(function () { return showWaiting(); });
      case 'rejected':
        return wipeAccess('rejected').then(function () { lockOut('scrRejected'); });
      case 'revoked':
      case 'locked':
        return wipeAccess('revoked').then(function () { lockOut('scrLocked'); });
      case 'unknown':
      default:
        // The server has no record of this phone: ask for access.
        return wipeAccess(null).then(function () { showRequest(); });
    }
  }

  function offlinePath(status, dataKey, lastOk, serverDown) {
    var now = Date.now();
    var why = serverDown ? 'The approval server is not responding right now.' : 'This phone is offline.';
    if (status === 'approved' && dataKey) {
      var fresh = lastOk && now - lastOk < MAX_OFFLINE_MS && now > lastOk - 24 * 3600 * 1000;
      if (fresh) return unlock(dataKey, true);
      $('offlineMsg').textContent = why + ' It has been more than ' + (CFG.MAX_OFFLINE_DAYS || 30) + ' days since this phone last confirmed its access, so it needs the internet once to continue.';
      return lock('scrOffline');
    }
    if (status === 'pending') { showWaiting(why + ' The app will check again when you are back online.'); return; }
    if (status === 'rejected') return lock('scrRejected');
    if (status === 'revoked') return lock('scrLocked');
    $('offlineMsg').textContent = why + ' Connect to the internet to request access.';
    return lock('scrOffline');
  }

  function fail(msg) {
    $('errorMsg').textContent = msg || 'The server did not accept the request.';
    return lock('scrError');
  }

  // Leave the search screen (if it was open) and show a gate screen.
  function lock(id) {
    if (unlocked) { location.reload(); return; }
    show(id);
  }
  function lockOut(id) { lock(id); }

  // ---------------- unlocking the data ----------------
  function unlock(keyB64, offline) {
    if (unlocked) { return; }
    return decryptData(keyB64).then(function (payload) {
      unlocked = true;
      $('gate').hidden = true;
      $('app').hidden = false;
      window.startSearch(payload.items, payload.meta);
      refreshAdminPills();
      if (offline) toast('Offline — using approved access');
    }, function (e) {
      console.error(e);
      // Key no longer matches the data (e.g. data re-encrypted). Drop it and re-check online.
      return store.del('data_key').then(function () { fail('Could not unlock the rate data on this phone. Connect to the internet and try again.'); });
    });
  }

  function decryptData(keyB64) {
    if (!keyB64) return Promise.reject(new Error('no key'));
    var raw = Uint8Array.from(atob(keyB64), function (c) { return c.charCodeAt(0); });
    return Promise.all([
      fetch('data.enc').then(function (r) { if (!r.ok) throw new Error('data missing'); return r.arrayBuffer(); }),
      crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt'])
    ]).then(function (v) {
      var buf = new Uint8Array(v[0]);
      var magic = String.fromCharCode.apply(null, buf.subarray(0, 5));
      if (magic !== 'CPWD1') throw new Error('bad data file');
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.subarray(5, 17) }, v[1], buf.subarray(17));
    }).then(function (gz) {
      var ds = new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip')));
      return ds.text();
    }).then(function (txt) { return JSON.parse(txt); });
  }

  // ---------------- request access ----------------
  function showRequest() {
    show('scrRequest');
    $('reqErr').hidden = true;
  }
  $('reqForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('reqName').value.trim();
    var phone = $('reqPhone').value.replace(/[\s-]/g, '');
    var email = $('reqEmail').value.trim();
    var err = $('reqErr');
    err.hidden = true;
    if (name.length < 2) { err.textContent = 'Please enter your name.'; err.hidden = false; return; }
    if (!/^\+?\d{10,15}$/.test(phone)) { err.textContent = 'Please enter a 10-digit mobile number (or with country code).'; err.hidden = false; return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'That email address does not look right. Leave it empty if you prefer.'; err.hidden = false; return; }
    var btn = $('reqBtn'); btn.disabled = true; btn.textContent = 'Sending…';
    deviceInfo().then(function (info) {
      return call('device-request', {
        device_id: dev.id, device_secret: dev.secret, name: name, phone: phone, email: email,
        model: info.model, platform: info.platform
      });
    }).then(function (r) {
      btn.disabled = false; btn.textContent = 'Send request';
      if (r.offline) { err.textContent = 'Could not reach the server. Check the internet connection and try again.'; err.hidden = false; return; }
      if (!r.ok) { err.textContent = (r.data && r.data.error) || 'The request was not accepted.'; err.hidden = false; return; }
      return store.set('req_name', name).then(function () { return handleStatus(r.data, null); });
    });
  });

  // ---------------- waiting ----------------
  var waitTimer = null;
  function showWaiting(note) {
    show('scrWaiting');
    store.get('req_name').then(function (n) { $('waitName').textContent = n ? ' for ' + n : ''; });
    $('waitNote').hidden = !note;
    if (note) $('waitNote').textContent = note;
  }
  function startWaitPoll() {
    stopWaitPoll();
    waitTimer = setInterval(function () { if (!document.hidden) check(); }, 30000);
  }
  function stopWaitPoll() { if (waitTimer) { clearInterval(waitTimer); waitTimer = null; } }
  $('waitCheck').addEventListener('click', function () {
    var b = this; b.disabled = true; b.textContent = 'Checking…';
    check().then(function () { b.disabled = false; b.textContent = 'Check now'; });
  });
  document.querySelectorAll('[data-recheck]').forEach(function (b) {
    b.addEventListener('click', function () { show('scrChecking'); check(); });
  });

  // Re-check whenever the app comes back to the foreground.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && Date.now() - lastCheck > RECHECK_MS) check();
  });

  // ================= OWNER / ADMIN =================
  var session = null; // { access_token, refresh_token, expires_at, email }

  function loadSession() {
    return store.get('owner_session').then(function (s) {
      try { session = s ? JSON.parse(s) : null; } catch (e) { session = null; }
      refreshAdminPills();
    });
  }
  function saveSession(s) {
    session = s;
    refreshAdminPills();
    return s ? store.set('owner_session', JSON.stringify(s)) : store.del('owner_session');
  }
  function refreshAdminPills() {
    document.querySelectorAll('[data-open-admin]').forEach(function (b) { b.hidden = !session; });
  }

  function auth(path, body) {
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(API + '/auth/v1/' + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_KEY },
      body: JSON.stringify(body), signal: ctl.signal
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; });
    }, function () { return { ok: false, offline: true, data: {} }; }).finally(function () { clearTimeout(timer); });
  }
  function sessionFrom(d) {
    return { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000, email: d.user && d.user.email };
  }
  function freshToken() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60000 > Date.now()) return Promise.resolve(session.access_token);
    return auth('token?grant_type=refresh_token', { refresh_token: session.refresh_token }).then(function (r) {
      if (r.offline) return session.access_token;
      if (!r.ok || !r.data.access_token) return saveSession(null).then(function () { return null; });
      return saveSession(sessionFrom(r.data)).then(function () { return session.access_token; });
    });
  }

  // Hidden way in: press and hold the green ₹ logo (or tap it 5 times quickly).
  document.querySelectorAll('.brand-mark').forEach(function (m) {
    var holdT = null, taps = [];
    m.addEventListener('pointerdown', function () { holdT = setTimeout(openAdmin, 900); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { m.addEventListener(ev, function () { clearTimeout(holdT); }); });
    m.addEventListener('click', function () {
      var now = Date.now(); taps = taps.filter(function (t) { return now - t < 3000; }); taps.push(now);
      if (taps.length >= 5) { taps = []; openAdmin(); }
    });
    m.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  document.querySelectorAll('[data-open-admin]').forEach(function (b) { b.addEventListener('click', openAdmin); });

  function openAdmin() {
    $('admin').hidden = false;
    document.body.style.overflow = 'hidden';
    if (session) { showPanel(); loadDevices(); } else { showLogin(); }
  }
  $('adminClose').addEventListener('click', function () {
    $('admin').hidden = true;
    document.body.style.overflow = '';
    if (!unlocked) check(); // owner may have just approved this very phone
  });

  function showLogin(msg) {
    $('admLogin').hidden = false; $('admPanel').hidden = true;
    $('adminRefresh').hidden = true; $('adminLogout').hidden = true;
    $('admEmailForm').hidden = false; $('admCodeForm').hidden = true;
    var e = $('admErr'); e.hidden = !msg; e.textContent = msg || '';
  }
  function showPanel() {
    $('admLogin').hidden = true; $('admPanel').hidden = false;
    $('adminRefresh').hidden = false; $('adminLogout').hidden = false;
  }

  var loginEmail = '';
  $('admEmailForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('admEmail').value.trim().toLowerCase();
    var err = $('admErr'); err.hidden = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a valid email address.'; err.hidden = false; return; }
    var b = $('admSendBtn'); b.disabled = true; b.textContent = 'Sending…';
    auth('otp', { email: email, create_user: true }).then(function (r) {
      b.disabled = false; b.textContent = 'Email me a code';
      if (r.offline) { err.textContent = 'No internet connection.'; err.hidden = false; return; }
      if (!r.ok) { err.textContent = r.data.msg || r.data.error_description || 'Could not send the code. Wait a minute and try again.'; err.hidden = false; return; }
      loginEmail = email;
      $('admEmailForm').hidden = true; $('admCodeForm').hidden = false;
      $('admLoginHint').textContent = 'A code was sent to ' + email + '. Enter it below.';
      $('admCode').value = ''; $('admCode').focus();
    });
  });
  $('admBack').addEventListener('click', function () { $('admLoginHint').textContent = 'Enter the owner email. A login code will be emailed to it.'; showLogin(); });
  $('admCodeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('admCode').value.replace(/\D/g, '');
    var err = $('admErr'); err.hidden = true;
    if (code.length < 6) { err.textContent = 'Enter the code from the email.'; err.hidden = false; return; }
    var b = $('admVerifyBtn'); b.disabled = true; b.textContent = 'Checking…';
    auth('verify', { type: 'email', email: loginEmail, token: code }).then(function (r) {
      b.disabled = false; b.textContent = 'Log in';
      if (!r.ok || !r.data.access_token) { err.textContent = r.offline ? 'No internet connection.' : 'That code is wrong or has expired. Request a new one.'; err.hidden = false; return; }
      return saveSession(sessionFrom(r.data)).then(function () { showPanel(); loadDevices(); });
    });
  });
  $('adminLogout').addEventListener('click', function () {
    saveSession(null).then(function () { showLogin(); toast('Logged out'); });
  });
  $('adminRefresh').addEventListener('click', function () { loadDevices(); });

  var devices = [];
  var tab = 'pending';
  document.querySelectorAll('.adm-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      tab = t.dataset.tab;
      document.querySelectorAll('.adm-tab').forEach(function (x) { x.classList.toggle('active', x === t); });
      renderDevices();
    });
  });

  function adminCall(body) {
    return freshToken().then(function (tok) {
      if (!tok) { showLogin('Please log in again.'); return null; }
      return call('admin', body, tok).then(function (r) {
        if (r.offline) { listErr('No internet connection, or the server is not responding.'); return null; }
        if (r.status === 401 || r.status === 403) {
          return saveSession(null).then(function () { showLogin((r.data && r.data.error) || 'Only the owner can use this screen.'); return null; });
        }
        if (!r.ok) { listErr((r.data && r.data.error) || 'The server refused that action.'); return null; }
        return r.data;
      });
    });
  }
  function listErr(m) { var e = $('admListErr'); e.textContent = m; e.hidden = !m; }

  function loadDevices() {
    listErr('');
    $('admList').innerHTML = '<div class="adm-empty">Loading…</div>';
    return adminCall({ op: 'list' }).then(function (d) {
      if (!d) { $('admList').innerHTML = ''; return; }
      devices = d.devices || [];
      renderDevices();
    });
  }

  function bucket(s) { return s === 'pending' ? 'pending' : s === 'approved' ? 'approved' : 'blocked'; }
  var STATUS_TEXT = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', revoked: 'Revoked' };

  function renderDevices() {
    var counts = { pending: 0, approved: 0, blocked: 0 };
    devices.forEach(function (d) { counts[bucket(d.status)]++; });
    $('nPending').textContent = counts.pending; $('nApproved').textContent = counts.approved; $('nBlocked').textContent = counts.blocked;
    var list = devices.filter(function (d) { return bucket(d.status) === tab; });
    var box = $('admList');
    if (!list.length) {
      box.innerHTML = '<div class="adm-empty">' + (tab === 'pending' ? 'No requests waiting.' : tab === 'approved' ? 'No approved phones yet.' : 'No blocked phones.') + '</div>';
      return;
    }
    box.innerHTML = '';
    list.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'dcard';
      var acts = d.status === 'pending'
        ? '<button type="button" class="dbtn approve" data-op="approve">Approve</button><button type="button" class="dbtn reject" data-op="reject">Reject</button>'
        : d.status === 'approved'
          ? '<button type="button" class="dbtn revoke" data-op="revoke">Revoke access</button>'
          : '<button type="button" class="dbtn approve" data-op="approve">Approve again</button>';
      el.innerHTML =
        '<div class="dcard-top"><div><div class="dname">' + esc(d.name) + '</div>' +
        (d.device_id === dev.id ? '<div class="dthis">This phone</div>' : '') + '</div>' +
        '<span class="dpill ' + esc(d.status) + '">' + esc(STATUS_TEXT[d.status] || d.status) + '</span></div>' +
        '<dl class="dmeta">' +
          '<dt>Phone</dt><dd>' + esc(d.phone) + '</dd>' +
          (d.email ? '<dt>Email</dt><dd>' + esc(d.email) + '</dd>' : '') +
          '<dt>Device</dt><dd>' + esc(d.model || '—') + (d.platform ? ' · ' + esc(d.platform) : '') + '</dd>' +
          '<dt>Requested</dt><dd>' + esc(fmtDate(d.created_at)) + '</dd>' +
          (d.decided_at ? '<dt>Decided</dt><dd>' + esc(fmtDate(d.decided_at)) + (d.decided_via ? ' (' + esc(d.decided_via) + ')' : '') + '</dd>' : '') +
          '<dt>Last seen</dt><dd>' + esc(fmtDate(d.last_seen)) + '</dd>' +
        '</dl>' +
        '<div class="dact">' + acts + '</div>';
      el.querySelectorAll('.dbtn').forEach(function (b) {
        b.addEventListener('click', function () { act(d, b); });
      });
      box.appendChild(el);
    });
  }

  function act(d, btn) {
    var op = btn.dataset.op;
    // Revoke and reject ask for a second tap, shown on the button itself.
    if ((op === 'revoke' || op === 'reject') && !btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      btn.textContent = op === 'revoke' ? 'Tap again to revoke' : 'Tap again to reject';
      setTimeout(function () {
        if (btn.isConnected && btn.classList.contains('confirm')) {
          btn.classList.remove('confirm'); btn.textContent = op === 'revoke' ? 'Revoke access' : 'Reject';
        }
      }, 4000);
      return;
    }
    btn.disabled = true;
    adminCall({ op: op, id: d.id }).then(function (r) {
      btn.disabled = false;
      if (!r) return;
      devices = devices.map(function (x) { return x.id === d.id ? r.device : x; });
      renderDevices();
      toast(op === 'approve' ? 'Approved ' + d.name : op === 'reject' ? 'Rejected ' + d.name : 'Access revoked for ' + d.name);
    });
  }

  // ---------------- go ----------------
  if (!API || /YOUR-PROJECT/.test(API)) {
    fail('This copy of the app has not been connected to its server yet.');
  } else {
    loadSession().then(start);
  }
})();
