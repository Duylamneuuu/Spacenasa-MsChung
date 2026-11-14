import React from 'react';
import type { MissionState, PlayerAction } from '../types/game';
import { MODULES_BY_CATEGORY, ROVER_MODULES } from '../data/roverModules';
import { LANDING_SITES } from '../data/missionObjective';
import { evaluateMission } from '../sim/engine';

interface PreflightLaunchViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
  isPreflightOnly?: boolean;
}

export function PreflightLaunchView({ state, send, isPreflightOnly = false }: PreflightLaunchViewProps) {
  const launchers = MODULES_BY_CATEGORY.launcher;
  const currentLauncherId = state.surface.equippedModules.launcher || 'atlas_v_dedicated';
  const currentLauncher = ROVER_MODULES[currentLauncherId];
  const site = LANDING_SITES[state.activeLandingSite] ?? LANDING_SITES.jezero_crater;

  const check = evaluateMission(state);
  const remainingBudget = state.resources.budgetRemaining;
  const isOverMass = state.resources.massKg > state.resources.massLimitKg;
  const isLowDeltaV = state.resources.deltaVAvailableKmS < state.resources.deltaVRequiredKmS;
  const isOverBudget = remainingBudget < 0;

  return (
    <div className="preflight-launch-view">
      <div className="section-intro">
        <span className="badge-kicker">PHASE 3: DECIDE & PREFLIGHT</span>
        <h2>Launcher Selection & Orbital Feasibility Check</h2>
        <p className="description">
          Match your rover's launch mass with the appropriate rocket vehicle. Total mass directly penalizes
          Trans-Mars Injection Delta-v. Any surplus budget not spent on the launch will convert into
          <strong> Mission Credits ($M)</strong> on the Martian surface!
        </p>
      </div>

      {/* Launcher Selection Cards */}
      <div className="launchers-grid">
        {launchers.map(rocket => {
          const isSelected = rocket.id === currentLauncherId;
          const massPenalty = ((state.resources.massKg) / 100) * 0.25;
          const estimatedDeltaV = Math.max(1.5, (rocket.deltaVBoostKmS ?? 4.9) - massPenalty);
          const wouldBeOverweight = state.resources.massKg > (rocket.maxPayloadMassKg ?? 0);

          return (
            <div
              key={rocket.id}
              className={`launcher-card ${isSelected ? 'selected' : ''} ${wouldBeOverweight ? 'warning-border' : ''}`}
              onClick={() => send({ type: 'SELECT_MODULE', moduleId: rocket.id })}
            >
              <div className="rocket-header">
                <div>
                  <h4>{rocket.name}</h4>
                  <span className="rocket-cost">${rocket.costMUSD}M Launcher Cost</span>
                </div>
                {isSelected && <span className="selected-check">✓ ACTIVE ROCKET</span>}
              </div>

              <div className="rocket-specs">
                <div className="spec-item">
                  <span className="spec-lbl">Max Payload Cap:</span>
                  <strong className={wouldBeOverweight ? 'text-red' : 'text-cyan'}>
                    {rocket.maxPayloadMassKg} kg {wouldBeOverweight ? '(Overweight!)' : ''}
                  </strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Base Delta-v:</span>
                  <strong>{rocket.deltaVBoostKmS} km/s</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">With Current Mass ({state.resources.massKg} kg):</span>
                  <strong className={estimatedDeltaV < site.requiredDeltaVKmS ? 'text-amber' : 'text-green'}>
                    {estimatedDeltaV.toFixed(2)} km/s
                  </strong>
                </div>
              </div>

              <p className="rocket-desc">{rocket.description}</p>

              <button
                type="button"
                className={`select-rocket-btn ${isSelected ? 'active' : 'secondary'}`}
                onClick={e => {
                  e.stopPropagation();
                  send({ type: 'SELECT_MODULE', moduleId: rocket.id });
                }}
              >
                {isSelected ? '✓ Vehicle Chosen' : 'Select This Launcher'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tsiolkovsky Physics & Feasibility Breakdown */}
      <div className="feasibility-dashboard">
        <h3 className="dashboard-title">
          🛰️ Mission Preflight Feasibility Audit — {site.name}
        </h3>

        <div className="audit-checklist">
          {/* Check 1: Budget */}
          <div className={`audit-card ${isOverBudget ? 'fail' : 'pass'}`}>
            <div className="audit-icon">{isOverBudget ? '❌' : '✅'}</div>
            <div className="audit-info">
              <h5>Budget Allocation (${site.budgetMUSD}M Cap)</h5>
              <p>
                Total Spent: <strong>${site.budgetMUSD - remainingBudget}M</strong> | Remaining:{' '}
                <strong className={isOverBudget ? 'text-red' : 'text-green'}>
                  ${remainingBudget}M
                </strong>
              </p>
              {!isOverBudget && (
                <span className="audit-subnote">
                  💰 Bonus: ${remainingBudget}M unspent will convert to Lander Mission Credits on Mars!
                </span>
              )}
            </div>
          </div>

          {/* Check 2: Payload Mass */}
          <div className={`audit-card ${isOverMass ? 'fail' : 'pass'}`}>
            <div className="audit-icon">{isOverMass ? '❌' : '✅'}</div>
            <div className="audit-info">
              <h5>Structural Mass Limit ({currentLauncher?.name})</h5>
              <p>
                Total Mass: <strong>{state.resources.massKg} kg</strong> (Rover: {state.resources.roverMassKg} kg + Depot Spares: {state.resources.depotMassKg} kg) vs Rocket Cap: <strong>{state.resources.massLimitKg} kg</strong>
              </p>
              <span className="audit-subnote">
                {isOverMass
                  ? '🚨 Mass limit exceeded! Switch to a heavier launcher or remove spare depot modules.'
                  : '✅ Mass margin within safe structural tolerance.'}
              </span>
            </div>
          </div>

          {/* Check 3: Delta-v */}
          <div className={`audit-card ${isLowDeltaV ? 'fail' : 'pass'}`}>
            <div className="audit-icon">{isLowDeltaV ? '❌' : '✅'}</div>
            <div className="audit-info">
              <h5>Orbital Delta-v Margin (Trans-Mars Injection)</h5>
              <p>
                Effective Δv: <strong>{state.resources.deltaVAvailableKmS} km/s</strong> ({Math.round(state.resources.deltaVAvailableKmS * 1000)} m/s) | Required: <strong>{site.requiredDeltaVKmS} km/s</strong> ({site.requiredDeltaVMs} m/s)
              </p>
              <span className="audit-subnote">
                Physics: Base Δv ({currentLauncher?.deltaVBoostKmS} km/s) minus payload mass drag (-{(((state.resources.massKg) / 100) * 0.25).toFixed(2)} km/s).
              </span>
            </div>
          </div>
        </div>

        {/* Warnings / Educational Takeaways */}
        {check.warnings.length > 0 && (
          <div className="preflight-warnings-box">
            <strong>⚠️ NASA Flight Director Tactical Advisories:</strong>
            <ul>
              {check.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Blockers Alert if any */}
        {check.blockers.length > 0 && (
          <div className="preflight-blockers-box">
            <strong>🚨 Critical Flight Readiness Discrepancies:</strong>
            <ul>
              {check.blockers.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p className="blocker-warning-tip">
              You may still force a launch, but severe mass or Delta-v deficit will cause an unstable aerodynamic entry resulting in a <strong>hard landing penalty (-30⚡ battery)</strong> upon touchdown!
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="phase-actions-footer">
        <button
          type="button"
          className="secondary"
          onClick={() => send({ type: 'SET_PHASE', phase: 'design' })}
        >
          ← Re-tune Rover Hardware (DESIGN)
        </button>

        <button
          type="button"
          className={`primary-action-btn launch-btn ${!check.ok ? 'warning-launch' : ''}`}
          onClick={() => send({ type: 'LAUNCH_MISSION' })}
        >
          {!check.ok ? '⚠️ Force Launch Despite Warnings 🚀' : '🚀 Ignition & Launch Mission to Mars!'}
        </button>
      </div>
    </div>
  );
}
