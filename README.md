# APOGEE — Mars Rover Architect

**NASA Space Apps Challenge 2026 · Team MS Chung**

> **Play now: https://apogee-mars-rover.vercel.app/** (built from `main`; desktop keyboard). English by default, Vietnamese via the **EN / VI** switch or `?lang=vi`.
>
> **Plan & Drive:** click waypoints to get a battery/time/risk estimate, press **Start drive**, then steer yourself with **W/S** and **A/D** (**Space** brakes). The route is guidance, not autopilot. Field actions: **Q** scan, **F** analyze, **T** transmit, **R** recharge, **M** tactical map, **H** tutorial, **Esc** pause. Mission 01 opens with a step-by-step tutorial.


> [!TIP]
> **Demo, verification, and NASA sources**
>
> - [Judge demo and acceptance checklist](docs/design/DEMO_QA.md) — two routes through Mission 02, with results tied to the tested build.
> - [NASA/JPL science references](docs/science/SOURCES.md) — primary sources and the line between science and gameplay balance.
> - [Playable build PR #7](https://github.com/Duylamneuuu/Spacenasa-MsChung/pull/7) · [Browser screenshots](https://github.com/Duylamneuuu/Spacenasa-MsChung/tree/58206fc16292dbafd2bc0b1f1c9092bf0c5ea390/docs/evidence) · [Node 20 CI](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions/runs/43576039325/job/132390394596)


## Play loop
**Choose Mission → Design Rover → Preflight budget/mass → Planning Mode (click waypoints + preview) → START DRIVE → WASD manual driving along the route guide → Park to Scan/Analyze/Transmit → Science Score / Research Credits → Lander Garage → Debrief / Retry.**

The route is a **visual guide and tactical forecast**; it is NOT autopilot. Actual battery/time/risk depend on the terrain traversed during manual driving, and may differ from the estimate.

**P0:** One Mars map with hard plain, sand and rock terrain; 3 wheel configurations; two missions (First Survey, The Dune Crossing); battery/solar, scanner, science, RC, lander and reports. **P1:** slopes/shadows and Into the Crater.

## Current engineering status
The active application uses a shared Mars scene and fixed-step TypeScript simulation. The older exploratory prototype remains in Git for reference and is outside the active app import tree.

## Documents
- [Approved complete GDD (v2)](docs/APOGEE_GDD.md) · [Editable Google Doc](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit)
- [Master prompt for ChatGPT Work](docs/WORK_MASTER_PROMPT.md)
- [Gameplay concept](docs/CONCEPT.md) · [Interface migration](docs/INTERFACES.md)
- [Implementation handoff](docs/IMPLEMENTATION_HANDOFF.md) · [Team plan](docs/TEAM_PLAN.md)
- [Content + NASA data](docs/CONTENT_DATA.md) · [Collaboration](docs/COLLABORATION.md)

[Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [PRs](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)

## Build
```bash
npm ci
npm run dev
npm test
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

## Playable integration branch

See [implementation handoff](docs/PLAN_DRIVE_IMPLEMENTATION.md) for the live
contracts and [model import spec](docs/MODEL_IMPORT_SPEC.md) for replacing the rover.
Select a mission, prepare a loadout, deploy, and click the surface or choose a
route preset. Start Drive enables manual W/S and A/D control. Space brakes.
The route is a guide; the actual drive determines battery and time used.

[NASA's Mars Facts](https://science.nasa.gov/mars/facts/) gives a Mars day of
about 24.6 hours. The game uses that period only for its simplified sinusoidal
daylight curve. Sector illumination, solar charge rate, wheel performance,
cost, and timing are educational balance values. Manual driving is an
operator-control abstraction for learning rover trade-offs.
