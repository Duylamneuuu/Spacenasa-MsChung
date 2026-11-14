import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, MODULES, TERRAIN, terrainAt, WIDTH, WHEELS } from '../data/expedition';
import { payload, preflight } from '../sim/expedition';
import type { Loadout, Mission, MissionId, MissionState, ModuleId, TerrainKind, WheelId } from '../types/expedition';
import './screens.css';

const TitleMars = lazy(() => import('../scene/TitleMars').then(({ TitleMars }) => ({ default: TitleMars })));

const paths = {
  crosshair: 'M12 2v4m0 12v4M2 12h4m12 0h4M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  battery: 'M7 5H4v14h16V5h-3m-8-3h6m-3 6-3 5h5l-2 4',
  route: 'M5 5h.01M19 19h.01M5 8v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M3 5a2 2 0 1 1 4 0 2 2 0 1 1-4 0Zm14 14a2 2 0 1 1 4 0 2 2 0 1 1-4 0Z',
  sample: 'm9 3 6 0m-5 0v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3m-7 12h10',
  transmit: 'M8 16a6 6 0 0 1 8-8m-3 9 7 4-4-7m-5-5 4 4m5-9a11 11 0 0 0-16 16',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M6 6l1 1m10 10 1 1m0-12-1 1M7 17l-1 1m2-6a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  garage: 'M3 21V9l9-6 9 6v12m-14 0V12h10v9m-10-4h10',
  play: 'm8 5 12 7-12 7Z',
  stop: 'M6 6h12v12H6z',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15',
  x: 'M6 6l12 12M18 6 6 18',
} as const;

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function fmt(n: number, digits = 0) { return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }

const STEPS = [['select', 'Mission'], ['hangar', 'Hangar'], ['preflight', 'Preflight'], ['operations', 'Mars'], ['report', 'Report']] as const;
export function StageBar({ stage }: { stage: string }) {
  const at = STEPS.findIndex(([id]) => id === stage || (id === 'operations' && stage === 'deploy'));
  return <header className="sc-topbar">
    <div className="sc-brand"><i /><b>APOGEE</b></div>
    <ol aria-label="Mission progress">{STEPS.map(([id, name], i) => <li key={id} className={i < at ? 'past' : i === at ? 'now' : ''} aria-current={i === at ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{name}</li>)}</ol>
  </header>;
}

function SectorMap({ mission, trace, position }: { mission: Mission; trace?: MissionState['trace']; position?: MissionState['position'] }) {
  return <svg className="sc-sector" viewBox={'-0.3 -0.3 ' + (WIDTH + .6) + ' ' + (HEIGHT + .6)} role="img" aria-label={'Sector map for ' + mission.name}>
    {cells.map(c => <rect key={c.x + ':' + c.z} x={c.x} y={c.z} width="1.02" height="1.02" fill={TERRAIN[terrainAt(c)].color} opacity={.55 + ((c.x * 43 + c.z * 37) % 13) * .03} />)}
    <rect x={mission.start.x + .18} y={mission.start.z + .18} width=".64" height=".64" fill="none" stroke="#ffb46b" strokeWidth=".12" />
    {mission.targets.map(id => <g key={id}><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".44" fill="none" stroke="#7fe3df" strokeWidth=".1" /><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".14" fill="#7fe3df" /></g>)}
    {trace && trace.length > 1 && <polyline points={trace.map(c => (c.x + .5) + ',' + (c.z + .5)).join(' ')} fill="none" stroke="#fff3e2" strokeWidth=".14" strokeLinejoin="round" strokeLinecap="round" />}
    {position && <circle cx={position.x + .5} cy={position.z + .5} r=".26" fill="#fff" stroke="#0b0908" strokeWidth=".06" />}
  </svg>;
}

const DIFFICULTY: Record<MissionId, [string, string]> = { 'first-survey': ['Training', 'Two nearby samples. Learn to plan, drive, scan and transmit.'], 'dune-crossing': ['Field survey', 'One high-value target behind a dune belt. Choose your wheels and your path.'] };
export function MissionSelect({ onSelect, onBack }: { onSelect: (id: MissionId) => void; onBack: () => void }) {
  const list = Object.values(MISSIONS);
  const [pick, setPick] = useState<MissionId>(list[0].id);
  const m = MISSIONS[pick];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const i = list.findIndex(x => x.id === pick); setPick(list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].id); }
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return <div className="sc-screen sc-select">
    <div className="sc-select-globe" aria-hidden="true"><Suspense fallback={null}><TitleMars /></Suspense></div>
    <div className="sc-grain" aria-hidden="true" />
    <header className="sc-head">
      <button className="sc-back" onClick={onBack}><Icon name="back" size={18} /> Title</button>
      <div><span className="sc-kicker">Select mission</span><h1>Where do we land?</h1></div>
    </header>
    <div className="sc-select-body">
      <ol className="sc-dossiers" role="listbox" aria-label="Missions">
        {list.map(x => <li key={x.id}>
          <button role="option" aria-selected={pick === x.id} className={'sc-dossier' + (pick === x.id ? ' on' : '')} onClick={() => setPick(x.id)} onDoubleClick={() => onSelect(x.id)}>
            <span className="num">{x.number}</span>
            <span className="txt"><small>{DIFFICULTY[x.id][0]}</small><b>{x.name}</b><em>{x.terrain}</em></span>
          </button>
        </li>)}
      </ol>
      <section className="sc-brief" key={m.id} aria-live="polite">
        <span className="sc-kicker">Mission {m.number} · {DIFFICULTY[m.id][0]}</span>
        <h2>{m.name}</h2>
        <p className="lead">{m.brief}</p>
        <p className="sub">{DIFFICULTY[m.id][1]}</p>
        <div className="sc-brief-map"><SectorMap mission={m} /></div>
        <dl className="sc-facts">
          <div><dt>Targets</dt><dd>{m.targets.length}</dd></div>
          <div><dt>Window</dt><dd>{m.limit}<small>min</small></dd></div>
          <div><dt>Budget</dt><dd>{m.budget}<small>BU</small></dd></div>
          <div><dt>Mass cap</dt><dd>{m.massCap}<small>kg</small></dd></div>
        </dl>
        <button className="sc-cta" onClick={() => onSelect(m.id)}>Design rover <Icon name="arrow" /></button>
      </section>
    </div>
    <p className="sc-footnote">EU, RC, BU and terrain multipliers are game values. WASD driving is a teaching simplification: real rovers are commanded from Earth with a radio delay.</p>
  </div>;
}

const sections = [
  { slot: 'wheel', name: 'Wheels', ids: ['light', 'wide', 'reinforced'] },
  { slot: 'scanner', name: 'Scanner', ids: ['nav', 'stereo'] },
  { slot: 'instrument', name: 'Science', ids: ['geology', 'spectral'] },
  { slot: 'storage', name: 'Storage', ids: ['standard', 'extended'] },
] as const;
const TERRAIN_SHORT: Record<TerrainKind, string> = { hard: 'Firm', sand: 'Sand', rock: 'Rock' };

function Meter({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const over = value > max;
  return <div className={'sc-meter' + (over ? ' over' : '')}>
    <div><span>{label}</span><b>{value}<small> / {max} {unit}</small></b></div>
    <i><em style={{ width: Math.min(100, value / max * 100) + '%' }} /></i>
  </div>;
}
export function PayloadReadout({ mission, loadout }: { mission: Mission; loadout: Loadout }) {
  const p = payload(loadout);
  return <div className="sc-payload">
    <Meter label="Budget" value={p.budget} max={mission.budget} unit="BU" />
    <Meter label="Deployed mass" value={p.totalMass} max={mission.massCap} unit="kg" />
    <p>Rover {p.roverMass} kg · Spares {p.spareMass} kg · Lander + support {p.totalMass - p.roverMass - p.spareMass} kg · Battery {CAPACITY} EU</p>
  </div>;
}

export function Hangar({ mission, loadout, onChange, onBack, onNext, scene }: { mission: Mission; loadout: Loadout; onChange: (v: Loadout) => void; onBack: () => void; onNext: () => void; scene: ReactNode }) {
  const [tab, setTab] = useState<typeof sections[number]['slot']>('wheel');
  const [spares, setSpares] = useState(false);
  const active: (ModuleId | null)[] = [loadout.wheel, loadout.scanner, loadout.instrument, loadout.storage];
  const section = sections.find(s => s.slot === tab)!;
  const errors = preflight(mission.id, loadout);
  return <div className="sc-screen sc-hangar">
    <div className="sc-hangar-scene">{scene}</div>
    <div className="sc-hangar-shade" aria-hidden="true" />
    <header className="sc-head">
      <button className="sc-back" onClick={onBack}><Icon name="back" size={18} /> Missions</button>
      <div><span className="sc-kicker">Mission {mission.number} · {mission.name}</span><h1>Earth Hangar</h1></div>
    </header>
    <aside className="sc-config" aria-label="Rover configuration">
      <div className="sc-tabs" role="tablist">
        {sections.map(s => <button key={s.slot} role="tab" aria-selected={tab === s.slot} className={tab === s.slot ? 'on' : ''} onClick={() => setTab(s.slot)}>
          <small>{s.name}</small><b>{loadout[s.slot] ? MODULES[loadout[s.slot] as ModuleId].label : 'NONE'}</b>
        </button>)}
      </div>
      <div className="sc-options" role="tabpanel" key={tab}>
        {section.ids.map(id => {
          const selected = loadout[section.slot] === id, mod = MODULES[id];
          return <button key={id} className={'sc-option' + (selected ? ' on' : '')} aria-pressed={selected} onClick={() => onChange({
            ...loadout, [section.slot]: selected && (section.slot === 'scanner' || section.slot === 'instrument') ? null : id,
            spares: loadout.spares.filter(s => s !== id),
          })}>
            <span className="sc-option-head"><b>{mod.name}</b><span>{mod.mass} kg · {mod.cost} BU</span></span>
            <span className="sc-option-desc">{mod.description}</span>
            {section.slot === 'wheel' && <span className="sc-coeffs">{(['hard', 'sand', 'rock'] as TerrainKind[]).map(t => {
              const v = WHEELS[id as WheelId].energy[t];
              return <span key={t}><small>{TERRAIN_SHORT[t]}</small><i><em style={{ width: Math.min(100, v / 1.8 * 100) + '%' }} className={v <= .9 ? 'good' : v >= 1.5 ? 'bad' : ''} /></i><b>{fmt(v, 2)}×</b></span>;
            })}<small className="hint">Energy cost · lower is better</small></span>}
          </button>;
        })}
      </div>
      <button className="sc-spares-toggle" onClick={() => setSpares(v => !v)} aria-expanded={spares}><Icon name="garage" size={18} /> Spare modules <span>{loadout.spares.length}</span></button>
      {spares && <div className="sc-spares">
        <p>Spares ride on the lander and can be swapped in the field. They count toward mass and budget.</p>
        {(Object.keys(MODULES) as ModuleId[]).filter(id => !active.includes(id)).map(id => <label key={id}>
          <input type="checkbox" checked={loadout.spares.includes(id)} onChange={e => onChange({ ...loadout, spares: e.target.checked ? [...loadout.spares, id] : loadout.spares.filter(x => x !== id) })} />
          <span>{MODULES[id].name}</span><small>{MODULES[id].mass} kg · {MODULES[id].cost} BU</small>
        </label>)}
      </div>}
    </aside>
    <footer className="sc-hangar-foot">
      <PayloadReadout mission={mission} loadout={loadout} />
      <button className="sc-cta" onClick={onNext}>{errors.length ? 'Review issues' : 'Preflight'} <Icon name="arrow" /></button>
    </footer>
  </div>;
}

export function Preflight({ mission, loadout, onBack, deploy }: { mission: Mission; loadout: Loadout; onBack: () => void; deploy: () => void }) {
  const errors = preflight(mission.id, loadout);
  const p = payload(loadout);
  const checks: [string, boolean, string][] = [
    ['Budget', p.budget <= mission.budget, p.budget + ' / ' + mission.budget + ' BU'],
    ['Deployed mass', p.totalMass <= mission.massCap, p.totalMass + ' / ' + mission.massCap + ' kg'],
    ['Terrain scanner', !!loadout.scanner, loadout.scanner ? MODULES[loadout.scanner].name : 'Missing'],
    ['Science instrument', !!loadout.instrument, loadout.instrument ? MODULES[loadout.instrument].name : 'Missing'],
    ['Wheels', true, MODULES[loadout.wheel].name],
    ['Solar battery', true, CAPACITY + ' EU'],
  ];
  return <div className="sc-screen sc-preflight">
    <div className="sc-grain" aria-hidden="true" />
    <section className="sc-modal" aria-labelledby="pf-title">
      <span className="sc-kicker">Mission {mission.number} · {mission.name}</span>
      <h1 id="pf-title">Preflight check</h1>
      <ul className="sc-checks">{checks.map(([label, ok, detail], i) => <li key={label} className={ok ? 'ok' : 'fail'} style={{ animationDelay: i * 70 + 'ms' }}>
        <i>{ok ? <Icon name="check" size={16} /> : <Icon name="x" size={16} />}</i><span>{label}</span><b>{detail}</b>
      </li>)}</ul>
      {errors.length > 0 && <ul className="sc-errors">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
      <div className="sc-modal-foot">
        <button className="sc-ghost" onClick={onBack}><Icon name="back" size={18} /> Hangar</button>
        <button className="sc-cta" disabled={errors.length > 0} onClick={deploy}>{errors.length ? 'Fix the loadout' : 'Deploy to Mars'} <Icon name="arrow" /></button>
      </div>
    </section>
  </div>;
}

const outcomes = { success: 'Mission complete', partial: 'Partial success', failure: 'Mission failed' };
function useCount(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(target * (1 - (1 - k) ** 3)); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
function Stat({ label, value, unit, digits = 0 }: { label: string; value: number; unit?: string; digits?: number }) {
  const v = useCount(value);
  return <div className="sc-stat"><span>{label}</span><b>{fmt(v, digits)}{unit && <small>{unit}</small>}</b></div>;
}
export function Debrief({ state, retry, home, next }: { state: MissionState; retry: () => void; home: () => void; next: () => void }) {
  const m = MISSIONS[state.mission], outcome = state.outcome ?? 'failure';
  const top = (Object.keys(TERRAIN) as TerrainKind[]).sort((a, b) => state.energyByTerrain[b] - state.energyByTerrain[a])[0];
  const why = state.reason ?? (outcome === 'success' ? 'All required science reached Earth on time and the rover is still operational.' : state.delivered.length ? 'The window closed before every target was transmitted.' : 'The window closed before any science was transmitted.');
  return <div className={'sc-screen sc-debrief ' + outcome}>
    <div className="sc-grain" aria-hidden="true" />
    <header className="sc-debrief-head">
      <span className="sc-kicker">Debrief · Mission {m.number} · {m.name}</span>
      <h1>{outcomes[outcome]}</h1>
      <p>{why}</p>
    </header>
    <div className="sc-debrief-body">
      <div className="sc-stats">
        <Stat label="Science score" value={state.science} />
        <Stat label="Research credits" value={state.delivered.reduce((n, s) => n + s.credits, 0)} unit="RC" />
        <Stat label="Distance driven" value={state.distance} unit="m" digits={1} />
        <Stat label="Energy used" value={state.used} unit="EU" digits={1} />
        <Stat label="Energy recharged" value={state.charged} unit="EU" digits={1} />
        <Stat label="Time left" value={Math.max(0, m.limit - state.elapsed)} unit="min" digits={1} />
      </div>
      <div className="sc-debrief-side">
        <div className="sc-debrief-map"><SectorMap mission={m} trace={state.trace} position={state.position} /></div>
        <ul className="sc-targets">{m.targets.map(id => {
          const s = state.delivered.some(x => x.site === id) ? 'Transmitted' : state.pending.some(x => x.site === id) ? 'Stored, not sent' : 'Not analyzed';
          return <li key={id} className={s === 'Transmitted' ? 'ok' : ''}><span>{SITES[id].name}</span><b>{s}</b></li>;
        })}</ul>
        <p className="sc-insight">{state.distance > 1 ? 'Most driving energy went into ' + TERRAIN[top].name.toLowerCase() + ' (' + fmt(state.energyByTerrain[top], 1) + ' EU) with ' + MODULES[state.loadout.wheel].name.toLowerCase() + '.' : 'The rover barely moved this run.'}{state.stops ? ' Safety stops: ' + state.stops + '.' : ''}</p>
      </div>
    </div>
    <footer className="sc-debrief-foot">
      <button className="sc-ghost" onClick={home}><Icon name="back" size={18} /> Missions</button>
      <button className={state.mission === 'first-survey' && outcome === 'success' ? 'sc-ghost' : 'sc-cta'} onClick={retry}>Try another loadout</button>
      {state.mission === 'first-survey' && outcome === 'success' && <button className="sc-cta" onClick={next}>Next mission <Icon name="arrow" /></button>}
    </footer>
  </div>;
}

