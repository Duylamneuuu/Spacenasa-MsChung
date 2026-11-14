import React, { useState, useEffect } from 'react';
import type { WorldObject3D, SandTrap3D, ScienceOutcrop3D, DebrisSite3D } from '../scene/terrainMath';

interface MarsMinimapProps {
  roverX: number;
  roverZ: number;
  heading: number; // in radians
  lander: WorldObject3D;
  solarRidges: WorldObject3D[];
  sandTraps: SandTrap3D[];
  scienceSamples: ScienceOutcrop3D[];
  debrisSites: DebrisSite3D[];
  radarPulseRadius?: number | null;
}

export function MarsMinimap({
  roverX,
  roverZ,
  heading,
  lander,
  solarRidges,
  sandTraps,
  scienceSamples,
  debrisSites,
  radarPulseRadius = null,
}: MarsMinimapProps) {
  const radarRadiusMeters = 85; // radar view radius in meters
  const sizePx = 170;
  const centerPx = sizePx / 2;

  // Continuous rotating radar sweep angle (deg)
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setSweepAngle(prev => (prev + dt * 120) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Converts a world (x, z) relative to rover into minimap (px, py)
  const toMinimapCoords = (wx: number, wz: number) => {
    const dx = wx - roverX;
    const dz = wz - roverZ;

    const px = centerPx + (dx / radarRadiusMeters) * (centerPx - 10);
    const py = centerPx + (dz / radarRadiusMeters) * (centerPx - 10);

    return { px, py, dist: Math.sqrt(dx * dx + dz * dz) };
  };

  const distToLander = Math.round(Math.sqrt(roverX * roverX + roverZ * roverZ));

  // Pulse wave in minimap pixels
  const pulsePx =
    radarPulseRadius !== null && radarPulseRadius > 0
      ? Math.min(centerPx - 4, (radarPulseRadius / radarRadiusMeters) * (centerPx - 10))
      : null;

  return (
    <div className="mars-minimap-container">
      <div className="minimap-header">
        <span>🛰️ TACTICAL RADAR</span>
        <span className="dist-lander-badge">Lander: {distToLander}m</span>
      </div>

      <div className="minimap-radar-screen" style={{ width: sizePx, height: sizePx }}>
        <svg width={sizePx} height={sizePx} className="radar-svg">
          {/* Radar Background & Grid Rings */}
          <circle cx={centerPx} cy={centerPx} r={centerPx - 4} fill="#060911" stroke="#1e3a8a" strokeWidth="1.5" />
          <circle cx={centerPx} cy={centerPx} r={(centerPx - 4) * 0.66} fill="none" stroke="#1e293b" strokeDasharray="3 3" />
          <circle cx={centerPx} cy={centerPx} r={(centerPx - 4) * 0.33} fill="none" stroke="#1e293b" strokeDasharray="3 3" />

          {/* Crosshairs */}
          <line x1={centerPx} y1={6} x2={centerPx} y2={sizePx - 6} stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          <line x1={6} y1={centerPx} x2={sizePx - 6} y2={centerPx} stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />

          {/* Rotating Radar Sweep Beam */}
          <g transform={`rotate(${sweepAngle}, ${centerPx}, ${centerPx})`}>
            <line
              x1={centerPx}
              y1={centerPx}
              x2={centerPx + (centerPx - 6)}
              y2={centerPx}
              stroke="rgba(56, 189, 248, 0.85)"
              strokeWidth="1.5"
            />
          </g>

          {/* Active 3D Expanding Radar Pulse Wave Ring */}
          {pulsePx !== null && (
            <g>
              <circle
                cx={centerPx}
                cy={centerPx}
                r={pulsePx}
                fill="rgba(56, 189, 248, 0.18)"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <circle
                cx={centerPx}
                cy={centerPx}
                r={Math.max(0, pulsePx - 4)}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="1"
                opacity="0.8"
              />
            </g>
          )}

          {/* Lander Base (🏠) */}
          {(() => {
            const { px, py, dist } = toMinimapCoords(lander.x, lander.z);
            if (dist > radarRadiusMeters) return null;
            return (
              <g transform={`translate(${px}, ${py})`}>
                <circle r="5" fill="#38bdf8" />
                <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                <text x="7" y="3" fill="#38bdf8" fontSize="8" fontWeight="bold">HQ</text>
              </g>
            );
          })()}

          {/* Solar Ridges (☀️) */}
          {solarRidges.map(ridge => {
            const { px, py, dist } = toMinimapCoords(ridge.x, ridge.z);
            if (dist > radarRadiusMeters) return null;
            return (
              <circle
                key={ridge.id}
                cx={px}
                cy={py}
                r="6"
                fill="rgba(251, 191, 36, 0.3)"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Sand Traps (⚠️) */}
          {sandTraps.map(trap => {
            const { px, py, dist } = toMinimapCoords(trap.x, trap.z);
            if (dist > radarRadiusMeters) return null;

            if (trap.revealed) {
              // Fully revealed by Radar scan: Bright Red Warning
              return (
                <g key={trap.id} transform={`translate(${px}, ${py})`}>
                  <circle r="8" fill="rgba(239, 68, 68, 0.35)" stroke="#ef4444" strokeWidth="1.5" />
                  <circle r="3.5" fill="#ef4444" />
                  <text x="6" y="-3" fill="#ef4444" fontSize="7" fontWeight="bold">DUNE</text>
                </g>
              );
            } else {
              // Unrevealed: Faint soft amber perimeter indicating dune ripples
              return (
                <circle
                  key={trap.id}
                  cx={px}
                  cy={py}
                  r="6"
                  fill="rgba(217, 119, 6, 0.15)"
                  stroke="#d97706"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            }
          })}

          {/* Science Rock Samples (💎) */}
          {scienceSamples.map(sample => {
            if (sample.collected) return null;
            const { px, py, dist } = toMinimapCoords(sample.x, sample.z);
            if (dist > radarRadiusMeters) return null;
            return (
              <polygon
                key={sample.id}
                points={`${px},${py - 4} ${px + 4},${py} ${px},${py + 4} ${px - 4},${py}`}
                fill="#c084fc"
                stroke="#a855f7"
                strokeWidth="1"
              />
            );
          })}

          {/* Debris Sites (🛰️) */}
          {debrisSites.map(debris => {
            if (debris.salvaged) return null;
            const { px, py, dist } = toMinimapCoords(debris.x, debris.z);
            if (dist > radarRadiusMeters) return null;
            return (
              <rect
                key={debris.id}
                x={px - 3}
                y={py - 3}
                width="6"
                height="6"
                fill="#34d399"
                stroke="#059669"
                strokeWidth="1"
              />
            );
          })}

          {/* Center Rover Avatar with Heading Arrow */}
          <g transform={`translate(${centerPx}, ${centerPx}) rotate(${(heading * 180) / Math.PI})`}>
            {/* Vision cone */}
            <path d="M 0 0 L -12 -28 L 12 -28 Z" fill="rgba(56, 189, 248, 0.15)" />
            {/* Vehicle arrow */}
            <polygon points="0,-7 5,5 -5,5" fill="#38bdf8" />
            <circle r="2.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      <div className="minimap-legend">
        <span>🔵 Trạm HQ</span>
        <span>🟡 Đồi Nắng</span>
        <span>🔴 Cát Lún</span>
        <span>🟣 Mẫu Đá</span>
        <span>🟢 Mảnh Vỡ</span>
      </div>
    </div>
  );
}
