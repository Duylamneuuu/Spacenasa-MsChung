import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Mars3DRover } from './Mars3DRover';
import {
  getTerrainHeight,
  getTerrainSlope,
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

interface MarsOpenWorldProps {
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
  inputMovement: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  sandTraps: SandTrap3D[];
  scienceSamples: ScienceOutcrop3D[];
  debrisSites: DebrisSite3D[];
  isCollectingSample: boolean;
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
// PROCEDURAL MARS TERRAIN MESH COMPONENT
// =========================================================================
function ProceduralMarsTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const segments = 120;
    const geom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geom.rotateX(-Math.PI / 2); // Lay horizontal in X-Z plane

    const pos = geom.attributes.position;
    const count = pos.count;
    const colorArr = new Float32Array(count * 3);

    const baseColor = new THREE.Color('#9a3412'); // Rich Martian Rust
    const highColor = new THREE.Color('#c2410c'); // Lighter Orange-Brown Ridge
    const lowColor = new THREE.Color('#431407');  // Darker Canyon Shadows

    for (let i = 0; i < count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // Color variation based on elevation and subtle noise
      const elevNorm = (vy + 8) / 16;
      const c = new THREE.Color();
      if (elevNorm > 0.5) {
        c.lerpColors(baseColor, highColor, (elevNorm - 0.5) * 2);
      } else {
        c.lerpColors(lowColor, baseColor, elevNorm * 2);
      }

      colorArr[i * 3] = c.r;
      colorArr[i * 3 + 1] = c.g;
      colorArr[i * 3 + 2] = c.b;
    }

    geom.computeVertexNormals();
    geom.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    return { geometry: geom, colors: colorArr };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.15} />
    </mesh>
  );
}

// =========================================================================
// WORLD LANDMARK OBJECTS (LANDER, RIDGES, SAND TRAPS, SAMPLES, DEBRIS)
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
      {/* 1. Central Lander Base Station at (0, 0) */}
      <group position={[0, 0, 0]}>
        {/* Glowing Touchdown Depot Hologram Ring */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7.2, 8.5, 36]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
        {/* Lander Main Body */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[1.8, 2.6, 2.2, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Gold Heatshield Base */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[2.8, 3.2, 0.6, 8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Lander Radio Mast & Beacon */}
        <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.35, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 4.5, 0]} color="#38bdf8" intensity={3} distance={20} />
      </group>

      {/* 2. 4 Solar Ridges with Sunbeams */}
      {SOLAR_RIDGES_3D.map(ridge => {
        const ry = getTerrainHeight(ridge.x, ridge.z);
        return (
          <group key={ridge.id} position={[ridge.x, ry, ridge.z]}>
            {/* Ground Solar Energy Ring */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ridge.radius - 2.5, ridge.radius, 32]} />
              <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            {/* Vertical Sunbeam Cylinder */}
            <mesh position={[0, 12, 0]}>
              <cylinderGeometry args={[ridge.radius * 0.7, ridge.radius * 0.9, 24, 16, 1, true]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.12} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, 6, 0]} color="#fbbf24" intensity={2.5} distance={25} />
          </group>
        );
      })}

      {/* 3. 6 Sand Trap Zones (Red Laser Ring & Warning Sign when revealed by GPR) */}
      {sandTraps.map(trap => {
        if (!trap.revealed) return null;
        const ty = getTerrainHeight(trap.x, trap.z);
        return (
          <group key={trap.id} position={[trap.x, ty, trap.z]}>
            {/* Laser Boundary Ring */}
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[trap.radius - 1.2, trap.radius, 32]} />
              <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>
            {/* Floating Hologram Diamond Sign */}
            <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]}>
              <octahedronGeometry args={[0.9]} />
              <meshBasicMaterial color="#ef4444" wireframe />
            </mesh>
            <pointLight position={[0, 3.5, 0]} color="#ef4444" intensity={2} distance={15} />
          </group>
        );
      })}

      {/* 4. Astrobiology Science Rock Outcrops */}
      {scienceSamples.map(sample => {
        const sy = getTerrainHeight(sample.x, sample.z);
        return (
          <group key={sample.id} position={[sample.x, sy, sample.z]}>
            {/* Crystal Rock Formation */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <dodecahedronGeometry args={[0.95]} />
              <meshStandardMaterial
                color={sample.collected ? '#475569' : '#a855f7'}
                emissive={sample.collected ? '#1e293b' : '#c084fc'}
                emissiveIntensity={sample.collected ? 0.1 : 0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Vertical Waypoint Pillar Light into Sky if not collected */}
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
            {/* Salvageable Titanium Debris Chunk */}
            <mesh position={[0, 0.45, 0]} rotation={[0.4, 0.6, 0.2]} castShadow>
              <boxGeometry args={[1.5, 0.35, 1.2]} />
              <meshStandardMaterial
                color={debris.salvaged ? '#334155' : '#10b981'}
                emissive={debris.salvaged ? '#0f172a' : '#34d399'}
                emissiveIntensity={debris.salvaged ? 0.1 : 0.7}
                metalness={0.9}
              />
            </mesh>
            {/* Orange Waypoint Pillar into Sky if not salvaged */}
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
// 3D EXPANDING RADAR PULSE WAVE
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
    <mesh position={[roverX, roverY + 0.3, roverZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Math.max(0.1, pulseRadius - 1.5), pulseRadius, 48]} />
      <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.75} />
    </mesh>
  );
}

// =========================================================================
// SIMULATION & VEHICLE CONTROLLER COMPONENT (Runs in useFrame)
// =========================================================================
function RoverSimulationRig({
  equippedModules,
  batteryPower,
  cameraMode,
  radarPulseRadius,
  inputMovement,
  sandTraps,
  scienceSamples,
  debrisSites,
  isCollectingSample,
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

  const wheelsType = equippedModules.wheels || 'slim_aluminum';
  const powerType = equippedModules.power || 'solar_array';
  const isSlim = wheelsType === 'slim_aluminum';
  const isWide = wheelsType === 'wide_titan';

  // Tick physics loop
  useFrame(({ camera }, delta) => {
    // 1. Detect if rover is in any Sand Trap
    let inSandTrap = false;
    for (const trap of sandTraps) {
      const dx = roverPosRef.current.x - trap.x;
      const dz = roverPosRef.current.z - trap.z;
      if (Math.sqrt(dx * dx + dz * dz) <= trap.radius) {
        inSandTrap = true;
        break;
      }
    }

    // 2. Detect if rover is in any Solar Ridge
    let inSolarRidge = false;
    for (const ridge of SOLAR_RIDGES_3D) {
      const dx = roverPosRef.current.x - ridge.x;
      const dz = roverPosRef.current.z - ridge.z;
      if (Math.sqrt(dx * dx + dz * dz) <= ridge.radius) {
        inSolarRidge = true;
        break;
      }
    }

    // 3. Detect if rover is near Lander Base
    const distToLander = Math.sqrt(
      roverPosRef.current.x * roverPosRef.current.x + roverPosRef.current.z * roverPosRef.current.z
    );
    const isNearLander = distToLander <= LANDER_BASE_3D.radius;

    // 4. Calculate terrain speeds and power drains according to trade-off matrix
    let maxSpeed = 14.0; // m/s
    let drainPerSec = 0.35; // ⚡/s

    if (isSlim) {
      if (inSandTrap) {
        maxSpeed = 2.5; // severely bogged down in sand!
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
        maxSpeed = 9.5; // heavy rolling resistance on flat rock
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

    // If battery is 0, rover is dead
    const isDead = batteryPower <= 0;
    if (isDead) {
      maxSpeed = 0;
    }

    // 5. Process Driving Inputs
    let throttle = 0;
    if (inputMovement.forward) throttle += 1;
    if (inputMovement.backward) throttle -= 1;

    let targetSpeed = throttle * maxSpeed;
    if (throttle < 0) targetSpeed *= 0.5; // Reverse is half speed

    // Smooth acceleration / deceleration
    currentSpeedRef.current = THREE.MathUtils.lerp(
      currentSpeedRef.current,
      targetSpeed,
      delta * (throttle !== 0 ? 3.0 : 5.0)
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
      headingRef.current += steerInput * 1.5 * delta * turnMultiplier;
    }

    // 6. Update Vehicle Coordinates
    const moveDist = currentSpeedRef.current * delta;
    roverPosRef.current.x += Math.sin(headingRef.current) * moveDist;
    roverPosRef.current.z += Math.cos(headingRef.current) * moveDist;

    // Boundary clamp
    const halfSize = (WORLD_SIZE / 2) - 5;
    roverPosRef.current.x = THREE.MathUtils.clamp(roverPosRef.current.x, -halfSize, halfSize);
    roverPosRef.current.z = THREE.MathUtils.clamp(roverPosRef.current.z, -halfSize, halfSize);
    roverPosRef.current.y = getTerrainHeight(roverPosRef.current.x, roverPosRef.current.z);

    // Wheel spin
    wheelSpinRef.current += (moveDist / 0.35) * 1.5;

    // 7. Battery Drain & Recharge Mechanics
    if (Math.abs(currentSpeedRef.current) > 0.2) {
      onBatteryDrainDelta(drainPerSec * delta);
    }

    // Continuous MMRTG Recharge (+0.8⚡/s)
    if (powerType === 'mmrtg') {
      onMmrtgRechargeDelta(0.8 * delta);
    }

    // Solar Ridge Recharge (+15⚡/s when on ridge with solar array)
    if (inSolarRidge && powerType === 'solar_array') {
      onSolarRechargeDelta(15.0 * delta);
    }

    // 8. Check Proximity to Science Samples and Debris
    let nearbySampleId: string | null = null;
    for (const s of scienceSamples) {
      if (!s.collected) {
        const dx = roverPosRef.current.x - s.x;
        const dz = roverPosRef.current.z - s.z;
        if (Math.sqrt(dx * dx + dz * dz) <= 4.5) {
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
        if (Math.sqrt(dx * dx + dz * dz) <= 4.5) {
          nearbyDebrisId = d.id;
          break;
        }
      }
    }

    // 9. Camera Tracking
    const rx = roverPosRef.current.x;
    const ry = roverPosRef.current.y;
    const rz = roverPosRef.current.z;
    const head = headingRef.current;

    if (cameraMode === 'chase') {
      // 3rd Person Behind-the-Rover Chase Cam
      const distBehind = 7.5;
      const heightAbove = 3.6;
      const camTargetX = rx - Math.sin(head) * distBehind;
      const camTargetZ = rz - Math.cos(head) * distBehind;
      const camTargetY = ry + heightAbove;

      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 4.5);
      camera.lookAt(rx, ry + 1.2, rz);
    } else if (cameraMode === 'eagle') {
      // High-angle Tactical Eagle Cam
      const camTargetX = rx;
      const camTargetZ = rz - 16;
      const camTargetY = ry + 32;
      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 3.5);
      camera.lookAt(rx, ry, rz);
    } else {
      // Orbit Cam
      const camTargetX = rx + 8;
      const camTargetZ = rz + 8;
      const camTargetY = ry + 6;
      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), delta * 3);
      camera.lookAt(rx, ry + 1, rz);
    }

    // 10. Emit Telemetry to UI HUD
    onTelemetryUpdate({
      x: Math.round(rx * 10) / 10,
      z: Math.round(rz * 10) / 10,
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

  const { pitch, roll } = getTerrainSlope(roverPosRef.current.x, roverPosRef.current.z);

  return (
    <group
      position={[roverPosRef.current.x, roverPosRef.current.y, roverPosRef.current.z]}
      rotation={[pitch, headingRef.current, roll]}
    >
      <Mars3DRover
        wheelsType={equippedModules.wheels}
        powerType={equippedModules.power}
        sensorsType={equippedModules.sensors}
        commsType={equippedModules.comms}
        steerAngle={steerAngleRef.current}
        wheelRotation={wheelSpinRef.current}
        isCollecting={isCollectingSample}
      />
    </group>
  );
}

// =========================================================================
// MAIN OPEN-WORLD CANVAS CONTAINER
// =========================================================================
export function MarsOpenWorld(props: MarsOpenWorldProps) {
  return (
    <div className="mars-3d-open-world-canvas-wrap">
      <Canvas
        shadows
        camera={{ position: [0, 8, -12], fov: 62, near: 0.1, far: 500 }}
      >
        {/* Martian Atmosphere & Sky Fog */}
        <color attach="background" args={['#24120c']} />
        <fog attach="fog" args={['#24120c', 35, 180]} />

        {/* Dynamic Mars Sun Lighting */}
        <ambientLight intensity={1.1} color="#fca5a5" />
        <directionalLight
          position={[70, 95, 50]}
          intensity={2.8}
          color="#fde047"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={260}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />

        {/* Mars Procedural 3D Terrain */}
        <ProceduralMarsTerrain />

        {/* 3D Landmarks & Interactive Outcrops */}
        <WorldLandmarks
          sandTraps={props.sandTraps}
          scienceSamples={props.scienceSamples}
          debrisSites={props.debrisSites}
        />

        {/* Expanding Holographic Radar Pulse Wave */}
        <RadarPulseWave
          pulseRadius={props.radarPulseRadius}
          roverX={0} // dynamically tracks rover
          roverZ={0}
          roverY={0}
        />

        {/* Vehicle Simulation Rig & Chase Camera */}
        <RoverSimulationRig {...props} />
      </Canvas>
    </div>
  );
}
