# APOGEE — Code contracts (as implemented)

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## Ownership of state
One pure TypeScript module owns every resource: **`src/sim/expedition.ts`**. The scene only draws state; the UI only displays state and sends actions. Nothing in React or Three.js changes battery, time or position directly.

## Types — `src/types/expedition.ts`
| Type | Meaning |
|---|---|
| `MissionId` | `first-survey` or `dune-crossing` |
| `TerrainKind` | `hard`, `sand` or `rock` |
| `WheelId`, `ScannerId`, `InstrumentId`, `StorageId`, `ModuleId` | Module catalogue keys |
| `Cell` / `Waypoint` | `{ x, z }` in map cells (one cell = 4.4 m) |
| `ControlMode` | `planning`, `driving` or `paused` |
| `DrivingInput` | Held keys: `forward`, `reverse`, `left`, `right`, `brake` |
| `RoverPose` | `heading` (radians, +Z forward) and `speed` (m/s); position is `MissionState.position` |
| `StationaryAction` | `scan`, `analyze(site)`, `transmit`, `recharge(10 or 20 min)` |
| `Loadout` | Installed wheel, scanner, instrument and storage, plus `spares` |
| `MissionState` | Position, pose, battery, elapsed, surveyed cells, pending and delivered samples, science, credits, energy used and charged, distance, energy by terrain, safety stops, trace, reason, outcome |
| `PlanPreview` (= `RouteEstimate`) | Per-step risk and uncertainty, energy and minutes as `[low, high]`, overall risk band, warnings, blocked reason |
| `DriveStepResult` | Next state, sampled terrain, distance moved, `stopped` flag |

## Engine API — `src/sim/expedition.ts`
```ts
getInitialState(missionId, loadout): MissionState
payload(loadout); preflight(missionId, loadout): string[]
previewRoute(state, route): PlanPreview
stepDrive(state, input, seconds): DriveStepResult   // fixed step DRIVE_STEP = 1/60 s
haltDrive(state): MissionState
performScienceAction(state, action): MissionState
garageStatus(state, moduleId); swapAtLander(state, moduleId)
evaluateMission(state): 'success' | 'partial' | 'failure'
siteAt(cell); sunlight(cell, elapsed); terrainEstimate(state, cell)
```

## Scene — `src/scene/ExpeditionScene.tsx`
```tsx
<ExpeditionScene state preview waypoints mode effect onPick />
<HangarScene loadout />
```
Planning uses an overhead perspective camera; driving and paused modes use a chase camera. Ground clicks call `onPick` only while planning. `RoverModel` renders the procedural rover, or a GLB configured in `src/scene/roverAsset.ts` (see [MODEL_IMPORT_SPEC](MODEL_IMPORT_SPEC.md)).

## UI and language
- `src/App.tsx`: stages (title → select → hangar → preflight → deploy → operations → report), fixed-step drive loop, held keys, release on blur.
- `src/ui/ExpeditionOperations.tsx`: HUD, route planner, field actions, tactical map, garage, tutorial.
- `src/ui/ExpeditionUI.tsx`: mission select, hangar, preflight, debrief, language switch.
- `src/i18n.ts`: every player-facing key in English and Vietnamese; `tm()` translates engine messages.

## Invariants (tested in `tests/expedition.test.cjs`)
- Start Drive switches mode only; the rover moves only with input. Same inputs and step give the same result.
- Actual cost comes from terrain at the rover's real position; the estimate never charges in advance.
- Solar charges only while stopped with enough light; battery stays within 0–100 EU.
- Analyze requires parking near the site; RC is granted once per transmitted sample.
- The garage installs only carried spares; spares count toward deployed mass.

Legacy files (`src/types/game.ts`, `src/sim/engine.ts`, `src/sim/roverEngine.ts`, `src/scene/MarsOpenWorld.tsx`, `src/ui/OperationsView.tsx` and related) remain for reference and are not imported by the app.
