# APOGEE — Science & English-language mission content (Plan & Drive)

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


**Shared branch:** feat/content-data. **Distinct owners:** Sơn handles src/data/ and docs/science/; Cường handles src/content/, docs/design/ and public/assets/ui/.

## Sơn / science and data
- Terrain physics categories for one Mars world: hard plain, soft sand, sharp rocks (P0); slope/shadow P1.
- Wheel records: light, wide traction, reinforced; budget/mass, terrain efficiency, hazard/traction factors. Label any guessed factors **GAME BALANCE — NOT NASA DATA**.
- Actual rover speed/terrain/electricity integration assumptions, solar charge illumination, time, scanner uncertainty.
- Provenance in docs/science/SOURCES.md: NASA/JPL URL, date, physical units, assumptions, exact code usage. A real sourced value must genuinely influence a rule, rather than being merely cited.
- Explain operator-driven WASD as educational abstraction; NASA Mars rovers aren't driven like live video games from Earth.

## Cường / player-facing content
**100% ENGLISH** mission names, objectives, tutorials, scanner readouts, prompts, help text, science facts, debrief and visual asset captions. Audit all dynamic strings and logs, not only React JSX.

- **First Survey (P0)**: interactive tutorial to choose waypoints, Start Drive, W/S/A/D, park, scanner, analyze and transmit.
- **The Dune Crossing (P0 showcase)**: one map, alternate short soft-sand route and longer hard/rock detour. Create at least two winning strategies across wheel builds. Explain plan-estimate-vs-actual difference.
- **Into the Crater (P1)**: slope, rugged rock and shadow gameplay.
- Stable mission IDs, site radius and coordinates, rewards once per transmitted unique discovery, science score and fictional RC copy.
- One rover model with three visible wheel variants, scan FX, lander/garage and low-poly Mars world. Provide original/licensed asset list.

## Shared integration handoff
- Sơn and Cường agree site IDs/terrain schema with Duy/Hải, no duplicate content logic.
- The planner estimates based on map/path data; actual WASD travel uses current x/z/terrain in the engine. No invisible forced route.
- Solar only charges while stopped under enough light; science interaction only near correct site.
- No rockets, orbital supply, ISRU crafting or multiple planets in MVP.

[Master GDD](APOGEE_GDD.md) · [Interfaces](INTERFACES.md).
