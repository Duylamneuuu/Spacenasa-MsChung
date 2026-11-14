import React, { useState, useEffect, useRef } from 'react';
import type { MissionState, PlayerAction, RoverModuleCategory } from '../types/game';
import { MarsOpenWorld, CameraMode } from '../scene/MarsOpenWorld';
import { MarsMinimap } from './MarsMinimap';
import {
  LANDER_BASE_3D,
  SOLAR_RIDGES_3D,
  INITIAL_SAND_TRAPS_3D,
  INITIAL_SCIENCE_SAMPLES_3D,
  INITIAL_DEBRIS_SITES_3D,
  SandTrap3D,
  ScienceOutcrop3D,
  DebrisSite3D,
  getTerrainHeight,
} from '../scene/terrainMath';
import { ROVER_MODULES } from '../data/roverModules';
import { LANDING_SITES } from '../data/missionObjective';

interface OperationsViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
}

export function OperationsView({ state, send }: OperationsViewProps) {
  const { surface, activeLandingSite } = state;
  const site = LANDING_SITES[activeLandingSite] ?? LANDING_SITES.jezero_crater;

  // 3D Open World State
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [sandTraps, setSandTraps] = useState<SandTrap3D[]>(INITIAL_SAND_TRAPS_3D);
  const [scienceSamples, setScienceSamples] = useState<ScienceOutcrop3D[]>(INITIAL_SCIENCE_SAMPLES_3D);
  const [debrisSites, setDebrisSites] = useState<DebrisSite3D[]>(INITIAL_DEBRIS_SITES_3D);
  const [radarPulseRadius, setRadarPulseRadius] = useState<number | null>(null);
  const [radarPulseOrigin, setRadarPulseOrigin] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectingTargetPos, setCollectingTargetPos] = useState<{ x: number; y: number; z: number } | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isLanderModalOpen, setIsLanderModalOpen] = useState(false);

  // Keyboard input state
  const [inputMovement, setInputMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Real-time telemetry emitted from 3D world
  const [telemetry, setTelemetry] = useState({
    x: 0,
    z: 0,
    speedKmH: 0,
    headingRad: 0,
    terrainType: 'LANDER_BASE' as 'FLAT_ROCK' | 'SAND_TRAP' | 'SOLAR_RIDGE' | 'LANDER_BASE',
    currentDrainPerSec: 0,
    isInSolarRidge: false,
    isNearLander: true,
    nearbySampleId: null as string | null,
    nearbyDebrisId: null as string | null,
  });

  const equippedWheels = ROVER_MODULES[surface.equippedModules.wheels] || ROVER_MODULES.slim_aluminum;
  const equippedSensors = ROVER_MODULES[surface.equippedModules.sensors] || ROVER_MODULES.navcam;
  const equippedPower = ROVER_MODULES[surface.equippedModules.power] || ROVER_MODULES.solar_array;
  const equippedComms = ROVER_MODULES[surface.equippedModules.comms] || ROVER_MODULES.uhf_antenna;
  const isSlim = surface.equippedModules.wheels === 'slim_aluminum';

  // Distance to lander base (0, 0)
  const distToLander = Math.round(Math.sqrt(telemetry.x * telemetry.x + telemetry.z * telemetry.z));
  const commsMaxRange = equippedComms.maxDistanceToLanderForComms ?? Infinity;
  const isCommsInRange = distToLander <= (commsMaxRange * 10); // Scale 3 grid tiles = ~30m

  // Periodic decay timer: Radar detection of sand traps automatically fades after 12s
  // Forces the player to mentally memorize hazardous terrain or scan again
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setSandTraps(prev => {
        let changed = false;
        const next = prev.map(trap => {
          if (trap.revealed && trap.revealedUntil && now >= trap.revealedUntil) {
            changed = true;
            return { ...trap, revealed: false, revealedUntil: undefined };
          }
          return trap;
        });
        return changed ? next : prev;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Listen to keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLanderModalOpen) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setInputMovement(prev => ({ ...prev, forward: true }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setInputMovement(prev => ({ ...prev, backward: true }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setInputMovement(prev => ({ ...prev, left: true }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setInputMovement(prev => ({ ...prev, right: true }));
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerRadarScan();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        triggerInteract();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        triggerTransmit();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (telemetry.isNearLander) {
          setIsLanderModalOpen(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setInputMovement(prev => ({ ...prev, forward: false }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setInputMovement(prev => ({ ...prev, backward: false }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setInputMovement(prev => ({ ...prev, left: false }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setInputMovement(prev => ({ ...prev, right: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLanderModalOpen, telemetry.isNearLander, send]);

  // Radar Scan Action: Triggers 3D expanding wave centered at rover & reveals sand traps
  const triggerRadarScan = () => {
    const drain = equippedSensors.scanPowerDrain ?? 2;
    if (surface.batteryPower < drain) {
      return;
    }

    send({ type: 'SCAN_TERRAIN' });

    // Center 3D pulse wave directly on the current rover position
    const currentOrigin = {
      x: telemetry.x,
      y: getTerrainHeight(telemetry.x, telemetry.z),
      z: telemetry.z,
    };
    setRadarPulseOrigin(currentOrigin);

    // Target wave expansion radius (RIMFAX = 78m, NavCam = 36m)
    const isGpr = equippedSensors.id === 'rimfax_gpr';
    const maxPulseRadius = isGpr ? 78 : 36;
    setRadarPulseRadius(2);

    let current = 2;
    const pulseInterval = setInterval(() => {
      current += 4.5;
      if (current >= maxPulseRadius) {
        clearInterval(pulseInterval);
        setRadarPulseRadius(null);
      } else {
        setRadarPulseRadius(current);
      }
    }, 35);

    // Reveal sand traps within range for 12 seconds only!
    const expireTime = Date.now() + 12000;
    setSandTraps(prev =>
      prev.map(trap => {
        const dist = Math.hypot(telemetry.x - trap.x, telemetry.z - trap.z);
        if (dist <= maxPulseRadius + trap.radius) {
          return { ...trap, revealed: true, revealedUntil: expireTime };
        }
        return trap;
      })
    );
  };

  // Interaction trigger: Drills Rock Sample with 3D Laser or Salvages Debris (1.5s)
  const triggerInteract = () => {
    if (telemetry.nearbySampleId) {
      const sample = scienceSamples.find(s => s.id === telemetry.nearbySampleId);
      if (sample && !sample.collected) {
        setIsCollecting(true);
        setCollectingTargetPos({ x: sample.x, y: getTerrainHeight(sample.x, sample.z), z: sample.z });
        setTimeout(() => {
          setIsCollecting(false);
          setCollectingTargetPos(null);
        }, 1500); // 1.5s SuperCam Laser Zap as requested

        setScienceSamples(prev =>
          prev.map(s => (s.id === sample.id ? { ...s, collected: true } : s))
        );

        // Add 50 MB raw data to surface state
        surface.rawScienceMB += sample.valueMB;
        surface.logs.unshift(
          `💎 KHOAN MẪU ĐÁ THỰC ĐỊA: Đã chiếu tia Laser SuperCam 3D & thu thập +${sample.valueMB} MB dữ liệu trầm tích tại [${sample.x}m, ${sample.z}m]!`
        );
      }
    } else if (telemetry.nearbyDebrisId) {
      const debris = debrisSites.find(d => d.id === telemetry.nearbyDebrisId);
      if (debris && !debris.salvaged) {
        setIsCollecting(true);
        setCollectingTargetPos({ x: debris.x, y: getTerrainHeight(debris.x, debris.z), z: debris.z });
        setTimeout(() => {
          setIsCollecting(false);
          setCollectingTargetPos(null);
        }, 1500); // 1.5s Laser Cutting

        setDebrisSites(prev =>
          prev.map(d => (d.id === debris.id ? { ...d, salvaged: true } : d))
        );

        // Add 2 ISRU scrap to surface state
        surface.isruAlloyScrap += debris.scrapAmount;
        surface.logs.unshift(
          `🛰️ THU HỒI MẢNH VỠ TÀU CŨ: Chiếu Laser cắt rã & thu hoạch +${debris.scrapAmount} Hợp Kim ISRU từ tầng hạ cánh tại [${debris.x}m, ${debris.z}m]!`
        );
      }
    } else if (telemetry.isNearLander) {
      setIsLanderModalOpen(true);
    }
  };

  // Transmission trigger: Shoots 3D Comms Uplink Beam to Orbit / DSN
  const triggerTransmit = () => {
    if (surface.rawScienceMB <= 0 || !isCommsInRange) return;
    setIsTransmitting(true);
    setTimeout(() => setIsTransmitting(false), 2400);
    send({ type: 'TRANSMIT_DATA' });
  };

  // Delta battery drain & recharge handlers
  const handleBatteryDrain = (drain: number) => {
    surface.batteryPower = Math.max(0, surface.batteryPower - drain);
  };

  const handleSolarRecharge = (recharge: number) => {
    surface.batteryPower = Math.min(surface.maxBatteryPower, surface.batteryPower + recharge);
  };

  const handleMmrtgRecharge = (recharge: number) => {
    surface.batteryPower = Math.min(surface.maxBatteryPower, surface.batteryPower + recharge);
  };

  const batteryColor =
    surface.batteryPower > 40 ? 'var(--green)' : surface.batteryPower > 15 ? 'var(--amber)' : 'var(--red)';

  const isSand = telemetry.terrainType === 'SAND_TRAP';

  return (
    <div className="operations-open-world-container">
      {/* ================= 3D OPEN WORLD CANVAS ================= */}
      <MarsOpenWorld
        equippedModules={surface.equippedModules}
        batteryPower={surface.batteryPower}
        cameraMode={cameraMode}
        radarPulseRadius={radarPulseRadius}
        radarPulseOrigin={radarPulseOrigin}
        inputMovement={inputMovement}
        sandTraps={sandTraps}
        scienceSamples={scienceSamples}
        debrisSites={debrisSites}
        isCollectingSample={isCollecting}
        collectingTargetPos={collectingTargetPos}
        isTransmittingComms={isTransmitting}
        isGarageMode={isLanderModalOpen}
        onTelemetryUpdate={setTelemetry}
        onBatteryDrainDelta={handleBatteryDrain}
        onSolarRechargeDelta={handleSolarRecharge}
        onMmrtgRechargeDelta={handleMmrtgRecharge}
      />

      {/* ================= SCI-FI GLASSMORPHISM HUD OVERLAY ================= */}
      <div className="hud-overlay">
        {/* TOP-LEFT: Cockpit Telemetry Gauge */}
        <div className="hud-panel hud-top-left">
          <div className="hud-kicker">APOGEE ROVER TELEMETRY</div>
          <div className="hud-battery-row">
            <span className="battery-icon">⚡</span>
            <div className="hud-battery-text">
              <span className="battery-number" style={{ color: batteryColor }}>
                {Math.round(surface.batteryPower)}%
              </span>
              <span className="battery-status-sub">
                {equippedPower.name} {telemetry.isInSolarRidge ? '(☀️ Sạc Nắng)' : ''}
              </span>
            </div>
            <div className="speed-gauge-box">
              <span className="speed-number">{telemetry.speedKmH}</span>
              <span className="speed-unit">KM/H</span>
            </div>
          </div>

          <div className="hud-bar-track">
            <div
              className="hud-bar-fill"
              style={{ width: `${surface.batteryPower}%`, backgroundColor: batteryColor }}
            />
          </div>

          <div className="hud-terrain-sensor">
            <span className="hud-stat-lbl">ĐỊA HÌNH DƯỚI BÁNH XE:</span>
            <strong className={isSand ? 'terrain-alert-sand' : 'terrain-firm'}>
              {isSand
                ? '⚠️ VÙNG CÁT LÚN SÂU (Sand Trap Drift)'
                : telemetry.terrainType === 'SOLAR_RIDGE'
                ? '☀️ ĐỒI ĐÓN NẮNG (Solar Ridge)'
                : telemetry.terrainType === 'LANDER_BASE'
                ? '🏠 TRẠM ĐỔ BỘ (Lander Base HQ)'
                : '🪨 ĐƯỜNG BẰNG ĐÁ CỨNG (Flat Bedrock)'}
            </strong>
          </div>

          <div className="hud-sub-metrics">
            <span>Tiêu thụ: <strong className={isSand && isSlim ? 'text-red' : ''}>-{telemetry.currentDrainPerSec}⚡/s</strong></span>
            <span>Tọa độ: <strong>[{telemetry.x}m, {telemetry.z}m]</strong></span>
          </div>
        </div>

        {/* TOP-RIGHT: 2D Minimap & Camera Selector */}
        <div className="hud-panel hud-top-right">
          <MarsMinimap
            roverX={telemetry.x}
            roverZ={telemetry.z}
            heading={telemetry.headingRad}
            lander={LANDER_BASE_3D}
            solarRidges={SOLAR_RIDGES_3D}
            sandTraps={sandTraps}
            scienceSamples={scienceSamples}
            debrisSites={debrisSites}
            radarPulseRadius={radarPulseRadius}
          />

          {/* Camera View Switcher */}
          <div className="camera-switcher-pill">
            <button
              type="button"
              className={`cam-btn ${cameraMode === 'chase' ? 'active' : ''}`}
              onClick={() => setCameraMode('chase')}
              title="Camera góc nhìn thứ 3 sau xe"
            >
              Chase
            </button>
            <button
              type="button"
              className={`cam-btn ${cameraMode === 'eagle' ? 'active' : ''}`}
              onClick={() => setCameraMode('eagle')}
              title="Camera nhìn từ trên cao xuống"
            >
              Eagle
            </button>
            <button
              type="button"
              className={`cam-btn ${cameraMode === 'orbit' ? 'active' : ''}`}
              onClick={() => setCameraMode('orbit')}
              title="Camera xoay tự do"
            >
              Orbit
            </button>
          </div>
        </div>

        {/* PROXIMITY ACTION PROMPTS (Center of Screen) */}
        {telemetry.nearbySampleId && (
          <div className="hud-proximity-banner sample" onClick={triggerInteract}>
            <span className="banner-icon">💎</span>
            <div className="banner-text">
              <strong>PHÁT HIỆN MẪU ĐÁ KHOA HỌC ASTROBIOLOGY</strong>
              <span>[Nhấn phím F hoặc Click vào đây để Khoan Thu Thập (+50 MB)]</span>
            </div>
          </div>
        )}

        {telemetry.nearbyDebrisId && (
          <div className="hud-proximity-banner debris" onClick={triggerInteract}>
            <span className="banner-icon">🛰️</span>
            <div className="banner-text">
              <strong>PHÁT HIỆN XÁC TÀU HẠ CÁNH SKYCRANE</strong>
              <span>[Nhấn phím F hoặc Click vào đây để Thu Gom (+2 Hợp Kim ISRU)]</span>
            </div>
          </div>
        )}

        {telemetry.isNearLander && (
          <div className="hud-proximity-banner lander" onClick={() => setIsLanderModalOpen(true)}>
            <span className="banner-icon">🏠</span>
            <div className="banner-text">
              <strong>KẾT NỐI XƯỞNG TRẠM ĐỔ BỘ (LANDER DEPOT)</strong>
              <span>[Nhấn phím E hoặc Click vào đây để Tráo Đổi Phụ Kiện & In 3D]</span>
            </div>
          </div>
        )}

        {/* BOTTOM-CENTER: Driving Controls & Action Hotkeys */}
        <div className="hud-bottom-controls">
          {/* On-screen D-Pad for Touch/Mouse */}
          <div className="hud-dpad">
            <button
              type="button"
              className={`dpad-btn up ${inputMovement.forward ? 'pressed' : ''}`}
              onMouseDown={() => setInputMovement(p => ({ ...p, forward: true }))}
              onMouseUp={() => setInputMovement(p => ({ ...p, forward: false }))}
              onTouchStart={() => setInputMovement(p => ({ ...p, forward: true }))}
              onTouchEnd={() => setInputMovement(p => ({ ...p, forward: false }))}
            >
              ▲
            </button>
            <div className="dpad-middle">
              <button
                type="button"
                className={`dpad-btn left ${inputMovement.left ? 'pressed' : ''}`}
                onMouseDown={() => setInputMovement(p => ({ ...p, left: true }))}
                onMouseUp={() => setInputMovement(p => ({ ...p, left: false }))}
                onTouchStart={() => setInputMovement(p => ({ ...p, left: true }))}
                onTouchEnd={() => setInputMovement(p => ({ ...p, left: false }))}
              >
                ◀
              </button>
              <span className="dpad-center">WASD</span>
              <button
                type="button"
                className={`dpad-btn right ${inputMovement.right ? 'pressed' : ''}`}
                onMouseDown={() => setInputMovement(p => ({ ...p, right: true }))}
                onMouseUp={() => setInputMovement(p => ({ ...p, right: false }))}
                onTouchStart={() => setInputMovement(p => ({ ...p, right: true }))}
                onTouchEnd={() => setInputMovement(p => ({ ...p, right: false }))}
              >
                ▶
              </button>
            </div>
            <button
              type="button"
              className={`dpad-btn down ${inputMovement.backward ? 'pressed' : ''}`}
              onMouseDown={() => setInputMovement(p => ({ ...p, backward: true }))}
              onMouseUp={() => setInputMovement(p => ({ ...p, backward: false }))}
              onTouchStart={() => setInputMovement(p => ({ ...p, backward: true }))}
              onTouchEnd={() => setInputMovement(p => ({ ...p, backward: false }))}
            >
              ▼
            </button>
          </div>

          {/* Quick Action Hotkeys */}
          <div className="hud-actions-row">
            {/* Space: Radar Scan */}
            <button
              type="button"
              className="hud-action-pill radar"
              onClick={triggerRadarScan}
              disabled={surface.batteryPower < (equippedSensors.scanPowerDrain ?? 2)}
            >
              <span className="act-key">[SPACE]</span>
              <span className="act-title">📡 Quét Radar 3D</span>
              <span className="act-cost">-{equippedSensors.scanPowerDrain}⚡ ({equippedSensors.name.split(' ')[0]})</span>
            </button>

            {/* F: Interact / Collect */}
            <button
              type="button"
              className={`hud-action-pill interact ${telemetry.nearbySampleId || telemetry.nearbyDebrisId ? 'ready' : ''}`}
              onClick={triggerInteract}
              disabled={!telemetry.nearbySampleId && !telemetry.nearbyDebrisId && !telemetry.isNearLander}
            >
              <span className="act-key">[F]</span>
              <span className="act-title">⛏️ Thu Thập</span>
              <span className="act-cost">
                {telemetry.nearbySampleId ? 'Mẫu Đá 💎' : telemetry.nearbyDebrisId ? 'Mảnh Vỡ 🛰️' : 'Đến gần để nhặt'}
              </span>
            </button>

            {/* T: Transmit DSN Comms */}
            <button
              type="button"
              className={`hud-action-pill comms ${!isCommsInRange ? 'disabled' : ''} ${isTransmitting ? 'transmitting' : ''}`}
              onClick={triggerTransmit}
              disabled={surface.rawScienceMB <= 0 || !isCommsInRange}
            >
              <span className="act-key">[T]</span>
              <span className="act-title">{isTransmitting ? '📡 Đang Bắn Tín Hiệu...' : '📶 Truyền DSN'}</span>
              <span className="act-cost">
                {!isCommsInRange ? `❌ UHF > 30m` : `-${equippedComms.transmitPowerDrain}⚡ (${surface.rawScienceMB} MB)`}
              </span>
            </button>

            {/* E: Open Lander Workshop */}
            <button
              type="button"
              className={`hud-action-pill workshop ${telemetry.isNearLander ? 'ready' : ''}`}
              onClick={() => setIsLanderModalOpen(true)}
            >
              <span className="act-key">[E]</span>
              <span className="act-title">🏠 Xưởng Trạm</span>
              <span className="act-cost">{telemetry.isNearLander ? 'Đang ở Trạm' : `${distToLander}m tới HQ`}</span>
            </button>

            {/* Finish & Debrief Button */}
            <button
              type="button"
              className="hud-action-pill finish"
              onClick={() => send({ type: 'SET_PHASE', phase: 'debrief' })}
            >
              <span className="act-key">[END]</span>
              <span className="act-title">🏁 Tổng Kết (DEBRIEF)</span>
              <span className="act-cost">{surface.transmittedScienceMB}/150 MB</span>
            </button>
          </div>
        </div>

        {/* BOTTOM-RIGHT: Compact Live Telemetry Log */}
        <div className="hud-panel hud-bottom-right">
          <div className="hud-kicker">MISSION TELEMETRY LOG</div>
          <div className="hud-log-scroll">
            {surface.logs.slice(0, 4).map((log, i) => (
              <div key={i} className={`hud-log-line ${i === 0 ? 'newest' : ''}`}>
                › {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 3D GARAGE SHOWCASE FLOATING BADGE ================= */}
      {isLanderModalOpen && (
        <div className="garage-showcase-badge">
          <span>🛠️ 3D GARAGE INSPECT</span>
          <span className="badge-sub">Quan sát xe tự hành 3D biến hình trực tiếp!</span>
        </div>
      )}

      {/* ================= LANDER DEPOT & 3D FABRICATOR GARAGE DRAWER ================= */}
      {isLanderModalOpen && (
        <div className="garage-drawer-backdrop" onClick={() => setIsLanderModalOpen(false)}>
          <div className="garage-drawer-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🛠️ Xưởng Trạm Đổ Bộ (Garage Depot)</h3>
                <p className="modal-desc">
                  {telemetry.isNearLander
                    ? 'Đang kết nối trạm đổ bộ. Tháo lắp linh kiện để xem xe 3D biến hình trực tiếp bên cạnh.'
                    : `⚠️ Chú ý: Xe đang ở cách trạm ${distToLander}m. Cần lái về trạm để tháo lắp.`}
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsLanderModalOpen(false)}
                title="Đóng Garage & Tiếp Tục Lái Xe"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Resources Available at Base */}
              <div className="modal-res-strip">
                <span>Kho dự phòng: <strong>{surface.landerInventory.length} món</strong></span>
                <span>Hợp kim ISRU: <strong className="text-green">{surface.isruAlloyScrap} 🔩</strong></span>
                <span>Quỹ tiếp vận: <strong className="text-cyan">${surface.missionCreditsMUSD}M 💰</strong></span>
              </div>

              {/* 1. Swap Spare Modules Section */}
              <div className="modal-section">
                <h4>1. Phụ Kiện Dự Phòng Trong Kho Trạm (Lander Depot Spares)</h4>
                <div className="spares-grid">
                  {surface.landerInventory.map(modId => {
                    const mod = ROVER_MODULES[modId];
                    if (!mod || mod.category === 'launcher') return null;
                    const isEquipped = surface.equippedModules[mod.category] === mod.id;

                    return (
                      <div key={modId} className={`spare-card ${isEquipped ? 'active-on-rover' : ''}`}>
                        <div>
                          <strong>{mod.name}</strong>
                          <span className="spare-cat">Hạng mục: {mod.category.toUpperCase()}</span>
                          <p className="spare-tradeoff">{mod.pros}</p>
                        </div>
                        {isEquipped ? (
                          <span className="equipped-tag">Đang Gắn Trên Xe 3D</span>
                        ) : (
                          <button
                            type="button"
                            className="swap-btn"
                            disabled={!telemetry.isNearLander}
                            onClick={() => send({ type: 'SWAP_MODULE', category: mod.category as RoverModuleCategory, newModuleId: mod.id })}
                          >
                            Tráo Đổi Vào Xe 3D
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. 3D Fabricator Crafting Section */}
              <div className="modal-section">
                <h4>2. Đúc Linh Kiện Mới Bằng Máy In 3D (ISRU Fabricator)</h4>
                <div className="craft-grid">
                  {Object.values(ROVER_MODULES)
                    .filter(m => m.category !== 'launcher' && !surface.landerInventory.includes(m.id))
                    .map(m => {
                      const canCraftScrap = surface.isruAlloyScrap >= m.craftCostScrap;
                      const canCraftCredits = surface.missionCreditsMUSD >= m.craftCostCredits;
                      const canAfford = canCraftScrap || canCraftCredits;

                      return (
                        <div key={m.id} className="craft-card">
                          <div>
                            <strong>{m.name}</strong>
                            <span className="craft-cost">
                              Chi phí: {m.craftCostScrap} 🔩 Scrap HOẶC ${m.craftCostCredits}M 💰
                            </span>
                            <p className="craft-desc">{m.description}</p>
                          </div>
                          <button
                            type="button"
                            className={`craft-btn ${canAfford ? 'can-craft' : ''}`}
                            disabled={!telemetry.isNearLander || !canAfford}
                            onClick={() => send({ type: 'CRAFT_MODULE', moduleId: m.id })}
                          >
                            {canAfford ? '🖨️ In 3D Chế Tạo' : 'Thiếu Tài Nguyên'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="close-garage-btn" onClick={() => setIsLanderModalOpen(false)}>
                ✓ Đóng Garage & Trở Lại Lái Xe 3D
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
