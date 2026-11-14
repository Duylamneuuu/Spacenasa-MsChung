// Landing Sites & Mission Objectives for APOGEE: MARS ROVER ARCHITECT
import type { LandingSite, LandingSiteId } from '../types/game';

export const LANDING_SITES: Record<LandingSiteId, LandingSite> = {
  utopia_planitia: {
    id: 'utopia_planitia',
    name: 'Utopia Planitia',
    difficulty: 'Beginner',
    budgetMUSD: 180,
    requiredDeltaVMs: 3800,
    requiredDeltaVKmS: 3.8,
    flatRockPct: 75,
    sandTrapPct: 15,
    solarRidgePct: 10,
    description: 'Vast, relatively smooth northern lowlands. Abundant solar exposure and minimal dune fields make this an optimal testing ground for high-speed exploration.',
    strategicTip: '75% flat basalt rock lets Slim Aluminum wheels run at peak efficiency (only 4⚡/tile). Low Delta-v requirement (3.8 km/s) accommodates cheaper launchers.',
  },
  jezero_crater: {
    id: 'jezero_crater',
    name: 'Jezero Crater',
    difficulty: 'Intermediate',
    budgetMUSD: 200,
    requiredDeltaVMs: 4100,
    requiredDeltaVKmS: 4.1,
    flatRockPct: 50,
    sandTrapPct: 35,
    solarRidgePct: 15,
    description: 'Ancient river delta lakebed rich in clay minerals and astrobiological biosignatures. Treacherous sand ripples surround high-value core sample locations.',
    strategicTip: 'Balanced trade-offs: 35% sand traps will immobilize slim wheels. Equip RIMFAX GPR to spot hazards, and pack Wide Titan tires in the Lander Depot for field swaps.',
  },
  valles_marineris: {
    id: 'valles_marineris',
    name: 'Valles Marineris (Canyon Rift)',
    difficulty: 'Advanced',
    budgetMUSD: 220,
    requiredDeltaVMs: 4350,
    requiredDeltaVKmS: 4.35,
    flatRockPct: 40,
    sandTrapPct: 45,
    solarRidgePct: 15,
    description: 'The solar system’s largest canyon system. Steep canyon walls cast deep shadows while vast sand sea drifts cover 45% of the exploration sector.',
    strategicTip: 'High risk & high reward. Canyon shadows diminish solar array reliability. MMRTG and Wide/SMA tires are essential, demanding a Heavy Lift launcher.',
  },
};

export const DEFAULT_LANDING_SITE_ID: LandingSiteId = 'jezero_crater';
