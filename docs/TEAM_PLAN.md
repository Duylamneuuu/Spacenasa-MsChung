# Team MS Chung — APOGEE plan (14–15 Nov 2026)

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## Owners
| Member | Area | Files |
|---|---|---|
| Duy | UI, integration, release | `src/App.tsx`, `src/ui/`, `src/i18n.ts` |
| Bảo | 3D scene and rover model | `src/scene/`, `public/assets/3d/` |
| Hải | Simulation and tests | `src/sim/expedition.ts`, `tests/` |
| Sơn | Science sources and balance data | `src/data/expedition.ts`, `docs/science/` |
| Cường | Missions, copy, tutorial, pitch | `src/content/expedition.ts`, `docs/design/` |

## Done (P0)
Plan & Drive loop, two missions, three wheels, battery and solar, scanner, science and RC, garage, preflight, debrief, tutorial, EN/VI, full-screen 3D, live deployment.

## Next, in order
1. Final rover GLB, dropped into `public/assets/3d/rover/` per the [import spec](MODEL_IMPORT_SPEC.md).
2. Demo rehearsal with [DEMO_QA](design/DEMO_QA.md) on the live URL.
3. Optional: Estimate-vs-Actual table in the Debrief, touch controls, Mission 03.

**Out:** rockets and Δv, autopilot, other planets, ISRU crafting, supply pods, rigid-body physics.

[GDD](APOGEE_GDD.md) · [Handoff](IMPLEMENTATION_HANDOFF.md)
