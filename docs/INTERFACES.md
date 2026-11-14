# APOGEE — Integration contract v2: Plan & Drive (target, not a claim of implementation)

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Current code caveat
Latest main already has `MarsOpenWorld`, `Mars3DRover`, `OperationsView` and roverEngine with manual WASD controls, plus legacy rocket/ISRU/tile rules and Vietnamese runtime messages. **Audit code at HEAD** before changing any API; do not build a competing engine and do not overwrite fresh teammate work. This file is the TARGET contract only; actual `src/types/game.ts` may still differ.

## Modes, data and events
| Type | Fields / role |
|---|---|
| `ControlMode` | `'planning' \| 'driving' \| 'paused'` |
| `DrivingInput` | `forward, reverse, steerLeft, steerRight, brake?` (held-key state) |
| `RoverPose` | `x, z, headingRadians, speedMetersPerSecond` |
| `TerrainSample` | terrainId, groundType, slope, illumination, hazardEstimate |
| `Waypoint` | id, x, z, targetScienceSiteId? |
| `PlannedRoute` | waypoint IDs/coordinates, creation from current rover pose |
| `RouteEstimate` | expectedBatteryEU, expectedMinutes, riskBand, uncertainty, warnings, assumptions |
| `DriveStepResult` | newPose, traveledMeters, timeDelta, energyDelta, terrain, hazards, nextMissionState |
| `MissionState` | mode/phase, missionId, roverPose, batteryEU, elapsedMinutes, loadout/inventory, scientific records, score/RC/outcome |

## Logic ownership
- **Hải / pure sim** owns deterministic movement integration, actual x/z terrain sampling, battery/time/risk calculations, science/RC and success rules.
- **Bảo / scene** presents current rover pose, planned route, effects and cameras; emits ground clicks/inputs (no direct resource mutation).
- **Duy / UI** owns Planning/Drive mode, focus-safe keyboard dispatch, scene/controller bindings, HUD, garage and report; coordinates shared types.
- **Sơn** owns sources & numeric terrain/module data, **Cường** owns mission/site/tutorial content and English copy.

## Proposed APIs (name/signature subject to typed implementation PR)
```ts
getInitialState(missionId): MissionState
previewRoute(state, route, missionData): RouteEstimate
stepDrive(state, input: DrivingInput, deltaSeconds, terrainData): DriveStepResult
performScienceAction(state, action, missionData): MissionState
evaluateMission(state, missionData): MissionEvaluation

MarsScene({ state, controlMode, plannedRoute, onWaypointClick, onDrivingInput })
```

**Absolute invariant:** Pressing START DRIVE switches modes and does **not** move the rover. Only player input advances it. Guidance is visual, non-binding and can be deviated from. Actual consumption depends on actual position. Preview uses same base rules but is an estimate. Pausing/replanning preserves physical pose. No teleport or double-drain.

## Operational invariants / tests
- W/S forward/reverse, A/D steering. Ignore gameplay WASD while entering text, viewing modal or planning; release input on blur. Clamp deltaTime/fix step for reproducibility.
- Sampling terrain from actual rover x/z; collision/terrain boundary and sensible stuck or rescue outcomes.
- Wheel tradeoffs and route choices change energy/time/risk. No 0% hazards promised.
- Solar charges only when stopped with enough light, time must pass. Battery bounded in [0,max].
- Mission garage only spares in deployed mass. SCAN uncertain, ANALYZE data, TRANSMIT rewards once.
- English-only player UI **including internal log messages used in screens** and ARIA labels.
- No literal NASA remote real-time control claim.
- Actual code changes must go through isolated reviewable PR after reading workstream branches.

[Master GDD](APOGEE_GDD.md) · [Implementation handoff](IMPLEMENTATION_HANDOFF.md).
