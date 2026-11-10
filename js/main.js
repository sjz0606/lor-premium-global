import { CASES, COUNTRIES, REVIEWS, PHONE } from './data.js';
import { UZ, T } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const ORDER = ['kz', 'tj', 'kg', 'ru', 'uz'];
const HELP_OUT = {
  ru: 'Оранжевые линии — города, где доктор учился и стажировался. Нажмите на город, чтобы перейти к описанию.',
  uz: 'To‘q sariq chiziqlar — doktor o‘qigan va amaliyot o‘tagan shaharlar. Tavsifga o‘tish uchun shaharni bosing.',
};

/* ---------------- language ---------------- */
const RU = { title: document.title };
$$('[data-i]').forEach((el) => (RU[el.dataset.i] = el.textContent));
$$('[data-i-ph]').forEach((el) => (RU[el.dataset.iPh] = el.placeholder));
$$('[data-i-alt]').forEach((el) => (RU[el.dataset.iAlt] = el.alt));
$$('[data-i-aria]').forEach((el) => (RU[el.dataset.iAria] = el.getAttribute('aria-label')));
const DICT = { ru: RU, uz: { ...RU, ...UZ } };
const qp = new URLSearchParams(location.search).get('lang');
let lang = qp === 'uz' || qp === 'ru' ? qp : (localStorage.getItem('lorp-lang') || 'ru');
if (!DICT[lang]) lang = 'ru';
const t = () => T[lang];

function applyLang(lg, user) {
  lang = lg;
  const d = DICT[lg];
  document.documentElement.lang = lg === 'uz' ? 'uz-Latn' : 'ru';
  document.title = d.title;
  $$('[data-i]').forEach((el) => { const v = d[el.dataset.i]; if (v != null) el.textContent = v; });
  $$('[data-i-ph]').forEach((el) => { const v = d[el.dataset.iPh]; if (v != null) el.placeholder = v; });
  $$('[data-i-alt]').forEach((el) => { const v = d[el.dataset.iAlt]; if (v != null) el.alt = v; });
  $$('[data-i-aria]').forEach((el) => { const v = d[el.dataset.iAria]; if (v != null) el.setAttribute('aria-label', v); });
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lg)));
  if (user) {
    localStorage.setItem('lorp-lang', lg);
    const u = new URL(location.href);
    if (lg === 'uz') u.searchParams.set('lang', 'uz'); else u.searchParams.delete('lang');
    history.replaceState(null, '', u);
  }
  $('#globe-help').textContent = mode === 'out' ? HELP_OUT[lg] : d['globe.help'];
  renderChips(); renderTabs(); renderWall(); renderChecks(); updateTicket(); buildMsg(); relabelReviews();
  if (drawerC) openDrawer(drawerC, true);
  globeApi?.setLang(lg);
}
$$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang, true)));

/* ---------------- helpers ---------------- */
const toastEl = $('#toast');
let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2600); }
const cName = (c) => COUNTRIES[c][lang];
const byC = (c) => (c === 'all' ? CASES : CASES.filter((x) => x.c === c));

// autoplay videos when visible (never under reduced motion)
const vio = new IntersectionObserver((ents) => ents.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting && !reduced) { v.play().catch(() => {}); } else if (!v.paused) v.pause();
}), { threshold: 0.55 });
const watchVideo = (v) => { v.muted = true; vio.observe(v); };
$$('video[data-autoplay]').forEach(watchVideo);

function mediaEl(cs, cls) {
  if (cs.type === 'v') {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.poster = cs.poster; v.src = cs.src;
    v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    if (cls) v.className = cls;
    return v;
  }
  const im = document.createElement('img');
  im.src = cs.poster; im.loading = 'lazy'; im.decoding = 'async'; im.alt = '';
  return im;
}

/* ---------------- globe ---------------- */
let globeApi = null, mode = 'in', drawerC = null;
function onPick(p) {
  if (p.type === 'country') openDrawer(p.c);
  else if (p.type === 'train') {
    const li = $(`.tl__i[data-geo="${p.id}"]`);
    if (li) { li.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); li.animate?.([{ outline: '2px solid #ffb45e' }, { outline: '2px solid transparent' }], { duration: 1800, delay: 500 }); }
  } else if (p.type === 'home') $('#path').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
}
const lowPower = navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2);
async function initGlobe() {
  const canvas = $('#globe-canvas'), labelsEl = $('#globe-labels');
  try {
    if (!hasWebGL() || lowPower) throw new Error('fallback');
    const { createGlobe } = await import('./globe.js');
    globeApi = await createGlobe({ canvas, labelsEl, lang, onPick, reduced, mobile });
  } catch (e) {
    if (e.message !== 'fallback') console.warn('globe fallback', e);
    canvas.hidden = true;
    const { createFallbackMap } = await import('./globe.js');
    globeApi = createFallbackMap({ el: $('#globe-fallback'), labelsEl, lang, onPick });
  }
  globeApi.setMode(mode);
}
initGlobe();

$$('.seg__b').forEach((b) => b.addEventListener('click', () => {
  mode = b.dataset.mode;
  $$('.seg__b').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  $('#globe-help').textContent = mode === 'out' ? HELP_OUT[lang] : DICT[lang]['globe.help'];
  $('#country-chips').hidden = mode === 'out';
  if (mode === 'out') closeDrawer();
  globeApi?.setMode(mode);
}));

// hero scroll -> camera dolly
const hero = $('.hero');
let sTick = false;
addEventListener('scroll', () => {
  if (sTick) return; sTick = true;
  requestAnimationFrame(() => {
    sTick = false;
    const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.9)));
    if (!reduced) globeApi?.setScroll(p);
  });
}, { passive: true });

/* chips + drawer */
function renderChips() {
  const box = $('#country-chips');
  box.innerHTML = '';
  ORDER.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.c = c;
    b.setAttribute('aria-pressed', String(drawerC === c));
    b.innerHTML = `${cName(c)}<small>${byC(c).length}</small>`;
    b.addEventListener('click', () => (drawerC === c ? closeDrawer() : openDrawer(c)));
    box.appendChild(b);
  });
}
const drawer = $('#drawer');
function openDrawer(c, silent) {
  drawerC = c;
  $('#drawer-title').textContent = cName(c);
  const list = $('#drawer-list'); list.innerHTML = '';
  byC(c).slice(0, 4).forEach((cs) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mini';
    b.appendChild(mediaEl({ ...cs, type: 'i' }));
    b.insertAdjacentHTML('beforeend', `<i>${cs.type === 'v' ? t().video : t().photo}</i><span>${cs.t[lang]}</span>`);
    b.addEventListener('click', () => openLb(cs, b));
    list.appendChild(b);
  });
  drawer.hidden = false;
  $$('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.c === c)));
  globeApi?.focus(c);
  globeApi?.setShift(innerWidth >= 1024 ? 0.2 : 0);
  if (!silent && !reduced && drawer.animate) drawer.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
  if (!silent && mobile) drawer.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
}
function closeDrawer() { drawerC = null; drawer.hidden = true; $$('.chip').forEach((x) => x.setAttribute('aria-pressed', 'false')); globeApi?.focus(null); globeApi?.setShift(0); }
$('#drawer-x').addEventListener('click', closeDrawer);
$('#drawer-more').addEventListener('click', () => { if (drawerC) { wallC = drawerC; renderTabs(); renderWall(); } });

/* ---------------- case wall ---------------- */
let wallC = 'all';
const track = $('#wall-track');
function renderTabs() {
  const box = $('#case-tabs'); box.innerHTML = '';
  ['all', ...ORDER].forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tab'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(wallC === c));
    b.innerHTML = `${c === 'all' ? t().all : cName(c)}<small>${byC(c).length}</small>`;
    b.addEventListener('click', () => { wallC = c; renderTabs(); renderWall(); track.scrollTo({ left: 0 }); });
    box.appendChild(b);
  });
}
function renderWall() {
  $$('video', track).forEach((v) => vio.unobserve(v));
  track.innerHTML = '';
  byC(wallC).forEach((cs) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'card';
    const m = mediaEl(cs);
    b.appendChild(m);
    b.insertAdjacentHTML('beforeend', `<span class="card__badge">${cs.type === 'v' ? t().video : t().photo}</span><span class="card__t"><span class="card__p">${cs.place[lang]}</span><span class="card__h">${cs.t[lang]}</span></span>`);
    b.setAttribute('aria-label', `${cs.place[lang]}: ${cs.t[lang]}`);
    b.addEventListener('click', () => openLb(cs, b));
    track.appendChild(b);
    if (cs.type === 'v') watchVideo(m);
  });
  tiltWall();
}
function tiltWall() {
  if (reduced) return;
  const r = track.getBoundingClientRect(), cx = r.left + r.width / 2;
  $$('.card', track).forEach((c) => {
    const b = c.getBoundingClientRect();
    const d = Math.max(-1.4, Math.min(1.4, (b.left + b.width / 2 - cx) / (r.width / 2)));
    c.style.transform = `rotateY(${(-d * 26).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 110).toFixed(1)}px)`;
  });
}
let wTick = false;
track.addEventListener('scroll', () => { if (wTick) return; wTick = true; requestAnimationFrame(() => { wTick = false; tiltWall(); }); }, { passive: true });
addEventListener('resize', tiltWall);
const cardStep = () => ($('.card', track)?.offsetWidth || 260) + 18;
$('#wall-prev').addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: reduced ? 'auto' : 'smooth' }));
$('#wall-next').addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: reduced ? 'auto' : 'smooth' }));

/* ---------------- lightbox ---------------- */
const lb = $('#lb');
let lbReturn = null;
function openLb(cs, from) {
  lbReturn = from;
  const box = $('#lb-media'); box.innerHTML = '';
  if (cs.type === 'v') {
    const v = document.createElement('video');
    v.src = cs.src; v.poster = cs.poster; v.controls = true; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', '');
    box.appendChild(v);
    if (!reduced) v.play().catch(() => {});
  } else {
    const im = document.createElement('img'); im.src = cs.poster; im.alt = cs.t[lang]; box.appendChild(im);
  }
  $('#lb-place').textContent = `${cName(cs.c)}${cs.place[lang] !== cName(cs.c) ? ' · ' + cs.place[lang] : ''}`;
  $('#lb-t').textContent = cs.t[lang];
  $('#lb-d').textContent = cs.d[lang];
  lb.hidden = false; document.body.style.overflow = 'hidden';
  $('#lb-x').focus();
}
function closeLb() { lb.hidden = true; $('#lb-media').innerHTML = ''; document.body.style.overflow = ''; lbReturn?.focus(); }
$('#lb-x').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lb.hidden) closeLb();
  if (e.key === 'Tab' && !lb.hidden) { e.preventDefault(); const f = $$('#lb button, #lb video'); const i = f.indexOf(document.activeElement); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
});

/* ---------------- checklist + ticket ---------------- */
const checked = new Set(['passport']);
function renderChecks() {
  const fs = $('#checks');
  $$('.ck', fs).forEach((x) => x.remove());
  t().chk.forEach(([id, title, sub]) => {
    const l = document.createElement('label'); l.className = 'ck';
    l.innerHTML = `<input type="checkbox" value="${id}" ${checked.has(id) ? 'checked' : ''}><span><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>`;
    l.querySelector('input').addEventListener('change', (e) => { e.target.checked ? checked.add(id) : checked.delete(id); updateTicket(); buildMsg(); });
    fs.appendChild(l);
  });
}
const shared = { country: 'uz', city: '' };
$$('[data-sync]').forEach((el) => {
  const ev = el.tagName === 'SELECT' ? 'change' : 'input';
  el.addEventListener(ev, () => {
    shared[el.dataset.sync] = el.value;
    $$(`[data-sync="${el.dataset.sync}"]`).forEach((o) => { if (o !== el) o.value = el.value; });
    updateTicket(); buildMsg();
  });
});
const fromText = () => [t().country[shared.country], shared.city.trim()].filter(Boolean).join(', ');
function updateTicket() {
  const all = t().chk, n = all.filter(([id]) => checked.has(id)).length;
  $('#ring-num').textContent = `${n}/${all.length}`;
  $('#ring-fg').style.strokeDashoffset = String(327 * (1 - n / all.length));
  $('#t-from').textContent = fromText() || '—';
  const ul = $('#t-list'); ul.innerHTML = '';
  all.forEach(([id, title]) => { const li = document.createElement('li'); li.textContent = title; if (!checked.has(id)) li.className = 'miss'; ul.appendChild(li); });
}
$('#to-book').addEventListener('click', () => toast(t().moved));

/* ---------------- composer ---------------- */
const val = (id) => $('#' + id).value.trim();
const radio = (n) => $(`input[name="${n}"]:checked`)?.value;
function buildMsg() {
  const m = t().m, all = t().chk;
  const have = all.filter(([id]) => checked.has(id)).map(([, x]) => x);
  const miss = all.filter(([id]) => !checked.has(id) && ['msct', 'audio', 'prev'].includes(id)).map(([, x]) => x);
  const lines = [m.hi, ''];
  if (val('b-name')) lines.push(`${m.name}: ${val('b-name')}`);
  if (val('b-phone')) lines.push(`${m.phone}: ${val('b-phone')}`);
  if (fromText()) lines.push(`${m.from}: ${fromText()}`);
  lines.push(`${m.area}: ${m[radio('area')]}`);
  if (val('b-desc')) lines.push(`${m.desc}: ${val('b-desc')}`);
  if (val('b-when')) lines.push(`${m.when}: ${val('b-when')}`);
  if (have.length) lines.push(`${m.have}: ${have.join('; ')}`);
  if (miss.length) lines.push(`${m.miss}: ${miss.join('; ')}`);
  lines.push(`${m.contact}: ${m[radio('contact')]}`);
  if (checked.has('msct') || checked.has('audio')) lines.push('', m.files);
  $('#msg').textContent = lines.join('\n');
}
$('#book-form').addEventListener('input', buildMsg);
$('#book-form').addEventListener('change', buildMsg);
async function copyMsg() {
  const txt = $('#msg').textContent;
  try { await navigator.clipboard.writeText(txt); return true; } catch (_) {
    const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
  }
}
$('#copy').addEventListener('click', async () => toast((await copyMsg()) ? t().copied : t().copyFail));
$('#ig').addEventListener('click', () => { copyMsg().then((ok) => ok && toast(t().igCopied)); });

/* ---------------- reviews ring ---------------- */
const ring = $('#ring'), stage = $('#ring-stage');
let rIdx = 0, rRot = 0, rBuilt = false, rRadius = 400;
const RN = REVIEWS.length, RA = 360 / RN;
function buildRing() {
  rBuilt = true;
  if (reduced) ring.classList.add('is-flat');
  REVIEWS.forEach((n) => {
    const d = document.createElement('figure'); d.className = 'rv'; d.style.margin = '0';
    d.innerHTML = `<img src="media/hl/reviews_${String(n).padStart(2, '0')}.jpg" alt="${t().review}" decoding="async" draggable="false">`;
    stage.appendChild(d);
  });
  layoutRing();
}
function relabelReviews() { $$('.rv img').forEach((i) => (i.alt = t().review)); }
function layoutRing() {
  if (reduced) return;
  const w = $('.rv', stage)?.offsetWidth || 230;
  rRadius = Math.round((w / 2) / Math.tan(Math.PI / RN) + 30);
  $$('.rv', stage).forEach((el, i) => (el.style.transform = `rotateY(${i * RA}deg) translateZ(${rRadius}px)`));
  setRing();
}
function setRing(anim = true) {
  stage.style.transition = anim && !reduced ? 'transform .7s cubic-bezier(.2,.7,.2,1)' : 'none';
  stage.style.transform = `translateZ(${-rRadius - 120}px) rotateY(${rRot}deg)`;
  rIdx = ((Math.round(-rRot / RA) % RN) + RN) % RN;
  $('#ring-count').textContent = `${rIdx + 1} / ${RN}`;
  $$('.rv', stage).forEach((el, i) => { el.style.opacity = i === rIdx ? 1 : 0.55; });
}
const ringGo = (dir) => {
  if (reduced) { stage.parentElement.scrollBy({ left: dir * 260 }); return; }
  rRot = Math.round(rRot / RA) * RA - dir * RA; setRing();
};
$('#ring-prev').addEventListener('click', () => ringGo(-1));
$('#ring-next').addEventListener('click', () => ringGo(1));
ring.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') ringGo(1); if (e.key === 'ArrowLeft') ringGo(-1); });
let rd = null;
ring.addEventListener('pointerdown', (e) => { if (reduced) return; rd = { x: e.clientX, r: rRot }; ring.setPointerCapture?.(e.pointerId); });
ring.addEventListener('pointermove', (e) => { if (!rd) return; rRot = rd.r + (e.clientX - rd.x) * 0.25; setRing(false); });
const rEnd = () => { if (!rd) return; rd = null; rRot = Math.round(rRot / RA) * RA; setRing(); };
ring.addEventListener('pointerup', rEnd); ring.addEventListener('pointercancel', rEnd);
addEventListener('resize', () => rBuilt && layoutRing());
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { buildRing(); o.disconnect(); } }, { rootMargin: '600px' }).observe(ring);

/* ---------------- tilt ---------------- */
if (!reduced && !mobile) {
  $$('[data-tilt], .ticket').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

/* ---------------- patient path ---------------- */
const pathSec = $('#path');
const steps = $$('.step');
function setStep(i) { steps.forEach((s, k) => s.classList.toggle('is-on', k === i)); }
function initPath() {
  const G = window.gsap, ST = window.ScrollTrigger;
  if (reduced || !G || !ST) { setStep(-1); return; }
  G.registerPlugin(ST);
  pathSec.classList.add('is-pinned');
  setStep(0);
  let api = null;
  const webgl = hasWebGL() && !lowPower;
  if (webgl) {
    pathSec.classList.add('is-3d');
    new IntersectionObserver(async (es, o) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      try { const { createPath } = await import('./path.js'); api = await createPath({ canvas: $('#path-canvas'), mobile }); api.setProgress(st.progress); }
      catch (e) { console.warn(e); pathSec.classList.remove('is-3d'); }
    }, { rootMargin: '400px' }).observe(pathSec);
  }
  const st = ST.create({
    trigger: pathSec, start: 'top top', end: () => '+=' + innerHeight * (mobile ? 3.2 : 4), pin: '.path__stage', scrub: true, anticipatePin: 1,
    onUpdate(self) {
      const p = self.progress;
      setStep(Math.min(5, Math.round(p * 5)));
      $('#path-progress').style.width = (p * 100).toFixed(1) + '%';
      api?.setProgress(p);
    },
  });
  steps.forEach((s, i) => s.addEventListener('click', () => scrollTo({ top: st.start + (st.end - st.start) * (i / 5) + 2, behavior: 'smooth' })));
  addEventListener('load', () => ST.refresh());
}

/* ---------------- boot ---------------- */
applyLang(lang, false);
initPath();
