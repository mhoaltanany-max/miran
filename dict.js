/* القاموس — a searchable word dictionary shared by «مران اللعبة» and «لغتي التفاعلي».
   Every word form is its own line with its own meaning (attach / attached / attaching …),
   plus the 52 topic families, antonyms and synonyms from «عائلات الكلمات». */
(() => {
'use strict';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const nEn = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
const nAr = s => String(s).replace(/[ً-ْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5a1 1 0 0 0 1 1h3l4.6 3.8a.8.8 0 0 0 1.4-.6V5.3a.8.8 0 0 0-1.4-.6L7.5 8.5h-3a1 1 0 0 0-1 1z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

/* expand «مران» shorthand: "attach +ed +ing, attachment", "make +r +ing \ made + of" */
function joinSfx(root, sfx) {
  if (!sfx) return root;
  const fx = window.DICT_FIX && window.DICT_FIX[root + '|' + sfx]; if (fx) return fx; /* absorb+ption → absorption, not absorbption */
  if (/^[-\s]/.test(sfx)) return root + sfx;
  const v = /^[aeiouy]/i.test(sfx);
  if (/e$/i.test(root) && !/(ee|oe|ye)$/i.test(root) && v && !(/[cg]e$/i.test(root) && /^[ao]/i.test(sfx))) return root.slice(0, -1) + sfx;
  if (/[^aeiou]y$/i.test(root)) { if (/^i/i.test(sfx)) return /^(ing|ish|ism|ist)/i.test(sfx) ? root + sfx : root.slice(0, -1) + sfx; return root.slice(0, -1) + 'i' + sfx; }
  return root + sfx;
}
function expandEntry(head, full) {
  const out = [], means = String(full || '').split(/\s*\+\s*/), toks = [], re = /(,|\\|\+|=)/g; let last = 0, m, op = null;
  while ((m = re.exec(head))) { toks.push([op, head.slice(last, m.index)]); op = m[1]; last = re.lastIndex; }
  toks.push([op, head.slice(last)]);
  let root = null, cur = null, mi = 0;
  const add = (form, share) => {
    const mean = share ? (out.length ? out[out.length - 1][1] : '') : (means[mi++] || '');
    const ex = out.find(x => x[0] === form);
    if (ex) { if (mean && !ex[1].includes(mean)) ex[1] = ex[1] ? ex[1] + '، ' + mean : mean; return; }
    out.push([form, mean]);
  };
  toks.forEach(([o, raw]) => {
    const txt = raw.replace(/\s+$/, ''); if (!txt.trim()) return;
    const sp = /^\s/.test(txt), w = txt.trim();
    if (o === ',' && mi >= means.length && out.length) { out[out.length - 1][0] += ', ' + w; return; }
    if (o === null || o === ',') { root = cur = w; add(w); }
    else if (o === '\\') { cur = w; add(w); }
    else if (o === '+') add(sp ? cur + ' ' + w : joinSfx(root, w));
    else if (o === '=') add(sp && w.slice(0, 2).toLowerCase() === root.slice(0, 2).toLowerCase() ? w : joinSfx(root, w), true);
  });
  return out;
}

const CSS = `
.dx{--dxa:var(--grape,var(--violet,#6C4CF5));display:grid;grid-template-columns:minmax(0,1fr);gap:14px;min-width:0}
.dx>*{min-width:0}
.dx-search input::-webkit-search-cancel-button{display:none}
.dx-search{position:sticky;top:calc(env(safe-area-inset-top,0px) + 62px);z-index:5;display:flex;gap:8px;align-items:center;background:var(--card);border-radius:18px;padding:6px 6px 6px 12px;box-shadow:0 4px 0 var(--line)}
.dx-search input{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:18px;color:var(--ink);padding:8px 6px;outline:none}
.dx-search .dx-x{width:38px;height:38px;border-radius:12px;background:var(--sunk);color:var(--muted);font-size:20px;font-weight:800}
.dx-modes{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.dx-modes::-webkit-scrollbar{display:none}
.dx-modes button{white-space:nowrap;padding:8px 14px;border-radius:14px;background:var(--card);box-shadow:0 3px 0 var(--line);font-weight:800;font-size:15px;color:var(--ink2,var(--ink))}
.dx-modes button[aria-pressed="true"]{background:var(--dxa);color:#fff;box-shadow:0 3px 0 color-mix(in srgb,var(--dxa) 70%,#000)}
.dx-info{color:var(--muted);font-size:14.5px;margin:0}
.dx-list{display:grid;gap:12px}
.dx-fam{background:var(--card);border-radius:20px;box-shadow:0 4px 0 var(--line);overflow:hidden}
.dx-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:2px solid var(--sunk);min-width:0}
.dx-row:first-child{border-top:0}
.dx-row.base{background:color-mix(in srgb,var(--dxa) 8%,var(--card))}
.dx-row.sub{padding-inline-start:26px}
.dx-row .w{font-family:var(--en);direction:ltr;unicode-bidi:isolate;font-weight:700;font-size:18px;color:var(--ink)}
.dx-row.base .w{font-size:20px;color:var(--dxa)}
.dx-row .p{display:block;font-size:13px;color:var(--muted)}
.dx-row .m{font-size:15.5px;color:var(--ink2,var(--ink));line-height:1.6;overflow-wrap:anywhere}
.dx-row .tx{flex:1;min-width:0;display:grid;gap:0}
.dx-row.hit{outline:3px solid var(--sun,#FFC233);outline-offset:-3px}
.dx-say{width:38px;height:38px;border-radius:12px;background:var(--sky,var(--blue,#3BB2FF));color:#fff;display:grid;place-items:center;flex:none;box-shadow:0 3px 0 color-mix(in srgb,var(--sky,var(--blue,#3BB2FF)) 65%,#000)}
.dx-say svg{width:20px;height:20px}
.dx-row.sub .dx-say{width:32px;height:32px;border-radius:10px}
.dx-row.sub .dx-say svg{width:17px;height:17px}
.dx-more{justify-self:center}
.dx-topics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.dx-topic{background:var(--card);border-radius:18px;padding:12px;box-shadow:0 4px 0 var(--line);display:flex;align-items:center;gap:10px;text-align:start;min-width:0}
.dx-topic .i{font-size:30px;flex:none}
.dx-topic b{display:block;font-size:15px;line-height:1.35}
.dx-topic small{color:var(--muted);font-size:13px}
.dx-back{justify-self:start}
.dx-pair{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:6px;background:var(--card);border-radius:18px;padding:10px;box-shadow:0 4px 0 var(--line)}
.dx-pair .side{display:grid;gap:2px;justify-items:center;text-align:center;min-width:0}
.dx-pair .side .w{font-family:var(--en);font-weight:700;font-size:18px;direction:ltr;overflow-wrap:anywhere;min-width:0}
.dx-pair .side .m{font-size:14px;color:var(--muted);line-height:1.5;overflow-wrap:anywhere}
.dx-pair .row{min-width:0;max-width:100%}
.dx-pair .op{font-size:24px;font-weight:800;color:var(--dxa)}
.dx-pair .row{display:flex;gap:6px;align-items:center}
.dx-empty{text-align:center;color:var(--muted);padding:24px;background:var(--card);border-radius:20px}
.dx-lv{display:inline-block;font-family:var(--en);font-weight:700;font-size:12px;line-height:1;padding:4px 7px;border-radius:8px;vertical-align:middle;margin-inline-start:6px;background:var(--sunk);color:var(--ink2,var(--ink))}
.dx-lv.a{background:#D5F7EA;color:#0B9476}.dx-lv.b{background:#DDF0FF;color:#1C86D1}.dx-lv.b2{background:#FFF0C7;color:#A86F00}.dx-lv.c{background:#FFE3E7;color:#D94848}
mark.dx-hl{background:var(--hl,#FFE27A);color:inherit;border-radius:4px;padding:0 1px}
`;

/* build the index once: entries = [{w, p, m, forms:[[form, meaning]], fam}] */
function index(src) {
  if (src._ix) return src._ix;
  const entries = src.entries(), byW = new Map();
  entries.forEach(e => { e.keys = e.forms.map(f => nEn(f[0])); e.ar = nAr(e.forms.map(f => f[1]).join(' ')); byW.set(nEn(e.w), e); });
  const fam = (src.fam || []).map(f => ({ i: f.i, n: f.n, w: f.w }));
  return src._ix = { entries, byW, fam, ant: src.ant || [], syn: src.syn || [] };
}
function mount(el, src) {
  if (!document.getElementById('dx-css')) { const st = document.createElement('style'); st.id = 'dx-css'; st.textContent = CSS; document.head.appendChild(st); }
  const X = index(src); const st = src.state || (src.state = { mode: 'all', q: '', n: 40, topic: null });
  el.innerHTML = `<div class="dx">
    <div class="dx-search"><span style="font-size:20px">🔎</span><input id="dx-q" type="search" placeholder="ابحث بالإنجليزي أو بالعربي…" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(st.q)}"><button class="dx-x" type="button" id="dx-clear" aria-label="امسح البحث">×</button></div>
    <div class="dx-modes">${[['all', '📖 كل الكلمات'], ['topics', '🗂️ المواضيع'], ['ant', '⟷ الأضداد'], ['syn', '= المرادفات']].map(([k, n]) => `<button type="button" data-dxm="${k}" aria-pressed="${st.mode === k}">${n}</button>`).join('')}</div>
    <div id="dx-body"></div></div>`;
  const body = el.querySelector('#dx-body'), q = el.querySelector('#dx-q');
  const hl = (s, needle, isEn) => { if (!needle) return esc(s); const t = String(s); const i = (isEn ? t.toLowerCase() : nAr(t)).indexOf(needle); if (i < 0 || !isEn) return esc(t); return esc(t.slice(0, i)) + '<mark class="dx-hl">' + esc(t.slice(i, i + needle.length)) + '</mark>' + esc(t.slice(i + needle.length)); };
  const say = (w) => `<button class="dx-say" type="button" data-dxs="${esc(w)}" aria-label="استمع">${SPK}</button>`;
  const block = (e, needle, isEn) => `<div class="dx-fam">${e.forms.map((f, k) => `<div class="dx-row ${k ? 'sub' : 'base'} ${needle && isEn && e.keys[k].startsWith(needle) ? 'hit' : ''}">${say(f[0])}<span class="tx"><span><span class="w">${hl(f[0], needle, isEn)}</span>${!k && e.lv ? ` <span class="dx-lv ${({ A1: 'a', A2: 'a', B1: 'b', B2: 'b2', C1: 'c', C2: 'c' })[e.lv] || 'b'}">${esc(e.lv)}</span>` : ''}${!k && e.p ? `<span class="p">${esc(e.p)}</span>` : ''}</span><span class="m">${esc(f[1])}</span></span></div>`).join('')}</div>`;
  const draw = () => {
    const raw = st.q.trim(), isEn = /[a-z]/i.test(raw), needle = isEn ? nEn(raw) : nAr(raw);
    let h = '';
    if (raw) {
      const scored = [];
      X.entries.forEach(e => {
        let s = -1;
        if (isEn) { e.keys.forEach((k, j) => { const v = k === needle ? (j ? 90 : 100) : k.startsWith(needle) ? (j ? 60 : 70) - Math.min(20, k.length - needle.length) / 2 : k.includes(needle) ? 30 : -1; if (v > s) s = v; }); }
        else if (e.ar.includes(needle)) s = 40 + (nAr(e.m).startsWith(needle) ? 20 : 0);
        if (s >= 0) scored.push([s, e]);
      });
      scored.sort((a, b) => b[0] - a[0] || a[1].w.localeCompare(b[1].w));
      h = `<p class="dx-info">${scored.length ? `${AR(scored.length)} نتيجة لـ «${esc(raw)}»` : ''}</p>` + (scored.length ? `<div class="dx-list">${scored.slice(0, st.n).map(([, e]) => block(e, needle, isEn)).join('')}</div>${scored.length > st.n ? '<button class="btn ghost sm dx-more" type="button" id="dx-more">عرض المزيد</button>' : ''}` : `<div class="dx-empty">ما لقيت «${esc(raw)}». جرّب جزء من الكلمة أو اكتبها بالعربي.</div>`);
    } else if (st.mode === 'all') {
      const all = X.entries.slice().sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
      h = `<p class="dx-info">${AR(all.length)} كلمة و${AR(all.reduce((a, e) => a + e.forms.length, 0))} شكل. كل شكل على سطر لحاله مع معناه.</p><div class="dx-list">${all.slice(0, st.n).map(e => block(e)).join('')}</div>${all.length > st.n ? '<button class="btn ghost sm dx-more" type="button" id="dx-more">عرض المزيد</button>' : ''}`;
    } else if (st.mode === 'topics') {
      if (st.topic == null) h = `<div class="dx-topics">${X.fam.map((f, k) => `<button class="dx-topic" type="button" data-dxt="${k}"><span class="i">${f.i}</span><span style="min-width:0"><b>${esc(f.n)}</b><small>${AR(f.w.length)} كلمة</small></span></button>`).join('')}</div>`;
      else { const f = X.fam[st.topic]; h = `<button class="btn ghost sm dx-back" type="button" id="dx-back">→ كل المواضيع</button><h2 style="margin:0">${f.i} ${esc(f.n)}</h2><div class="dx-list">${f.w.map(r => { const e = X.byW.get(nEn(r[0])); return e ? block(e) : `<div class="dx-fam"><div class="dx-row base">${say(r[0])}<span class="tx"><span><span class="w">${esc(r[0])}</span><span class="p">${esc(r[1])}</span></span><span class="m">${esc(r[2])}</span></span></div></div>`; }).join('')}</div>`; }
    } else {
      const L = st.mode === 'ant' ? X.ant : X.syn, op = st.mode === 'ant' ? '⟷' : '=';
      h = `<p class="dx-info">${st.mode === 'ant' ? 'كل كلمة وعكسها' : 'كل كلمة ومرادفها'} · ${AR(L.length)}</p><div class="dx-list">${L.map(([a, am, b, bm]) => `<div class="dx-pair"><div class="side"><div class="row">${say(a)}<span class="w">${esc(a)}</span></div><span class="m">${esc(am)}</span></div><span class="op">${op}</span><div class="side"><div class="row">${say(b)}<span class="w">${esc(b)}</span></div><span class="m">${esc(bm)}</span></div></div>`).join('')}</div>`;
    }
    body.innerHTML = h;
    const more = body.querySelector('#dx-more'); if (more) more.onclick = () => { st.n += 60; draw(); };
    body.querySelectorAll('[data-dxt]').forEach(b => b.onclick = () => { st.topic = +b.dataset.dxt; draw(); scrollTo(0, 0); });
    const back = body.querySelector('#dx-back'); if (back) back.onclick = () => { st.topic = null; draw(); };
  };
  el.querySelectorAll('[data-dxm]').forEach(b => b.onclick = () => { st.mode = b.dataset.dxm; st.n = 40; st.topic = null; st.q = ''; q.value = ''; el.querySelectorAll('[data-dxm]').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  let t = 0; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = q.value; st.n = 40; draw(); }, 140); });
  el.querySelector('#dx-clear').onclick = () => { q.value = ''; st.q = ''; draw(); q.focus(); };
  el.addEventListener('click', e => { const b = e.target.closest('[data-dxs]'); if (!b) return; e.stopPropagation(); b.style.transform = 'scale(.9)'; setTimeout(() => b.style.transform = '', 150); src.say(b.dataset.dxs); });
  draw();
}
window.Dict = { mount, expandEntry, nEn };
})();
