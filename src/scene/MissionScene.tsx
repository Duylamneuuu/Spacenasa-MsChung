import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import type { MissionState } from '../types/game';
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

export type MissionSceneProps = {
  state: MissionState;
  onStationClick?: (station: 'briefing' | 'design' | 'launch' | 'operations') => void;
};

type LandmarkKey = 'lander' | 'solar_ridge' | 'sand_trap' | 'science' | 'scrap' | 'rover';

interface LandmarkInfo {
  title: string;
  badge: string;
  coords: string;
  summary: string;
  tacticalTip: string;
  telemetry: { label: string; value: string }[];
}

const LANDMARK_DATA: Record<LandmarkKey, LandmarkInfo> = {
  lander: {
    title: 'TRẠM ĐỔ BỘ (LANDER BASE)',
    badge: 'WORKSHOP & DEPOT HQ',
    coords: '18.38° N, 77.58° E · EL 0.0m',
    summary: 'Trạm căn cứ đổ bộ lục giác trang bị cần cẩu cơ khí gantry và xưởng chế tạo tại chỗ (ISRU Workshop Zone).',
    tacticalTip: 'Lái xe về vòng tròn dạ quang WORKSHOP ZONE và bấm phím [E] để thay đổi lốp xe, nâng cấp Radar hoặc bổ sung trang bị.',
    telemetry: [
      { label: 'Platform Deck', value: 'Hexagonal Alloy + 3 Ramps' },
      { label: 'Robotic Crane', value: 'Articulated Hydraulic Gantry' },
      { label: 'UHF Comms Link', value: 'Operational · 100% Signal' },
      { label: 'ISRU 3D Printer', value: 'Ready for Field Swaps' },
    ],
  },
  solar_ridge: {
    title: 'ĐỒI ĐÓN NẮNG (SOLAR RIDGE)',
    badge: 'SOLAR RECHARGE SUMMIT',
    coords: '18.41° N, 77.62° E · EL +5.2m',
    summary: 'Đỉnh núi đón nắng cao nhất vùng Jezero, đón cường độ quang năng cực đại vượt trội trên bề mặt Sao Hỏa.',
    tacticalTip: 'Nếu xe dùng Pin Mặt Trời (Solar Array), leo lên đỉnh đồi để kích hoạt nạp nhanh +25⚡/lần sạc.',
    telemetry: [
      { label: 'Elevation', value: '+5.2m above crater floor' },
      { label: 'Solar Irradiance', value: '590 W/m² (Peak Peak)' },
      { label: 'Dust Deposition', value: 'Low (Clean Airflow)' },
      { label: 'Slope Incline', value: '28° Moderate Grade' },
    ],
  },
  sand_trap: {
    title: 'BẪY CÁT LÚN (SAND TRAP)',
    badge: 'EXTREME HAZARD ZONE',
    coords: '18.39° N, 77.59° E · EL -0.4m',
    summary: 'Vùng trũng cát bụi mịn ngầm (tương tự Troy Sand Trap làm kẹt chết xe tự hành Spirit năm 2009).',
    tacticalTip: 'Lốp Nhôm Mỏng vào đây sẽ bị kẹt bánh (mất -25⚡). Cần trang bị Lốp Lưới Titan To hoặc Lốp Biến Hình SMA để vượt cạn an toàn.',
    telemetry: [
      { label: 'Soil Density', value: '0.85 g/cm³ (Loose Silt)' },
      { label: 'Cohesion', value: 'Near Zero (High Sinkage)' },
      { label: 'Slim Wheels Risk', value: '100% Immobilization' },
      { label: 'Detection Mode', value: 'RIMFAX Subsurface Radar' },
    ],
  },
  science: {
    title: 'MẪU ĐÁ KHOA HỌC (SCIENCE SAMPLE)',
    badge: 'ASTROBIOLOGY TARGET',
    coords: '18.37° N, 77.56° E · EL +0.3m',
    summary: 'Cụm tinh thể khoáng sản hydrat màu xanh ngọc bích lưu giữ dấu vết cổ sinh vật hồ Jezero Crater.',
    tacticalTip: 'Tiến sát mẫu vật và kích hoạt tia Laser phân tích quang phổ để thu thập 25 MB Dữ liệu Khoa học.',
    telemetry: [
      { label: 'Mineral Type', value: 'Layered Silicate Geode' },
      { label: 'Science Value', value: '+25 MB Astrobiology' },
      { label: 'Excavation Tool', value: 'MastCam UV Laser Pulse' },
      { label: 'Mission Progress', value: 'Objective Alpha' },
    ],
  },
  scrap: {
    title: 'MẢNH VỠ TÀU CŨ (CRASHED SCRAP)',
    badge: 'ISRU SALVAGE SITE',
    coords: '18.40° N, 77.61° E · EL +0.3m',
    summary: 'Mảnh vỡ kén bảo vệ nhiệt và khung giàn pin mặt trời từ một phi vụ thám hiểm Sao Hỏa trước đây.',
    tacticalTip: 'Thu gom mảnh kim loại phế liệu để mang về Trạm Đổ Bộ tái chế thành phụ kiện và linh kiện thay thế.',
    telemetry: [
      { label: 'Material', value: 'Aerospace Grade Titanium' },
      { label: 'ISRU Yield', value: '+20 Scrap Metal Units' },
      { label: 'Comms Beacon', value: 'Active Ethereal Sky Signal' },
      { label: 'Salvage Tool', value: 'Robotic Arm Clamp' },
    ],
  },
  rover: {
    title: 'XE TỰ HÀNH MARS ROVER 3D',
    badge: 'ACTIVE EXPLORATION RIG',
    coords: 'Field Coords Real-Time Synced',
    summary: 'Kiến trúc xe tự hành mô-đun hóa với hệ thống di chuyển 6 bánh Rocker-Bogie và tải trọng khoa học tùy biến.',
    tacticalTip: 'Theo dõi chỉ số Pin ⚡ và mức độ lún bánh xe. Luôn quét Radar định kỳ trước khi đi vào vùng đất lạ.',
    telemetry: [
      { label: 'Chassis Type', value: 'Aerospace Composite Honeycomb' },
      { label: 'Suspension', value: 'Differential Rocker-Bogie 6WD' },
      { label: 'Radar System', value: 'Active Subsurface Pulse' },
      { label: 'Comms Uplink', value: 'Direct-to-Earth / Orbit Relay' },
    ],
  },
};

// =========================================================================
// 1. PROCEDURAL 2.5D GEOLOGICAL STRATA DIORAMA BASE
// Recreates the floating Martian rock block with horizontal cliff sediment strata
// =========================================================================
function GeologicalDioramaBase() {
  const slabSize = 15;
  const slabDepth = 3.6;

  // Generate top undulating Martian terrain mesh
  const topTerrainGeometry = useMemo(() => {
    const segments = 48;
    const geom = new THREE.PlaneGeometry(slabSize, slabSize, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let h = 0;

      // Distance to Solar Ridge (top-right: [4.8, -4.5])
      const distRidge = Math.hypot(x - 4.8, z - (-4.5));
      if (distRidge < 5.5) {
        const factor = Math.max(0, 1 - distRidge / 5.5);
        h += Math.pow(factor, 1.8) * 4.6;
      }

      // Distance to Lander Base plateau (top-left: [-4.2, -4.0])
      const distLander = Math.hypot(x - (-4.2), z - (-4.0));
      if (distLander < 3.8) {
        h += 0.35; // gentle elevated plateau
      }

      // Sand trap depression (center-right: [1.2, -0.6])
      const distTrap = Math.hypot(x - 1.2, z - (-0.6));
      if (distTrap < 3.2) {
        const factor = Math.max(0, 1 - distTrap / 3.2);
        h -= factor * 0.45;
      }

      // Science rock terrace (bottom-left: [-3.8, 3.2])
      const distScience = Math.hypot(x - (-3.8), z - 3.2);
      if (distScience < 2.5) {
        h += 0.28;
      }

      // Subtle undulating dunes
      h += Math.sin(x * 0.6 + z * 0.4) * 0.15;
      h += Math.cos(x * 1.1 - z * 0.8) * 0.08;

      pos.setY(i, h);
    }

    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Top Martian Regolith Surface */}
      <mesh geometry={topTerrainGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#c2410c"
          roughness={0.88}
          metalness={0.12}
          flatShading={false}
        />
      </mesh>

      {/* Deceptive Sand Dune Patch in Sand Trap Bowl (Đồng màu với bụi đất Sao Hỏa) */}
      <mesh position={[1.2, -0.15, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial
          color="#9a3412"
          roughness={0.96}
          metalness={0.04}
        />
      </mesh>

      {/* ================= 4 VERTICAL CUTAWAY CLIFF WALLS (GEOLOGICAL STRATA) ================= */}
      {/* North Wall (-Z) */}
      <CliffStrataWall
        position={[0, -slabDepth / 2, -slabSize / 2]}
        rotation={[0, 0, 0]}
        width={slabSize}
        depth={slabDepth}
      />
      {/* South Wall (+Z) */}
      <CliffStrataWall
        position={[0, -slabDepth / 2, slabSize / 2]}
        rotation={[0, Math.PI, 0]}
        width={slabSize}
        depth={slabDepth}
      />
      {/* West Wall (-X) */}
      <CliffStrataWall
        position={[-slabSize / 2, -slabDepth / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={slabSize}
        depth={slabDepth}
      />
      {/* East Wall (+X) */}
      <CliffStrataWall
        position={[slabSize / 2, -slabDepth / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={slabSize}
        depth={slabDepth}
      />

      {/* Bottom Aerospace Base Platform Rim */}
      <mesh position={[0, -slabDepth - 0.08, 0]}>
        <boxGeometry args={[slabSize + 0.5, 0.2, slabSize + 0.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* High-tech Corner Brackets on Diorama Rim */}
      {([
        [-slabSize / 2 - 0.1, -slabDepth - 0.04, -slabSize / 2 - 0.1],
        [slabSize / 2 + 0.1, -slabDepth - 0.04, -slabSize / 2 - 0.1],
        [-slabSize / 2 - 0.1, -slabDepth - 0.04, slabSize / 2 + 0.1],
        [slabSize / 2 + 0.1, -slabDepth - 0.04, slabSize / 2 + 0.1],
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.5, 0.32, 0.5]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Vertical cutaway cliff showcasing horizontal sedimentary layers:
 * Regolith -> Hematite Mudstone -> Dark Basalt Lava -> Ancient Bedrock
 */
function CliffStrataWall({
  position,
  rotation,
  width,
  depth,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  depth: number;
}) {
  const layerHeight = depth / 4;

  return (
    <group position={position} rotation={rotation}>
      {/* Layer 1: Top Oxidized Regolith (Rust Red) */}
      <mesh position={[0, depth / 2 - layerHeight * 0.5, 0]}>
        <planeGeometry args={[width, layerHeight]} />
        <meshStandardMaterial color="#9a3412" roughness={0.9} />
      </mesh>

      {/* Layer 2: Hematite & Siltstone Band (Deep Brick Red) */}
      <mesh position={[0, depth / 2 - layerHeight * 1.5, 0]}>
        <planeGeometry args={[width, layerHeight]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.92} />
      </mesh>

      {/* Layer 3: Basaltic Lava Strata (Dark Charcoal Brown) */}
      <mesh position={[0, depth / 2 - layerHeight * 2.5, 0]}>
        <planeGeometry args={[width, layerHeight]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>

      {/* Layer 4: Deep Crust Bedrock (Dark Umber Stone) */}
      <mesh position={[0, depth / 2 - layerHeight * 3.5, 0]}>
        <planeGeometry args={[width, layerHeight]} />
        <meshStandardMaterial color="#1c1917" roughness={0.98} />
      </mesh>

      {/* Horizontal Stratification Lines */}
      {[-layerHeight, 0, layerHeight].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.01]}>
          <planeGeometry args={[width, 0.04]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 2. HEXAGONAL LANDER BASE & WORKSHOP ZONE
// Recreates the elevated launch platform, 3 access ramps, and gantry crane
// =========================================================================
function HexagonalLanderDiorama({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const cranePivotRef = useRef<Group>(null);
  const ringGlowRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    // Gentle robotic crane panning
    if (cranePivotRef.current) {
      cranePivotRef.current.rotation.y = Math.sin(Date.now() * 0.0008) * 0.35 + 0.2;
    }
    // Pulsing cyan workshop ring
    if (ringGlowRef.current) {
      const mat = ringGlowRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(Date.now() * 0.003) * 0.25;
      }
    }
  });

  return (
    <group position={[-4.2, 0.38, -4.0]} onClick={onClick}>
      {/* Hexagonal Platform Base */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.44, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Hexagonal Deck Top Plating */}
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <cylinderGeometry args={[2.42, 2.42, 0.04, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Glowing Cyan Circular Floor Ring "WORKSHOP ZONE" */}
      <mesh ref={ringGlowRef} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 2.05, 36]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.482, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.35, 1.45, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* 3 Access Ramps Connecting to Martian Soil at 120-degree intervals */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
        <group key={i} rotation={[0, angle + 0.52, 0]}>
          <mesh position={[0, 0.18, 2.95]} rotation={[0.22, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.08, 1.45]} />
            <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.35} />
          </mesh>
          {/* Yellow/Black Ramp Hazard Borders */}
          <mesh position={[-0.52, 0.2, 2.95]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.06, 0.1, 1.45]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0.52, 0.2, 2.95]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.06, 0.1, 1.45]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
        </group>
      ))}

      {/* Central Command Cylinder & Avionics Hub */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.1, 1.5, 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Gold Thermal Multi-Layer Insulation Cone */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.95, 0.75, 12]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Articulated Robotic Gantry Crane Arm (🏗️) */}
      <group ref={cranePivotRef} position={[0.55, 1.5, 0]}>
        {/* Crane Turret Base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 0.4, 12]} />
          <meshStandardMaterial color="#f97316" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Primary Boom Angled Upwards */}
        <mesh position={[0, 0.9, 0.35]} rotation={[0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 1.5, 0.14]} />
          <meshStandardMaterial color="#ea580c" metalness={0.7} />
        </mesh>
        {/* Hydraulic Piston */}
        <mesh position={[0, 0.65, 0.15]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
        </mesh>
        {/* Horizontal Forearm Boom */}
        <mesh position={[0, 1.6, 1.1]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.11, 0.11, 1.4]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        {/* Hoist Cable & Cargo Hook */}
        <mesh position={[0, 1.15, 1.6]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 1.6]}>
          <torusGeometry args={[0.09, 0.025, 8, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Workshop Halo Light */}
      <pointLight position={[0, 2.5, 0]} color="#38bdf8" intensity={2.8} distance={7} />

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="🏠 TRẠM ĐỔ BỘ"
        subLabel="WORKSHOP ZONE"
        position={[0, 3.4, 0]}
        color="#38bdf8"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 3. SOLAR RIDGE PEAK (ĐỒI ĐÓN NẮNG)
// Golden illuminated mountain peak for maximum solar recharging
// =========================================================================
function SolarRidgeDiorama({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const auraRef = useRef<Mesh>(null);

  useFrame(() => {
    if (auraRef.current) {
      auraRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[4.8, 0, -4.5]} onClick={onClick}>
      {/* Towering Jagged Mountain Peak */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[2.6, 5.2, 7]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.35}
          roughness={0.5}
          metalness={0.4}
          flatShading
        />
      </mesh>

      {/* Golden Sunlit Rock Facets */}
      <mesh position={[-0.4, 3.2, 0.3]} rotation={[0.3, 0.4, 0]} castShadow>
        <coneGeometry args={[1.4, 2.8, 5]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.3}
          flatShading
        />
      </mesh>

      {/* Radiating Golden Sunbeam Aura Cone */}
      <mesh ref={auraRef} position={[0, 4.8, 0]}>
        <cylinderGeometry args={[0.2, 1.8, 3.2, 12, 1, true]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight position={[0, 4.6, 0]} color="#fbbf24" intensity={3.5} distance={9} />

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="☀️ ĐỒI ĐÓN NẮNG"
        subLabel="SOLAR RIDGE (+25⚡)"
        position={[0, 5.8, 0]}
        color="#fbbf24"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 4. SAND TRAP HAZARD FIELD (BẪY CÁT LÚN)
// Fine golden silt bowl with red holographic warning grid
// =========================================================================
function SandTrapDiorama({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const gridRef = useRef<Group>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group position={[1.2, 0, -0.6]} onClick={onClick}>
      {/* Silt Depression Shadow (Đồng màu với đất Sao Hỏa, ngụy trang tự nhiên) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.98} />
      </mesh>

      {/* Red Glowing Isometric Wireframe Hazard Grid (Chỉ hiện khi được quét/chọn) */}
      {isSelected && (
        <>
          <group ref={gridRef} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 2.2, 24]} />
            <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.85} />
          </group>

          {/* Floating Hazard Diamond Beacon */}
          <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.42]} />
            <meshBasicMaterial color="#ef4444" wireframe />
          </mesh>
          <pointLight position={[0, 1.5, 0]} color="#ef4444" intensity={2.5} distance={5} />
        </>
      )}

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="⚠️ BẪY CÁT LÚN"
        subLabel="SAND TRAP HAZARD"
        position={[0, 2.2, 0]}
        color="#ef4444"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 5. SCIENCE CRYSTAL SAMPLE (MẪU ĐÁ KHOA HỌC)
// Vibrant multifaceted cyan/azure mineral geode crystals
// =========================================================================
function ScienceCrystalDiorama({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const crystalCluster = useMemo(() => [
    { pos: [0, 0.45, 0] as [number, number, number], rot: [0, 0.2, 0.1] as [number, number, number], scale: [0.35, 1.1, 0.35] as [number, number, number] },
    { pos: [-0.22, 0.35, 0.15] as [number, number, number], rot: [0.2, -0.3, -0.2] as [number, number, number], scale: [0.28, 0.85, 0.28] as [number, number, number] },
    { pos: [0.24, 0.32, -0.12] as [number, number, number], rot: [-0.2, 0.5, 0.25] as [number, number, number], scale: [0.3, 0.9, 0.3] as [number, number, number] },
    { pos: [0.12, 0.22, 0.25] as [number, number, number], rot: [0.3, 0.1, -0.15] as [number, number, number], scale: [0.22, 0.65, 0.22] as [number, number, number] },
    { pos: [-0.18, 0.25, -0.2] as [number, number, number], rot: [-0.25, -0.4, 0.3] as [number, number, number], scale: [0.25, 0.72, 0.25] as [number, number, number] },
  ], []);

  return (
    <group position={[-3.8, 0.3, 3.2]} onClick={onClick}>
      {/* Rocky Substrate Pedestal */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.25, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Cluster of Glowing Cyan Crystals */}
      {crystalCluster.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot} scale={c.scale} castShadow>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#38bdf8"
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
      ))}

      {/* Azure Radiance */}
      <pointLight position={[0, 0.8, 0]} color="#38bdf8" intensity={3.0} distance={4.5} />

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="💎 MẪU ĐÁ KHOA HỌC"
        subLabel="JEZERO HYDRATED SILICATE"
        position={[0, 1.8, 0]}
        color="#38bdf8"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 6. CRASHED SCRAP WRECKAGE (MẢNH VỠ TÀU CŨ)
// Aerospace wreckage with sky beacon beam
// =========================================================================
function CrashedScrapDiorama({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={[4.2, 0.35, 1.4]} onClick={onClick}>
      {/* Tilted Aerospace Hull Debris Frame */}
      <mesh position={[0, 0.45, 0]} rotation={[0.45, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.9]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Dark Titanium Structural Ribs */}
      <mesh position={[0.2, 0.5, 0.1]} rotation={[0.45, 0.6, -0.3]}>
        <boxGeometry args={[1.55, 0.12, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.95} />
      </mesh>

      {/* Ethereal Vertical Sky Beacon Light Beam */}
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 15, 12, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight position={[0, 0.8, 0]} color="#60a5fa" intensity={2.5} distance={5} />

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="🛰️ MẢNH VỠ TÀU CŨ"
        subLabel="CRASHED SCRAP (+20 ISRU)"
        position={[0, 2.2, 0]}
        color="#60a5fa"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 7. 3D MARS ROVER MINIATURE IN DIORAMA
// Equipped with active modular hardware and projecting expanding radar arcs
// =========================================================================
function MarsRoverDioramaUnit({
  state,
  isSelected,
  onClick,
}: {
  state: MissionState;
  isSelected: boolean;
  onClick: () => void;
}) {
  const radarWaveRef = useRef<Group>(null);
  const wheelsType = state.surface.equippedModules.wheels || 'slim_aluminum';
  const powerType = state.surface.equippedModules.power || 'solar_array';
  const sensorsType = state.surface.equippedModules.sensors || 'navcam';
  const commsType = state.surface.equippedModules.comms || 'uhf_antenna';

  // Radar expanding wave animation
  useFrame((_, delta) => {
    if (radarWaveRef.current) {
      radarWaveRef.current.children.forEach((child, i) => {
        const ring = child as Mesh;
        const progress = ((Date.now() * 0.0012 + i * 0.33) % 1);
        ring.scale.set(1 + progress * 2.8, 1 + progress * 2.8, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = Math.max(0, (1 - progress) * 0.7);
        }
      });
    }
  });

  return (
    <group position={[-0.2, 0.42, 1.8]} rotation={[0, -0.35, 0]} onClick={onClick}>
      {/* Dynamic Modular Mars Rover Model */}
      <group scale={[0.82, 0.82, 0.82]}>
        {/* Chassis Body */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.1, 0.45, 1.7]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Gold Thermal Blanket Top Shield */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.02, 0.04, 1.62]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* 6 Modular Wheels */}
        {([
          [-0.72, 0.12, 0.65],
          [0.72, 0.12, 0.65],
          [-0.78, 0.12, 0.0],
          [0.78, 0.12, 0.0],
          [-0.72, 0.12, -0.65],
          [0.72, 0.12, -0.65],
        ] as [number, number, number][]).map((pos, idx) => (
          <group key={idx} position={pos}>
            {wheelsType === 'wide_titan' ? (
              <WideTitanWheel />
            ) : wheelsType === 'adaptive_sma' ? (
              <AdaptiveSMAWheel />
            ) : (
              <SlimAluminumWheel />
            )}
          </group>
        ))}

        {/* Modular Power Source */}
        {powerType === 'mmrtg' ? <MmrtgNuclearPower /> : <SolarPanelsPower />}

        {/* Modular Sensors & Radar */}
        {sensorsType === 'rimfax_gpr' ? <RimfaxGprSensor /> : <NavCamSensor />}

        {/* Modular Comms Antenna */}
        {commsType === 'high_gain_dish' ? <HighGainDishComms /> : <UhfAntennaComms />}
      </group>

      {/* Concentric Expanding Cyan Radar Arcs Projecting Ahead ())) */}
      <group ref={radarWaveRef} position={[0, 0.08, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map(idx => (
          <mesh key={idx}>
            <ringGeometry args={[0.5, 0.58, 24, 1, 0, Math.PI]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Subtle Dust Tracks Behind Rover */}
      <mesh position={[0, 0.03, -1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshBasicMaterial color="#9a3412" transparent opacity={0.35} />
      </mesh>

      {/* 3D Holographic Pin */}
      <LandmarkPin
        label="🚜 XE TỰ HÀNH"
        subLabel="APOGEE 3D ROVER"
        position={[0, 1.9, 0]}
        color="#38bdf8"
        isSelected={isSelected}
      />
    </group>
  );
}

// =========================================================================
// 8. 3D FLOATING HOLOGRAPHIC LANDMARK PIN
// =========================================================================
function LandmarkPin({
  label,
  subLabel,
  position,
  color,
  isSelected,
}: {
  label: string;
  subLabel: string;
  position: [number, number, number];
  color: string;
  isSelected: boolean;
}) {
  const pinRef = useRef<Group>(null);

  useFrame(() => {
    if (pinRef.current) {
      pinRef.current.position.y = position[1] + Math.sin(Date.now() * 0.0025) * 0.08;
    }
  });

  return (
    <group ref={pinRef} position={position}>
      {/* Vertical Stanchion Light Needle */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {/* Glowing Diamond Node */}
      <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[isSelected ? 0.18 : 0.12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : 0.9}
        />
      </mesh>

      {/* Outer Pulse Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.9 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// =========================================================================
// 9. DIORAMA CAMERA RIG & INTERACTIVE DRAG-TO-ROTATE ORBIT
// =========================================================================
function DioramaCameraRig({
  rotationAngle,
}: {
  rotationAngle: number;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const radius = 18;
    const y = 14;
    const x = Math.sin(rotationAngle) * radius;
    const z = Math.cos(rotationAngle) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

// =========================================================================
// 10. MAIN MISSION SCENE COMPONENT
// =========================================================================
export function MissionScene({ state, onStationClick }: MissionSceneProps) {
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkKey>('lander');
  const [rotationAngle, setRotationAngle] = useState(0.85); // Natural isometric angle
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const activeLandmarkInfo = LANDMARK_DATA[selectedLandmark];

  // Mouse drag handlers for smooth orbit inspection
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    setRotationAngle(prev => prev - deltaX * 0.008);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className="scene-shell diorama-container"
      aria-label="2.5D Isometric Martian Geological Diorama"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        cursor: 'grab',
        height: '380px',
        position: 'relative',
        background: 'linear-gradient(180deg, #050811 0%, #0d1527 50%, #170d10 100%)',
      }}
    >
      <Canvas
        shadows
        orthographic
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
        gl={{ powerPreference: 'high-performance', antialias: true, stencil: false }}
        camera={{ zoom: 34, near: 0.1, far: 200, position: [14, 15, 14] }}
      >
        <DioramaCameraRig rotationAngle={rotationAngle} />

        {/* Authentic Mars Direct Sunlight & High-Contrast Shadows */}
        <ambientLight intensity={0.82} color="#7c2d12" />
        <directionalLight
          position={[14, 18, 12]}
          intensity={3.2}
          color="#fff7ed"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Soft fill light from crater horizon */}
        <directionalLight position={[-12, 8, -12]} intensity={0.4} color="#38bdf8" />

        {/* Background Celestial Bodies (Mars Sun with Blue Halo, Earth & Moon) */}
        <group position={[18, 22, -16]}>
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh>
            <sphereGeometry args={[3.2, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </mesh>
        </group>
        {/* Earth "Pale Blue Dot" & Moon in distant backdrop */}
        <group position={[-18, 20, -18]}>
          <mesh>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[1.2, 0.4, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>

        {/* 1. Geological Strata Block */}
        <GeologicalDioramaBase />

        {/* 2. Hexagonal Lander Base & Workshop Zone */}
        <HexagonalLanderDiorama
          isSelected={selectedLandmark === 'lander'}
          onClick={() => setSelectedLandmark('lander')}
        />

        {/* 3. Solar Ridge Peak */}
        <SolarRidgeDiorama
          isSelected={selectedLandmark === 'solar_ridge'}
          onClick={() => setSelectedLandmark('solar_ridge')}
        />

        {/* 4. Sand Trap Hazard Field */}
        <SandTrapDiorama
          isSelected={selectedLandmark === 'sand_trap'}
          onClick={() => setSelectedLandmark('sand_trap')}
        />

        {/* 5. Science Crystal Sample */}
        <ScienceCrystalDiorama
          isSelected={selectedLandmark === 'science'}
          onClick={() => setSelectedLandmark('science')}
        />

        {/* 6. Crashed Scrap Wreckage */}
        <CrashedScrapDiorama
          isSelected={selectedLandmark === 'scrap'}
          onClick={() => setSelectedLandmark('scrap')}
        />

        {/* 7. 3D Mars Rover Miniature */}
        <MarsRoverDioramaUnit
          state={state}
          isSelected={selectedLandmark === 'rover'}
          onClick={() => setSelectedLandmark('rover')}
        />
      </Canvas>

      {/* Quick Landmark Selector Bar (Top-Left) */}
      <div className="diorama-landmark-bar">
        {(Object.keys(LANDMARK_DATA) as LandmarkKey[]).map(key => {
          const item = LANDMARK_DATA[key];
          const isCurrent = selectedLandmark === key;
          return (
            <button
              key={key}
              type="button"
              className={`diorama-tab-btn ${isCurrent ? 'active' : ''}`}
              onClick={e => {
                e.stopPropagation();
                setSelectedLandmark(key);
              }}
            >
              <span>{item.title.split(' ')[0]}</span>
              <span className="tab-badge">{item.badge.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Camera Angle Presets (Top-Right) */}
      <div className="diorama-camera-controls">
        <button
          type="button"
          className="diorama-ctrl-btn"
          title="Góc nhìn Isometric chuẩn"
          onClick={e => {
            e.stopPropagation();
            setRotationAngle(0.85);
          }}
        >
          📐 Isometric
        </button>
        <button
          type="button"
          className="diorama-ctrl-btn"
          title="Xoay sang góc Trạm Đổ Bộ"
          onClick={e => {
            e.stopPropagation();
            setRotationAngle(2.3);
          }}
        >
          🏠 Lander
        </button>
        <button
          type="button"
          className="diorama-ctrl-btn"
          title="Xoay sang góc Đồi Nắng"
          onClick={e => {
            e.stopPropagation();
            setRotationAngle(-0.6);
          }}
        >
          ☀️ Ridge
        </button>
      </div>

      {/* Selected Landmark Telemetry HUD Card (Bottom Floating Drawer) */}
      {activeLandmarkInfo && (
        <div className="diorama-hud-card" onClick={e => e.stopPropagation()}>
          <div className="hud-card-header">
            <div>
              <span className="hud-kicker">{activeLandmarkInfo.badge}</span>
              <h3 className="hud-title">{activeLandmarkInfo.title}</h3>
              <span className="hud-coords">{activeLandmarkInfo.coords}</span>
            </div>
            {selectedLandmark === 'lander' && (
              <button
                type="button"
                className="hud-action-btn"
                onClick={() => onStationClick?.('design')}
              >
                🛠️ Vào Xưởng Đổi Phụ Kiện (Depot)
              </button>
            )}
            {selectedLandmark === 'rover' && (
              <button
                type="button"
                className="hud-action-btn cyan"
                onClick={() => onStationClick?.('operations')}
              >
                🎮 Lái Xe Thực Địa (Phase Ops)
              </button>
            )}
          </div>

          <p className="hud-summary">{activeLandmarkInfo.summary}</p>
          <div className="hud-tip-strip">
            <strong>Chiến thuật:</strong> {activeLandmarkInfo.tacticalTip}
          </div>

          <div className="hud-telemetry-grid">
            {activeLandmarkInfo.telemetry.map((t, idx) => (
              <div key={idx} className="hud-tele-item">
                <span className="tele-lbl">{t.label}</span>
                <span className="tele-val">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="diorama-footer-hint">
        🖱️ Giữ chuột & kéo để xoay 360° khối địa chất 2.5D · Click vào công trình để kiểm tra telemetry
      </div>
    </div>
  );
}
