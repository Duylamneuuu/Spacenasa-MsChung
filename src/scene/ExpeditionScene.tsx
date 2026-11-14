import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, memo, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, Group, MathUtils, Matrix4, Object3D, Vector3 } from 'three';
import type { InstancedMesh, Mesh, PerspectiveCamera } from 'three';
import { MISSIONS, SITES } from '../content/expedition';
import { cells, HEIGHT, inMap, key, same, terrainAt, TERRAIN, TILE_SIZE, WIDTH } from '../data/expedition';
import type { Cell, ControlMode, Loadout, MissionState, PlanPreview, RiskBand, StationaryAction } from '../types/expedition';
import { RoverModel } from './RoverModel';
import { ROVER_ASSET } from './roverAsset';

const offsetX = (WIDTH - 1) / 2;
const offsetZ = (HEIGHT - 1) / 2;
const SKY = '#d9a07a';
const HAZE = '#c98a66';
const terrainColor = { hard: new Color(TERRAIN.hard.color), sand: new Color(TERRAIN.sand.color), rock: new Color(TERRAIN.rock.color) };
const outerColor = new Color('#9a5038');
const pathColors: Record<RiskBand, string> = { low: '#9ff5c8', medium: '#ffd27a', high: '#ff6b5b' };
const random = (x: number, z: number, seed = 0) => { const n = Math.sin(x * 13.183 + z * 79.127 + seed * 47.317) * 43758.5453; return n - Math.floor(n); };
const smooth = (a: number, b: number, t: number) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const outside = (x: number, z: number) => Math.hypot(Math.max(0, -0.5 - x, x - (WIDTH - .5)), Math.max(0, -0.5 - z, z - (HEIGHT - .5)));
function height(x: number, z: number) {
  const fade = Math.max(0, Math.min(1, Math.min((x - 3) * .5, (12 - x) * .6, (z - 2) * .8, (8 - z) * .8)));
  const dune = fade * (.54 + .38 * Math.sin(x * 1.85 + z * .53 + Math.sin(z * .6)));
  const hills = Math.max(0, Math.min(1, (z - 6) * .35)) * (Math.sin(x * 1.08 + z * .7) + 1.1);
  const base = dune + hills * .48 + .16 * Math.sin(x * 1.1) * Math.cos(z * 1.3);
  const d = outside(x, z);
  if (!d) return base;
  const ridge = (Math.sin(x * .37 + z * .21) + Math.sin(x * .13 - z * .41) * 1.3 + 2.3) * 1.15;
  return base * (1 - smooth(0, 3, d)) + smooth(1, 14, d) * (3.5 + ridge * 2.2) + Math.sin(x * 2.1 + z * 1.7) * .12 * smooth(0, 2, d);
}
export function position(c: Cell, lift = 0): [number, number, number] {
  return [(c.x - offsetX) * TILE_SIZE, height(c.x, c.z) + lift, (c.z - offsetZ) * TILE_SIZE];
}
const PAD = 16;
function bakeTerrain() {
  const positions: number[] = [], colors: number[] = [];
  const vertex = (x: number, z: number) => [(x - offsetX) * TILE_SIZE, height(x, z), (z - offsetZ) * TILE_SIZE];
  const tri = (p: number[], q: number[], r: number[], color: Color) => { positions.push(...p, ...q, ...r); for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b); };
  for (let z = -.5 - PAD; z < HEIGHT - .5 + PAD; z += .5) {
    for (let x = -.5 - PAD; x < WIDTH - .5 + PAD; x += .5) {
      const a = vertex(x, z), b = vertex(x + .5, z), c = vertex(x, z + .5), d = vertex(x + .5, z + .5);
      const cx = x + .25, cz = z + .25, out = outside(cx, cz);
      let color: Color;
      if (out > .01) color = outerColor.clone().lerp(new Color('#6e3829'), smooth(2, 12, out) * .55).multiplyScalar(.86 + random(x, z) * .24);
      else {
        const t = terrainAt({ x: Math.round(cx), z: Math.round(cz) });
        color = terrainColor[t].clone().multiplyScalar(.87 + random(x, z) * .22);
        if (t === 'sand') color.multiplyScalar(.92 + .12 * Math.sin(x * 3.2 + z * .9));
      }
      tri(a, c, b, color);
      tri(b, c, d, color.clone().multiplyScalar(.92 + random(x, z, 3) * .16));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// Width of the Route Plan panel (hud.css .hud-planner) plus its margin.
const PLANNER_W = 376;

function GameCamera({ state, mode }: { state: MissionState; mode: ControlMode }) {
  const { camera, size } = useThree();
  const eye = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  const current = useRef(new Vector3(0, 6, 0));
  const first = useRef(true);
  useFrame((_, dt) => {
    const cam = camera as PerspectiveCamera;
    const [x, y, z] = position(state.position);
    const chase = mode !== 'planning';
    if (chase) {
      const h = state.pose.heading, sx = Math.sin(h), sz = Math.cos(h);
      eye.set(x - sx * 10.5, y + 5.2, z - sz * 10.5);
      look.set(x + sx * 5, y + 1.1, z + sz * 5);
    } else {
      const aspect = (size.width - (size.width > 760 ? PLANNER_W : 0)) / Math.max(1, size.height);
      const reach = 1 + Math.max(0, 1.7 - aspect) * .9;
      eye.set(x * .35, 44 * reach, 34 * reach + z * .35);
      look.set(x * .35, 0, 2 + z * .35);
    }
    // Keep the planning view centred in the space left of the Route Plan panel.
    const shift = !chase && size.width > 760 ? PLANNER_W / 2 : 0;
    const view = cam.view;
    if (shift && (!view || !view.enabled || Math.abs(view.offsetX - shift) > .5 || view.fullWidth !== size.width || view.fullHeight !== size.height)) cam.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    else if (!shift && view && view.enabled) cam.clearViewOffset();
    const delta = Math.min(dt, 0.05);
    const k = first.current ? 1 : 1 - Math.exp(-delta * (chase ? 5.5 : 3.2));
    first.current = false;
    cam.position.lerp(eye, k);
    current.current.lerp(look, k);
    cam.lookAt(current.current);
    const fov = chase ? 52 : 40;
    if (Math.abs(cam.fov - fov) > .05) { cam.fov = MathUtils.lerp(cam.fov, fov, k); cam.updateProjectionMatrix(); }
  });
  return null;
}

const Terrain = memo(function Terrain({ onPick, enabled }: { onPick: (c: Cell) => void; enabled: boolean }) {
  const geometry = useMemo(bakeTerrain, []);
  const rocks = useRef<InstancedMesh>(null);
  const formations = useMemo(() => {
    const inside = cells.flatMap(c => {
      const kind = terrainAt(c);
      const count = kind === 'rock' ? 8 : kind === 'sand' ? 1 : 3;
      return Array.from({ length: count }, (_, i) => ({
        x: c.x + ((i % 2) ? 1 : -1) * (.22 + .21 * random(c.x, c.z, i)),
        z: c.z + (((i + 1) % 3) ? 1 : -1) * (.24 + .18 * random(c.z, c.x, i + 17)),
        color: kind === 'rock' ? '#6b3730' : '#9d563b', sy: kind === 'rock' ? 1.38 : .68,
        scale: (kind === 'rock' ? .52 : kind === 'sand' ? .12 : .24) * (.53 + random(c.x, c.z, i + 24)),
      }));
    });
    const rim = Array.from({ length: 260 }, (_, i) => {
      const a = random(i, 3) * Math.PI * 2, r = 1.5 + random(i, 9) * 11;
      return { x: offsetX + Math.cos(a) * (offsetX + .5 + r), z: offsetZ + Math.sin(a) * (offsetZ + .5 + r), color: '#74392c', sy: 1.1, scale: .4 + random(i, 13) * 1.6 };
    });
    return [...inside, ...rim];
  }, []);
  useLayoutEffect(() => {
    const obj = new Object3D(), mesh = rocks.current;
    if (!mesh) return;
    formations.forEach(({ x, z, scale, sy, color }, i) => {
      obj.position.set(...position({ x, z }, .03));
      obj.rotation.set(.06, random(x, z) * Math.PI * 2, .2);
      obj.scale.set(scale * 1.5, scale * sy, scale);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
      mesh.setColorAt(i, new Color(color).multiplyScalar(.88 + random(x, z, 19) * .35));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [formations]);
  return <>
    <mesh geometry={geometry} onClick={event => {
      if (!enabled) return;
      event.stopPropagation();
      const cell = { x: Math.round(event.point.x / TILE_SIZE + offsetX), z: Math.round(event.point.z / TILE_SIZE + offsetZ) };
      if (inMap(cell)) onPick(cell);
    }}><meshStandardMaterial vertexColors roughness={.98} flatShading /></mesh>
    <instancedMesh ref={rocks} args={[undefined, undefined, formations.length]}>
      <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  </>;
});

const SectorFrame = memo(function SectorFrame() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const edge = (x0: number, z0: number, x1: number, z1: number) => {
      for (let i = 0; i < 40; i++) {
        const a = i / 40, b = (i + .55) / 40;
        pts.push(...position({ x: MathUtils.lerp(x0, x1, a), z: MathUtils.lerp(z0, z1, a) }, .12), ...position({ x: MathUtils.lerp(x0, x1, b), z: MathUtils.lerp(z0, z1, b) }, .12));
      }
    };
    const l = -.5, r = WIDTH - .5, t = -.5, btm = HEIGHT - .5;
    edge(l, t, r, t); edge(r, t, r, btm); edge(r, btm, l, btm); edge(l, btm, l, t);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="#ffd2a8" transparent opacity={.55} /></lineSegments>;
});

function Ring({ color, radius, lift = 0, width = .13, opacity = .92 }: { color: string; radius: number; lift?: number; width?: number; opacity?: number }) {
  return <mesh position-y={lift} rotation-x={-Math.PI / 2}>
    <ringGeometry args={[radius - width, radius, 40]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
  </mesh>;
}
const MAX_ROUTE_INSTANCES = 800;
const scratchMatrix = new Matrix4();
const scratchObj = new Object3D();
const scratchUp = new Vector3(0, 1, 0);
const scratchDir = new Vector3();
const scratchColor = new Color();

const Route = memo(function Route({ preview, trace, chase }: { preview: PlanPreview; trace: MissionState['trace']; chase: boolean }) {
  const items = useMemo(() => {
    const legs = [
      ...trace.slice(1).map((to, i) => ({ from: trace[i], to, color: '#f0d8c4', width: chase ? .035 : .09, gap: 0 })),
      ...preview.steps.map(s => ({ ...s, color: pathColors[s.risk], width: (s.uncertain ? .14 : .22) * (chase ? .35 : 1), gap: 1 })),
    ];
    return legs.flatMap(({ from, to, color, width, gap }) => Array.from({ length: 3 }, (_, i) => {
      const at = (t: number) => position({ x: MathUtils.lerp(from.x, to.x, t), z: MathUtils.lerp(from.z, to.z, t) }, chase ? .08 : .22);
      const a = at(i / 3), b = at(i / 3 + (gap ? .22 : .34));
      return {
        centerX: (a[0] + b[0]) * 0.5,
        centerY: (a[1] + b[1]) * 0.5,
        centerZ: (a[2] + b[2]) * 0.5,
        dirX: b[0] - a[0],
        dirY: b[1] - a[1],
        dirZ: b[2] - a[2],
        color,
        width,
      };
    }));
  }, [preview, trace, chase]);
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const count = Math.min(items.length, MAX_ROUTE_INSTANCES);
    mesh.count = count;
    for (let i = 0; i < count; i++) {
      const it = items[i];
      scratchDir.set(it.dirX, it.dirY, it.dirZ);
      const len = scratchDir.length();
      scratchObj.position.set(it.centerX, it.centerY, it.centerZ);
      if (len > 1e-4) {
        scratchDir.divideScalar(len);
        scratchObj.quaternion.setFromUnitVectors(scratchUp, scratchDir);
      }
      scratchObj.scale.set(it.width, len, it.width);
      scratchMatrix.compose(scratchObj.position, scratchObj.quaternion, scratchObj.scale);
      mesh.setMatrixAt(i, scratchMatrix);
      scratchColor.set(it.color);
      mesh.setColorAt(i, scratchColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[undefined, undefined, MAX_ROUTE_INSTANCES]} frustumCulled={false}>
    <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial toneMapped={false} />
  </instancedMesh>;
});

function Beacon({ color, height: h = 9, active = true }: { color: string; height?: number; active?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) (ref.current.material as unknown as { opacity: number }).opacity = (active ? .3 : .12) + Math.sin(clock.elapsedTime * 2.4) * .06; });
  return <mesh ref={ref} position-y={h / 2}><cylinderGeometry args={[.09, .32, h, 8, 1, true]} /><meshBasicMaterial color={color} transparent opacity={.3} depthWrite={false} toneMapped={false} /></mesh>;
}

const Lander = memo(function Lander({ cell }: { cell: Cell }) {
  const at = position({ x: cell.x - 1.2, z: cell.z + .55 });
  return <group position={at}>
    <mesh position-y={.10}><cylinderGeometry args={[1.68, 1.86, .2, 8]} /><meshStandardMaterial color="#674639" /></mesh>
    <mesh position-y={.74}><cylinderGeometry args={[.86, 1.12, .74, 6]} /><meshStandardMaterial color="#cc9b57" roughness={.64} /></mesh>
    <mesh position-y={1.14}><cylinderGeometry args={[.64, .83, .17, 6]} /><meshStandardMaterial color="#ddc8aa" /></mesh>
    {Array.from({ length: 4 }, (_, i) => <group key={i} rotation-y={Math.PI / 4 + i * Math.PI / 2}>
      <mesh position={[0, .44, 1.02]} rotation-x={1}><boxGeometry args={[.14, .91, .14]} /><meshStandardMaterial color="#c3aa83" /></mesh>
      <mesh position={[0, .14, 1.41]}><cylinderGeometry args={[.24, .31, .15, 6]} /><meshStandardMaterial color="#675148" /></mesh>
    </group>)}
    <mesh position={[.15, 1.55, -.1]}><cylinderGeometry args={[.04, .04, .68, 6]} /><meshStandardMaterial color="#ede1be" /></mesh>
    <mesh position={[.15, 1.88, -.1]} rotation-z={.42}><cylinderGeometry args={[.39, .12, .12, 10]} /><meshStandardMaterial color="#d4c8b2" /></mesh>
    <pointLight color="#ffb46b" intensity={6} distance={9} position={[0, 2.4, 0]} />
    <Beacon color="#ffb46b" height={6} />
  </group>;
});

const Dust = memo(function Dust({ state }: { state: MissionState }) {
  const ref = useRef<InstancedMesh>(null);
  const puffs = useMemo(() => Array.from({ length: 40 }, () => ({ p: new Vector3(), v: new Vector3(), life: 0 })), []);
  const next = useRef(0);
  const obj = useMemo(() => new Object3D(), []);
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const delta = Math.min(dt, 0.05);
    const speed = Math.abs(state.pose.speed);
    if (speed > .4 && Math.random() < speed * delta * 5) {
      const p = puffs[next.current++ % puffs.length];
      const [x, y, z] = position(state.position);
      const h = state.pose.heading, side = Math.random() < .5 ? -1 : 1;
      p.p.set(x - Math.sin(h) * .9 + Math.cos(h) * side * .9, y + .25, z - Math.cos(h) * .9 - Math.sin(h) * side * .9);
      p.v.set((Math.random() - .5) * .6, .5 + Math.random() * .5, (Math.random() - .5) * .6);
      p.life = 1;
    }
    puffs.forEach((p, i) => {
      p.life = Math.max(0, p.life - delta * .9);
      p.p.addScaledVector(p.v, delta);
      obj.position.copy(p.p); obj.scale.setScalar(p.life ? (1.25 - p.life) * .38 : 0); obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, puffs.length]} frustumCulled={false}>
    <icosahedronGeometry args={[.5, 0]} /><meshStandardMaterial color="#c98a63" transparent opacity={.22} depthWrite={false} roughness={1} />
  </instancedMesh>;
});

function Vehicle({ state, effect }: { state: MissionState; effect: StationaryAction['type'] | null }) {
  const ref = useRef<Group>(null);
  const pulse = useRef<Group>(null);
  const spin = useRef(0);
  const previous = useRef(state.distance);
  const pulseAge = useRef(0);
  const target = useMemo(() => new Vector3(), []);
  const synced = useRef(false);

  useLayoutEffect(() => {
    if (!synced.current && ref.current) {
      ref.current.position.set(...position(state.position));
      ref.current.rotation.y = state.pose.heading;
      synced.current = true;
    }
  }, []);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const delta = Math.min(dt, 0.05);
    target.set(...position(state.position, .02));
    g.position.lerp(target, Math.min(1, delta * 27));
    const dAngle = state.pose.heading - g.rotation.y;
    g.rotation.y += Math.atan2(Math.sin(dAngle), Math.cos(dAngle)) * Math.min(1, delta * 24);
    spin.current += (state.distance - previous.current) * Math.sign(state.pose.speed || 1);
    previous.current = state.distance;
    if (pulse.current) {
      pulseAge.current += delta;
      const r = 1 + (pulseAge.current * (effect === 'scan' ? 6 : 2.4)) % (effect === 'scan' ? 9 : 3);
      pulse.current.scale.set(r, 1, r);
    } else pulseAge.current = 0;
  });
  return <group ref={ref}>
    <mesh rotation-x={-Math.PI / 2} position-y={.03}><circleGeometry args={[1.5, 24]} /><meshBasicMaterial color="#2a1410" transparent opacity={.38} depthWrite={false} /></mesh>
    <RoverModel loadout={state.loadout} spin={spin} asset={ROVER_ASSET} />
    <spotLight color="#fff1d6" intensity={14} distance={16} angle={.55} penumbra={.6} position={[0, 1.2, 1]} />
    {effect && <group ref={pulse}><Ring color={effect === 'analyze' ? '#ffcd80' : effect === 'recharge' ? '#ffe08a' : '#7fe3df'} radius={1.6} lift={.14} width={.08} /></group>}
  </group>;
}

class RenderFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="map-fallback" role="status">WebGL is unavailable. Switch to the tactical map to keep playing.</div> : this.props.children; }
}

const Atmosphere = memo(function Atmosphere() {
  return <>
    <color attach="background" args={[SKY]} />
    <fog attach="fog" args={[HAZE, 55, 190]} />
    <hemisphereLight args={['#ffd9b8', '#5c2a1d', .9]} />
    <ambientLight color="#efc9b3" intensity={.55} />
    <directionalLight color="#ffe2b8" intensity={2.6} position={[-40, 50, -22]} />
    <directionalLight color="#9fb3cf" intensity={.35} position={[20, 10, 30]} />
  </>;
});

const TargetSite = memo(function TargetSite({ id, done, held, planning, onPick }: { id: string; done: boolean; held: boolean; planning: boolean; onPick: (cell: Cell) => void }) {
  const site = SITES[id as keyof typeof SITES];
  const color = done ? '#a9f6bb' : held ? '#ffd27a' : '#7fe3df';
  return <group position={position(site.cell, .12)} onClick={e => { if (!planning) return; e.stopPropagation(); onPick(site.cell); }}>
    <mesh position={[.72, .5, -.52]} rotation={[.09, .4, .18]}><dodecahedronGeometry args={[.68, 0]} /><meshStandardMaterial color="#d3b6a0" roughness={1} flatShading /></mesh>
    <mesh position={[-.79, .31, -.21]}><dodecahedronGeometry args={[.39, 0]} /><meshStandardMaterial color="#b98c73" roughness={1} /></mesh>
    <Ring color={color} radius={3.1} width={.1} opacity={.85} />
    <Beacon color={color} active={!done} height={done ? 4 : 11} />
    <mesh position-y={2.2} rotation-y={Math.PI / 4}><octahedronGeometry args={[.42]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
  </group>;
});

export function ExpeditionScene({ state, preview, waypoints, mode, effect, onPick }: { state: MissionState; preview: PlanPreview; waypoints: readonly Cell[]; mode: ControlMode; effect: StationaryAction['type'] | null; onPick: (cell: Cell) => void }) {
  const mission = MISSIONS[state.mission];
  const planning = mode === 'planning';
  return <RenderFallback><Canvas
    dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
    camera={{ fov: 40, near: .1, far: 420, position: [0, 44, 34] }}
    gl={{
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true,
    }}
  >
    <Atmosphere />
    <GameCamera state={state} mode={mode} />
    <Terrain onPick={onPick} enabled={planning} />
    {planning && <SectorFrame />}
    <Route preview={preview} trace={state.trace} chase={!planning} />
    {planning && cells.filter(c => state.surveyed[key(c)]).map(c => <mesh key={key(c)} position={position(c, .16)} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[.14, .24, 6]} /><meshBasicMaterial color="#9ce6c9" transparent opacity={.75} depthWrite={false} />
    </mesh>)}
    <Lander cell={mission.start} />
    {mission.targets.map(id => {
      const done = state.delivered.some(s => s.site === id);
      const held = state.pending.some(s => s.site === id);
      return <TargetSite key={id} id={id} done={done} held={held} planning={planning} onPick={onPick} />;
    })}
    {waypoints.filter(c => !same(c, state.position)).map((c, i) => <group key={i} position={position(c, .2)}>
      <Ring color="#ffd27a" radius={1.05} width={.12} />
      <mesh position-y={.9}><cylinderGeometry args={[.06, .06, 1.8, 5]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      <mesh position-y={1.95}><octahedronGeometry args={[.22]} /><meshBasicMaterial color="#fff0c8" toneMapped={false} /></mesh>
    </group>)}
    <Vehicle state={state} effect={effect} />
    <Dust state={state} />
  </Canvas></RenderFallback>;
}

function Turntable({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current.rotation.y += dt * .22; });
  return <group ref={ref} rotation-y={-.7}>{children}</group>;
}
function HangarCamera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const narrow = size.width < 760;
    camera.position.set(narrow ? 0 : 1.9, narrow ? 3.2 : 3.4, narrow ? 9.5 : 11.6);
    camera.lookAt(narrow ? 0 : 1.9, narrow ? .7 : 1.05, 0);
  }, [camera, size.width]);
  return null;
}
export function HangarScene({ loadout }: { loadout: Loadout }) {
  const spin = useRef(0);
  return <RenderFallback><Canvas
    dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
    camera={{ fov: 32, near: .1, far: 80 }}
    gl={{
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true,
    }}
  >
    <color attach="background" args={['#0d0a09']} />
    <fog attach="fog" args={['#0d0a09', 9, 22]} />
    <HangarCamera />
    <ambientLight color="#e8d3bd" intensity={.55} />
    <spotLight color="#ffe1bf" intensity={60} position={[-3, 7, 4]} angle={.5} penumbra={.7} />
    <directionalLight color="#ff8a4f" intensity={1.6} position={[4, 1.5, -5]} />
    <directionalLight color="#7fe3df" intensity={.7} position={[-5, 2, -3]} />
    <mesh position-y={-.12}><cylinderGeometry args={[2.3, 2.45, .24, 64]} /><meshStandardMaterial color="#1c1714" roughness={.6} metalness={.3} /></mesh>
    <Ring color="#ff9f4a" radius={2.2} lift={.005} width={.03} />
    <Ring color="#ff9f4a" radius={1.9} lift={.005} width={.012} opacity={.5} />
    <mesh rotation-x={-Math.PI / 2} position-y={-.24}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#120e0c" roughness={.9} /></mesh>
    <Turntable><RoverModel loadout={loadout} spin={spin} asset={ROVER_ASSET} /></Turntable>
  </Canvas></RenderFallback>;
}
