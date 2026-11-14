import type { Cell, Mission, MissionId, SiteId } from '../types/expedition';

export const SITES = {
  basalt: { name: 'Basalt Outcrop', code: 'S-01', cell: { x: 4, z: 3 }, science: 20, credits: 8, detail: 'Document a volcanic rock outcrop as a reference for comparison.' },
  vein: { name: 'Mineral Vein', code: 'S-02', cell: { x: 4, z: 7 }, science: 30, credits: 12, detail: 'Compare mineral signatures at the edge of the plain.' },
  strata: { name: 'Sedimentary Cliff', code: 'S-03', cell: { x: 12, z: 5 }, science: 60, credits: 24, detail: 'Record data from exposed rock layers beyond the dune field.' },
} satisfies Record<SiteId, { name: string; code: string; cell: Cell; science: number; credits: number; detail: string }>;

export const MISSIONS = {
  'first-survey': { id: 'first-survey', number: '01', name: 'First Survey', brief: 'Map the area around the lander and transmit data from your first two sample sites.', terrain: 'Plains · 2 sample sites', start: { x: 2, z: 5 }, targets: ['basalt', 'vein'], limit: 90, budget: 132, massCap: 322 },
  'dune-crossing': { id: 'dune-crossing', number: '02', name: 'The Dune Crossing', brief: 'Reach the sedimentary cliff to the east. Take the shortcut across the sand or detour north over firm ground.', terrain: 'Dune field · 1 sample site', start: { x: 2, z: 5 }, targets: ['strata'], limit: 106, budget: 146, massCap: 337 },
} as const satisfies Record<MissionId, Mission>;

export const DUNE_NORTH: readonly Cell[] = [{ x: 4, z: 2 }, { x: 11, z: 2 }, { x: 11, z: 5 }, SITES.strata.cell];
export const DUNE_ROCK: readonly Cell[] = [{ x: 4, z: 8 }, { x: 11, z: 8 }, SITES.strata.cell];

