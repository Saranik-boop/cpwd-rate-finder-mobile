// Registers the offline helper so the app opens without internet after first use.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
// iPhone: a Home Screen app keeps its own storage, separate from Safari. Ask people to add it to the
// Home Screen first and request access from the icon, otherwise they would need approval twice.
(function () {
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (!isIOS || standalone) return;
  var box = document.createElement('div');
  box.className = 'gnote';
  box.style.marginBottom = '4px';
  box.innerHTML = '<b>iPhone: do this first.</b> Tap the <b>Share</b> button (square with an arrow) at the bottom of Safari, then <b>Add to Home Screen</b>. Open the app from the new <b>CPWD Rates</b> icon and send your request there. A request sent from Safari will not carry over to the icon.';
  var req = document.getElementById('scrRequest');
  if (req) req.insertBefore(box, req.querySelector('.gform'));
})();
