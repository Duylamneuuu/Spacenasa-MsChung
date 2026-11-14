import type { Cell, CellId, Loadout, ModuleId, TerrainKind, WheelId } from '../types/expedition';

// All balancing values are fictional game parameters. See docs/science/SOURCES.md.
export const WIDTH = 15;
export const HEIGHT = 11;
export const TILE_SIZE = 4.4; // render units / scenario metres per orthogonal step
export const CAPACITY = 100;
export const RESERVE = 15;
export const ROVER_BASE = 76;
export const LANDER_MASS = 124;
export const SUPPORT_MASS = 22;
export const BASE_BUDGET = 46;
export const SWAP_CREDITS = 4;
export const SWAP_MINUTES = 4;
export const key = (cell: Cell): CellId => `${cell.x}:${cell.z}`;
export const same = (a: Cell, b: Cell) => a.x === b.x && a.z === b.z;
export const inMap = ({ x, z }: Cell) => Number.isInteger(x) && Number.isInteger(z) && x >= 0 && z >= 0 && x < WIDTH && z < HEIGHT;
export const cells: Cell[] = Array.from({ length: WIDTH * HEIGHT }, (_, i) => ({ x: i % WIDTH, z: Math.floor(i / WIDTH) }));
export const terrainAt = ({ x, z }: Cell): TerrainKind =>
  x >= 5 && x <= 10 && z >= 3 && z <= 7 ? 'sand' :
    (x >= 5 && x <= 11 && z >= 8) || (x >= 12 && z <= 3) || (x <= 1 && z >= 7) ? 'rock' : 'hard';

export const TERRAIN = {
  hard: { name: 'Firm Ground', factor: 1, minutes: 2, risk: 0.12, spread: 0.06, color: '#ae6244' },
  sand: { name: 'Soft Sand', factor: 1.18, minutes: 2.5, risk: 0.58, spread: 0.16, color: '#d29358' },
  rock: { name: 'Sharp Rock', factor: 1.15, minutes: 2.7, risk: 0.54, spread: 0.16, color: '#81453a' },
} satisfies Record<TerrainKind, { name: string; factor: number; minutes: number; risk: number; spread: number; color: string }>;

export const WHEELS = {
  light: { energy: { hard: 0.8, sand: 1.8, rock: 1.6 }, risk: { hard: .8, sand: 1.44, rock: 1.34 } },
  wide: { energy: { hard: 1.25, sand: .85, rock: 1.25 }, risk: { hard: 1.1, sand: .61, rock: 1.09 } },
  reinforced: { energy: { hard: 1.15, sand: 1.3, rock: .75 }, risk: { hard: 1, sand: 1.04, rock: .56 } },
} satisfies Record<WheelId, { energy: Record<TerrainKind, number>; risk: Record<TerrainKind, number> }>;

export const MODULES = {
  light: { name: 'Lightweight Wheels', label: 'LIGHT', slot: 'wheel', mass: 14, cost: 10, description: 'Most efficient on firm ground; prone to losing traction in sand.' },
  wide: { name: 'Wide Traction Wheels', label: 'WIDE TRACTION', slot: 'wheel', mass: 32, cost: 23, description: 'Efficient in sand; heavier and uses more energy on firm ground.' },
  reinforced: { name: 'Reinforced Wheels', label: 'REINFORCED', slot: 'wheel', mass: 39, cost: 29, description: 'Reduce risk on sharp rock at the cost of added mass and expense.' },
  nav: { name: 'Navigation Camera', label: 'NAV', slot: 'scanner', mass: 7, cost: 8, description: 'Scans within 2 tiles for 6 EU per scan.' },
  stereo: { name: 'Extended Stereo Camera', label: 'STEREO', slot: 'scanner', mass: 16, cost: 17, description: 'Scans within 3 tiles for 8 EU, with more precise estimates.' },
  geology: { name: 'Rock Analyzer', label: 'GEOLOGY', slot: 'instrument', mass: 11, cost: 10, description: 'Analyzes each sample for 12 EU.' },
  spectral: { name: 'Mineral Spectrometer', label: 'SPECTRAL', slot: 'instrument', mass: 21, cost: 21, description: 'Adds 6 science points per sample and uses 16 EU per analysis.' },
  standard: { name: 'Standard Storage', label: 'STANDARD', slot: 'storage', mass: 4, cost: 4, description: 'Stores data for 1 sample before transmission.' },
  extended: { name: 'Extended Storage', label: 'EXTENDED', slot: 'storage', mass: 10, cost: 10, description: 'Stores data for up to 3 samples for a single transmission.' },
} as const satisfies Record<ModuleId, { name: string; label: string; slot: 'wheel' | 'scanner' | 'instrument' | 'storage'; mass: number; cost: number; description: string }>;

export const DEFAULT_LOADOUT: Loadout = { wheel: 'light', scanner: 'nav', instrument: 'geology', storage: 'standard', spares: [] };

