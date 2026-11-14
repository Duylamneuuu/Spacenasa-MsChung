# APOGEE — Mars Rover Architect

**NASA Space Apps Challenge 2026 · Team MS Chung**

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Play loop
**Choose Mission → Design Rover → Preflight budget/mass → Planning Mode (click waypoints + preview) → START DRIVE → WASD manual driving along the route guide → Park to Scan/Analyze/Transmit → Science Score / Research Credits → Lander Garage → Debrief / Retry.**

The route is a **visual guide and tactical forecast**; it is NOT autopilot. Actual battery/time/risk depend on the terrain traversed during manual driving, and may differ from the estimate.

**P0:** One Mars map with hard plain, sand and rock terrain; 3 wheel configurations; two missions (First Survey, The Dune Crossing); battery/solar, scanner, science, RC, lander and reports. **P1:** slopes/shadows and Into the Crater.

## Current engineering status
A recent implementation has `src/scene/MarsOpenWorld.tsx`, `src/scene/Mars3DRover.tsx`, `src/ui/OperationsView.tsx` and `src/sim/roverEngine.ts`; it already contains WASD handling. **This does not mean Plan & Drive or full-English compliance is complete.** The planner/waypoint guidance, state unification, retired rocket/ISRU paths, English logs and gameplay acceptance tests must be audited and completed. Do not discard good work or overwrite teammate branches.

## Documents
- [Approved complete GDD (v2)](docs/APOGEE_GDD.md) · [Editable Google Doc](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit)
- [Master prompt for ChatGPT Work](docs/WORK_MASTER_PROMPT.md)
- [Gameplay concept](docs/CONCEPT.md) · [Interface migration](docs/INTERFACES.md)
- [Implementation handoff](docs/IMPLEMENTATION_HANDOFF.md) · [Team plan](docs/TEAM_PLAN.md)
- [Content + NASA data](docs/CONTENT_DATA.md) · [Collaboration](docs/COLLABORATION.md)

[Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [PRs](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)

## Build
```bash
npm install
npm run dev
npm run build
```

Stack: React, TypeScript, Vite, Three.js / React Three Fiber. No required backend. Run browser tests for keyboard input; a successful TypeScript build alone cannot verify game feel.

## Five people, four workstreams
| Member | Owner area | Branch |
|---|---|---|
| Duy | UI, integration, shared types; src/App.tsx, src/ui/, styles | feat/ui |
| Bảo | Three.js world and model; src/scene/ | feat/scene |
| Hải | Pure gameplay simulation and tests; src/sim/ | feat/simulation |
| Sơn | NASA sources / science numbers, src/data/ and docs/science/ | feat/content-data |
| Cường | Mission copy / tutorial / assets, src/content/ and docs/design/ | feat/content-data |

The two content/data contributors share a branch but not file ownership. All code changes via small PRs; do not force-push or rewrite someone else's commits.

**Science honesty:** Research Credits, energy EU and wheel multipliers are game-balance abstractions, not measured NASA data. NASA sources must include URL, units and precisely how a real value affects the simulation. WASD is a teaching abstraction, not a claim that NASA live-drives Mars rovers from Earth.
