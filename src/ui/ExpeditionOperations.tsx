import { Component, lazy, memo, Suspense, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { DUNE_NORTH, MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, inMap, key, MODULES, RESERVE, same, SWAP_CREDITS, SWAP_MINUTES, TERRAIN, terrainAt, TILE_SIZE, WIDTH } from '../data/expedition';
import { garageStatus, previewRoute, siteAt, sunlight } from '../sim/expedition';
import type { Cell, ControlMode, MissionState, ModuleId, PlanPreview, SiteId, StationaryAction, TerrainKind } from '../types/expedition';

const ExpeditionScene = lazy(() => import('../scene/ExpeditionScene').then(({ ExpeditionScene }) => ({ default: ExpeditionScene })));

type OperationsProps = {
  state: MissionState;
  route: Cell[];
  setRoute: (r: Cell[]) => void;
  mode: ControlMode;
  setMode: (m: ControlMode) => void;
  act: (a: StationaryAction) => void;
  effect: StationaryAction['type'] | null;
  swap: (id: ModuleId) => void;
  report: () => void;
  log: readonly string[];
};

const SITE_NAME: Record<SiteId, string> = { basalt: 'Basalt Outcrop', vein: 'Mineral Vein', strata: 'Sedimentary Scarp' };
const TERRAIN_NAME: Record<TerrainKind, string> = { hard: 'Firm ground', sand: 'Soft sand', rock: 'Sharp rock' };
const MODE_NAME = { planning: 'Planning', driving: 'Manual drive', paused: 'Paused' } as const;
const EFFECT_NAME = { scan: 'Scanning terrain', analyze: 'Analyzing sample', transmit: 'Transmitting data', recharge: 'Charging battery' } as const;
const RISK_COLOR = { low: '#b8efd2', medium: '#ffdb91', high: '#ff8277' };
const SITES_IDS = Object.keys(SITES) as SiteId[];
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const distance = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.z - b.z);
const coordinates = (c: Cell) => 'C' + (Math.round(c.x) + 1) + ' / R' + (Math.round(c.z) + 1);
const number = (n: number) => n.toFixed(1);
const range = ([a, b]: PlanPreview['energy']) => number(a) === number(b) ? number(a) : number(a) + '–' + number(b);
const nameAt = (cell: Cell, start: Cell) => {
  const id = SITES_IDS.find(id => same(SITES[id].cell, cell));
  return id ? SITE_NAME[id] : same(cell, start) ? 'Lander' : coordinates(cell);
};
const statusAt = (state: MissionState, id: SiteId) => state.delivered.some(s => s.site === id) ? 'Transmitted' :
  state.pending.some(s => s.site === id) ? 'Ready to transmit' : 'Awaiting sample';
const angleDegrees = (angle: number) => angle * 180 / Math.PI;
const bearing = (angle: number) => (180 - angleDegrees(angle) + 360) % 360;

const MapTerrain = memo(function MapTerrain() {
  return <g aria-hidden="true">
    {cells.map(c => <rect key={key(c)} x={c.x} y={c.z} width={1} height={1}
      fill={TERRAIN[terrainAt(c)].color} fillOpacity={.62 + ((c.x * 23 + c.z * 17) % 7) * .035}
      stroke="#201816" strokeOpacity={.55} strokeWidth={.035} />)}
  </g>;
});

function SurfaceMap({ state, preview, route, onPick, compact = false }: {
  state: MissionState; preview: PlanPreview; route: readonly Cell[]; onPick?: (cell: Cell) => void; compact?: boolean;
}) {
  const mission = MISSIONS[state.mission];
  const [cursor, setCursor] = useState<Cell>(mission.start);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  function moveCursor(event: KeyboardEvent<SVGSVGElement>) {
    if (!onPick) return;
    let next: Cell;
    switch (event.key) {
      case 'ArrowUp': next = { ...cursor, z: cursor.z - 1 }; break;
      case 'ArrowDown': next = { ...cursor, z: cursor.z + 1 }; break;
      case 'ArrowLeft': next = { ...cursor, x: cursor.x - 1 }; break;
      case 'ArrowRight': next = { ...cursor, x: cursor.x + 1 }; break;
      case 'Enter':
      case ' ': event.preventDefault(); onPick(cursor); return;
      default: return;
    }
    event.preventDefault();
    if (inMap(next)) setCursor(next);
  }

  return <svg className={compact ? 'ops-minimap' : 'ops-map-2d'} viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT}
    style={{ display: 'block', width: '100%', height: '100%', cursor: onPick ? 'crosshair' : undefined, background: '#211919' }}
    role={onPick ? 'application' : 'img'}
    aria-label={onPick ? 'Route map. ' + nameAt(cursor, mission.start) + '. Arrow keys select a cell; Enter adds a waypoint.' :
      'North-up rover map. Rover at ' + coordinates(state.position) + '.'}
    tabIndex={onPick ? 0 : undefined} onKeyDown={onPick ? moveCursor : undefined}
    onFocus={onPick ? () => setKeyboardFocus(true) : undefined}
    onBlur={onPick ? () => setKeyboardFocus(false) : undefined}>
    <MapTerrain />
    <g aria-hidden="true" pointerEvents="none">
      {!compact && cells.filter(c => state.surveyed[key(c)]).map(c =>
        <circle key={key(c)} cx={c.x + .5} cy={c.z + .5} r={.075} fill="#ace7d4" opacity={.72} />)}
      {state.trace.length > 1 && <polyline points={state.trace.map(c => (c.x + .5) + ',' + (c.z + .5)).join(' ')}
        fill="none" stroke="#f5e5d2" strokeWidth={.08} opacity={.55} strokeLinecap="round" strokeLinejoin="round" />}
      {preview.steps.map(({ from, to, risk, uncertain }, i) => <line key={i}
        x1={from.x + .5} y1={from.z + .5} x2={to.x + .5} y2={to.z + .5}
        stroke={RISK_COLOR[risk]} strokeWidth={compact ? .13 : .095}
        strokeDasharray={uncertain ? '.14 .10' : undefined} strokeLinecap="round" />)}
      <rect x={mission.start.x + .23} y={mission.start.z + .23} width={.54} height={.54} rx={.08}
        fill="#322523" stroke="#f8c77c" strokeWidth={.1} />
      {mission.targets.map(id => {
        const { x, z } = SITES[id].cell;
        const done = statusAt(state, id) === 'Transmitted';
        return <g key={id} transform={'translate(' + (x + .5) + ' ' + (z + .5) + ')'}>
          <circle r={.33} fill="#182b28" stroke={done ? '#b8efd2' : '#8ceadb'} strokeWidth={.08} />
          {done ? <path d="m-.15 0 .1 .1 .2 -.2" stroke="#b8efd2" strokeWidth={.075} fill="none" /> :
            <path d="M0 -.14 .14 0 0 .14 -.14 0Z" fill="#8ceadb" />}
        </g>;
      })}
      {route.map(({ x, z }, i) => <g key={i}>
        <circle cx={x + .5} cy={z + .5} r={.32} fill="#25201e" stroke="#ffd296" strokeWidth={.07} />
        <text x={x + .5} y={z + .5} textAnchor="middle" dominantBaseline="central" fontSize={.34}
          fill="#fff1d7" fontWeight={700}>{i + 1}</text>
      </g>)}
      <g transform={'translate(' + (state.position.x + .5) + ' ' + (state.position.z + .5) + ')'}>
        <circle r={.37} fill="#162021" stroke="#effcf0" strokeWidth={.065} />
        <path d="M0 -.29 .21 .2 0 .105 -.21 .2Z" fill="#ecfff5"
          transform={'rotate(' + bearing(state.pose.heading) + ')'} />
      </g>
      <path d="M.58 1.06V.29m-.22 .26.22-.26.22 .26" stroke="#fff0d8" strokeWidth={.08} fill="none" />
      <text x={.58} y={1.48} textAnchor="middle" fontSize={.34} fill="#fff0d8" fontWeight={700}>N</text>
      {onPick && keyboardFocus && <rect x={cursor.x + .05} y={cursor.z + .05} width={.9} height={.9}
        fill="none" stroke="#fff5db" strokeWidth={.08} />}
    </g>
    {onPick && <g aria-hidden="true">{cells.map(c => <rect key={key(c)} x={c.x} y={c.z} width={1} height={1}
      fill="transparent" onClick={() => { setCursor(c); onPick(c); }}>
      <title>{nameAt(c, mission.start)} · {TERRAIN_NAME[terrainAt(c)]}</title>
    </rect>)}</g>}
  </svg>;
}

class MapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Metric({ label, value, unit, tone }: { label: string; value: ReactNode; unit?: string; tone?: string }) {
  return <div className="ops-metric"><span className="micro">{label}</span>
    <strong style={{ display: 'block', color: tone }}>{value}{unit && <> <small>{unit}</small></>}</strong></div>;
}

function guidance(state: MissionState, target: Cell) {
  const heading = Math.atan2(target.x - state.position.x, target.z - state.position.z);
  const delta = heading - state.pose.heading;
  const turn = angleDegrees(Math.atan2(Math.sin(delta), Math.cos(delta)));
  const meters = distance(state.position, target) * TILE_SIZE;
  const compass = bearing(heading);
  return {
    direction: CARDINALS[Math.round(compass / 45) % 8] + ' · ' + (Math.round(compass) % 360) + '°',
    distance: number(meters),
    instruction: meters <= .72 * TILE_SIZE ? 'Waypoint nearby' : Math.abs(turn) < 12 ? 'Straight ahead' :
      Math.abs(turn) > 164 ? 'Turn around' : (turn > 0 ? 'Steer left' : 'Steer right') + ' · ' + Math.round(Math.abs(turn)) + '°',
  };
}

function tutorialStep(state: MissionState, mode: ControlMode, route: Cell[], nearby: SiteId | undefined) {
  const mission = MISSIONS[state.mission];
  const outstanding = mission.targets.find(id => statusAt(state, id) === 'Awaiting sample');
  if (mission.targets.every(id => statusAt(state, id) === 'Transmitted')) return ['Survey complete', 'Every required sample has reached mission control. Open the mission report when ready.'];
  if (state.pending.length) return ['Send your results', 'Park and select Transmit. Science points and Research Credits are awarded on downlink.'];
  if (nearby && statusAt(state, nearby) === 'Awaiting sample') return ['Work the site', 'Stop the rover near the marker. Scan to refine local hazard estimates, then analyze the sample.'];
  if (state.battery <= RESERVE && !state.outcome) return ['Protect your reserve', 'Park in good sunlight and recharge. Check the battery and time needed to reach the next site.'];
  if (mode === 'driving') return ['Follow the next marker', 'Use W/S to move and A/D to steer. The minimap and next waypoint are guides; you can drive off the route.'];
  if (mode === 'paused') return ['Review your position', 'Resume manual driving or choose Replan to edit the route from here.'];
  if (route.length) return ['Take manual control', 'Review your energy, time and risk estimates. Select Start drive when ready, then hold W to move.'];
  return ['Plot a waypoint', 'Select a cell on the map or add ' + (outstanding ? SITE_NAME[outstanding] : 'a science site') + ' from the objectives.'];
}

export function Operations({ state, route, setRoute, mode, setMode, act, effect, swap, report, log }: OperationsProps) {
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const mission = MISSIONS[state.mission];
  const [visited, setVisited] = useState(0);
  const remainingRoute = useMemo(() => route.slice(visited), [route, visited]);
  const preview = previewRoute(state, remainingRoute);
  useEffect(() => { setVisited(0); }, [route]);
  useEffect(() => {
    if (mode === 'driving' && route[visited] && distance(state.position, route[visited]) <= .55) {
      setVisited(visited + 1);
    }
  }, [mode, route, state.position, visited]);
  const planning = mode === 'planning';
  const driving = mode === 'driving';
  const ended = state.outcome !== null;
  const canEdit = planning && !effect && !ended;
  const speed = Math.abs(state.pose.speed);
  const candidate = siteAt(state.position);
  const nearby = candidate && (mission.targets as readonly SiteId[]).includes(candidate) ? candidate : undefined;
  const slots = state.loadout.storage === 'extended' ? 3 : 1;
  const light = sunlight(state.position, state.elapsed);
  const timeLeft = Math.max(0, mission.limit - state.elapsed);
  const terrain = terrainAt({ x: Math.round(state.position.x), z: Math.round(state.position.z) });
  const next = remainingRoute[0];
  const guide = next && guidance(state, next);
  const complete = mission.targets.every(id => statusAt(state, id) === 'Transmitted');
  const [tutorialTitle, tutorialText] = tutorialStep(state, mode, route, nearby);

  function pick(cell: Cell) {
    if (!canEdit || !inMap(cell) || distance(state.position, cell) <= .15 || (route.length && same(route[route.length - 1], cell))) return;
    setRoute([...route, cell]);
  }
  function reorder(index: number, step: -1 | 1) {
    const ordered = [...route];
    [ordered[index], ordered[index + step]] = [ordered[index + step], ordered[index]];
    setRoute(ordered);
  }
  function drive(event: React.MouseEvent<HTMLButtonElement>) {
    event.currentTarget.blur();
    setMode('driving');
  }

  const sharedLock = ended ? 'Mission operations have ended.' : effect ? EFFECT_NAME[effect] + '…' :
    speed > 0 ? 'Stop the rover before using field equipment.' : '';
  function budget(energy: number, minutes: number) {
    return energy > state.battery ? 'Not enough battery.' : minutes > timeLeft ? 'Not enough mission time.' : '';
  }
  const scanCost = state.loadout.scanner === 'stereo' ? 8 : 6;
  const analysisCost = state.loadout.instrument === 'spectral' ? 16 : 12;
  const scanLock = sharedLock || (!state.loadout.scanner ? 'No terrain scanner installed.' : budget(scanCost, 4));
  const analyzeLock = sharedLock || (!nearby ? 'Park near a science marker.' : !state.loadout.instrument ? 'No science instrument installed.' :
    statusAt(state, nearby) !== 'Awaiting sample' ? 'This site has already been analyzed.' :
    state.pending.length >= slots ? 'Sample storage is full. Transmit first.' : budget(analysisCost, 7));
  const transmitLock = sharedLock || (!state.pending.length ? 'No samples waiting for downlink.' : budget(6, 4));
  const chargeLock = (minutes: 10 | 20) => sharedLock || (state.battery >= CAPACITY - 1e-6 ? 'Battery is full.' :
    sunlight(state.position, state.elapsed + minutes / 2) < .25 ? 'Insufficient sunlight. Find a brighter cell.' : budget(0, minutes));
  const lowBattery = state.battery <= RESERVE;
  const worstBattery = state.battery - preview.energy[1];
  const hasEstimate = preview.steps.length > 0;
  const fallback = <SurfaceMap state={state} preview={preview} route={remainingRoute} onPick={canEdit ? pick : undefined} />;

  return <>
    <header className="ops-heading">
      <div>
        <p className="eyebrow"><span className="signal" /> MARS OPERATIONS / EXPEDITION {mission.number}</p>
        <h1>{mission.name}<span>.</span></h1>
        <p>{ended ? 'Surface operations are complete.' : driving ? 'Manual control active. Follow the guide or choose your own path.' :
          mode === 'paused' ? 'Rover controls paused. Resume driving or revise your route.' : 'Plot waypoints, check your reserves, then drive the rover yourself.'}</p>
      </div>
      <button type="button" className={complete || ended ? 'primary' : 'ghost'} onClick={report} disabled={!!effect}>Mission report</button>
    </header>

    <div className="ops-grid">
      <div>
        <section className="panel ops-controls" aria-label="Rover controls" style={{ marginBottom: '.8rem', padding: '.85rem' }}>
          <div className="button-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem', alignItems: 'center' }}>
            {driving ? <button type="button" className="primary" onClick={() => setMode('paused')}>Pause drive</button> :
              <button type="button" className="primary" onClick={drive} disabled={ended || !!effect}>{planning ? 'Start drive' : 'Resume drive'}</button>}
            {!planning && <button type="button" className="outline" onClick={() => setMode('planning')} disabled={ended || !!effect}>Replan route</button>}
            <span className="micro"><kbd>W</kbd> forward · <kbd>S</kbd> reverse · <kbd>A</kbd>/<kbd>D</kbd> steer · <kbd>Space</kbd> brake</span>
          </div>
          <p className="micro" style={{ marginBottom: 0 }}>{planning ? 'Driving is manual. You can take control with or without a route.' :
            'Release the throttle and brake before analyzing, transmitting or charging.'}</p>
        </section>

        <section className="map-panel panel" aria-label="Surface navigation">
          <div className="map-toolbar button-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '.5rem', alignItems: 'center', padding: '.65rem' }}>
            <div><span className="eyebrow">SECTOR A</span> <strong>{ended ? 'Mission ended' : MODE_NAME[mode]}</strong></div>
            <div className="button-row" role="group" aria-label="Map view">
              <button type="button" className={view === '3d' ? 'outline' : 'ghost'} aria-pressed={view === '3d'} onClick={() => setView('3d')}>3D view</button>
              <button type="button" className={view === '2d' ? 'outline' : 'ghost'} aria-pressed={view === '2d'} onClick={() => setView('2d')}>2D map</button>
            </div>
          </div>
          <div className="map-viewport" style={{ position: 'relative', height: 'clamp(240px, 53vw, 550px)', background: '#211919' }}>
            {view === '3d' ? <MapBoundary fallback={fallback}>
              <Suspense fallback={fallback}><ExpeditionScene state={state} preview={preview} waypoints={remainingRoute} mode={mode} effect={effect} onPick={pick} /></Suspense>
            </MapBoundary> : fallback}
            {view === '3d' && <div className="map-inset" style={{
              position: 'absolute', right: '.65rem', bottom: '.65rem', width: 'clamp(6rem, 24%, 10rem)',
              border: '1px solid #8b7467', borderRadius: '.3rem', overflow: 'hidden', pointerEvents: 'none',
            }}><SurfaceMap compact state={state} preview={preview} route={remainingRoute} /></div>}
          </div>
          <div className="map-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '.35rem 1rem', padding: '.65rem' }}>
            <span className="micro">{coordinates(state.position)} · {TERRAIN_NAME[terrain]}</span>
            <span className="micro">{canEdit ? 'Select a cell to add a waypoint' : 'Route is a visual guide'}</span>
            <span className="micro"><span style={{ color: '#f8c77c' }}>■</span> Lander · <span style={{ color: '#8ceadb' }}>◆</span> Science · <span style={{ color: '#f5e5d2' }}>╌</span> Track</span>
          </div>
        </section>

        <section className="panel ops-tutorial" aria-label="Field guide" style={{ marginTop: '.8rem', padding: '.85rem' }}>
          <p className="eyebrow">{state.mission === 'first-survey' ? 'FIRST SURVEY / TUTORIAL' : 'FIELD GUIDE'}</p>
          <h2>{tutorialTitle}</h2><p>{tutorialText}</p>
          <details><summary>Field controls and science workflow</summary>
            <ol>
              <li>Plan on the map. Scan to tighten terrain estimates and leave battery and time for science.</li>
              <li>Start drive. Use W/S to move, A/D to steer and Space to brake. Pause or replan from your current position.</li>
              <li>Park near a science marker, analyze it, then transmit the data to earn science points and Research Credits.</li>
              <li>Recharge while parked in bright terrain. Return to the lander to install carried spares.</li>
            </ol>
          </details>
        </section>

        <details className="panel ops-log" style={{ marginTop: '.8rem', padding: '.85rem' }}>
          <summary>Mission log · {log.length} {log.length === 1 ? 'entry' : 'entries'}</summary>
          {log.length ? <ol>{log.map((entry, i) => <li key={i}>{entry}</li>)}</ol> : <p>No events recorded yet.</p>}
        </details>
      </div>

      <aside className="ops-side" aria-label="Rover systems" style={{ display: 'grid', gap: '.8rem', alignContent: 'start' }}>
        <section className="panel ops-telemetry" aria-label="Live telemetry" style={{ padding: '.85rem' }}>
          <p className="eyebrow">01 / LIVE TELEMETRY</p>
          <div className="ops-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '.65rem' }}>
            <Metric label="Battery" value={number(state.battery)} unit="EU" tone={lowBattery ? '#ff9287' : undefined} />
            <Metric label="Time left" value={number(timeLeft)} unit="min" />
            <Metric label="Speed" value={number(speed)} unit="m/s" />
            <Metric label="Traveled" value={number(state.distance)} unit="m" />
            <Metric label="Energy used" value={number(state.used)} unit="EU" />
            <Metric label="Sunlight" value={Math.round(light * 100) + '%'} />
          </div>
          <meter aria-label="Rover battery" min={0} max={CAPACITY} low={RESERVE} optimum={CAPACITY} value={state.battery} style={{ width: '100%' }} />
          <p className="micro">{MODULES[state.loadout.wheel].label} wheels · {TERRAIN_NAME[terrain]} · {lowBattery ? 'Reserve power' : 'Rover online'}</p>
          {state.reason && <p className="alert" role="status">{state.reason}</p>}
        </section>

        <section className="panel ops-route" aria-label="Route planner" style={{ padding: '.85rem' }}>
          <p className="eyebrow">02 / NAVIGATION</p>
          <h2>{planning ? 'Route planner' : 'Route guidance'}</h2>
          {guide && next ? <div className="route-guidance">
            <strong>Next · {nameAt(next, mission.start)}</strong>
            <p className="micro">{guide.distance} m · {guide.direction} · {guide.instruction}</p>
          </div> : <p className="micro">{planning ? 'No waypoints queued. Select the map or choose a preset.' : 'No waypoints ahead. Use the map or replan to add a guide.'}</p>}
          {route.length > 0 && <ol className="route-list">
            {route.map((cell, i) => <li key={i + ':' + key(cell)}>
              <div style={{ display: 'flex', gap: '.35rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{i < visited ? '✓ ' : ''}{nameAt(cell, mission.start)} <small>· {TERRAIN_NAME[terrainAt(cell)]}</small></span>
                {canEdit && <div className="button-row">
                  <button type="button" className="ghost" aria-label={'Move waypoint ' + (i + 1) + ' earlier'} onClick={() => reorder(i, -1)} disabled={!i}>↑</button>
                  <button type="button" className="ghost" aria-label={'Move waypoint ' + (i + 1) + ' later'} onClick={() => reorder(i, 1)} disabled={i === route.length - 1}>↓</button>
                  <button type="button" className="ghost" aria-label={'Remove waypoint ' + (i + 1)} onClick={() => setRoute(route.filter((_, j) => i !== j))}>×</button>
                </div>}
              </div>
            </li>)}
          </ol>}
          {canEdit && <div className="route-presets button-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
            {state.mission === 'dune-crossing' ? <>
              <button type="button" className="outline" onClick={() => setRoute([...DUNE_NORTH])}
                title="Recommended firm-ground route. Replaces the current queue.">North detour · recommended</button>
              <button type="button" className="outline" onClick={() => setRoute([SITES.strata.cell])}
                title="Direct route through soft sand. Replaces the current queue.">Dune shortcut</button>
            </> : <button type="button" className="outline" disabled={mission.targets.every(id => statusAt(state, id) !== 'Awaiting sample')}
              title="Replaces the current queue with remaining science sites." onClick={() => setRoute(mission.targets.filter(id => statusAt(state, id) === 'Awaiting sample').map(id => SITES[id].cell))}>Plot survey sites</button>}
            <button type="button" className="ghost" disabled={!route.length} onClick={() => setRoute([])}>Clear route</button>
          </div>}
          {state.mission === 'dune-crossing' && planning && <p className="micro">The north detour stays on firm ground. The direct route is shorter, but soft sand favors wide traction wheels.</p>}
          {preview.blocked && route.length > 0 && <p className="alert">{preview.blocked}</p>}
          {hasEstimate && <>
            <p className="eyebrow" style={{ marginTop: '.85rem' }}>REMAINING ROUTE / ESTIMATED</p>
            <div className="ops-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '.65rem' }}>
              <Metric label="Energy" value={range(preview.energy)} unit="EU" />
              <Metric label="Time" value={range(preview.minutes)} unit="min" />
              <Metric label="Terrain risk" value={preview.risk[0].toUpperCase() + preview.risk.slice(1)} tone={RISK_COLOR[preview.risk]} />
            </div>
            <p className="micro">Arrival battery: {number(Math.max(0, preview.remaining))} EU estimated. Field actions are additional.</p>
            {worstBattery < RESERVE && <p className="micro" style={{ color: '#ffb595' }}>This route could bring the battery below its {RESERVE} EU reserve.</p>}
            {preview.warnings.length > 0 && <ul className="route-warnings micro">{preview.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>}
          </>}
        </section>

        <section className="panel ops-science" aria-label="Science and field actions" style={{ padding: '.85rem' }}>
          <p className="eyebrow">03 / FIELD SCIENCE</p>
          <h2>Science objectives</h2>
          <p className="micro">{state.science} science points · {state.credits} Research Credits · {state.pending.length}/{slots} data slots used</p>
          <ul className="objectives">{mission.targets.map(id => <li key={id}>
            <span>{SITES[id].code} · {SITE_NAME[id]}<small style={{ display: 'block' }}>{statusAt(state, id)}</small></span>
            {canEdit && statusAt(state, id) === 'Awaiting sample' && <button type="button" className="ghost"
              onClick={() => pick(SITES[id].cell)} disabled={route.some(c => same(c, SITES[id].cell)) || distance(state.position, SITES[id].cell) <= .15}
              aria-label={'Add waypoint for ' + SITE_NAME[id]}>Add waypoint</button>}
          </li>)}</ul>
          <p className="micro" role="status">{effect ? EFFECT_NAME[effect] + '…' : sharedLock ||
            (nearby ? 'In range · ' + SITE_NAME[nearby] : 'Park within ' + number(.72 * TILE_SIZE) + ' m of a site to analyze it.')}</p>
          <div className="ops-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '.45rem' }}>
            <FieldAction label="Scan terrain" info={scanCost + ' EU · 4 min'} reason={scanLock} run={() => act({ type: 'scan' })} />
            <FieldAction label="Analyze sample" info={analysisCost + ' EU · 7 min'} reason={analyzeLock} run={() => nearby && act({ type: 'analyze', site: nearby })} />
            <FieldAction label="Transmit" info="6 EU · 4 min" reason={transmitLock} run={() => act({ type: 'transmit' })} />
            {([10, 20] as const).map(minutes => <FieldAction key={minutes} label={'Charge ' + minutes + ' min'}
              info="Solar recharge" reason={chargeLock(minutes)} run={() => act({ type: 'recharge', minutes })} />)}
          </div>
        </section>

        <details className="panel ops-garage" style={{ padding: '.85rem' }}>
          <summary>Lander garage · {state.loadout.spares.length} {state.loadout.spares.length === 1 ? 'spare' : 'spares'}</summary>
          <p className="micro">Park at the lander to fit a carried spare. Each swap costs {SWAP_CREDITS} Research Credits and {SWAP_MINUTES} min.</p>
          {state.loadout.spares.length ? <ul className="objectives">{state.loadout.spares.map(id => {
            const lock = sharedLock || garageStatus(state, id) || '';
            return <li key={id}><span>{MODULES[id].label}<small style={{ display: 'block' }}>{lock || 'Available to install'}</small></span>
              <button type="button" className="outline" disabled={!!lock} onClick={() => swap(id)} aria-label={'Install ' + MODULES[id].label}>Install</button>
            </li>;
          })}</ul> : <p>No spare modules were packed in the hangar.</p>}
          {canEdit && <button type="button" className="ghost" disabled={distance(state.position, mission.start) <= .15 ||
            route.some(c => same(c, mission.start))} onClick={() => pick(mission.start)}>Add lander waypoint</button>}
        </details>
      </aside>
    </div>
  </>;
}

function FieldAction({ label, info, reason, run }: { label: string; info: string; reason: string; run: () => void }) {
  return <div>
    <button type="button" className="outline" disabled={!!reason} onClick={run} style={{ width: '100%' }}>{label}</button>
    <small className="micro" style={{ display: 'block', marginTop: '.2rem' }}>{reason || info}</small>
  </div>;
}
