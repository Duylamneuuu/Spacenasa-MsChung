import { useState } from 'react';
import { MissionScene } from './scene/MissionScene';
import { ResourcesPanel } from './ui/ResourcesPanel';
import { applyAction, evaluateMission, getInitialState } from './sim/engine';
import type { MissionState, PlayerAction } from './types/game';

// Duy owns app integration. This is only an initial end-to-end wiring scaffold.
export default function App() {
  const [state, setState] = useState<MissionState>(getInitialState);
  const [station, setStation] = useState('none');
  const send = (action: PlayerAction) => setState(old => applyAction(old, action));
  const check = evaluateMission(state);

  return (
    <main className="app-shell">
      <header className="header">
        <p className="kicker">NASA Space Apps 2026 · Team MS Chung</p>
        <h1>Space Mission Design Game</h1>
        <p className="note">Integration starter — gameplay, mission physics and NASA datasets pending.</p>
      </header>
      <div className="workspace">
        <section className="panel main-panel">
          <div className="header-row">
            <strong>Phase: {state.phase.toUpperCase()}</strong>
            <span>Selected console: {station}</span>
          </div>
          <MissionScene state={state} onStationClick={setStation} />
          <div className="controls">
            <button type="button" onClick={() => send({ type: 'ADVANCE_PHASE' })}>Next demo phase</button>
            <button type="button" className="secondary" onClick={() => { send({ type: 'RESET' }); setStation('none'); }}>Reset</button>
          </div>
          <p className="note">{check.warnings.join(' ')}</p>
        </section>
        <ResourcesPanel resources={state.resources} />
      </div>
    </main>
  );
}
