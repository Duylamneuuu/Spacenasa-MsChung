import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { CanvasTexture, Mesh, MeshStandardMaterial, OrthographicCamera, Scene, SphereGeometry, SRGBColorSpace, WebGLRenderer, AmbientLight, DirectionalLight } from 'three';

// Procedural illustration, not a geographic map. The game sector is fictional.
const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
function noise(x: number, y: number) {
  const i = Math.floor(x), j = Math.floor(y), u0 = x - i, v0 = y - j;
  const u = u0 * u0 * (3 - 2 * u0), v = v0 * v0 * (3 - 2 * v0);
  const a = hash(i, j) * (1 - u) + hash(i + 1, j) * u;
  const b = hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u;
  return a * (1 - v) + b * v;
}
function martianTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(canvas.width, canvas.height);
  const craters = Array.from({ length: 40 }, (_, i) => ({
    x: hash(i, 5), y: .12 + .76 * hash(i, 8), r: .005 + .035 * hash(i, 11) ** 2,
  }));
  const tau = Math.PI * 2;
  for (let y = 0; y < img.height; y++) {
    const v = y / img.height, polar = Math.abs(v * 2 - 1);
    for (let x = 0; x < img.width; x++) {
      const u = x / img.width;
      const a = Math.cos(u * tau), b = Math.sin(u * tau);
      const broad = noise(a * 3.3 + 7, b * 3.3 + v * 7) - .5;
      const ridges = 1 - Math.abs(noise(a * 13 + 15, b * 14 + v * 22) * 2 - 1);
      const weather = noise(a * 38 + 51, b * 38 + v * 69) - .5;
      let relief = broad * 55 + ridges ** 4 * 25 + weather * 20 + (hash(x, y) - .5) * 21;
      for (const c of craters) {
        const dx = u - c.x, dy = (v - c.y) * .75;
        if (Math.abs(dy) > c.r * 1.2 || Math.min(Math.abs(dx), 1 - Math.abs(dx)) > c.r * 1.2) continue;
        const rx = dx > .5 ? dx - 1 : dx < -.5 ? dx + 1 : dx;
        const d = Math.hypot(rx, dy) / c.r;
        if (d < .86) relief -= (1 - d * d) * (9 + 11 * (rx - dy) / c.r);
        if (d >= .86 && d < 1.2) relief += (1 - Math.abs(d - 1) / .2) * 16;
      }
      const ice = Math.max(0, polar + broad * .14 - .9) * 210;
      const i = (x + y * img.width) * 4;
      img.data[i] = 173 + relief + ice * .55;
      img.data[i + 1] = 78 + relief * .84 + ice * .95;
      img.data[i + 2] = 47 + relief * .57 + ice;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function TitleMars() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rotation = useRef({ yaw: -.75, pitch: .12 });
  const dragging = useRef<{ id: number; x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const view = canvas.current, area = host.current;
    if (!view || !area) return;
    let renderer: WebGLRenderer;
    try { renderer = new WebGLRenderer({ canvas: view, alpha: true, antialias: true }); }
    catch { return; }
    const scene = new Scene();
    const camera = new OrthographicCamera(-1.2, 1.2, 1.2, -1.2, .1, 20);
    camera.position.z = 4;
    const geometry = new SphereGeometry(1, 60, 44);
    const texture = martianTexture();
    const material = new MeshStandardMaterial({ color: texture ? '#fff1de' : '#b6603d', map: texture, roughness: .98 });
    const sphere = new Mesh(geometry, material);
    const sun = new DirectionalLight('#ffdbb0', 2.6);
    sun.position.set(-3, 2, 3);
    scene.add(sphere, sun, new AmbientLight('#bd8182', .37));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let last = performance.now(), frame = 0;
    function resize() {
      if (!area) return;
      const width = Math.max(1, area.clientWidth), height = Math.max(1, area.clientHeight), ratio = width / height;
      camera.left = -1.17 * Math.max(1, ratio);
      camera.right = -camera.left;
      camera.top = 1.17 * Math.max(1, 1 / ratio);
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
    }
    function draw(now: number) {
      if (!dragging.current && !motion.matches) rotation.current.yaw += Math.min((now - last) / 1000, .05) * .085;
      last = now;
      sphere.rotation.set(rotation.current.pitch, rotation.current.yaw, -.13);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(area);
    resize();
    frame = requestAnimationFrame(draw);
    setReady(true);
    function contextLost(event: Event) { event.preventDefault(); cancelAnimationFrame(frame); setReady(false); }
    function contextRestored() { cancelAnimationFrame(frame); last = performance.now(); frame = requestAnimationFrame(draw); setReady(true); }
    view.addEventListener('webglcontextlost', contextLost);
    view.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      view.removeEventListener('webglcontextlost', contextLost);
      view.removeEventListener('webglcontextrestored', contextRestored);
      geometry.dispose(); material.dispose(); texture?.dispose(); renderer.dispose();
    };
  }, []);

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current?.id === event.pointerId) dragging.current = null;
  }
  return <div className="title-orb" ref={host}>
    <canvas ref={canvas} aria-hidden="true" className={ready ? 'title-globe-canvas title-globe-ready' : 'title-globe-canvas'} />
    {ready && <div className="title-globe-drag" aria-hidden="true"
      onPointerDown={e => {
        if (e.button !== 0) return;
        dragging.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const drag = dragging.current;
        if (!drag || drag.id !== e.pointerId) return;
        rotation.current.yaw += (e.clientX - drag.x) * .008;
        rotation.current.pitch = Math.max(-1, Math.min(1, rotation.current.pitch + (e.clientY - drag.y) * .006));
        drag.x = e.clientX; drag.y = e.clientY;
      }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} />}
  </div>;
}

