import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { MissionState, PlayerAction, LandingSiteId } from '../types/game';
import './StartMenuView.css';

interface StartMenuViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
  onEnterGame?: () => void;
}

interface SiteItem {
  name: string;
  siteId: LandingSiteId;
  u: number;
  v: number;
  box: [number, number, number, number];
  budgetMUSD: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
}

const SITES: SiteItem[] = [
  {
    name: 'Jezero Crater',
    siteId: 'jezero_crater',
    u: 0.61,
    v: 0.35,
    box: [1186, 900, 1150, 810],
    budgetMUSD: 200,
    difficulty: 'Intermediate',
    description: 'Ancient river delta lakebed rich in clay minerals and astrobiological biosignatures.',
  },
  {
    name: 'Utopia Planitia',
    siteId: 'utopia_planitia',
    u: 0.72,
    v: 0.28,
    box: [0, 900, 1150, 810],
    budgetMUSD: 180,
    difficulty: 'Beginner',
    description: 'Smooth northern basalt lowlands with high sunlight and optimal mobility.',
  },
  {
    name: 'Valles Marineris',
    siteId: 'valles_marineris',
    u: 0.45,
    v: 0.56,
    box: [1186, 0, 1150, 810],
    budgetMUSD: 220,
    difficulty: 'Advanced',
    description: 'Deep canyon rift with steep shadows and treacherous sand drifts.',
  },
  {
    name: 'Olympus Mons',
    siteId: 'jezero_crater',
    u: 0.121,
    v: 0.31,
    box: [0, 0, 1150, 810],
    budgetMUSD: 200,
    difficulty: 'Intermediate',
    description: 'The tallest planetary volcanic shield peak in the Solar System.',
  },
];

const THARSIS = { u: 0.15, v: 0.41 };
const SHEET = { w: 2336, h: 1744 };

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const io = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out = (k: number) => 1 - Math.pow(1 - k, 3);
const wrapAngle = (a: number) => (((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

function dir(u: number, v: number): THREE.Vector3 {
  const ph = 2 * Math.PI * u;
  const th = Math.PI * v;
  return new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
}

const faceYaw = (d: THREE.Vector3) => Math.atan2(-d.x, d.z);
const faceLat = (d: THREE.Vector3) => Math.asin(d.y);

const P = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_';
const MAP = P + '20261031_030432_a1948696-c1d5-4468-845e-7d1291f80943.png&w=2688&q=92';
const LAND = P + '20261031_030420_da39d0cf-af67-4e33-a487-6469549cfbff.png&w=2400&q=88';
const FORE = P + '20261031_030420_fe406b69-3e6f-4b7c-a17e-ef09db0d270b.png&w=2400&q=88';
const CARDS = P + '20261031_030420_e222aa05-c121-4f31-a466-0321badc0e28.png&w=1400&q=85';

export function StartMenuView({ state, send, onEnterGame }: StartMenuViewProps) {
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);

  const word0Ref = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const word1Ref = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLUListElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const landRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const destNameRef = useRef<HTMLElement>(null);
  const foreRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const curSite = SITES[selectedSiteIndex] ?? SITES[0];

  const handleLaunch = (siteIndex?: number) => {
    const idx = siteIndex !== undefined ? siteIndex : selectedSiteIndex;
    const targetSite = SITES[idx] ?? SITES[0];
    send({ type: 'SELECT_LANDING_SITE', siteId: targetSite.siteId });
    send({ type: 'SET_PHASE', phase: 'briefing' });
    if (onEnterGame) onEnterGame();
  };

  useEffect(() => {
    const gl = glRef.current;
    const dust = dustRef.current;
    if (!gl || !dust) return;

    const tharsisDir = dir(THARSIS.u, THARSIS.v);
    const siteDirs = SITES.map(s => dir(s.u, s.v));

    // Three.js Scene Setup
    const renderer = new THREE.WebGLRenderer({ canvas: gl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2e5, 2e5);

    const planet = new THREE.Group();
    const tilt = new THREE.Group();
    const spin = new THREE.Group();
    planet.add(tilt);
    tilt.add(spin);
    scene.add(planet);

    const sun = new THREE.Vector3(0.62, 0.5, 0.6).normalize();

    const planetMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null },
        ready: { value: 0 },
        texel: { value: new THREE.Vector2(1 / 2688, 1 / 1344) },
        sun: { value: sun },
        hiDir: { value: tharsisDir.clone() },
        hi: { value: 0 },
        hiR: { value: 0.62 },
      },
      vertexShader: `
        varying vec2 vUv; varying vec3 vObj; varying vec3 vN;
        void main(){ vUv = uv; vObj = normalize(position); vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
      `,
      fragmentShader: `
        uniform sampler2D map; uniform vec2 texel; uniform vec3 sun, hiDir; uniform float hi, hiR, ready;
        varying vec2 vUv; varying vec3 vObj; varying vec3 vN;
        float luma(vec2 u){ return dot(texture2D(map, u).rgb, vec3(.3,.6,.1)); }
        void main(){
          vec3 col = max(texture2D(map, vUv).rgb, vec3(1e-4)); col = pow(col, vec3(2.6)) * vec3(1.18,.74,.56);
          vec3 n = normalize(vN);
          vec3 up = abs(n.y) > .999 ? vec3(0.,0.,1.) : vec3(0.,1.,0.);
          vec3 t = normalize(cross(up, n)), b = cross(n, t);
          float dx = luma(vUv + vec2(texel.x*2.,0.)) - luma(vUv - vec2(texel.x*2.,0.));
          float dy = luma(vUv + vec2(0.,texel.y*2.)) - luma(vUv - vec2(0.,texel.y*2.));
          n = normalize(n - (t*dx + b*dy) * 1.9);
          float diff = max(dot(n, sun), 0.);
          vec3 lit = col * (vec3(1.5,1.32,1.18) * pow(max(diff, 1e-4), .85) + vec3(.2,.09,.06));
          float d = acos(clamp(dot(normalize(vObj), hiDir), -1., 1.)) + (luma(vUv) - .45) * .22;
          float m = 1. - smoothstep(hiR - .03, hiR, d), edge = 1. - smoothstep(.0, .03, abs(d - hiR + .01));
          lit = mix(lit, mix(lit, vec3(.62,.012,.07) * (.25 + diff * 1.05) * (.5 + luma(vUv) * 1.1), .9), m * hi) + vec3(1.,.42,.4) * edge * hi * .22;
          float fres = pow(max(1. - max(vN.z, 0.), 1e-4), 3.2);
          lit += vec3(1.,.5,.26) * fres * (.05 + diff * .5);
          lit = max(lit / (lit * .3 + 1.) * 1.3, vec3(1e-4));
          gl_FragColor = vec4(pow(lit, vec3(1./2.2)), 1.) * ready;
        }
      `,
    });
    spin.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), planetMat));

    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        sun: { value: sun },
        ready: { value: 0 },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec3 vN;
        void main(){ vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }
      `,
      fragmentShader: `
        uniform vec3 sun; uniform float ready; varying vec3 vN;
        void main(){ float z = clamp(-vN.z, 0., 1.), a = smoothstep(.0, .55, z);
          float s = .55 + .6 * max(dot(-vN * vec3(1.,1.,0.), normalize(sun * vec3(1.,1.,0.))), 0.);
          a = pow(max(a, 1e-4), 2.6) * s * .7; gl_FragColor = vec4(vec3(1.,.64,.36), a * ready); }
      `,
    });
    planet.add(new THREE.Mesh(new THREE.SphereGeometry(1.14, 64, 48), atmoMat));

    let loadTime = 0;
    let hasRealMap = false;

    function applyCanvasTexture(canvas: HTMLCanvasElement) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.NoColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
      const old = planetMat.uniforms.map.value;
      planetMat.uniforms.map.value = tex;
      if (old) old.dispose();
      planetMat.uniforms.ready.value = 1;
      atmoMat.uniforms.ready.value = 1;
      if (!loadTime) loadTime = performance.now();
    }

    // Procedural Fallback if texture loading is slow or offline
    function buildFallbackMap() {
      if (hasRealMap || loadTime) return;
      const mw = 1024,
        mh = 512;
      const mc = document.createElement('canvas');
      mc.width = mw;
      mc.height = mh;
      const mx = mc.getContext('2d');
      if (!mx) return;
      const bg = mx.createLinearGradient(0, 0, 0, mh);
      bg.addColorStop(0, '#e9dfd2');
      bg.addColorStop(0.06, '#c77a52');
      bg.addColorStop(0.5, '#b65b33');
      bg.addColorStop(0.94, '#b86a44');
      bg.addColorStop(1, '#e9dfd2');
      mx.fillStyle = bg;
      mx.fillRect(0, 0, mw, mh);
      let s = 9187;
      const nr = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 420; i++) {
        const x = nr() * mw,
          y = (0.08 + nr() * 0.84) * mh,
          rx = 18 + nr() * 110,
          ry = 8 + nr() * 44;
        const dark = nr() > 0.45;
        mx.fillStyle = dark
          ? `rgba(74, 28, 14, ${0.06 + nr() * 0.14})`
          : `rgba(222, 134, 88, ${0.06 + nr() * 0.12})`;
        for (const ox of [-mw, 0, mw]) {
          mx.beginPath();
          mx.ellipse(x + ox, y, rx, ry, nr() * Math.PI, 0, Math.PI * 2);
          mx.fill();
        }
      }
      applyCanvasTexture(mc);
    }

    const fallbackTimer = setTimeout(buildFallbackMap, 1000);
    const mapImg = new Image();
    mapImg.crossOrigin = 'anonymous';
    mapImg.onload = () => {
      clearTimeout(fallbackTimer);
      hasRealMap = true;
      const mw = 2688,
        mh = 1344,
        fw = Math.round(mw * 0.07),
        ph = Math.round(mh * 0.035);
      const mc = document.createElement('canvas');
      mc.width = mw;
      mc.height = mh;
      const mx = mc.getContext('2d');
      if (!mx) return;
      mx.drawImage(mapImg, 0, 0, mw, mh);

      const tc = document.createElement('canvas');
      tc.width = fw;
      tc.height = mh;
      const tx = tc.getContext('2d');
      if (tx) {
        tx.drawImage(mc, 0, 0, fw, mh, 0, 0, fw, mh);
        tx.globalCompositeOperation = 'destination-in';
        const fg = tx.createLinearGradient(0, 0, fw, 0);
        fg.addColorStop(0, 'rgba(0,0,0,0)');
        fg.addColorStop(1, 'rgba(0,0,0,1)');
        tx.fillStyle = fg;
        tx.fillRect(0, 0, fw, mh);
        mx.drawImage(tc, mw - fw, 0);
      }

      const gt = mx.createLinearGradient(0, 0, 0, ph);
      gt.addColorStop(0, '#e9dfd2');
      gt.addColorStop(1, 'rgba(233,223,210,0)');
      mx.fillStyle = gt;
      mx.fillRect(0, 0, mw, ph);

      const gb = mx.createLinearGradient(0, mh, 0, mh - ph);
      gb.addColorStop(0, '#e9dfd2');
      gb.addColorStop(1, 'rgba(233,223,210,0)');
      mx.fillStyle = gb;
      mx.fillRect(0, mh - ph, mw, ph);

      applyCanvasTexture(mc);
    };
    mapImg.onerror = () => {
      clearTimeout(fallbackTimer);
      buildFallbackMap();
    };
    mapImg.src = MAP;

    // Dust particles setup
    const dctx = dust.getContext('2d');
    const sp = document.createElement('canvas');
    sp.width = sp.height = 64;
    const sc = sp.getContext('2d');
    if (sc) {
      const sg = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
      sg.addColorStop(0, 'rgba(255,214,170,.95)');
      sg.addColorStop(0.4, 'rgba(255,180,120,.42)');
      sg.addColorStop(1, 'rgba(255,180,120,0)');
      sc.fillStyle = sg;
      sc.fillRect(0, 0, 64, 64);
    }

    let seed = 1337;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes = Array.from({ length: 34 }, () => {
      const r0 = rnd();
      return {
        x: rnd(),
        y: rnd(),
        r: 3 + r0 * r0 * 34,
        s: 0.004 + rnd() * 0.012,
        p: rnd() * 6.28,
      };
    });

    // Layout
    let W = window.innerWidth;
    let H = window.innerHeight;
    let portrait = H > W * 1.05;
    let R0 = portrait ? W * 0.36 : Math.min(H * 0.3, W * 0.19);
    let wordW = 0,
      wordH = 0;

    function measureWord() {
      if (word0Ref.current) {
        wordW = word0Ref.current.offsetWidth;
        wordH = word0Ref.current.offsetHeight;
      }
    }

    function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      portrait = H > W * 1.05;
      R0 = portrait ? W * 0.36 : Math.min(H * 0.3, W * 0.19);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();

      const ddpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (dust) {
        dust.width = Math.round(W * ddpr);
        dust.height = Math.round(H * ddpr);
      }
      if (dctx) dctx.setTransform(ddpr, 0, 0, ddpr, 0, 0);

      measureWord();
      updateSiteCard(curIndex);
    }

    let curIndex = selectedSiteIndex;
    function updateSiteCard(i: number) {
      curIndex = i;
      setSelectedSiteIndex(i);
      const cardEl = cardRef.current;
      const sitesEl = sitesRef.current;
      if (!cardEl || !sitesEl) return;

      const [x, y, w, h] = SITES[i].box;
      cardEl.style.backgroundSize = `${(SHEET.w / w) * 100}% ${(SHEET.h / h) * 100}%`;
      cardEl.style.backgroundPosition = `${(x / (SHEET.w - w)) * 100}% ${(y / (SHEET.h - h)) * 100}%`;

      const li = sitesEl.children[i] as HTMLElement | undefined;
      if (li) {
        const rect = li.getBoundingClientRect();
        cardEl.style.top = `${rect.top + rect.height / 2 - cardEl.offsetHeight / 2}px`;
      }
      if (destNameRef.current) {
        destNameRef.current.textContent = SITES[i].name;
      }
      if (regionRef.current) {
        regionRef.current.textContent = SITES[i].name.toUpperCase();
      }
    }

    let st = 0,
      from = 0,
      to = 0,
      t0 = 0,
      dur = 1;

    function go(n: number) {
      n = clamp(Math.round(n), 0, 2);
      if (n === to) return;
      from = st;
      to = n;
      t0 = performance.now();
      const lo = Math.min(from, to),
        hi = Math.max(from, to);
      const span0 = Math.max(0, Math.min(hi, 1) - Math.max(lo, 0));
      const span1 = Math.max(0, Math.min(hi, 2) - Math.max(lo, 1));
      dur = span0 * 1300 + span1 * 2500 || 1;
    }

    // Interaction state
    let yaw = faceYaw(dir(0.4, 0.5));
    let pitch = 0.16;
    let vy = 0;
    let dragging = false,
      downX = 0,
      downY = 0,
      lastX = 0,
      lastY = 0,
      moved = 0,
      lastDrag = -1e9,
      lastMove = 0;
    let mouseX = 0,
      mouseY = 0;
    let curCx = W * 0.5,
      curCy = H * 0.5,
      curR = 10;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX / W - 0.5;
      mouseY = e.clientY / H - 0.5;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      const k = 1.1 / R0;
      yaw += dx * k;
      pitch = clamp(pitch + dy * k, -1, 1);
      vy = dx * k;
      lastDrag = lastMove = performance.now();
    };

    const handlePointerDown = (e: PointerEvent) => {
      dragging = true;
      downX = lastX = e.clientX;
      downY = lastY = e.clientY;
      moved = 0;
      vy = 0;
      gl.classList.add('drag');
      gl.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      gl.classList.remove('drag');
      lastDrag = performance.now();
      if (lastDrag - lastMove > 50) vy = 0;
      if (moved < 6 && to < 2) {
        if (Math.hypot(e.clientX - curCx, e.clientY - curCy) <= curR) {
          go(to + 1);
        }
      }
    };

    let lockUntil = 0;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= 8) return;
      const now = performance.now();
      if (now < lockUntil) return;
      const next = clamp(to + (e.deltaY > 0 ? 1 : -1), 0, 2);
      if (next !== to) {
        lockUntil = now + 1400;
        go(next);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && to > 0) go(to - 1);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', handlePointerMove);
    gl.addEventListener('pointerdown', handlePointerDown);
    gl.addEventListener('pointerup', handlePointerUp);
    gl.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    const Y_AXIS = new THREE.Vector3(0, 1, 0);
    const X_AXIS = new THREE.Vector3(1, 0, 0);
    const pVec = new THREE.Vector3();

    let prevNow = performance.now();
    let animId = 0;

    function render(now: number) {
      const dt = Math.min((now - prevNow) / 1000, 0.05);
      prevNow = now;
      const t = now / 1000;
      const f = (r: number) => 1 - Math.exp(-dt * r);

      // State interpolation
      st = dur <= 1 ? to : mix(from, to, io(seg(now, t0, t0 + dur)));
      const a = clamp(st);
      const b = clamp(st - 1);

      const age = loadTime ? (now - loadTime) / 1000 : 0;
      const grow = out(seg(age, 0, 1.5));
      const iw = out(seg(age, 0.75, 1.7));

      // Planet projection
      const bz = io(seg(b, 0, 0.62));
      const px = portrait ? 0.5 * W : mix(0.5 * W, 0.36 * W, a);
      const py = portrait ? mix(0.4 * H, 0.33 * H, a) : 0.5 * H;
      const R = R0 * mix(0.03, 1, grow) * (1 + a * 0.04) * Math.exp(bz * 2.5);
      const cx = mix(px, 0.5 * W, bz);
      const cy = mix(py, 0.5 * H, bz);
      curCx = cx;
      curCy = cy;
      curR = R;

      planet.position.set(cx - W * 0.5, H * 0.5 - cy, 0);
      planet.scale.setScalar(R);

      // Rotation
      if (st > 0.02) {
        const tDir = b > 0 ? siteDirs[curIndex] : tharsisDir;
        const tYaw = faceYaw(tDir);
        const tPitch = faceLat(tDir);
        yaw += wrapAngle(tYaw - yaw) * f(3.6);
        pitch += (tPitch - pitch) * f(3.6);
        vy = 0;
      } else if (!dragging) {
        yaw += vy;
        vy *= Math.exp(-dt * 4);
        if (now - lastDrag > 1500) {
          yaw += dt * (0.08 + (1 - grow) * 2.4);
        }
        pitch += (0.16 - pitch) * f(1.2);
      }
      spin.rotation.y = yaw;
      tilt.rotation.x = pitch;

      // Shaders highlight
      planetMat.uniforms.hiDir.value.copy(b > 0.02 ? siteDirs[curIndex] : tharsisDir);
      planetMat.uniforms.hiR.value = b > 0.02 ? mix(0.62, 0.3, seg(b, 0, 0.1)) : 0.62;
      planetMat.uniforms.hi.value = clamp(seg(a, 0.15, 0.6) + (b > 0 ? 1 : 0));

      renderer.render(scene, camera);

      // DOM Animation sync
      if (word0Ref.current) {
        const wxOff = portrait ? 0 : -a * 0.08 * W;
        const wyOff = portrait ? H * -0.1 + R * 1.08 + wordH * 0.5 : mouseY * -6;
        const I = (1 - iw) * 50;
        word0Ref.current.style.transform = `translate(calc(-50% + ${wxOff}px), calc(-50% + ${wyOff}px))`;
        word0Ref.current.style.clipPath = `inset(-10% ${I}% -10% ${I}%)`;
        word0Ref.current.style.opacity = `${1 - seg(a, 0.1, 0.5)}`;
      }

      if (eyebrowRef.current) {
        const wxOff = portrait ? 0 : -a * 0.08 * W;
        const wyOff = portrait ? H * -0.1 + R * 1.08 + wordH * 0.5 : mouseY * -6;
        if (portrait) {
          eyebrowRef.current.style.transform = `translate(calc(-50% + ${wxOff}px), calc(-50% + ${wyOff + wordH * 0.5 + 28}px))`;
        } else {
          const ex = wxOff - wordW * 0.5 + wordW * 0.02;
          const ey = wyOff - wordH * 0.5 - 34;
          eyebrowRef.current.style.transform = `translate(${ex}px, calc(-50% + ${ey}px))`;
        }
        eyebrowRef.current.style.opacity = `${iw * (1 - seg(a, 0.05, 0.35))}`;
      }

      if (flareRef.current) {
        flareRef.current.style.transform = `translate(${cx + R * 0.74}px, ${cy - R * 0.62}px)`;
        flareRef.current.style.opacity = `${grow * (0.88 + 0.12 * Math.sin(t * 1.3)) * (1 - seg(bz, 0, 0.35))}`;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = `${iw * 0.8 * (1 - seg(a, 0, 0.25))}`;
      }

      if (pinRef.current) {
        pVec.copy(tharsisDir).applyAxisAngle(Y_AXIS, yaw).applyAxisAngle(X_AXIS, pitch);
        pinRef.current.style.transform = `translate(${cx + pVec.x * R - 6}px, ${cy - pVec.y * R - 8}px)`;
        pinRef.current.style.opacity = `${seg(pVec.z, 0.22, 0.42) * seg(age, 1.6, 2.1) * (1 - seg(a, 0, 0.3))}`;
      }

      if (word1Ref.current) {
        const ka = seg(a, 0.45, 1);
        const w1x = portrait ? 0 : 0.02 * W + (1 - out(ka)) * 40;
        const w1y = portrait ? 0.46 * H : 0.56 * H;
        word1Ref.current.style.transform = `translate(calc(-50% + ${w1x}px), ${w1y}px)`;
        word1Ref.current.style.opacity = `${ka * (1 - seg(b, 0.02, 0.16))}`;
      }

      const sOp = seg(a, 0.55, 1) * (1 - seg(b, 0, 0.14));
      const sVis = sOp > 0.005;
      if (sitesRef.current) {
        sitesRef.current.style.opacity = `${sOp}`;
        sitesRef.current.style.visibility = sVis ? 'visible' : 'hidden';
        sitesRef.current.style.pointerEvents = sOp >= 0.6 ? 'auto' : 'none';
      }
      if (cardRef.current) {
        cardRef.current.style.opacity = `${sOp}`;
        cardRef.current.style.visibility = sVis ? 'visible' : 'hidden';
        cardRef.current.style.pointerEvents = sOp >= 0.6 ? 'auto' : 'none';
        cardRef.current.style.transform = `translateX(${(1 - out(seg(a, 0.6, 1))) * 26}px)`;
      }

      if (gl) {
        gl.style.pointerEvents = st < 1.02 ? 'auto' : 'none';
      }

      if (regionRef.current) {
        regionRef.current.style.left = `${cx}px`;
        regionRef.current.style.top = `${cy}px`;
        regionRef.current.style.opacity = `${seg(b, 0.14, 0.26) * (1 - seg(b, 0.42, 0.52))}`;
      }

      if (fogRef.current) {
        const fi = seg(b, 0.36, 0.54);
        const fo = seg(b, 0.62, 0.96);
        fogRef.current.style.opacity = `${fi * (1 - fo)}`;
      }

      const lVis = b > 0.5;
      if (landRef.current && foreRef.current && destRef.current) {
        landRef.current.style.visibility = foreRef.current.style.visibility = destRef.current.style.visibility =
          lVis ? 'visible' : 'hidden';
        if (lVis) {
          const lk = out(seg(b, 0.5, 1));
          const fk = out(seg(b, 0.58, 1));
          const dk = out(seg(b, 0.66, 0.98));
          const drift = 1 + 0.02 * Math.sin(t * 0.18);
          landRef.current.style.transform = `translate(${mouseX * -14}px, ${mix(0.2 * H, mouseY * -8, lk)}px) scale(${mix(1.3, 1.05, lk) * drift})`;
          foreRef.current.style.transform = `translate(${mouseX * -46}px, ${mix(0.42 * H, 0, fk)}px) scale(1.06)`;
          destRef.current.style.transform = `translate(${mouseX * -26}px, ${mix(0.62 * H, portrait ? 0.3 * H : 0.27 * H, dk)}px)`;
        }
      }

      if (barRef.current) {
        const bk = seg(b, 0.86, 1);
        barRef.current.style.opacity = `${bk}`;
        barRef.current.style.visibility = bk > 0.005 ? 'visible' : 'hidden';
        barRef.current.style.pointerEvents = bk > 0.6 ? 'auto' : 'none';
        barRef.current.style.transform = `translate(-50%, ${(1 - out(bk)) * 34}px)`;
      }

      if (scrimRef.current) {
        scrimRef.current.style.opacity = `${seg(b, 0.6, 0.9)}`;
      }

      // Dust canvas animation
      if (dctx) {
        dctx.clearRect(0, 0, W, H);
        const dMul = 1 - b * 0.3;
        for (const m of motes) {
          const mxPos = (((m.x + t * m.s + 2) % 1.1) - 0.05) * W;
          const myPos = (m.y + Math.sin(t * 0.3 + m.p) * 0.02) * H;
          dctx.globalAlpha = (0.3 + 0.35 * Math.sin(t * 0.7 + m.p) ** 2) * dMul;
          dctx.drawImage(sp, mxPos - m.r, myPos - m.r, m.r * 2, m.r * 2);
        }
      }

      animId = requestAnimationFrame(render);
    }

    onResize();
    updateSiteCard(0);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', handlePointerMove);
      gl.removeEventListener('pointerdown', handlePointerDown);
      gl.removeEventListener('pointerup', handlePointerUp);
      gl.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="start-menu-container" ref={containerRef}>
      <main className="hero" id="hero">
        <div id="word0" ref={word0Ref}>
          APOGEE
        </div>
        <div id="eyebrow" ref={eyebrowRef}>
          NASA Space Apps Challenge · Mars Mission Architect
        </div>
        <div id="flare" ref={flareRef} />
        <canvas id="gl" ref={glRef} />
        <canvas id="dust" ref={dustRef} />
        <div id="pin" ref={pinRef}>
          <i />
          <span>Tharsis Rise</span>
        </div>
        <div id="word1" ref={word1Ref}>
          MARTIAN TARGETS
        </div>

        <ul id="sites" ref={sitesRef}>
          {SITES.map((site, idx) => (
            <li
              key={site.name}
              className={selectedSiteIndex === idx ? 'on' : ''}
              onClick={() => setSelectedSiteIndex(idx)}
            >
              {site.name}
            </li>
          ))}
        </ul>

        <div id="card" ref={cardRef} style={{ backgroundImage: `url(${CARDS})` }}>
          <div className="card-info">
            <span className="card-badge">{curSite.difficulty} Target</span>
            <h4>{curSite.name}</h4>
            <p>{curSite.description}</p>
          </div>
          <a
            href="#briefing"
            className="card-btn"
            onClick={e => {
              e.preventDefault();
              handleLaunch(selectedSiteIndex);
            }}
          >
            Deploy Mission ➔
          </a>
        </div>

        <div id="region" ref={regionRef}>
          {curSite.name.toUpperCase()}
        </div>
        <div id="land" ref={landRef} style={{ backgroundImage: `url(${LAND})` }} />
        <div id="dest" ref={destRef}>
          <small>Landing Site Target</small>
          <b id="destName" ref={destNameRef}>
            {curSite.name}
          </b>
        </div>
        <div id="fore" ref={foreRef} style={{ backgroundImage: `url(${FORE})` }} />
        <div id="fog" ref={fogRef} />
        <div id="scrim" ref={scrimRef} />

        {/* Bottom Booking / Launch Parameters Bar */}
        <div id="bar" ref={barRef}>
          <div>
            <label>Selected Target Site</label>
            <strong>{curSite.name}</strong>
          </div>
          <div>
            <label>Mission Budget Cap</label>
            <strong style={{ color: '#0284c7' }}>${curSite.budgetMUSD}M USD</strong>
          </div>
          <div>
            <label>Operations Difficulty</label>
            <strong style={{ color: curSite.difficulty === 'Beginner' ? '#16a34a' : curSite.difficulty === 'Intermediate' ? '#d97706' : '#dc2626' }}>
              {curSite.difficulty}
            </strong>
          </div>
          <button
            type="button"
            className="start-btn"
            onClick={() => handleLaunch(selectedSiteIndex)}
          >
            Launch ➔
          </button>
        </div>

        {/* Top Header */}
        <header className="menu-header">
          <div
            className="menu-logo"
            onClick={() => {
              /* go to top */
            }}
          >
            <svg viewBox="0 0 34 30" fill="none" stroke="#fff" strokeLinecap="round">
              <path strokeWidth="3.2" d="M3 27C5 13 15 4 31 3" />
              <path strokeWidth="2" d="M11 27c1.500-8 8-14 18-15" />
              <circle cx="30" cy="20" r="3.500" fill="#fff" stroke="none" />
            </svg>
            APOGEE
          </div>
          <span className="badge-tag">Team MS Chung · Hanoi, Vietnam</span>
          <button
            type="button"
            className="launch-direct-btn"
            onClick={() => handleLaunch(selectedSiteIndex)}
          >
            Enter Mission Control
          </button>
        </header>

        <div id="hint" ref={hintRef}>
          Drag to rotate Mars globe · Click planet or site to zoom in
        </div>
      </main>
    </div>
  );
}
