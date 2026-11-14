# APOGEE — Gameplay Concept v2 (Plan & Drive)

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Why this design
Players design a Mars rover under budget and mass limits, then choose routes between real educational science objectives. Their plan sets expectations; their **hands-on driving** produces consequences. This combines mission engineering trade-offs with enjoyable game feel.

## Two control modes
- **PLANNING MODE**: orthographic/isometric tactical map. Click waypoints, Undo/Clear, select target sites. Estimated battery/time/risk and known/unknown hazards appear. Choose sandy shortcut or long rocky detour.
- **DRIVING MODE**: press **START DRIVE**, follow the 3D highlighted route with manual W/S forward/reverse and A/D steering. Third-person rover camera, optional minimap, live actual telemetry. Rover never auto-navigates. Pause/Replan can rebuild the route from the current rover position.

The estimate assumes a route; manual deviations or varying speed change actual time, exposure, energy and risk. Planned costs must not be charged upfront.

## Systems
- **Mars environments on one map**: hard rock, soft sand, sharp rocks (P0); slope/crater and shadow (P1).
- **Three wheels**: light (hard efficient), wide traction (sand efficient), reinforced (rock durable). Each has cost and mass trade-offs; no universal best wheel.
- **Battery/solar**: driving and science use energy. Charging takes time and requires stopping in sunlight. No energy pickups.
- **Terrain Scanner**: partial and uncertain nav hazard information, not perfect GPR.
- **Science Score & fictional Research Credits**: only newly transmitted discoveries award RC, once per site. RC unlocks modules already carried.
- **Lander Garage**: swap only preloaded modules; payload mass includes spares, rover, lander and support.
- **Outcomes**: Full, Partial, Failure. Show planned-vs-actual telemetry and explain what choices mattered.

## Missions / priority
| Mission | Role | Priority |
|---|---|---|
| 01 First Survey | Tutorial for Plan → Drive, sample, scan, solar and transmit | P0 |
| 02 The Dune Crossing | Sand shortcut vs hard detour, at least two winning approaches | P0 showcase |
| 03 Into the Crater | Slope/rock/shadow resources | P1 |

## Initial educational balance, not NASA measurements
| Wheels | Hard | Sand | Sharp rocks | Slope |
|---|---:|---:|---:|---:|
| Light | 0.80× | 1.80× | 1.60× | 1.40× |
| Wide traction | 1.25× | 0.85× | 1.25× | 1.10× |
| Reinforced | 1.15× | 1.30× | 0.75× | 1.00× |

Route estimate = sum of segment distance × terrain/wheel/load factors; actual energy = integrated distance traveled through sampled terrain with the same central cost model. Avoid slope double count, frame-rate-based drains or dual physics ownership.

**All gameplay text is in English.** Developer docs may be bilingual. Explain that direct WASD control is a pedagogical interface, not instantaneous Earth-to-Mars joystick control.

**Cut:** rockets/orbits/delta-v, multi-planet content, scripted quiz-choice core, autopilot Plan & Execute, ISRU crafting, supply pods, open-world sprawl and heavyweight vehicle physics.

[Approved GDD](APOGEE_GDD.md) · [Interfaces](INTERFACES.md) · [Work prompt](WORK_MASTER_PROMPT.md).
