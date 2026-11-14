# APOGEE — Science data and mission content

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## Sơn — data (`src/data/expedition.ts`, `docs/science/`)
- Map: 15 × 11 cells of 4.4 m; terrain `hard`, `sand` or `rock` from `terrainAt()`; colour and risk per terrain in `TERRAIN`.
- Wheels in `WHEELS` (energy and risk multipliers per terrain); module mass and cost in `MODULES`.
- Battery 100 EU, reserve 15 EU, garage swap 4 RC / 4 min, lander 124 kg, support 22 kg, rover base 76 kg.
- These are game balance. The only NASA value used in a rule is the 24.6-hour sol in `sunlight()`. Sources and limits: [SOURCES](science/SOURCES.md).

## Cường — content (`src/content/expedition.ts`, `src/i18n.ts`)
- `first-survey`: Basalt Outcrop (20 science / 8 RC) and Mineral Vein (30 / 12); 90 min, 132 BU, 322 kg.
- `dune-crossing`: Sedimentary Cliff (60 / 24); 106 min, 146 BU, 337 kg. `DUNE_NORTH` is the firm-ground detour; the shortcut is one waypoint at the cliff.
- Names, briefs, tutorial steps and every on-screen string live in `src/i18n.ts` in English and Vietnamese. Keep IDs stable; translate display text only.

## Rules to keep
- The scanner narrows estimates, never certainty. RC once per transmitted sample. Solar only while parked in light. Spares count toward mass.
- No rockets, orbital supply, ISRU or other planets.
