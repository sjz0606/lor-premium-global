// Scroll-driven 3D patient path: dotted curve in depth, real video frames as planes at each step.
const FRAMES = [
  'media/vp/DWjPFxPqgjx_9.jpg',
  'media/vp/DavUnblxwmg_5.jpg',
  'media/vp/DbHz5I2qUPk_1.jpg',
  'media/vp/DdSzbErx9dk_1.jpg',
  'media/hl/kz_02.jpg',
  'media/vp/DUAGpVgAiW4_1.jpg',
];

export async function createPath({ canvas, mobile }) {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x06101d, 4, 16);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);

  const N = 6, GAP = 4.2;
  const way = [];
  for (let i = -1; i <= N; i++) way.push(new THREE.Vector3(Math.sin(i * 1.7) * 1.4, Math.cos(i * 1.2) * 0.55, -i * GAP));
  const curve = new THREE.CatmullRomCurve3(way, false, 'centripetal');
  const nodeU = [];
  for (let i = 0; i < N; i++) nodeU.push((i + 1) / (way.length - 1));

  // dotted path
  const M = mobile ? 500 : 900;
  const pts = curve.getSpacedPoints(M);
  const pos = new Float32Array(pts.length * 3), tt = new Float32Array(pts.length);
  pts.forEach((p, i) => { pos.set([p.x, p.y, p.z], i * 3); tt[i] = i / M; });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('t', new THREE.BufferAttribute(tt, 1));
  const uni = { uP: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uH: { value: 800 } };
  const dotMat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float t; uniform float uP, uPx, uH; varying float vOn; varying float vF;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vOn = step(t, uP); float head = smoothstep(0.03,0.,abs(t-uP));
        vF = head; gl_PointSize = uPx * uH * (0.006 + head*0.012) / -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying float vOn; varying float vF; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard;
        vec3 c = mix(vec3(0.35,0.5,0.66), vec3(0.24,0.94,0.83), max(vOn, vF)); float a = smoothstep(.5,.1,d) * mix(0.45, 1.0, max(vOn,vF));
        gl_FragColor = vec4(c*(1.+vF), a); }`,
  });
  scene.add(new THREE.Points(g, dotMat));

  // star dust for depth
  const S = mobile ? 500 : 1200, sp = new Float32Array(S * 3);
  for (let i = 0; i < S; i++) { sp[i * 3] = (Math.random() - 0.5) * 16; sp[i * 3 + 1] = (Math.random() - 0.5) * 9; sp[i * 3 + 2] = 4 - Math.random() * (N + 3) * GAP; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x6f8fb3, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false })));

  // nodes + frame planes
  const loader = new THREE.TextureLoader();
  const planes = [], rings = [];
  for (let i = 0; i < N; i++) {
    const p = curve.getPointAt(nodeU[i]);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 48), new THREE.MeshBasicMaterial({ color: 0x3cf0d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.copy(p); scene.add(ring); rings.push(ring);
    const tex = loader.load(FRAMES[i]); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.78), mat);
    plane.userData.bx = p.x + (i % 2) * 0.25;
    plane.position.set(p.x + 0.95 + (i % 2) * 0.25, p.y + 0.35, p.z - 0.6);
    plane.rotation.y = -0.3 + (i % 2) * 0.12;
    // thin teal frame
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.0, 1.78)), new THREE.LineBasicMaterial({ color: 0x3cf0d4, transparent: true, opacity: 0 }));
    plane.add(edge);
    scene.add(plane); planes.push({ plane, edge });
  }

  let W = 1, H = 1, dirty = true;
  const resize = () => {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); uni.uH.value = H; dirty = true; wake();
  };
  new ResizeObserver(resize).observe(canvas);

  let prog = 0, shown = 0, running = false, raf = 0;
  const look = new THREE.Vector3(), cam = new THREE.Vector3();
  const wide = () => W > 860;
  function frame(now) {
    raf = 0;
    shown += (prog - shown) * 0.09;
    const u = nodeU[0] + (nodeU[N - 1] - nodeU[0]) * shown;
    uni.uP.value = u;
    const back = Math.max(0, u - 0.085);
    cam.copy(curve.getPointAt(back)).add(new THREE.Vector3(0, 0.55, 0.6));
    look.copy(curve.getPointAt(Math.min(1, u + 0.03)));
    camera.position.copy(cam);
    camera.lookAt(look);
    if (wide()) { camera.setViewOffset(W, H, -W * 0.18, 0, W, H); } else { camera.setViewOffset(W, H, 0, H * 0.16, W, H); }
    const active = Math.round(shown * (N - 1));
    planes.forEach((o, i) => {
      const d = Math.abs(i - shown * (N - 1));
      const a = Math.max(0, 1 - d * 0.9);
      const ahead = camera.position.z - o.plane.position.z; // >0 = in front of camera
      const near = Math.min(1, Math.max(0, (ahead - 1.4) / 1.4));
      o.plane.material.opacity = (0.12 + a * 0.88) * near; o.edge.material.opacity = a * 0.8 * near;
      o.plane.visible = near > 0.01;
      o.plane.position.x = o.plane.userData.bx + (wide() ? 0.95 : -0.15);
      o.plane.position.y += ((curve.getPointAt(nodeU[i]).y + 0.35 + Math.sin(now / 1400 + i) * 0.04) - o.plane.position.y) * 0.1;
    });
    rings.forEach((r, i) => { const on = i === active; r.material.opacity = on ? 0.95 : i < active ? 0.6 : 0.25; r.scale.setScalar(on ? 1 + Math.sin(now / 300) * 0.12 : 1); r.lookAt(camera.position); });
    renderer.render(scene, camera);
    dirty = false;
    if (running && (Math.abs(prog - shown) > 0.0005 || true)) raf = requestAnimationFrame(frame);
  }
  function wake() { if (running && !raf) raf = requestAnimationFrame(frame); }
  new IntersectionObserver(([e]) => { running = e.isIntersecting && !document.hidden; if (running) wake(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } }).observe(canvas);
  resize();
  return { setProgress(p) { prog = p; wake(); } };
}
