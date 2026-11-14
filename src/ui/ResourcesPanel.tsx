import React from 'react';
import type { MissionState, PlayerAction } from '../types/game';
import { ROVER_MODULES } from '../data/roverModules';
import { LANDING_SITES } from '../data/missionObjective';

interface ResourcesPanelProps {
  state: MissionState;
  send?: (action: PlayerAction) => void;
}

export function ResourcesPanel({ state, send }: ResourcesPanelProps) {
  const { resources, surface, activeLandingSite, phase } = state;
  const site = LANDING_SITES[activeLandingSite] ?? LANDING_SITES.jezero_crater;

  const budgetPct = Math.max(0, Math.min(100, (resources.budgetRemaining / resources.totalBudgetMUSD) * 100));
  const massPct = Math.min(100, (resources.massKg / resources.massLimitKg) * 100);
  const deltaVPct = Math.min(100, (resources.deltaVAvailableKmS / resources.deltaVRequiredKmS) * 100);

  const isOverMass = resources.massKg > resources.massLimitKg;
  const isOverBudget = resources.budgetRemaining < 0;
  const isLowDeltaV = resources.deltaVAvailableKmS < resources.deltaVRequiredKmS;

  const isSurfacePhase = phase === 'operations' || phase === 'debrief';

  return (
    <aside className="panel resources-sidebar">
      <div className="sidebar-header">
        <h3>Mission Telemetry</h3>
        <span className="zone-pill">{site.name}</span>
      </div>

      <div className="telemetry-group">
        {/* Resource 1: Budget */}
        <div className="telemetry-item">
          <div className="item-labels">
            <span className="res-title">1. Budget Remaining</span>
            <span className={`res-val ${isOverBudget ? 'text-red font-bold' : 'text-cyan font-bold'}`}>
              ${resources.budgetRemaining}M / ${resources.totalBudgetMUSD}M
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${isOverBudget ? 'bg-red' : 'bg-cyan'}`}
              style={{ width: `${isOverBudget ? 100 : budgetPct}%` }}
            />
          </div>
          {!isSurfacePhase ? (
            <span className="res-sub">Unspent surplus will convert to Mars Credits</span>
          ) : (
            <span className="res-sub text-green">💰 Mars Credits: ${surface.missionCreditsMUSD}M</span>
          )}
        </div>

        {/* Resource 2: Mass */}
        <div className="telemetry-item">
          <div className="item-labels">
            <span className="res-title">2. Payload Mass</span>
            <span className={`res-val ${isOverMass ? 'text-red font-bold' : 'font-bold'}`}>
              {resources.massKg} / {resources.massLimitKg} kg
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${isOverMass ? 'bg-red' : 'bg-green'}`}
              style={{ width: `${Math.min(100, massPct)}%` }}
            />
          </div>
          <span className="res-sub">
            Rover: {resources.roverMassKg} kg | Depot Spares: {resources.depotMassKg} kg
          </span>
        </div>

        {/* Resource 3: Delta-v */}
        <div className="telemetry-item">
          <div className="item-labels">
            <span className="res-title">3. Orbital Delta-v (Δv)</span>
            <span className={`res-val ${isLowDeltaV ? 'text-amber font-bold' : 'text-green font-bold'}`}>
              {resources.deltaVAvailableKmS} / {resources.deltaVRequiredKmS} km/s
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${isLowDeltaV ? 'bg-amber' : 'bg-green'}`}
              style={{ width: `${Math.min(100, deltaVPct)}%` }}
            />
          </div>
          <span className="res-sub">
            Required: {site.requiredDeltaVMs} m/s | Margin: {(resources.deltaVAvailableKmS - resources.deltaVRequiredKmS).toFixed(2)} km/s
          </span>
        </div>

        {/* Resource 4: Power (⚡) */}
        <div className="telemetry-item">
          <div className="item-labels">
            <span className="res-title">4. Rover Battery</span>
            <span className="res-val text-amber font-bold">
              {Math.round(surface.batteryPower)}⚡ / 100⚡
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill bg-amber"
              style={{ width: `${Math.max(0, Math.min(100, surface.batteryPower))}%` }}
            />
          </div>
          <span className="res-sub">
            Source: {ROVER_MODULES[surface.equippedModules.power]?.name}
          </span>
        </div>

        {/* Resource 5: Comms & Science */}
        <div className="telemetry-item">
          <div className="item-labels">
            <span className="res-title">5. Science Uplink (DSN)</span>
            <span className="res-val text-purple font-bold">
              {surface.transmittedScienceMB} MB Transmitted
            </span>
          </div>
          <span className="res-sub">
            Raw in Buffer: {surface.rawScienceMB} MB | Target: 150 MB
          </span>
        </div>
      </div>

      {/* Active Equipment Badges */}
      <div className="sidebar-equipment-section">
        <h4>Equipped Hardware</h4>
        <ul className="equipped-list">
          <li>
            <span className="eq-cat">Wheels:</span>
            <span className="eq-name">{ROVER_MODULES[surface.equippedModules.wheels]?.name}</span>
          </li>
          <li>
            <span className="eq-cat">Radar:</span>
            <span className="eq-name">{ROVER_MODULES[surface.equippedModules.sensors]?.name}</span>
          </li>
          <li>
            <span className="eq-cat">Power:</span>
            <span className="eq-name">{ROVER_MODULES[surface.equippedModules.power]?.name}</span>
          </li>
          <li>
            <span className="eq-cat">Comms:</span>
            <span className="eq-name">{ROVER_MODULES[surface.equippedModules.comms]?.name}</span>
          </li>
          <li>
            <span className="eq-cat">Rocket:</span>
            <span className="eq-name">{ROVER_MODULES[surface.equippedModules.launcher]?.name}</span>
          </li>
        </ul>
      </div>

      {/* Risk Indicator */}
      <div className="risk-indicator-box">
        <div className="item-labels">
          <span>Flight Risk Index</span>
          <strong className={resources.risk > 50 ? 'text-red' : resources.risk > 25 ? 'text-amber' : 'text-green'}>
            {resources.risk} / 100
          </strong>
        </div>
      </div>

      {send && (
        <button
          type="button"
          className="sidebar-reset-btn"
          onClick={() => send({ type: 'RESET' })}
        >
          ↺ Reset Mission Simulation
        </button>
      )}
    </aside>
  );
}
