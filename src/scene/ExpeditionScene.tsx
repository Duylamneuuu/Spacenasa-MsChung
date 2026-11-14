import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, Group, MathUtils, Matrix4, Object3D, Vector3 } from 'three';
import type { InstancedMesh, OrthographicCamera } from 'three';
import { MISSIONS, SITES } from '../content/expedition';
import { cells, HEIGHT, inMap, key, same, terrainAt, TERRAIN, TILE_SIZE, WIDTH } from '../data/expedition';
import type { Cell, ControlMode, Loadout, MissionState, PlanPreview, RiskBand, StationaryAction } from '../types/expedition';
import { RoverModel } from './RoverModel';
import { ROVER_ASSET } from './roverAsset';

const offsetX = (WIDTH - 1) / 2;
const offsetZ = (HEIGHT - 1) / 2;
const terrainColor = {
  hard: new Color(TERRAIN.hard.color), sand: new Color(TERRAIN.sand.color), rock: new Color(TERRAIN.rock.color),
};
const pathColors: Record<RiskBand, string> = { low: '#c5f3d4', medium: '#ffe29e', high: '#ff7568' };
const random = (x: number, z: number, seed = 0) => {
  const n = Math.sin(x * 13.183 + z * 79.127 + seed * 47.317) * 43758.5453;
  return n - Math.floor(n);
};
function height(x: number, z: number) {
  const fade = Math.max(0, Math.min(1, Math.min((x - 3) * .5, (12 - x) * .6, (z - 2) * .8, (8 - z) * .8)));
  const dune = fade * (.54 + .38 * Math.sin(x * 1.85 + z * .53 + Math.sin(z * .6)));
  const hills = Math.max(0, Math.min(1, (z - 6) * .35)) * (Math.sin(x * 1.08 + z * .7) + 1.1);
  return dune + hills * .48 + .16 * Math.sin(x * 1.1) * Math.cos(z * 1.3);
}
function position(c: Cell, lift = 0): [number, number, number] {
  return [(c.x - offsetX) * TILE_SIZE, height(c.x, c.z) + lift, (c.z - offsetZ) * TILE_SIZE];
}
function bakeTerrain() {
  const positions: number[] = [], colors: number[] = [];
  const step = .5;
  const vertex = (x: number, z: number, below = 0) => [(x - offsetX) * TILE_SIZE, height(x, z) - below, (z - offsetZ) * TILE_SIZE];
  const tri = (p: number[], q: number[], r: number[], color: Color) => {
    positions.push(...p, ...q, ...r);
    for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
  };
  for (let z = -.5; z < HEIGHT - .5; z += step) {
    for (let x = -.5; x < WIDTH - .5; x += step) {
      const a = vertex(x, z), b = vertex(x + step, z), c = vertex(x, z + step), d = vertex(x + step, z + step);
      const t = terrainAt({ x: Math.round(x + .25), z: Math.round(z + .25) });
      const color = terrainColor[t].clone().multiplyScalar(.87 + random(x, z) * .22);
      if (t === 'sand') color.multiplyScalar(.92 + .12 * Math.sin(x * 3.2 + z * .9));
      tri(a, c, b, color);
      tri(b, c, d, color.clone().multiplyScalar(.92 + random(x, z, 3) * .16));
    }
  }
  const sideA = new Color('#6c342a'), sideB = new Color('#45251f');
  function side(x: number, z: number, u: number, v: number) {
    const a = vertex(x, z), b = vertex(u, v);
    const c = vertex(x, z, 1.35), d = vertex(u, v, 1.35);
    const e = vertex(x, z, 3.1), f = vertex(u, v, 3.1);
    tri(a, b, c, sideA); tri(b, d, c, sideA);
    tri(c, d, e, sideB); tri(d, f, e, sideB);
  }
  for (let x = -.5; x < WIDTH - .5; x += step) { side(x + step, -.5, x, -.5); side(x, HEIGHT - .5, x + step, HEIGHT - .5); }
  for (let z = -.5; z < HEIGHT - .5; z += step) { side(-.5, z, -.5, z + step); side(WIDTH - .5, z + step, WIDTH - .5, z); }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Camera({ detail = false, state, mode }: { detail?: boolean; state?: MissionState; mode?: ControlMode }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const ortho = camera as OrthographicCamera;
    const span = detail ? Math.min(size.height / 3.9, size.width / 4.5) : Math.min(size.height / 65, size.width / 83);
    ortho.position.set(detail ? 5 : 41, detail ? 3.3 : 72, detail ? 6 : 61);
    ortho.lookAt(0, detail ? .55 : .15, 0);
    ortho.zoom = span;
    ortho.updateProjectionMatrix();
  }, [camera, detail, mode, size.height, size.width]);
  const aim = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  useFrame((_, dt) => {
    if (mode !== 'driving' || !state) return;
    const [x, y, z] = position(state.position);
    const heading = state.pose.heading;
    const sx = Math.sin(heading), sz = Math.cos(heading);
    const smoothing = Math.min(1, dt * 6);
    target.set(x - sx * 12, y + 13, z - sz * 12);
    camera.position.lerp(target, smoothing);
    aim.set(x + sx * 4.5, y + .2, z + sz * 4.5);
    camera.lookAt(aim);
    (camera as OrthographicCamera).zoom = MathUtils.lerp((camera as OrthographicCamera).zoom, Math.min(size.height / 20, size.width / 28), smoothing);
    camera.updateProjectionMatrix();
  });
  return null;
}

function Terrain({ onPick }: { onPick: (c: Cell) => void }) {
  const geometry = useMemo(bakeTerrain, []);
  const rocks = useRef<InstancedMesh>(null);
  const formations = useMemo(() => cells.flatMap(c => {
    const kind = terrainAt(c);
    const count = kind === 'rock' ? 8 : kind === 'sand' ? 1 : 3;
    return Array.from({ length: count }, (_, i) => ({
      x: c.x + ((i % 2) ? 1 : -1) * (.22 + .21 * random(c.x, c.z, i)),
      z: c.z + (((i + 1) % 3) ? 1 : -1) * (.24 + .18 * random(c.z, c.x, i + 17)),
      kind,
      scale: (kind === 'rock' ? .52 : kind === 'sand' ? .12 : .24) * (.53 + random(c.x, c.z, i + 24)),
    }));
  }), []);
  useLayoutEffect(() => {
    const obj = new Object3D();
    formations.forEach(({ x, z, scale, kind }, i) => {
      obj.position.set(...position({ x, z }, .03));
      obj.rotation.set(.06, random(x, z) * Math.PI * 2, .2);
      obj.scale.set(scale * 1.5, scale * (kind === 'rock' ? 1.38 : .68), scale);
      obj.updateMatrix();
      rocks.current?.setMatrixAt(i, obj.matrix);
      rocks.current?.setColorAt(i, new Color(kind === 'rock' ? '#6b3730' : '#9d563b').multiplyScalar(.88 + random(x, z, 19) * .35));
    });
    if (rocks.current) rocks.current.instanceMatrix.needsUpdate = true;
  }, [formations]);
  return <>
    <mesh geometry={geometry} onClick={event => {
      event.stopPropagation();
      const cell = { x: Math.round(event.point.x / TILE_SIZE + offsetX), z: Math.round(event.point.z / TILE_SIZE + offsetZ) };
      if (inMap(cell)) onPick(cell);
    }}>
      <meshStandardMaterial vertexColors roughness={.98} flatShading />
    </mesh>
    <instancedMesh ref={rocks} args={[undefined, undefined, formations.length]}>
      <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  </>;
}

function Ring({ color, radius, lift = 0 }: { color: string; radius: number; lift?: number }) {
  return <mesh position-y={lift} rotation-x={-Math.PI / 2}>
    <ringGeometry args={[radius - .13, radius, 28]} /><meshBasicMaterial color={color} transparent opacity={.92} />
  </mesh>;
}
function Route({ preview, trace }: { preview: PlanPreview; trace: MissionState['trace'] }) {
  const items = useMemo(() => {
    const legs = [
      ...trace.slice(1).map((to, i) => ({ from: trace[i], to, color: '#d1a88c', width: .07 })),
      ...preview.steps.map(s => ({ ...s, color: pathColors[s.risk], width: s.uncertain ? .10 : .16 })),
    ];
    return legs.flatMap(({ from, to, color, width }) => Array.from({ length: 3 }, (_, i) => {
      const at = (t: number) => new Vector3(...position({ x: MathUtils.lerp(from.x, to.x, t), z: MathUtils.lerp(from.z, to.z, t) }, .19));
      const a = at(i / 3), b = at(i / 3 + .29);
      return { center: a.clone().lerp(b, .5), direction: b.clone().sub(a), color, width };
    }));
  }, [preview, trace]);
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4(), obj = new Object3D();
    items.forEach(({ center, direction, width, color }, i) => {
      obj.position.copy(center);
      obj.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
      obj.scale.set(width, direction.length(), width);
      matrix.compose(obj.position, obj.quaternion, obj.scale);
      mesh.setMatrixAt(i, matrix); mesh.setColorAt(i, new Color(color));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);
  return items.length ? <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
    <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial />
  </instancedMesh> : null;
}

function Lander({ cell }: { cell: Cell }) {
  const at = position({ x: cell.x - .47, z: cell.z + .38 });
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
  </group>;
}

function Vehicle({ state, effect }: { state: MissionState; effect: StationaryAction['type'] | null }) {
  const ref = useRef<Group>(null);
  const pulse = useRef<Group>(null);
  const spin = useRef(0);
  const previous = useRef(state.distance);
  const pulseAge = useRef(0);
  const target = useMemo(() => new Vector3(), []);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    target.set(...position(state.position, .02));
    g.position.lerp(target, Math.min(1, dt * 27));
    const delta = state.pose.heading - g.rotation.y;
    g.rotation.y += Math.atan2(Math.sin(delta), Math.cos(delta)) * Math.min(1, dt * 24);
    spin.current += (state.distance - previous.current) * Math.sign(state.pose.speed || 1);
    previous.current = state.distance;
    if (pulse.current) {
      pulseAge.current += dt;
      const r = Math.min(4, 1 + pulseAge.current * (effect === 'scan' ? 5 : 2));
      pulse.current.scale.set(r, 1, r);
    } else pulseAge.current = 0;
  });
  return <group ref={ref} position={position(state.position)} rotation-y={state.pose.heading}>
    <mesh rotation-x={-Math.PI / 2} position-y={.015}>
      <circleGeometry args={[1.42, 24]} /><meshBasicMaterial color="#361d19" transparent opacity={.34} depthWrite={false} />
    </mesh>
    <RoverModel loadout={state.loadout} spin={spin} asset={ROVER_ASSET} />
    <Ring color="#e5f5cd" radius={1.5} lift={.055} />
    {effect && <group ref={pulse}>
      <Ring color={effect === 'analyze' ? '#ffcd80' : '#81f2df'} radius={1.6} lift={.14} />
    </group>}
  </group>;
}

class RenderFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="map-fallback" role="status">WebGL is unavailable. Use the field map to plan and monitor your drive.</div> : this.props.children; }
}

export function ExpeditionScene({ state, preview, waypoints, mode, effect, onPick }: { state: MissionState; preview: PlanPreview; waypoints: readonly Cell[]; mode: ControlMode; effect: StationaryAction['type'] | null; onPick: (cell: Cell) => void }) {
  const mission = MISSIONS[state.mission];
  return <RenderFallback><Canvas orthographic dpr={[1, 1.5]} camera={{ near: .1, far: 650 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
    <Camera state={state} mode={mode} />
    <ambientLight color="#efd0be" intensity={1.27} />
    <directionalLight color="#ffe0b2" intensity={2.25} position={[-21, 36, -16]} />
    <directionalLight color="#aab9cf" intensity={.43} position={[13, 7, 17]} />
    <Terrain onPick={onPick} />
    <Route preview={preview} trace={state.trace} />
    {cells.filter(c => state.surveyed[key(c)]).map(c => <mesh key={key(c)} position={position(c, .14)} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[.13, .23, 6]} /><meshBasicMaterial color="#9ce6c9" transparent opacity={.7} />
    </mesh>)}
    <Lander cell={mission.start} />
    {mission.targets.map(id => {
      const site = SITES[id];
      const done = state.delivered.some(s => s.site === id);
      return <group key={id} position={position(site.cell, .12)} onClick={e => { e.stopPropagation(); onPick(site.cell); }}>
        <mesh position={[.72, .5, -.52]} rotation={[.09, .4, .18]}><dodecahedronGeometry args={[.68, 0]} /><meshStandardMaterial color="#d3b6a0" roughness={1} flatShading /></mesh>
        <mesh position={[-.79, .31, -.21]}><dodecahedronGeometry args={[.39, 0]} /><meshStandardMaterial color="#b98c73" roughness={1} /></mesh>
        <Ring color={done ? '#a9f6bb' : '#82efdf'} radius={1.55} />
        <mesh position-y={1.76} rotation-y={Math.PI / 4}><octahedronGeometry args={[.38]} /><meshBasicMaterial color={done ? '#c1f8bd' : '#8ff0df'} /></mesh>
      </group>;
    })}
    {waypoints.filter(c => !same(c, state.position)).map((c, i) => <group key={i} position={position(c, .18)}><Ring color="#ffdf94" radius={.87} />
      <mesh position-y={.24}><cylinderGeometry args={[.055, .055, .48, 5]} /><meshBasicMaterial color="#ffe39f" /></mesh>
    </group>)}
    <Vehicle state={state} effect={effect} />
  </Canvas></RenderFallback>;
}

export function HangarScene({ loadout }: { loadout: Loadout }) {
  const spin = useRef(0);
  return <RenderFallback><Canvas orthographic dpr={[1, 1.5]} camera={{ near: .1, far: 50 }}>
    <Camera detail />
    <ambientLight color="#e8dac5" intensity={1.36} />
    <directionalLight color="#fff1d9" intensity={2.38} position={[-3, 7, 5]} />
    <directionalLight color="#a3c9db" intensity={1.41} position={[1, 2, -8]} />
    <mesh position-y={-.11}><cylinderGeometry args={[1.69, 1.83, .21, 40]} /><meshStandardMaterial color="#322b27" roughness={.82} /></mesh>
    <Ring color="#aa7548" radius={1.59} lift={.006} />
    <RoverModel loadout={loadout} spin={spin} asset={ROVER_ASSET} />
  </Canvas></RenderFallback>;
}

