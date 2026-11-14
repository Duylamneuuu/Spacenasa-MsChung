import type { RoverMapTile, RoverTileType, LandingSiteId } from '../types/game';

export const MARS_GRID_WIDTH = 8;
export const MARS_GRID_HEIGHT = 8;

// Specific curated 8x8 tactical grid layouts for the 3 landing sites
const MAP_LAYOUTS: Record<LandingSiteId, RoverTileType[][]> = {
  // Utopia Planitia: 75% flat rock, 15% sand traps, abundant solar exposure
  utopia_planitia: [
    ['LANDER_BASE', 'FLAT_ROCK', 'SOLAR_RIDGE', 'FLAT_ROCK', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'FLAT_ROCK', 'SOLAR_RIDGE'],
    ['FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK'],
    ['SOLAR_RIDGE', 'FLAT_ROCK', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'SOLAR_RIDGE', 'SCIENCE_SAMPLE'],
    ['FLAT_ROCK', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'DEBRIS_SCRAP'],
    ['FLAT_ROCK', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK'],
    ['FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK'],
    ['SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'FLAT_ROCK'],
    ['FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'FLAT_ROCK', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'FLAT_ROCK', 'SOLAR_RIDGE'],
  ],

  // Jezero Crater: 50% flat rock, 35% sand traps around ancient delta
  jezero_crater: [
    ['LANDER_BASE', 'FLAT_ROCK', 'SOLAR_RIDGE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'SOLAR_RIDGE'],
    ['FLAT_ROCK', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK'],
    ['SOLAR_RIDGE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'SOLAR_RIDGE', 'SCIENCE_SAMPLE'],
    ['FLAT_ROCK', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'DEBRIS_SCRAP', 'HIDDEN_SAND_TRAP'],
    ['HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'FLAT_ROCK'],
    ['FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'HIDDEN_SAND_TRAP'],
    ['SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'FLAT_ROCK'],
    ['FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SOLAR_RIDGE', 'DEBRIS_SCRAP'],
  ],

  // Valles Marineris: 40% flat, 45% sand traps, canyon chasm, sparse solar
  valles_marineris: [
    ['LANDER_BASE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'SOLAR_RIDGE'],
    ['HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'DEBRIS_SCRAP', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP'],
    ['FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'SOLAR_RIDGE', 'SCIENCE_SAMPLE'],
    ['FLAT_ROCK', 'DEBRIS_SCRAP', 'HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'DEBRIS_SCRAP', 'HIDDEN_SAND_TRAP'],
    ['HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'HIDDEN_SAND_TRAP', 'SCIENCE_SAMPLE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK'],
    ['HIDDEN_SAND_TRAP', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'DEBRIS_SCRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'SCIENCE_SAMPLE'],
    ['SCIENCE_SAMPLE', 'SOLAR_RIDGE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'SOLAR_RIDGE', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP'],
    ['FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'SCIENCE_SAMPLE', 'HIDDEN_SAND_TRAP', 'FLAT_ROCK', 'HIDDEN_SAND_TRAP', 'DEBRIS_SCRAP'],
  ],
};

/**
 * Generate initial Mars surface map based on chosen landing site.
 */
export function createInitialMarsMap(siteId: LandingSiteId = 'jezero_crater'): RoverMapTile[][] {
  const layout = MAP_LAYOUTS[siteId] ?? MAP_LAYOUTS.jezero_crater;
  const tiles: RoverMapTile[][] = [];

  for (let y = 0; y < MARS_GRID_HEIGHT; y++) {
    const row: RoverMapTile[] = [];
    for (let x = 0; x < MARS_GRID_WIDTH; x++) {
      const type = layout[y]?.[x] ?? 'FLAT_ROCK';
      // Pre-scout area immediately surrounding the lander base (Manhattan distance <= 1)
      const distToLander = Math.abs(x - 0) + Math.abs(y - 0);
      const isInitialScanned = distToLander <= 1;

      row.push({
        x,
        y,
        type,
        isScanned: isInitialScanned,
        isSandTrapRevealed: isInitialScanned && type === 'HIDDEN_SAND_TRAP',
        hasCollectedSample: false,
        hasCollectedScrap: false,
      });
    }
    tiles.push(row);
  }

  return tiles;
}

export const TILE_METADATA: Record<RoverTileType, { name: string; icon: string; description: string; color: string }> = {
  LANDER_BASE: {
    name: 'Lander Base Station',
    icon: '🏠',
    description: 'Touchdown site. Access Lander Depot to swap spare wheels, UHF antenna relay, and 3D printing fabricator.',
    color: '#38bdf8',
  },
  FLAT_ROCK: {
    name: 'Basalt Flat Rock',
    icon: '🪨',
    description: 'Solid volcanic bedrock. Low rolling resistance for slim wheels (only 4⚡/tile).',
    color: '#94a3b8',
  },
  HIDDEN_SAND_TRAP: {
    name: 'Concealed Sand Trap',
    icon: '⚠️',
    description: 'Deep dune sand disguised beneath dust. 50% stuck risk for slim wheels unless scanned by RIMFAX GPR.',
    color: '#f59e0b',
  },
  SOLAR_RIDGE: {
    name: 'Sunlit Solar Ridge',
    icon: '☀️',
    description: 'Elevated ridge catching maximum Martian sunlight. Rapidly charges solar arrays (+25⚡/turn).',
    color: '#fde047',
  },
  SCIENCE_SAMPLE: {
    name: 'Astrobiology Science Sample',
    icon: '💎',
    description: 'Ancient lacustrine mudstone rock containing biosignature potential. Collect for +50 MB science data.',
    color: '#a855f7',
  },
  DEBRIS_SCRAP: {
    name: 'Spacecraft Debris Scrap',
    icon: '🛰️',
    description: 'Salvageable titanium & alloy wreckage from the skycrane descent stage. Provides +2 ISRU Alloy Scrap.',
    color: '#10b981',
  },
};
