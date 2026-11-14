# APOGEE — Mars Rover Architect

**NASA Space Apps Challenge 2026 · Team MS Chung**  
**Game:** browser-based 2.5D / isometric, Three.js + React + TypeScript.

> **LOCKED CONCEPT (14 Nov 2026):** Design and operate a Mars science rover. **One Mars map, different environments, multiple science missions.** Configure your rover, plan a route, preview its energy/time/risk, press Execute to watch it drive, collect and transmit science data, and learn the engineering trade-offs.

## Where to start

1. **[Full approved GDD](docs/APOGEE_GDD.md)** — source-of-truth snapshot from [the editable Google Doc](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit)
2. **[Concept / MVP boundaries](docs/CONCEPT.md)**
3. **[Implementation handoff + dependencies](docs/IMPLEMENTATION_HANDOFF.md)**
4. **[Shared interface proposal](docs/INTERFACES.md)** — coordinate changes with Duy before coding
5. **[Team plan](docs/TEAM_PLAN.md)** · **[Content + science data handoff](docs/CONTENT_DATA.md)** · **[Collaboration](docs/COLLABORATION.md)**

[Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [Pull Requests](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)

## Core play loop

**Select Mission → Configure Rover & cargo on Earth → Preflight budget/mass → Deploy → Click waypoints + science tasks → Preview energy/time/risk → Execute route in 3D → Scan / Analyze / Transmit → Research Credits → Return to lander for preloaded spare modules → Debrief / Next Mission.**

### What makes this a mission-design game?

- Preflight balances **total deployed mass, budget and mission equipment**. Lander + installed rover modules + spare modules all count toward payload mass.
- **Three wheel types** have different costs on hard ground, soft sand, sharp rocks and slopes. A short route can be worse than a longer detour.
- Battery discharges through operations; **solar charging requires daylight and time spent stopped**. No energy pickups.
- Scanner reveals terrain and estimated hazards; it is **not a perfect underground radar**.
- **Science Score** measures scientific progress; **Research Credits (RC)** are explicitly *fictional gameplay progression* granted when science data is successfully transmitted, not NASA funding.
- Lander garage can swap **only spares launched with the mission**. No instant orbital deliveries.

### Missions, one shared Mars map

| Priority | Mission | Core problem |
|---|---|---|
| **P0** | **01 — First Survey** | Learn waypoint planning, scanner, battery, sample analysis and transmission |
| **P0** | **02 — The Dune Crossing** | Choose between short sandy route and longer safer detour with different wheels |
| **P1/stretch** | **03 — Into the Crater** | Slopes, sharp rocks, shadow and return-energy planning |

**No** playable rocket/launcher selection, orbit/delta-v calculator, multiple planets, WASD primary controls, complex ISRU crafting, supply pods or open-world driving in MVP.

## Development / current status

```bash
npm install
npm run dev
npm run build
```

**Node.js 20+**. Stack: Vite, React, TypeScript, Three.js / React Three Fiber. No backend or login required for MVP.

**IMPORTANT:** The checked-in app/scene/simulation are currently **pre-APOGEE integration scaffolds**, with old Mission Control placeholder visuals and mocked values. **This documentation update does not implement the rover game.** Build the GDD in the four workstreams and integrate incrementally. Do not mistake the scaffold for flight-validated NASA engineering.

## Ownership — five people, four branches

| Owner | Workstream / branch | Paths |
|---|---|---|
| **Duy** | UI, integrator · feat/ui | src/App.tsx, src/ui/, src/styles.css; shared contracts and integration |
| **Bảo** | 3D / scene · feat/scene | src/scene/, public/assets/3d/ |
| **Hải** | Pure simulation · feat/simulation | src/sim/, tests; consumes data, does not own it |
| **Sơn** | NASA science/data · feat/content-data | src/data/, docs/science/ |
| **Cường** | Game design/content · feat/content-data | src/content/, docs/design/, public/assets/ui/ |

All changes via PR; **Duy coordinates changes to src/types/game.ts**, package.json and app entrypoints. Sơn and Cường share a branch but **do not edit the same files**.

## Scientific integrity

Power EU, wheel coefficients, costs in credits and win thresholds are **educational balance values, not measured NASA figures**. Real NASA/JPL numbers must include primary source URLs, units, provenance, assumptions and an explanation of how they influence gameplay. Do not imply NASA endorsement.

Official challenge and sources: https://www.spaceappschallenge.org/2026/ — see GDD section 14 for research references.
