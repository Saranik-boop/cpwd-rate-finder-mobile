// Shows a drawing inside the Explanation panel, and full screen when tapped (pinch / double-tap to zoom,
// drag to move, back button or ✕ to close).
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function legendHtml(r) {
    return '<ol class="dg-leg">' + r.legend.map(function (l) {
      return '<li' + (l.hot ? ' class="hot"' : '') + '><span class="dg-n">' + l.n + '</span><span><b>' + esc(l.s) + '</b>' +
        (l.hot ? ' <span class="dg-this">this item</span>' : '') + (l.t ? ' — ' + esc(l.t) : '') + '</span></li>';
    }).join('') + '</ol>';
  }

  // HTML for the Explanation panel
  function figure(id, text) {
    if (!window.DiagramKit) return '';
    var r = window.DiagramKit.render(id, text);
    if (!r) return '';
    return '<figure class="dgw" data-dg="' + esc(id) + '" tabindex="0" role="button" aria-label="Open the drawing full screen">' +
      '<div class="dgw-img">' + r.svg + '<span class="dgw-zoom" aria-hidden="true">⤢ Tap to enlarge</span></div>' +
      legendHtml(r) +
      '<figcaption>' + esc(r.title) + ' — 3D illustration, not to scale</figcaption></figure>';
  }

  // ---------- full-screen viewer ----------
  var ov = null, stage, canvas, sc = 1, tx = 0, ty = 0, pts = {}, start = null, lastTap = 0, pushed = false;
  function apply() { canvas.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')'; }
  function clamp() {
    var w = stage.clientWidth, h = stage.clientHeight;
    var mx = Math.max(0, (w * sc - w) / 2 + 40), my = Math.max(0, (h * sc - h) / 2 + 40);
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  }
  function zoomAt(ns, cx, cy) {
    ns = Math.max(1, Math.min(6, ns));
    var r = stage.getBoundingClientRect(), ox = cx - r.left - r.width / 2, oy = cy - r.top - r.height / 2;
    tx = ox - (ox - tx) * ns / sc; ty = oy - (oy - ty) * ns / sc; sc = ns;
    if (sc === 1) { tx = 0; ty = 0; }
    clamp(); apply();
  }
  function build() {
    ov = document.createElement('div');
    ov.className = 'dgv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.hidden = true;
    ov.innerHTML = '<div class="dgv-bar"><button type="button" class="dgv-x" aria-label="Close">✕</button><div class="dgv-t"></div>' +
      '<button type="button" class="dgv-b" data-z="-1" aria-label="Zoom out">−</button><button type="button" class="dgv-b" data-z="1" aria-label="Zoom in">+</button></div>' +
      '<div class="dgv-stage"><div class="dgv-canvas"></div></div><div class="dgv-hint">Pinch or double-tap to zoom · drag to move</div><div class="dgv-leg"></div>';
    document.body.appendChild(ov);
    stage = ov.querySelector('.dgv-stage'); canvas = ov.querySelector('.dgv-canvas');
    ov.querySelector('.dgv-x').addEventListener('click', close);
    ov.querySelectorAll('.dgv-b').forEach(function (b) {
      b.addEventListener('click', function () { var r = stage.getBoundingClientRect(); zoomAt(sc * (b.dataset.z === '1' ? 1.6 : 1 / 1.6), r.left + r.width / 2, r.top + r.height / 2); });
    });
    stage.addEventListener('pointerdown', function (e) {
      stage.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        var now = Date.now();
        if (now - lastTap < 300) { zoomAt(sc > 1.5 ? 1 : 2.6, e.clientX, e.clientY); lastTap = 0; }
        else lastTap = now;
      }
      start = snapshot();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length >= 2 && start && start.d) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        var ns = Math.max(1, Math.min(6, start.sc * d / start.d));
        var r = stage.getBoundingClientRect(), ox = start.cx - r.left - r.width / 2, oy = start.cy - r.top - r.height / 2;
        sc = ns; tx = ox - (ox - start.tx) * ns / start.sc + (cx - start.cx); ty = oy - (oy - start.ty) * ns / start.sc + (cy - start.cy);
        clamp(); apply();
      } else if (ids.length === 1 && start && sc > 1) {
        tx = start.tx + (e.clientX - start.x); ty = start.ty + (e.clientY - start.y); clamp(); apply();
      }
    });
    function up(e) { delete pts[e.pointerId]; start = snapshot(); if (sc < 1.02) { sc = 1; tx = 0; ty = 0; apply(); } }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(sc * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); }, { passive: false });
    document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); });
    window.addEventListener('popstate', function () { if (!ov.hidden) { pushed = false; hide(); } });
  }
  function snapshot() {
    var ids = Object.keys(pts), s = { sc: sc, tx: tx, ty: ty };
    if (ids.length >= 2) { var a = pts[ids[0]], b = pts[ids[1]]; s.d = Math.hypot(a.x - b.x, a.y - b.y); s.cx = (a.x + b.x) / 2; s.cy = (a.y + b.y) / 2; }
    else if (ids.length === 1) { s.x = pts[ids[0]].x; s.y = pts[ids[0]].y; }
    return s;
  }
  function open(fig) {
    if (!ov) build();
    var svg = fig.querySelector('svg'), leg = fig.querySelector('.dg-leg'), cap = fig.querySelector('figcaption');
    canvas.innerHTML = svg ? svg.outerHTML : '';
    ov.querySelector('.dgv-leg').innerHTML = leg ? leg.outerHTML : '';
    ov.querySelector('.dgv-t').textContent = cap ? cap.textContent.split(' — ')[0] : '';
    sc = 1; tx = 0; ty = 0; pts = {}; apply();
    ov.hidden = false; document.body.classList.add('noscroll');
    try { history.pushState({ dgv: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
  }
  function hide() { if (ov) ov.hidden = true; document.body.classList.remove('noscroll'); }
  function close() { if (pushed) { pushed = false; history.back(); } else hide(); }

  document.addEventListener('click', function (e) {
    var fig = e.target.closest && e.target.closest('.dgw');
    if (fig) { e.stopPropagation(); open(fig); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('dgw')) { e.preventDefault(); open(e.target); }
  });

  window.DiagramView = { figure: figure, open: open, close: close };
})();
