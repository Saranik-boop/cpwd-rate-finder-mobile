// Automatic updates for the Android app.
//  * Rate data + screens ("web bundle"): downloaded in the background from the app's GitHub Pages site,
//    checked against its SHA-256, and switched in on the next start (or at once if the user taps "Restart now").
//    If a new bundle ever fails to start, the updater plugin rolls back to the previous one by itself.
//  * New native app (APK): when a newer build is published on the GitHub Releases page, a banner offers the download.
// The web version (iPhone / browser) refreshes itself through its service worker, so nothing runs there.
(function () {
  'use strict';
  var CFG = window.APP_CONFIG || {};
  var CX = window.capacitorExports || {};
  var Cap = CX.Capacitor || window.Capacitor;
  var native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  if (!native || !CX.registerPlugin) return;

  var Updater = CX.registerPlugin('CapacitorUpdater');
  var AppP = CX.registerPlugin('App');
  var MANIFEST = CFG.UPDATE_MANIFEST || 'https://saranik-boop.github.io/cpwd-rate-finder-mobile/update/manifest.json';
  var RELEASES = CFG.RELEASES_API || 'https://api.github.com/repos/Saranik-boop/cpwd-rate-finder-mobile/releases/latest';
  var MY_WEB = Number(window.APP_WEB_VERSION || 0);
  var CHECK_EVERY = 6 * 3600 * 1000;
  var lastCheck = 0, busy = false, shownApk = false;

  // Tell the plugin this bundle started fine (otherwise it rolls back after a few seconds).
  try { Updater.notifyAppReady().catch(function () {}); } catch (e) {}

  // If an update was downloaded earlier but not switched in yet (e.g. the user tapped "Later" and the app
  // was closed without going to the background first), switch to it right away at start-up.
  // Each bundle is tried at most once this way, so a bundle that cannot start can never cause a loop.
  function applyPending() {
    return Updater.getNext().then(function (n) {
      if (!n || !n.id || n.status === 'error' || !(Number(n.version) > MY_WEB)) return false;
      var tried = null; try { tried = localStorage.getItem('cpwd.upd_tried'); } catch (e) {}
      if (tried === n.id) return false;
      try { localStorage.setItem('cpwd.upd_tried', n.id); } catch (e) {}
      console.log('APPLY_PENDING ' + n.version);
      return Updater.set({ id: n.id }).then(function () { return true; });
    }).catch(function () { return false; });
  }
  applyPending();

  function getJSON(url) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store', signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }

  function bar(html, buttons) {
    var old = document.getElementById('updBar'); if (old) old.remove();
    var b = document.createElement('div'); b.id = 'updBar'; b.className = 'upd-bar';
    b.innerHTML = '<p>' + html + '</p>';
    buttons.forEach(function (x) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = x.label;
      if (x.later) btn.className = 'later';
      btn.addEventListener('click', function () { b.remove(); if (x.run) x.run(); });
      b.appendChild(btn);
    });
    document.body.appendChild(b);
  }

  function nativeBuild() {
    return AppP.getInfo().then(function (i) { return Number(i.build || 0); }, function () { return 0; });
  }

  function checkApk(myBuild) {
    if (shownApk) return Promise.resolve(false);
    return getJSON(RELEASES).then(function (rel) {
      var m = /build(\d+)/.exec(rel.tag_name || '');
      var build = m ? Number(m[1]) : 0;
      if (!build || build <= myBuild) return false;
      var asset = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
      var url = asset ? asset.browser_download_url : rel.html_url;
      shownApk = true;
      bar('A new version of the app is available (build ' + build + '). Download and install it over this one — your approval stays.', [
        { label: 'Download', run: function () { location.href = url; } }, // external link: Android opens it in the browser
        { label: 'Later', later: true }
      ]);
      return true;
    }, function () { return false; });
  }

  function checkWeb(myBuild) {
    return getJSON(MANIFEST).then(function (man) {
      var w = man && man.web;
      if (!w || !(Number(w.version) > MY_WEB)) return;
      if (w.min_build && myBuild < Number(w.min_build)) return; // needs a newer APK first (checkApk handles it)
      // reuse a copy that was already downloaded instead of fetching it again
      return Updater.list().then(function (l) {
        var have = ((l && l.bundles) || []).filter(function (b) { return String(b.version) === String(w.version) && b.status !== 'error'; })[0];
        return have || Updater.download({ url: w.url, version: String(w.version), checksum: w.sha256 });
      }, function () {
        return Updater.download({ url: w.url, version: String(w.version), checksum: w.sha256 });
      }).then(function (bundle) {
        return Updater.next({ id: bundle.id }).then(function () {
          console.log('UPDATE_READY ' + w.version);
          bar('Update ready' + (w.notes ? ': ' + escapeHtml(w.notes) : '') + '.', [
            { label: 'Restart now', run: function () { Updater.set({ id: bundle.id }); } },
            { label: 'Later', later: true }
          ]);
        });
      });
    }).catch(function (e) { console.warn('update check failed', e); });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function check() {
    if (busy || Date.now() - lastCheck < 60000) return;
    busy = true; lastCheck = Date.now();
    nativeBuild().then(function (b) {
      return checkApk(b).then(function (apkShown) { if (!apkShown) return checkWeb(b); });
    }).finally(function () { busy = false; });
  }

  window.AppUpdater = { check: check };
  try { console.log('WEBVER ' + MY_WEB); } catch (e) {}
  // First check shortly after start (works on the request/waiting screens too), then every few hours.
  setTimeout(function () { if (navigator.onLine !== false) check(); }, 4000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && Date.now() - lastCheck > CHECK_EVERY) check();
  });
})();
