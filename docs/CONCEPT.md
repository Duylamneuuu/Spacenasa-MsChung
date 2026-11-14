# APOGEE — approved concept (14 November 2026)

> The old cutaway Mission Control / scripted choices / lunar orbiter concept is **superseded**. Read [the complete GDD](APOGEE_GDD.md).

## Elevator pitch

**Design a Mars rover. Plan a science expedition. Watch your engineering decisions come alive.** The rover travels in a Three.js isometric Mars map where hard plains, sand, sharp rocks, slopes and shadowed canyons change the safest and most energy-efficient route.

This is a **mission-design / trade-off simulator**, not a collectibles-selling game or a visual-novel choice menu.

## Distinctive mechanics

1. **Mission Select** — missions reuse one Mars map and emphasize different terrain trade-offs.
2. **Earth Hangar** — three wheel variants and a compact sensor/science loadout; budget + deployed-payload mass caps. Preloaded spares remain part of total mass.
3. **Route planning** — click one or more waypoints, optionally add science tasks, inspect estimated energy, time and risk, then **Execute**; rover animates continuously. No WASD primary loop, no tile-by-tile move button.
4. **Terrain Scanner** — investigate unknown terrain with imperfect information; a gameplay abstraction inspired by navigation cameras, not ground-penetrating radar claiming perfect detection.
5. **Battery + solar charging** — movement, scanning, sampling and transmission cost energy; stopping in light costs time but recharges. Darkness/shadow affects solar yield.
6. **Science Score + fictional RC** — analysis collects science data; **successful transmit** grants Research Credits; first discovery rewards only once.
7. **Lander Garage** — return to swap only spares carried in the deployed cargo; no orbital supply drops or on-site manufacturing.
8. **Debrief** — show science, energy, time, risk, chosen loadout and reasons, encouraging alternate routes and wheel builds.

## Terrain and wheel trade-off (game-balance draft, NOT NASA data)

| Wheel | Hard | Soft sand | Sharp rocks | Slope | Why use it? |
|---|---:|---:|---:|---:|---|
| W1 light | 0.80× | 1.80× | 1.60× | 1.40× | Quick, light; detours on easy terrain |
| W2 wide traction | 1.25× | 0.85× | 1.25× | 1.10× | Crosses sandy shortcuts |
| W3 reinforced | 1.15× | 1.30× | 0.75× | 1.00× | Survives rough, rocky routes |

**Formula draft:** MOVE_ENERGY = BASE_DISTANCE_COST × TERRAIN_FACTOR × WHEEL_FACTOR × LOAD_FACTOR; do not double-count slope. Distances and equipment mass are simulated separately from the creative tuning multipliers. None of the wheels has zero risk.

## One Mars map, multiple missions

| Mission | Goal | MVP? |
|---|---|---|
| 01 First Survey | Transmit analyses from two nearby science sites | **Required** |
| 02 The Dune Crossing | Collect data across sandy terrain; detour vs shortcut | **Required; main showcase** |
| 03 Into the Crater | Slopes, sharp rocks, limited sunlight | **Stretch only** |

**P0 environments:** hard, soft sand, sharp rocks. **P1:** slope/crater and shadowed canyon. Use one grid/graph + one isometric scene; do not create separate worlds.

## Core power loop

- Battery 0–100 **EU**; solar-only charging for MVP.
- MOVE, SCAN, ANALYZE, TRANSMIT consume EU; RECHARGE requires stopping in light with time advancing.
- Example **mock** tuning: MOVE baseline 5 EU per standard segment, SCAN 6, ANALYZE 12, TRANSMIT 6, recharge +8 EU / 10 minutes in good light; warn below 15 EU reserve. Values require game balance testing, not NASA citations.
- Risk/preview for unknown terrain must show uncertainty; safe-stop and replan on unplanned hazards.

## Restrictions / scientific framing

- **P0:** 3 wheels, 3 terrain types, 2 missions, route preview & Execute, battery/solar, basic scanner, science/credits, lander swap, report.
- **P1:** extra terrains, improved scanner, mission 03, polish / extra assets.
- **Cut:** rocket/launch selection, trajectories, Δv, physical landing model, WASD, endless farming, complex crafting/ISRU, orbital supply capsules, multiple planetary bodies, full suspension physics, large procedural maps and elaborate comms.
- **No fabricated NASA data.** Real sources with URLs/units/provenance belong in Sơn's source notes; balance data marked MOCK.

**User demo target:** a 3–5 minute playthrough showing **two plausible engineering solutions**, not one prescribed perfect strategy.

[Full GDD](APOGEE_GDD.md) · [Handoff](IMPLEMENTATION_HANDOFF.md) · [Data](CONTENT_DATA.md)
