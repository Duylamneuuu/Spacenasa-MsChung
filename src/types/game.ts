// Shared types for APOGEE: MARS ROVER ARCHITECT
// NASA Space Apps Challenge 2026 - Challenge 13: Space Mission Design Game

export type Phase = 'startmenu' | 'briefing' | 'design' | 'preflight' | 'launch' | 'operations' | 'debrief';

export type LandingSiteId = 'utopia_planitia' | 'jezero_crater' | 'valles_marineris';

export interface LandingSite {
  id: LandingSiteId;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  budgetMUSD: number;
  requiredDeltaVMs: number;       // e.g. 3800, 4100, 4350 m/s
  requiredDeltaVKmS: number;      // e.g. 3.8, 4.1, 4.35 km/s
  flatRockPct: number;
  sandTrapPct: number;
  solarRidgePct: number;
  description: string;
  strategicTip: string;
}

export type MissionResources = {
  budgetRemaining: number;        // in $M USD
  totalBudgetMUSD: number;        // initial budget based on landing site
  massKg: number;                 // current total mass (rover loadout + lander depot spares)
  roverMassKg: number;            // mass on the rover itself
  depotMassKg: number;            // mass of spare modules in lander depot
  massLimitKg: number;            // launcher payload limit
  powerAvailableW: number;        // normalized 100⚡ scale
  powerRequiredW: number;
  sciencePotential: number;       // science potential score (0..100)
  risk: number;                   // risk index (0..100)
  deltaVAvailableKmS: number;     // available Delta-v (km/s)
  deltaVRequiredKmS: number;      // required Delta-v for Mars orbit injection & landing
  commsBandwidthKbps: number;
};

// 4 Core Rover Module Categories + 1 Launcher Category
export type RoverModuleCategory = 'wheels' | 'sensors' | 'power' | 'comms' | 'launcher';

export interface RoverModule {
  id: string;
  category: RoverModuleCategory;
  name: string;
  costMUSD: number;
  massKg: number;
  // Wheels specific
  powerDrainFlat?: number;        // ⚡ per flat rock tile
  powerDrainSand?: number;        // ⚡ per sand trap tile
  stuckRiskSand?: number;         // probability of getting stuck (0.0 to 1.0)
  // Sensors specific
  scanPowerDrain?: number;        // ⚡ per scan operation
  scanRadius?: number;            // radius in tiles
  revealsHiddenSand?: boolean;    // true if GPR detects sub-surface hazards
  // Power source specific
  chargeRateRidge?: number;       // ⚡ gained per turn on Solar Ridge
  chargeRateEverywhere?: number;  // ⚡ gained per turn anywhere (RTG)
  // Comms specific
  transmitPowerDrain?: number;    // ⚡ per transmission
  maxDistanceToLanderForComms?: number; // 3 for UHF, Infinity for High-Gain Dish
  // Launcher specific
  maxPayloadMassKg?: number;      // Max mass launcher can throw to Mars
  deltaVBoostKmS?: number;        // Delta-v boost provided by upper stage
  // Crafting / Economy
  craftCostScrap: number;         // ISRU alloy scrap needed to 3D print at Lander
  craftCostCredits: number;       // Mission credits needed to purchase at Lander
  // Narrative & NASA references
  description: string;
  pros: string;
  cons: string;
  nasaReference: string;
}

// Mars Grid Map Tile Types
export type RoverTileType =
  | 'LANDER_BASE'         // Base station for module swap, 3D print crafting, UHF relay
  | 'FLAT_ROCK'           // Smooth basalt / firm terrain
  | 'HIDDEN_SAND_TRAP'    // Sand dune / trap (initially disguised as dust unless scanned by GPR)
  | 'SOLAR_RIDGE'         // Elevated ridge with optimal sunlight for Solar Array charging ☀️
  | 'SCIENCE_SAMPLE'      // High-priority astrobiology rock (adds Raw Science Data)
  | 'DEBRIS_SCRAP';       // Crashed skycrane/heatshield debris (adds ISRU Alloy Scrap)

export interface RoverMapTile {
  x: number;
  y: number;
  type: RoverTileType;
  isScanned: boolean;             // True if revealed by sensor scan or nearby vision
  isSandTrapRevealed: boolean;    // True if RIMFAX GPR scanned this sand trap
  hasCollectedSample?: boolean;   // True if science rock was sampled
  hasCollectedScrap?: boolean;    // True if scrap metal was salvaged
}

export type OutcomeRank = 'S-Rank' | 'B-Rank' | 'F-Rank';

export interface RoverSurfaceState {
  roverX: number;
  roverY: number;
  isStuck: boolean;
  batteryPower: number;           // Current battery: 0 to 100 ⚡
  maxBatteryPower: number;        // Max capacity: 100 ⚡
  equippedModules: {
    wheels: string;
    sensors: string;
    power: string;
    comms: string;
    launcher: string;
  };
  landerInventory: string[];      // Module IDs available as spare/crafted at Lander Base
  gridWidth: number;
  gridHeight: number;
  tiles: RoverMapTile[][];
  rawScienceMB: number;           // Unsent data collected on rover
  transmittedScienceMB: number;   // Data safely received at NASA Earth
  isruAlloyScrap: number;         // Salvaged 3D printing scrap
  missionCreditsMUSD: number;     // Funding earned from transmitted science
  turnCount: number;
  logs: string[];
  missionRank?: OutcomeRank;
}

export type MissionState = {
  phase: Phase;
  objectiveId: string;
  activeLandingSite: LandingSiteId;
  selectedModuleIds: string[];    // Active equipment on rover + launcher
  depotModuleIds: string[];       // Extra spare modules packed in Lander Depot
  resources: MissionResources;
  eventIndex: number;
  lastMessage?: string;
  outcome?: 'success' | 'partial' | 'failure';
  surface: RoverSurfaceState;
};

export type PlayerAction =
  | { type: 'SELECT_LANDING_SITE'; siteId: LandingSiteId }
  | { type: 'SELECT_MODULE'; moduleId: string }
  | { type: 'REMOVE_MODULE'; moduleId: string }
  | { type: 'TOGGLE_DEPOT_MODULE'; moduleId: string }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'LAUNCH_MISSION' }
  | { type: 'CHOOSE_EVENT'; eventId: string; optionId: string }
  | { type: 'MOVE_ROVER'; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }
  | { type: 'MOVE_ROVER_TO'; targetX: number; targetY: number }
  | { type: 'SCAN_TERRAIN' }
  | { type: 'SOLAR_CHARGE' }
  | { type: 'TRANSMIT_DATA' }
  | { type: 'UNSTUCK_ROVER' }
  | { type: 'SWAP_MODULE'; category: RoverModuleCategory; newModuleId: string }
  | { type: 'CRAFT_MODULE'; moduleId: string }
  | { type: 'RESET' };
