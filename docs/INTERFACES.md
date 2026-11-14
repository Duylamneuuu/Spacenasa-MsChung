# APOGEE — proposed interfaces v1 (not yet implemented)

> **Critical:** The code under src/types/game.ts, src/sim/engine.ts and src/scene/MissionScene.tsx still describes the **legacy scaffold**, not the types below. Duy must coordinate a typed migration before Bảo/Hải write dependent imports. Do not blindly treat this document as executable code.

## Ownership of the contract

- **Sơn**: input datasets and provenance (src/data/). No runtime rules.
- **Cường**: mission objectives, learning text and sites (src/content/). No physics.
- **Hải**: pure TypeScript preview and execution (src/sim/). No React/Three.js.
- **Bảo**: 3D Mars map and rover animation (src/scene/). No energy/resource mutations.
- **Duy**: shared src/types/game.ts and UI/controller integration.

## Canonical conceptual entities (target)

| Entity | Required fields | Owner |
|---|---|---|
| MissionConfig | missionId, target site IDs, budget limit, mass cap, time limit, selected terrain/graph, reward policy | Sơn numeric input + Cường objectives |
| TerrainTile | id, position, terrain kind, elevation/slope, sunlight factor, discovered flag | Sơn input |
| WheelConfig | id (light / wide / reinforced), massKg, costCredits, terrain multipliers, risk factors | Sơn game balance, reviewed by Hải |
| RoverLoadout | installed IDs, spare IDs, base mass, battery capacity, scanner ID | Duy/ Hải with data from Sơn |
| MissionState | phase, mission ID, rover position, batteryEU, elapsedMinutes, discovered terrain, stored science results, delivered science, scienceScore, researchCredits, selected loadout, outcome | Duy shared types |
| Waypoint | x, z or tile ID, stable position, optional site reference | Bảo emits, Hải consumes |
| PlannedAction | MOVE(waypoint), SCAN, ANALYZE(siteId), TRANSMIT | Duy defines; Hải processes |
| PlanPreview | estimatedEnergyEU, estimatedMinutes, riskBand, uncertainty, warnings, feasible | Hải |
| ExecuteResult | next MissionState, ordered movement/scan/transmit events, stopReason, errors | Hải, consumed by Bảo + Duy |

**No WASD, no instant-click movement** in primary gameplay. A plan contains clicked waypoints and optional science actions; the Execute button triggers a deterministic simulation and Bảo animates the resulting ordered events. Logic may work on a grid/graph while the scene interpolates continuous 3D movement.

## Target API (to implement in the first integration PR)

    getInitialState(missionId): MissionState
    previewPlan(state, plannedActions, missionData): PlanPreview
    executePlan(state, plannedActions, missionData): ExecuteResult
    evaluateMission(state, missionData): MissionEvaluation

    MissionScene({ state, plannedRoute, executionEvents, onWaypointClick, onSiteClick })

The above are **interface shapes**, not presently exported functions. Duy owns names, final TypeScript signatures and any compatibility adapter to the old scaffold. Keep UI and 3D working with mock data until the new contract lands.

## Rules not to violate

1. **Total deployed payload mass** includes lander, installed rover modules, spare modules and support equipment. Inventory isn't free.
2. **Power**: single battery scale (EU); solar recovery consumes minutes and depends on light. Source-data physical units and game EU are distinguished.
3. **Route cost**: BASE_DISTANCE_COST × TERRAIN_FACTOR × WHEEL_FACTOR × LOAD_FACTOR. Avoid slope factor duplication; handle each traversed segment. Unknown paths produce estimates/ranges, not perfect foresight.
4. **Three wheel IDs**: light, wide and reinforced. Game-balance coefficients are in [CONCEPT.md](CONCEPT.md), not NASA measurements.
5. **Scanner**: discloses nearby terrain/hazard estimates; cannot reveal 100% of hidden hazards. Not the same as RIMFAX underground geologic radar.
6. **Science/RC**: ANALYZE stores data; only TRANSMIT converts eligible new transmitted discoveries to fictional RC. Science Score is cumulative and not depleted by upgrades.
7. **Garage**: change module only at lander and only if spare is in inventory. RC gates upgrades but is not physical supply from Earth.
8. **Success**: required science returned within time and functioning rover; partial and failure paths must be explainable and reproducible.
9. **Content IDs**: never key rules by display string or translated text. Use stable mission/site/module identifiers and schemas.
10. **Tests**: same initial state + same actions + same map = same result. No unseeded hidden randomness.

## Migration order

1. Duy approves shared ID conventions, type definitions and this contract; commits src/types/game.ts.
2. Hải implements pure engine functions with mocks; Bảo adapts scene props to typed callbacks; Sơn/Cường supply data and copy.
3. Duy wires into src/App.tsx and checks build, two-route demo and critical failure path.
4. Replace placeholders with reviewed NASA references and label simulation approximations.

For the exact approved game loop and scope see [APOGEE GDD](APOGEE_GDD.md).
