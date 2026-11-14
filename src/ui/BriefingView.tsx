import React from 'react';
import type { MissionState, PlayerAction, LandingSiteId } from '../types/game';
import { LANDING_SITES } from '../data/missionObjective';

interface BriefingViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
}

export function BriefingView({ state, send }: BriefingViewProps) {
  const sites = Object.values(LANDING_SITES);
  const currentSite = LANDING_SITES[state.activeLandingSite] ?? LANDING_SITES.jezero_crater;

  return (
    <div className="briefing-view">
      <div className="section-intro">
        <span className="badge-kicker">PHASE 1: PLAN</span>
        <h2>Select Martian Landing Site & Operational Sector</h2>
        <p className="description">
          Each landing zone features distinctive geological hazards, dust concentrations, and orbital Delta-v requirements.
          Your choice determines mission budget, scientific potential, and necessary rover equipment.
        </p>
      </div>

      <div className="sites-grid">
        {sites.map(site => {
          const isSelected = state.activeLandingSite === site.id;
          const diffColor =
            site.difficulty === 'Beginner'
              ? '#4ade80'
              : site.difficulty === 'Intermediate'
              ? '#fbbf24'
              : '#f87171';

          return (
            <div
              key={site.id}
              className={`site-card ${isSelected ? 'selected' : ''}`}
              onClick={() => send({ type: 'SELECT_LANDING_SITE', siteId: site.id as LandingSiteId })}
            >
              <div className="site-header">
                <div>
                  <h3>{site.name}</h3>
                  <span className="difficulty-pill" style={{ borderColor: diffColor, color: diffColor }}>
                    {site.difficulty}
                  </span>
                </div>
                {isSelected && <span className="selected-check">✓ ACTIVE</span>}
              </div>

              <div className="site-stats">
                <div className="stat-box">
                  <span className="stat-label">Mission Budget</span>
                  <span className="stat-val text-cyan">${site.budgetMUSD}M</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Required Δv</span>
                  <span className="stat-val text-amber">{site.requiredDeltaVMs} m/s</span>
                </div>
              </div>

              <div className="terrain-bar-wrap">
                <span className="stat-label">Terrain Composition</span>
                <div className="terrain-bar">
                  <div
                    className="bar-seg flat"
                    style={{ width: `${site.flatRockPct}%` }}
                    title={`Flat Basalt: ${site.flatRockPct}%`}
                  />
                  <div
                    className="bar-seg sand"
                    style={{ width: `${site.sandTrapPct}%` }}
                    title={`Sand Traps: ${site.sandTrapPct}%`}
                  />
                  <div
                    className="bar-seg ridge"
                    style={{ width: `${site.solarRidgePct}%` }}
                    title={`Solar Ridges: ${site.solarRidgePct}%`}
                  />
                </div>
                <div className="terrain-legend">
                  <span>🪨 Flat {site.flatRockPct}%</span>
                  <span>⚠️ Sand {site.sandTrapPct}%</span>
                  <span>☀️ Ridges {site.solarRidgePct}%</span>
                </div>
              </div>

              <p className="site-desc">{site.description}</p>
              <div className="strategic-tip">
                <strong>Strategic Intel:</strong> {site.strategicTip}
              </div>

              <button
                type="button"
                className={`select-btn ${isSelected ? 'active' : 'secondary'}`}
                onClick={e => {
                  e.stopPropagation();
                  send({ type: 'SELECT_LANDING_SITE', siteId: site.id as LandingSiteId });
                }}
              >
                {isSelected ? 'Zone Selected' : 'Choose This Landing Zone'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="phase-actions-footer">
        <div className="footer-summary">
          Target: <strong>{currentSite.name}</strong> | Budget: <strong>${currentSite.budgetMUSD}M</strong> | Required Δv: <strong>{currentSite.requiredDeltaVMs} m/s</strong>
        </div>
        <button
          type="button"
          className="primary-action-btn"
          onClick={() => send({ type: 'ADVANCE_PHASE' })}
        >
          Confirm Site & Proceed to Rover Assembly (DESIGN) →
        </button>
      </div>
    </div>
  );
}
