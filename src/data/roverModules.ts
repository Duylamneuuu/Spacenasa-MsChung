import type { RoverModule, RoverModuleCategory } from '../types/game';

// NASA-grounded Rover Component Specifications
// Trade-off Matrix according to NASA Space Apps 2026 Challenge
export const ROVER_MODULES: Record<string, RoverModule> = {
  // ==========================================
  // A. WHEELS (Hệ thống Lốp Xe)
  // ==========================================
  slim_aluminum: {
    id: 'slim_aluminum',
    category: 'wheels',
    name: 'Slim Aluminum Wheels',
    costMUSD: 10,
    massKg: 20,
    powerDrainFlat: 4,
    powerDrainSand: 25,
    stuckRiskSand: 0.5, // 50% chance of getting stuck in sand
    craftCostScrap: 2,
    craftCostCredits: 10,
    description: 'Lightweight milled aircraft-grade aluminum wheels. Excellent efficiency on firm basalt plains, but easily bogged down in loose drift sand.',
    pros: 'Ultra-lightweight (20 kg), cheapest ($10M), consumes only 4⚡/tile on flat rock.',
    cons: 'Catastrophic on sand traps (25⚡/tile) with 50% risk of wheel immobilization (costs 15⚡ to extract).',
    nasaReference: 'NASA Mars Exploration Rover (MER Spirit/Opportunity) - Milled 7075-T73 Aluminum wheels.',
  },
  wide_titan: {
    id: 'wide_titan',
    category: 'wheels',
    name: 'Wide Titan Mesh Tires',
    costMUSD: 30,
    massKg: 75,
    powerDrainFlat: 11,
    powerDrainSand: 9,
    stuckRiskSand: 0.0, // 0% stuck risk
    craftCostScrap: 4,
    craftCostCredits: 25,
    description: 'Wide-tread titanium wire-mesh tires developed for treacherous dunes. Conquers sand with zero stuck risk, but heavy rolling friction drains battery on rock.',
    pros: 'Immune to getting stuck in sand traps (0%), consumes only 9⚡/tile on loose sand.',
    cons: 'Heavy (75 kg), expensive ($30M), high rolling resistance on flat rock drains 11⚡/tile (nearly 3x slim wheels).',
    nasaReference: 'NASA Glenn Research Center (GRC) Spring Tire - Titanium Shape Memory Alloy mesh.',
  },
  adaptive_sma: {
    id: 'adaptive_sma',
    category: 'wheels',
    name: 'Adaptive SMA Tires',
    costMUSD: 55,
    massKg: 95,
    powerDrainFlat: 6,
    powerDrainSand: 10,
    stuckRiskSand: 0.0,
    craftCostScrap: 6,
    craftCostCredits: 45,
    description: 'Next-generation Shape Memory Alloy (Nitinol) tires that dynamically adapt tread geometry. Balanced rolling on all terrain types but severely penalizes payload mass.',
    pros: 'Great all-terrain performance: 6⚡/tile on rock, 10⚡/tile on sand, 0% stuck risk.',
    cons: 'Extremely heavy (95 kg) and premium cost ($55M). Significant mass reduces spacecraft launch Delta-v.',
    nasaReference: 'NASA Glenn Research Center & JPL Mars Sample Return Superelastic SMA Wheel Program.',
  },

  // ==========================================
  // B. SENSORS (Hệ thống Cảm biến & Radar)
  // ==========================================
  navcam: {
    id: 'navcam',
    category: 'sensors',
    name: 'NavCam Optical Stereo Camera',
    costMUSD: 10,
    massKg: 10,
    scanPowerDrain: 2,
    scanRadius: 1,
    revealsHiddenSand: false,
    craftCostScrap: 2,
    craftCostCredits: 10,
    description: 'Mast-mounted stereo optical camera. Provides basic localized line-of-sight visual scouting for minimum power, but blind to subsurface hazards.',
    pros: 'Very low energy consumption (2⚡/scan), lightweight (10 kg), economical ($10M).',
    cons: 'Short range (radius 1 tile). Cannot see through Martian dust to detect concealed sand traps.',
    nasaReference: 'NASA Mars Science Laboratory / Perseverance NavCam masthead engineering cameras.',
  },
  rimfax_gpr: {
    id: 'rimfax_gpr',
    category: 'sensors',
    name: 'RIMFAX Ground Penetrating Radar',
    costMUSD: 35,
    massKg: 45,
    scanPowerDrain: 14,
    scanRadius: 3,
    revealsHiddenSand: true,
    craftCostScrap: 5,
    craftCostCredits: 30,
    description: 'Ground-penetrating radar emitting ultra-wideband pulses. Penetrates Martian regolith up to 10 meters deep, revealing all subsurface dunes, hidden rocks, and scrap.',
    pros: 'Long scanning radius (3 tiles). Reveals 100% of hidden sand traps, science rocks, and scrap.',
    cons: 'Heavy power drain (14⚡/scan). Heavier payload (45 kg) and higher cost ($35M).',
    nasaReference: 'NASA Mars 2020 Perseverance RIMFAX (Radar Imager for Mars Subsurface Experiment).',
  },

  // ==========================================
  // C. POWER (Nguồn Năng Lượng)
  // ==========================================
  solar_array: {
    id: 'solar_array',
    category: 'power',
    name: 'High-Efficiency Solar Array',
    costMUSD: 15,
    massKg: 25,
    chargeRateRidge: 25, // +25⚡ on Solar Ridge
    chargeRateEverywhere: 0,
    craftCostScrap: 3,
    craftCostCredits: 15,
    description: 'Deployable triple-junction gallium arsenide solar panels. Light and cheap, but depends entirely on sun-facing slopes (Solar Ridge) to recharge.',
    pros: 'Lightweight (25 kg), economical ($15M), massive charging boost (+25⚡/turn) on Solar Ridges.',
    cons: 'Cannot recharge in craters, shadow, or flat terrain. Rover risks freezing if battery is depleted far from a ridge.',
    nasaReference: 'NASA InSight / Mars Exploration Rovers (MER) solar array architecture.',
  },
  mmrtg: {
    id: 'mmrtg',
    category: 'power',
    name: 'Multi-Mission Radioisotope (MMRTG)',
    costMUSD: 60,
    massKg: 110,
    chargeRateRidge: 8,
    chargeRateEverywhere: 8, // +8⚡/turn anywhere
    craftCostScrap: 7,
    craftCostCredits: 50,
    description: 'Plutonium-238 decay thermoelectric generator. Provides continuous, uninterrupted electrical power regardless of terrain, night, or dust storms.',
    pros: 'Consistent +8⚡/turn automatic recharge anywhere on Mars. Complete operational freedom from terrain sun angle.',
    cons: 'Massive payload weight (110 kg) and immense budget commitment ($60M). Limits other module options.',
    nasaReference: 'NASA Curiosity / Perseverance MMRTG (Multi-Mission Radioisotope Thermoelectric Generator).',
  },

  // ==========================================
  // D. COMMS (Hệ thống Liên Lạc)
  // ==========================================
  uhf_antenna: {
    id: 'uhf_antenna',
    category: 'comms',
    name: 'UHF Proximity Antenna',
    costMUSD: 10,
    massKg: 15,
    transmitPowerDrain: 5,
    maxDistanceToLanderForComms: 3, // <= 3 tiles from Lander Base
    craftCostScrap: 2,
    craftCostCredits: 10,
    description: 'Low-power ultra-high frequency antenna. Uses the Lander Base as a relay back to Earth. Light and power-saving, but confines transmission to base proximity.',
    pros: 'Low battery draw (5⚡/transmit), lightweight (15 kg), budget-friendly ($10M).',
    cons: 'Range limited to within 3 tiles of Lander Base. Must return near base to transmit science data for credits.',
    nasaReference: 'NASA Mars Electra UHF relay network architecture.',
  },
  high_gain_dish: {
    id: 'high_gain_dish',
    category: 'comms',
    name: 'High-Gain Steerable X-Band Dish',
    costMUSD: 35,
    massKg: 55,
    transmitPowerDrain: 20,
    maxDistanceToLanderForComms: Infinity, // Anywhere on map
    craftCostScrap: 4,
    craftCostCredits: 30,
    description: 'Direct-to-Earth steerable parabolic antenna linking directly with the NASA Deep Space Network (DSN). Enables long-range remote expeditions.',
    pros: 'Transmits data directly to Earth from ANY location on the map. Enables deep-desert exploration.',
    cons: 'Heavier (55 kg), expensive ($35M), and burns significant battery (20⚡/transmission).',
    nasaReference: 'NASA DSN (Deep Space Network) 34m/70m Ground Station Compatible X-band Steerable HGA.',
  },

  // ==========================================
  // E. LAUNCHERS (Phương Tiện Phóng)
  // ==========================================
  falcon_heavy_rideshare: {
    id: 'falcon_heavy_rideshare',
    category: 'launcher',
    name: 'Falcon Heavy Trans-Mars Rideshare',
    costMUSD: 30,
    massKg: 0,
    maxPayloadMassKg: 240, // tightly constrained for budget builds
    deltaVBoostKmS: 4.3,
    craftCostScrap: 999,
    craftCostCredits: 999,
    description: 'Commercial rideshare launch slot. Affordable but strictly caps spacecraft mass to 240 kg.',
    pros: 'Cheapest launch vehicle ($30M). Leaves ample budget for advanced instruments.',
    cons: 'Strict 240 kg mass cap. Selecting MMRTG + Heavy tires will exceed launcher payload capacity!',
    nasaReference: 'NASA Launch Services Program (LSP) Commercial Rideshare Initiative.',
  },
  atlas_v_dedicated: {
    id: 'atlas_v_dedicated',
    category: 'launcher',
    name: 'Atlas V 541 Dedicated Launcher',
    costMUSD: 65,
    massKg: 0,
    maxPayloadMassKg: 350,
    deltaVBoostKmS: 4.9,
    craftCostScrap: 999,
    craftCostCredits: 999,
    description: 'Proven NASA workhorse for Mars missions. Provides reliable 350 kg payload capacity and healthy Delta-v margins.',
    pros: 'Comfortable 350 kg mass envelope accommodates heavier payloads with solid Delta-v (4.9 km/s).',
    cons: 'Moderate budget impact ($65M). Requires disciplined allocation across rover systems.',
    nasaReference: 'NASA Mars Science Laboratory / Perseverance Atlas V 541 launch configuration.',
  },
  sls_cargo_class: {
    id: 'sls_cargo_class',
    category: 'launcher',
    name: 'Space Launch System (SLS) Cargo Block 1B',
    costMUSD: 100,
    massKg: 0,
    maxPayloadMassKg: 600,
    deltaVBoostKmS: 5.7,
    craftCostScrap: 999,
    craftCostCredits: 999,
    description: 'Heavy exploration rocket capable of launching heavy nuclear rovers with immense Delta-v surplus, but consumes majority of budget.',
    pros: 'Massive 600 kg mass capacity, huge Delta-v (5.7 km/s). Allows building maximum heavy rover.',
    cons: 'Massive budget cost ($100M). Leaves minimal funds for rover equipment without in-situ upgrades.',
    nasaReference: 'NASA Space Launch System (SLS) Deep Space Exploration Architecture.',
  },
};

export const DEFAULT_STARTING_EQUIPMENT = {
  wheels: 'slim_aluminum',
  sensors: 'navcam',
  power: 'solar_array',
  comms: 'uhf_antenna',
  launcher: 'atlas_v_dedicated',
};

// Available module IDs per category for selection
export const MODULES_BY_CATEGORY: Record<RoverModuleCategory, RoverModule[]> = {
  wheels: [ROVER_MODULES.slim_aluminum, ROVER_MODULES.wide_titan, ROVER_MODULES.adaptive_sma],
  sensors: [ROVER_MODULES.navcam, ROVER_MODULES.rimfax_gpr],
  power: [ROVER_MODULES.solar_array, ROVER_MODULES.mmrtg],
  comms: [ROVER_MODULES.uhf_antenna, ROVER_MODULES.high_gain_dish],
  launcher: [ROVER_MODULES.falcon_heavy_rideshare, ROVER_MODULES.atlas_v_dedicated, ROVER_MODULES.sls_cargo_class],
};
