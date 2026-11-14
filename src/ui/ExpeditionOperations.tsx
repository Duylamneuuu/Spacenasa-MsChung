import { Component, lazy, memo, Suspense, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { DUNE_NORTH, MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, inMap, key, MODULES, RESERVE, same, SWAP_CREDITS, SWAP_MINUTES, TERRAIN, terrainAt, TILE_SIZE, WIDTH } from '../data/expedition';
import { garageStatus, previewRoute, siteAt, sunlight } from '../sim/expedition';
import type { Cell, ControlMode, MissionState, ModuleId, PlanPreview, SiteId, StationaryAction, TerrainKind } from '../types/expedition';
import './hud.css';

const ExpeditionScene = lazy(() => import('../scene/ExpeditionScene').then(({ ExpeditionScene }) => ({ default: ExpeditionScene })));

type OperationsProps = {
  state: MissionState; route: Cell[]; setRoute: (r: Cell[]) => void; mode: ControlMode; setMode: (m: ControlMode) => void;
  act: (a: StationaryAction) => void; effect: StationaryAction['type'] | null; swap: (id: ModuleId) => void; report: () => void; exit: () => void;
  log: readonly string[];
};

const SITE_NAME = Object.fromEntries((Object.keys(SITES) as SiteId[]).map(id => [id, SITES[id].name])) as Record<SiteId, string>;
const TERRAIN_NAME: Record<TerrainKind, string> = { hard: 'Firm ground', sand: 'Soft sand', rock: 'Sharp rock' };
const EFFECT_NAME = { scan: 'Scanning terrain', analyze: 'Analyzing sample', transmit: 'Transmitting data', recharge: 'Charging battery' } as const;
const RISK_COLOR = { low: '#9ff5c8', medium: '#ffd27a', high: '#ff6b5b' };
const distance = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.z - b.z);
const num = (n: number, d = 1) => n.toFixed(d);
const range = ([a, b]: PlanPreview['energy']) => num(a, 0) === num(b, 0) ? num(a, 0) : num(a, 0) + '–' + num(b, 0);
const statusAt = (state: MissionState, id: SiteId) => state.delivered.some(s => s.site === id) ? 'done' : state.pending.some(s => s.site === id) ? 'stored' : 'open';
const nameAt = (cell: Cell, start: Cell) => {
  const id = (Object.keys(SITES) as SiteId[]).find(id => same(SITES[id].cell, cell));
  return id ? SITE_NAME[id] : same(cell, start) ? 'Lander' : 'Waypoint';
};

const MapTerrain = memo(function MapTerrain() {
  return <g aria-hidden="true">{cells.map(c => <rect key={key(c)} x={c.x} y={c.z} width={1.02} height={1.02}
    fill={TERRAIN[terrainAt(c)].color} fillOpacity={.7 + ((c.x * 23 + c.z * 17) % 7) * .03} />)}</g>;
});

function TacticalMap({ state, preview, route, onPick, compact = false }: { state: MissionState; preview: PlanPreview; route: readonly Cell[]; onPick?: (cell: Cell) => void; compact?: boolean }) {
  const mission = MISSIONS[state.mission];
  const [cursor, setCursor] = useState<Cell>(mission.start);
  const [focus, setFocus] = useState(false);
  function move(e: KeyboardEvent<SVGSVGElement>) {
    if (!onPick) return;
    const d: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(cursor); return; }
    const step = d[e.key];
    if (!step) return;
    e.preventDefault();
    const next = { x: cursor.x + step[0], z: cursor.z + step[1] };
    if (inMap(next)) setCursor(next);
  }
  return <svg className={compact ? 'hud-minimap-svg' : 'hud-tactical-svg'} viewBox={'-0.2 -0.2 ' + (WIDTH + .4) + ' ' + (HEIGHT + .4)}
    role={onPick ? 'application' : 'img'} tabIndex={onPick ? 0 : undefined} onKeyDown={move} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
    aria-label={onPick ? 'Tactical map. Arrow keys move the cursor; Enter adds a waypoint.' : 'Minimap'}>
    <MapTerrain />
    <g pointerEvents="none">
      {state.trace.length > 1 && <polyline points={state.trace.map(c => (c.x + .5) + ',' + (c.z + .5)).join(' ')} fill="none" stroke="#f3e9da" strokeWidth={.09} opacity={.6} strokeLinecap="round" strokeLinejoin="round" />}
      {preview.steps.map(({ from, to, risk, uncertain }, i) => <line key={i} x1={from.x + .5} y1={from.z + .5} x2={to.x + .5} y2={to.z + .5}
        stroke={RISK_COLOR[risk]} strokeWidth={compact ? .2 : .12} strokeDasharray={uncertain ? '.18 .1' : undefined} strokeLinecap="round" />)}
      <rect x={mission.start.x + .2} y={mission.start.z + .2} width={.6} height={.6} fill="none" stroke="#ffb46b" strokeWidth={.12} />
      {mission.targets.map(id => {
        const { x, z } = SITES[id].cell, s = statusAt(state, id);
        return <g key={id} transform={'translate(' + (x + .5) + ' ' + (z + .5) + ')'}>
          <circle r={.42} fill="none" stroke={s === 'done' ? '#a9f6bb' : s === 'stored' ? '#ffd27a' : '#7fe3df'} strokeWidth={.1} />
          <circle r={.13} fill={s === 'done' ? '#a9f6bb' : '#7fe3df'} />
        </g>;
      })}
      {!compact && route.map(({ x, z }, i) => <g key={i}><circle cx={x + .5} cy={z + .5} r={.3} fill="#1a1210" stroke="#ffd27a" strokeWidth={.07} />
        <text x={x + .5} y={z + .52} textAnchor="middle" dominantBaseline="central" fontSize={.32} fill="#fff1d7" fontWeight={700}>{i + 1}</text></g>)}
      <g transform={'translate(' + (state.position.x + .5) + ' ' + (state.position.z + .5) + ') rotate(' + (180 - state.pose.heading * 180 / Math.PI) + ')'}>
        <path d="M0 -.42 .3 .28 0 .14 -.3 .28Z" fill="#fff" stroke="#0b0908" strokeWidth={.05} />
      </g>
      {onPick && focus && <rect x={cursor.x + .05} y={cursor.z + .05} width={.9} height={.9} fill="none" stroke="#fff5db" strokeWidth={.08} />}
    </g>
    {onPick && <g>{cells.map(c => <rect key={key(c)} x={c.x} y={c.z} width={1} height={1} fill="transparent" style={{ cursor: 'crosshair' }} onClick={() => { setCursor(c); onPick(c); }}>
      <title>{nameAt(c, mission.start)} · {TERRAIN_NAME[terrainAt(c)]}</title></rect>)}</g>}
  </svg>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function guidance(state: MissionState, target: Cell) {
  const heading = Math.atan2(target.x - state.position.x, target.z - state.position.z);
  const delta = heading - state.pose.heading;
  const turn = Math.atan2(Math.sin(delta), Math.cos(delta)) * 180 / Math.PI;
  const meters = distance(state.position, target) * TILE_SIZE;
  return { turn, meters };
}

function Gauge({ label, value, max, unit, warn, tone }: { label: string; value: number; max: number; unit: string; warn?: boolean; tone?: string }) {
  const p = Math.max(0, Math.min(1, value / max));
  return <div className={'hud-gauge' + (warn ? ' warn' : '')}>
    <div className="hud-gauge-head"><span>{label}</span><b style={tone ? { color: tone } : undefined}>{num(value, value >= 100 ? 0 : 1)}<small>{unit}</small></b></div>
    <div className="hud-gauge-bar"><i style={{ width: p * 100 + '%' }} /></div>
  </div>;
}

function hint(state: MissionState, mode: ControlMode, route: Cell[], nearby: SiteId | undefined): [string, string] {
  const mission = MISSIONS[state.mission];
  if (state.outcome) return ['Operations ended', 'Open the mission report to review your run.'];
  if (mission.targets.every(id => statusAt(state, id) === 'done')) return ['Survey complete', 'All science is home. Open the mission report.'];
  if (state.pending.length && Math.abs(state.pose.speed) === 0) return ['Send the data', 'Press T to transmit. Science and Research Credits arrive on downlink.'];
  if (nearby && statusAt(state, nearby) === 'open') return ['Sample in range', Math.abs(state.pose.speed) > 0 ? 'Brake with Space, then analyze.' : 'Press F to analyze. Scan first (Q) to read the ground.'];
  if (state.battery <= RESERVE) return ['Low power', 'Stop in sunlight and press R to recharge.'];
  if (mode === 'driving') return ['Manual drive', 'W/S throttle · A/D steer · Space brake. The route is a guide only.'];
  if (mode === 'paused') return ['Paused', 'Resume driving or replan from your current position.'];
  if (route.length) return ['Route plotted', 'Check the estimate, then press Start drive.'];
  return ['Plan your route', 'Click the terrain to drop waypoints, or pick a suggested route.'];
}

export function Operations({ state, route, setRoute, mode, setMode, act, effect, swap, report, exit, log }: OperationsProps) {
  const mission = MISSIONS[state.mission];
  const [tactical, setTactical] = useState(false);
  const [garage, setGarage] = useState(false);
  const [visited, setVisited] = useState(0);
  const remaining = useMemo(() => route.slice(visited), [route, visited]);
  const preview = previewRoute(state, remaining);
  useEffect(() => { setVisited(0); }, [route]);
  useEffect(() => {
    if (mode === 'driving' && route[visited] && distance(state.position, route[visited]) <= .55) setVisited(visited + 1);
  }, [mode, route, state.position, visited]);

  const planning = mode === 'planning', driving = mode === 'driving', ended = state.outcome !== null;
  const canEdit = planning && !effect && !ended;
  const speed = Math.abs(state.pose.speed);
  const candidate = siteAt(state.position);
  const nearby = candidate && (mission.targets as readonly SiteId[]).includes(candidate) ? candidate : undefined;
  const slots = state.loadout.storage === 'extended' ? 3 : 1;
  const light = sunlight(state.position, state.elapsed);
  const timeLeft = Math.max(0, mission.limit - state.elapsed);
  const terrain = terrainAt({ x: Math.round(state.position.x), z: Math.round(state.position.z) });
  const next = remaining[0];
  const guide = next && guidance(state, next);
  const complete = mission.targets.every(id => statusAt(state, id) === 'done');
  const atLander = distance(state.position, mission.start) <= .65;
  const [hintTitle, hintText] = hint(state, mode, route, nearby);

  function pick(cell: Cell) {
    if (!canEdit || !inMap(cell) || distance(state.position, cell) <= .15 || (route.length && same(route[route.length - 1], cell))) return;
    setRoute([...route, cell]);
  }
  const lock = ended ? 'Operations ended' : effect ? EFFECT_NAME[effect] + '…' : speed > 0 ? 'Stop the rover first' : '';
  const budget = (e: number, m: number) => e > state.battery ? 'Not enough battery' : m > timeLeft ? 'Not enough time' : '';
  const scanCost = state.loadout.scanner === 'stereo' ? 8 : 6, analysisCost = state.loadout.instrument === 'spectral' ? 16 : 12;
  const actions: { id: StationaryAction['type']; key: string; label: string; cost: string; reason: string; run: () => void }[] = [
    { id: 'scan', key: 'Q', label: 'Scan', cost: scanCost + ' EU', reason: lock || (!state.loadout.scanner ? 'No scanner' : budget(scanCost, 4)), run: () => act({ type: 'scan' }) },
    { id: 'analyze', key: 'F', label: 'Analyze', cost: analysisCost + ' EU', reason: lock || (!nearby ? 'No sample in range' : statusAt(state, nearby) !== 'open' ? 'Already analyzed' : state.pending.length >= slots ? 'Storage full' : budget(analysisCost, 7)), run: () => nearby && act({ type: 'analyze', site: nearby }) },
    { id: 'transmit', key: 'T', label: 'Transmit', cost: '6 EU', reason: lock || (!state.pending.length ? 'No data stored' : budget(6, 4)), run: () => act({ type: 'transmit' }) },
    { id: 'recharge', key: 'R', label: 'Recharge', cost: '+10 min', reason: lock || (state.battery >= CAPACITY - 1e-6 ? 'Battery full' : sunlight(state.position, state.elapsed + 5) < .25 ? 'Too dark here' : budget(0, 10)), run: () => act({ type: 'recharge', minutes: 10 }) },
  ];

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const t = e.target;
      if (t instanceof Element && t.closest('input,textarea,select,[contenteditable]')) return;
      const k = e.key.toLowerCase();
      const action = actions.find(a => a.key.toLowerCase() === k);
      if (action) { if (!action.reason) { e.preventDefault(); action.run(); } return; }
      if (k === 'm') { e.preventDefault(); setTactical(v => !v); return; }
      if (k === 'escape') { if (tactical) setTactical(false); else if (garage) setGarage(false); else if (driving) setMode('paused'); return; }
      if (k === 'enter' && !ended && !effect && !(t instanceof HTMLButtonElement)) { e.preventDefault(); setMode(driving ? 'paused' : 'driving'); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const mapFallback = <div className="hud-scene-fallback"><TacticalMap state={state} preview={preview} route={remaining} onPick={canEdit ? pick : undefined} /></div>;
  const steer = guide ? Math.max(-1, Math.min(1, guide.turn / 90)) : 0;

  return <div className={'hud-root mode-' + mode + (ended ? ' ended' : '')}>
    <div className="hud-scene">
      <SceneBoundary fallback={mapFallback}><Suspense fallback={<div className="hud-loading">Establishing surface link…</div>}>
        <ExpeditionScene state={state} preview={preview} waypoints={remaining} mode={mode} effect={effect} onPick={pick} />
      </Suspense></SceneBoundary>
    </div>
    <div className="hud-vignette" aria-hidden="true" />

    <header className="hud-top">
      <button className="hud-icon-btn" onClick={exit} aria-label="Leave mission">‹</button>
      <div className="hud-title"><span>MISSION {mission.number}</span><strong>{mission.name}</strong></div>
      <div className="hud-objectives" aria-label="Objectives">
        {mission.targets.map(id => <div key={id} className={'hud-objective ' + statusAt(state, id)}>
          <i /><span>{SITE_NAME[id]}</span><small>{statusAt(state, id) === 'done' ? 'Sent' : statusAt(state, id) === 'stored' ? 'Stored' : SITES[id].science + ' pts'}</small>
        </div>)}
      </div>
      <div className="hud-score"><div><span>Science</span><b>{state.science}</b></div><div><span>RC</span><b>{state.credits}</b></div></div>
      <button className={'hud-btn ' + (complete || ended ? 'primary' : 'ghost')} onClick={report} disabled={!!effect}>Report</button>
    </header>

    <aside className="hud-left">
      <Gauge label="Battery" value={state.battery} max={CAPACITY} unit="EU" warn={state.battery <= RESERVE} />
      <Gauge label="Time left" value={timeLeft} max={mission.limit} unit="min" warn={timeLeft < 15} />
      <div className="hud-readouts">
        <div><span>Speed</span><b>{num(speed)}<small>m/s</small></b></div>
        <div><span>Sun</span><b>{Math.round(light * 100)}<small>%</small></b></div>
        <div><span>Ground</span><b className="small">{TERRAIN_NAME[terrain]}</b></div>
        <div><span>Data</span><b>{state.pending.length}/{slots}</b></div>
      </div>
      <p className="hud-wheels">{MODULES[state.loadout.wheel].label} WHEELS</p>
    </aside>

    <div className="hud-minimap" aria-hidden={tactical}>
      <button className="hud-minimap-open" onClick={() => setTactical(true)} aria-label="Open tactical map">
        <TacticalMap compact state={state} preview={preview} route={remaining} />
        <span>M · MAP</span>
      </button>
    </div>

    {driving && guide && next && <div className="hud-compass" aria-live="off">
      <div className="hud-compass-track"><i style={{ left: 50 - steer * 46 + '%' }} /></div>
      <span>{nameAt(next, mission.start)} · {num(guide.meters, 0)} m</span>
    </div>}

    <div className="hud-hint" role="status"><b>{hintTitle}</b><span>{hintText}</span></div>
    {state.reason && <div className="hud-toast" key={state.reason}>{state.reason}</div>}

    {planning && !ended && <section className="hud-planner" aria-label="Route planner">
      <header><span>ROUTE PLAN</span><b>{route.length ? route.length + ' waypoint' + (route.length > 1 ? 's' : '') : 'No waypoints'}</b></header>
      <div className="hud-presets">
        {state.mission === 'dune-crossing' ? <>
          <button className="hud-chip" onClick={() => setRoute([...DUNE_NORTH])}>North detour<small>firm ground</small></button>
          <button className="hud-chip" onClick={() => setRoute([SITES.strata.cell])}>Dune shortcut<small>soft sand</small></button>
        </> : <button className="hud-chip" onClick={() => setRoute(mission.targets.filter(id => statusAt(state, id) === 'open').map(id => SITES[id].cell))}>Survey sites<small>both targets</small></button>}
        {!atLander && <button className="hud-chip" onClick={() => pick(mission.start)}>Return<small>to lander</small></button>}
      </div>
      {route.length > 0 && <ol className="hud-route">{route.map((c, i) => <li key={i + key(c)}><span>{i + 1}</span>{nameAt(c, mission.start)}<small>{TERRAIN_NAME[terrainAt(c)]}</small>
        <button aria-label={'Remove waypoint ' + (i + 1)} onClick={() => setRoute(route.filter((_, j) => j !== i))}>×</button></li>)}</ol>}
      {preview.steps.length > 0 && <div className="hud-estimate">
        <div><span>Energy</span><b>{range(preview.energy)}<small>EU</small></b></div>
        <div><span>Time</span><b>{range(preview.minutes)}<small>min</small></b></div>
        <div><span>Risk</span><b style={{ color: RISK_COLOR[preview.risk] }}>{preview.risk.toUpperCase()}</b></div>
      </div>}
      {preview.warnings.slice(0, 2).map(w => <p className="hud-warn" key={w}>{w}</p>)}
      <div className="hud-planner-foot">
        {route.length > 0 && <button className="hud-btn ghost" onClick={() => setRoute([])}>Clear</button>}
        <button className="hud-btn primary big" onClick={e => { e.currentTarget.blur(); setMode('driving'); }} disabled={!!effect}>Start drive<kbd>Enter</kbd></button>
      </div>
      <p className="hud-note">Estimates only. What you actually drive decides the cost.</p>
    </section>}

    {!planning && !ended && <div className="hud-drivebar">
      {driving ? <button className="hud-btn ghost" onClick={() => setMode('paused')}>Pause<kbd>Esc</kbd></button> :
        <button className="hud-btn primary" onClick={e => { e.currentTarget.blur(); setMode('driving'); }} disabled={!!effect}>Resume<kbd>Enter</kbd></button>}
      <button className="hud-btn ghost" onClick={() => setMode('planning')} disabled={!!effect}>Replan</button>
      {atLander && state.loadout.spares.length > 0 && <button className="hud-btn ghost" onClick={() => { setMode('paused'); setGarage(true); }}>Garage</button>}
      <div className="hud-keys" aria-hidden="true"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>drive</span><kbd>Space</kbd><span>brake</span></div>
    </div>}

    <div className="hud-actions" aria-label="Field actions">
      {actions.map(a => <button key={a.id} className={'hud-action' + (effect === a.id ? ' running' : '')} disabled={!!a.reason} onClick={a.run} title={a.reason || a.cost}>
        <kbd>{a.key}</kbd><b>{a.label}</b><small>{a.reason || a.cost}</small>
      </button>)}
    </div>

    {log.length > 0 && <ol className="hud-log" aria-label="Mission log">{log.slice(-3).map((l, i) => <li key={i + l}>{l}</li>)}</ol>}

    {tactical && <div className="hud-overlay" role="dialog" aria-label="Tactical map" onClick={e => { if (e.target === e.currentTarget) setTactical(false); }}>
      <div className="hud-overlay-panel map">
        <header><b>Tactical map</b><span>{canEdit ? 'Click a cell to add a waypoint' : 'Replan to edit waypoints'}</span><button className="hud-icon-btn" onClick={() => setTactical(false)} aria-label="Close">×</button></header>
        <TacticalMap state={state} preview={preview} route={remaining} onPick={canEdit ? pick : undefined} />
        <footer>{(Object.keys(TERRAIN) as TerrainKind[]).map(t => <span key={t}><i style={{ background: TERRAIN[t].color }} />{TERRAIN_NAME[t]}</span>)}<span><i className="ring" />Science site</span><span><i className="lander" />Lander</span></footer>
      </div>
    </div>}

    {garage && <div className="hud-overlay" role="dialog" aria-label="Lander garage" onClick={e => { if (e.target === e.currentTarget) setGarage(false); }}>
      <div className="hud-overlay-panel">
        <header><b>Lander garage</b><span>{SWAP_CREDITS} RC · {SWAP_MINUTES} min per swap</span><button className="hud-icon-btn" onClick={() => setGarage(false)} aria-label="Close">×</button></header>
        <ul className="hud-garage">{state.loadout.spares.map(id => { const why = garageStatus(state, id); return <li key={id}>
          <div><b>{MODULES[id].name}</b><small>{why || MODULES[id].description}</small></div>
          <button className="hud-btn primary" disabled={!!why} onClick={() => swap(id)}>Install</button></li>; })}</ul>
      </div>
    </div>}
  </div>;
}

