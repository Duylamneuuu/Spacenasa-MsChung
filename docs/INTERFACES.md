# Integration contracts v0 (review together before building)

## Separation of concerns

```
App/UI (coordinator) → Game controller / state → Pure simulation → Updated state
                         ↓
                 Three.js scene observes state
```

The UI should **not** calculate mission physics. The 3D scene should **not** own budget or success rules.

## Shared types proposal (src/types/game.ts)

```ts
export type Phase = 'briefing' | 'design' | 'preflight' | 'launch' | 'operations' | 'debrief';

export type MissionResources = {
  budgetRemaining: number;  // units and scale must be documented
  massKg: number;
  massLimitKg: number;
  powerAvailableW: number;
  powerRequiredW: number;
  sciencePotential: number; // educational game scoring, not official NASA measurement
  risk: number;             // normalized 0..100 educational score
};

export type ModuleChoice = {
  id: string;
  category: 'launcher' | 'payload' | 'power' | 'comms';
  name: string;
  cost: number;
  massKg: number;
  powerW: number;
  scienceGain?: number;
  description: string;
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
```

These types are **proposal** only. The integrator should freeze the file after a 10-minute team review. Agree module counts and whether budgetRemaining is derived from selected modules instead of stored.

## Module APIs (proposal)

```ts
// Simulation contributor
export function getInitialState(): MissionState;
export function applyAction(state: MissionState, action: PlayerAction): MissionState;
export function evaluateMission(state: MissionState): {
  ok: boolean;
  blockers: string[];
  warnings: string[];
};

// Scene contributor
export type MissionSceneProps = {
  state: MissionState;
  onStationClick?: (station: 'briefing' | 'design' | 'launch' | 'operations') => void;
};
export function MissionScene(props: MissionSceneProps): JSX.Element;

// UI coordinator
// App owns phase routing and dispatch; scene receives only state and callbacks.
```

## Done criteria

- All code TypeScript, exports are named, no hidden global mutable state.
- The simulation has at least one success/failure path tested deterministically.
- Scene loads even with zero imported 3D assets (placeholder primitives).
- App can run with mocked simulation data before source datasets arrive.
- No contributor edits other owner directories without direct agreement.
- Shared imports should use paths that exist; no circular dependencies.
