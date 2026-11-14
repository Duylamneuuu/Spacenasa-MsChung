import type { ReactNode } from 'react';
import { MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, MODULES, TERRAIN, terrainAt, WIDTH, WHEELS } from '../data/expedition';
import { payload, preflight } from '../sim/expedition';
import type { Loadout, Mission, MissionId, MissionState, ModuleId, TerrainKind, WheelId } from '../types/expedition';

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
} as const;

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function fmt(n: number, digits = 0) { return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
export function StageBar({ stage }: { stage: string }) {
  return <header className="topbar">
    <div className="brand"><span className="brand-icon"><Icon name="crosshair" size={26} /></span><div><strong>APOGEE</strong><small>MARS ROVER ARCHITECT</small></div></div>
    <ol className="stages" aria-label="Mission progress">
      {([['select', 'Mission'], ['hangar', 'Hangar'], ['preflight', 'Preflight'], ['operations', 'Mars'], ['report', 'Report']] as const).map(([id, name], i) => <li key={id}
        aria-current={stage === id || (id === 'operations' && stage === 'deploy') ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{name}</li>)}
    </ol>
    <span className="top-status"><i /> MARS EXPEDITION</span>
  </header>;
}

function SectorArt({ mission }: { mission: Mission }) {
  return <svg className="sector-art" viewBox="0 0 480 152" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Sector map for ${mission.name}`}>
    <defs>
      <linearGradient id={mission.id + '-fade'}><stop stopColor="#141418" /><stop offset="1" stopColor="#141418" stopOpacity="0" /></linearGradient>
    </defs>
    <g transform="translate(170 -8) skewX(-24) scale(19.5 17)">
      {cells.map(c => <rect key={`${c.x}:${c.z}`} x={c.x} y={c.z} width=".98" height=".98" fill={TERRAIN[terrainAt(c)].color} opacity={.45 + ((c.x * 43 + c.z * 37) % 13) * .028} />)}
      {mission.targets.map(id => <g key={id}><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".42" fill="none" stroke="#a2ecde" strokeWidth=".08" /><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".16" fill="#b6f4df" /></g>)}
      <rect x={mission.start.x + .2} y={mission.start.z + .2} width=".6" height=".6" fill="#f4c47e" />
    </g>
    <rect width="355" height="152" fill={`url(#${mission.id}-fade)`} />
    <path d="M28 26h20M28 26v20M451 126h-20m20 0v-20" stroke="#e8ab7d" opacity=".6" />
  </svg>;
}

export function MissionSelect({ onSelect }: { onSelect: (id: MissionId) => void }) {
  return <>
    <section className="mission-intro">
      <div><p className="eyebrow"><span className="signal" /> MISSION CONTROL / MS CHUNG</p><h1>Choose a mission<span>.</span></h1>
        <p>Design a rover, plan a route across Mars, and transmit your science data.</p></div>
      <div className="intro-coordinate"><Icon name="crosshair" size={46} /><span>APG / SECTOR A<br /><strong>MARS SURFACE</strong></span></div>
    </section>
    <div className="section-line"><span>SURVEY MISSIONS</span><span>02 MISSIONS · 01 MAP</span></div>
    <div className="mission-cards">
      {Object.values(MISSIONS).map(m => <article className="mission-card" key={m.id}>
        <div className="mission-art"><SectorArt mission={m} /><div className="mission-index">{m.number}<small>{m.id === 'first-survey' ? 'TRAINING' : 'FIELD SURVEY'}</small></div></div>
        <div className="mission-body"><span className="eyebrow neutral">{m.terrain}</span><h2>{m.name}</h2><p>{m.brief}</p>
          <div className="mission-facts"><span><Icon name="clock" size={16} /> {m.limit} min</span><span><Icon name="sample" size={16} /> {m.targets.reduce((n, id) => n + SITES[id].science, 0)} base science points</span></div>
          <button className={m.id === 'first-survey' ? 'primary' : 'outline'} onClick={() => onSelect(m.id)}>Design Rover <Icon name="arrow" /></button>
        </div>
      </article>)}
    </div>
    <p className="fineprint"><Icon name="crosshair" size={15} /> Energy units (EU), Research Credits (RC), budget units (BU), and terrain multipliers are game values. WASD driving is an educational simplification; real Mars rovers are commanded from Earth with a communications delay.</p>
  </>;
}

const sections = [
  { slot: 'wheel', name: 'Wheels', ids: ['light', 'wide', 'reinforced'] },
  { slot: 'scanner', name: 'Terrain Scanner', ids: ['nav', 'stereo'] },
  { slot: 'instrument', name: 'Science Instrument', ids: ['geology', 'spectral'] },
  { slot: 'storage', name: 'Data Storage', ids: ['standard', 'extended'] },
] as const;

export function PayloadReadout({ mission, loadout }: { mission: Mission; loadout: Loadout }) {
  const p = payload(loadout);
  return <div className="payload-stats">
    <div><span>Budget</span><strong className={p.budget > mission.budget ? 'danger' : ''}>{p.budget} / {mission.budget} <small>BU</small></strong><meter min="0" max={mission.budget} value={p.budget} /></div>
    <div><span>Total Payload Mass</span><strong className={p.totalMass > mission.massCap ? 'danger' : ''}>{p.totalMass} / {mission.massCap} <small>kg</small></strong><meter min="0" max={mission.massCap} value={p.totalMass} /></div>
    <div><span>Battery at Deployment</span><strong>{CAPACITY} <small>EU</small></strong></div>
    <p className="micro">Rover {p.roverMass} kg · Spares {p.spareMass} kg · Lander + support {p.totalMass - p.roverMass - p.spareMass} kg</p>
  </div>;
}

export function Hangar({ mission, loadout, onChange, onBack, onNext, scene }: { mission: Mission; loadout: Loadout; onChange: (v: Loadout) => void; onBack: () => void; onNext: () => void; scene: ReactNode }) {
  const active: (ModuleId | null)[] = [loadout.wheel, loadout.scanner, loadout.instrument, loadout.storage];
  return <>
    <div className="page-title"><div><p className="eyebrow">MISSION {mission.number} / {mission.name}</p><h1>Earth Hangar<span>.</span></h1><p>Configure your rover and review what the lander will carry to Mars.</p></div><button className="ghost" onClick={onBack}><Icon name="back" /> Missions</button></div>
    <div className="hangar-layout">
      <section className="hangar-left panel">
        <div className="hangar-viewport"><span className="viewport-tag">APG–01 / ROVER BAY</span>{scene}<span className="viewport-foot">CONFIGURATION / {MODULES[loadout.wheel].label}</span></div>
        <PayloadReadout mission={mission} loadout={loadout} />
        <button className="primary full" onClick={onNext}>Review Preflight <Icon name="arrow" /></button>
      </section>
      <div className="hangar-modules">
        {sections.map(({ slot, ids, name }, i) => <fieldset className="panel module-section" key={slot}>
          <legend><span>0{i + 1}</span> {name}</legend>
          <div className="module-options">{ids.map(id => {
            const selected = loadout[slot] === id;
            const module = MODULES[id];
            return <button className="option" key={id} aria-pressed={selected} onClick={() => onChange({
              ...loadout, [slot]: selected && (slot === 'scanner' || slot === 'instrument') ? null : id,
              spares: loadout.spares.filter(spare => spare !== id),
            })}>
              <strong>{module.name}</strong><span>{module.mass} kg · {module.cost} BU</span><small>{module.description}</small>
              {slot === 'wheel' && <small className="coefficients">{(['hard', 'sand', 'rock'] as TerrainKind[]).map(t => <span key={t} title={TERRAIN[t].name}>{({ hard: 'Firm', sand: 'Sand', rock: 'Rock' })[t]} {fmt(WHEELS[id as WheelId].energy[t], 2)}×</span>)}</small>}
            </button>;
          })}</div>
        </fieldset>)}
        <details className="panel details loadout-spares">
          <summary><Icon name="garage" /> Spare Modules <span>{loadout.spares.length} {loadout.spares.length === 1 ? 'module' : 'modules'}</span></summary>
          <p>Pack spare modules to swap them at the lander. Spares count toward your mass and budget limits.</p>
          <div className="spare-options">{(Object.keys(MODULES) as ModuleId[]).filter(id => !active.includes(id)).map(id => <label key={id}>
            <input type="checkbox" checked={loadout.spares.includes(id)} onChange={e => onChange({ ...loadout, spares: e.target.checked ? [...loadout.spares, id] : loadout.spares.filter(x => x !== id) })} />
            <span>{MODULES[id].name}<small>{MODULES[id].mass} kg · {MODULES[id].cost} BU</small></span>
          </label>)}</div>
        </details>
      </div>
    </div>
  </>;
}

export function Preflight({ mission, loadout, onBack, deploy }: { mission: Mission; loadout: Loadout; onBack: () => void; deploy: () => void }) {
  const errors = preflight(mission.id, loadout);
  return <section className="gate panel">
    <p className="eyebrow">MISSION {mission.number} / {mission.name}</p><h1>Preflight<span>.</span></h1>
    <p>Check the full payload and equipment before deploying to the surface.</p>
    <PayloadReadout mission={mission} loadout={loadout} />
    {errors.length ? <ul className="alert danger">{errors.map(error => <li key={error}>{error}</li>)}</ul> :
      <p className="alert positive"><Icon name="check" /> Mass and budget are within limits. Solar power, scanner, and science instrument are ready.</p>}
    <div className="button-row"><button className="ghost" onClick={onBack}><Icon name="back" /> Back to Hangar</button><button className="primary" disabled={errors.length > 0} onClick={deploy}>Deploy Rover <Icon name="arrow" /></button></div>
  </section>;
}

const outcomes = { success: 'Mission Complete', partial: 'Mission Partially Complete', failure: 'Mission Failed' };
export function Debrief({ state, retry, home, next }: { state: MissionState; retry: () => void; home: () => void; next: () => void }) {
  const m = MISSIONS[state.mission], outcome = state.outcome ?? 'failure';
  const maxEnergy = (Object.keys(TERRAIN) as TerrainKind[]).sort((a, b) => state.energyByTerrain[b] - state.energyByTerrain[a])[0];
  const delivered = state.delivered.length;
  return <>
    <div className="page-title"><div><p className="eyebrow">DEBRIEF / MISSION {m.number}</p><h1>{outcomes[outcome]}<span>.</span></h1><p>{state.reason ?? (outcome === 'success' ? 'You transmitted all required data on time, and the rover is still operational.' : delivered ? 'The survey ended before you transmitted data from every target.' : 'The survey ended before you transmitted any data.')}</p></div></div>
    <div className="report-grid">
      <section className="panel report-panel"><p className="eyebrow">01 / SCIENCE</p><h2>{state.science} science points</h2>
        <p>{state.delivered.reduce((n, s) => n + s.credits, 0)} RC earned · {state.credits} RC remaining</p>
        <ul className="objectives">{m.targets.map(id => <li key={id}><span>{SITES[id].code} · {SITES[id].name}</span><strong>{state.delivered.some(s => s.site === id) ? 'Transmitted' : state.pending.some(s => s.site === id) ? 'In Storage' : 'Awaiting Analysis'}</strong></li>)}</ul>
      </section>
      <section className="panel report-panel"><p className="eyebrow">02 / OPERATIONS</p><h2>{fmt(state.distance, 1)} m traveled</h2>
        <ul className="objectives"><li><span>Energy Used / Recharged</span><strong>{fmt(state.used, 1)} / {fmt(state.charged, 1)} EU</strong></li>
          <li><span>Battery Remaining</span><strong>{fmt(state.battery, 1)} EU</strong></li><li><span>Time Remaining</span><strong>{fmt(m.limit - state.elapsed, 1)} min</strong></li>
          <li><span>Stops Due to Terrain</span><strong>{state.stops}</strong></li></ul>
      </section>
      <section className="panel report-panel"><p className="eyebrow">03 / DESIGN & ROUTE</p><h2>{MODULES[state.loadout.wheel].name}</h2>
        <p>{state.used && state.distance ? `The rover used the most driving energy on ${TERRAIN[maxEnergy].name.toLowerCase()} (${fmt(state.energyByTerrain[maxEnergy], 1)} EU).` : 'The rover did not travel far enough to compare terrain.'}</p>
        <p className="micro">Final Loadout · {payload(state.loadout).totalMass} kg · {payload(state.loadout).budget} BU</p>
        <svg className="trace-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Actual rover route">
          {cells.map(c => <rect key={`${c.x}:${c.z}`} x={c.x} y={c.z} width="1" height="1" fill={TERRAIN[terrainAt(c)].color} />)}
          <polyline points={state.trace.map(c => `${c.x + .5},${c.z + .5}`).join(' ')} fill="none" stroke="#f4ecd9" strokeWidth=".13" />
          <circle cx={state.position.x + .5} cy={state.position.z + .5} r=".22" fill="#a1f4d3" />
        </svg>
      </section>
    </div>
    <div className="button-row report-buttons"><button className="ghost" onClick={home}><Icon name="back" /> Mission List</button><button className="outline" onClick={retry}>Try Another Loadout</button>
      {state.mission === 'first-survey' && outcome === 'success' && <button className="primary" onClick={next}>Next Mission <Icon name="arrow" /></button>}</div>
  </>;
}

