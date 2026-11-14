export type MissionId = 'first-survey' | 'dune-crossing';
export type TerrainKind = 'hard' | 'sand' | 'rock';
export type WheelId = 'light' | 'wide' | 'reinforced';
export type ScannerId = 'nav' | 'stereo';
export type InstrumentId = 'geology' | 'spectral';
export type StorageId = 'standard' | 'extended';
export type ModuleId = WheelId | ScannerId | InstrumentId | StorageId;
export type Cell = Readonly<{ x: number; z: number }>;
export type CellId = `${number}:${number}`;
export type SiteId = 'basalt' | 'vein' | 'strata';
export type RiskBand = 'low' | 'medium' | 'high';
export type Action =
  | { type: 'move'; to: Cell }
  | { type: 'scan' }
  | { type: 'analyze'; site: SiteId }
  | { type: 'transmit' }
  | { type: 'recharge'; minutes: 10 | 20 };
export type Loadout = {
  wheel: WheelId;
  scanner: ScannerId | null;
  instrument: InstrumentId | null;
  storage: StorageId;
  spares: readonly ModuleId[];
};
export type Mission = {
  id: MissionId; number: string; name: string; brief: string; terrain: string;
  start: Cell; targets: readonly SiteId[]; limit: number; budget: number; massCap: number;
};
export type Survey = { low: number; high: number };
export type Sample = { site: SiteId; score: number; credits: number };
export type MissionState = {
  mission: MissionId; loadout: Loadout; position: Cell; battery: number; elapsed: number;
  surveyed: Partial<Record<CellId, Survey>>; pending: readonly Sample[]; delivered: readonly Sample[];
  science: number; credits: number; used: number; charged: number; distance: number;
  energyByTerrain: Record<TerrainKind, number>; stops: number; trace: readonly Cell[];
  reason: string | null; outcome: 'success' | 'partial' | 'failure' | null;
};
export type ExecutionEvent = {
  kind: Action['type'] | 'stop'; state: MissionState;
  from: Cell; to: Cell; message?: string; actionIndex: number;
};
export type PlanPreview = {
  steps: readonly { from: Cell; to: Cell; risk: RiskBand; uncertain: boolean }[];
  energy: readonly [number, number]; minutes: readonly [number, number]; remaining: number;
  risk: RiskBand; unknown: number; warnings: readonly string[]; blocked: string | null;
};
export type ExecuteResult = { state: MissionState; events: readonly ExecutionEvent[] };

