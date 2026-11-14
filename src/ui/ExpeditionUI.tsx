import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { MISSIONS, SITES } from '../content/expedition';
import { CAPACITY, cells, HEIGHT, MODULES, TERRAIN, terrainAt, WIDTH, WHEELS } from '../data/expedition';
import { payload, preflight } from '../sim/expedition';
import { setLang, useI18n } from '../i18n';
import type { Key } from '../i18n';
import type { Loadout, Mission, MissionId, MissionState, ModuleId, SiteId, TerrainKind, WheelId } from '../types/expedition';
import './screens.css';

const TitleMars = lazy(() => import('../scene/TitleMars').then(({ TitleMars }) => ({ default: TitleMars })));

const paths = {
  crosshair: 'M12 2v4m0 12v4M2 12h4m12 0h4M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  garage: 'M3 21V9l9-6 9 6v12m-14 0V12h10v9m-10-4h10',
  check: 'm5 12 4 4L19 6',
  x: 'M6 6l12 12M18 6 6 18',
  help: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
} as const;

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function fmt(n: number, digits = 0) { return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }

export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  return <div className={'lang-switch ' + className} role="group" aria-label={t('lang.switch')}>
    {(['en', 'vi'] as const).map(l => <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
  </div>;
}

export const missionName = (t: (k: Key) => string, id: MissionId) => t(('mission.' + id + '.name') as Key);
export const siteName = (t: (k: Key) => string, id: SiteId) => t(('site.' + id) as Key);
export const modName = (t: (k: Key) => string, id: ModuleId) => t(('mod.' + id + '.name') as Key);
export const modLabel = (t: (k: Key) => string, id: ModuleId) => t(('mod.' + id + '.label') as Key);
export const terrainName = (t: (k: Key) => string, k: TerrainKind) => t(('terrain.' + k) as Key);

const STEPS = ['select', 'hangar', 'preflight', 'operations', 'report'] as const;
export function StageBar({ stage }: { stage: string }) {
  const { t } = useI18n();
  const at = STEPS.findIndex(id => id === stage || (id === 'operations' && stage === 'deploy'));
  return <header className="sc-topbar">
    <div className="sc-brand"><i /><b>APOGEE</b></div>
    <ol aria-label="Progress">{STEPS.map((id, i) => <li key={id} className={i < at ? 'past' : i === at ? 'now' : ''} aria-current={i === at ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{t(('stage.' + id) as Key)}</li>)}</ol>
    <LangSwitch />
  </header>;
}

function SectorMap({ mission, trace, position }: { mission: Mission; trace?: MissionState['trace']; position?: MissionState['position'] }) {
  return <svg className="sc-sector" viewBox={'-0.3 -0.3 ' + (WIDTH + .6) + ' ' + (HEIGHT + .6)} aria-hidden="true">
    {cells.map(c => <rect key={c.x + ':' + c.z} x={c.x} y={c.z} width="1.02" height="1.02" fill={TERRAIN[terrainAt(c)].color} opacity={.55 + ((c.x * 43 + c.z * 37) % 13) * .03} />)}
    <rect x={mission.start.x + .18} y={mission.start.z + .18} width=".64" height=".64" fill="none" stroke="#ffb46b" strokeWidth=".12" />
    {mission.targets.map(id => <g key={id}><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".44" fill="none" stroke="#7fe3df" strokeWidth=".1" /><circle cx={SITES[id].cell.x + .5} cy={SITES[id].cell.z + .5} r=".14" fill="#7fe3df" /></g>)}
    {trace && trace.length > 1 && <polyline points={trace.map(c => (c.x + .5) + ',' + (c.z + .5)).join(' ')} fill="none" stroke="#fff3e2" strokeWidth=".14" strokeLinejoin="round" strokeLinecap="round" />}
    {position && <circle cx={position.x + .5} cy={position.z + .5} r=".26" fill="#fff" stroke="#0b0908" strokeWidth=".06" />}
  </svg>;
}

export function MissionSelect({ onSelect, onBack }: { onSelect: (id: MissionId) => void; onBack: () => void }) {
  const { t } = useI18n();
  const list = Object.values(MISSIONS);
  const [pick, setPick] = useState<MissionId>(list[0].id);
  const m = MISSIONS[pick];
  const first = m.id === 'first-survey';
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
    <LangSwitch className="corner" />
    <header className="sc-head">
      <button className="sc-back" onClick={onBack}><Icon name="back" size={18} /> {t('select.back')}</button>
      <div><span className="sc-kicker">{t('select.kicker')}</span><h1>{t('select.title')}</h1></div>
    </header>
    <div className="sc-select-body">
      <ol className="sc-dossiers" role="listbox" aria-label={t('select.kicker')}>
        {list.map(x => <li key={x.id}>
          <button role="option" aria-selected={pick === x.id} className={'sc-dossier' + (pick === x.id ? ' on' : '')} onClick={() => setPick(x.id)} onDoubleClick={() => onSelect(x.id)}>
            <span className="num">{x.number}</span>
            <span className="txt"><small>{t(x.id === 'first-survey' ? 'select.training' : 'select.field')}{x.id === 'first-survey' && <em className="sc-badge">{t('select.recommended')}</em>}</small><b>{missionName(t, x.id)}</b><em>{t(('mission.' + x.id + '.terrain') as Key)}</em></span>
          </button>
        </li>)}
      </ol>
      <section className="sc-brief" key={m.id} aria-live="polite">
        <span className="sc-kicker">{t('select.mission')} {m.number} · {t(first ? 'select.training' : 'select.field')}</span>
        <h2>{missionName(t, m.id)}</h2>
        <p className="lead">{t(('mission.' + m.id + '.brief') as Key)}</p>
        <p className="sub">{t(first ? 'select.first.note' : 'select.dune.note')}</p>
        <div className="sc-brief-map"><SectorMap mission={m} /></div>
        <dl className="sc-facts">
          <div><dt>{t('select.targets')}</dt><dd>{m.targets.length}</dd></div>
          <div><dt>{t('select.window')}</dt><dd>{m.limit}<small>min</small></dd></div>
          <div><dt>{t('select.budget')}</dt><dd>{m.budget}<small>BU</small></dd></div>
          <div><dt>{t('select.mass')}</dt><dd>{m.massCap}<small>kg</small></dd></div>
        </dl>
        <button className="sc-cta" onClick={() => onSelect(m.id)}>{t('select.cta')} <Icon name="arrow" /></button>
      </section>
    </div>
    <p className="sc-footnote">{t('select.foot')}</p>
  </div>;
}

const sections = [
  { slot: 'wheel', ids: ['light', 'wide', 'reinforced'] },
  { slot: 'scanner', ids: ['nav', 'stereo'] },
  { slot: 'instrument', ids: ['geology', 'spectral'] },
  { slot: 'storage', ids: ['standard', 'extended'] },
] as const;

function Meter({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const over = value > max;
  return <div className={'sc-meter' + (over ? ' over' : '')}>
    <div><span>{label}</span><b>{value}<small> / {max} {unit}</small></b></div>
    <i><em style={{ width: Math.min(100, value / max * 100) + '%' }} /></i>
  </div>;
}
export function PayloadReadout({ mission, loadout }: { mission: Mission; loadout: Loadout }) {
  const { t } = useI18n();
  const p = payload(loadout);
  return <div className="sc-payload">
    <Meter label={t('hangar.budget')} value={p.budget} max={mission.budget} unit="BU" />
    <Meter label={t('hangar.mass')} value={p.totalMass} max={mission.massCap} unit="kg" />
    <p>{t('hangar.payload', { rover: p.roverMass, spares: p.spareMass, lander: p.totalMass - p.roverMass - p.spareMass, battery: CAPACITY })}</p>
  </div>;
}

export function Hangar({ mission, loadout, onChange, onBack, onNext, scene }: { mission: Mission; loadout: Loadout; onChange: (v: Loadout) => void; onBack: () => void; onNext: () => void; scene: ReactNode }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<typeof sections[number]['slot']>('wheel');
  const [spares, setSpares] = useState(false);
  const active: (ModuleId | null)[] = [loadout.wheel, loadout.scanner, loadout.instrument, loadout.storage];
  const section = sections.find(s => s.slot === tab)!;
  const errors = preflight(mission.id, loadout);
  return <div className="sc-screen sc-hangar">
    <div className="sc-hangar-scene">{scene}</div>
    <div className="sc-hangar-shade" aria-hidden="true" />
    <header className="sc-head">
      <button className="sc-back" onClick={onBack}><Icon name="back" size={18} /> {t('hangar.back')}</button>
      <div><span className="sc-kicker">{t('select.mission')} {mission.number} · {missionName(t, mission.id)}</span><h1>{t('hangar.title')}</h1></div>
      <p className="sc-tip">{t(mission.id === 'first-survey' ? 'hangar.tip.first' : 'hangar.tip.dune')}</p>
    </header>
    <aside className="sc-config" aria-label={t('hangar.title')}>
      <div className="sc-tabs" role="tablist">
        {sections.map(s => { const id = loadout[s.slot] as ModuleId | null; return <button key={s.slot} role="tab" aria-selected={tab === s.slot} className={tab === s.slot ? 'on' : ''} onClick={() => setTab(s.slot)}>
          <small>{t(('slot.' + s.slot) as Key)}</small><b>{id ? modLabel(t, id) : t('hangar.none')}</b>
        </button>; })}
      </div>
      <div className="sc-options" role="tabpanel" key={tab}>
        {section.ids.map(id => {
          const selected = loadout[section.slot] === id, mod = MODULES[id];
          return <button key={id} className={'sc-option' + (selected ? ' on' : '')} aria-pressed={selected} onClick={() => onChange({
            ...loadout, [section.slot]: selected && (section.slot === 'scanner' || section.slot === 'instrument') ? null : id,
            spares: loadout.spares.filter(s => s !== id),
          })}>
            <span className="sc-option-head"><b>{modName(t, id)}</b><span>{mod.mass} kg · {mod.cost} BU</span></span>
            <span className="sc-option-desc">{t(('mod.' + id + '.desc') as Key)}</span>
            {section.slot === 'wheel' && <span className="sc-coeffs">{(['hard', 'sand', 'rock'] as TerrainKind[]).map(k => {
              const v = WHEELS[id as WheelId].energy[k];
              return <span key={k}><small>{t(('terrainShort.' + k) as Key)}</small><i><em style={{ width: Math.min(100, v / 1.8 * 100) + '%' }} className={v <= .9 ? 'good' : v >= 1.5 ? 'bad' : ''} /></i><b>{fmt(v, 2)}×</b></span>;
            })}<small className="hint">{t('hangar.coeff')}</small></span>}
          </button>;
        })}
      </div>
      <button className="sc-spares-toggle" onClick={() => setSpares(v => !v)} aria-expanded={spares}><Icon name="garage" size={18} /> {t('hangar.spares')} <span>{loadout.spares.length}</span></button>
      {spares && <div className="sc-spares">
        <p>{t('hangar.sparesNote')}</p>
        {(Object.keys(MODULES) as ModuleId[]).filter(id => !active.includes(id)).map(id => <label key={id}>
          <input type="checkbox" checked={loadout.spares.includes(id)} onChange={e => onChange({ ...loadout, spares: e.target.checked ? [...loadout.spares, id] : loadout.spares.filter(x => x !== id) })} />
          <span>{modName(t, id)}</span><small>{MODULES[id].mass} kg · {MODULES[id].cost} BU</small>
        </label>)}
      </div>}
    </aside>
    <footer className="sc-hangar-foot">
      <PayloadReadout mission={mission} loadout={loadout} />
      <button className="sc-cta" onClick={onNext}>{t(errors.length ? 'hangar.issues' : 'hangar.next')} <Icon name="arrow" /></button>
    </footer>
  </div>;
}

export function Preflight({ mission, loadout, onBack, deploy }: { mission: Mission; loadout: Loadout; onBack: () => void; deploy: () => void }) {
  const { t, m } = useI18n();
  const errors = preflight(mission.id, loadout);
  const p = payload(loadout);
  const checks: [string, boolean, string][] = [
    [t('pre.budget'), p.budget <= mission.budget, p.budget + ' / ' + mission.budget + ' BU'],
    [t('pre.mass'), p.totalMass <= mission.massCap, p.totalMass + ' / ' + mission.massCap + ' kg'],
    [t('pre.scanner'), !!loadout.scanner, loadout.scanner ? modName(t, loadout.scanner) : t('pre.missing')],
    [t('pre.instrument'), !!loadout.instrument, loadout.instrument ? modName(t, loadout.instrument) : t('pre.missing')],
    [t('pre.wheels'), true, modName(t, loadout.wheel)],
    [t('pre.battery'), true, CAPACITY + ' EU'],
  ];
  return <div className="sc-screen sc-preflight">
    <section className="sc-modal" aria-labelledby="pf-title">
      <span className="sc-kicker">{t('select.mission')} {mission.number} · {missionName(t, mission.id)}</span>
      <h1 id="pf-title">{t('pre.title')}</h1>
      <ul className="sc-checks">{checks.map(([label, ok, detail], i) => <li key={label} className={ok ? 'ok' : 'fail'} style={{ animationDelay: i * 70 + 'ms' }}>
        <i>{ok ? <Icon name="check" size={16} /> : <Icon name="x" size={16} />}</i><span>{label}</span><b>{detail}</b>
      </li>)}</ul>
      {errors.length > 0 && <ul className="sc-errors">{errors.map(e => <li key={e}>{m(e)}</li>)}</ul>}
      <div className="sc-modal-foot">
        <button className="sc-ghost" onClick={onBack}><Icon name="back" size={18} /> {t('pre.back')}</button>
        <button className="sc-cta" disabled={errors.length > 0} onClick={deploy} autoFocus>{t(errors.length ? 'pre.fix' : 'pre.deploy')} <Icon name="arrow" /></button>
      </div>
    </section>
  </div>;
}

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
  const { t, m } = useI18n();
  const mi = MISSIONS[state.mission], outcome = state.outcome ?? 'failure';
  const top = (Object.keys(TERRAIN) as TerrainKind[]).sort((a, b) => state.energyByTerrain[b] - state.energyByTerrain[a])[0];
  const why = state.reason && !/^Downlink received/.test(state.reason) ? m(state.reason) : t(outcome === 'success' ? 'deb.why.success' : state.delivered.length ? 'deb.why.partial' : 'deb.why.none');
  const canNext = state.mission === 'first-survey' && outcome === 'success';
  return <div className={'sc-screen sc-debrief ' + outcome}>
    <header className="sc-debrief-head">
      <span className="sc-kicker">{t('deb.kicker', { n: mi.number, name: missionName(t, mi.id) })}</span>
      <h1>{t(('out.' + outcome) as Key)}</h1>
      <p>{why}</p>
    </header>
    <div className="sc-debrief-body">
      <div className="sc-stats">
        <Stat label={t('deb.science')} value={state.science} />
        <Stat label={t('deb.rc')} value={state.delivered.reduce((n, s) => n + s.credits, 0)} unit="RC" />
        <Stat label={t('deb.distance')} value={state.distance} unit="m" digits={1} />
        <Stat label={t('deb.used')} value={state.used} unit="EU" digits={1} />
        <Stat label={t('deb.charged')} value={state.charged} unit="EU" digits={1} />
        <Stat label={t('deb.left')} value={Math.max(0, mi.limit - state.elapsed)} unit="min" digits={1} />
      </div>
      <div className="sc-debrief-side">
        <div className="sc-debrief-map"><SectorMap mission={mi} trace={state.trace} position={state.position} /></div>
        <ul className="sc-targets">{mi.targets.map(id => {
          const s = state.delivered.some(x => x.site === id) ? 'sent' : state.pending.some(x => x.site === id) ? 'stored' : 'none';
          return <li key={id} className={s === 'sent' ? 'ok' : ''}><span>{siteName(t, id)}</span><b>{t(('deb.' + s) as Key)}</b></li>;
        })}</ul>
        <p className="sc-insight">{state.distance > 1 ? t('deb.insight', { terrain: terrainName(t, top).toLowerCase(), eu: fmt(state.energyByTerrain[top], 1), wheels: modName(t, state.loadout.wheel).toLowerCase() }) : t('deb.still')}{state.stops ? ' ' + t('deb.stops', { n: state.stops }) : ''}</p>
      </div>
    </div>
    <footer className="sc-debrief-foot">
      <button className="sc-ghost" onClick={home}><Icon name="back" size={18} /> {t('deb.missions')}</button>
      <button className={canNext ? 'sc-ghost' : 'sc-cta'} onClick={retry}>{t('deb.retry')}</button>
      {canNext && <button className="sc-cta" onClick={next} autoFocus>{t('deb.next')} <Icon name="arrow" /></button>}
    </footer>
  </div>;
}

