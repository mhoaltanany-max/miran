/* مران الكلمات — game edition.
   Same data as before (data.js: 88 stories, 4,368 words; a/p*.js word clips; s/*.webm story recordings with word timings)
   and the same saved progress (localStorage "miran.v1"), now played as a daily journey:
   review yesterday's words → clear today's story station by station → beat the story challenge. */
(() => {
'use strict';
const { S: STORIES, W: RAW } = window.VD;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.random() * a.length | 0];
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const norm = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/\.(?=\S)/g, '').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const bare = s => String(s).replace(/\*\*/g, '');
const DAY = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5); };
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- icons ---------- */
const P = (d, f) => `<svg class="i${f ? ' f' : ''}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  map: P('<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>'),
  chest: P('<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M3.5 13h17M5 9V7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5V9"/><rect x="10.5" y="11.5" width="3" height="4" rx="1"/>'),
  joy: P('<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/>'),
  me: P('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'),
  flame: P('<path d="M12 21.5c-4 0-7-2.8-7-6.7 0-3.4 2.3-5.5 3.7-7.9.5 1.8 1.5 2.8 2.6 3.4C11.8 7.3 13 4.5 15.6 2.5c-.2 3.5 3.9 6.1 3.9 11.6 0 4.6-3 7.4-7.5 7.4z"/>', 1),
  gem: P('<path d="M6.5 3.5h11l4 5.5L12 21 2.5 9z"/><path d="M2.5 9h19M9 3.5 7.5 9 12 21M15 3.5 16.5 9 12 21" fill="none" stroke="rgb(255 255 255 / .55)" stroke-width="1.3"/>', 1),
  star: P('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>', 1),
  spk: P('<path d="M3.5 9.5v5a1 1 0 0 0 1 1h3l4.6 3.8a.8.8 0 0 0 1.4-.6V5.3a.8.8 0 0 0-1.4-.6L7.5 8.5h-3a1 1 0 0 0-1 1z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  turtle: P('<path d="M4 15c0-4 3.6-7 8-7s8 3 8 7z"/><path d="M20 13.5h1.5a1.5 1.5 0 0 0 0-3H20M6 15l-1 3M18 15l1 3M9 8.5l1.5 6.5M15 8.5 13.5 15"/>'),
  play: P('<path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"/>', 1),
  pause: P('<rect x="5.5" y="4.5" width="4.5" height="15" rx="1.3"/><rect x="14" y="4.5" width="4.5" height="15" rx="1.3"/>', 1),
  close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  next: P('<path d="M15 5l-7 7 7 7"/>'),
  prev: P('<path d="M9 5l7 7-7 7"/>'),
  lock: P('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  check: P('<path d="m4.5 12.5 5 5L19.5 7"/>'),
  crown: P('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>', 1),
  bulb: P('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
  back: P('<path d="M20 12H4M10 6l-6 6 6 6"/>'),
  heart: P('<path d="M12 20.5s-8.5-5-8.5-11A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8.5 2.7c0 6-8.5 11-8.5 11z"/>', 1),
  book: P('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>'),
  search: P('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'),
  sword: P('<path d="M14.5 3.5H20.5V9.5L10 20l-3-3zM5 15l4 4M4 20l2-2"/>'),
};

/* ---------- words ---------- */
// RAW: [word, mainMeaning, pron, fullMeaning, dictEntry, story, ex:[para,sent,surface,flag]|0]
const W = RAW.map((r, i) => ({ i, w: r[0], m: r[1], p: r[2], full: r[3], head: r[4], s: r[5], ex: r[6] || null, k: norm(r[0]) }));
STORIES.forEach(s => { s.words = W.filter(w => w.s === s.n).map(w => w.i); });
const WK = new Map(); W.forEach(w => { if (!WK.has(w.k)) WK.set(w.k, w.i); });
/* estimated CEFR level per word (levels.js); B2 and C words get extra practice and come back sooner */
W.forEach(w => { w.lv = (window.WLV && window.WLV[w.w]) || 'B1'; });
const HARD = { B2: 1, C1: 1, C2: 1 };
const isHard = i => !!HARD[W[i].lv];
const LVCLS = { A1: 'a', A2: 'a', B1: 'b', B2: 'b2', C1: 'c', C2: 'c' };
const lvBadge = i => `<span class="lvb ${LVCLS[W[i].lv]}" title="المستوى التقريبي">${W[i].lv}</span>`;
const IVX = { B2: .65, C1: .55, C2: .5 };
const HUE = n => 'h' + ((n - 1) % 5);
/* each story splits into stations of ~8 words */
function stations(n) {
  const ws = STORIES[n - 1].words, k = Math.max(1, Math.min(6, Math.round(ws.length / 8.5)));
  const out = []; let at = 0;
  for (let g = 0; g < k; g++) { const sz = Math.floor(ws.length / k) + (g < ws.length % k ? 1 : 0); out.push(ws.slice(at, at + sz)); at += sz; }
  return out;
}
function exSentence(i) {
  const w = W[i]; if (!w.ex) return null; const s = STORIES[w.s - 1]; const t = s.ss?.[w.ex[0]]?.[w.ex[1]]; if (!t) return null;
  const span = w.ex[2]; const at = t.indexOf('**' + span + '**'); if (at < 0) return null;
  return { text: t, span, at };
}
const exHtml = (i, gap) => {
  const e = exSentence(i); if (!e) return '';
  const before = bare(e.text.slice(0, e.at)), after = bare(e.text.slice(e.at + e.span.length + 4));
  return `<div class="ex">${esc(before)}${gap ? '<span class="gap">?</span>' : `<b>${esc(e.span)}</b>`}${esc(after)}</div>`;
};
const canBuild = i => /^[a-z]{3,10}$/i.test(W[i].w);

/* ---------- saved progress (shared with the earlier version) ---------- */
/* the game keeps its own save so it never changes the main Miran app; on first run it copies Miran's progress as a starting point */
const KEY = 'miran-game.v1', SRC_KEY = 'miran.v1';
let ST;
function fresh() { return { v: 1, w: {}, h: [], sp: {}, cf: {}, days: {}, dict: {}, set: { rep: 1, wrate: 1, wrep: 2, arOn: true, arRate: 1, wgap: 1, nw: 10, auto: true, rate: 1 }, streak: 0, lastDay: 0, created: DAY() }; }
try { ST = JSON.parse(localStorage.getItem(KEY)) || JSON.parse(localStorage.getItem(SRC_KEY)) || fresh(); } catch (e) { ST = fresh(); }
ST = Object.assign(fresh(), ST); ST.set = Object.assign(fresh().set, ST.set);
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { } }, 150); }
const ws = i => ST.w[i] || (ST.w[i] = { st: 0, due: 0, lp: 0, ok: [0, 0, 0], bad: [0, 0, 0], seen: 0 });
const known = i => !!ST.w[i]?.seen;
const IV = [0, 1, 3, 7, 14, 30, 60, 120, 240];
function wordScore(i) { const x = ST.w[i]; if (!x) return 0; const b = x.bad[0] + x.bad[1] + x.bad[2], o = x.ok[0] + x.ok[1] + x.ok[2]; return x.lp * 2 + b * 1.5 - o * 0.4 + (x.st <= 1 && x.seen ? 1 : 0); }
const isWeak = i => { const x = ST.w[i]; return !!x && x.seen && (x.lp >= 2 || wordScore(i) >= 3); };
function bumpDay(field, n = 1) { const d = DAY(); const r = ST.days[d] || (ST.days[d] = { a: 0, ok: 0, nw: 0 }); r[field] += n; if (ST.lastDay !== d) { ST.streak = ST.lastDay === d - 1 ? ST.streak + 1 : 1; ST.lastDay = d; } G.bestStreak = Math.max(G.bestStreak || 0, ST.streak); }
function record(i, skill, ok, opts = {}) {
  const x = ws(i), d = DAY();
  ST.h.push([d, skill, ok ? 1 : 0, i]); if (ST.h.length > 3000) ST.h.splice(0, ST.h.length - 3000);
  bumpDay('a'); if (ok) bumpDay('ok');
  if (ok) x.ok[skill]++; else x.bad[skill]++;
  if (opts.noSrs) { save(); return; }
  if (ok) { if (!opts.hinted) x.st = Math.min(IV.length - 1, x.st + 1); x.due = d + Math.max(1, IV[Math.max(1, x.st)] * (opts.hinted ? 0.5 : 1) * (IVX[W[i].lv] || 1) | 0); }
  else { x.lp++; x.st = Math.max(1, x.st - 2); x.due = d; }
  x.last = d; save();
}
function meet(i) { const x = ws(i); if (!x.seen) { x.seen = 1; x.due = DAY(); bumpDay('nw'); save(); } }
function weakSkill(i) { const x = ws(i); let best = 0, bv = -1; for (let k = 0; k < 3; k++) { const v = (x.bad[k] + .6) / (x.ok[k] + x.bad[k] + 1.2) + Math.random() * .25; if (v > bv) { bv = v; best = k; } } return best; }

/* game layer: xp, gems, stars, daily mission */
const GDEF = { xp: 0, gems: 20, stars: {}, done: {}, av: 0, own: [0, 1], best: {}, sfx: true, wrate: 1, srate: 1, today: null, bestStreak: 0, xpd: {} };
let G = Object.assign({}, GDEF, ST.game || {});
ST.game = G;
if (!G.migrated) {
  // carry earlier progress: a story whose words were all met counts as cleared
  STORIES.forEach(s => {
    const st = stations(s.n); let all = true;
    st.forEach((g, k) => { if (g.every(known)) G.stars[s.n + '-' + k] = G.stars[s.n + '-' + k] || 1; else all = false; });
    if (all && s.words.length) G.done[s.n] = G.done[s.n] || 1;
  });
  G.migrated = 1; save();
}
const LEVELS = ['مبتدئ', 'مستكشف', 'مغامر', 'رحّالة', 'فارس الكلمات', 'بطل', 'أسطورة'];
function lvlInfo() { let l = 1, need = 120, x = G.xp; while (x >= need) { x -= need; l++; need = 120 + (l - 1) * 40; } return { l, x, need, rank: LEVELS[Math.min(LEVELS.length - 1, (l - 1) / 4 | 0)] }; }
function addXP(n) { G.xp += n; const d = DAY(); G.xpd[d] = (G.xpd[d] || 0) + n; const keep = Object.keys(G.xpd).map(Number).filter(k => k > d - 14); G.xpd = Object.fromEntries(keep.map(k => [k, G.xpd[k]])); save(); }
const AVS = [['🦊', 0], ['🐼', 0], ['🐸', 40], ['🐯', 60], ['🐨', 80], ['🦁', 100], ['🐙', 130], ['🦉', 160], ['🐧', 200], ['🦄', 260], ['🐲', 340], ['🚀', 450]];
const myAv = () => AVS[G.av]?.[0] || '🦊';
const streakNow = () => ST.lastDay >= DAY() - 1 ? ST.streak : 0;

/* grammar lessons (from the قواعد app): 112 lessons in three levels, grammar + pronunciation */
const GD = window.GD || { L: [], order: { A: [], B: [], C: [] }, caps: [] };
const LBY = new Map(GD.L.map(l => [l.id, l]));
const GORDER = [...GD.order.A, ...GD.order.B, ...GD.order.C].filter(id => LBY.has(id));
const CAPS = new Set(GD.caps || []);
G.gl = G.gl || {}; G.gstart = G.gstart || 0;
const LVN = { A: 'أساسي', B: 'متوسط', C: 'متقدم' };
function firstOpenLesson() { for (let k = G.gstart; k < GORDER.length; k++) if (!G.gl[GORDER[k]]) return GORDER[k]; for (const id of GORDER) if (!G.gl[id]) return id; return GORDER[GORDER.length - 1] || null; }
function gramDue(d, skip) { return Object.keys(G.gl).filter(id => LBY.has(id) && id !== skip && G.gl[id].due <= d).sort((a, b) => G.gl[a].due - G.gl[b].due).slice(0, 6); }

/* ---------- daily mission ---------- */
const storyDone = n => !!G.done[n];
function firstOpenStory() { for (const s of STORIES) if (!storyDone(s.n)) return s.n; return STORIES.length; }
function ensureToday() {
  const d = DAY();
  if (G.today && G.today.d === d) { if (!('g' in G.today)) { G.today.g = firstOpenLesson(); G.today.grev = gramDue(d, G.today.g); G.today.grd = 0; save(); } return G.today; }
  const n = firstOpenStory();
  const rev = Object.keys(ST.w).map(Number).filter(i => ST.w[i].seen && W[i].s !== n && ST.w[i].due <= d)
    .sort((a, b) => (isHard(b) - isHard(a)) || wordScore(b) - wordScore(a) || ST.w[a].due - ST.w[b].due).slice(0, 36);
  const g = firstOpenLesson();
  G.today = { d, n, rev, rd: 0, g, grev: gramDue(d, g), grd: 0 }; save();
  return G.today;
}
function missionSteps() {
  const T = ensureToday(), n = T.n, st = stations(n), out = [];
  if (T.rev.length || T.grev.length) out.push({ kind: 'rev', title: 'مراجعة القديم', sub: [T.rev.length ? `${AR(Math.min(T.rd, T.rev.length))} من ${AR(T.rev.length)} كلمة` : '', T.grev.length ? `${AR(T.grev.length)} قاعدة` : ''].filter(Boolean).join(' · '), done: T.rd >= T.rev.length && !!T.grd });
  if (T.g) out.push({ kind: 'gram', title: 'قاعدة اليوم', sub: LBY.get(T.g).ar, done: !!G.gl[T.g] });
  st.forEach((g, k) => out.push({ kind: 'st', k, title: `المحطة ${AR(k + 1)}`, sub: `${AR(g.length)} كلمات جديدة`, done: !!G.stars[n + '-' + k] }));
  out.push({ kind: 'boss', title: 'تحدي القصة', sub: 'اسمع القصة كاملة وجاوب', done: storyDone(n) });
  return out;
}
const stationOpen = () => true;
const bossOpen = () => true;
const chapterOpen = () => true;

/* ---------- audio ---------- */
const PACK = {}, WAIT = {}, URLS = {};
window.__ap = (k, obj) => { PACK[k] = obj; (WAIT[k] || []).forEach(f => f()); delete WAIT[k]; };
function loadPack(k) { return new Promise(res => { if (PACK[k]) return res(); if (WAIT[k]) return WAIT[k].push(res); WAIT[k] = [res]; const sc = document.createElement('script'); sc.src = 'a/p' + k + '.js'; sc.onerror = () => { (WAIT[k] || []).forEach(f => f()); delete WAIT[k]; }; document.head.appendChild(sc); }); }
async function clipUrl(i) {
  if (URLS[i]) return URLS[i];
  const k = (W[i].s - 1) >> 3; await loadPack(k); const b = PACK[k]?.[i]; if (!b) return null;
  const bin = atob(b), u = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j);
  return URLS[i] = URL.createObjectURL(new Blob([u], { type: 'audio/webm' }));
}
const prefetch = ids => new Set(ids.map(i => (W[i].s - 1) >> 3)).forEach(loadPack);
const au = new Audio(); au.preload = 'auto';
let sayTok = 0, enVoice = null;
try { au.preservesPitch = true; au.mozPreservesPitch = true; au.webkitPreservesPitch = true; } catch (e) { }
/* recordings get warbly when slowed below 0.8, so slow mode keeps them at 0.8 and stretches the pauses instead */
const clipRate = r => Math.min(1.25, Math.max(.8, r || 1));
function pickVoices() {
  try {
    const v = speechSynthesis.getVoices().filter(x => /^en[-_]/i.test(x.lang));
    /* best first: natural/neural voices, then Google network voices, then any US voice */
    const score = x => (/natural|neural|enhanced|premium|wavenet/i.test(x.name) ? 40 : 0) + (/google/i.test(x.name) ? 20 : 0) + (/^en[-_]US/i.test(x.lang) ? 10 : /^en[-_]GB/i.test(x.lang) ? 6 : 0) + (x.localService === false ? 5 : 0) + (/compact|espeak/i.test(x.name) ? -50 : 0);
    enVoice = v.sort((a, b) => score(b) - score(a))[0] || null;
  } catch (e) { }
}
try { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; } catch (e) { }
function tts(text, rate) { return new Promise(res => { const C = window.Capacitor?.Plugins?.TextToSpeech; if (C) { C.speak({ text, lang: 'en-US', rate, volume: 1, category: 'ambient' }).then(res, res); return; } try { const u = new SpeechSynthesisUtterance(text); if (enVoice) u.voice = enVoice; u.lang = enVoice ? enVoice.lang : 'en-US'; u.rate = rate; u.onend = res; u.onerror = res; speechSynthesis.speak(u); setTimeout(res, 6000); } catch (e) { res(); } }); }
let segOn = false;
function stopAudio() { sayTok++; try { au.pause(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } if (segOn) { segOn = false; try { SA.pause(); } catch (e) { } cancelAnimationFrame(saRaf); } }
function playUrl(url, rate) { return new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } }; au.onended = fin; au.onerror = fin; au.src = url; au.playbackRate = clipRate(rate); au.play().catch(fin); setTimeout(fin, 7000); }); }
async function say(i, rate) {
  rate = rate || G.wrate || 1; stopAudio(); const my = sayTok;
  const url = await clipUrl(i); if (my !== sayTok) return;
  if (!url) return tts(W[i].w, .85 * rate);
  return playUrl(url, rate);
}
/* play a stretch of a story recording: the narrator saying exactly this word */
function playSeg(n, a, b) {
  stopAudio(); stopStory(); const my = sayTok;
  return new Promise(res => {
    let done = false; const fin = () => { if (!done) { done = true; segOn = false; res(); } };
    if (SA_N !== n) { SA.src = 's/Story_' + String(n).padStart(2, '0') + '.webm'; SA_N = n; }
    const go = () => {
      if (my !== sayTok) return fin();
      segOn = true; try { SA.currentTime = Math.max(0, a); } catch (e) { } SA.playbackRate = 1;
      SA.play().catch(fin);
      const f = () => { if (my !== sayTok) return fin(); if (SA.currentTime >= b || SA.paused || SA.ended) { SA.pause(); fin(); } else saRaf = requestAnimationFrame(f); };
      saRaf = requestAnimationFrame(f);
    };
    if (SA.readyState >= 1) go(); else { SA.addEventListener('loadedmetadata', go, { once: true }); try { SA.load(); } catch (e) { } }
    setTimeout(fin, 9000);
  });
}
/* recordings of other word forms (attached, happiness …) borrowed from «لغتي»: x/x0.js … x/xf.js, keyed by the form */
const XP = {}, XW = {}, XURL = {};
window.__xp = (k, obj) => { XP[k] = obj; (XW[k] || []).forEach(f => f()); delete XW[k]; };
const xSay = w => String(w).replace(/-[^-]*-/g, '').replace(/\s\+.*$/, '').replace(/\bsb\b/g, 'somebody').replace(/\bsth\b/g, 'something').replace(/[\u0600-\u06FF()\[\]]/g, '').replace(/\s+/g, ' ').trim().replace(/^[ ,.;:]+|[ ,.;:]+$/g, '');
const xKey = w => xSay(w).toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' -]/g, ' ').trim();
const xPack = k => { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 'x' + (h % 16).toString(16); };
function loadX(n) { return new Promise(res => { if (XP[n]) return res(); if (XW[n]) return XW[n].push(res); XW[n] = [res]; const sc = document.createElement('script'); sc.src = 'x/' + n + '.js'; sc.onerror = () => { (XW[n] || []).forEach(f => f()); delete XW[n]; }; document.head.appendChild(sc); }); }
async function xUrl(text) { const k = xKey(text); if (!k) return null; if (XURL[k]) return XURL[k]; const n = xPack(k); await loadX(n); const b = XP[n]?.[k]; if (!b) return null; const bin = atob(b), u = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j); return XURL[k] = URL.createObjectURL(new Blob([u], { type: 'audio/webm' })); }
/* say any English text: the word's own recording, else a borrowed form recording, else the phone voice */
async function sayAny(text, rate) {
  rate = rate || G.wrate || 1; const i = W.findIndex(x => x.k === norm(text)); if (i >= 0) return say(i, rate);
  stopAudio(); const my = sayTok; const url = await xUrl(text); if (my !== sayTok) return;
  if (url) return playUrl(url, rate);
  /* not recorded on its own: take it from a story where the narrator says it */
  const sk = xKey(text).replace(/-/g, ' ').replace(/\s+/g, ' '), sg = window.FSEG && window.FSEG[sk];
  if (sg) return playSeg(sg[0], sg[1], sg[2]);
  /* a phrase: chain the recordings of its words */
  const parts = sk.split(' ').filter(Boolean);
  if (parts.length > 1) {
    const urls = [];
    for (const p of parts) { const j = W.findIndex(x => x.k === p); const u = j >= 0 ? await clipUrl(j) : await xUrl(p); if (my !== sayTok) return; if (!u) { urls.length = 0; break; } urls.push(u); }
    if (urls.length) { for (const u of urls) { if (my !== sayTok) return; await playUrl(u, Math.max(1, rate) * 1.08); } return; }
  }
  return tts(text, .85 * rate);
}
/* meaning of any dictionary form (accused, abundance …) */
let FORMS = null;
function formMeaning(text) {
  if (!FORMS) { FORMS = new Map(); try { DSRC.entries().forEach(e => e.forms.forEach(([f, m]) => { const k = norm(f); if (m && !FORMS.has(k)) FORMS.set(k, m); })); } catch (e) { } }
  return FORMS.get(norm(text)) || null;
}
const sayBtn = (i, cls = '') => `<button class="say ${cls}" type="button" data-say="${i}" aria-label="استمع">${I.spk}</button>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]'); if (!b) return; e.stopPropagation();
  b.classList.add('playing'); say(+b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined).then(() => b.classList.remove('playing'));
}, true);

/* sound effects, synthesized */
let AC = null;
function tone(f, t0, dur, type = 'sine', vol = .16) {
  if (!G.sfx) return; try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .05);
  } catch (e) { }
}
const SFX = {
  ok: () => { tone(660, 0, .14, 'triangle'); tone(990, .09, .22, 'triangle'); },
  no: () => { tone(220, 0, .22, 'square', .07); tone(180, .1, .25, 'square', .06); },
  pop: () => { tone(880, 0, .08, 'sine', .12); tone(1320, .03, .08, 'sine', .08); },
  tap: () => tone(520, 0, .06, 'triangle', .08),
  combo: () => [523, 659, 784, 1046].forEach((f, k) => tone(f, k * .07, .2, 'triangle', .13)),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, k * .11, .35, 'triangle', .14)),
  flip: () => tone(400, 0, .07, 'sine', .08),
};

/* ---------- small fx ---------- */
function toast(msg) { $$('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); }
function flyXP(n, el) { if (reduce) return; const r = (el || document.body).getBoundingClientRect(); const f = document.createElement('div'); f.className = 'fly'; f.textContent = '+' + n; f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (el ? r.top : innerHeight / 2) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 950); }
function burst(txt) { const b = document.createElement('div'); b.className = 'burst'; b.textContent = txt; document.body.appendChild(b); setTimeout(() => b.remove(), 1150); }
function confetti() {
  if (reduce) return; const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement), cols = ['--grape', '--mint', '--sun', '--coral', '--sky'].map(v => cs.getPropertyValue(v).trim());
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: rnd(cols) }));
  const t0 = performance.now();
  (function f(t) { x.clearRect(0, 0, innerWidth, innerHeight); ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }); if (t - t0 < 2600) requestAnimationFrame(f); else c.remove(); })(t0);
}
const starsRow = (n, sz) => `<span class="stars" aria-label="${n} نجوم">${[0, 1, 2].map(k => `<span class="${k < n ? 'on' : 'off'}">${I.star}</span>`).join('')}</span>`;
const PRAISE = ['ممتاز!', 'برافو!', 'عاش!', 'كفو!', 'صح عليك!', 'يا سلام!', 'بطل!'];
const SOFT = ['قريبة!', 'ولا يهمك', 'بتصير معك', 'مش مشكلة'];

/* ---------- shell ---------- */
let TAB = 'map', VIEWN = null;
try { const h = location.hash.slice(1); if (['map', 'gram', 'dict', 'review', 'arcade', 'me'].includes(h)) TAB = h; } catch (e) { }
const TABS = [['map', 'الرحلة', I.map], ['gram', 'القواعد', I.book], ['review', 'المراجعة', I.chest], ['dict', 'القاموس', I.search], ['arcade', 'الألعاب', I.joy], ['me', 'أنا', I.me]];
function dueAll() { const d = DAY(); return Object.keys(ST.w).map(Number).filter(i => ST.w[i].seen && ST.w[i].due <= d); }
function shell(inner) {
  const L = lvlInfo(), sk = streakNow(), due = dueAll().length;
  app.innerHTML = `<header class="top"><div class="in">
      <button class="ava" type="button" data-tab="me" aria-label="ملفي">${myAv()}</button>
      <div class="lvl grow"><b>مستوى ${AR(L.l)}</b><small>${L.rank}</small></div>
      <span class="chipst ${sk ? 'fire' : 'cold'}" title="أيام متتالية">${I.flame}<span class="num">${sk}</span></span>
      <span class="chipst gem" title="جواهر">${I.gem}<span class="num">${G.gems}</span></span>
    </div></header>
    <main class="wrap" id="main">${inner}</main>
    <nav class="tabs"><div class="in">${TABS.map(([k, n, ic]) => `<button class="tab" type="button" data-tab="${k}" ${TAB === k ? 'aria-current="page"' : ''}><span class="ti">${ic}</span>${n}${k === 'review' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</button>`).join('')}</div></nav>`;
  $$('[data-tab]').forEach(b => b.onclick = () => { TAB = b.dataset.tab; try { history.replaceState(null, '', '#' + TAB); } catch (e) { } render(); scrollTo(0, 0); });
}
function render() { ({ map: viewMap, gram: viewGram, dict: viewDict, review: viewReview, arcade: viewArcade, me: viewMe }[TAB] || viewMap)(); }

/* ---------- journey map ---------- */
function missionCard() {
  const T = ensureToday(), s = STORIES[T.n - 1], steps = missionSteps(), done = steps.filter(x => x.done).length, nowK = steps.findIndex(x => !x.done);
  const C = 2 * Math.PI * 27, pc = done / steps.length;
  return `<section class="mission ${HUE(T.n)}">
    <div class="row" style="position:relative;z-index:1;align-items:flex-start">
      <div class="grow"><div class="k">مهمة اليوم · القصة ${AR(T.n)} من ${AR(STORIES.length)}</div><h1>${esc(s.ar.replace(/[ً-ْ]/g, ''))}</h1><div class="ttl">${esc(s.en)}</div></div>
      <div class="ring"><svg viewBox="0 0 66 66"><circle cx="33" cy="33" r="27" fill="none" stroke="rgb(255 255 255 / .3)" stroke-width="8"/><circle cx="33" cy="33" r="27" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pc)}"/></svg><span>${done}/${steps.length}</span></div>
    </div>
    ${nowK < 0 ? `<div class="celebrate"><span style="font-size:30px">🏆</span><div class="grow">أتقنت قصة اليوم! بكرة بنراجعها وبنبدأ قصة جديدة.</div></div>` : ''}
    <div class="pips">${steps.map((x, k) => `<span class="${x.done ? 'd' : k === nowK ? 'n' : ''}" title="${x.title}"></span>`).join('')}</div>
    ${nowK >= 0 ? (() => { const x = steps[nowK]; return `<div class="steps"><button class="step now" type="button" data-step="${nowK}">
        <span class="sc">${x.kind === 'rev' ? I.chest : x.kind === 'boss' ? I.crown : x.kind === 'gram' ? I.book : AR(x.k + 1)}</span>
        <span class="grow"><b>${x.kind === 'rev' ? 'أول إشي: ' : 'هلّق: '}${x.title}</b><small>${x.sub}</small></span><span class="go">يلا ←</span></button></div>`; })() : ''}
  </section>`;
}
function startStep(k) {
  const T = ensureToday(), x = missionSteps()[k]; if (!x) return;
  if (x.kind === 'rev') return startReview(T.rd < T.rev.length ? T.rev.slice(T.rd, T.rd + 12) : T.rev.slice(0, 12), true, T.grd ? [] : T.grev);
  if (x.kind === 'gram') return lesson(T.g);
  if (x.kind === 'st') { if (!stationOpen(T.n, x.k)) return toast('خلّص المحطة اللي قبلها أول'); return startStation(T.n, x.k); }
  if (!bossOpen(T.n)) return toast('تحدي القصة بيفتح لما تخلص كل المحطات');
  theatre(T.n);
}
function mapHtml(n) {
  const st = stations(n), rows = st.length + 1, X = [50, 74, 60, 32, 22, 44, 68];
  let cur = st.findIndex((_, k) => !G.stars[n + '-' + k]); if (cur < 0) cur = storyDone(n) ? -1 : st.length;
  const pts = Array.from({ length: rows }, (_, r) => [100 - X[r % X.length], r * 104 + 45]);
  let d = `M${pts[0][0]} ${pts[0][1]}`; for (let k = 1; k < pts.length; k++) { const [a, b] = pts[k - 1], [c, e] = pts[k], m = (b + e) / 2; d += ` C${a} ${m} ${c} ${m} ${c} ${e}`; }
  const node = (r, inner, cls, lab, extra, attrs) => `<div class="node-row"><div class="node ${cls}" style="right:${X[r % X.length]}%">${extra}<button class="nb" type="button" ${attrs}>${inner}</button><span class="lab">${lab}</span></div></div>`;
  return `<div class="map ${HUE(n)}" style="height:${rows * 104}px"><svg class="path" viewBox="0 0 100 ${rows * 104}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 16" vector-effect="non-scaling-stroke"/></svg>
    ${st.map((g, k) => { const s = G.stars[n + '-' + k] || 0, open = stationOpen(n, k), isCur = k === cur;
      return node(k, open ? (s ? AR(k + 1) : AR(k + 1)) : I.lock, `${open ? '' : 'lock'} ${isCur ? 'cur' : ''}`, `${s ? starsRow(s) : `المحطة ${AR(k + 1)}`}`, isCur ? `<span class="tip">ابدأ</span>` : '', `data-st="${k}" aria-label="المحطة ${k + 1}"`); }).join('')}
    ${node(st.length, bossOpen(n) ? I.crown : I.lock, `boss ${bossOpen(n) ? '' : 'lock'} ${cur === st.length ? 'cur' : ''}`, storyDone(n) ? 'تمّ الإتقان ✓' : 'تحدي القصة', cur === st.length ? `<span class="tip">التحدي!</span>` : '', `data-boss="1" aria-label="تحدي القصة"`)}
  </div>`;
}
function viewMap() {
  const T = ensureToday(); if (VIEWN == null) VIEWN = T.n;
  const n = VIEWN, s = STORIES[n - 1];
  shell(`${missionCard()}
    <section class="sec">
      <div class="chap">
        <button class="nav" type="button" id="cprev" ${n <= 1 ? 'disabled' : ''} aria-label="القصة السابقة">${I.prev}</button>
        <div class="mid"><b>القصة ${AR(n)}${storyDone(n) ? ' · متقنة' : ''}</b><span class="en">${esc(s.en)}</span></div>
        <button class="nav" type="button" id="cnext" ${n >= STORIES.length ? 'disabled' : ''} aria-label="القصة التالية">${I.next}</button>
      </div>
      ${chapterOpen(n) ? mapHtml(n) : `<div class="panel" style="text-align:center;display:grid;gap:8px;justify-items:center"><span style="color:var(--muted)">${I.lock}</span><b>هالقصة مقفلة لسا</b><span class="muted">بتنفتح لما تتقن القصة اللي قبلها.</span></div>`}
      ${n !== T.n ? `<button class="btn sm" type="button" id="make-today" style="justify-self:center">📌 خلّيها قصة اليوم</button>` : ''}
      <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn ghost sm" type="button" id="story-read">${I.book} اسمع القصة واقرأها</button><button class="btn sm" type="button" id="story-words">🎧 كلمات القصة</button></div>
    </section>`);
  $$('[data-step]').forEach(b => b.onclick = () => startStep(+b.dataset.step));
  $('#cprev').onclick = () => { VIEWN = Math.max(1, n - 1); render(); };
  $('#cnext').onclick = () => { VIEWN = Math.min(STORIES.length, n + 1); render(); };
  $$('[data-st]').forEach(b => b.onclick = () => { const k = +b.dataset.st; if (!stationOpen(n, k)) return toast('خلّص المحطة اللي قبلها أول'); startStation(n, k); });
  $$('[data-boss]').forEach(b => b.onclick = () => { if (!bossOpen(n)) return toast('تحدي القصة بيفتح لما تخلص كل المحطات'); theatre(n); });
  $('#story-read').onclick = () => { if (!chapterOpen(n)) return toast('القصة مقفلة لسا'); theatre(n, true); };
  $('#story-words').onclick = () => storyWords(n);
  const mt = $('#make-today'); if (mt) mt.onclick = () => { const T2 = ensureToday(); T2.n = n; T2.rev = T2.rev.filter(i => W[i].s !== n); save(); SFX.tap(); toast('تمام! صارت قصة اليوم'); render(); scrollTo(0, 0); };
}

/* ---------- review chest ---------- */
function viewReview() {
  const due = dueAll(), weak = Object.keys(ST.w).map(Number).filter(isWeak).sort((a, b) => wordScore(b) - wordScore(a));
  const learned = Object.keys(ST.w).filter(i => ST.w[i].seen).length;
  shell(`<section class="panel chest ${due.length ? 'ready' : ''}">
      <div class="big">${due.length ? '🎁' : '📦'}</div>
      <div style="display:grid;gap:6px"><h2 style="font-size:22px">${due.length ? `${AR(due.length)} كلمة جاهزة للمراجعة` : 'الصندوق فاضي هلّق'}</h2>
      <span class="muted">${due.length ? 'كل جولة ١٢ كلمة بألعاب سريعة. كل كلمة بتثبّتها بتبعد مراجعتها أكتر.' : 'رجعلي بكرة! الكلمات بترجع لما يجي وقتها.'}</span>
      ${due.length ? `<button class="btn sm" type="button" id="open-chest" style="justify-self:start">افتح الصندوق</button>` : ''}</div>
    </section>
    <section class="kpis">
      <div class="kpi"><b>${learned}</b><span>كلمة تعرّفت عليها</span></div>
      <div class="kpi"><b>${Object.keys(ST.w).filter(i => ST.w[i].st >= 5).length}</b><span>كلمة محفوظة</span></div>
      <div class="kpi"><b>${weak.length}</b><span>كلمة بدها شغل</span></div>
    </section>
    ${(() => { const hs = Object.keys(ST.w).map(Number).filter(i => ST.w[i].seen && isHard(i)), left = hs.filter(i => ST.w[i].st < 5); return hs.length ? `<section class="panel" style="display:grid;gap:10px"><div class="row"><span style="font-size:34px">💪</span><div class="grow"><b style="font-size:18px">الكلمات الصعبة (B2 وC)</b><div class="muted" style="font-size:14px">${AR(hs.length)} كلمة صعبة مرّت عليك، ${AR(left.length)} منها لسا ما انحفظت منيح</div></div></div><button class="btn sm h3" type="button" id="drill-hard" style="justify-self:start">قوّيها هلّق</button></section>` : ''; })()}
    ${weak.length ? `<section class="sec"><div class="sec-h"><h2>كلمات بتعاندك</h2><button class="btn sm h3" type="button" id="drill-weak">درّبها</button></div>
      <div class="wlist">${weak.slice(0, 12).map(i => `<div class="wl">${sayBtn(i, 'sm')}<span class="w en grow">${esc(W[i].w)}</span>${lvBadge(i)}<span class="m">${esc(W[i].m)}</span></div>`).join('')}</div></section>` : ''}`);
  const oc = $('#open-chest'); if (oc) oc.onclick = () => startReview(shuffle(due.sort((a, b) => wordScore(b) - wordScore(a)).slice(0, 24)).slice(0, 12));
  const dw = $('#drill-weak'); if (dw) dw.onclick = () => startReview(weak.slice(0, 10));
  const dh = $('#drill-hard'); if (dh) dh.onclick = () => { const hs = Object.keys(ST.w).map(Number).filter(i => ST.w[i].seen && isHard(i)).sort((a, b) => ST.w[a].st - ST.w[b].st || wordScore(b) - wordScore(a)); startReview(shuffle(hs.slice(0, 20)).slice(0, 10)); };
}

/* ---------- arcade ---------- */
function pool(min = 12) {
  let p = Object.keys(ST.w).map(Number).filter(i => ST.w[i].seen);
  if (p.length < min) { const n = ensureToday().n; p = [...new Set([...p, ...STORIES[n - 1].words.slice(0, 24), ...STORIES[0].words.slice(0, 24)])]; }
  return [...p, ...p.filter(isHard), ...p.filter(isHard)];
}
function viewArcade() {
  const b = k => G.best[k] ? `<span class="best">أفضل: ${G.best[k]}</span>` : '';
  shell(`<section class="sec"><div class="sec-h"><h2>صالة الألعاب</h2></div>
    <p class="muted" style="margin:0">ألعاب سريعة بالكلمات اللي تعلّمتها. كل لعبة بتعطيك جواهر.</p>
    <div class="games">
      <button class="game h3" type="button" data-g="rush">${b('rush')}<span class="gi">⚡</span><span><b>سباق الدقيقة</b><small>صح ولا غلط؟ جاوب قد ما بتقدر بـ٦٠ ثانية</small></span></button>
      <button class="game h4" type="button" data-g="rain">${b('rain')}<span class="gi">🌧️</span><span><b>مطر الكلمات</b><small>التقط الكلمة الصح قبل ما توقع</small></span></button>
      <button class="game h1" type="button" data-g="mem">${b('mem')}<span class="gi">🃏</span><span><b>لعبة الذاكرة</b><small>اقلب الكروت ولاقي كل كلمة مع معناها</small></span></button>
      <button class="game h0" type="button" data-g="ear">${b('ear')}<span class="gi">🎧</span><span><b>تحدي السمع</b><small>اسمع الكلمة واختار معناها</small></span></button>
      <button class="game h2" type="button" data-g="bub">${b('bub')}<span class="gi">🫧</span><span><b>فقّع الفقاعة</b><small>فقّع الفقاعة اللي فيها الكلمة الصح</small></span></button>
      <button class="game h0" type="button" data-g="build">${b('build')}<span class="gi">🧩</span><span><b>ركّب الكلمة</b><small>رتّب الحروف وتمرّن على الكتابة</small></span></button>
      <button class="game h1" type="button" data-g="radar">${b('radar')}<span class="gi">🕵️</span><span><b>رادار الأغلاط</b><small>جملة صح ولا فيها غلطة قواعد؟ بـ٦٠ ثانية</small></span></button>
      <button class="game h4" type="button" data-g="sent">${b('sent')}<span class="gi">🧱</span><span><b>ابنِ الجملة</b><small>رتّب كلمات الجمل من دروس القواعد</small></span></button>
    </div></section>`);
  $$('[data-g]').forEach(btn => btn.onclick = () => {
    const g = btn.dataset.g, pw = shuffle(pool()), p = [...new Set(pw)];
    if (g === 'rush') return rush(pw);
    if (g === 'radar') return radar();
    if (g === 'sent') { const ls = gPool(); const qs = shuffle(ls.flatMap(l => l.q.filter(q => q[0] === 'ord' || q[0] === 'tr').map(q => gRound(l, q)))).filter(Boolean).slice(0, 8); return qs.length ? play({ kind: 'arcade', key: 'sent', title: 'ابنِ الجملة', hue: 'h4', q: qs }) : toast('خلّص أول درس قواعد'); }
    if (g === 'rain') return rain(pw);
    if (g === 'mem') return memory(p);
    if (g === 'ear') return play({ kind: 'arcade', key: 'ear', title: 'تحدي السمع', hue: 'h0', q: p.slice(0, 10).map(i => ({ t: 'listen', i })) });
    if (g === 'bub') return play({ kind: 'arcade', key: 'bub', title: 'فقّع الفقاعة', hue: 'h2', q: p.slice(0, 10).map(i => ({ t: 'bubble', i })) });
    const bp = p.filter(canBuild); return play({ kind: 'arcade', key: 'build', title: 'ركّب الكلمة', hue: 'h0', q: (bp.length >= 6 ? bp : p).slice(0, 8).map(i => ({ t: canBuild(i) ? 'build' : 'bubble', i })) });
  });
}

/* ---------- me ---------- */
function viewMe() {
  const L = lvlInfo(), learned = Object.keys(ST.w).filter(i => ST.w[i].seen).length, mastered = Object.keys(G.done).length;
  const d = DAY(), week = Array.from({ length: 7 }, (_, k) => G.xpd[d - 6 + k] || 0), mx = Math.max(60, ...week);
  const dn = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  shell(`<section class="panel" style="display:grid;gap:12px;justify-items:center;text-align:center">
      <div style="font-size:72px;line-height:1">${myAv()}</div>
      <div><h1 style="font-size:24px">${L.rank} · مستوى ${AR(L.l)}</h1><span class="muted num">${L.x} / ${L.need} XP للمستوى الجاي</span></div>
      <div class="bar h2" style="width:100%"><i style="width:${Math.round(100 * L.x / L.need)}%"></i></div>
    </section>
    <section class="kpis">
      <div class="kpi"><b>${mastered}</b><span>قصة متقنة</span></div>
      <div class="kpi"><b>${learned}</b><span>كلمة تعلّمتها</span></div>
      <div class="kpi"><b>${Math.max(G.bestStreak || 0, streakNow())}</b><span>أطول سلسلة أيام</span></div>
    </section>
    <section class="panel" style="display:grid;gap:10px"><b>نقاطك هالأسبوع</b>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:110px">${week.map((v, k) => `<div style="display:grid;gap:4px;justify-items:center;align-content:end;height:100%"><span class="num" style="font-size:12px;color:var(--muted)">${v || ''}</span><div style="width:100%;border-radius:8px;height:${Math.max(6, Math.round(76 * v / mx))}px;background:${k === 6 ? 'var(--grape)' : 'color-mix(in srgb,var(--grape) 35%,var(--sunk))'}"></div><span style="font-size:11.5px;color:var(--muted)">${dn[new Date((d - 6 + k) * 864e5).getUTCDay()]}</span></div>`).join('')}</div>
    </section>
    <section class="sec"><div class="sec-h"><h2>اختار شخصيتك</h2><span class="chipst gem">${I.gem}<span class="num">${G.gems}</span></span></div>
      <div class="shop">${AVS.map(([e, c], k) => { const own = G.own.includes(k); return `<button class="av ${G.av === k ? 'sel' : ''} ${own ? '' : 'lockd'}" type="button" data-av="${k}"><span class="e">${e}</span><small>${own ? (G.av === k ? 'معك' : 'اختار') : `${I.gem}${c}`}</small></button>`; }).join('')}</div>
    </section>
    <section class="panel">
      <div class="setrow"><span class="grow">أصوات اللعبة</span><button class="switch" type="button" role="switch" id="sfx" aria-checked="${G.sfx}" aria-label="أصوات اللعبة"></button></div>
      <div class="setrow"><span class="grow">سرعة نطق الكلمات</span><div class="seg">${[[.75, 'بطيء'], [1, 'عادي']].map(([v, l]) => `<button type="button" data-wr="${v}" aria-pressed="${G.wrate === v}">${l}</button>`).join('')}</div></div>
      <div class="setrow"><span class="grow">سرعة القصة</span><div class="seg">${[[.8, '٠٫٨'], [1, '١'], [1.2, '١٫٢']].map(([v, l]) => `<button type="button" data-sr="${v}" aria-pressed="${G.srate === v}">${l}</button>`).join('')}</div></div>
    </section>`);
  $$('[data-av]').forEach(b => b.onclick = () => {
    const k = +b.dataset.av; if (G.own.includes(k)) { G.av = k; save(); SFX.tap(); return render(); }
    const c = AVS[k][1]; if (G.gems < c) return toast(`بدك ${c - G.gems} جوهرة كمان. العب وجمّع!`);
    G.gems -= c; G.own.push(k); G.av = k; save(); SFX.win(); confetti(); render();
  });
  $('#sfx').onclick = () => { G.sfx = !G.sfx; save(); render(); };
  $$('[data-wr]').forEach(b => b.onclick = () => { G.wrate = +b.dataset.wr; save(); render(); });
  $$('[data-sr]').forEach(b => b.onclick = () => { G.srate = +b.dataset.sr; save(); render(); });
}

/* ---------- building sessions ---------- */
function startStation(n, k) {
  const ids = stations(n)[k], first = !G.stars[n + '-' + k] || ids.some(i => !known(i)); prefetch(ids);
  const q = [];
  const chunks = ids.length > 5 ? [ids.slice(0, Math.ceil(ids.length / 2)), ids.slice(Math.ceil(ids.length / 2))] : [ids];
  chunks.forEach(ch => {
    if (first) ch.forEach(i => q.push({ t: 'intro', i }));
    q.push({ t: 'match', ids: ch });
    shuffle(ch).forEach((i, j) => q.push({ t: j % 2 ? 'bubble' : 'listen', i }));
  });
  shuffle(ids).forEach(i => q.push({ t: canBuild(i) && Math.random() < .55 ? 'build' : exSentence(i) ? 'gap' : 'bubble', i }));
  /* B2/C words: two more rounds each, spread through the second half */
  const hard = ids.filter(isHard);
  hard.forEach(i => { const extra = [{ t: 'listen', i, hard: 1 }, { t: canBuild(i) ? 'build' : exSentence(i) ? 'gap' : 'bubble', i, hard: 1 }];
    extra.forEach(r => q.splice(Math.floor(q.length / 2) + (Math.random() * (q.length / 2) | 0), 0, r)); });
  play({ kind: 'station', n, k, title: `المحطة ${AR(k + 1)}`, hue: HUE(n), q });
}
function reviewRound(i) {
  const s = weakSkill(i);
  if (s === 1) return { t: 'listen', i };
  if (s === 2) return { t: canBuild(i) ? 'build' : exSentence(i) ? 'gap' : 'bubble', i };
  return { t: exSentence(i) && Math.random() < .5 ? 'gap' : 'bubble', i };
}
function startReview(ids, mission, gids = []) {
  if (!ids.length && !gids.length) return toast('ما في كلمات للمراجعة هلّق');
  prefetch(ids);
  const q = []; const firstHalf = ids.slice(0, Math.min(5, ids.length));
  if (ids.length >= 4) q.push({ t: 'match', ids: firstHalf });
  ids.forEach(i => { if (!(ids.length >= 4 && firstHalf.includes(i))) q.push(reviewRound(i)); });
  shuffle(firstHalf).forEach(i => q.push(reviewRound(i)));
  ids.filter(isHard).forEach(i => q.splice(Math.random() * (q.length + 1) | 0, 0, Object.assign(reviewRound(i), { hard: 1 })));
  gids.forEach(id => { const r = gRound(LBY.get(id), rnd(LBY.get(id).q.filter(q => q[0] !== 'rule')) || rnd(LBY.get(id).q)); if (r) { r.grev = id; q.splice(Math.random() * (q.length + 1) | 0, 0, r); } });
  play({ kind: 'review', mission, ids, gids, title: 'مراجعة', hue: 'h4', q });
}

/* ---------- play deck ---------- */
let D = null; // current session
function deckEl() { let d = $('.deck'); if (!d) { d = document.createElement('div'); d.className = 'deck'; d.setAttribute('role', 'dialog'); document.body.appendChild(d); document.body.style.overflow = 'hidden'; } return d; }
function closeDeck() { stopAudio(); stopStory(); try { GA.pause(); } catch (e) { } $$('.deck,.fb,.dock,.pop-w,.scrim').forEach(e => e.remove()); document.body.style.overflow = ''; D = null; render(); }
function play(cfg) {
  D = Object.assign({}, cfg, { k: 0, n: 0, ok: 0, combo: 0, maxc: 0, xp: 0, retried: new Set(), words: new Set(), n0: cfg.n, k0: cfg.k });
  D.q = cfg.q.slice(); D.total = D.q.length;
  renderRound();
}
function topHtml() {
  const pc = Math.round(100 * D.k / D.q.length);
  return `<div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="pbar"><i style="width:${pc}%"></i></div><span class="combo ${D.combo >= 2 ? '' : 'zero'}">${I.flame}<span class="num">${D.combo}</span></span></div>`;
}
function bindQuit() { $('#quit').onclick = () => quitSheet(); }
function quitSheet() {
  if ($('.pop-w')) return;
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in" style="text-align:center"><div style="font-size:48px">${myAv()}</div><h2>بدك تطلع هلّق؟</h2><p class="muted" style="margin:0">الكلمات اللي جاوبتها انحفظت، بس النجوم ما بتنحسب إلا لما تخلّص.</p><button class="btn" type="button" id="stay">لا، بكمّل!</button><button class="btn ghost" type="button" id="leave">اطلع</button></div>`;
  document.body.append(sc, p);
  const off = () => { sc.remove(); p.remove(); };
  sc.onclick = off; $('#stay', p).onclick = off; $('#leave', p).onclick = () => { off(); closeDeck(); };
}
function renderRound() {
  $$('.fb,.dock').forEach(e => e.remove());
  if (D.k >= D.q.length) return finish();
  const it = D.q[D.k], d = deckEl();
  d.className = 'deck ' + (D.hue || '');
  d.innerHTML = `<div class="in pop-in">${topHtml()}<div id="rbody" style="display:grid;gap:18px"></div></div>`;
  d.scrollTop = 0; bindQuit();
  ({ intro: rIntro, match: rMatch, bubble: rBubble, listen: rListen, build: rBuild, gap: rGap, gq: rGq, gord: rGord, gtf: rGtf, gcls: rGcls, gsil: rGsil, gstress: rGstress }[it.t] || rBubble)(it, $('#rbody', d));
}
function nextRound() { D.k++; renderRound(); }
/* one answer */
const SKILL = { bubble: 0, gap: 0, match: 0, listen: 1, build: 2 };
function scored(it, i, ok, hinted) {
  D.n++; if (ok) D.ok++; D.words.add(i);
  record(i, SKILL[it.t] ?? 0, ok, { hinted: hinted || it.retry, noSrs: D.kind === 'arcade' && !ST.w[i]?.seen });
  if (ok) {
    D.combo++; D.maxc = Math.max(D.maxc, D.combo);
    let x = 10; if ([3, 5, 8, 12, 16, 20].includes(D.combo)) { x += D.combo * 2; setTimeout(() => { burst(`كومبو ×${D.combo}!`); SFX.combo(); }, 250); }
    D.xp += x; addXP(x); return x;
  }
  D.combo = 0;
  if (!it.retry && !D.retried.has(i) && D.kind !== 'arcade') { D.retried.add(i); const at = Math.min(D.q.length, D.k + 3); D.q.splice(at, 0, { t: it.t === 'build' ? 'build' : rnd(['bubble', 'listen']), i, retry: true }); }
  return 0;
}
function feedback(ok, i, xp, extra = '') {
  const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no');
  f.innerHTML = `<div class="in">
    <div class="fbt">${ok ? I.check : ''}${ok ? rnd(PRAISE) : rnd(SOFT)}${ok && xp ? `<span class="num" style="margin-inline-start:auto;font-size:18px;color:var(--sun-d)">+${xp} XP</span>` : ''}</div>
    ${ok ? '' : `<div class="row">${sayBtn(i, 'sm')}<div class="fbx grow">الجواب: <span class="en">${esc(W[i].w)}</span> = ${esc(W[i].m)}${extra}</div></div>`}
    <button class="btn ${ok ? 'good' : 'bad'}" type="button" id="cont">كمّل</button></div>`;
  document.body.appendChild(f);
  let gone = false; const go = () => { if (gone) return; gone = true; nextRound(); };
  $('#cont', f).onclick = go;
  if (ok) { SFX.ok(); setTimeout(go, 1150); } else { SFX.no(); say(i); }
}
function opts3(i, n = 3, by = 'm') {
  const w = W[i], st = STORIES[w.s - 1].words, seen = new Set([by === 'm' ? w.m : w.k]), out = [i];
  for (const j of shuffle([...(ST.cf[i] || []), ...st, ...shuffle(pool()).slice(0, 30)])) {
    if (out.length >= n) break; const key = by === 'm' ? W[j].m : W[j].k; if (j === i || seen.has(key)) continue; seen.add(key); out.push(j);
  }
  return shuffle(out);
}
function hintBtn(onHint) { return `<button class="btn ghost sm" type="button" id="hint" style="justify-self:center">${I.bulb} مساعدة</button>`; }

/* intro: meet a new word */
function rIntro(it, el) {
  const w = W[it.i]; meet(it.i);
  el.innerHTML = `<div class="ask">كلمة جديدة! ${lvBadge(it.i)}<small>${isHard(it.i) ? '💪 كلمة صعبة: رح ترجعلك أكتر من مرة بهالمحطة وبالمراجعة' : 'اسمعها، شوف معناها، وتخيّلها بالقصة'}</small></div>
    <div class="card"><div class="row" style="justify-content:center">${sayBtn(it.i)}<button class="say sm" type="button" data-say="${it.i}" data-rate=".7" aria-label="استمع ببطء" style="background:var(--mint);box-shadow:0 4px 0 var(--mint-d)">${I.turtle}</button></div>
      <div class="big-en">${esc(w.w)}</div><div class="pron">${esc(w.p)}</div><div class="big-ar">${esc(w.m)}</div>${exHtml(it.i)}</div>`;
  const dk = document.createElement('div'); dk.className = 'dock'; dk.innerHTML = `<div class="in"><button class="btn" type="button" id="got">حفظتها! ←</button></div>`; document.body.appendChild(dk);
  $('#got', dk).onclick = () => { SFX.tap(); nextRound(); };
  setTimeout(() => D && D.q[D.k] === it && say(it.i), 250);
}
/* multiple-choice core */
function mc(el, it, choices, labelOf, isEn, after) {
  const box = $('.opts', el);
  box.innerHTML = choices.map(j => `<button class="opt ${isEn ? 'en' : ''}" type="button" data-o="${j}">${esc(labelOf(j))}</button>`).join('');
  let hinted = false, done = false;
  const hb = $('#hint', el); if (hb) hb.onclick = () => { const wrong = $$('.opt:not(.gone)', box).filter(b => +b.dataset.o !== it.i); if (wrong.length > 1) { rnd(wrong).classList.add('gone'); hinted = true; SFX.tap(); } hb.disabled = wrong.length <= 2; };
  $$('.opt', box).forEach(b => b.onclick = () => {
    if (done) return; done = true; const j = +b.dataset.o, ok = j === it.i;
    $$('.opt', box).forEach(x => { x.disabled = true; if (+x.dataset.o === it.i) x.classList.add('ok'); });
    if (!ok) { b.classList.add('no', 'shake'); logConf(it.i, j); }
    const xp = scored(it, it.i, ok, hinted); if (ok) flyXP(xp, b); after && after(ok, b); feedback(ok, it.i, xp);
  });
}
function logConf(i, j) { const a = ST.cf[i] || (ST.cf[i] = []); if (!a.includes(j)) a.unshift(j); ST.cf[i] = a.slice(0, 4); save(); }
function rListen(it, el) {
  el.innerHTML = `<div class="ask">شو معنى الكلمة اللي سمعتها؟</div>
    <div class="card" style="padding:26px"><div class="row" style="justify-content:center;gap:16px">${sayBtn(it.i, 'huge')}<button class="say" type="button" data-say="${it.i}" data-rate=".7" aria-label="ببطء" style="background:var(--mint);box-shadow:0 5px 0 var(--mint-d)">${I.turtle}</button></div></div>
    <div class="opts"></div>${hintBtn()}`;
  mc(el, it, opts3(it.i, 3), j => W[j].m, false);
  setTimeout(() => { const b = $('.say.huge', el); if (b && D && D.q[D.k] === it) b.click(); }, 300);
}
function rBubble(it, el) {
  const ch = opts3(it.i, 4, 'k');
  el.innerHTML = `<div class="ask">فقّع فقاعة: <span style="color:var(--grape)">${esc(W[it.i].m)}</span><small>اضغط على الفقاعة اللي فيها الكلمة الإنجليزية الصح</small></div>
    <div class="pond" id="pond"></div>${hintBtn()}`;
  const pond = $('#pond', el), spots = shuffle([[6, 8], [52, 4], [10, 52], [56, 50]]);
  pond.innerHTML = ch.map((j, k) => `<button class="bub" type="button" data-o="${j}" style="right:${spots[k][0]}%;top:${spots[k][1]}%">${esc(W[j].w)}</button>`).join('');
  let hinted = false, done = false;
  $('#hint', el).onclick = e => { const wrong = $$('.bub:not(.pop)', pond).filter(b => +b.dataset.o !== it.i); if (wrong.length > 1) { rnd(wrong).classList.add('pop'); hinted = true; SFX.pop(); } e.currentTarget.disabled = wrong.length <= 2; };
  $$('.bub', pond).forEach(b => b.onclick = () => {
    if (done) return; done = true; const j = +b.dataset.o, ok = j === it.i;
    if (ok) { b.classList.add('ok'); SFX.pop(); say(it.i); setTimeout(() => b.classList.add('pop'), 200); }
    else { b.classList.add('no'); logConf(it.i, j); const r = $(`.bub[data-o="${it.i}"]`, pond); r && r.classList.add('ok'); }
    const xp = scored(it, it.i, ok, hinted); if (ok) flyXP(xp, b); setTimeout(() => feedback(ok, it.i, xp), ok ? 350 : 150);
  });
}
function rGap(it, el) {
  const w = W[it.i], e = exSentence(it.i); if (!e) return rBubble(it, el);
  const st = STORIES[w.s - 1].words.filter(j => j !== it.i && W[j].ex && W[j].ex[2] && norm(W[j].ex[2]) !== norm(e.span));
  const ch = shuffle([it.i, ...shuffle(st).slice(0, 2)]);
  el.innerHTML = `<div class="ask">كمّل الجملة من القصة<small>الكلمة الناقصة معناها: <b style="color:var(--grape)">${esc(w.m)}</b></small></div>${exHtml(it.i, true)}<div class="opts"></div>${hintBtn()}`;
  mc(el, it, ch, j => j === it.i ? e.span : W[j].ex[2], true, ok => { const g = $('.gap', el); if (g) { g.textContent = e.span; g.style.color = ok ? 'var(--good)' : 'var(--bad)'; } });
}
function rMatch(it, el) {
  const ids = it.ids.slice(0, 5), L = shuffle(ids), R = shuffle(ids), miss = new Set(); let sel = null, left = ids.length;
  el.innerHTML = `<div class="ask">وصّل كل كلمة بمعناها<small>اضغط على كلمة وبعدين على معناها</small></div>
    <div class="match"><div class="col">${L.map(i => `<button class="opt en" type="button" data-side="e" data-o="${i}">${esc(W[i].w)}</button>`).join('')}</div>
    <div class="col">${R.map(i => `<button class="opt" type="button" data-side="a" data-o="${i}">${esc(W[i].m)}</button>`).join('')}</div></div>`;
  $$('.match .opt', el).forEach(b => b.onclick = () => {
    if (b.classList.contains('done')) return;
    if (b.dataset.side === 'e') say(+b.dataset.o); else SFX.tap();
    if (!sel || sel.dataset.side === b.dataset.side) { $$('.match .opt.sel', el).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
    const a = +sel.dataset.o, c = +b.dataset.o, s = sel; sel = null;
    if (a === c) {
      [s, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); }); SFX.pop();
      const xp = scored({ t: 'match' }, a, !miss.has(a)); if (xp) flyXP(xp, b);
      setTimeout(() => { [s, b].forEach(x => x.classList.add('done')); }, 380);
      if (--left === 0) setTimeout(() => { SFX.ok(); burst('كلّه صح!'); setTimeout(nextRound, 700); }, 450);
    } else {
      const e = s.dataset.side === 'e' ? a : c; miss.add(e); miss.add(s.dataset.side === 'e' ? c : a);
      [s, b].forEach(x => { x.classList.remove('sel'); x.classList.add('no', 'shake'); setTimeout(() => x.classList.remove('no', 'shake'), 450); }); SFX.no(); D.combo = 0;
    }
  });
}
function rBuild(it, el) {
  const w = W[it.i]; if (!canBuild(it.i)) return rBubble(it, el);
  const word = w.w.toLowerCase(), letters = word.split(''), tiles = shuffle(letters.slice(1).map((c, k) => ({ c, k })));
  const filled = [letters[0]]; const from = [null]; let hinted = false, done = false;
  el.innerHTML = `<div class="ask">ركّب الكلمة: <span style="color:var(--grape)">${esc(w.m)}</span><small>أول حرف عليّ، والباقي عليك</small></div>
    <div class="card" style="gap:16px">${sayBtn(it.i)}<div class="slots" id="slots"></div></div>
    <div class="tiles" id="tiles">${tiles.map((t, k) => `<button class="tile" type="button" data-t="${k}">${t.c}</button>`).join('')}</div>
    <div class="tools"><button class="btn ghost sm" type="button" id="hint">${I.bulb} حرف</button><button class="btn ghost sm" type="button" id="undo">${I.back} امسح</button></div>`;
  const paint = () => { $('#slots', el).innerHTML = letters.map((_, k) => `<button type="button" class="slot ${k === 0 ? 'fix' : filled[k] ? 'f' : ''}" data-s="${k}">${filled[k] || ''}</button>`).join(''); $$('.slot', el).forEach(s => s.onclick = () => { const k = +s.dataset.s; if (k > 0 && k === filled.length - 1 && !done) undo(); }); };
  const put = k => { const t = $(`.tile[data-t="${k}"]`, el); if (!t || t.classList.contains('used') || done) return; t.classList.add('used'); filled.push(tiles[k].c); from.push(k); SFX.tap(); paint(); if (filled.length === letters.length) check(); };
  const undo = () => { if (filled.length <= 1 || done) return; filled.pop(); const k = from.pop(); const t = $(`.tile[data-t="${k}"]`, el); t && t.classList.remove('used'); paint(); };
  const check = () => {
    done = true; const ok = filled.join('') === word;
    if (!ok) $('#slots', el).classList.add('shake'); else $$('.slot', el).forEach(s => { s.style.borderBottomColor = 'var(--good)'; s.style.color = 'var(--good)'; });
    const xp = scored(it, it.i, ok, hinted); if (ok) { say(it.i); flyXP(xp, $('#slots', el)); }
    feedback(ok, it.i, xp);
  };
  $$('.tile', el).forEach(t => t.onclick = () => put(+t.dataset.t));
  $('#undo', el).onclick = undo;
  $('#hint', el).onclick = () => {
    // drop wrong letters, then place the right next one
    while (filled.length > 1 && filled.join('') !== word.slice(0, filled.length)) undo();
    const need = letters[filled.length]; const k = tiles.findIndex((t, j) => t.c === need && !$(`.tile[data-t="${j}"]`, el).classList.contains('used'));
    if (k >= 0) { hinted = true; put(k); }
  };
  paint();
}

/* results */
function finish() {
  $$('.fb,.dock').forEach(e => e.remove());
  const acc = D.n ? D.ok / D.n : 1, stars = acc >= .9 ? 3 : acc >= .7 ? 2 : 1;
  let gems = stars * 3, title = stars === 3 ? 'أداء أسطوري!' : stars === 2 ? 'شغل حلو!' : 'خلّصتها!', sub = '';
  const info = D.kind === 'gram' ? gramResult(stars) : D.kind === 'station' ? stationResult(stars) : D.kind === 'review' ? reviewResult() : D.kind === 'boss' ? bossResult(stars) : arcadeResult(stars);
  gems += info.gems || 0; G.gems += gems; addXP(20); D.xp += 20; save();
  const d = deckEl();
  d.innerHTML = `<div class="in"><div class="res ${D.hue || 'h0'}">
    <div style="font-size:60px;line-height:1">${myAv()}</div>
    <div class="bigstars">${[0, 1, 2].map(k => `<svg viewBox="0 0 24 24" class="${k < stars ? 'on' : ''}"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`).join('')}</div>
    <h1>${info.title || title}</h1>${info.sub ? `<p class="muted" style="margin:0">${info.sub}</p>` : ''}
    <div class="rk"><div class="h2"><b>${D.xp}</b><span>XP</span></div><div class="h4"><b>+${gems}</b><span>جواهر</span></div><div class="h3"><b>${Math.round(acc * 100)}%</b><span>دقّة</span></div></div>
    ${D.words.size ? `<div class="wlist" style="width:100%;text-align:start">${[...D.words].slice(0, 10).map(i => `<div class="wl">${sayBtn(i, 'sm')}<span class="w en grow">${esc(W[i].w)}</span>${lvBadge(i)}<span class="m">${esc(W[i].m)}</span></div>`).join('')}</div>` : ''}
    <div style="display:grid;gap:12px;width:100%">${info.btns}</div>
  </div></div>`;
  d.scrollTop = 0; SFX.win(); confetti();
  $$('[data-act]', d).forEach(b => b.onclick = () => info.act[b.dataset.act]());
}
function stationResult(stars) {
  const n = D.n0, k = D.k0, key = n + '-' + k, prev = G.stars[key] || 0; G.stars[key] = Math.max(prev, stars);
  const T = ensureToday(); const nxt = k + 1 < stations(n).length;
  const act = { map: closeDeck, again: () => { closeDeck(); startStation(n, k); }, next: () => { closeDeck(); nxt ? startStation(n, k + 1) : theatre(n); } };
  return {
    gems: prev ? 0 : 5, sub: nxt ? `المحطة ${AR(k + 2)} انفتحت!` : 'كل المحطات خلصت. تحدي القصة انفتح!',
    btns: `<button class="btn" type="button" data-act="next">${nxt ? 'المحطة الجاية ←' : 'لتحدي القصة ←'}</button>${stars < 3 ? `<button class="btn ghost" type="button" data-act="again">العبها كمان لـ٣ نجوم</button>` : ''}<button class="btn ghost" type="button" data-act="map">للخريطة</button>`, act, _t: T
  };
}
function reviewResult() {
  if (D.mission) { const T = ensureToday(); T.rd = Math.min(T.rev.length, T.rd + D.ids.length); if (D.gids && D.gids.length) T.grd = 1; if (!T.grev.length) T.grd = 1; save(); }
  const left = dueAll().length;
  return { gems: 3, title: 'المراجعة تمّت!', sub: left ? `باقي ${AR(left)} كلمة بالصندوق.` : 'الصندوق صار فاضي.', btns: `<button class="btn" type="button" data-act="map">كمّل الرحلة ←</button>`, act: { map: () => { TAB = 'map'; closeDeck(); } } };
}
function bossResult(stars) {
  const n = D.n0, first = !G.done[n]; G.done[n] = Math.max(G.done[n] || 0, stars);
  return { gems: first ? 20 : 0, title: first ? 'أتقنت القصة! 🏆' : 'تحدي القصة تمّ!', sub: first ? 'بكرة بنراجع كلماتها وبنبدأ القصة الجاية.' : '', btns: `<button class="btn" type="button" data-act="map">للخريطة</button>`, act: { map: () => { VIEWN = n < STORIES.length ? n + 1 : n; TAB = 'map'; closeDeck(); } } };
}
function arcadeResult(stars) {
  const sc = D.ok; if (D.key) G.best[D.key] = Math.max(G.best[D.key] || 0, sc);
  return { title: `${sc} من ${D.n}`, btns: `<button class="btn" type="button" data-act="again">العب كمان</button><button class="btn ghost" type="button" data-act="back">لصالة الألعاب</button>`, act: { again: () => { const k = D.key; closeDeck(); $(`[data-g="${k}"]`)?.click(); }, back: closeDeck } };
}

/* ---------- arcade: rush ---------- */
function rush(p) {
  D = { kind: 'rush' }; const d = deckEl(); d.className = 'deck h3';
  let score = 0, streak = 0, t = 60, cur = null, tm = 0, end = false; const seen = [];
  d.innerHTML = `<div class="in">
    <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="timer grow"><i id="tbar" style="width:100%"></i></div><span class="score num" id="sc">0</span></div>
    <div class="ask" style="text-align:center">هل هاد هو المعنى الصح؟</div>
    <div class="card" id="rc" style="min-height:220px;align-content:center"></div>
    <div class="tfbtns"><button class="btn bad" type="button" id="no">✗ غلط</button><button class="btn good" type="button" id="yes">✓ صح</button></div>
    <p class="muted" style="text-align:center;margin:0" id="st">كل ٥ صح ورا بعض = ٣ ثواني زيادة</p></div>`;
  bindQuit();
  const next = () => { const i = p[Math.random() * p.length | 0], real = Math.random() < .5; let m = i; if (!real) { m = opts3(i, 2).find(j => j !== i) ?? i; } cur = { i, m, real: m === i }; $('#rc').innerHTML = `<div class="big-en">${esc(W[i].w)}</div><div class="big-ar" style="color:var(--coral)">${esc(W[m].m)}</div>`; $('#rc').classList.remove('pop-in'); void $('#rc').offsetWidth; $('#rc').classList.add('pop-in'); };
  const ans = yes => {
    if (end) return; const ok = yes === cur.real; seen.push(cur.i);
    if (ST.w[cur.i]?.seen) record(cur.i, 0, ok, { noSrs: true });
    if (ok) { score++; streak++; SFX.ok(); if (streak % 5 === 0) { t = Math.min(60, t + 3); burst('+٣ ثواني'); SFX.combo(); } }
    else { streak = 0; SFX.no(); $('#rc').classList.add('shake'); toast(`${W[cur.i].w} = ${W[cur.i].m}`); }
    $('#sc').textContent = score; next();
  };
  $('#yes').onclick = () => ans(true); $('#no').onclick = () => ans(false);
  next();
  const t0 = Date.now(); let last = t0;
  tm = setInterval(() => { if (!$('.deck')) return clearInterval(tm); const now = Date.now(); t -= (now - last) / 1000; last = now; $('#tbar').style.width = Math.max(0, t / 60 * 100) + '%'; if (t <= 0) { clearInterval(tm); end = true; arcadeDone('rush', score, [...new Set(seen)], score >= 25 ? 3 : score >= 15 ? 2 : 1, `${score} جواب صح`); } }, 100);
}
function arcadeDone(key, score, words, stars, title) {
  const isBest = score > (G.best[key] || 0); G.best[key] = Math.max(G.best[key] || 0, score);
  const gems = Math.max(2, Math.round(score / 3)); G.gems += gems; addXP(score * 3);
  const d = deckEl();
  d.innerHTML = `<div class="in"><div class="res">
    <div style="font-size:60px;line-height:1">${myAv()}</div>
    <div class="bigstars">${[0, 1, 2].map(k => `<svg viewBox="0 0 24 24" class="${k < stars ? 'on' : ''}"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`).join('')}</div>
    <h1>${title}</h1>${isBest ? `<p style="margin:0;font-weight:800;color:var(--coral)">رقم قياسي جديد!</p>` : `<p class="muted" style="margin:0">أفضل نتيجة: ${G.best[key]}</p>`}
    <div class="rk"><div class="h2"><b>${score * 3}</b><span>XP</span></div><div class="h4"><b>+${gems}</b><span>جواهر</span></div><div class="h1"><b>${words.length}</b><span>كلمة</span></div></div>
    <div style="display:grid;gap:12px;width:100%"><button class="btn" type="button" id="again">العب كمان</button><button class="btn ghost" type="button" id="back">لصالة الألعاب</button></div></div></div>`;
  d.scrollTop = 0; SFX.win(); if (isBest || stars === 3) confetti();
  $('#again').onclick = () => { closeDeck(); $(`[data-g="${key}"]`)?.click(); }; $('#back').onclick = closeDeck;
}

/* ---------- arcade: word rain ---------- */
function rain(p) {
  D = { kind: 'rain' }; const d = deckEl(); d.className = 'deck h4';
  d.innerHTML = `<div class="in">
    <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="hearts grow" id="hearts"></div><span class="score num" id="sc">0</span></div>
    <div class="ask" style="text-align:center">التقط: <span id="tg" style="color:var(--sky-d)"></span></div>
    <div class="rain" id="rain"><div class="ground"></div></div></div>`;
  bindQuit();
  const box = $('#rain'); let lives = 3, score = 0, target = null, drops = [], speed = 55, lastSpawn = 0, sinceT = 0, raf = 0, end = false, prev = performance.now(); const seen = new Set();
  const hearts = () => { $('#hearts').innerHTML = [0, 1, 2].map(k => `<span class="${k < lives ? '' : 'off'}">${I.heart}</span>`).join(''); };
  const newTarget = () => { target = p[Math.random() * p.length | 0]; $('#tg').textContent = W[target].m; sinceT = 0; };
  const spawn = () => {
    const isT = !drops.some(x => x.i === target) && (sinceT >= 1 || Math.random() < .45);
    let i = isT ? target : p[Math.random() * p.length | 0]; if (!isT && i === target) i = p[(p.indexOf(i) + 1) % p.length];
    sinceT = isT ? 0 : sinceT + 1;
    const el = document.createElement('button'); el.type = 'button'; el.className = 'drop'; el.textContent = W[i].w;
    box.appendChild(el); const bw = box.clientWidth, ew = el.offsetWidth; const x = 8 + Math.random() * Math.max(0, bw - ew - 16);
    const dr = { i, el, y: -50, x }; el.style.left = x + 'px'; drops.push(dr);
    el.onclick = () => { if (end || dr.hit) return; dr.hit = 1; seen.add(i);
      if (i === target) { score++; speed += 3; el.classList.add('ok'); SFX.pop(); say(i); $('#sc').textContent = score; if (ST.w[i]?.seen) record(i, 0, true, { noSrs: true }); newTarget(); }
      else { lives--; el.classList.add('no'); SFX.no(); hearts(); toast(`${W[i].w} = ${W[i].m}`); }
      setTimeout(() => { el.remove(); drops = drops.filter(x => x !== dr); }, 260); if (lives <= 0) over(); };
  };
  const over = () => { end = true; cancelAnimationFrame(raf); setTimeout(() => arcadeDone('rain', score, [...seen], score >= 20 ? 3 : score >= 10 ? 2 : 1, `${score} كلمة التقطتها`), 500); };
  const loop = t => {
    if (!$('#rain')) return; const dt = Math.min(.05, (t - prev) / 1000); prev = t; const H = box.clientHeight;
    if (t - lastSpawn > Math.max(650, 1500 - score * 30) && drops.filter(x => !x.hit).length < 4) { lastSpawn = t; spawn(); }
    drops.forEach(dr => { if (dr.hit) return; dr.y += speed * dt; dr.el.style.transform = `translateY(${dr.y}px)`;
      if (dr.y > H - 40) { dr.hit = 1; dr.el.remove(); if (dr.i === target) { lives--; SFX.no(); hearts(); toast(`فاتتك: ${W[dr.i].w}`); newTarget(); if (lives <= 0) over(); } } });
    drops = drops.filter(x => x.el.isConnected);
    if (!end) raf = requestAnimationFrame(loop);
  };
  hearts(); newTarget(); raf = requestAnimationFrame(loop);
}

/* ---------- arcade: memory ---------- */
function memory(p) {
  D = { kind: 'mem' }; const d = deckEl(); d.className = 'deck h1';
  const ids = p.slice(0, 6), cards = shuffle([...ids.map(i => ({ i, s: 'e' })), ...ids.map(i => ({ i, s: 'a' }))]);
  let up = [], moves = 0, got = 0, lock = false;
  d.innerHTML = `<div class="in">
    <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="grow ask" style="font-size:18px">لاقي كل كلمة مع معناها</div><span class="score num" id="mv">0</span></div>
    <div class="mem">${cards.map((c, k) => `<button class="mc" type="button" data-c="${k}" aria-label="كرت"><span class="fa front">?</span><span class="fa back ${c.s === 'e' ? 'en' : ''}">${esc(c.s === 'e' ? W[c.i].w : W[c.i].m)}</span></button>`).join('')}</div>
    <p class="muted" style="text-align:center;margin:0">الرقم فوق هو عدد المحاولات. كل ما قلّ، أحسن.</p></div>`;
  bindQuit();
  $$('.mc', d).forEach(b => b.onclick = () => {
    const k = +b.dataset.c, c = cards[k]; if (lock || b.classList.contains('up')) return;
    b.classList.add('up'); SFX.flip(); if (c.s === 'e') say(c.i); up.push([b, c]);
    if (up.length < 2) return;
    moves++; $('#mv').textContent = moves; const [[b1, c1], [b2, c2]] = up; up = [];
    if (c1.i === c2.i) { got++; SFX.pop(); [b1, b2].forEach(x => x.classList.add('got')); if (got === ids.length) setTimeout(() => arcadeDone('mem', Math.max(1, 20 - moves), ids, moves <= 9 ? 3 : moves <= 13 ? 2 : 1, `خلّصتها بـ${moves} محاولة`), 600); }
    else { lock = true; setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); lock = false; }, 950); }
  });
}

/* ---------- story theatre ---------- */
const SA = new Audio(); SA.preload = 'auto';
let saRaf = 0, saEnd = null, SA_N = 0;
function stopStory() { try { SA.pause(); } catch (e) { } cancelAnimationFrame(saRaf); saEnd = null; }
function toks(marked) {
  const out = []; let bold = false, cur = '', curB = false, grp = -1, g = 0;
  const flush = () => { if (cur) out.push({ t: cur, b: curB, g: curB ? grp : -1 }); cur = ''; curB = false; };
  for (let i = 0; i < marked.length; i++) {
    if (marked.startsWith('**', i)) { bold = !bold; if (bold) grp = g++; i++; continue; }
    const ch = marked[i]; if (/\s/.test(ch)) { flush(); continue; } cur += ch; if (bold) curB = true;
  }
  flush(); return out;
}
function theatre(n, readOnly) {
  const s = STORIES[n - 1]; let p = 0, playing = false, auto = false;
  const lookup = new Map(); s.words.forEach(i => { lookup.set(W[i].k, i); if (W[i].ex?.[2]) lookup.set(norm(W[i].ex[2]), i); });
  D = { kind: 'theatre' };
  const d = deckEl(); d.className = 'deck ' + HUE(n);
  const draw = () => {
    const T = toks(s.p[p][0]); const groups = {}; T.forEach((t, k) => { if (t.g >= 0) (groups[t.g] = groups[t.g] || []).push(t.t); });
    d.innerHTML = `<div class="in">
      <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="grow" style="text-align:center"><b>${readOnly ? 'القصة' : 'تحدي القصة'} ${AR(n)}</b><div class="en muted" style="font-size:14px">${esc(s.en)}</div></div><span style="width:40px"></span></div>
      ${p === 0 && !readOnly ? `<div class="panel" style="display:flex;gap:12px;align-items:center"><span style="font-size:34px">🎬</span><span>اسمع القصة كاملة. اضغط على أي كلمة لتسمعها وتشوف معناها. وبعدين التحدي!</span></div>` : ''}
      <div class="stage">
        <div class="p-en" id="pen">${T.map((t, k) => `<span class="t ${t.b ? 'v' : ''}" data-k="${k}" ${t.g >= 0 ? `data-g="${t.g}"` : ''}>${esc(t.t)}</span>`).join(' ')}</div>
        <div class="p-ar blur" id="par" title="اضغط لتشوف الترجمة">${esc(s.p[p][1])}</div>
      </div>
      <div class="pdots">${s.p.map((_, k) => `<button type="button" data-p="${k}" aria-label="فقرة ${k + 1}" ${k === p ? 'aria-current="true"' : ''}></button>`).join('')}</div>
    </div>`;
    const dk = $('.dock') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'dock ' + HUE(n) }));
    dk.innerHTML = `<div class="in"><div class="row" style="justify-content:center;gap:14px">
        <button class="nav btn ghost sm" type="button" id="pp" ${p === 0 ? 'disabled' : ''} aria-label="الفقرة السابقة">${I.prev}</button>
        <button class="say huge" type="button" id="pl" style="width:76px;height:76px;border-radius:26px;background:var(--h);box-shadow:0 6px 0 var(--hd)" aria-label="${playing ? 'وقّف' : 'شغّل'}">${playing ? I.pause : I.play}</button>
        <button class="nav btn ghost sm" type="button" id="pn" ${p === s.p.length - 1 ? 'disabled' : ''} aria-label="الفقرة التالية">${I.next}</button></div>
        ${readOnly ? '' : `<button class="btn ${p === s.p.length - 1 ? '' : 'ghost'}" type="button" id="fight">${I.sword} ابدأ التحدي</button>`}</div>`;
    bindQuit();
    $('#par').onclick = e => e.currentTarget.classList.toggle('blur');
    $$('[data-p]', d).forEach(b => b.onclick = () => { stopStory(); playing = false; auto = false; p = +b.dataset.p; draw(); });
    $('#pp').onclick = () => { stopStory(); playing = false; auto = false; p--; draw(); };
    $('#pn').onclick = () => { stopStory(); playing = false; auto = false; p++; draw(); };
    $('#pl').onclick = () => { if (playing) { stopStory(); playing = false; auto = false; draw(); } else { auto = true; playPara(); } };
    const f = $('#fight'); if (f) f.onclick = () => { stopStory(); $$('.dock').forEach(e => e.remove()); bossChallenge(n); };
    /* every word in the story answers a tap: its meaning if we know it, and always its sound */
    $$('.t', d).forEach(sp => sp.onclick = () => {
      const k = +sp.dataset.k, g = sp.dataset.g, phrase = g != null ? groups[g].join(' ') : sp.textContent;
      const i = lookup.get(norm(phrase)) ?? lookup.get(norm(sp.textContent)) ?? WK.get(norm(phrase)) ?? (g != null ? WK.get(norm(sp.textContent)) : undefined);
      const was = playing; if (was) { stopStory(); playing = false; auto = false; draw(); }
      const back = () => { if (was) { auto = true; playPara(); } else draw(); };
      if (i != null) return wordPop(i, back);
      /* the narrator's own voice for this word (or the whole coloured phrase) */
      const wt = s.wt?.[p] || [], idx = g != null ? T.map((t, j) => t.g === +g ? j : -1).filter(j => j >= 0) : [k];
      const a = (wt[idx[0]] ?? 0) - .04, last = idx[idx.length - 1];
      const b = wt[last + 1] != null ? wt[last + 1] - .03 : (s.wt?.[p + 1]?.[0] != null ? Math.min(s.wt[p + 1][0] - .1, wt[last] + 1.2) : wt[last] + 1);
      const lettersN = idx.map(j => T[j].t.replace(/[^A-Za-z]/g, '')).join('').length; const b2 = Math.min(b, a + Math.max(.7, .35 + .1 * lettersN) + .25 * (idx.length - 1));
      const hear = () => { const els = idx.map(j => $(`#pen .t[data-k="${j}"]`, d)).filter(Boolean); els.forEach(e => e.classList.add('tap')); return playSeg(n, a, b2).then(() => els.forEach(e => e.classList.remove('tap'))); };
      const m = formMeaning(phrase) || formMeaning(sp.textContent);
      if (m) formPop(phrase.replace(/[^A-Za-z'’ -]+$/g, '').replace(/^[^A-Za-z]+/, ''), m, hear, back); else hear();
    });
  };
  const playPara = () => {
    const wt = s.wt?.[p]; if (!wt || !wt.length) { toast('ما في تسجيل لهالفقرة'); return; }
    if (SA_N !== n) { SA.src = 's/Story_' + String(n).padStart(2, '0') + '.webm'; SA_N = n; }
    SA.playbackRate = G.srate || 1; stopAudio();
    const a = Math.max(0, wt[0] - .15), b = s.wt[p + 1]?.[0] != null ? s.wt[p + 1][0] - .2 : (s.dur || 1e9);
    playing = true; draw();
    const go = () => { SA.currentTime = a; saEnd = b; SA.play().catch(() => { playing = false; draw(); }); tick(wt); };
    if (SA.readyState >= 1) go(); else SA.addEventListener('loadedmetadata', go, { once: true });
  };
  const tick = wt => {
    cancelAnimationFrame(saRaf); let last = -1;
    const els = $$('#pen .t', d);
    const f = () => {
      const t = SA.currentTime;
      if (saEnd != null && t >= saEnd) {
        stopStory(); els.forEach(e => e.classList.add('past'));
        if (auto && p < s.p.length - 1) { setTimeout(() => { if (!$('.deck') || D?.kind !== 'theatre') return; p++; playPara(); }, 700); }
        else { playing = false; auto = false; setTimeout(() => { if (D?.kind === 'theatre') draw(); }, 400); }
        return;
      }
      let idx = -1; for (let k = 0; k < wt.length; k++) { if (wt[k] <= t + .03) idx = k; else break; }
      if (idx !== last) { els.forEach((e, k) => { e.classList.toggle('on', k === idx); e.classList.toggle('past', k < idx); }); last = idx; }
      saRaf = requestAnimationFrame(f);
    };
    saRaf = requestAnimationFrame(f);
  };
  draw();
}
function wordPop(i, onClose) {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in"><div class="row">${sayBtn(i)}<div class="grow"><div class="big-en" style="font-size:30px;text-align:right">${esc(W[i].w)}</div><div class="pron">${esc(W[i].p)}</div></div></div><div class="big-ar" style="font-size:23px">${esc(W[i].m)}</div><button class="btn" type="button" id="pc">تمام</button></div>`;
  document.body.append(sc, p); say(i);
  const off = () => { sc.remove(); p.remove(); onClose && onClose(); }; sc.onclick = off; $('#pc', p).onclick = off;
}
function formPop(word, meaning, hear, onClose) {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in"><div class="row"><button class="say" type="button" id="fh" aria-label="استمع">${I.spk}</button><div class="grow"><div class="big-en" style="font-size:30px;text-align:right">${esc(word)}</div></div></div><div class="big-ar" style="font-size:23px">${esc(meaning)}</div><button class="btn" type="button" id="pc">تمام</button></div>`;
  document.body.append(sc, p);
  const h = $('#fh', p); const go = () => { h.classList.add('playing'); hear().then(() => h.classList.remove('playing')); }; h.onclick = e => { e.stopPropagation(); go(); }; go();
  const off = () => { stopAudio(); sc.remove(); p.remove(); onClose && onClose(); }; sc.onclick = off; $('#pc', p).onclick = off;
}
function bossChallenge(n) {
  const s = STORIES[n - 1], withEx = shuffle(s.words.filter(i => exSentence(i))), rest = shuffle(s.words);
  const pick = withEx.slice(0, 8), q = pick.map(i => ({ t: 'gap', i }));
  shuffle(rest.filter(i => !pick.includes(i))).slice(0, 4).forEach(i => q.splice(Math.random() * q.length | 0, 0, { t: 'listen', i }));
  prefetch(s.words);
  play({ kind: 'boss', n, title: 'تحدي القصة', hue: HUE(n), q });
}

/* ---------- grammar: lessons, rounds, tab, radar ---------- */
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const isLatin = s => /^[\x00-\x7F’‘“”—–…]*$/.test(String(s).replace(/\*\*/g, ''));
const GA = new Audio(); GA.preload = 'auto'; let gaRaf = 0, gaSrc = '';
function auKey(l, text) { if (!l.au) return null; if (l.au[text]) return text; const n = norm(text); return Object.keys(l.au).find(k => norm(k) === n) || null; }
function playG(l, text) {
  stopAudio(); stopStory(); cancelAnimationFrame(gaRaf);
  const k = auKey(l, bare(text));
  if (!k) return tts(bare(text), .9 * (G.wrate || 1));
  const [a, b] = l.au[k]; const src = 'g/' + l.id + '.webm';
  if (gaSrc !== src) { GA.src = src; gaSrc = src; }
  return new Promise(res => {
    const go = () => { try { GA.currentTime = a; } catch (e) { } GA.playbackRate = G.wrate || 1; GA.play().catch(res); const f = () => { if (GA.currentTime >= b || GA.paused) { GA.pause(); res(); } else gaRaf = requestAnimationFrame(f); }; gaRaf = requestAnimationFrame(f); };
    if (GA.readyState >= 1) go(); else { GA.addEventListener('loadedmetadata', go, { once: true }); GA.load(); }
    setTimeout(res, 9000);
  });
}
const gSay = (l, text, cls = 'sm') => `<button class="say ${cls}" type="button" data-gsay="${esc(bare(text))}" data-gl="${l.id}" aria-label="استمع">${I.spk}</button>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-gsay]'); if (!b) return; e.stopPropagation();
  b.classList.add('playing'); playG(LBY.get(b.dataset.gl), b.dataset.gsay).then(() => b.classList.remove('playing'));
}, true);

/* lesson pages */
/* English inside a lesson becomes tappable: tap it and hear it */
function richSay(l, s) {
  const re = /[A-Za-z][A-Za-z0-9'’]*(?:[ \-,.?!]+[A-Za-z0-9'’]+)*[.?!]?/g;
  return String(s ?? '').split('**').map((seg, k) => {
    let h = '', last = 0, m;
    while ((m = re.exec(seg))) {
      h += esc(seg.slice(last, m.index)); last = re.lastIndex;
      h += /[A-Za-z]{2}|^[aAI]$/.test(m[0]) ? `<span class="gw" data-gsay="${esc(m[0])}" data-gl="${l.id}">${esc(m[0])}</span>` : esc(m[0]);
    }
    h += esc(seg.slice(last));
    return k % 2 ? `<b>${h}</b>` : h;
  }).join('');
}
function blocksHtml(l, bs) {
  let out = '', ul = false;
  bs.forEach(([t, x]) => {
    if (t === 'li') { if (!ul) { out += '<ul>'; ul = true; } out += `<li>${richSay(l, x)}</li>`; return; }
    if (ul) { out += '</ul>'; ul = false; }
    out += t === 'note' ? `<div class="note">💡 ${richSay(l, x)}</div>` : `<p>${richSay(l, x)}</p>`;
  });
  if (ul) out += '</ul>'; return out;
}
function lessonPages(l) {
  const pages = [], groups = []; let cur = { h: 'الفكرة', b: [] };
  l.exp.forEach(e => { if (e[0] === 'h') { if (cur.b.length) groups.push(cur); cur = { h: e[1], b: [] }; } else cur.b.push(e); });
  if (cur.b.length) groups.push(cur);
  pages.push({ hero: true, html: `<div class="lhero"><div class="lnode">${esc(l.node || '📘')}</div><span class="lvl-tag">المستوى ${l.lv} · ${LVN[l.lv]} · ${l.k === 'p' ? 'نطق' : 'قواعد'}</span><h1>${esc(l.ar)}</h1><div class="en muted" style="font-size:16px">${esc(l.en)}</div></div>` });
  groups.forEach(g => pages.push({ title: g.h, html: blocksHtml(l, g.b) }));
  if (l.table && l.table.length) pages.push({ title: 'الجدول', html: `<div class="tbl"><table>${l.table.map((r, k) => `<tr>${r.map(c => k ? `<td dir="auto">${richSay(l, c)}</td>` : `<th dir="auto">${rich(c)}</th>`).join('')}</tr>`).join('')}</table></div>` });
  if (l.rule && l.rule.length) pages.push({ title: 'اسمع الكلمات', html: l.rule.map(([t, ws]) => `<div class="rgrp"><b>${rich(t)}</b><div class="chips">${ws.map(w => `<button class="wchip" type="button" data-gsay="${esc(w)}" data-gl="${l.id}">${esc(w)}</button>`).join('')}</div></div>`).join('') });
  if (l.ex && l.ex.length) pages.push({ title: 'أمثلة', html: `<div class="exl">${l.ex.slice(0, 8).map(([en, ar], k) => `<div class="exrow"><span class="emo">${esc(l.emo?.[k] || '•')}</span><div class="grow"><div class="en exen">${rich(en)}</div><div class="muted">${rich(ar)}</div></div>${gSay(l, en)}</div>`).join('')}</div>` });
  if (l.tip && l.tip.length) pages.push({ title: 'انتبه لهالأغلاط', html: l.tip.map(([w, r, n]) => `<div class="mist"><div class="row"><span class="en bad grow">✗ ${esc(w)}</span>${gSay(l, w)}</div><div class="row"><span class="en good grow">✓ ${esc(r)}</span>${gSay(l, r)}</div><div class="muted">${richSay(l, n)}</div></div>`).join('') });
  return pages;
}
/* read a lesson page aloud, Arabic and English each in its own voice */
let readTok = 0;
function readStop() { readTok++; stopAudio(); try { window.WordPlayer?.stopAr(); } catch (e) { } }
async function readPage(l, art, btn) {
  if (btn.classList.contains('on')) { readStop(); btn.classList.remove('on'); btn.innerHTML = `${I.spk} اقرأ الصفحة`; return; }
  readStop(); const my = readTok; if (window.WordPlayer && !window.WordPlayer.canAr()) toast('إذا ما سمعت العربي: نزّل صوت العربي من إعدادات الجوال ← تحويل النص إلى كلام'); btn.classList.add('on'); btn.innerHTML = `${I.pause} وقّف القراءة`;
  const blocks = [...art.querySelectorAll('h2,p,li,.note,tr,.exrow,.mist,.rgrp,.lhero h1,.lhero .en')].filter(e => !e.closest('.mist') || e.classList.contains('mist'));
  for (const el of blocks) {
    if (my !== readTok) return;
    const c = el.cloneNode(true); c.querySelectorAll('button.say,.emo,.readpg').forEach(x => x.remove());
    const txt = c.textContent.replace(/💡|✗|✓|•/g, ' ').replace(/\s+/g, ' ').trim(); if (!txt) continue;
    el.classList.add('reading'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    /* split into Arabic and English runs */
    const runs = txt.match(/[A-Za-z][A-Za-z0-9'’]*(?:[^\u0600-\u06FFA-Za-z]+[A-Za-z0-9'’]+)*|[^A-Za-z]+/g) || [];
    for (const r0 of runs) {
      if (my !== readTok) break;
      const r = r0.trim(); if (!/[A-Za-z\u0600-\u06FF]/.test(r)) continue;
      if (/[A-Za-z]/.test(r[0])) await playG(l, r);
      else if (window.WordPlayer) {
        /* the phone voice stops on long Arabic text, so read it sentence by sentence */
        const chunks = r.match(/[^.،,؛;:!?؟]+[.،,؛;:!?؟]*/g) || [r]; let buf = '';
        const flush = async () => { const t = buf.trim(); buf = ''; if (t && /[؀-ۿ]/.test(t) && my === readTok) await window.WordPlayer.speakAr(t, 1); };
        for (const c of chunks) { if ((buf + c).length > 140) await flush(); buf += c; }
        await flush();
      }
      if (my !== readTok) break; await wait(180);
    }
    el.classList.remove('reading'); await wait(300);
  }
  if (my === readTok) { btn.classList.remove('on'); btn.innerHTML = `${I.spk} اقرأ الصفحة`; }
}
function lesson(id) {
  const l = LBY.get(id); if (!l) return; const pages = lessonPages(l); let k = 0;
  D = { kind: 'lessoncards' }; const d = deckEl(); d.className = 'deck ' + (l.k === 'p' ? 'h1' : 'h3');
  const draw = () => {
    const pg = pages[k];
    d.innerHTML = `<div class="in pop-in"><div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="pbar"><i style="width:${Math.round(100 * (k + 1) / pages.length)}%;background:var(--h)"></i></div><button class="btn ghost sm" type="button" id="skip">للتحدي</button></div>
      <article class="lpage">${pg.title ? `<h2>${rich(pg.title)}</h2>` : ''}<button class="readpg" type="button" id="readpg">${I.spk} اقرأ الصفحة</button>${pg.html}</article></div>`;
    readStop();
    $('#readpg').onclick = () => readPage(l, $('.lpage', d), $('#readpg'));
    $$('.dock').forEach(e => e.remove());
    const dk = document.createElement('div'); dk.className = 'dock ' + (l.k === 'p' ? 'h1' : 'h3');
    dk.innerHTML = `<div class="in"><div class="row">${k ? `<button class="btn ghost" type="button" id="lprev" style="width:auto">${I.prev}</button>` : ''}<button class="btn" type="button" id="lnext">${k === pages.length - 1 ? 'يلا نلعب! 🎮' : 'التالي ←'}</button></div></div>`;
    document.body.appendChild(dk);
    $('#quit').onclick = () => { readStop(); $$('.dock').forEach(e => e.remove()); closeDeck(); };
    $('#skip').onclick = () => { readStop(); $$('.dock').forEach(e => e.remove()); startGram(l); };
    const pv = $('#lprev'); if (pv) pv.onclick = () => { k--; SFX.tap(); draw(); };
    $('#lnext').onclick = () => { if (k < pages.length - 1) { k++; SFX.tap(); draw(); d.scrollTop = 0; } else { $$('.dock').forEach(e => e.remove()); startGram(l); } };
  };
  draw();
}

/* rounds from the lesson's own questions */
function gRound(l, q) {
  if (!q) return null;
  if (['mc', 'rule', 'pick', 'gap', 'fix'].includes(q[0])) return { t: 'gq', l, q };
  if (q[0] === 'ord' || q[0] === 'tr') return { t: 'gord', l, q };
  return null;
}
function gRounds(l) {
  const out = [];
  if (l.k === 'p') {
    l.q.forEach(q => out.push(gRound(l, q)));
    if (l.cls) shuffle(l.cls.items).slice(0, 5).forEach(it => out.push({ t: 'gcls', l, it }));
    shuffle(l.sil || []).slice(0, 3).forEach(it => out.push({ t: 'gsil', l, it }));
    shuffle(l.stress || []).slice(0, 3).forEach(it => out.push({ t: 'gstress', l, it }));
    const r = out.filter(x => x && x.q), o = shuffle(out.filter(x => x && !x.q));
    return [...r.slice(0, 2), ...o, ...r.slice(2)].filter(Boolean).slice(0, 12);
  }
  const RANK = { rule: 0, mc: 1, pick: 1, gap: 2, fix: 2, ord: 3, tr: 3 }, per = {};
  const pick = shuffle(l.q).filter(q => { per[q[0]] = (per[q[0]] || 0) + 1; return per[q[0]] <= 3; }).slice(0, 10).sort((a, b) => RANK[a[0]] - RANK[b[0]]);
  pick.forEach(q => out.push(gRound(l, q)));
  shuffle(l.tip || []).slice(0, 2).forEach((t, k) => out.splice(k ? 7 : 3, 0, { t: 'gtf', l, tip: t, show: Math.random() < .5 ? 0 : 1 }));
  return out.filter(Boolean);
}
function startGram(l) { play({ kind: 'gram', gid: l.id, title: l.ar, hue: l.k === 'p' ? 'h1' : 'h3', q: gRounds(l) }); }

function gScored(it, ok, hinted) {
  D.n++; if (ok) D.ok++;
  if (it.grev) { const r = G.gl[it.grev], d = DAY(); if (r) { if (ok) { r.st = Math.min(IV.length - 1, (r.st || 1) + 1); r.due = d + IV[r.st]; } else { r.st = 1; r.due = d + 1; } save(); } }
  if (ok) {
    D.combo++; D.maxc = Math.max(D.maxc, D.combo);
    let x = 10; if ([3, 5, 8, 12, 16, 20].includes(D.combo)) { x += D.combo * 2; setTimeout(() => { burst(`كومبو ×${D.combo}!`); SFX.combo(); }, 250); }
    D.xp += x; addXP(x); return x;
  }
  D.combo = 0;
  if (!it.retry && D.kind !== 'arcade') { const at = Math.min(D.q.length, D.k + 3); D.q.splice(at, 0, Object.assign({}, it, { retry: true, grev: null })); }
  return 0;
}
function gFeedback(ok, xp, ansHtml, sayL, sayText, note) {
  const f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no');
  f.innerHTML = `<div class="in">
    <div class="fbt">${ok ? I.check : ''}${ok ? rnd(PRAISE) : rnd(SOFT)}${ok && xp ? `<span class="num" style="margin-inline-start:auto;font-size:18px;color:var(--sun-d)">+${xp} XP</span>` : ''}</div>
    ${ok && !note ? '' : `<div class="row">${sayText ? gSay(sayL, sayText) : ''}<div class="fbx grow">${ok ? '' : `الجواب: ${ansHtml}`}${note ? `<div class="muted" style="font-size:14.5px">${rich(note)}</div>` : ''}</div></div>`}
    <button class="btn ${ok ? 'good' : 'bad'}" type="button" id="cont">كمّل</button></div>`;
  document.body.appendChild(f);
  let gone = false; const go = () => { if (gone) return; gone = true; nextRound(); };
  $('#cont', f).onclick = go;
  if (ok) { SFX.ok(); if (sayText) playG(sayL, sayText); setTimeout(go, note ? 2600 : 1500); } else { SFX.no(); if (sayText) playG(sayL, sayText); }
}
const enSpan = s => `<span class="en" style="font-weight:600">${esc(s)}</span>`;
function gapHtml(s, fill, cls) { const t = esc(s).replace(/\(([^)]*)\)/, '<small class="hintw">($1)</small>'); return t.replace('___', `<span class="gap ${cls || ''}">${fill ? esc(fill) : '?'}</span>`); }
function gOptions(el, it, opts, correct, after) {
  const box = $('.opts', el), en = opts.every(isLatin);
  box.innerHTML = opts.map((o, k) => `<button class="opt ${isLatin(o) ? 'en' : ''}" type="button" data-k="${k}" dir="auto">${rich(o)}</button>`).join('');
  let hinted = false, done = false;
  const hb = $('#hint', el); if (hb) hb.onclick = () => { const wrong = $$('.opt:not(.gone)', box).filter(b => opts[+b.dataset.k] !== correct); if (wrong.length > 1) { rnd(wrong).classList.add('gone'); hinted = true; SFX.tap(); } hb.disabled = wrong.length <= 2; };
  $$('.opt', box).forEach(b => b.onclick = () => {
    if (done) return; done = true; const v = opts[+b.dataset.k], ok = v === correct;
    $$('.opt', box).forEach(x => { x.disabled = true; if (opts[+x.dataset.k] === correct) x.classList.add('ok'); });
    if (!ok) b.classList.add('no', 'shake');
    const xp = gScored(it, ok, hinted); if (ok) flyXP(xp, b); after(ok, xp);
  });
  void en;
}
function swapWords(s) { const w = s.split(' '); if (w.length < 3) return null; const k = 1 + (Math.random() * (w.length - 2) | 0); [w[k - 1], w[k]] = [w[k], w[k - 1]]; const o = w.join(' '); return o === s ? null : o; }
function rGq(it, el) {
  const { l, q } = it, t = q[0];
  if (t === 'mc' || t === 'gap') {
    const correct = q[2], full = q[1].replace('___', correct).replace(/\s*\([^)]*\)/, '');
    let opts;
    if (t === 'mc') opts = shuffle(q.slice(2));
    else {
      const mine = new Set(q.slice(2).map(norm)), pool = [];
      l.q.forEach(o => { if (o === q) return; if (o[0] === 'gap') pool.push(...o.slice(2)); if (o[0] === 'mc') pool.push(...o.slice(2)); });
      const ds = [...new Set(shuffle(pool).filter(x => !mine.has(norm(x)) && x.split(' ').length <= 4))].slice(0, 2);
      opts = shuffle([correct, ...ds]);
    }
    el.innerHTML = `<div class="ask">${t === 'mc' ? 'اختار الكلمة المناسبة' : 'كمّل الفراغ'}<small>${t === 'gap' ? 'الكلمة بين القوسين بتساعدك' : 'اقرأ الجملة كلها قبل ما تختار'}</small></div><div class="gsent en">${gapHtml(q[1])}</div><div class="opts"></div><button class="btn ghost sm" type="button" id="hint" style="justify-self:center">${I.bulb} مساعدة</button>`;
    gOptions(el, it, opts, correct, (ok, xp) => { const g = $('.gap', el); if (g) { g.textContent = correct; g.classList.add(ok ? 'gok' : 'gno'); } gFeedback(ok, xp, enSpan(full), l, full); });
  } else if (t === 'rule') {
    const correct = q[2];
    el.innerHTML = `<div class="ask">سؤال القاعدة</div><div class="card" style="text-align:start;justify-items:start"><div style="font-size:19px;font-weight:700" dir="auto">${rich(q[1])}</div></div><div class="opts"></div><button class="btn ghost sm" type="button" id="hint" style="justify-self:center">${I.bulb} مساعدة</button>`;
    gOptions(el, it, shuffle(q.slice(2)), correct, (ok, xp) => gFeedback(ok, xp, `<b dir="auto">${rich(correct)}</b>`, l, isLatin(correct) ? correct : null));
  } else if (t === 'pick') {
    const correct = q[1];
    el.innerHTML = `<div class="ask">أي جملة صحيحة؟<small>وحدة بس قواعدها مزبوطة</small></div><div class="opts"></div><button class="btn ghost sm" type="button" id="hint" style="justify-self:center">${I.bulb} مساعدة</button>`;
    gOptions(el, it, shuffle(q.slice(1)), correct, (ok, xp) => gFeedback(ok, xp, enSpan(correct), l, correct));
  } else if (t === 'fix') {
    const correct = q[2], sw = swapWords(correct), opts = shuffle([...new Set([correct, q[1], sw].filter(Boolean))]);
    el.innerHTML = `<div class="ask">هالجملة فيها غلطة! 🕵️<small>اختار الجملة بعد التصحيح</small></div><div class="wrongbox en">${esc(q[1])}</div><div class="opts"></div>`;
    gOptions(el, it, opts, correct, (ok, xp) => gFeedback(ok, xp, enSpan(correct), l, correct));
  }
}
function capFirst(tok, i) { if (i) return tok; if (/^I\b|^I'/.test(tok) || CAPS.has(tok.replace(/[^A-Za-z']/g, ''))) return tok; return tok[0].toLowerCase() + tok.slice(1); }
function rGord(it, el) {
  const { l, q } = it, isTr = q[0] === 'tr';
  const answers = isTr ? q.slice(2) : [q[1]], target = answers[0];
  const toks = target.split(/\s+/).map(capFirst);
  let extra = [];
  if (isTr) { const have = new Set(toks.map(t => norm(t))); const pool = [...new Set(l.q.flatMap(o => o[0] === 'ord' ? o[1].split(/\s+/) : o[0] === 'tr' ? o[2].split(/\s+/) : []).map(t => t.replace(/[.,!?;:]+$/, '')).filter(t => t && !have.has(norm(t)) && !/^[A-Z]/.test(t)))]; extra = shuffle(pool).slice(0, 2); }
  const bank = shuffle([...toks, ...extra]).map((t, k) => ({ t, k })), placed = []; let done = false, hinted = false;
  el.innerHTML = `<div class="ask">${isTr ? 'ترجم للإنجليزي بالقطع' : 'رتّب الكلمات لتعمل جملة صحيحة'}<small>${isTr ? 'في قطعتين زيادة ما إلهم لزوم' : 'اضغط على الكلمات بالترتيب'}</small></div>
    ${isTr ? `<div class="card" style="padding:16px"><div class="big-ar" style="font-size:22px">${esc(q[1])}</div></div>` : ''}
    <div class="sline en" id="sline"></div><div class="gbank en" id="gbank"></div>
    <div class="tools"><button class="btn ghost sm" type="button" id="hint">${I.bulb} كلمة</button><button class="btn ghost sm" type="button" id="undo">${I.back} امسح</button><button class="btn sm" type="button" id="chk" disabled>تحقّق</button></div>`;
  const need = toks.length;
  const paint = () => {
    $('#sline', el).innerHTML = placed.length ? placed.map((b, j) => `<button class="gtile on" type="button" data-p="${j}">${esc(b.t)}</button>`).join('') : '<span class="muted" style="font-family:var(--ar);font-size:15px">الجملة بتطلع هون…</span>';
    $('#gbank', el).innerHTML = bank.map(b => `<button class="gtile ${placed.includes(b) ? 'used' : ''}" type="button" data-b="${b.k}">${esc(b.t)}</button>`).join('');
    $$('[data-b]', el).forEach(x => x.onclick = () => { if (done) return; const b = bank.find(y => y.k === +x.dataset.b); if (placed.includes(b)) return; placed.push(b); SFX.tap(); paint(); if (placed.length === need && !isTr) check(); });
    $$('[data-p]', el).forEach(x => x.onclick = () => { if (done) return; placed.splice(+x.dataset.p, 1); paint(); });
    $('#chk', el).disabled = placed.length === 0 || done;
  };
  const check = () => {
    done = true; const got = norm(placed.map(b => b.t).join(' ')), ok = answers.some(a => norm(a) === got);
    $('#sline', el).classList.add(ok ? 'good' : 'shake');
    const xp = gScored(it, ok, hinted); if (ok) flyXP(xp, $('#sline', el)); gFeedback(ok, xp, enSpan(target), l, target);
  };
  $('#undo', el).onclick = () => { if (!done && placed.length) { placed.pop(); paint(); } };
  $('#chk', el).onclick = () => { if (!done && placed.length) check(); };
  $('#hint', el).onclick = () => {
    if (done) return;
    while (placed.length && norm(placed.map(b => b.t).join(' ')) !== norm(toks.slice(0, placed.length).join(' '))) placed.pop();
    const nx = toks[placed.length]; const b = bank.find(y => y.t === nx && !placed.includes(y)); if (b) { hinted = true; placed.push(b); SFX.tap(); paint(); if (placed.length === need && !isTr) check(); }
  };
  paint();
}
function rGtf(it, el) {
  const { l, tip } = it, s = it.show ? tip[1] : tip[0], truth = !!it.show;
  el.innerHTML = `<div class="ask">صح ولا غلط؟<small>هاي من أشهر الأغلاط بهالدرس</small></div><div class="card" style="min-height:150px;align-content:center"><div class="en" style="font-size:24px;font-weight:600">${esc(s)}</div></div>
    <div class="tfbtns"><button class="btn bad" type="button" data-tf="0">✗ غلط</button><button class="btn good" type="button" data-tf="1">✓ صح</button></div>`;
  let done = false;
  $$('[data-tf]', el).forEach(b => b.onclick = () => { if (done) return; done = true; const ok = (b.dataset.tf === '1') === truth; const xp = gScored(it, ok); if (ok) flyXP(xp, b); else b.classList.add('shake'); gFeedback(ok, xp, enSpan(tip[1]), l, tip[1], tip[2]); });
}
function hlWord(w, re) { try { return esc(w).replace(new RegExp(re, 'gi'), m => `<span class="hlc">${m}</span>`); } catch (e) { return esc(w); } }
function rGcls(it, el) {
  const { l } = it, [w, key] = it.it, cats = l.cls.cats, correct = cats.find(c => c[0] === key)?.[1];
  el.innerHTML = `<div class="ask">اسمع وصنّف<small>الحرف الملوّن بأي صوت بينلفظ؟</small></div><div class="card"><div class="row" style="justify-content:center">${gSay(l, w, '')}</div><div class="big-en">${l.hl ? hlWord(w, l.hl) : esc(w)}</div></div><div class="opts"></div>`;
  gOptions(el, it, cats.map(c => c[1]), correct, (ok, xp) => gFeedback(ok, xp, `<b>${rich(correct)}</b>`, l, w));
  setTimeout(() => { if (D && D.q[D.k] === it) playG(l, w); }, 300);
}
function rGsil(it, el) {
  const { l } = it, [w, sil] = it.it; let done = false;
  el.innerHTML = `<div class="ask">اضغط على الحرف اللي ما بينلفظ 🤫<small>اسمع الكلمة منيح</small></div><div class="card" style="gap:16px"><div class="row" style="justify-content:center">${gSay(l, w, '')}</div><div class="tiles">${w.split('').map((c, k) => `<button class="tile" type="button" data-c="${k}">${esc(c)}</button>`).join('')}</div></div>`;
  $$('[data-c]', el).forEach(b => b.onclick = () => { if (done) return; done = true; const c = w[+b.dataset.c].toLowerCase(), ok = sil.map(x => x.toLowerCase()).includes(c);
    $$('[data-c]', el).forEach(x => { if (sil.includes(w[+x.dataset.c].toLowerCase())) x.style.cssText = 'background:var(--good-soft);box-shadow:0 5px 0 var(--good);color:var(--good)'; });
    if (!ok) b.classList.add('shake'); const xp = gScored(it, ok); gFeedback(ok, xp, `الحرف الصامت: <b class="en">${esc(sil.join(', '))}</b>`, l, w); });
  setTimeout(() => { if (D && D.q[D.k] === it) playG(l, w); }, 300);
}
function rGstress(it, el) {
  const { l } = it, [w, syl] = it.it, parts = syl.split('-'), hit = parts.findIndex(p => /[A-Z]/.test(p) && p === p.toUpperCase()); let done = false;
  el.innerHTML = `<div class="ask">وين الضغطة؟ 💥<small>اضغط على المقطع اللي بينقال أقوى</small></div><div class="card" style="gap:16px"><div class="row" style="justify-content:center">${gSay(l, w, '')}</div><div class="en" style="font-size:22px;font-weight:600">${esc(w)}</div><div class="tiles">${parts.map((p, k) => `<button class="tile syl" type="button" data-s="${k}">${esc(p.toLowerCase())}</button>`).join('')}</div></div>`;
  $$('[data-s]', el).forEach(b => b.onclick = () => { if (done) return; done = true; const ok = +b.dataset.s === hit;
    const r = $(`[data-s="${hit}"]`, el); if (r) { r.textContent = parts[hit]; r.style.cssText = 'background:var(--good-soft);box-shadow:0 5px 0 var(--good);color:var(--good)'; }
    if (!ok) b.classList.add('shake'); const xp = gScored(it, ok); gFeedback(ok, xp, `<b class="en">${esc(syl)}</b>`, l, w); });
  setTimeout(() => { if (D && D.q[D.k] === it) playG(l, w); }, 300);
}
function gramResult(stars) {
  const id = D.gid, prev = G.gl[id], d = DAY();
  G.gl[id] = { s: Math.max(prev?.s || 0, stars), st: Math.max(prev?.st || 0, 1), due: prev ? Math.max(prev.due, d + 1) : d + 1 };
  const l = LBY.get(id), T = ensureToday();
  const act = { map: () => { TAB = 'map'; closeDeck(); }, again: () => { closeDeck(); startGram(l); }, read: () => { closeDeck(); lesson(id); } };
  return { gems: prev ? 0 : 10, title: stars === 3 ? 'فهمت القاعدة 100%!' : 'القاعدة صارت معك!', sub: T.g === id ? 'قاعدة اليوم تمّت. بكرة بترجعلك بالمراجعة.' : esc(l.ar),
    btns: `<button class="btn" type="button" data-act="map">كمّل الرحلة ←</button>${stars < 3 ? `<button class="btn ghost" type="button" data-act="again">العبها كمان لـ٣ نجوم</button>` : ''}<button class="btn ghost" type="button" data-act="read">اقرأ الشرح مرة ثانية</button>`, act };
}
function gPool() { const done = GORDER.filter(id => G.gl[id]).map(id => LBY.get(id)); return done.length ? done : GORDER.slice(G.gstart, G.gstart + 4).map(id => LBY.get(id)); }

/* grammar tab */
function viewGram() {
  const T = ensureToday(), tl = T.g && LBY.get(T.g);
  const lv = k => GD.order[k].filter(id => LBY.has(id));
  shell(`${tl ? `<section class="mission h3" style="gap:10px"><div class="row" style="position:relative;z-index:1"><span style="font-size:46px">${esc(tl.node || '📘')}</span><div class="grow"><div class="k">قاعدة اليوم · المستوى ${tl.lv}</div><h1 style="font-size:22px">${esc(tl.ar)}</h1><div class="ttl">${esc(tl.en)}</div></div></div>
      <button class="step now" type="button" id="today-l" style="position:relative;z-index:1"><span class="sc">${G.gl[tl.id] ? I.check : I.play}</span><span class="grow"><b>${G.gl[tl.id] ? 'العبها كمان' : 'ابدأ الدرس'}</b><small>شرح قصير بالبطاقات وبعدين ألعاب</small></span><span class="go">يلا ←</span></button></section>` : ''}
    ${['A', 'B', 'C'].map(k => { const ids = lv(k), dn = ids.filter(id => G.gl[id]).length, startIdx = GORDER.indexOf(ids[0]);
      return `<section class="sec"><div class="sec-h"><h2>المستوى ${k} · ${LVN[k]}</h2><span class="muted num">${dn}/${ids.length}</span></div>
        ${G.gstart !== startIdx && !ids.some(id => G.gl[id]) ? `<button class="btn ghost sm" type="button" data-from="${startIdx}" style="justify-self:start">بعرف اللي قبل؟ ابدأ من هون</button>` : ''}
        <div class="wlist">${ids.map(id => { const l = LBY.get(id), r = G.gl[id]; return `<button class="lrow" type="button" data-l="${id}"><span class="lic ${l.k === 'p' ? 'p' : ''}">${esc(l.node || '📘')}</span><span class="grow" style="min-width:0"><b>${esc(l.ar)}</b><small class="en">${esc(l.en)}</small></span>${id === T.g && !r ? '<span class="today">اليوم</span>' : r ? starsRow(r.s) : ''}</button>`; }).join('')}</div></section>`; }).join('')}`);
  const tb = $('#today-l'); if (tb) tb.onclick = () => lesson(tl.id);
  $$('[data-l]').forEach(b => b.onclick = () => lesson(b.dataset.l));
  $$('[data-from]').forEach(b => b.onclick = () => { G.gstart = +b.dataset.from; const T2 = ensureToday(); if (!G.gl[T2.g]) T2.g = firstOpenLesson(); save(); toast('تمام! قاعدة اليوم صارت من هالمستوى'); render(); });
}

/* arcade: mistake radar */
function radar() {
  const items = [];
  gPool().forEach(l => {
    (l.tip || []).forEach(([w, r]) => { items.push({ s: w, ok: false, r, l }); items.push({ s: r, ok: true, r, l }); });
    (l.q || []).forEach(q => { if (q[0] === 'fix') { items.push({ s: q[1], ok: false, r: q[2], l }); items.push({ s: q[2], ok: true, r: q[2], l }); } if (q[0] === 'pick') { items.push({ s: q[1], ok: true, r: q[1], l }); q.slice(2).forEach(w => items.push({ s: w, ok: false, r: q[1], l })); } });
  });
  if (items.length < 6) return toast('خلّص أول درس قواعد لتفتح هاللعبة');
  D = { kind: 'radar' }; const d = deckEl(); d.className = 'deck h1';
  let score = 0, streak = 0, t = 60, cur = null, end = false; const seenL = new Set();
  d.innerHTML = `<div class="in">
    <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="timer grow"><i id="tbar" style="width:100%"></i></div><span class="score num" id="sc">0</span></div>
    <div class="ask" style="text-align:center">الجملة صح ولا فيها غلطة؟</div>
    <div class="card" id="rc" style="min-height:200px;align-content:center"></div>
    <div class="tfbtns"><button class="btn bad" type="button" id="no">✗ فيها غلطة</button><button class="btn good" type="button" id="yes">✓ صح</button></div>
    <p class="muted" style="text-align:center;margin:0">كل ٥ صح ورا بعض = ٣ ثواني زيادة</p></div>`;
  bindQuit();
  const next = () => { let n; do { n = rnd(items); } while (n === cur && items.length > 1); cur = n; $('#rc').innerHTML = `<div class="en" style="font-size:23px;font-weight:600;line-height:1.4">${esc(cur.s)}</div>`; $('#rc').classList.remove('pop-in'); void $('#rc').offsetWidth; $('#rc').classList.add('pop-in'); };
  const ans = yes => { if (end) return; const ok = yes === cur.ok; seenL.add(cur.l.id);
    if (ok) { score++; streak++; SFX.ok(); if (streak % 5 === 0) { t = Math.min(60, t + 3); burst('+٣ ثواني'); SFX.combo(); } }
    else { streak = 0; SFX.no(); $('#rc').classList.add('shake'); toast('الصح: ' + cur.r); }
    $('#sc').textContent = score; next(); };
  $('#yes').onclick = () => ans(true); $('#no').onclick = () => ans(false); next();
  let last = Date.now();
  const tm = setInterval(() => { if (!$('.deck') || D?.kind !== 'radar') return clearInterval(tm); const now = Date.now(); t -= (now - last) / 1000; last = now; $('#tbar').style.width = Math.max(0, t / 60 * 100) + '%'; if (t <= 0) { clearInterval(tm); end = true; arcadeDone('radar', score, [], score >= 25 ? 3 : score >= 15 ? 2 : 1, `${score} جواب صح`); } }, 100);
}

/* ---------- story words player ---------- */
function storyWords(n) {
  if (!window.WordPlayer) return;
  const s = STORIES[n - 1]; prefetch(s.words);
  window.WordPlayer.open({ title: `القصة ${AR(n)} · ${s.en}`, items: s.words.map(i => ({ w: W[i].w, m: W[i].m, p: W[i].p })),
    sayEn: (w, rate) => { const i = s.words.find(j => W[j].w === w); return i != null ? say(i, rate) : tts(w, .85 * rate); }, stop: stopAudio });
}

/* ---------- dictionary ---------- */
const DSRC = {
  entries: () => W.map(w => { const f = window.Dict.expandEntry(w.head || w.w, w.full || w.m); if (!f.length || norm(f[0][0]) !== w.k) f.unshift([w.w, w.m]); return { w: w.w, p: w.p, m: w.m, lv: w.lv, forms: f }; }),
  fam: window.FAM?.fam, ant: window.FAM?.ant, syn: window.FAM?.syn,
  say: text => sayAny(text),
};
function viewDict() { shell('<div id="dxroot"></div>'); if (window.Dict) window.Dict.mount($('#dxroot'), DSRC); else $('#dxroot').innerHTML = '<p class="muted">القاموس ما انحمّل.</p>'; }

/* ---------- go ---------- */
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (['map', 'gram', 'dict', 'review', 'arcade', 'me'].includes(h) && !D) { TAB = h; render(); } });
ensureToday(); render();
})();
