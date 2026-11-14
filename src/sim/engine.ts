// High-level simulation orchestrator for APOGEE: MARS ROVER ARCHITECT
// NASA Space Apps Challenge 2026 - Challenge 13: Space Mission Design Game

import type { MissionState, PlayerAction, Phase, MissionResources, LandingSiteId } from '../types/game';
import { ROVER_MODULES, DEFAULT_STARTING_EQUIPMENT } from '../data/roverModules';
import { LANDING_SITES, DEFAULT_LANDING_SITE_ID } from '../data/missionObjective';
import {
  createInitialSurfaceState,
  moveRover,
  moveRoverTo,
  solarCharge,
  scanTerrain,
  transmitData,
  unstuckRover,
  swapModuleAtLander,
  craftModuleAtLander,
  calculateMissionOutcome,
} from './roverEngine';

const PHASES: Phase[] = ['startmenu', 'briefing', 'design', 'preflight', 'launch', 'operations', 'debrief'];

/**
 * Calculates current mission resources based on active equipment, depot spares, and landing site.
 */
export function calculateResources(
  selectedModuleIds: string[],
  depotModuleIds: string[] = [],
  siteId: LandingSiteId = DEFAULT_LANDING_SITE_ID
): MissionResources {
  const site = LANDING_SITES[siteId] ?? LANDING_SITES.jezero_crater;
  let roverCost = 0;
  let roverMass = 0;
  let depotCost = 0;
  let depotMass = 0;
  let massLimit = 350; // default for Atlas V
  let deltaVBase = 4.9;

  // Active rover modules
  for (const id of selectedModuleIds) {
    const mod = ROVER_MODULES[id];
    if (mod) {
      roverCost += mod.costMUSD;
      roverMass += mod.massKg;
      if (mod.category === 'launcher') {
        massLimit = mod.maxPayloadMassKg ?? 350;
        deltaVBase = mod.deltaVBoostKmS ?? 4.9;
      }
    }
  }

  // Lander depot spare modules
  for (const id of depotModuleIds) {
    const mod = ROVER_MODULES[id];
    if (mod) {
      depotCost += mod.costMUSD;
      depotMass += mod.massKg;
    }
  }

  const totalCost = roverCost + depotCost;
  const totalMass = roverMass + depotMass;

  // Tsiolkovsky penalty: Total mass (rover + depot spares) reduces effective launch Delta-v
  // Every 100 kg penalizes Delta-v by 0.25 km/s
  const massPenalty = (totalMass / 100) * 0.25;
  const effectiveDeltaV = Math.max(1.5, deltaVBase - massPenalty);

  const budgetRemaining = site.budgetMUSD - totalCost;
  const requiredDeltaV = site.requiredDeltaVKmS;

  let risk = 15;
  if (totalMass > massLimit) risk += 50;
  if (effectiveDeltaV < requiredDeltaV) risk += 30;
  if (budgetRemaining < 0) risk += 20;

  return {
    budgetRemaining,
    totalBudgetMUSD: site.budgetMUSD,
    massKg: totalMass,
    roverMassKg: roverMass,
    depotMassKg: depotMass,
    massLimitKg: massLimit,
    powerAvailableW: 100, // Normalized 100⚡ scale
    powerRequiredW: 20,
    sciencePotential: 85,
    risk: Math.min(100, risk),
    deltaVAvailableKmS: Number(effectiveDeltaV.toFixed(2)),
    deltaVRequiredKmS: requiredDeltaV,
    commsBandwidthKbps: 128,
  };
}

export function getInitialState(siteId: LandingSiteId = DEFAULT_LANDING_SITE_ID): MissionState {
  const initialSelected = Object.values(DEFAULT_STARTING_EQUIPMENT);
  const initialDepot = ['wide_titan']; // 1 spare tire in depot by default
  const resources = calculateResources(initialSelected, initialDepot, siteId);
  const surface = createInitialSurfaceState(
    DEFAULT_STARTING_EQUIPMENT,
    ['slim_aluminum', 'wide_titan'],
    siteId
  );

  return {
    phase: 'startmenu',
    objectiveId: siteId,
    activeLandingSite: siteId,
    selectedModuleIds: initialSelected,
    depotModuleIds: initialDepot,
    resources,
    eventIndex: 0,
    lastMessage: 'Mission initialized: APOGEE Mars Rover Architect ready for briefing.',
    surface,
  };
}

export function evaluateMission(state: MissionState): {
  ok: boolean;
  blockers: string[];
  warnings: string[];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const site = LANDING_SITES[state.activeLandingSite] ?? LANDING_SITES.jezero_crater;

  // 1. Budget check
  if (state.resources.budgetRemaining < 0) {
    blockers.push(`Budget overrun: Exceeded $${site.budgetMUSD}M cap by $${Math.abs(state.resources.budgetRemaining)}M.`);
  }

  // 2. Mass limit check
  if (state.resources.massKg > state.resources.massLimitKg) {
    blockers.push(
      `Overweight: Combined payload mass (${state.resources.massKg} kg = ${state.resources.roverMassKg} kg rover + ${state.resources.depotMassKg} kg depot) exceeds launcher limit (${state.resources.massLimitKg} kg).`
    );
  }

  // 3. Delta-v check
  if (state.resources.deltaVAvailableKmS < state.resources.deltaVRequiredKmS) {
    blockers.push(
      `Insufficient Delta-v: Available (${state.resources.deltaVAvailableKmS} km/s) < Required (${state.resources.deltaVRequiredKmS} km/s) for Mars transit & capture.`
    );
  }

  // 4. Operational warnings
  if (state.surface.equippedModules.wheels === 'slim_aluminum' && site.sandTrapPct > 20) {
    warnings.push(`Tactical warning: Slim Aluminum wheels equipped on ${site.name} (${site.sandTrapPct}% sand traps) - High risk of immobilization!`);
  }
  if (state.surface.equippedModules.power === 'solar_array' && site.difficulty === 'Advanced') {
    warnings.push('Tactical warning: Solar arrays in Valles Marineris face reduced sunlight due to canyon shadow.');
  }
  if (state.surface.equippedModules.comms === 'uhf_antenna') {
    warnings.push('Comms notice: UHF Antenna operates within 3 tiles of Lander Base. High-Gain Dish recommended for long journeys.');
  }

  return {
    ok: blockers.length === 0,
    blockers,
    warnings,
  };
}

export function applyAction(state: MissionState, action: PlayerAction): MissionState {
  switch (action.type) {
    case 'RESET':
      return getInitialState(state.activeLandingSite);

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'ADVANCE_PHASE': {
      const curIdx = PHASES.indexOf(state.phase);
      const nextPhase = PHASES[Math.min(curIdx + 1, PHASES.length - 1)];
      let outcome = state.outcome;
      if (nextPhase === 'debrief') {
        const evalRes = calculateMissionOutcome(state.surface, state.resources);
        outcome = evalRes.rank === 'S-Rank' ? 'success' : evalRes.rank === 'B-Rank' ? 'partial' : 'failure';
      }
      return { ...state, phase: nextPhase, outcome };
    }

    case 'SELECT_LANDING_SITE': {
      const siteId = action.siteId;
      const resources = calculateResources(state.selectedModuleIds, state.depotModuleIds, siteId);
      const surface = createInitialSurfaceState(
        state.surface.equippedModules,
        [...state.selectedModuleIds, ...state.depotModuleIds],
        siteId
      );
      const site = LANDING_SITES[siteId];

      return {
        ...state,
        activeLandingSite: siteId,
        objectiveId: siteId,
        resources,
        surface,
        lastMessage: `Selected landing site: ${site.name} (Budget: $${site.budgetMUSD}M, Required Δv: ${site.requiredDeltaVMs} m/s).`,
      };
    }

    case 'SELECT_MODULE': {
      const mod = ROVER_MODULES[action.moduleId];
      if (!mod) return state;

      // Replace module of the same category in active loadout
      const currentOthers = state.selectedModuleIds.filter(id => {
        const m = ROVER_MODULES[id];
        return m && m.category !== mod.category;
      });
      const newSelected = [...currentOthers, mod.id];
      const resources = calculateResources(newSelected, state.depotModuleIds, state.activeLandingSite);

      // Sync equipped modules in surface state
      const nextEquipped = { ...state.surface.equippedModules, [mod.category]: mod.id };
      const nextSurface = {
        ...state.surface,
        equippedModules: nextEquipped,
        landerInventory: Array.from(new Set([...state.surface.landerInventory, mod.id, ...state.depotModuleIds])),
      };

      return {
        ...state,
        selectedModuleIds: newSelected,
        resources,
        surface: nextSurface,
        lastMessage: `Equipped ${mod.name} (${mod.category}).`,
      };
    }

    case 'TOGGLE_DEPOT_MODULE': {
      const mod = ROVER_MODULES[action.moduleId];
      if (!mod || mod.category === 'launcher') return state;

      let newDepot: string[];
      if (state.depotModuleIds.includes(action.moduleId)) {
        newDepot = state.depotModuleIds.filter(id => id !== action.moduleId);
      } else {
        newDepot = [...state.depotModuleIds, action.moduleId];
      }

      const resources = calculateResources(state.selectedModuleIds, newDepot, state.activeLandingSite);
      const nextSurface = {
        ...state.surface,
        landerInventory: Array.from(new Set([...state.selectedModuleIds, ...newDepot])),
      };

      return {
        ...state,
        depotModuleIds: newDepot,
        resources,
        surface: nextSurface,
        lastMessage: state.depotModuleIds.includes(action.moduleId)
          ? `Removed ${mod.name} from Lander Depot.`
          : `Stowed ${mod.name} in Lander Depot.`,
      };
    }

    case 'REMOVE_MODULE': {
      const newSelected = state.selectedModuleIds.filter(id => id !== action.moduleId);
      return {
        ...state,
        selectedModuleIds: newSelected,
        resources: calculateResources(newSelected, state.depotModuleIds, state.activeLandingSite),
      };
    }

    case 'LAUNCH_MISSION': {
      const evalCheck = evaluateMission(state);
      const site = LANDING_SITES[state.activeLandingSite] ?? LANDING_SITES.jezero_crater;

      // Transfer remaining budget directly into Mission Credits on Mars!
      const initialCredits = Math.max(0, state.resources.budgetRemaining);

      const surfaceInventory = Array.from(
        new Set([...state.selectedModuleIds, ...state.depotModuleIds])
      );

      const nextSurface = {
        ...state.surface,
        missionCreditsMUSD: initialCredits,
        landerInventory: surfaceInventory,
        logs: [
          `🚀 TOUCHDOWN SUCCESS at ${site.name}!`,
          `Unused budget ($${initialCredits}M) converted to Lander Mission Credits.`,
          `Lander Depot stocked with ${surfaceInventory.length} modules. Rover ready!`,
          ...state.surface.logs,
        ],
      };

      if (!evalCheck.ok) {
        // If launched with blockers (e.g. overweight or low delta-v), apply landing damage penalty!
        nextSurface.batteryPower = Math.max(40, nextSurface.batteryPower - 30);
        nextSurface.logs.unshift(
          `⚠️ HARD LANDING PENALTY: Spacecraft exceeded mass limits or had marginal Delta-v! Battery drained to ${nextSurface.batteryPower}⚡ on touchdown.`
        );
      }

      return {
        ...state,
        phase: 'operations',
        surface: nextSurface,
        lastMessage: `Touchdown at ${site.name}! Ready for surface exploration.`,
      };
    }

    case 'CHOOSE_EVENT':
      return { ...state, eventIndex: state.eventIndex + 1 };

    // ==========================================
    // Surface Rover Actions
    // ==========================================
    case 'MOVE_ROVER': {
      const nextSurface = moveRover(state.surface, action.direction);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'MOVE_ROVER_TO': {
      const nextSurface = moveRoverTo(state.surface, action.targetX, action.targetY);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'SOLAR_CHARGE': {
      const nextSurface = solarCharge(state.surface);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'SCAN_TERRAIN': {
      const nextSurface = scanTerrain(state.surface);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'TRANSMIT_DATA': {
      const nextSurface = transmitData(state.surface);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'UNSTUCK_ROVER': {
      const nextSurface = unstuckRover(state.surface);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'SWAP_MODULE': {
      const nextSurface = swapModuleAtLander(state.surface, action.category, action.newModuleId);
      const currentOthers = state.selectedModuleIds.filter(id => {
        const m = ROVER_MODULES[id];
        return m && m.category !== action.category;
      });
      const newSelected = [...currentOthers, action.newModuleId];
      return {
        ...state,
        selectedModuleIds: newSelected,
        resources: calculateResources(newSelected, state.depotModuleIds, state.activeLandingSite),
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    case 'CRAFT_MODULE': {
      const nextSurface = craftModuleAtLander(state.surface, action.moduleId);
      return {
        ...state,
        surface: nextSurface,
        lastMessage: nextSurface.logs[0],
      };
    }

    default:
      return state;
  }
}
