import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Mars3DRoverProps {
  wheelsType: string;
  powerType: string;
  sensorsType: string;
  commsType: string;
  steerAngle: number;
  wheelRotation: number;
  isCollecting?: boolean;
  isStuckInSand?: boolean;
  isTransmitting?: boolean;
}

// =========================================================================
// 1. MODULAR WHEEL ASSET MODELS (From Concept Art Breakout 3D Models)
// =========================================================================

/**
 * Slim Aluminum Wheel: Fine multi-spoke high-speed metallic silver alloy rim
 */
export function SlimAluminumWheel({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation-x={rotation}>
      {/* Outer aluminum rim */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.30, 0.30, 0.13, 24]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Dark tire tread ring */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.302, 0.302, 0.11, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Center hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.145, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* 8 Radiating fine aluminum spokes */}
      {[0, 45, 90, 135].map(deg => (
        <mesh key={deg} rotation={[0, 0, Math.PI / 2]} rotation-z={(deg * Math.PI) / 180}>
          <boxGeometry args={[0.018, 0.52, 0.08]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Wide Titan Mesh: Chunky, rugged dark titanium off-road tire with deep chevron treads
 */
export function WideTitanWheel({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation-x={rotation}>
      {/* Main heavy-duty tire cylinder */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.65} />
      </mesh>
      {/* Center titanium hubcap */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.33, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.2} />
      </mesh>
      {/* Deep chevron tread blocks around circumference */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
        <mesh key={deg} rotation={[0, 0, Math.PI / 2]} rotation-z={(deg * Math.PI) / 180}>
          <boxGeometry args={[0.04, 0.77, 0.28]} />
          <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Adaptive SMA Wheel: Interlocking Nitinol shape-memory alloy spring-mesh segments
 */
export function AdaptiveSMAWheel({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation-x={rotation}>
      {/* Inner alloy mounting ring */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.22, 16]} />
        <meshStandardMaterial color="#78716c" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Center hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.23, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* 8 Interlocking spiral Nitinol spring arches */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <group key={deg} rotation={[0, 0, Math.PI / 2]} rotation-z={(deg * Math.PI) / 180}>
          <mesh position={[0, 0.26, 0]}>
            <boxGeometry args={[0.035, 0.14, 0.21]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.02, 0.12, 0.18]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =========================================================================
// 2. MODULAR SENSORS & RADAR ASSETS (NavCam vs RIMFAX GPR)
// =========================================================================

/**
 * NavCam: Binocular stereo optical camera head on cylindrical mast with dual eyes
 */
export function NavCamSensor() {
  return (
    <group position={[0.32, 0.65, 0.65]}>
      {/* Cylindrical vertical mast */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.88, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Swivel neck collar */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.07, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      {/* Binocular stereo camera head */}
      <mesh position={[0, 0.94, 0]} castShadow>
        <boxGeometry args={[0.36, 0.14, 0.18]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Left stereo camera eye */}
      <mesh position={[-0.1, 0.94, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.06, 16]} />
        <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
      {/* Right stereo camera eye */}
      <mesh position={[0.1, 0.94, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.06, 16]} />
        <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/**
 * RIMFAX GPR: Rugged equipment box with deployable radar antenna plates under bumper
 */
export function RimfaxGprSensor() {
  return (
    <group>
      {/* Camera Mast with Integrated GPR Avionics Box */}
      <group position={[0.32, 0.65, 0.65]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.8, 12]} />
          <meshStandardMaterial color="#71717a" metalness={0.8} />
        </mesh>
        {/* Armored military-grade radar avionics box */}
        <mesh position={[0, 0.84, 0]} castShadow>
          <boxGeometry args={[0.42, 0.22, 0.26]} />
          <meshStandardMaterial color="#e4e4e7" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Front diagnostic display */}
        <mesh position={[0, 0.84, 0.135]}>
          <boxGeometry args={[0.24, 0.1, 0.01]} />
          <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Under-Bumper Ground Penetrating Radar Antenna Assembly */}
      <group position={[0, -0.16, 0.86]}>
        {/* Central transmitter housing */}
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.1, 0.18]} />
          <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Left deployable radar skid plate angled downwards */}
        <mesh position={[-0.32, -0.06, 0.04]} rotation={[0.4, 0, -0.2]}>
          <boxGeometry args={[0.26, 0.025, 0.22]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
        </mesh>
        {/* Right deployable radar skid plate angled downwards */}
        <mesh position={[0.32, -0.06, 0.04]} rotation={[0.4, 0, 0.2]}>
          <boxGeometry args={[0.26, 0.025, 0.22]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// =========================================================================
// 3. MODULAR POWER ASSETS (Solar Panels vs MMRTG Nuclear Generator)
// =========================================================================

/**
 * Solar Panels: Dual articulated solar array wings with blue photovoltaic grid
 */
export function SolarPanelsPower() {
  return (
    <group position={[0, 0.44, 0]}>
      {/* Left Solar Array Wing with Photovoltaic Cells */}
      <group position={[-0.98, 0.04, 0]} rotation={[0, 0, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.76, 0.035, 1.62]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#172554" emissiveIntensity={0.65} roughness={0.12} metalness={0.7} />
        </mesh>
        {/* Solar grid wirelines */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.74, 0.002, 1.58]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>

      {/* Right Solar Array Wing with Photovoltaic Cells */}
      <group position={[0.98, 0.04, 0]} rotation={[0, 0, -0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.76, 0.035, 1.62]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#172554" emissiveIntensity={0.65} roughness={0.12} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.74, 0.002, 1.58]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      </group>

      {/* Articulated structural mounting struts */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.3, 0.06, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * MMRTG: Cylindrical nuclear thermal generator with glowing vertical red core & radiating heat fins
 */
export function MmrtgNuclearPower() {
  return (
    <group position={[0, 0.3, -1.02]}>
      {/* Central nuclear generator cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.72, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Glowing vertical red core chamber */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.74, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <pointLight color="#ef4444" intensity={3.5} distance={3} />

      {/* 8 Radial heavy metallic cooling fins extending outward */}
      {[0, 45, 90, 135].map(deg => (
        <mesh key={deg} rotation={[Math.PI / 2, 0, (deg * Math.PI) / 180]}>
          <boxGeometry args={[0.025, 0.68, 0.62]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Heat shield casing top ring */}
      <mesh position={[0, 0, -0.38]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 16]} />
        <meshStandardMaterial color="#71717a" metalness={0.9} />
      </mesh>
    </group>
  );
}

// =========================================================================
// 4. MODULAR COMMS ASSETS (UHF Antenna vs High-Gain Parabolic Dish)
// =========================================================================

/**
 * UHF Antenna: Slender vertical whip antenna with helical coil at the base
 */
export function UhfAntennaComms() {
  return (
    <group position={[-0.42, 0.52, -0.42]}>
      {/* Base mounting pedestal */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} />
      </mesh>
      {/* Helical coil base rings */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.16, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.2} />
      </mesh>
      {/* Slender vertical whip antenna rod */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.85, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Glowing tip indicator */}
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/**
 * High-Gain Dish: Steerable parabolic dish with tripod struts and center feed horn
 */
export function HighGainDishComms() {
  return (
    <group position={[-0.38, 0.58, -0.32]} rotation={[0.32, 0.45, 0]}>
      {/* Swivel mechanical base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.16, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      {/* Articulated mounting arm */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      {/* Parabolic reflector dish */}
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.48, 0.16, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.4} />
      </mesh>
      {/* Center RF feed horn */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.85} />
      </mesh>
    </group>
  );
}

// =========================================================================
// 3D COMMS UPLINK BEAM
// =========================================================================
function CommsUplinkBeam({ position }: { position: [number, number, number] }) {
  const ringsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringsGroupRef.current) {
      ringsGroupRef.current.children.forEach(child => {
        child.position.y += delta * 24;
        const progress = Math.min(1, child.position.y / 55);
        const s = 1 + progress * 3.2;
        child.scale.set(s, s, 1);
        if (child.position.y > 55) {
          child.position.y = 0;
          child.scale.set(1, 1, 1);
        }
      });
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 27.5, 0]}>
        <cylinderGeometry args={[0.07, 0.16, 55, 16, 1, true]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 27.5, 0]}>
        <cylinderGeometry args={[0.28, 0.75, 55, 16, 1, true]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <group ref={ringsGroupRef}>
        <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.55, 24]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.55, 24]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.55, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.55, 24]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight color="#38bdf8" intensity={7} distance={15} />
    </group>
  );
}

// =========================================================================
// MAIN 3D ROVER MODEL COMPONENT
// =========================================================================
export function Mars3DRover({
  wheelsType,
  powerType,
  sensorsType,
  commsType,
  steerAngle,
  wheelRotation,
  isCollecting = false,
  isStuckInSand = false,
  isTransmitting = false,
}: Mars3DRoverProps) {
  const isSlim = wheelsType === 'slim_aluminum';
  const isWide = wheelsType === 'wide_titan';
  const wheelRadius = isWide ? 0.38 : isSlim ? 0.30 : 0.34;

  // Wheel Sink: When stuck in sand with slim wheels, chassis drops by 50% wheel radius (-0.15m)
  const chassisY = isStuckInSand ? 0.40 : 0.55;

  // 6 wheel coordinates relative to rover chassis: [x, y, z]
  const rearLeftPos: [number, number, number] = [-0.95, -0.22, -0.85];
  const rearRightPos: [number, number, number] = [0.95, -0.22, -0.85];
  const midLeftPos: [number, number, number] = [-1.02, -0.22, 0.0];
  const midRightPos: [number, number, number] = [1.02, -0.22, 0.0];
  const frontLeftPos: [number, number, number] = [-0.95, -0.22, 0.85];
  const frontRightPos: [number, number, number] = [0.95, -0.22, 0.85];

  const allWheelPositions = [rearLeftPos, rearRightPos, midLeftPos, midRightPos, frontLeftPos, frontRightPos];

  // Helper to render wheel model based on active equipped wheels
  const renderWheel = (rot: number) => {
    if (isSlim) return <SlimAluminumWheel rotation={rot} />;
    if (isWide) return <WideTitanWheel rotation={rot} />;
    return <AdaptiveSMAWheel rotation={rot} />;
  };

  const commsMountPos: [number, number, number] =
    commsType === 'high_gain_dish' ? [-0.38, 1.1, -0.32] : [-0.42, 1.25, -0.42];

  return (
    <group position={[0, chassisY, 0]}>
      {/* ================= ROVER MAIN CHASSIS (White composite body) ================= */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[1.35, 0.55, 1.85]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Gold Thermal Multi-Layer Insulation (MLI) Top Deck */}
      <mesh position={[0, 0.37, 0]} receiveShadow>
        <boxGeometry args={[1.28, 0.04, 1.76]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Front Avionics & Headlights */}
      <mesh position={[-0.42, 0.12, 0.94]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.42, 0.12, 0.94]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>

      {/* Rocker-Bogie Structural Suspension Arms */}
      <mesh position={[-0.75, -0.06, 0]}>
        <boxGeometry args={[0.12, 0.1, 1.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.75, -0.06, 0]}>
        <boxGeometry args={[0.12, 0.1, 1.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* ================= 6 DETAILED WHEELS ================= */}
      {/* Front Left Wheel (Steerable) */}
      <group position={frontLeftPos} rotation={[0, steerAngle, 0]}>
        {renderWheel(wheelRotation)}
      </group>

      {/* Front Right Wheel (Steerable) */}
      <group position={frontRightPos} rotation={[0, steerAngle, 0]}>
        {renderWheel(wheelRotation)}
      </group>

      {/* Mid Left Wheel */}
      <group position={midLeftPos}>
        {renderWheel(wheelRotation)}
      </group>

      {/* Mid Right Wheel */}
      <group position={midRightPos}>
        {renderWheel(wheelRotation)}
      </group>

      {/* Rear Left Wheel */}
      <group position={rearLeftPos}>
        {renderWheel(wheelRotation)}
      </group>

      {/* Rear Right Wheel */}
      <group position={rearRightPos}>
        {renderWheel(wheelRotation)}
      </group>

      {/* ================= WHEEL SINK 50% & RED HAZARD ALERT FX ================= */}
      {isStuckInSand && (
        <group>
          {allWheelPositions.map((pos, idx) => (
            <group key={idx} position={[pos[0], pos[1] - (wheelRadius * 0.45), pos[2]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[wheelRadius * 0.95, wheelRadius * 1.55, 24]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.85} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
                <meshBasicMaterial color="#f87171" transparent opacity={0.8} />
              </mesh>
            </group>
          ))}
          <pointLight position={[0.32, 1.45, 0.65]} color="#ef4444" intensity={6} distance={10} />
          <mesh position={[0.32, 1.52, 0.65]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* ================= MODULAR POWER SYSTEM ================= */}
      {powerType === 'solar_array' ? <SolarPanelsPower /> : <MmrtgNuclearPower />}

      {/* ================= MODULAR SENSORS & RADAR ================= */}
      {sensorsType === 'rimfax_gpr' ? <RimfaxGprSensor /> : <NavCamSensor />}

      {/* ================= MODULAR COMMS ================= */}
      {commsType === 'high_gain_dish' ? <HighGainDishComms /> : <UhfAntennaComms />}

      {/* ================= COMMS BEAM TRANSMISSION FX ================= */}
      {isTransmitting && <CommsUplinkBeam position={commsMountPos} />}
    </group>
  );
}
