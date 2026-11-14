import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { MISSIONS } from './content/expedition';
import { DEFAULT_LOADOUT } from './data/expedition';
import { DRIVE_STEP, evaluateMission, getInitialState, haltDrive, NEUTRAL, performScienceAction, preflight, stepDrive, swapAtLander } from './sim/expedition';
import type { Cell, ControlMode, DrivingInput, Loadout, MissionId, MissionState, ModuleId, StationaryAction } from './types/expedition';
import { Debrief, Hangar, MissionSelect, Preflight, StageBar } from './ui/ExpeditionUI';
import { Operations } from './ui/ExpeditionOperations';
import { TitleScreen } from './ui/TitleScreen';
import { useI18n } from './i18n';
import { missionName } from './ui/ExpeditionUI';

const HangarScene = lazy(() => import('./scene/ExpeditionScene').then(m => ({ default: m.HangarScene })));
type Stage = 'title' | 'select' | 'hangar' | 'preflight' | 'deploy' | 'operations' | 'report';
const KEYS = { KeyW: 'forward', KeyS: 'reverse', KeyA: 'left', KeyD: 'right', Space: 'brake' } as const;
const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [stage, setStage] = useState<Stage>('title');
  const [missionId, setMissionId] = useState<MissionId>('first-survey');
  const [loadout, setLoadout] = useState<Loadout>(DEFAULT_LOADOUT);
  const [state, setState] = useState<MissionState>(() => getInitialState(missionId));
  const [route, setRoute] = useState<Cell[]>([]);
  const [mode, setMode] = useState<ControlMode>('planning');
  const [effect, setEffect] = useState<StationaryAction['type'] | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const authoritative = useRef(state);
  const keyState = useRef<DrivingInput>({ ...NEUTRAL });
  const busy = useRef(false);
  const main = useRef<HTMLElement>(null);
  const mission = MISSIONS[missionId];
  const { t } = useI18n();

  useEffect(() => { main.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }, [stage]);
  function commit(next: MissionState) { authoritative.current = next; setState(next); }
  function announce(message: string | null) {
    if (message) setLog(old => old.at(-1) === message ? old : [...old.slice(-5), message]);
  }
  function changeMode(next: ControlMode) {
    if (busy.current || (next === 'driving' && authoritative.current.outcome)) return;
    keyState.current = { ...NEUTRAL };
    commit(haltDrive(authoritative.current));
    setMode(next);
  }

  useEffect(() => {
    if (stage !== 'operations' || mode !== 'driving') return;
    let frame = 0, previous = performance.now(), accumulator = 0, lastPaint = 0, lastPainted = authoritative.current;
    const reset = () => {
      keyState.current = { ...NEUTRAL };
      commit(haltDrive(authoritative.current));
      accumulator = 0;
    };
    const control = (event: KeyboardEvent, down: boolean) => {
      const action = KEYS[event.code as keyof typeof KEYS];
      if (!action) return;
      if (!down) { keyState.current[action] = false; return; }
      const target = event.target;
      if (event.ctrlKey || event.metaKey || event.altKey || busy.current ||
        (target instanceof Element && target.closest('input,textarea,select,[contenteditable], [role="dialog"]')) ||
        (action === 'brake' && target instanceof Element && target.closest('button,a,summary'))) return;
      event.preventDefault();
      keyState.current[action] = true;
    };
    const down = (e: KeyboardEvent) => control(e, true), up = (e: KeyboardEvent) => control(e, false);
    const focus = (e: FocusEvent) => { if (e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable],[role="dialog"]')) reset(); };
    function tick(now: number) {
      accumulator += Math.min((now - previous) / 1000, .1);
      previous = now;
      if (!busy.current) while (accumulator >= DRIVE_STEP) {
        accumulator -= DRIVE_STEP;
        const result = stepDrive(authoritative.current, keyState.current, DRIVE_STEP);
        authoritative.current = result.state;
        if (result.stopped || result.state.outcome) {
          keyState.current = { ...NEUTRAL };
          setMode('paused');
          announce(result.state.reason);
          commit(result.state);
          return;
        }
      }
      else accumulator = 0;
      if (now - lastPaint >= 29 && lastPainted !== authoritative.current) {
        lastPaint = now;
        lastPainted = authoritative.current;
        setState(lastPainted);
      }
      frame = requestAnimationFrame(tick);
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    document.addEventListener('focusin', focus);
    document.addEventListener('visibilitychange', reset);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [stage, mode]);

  function select(id: MissionId) {
    setMissionId(id);
    setLoadout(DEFAULT_LOADOUT);
    setStage('hangar');
  }
  async function deploy() {
    if (busy.current || preflight(missionId, loadout).length) return;
    busy.current = true;
    commit(getInitialState(missionId, loadout));
    setRoute([]);
    setMode('planning');
    setLog(['Rover deployed. Plot your first waypoint.']);
    setStage('deploy');
    await wait(reduceMotion() ? 70 : 760);
    busy.current = false;
    setStage('operations');
  }
  async function act(action: StationaryAction) {
    if (busy.current) return;
    const current = authoritative.current;
    const next = performScienceAction(current, action);
    if (next.elapsed > current.elapsed) {
      busy.current = true;
      keyState.current = { ...NEUTRAL };
      setEffect(action.type);
      await wait(reduceMotion() ? 40 : action.type === 'recharge' ? 900 : 530);
      setEffect(null);
      busy.current = false;
    }
    commit(next);
    announce(next.reason);
  }
  function swap(id: ModuleId) {
    if (busy.current) return;
    const next = swapAtLander(authoritative.current, id);
    commit(next);
    announce(next.reason);
  }
  function report() {
    if (busy.current) return;
    const current = haltDrive(authoritative.current);
    commit({ ...current, outcome: evaluateMission(current) });
    setStage('report');
  }

  return <>
    {['hangar', 'preflight', 'report'].includes(stage) && <StageBar stage={stage} />}
    <main ref={main} tabIndex={-1} className="game-main">
      {stage === 'title' && <TitleScreen onStart={() => setStage('select')} />}
      {stage === 'select' && <MissionSelect onSelect={select} onBack={() => setStage('title')} />}
      {stage === 'hangar' && <Hangar mission={mission} loadout={loadout} onChange={setLoadout} onBack={() => setStage('select')} onNext={() => setStage('preflight')}
        scene={<Suspense fallback={null}><HangarScene loadout={loadout} /></Suspense>} />}
      {stage === 'preflight' && <Preflight mission={mission} loadout={loadout} onBack={() => setStage('hangar')} deploy={deploy} />}
      {stage === 'deploy' && <div className="dp-root" role="status"><div className="dp-copy"><span>{t('deploy.kicker')}</span><b>{missionName(t, mission.id)}</b><i /></div></div>}
      {stage === 'operations' && <Operations state={state} route={route} setRoute={setRoute} mode={mode} setMode={changeMode} act={act}
        effect={effect} swap={swap} report={report} exit={() => { changeMode('planning'); setStage('select'); }} log={log} />}
      {stage === 'report' && <Debrief state={state} retry={() => setStage('hangar')} home={() => setStage('select')} next={() => select('dune-crossing')} />}
    </main>
  </>;
}
