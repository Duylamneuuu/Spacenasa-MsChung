import type { MissionState, PlayerAction, Phase } from '../types/game';

// Hải owns src/sim and src/data. These are wiring-only mock values,
// NOT validated mission data. Replace with Sơn-reviewed NASA-sourced values.
export function getInitialState(): MissionState {
  return {
    phase: 'briefing',
    objectiveId: 'demo-mission',
    selectedModuleIds: [],
    resources: {
      budgetRemaining: 100,
      massKg: 0,
      massLimitKg: 250,
      powerAvailableW: 250,
      powerRequiredW: 0,
      sciencePotential: 0,
      risk: 0,
    },
    eventIndex: 0,
    lastMessage: 'Scaffold only — science and gameplay are not implemented yet.',
  };
}

const phases: Phase[] = ['briefing', 'design', 'preflight', 'launch', 'operations', 'debrief'];

export function evaluateMission(_state: MissionState): {
  ok: boolean; blockers: string[]; warnings: string[];
} {
  return {
    ok: true, blockers: [],
    warnings: ['Placeholder only — no validated engineering feasibility checks yet.'],
  };
}

export function applyAction(state: MissionState, action: PlayerAction): MissionState {
  switch (action.type) {
    case 'RESET': return getInitialState();
    case 'SELECT_MODULE':
      return { ...state, selectedModuleIds: [...new Set([...state.selectedModuleIds, action.moduleId])] };
    case 'REMOVE_MODULE':
      return { ...state, selectedModuleIds: state.selectedModuleIds.filter(id => id !== action.moduleId) };
    case 'ADVANCE_PHASE':
      return { ...state, phase: phases[Math.min(phases.indexOf(state.phase) + 1, phases.length - 1)] };
    case 'CHOOSE_EVENT':
      return { ...state, eventIndex: state.eventIndex + 1 };
  }
}
