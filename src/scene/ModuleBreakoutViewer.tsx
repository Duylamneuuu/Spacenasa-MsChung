import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import {
  SlimAluminumWheel,
  WideTitanWheel,
  AdaptiveSMAWheel,
  NavCamSensor,
  RimfaxGprSensor,
  SolarPanelsPower,
  MmrtgNuclearPower,
  UhfAntennaComms,
  HighGainDishComms,
} from './Mars3DRover';

interface ModuleBreakoutViewerProps {
  moduleId: string;
  name: string;
}

function RotatingModuleRig({ moduleId }: { moduleId: string }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.75;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. WHEELS */}
      {moduleId === 'slim_aluminum' && (
        <group scale={[2.2, 2.2, 2.2]}>
          <SlimAluminumWheel />
        </group>
      )}
      {moduleId === 'wide_titan' && (
        <group scale={[1.8, 1.8, 1.8]}>
          <WideTitanWheel />
        </group>
      )}
      {moduleId === 'adaptive_sma' && (
        <group scale={[2.0, 2.0, 2.0]}>
          <AdaptiveSMAWheel />
        </group>
      )}

      {/* 2. SENSORS & RADAR */}
      {moduleId === 'navcam' && (
        <group position={[-0.55, -0.95, -0.95]} scale={[1.6, 1.6, 1.6]}>
          <NavCamSensor />
        </group>
      )}
      {moduleId === 'rimfax_gpr' && (
        <group position={[-0.55, -0.85, -0.95]} scale={[1.6, 1.6, 1.6]}>
          <RimfaxGprSensor />
        </group>
      )}

      {/* 3. POWER SOURCES */}
      {moduleId === 'solar_array' && (
        <group position={[0, -0.3, 0]} scale={[1.2, 1.2, 1.2]}>
          <SolarPanelsPower />
        </group>
      )}
      {moduleId === 'mmrtg' && (
        <group position={[0, -0.2, 1.0]} scale={[1.6, 1.6, 1.6]}>
          <MmrtgNuclearPower />
        </group>
      )}

      {/* 4. COMMS */}
      {moduleId === 'uhf_antenna' && (
        <group position={[0.65, -0.95, 0.65]} scale={[1.6, 1.6, 1.6]}>
          <UhfAntennaComms />
        </group>
      )}
      {moduleId === 'high_gain_dish' && (
        <group position={[0.55, -0.75, 0.48]} scale={[1.5, 1.5, 1.5]}>
          <HighGainDishComms />
        </group>
      )}
    </group>
  );
}

export function ModuleBreakoutViewer({ moduleId, name }: ModuleBreakoutViewerProps) {
  return (
    <div
      className="module-3d-breakout-card"
      style={{
        width: '100%',
        height: '140px',
        position: 'relative',
        background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        marginBottom: '10px',
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [4, 3.5, 4], zoom: 45, near: 0.1, far: 50 }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -4]} intensity={0.6} color="#38bdf8" />

        {/* Small holographic pedestal ring underneath */}
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.35, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>

        <RotatingModuleRig moduleId={moduleId} />
      </Canvas>

      <span
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '0.62rem',
          color: '#38bdf8',
          letterSpacing: '0.05em',
          fontWeight: 700,
          pointerEvents: 'none',
          textTransform: 'uppercase',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        3D BREAKOUT · {name.split(' ')[0]}
      </span>
    </div>
  );
}
