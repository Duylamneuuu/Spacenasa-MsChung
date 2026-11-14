// Stable shared contract. Agree on changes with Duy, Bảo, and Hải before editing.
export type Phase = 'briefing' | 'design' | 'preflight' | 'launch' | 'operations' | 'debrief';
export type MissionResources = {
  budgetRemaining: number; // placeholder units until Sơn verifies data
  massKg: number;
  massLimitKg: number;
  powerAvailableW: number;
  powerRequiredW: number;
  sciencePotential: number; // game score, not an official NASA measurement
  risk: number; // game score, 0..100
};
export type MissionState = {
  phase: Phase;
  objectiveId: string;
  selectedModuleIds: string[];
  resources: MissionResources;
  eventIndex: number;
  lastMessage?: string;
  outcome?: 'success' | 'partial' | 'failure';
};
export type PlayerAction =
  | { type: 'SELECT_MODULE'; moduleId: string }
  | { type: 'REMOVE_MODULE'; moduleId: string }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'CHOOSE_EVENT'; eventId: string; optionId: string }
  | { type: 'RESET' };
