import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Mars3DRover } from './Mars3DRover';
import {
  getTerrainHeight,
  getTerrainSlope,
  getTerrainNormal,
  WORLD_SIZE,
  LANDER_BASE_3D,
  SOLAR_RIDGES_3D,
  INITIAL_SAND_TRAPS_3D,
  INITIAL_SCIENCE_SAMPLES_3D,
  INITIAL_DEBRIS_SITES_3D,
  SandTrap3D,
  ScienceOutcrop3D,
  DebrisSite3D,
} from './terrainMath';
import { ROVER_MODULES } from '../data/roverModules';

export type CameraMode = 'chase' | 'eagle' | 'orbit';

export interface MarsOpenWorldProps {
  equippedModules: {
    wheels: string;
    sensors: string;
    power: string;
    comms: string;
    launcher: string;
  };
  batteryPower: number;
  cameraMode: CameraMode;
  radarPulseRadius: number | null; // active expanding pulse wave
  radarPulseOrigin?: { x: number; y: number; z: number };
  inputMovement: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  sandTraps: SandTrap3D[];
  scienceSamples: ScienceOutcrop3D[];
  debrisSites: DebrisSite3D[];
  isCollectingSample: boolean;
  collectingTargetPos?: { x: number; y: number; z: number } | null;
  isTransmittingComms?: boolean;
  isGarageMode?: boolean;
  onTelemetryUpdate: (data: {
    x: number;
    z: number;
    speedKmH: number;
    headingRad: number;
    terrainType: 'FLAT_ROCK' | 'SAND_TRAP' | 'SOLAR_RIDGE' | 'LANDER_BASE';
    currentDrainPerSec: number;
    isInSolarRidge: boolean;
    isNearLander: boolean;
    nearbySampleId: string | null;
    nearbyDebrisId: string | null;
  }) => void;
  onBatteryDrainDelta: (drain: number) => void;
  onSolarRechargeDelta: (recharge: number) => void;
  onMmrtgRechargeDelta: (recharge: number) => void;
}

// =========================================================================
// DEEP SPACE CANOPY & AUTHENTIC MARTIAN CELESTIAL ENVIRONMENT
// (Stars, Martian Sun, Phobos Moon, Earth "Pale Blue Dot", Crater Rim Mountains)
// =========================================================================
function DeepSpaceCanopy() {
  // 1. Procedural 3D Starfield in deep space overhead
  const { starPositions, starColors } = useMemo(() => {
    const starCount = 2200;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Hemisphere distribution above horizon (Y: 25 to 190, Radius ~180 to 220)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0); // uniform sphere
      const r = 190 + Math.random() * 40;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 25; // keep above horizon
      const z = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color tints: White, cyan-blue, subtle amber stars
      const tint = Math.random();
      if (tint > 0.8) {
        col[i * 3] = 0.75; col[i * 3 + 1] = 0.88; col[i * 3 + 2] = 1.0; // blue star
      } else if (tint > 0.65) {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 0.65; // golden star
      } else {
        col[i * 3] = 0.95; col[i * 3 + 1] = 0.95; col[i * 3 + 2] = 0.95; // white star
      }
    }

    return { starPositions: pos, starColors: col };
  }, []);

  // 2. Horizon Crater Rim Mountain Chain (28 jagged peaks enclosing the crater floor)
  const mountainPeaks = useMemo(() => {
    const peaks = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 145 + Math.sin(i * 3.7) * 18;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const height = 32 + Math.sin(i * 2.3) * 16 + (i % 3) * 10;
      const radius = 22 + Math.cos(i * 1.7) * 8;
      peaks.push({ id: i, x, z, height, radius });
    }
    return peaks;
  }, []);

  return (
    <group>
      {/* A. 3D Stars in Deep Space */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
        />
      </points>

      {/* B. The Pale Blue Dot: Earth as seen from Mars (225 Million km away) */}
      <group position={[110, 95, -135]}>
        <mesh>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
        </mesh>
        <pointLight color="#60a5fa" intensity={2} distance={25} />
      </group>

      {/* C. Phobos (Mars's innermost moon) */}
      <group position={[-85, 82, -125]}>
        {/* Irregular cratered moon geometry */}
        <mesh rotation={[0.4, 0.8, 0.2]}>
          <dodecahedronGeometry args={[5.2, 1]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} metalness={0.1} />
        </mesh>
        {/* Faint moonlit atmospheric glow */}
        <pointLight color="#e7e5e4" intensity={1.5} distance={40} />
      </group>

      {/* D. The Martian Sun (Compact bright disk at 1.52 AU with soft atmospheric corona) */}
      <group position={[80, 110, 65]}>
        {/* Sharp core solar disk */}
        <mesh>
          <sphereGeometry args={[4.2, 24, 24]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>
        {/* Outer Tawny Coronal Glow */}
        <mesh>
          <sphereGeometry args={[8.5, 24, 24]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* E. Distant Crater Rim Mountain Backdrop (Jezero Crater wall) */}
      {mountainPeaks.map(peak => (
        <mesh key={peak.id} position={[peak.x, peak.height * 0.45, peak.z]}>
          <coneGeometry args={[peak.radius, peak.height, 5]} />
          <meshStandardMaterial
            color="#571a08"
            roughness={0.95}
            metalness={0.05}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// PROCEDURAL MARS TERRAIN MESH WITH DISTINCT SULFATE SAND DUNE ZONES
// (Màu cát lún vàng-cam gợn sóng tách biệt hoàn toàn với đá cứng thường)
// =========================================================================
function ProceduralMarsTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry } = useMemo(() => {
    const segments = 130;
    const geom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geom.rotateX(-Math.PI / 2); // Lay horizontal in X-Z plane

    const pos = geom.attributes.position;
    const count = pos.count;
    const colorArr = new Float32Array(count * 3);

    // Bedrock color palette (Đá cứng basalt sẫm màu)
    const bedrockDark = new THREE.Color('#431407');  // Deep canyon rock
    const bedrockMid = new THREE.Color('#7c2d12');   // Standard red bedrock
    const bedrockHigh = new THREE.Color('#9a3412');  // Weathered rocky ridge

    // Sand Trap Dune palette (Cát lún vàng sunfat bột mềm có vân gợn sóng)
    const sandBase = new THREE.Color('#d97706');    // Rich golden sand
    const sandBright = new THREE.Color('#facc15');  // Bright sulfur ripple crest
    const sandShadow = new THREE.Color('#92400e');  // Dark dune ripple trough

    for (let i = 0; i < count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // Check proximity to all 6 Sand Trap dune zones
      let sandTrapFactor = 0;
      for (const trap of INITIAL_SAND_TRAPS_3D) {
        const dist = Math.hypot(vx - trap.x, vz - trap.z);
        if (dist <= trap.radius + 3.5) {
          const factor = Math.max(0, 1 - dist / (trap.radius + 3.5));
          if (factor > sandTrapFactor) sandTrapFactor = factor;
        }
      }

      const finalColor = new THREE.Color();

      if (sandTrapFactor > 0.05) {
        // --- SAND TRAP ZONE: Distinct Golden Sulfate Sand Dunes with Ripples ---
        // Fine transverse ripple waves across the sand
        const ripple = Math.sin(vx * 1.8 + vz * 1.8) * 0.5 + 0.5;
        const duneColor = new THREE.Color().lerpColors(sandShadow, sandBright, ripple);

        // Bedrock at this height
        const elevNorm = (vy + 8) / 16;
        const rockColor = new THREE.Color().lerpColors(bedrockDark, bedrockMid, elevNorm);

        // Blend smoothly into the golden sand dune
        finalColor.lerpColors(rockColor, duneColor, Math.min(1, sandTrapFactor * 1.4));
      } else {
        // --- NORMAL BEDROCK: Dark hard cracked volcanic basalt ---
        const elevNorm = Math.min(1, Math.max(0, (vy + 6) / 14));
        if (elevNorm > 0.5) {
          finalColor.lerpColors(bedrockMid, bedrockHigh, (elevNorm - 0.5) * 2);
        } else {
          finalColor.lerpColors(bedrockDark, bedrockMid, elevNorm * 2);
        }
      }

      colorArr[i * 3] = finalColor.r;
      colorArr[i * 3 + 1] = finalColor.g;
      colorArr[i * 3 + 2] = finalColor.b;
    }

    geom.computeVertexNormals();
    geom.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    return { geometry: geom };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.92}
        metalness={0.08}
        flatShading={false}
      />
    </mesh>
  );
}

// =========================================================================
// 3D WORLD LANDMARKS & PHYSICAL SAND DUNE MESHES
// =========================================================================
function WorldLandmarks({
  sandTraps,
  scienceSamples,
  debrisSites,
}: {
  sandTraps: SandTrap3D[];
  scienceSamples: ScienceOutcrop3D[];
  debrisSites: DebrisSite3D[];
}) {
  return (
    <group>
      {/* 1. Lander Base Outpost (HQ at [0, 0]) */}
      <group position={[LANDER_BASE_3D.x, 0, LANDER_BASE_3D.z]}>
        {/* Landing Pad Pad Ring */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[LANDER_BASE_3D.radius - 1.5, LANDER_BASE_3D.radius, 48]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
        {/* Hexagonal Lander Module */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 3.2, 2.4, 6]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Gold Thermal Blanket Upper Stage */}
        <mesh position={[0, 2.6, 0]} castShadow>
          <coneGeometry args={[1.8, 1.2, 6]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* High-Gain Antenna Mast */}
        <mesh position={[0, 4.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 5.4, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 4.5, 0]} color="#38bdf8" intensity={4} distance={22} />
      </group>

      {/* 2. Solar Energy Ridges */}
      {SOLAR_RIDGES_3D.map(ridge => {
        const ry = getTerrainHeight(ridge.x, ridge.z);
        return (
          <group key={ridge.id} position={[ridge.x, ry, ridge.z]}>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ridge.radius - 2.5, ridge.radius, 32]} />
              <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 12, 0]}>
              <cylinderGeometry args={[ridge.radius * 0.7, ridge.radius * 0.9, 24, 16, 1, true]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.12} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, 6, 0]} color="#fbbf24" intensity={2.5} distance={25} />
          </group>
        );
      })}

      {/* 3. 6 Sand Trap Dune Fields (Physical Golden Dune Ribs & Laser Danger Signs) */}
      {sandTraps.map(trap => {
        const ty = getTerrainHeight(trap.x, trap.z);
        return (
          <group key={trap.id} position={[trap.x, ty, trap.z]}>
            {/* Physical Sand Dune Mound Discs (Always visible so player sees the dune texture) */}
            <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[trap.radius, 32]} />
              <meshStandardMaterial
                color="#d97706"
                roughness={0.98}
                metalness={0.02}
                transparent
                opacity={0.7}
              />
            </mesh>

            {/* Radar-Revealed Holographic Warning Rings */}
            {trap.revealed && (
              <>
                <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[trap.radius - 1.2, trap.radius, 32]} />
                  <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.8} />
                </mesh>
                <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <octahedronGeometry args={[0.9]} />
                  <meshBasicMaterial color="#ef4444" wireframe />
                </mesh>
                <pointLight position={[0, 3.5, 0]} color="#ef4444" intensity={2.5} distance={16} />
              </>
            )}
          </group>
        );
      })}

      {/* 4. Astrobiology Science Rock Outcrops */}
      {scienceSamples.map(sample => {
        const sy = getTerrainHeight(sample.x, sample.z);
        return (
          <group key={sample.id} position={[sample.x, sy, sample.z]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <dodecahedronGeometry args={[0.95]} />
              <meshStandardMaterial
                color={sample.collected ? '#475569' : '#a855f7'}
                emissive={sample.collected ? '#1e293b' : '#c084fc'}
                emissiveIntensity={sample.collected ? 0.1 : 0.8}
                roughness={0.2}
              />
            </mesh>
            {!sample.collected && (
              <>
                <mesh position={[0, 16, 0]}>
                  <cylinderGeometry args={[0.15, 0.25, 32, 8, 1, true]} />
                  <meshBasicMaterial color="#c084fc" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
                <pointLight position={[0, 1.5, 0]} color="#a855f7" intensity={2} distance={8} />
              </>
            )}
          </group>
        );
      })}

      {/* 5. Crashed Spacecraft Debris Sites */}
      {debrisSites.map(debris => {
        const dy = getTerrainHeight(debris.x, debris.z);
        return (
          <group key={debris.id} position={[debris.x, dy, debris.z]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <torusGeometry args={[0.85, 0.25, 8, 12]} />
              <meshStandardMaterial
                color={debris.salvaged ? '#334155' : '#34d399'}
                emissive={debris.salvaged ? '#0f172a' : '#10b981'}
                emissiveIntensity={debris.salvaged ? 0.1 : 0.7}
                metalness={0.9}
              />
            </mesh>
            {!debris.salvaged && (
              <>
                <mesh position={[0, 16, 0]}>
                  <cylinderGeometry args={[0.15, 0.25, 32, 8, 1, true]} />
                  <meshBasicMaterial color="#34d399" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                <pointLight position={[0, 1.2, 0]} color="#10b981" intensity={2} distance={8} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

// =========================================================================
// 3D EXPANDING RADAR PULSE WAVE (Tỏa ra trực tiếp từ vị trí xe Rover)
// =========================================================================
function RadarPulseWave({
  pulseRadius,
  roverX,
  roverZ,
  roverY,
}: {
  pulseRadius: number | null;
  roverX: number;
  roverZ: number;
  roverY: number;
}) {
  if (pulseRadius === null || pulseRadius <= 0) return null;

  return (
    <mesh position={[roverX, roverY + 0.35, roverZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Math.max(0.1, pulseRadius - 1.8), pulseRadius, 48]} />
      <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
    </mesh>
  );
}

// =========================================================================
// MARTIAN WHEEL DUST SYSTEM (Bụi đỏ Sao Hỏa bay lên từ 6 bánh xe)
// =========================================================================
const DUST_PARTICLE_COUNT = 32;

interface DustItem {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  baseSize: number;
  active: boolean;
}

function WheelDustParticles({
  roverPos,
  heading,
  speed,
  inSandTrap,
  isSlim,
}: {
  roverPos: { x: number; y: number; z: number };
  heading: number;
  speed: number;
  inSandTrap: boolean;
  isSlim: boolean;
}) {
  const itemsRef = useRef<DustItem[]>(
    Array.from({ length: DUST_PARTICLE_COUNT }, () => ({
      x: 0,
      y: -100,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 1,
      baseSize: 0.15,
      active: false,
    }))
  );
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const emitIndexRef = useRef(0);
  const emitTimerRef = useRef(0);

  // 6 wheel local offsets [lx, lz]
  const wheelOffsets = [
    [-0.95, 0.85],
    [0.95, 0.85],
    [-1.02, 0.0],
    [1.02, 0.0],
    [-0.95, -0.85],
    [0.95, -0.85],
  ];

  useFrame((_, delta) => {
    const isMoving = Math.abs(speed) > 0.4;
    emitTimerRef.current += delta;

    const emitInterval = inSandTrap ? 0.035 : 0.07;

    if (isMoving && emitTimerRef.current >= emitInterval) {
      emitTimerRef.current = 0;
      const cosH = Math.cos(heading);
      const sinH = Math.sin(heading);
      const moveSign = speed >= 0 ? 1 : -1;
      const backwardSpeed = -moveSign * Math.abs(speed) * 0.35;

      const wheelsToEmit = inSandTrap ? wheelOffsets : [wheelOffsets[2], wheelOffsets[3], wheelOffsets[4], wheelOffsets[5]];

      for (const [lx, lz] of wheelsToEmit) {
        const idx = emitIndexRef.current;
        emitIndexRef.current = (emitIndexRef.current + 1) % DUST_PARTICLE_COUNT;

        const wx = roverPos.x + (lx * cosH + lz * sinH) + (Math.random() - 0.5) * 0.15;
        const wz = roverPos.z + (-lx * sinH + lz * cosH) + (Math.random() - 0.5) * 0.15;
        const wy = getTerrainHeight(wx, wz) + 0.06;

        const p = itemsRef.current[idx];
        p.x = wx;
        p.y = wy;
        p.z = wz;
        p.vx = sinH * backwardSpeed + (Math.random() - 0.5) * (inSandTrap ? 0.9 : 0.4);
        p.vy = Math.random() * (inSandTrap ? 1.0 : 0.5) + 0.25;
        p.vz = cosH * backwardSpeed + (Math.random() - 0.5) * (inSandTrap ? 0.9 : 0.4);
        p.life = 0;
        p.maxLife = inSandTrap ? 1.1 : 0.75;
        p.baseSize = (Math.random() * 0.12 + 0.1) * (inSandTrap ? 1.8 : 1.0);
        p.active = true;
      }
    }

    // Update particles
    for (let i = 0; i < DUST_PARTICLE_COUNT; i++) {
      const p = itemsRef.current[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      if (!p.active) {
        mesh.visible = false;
        continue;
      }

      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        mesh.visible = false;
        continue;
      }

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 0.14 * delta; // low Martian gravity (0.38g)

      const progress = p.life / p.maxLife;
      const s = p.baseSize * (1 + progress * 3.4);

      mesh.visible = true;
      mesh.position.set(p.x, p.y, p.z);
      mesh.scale.set(s, s, s);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.65 * (1 - progress));
      }
    }
  });

  return (
    <group>
      {Array.from({ length: DUST_PARTICLE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el; }}
          visible={false}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial
            color={inSandTrap ? '#9a3412' : '#ea580c'}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 3D SUPERCAM SCIENCE DRILL LASER BEAM
// =========================================================================
function ScienceLaserBeam({
  start,
  target,
}: {
  start: [number, number, number];
  target: [number, number, number];
}) {
  const laserMeshRef = useRef<THREE.Group>(null);
  const sparkGroupRef = useRef<THREE.Group>(null);

  const dx = target[0] - start[0];
  const dy = target[1] - start[1];
  const dz = target[2] - start[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const mid: [number, number, number] = [
    (start[0] + target[0]) / 2,
    (start[1] + target[1]) / 2,
    (start[2] + target[2]) / 2,
  ];

  useFrame(({ clock }) => {
    if (laserMeshRef.current) {
      laserMeshRef.current.lookAt(target[0], target[1], target[2]);
    }
    if (sparkGroupRef.current) {
      sparkGroupRef.current.rotation.z += 0.4;
      sparkGroupRef.current.rotation.x += 0.3;
      const s = 1 + Math.sin(clock.getElapsedTime() * 32) * 0.25;
      sparkGroupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <group position={mid} ref={laserMeshRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, dist, 8]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, dist, 8]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group position={target}>
        <mesh>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color="#fecdd3" />
        </mesh>
        <pointLight color="#f43f5e" intensity={9} distance={8} />

        <group ref={sparkGroupRef}>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.02, 0.02, 0.65]} />
            <meshBasicMaterial color="#fda4af" />
          </mesh>
          <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
            <boxGeometry args={[0.02, 0.02, 0.55]} />
            <meshBasicMaterial color="#fda4af" />
          </mesh>
          <mesh rotation={[Math.PI / 4, -Math.PI / 3, 0]}>
            <boxGeometry args={[0.02, 0.02, 0.6]} />
            <meshBasicMaterial color="#fda4af" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// VEHICLE CONTROLLER & RIGID SURFACE TANGENT PHYSICS (Runs in useFrame)
// =========================================================================
function RoverSimulationRig({
  equippedModules,
  batteryPower,
  cameraMode,
  radarPulseRadius,
  radarPulseOrigin,
  inputMovement,
  sandTraps,
  scienceSamples,
  debrisSites,
  isCollectingSample,
  collectingTargetPos,
  isTransmittingComms = false,
  isGarageMode = false,
  onTelemetryUpdate,
  onBatteryDrainDelta,
  onSolarRechargeDelta,
  onMmrtgRechargeDelta,
}: MarsOpenWorldProps) {
  // Vehicle state
  const roverPosRef = useRef({ x: 0, y: 0, z: 0 });
  const headingRef = useRef(0); // Yaw in radians (0 means facing +Z)
  const currentSpeedRef = useRef(0);
  const wheelSpinRef = useRef(0);
  const steerAngleRef = useRef(0);
  const inSandTrapRef = useRef(false);
  const garageOrbitAngleRef = useRef(0);

  // 3D group ref for smooth quaternion slope rotation
  const roverGroupRef = useRef<THREE.Group>(null);

  const wheelsType = equippedModules.wheels || 'slim_aluminum';
  const powerType = equippedModules.power || 'solar_array';
  const isSlim = wheelsType === 'slim_aluminum';
  const isWide = wheelsType === 'wide_titan';

  // Tick physics loop
  useFrame(({ camera }, delta) => {
    const rx = roverPosRef.current.x;
    const rz = roverPosRef.current.z;

    // 1. Detect if rover is in any Sand Trap
    let inSandTrap = false;
    for (const trap of sandTraps) {
      const dx = rx - trap.x;
      const dz = rz - trap.z;
      if (Math.hypot(dx, dz) <= trap.radius) {
        inSandTrap = true;
        break;
      }
    }
    inSandTrapRef.current = inSandTrap;

    // 2. Detect if rover is in any Solar Ridge
    let inSolarRidge = false;
    for (const ridge of SOLAR_RIDGES_3D) {
      const dx = rx - ridge.x;
      const dz = rz - ridge.z;
      if (Math.hypot(dx, dz) <= ridge.radius) {
        inSolarRidge = true;
        break;
      }
    }

    // 3. Detect if rover is near Lander Base
    const distToLander = Math.hypot(rx, rz);
    const isNearLander = distToLander <= LANDER_BASE_3D.radius;

    // 4. Calculate terrain slope normal for gravity physics
    const [normX, normY, normZ] = getTerrainNormal(rx, rz);
    const surfaceNormal = new THREE.Vector3(normX, normY, normZ);

    // Forward direction in horizontal plane (+Z when heading = 0)
    const horizForward = new THREE.Vector3(Math.sin(headingRef.current), 0, Math.cos(headingRef.current));

    // Slope component along vehicle forward direction
    // (dot product: > 0 means driving uphill, < 0 means driving downhill)
    const forwardSlope = horizForward.dot(new THREE.Vector3(-normX, 0, -normZ));

    // 5. Calculate terrain speeds and power drains according to trade-off matrix
    let maxSpeed = 14.0; // m/s
    let drainPerSec = 0.35; // ⚡/s

    if (isSlim) {
      if (inSandTrap) {
        maxSpeed = 2.2; // bogged down in sand!
        drainPerSec = 4.2;
      } else {
        maxSpeed = 14.0;
        drainPerSec = 0.35;
      }
    } else if (isWide) {
      if (inSandTrap) {
        maxSpeed = 8.5; // glides through sand
        drainPerSec = 0.85;
      } else {
        maxSpeed = 9.5; // rolling resistance on flat rock
        drainPerSec = 1.15;
      }
    } else {
      // adaptive_sma
      if (inSandTrap) {
        maxSpeed = 9.0;
        drainPerSec = 0.95;
      } else {
        maxSpeed = 11.5;
        drainPerSec = 0.55;
      }
    }

    // Hill climb / downhill gravity physics modifier
    if (forwardSlope > 0.05) {
      // Uphill: gravity opposes motion
      const climbResistance = isSlim ? 2.2 : 1.2;
      maxSpeed = Math.max(1.8, maxSpeed * (1 - forwardSlope * climbResistance));
      drainPerSec *= (1 + forwardSlope * 1.5);
    } else if (forwardSlope < -0.05) {
      // Downhill: gravity assists
      maxSpeed *= (1 - forwardSlope * 0.4);
    }

    // If battery is 0, rover is dead
    const isDead = batteryPower <= 0;
    if (isDead) {
      maxSpeed = 0;
    }

    // 6. Process Driving Inputs
    let throttle = 0;
    if (inputMovement.forward) throttle += 1;
    if (inputMovement.backward) throttle -= 1;

    let targetSpeed = throttle * maxSpeed;
    if (throttle < 0) targetSpeed *= 0.5; // Reverse is half speed

    // Smooth acceleration / deceleration
    currentSpeedRef.current = THREE.MathUtils.lerp(
      currentSpeedRef.current,
      targetSpeed,
      delta * (throttle !== 0 ? 3.2 : 5.5)
    );

    // Steering
    let steerInput = 0;
    if (inputMovement.left) steerInput += 1;
    if (inputMovement.right) steerInput -= 1;

    const targetSteerAngle = steerInput * 0.45; // ~26 degrees
    steerAngleRef.current = THREE.MathUtils.lerp(steerAngleRef.current, targetSteerAngle, delta * 8);

    // Turn vehicle yaw
    if (Math.abs(currentSpeedRef.current) > 0.05) {
      const turnMultiplier = currentSpeedRef.current > 0 ? 1 : -1;
      headingRef.current += steerInput * 1.6 * delta * turnMultiplier;
    }

    // 7. Update Vehicle Coordinates
    const moveDist = currentSpeedRef.current * delta;
    roverPosRef.current.x += Math.sin(headingRef.current) * moveDist;
    roverPosRef.current.z += Math.cos(headingRef.current) * moveDist;

    // Boundary clamp
    const halfSize = (WORLD_SIZE / 2) - 6;
    roverPosRef.current.x = THREE.MathUtils.clamp(roverPosRef.current.x, -halfSize, halfSize);
    roverPosRef.current.z = THREE.MathUtils.clamp(roverPosRef.current.z, -halfSize, halfSize);
    roverPosRef.current.y = getTerrainHeight(roverPosRef.current.x, roverPosRef.current.z);

    // Wheel spin
    wheelSpinRef.current += (moveDist / 0.35) * 1.5;

    // 8. FLAWLESS 3D SURFACE TANGENT ORIENTATION MATRIX
    // Project horizontal forward onto terrain slope tangent plane
    const forwardTangent = horizForward.clone().sub(surfaceNormal.clone().multiplyScalar(horizForward.dot(surfaceNormal))).normalize();
    const rightTangent = new THREE.Vector3().crossVectors(surfaceNormal, forwardTangent).normalize();
    const finalForward = new THREE.Vector3().crossVectors(rightTangent, surfaceNormal).normalize();

    // Construct orthonormal basis matrix: [+X=Right, +Y=Normal Up, +Z=Forward]
    const rotMatrix = new THREE.Matrix4().makeBasis(rightTangent, surfaceNormal, finalForward);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

    if (roverGroupRef.current) {
      roverGroupRef.current.quaternion.slerp(targetQuat, delta * 12);
    }

    // 9. Battery Drain & Recharge Mechanics
    if (Math.abs(currentSpeedRef.current) > 0.2) {
      onBatteryDrainDelta(drainPerSec * delta);
    }

    if (powerType === 'mmrtg') {
      onMmrtgRechargeDelta(0.8 * delta);
    }

    if (inSolarRidge && powerType === 'solar_array') {
      onSolarRechargeDelta(15.0 * delta);
    }

    // 10. Check Proximity to Science Samples and Debris
    let nearbySampleId: string | null = null;
    for (const s of scienceSamples) {
      if (!s.collected) {
        const dx = roverPosRef.current.x - s.x;
        const dz = roverPosRef.current.z - s.z;
        if (Math.hypot(dx, dz) <= 4.5) {
          nearbySampleId = s.id;
          break;
        }
      }
    }

    let nearbyDebrisId: string | null = null;
    for (const d of debrisSites) {
      if (!d.salvaged) {
        const dx = roverPosRef.current.x - d.x;
        const dz = roverPosRef.current.z - d.z;
        if (Math.hypot(dx, dz) <= 4.5) {
          nearbyDebrisId = d.id;
          break;
        }
      }
    }

    // 11. Camera Tracking
    const ry = roverPosRef.current.y;
    const head = headingRef.current;

    if (isGarageMode) {
      // 3D GARAGE SHOWCASE INSPECT CAM (Zoom cận cảnh 3.6m & quay vòng quanh xe ngắm phụ kiện)
      garageOrbitAngleRef.current += delta * 0.45;
      const orbitAngle = head + Math.PI * 0.35 + garageOrbitAngleRef.current;
      const garageDist = 3.6;
      const garageHeight = 1.35;

      const camTargetX = roverPosRef.current.x + Math.cos(orbitAngle) * garageDist;
      const camTargetZ = roverPosRef.current.z + Math.sin(orbitAngle) * garageDist;
      const camTargetY = ry + garageHeight;

      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 4.0);
      camera.lookAt(roverPosRef.current.x, ry + 0.55, roverPosRef.current.z);
    } else if (cameraMode === 'chase') {
      // 3rd Person Behind-the-Rover Chase Cam
      const distBehind = 7.5;
      const heightAbove = 3.6;
      const camTargetX = roverPosRef.current.x - Math.sin(head) * distBehind;
      const camTargetZ = roverPosRef.current.z - Math.cos(head) * distBehind;
      const camTargetY = ry + heightAbove;

      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 4.5);
      camera.lookAt(roverPosRef.current.x, ry + 1.2, roverPosRef.current.z);
    } else if (cameraMode === 'eagle') {
      // High-angle Tactical Eagle Cam
      const camTargetX = roverPosRef.current.x;
      const camTargetZ = roverPosRef.current.z - 16;
      const camTargetY = ry + 32;
      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 3.5);
      camera.lookAt(roverPosRef.current.x, ry, roverPosRef.current.z);
    } else {
      // Orbit Cam
      const camTargetX = roverPosRef.current.x + 8;
      const camTargetZ = roverPosRef.current.z + 8;
      const camTargetY = ry + 6;
      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 3);
      camera.lookAt(roverPosRef.current.x, ry + 1, roverPosRef.current.z);
    }

    // 12. Emit Telemetry to UI HUD
    onTelemetryUpdate({
      x: Math.round(roverPosRef.current.x * 10) / 10,
      z: Math.round(roverPosRef.current.z * 10) / 10,
      speedKmH: Math.round(Math.abs(currentSpeedRef.current) * 3.6),
      headingRad: head,
      terrainType: isNearLander ? 'LANDER_BASE' : inSolarRidge ? 'SOLAR_RIDGE' : inSandTrap ? 'SAND_TRAP' : 'FLAT_ROCK',
      currentDrainPerSec: Math.abs(currentSpeedRef.current) > 0.2 ? Math.round(drainPerSec * 10) / 10 : 0,
      isInSolarRidge: inSolarRidge,
      isNearLander,
      nearbySampleId,
      nearbyDebrisId,
    });
  });

  const isStuckInSand = inSandTrapRef.current && isSlim;
  const head = headingRef.current;

  // Mast head coordinates in world space for SuperCam laser
  const mastWorldX = roverPosRef.current.x + Math.cos(head) * 0.32 + Math.sin(head) * 0.65;
  const mastWorldY = roverPosRef.current.y + (isStuckInSand ? 1.30 : 1.45);
  const mastWorldZ = roverPosRef.current.z - Math.sin(head) * 0.32 + Math.cos(head) * 0.65;

  return (
    <>
      {/* Dynamic 3D Rover Model aligned to terrain surface normal */}
      <group
        ref={roverGroupRef}
        position={[roverPosRef.current.x, roverPosRef.current.y, roverPosRef.current.z]}
      >
        <Mars3DRover
          wheelsType={equippedModules.wheels}
          powerType={equippedModules.power}
          sensorsType={equippedModules.sensors}
          commsType={equippedModules.comms}
          steerAngle={steerAngleRef.current}
          wheelRotation={wheelSpinRef.current}
          isCollecting={isCollectingSample}
          isStuckInSand={isStuckInSand}
          isTransmitting={isTransmittingComms}
        />
      </group>

      {/* Wheel Dust Cloud Particles */}
      <WheelDustParticles
        roverPos={roverPosRef.current}
        heading={head}
        speed={currentSpeedRef.current}
        inSandTrap={inSandTrapRef.current}
        isSlim={isSlim}
      />

      {/* 3D Science SuperCam Drill Laser Beam */}
      {isCollectingSample && collectingTargetPos && (
        <ScienceLaserBeam
          start={[mastWorldX, mastWorldY, mastWorldZ]}
          target={[collectingTargetPos.x, collectingTargetPos.y + 0.45, collectingTargetPos.z]}
        />
      )}
    </>
  );
}

// =========================================================================
// MAIN OPEN-WORLD CANVAS CONTAINER
// =========================================================================
export function MarsOpenWorld(props: MarsOpenWorldProps) {
  const pulseOriginX = props.radarPulseOrigin ? props.radarPulseOrigin.x : 0;
  const pulseOriginY = props.radarPulseOrigin ? props.radarPulseOrigin.y : 0;
  const pulseOriginZ = props.radarPulseOrigin ? props.radarPulseOrigin.z : 0;

  return (
    <div className="mars-3d-open-world-canvas-wrap">
      <Canvas
        shadows
        camera={{ position: [0, 8, -12], fov: 62, near: 0.1, far: 600 }}
      >
        {/* Martian Twilight Atmosphere Background */}
        <color attach="background" args={['#0e090a']} />
        <fog attach="fog" args={['#1a0f0a', 38, 210]} />

        {/* Dynamic Mars Sun Lighting */}
        <ambientLight intensity={0.95} color="#fed7aa" />
        <directionalLight
          position={[80, 110, 65]}
          intensity={2.9}
          color="#fef08a"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={280}
          shadow-camera-left={-65}
          shadow-camera-right={65}
          shadow-camera-top={65}
          shadow-camera-bottom={-65}
        />

        {/* Deep Space Canopy (Stars, Earth Pale Blue Dot, Moon Phobos, Sun, Mountain Rim) */}
        <DeepSpaceCanopy />

        {/* Mars Procedural 3D Terrain with Distinct Golden Sulfate Sand Dunes */}
        <ProceduralMarsTerrain />

        {/* 3D Landmarks & Sand Dunes */}
        <WorldLandmarks
          sandTraps={props.sandTraps}
          scienceSamples={props.scienceSamples}
          debrisSites={props.debrisSites}
        />

        {/* Expanding Holographic Radar Pulse Wave Centered on Rover Position */}
        <RadarPulseWave
          pulseRadius={props.radarPulseRadius}
          roverX={pulseOriginX}
          roverY={pulseOriginY}
          roverZ={pulseOriginZ}
        />

        {/* Vehicle Simulation Rig with Orthonormal Slope Physics */}
        <RoverSimulationRig {...props} />
      </Canvas>
    </div>
  );
}
