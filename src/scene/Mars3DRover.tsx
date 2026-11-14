import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROVER_MODULES } from '../data/roverModules';

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
// 3D COMMS UPLINK BEAM (Sóng truyền dữ liệu bắn thẳng lên bầu trời)
// =========================================================================
function CommsUplinkBeam({ position }: { position: [number, number, number] }) {
  const ringsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringsGroupRef.current) {
      ringsGroupRef.current.children.forEach((child, i) => {
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
      {/* High-intensity Central Data Uplink Column (55m into sky) */}
      <mesh position={[0, 27.5, 0]}>
        <cylinderGeometry args={[0.07, 0.16, 55, 16, 1, true]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer Atmospheric Glow Sheath */}
      <mesh position={[0, 27.5, 0]}>
        <cylinderGeometry args={[0.28, 0.75, 55, 16, 1, true]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Upward Ascending Concentric Data Wave Rings */}
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

      {/* Antenna Transmit Point Light */}
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
  const wheelThickness = isWide ? 0.32 : isSlim ? 0.14 : 0.24;
  const wheelColor = isWide ? '#334155' : isSlim ? '#e2e8f0' : '#d97706';

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

  // Antenna mount position
  const commsMountPos: [number, number, number] =
    commsType === 'high_gain_dish' ? [-0.38, 1.1, -0.32] : [-0.42, 1.25, -0.42];

  return (
    <group position={[0, chassisY, 0]}>
      {/* ================= ROVER MAIN CHASSIS (WEB) ================= */}
      {/* Main Structural Body */}
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

      {/* ================= 6 WHEELS ASSEMBLY ================= */}
      {/* Front Left Wheel (Steerable) */}
      <group position={frontLeftPos} rotation={[0, steerAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* Front Right Wheel (Steerable) */}
      <group position={frontRightPos} rotation={[0, steerAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* Mid Left Wheel */}
      <group position={midLeftPos}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* Mid Right Wheel */}
      <group position={midRightPos}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* Rear Left Wheel */}
      <group position={rearLeftPos}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* Rear Right Wheel */}
      <group position={rearRightPos}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelRotation} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
          <meshStandardMaterial color={wheelColor} roughness={0.5} metalness={isWide ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* ================= WHEEL SINK 50% & RED HAZARD ALERT FX ================= */}
      {isStuckInSand && (
        <group>
          {/* Pulsing Red Hazard Warning Rings on Ground around all 6 Sunken Wheels */}
          {allWheelPositions.map((pos, idx) => (
            <group key={idx} position={[pos[0], pos[1] - (wheelRadius * 0.45), pos[2]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[wheelRadius * 0.95, wheelRadius * 1.55, 24]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.85} side={THREE.DoubleSide} />
              </mesh>
              {/* Vertical holographic warning bars sticking up around wheel */}
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
                <meshBasicMaterial color="#f87171" transparent opacity={0.8} />
              </mesh>
            </group>
          ))}

          {/* Flashing Red Emergency Beacon on Mast */}
          <pointLight position={[0.32, 1.45, 0.65]} color="#ef4444" intensity={6} distance={10} />
          <mesh position={[0.32, 1.52, 0.65]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* ================= POWER SYSTEM (SOLAR vs MMRTG) ================= */}
      {powerType === 'solar_array' ? (
        // High-Efficiency Deployable Solar Arrays
        <group position={[0, 0.42, 0]}>
          {/* Left Solar Wing */}
          <mesh position={[-0.98, 0.02, 0]} castShadow>
            <boxGeometry args={[0.72, 0.03, 1.6]} />
            <meshStandardMaterial color="#1e3a8a" emissive="#172554" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
          {/* Right Solar Wing */}
          <mesh position={[0.98, 0.02, 0]} castShadow>
            <boxGeometry args={[0.72, 0.03, 1.6]} />
            <meshStandardMaterial color="#1e3a8a" emissive="#172554" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        // MMRTG Nuclear Power Generator (Mounted at rear with glowing cooling fins)
        <group position={[0, 0.28, -0.98]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.65, 14]} />
            <meshStandardMaterial color="#1f2937" emissive="#ef4444" emissiveIntensity={0.75} roughness={0.3} />
          </mesh>
          {/* Radial Cooling Fins */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.68, 0.03, 0.52]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.03, 0.68, 0.52]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
        </group>
      )}

      {/* ================= SENSORS & RADAR (NAVCAM vs RIMFAX) ================= */}
      {/* Camera Mast */}
      <group position={[0.32, 0.65, 0.65]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.8, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} />
        </mesh>
        {/* Stereo Camera Head */}
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[0.32, 0.14, 0.14]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={sensorsType === 'rimfax_gpr' ? '#10b981' : '#38bdf8'}
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>

      {/* RIMFAX Subsurface Ground Penetrating Radar Probe under front bumper */}
      {sensorsType === 'rimfax_gpr' && (
        <group position={[0, -0.16, 0.88]}>
          <mesh>
            <boxGeometry args={[0.9, 0.08, 0.14]} />
            <meshStandardMaterial color="#047857" emissive="#10b981" emissiveIntensity={0.85} />
          </mesh>
        </group>
      )}

      {/* ================= COMMS (UHF vs HIGH-GAIN DISH) ================= */}
      {commsType === 'high_gain_dish' ? (
        // Steerable Parabolic High-Gain Dish
        <group position={[-0.38, 0.58, -0.32]} rotation={[0.35, 0.45, 0]}>
          {/* Strut */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.38, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Dish Parabola */}
          <mesh position={[0, 0.42, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.48, 0.15, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Feed Horn */}
          <mesh position={[0, 0.52, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ) : (
        // UHF Whip Antenna
        <group position={[-0.42, 0.52, -0.42]}>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.75, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* ================= COMMS BEAM TRANSMISSION FX ================= */}
      {isTransmitting && <CommsUplinkBeam position={commsMountPos} />}
    </group>
  );
}
