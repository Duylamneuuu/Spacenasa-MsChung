import React, { useState } from 'react';
import type { MissionState, PlayerAction, RoverModuleCategory, RoverModule } from '../types/game';
import { MODULES_BY_CATEGORY, ROVER_MODULES } from '../data/roverModules';
import { ModuleBreakoutViewer } from '../scene/ModuleBreakoutViewer';

interface DesignViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
}

export function DesignView({ state, send }: DesignViewProps) {
  const [activeTab, setActiveTab] = useState<RoverModuleCategory>('wheels');

  const categories: { key: RoverModuleCategory; label: string; icon: string }[] = [
    { key: 'wheels', label: '1. Wheels & Chassis', icon: '🛞' },
    { key: 'sensors', label: '2. Radar & Cameras', icon: '📡' },
    { key: 'power', label: '3. Power Source', icon: '⚡' },
    { key: 'comms', label: '4. Deep Space Comms', icon: '📶' },
  ];

  const currentModules = MODULES_BY_CATEGORY[activeTab] || [];
  const activeEquippedId = state.surface.equippedModules[activeTab];

  return (
    <div className="design-view">
      <div className="section-intro">
        <span className="badge-kicker">PHASE 2: DESIGN</span>
        <h2>Architect Your Mars Surface Exploration Rover</h2>
        <p className="description">
          NASA Systems Engineering Rule: <em>No All-Max Configuration</em>. Equipping heavy armor or nuclear power adds
          significant weight, severely reducing spacecraft launch Delta-v or exhausting your budget.
        </p>
      </div>

      {/* Real-time Loadout Summary Bar */}
      <div className="design-summary-strip">
        <div className="summary-col">
          <span className="strip-label">ACTIVE ROVER LOADOUT</span>
          <span className="strip-val text-cyan">
            {state.resources.roverMassKg} kg | ${state.selectedModuleIds.reduce((sum, id) => sum + (ROVER_MODULES[id]?.category !== 'launcher' ? (ROVER_MODULES[id]?.costMUSD || 0) : 0), 0)}M
          </span>
        </div>
        <div className="summary-col">
          <span className="strip-label">LANDER DEPOT SPARES</span>
          <span className="strip-val text-purple">
            {state.resources.depotMassKg} kg | ${state.depotModuleIds.reduce((sum, id) => sum + (ROVER_MODULES[id]?.costMUSD || 0), 0)}M
          </span>
        </div>
        <div className="summary-col">
          <span className="strip-label">TOTAL PAYLOAD TO MARS</span>
          <span className="strip-val font-bold">
            {state.resources.massKg} kg (Cap: {state.resources.massLimitKg} kg)
          </span>
        </div>
        <div className="summary-col">
          <span className="strip-label">REMAINING BUDGET</span>
          <span className={`strip-val ${state.resources.budgetRemaining < 0 ? 'text-red' : 'text-green'}`}>
            ${state.resources.budgetRemaining}M
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.key}
            type="button"
            className={`tab-btn ${activeTab === cat.key ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.key)}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="tab-current-pill">
              {ROVER_MODULES[state.surface.equippedModules[cat.key]]?.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Module Options Grid for Current Category */}
      <div className="modules-grid">
        {currentModules.map(mod => {
          const isEquipped = activeEquippedId === mod.id;
          const isStowedInDepot = state.depotModuleIds.includes(mod.id);

          return (
            <div
              key={mod.id}
              className={`module-card ${isEquipped ? 'equipped' : isStowedInDepot ? 'depot-stowed' : ''}`}
            >
              <div className="card-top">
                <div>
                  <h4 className="module-title">{mod.name}</h4>
                  <span className="price-tag">${mod.costMUSD}M · {mod.massKg} kg</span>
                </div>
                {isEquipped && <span className="equipped-badge">EQUIPPED ON ROVER</span>}
                {isStowedInDepot && <span className="depot-badge">IN LANDER DEPOT</span>}
              </div>

              {/* 3D Isometric Breakout Model Preview */}
              <ModuleBreakoutViewer moduleId={mod.id} name={mod.name} />

              <p className="mod-desc">{mod.description}</p>

              {/* Trade-off Matrix Details */}
              <div className="trade-off-specs">
                {mod.category === 'wheels' && (
                  <div className="spec-table">
                    <div className="spec-row">
                      <span>🪨 Flat Basalt Rock:</span>
                      <strong>{mod.powerDrainFlat}⚡/tile</strong>
                    </div>
                    <div className="spec-row">
                      <span>⚠️ Dune Sand Trap:</span>
                      <strong className={mod.powerDrainSand && mod.powerDrainSand > 15 ? 'text-amber' : 'text-green'}>
                        {mod.powerDrainSand}⚡/tile
                      </strong>
                    </div>
                    <div className="spec-row">
                      <span>🛑 Sand Immobilization Risk:</span>
                      <strong className={mod.stuckRiskSand && mod.stuckRiskSand > 0 ? 'text-red' : 'text-green'}>
                        {(mod.stuckRiskSand ?? 0) * 100}% {mod.stuckRiskSand ? '(15⚡ to extract)' : '(0% stuck immune)'}
                      </strong>
                    </div>
                  </div>
                )}

                {mod.category === 'sensors' && (
                  <div className="spec-table">
                    <div className="spec-row">
                      <span>⚡ Sensor Power Drain:</span>
                      <strong>{mod.scanPowerDrain}⚡ / scan</strong>
                    </div>
                    <div className="spec-row">
                      <span>👁️ Scouting Radius:</span>
                      <strong>{mod.scanRadius} tiles</strong>
                    </div>
                    <div className="spec-row">
                      <span>🔍 Subsurface Radar:</span>
                      <strong className={mod.revealsHiddenSand ? 'text-green' : 'text-amber'}>
                        {mod.revealsHiddenSand ? 'Reveals 100% hidden sand traps' : 'Cannot detect sand hazards'}
                      </strong>
                    </div>
                  </div>
                )}

                {mod.category === 'power' && (
                  <div className="spec-table">
                    <div className="spec-row">
                      <span>☀️ Solar Ridge Recharge:</span>
                      <strong>+{mod.chargeRateRidge}⚡ / turn</strong>
                    </div>
                    <div className="spec-row">
                      <span>⚡ Continuous Deep-Space Recharge:</span>
                      <strong className={mod.chargeRateEverywhere && mod.chargeRateEverywhere > 0 ? 'text-green' : 'text-amber'}>
                        {mod.chargeRateEverywhere ? `+${mod.chargeRateEverywhere}⚡ / turn anywhere` : '0⚡ (Requires sunlight)'}
                      </strong>
                    </div>
                  </div>
                )}

                {mod.category === 'comms' && (
                  <div className="spec-table">
                    <div className="spec-row">
                      <span>⚡ Transmission Power Drain:</span>
                      <strong>{mod.transmitPowerDrain}⚡ / uplink</strong>
                    </div>
                    <div className="spec-row">
                      <span>📶 Earth Relay Range:</span>
                      <strong className={mod.maxDistanceToLanderForComms && mod.maxDistanceToLanderForComms < 10 ? 'text-amber' : 'text-green'}>
                        {mod.maxDistanceToLanderForComms && mod.maxDistanceToLanderForComms < 10
                          ? `Within ${mod.maxDistanceToLanderForComms} tiles of Lander Base`
                          : 'Anywhere on Mars map (Direct DSN)'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Pros & Cons */}
              <div className="pros-cons-box">
                <div className="pro-line">
                  <span className="bullet text-green">+</span> {mod.pros}
                </div>
                <div className="con-line">
                  <span className="bullet text-red">-</span> {mod.cons}
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="card-buttons">
                <button
                  type="button"
                  className={`equip-btn ${isEquipped ? 'is-active' : ''}`}
                  onClick={() => send({ type: 'SELECT_MODULE', moduleId: mod.id })}
                >
                  {isEquipped ? '✓ Active on Rover' : 'Equip on Rover'}
                </button>

                {!isEquipped && (
                  <button
                    type="button"
                    className={`depot-toggle-btn ${isStowedInDepot ? 'remove' : 'add'}`}
                    onClick={() => send({ type: 'TOGGLE_DEPOT_MODULE', moduleId: mod.id })}
                    title="Pack a spare unit inside the Lander Depot for field swapping"
                  >
                    {isStowedInDepot ? '✕ Remove from Depot' : '+ Pack as Depot Spare'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lander Depot Spares Inventory Drawer */}
      <div className="depot-inventory-drawer">
        <div className="drawer-header">
          <div>
            <h4>📦 Lander Depot Spare Inventory (Mang theo trên Trạm Đổ Bộ)</h4>
            <p className="drawer-sub">
              Modules stowed here can be swapped onto your rover when docked at the Lander Base on Mars.
            </p>
          </div>
          <span className="drawer-count">
            {state.depotModuleIds.length} Spares Stowed (+{state.resources.depotMassKg} kg)
          </span>
        </div>

        {state.depotModuleIds.length === 0 ? (
          <p className="empty-depot-note">
            No spare modules packed in Lander Depot. Click <em>"+ Pack as Depot Spare"</em> on any module above if you wish to bring alternative hardware for Martian field swaps.
          </p>
        ) : (
          <div className="depot-spares-list">
            {state.depotModuleIds.map(id => {
              const m = ROVER_MODULES[id];
              if (!m) return null;
              return (
                <div key={id} className="depot-item-pill">
                  <span>{m.name} (${m.costMUSD}M · {m.massKg} kg)</span>
                  <button
                    type="button"
                    onClick={() => send({ type: 'TOGGLE_DEPOT_MODULE', moduleId: id })}
                    className="depot-remove-icon"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="phase-actions-footer">
        <button
          type="button"
          className="secondary"
          onClick={() => send({ type: 'SET_PHASE', phase: 'briefing' })}
        >
          ← Back to Landing Site (PLAN)
        </button>
        <button
          type="button"
          className="primary-action-btn"
          onClick={() => send({ type: 'ADVANCE_PHASE' })}
        >
          Proceed to Rocket Selection & Preflight Check (DECIDE) →
        </button>
      </div>
    </div>
  );
}
