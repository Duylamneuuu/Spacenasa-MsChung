import React, { useState } from 'react';
import { MissionScene } from './scene/MissionScene';
import { ResourcesPanel } from './ui/ResourcesPanel';
import { BriefingView } from './ui/BriefingView';
import { DesignView } from './ui/DesignView';
import { PreflightLaunchView } from './ui/PreflightLaunchView';
import { OperationsView } from './ui/OperationsView';
import { DebriefView } from './ui/DebriefView';
import { applyAction, evaluateMission, getInitialState } from './sim/engine';
import type { MissionState, PlayerAction, Phase } from './types/game';

export default function App() {
  const [state, setState] = useState<MissionState>(getInitialState);
  const [station, setStation] = useState('none');
  const [show3DScene, setShow3DScene] = useState(true);

  const send = (action: PlayerAction) => setState(old => applyAction(old, action));

  const steps: { phase: Phase; label: string; stepNumber: number }[] = [
    { phase: 'briefing', label: '1. PLAN (Landing Site)', stepNumber: 1 },
    { phase: 'design', label: '2. DESIGN (Rover & Depot)', stepNumber: 2 },
    { phase: 'preflight', label: '3. DECIDE (Preflight & Rocket)', stepNumber: 3 },
    { phase: 'operations', label: '4. SIMULATE (Surface Ops)', stepNumber: 4 },
    { phase: 'debrief', label: '5. DEBRIEF (Outcome Analysis)', stepNumber: 5 },
  ];

  return (
    <main className="app-shell">
      {/* Header */}
      <header className="header">
        <div className="header-top-row">
          <div>
            <p className="kicker">NASA Space Apps Challenge 2026 · Challenge 13: Space Mission Design Game</p>
            <h1>APOGEE: MARS ROVER ARCHITECT</h1>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => setShow3DScene(!show3DScene)}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            {show3DScene ? '▲ Hide 3D Mission Control' : '▼ Show 3D Mission Control'}
          </button>
        </div>
        <p className="note">
          Systems Engineering Simulator: Balance limited budget ($M), rocket payload mass (kg), battery power (⚡), comms bandwidth, and launch Delta-v (m/s).
        </p>

        {/* Phase Stepper Navigation */}
        <nav className="stepper-nav" aria-label="Mission Lifecycle Stepper">
          {steps.map(s => {
            const isActive = state.phase === s.phase || (s.phase === 'preflight' && state.phase === 'launch');
            return (
              <button
                key={s.phase}
                type="button"
                className={`step-item ${isActive ? 'active' : ''}`}
                onClick={() => send({ type: 'SET_PHASE', phase: s.phase })}
              >
                <span className="step-num">{s.stepNumber}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Workspace */}
      <div className="workspace">
        <section className="panel main-panel">
          {/* 3D Mission Control Room Diorama (Earth Phases) */}
          {show3DScene && state.phase !== 'operations' && (
            <div className="scene-container">
              <MissionScene state={state} onStationClick={setStation} />
            </div>
          )}

          {/* Phase 1: PLAN (Briefing & Landing Site Selection) */}
          {state.phase === 'briefing' && (
            <BriefingView state={state} send={send} />
          )}

          {/* Phase 2: DESIGN (Rover Hardware & Lander Depot Spares) */}
          {state.phase === 'design' && (
            <DesignView state={state} send={send} />
          )}

          {/* Phase 3: DECIDE & PREFLIGHT (Launcher selection & Tsiolkovsky feasibility) */}
          {(state.phase === 'preflight' || state.phase === 'launch') && (
            <PreflightLaunchView state={state} send={send} isPreflightOnly={state.phase === 'preflight'} />
          )}

          {/* Phase 4: SIMULATE (Interactive Tactical Mars Grid & Field Controls) */}
          {state.phase === 'operations' && (
            <OperationsView state={state} send={send} />
          )}

          {/* Phase 5: DEBRIEF (Outcome Evaluation) */}
          {state.phase === 'debrief' && (
            <DebriefView state={state} send={send} />
          )}
        </section>

        {/* Sidebar Telemetry & Resource Margins */}
        <ResourcesPanel state={state} send={send} />
      </div>
    </main>
  );
}
