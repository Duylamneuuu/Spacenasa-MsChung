# APOGEE — Implementation handoff

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## What works now
- Title → Mission select → Earth Hangar → Preflight → Deploy → Mars operations → Debrief, full screen on desktop.
- Plan & Drive: waypoints and suggested routes, Battery/Time/Risk estimate, manual WASD driving with chase camera, compass, minimap, tactical map, Pause/Replan.
- Field science: Scan (Q), Analyze (F), Transmit (T), Recharge (R); Lander Garage with carried spares.
- Two missions; three wheels with real trade-offs; safety stop when grip is exceeded; success, partial and failure outcomes.
- Interactive tutorial; EN/VI language switch.
- 11 deterministic engine tests (`npm test`), production build, Vercel auto-deploy from `main`.

## Known gaps
- No touch controls; play on desktop with a keyboard.
- No final rover GLB yet; the adapter and spec are ready ([MODEL_IMPORT_SPEC](MODEL_IMPORT_SPEC.md)).
- The Debrief has no Estimate-vs-Actual table; compare the Route Plan estimate with the HUD during the demo.
- Mission 03, slopes and a dedicated shadow biome are not built.
- Garage swap is covered by engine tests but was not exercised end to end in a browser.

## How to change things safely
1. Branch from `main`; run `npm test` and `npm run build` before pushing.
2. Numbers: `src/data/expedition.ts`. Missions and sites: `src/content/expedition.ts`. Rules: `src/sim/expedition.ts` (add a test).
3. New player-facing text goes into both dictionaries in `src/i18n.ts`.
4. Play Mission 01 with the tutorial, and Mission 02 on both routes, in a browser before calling a change done.
5. Pushing to `main` redeploys production on Vercel.

[Interfaces](INTERFACES.md) · [Implementation notes](PLAN_DRIVE_IMPLEMENTATION.md) · [Demo & QA](design/DEMO_QA.md)
