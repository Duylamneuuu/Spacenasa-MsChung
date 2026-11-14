import { Component, memo, Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Group, Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { Loadout, WheelId } from '../types/expedition';

export type RoverAsset = { url: string; scale?: number; yaw?: number; lift?: number };
type Spin = { current: number };
const SLOT_NAMES = ['Wheel_FL', 'Wheel_FR', 'Wheel_ML', 'Wheel_MR', 'Wheel_RL', 'Wheel_RR'];
const attachmentNames = ['Scanner_Mount', 'Instrument_Mount', 'Solar_Mount'] as const;
const proceduralSlots = SLOT_NAMES.map((_, i) => [(i % 2 ? 1 : -1) * .98, 0, .87 - Math.floor(i / 2) * .87] as const);
const wheelSpec = {
  light: { radius: .31, width: .16, rim: '#c8c2ad', tread: '#393536', teeth: 8 },
  wide: { radius: .34, width: .39, rim: '#d9ab61', tread: '#29272a', teeth: 12 },
  reinforced: { radius: .35, width: .26, rim: '#d89361', tread: '#4d4d56', teeth: 10 },
};
type Pos = [number, number, number];

const Box = memo(function Box({ at, size, color }: { at: Pos; size: Pos; color: string }) {
  return <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.76} /></mesh>;
});

const Wheel = memo(function Wheel({ wheel, at, spin, fixedHeight = false }: { wheel: WheelId; at: readonly [number, number, number]; spin: Spin; fixedHeight?: boolean }) {
  const ref = useRef<Group>(null);
  const { radius, width, rim, tread, teeth } = wheelSpec[wheel];
  useFrame(() => { if (ref.current) ref.current.rotation.x = spin.current / radius; });
  return <group position={[at[0], at[1] + (fixedHeight ? 0 : radius), at[2]]}>
    <group ref={ref}>
      <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[radius, radius, width, 12]} /><meshStandardMaterial color={tread} roughness={.88} /></mesh>
      <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[radius * .65, radius * .65, width + .022, 8]} /><meshStandardMaterial color={rim} metalness={.25} roughness={.55} /></mesh>
      {Array.from({ length: teeth }, (_, i) => <group key={i} rotation-x={i / teeth * Math.PI * 2}>
        <Box at={[0, radius, 0]} size={[width * .84, .035, .075]} color={wheel === 'reinforced' ? rim : '#6c5d54'} />
      </group>)}
    </group>
  </group>;
});

const Attachment = memo(function Attachment({ name, loadout }: { name: typeof attachmentNames[number]; loadout: Loadout }) {
  if (name === 'Scanner_Mount') return !loadout.scanner ? null : <>
    <Box at={[0, .34, 0]} size={[.11, .73, .11]} color="#c5ad84" />
    <Box at={[0, .70, 0]} size={[loadout.scanner === 'stereo' ? .63 : .39, .19, .22]} color="#ded8c3" />
    <Box at={[0, .70, .12]} size={[.29, .085, .02]} color="#355665" />
  </>;
  if (name === 'Instrument_Mount') return !loadout.instrument ? null : <>
    <Box at={[0, 0, .10]} size={[.19, .19, .44]} color="#bebcb2" />
    <Box at={[0, -.16, .31]} size={[.12, .32, .13]} color={loadout.instrument === 'spectral' ? '#85d5db' : '#d68e4d'} />
  </>;
  return <group>
    <Box at={[0, 0, 0]} size={[2.09, .062, .93]} color="#8f7358" />
    {[-1, 1].flatMap(side => [0, 1, 2, 3].map((i) => <Box key={`${side}-${i}`} at={[side * (.15 + i * .245), .039, 0]} size={[.224, .019, .87]} color={i % 2 ? '#283944' : '#324b5a'} />))}
  </group>;
});

const Procedural = memo(function Procedural({ loadout, spin }: { loadout: Loadout; spin: Spin }) {
  return <group>
    <Box at={[0, .62, -.03]} size={[1.49, .44, 1.91]} color="#e2d4b8" />
    <Box at={[0, .42, -.03]} size={[1.34, .24, 1.80]} color="#6e665d" />
    <Box at={[0, .87, .21]} size={[1.43, .1, .66]} color="#b96c36" />
    <Box at={[0, .64, .93]} size={[1.46, .18, .13]} color="#d99f60" />
    <Box at={[0, .68, 1.01]} size={[.88, .057, .028]} color="#42616a" />
    {[-1, 1].map(side => <group key={side}>
      <Box at={[side * .83, .4, 0]} size={[.21, .13, 1.78]} color="#9b8c76" />
      <Box at={[side * .75, .57, -.44]} size={[.07, .23, .62]} color="#4e4947" />
    </group>)}
    {proceduralSlots.map((at, i) => <Wheel key={i} at={at} wheel={loadout.wheel} spin={spin} />)}
    <group position={[.28, .90, .54]}><Attachment name="Scanner_Mount" loadout={loadout} /></group>
    <group position={[-.47, .52, .92]}><Attachment name="Instrument_Mount" loadout={loadout} /></group>
    <group position={[0, .89, -.47]}><Attachment name="Solar_Mount" loadout={loadout} /></group>
    <mesh position={[-.42, 1.05, -.79]}><cylinderGeometry args={[.022, .022, .47, 7]} /><meshStandardMaterial color="#ded8c3" /></mesh>
  </group>;
});

class AssetBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Mount({ node, children }: { node: Object3D; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    node.add(mount);
    return () => { node.remove(mount); };
  }, [node]);
  return <group ref={ref}>{children}</group>;
}

function Imported({ asset, loadout, spin }: { asset: RoverAsset; loadout: Loadout; spin: Spin }) {
  const source = useLoader(GLTFLoader, asset.url);
  const model = useMemo(() => clone(source.scene), [source.scene]);
  return <group scale={asset.scale ?? 1} rotation-y={asset.yaw ?? 0} position-y={asset.lift ?? 0}>
    <primitive object={model} />
    {SLOT_NAMES.map(name => {
      const node = model.getObjectByName(name);
      return node && <Mount key={name} node={node}><Wheel wheel={loadout.wheel} at={[0, 0, 0]} spin={spin} fixedHeight /></Mount>;
    })}
    {attachmentNames.map(name => {
      const node = model.getObjectByName(name);
      return node && <Mount key={name} node={node}><Attachment name={name} loadout={loadout} /></Mount>;
    })}
  </group>;
}

export const RoverModel = memo(function RoverModel({ loadout, spin, asset }: { loadout: Loadout; spin: Spin; asset?: RoverAsset }) {
  const fallback = <Procedural loadout={loadout} spin={spin} />;
  if (!asset) return fallback;
  return <AssetBoundary key={asset.url} fallback={fallback}>
    <Suspense fallback={fallback}><Imported asset={asset} loadout={loadout} spin={spin} /></Suspense>
  </AssetBoundary>;
});

