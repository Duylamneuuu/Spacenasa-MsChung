// Mathematical terrain model & landmark coordinates for APOGEE 3D Open-World Mars Exploration

export const WORLD_SIZE = 240; // 240m x 240m open world terrain

/**
 * Returns the exact elevation Y for any world coordinate (X, Z).
 * Guaranteed flat around the Lander Base at (0, 0) up to radius 12m.
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromOrigin = Math.sqrt(x * x + z * z);
  if (distFromOrigin < 12) {
    return 0; // Flat touchdown pad for the lander
  }

  const smoothFactor = Math.min(1, (distFromOrigin - 12) / 8);

  // Multi-frequency sinusoidal terrain waves
  const wave1 = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 4.2;
  const wave2 = Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.07 + 0.8) * 1.8;
  const wave3 = Math.cos(x * 0.018 - z * 0.024) * 3.5;

  return (wave1 + wave2 + wave3) * smoothFactor;
}

/**
 * Computes terrain slope pitch & roll for chassis orientation.
 */
export function getTerrainSlope(x: number, z: number): { pitch: number; roll: number } {
  const delta = 0.6;
  const hx1 = getTerrainHeight(x + delta, z);
  const hx2 = getTerrainHeight(x - delta, z);
  const hz1 = getTerrainHeight(x, z + delta);
  const hz2 = getTerrainHeight(x, z - delta);

  const roll = Math.atan2(hx1 - hx2, delta * 2);
  const pitch = -Math.atan2(hz1 - hz2, delta * 2);

  return { pitch, roll };
}

/**
 * Computes exact normalized terrain surface normal vector (Nx, Ny, Nz) at (x, z).
 */
export function getTerrainNormal(x: number, z: number): [number, number, number] {
  const delta = 0.5;
  const dhdx = (getTerrainHeight(x + delta, z) - getTerrainHeight(x - delta, z)) / (delta * 2);
  const dhdz = (getTerrainHeight(x, z + delta) - getTerrainHeight(x, z - delta)) / (delta * 2);

  // Surface normal vector = (-dh/dx, 1, -dh/dz) normalized
  const len = Math.sqrt(dhdx * dhdx + 1 + dhdz * dhdz);
  return [-dhdx / len, 1 / len, -dhdz / len];
}

// =========================================================================
// 3D WORLD LANDMARK COORDINATES
// =========================================================================

export interface WorldObject3D {
  id: string;
  name: string;
  x: number;
  z: number;
  radius: number;
}

export interface ScienceOutcrop3D extends WorldObject3D {
  collected: boolean;
  valueMB: number;
}

export interface DebrisSite3D extends WorldObject3D {
  salvaged: boolean;
  scrapAmount: number;
}

export interface SandTrap3D extends WorldObject3D {
  revealed: boolean;
  revealedUntil?: number; // timestamp (ms) until when the radar detection remains active
}

// Center Lander Base Depot
export const LANDER_BASE_3D: WorldObject3D = {
  id: 'lander_base',
  name: 'Lander Base Station',
  x: 0,
  z: 0,
  radius: 8.5,
};

// 4 Elevated Sunlit Ridges
export const SOLAR_RIDGES_3D: WorldObject3D[] = [
  { id: 'ridge_alpha', name: 'Alpha Solar Ridge', x: 42, z: 38, radius: 15 },
  { id: 'ridge_bravo', name: 'Bravo Canyon Ridge', x: -52, z: 42, radius: 16 },
  { id: 'ridge_charlie', name: 'Charlie Plateau', x: 22, z: -64, radius: 15 },
  { id: 'ridge_delta', name: 'Delta Crest', x: -58, z: -48, radius: 14 },
];

// 6 Treacherous Concealed Sand Trap Zones
export const INITIAL_SAND_TRAPS_3D: SandTrap3D[] = [
  { id: 'sand_1', name: 'Troy Dune Drift', x: 26, z: 18, radius: 14, revealed: false },
  { id: 'sand_2', name: 'Gusev Sand Sea', x: -32, z: 22, radius: 15, revealed: false },
  { id: 'sand_3', name: 'Perilune Basin', x: 54, z: -26, radius: 16, revealed: false },
  { id: 'sand_4', name: 'Chasm Ripple Field', x: -42, z: -46, radius: 15, revealed: false },
  { id: 'sand_5', name: 'North Delta Slump', x: 16, z: 62, radius: 13, revealed: false },
  { id: 'sand_6', name: 'South Escarpment Trap', x: -22, z: -76, radius: 14, revealed: false },
];

// 5 Astrobiology Core Sample Outcrops
export const INITIAL_SCIENCE_SAMPLES_3D: ScienceOutcrop3D[] = [
  { id: 'sample_1', name: 'Ancient Delta Mudstone', x: 38, z: 22, radius: 4.5, collected: false, valueMB: 50 },
  { id: 'sample_2', name: 'Olivine Carbonate Outcrop', x: -46, z: 28, radius: 4.5, collected: false, valueMB: 50 },
  { id: 'sample_3', name: 'Lacustrine Clay Pillar', x: 68, z: -32, radius: 4.5, collected: false, valueMB: 50 },
  { id: 'sample_4', name: 'Sulfur Hydrothermal Vent', x: -36, z: -58, radius: 4.5, collected: false, valueMB: 50 },
  { id: 'sample_5', name: 'Crater Rim Impactite', x: 22, z: 78, radius: 4.5, collected: false, valueMB: 50 },
];

// 4 Crashed Spacecraft Debris Sites
export const INITIAL_DEBRIS_SITES_3D: DebrisSite3D[] = [
  { id: 'debris_1', name: 'Skycrane Impact Plate', x: 18, z: -36, radius: 4.5, salvaged: false, scrapAmount: 2 },
  { id: 'debris_2', name: 'Heatshield Fragment', x: -52, z: -16, radius: 4.5, salvaged: false, scrapAmount: 2 },
  { id: 'debris_3', name: 'Backshell Titan Alloy', x: 72, z: 46, radius: 4.5, salvaged: false, scrapAmount: 2 },
  { id: 'debris_4', name: 'Auxiliary Thruster Module', x: -16, z: 56, radius: 4.5, salvaged: false, scrapAmount: 2 },
];
