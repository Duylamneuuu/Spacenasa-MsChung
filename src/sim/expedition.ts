import { MISSIONS, SITES } from '../content/expedition';
import { BASE_BUDGET, CAPACITY, cells, DEFAULT_LOADOUT, HEIGHT, inMap, key, LANDER_MASS, MODULES, RESERVE, ROVER_BASE, SUPPORT_MASS, SWAP_CREDITS, SWAP_MINUTES, terrainAt, TERRAIN, TILE_SIZE, WHEELS, WIDTH } from '../data/expedition';
import type { Cell, DriveStepResult, DrivingInput, Loadout, MissionId, MissionState, ModuleId, PlanPreview, RiskBand, SiteId, StationaryAction, Survey } from '../types/expedition';

const SOL_MINUTES = 24.6 * 60; // NASA Mars Facts; period of the educational light cycle.
const HAZARD_STOP = .78;
const MIN_OPERATING = 1;
export const DRIVE_STEP = 1 / 60;
export const NEUTRAL: DrivingInput = { forward: false, reverse: false, left: false, right: false, brake: false };
const dist = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.z - b.z);
const cellAt = ({ x, z }: Cell): Cell => ({ x: Math.round(x), z: Math.round(z) });
const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));
const installed = (l: Loadout): ModuleId[] => [l.wheel, l.scanner, l.instrument, l.storage].filter((m): m is ModuleId => m !== null);

export function payload(loadout: Loadout) {
  const active = installed(loadout);
  const massOf = (ids: readonly ModuleId[]) => ids.reduce((total, id) => total + MODULES[id].mass, 0);
  const roverMass = ROVER_BASE + massOf(active);
  const spareMass = massOf(loadout.spares);
  const totalMass = roverMass + spareMass + LANDER_MASS + SUPPORT_MASS;
  const budget = [...active, ...loadout.spares].reduce((total, id) => total + MODULES[id].cost, BASE_BUDGET);
  return { roverMass, spareMass, totalMass, budget };
}

export function preflight(missionId: MissionId, loadout: Loadout): string[] {
  const mission = MISSIONS[missionId];
  const p = payload(loadout);
  return [
    !loadout.scanner && 'Install a navigation camera to survey the terrain.',
    !loadout.instrument && 'Install a science instrument to analyze samples.',
    p.totalMass > mission.massCap && `Payload exceeds the limit by ${p.totalMass - mission.massCap} kg.`,
    p.budget > mission.budget && `Design exceeds the budget by ${p.budget - mission.budget} units.`,
    new Set([...installed(loadout), ...loadout.spares]).size !== installed(loadout).length + loadout.spares.length && 'The payload lists the same module more than once.',
  ].filter((value): value is string => Boolean(value));
}

export function getInitialState(missionId: MissionId, loadout: Loadout = DEFAULT_LOADOUT): MissionState {
  const { start } = MISSIONS[missionId];
  return {
    mission: missionId, loadout: { ...loadout, spares: [...loadout.spares] }, position: start, pose: { heading: Math.PI / 2, speed: 0 }, battery: CAPACITY, elapsed: 0,
    surveyed: { [key(start)]: surveyAt(start, .05) }, pending: [], delivered: [], science: 0,
    credits: 0, used: 0, charged: 0, distance: 0, energyByTerrain: { hard: 0, sand: 0, rock: 0 },
    stops: 0, trace: [start], reason: null, outcome: null,
  };
}
function actualRisk(cell: Cell) {
  const { risk, spread } = TERRAIN[terrainAt(cell)];
  const texture = ((cell.x * 73 + cell.z * 41) % 29) / 28 * 2 - 1;
  return risk + spread * (cell.x === 7 && cell.z === 5 ? .92 : texture);
}
function surveyAt(cell: Cell, margin: number): Survey {
  const observed = Math.round(actualRisk(cell) / .08) * .08;
  return { low: Math.max(0, observed - margin), high: observed + margin };
}
export function terrainEstimate(state: MissionState, position: Cell): Survey {
  const cell = cellAt(position);
  const { risk, spread } = TERRAIN[terrainAt(cell)];
  return state.surveyed[key(cell)] ?? { low: risk - spread, high: risk + spread };
}
export function sunlight(position: Cell, elapsed: number): number {
  const cell = cellAt(position);
  const local = cell.x >= 11 && cell.z >= 8 ? .14 : terrainAt(cell) === 'rock' ? .74 : 1;
  const day = Math.max(0, Math.sin(2 * Math.PI * (SOL_MINUTES / 4 - 65 + elapsed) / SOL_MINUTES));
  return local * day;
}
const band = (risk: number): RiskBand => risk >= .7 ? 'high' : risk >= .42 ? 'medium' : 'low';

function movementCost(state: MissionState, cell: Cell, length: number, risk: number) {
  const kind = terrainAt(cell), tile = TERRAIN[kind], wheel = WHEELS[state.loadout.wheel];
  const load = 1 + (payload(state.loadout).roverMass - 100) / 300;
  return {
    kind,
    energy: length * 4.8 * load * tile.factor * wheel.energy[kind] * (1 + .27 * (risk - tile.risk)),
    minutes: length * tile.minutes * (.7 + .3 * wheel.energy[kind]) * (1 + .45 * (risk - tile.risk)),
    risk: risk * wheel.risk[kind],
  };
}

export function previewRoute(state: MissionState, route: readonly Cell[]): PlanPreview {
  const steps: PlanPreview['steps'][number][] = [];
  const unknownCells = new Set<string>();
  let from = state.position, risk = 0, eLow = 0, eHigh = 0, tLow = 0, tHigh = 0;
  let blocked: string | null = null;
  for (const to of route) {
    if (!inMap(to)) { blocked = 'Waypoint is outside the survey sector.'; break; }
    const length = dist(from, to);
    const slices = Math.ceil(length * 4);
    for (let i = 0; i < slices; i++) {
      const at = (t: number): Cell => ({ x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t });
      const cell = cellAt(at((i + .5) / slices));
      const { low, high } = terrainEstimate(state, cell);
      const a = movementCost(state, cell, length / slices, low), b = movementCost(state, cell, length / slices, high);
      eLow += a.energy; eHigh += b.energy; tLow += a.minutes; tHigh += b.minutes;
      const uncertain = !state.surveyed[key(cell)];
      if (uncertain) unknownCells.add(key(cell));
      risk = Math.max(risk, b.risk);
      steps.push({ from: at(i / slices), to: at((i + 1) / slices), risk: band(b.risk), uncertain });
    }
    from = to;
  }
  const warnings: string[] = [];
  if (unknownCells.size) warnings.push(`${unknownCells.size} unsurveyed sectors. Scan nearby to narrow the estimate.`);
  if (risk >= HAZARD_STOP) warnings.push('The planned route may hit ground beyond the grip limit of these wheels.');
  if (state.battery - eHigh < RESERVE) warnings.push(`The route may cut into the ${RESERVE} EU reserve.`);
  if (state.battery - eHigh < MIN_OPERATING) warnings.push('You may run out of power on this route.');
  if (state.elapsed + tHigh > MISSIONS[state.mission].limit) warnings.push('The route may exceed the survey window.');
  return { steps, energy: [eLow, eHigh], minutes: [tLow, tHigh], remaining: state.battery - (eHigh + eLow) / 2, risk: band(risk), unknown: unknownCells.size, warnings, blocked };
}

export function evaluateMission(state: MissionState) {
  if (state.outcome) return state.outcome;
  const done = MISSIONS[state.mission].targets.every(id => state.delivered.some(sample => sample.site === id));
  if (done && state.battery >= MIN_OPERATING && state.elapsed <= MISSIONS[state.mission].limit) return 'success';
  return state.delivered.length ? 'partial' : 'failure';
}
function finish(state: MissionState, reason: string) {
  return { ...state, reason, pose: { ...state.pose, speed: 0 }, outcome: evaluateMission(state) };
}
function spend(state: MissionState, energy: number, minutes: number): MissionState {
  return {
    ...state, battery: clamp(state.battery - energy, 0, CAPACITY), elapsed: state.elapsed + minutes,
    used: state.used + Math.max(energy, 0), charged: state.charged + Math.max(-energy, 0), reason: null,
  };
}

export function haltDrive(state: MissionState): MissionState {
  return state.pose.speed === 0 ? state : { ...state, pose: { ...state.pose, speed: 0 } };
}

export function stepDrive(state: MissionState, input: DrivingInput, seconds: number): DriveStepResult {
  const result = (next: MissionState, distance = 0, stopped = false): DriveStepResult => ({
    state: next, distance, stopped,
    terrain: { kind: terrainAt(cellAt(next.position)), illumination: sunlight(next.position, next.elapsed), hazard: terrainEstimate(next, next.position) },
  });
  if (state.outcome || !Number.isFinite(seconds) || seconds <= 0) return result(state);
  const dt = Math.min(seconds, .05);
  const current = cellAt(state.position), kind = terrainAt(current);
  const wheel = WHEELS[state.loadout.wheel];
  const throttle = Number(input.forward) - Number(input.reverse);
  const steer = Number(input.left) - Number(input.right);
  const maxSpeed = 5.25 / Math.max(.88, wheel.energy[kind] * (kind === 'hard' ? .94 : 1.08));
  const target = input.brake ? 0 : throttle * maxSpeed * (throttle < 0 ? .52 : 1);
  // Keep inertia, signed reverse and yaw input from the prior Three.js controller; simulation owns pose.
  const speedChange = input.brake ? 25 : throttle ? 8 : 12;
  const speed = state.pose.speed + clamp(target - state.pose.speed, -speedChange * dt, speedChange * dt);
  if (speed === 0 && !steer) return result(haltDrive(state));
  // A slow pivot when already parked makes narrow stops and turnarounds accessible.
  const headingRaw = state.pose.heading + steer * (Math.abs(speed) > .12 ? 1.65 * Math.sign(speed) : .85) * dt;
  const heading = Math.atan2(Math.sin(headingRaw), Math.cos(headingRaw));
  if (speed === 0) return result({ ...state, pose: { heading, speed } });
  const step = speed * dt / TILE_SIZE;
  const position = { x: state.position.x + Math.sin(heading) * step, z: state.position.z + Math.cos(heading) * step };
  const tile = cellAt(position);
  if (position.x < -.44 || position.x > WIDTH - .56 || position.z < -.44 || position.z > HEIGHT - .56) {
    return result({ ...haltDrive(state), reason: 'Survey boundary reached. Turn or reverse into the sector.' }, 0, true);
  }
  const cost = movementCost(state, tile, Math.abs(step), actualRisk(tile));
  if (cost.risk >= HAZARD_STOP && key(tile) !== key(current)) {
    return result({
      ...haltDrive(state), stops: state.stops + 1, reason: `Safety stop: ${TERRAIN[cost.kind].name.toLowerCase()} ahead exceeds the grip limit. Replan or back away.`,
      surveyed: { ...state.surveyed, [key(tile)]: surveyAt(tile, .065) },
    }, 0, true);
  }
  if (state.elapsed + cost.minutes > MISSIONS[state.mission].limit) return result(finish(state, 'The survey window has closed.'), 0, true);
  if (state.battery - cost.energy < MIN_OPERATING) {
    const canCharge = sunlight(state.position, state.elapsed + 5) >= .25 && state.elapsed + 10 <= MISSIONS[state.mission].limit;
    return result(canCharge ? { ...haltDrive(state), reason: 'Power reserve reached. Park and recharge to continue.' } :
      finish({ ...state, battery: Math.min(state.battery, MIN_OPERATING - .01) }, 'Insufficient operating power and no time or light to recharge.'), 0, true);
  }
  const metres = Math.abs(speed) * dt;
  const travelled = {
    ...spend(state, cost.energy, cost.minutes), position, pose: { speed, heading }, distance: state.distance + metres,
    trace: dist(state.trace.at(-1) ?? state.position, position) >= .28 ? [...state.trace, position] : state.trace,
    energyByTerrain: { ...state.energyByTerrain, [cost.kind]: state.energyByTerrain[cost.kind] + cost.energy },
  };
  return result(travelled, metres);
}

export function performScienceAction(state: MissionState, action: StationaryAction): MissionState {
  if (state.outcome) return state;
  const reject = (reason: string): MissionState => ({ ...state, reason });
  if (Math.abs(state.pose.speed) > 0) return reject('Park the rover before using equipment.');
  let energy: number, minutes: number, apply: (next: MissionState) => MissionState = next => next;
  let message: string;
  switch (action.type) {
    case 'scan': {
      if (!state.loadout.scanner) return reject('No navigation camera is installed.');
      const stereo = state.loadout.scanner === 'stereo', margin = stereo ? .06 : .095;
      const area = cells.filter(c => dist(c, state.position) <= (stereo ? 3 : 2));
      const surveyed = { ...state.surveyed };
      let count = 0;
      for (const cell of area) {
        const old = surveyed[key(cell)];
        if (!old || old.high - old.low > margin * 2 + 1e-6) { surveyed[key(cell)] = surveyAt(cell, margin); count++; }
      }
      if (!count) return reject('No new terrain within this camera range.');
      energy = stereo ? 8 : 6; minutes = 4; apply = next => ({ ...next, surveyed });
      message = `Updated hazard estimates for ${count} sectors.`;
      break;
    }
    case 'analyze': {
      const site = SITES[action.site];
      if (dist(state.position, site.cell) > .72) return reject('Park closer to the sample site.');
      if (!(MISSIONS[state.mission].targets as readonly SiteId[]).includes(action.site)) return reject('This site is outside the current science assignment.');
      if (!state.loadout.instrument) return reject('No science instrument is installed.');
      if ([...state.pending, ...state.delivered].some(s => s.site === action.site)) return reject('This sample has already been analyzed.');
      if (state.pending.length >= (state.loadout.storage === 'extended' ? 3 : 1)) return reject('Storage full. Transmit your data first.');
      const spectral = state.loadout.instrument === 'spectral';
      energy = spectral ? 16 : 12; minutes = 7;
      apply = next => ({ ...next, pending: [...next.pending, { site: action.site, score: site.science + (spectral ? 6 : 0), credits: site.credits }] });
      message = `Recorded science data: ${site.name}.`;
      break;
    }
    case 'transmit': {
      if (!state.pending.length) return reject('No new data to transmit.');
      const score = state.pending.reduce((n, s) => n + s.score, 0), credits = state.pending.reduce((n, s) => n + s.credits, 0);
      energy = 6; minutes = 4;
      apply = next => ({ ...next, delivered: [...next.delivered, ...next.pending], science: next.science + score, credits: next.credits + credits, pending: [] });
      message = `Downlink received: +${score} Science Score, +${credits} RC.`;
      break;
    }
    case 'recharge': {
      if (action.minutes !== 10 && action.minutes !== 20) return reject('Select a 10- or 20-minute charge window.');
      const light = sunlight(state.position, state.elapsed + action.minutes / 2);
      if (light < .25) return reject('Insufficient sunlight. Move to an illuminated area.');
      if (state.battery >= CAPACITY - 1e-6) return reject('Battery is already full.');
      energy = -Math.min(CAPACITY - state.battery, action.minutes * .8 * light);
      minutes = action.minutes;
      message = `Solar charge complete: +${(-energy).toFixed(1)} EU in ${minutes} minutes.`;
      break;
    }
  }
  if (state.elapsed + minutes > MISSIONS[state.mission].limit) return reject('Not enough time remains for this operation.');
  if (energy > state.battery) return reject('Not enough energy for this operation. Recharge first.');
  const next = apply(spend(state, energy, minutes));
  if (next.battery < MIN_OPERATING) return finish(next, 'Battery fell below the operating threshold.');
  if (next.elapsed >= MISSIONS[state.mission].limit) return finish(next, 'The survey window has closed.');
  return { ...next, reason: message };
}

export function garageStatus(state: MissionState, id: ModuleId): string | null {
  if (state.outcome) return 'The survey has ended.';
  if (state.pose.speed !== 0 || dist(state.position, MISSIONS[state.mission].start) > .65) return 'Park within the lander service area.';
  if (!state.loadout.spares.includes(id)) return 'This module is not in the deployed inventory.';
  if (state.credits < SWAP_CREDITS) return `Swapping this module requires ${SWAP_CREDITS} RC.`;
  if (state.elapsed + SWAP_MINUTES >= MISSIONS[state.mission].limit) return 'Not enough time remains for maintenance.';
  if (id === 'standard' && state.pending.length > 1) return 'Transmit data before downsizing storage.';
  return null;
}
export function swapAtLander(state: MissionState, id: ModuleId): MissionState {
  const error = garageStatus(state, id);
  if (error) return { ...state, reason: error };
  const slot = MODULES[id].slot, old = state.loadout[slot];
  return {
    ...state, elapsed: state.elapsed + SWAP_MINUTES, credits: state.credits - SWAP_CREDITS,
    loadout: { ...state.loadout, [slot]: id, spares: [...state.loadout.spares.filter(x => x !== id), ...(old ? [old] : [])] },
    reason: `Lander service complete: installed ${MODULES[id].name.toLowerCase()}.`,
  };
}
export function siteAt(cell: Cell): SiteId | undefined {
  return (Object.keys(SITES) as SiteId[]).find(id => dist(SITES[id].cell, cell) <= .72);
}

