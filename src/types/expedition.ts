export type MissionId = 'first-survey' | 'dune-crossing';
export type TerrainKind = 'hard' | 'sand' | 'rock';
export type WheelId = 'light' | 'wide' | 'reinforced';
export type ScannerId = 'nav' | 'stereo';
export type InstrumentId = 'geology' | 'spectral';
export type StorageId = 'standard' | 'extended';
export type ModuleId = WheelId | ScannerId | InstrumentId | StorageId;
export type Cell = Readonly<{ x: number; z: number }>;
export type CellId = `${number}:${number}`;
export type Waypoint = Cell;
export type SiteId = 'basalt' | 'vein' | 'strata';
export type RiskBand = 'low' | 'medium' | 'high';
export type ControlMode = 'planning' | 'driving' | 'paused';
export type DrivingInput = { forward: boolean; reverse: boolean; left: boolean; right: boolean; brake: boolean };
export type RoverPose = { heading: number; speed: number }; // radians (+Z forward), metres per second
export type StationaryAction =
  | { type: 'scan' }
  | { type: 'analyze'; site: SiteId }
  | { type: 'transmit' }
  | { type: 'recharge'; minutes: 10 | 20 };
export type Loadout = {
  wheel: WheelId; scanner: ScannerId | null; instrument: InstrumentId | null;
  storage: StorageId; spares: readonly ModuleId[];
};
export type Mission = {
  id: MissionId; number: string; name: string; brief: string; terrain: string;
  start: Cell; targets: readonly SiteId[]; limit: number; budget: number; massCap: number;
};
export type Survey = { low: number; high: number };
export type Sample = { site: SiteId; score: number; credits: number };
export type MissionState = {
  mission: MissionId; loadout: Loadout; position: Cell; pose: RoverPose; battery: number; elapsed: number;
  surveyed: Partial<Record<CellId, Survey>>; pending: readonly Sample[]; delivered: readonly Sample[];
  science: number; credits: number; used: number; charged: number; distance: number;
  energyByTerrain: Record<TerrainKind, number>; stops: number; trace: readonly Cell[];
  reason: string | null; outcome: 'success' | 'partial' | 'failure' | null;
};
export type PlanPreview = {
  steps: readonly { from: Cell; to: Cell; risk: RiskBand; uncertain: boolean }[];
  energy: readonly [number, number]; minutes: readonly [number, number]; remaining: number;
  risk: RiskBand; unknown: number; warnings: readonly string[]; blocked: string | null;
};
export type RouteEstimate = PlanPreview;
export type TerrainSample = { kind: TerrainKind; illumination: number; hazard: Survey };
export type DriveStepResult = { state: MissionState; terrain: TerrainSample; distance: number; stopped: boolean };

