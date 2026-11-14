# APOGEE — Gameplay Concept (Plan & Drive)

> **Status — 14 Nov 2026:** Plan & Drive is implemented and live at **https://apogee-mars-rover.vercel.app/** (built from `main`). English is the default and judged language; an **EN / VI** switch adds Vietnamese. Mission 01 includes a step-by-step tutorial. Code lives in `src/sim/expedition.ts`, `src/types/expedition.ts`, `src/scene/ExpeditionScene.tsx`, `src/ui/` and `src/i18n.ts`.

## Why this design
Players design a Mars rover under budget and mass limits, then choose routes to science targets. Their plan sets expectations; their **hands-on driving** produces the consequences. The same target can be reached with different wheels and routes, at different energy, time and risk.

## Two control modes
- **Planning:** full-screen 3D view looking down over the sector. Click the ground to add waypoints or pick a suggested route (Mission 01: *Plot both samples*; Mission 02: *North detour* / *Dune shortcut*). The Route Plan panel shows a **Battery / Time / Risk** estimate as a range, plus warnings for unscanned cells, grip limits and the 15 EU reserve.
- **Driving:** press **Start drive** (or Enter). The camera moves behind the rover. **W/S** forward/reverse, **A/D** steer, **Space** brake. A compass shows bearing and distance to the next waypoint or sample; the minimap and tactical map (**M**) show the route. The rover never drives itself; costs come from the ground actually crossed. **Esc** pauses; **Replan** edits the route from the current position.

## Systems
- **One Mars sector, three terrains:** firm ground, soft sand, sharp rock, inside a mountain rim. One area has reduced sunlight.
- **Three wheels:** Lightweight (firm ground), Wide Traction (sand), Reinforced (sharp rock). Each has cost and mass; no universal best wheel. Too little grip triggers a safety stop.
- **Battery & solar:** driving and field actions use energy. **R** recharges for 10 simulated minutes while parked in enough sunlight.
- **Terrain Scanner (Q):** narrows the hazard estimate for nearby cells; never certainty.
- **Science:** park next to a sample, **F** analyze, **T** transmit. Science Score and fictional Research Credits (RC) are awarded once per transmitted sample.
- **Lander Garage:** install carried spares only (4 RC, 4 min each). Deployed mass includes rover, lander, support equipment and spares.
- **Outcomes:** Mission complete / Partial success / Mission failed, with distance, energy used and recharged, time left, safety stops and the costliest terrain.
- **Tutorial:** each step asks for one action, highlights the control and advances only after the player does it. **Skip**, or toggle with **?** / **H**.
- **Language:** English default; **EN / VI** switch, remembered per browser; `?lang=vi` link.

## Missions
| Mission | Role | Status |
|---|---|---|
| 01 First Survey | Tutorial, two samples near the lander. 50 science / 20 RC when complete. | Live |
| 02 The Dune Crossing | Sedimentary Cliff beyond a dune belt. Light wheels + north detour, or wide wheels + dune shortcut, both complete (60 science / 24 RC). | Live |
| 03 Into the Crater | Slopes, sharp rock and shadow. | Not built |

## Balance (game values, not NASA measurements)
| Wheels | Firm | Sand | Sharp rock |
|---|---:|---:|---:|
| Lightweight | 0.80× | 1.80× | 1.60× |
| Wide Traction | 1.25× | 0.85× | 1.25× |
| Reinforced | 1.15× | 1.30× | 0.75× |

Driving costs 4.8 EU per 4.4 m cell before terrain, wheel, load and roughness factors. Scan 6 EU (Stereo 8), Analyze 12 EU (Spectrometer 16), Transmit 6 EU. The day–night curve uses NASA's 24.6-hour sol; everything else is educational balance. Manual WASD driving is a teaching simplification: real rovers are commanded from Earth with a radio delay.

**Out of scope:** rockets, orbits and Δv; other planets; autopilot or click-to-move; ISRU crafting; supply pods; open-world sprawl; rigid-body vehicle physics.

[GDD](APOGEE_GDD.md) · [Interfaces](INTERFACES.md) · [Implementation notes](PLAN_DRIVE_IMPLEMENTATION.md)
