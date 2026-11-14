# APOGEE — Mars Rover Architect

**NASA Space Apps Challenge 2026 · Team MS Chung**

> **Play now: https://apogee-mars-rover.vercel.app/** (built from `main`; desktop keyboard). English by default, Vietnamese via the **EN / VI** switch or `?lang=vi`.
>
> **Plan & Drive:** click waypoints to get a battery/time/risk estimate, press **Start drive**, then steer yourself with **W/S** and **A/D** (**Space** brakes). The route is guidance, not autopilot. Field actions: **Q** scan, **F** analyze, **T** transmit, **R** recharge, **M** tactical map, **H** tutorial, **Esc** pause. Mission 01 opens with a step-by-step tutorial.


> [!TIP]
> **Demo, verification, and NASA sources**
>
> - [Judge demo and acceptance checklist](docs/design/DEMO_QA.md) — 4-minute script and the current pass/fail list.
> - [NASA/JPL science references](docs/science/SOURCES.md) — primary sources and the line between science and gameplay balance.
> - [Implementation notes](docs/PLAN_DRIVE_IMPLEMENTATION.md) · [Code contracts](docs/INTERFACES.md) · [Rover model spec](docs/MODEL_IMPORT_SPEC.md)


## Play loop
**Start expedition → choose mission → Earth Hangar (wheels, scanner, instrument, storage, spares) → Preflight → Deploy → plan waypoints → Start drive → drive with WASD → park, scan, analyze, transmit → Report → try another loadout.**

| Mission | Target | Result when complete |
|---|---|---|
| 01 First Survey (tutorial) | Basalt Outcrop, Mineral Vein | 50 science / 20 RC |
| 02 The Dune Crossing | Sedimentary Cliff beyond the dunes | 60 science / 24 RC; north detour with light wheels or dune shortcut with wide wheels |

Mission 03 (Into the Crater) is not built.

## Code
The app is `src/App.tsx` → `src/ui/` (screens, HUD, tutorial) and `src/scene/ExpeditionScene.tsx` (3D), driven by the pure engine `src/sim/expedition.ts` with tests in `tests/`. Older prototype files (`MarsOpenWorld`, `OperationsView`, `src/types/game.ts`, `src/sim/engine.ts`) stay in Git for reference and are not imported.


## Documents
- [GDD (snapshot)](docs/APOGEE_GDD.md) · [Editable Google Doc](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit)
- [Master prompt for ChatGPT Work](docs/WORK_MASTER_PROMPT.md)
- [Gameplay concept](docs/CONCEPT.md) · [Code contracts](docs/INTERFACES.md)
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
| Duy | UI, integration, language; src/App.tsx, src/ui/, src/i18n.ts | feat/ui |
| Bảo | Three.js world and model; src/scene/ | feat/scene |
| Hải | Simulation and tests; src/sim/expedition.ts, tests/ | feat/simulation |
| Sơn | NASA sources / science numbers, src/data/ and docs/science/ | feat/content-data |
| Cường | Mission copy / tutorial / assets, src/content/ and docs/design/ | feat/content-data |

The two content/data contributors share a branch but not file ownership. All code changes via small PRs; do not force-push or rewrite someone else's commits.

**Science honesty:** Research Credits, energy EU and wheel multipliers are game-balance abstractions, not measured NASA data. NASA sources must include URL, units and precisely how a real value affects the simulation. WASD is a teaching abstraction, not a claim that NASA live-drives Mars rovers from Earth.
