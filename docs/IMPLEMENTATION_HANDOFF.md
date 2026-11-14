# APOGEE — integration handoff for the four workstreams

**Status:** Implementation instructions for the [agreed GDD](APOGEE_GDD.md). The repository's existing React app and Three.js scene remain **legacy placeholders** until contributors implement the rover game.

## Golden path (the first shared vertical slice)

1. Duy ships **Mission 02 title + a Planning/Execute UI** using mock state.
2. Bảo ships **one Mars terrain with 2 clear routes, a rover and clickable waypoints**.
3. Hải ships **pure route preview + deterministic execute** with battery/time costs and 2 wheel variants at first; expand to 3 variants after integration.
4. Sơn ships **terrain/wheel rule records and source notes**, marking MOCK vs NASA-supported.
5. Cường ships **Mission 01/02 objectives, tutorial text, 3 science sites and a low-poly prop list**.
6. Duy wires route preview → Execute → animated rover → results; re-check npm run build **before** extras.

Once the slice runs, add the 3rd wheel, garage/spares, research credits and second mission fully. Do **not** wait for perfect artwork or the entire NASA dataset to integrate.

## P0 file contracts (proposals; freeze together)

| Owner | Path | Required export / contract |
|---|---|---|
| Duy | src/types/game.ts | MissionState, MissionConfig, TerrainKind, WheelId, Waypoint, PlannedAction, preview and execute result types |
| Duy | src/App.tsx / src/ui/ | State controller, mission setup, loadout, route planner, energy/time/risk HUD, execute controls, garage and report |
| Bảo | src/scene/MissionScene.tsx | <MissionScene state onWaypointClick onSiteClick> rendering only, no energy/math mutations |
| Hải | src/sim/ | getInitialState(missionId), previewPlan(state, plan), executePlan(state, plan), evaluateMission(state), plus tests |
| Sơn | src/data/ | Mission terrain graph, wheel balance data, module costs/masses/solar rules, provenance and uncertainty |
| Cường | src/content/ | Mission 01/02/03 definitions, science sites, tutorial, goal/score text, results copy |

**Contract rule:** there must be a single authoritative source for energy/time/mass calculations (Hải's simulation). UI reads computed preview; Bảo animates returned movement events. **Nothing in scene changes mission resources.** Editing shared types requires agreement with Duy.

## Behavioral acceptance / edge cases

- Choosing a **short sandy route** vs a **long hard-terrain detour** gives different previews and different outcomes.
- W1 vs W2 vs W3 makes measurable differences for one fixed route; at least two different routes can succeed.
- Preflight mass includes lander, installed modules and spare modules.
- Sim preview/execute use the same deterministic cost function; prevent negative or over-capacity battery via explicit failure/stop behavior.
- An unknown segment has an uncertain preview; SCAN reveals more information, not magical perfect knowledge.
- Solar recharge consumes **time**, requires adequate illumination and never exceeds battery capacity.
- Analyze creates data to transmit. **RC is granted once per unique successfully transmitted science discovery**, not each time the same tile is scanned.
- Swaps only at lander and only from on-board spare inventory; carrying spares increases deployed mass.
- Execute has an unambiguous termination, safe stop or failure with a clear message; Reset/retry works.
- Simulation never imports React/Three.js. Rendering uses stable, typed callbacks. No silent random effects.
- A production build succeeds and the demo is playable by someone unfamiliar with the project.

## Demo sequence (3–5 min)

**Mission 02 The Dune Crossing:** design light rover → inspect sandy shortcut and hard-ground detour → preview energy/time/risk → scan → pick a route → Execute → analyze a site → transmit data → receive Science Score / RC → debrief → show another wheel's different trade-off.

## Team branches / no-conflict policy

- Duy: feat/ui; Bảo: feat/scene; Hải: feat/simulation; Sơn+Cường: feat/content-data but distinct folders.
- Start from the refreshed branches, pull first and make small PRs into main.
- Ship mock contracts with strong labels as needed for early integration; science lead substitutes verified values before the final submission.
- Existing src/types/game.ts, src/sim/engine.ts, src/scene/MissionScene.tsx are **old wiring scaffolds**, not yet the new APIs described here. Duy should land a typed contract PR first so teammates do not build incompatible versions.

## Project links

- [Master GDD](APOGEE_GDD.md) · [Concept](CONCEPT.md) · [Team plan](TEAM_PLAN.md) · [Science/content handoff](CONTENT_DATA.md)
- [Shared Google Doc](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit)
