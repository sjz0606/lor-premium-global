import { LAND } from './land.js';
import { TASHKENT, ORIGINS, TRAINING } from './data.js';

const CODE2C = { 1: 'uz', 2: 'kz', 3: 'kg', 4: 'tj', 5: 'ru' };
const D2R = Math.PI / 180;

function makeLabels(labelsEl, lang, onPick) {
  labelsEl.innerHTML = '';
  const mk = (node, cls, kind) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gl ' + cls;
    const txt = node[lang] || node.ru;
    b.innerHTML = '<span></span>'; b.firstChild.textContent = txt; b.title = txt; b.setAttribute('aria-label', txt);
    b.dataset.id = node.id;
    b.addEventListener('click', (e) => { e.stopPropagation(); onPick(kind === 'in' ? { type: 'country', c: node.c, id: node.id } : kind === 'out' ? { type: 'train', id: node.id } : { type: 'home' }); });
    labelsEl.appendChild(b);
    return { el: b, node, kind };
  };
  const list = [];
  const PRI = ['russia', 'aktau', 'dushanbe', 'kg', 'nukus', 'bukhara', 'taraz', 'khorezm', 'namangan'];
  list.push(mk({ id: 'tashkent', ru: 'Ташкент', uz: 'Toshkent', ...TASHKENT }, 'gl--home', 'home'));
  [...ORIGINS].sort((a, b) => PRI.indexOf(a.id) - PRI.indexOf(b.id)).forEach((o) => list.push(mk(o, 'gl--in', 'in')));
  TRAINING.forEach((o) => list.push(mk(o, 'gl--out', 'out')));
  list.forEach((l) => (l.w = l.el.offsetWidth || 80));
  return list;
}

// hide label text where it would overlap a higher-priority label (dot stays clickable)
function declutter(list) {
  const placed = [];
  list.forEach((l) => {
    if (!l.vis) return;
    const full = { x: l.x - 6, y: l.y - 11, w: l.w, h: 22 };
    const hit = (r) => placed.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
    const dot = !!hit(full) && l.kind !== 'home';
    l.el.classList.toggle('is-dot', dot);
    placed.push(dot ? { x: l.x - 6, y: l.y - 9, w: 18, h: 18 } : full);
  });
}

/* ---------- SVG fallback (no WebGL / low power) ---------- */
export function createFallbackMap({ el, labelsEl, lang, onPick }) {
  const L0 = 5, L1 = 95, B0 = 5, B1 = 64, W = 900, H = 900 * (B1 - B0) / (L1 - L0) * 1.25;
  const px = (lat, lon) => [((lon - L0) / (L1 - L0)) * W, ((B1 - lat) / (B1 - B0)) * H];
  let dots = '';
  for (let i = 0; i < LAND.length; i += 3) {
    const lat = LAND[i] / 10, lon = LAND[i + 1] / 10, c = LAND[i + 2];
    if (lon < L0 || lon > L1 || lat < B0 || lat > B1) continue;
    const [x, y] = px(lat, lon);
    const fill = c >= 1 && c <= 5 ? (c === 1 ? '#f3eee5' : '#3cf0d4') : c >= 6 ? '#ffb45e' : '#5b7392';
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${c ? 3.2 : 2.4}" fill="${fill}" opacity="${c ? 0.8 : 0.45}"/>`;
  }
  const [tx, ty] = px(TASHKENT.lat, TASHKENT.lon);
  const arc = (o, col, cls) => {
    const [x, y] = px(o.lat, o.lon);
    const mx = (x + tx) / 2, my = (y + ty) / 2 - Math.hypot(x - tx, y - ty) * 0.35;
    return `<path class="${cls}" d="M${x},${y} Q${mx},${my} ${tx},${ty}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`;
  };
  const arcsIn = ORIGINS.map((o) => arc(o, '#3cf0d4', 'a-in')).join('');
  const arcsOut = TRAINING.map((o) => arc(o, '#ffb45e', 'a-out')).join('');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${dots}<g id="fb-in">${arcsIn}</g><g id="fb-out" style="display:none">${arcsOut}</g><circle cx="${tx}" cy="${ty}" r="9" fill="none" stroke="#f3eee5" stroke-width="2"/></svg>`;
  el.hidden = false;
  let labels = makeLabels(labelsEl, lang, onPick);
  let mode = 'in';
  const place = () => {
    const svg = el.querySelector('svg');
    const r = svg.getBoundingClientRect(), host = el.getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H);
    const ox = (r.width - W * s) / 2 + (r.left - host.left), oy = (r.height - H * s) / 2 + (r.top - host.top);
    labels.forEach((l) => {
      const [x, y] = px(l.node.lat, l.node.lon);
      const show = l.kind === 'home' || l.kind === mode;
      l.el.classList.toggle('is-back', !show);
      l.vis = show; l.x = ox + x * s; l.y = oy + y * s;
      l.el.style.transform = `translate(${(l.x - 6).toFixed(1)}px, ${(l.y - 11).toFixed(1)}px)`;
    });
    declutter(labels);
  };
  place();
  addEventListener('resize', place);
  return {
    setMode(m) { mode = m; el.querySelector('#fb-in').style.display = m === 'in' ? '' : 'none'; el.querySelector('#fb-out').style.display = m === 'out' ? '' : 'none'; place(); },
    setLang(lg) { labels = makeLabels(labelsEl, lg, onPick); place(); },
    focus() {}, setScroll() {}, setShift() {},
  };
}

/* ---------- WebGL globe ---------- */
export async function createGlobe({ canvas, labelsEl, lang, onPick, reduced, mobile }) {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 3.1);

  const globe = new THREE.Group();
  scene.add(globe);

  const v3 = (lat, lon, r = 1) => {
    const phi = (90 - lat) * D2R, th = (lon + 180) * D2R;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };

  // occluder + atmosphere
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.993, 64, 48), new THREE.MeshBasicMaterial({ color: 0x071629 })));
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.14, 64, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 vN; void main(){ float i = pow(clamp(0.5 - dot(vN, vec3(0.,0.,1.)), 0., 1.), 3.0); gl_FragColor = vec4(0.18,0.85,0.8,1.) * i * 0.9; }',
  }));
  scene.add(atmo);

  // land dots
  const step = mobile ? 2 : 1;
  const pos = [], cc = [];
  for (let i = 0, k = 0; i < LAND.length; i += 3, k++) {
    if (k % step && !(LAND[i + 2] >= 1 && LAND[i + 2] <= 5)) continue;
    const p = v3(LAND[i] / 10, LAND[i + 1] / 10, 1.0);
    pos.push(p.x, p.y, p.z); cc.push(LAND[i + 2]);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  pg.setAttribute('cc', new THREE.Float32BufferAttribute(cc, 1));
  const uni = { uPx: { value: renderer.getPixelRatio() }, uMode: { value: 0 }, uFocus: { value: 0 }, uH: { value: 600 } };
  const pm = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute float cc; uniform float uPx, uMode, uFocus, uH; varying vec3 vCol; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.);
        vec3 n = normalize(normalMatrix * position);
        float facing = dot(n, normalize(-mv.xyz));
        vA = smoothstep(0.0, 0.45, facing);
        vec3 base = vec3(0.33,0.45,0.6);
        vec3 teal = vec3(0.24,0.94,0.83); vec3 amber = vec3(1.0,0.71,0.37); vec3 warm = vec3(0.95,0.93,0.9);
        bool home = cc > 0.5 && cc < 1.5;
        bool inC = cc > 1.5 && cc < 5.5;
        bool outC = cc > 4.5;
        vec3 cIn = home ? warm : (inC ? teal : base);
        vec3 cOut = home ? warm : (outC ? amber : base);
        vCol = mix(cIn, cOut, uMode);
        float hl = (home || (inC && uMode < .5) || (outC && uMode >= .5)) ? 1.0 : 0.0;
        float foc = (uFocus > 0.5 && abs(cc - uFocus) < 0.5) ? 1.0 : 0.0;
        vCol = mix(vCol, vec3(1.), foc*0.55);
        vA *= mix(0.5, 1.0, max(hl, foc));
        gl_PointSize = uPx * uH * 0.016 * (1.0 + hl*0.25 + foc*0.35) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if(d>.5) discard; float a = smoothstep(.5,.2,d); gl_FragColor = vec4(vCol, a*vA); }`,
  });
  globe.add(new THREE.Points(pg, pm));

  // arcs
  const tk = v3(TASHKENT.lat, TASHKENT.lon, 1.0);
  const arcMat = (col, off) => new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color(col) }, uO: { value: off }, uA: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying float vT; void main(){ vT = uv.x; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float uT, uO, uA; uniform vec3 uC; varying float vT;
      void main(){ float p = fract(uT*0.32 + uO); float g = smoothstep(0.16, 0.0, abs(vT - p)) ; float a = (0.32 + g*1.4) * uA * smoothstep(0.,0.04,vT) ; gl_FragColor = vec4(uC*(1.+g), a); }`,
  });
  const arcs = { in: [], out: [] };
  const buildArc = (o, kind, i) => {
    const a = v3(o.lat, o.lon, 1.0), b = tk.clone();
    const [from, to] = kind === 'in' ? [a, b] : [b, a];
    const dist = a.distanceTo(b);
    const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1 + 0.08 + dist * 0.42);
    const c1 = from.clone().lerp(mid, 0.66), c2 = to.clone().lerp(mid, 0.66);
    const curve = new THREE.CubicBezierCurve3(from, c1, c2, to);
    const m = arcMat(kind === 'in' ? 0x3cf0d4 : 0xffb45e, i * 0.137);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, mobile ? 0.0048 : 0.0036, 6, false), m);
    globe.add(mesh);
    arcs[kind].push(mesh);
  };
  ORIGINS.forEach((o, i) => buildArc(o, 'in', i));
  TRAINING.forEach((o, i) => buildArc(o, 'out', i));

  // Tashkent pulse ring
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.024, 48), new THREE.MeshBasicMaterial({ color: 0xf3eee5, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.position.copy(v3(TASHKENT.lat, TASHKENT.lon, 1.003));
  ring.lookAt(v3(TASHKENT.lat, TASHKENT.lon, 2));
  globe.add(ring);
  const core = ring.clone(); core.geometry = new THREE.CircleGeometry(0.011, 24); core.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  globe.add(core);

  // view targets
  const VIEW = { in: { lat: 42, lon: 62, z: 3.75 }, out: { lat: 38, lon: 44, z: 4.25 } };
  let mode = 'in', modeT = 0;
  const rot = { x: VIEW.in.lat * D2R, y: -(90 + VIEW.in.lon) * D2R };
  const tgt = { ...rot, z: VIEW.in.z };
  let camZ = tgt.z, scrollP = 0, shift = 0, shiftT = 0;
  globe.rotation.order = 'XYZ';

  // labels
  let labels = makeLabels(labelsEl, lang, onPick);
  const tmp = new THREE.Vector3(), nrm = new THREE.Vector3();
  let W = 1, H = 1;
  const placeLabels = () => {
    labels.forEach((l) => {
      const show = l.kind === 'home' || l.kind === mode;
      tmp.copy(v3(l.node.lat, l.node.lon, 1.0)).applyMatrix4(globe.matrixWorld);
      nrm.copy(tmp).normalize();
      const facing = nrm.dot(tmp.clone().sub(camera.position).normalize().negate());
      const vis = show && facing > 0.25;
      l.vis = vis;
      l.el.classList.toggle('is-back', !vis);
      if (!vis) return;
      tmp.project(camera);
      l.x = (tmp.x * 0.5 + 0.5) * W; l.y = (-tmp.y * 0.5 + 0.5) * H;
      l.el.style.transform = `translate(${(l.x - 6).toFixed(1)}px, ${(l.y - 11).toFixed(1)}px)`;
    });
    declutter(labels);
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    uni.uH.value = H;
    dirty = true;
  };
  let dirty = true;
  new ResizeObserver(resize).observe(canvas);

  // pointer drag + click pick
  let drag = null, vel = { x: 0, y: 0 }, lastInteract = 0;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, id: e.pointerId, moved: false };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 6) drag.moved = true;
    const k = (e.pointerType === 'mouse' ? 2.4 : 1.6) / H;
    tgt.y += dx * k; if (e.pointerType === 'mouse') tgt.x += dy * k;
    tgt.x = Math.max(-0.2, Math.min(1.25, tgt.x));
    vel.x = dx * k * 0.5; lastInteract = performance.now(); dirty = true; wake();
  });
  const end = (e) => {
    if (drag && !drag.moved && e.type === 'pointerup') pick(e);
    drag = null;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), sph = new THREE.Sphere(new THREE.Vector3(), 1), hit = new THREE.Vector3();
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectSphere(sph, hit)) return;
    const local = globe.worldToLocal(hit.clone()).normalize();
    const lat = 90 - Math.acos(local.y) / D2R;
    let lon = Math.atan2(local.z, -local.x) / D2R - 180; if (lon < -180) lon += 360;
    let best = -1, bd = 9;
    for (let i = 0; i < LAND.length; i += 3) {
      const dl = LAND[i] / 10 - lat, dn = (LAND[i + 1] / 10 - lon) * Math.cos(lat * D2R);
      const d = dl * dl + dn * dn; if (d < bd) { bd = d; best = LAND[i + 2]; }
    }
    if (CODE2C[best]) onPick({ type: 'country', c: CODE2C[best] });
  }

  // loop
  let running = false, raf = 0, t0 = performance.now();
  const clock = { t: 0 };
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    if (!reduced) clock.t += dt;
    const idle = now - lastInteract > 2500;
    if (!drag) {
      tgt.y += vel.x; vel.x *= 0.86;
      if (idle && !reduced) {
        // gentle sway around the current view
        const V = VIEW[mode];
        tgt.y += ((-(90 + V.lon) * D2R + Math.sin(clock.t * 0.18) * 0.22) - tgt.y) * 0.004;
        tgt.x += (V.lat * D2R - tgt.x) * 0.01;
      }
    }
    const ease = reduced ? 1 : 0.08;
    rot.x += (tgt.x - rot.x) * ease; rot.y += (tgt.y - rot.y) * ease;
    globe.rotation.x = rot.x + scrollP * 0.25; globe.rotation.y = rot.y;
    camZ += (tgt.z + scrollP * 1.1 - camZ) * (reduced ? 1 : 0.06);
    camera.position.set(0, -scrollP * 0.25, camZ); camera.lookAt(0, 0, 0);
    shift += (shiftT * W - shift) * (reduced ? 1 : 0.08);
    if (Math.abs(shift) > 0.5) camera.setViewOffset(W, H, shift, 0, W, H); else camera.clearViewOffset();
    modeT += ((mode === 'out' ? 1 : 0) - modeT) * (reduced ? 1 : 0.08);
    uni.uMode.value = modeT;
    const tt = reduced ? 0.15 : clock.t;
    arcs.in.forEach((m) => { m.material.uniforms.uT.value = tt; m.material.uniforms.uA.value = 1 - modeT; m.visible = modeT < 0.99; });
    arcs.out.forEach((m) => { m.material.uniforms.uT.value = tt; m.material.uniforms.uA.value = modeT; m.visible = modeT > 0.01; });
    const s = 1 + ((clock.t * 0.8) % 1) * 2.2;
    ring.scale.setScalar(reduced ? 1.6 : s); ring.material.opacity = reduced ? 0.8 : 1 - ((clock.t * 0.8) % 1);
    scene.updateMatrixWorld();
    renderer.render(scene, camera);
    placeLabels();
    dirty = false;
    const settling = Math.abs(tgt.x - rot.x) + Math.abs(tgt.y - rot.y) + Math.abs(vel.x) + Math.abs(shiftT * W - shift) / 100 > 1e-4;
    if (running && (!reduced || settling || drag)) raf = requestAnimationFrame(frame);
  }
  function wake() { if (running && !raf) { t0 = performance.now(); raf = requestAnimationFrame(frame); } }

  new IntersectionObserver(([en]) => { running = en.isIntersecting && !document.hidden; if (running) wake(); }, { threshold: 0.01 }).observe(canvas);
  document.addEventListener('visibilitychange', () => { running = !document.hidden && canvas.getBoundingClientRect().bottom > 0; wake(); });
  resize();

  return {
    setMode(m) { mode = m; tgt.z = VIEW[m].z; tgt.x = VIEW[m].lat * D2R; tgt.y = -(90 + VIEW[m].lon) * D2R; lastInteract = 0; wake(); },
    setLang(lg) { labels = makeLabels(labelsEl, lg, onPick); wake(); },
    focus(c) {
      const code = { uz: 1, kz: 2, kg: 3, tj: 4, ru: 5 }[c] || 0;
      uni.uFocus.value = code;
      labels.forEach((l) => l.el.classList.toggle('is-on', !!c && l.node.c === c));
      wake();
    },
    setScroll(p) { scrollP = p; wake(); },
    setShift(f) { shiftT = f; wake(); },
  };
}
