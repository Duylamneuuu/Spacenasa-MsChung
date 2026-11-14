# APOGEE — Content / mission design / NASA science handoff

**Fourth workstream:** Sơn (NASA data) + Cường (mission design), **joint branch feat/content-data**. Never overwrite one another's folders.

## Sơn — source-backed science and static numeric inputs

Own **src/data/** and **docs/science/**. Supply:
- One shared Mars environment grid/graph: terrain categories **hard plain, soft sand, sharp rock** (P0) and **slope, shadow canyon** (P1), with elevation/illumination attributes if used.
- Three wheel records **light / wide / reinforced**, with mass and budget costs, environment coefficients, hazard factors. Every coefficient must say **MOCK GAME BALANCE** until scientifically tested; no fabricated NASA measurements.
- Mission and preflight constraints: budget, payload cap including rover+lander+installed+spares+support, solar/battery rules, science instrument and sensor metadata.
- A **sources table** in docs/science/SOURCES.md: parameter, NASA/partner URL, access date, physical units, scientific meaning, interpretation, limitation and code location in which it actually changes a rule.
- Review whether nav cameras vs geological GPR radar are described accurately; do not claim a scanner detects all hidden caking sand or geological targets with certainty.
- Explain why the prototype is educational, not aerospace-flight validated.

**Expected proposed files:** src/data/terrain.ts, src/data/wheels.ts, src/data/mission-constraints.ts, docs/science/SOURCES.md. Coordinates and schemas require agreement with Duy + Hải first.

## Cường — gameplay, missions, UX copy and presentation

Own **src/content/**, **docs/design/** and **public/assets/ui/**.
- **Mission 01 — First Survey:** nearby science sites, introduce route planning, scanning, transmit and battery.
- **Mission 02 — The Dune Crossing:** a science site beyond a soft-sand belt; alternate shorter sandy route and longer hard-ground route, with multiple ways to win.
- **Mission 03 — Into the Crater (P1 only):** slope/sharp-rock/shadow trade-offs.
- Define site coordinates and stable IDs, goal conditions, reward tiers, tutorials, success/failure copy and at least two example viable rover strategies.
- Build an asset list focusing on rover body + **3 wheel variants**, primitive rocks, terrain surfaces, scanner FX and lander garage; use original or properly licensed assets.
- 3–5 minute demo script proving a route/loadout trade-off. Do not design scripted choose-A-or-B crises as the primary gameplay.

**Expected proposed files:** src/content/missions.ts, src/content/sites.ts, src/content/copy.ts, docs/design/FLOW.md, docs/design/ASSET_LIST.md.

## What to share with Hải and Duy first

1. Mission IDs and target-science-site IDs that are **the same in content and data**.
2. 3 terrain categories, a tiny test map with **two possible routes** to one sample, 3 wheel records and explicit solar assumptions.
3. One science reward definition: data acquired by ANALYZE, delivered by TRANSMIT, RC granted once to avoid farming.
4. One design example where light wheels choose detour and wide wheels choose sandy shortcut.

## Scientific/gameplay boundaries

- **Research Credits are fictional progression**, not NASA paying for rocks.
- No ISRU crafting, orbital supply pods, or multiple planetary bodies in MVP.
- Ground-penetrating radar (e.g. RIMFAX) is scientific subsurface sounding, not the default navigation hazard scanner.
- Solar charges with illumination and time; no magic recharging on a special hill tile.
- Spare payload contributes to the spacecraft's total deployed mass; only loaded inventory can be swapped at lander.
- If actual NASA values have not yet been verified, record them as TODO and label prototype values MOCK, rather than inventing a citation.

References: [full GDD](APOGEE_GDD.md), [interfaces](INTERFACES.md), [implementation handoff](IMPLEMENTATION_HANDOFF.md).
