import { Component, lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { DUNE_NORTH, MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, inMap, key, RESERVE, same, SWAP_CREDITS, SWAP_MINUTES, TERRAIN, terrainAt, TILE_SIZE, WIDTH } from '../data/expedition';
import { garageStatus, previewRoute, siteAt, sunlight } from '../sim/expedition';
import { useI18n } from '../i18n';
import type { Key } from '../i18n';
import type { Cell, ControlMode, MissionState, ModuleId, PlanPreview, SiteId, StationaryAction, TerrainKind } from '../types/expedition';
import { LangSwitch, missionName, modLabel, modName, siteName, terrainName } from './ExpeditionUI';
import './hud.css';

const ExpeditionScene = lazy(() => import('../scene/ExpeditionScene').then(({ ExpeditionScene }) => ({ default: ExpeditionScene })));

type OperationsProps = {
  state: MissionState; route: Cell[]; setRoute: (r: Cell[]) => void; mode: ControlMode; setMode: (m: ControlMode) => void;
  act: (a: StationaryAction) => void; effect: StationaryAction['type'] | null; swap: (id: ModuleId) => void; report: () => void; exit: () => void;
  log: readonly string[];
};
type T = (k: Key, v?: Record<string, string | number>) => string;

const RISK_COLOR = { low: '#9ff5c8', medium: '#ffd27a', high: '#ff6b5b' };
const distance = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.z - b.z);
const num = (n: number, d = 1) => n.toFixed(d);
const range = ([a, b]: PlanPreview['energy']) => num(a, 0) === num(b, 0) ? num(a, 0) : num(a, 0) + '–' + num(b, 0);
const statusAt = (state: MissionState, id: SiteId) => state.delivered.some(s => s.site === id) ? 'done' : state.pending.some(s => s.site === id) ? 'stored' : 'open';
const nameAt = (t: T, cell: Cell, start: Cell) => {
  const id = (Object.keys(SITES) as SiteId[]).find(id => same(SITES[id].cell, cell));
  return id ? siteName(t, id) : same(cell, start) ? t('hud.lander') : t('hud.waypoint');
};

const MapTerrain = memo(function MapTerrain() {
  return <g aria-hidden="true">{cells.map(c => <rect key={key(c)} x={c.x} y={c.z} width={1.02} height={1.02}
    fill={TERRAIN[terrainAt(c)].color} fillOpacity={.7 + ((c.x * 23 + c.z * 17) % 7) * .03} />)}</g>;
});

function TacticalMap({ state, preview, route, onPick, compact = false }: { state: MissionState; preview: PlanPreview; route: readonly Cell[]; onPick?: (cell: Cell) => void; compact?: boolean }) {
  const { t } = useI18n();
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
    aria-label={t('map.title')}>
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
      <title>{nameAt(t, c, mission.start)} · {terrainName(t, terrainAt(c))}</title></rect>)}</g>}
  </svg>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Gauge({ label, value, max, unit, warn }: { label: string; value: number; max: number; unit: string; warn?: boolean }) {
  const p = Math.max(0, Math.min(1, value / max));
  return <div className={'hud-gauge' + (warn ? ' warn' : '')}>
    <div className="hud-gauge-head"><span>{label}</span><b>{num(value, value >= 100 ? 0 : 1)}<small>{unit}</small></b></div>
    <div className="hud-gauge-bar"><i style={{ width: p * 100 + '%' }} /></div>
  </div>;
}

/* ---------- Guided tutorial ----------
   Each step is derived from game state, so it can never get out of sync:
   it advances only when the player has actually done the thing it asks for. */
type Target = 'presets' | 'estimate' | 'start' | 'compass' | 'brake' | 'analyze' | 'transmit' | 'recharge' | 'resume' | 'report' | null;
type Step = { id: string; phase: 0 | 1 | 2 | 3 | 4; title: Key; body: Key; target: Target; keys?: string[]; ack?: boolean };
const PHASES: Key[] = ['tour.phase.plan', 'tour.phase.drive', 'tour.phase.study', 'tour.phase.send', 'tour.phase.done'];

function tourStep(state: MissionState, mode: ControlMode, route: Cell[], acked: Set<string>, nearby: SiteId | undefined): Step {
  const mission = MISSIONS[state.mission];
  const dune = state.mission === 'dune-crossing';
  const open = mission.targets.filter(id => statusAt(state, id) === 'open');
  const speed = Math.abs(state.pose.speed);
  if (mission.targets.every(id => statusAt(state, id) === 'done') || state.outcome) return { id: 'done', phase: 4, title: 'tour.done.t', body: 'tour.done.b', target: 'report' };
  if (!acked.has('intro')) return { id: 'intro', phase: 0, title: 'tour.intro.t', body: dune ? 'tour.introDune.b' : 'tour.intro.b', target: null, ack: true };
  if (state.pending.length) return speed > 0
    ? { id: 'brake', phase: 3, title: 'tour.brake.t', body: 'tour.brake.b', target: 'brake', keys: ['Space'] }
    : { id: 'send', phase: 3, title: 'tour.send.t', body: 'tour.send.b', target: 'transmit', keys: ['T'] };
  if (nearby && statusAt(state, nearby) === 'open') return speed > 0
    ? { id: 'brake', phase: 2, title: 'tour.brake.t', body: 'tour.brake.b', target: 'brake', keys: ['Space'] }
    : { id: 'analyze', phase: 2, title: 'tour.analyze.t', body: 'tour.analyze.b', target: 'analyze', keys: ['F'] };
  if (state.battery <= RESERVE + 5 && mode !== 'planning') return { id: 'power', phase: 1, title: 'tour.power.t', body: 'tour.power.b', target: 'recharge', keys: ['R'] };
  if (mode === 'planning') {
    if (!route.length) return state.delivered.length
      ? { id: 'plan2', phase: 0, title: 'tour.plan2.t', body: 'tour.plan2.b', target: 'start' }
      : { id: 'plan', phase: 0, title: 'tour.plan.t', body: dune ? 'tour.planDune.b' : 'tour.plan.b', target: 'presets' };
    if (!acked.has('estimate')) return { id: 'estimate', phase: 0, title: 'tour.est.t', body: 'tour.est.b', target: 'estimate', ack: true };
    return { id: 'start', phase: 0, title: 'tour.start.t', body: 'tour.start.b', target: 'start', keys: ['Enter'] };
  }
  if (mode === 'paused') return { id: 'paused', phase: 1, title: 'tour.paused.t', body: 'tour.paused.b', target: 'resume', keys: ['Enter'] };
  if (state.delivered.length && open.length) return { id: 'next', phase: 1, title: 'tour.next.t', body: 'tour.next.b', target: 'compass', keys: ['W', 'A', 'D'] };
  return { id: 'drive', phase: 1, title: 'tour.drive.t', body: 'tour.drive.b', target: 'compass', keys: ['W', 'A', 'S', 'D'] };
}

function Tour({ step, onAck, onSkip }: { step: Step; onAck: () => void; onSkip: () => void }) {
  const { t } = useI18n();
  return <aside className={'tour tour-at-' + (step.target ?? 'center')} role="status" aria-live="polite" key={step.id}>
    <ol className="tour-phases" aria-hidden="true">{PHASES.map((p, i) => <li key={p} className={i < step.phase ? 'past' : i === step.phase ? 'now' : ''}><i />{t(p)}</li>)}</ol>
    <h3>{t(step.title)}</h3>
    <p>{t(step.body)}</p>
    {step.keys && <div className="tour-keys">{step.keys.map(k => <kbd key={k}>{k}</kbd>)}</div>}
    <div className="tour-foot">
      <button className="tour-skip" onClick={onSkip}>{t('tour.skip')}</button>
      {step.ack && <button className="hud-btn primary" onClick={onAck} autoFocus>{step.id === 'intro' ? t('tour.next') : t('tour.ok')}</button>}
    </div>
  </aside>;
}

export function Operations({ state, route, setRoute, mode, setMode, act, effect, swap, report, exit, log }: OperationsProps) {
  const { t, m } = useI18n();
  const mission = MISSIONS[state.mission];
  const [tactical, setTactical] = useState(false);
  const [garage, setGarage] = useState(false);
  const [visited, setVisited] = useState(0);
  const [guide, setGuide] = useState(() => { try { return localStorage.getItem('apogee-tour-off-' + state.mission) !== '1'; } catch { return true; } });
  const [acked, setAcked] = useState<Set<string>>(() => new Set());
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
  const nextOpen = mission.targets.find(id => statusAt(state, id) === 'open');
  const aim = remaining[0] ?? (nextOpen ? SITES[nextOpen].cell : undefined);
  const heading = aim && Math.atan2(aim.x - state.position.x, aim.z - state.position.z);
  const turn = aim ? Math.atan2(Math.sin(heading! - state.pose.heading), Math.cos(heading! - state.pose.heading)) * 180 / Math.PI : 0;
  const meters = aim ? distance(state.position, aim) * TILE_SIZE : 0;
  const complete = mission.targets.every(id => statusAt(state, id) === 'done');
  const atLander = distance(state.position, mission.start) <= .65;
  const step = tourStep(state, mode, route, acked, nearby);
  const tg = guide ? step.target : null;
  const hi = (target: Target) => tg === target ? ' tour-hi' : '';

  function pick(cell: Cell) {
    if (!canEdit || !inMap(cell) || distance(state.position, cell) <= .15 || (route.length && same(route[route.length - 1], cell))) return;
    setRoute([...route, cell]);
  }
  function skipTour() { setGuide(false); try { localStorage.setItem('apogee-tour-off-' + state.mission, '1'); } catch { /* ignore */ } }
  function showTour() { setGuide(true); setAcked(new Set(['intro'])); try { localStorage.removeItem('apogee-tour-off-' + state.mission); } catch { /* ignore */ } }
  const lock = ended ? t('why.ended') : effect ? t(('fx.' + effect) as Key) + '…' : speed > 0 ? t('why.stop') : '';
  const budget = (e: number, mi: number) => e > state.battery ? t('why.battery') : mi > timeLeft ? t('why.time') : '';
  const scanCost = state.loadout.scanner === 'stereo' ? 8 : 6, analysisCost = state.loadout.instrument === 'spectral' ? 16 : 12;
  const actions: { id: StationaryAction['type']; key: string; cost: string; reason: string; run: () => void }[] = [
    { id: 'scan', key: 'Q', cost: scanCost + ' EU', reason: lock || (!state.loadout.scanner ? t('why.noScanner') : budget(scanCost, 4)), run: () => act({ type: 'scan' }) },
    { id: 'analyze', key: 'F', cost: analysisCost + ' EU', reason: lock || (!nearby ? t('why.noSample') : statusAt(state, nearby) !== 'open' ? t('why.done') : state.pending.length >= slots ? t('why.full') : budget(analysisCost, 7)), run: () => nearby && act({ type: 'analyze', site: nearby }) },
    { id: 'transmit', key: 'T', cost: '6 EU', reason: lock || (!state.pending.length ? t('why.noData') : budget(6, 4)), run: () => act({ type: 'transmit' }) },
    { id: 'recharge', key: 'R', cost: t('act.rechargeCost'), reason: lock || (state.battery >= CAPACITY - 1e-6 ? t('why.fullBattery') : sunlight(state.position, state.elapsed + 5) < .25 ? t('why.dark') : budget(0, 10)), run: () => act({ type: 'recharge', minutes: 10 }) },
  ];

  const keyRef = useRef<(e: globalThis.KeyboardEvent) => void>(() => {});
  keyRef.current = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const tgt = e.target;
    if (tgt instanceof Element && tgt.closest('input,textarea,select,[contenteditable]')) return;
    const k = e.key.toLowerCase();
    const action = actions.find(a => a.key.toLowerCase() === k);
    if (action) { if (!action.reason) { e.preventDefault(); action.run(); } return; }
    if (k === 'm') { e.preventDefault(); setTactical(v => !v); return; }
    if (k === 'h') { e.preventDefault(); if (guide) skipTour(); else showTour(); return; }
    if (k === 'escape') { if (tactical) setTactical(false); else if (garage) setGarage(false); else if (driving) setMode('paused'); return; }
    if (k === 'enter' && !(tgt instanceof HTMLButtonElement)) {
      if (guide && step.ack) { e.preventDefault(); setAcked(s => new Set(s).add(step.id)); return; }
      if (!ended && !effect) { e.preventDefault(); setMode(driving ? 'paused' : 'driving'); }
    }
  };
  useEffect(() => {
    const f = (e: globalThis.KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const mapFallback = <div className="hud-scene-fallback"><p>{t('hud.webgl')}</p><TacticalMap state={state} preview={preview} route={remaining} onPick={canEdit ? pick : undefined} /></div>;
  const steer = Math.max(-1, Math.min(1, turn / 90));
  const toast = state.reason ? m(state.reason) : null;
  const showHint = !guide || step.id === 'done';
  const hint: [string, string] | null = !showHint ? null : ended ? [t('hint.ended'), t('hint.endedText')] : complete ? [t('hint.complete'), t('hint.completeText')] :
    state.pending.length && speed === 0 ? [t('hint.send'), t('hint.sendText')] : nearby && statusAt(state, nearby) === 'open' ? [t('hint.range'), t(speed > 0 ? 'hint.rangeStop' : 'hint.rangeGo')] :
    state.battery <= RESERVE ? [t('hint.power'), t('hint.powerText')] : null;

  return <div className={'hud-root mode-' + mode + (ended ? ' ended' : '') + (guide ? ' touring' : '')}>
    <div className="hud-scene">
      <SceneBoundary fallback={mapFallback}><Suspense fallback={<div className="hud-loading">{t('hud.loading')}</div>}>
        <ExpeditionScene state={state} preview={preview} waypoints={remaining} mode={mode} effect={effect} onPick={pick} />
      </Suspense></SceneBoundary>
    </div>
    <div className="hud-vignette" aria-hidden="true" />

    <header className="hud-top">
      <button className="hud-icon-btn" onClick={exit} aria-label={t('hud.leave')} title={t('hud.leave')}>‹</button>
      <div className="hud-title"><span>{t('hud.mission')} {mission.number}</span><strong>{missionName(t, mission.id)}</strong></div>
      <div className="hud-objectives">
        {mission.targets.map(id => <div key={id} className={'hud-objective ' + statusAt(state, id)}>
          <i /><span>{siteName(t, id)}</span><small>{statusAt(state, id) === 'done' ? t('hud.sent') : statusAt(state, id) === 'stored' ? t('hud.stored') : t('hud.pts', { n: SITES[id].science })}</small>
        </div>)}
      </div>
      <div className="hud-score"><div><span>{t('hud.science')}</span><b>{state.science}</b></div><div><span>{t('hud.rc')}</span><b>{state.credits}</b></div></div>
      <LangSwitch className="hud" />
      <button className={'hud-icon-btn' + (guide ? ' on' : '')} onClick={() => guide ? skipTour() : showTour()} aria-label={t('hud.help')} title={t('hud.help') + ' (H)'} aria-pressed={guide}>?</button>
      <button className={'hud-btn ' + (complete || ended ? 'primary' : 'ghost') + hi('report')} onClick={report} disabled={!!effect}>{t('hud.report')}</button>
    </header>

    <aside className="hud-left">
      <Gauge label={t('hud.battery')} value={state.battery} max={CAPACITY} unit="EU" warn={state.battery <= RESERVE} />
      <Gauge label={t('hud.time')} value={timeLeft} max={mission.limit} unit="min" warn={timeLeft < 15} />
      <div className="hud-readouts">
        <div className={hi('brake').trim()}><span>{t('hud.speed')}</span><b>{num(speed)}<small>m/s</small></b></div>
        <div><span>{t('hud.sun')}</span><b>{Math.round(light * 100)}<small>%</small></b></div>
        <div><span>{t('hud.ground')}</span><b className="small">{terrainName(t, terrain)}</b></div>
        <div><span>{t('hud.data')}</span><b>{state.pending.length}/{slots}</b></div>
      </div>
      <p className="hud-wheels">{modLabel(t, state.loadout.wheel)}</p>
    </aside>

    {!planning && <div className="hud-minimap">
      <button className="hud-minimap-open" onClick={() => setTactical(true)} aria-label={t('hud.openMap')}>
        <TacticalMap compact state={state} preview={preview} route={remaining} />
        <span>M · {t('hud.map')}</span>
      </button>
    </div>}

    {!planning && aim && <div className={'hud-compass' + hi('compass')}>
      <div className="hud-compass-track"><i style={{ left: 50 - steer * 46 + '%' }} /></div>
      <span>{nameAt(t, aim, mission.start)} · {num(meters, 0)} m</span>
    </div>}

    {hint && <div className="hud-hint" role="status"><b>{hint[0]}</b><span>{hint[1]}</span></div>}
    {toast && <div className="hud-toast" key={toast + state.elapsed}>{toast}</div>}

    {planning && !ended && <section className="hud-planner" aria-label={t('plan.title')}>
      <header><span>{t('plan.title')}</span><b>{route.length === 0 ? t('plan.none') : route.length === 1 ? t('plan.one') : t('plan.count', { n: route.length })}</b></header>
      <div className={'hud-presets' + hi('presets')}>
        {state.mission === 'dune-crossing' ? <>
          <button className="hud-chip" onClick={() => setRoute([...DUNE_NORTH])}>{t('plan.north')}<small>{t('plan.northSub')}</small></button>
          <button className="hud-chip" onClick={() => setRoute([SITES.strata.cell])}>{t('plan.short')}<small>{t('plan.shortSub')}</small></button>
        </> : nextOpen && <button className="hud-chip" onClick={() => setRoute(mission.targets.filter(id => statusAt(state, id) === 'open').map(id => SITES[id].cell))}>{t('plan.sites')}<small>{t('plan.sitesSub')}</small></button>}
        {!atLander && <button className="hud-chip" onClick={() => pick(mission.start)}>{t('plan.return')}<small>{t('plan.returnSub')}</small></button>}
      </div>
      <p className="hud-note left">{t('plan.hint')}</p>
      {route.length > 0 && <ol className="hud-route">{route.map((c, i) => <li key={i + key(c)}><span>{i + 1}</span>{nameAt(t, c, mission.start)}<small>{terrainName(t, terrainAt(c))}</small>
        <button aria-label={t('plan.remove', { n: i + 1 })} onClick={() => setRoute(route.filter((_, j) => j !== i))}>×</button></li>)}</ol>}
      {preview.steps.length > 0 && <div className={'hud-estimate' + hi('estimate')}>
        <div><span>{t('est.energy')}</span><b>{range(preview.energy)}<small>EU</small></b></div>
        <div><span>{t('est.time')}</span><b>{range(preview.minutes)}<small>min</small></b></div>
        <div><span>{t('est.risk')}</span><b style={{ color: RISK_COLOR[preview.risk] }}>{t(('risk.' + preview.risk) as Key)}</b></div>
      </div>}
      {preview.warnings.slice(0, 2).map(x => <p className="hud-warn" key={x}>{m(x)}</p>)}
      <div className="hud-planner-foot">
        {route.length > 0 && <button className="hud-btn ghost" onClick={() => setRoute([])}>{t('plan.clear')}</button>}
        <button className={'hud-btn primary big' + hi('start')} onClick={e => { e.currentTarget.blur(); setMode('driving'); }} disabled={!!effect}>{t('plan.start')}<kbd>Enter</kbd></button>
      </div>
      <p className="hud-note">{t('plan.note')}</p>
    </section>}

    {!planning && !ended && <div className="hud-drivebar">
      {driving ? <button className="hud-btn ghost" onClick={() => setMode('paused')}>{t('drive.pause')}<kbd>Esc</kbd></button> :
        <button className={'hud-btn primary' + hi('resume')} onClick={e => { e.currentTarget.blur(); setMode('driving'); }} disabled={!!effect}>{t('drive.resume')}<kbd>Enter</kbd></button>}
      <button className="hud-btn ghost" onClick={() => setMode('planning')} disabled={!!effect}>{t('drive.replan')}</button>
      {atLander && state.loadout.spares.length > 0 && <button className="hud-btn ghost" onClick={() => { setMode('paused'); setGarage(true); }}>{t('drive.garage')}</button>}
      <div className={'hud-keys' + hi('brake')} aria-hidden="true"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>{t('drive.drive')}</span><kbd>Space</kbd><span>{t('drive.brake')}</span></div>
    </div>}

    {!planning && <div className="hud-actions">
      {actions.map(a => <button key={a.id} className={'hud-action' + (effect === a.id ? ' running' : '') + hi(a.id as Target)} disabled={!!a.reason} onClick={a.run} title={a.reason || a.cost}>
        <kbd>{a.key}</kbd><b>{t(('act.' + a.id) as Key)}</b><small>{a.reason || a.cost}</small>
      </button>)}
    </div>}

    {!guide && log.length > 0 && !planning && <ol className="hud-log">{log.slice(-3).map((l, i) => <li key={i + l}>{m(l)}</li>)}</ol>}

    {guide && <Tour step={step} onAck={() => setAcked(s => new Set(s).add(step.id))} onSkip={skipTour} />}

    {tactical && <div className="hud-overlay" role="dialog" aria-label={t('map.title')} onClick={e => { if (e.target === e.currentTarget) setTactical(false); }}>
      <div className="hud-overlay-panel map">
        <header><b>{t('map.title')}</b><span>{canEdit ? t('map.edit') : t('map.locked')}</span><button className="hud-icon-btn" onClick={() => setTactical(false)} aria-label={t('map.close')}>×</button></header>
        <TacticalMap state={state} preview={preview} route={remaining} onPick={canEdit ? pick : undefined} />
        <footer>{(Object.keys(TERRAIN) as TerrainKind[]).map(k => <span key={k}><i style={{ background: TERRAIN[k].color }} />{terrainName(t, k)}</span>)}<span><i className="ring" />{t('map.site')}</span><span><i className="lander" />{t('hud.lander')}</span></footer>
      </div>
    </div>}

    {garage && <div className="hud-overlay" role="dialog" aria-label={t('gar.title')} onClick={e => { if (e.target === e.currentTarget) setGarage(false); }}>
      <div className="hud-overlay-panel">
        <header><b>{t('gar.title')}</b><span>{t('gar.cost', { rc: SWAP_CREDITS, min: SWAP_MINUTES })}</span><button className="hud-icon-btn" onClick={() => setGarage(false)} aria-label={t('map.close')}>×</button></header>
        <ul className="hud-garage">{state.loadout.spares.map(id => { const why = garageStatus(state, id); return <li key={id}>
          <div><b>{modName(t, id)}</b><small>{why ? m(why) : t(('mod.' + id + '.desc') as Key)}</small></div>
          <button className="hud-btn primary" disabled={!!why} onClick={() => swap(id)}>{t('gar.install')}</button></li>; })}</ul>
      </div>
    </div>}
  </div>;
}

