import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import type { MissionState } from '../types/game';

export type MissionSceneProps = {
  state: MissionState;
  onStationClick?: (station: 'briefing' | 'design' | 'launch' | 'operations') => void;
};

// =========================================================================
// 3D MARS ROVER MINIATURE (HOLOGRAM AT CENTER OF CONTROL ROOM)
// Reflects active wheels, power source, sensors, and comms in real-time!
// =========================================================================
function MarsRoverMiniature({ state }: { state: MissionState }) {
  const groupRef = useRef<Group>(null);
  const wheelsCategory = state.surface.equippedModules.wheels || 'slim_aluminum';
  const powerCategory = state.surface.equippedModules.power || 'solar_array';
  const sensorsCategory = state.surface.equippedModules.sensors || 'navcam';
  const commsCategory = state.surface.equippedModules.comms || 'uhf_antenna';

  // Smooth holographic rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.65;
    }
  });

  // Wheel dimensions and materials based on active equipped wheels
  const isSlim = wheelsCategory === 'slim_aluminum';
  const isWide = wheelsCategory === 'wide_titan';
  const wheelRadius = isWide ? 0.19 : isSlim ? 0.15 : 0.17;
  const wheelThickness = isWide ? 0.16 : isSlim ? 0.07 : 0.12;
  const wheelColor = isWide ? '#475569' : isSlim ? '#e2e8f0' : '#d97706';

  // 6 wheel coordinates relative to rover chassis: [x, y, z]
  const wheelPositions: [number, number, number][] = [
    [-0.55, -0.15, 0.42],  // Front Left
    [0.55, -0.15, 0.42],   // Front Right
    [-0.58, -0.15, 0.0],   // Mid Left
    [0.58, -0.15, 0.0],    // Mid Right
    [-0.55, -0.15, -0.42], // Rear Left
    [0.55, -0.15, -0.42],  // Rear Right
  ];

  return (
    <group ref={groupRef} position={[0, 1.05, 0]}>
      {/* Hologram glow beam pedestal underneath */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.1, 24]} />
        <meshStandardMaterial
          color={state.phase === 'operations' ? '#ea580c' : '#38bdf8'}
          emissive={state.phase === 'operations' ? '#c2410c' : '#0284c7'}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Holographic light ring */}
      <mesh position={[0, -0.48, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial
          color={state.phase === 'operations' ? '#fb923c' : '#7dd3fc'}
          side={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Rover Main Chassis (Warm aerospace gold / white composite) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.75, 0.32, 0.95]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Gold thermal insulation foil top plate */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.7, 0.03, 0.9]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* 6 Wheels Rocker-Bogie Assembly */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Wheel cylinder oriented along X-axis */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 16]} />
            <meshStandardMaterial
              color={wheelColor}
              roughness={0.5}
              metalness={isWide ? 0.8 : 0.3}
            />
          </mesh>
          {/* Strut connector */}
          <mesh position={[pos[0] > 0 ? -0.06 : 0.06, 0.08, 0]}>
            <boxGeometry args={[0.08, 0.16, 0.04]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ================= POWER SOURCE COMPONENT ================= */}
      {powerCategory === 'solar_array' ? (
        // Deployable Solar Arrays (Double rectangular panels on wings)
        <group position={[0, 0.22, 0]}>
          {/* Left Wing */}
          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.85]} />
            <meshStandardMaterial
              color="#1e3a8a"
              emissive="#172554"
              emissiveIntensity={0.4}
              roughness={0.2}
            />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.85]} />
            <meshStandardMaterial
              color="#1e3a8a"
              emissive="#172554"
              emissiveIntensity={0.4}
              roughness={0.2}
            />
          </mesh>
        </group>
      ) : (
        // MMRTG Nuclear Power Generator (Cylindrical generator with cooling fins at rear)
        <group position={[0, 0.12, -0.48]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.38, 12]} />
            <meshStandardMaterial
              color="#374151"
              emissive="#ef4444"
              emissiveIntensity={0.7}
              roughness={0.4}
            />
          </mesh>
          {/* Cooling fin fins */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.34, 0.02, 0.3]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.02, 0.34, 0.3]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        </group>
      )}

      {/* ================= SENSORS & RADAR COMPONENT ================= */}
      {/* Front camera mast */}
      <group position={[0.18, 0.36, 0.36]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
        {/* NavCam Stereo Camera Head */}
        <mesh position={[0, 0.23, 0]}>
          <boxGeometry args={[0.18, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={sensorsCategory === 'rimfax_gpr' ? '#10b981' : '#38bdf8'}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* If RIMFAX GPR is equipped: Subsurface radar probe mounted beneath front chassis */}
      {sensorsCategory === 'rimfax_gpr' && (
        <group position={[0, -0.16, 0.38]}>
          <mesh>
            <boxGeometry args={[0.45, 0.05, 0.08]} />
            <meshStandardMaterial
              color="#047857"
              emissive="#10b981"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}

      {/* ================= COMMS ANTENNA COMPONENT ================= */}
      {commsCategory === 'high_gain_dish' ? (
        // Steerable Parabolic High-Gain Dish
        <group position={[-0.22, 0.32, -0.18]} rotation={[0.3, 0.4, 0]}>
          {/* Strut */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Dish cone */}
          <mesh position={[0, 0.22, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.24, 0.08, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.3} />
          </mesh>
          {/* Feed horn */}
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ) : (
        // UHF Omni-directional whip antenna
        <group position={[-0.24, 0.3, -0.22]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// =========================================================================
// INTERACTIVE CONSOLE STATIONS
// =========================================================================
function InteractiveConsole({
  position,
  label,
  screenColor,
  onClick,
  isActive,
}: {
  position: [number, number, number];
  label: string;
  screenColor: string;
  onClick: () => void;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Console Desk Body */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.5, 0.56, 0.85]} />
        <meshStandardMaterial
          color={isActive ? '#1e293b' : '#0f172a'}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Angled Computer Screen */}
      <mesh position={[0, 0.68, -0.15]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.25, 0.42, 0.06]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={hovered ? '#38bdf8' : screenColor}
          emissiveIntensity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* Status LED Bar */}
      <mesh position={[0, 0.58, 0.35]}>
        <boxGeometry args={[1.3, 0.03, 0.05]} />
        <meshStandardMaterial
          color={isActive ? '#38bdf8' : '#334155'}
          emissive={isActive ? '#38bdf8' : '#1e293b'}
          emissiveIntensity={isActive ? 0.8 : 0.2}
        />
      </mesh>
    </group>
  );
}

// =========================================================================
// MAIN MISSION CONTROL SCENE CONTAINER
// =========================================================================
export function MissionScene({ state, onStationClick }: MissionSceneProps) {
  const isOperations = state.phase === 'operations';
  const isLaunch = state.phase === 'launch';
  const isDebrief = state.phase === 'debrief';

  // Main Wall Screen background color depending on mission phase
  const wallScreenColor =
    state.phase === 'briefing'
      ? '#0284c7' // Blue Cyan
      : state.phase === 'design'
      ? '#2563eb' // Technical Blue
      : state.phase === 'preflight'
      ? '#d97706' // Preflight Amber
      : state.phase === 'launch'
      ? '#ea580c' // Rocket Flame Orange
      : state.phase === 'operations'
      ? '#c2410c' // Martian Rust Red
      : '#16a34a'; // Debrief Emerald Green

  // Status Beacon Alert Color
  const alertColor =
    state.surface.isStuck || state.surface.batteryPower <= 15
      ? '#ef4444' // Red Danger
      : state.phase === 'preflight'
      ? '#f59e0b' // Yellow Warning
      : state.phase === 'operations'
      ? '#ea580c' // Mars Ops Orange
      : '#38bdf8'; // Normal Ops Cyan

  return (
    <div className="scene-shell" aria-label="3D Isometric NASA Mission Control Room Diorama">
      <Canvas
        orthographic
        camera={{ position: [8, 9, 8], zoom: 60, near: 0.1, far: 100 }}
      >
        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[6, 12, 5]} intensity={2.2} castShadow />
        <pointLight position={[0, 3, 0]} intensity={1.5} color={alertColor} />

        {/* ================= ROOM DIORAMA CUTAWAY ================= */}
        {/* Floor Platform */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[8.5, 0.3, 7.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Floor Border Trim (Hi-Tech metallic border) */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[8.65, 0.1, 7.65]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Back Wall with Giant Mission Ops Screen */}
        <mesh position={[0, 1.8, -3.7]}>
          <boxGeometry args={[8.5, 3.6, 0.25]} />
          <meshStandardMaterial color="#0b1220" />
        </mesh>

        {/* Big Ops Screen on Wall */}
        <mesh position={[0, 2.1, -3.55]}>
          <boxGeometry args={[5.8, 2.1, 0.08]} />
          <meshStandardMaterial
            color="#090d16"
            emissive={wallScreenColor}
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Left Side Wall Glass Cutaway */}
        <mesh position={[-4.2, 1.8, 0]}>
          <boxGeometry args={[0.25, 3.6, 7.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* ================= ALERT STATUS BEACON PILLAR ================= */}
        <group position={[-3.6, 1.2, -3.2]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.15, 2.4, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color={alertColor}
              emissive={alertColor}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>

        {/* ================= INTERACTIVE FLIGHT CONSOLES ================= */}
        {/* Left: Design & Payload Systems Console */}
        <InteractiveConsole
          position={[-2.3, 0, 0.7]}
          label="Design Console"
          screenColor="#2563eb"
          isActive={state.phase === 'design'}
          onClick={() => onStationClick?.('design')}
        />

        {/* Right: Flight Dynamics & Launcher Console */}
        <InteractiveConsole
          position={[2.3, 0, 0.7]}
          label="Trajectory Console"
          screenColor="#ea580c"
          isActive={state.phase === 'preflight' || state.phase === 'launch'}
          onClick={() => onStationClick?.('launch')}
        />

        {/* Front-Center: Flight Director Desk */}
        <InteractiveConsole
          position={[0, 0, 2.2]}
          label="Flight Director"
          screenColor={isOperations ? '#c2410c' : '#38bdf8'}
          isActive={state.phase === 'operations'}
          onClick={() => onStationClick?.('operations')}
        />

        {/* ================= CENTER HOLOGRAM PEDESTAL & 3D ROVER ================= */}
        <MarsRoverMiniature state={state} />
      </Canvas>

      <span className="scene-caption">
        3D Diorama: Phòng Điều Khiển NASA & Mô hình xe Rover thời gian thực (Xoay tự động) · Click bàn console
      </span>
    </div>
  );
}
