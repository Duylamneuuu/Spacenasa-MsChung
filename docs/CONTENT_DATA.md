# Workstream 4 — Concept, Game Content & NASA Data

**Joint branch:** `feat/content-data` — **Sơn (HUST) + Cường (PTIT)**.

## Responsibility

### Sơn — NASA data & scientific validity
- Own `src/data/` and `docs/science/`.
- Select NASA/JPL mission reference sources; record citation link, units, values, limits and assumptions.
- Turn validated facts into small structured static datasets for Hải's deterministic simulation.
- Flag uncertain or simplified data. Do not claim physically validated spacecraft simulation.

### Cường — game idea & player-facing content
- Own `src/content/` and `docs/design/`.
- Define short pitch, mission narrative, player choices, consequences, event prompts and debrief explanations.
- Coordinate low-poly asset list and UI content with Bảo and Duy.
- Keep a 3–5 minute playable mission: no vast random events or endless colony mechanics.

### Duy — final product scope / contract decision
- Approves the final gameplay loop and shared types.
- Integrates authored content with UI and game demo.

### Hải — consume inputs, implement effects
- Imports content/data with stable IDs, but does not edit NASA numbers, source citations or narrative copy without review.

## Proposed minimal handoff (not validated data)

- `src/data/mission.ts`: one mission's objective, constraints, units, NASA source references.
- `src/data/modules.ts`: launcher/payload/power/comms choices with mass/cost/power values, provenance and status.
- `src/content/events.ts`: 2–3 events with event ID, narrative text, options and symbolic effect IDs. **Hải implements these effects in src/sim.**
- `src/content/copy.ts`: player briefing, tutorial, debrief labels.
- `docs/science/SOURCES.md`: citations, units, scientific assumptions, exact ways source data affect game calculations.
- `docs/design/FLOW.md`: short player flow and visual asset requirements.

Example event **schema idea** (not final): `{id, title, situation, choices: [{id, label, description, effectId}]}`.
Example NASA data provenance record: `{parameter, value, unit, url, accessedDate, interpretation, approximation}`. Don't fabricate NASA source data.

## Critical order
1. Agree with Duy + Hải on IDs and small schema; do not independently redesign shared types.
2. Give Hải **one** verified mission and a few module records; mock-only is acceptable for the initial UI wiring but not the final submission.
3. Give Duy + Bảo one mission briefing, one event and one simple visual reference.
4. Merge early so gameplay can be tested end to end.
5. Document at least one meaningful use of NASA or partner agency data, not mere attribution.

**Git:** Sơn and Cường share the branch but own different folders; pull before each work session and open a Draft PR to main as soon as there's a usable data slice.
