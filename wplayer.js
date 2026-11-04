/* كلمات القصة — plays a story's words one after another (English, then optionally the Arabic meaning),
   with repeat count, speed, pause length and loop, shared by «مران اللعبة» and «لغتي التفاعلي». */
(() => {
'use strict';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'wplayer.v1';
let S = { rep: 2, rate: 1, ar: true, gap: 1, loop: false };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
const arShort = m => String(m).split(/[،,+؛;]/)[0].replace(/[ً-ْ]/g, '').replace(/\s+/g, ' ').trim();

let arVoice = null;
const pick = () => { try { const v = speechSynthesis.getVoices(); arVoice = v.find(x => /^ar/i.test(x.lang) && /google/i.test(x.name)) || v.find(x => /^ar/i.test(x.lang)) || null; } catch (e) { } };
try { pick(); speechSynthesis.addEventListener?.('voiceschanged', pick); } catch (e) { }
const canAr = () => !!window.Capacitor?.Plugins?.TextToSpeech || !!arVoice;
function speakAr(text, rate) {
  return new Promise(res => {
    const C = window.Capacitor?.Plugins?.TextToSpeech;
    if (C) { C.speak({ text, lang: 'ar-SA', rate: Math.max(.5, rate * .95), volume: 1, category: 'ambient' }).then(res, res); return; }
    if (!window.speechSynthesis) return res();
    if (!arVoice) pick();
    /* long sentences need longer than a fixed few seconds, or the next voice cuts them off */
    try { const u = new SpeechSynthesisUtterance(text); if (arVoice) u.voice = arVoice; u.lang = arVoice ? arVoice.lang : 'ar-SA'; u.rate = rate * .95; u.onend = res; u.onerror = res; speechSynthesis.speak(u); setTimeout(res, 3000 + String(text).length * 140 / Math.min(1, rate)); } catch (e) { res(); }
  });
}
function stopAr() { try { window.Capacitor?.Plugins?.TextToSpeech?.stop?.(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } }

const CSS = `
.wp{position:fixed;inset:0;z-index:75;background:var(--bg);overflow-y:auto}
.wp .in{max-width:600px;margin:0 auto;padding-block:calc(env(safe-area-inset-top,0px) + 12px) 190px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
.wp-top{display:flex;align-items:center;gap:10px}
.wp-x{width:42px;height:42px;border-radius:14px;background:var(--card);box-shadow:0 3px 0 var(--line);display:grid;place-items:center;color:var(--muted);font-size:24px;font-weight:800;flex:none}
.wp-title{flex:1;min-width:0}
.wp-title b{display:block;font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wp-title small{color:var(--muted);font-size:13.5px}
.wp-now{background:var(--card);border-radius:26px;box-shadow:0 6px 0 var(--line);padding:22px 16px;display:grid;justify-items:center;gap:6px;text-align:center}
.wp-now .e{font-size:72px;line-height:1.1}
.wp-now .w{font-family:var(--en);direction:ltr;font-weight:700;font-size:clamp(34px,10vw,48px);line-height:1.15;color:var(--grape,var(--violet,#6C4CF5));overflow-wrap:anywhere}
.wp-now .p{color:var(--muted);font-size:15px}
.wp-now .m{font-size:22px;font-weight:700;line-height:1.6}
.wp-now .cnt{font-size:13px;font-weight:800;color:var(--muted)}
.wp-now.speak .w{animation:wpb .5s ease-in-out infinite alternate}
@keyframes wpb{to{transform:scale(1.06)}}
.wp-bar{height:10px;border-radius:99px;background:var(--sunk);overflow:hidden}
.wp-bar i{display:block;height:100%;background:var(--grape,var(--violet,#6C4CF5));border-radius:99px;transition:width .3s}
.wp-set{background:var(--card);border-radius:20px;box-shadow:0 4px 0 var(--line);padding:6px 14px}
.wp-row{display:flex;align-items:center;gap:10px;padding-block:9px;border-bottom:2px solid var(--sunk);flex-wrap:wrap}
.wp-row:last-child{border-bottom:0}
.wp-row .l{flex:1;min-width:110px;font-weight:700;font-size:15.5px}
.wp-seg{display:flex;gap:6px;flex-wrap:wrap}
.wp-seg button{min-width:42px;padding:6px 11px;border-radius:12px;background:var(--sunk);font-weight:800;font-size:15px;color:var(--ink2,var(--ink))}
.wp-seg button[aria-pressed="true"]{background:var(--grape,var(--violet,#6C4CF5));color:#fff}
.wp-note{font-size:13px;color:var(--muted);margin:0}
.wp-list{display:grid;gap:0;background:var(--card);border-radius:20px;box-shadow:0 4px 0 var(--line);overflow:hidden}
.wp-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:2px solid var(--sunk);text-align:start;width:100%;min-width:0}
.wp-item:last-child{border-bottom:0}
.wp-item .n{width:28px;font-weight:800;color:var(--muted);font-size:13px;flex:none;text-align:center}
.wp-item .e{font-size:24px;flex:none}
.wp-item .w{font-family:var(--en);direction:ltr;font-weight:700;font-size:17px}
.wp-item .m{color:var(--muted);font-size:14.5px;margin-inline-start:auto;text-align:end;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wp-item.on{background:color-mix(in srgb,var(--sun,#FFC233) 28%,var(--card))}
.wp-dock{position:fixed;inset:auto 0 0 0;z-index:76;padding-bottom:env(safe-area-inset-bottom,0px);background:linear-gradient(transparent,var(--bg) 30%)}
.wp-dock .in2{max-width:600px;margin:0 auto;padding-block:22px 16px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;justify-content:center;align-items:center;gap:14px}
.wp-b{width:58px;height:58px;border-radius:20px;background:var(--card);box-shadow:0 5px 0 var(--line);display:grid;place-items:center;font-size:24px;color:var(--ink)}
.wp-b.main{width:84px;height:84px;border-radius:30px;background:var(--grape,var(--violet,#6C4CF5));color:#fff;font-size:36px;box-shadow:0 6px 0 color-mix(in srgb,var(--grape,var(--violet,#6C4CF5)) 65%,#000)}
.wp-b:active{transform:translateY(3px)}
`;

let run = 0;
function open(opt) {
  if (!document.getElementById('wp-css')) { const st = document.createElement('style'); st.id = 'wp-css'; st.textContent = CSS; document.head.appendChild(st); }
  const items = opt.items.filter(x => x && x.w); if (!items.length) return;
  close();
  let k = 0, playing = false, rep = 0;
  const el = document.createElement('div'); el.className = 'wp'; el.setAttribute('role', 'dialog');
  const dock = document.createElement('div'); dock.className = 'wp-dock';
  document.body.append(el, dock); document.body.style.overflow = 'hidden';
  const seg = (key, vals) => `<div class="wp-seg">${vals.map(([v, l]) => `<button type="button" data-k="${key}" data-v="${v}" aria-pressed="${S[key] === v}">${l}</button>`).join('')}</div>`;
  const draw = () => {
    const it = items[k];
    el.innerHTML = `<div class="in">
      <div class="wp-top"><button class="wp-x" type="button" id="wp-close" aria-label="سكّر">×</button><div class="wp-title"><b>🎧 كلمات القصة</b><small>${esc(opt.title || '')}</small></div></div>
      <div class="wp-bar"><i style="width:${Math.round(100 * (k + 1) / items.length)}%"></i></div>
      <div class="wp-now ${playing ? 'speak' : ''}" id="wp-now">${it.emo ? `<span class="e">${it.emo}</span>` : ''}<div class="w">${esc(it.w)}</div>${it.p ? `<div class="p">${esc(it.p)}</div>` : ''}<div class="m">${esc(it.m)}</div><div class="cnt">${AR(k + 1)} / ${AR(items.length)}${playing && S.rep > 1 ? ` · تكرار ${AR(rep + 1)} من ${AR(S.rep)}` : ''}</div></div>
      <div class="wp-set">
        <div class="wp-row"><span class="l">🔁 تكرار كل كلمة</span>${seg('rep', [[1, '١'], [2, '٢'], [3, '٣'], [5, '٥']])}</div>
        <div class="wp-row"><span class="l">🐢 السرعة</span>${seg('rate', [[.6, 'بطيء جدًا'], [.8, 'بطيء'], [1, 'عادي'], [1.2, 'سريع']])}</div>
        <div class="wp-row"><span class="l">⏸️ استراحة بين الكلمات</span>${seg('gap', [[.5, 'قصيرة'], [1, 'عادية'], [2, 'طويلة']])}</div>
        <div class="wp-row"><span class="l">🇸🇦 المعنى بالعربي بصوت</span>${seg('ar', [[true, 'نعم'], [false, 'لا']])}</div>
        <div class="wp-row"><span class="l">♾️ إعادة القائمة من الأول</span>${seg('loop', [[true, 'نعم'], [false, 'لا']])}</div>
        ${S.ar && !canAr() ? '<p class="wp-note">صوت العربي مش متوفر بهالمتصفح، رح ينعرض المعنى مكتوب بس. على الجوال بيشتغل.</p>' : ''}
      </div>
      <div class="wp-list">${items.map((x, j) => `<button class="wp-item ${j === k ? 'on' : ''}" type="button" data-j="${j}"><span class="n">${AR(j + 1)}</span>${x.emo ? `<span class="e">${x.emo}</span>` : ''}<span class="w">${esc(x.w)}</span><span class="m">${esc(arShort(x.m))}</span></button>`).join('')}</div>
    </div>`;
    dock.innerHTML = `<div class="in2"><button class="wp-b" type="button" id="wp-prev" aria-label="الكلمة السابقة">▶</button><button class="wp-b main" type="button" id="wp-play" aria-label="${playing ? 'وقّف' : 'شغّل'}">${playing ? '❚❚' : '▶'}</button><button class="wp-b" type="button" id="wp-next" aria-label="الكلمة التالية">◀</button></div>`;
    el.querySelector('#wp-close').onclick = close;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const key = b.dataset.k, raw = b.dataset.v; S[key] = raw === 'true' ? true : raw === 'false' ? false : +raw; save(); draw(); });
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { k = +b.dataset.j; restart(); });
    dock.querySelector('#wp-play').onclick = () => { if (playing) stop(); else start(); };
    dock.querySelector('#wp-prev').onclick = () => { k = Math.max(0, k - 1); restart(); };
    dock.querySelector('#wp-next').onclick = () => { k = Math.min(items.length - 1, k + 1); restart(); };
    const on = el.querySelector('.wp-item.on'); if (on && playing) on.scrollIntoView({ block: 'nearest' });
  };
  const stop = () => { run++; playing = false; stopAr(); opt.stop && opt.stop(); draw(); };
  const restart = () => { const was = playing; run++; stopAr(); opt.stop && opt.stop(); playing = false; rep = 0; draw(); if (was) start(); };
  const start = async () => {
    const my = ++run; playing = true; draw();
    while (my === run) {
      const it = items[k];
      /* each repetition is the English word followed by its Arabic meaning */
      for (rep = 0; rep < S.rep && my === run; rep++) {
        draw();
        await opt.sayEn(it.w, S.rate); if (my !== run) return;
        await wait(450 * S.gap / S.rate); if (my !== run) return;
        if (S.ar) { await speakAr(arShort(it.m), S.rate); if (my !== run) return; await wait(500 * S.gap / Math.min(1, S.rate)); if (my !== run) return; }
      }
      if (my !== run) return;
      if (k < items.length - 1) k++; else if (S.loop) k = 0; else { playing = false; rep = 0; draw(); return; }
    }
  };
  open.close = () => { run++; stopAr(); opt.stop && opt.stop(); el.remove(); dock.remove(); document.body.style.overflow = opt.keepOverflow ? 'hidden' : ''; };
  draw(); if (opt.autoplay !== false) start();
}
function close() { if (open.close) { const c = open.close; open.close = null; c(); } }
window.WordPlayer = { open, close, speakAr, stopAr, canAr };
})();
