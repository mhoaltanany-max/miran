/* مِران — offline cache.
   Code and data: fresh from the internet when there is one (so updates arrive by themselves), the saved copy when there is none.
   Recordings: saved the first time they play, then always played from the phone. Bump MEDIA when recordings change. */
const CODE = 'miran-code-v1';
const MEDIA = 'miran-media-v1';
const SHELL = ['./', 'index.html', 'game.js', 'dict.js', 'wplayer.js', 'fseg.js', 'data.js', 'levels.js', 'gdata.js', 'fam.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CODE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CODE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const isMedia = p => /\/(a|x|s|g)\/[^/]+$/.test(p);

async function codeFirst(req) {
  const c = await caches.open(CODE);
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(req, { cache: 'no-cache', signal: ctl.signal }); clearTimeout(t);
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch (e) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw e;
  }
}

/* full file from cache (or network, then cache); audio elements ask for byte ranges, so answer those from the full copy */
async function mediaFull(url) {
  const c = await caches.open(MEDIA);
  let r = await c.match(url);
  if (!r) { r = await fetch(url); if (r.ok) await c.put(url, r.clone()); }
  return r;
}
async function media(req) {
  const range = req.headers.get('range');
  const full = await mediaFull(req.url);
  if (!range || !full.ok) return full;
  const buf = await full.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : size - 1;
  if (!m[1] && m[2]) { a = Math.max(0, size - +m[2]); b = size - 1; }
  b = Math.min(b, size - 1);
  return new Response(buf.slice(a, b + 1), { status: 206, headers: { 'Content-Type': full.headers.get('Content-Type') || 'video/webm', 'Content-Range': `bytes ${a}-${b}/${size}`, 'Content-Length': String(b - a + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) { e.respondWith(isMedia(u.pathname) ? media(req) : codeFirst(req)); return; }
  /* fonts: keep a copy so the app looks right offline */
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(CODE).then(async c => { try { const r = await fetch(req); c.put(req, r.clone()); return r; } catch (err) { const hit = await c.match(req); if (hit) return hit; throw err; } }));
  }
});
