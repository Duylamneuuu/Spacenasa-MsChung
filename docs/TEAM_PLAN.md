# Team MS Chung — APOGEE Plan & Drive scope (14–15 Nov 2026)

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Owners / four workstreams
| Member | Branch / ownership | New responsibility |
|---|---|---|
| Duy | feat/ui; App/UI/CSS + shared type coordination | English-only UI, plan/preview, START DRIVE, WASD focus, HUD, PAUSE/REPLAN, report, integration |
| Bảo | feat/scene; src/scene/, 3D assets | Preserve useful current MarsOpenWorld/WASD, cameras, waypoint guide, rover visual, manual drive animation |
| Hải | feat/simulation; src/sim/, tests | Deterministic `stepDrive` + `previewRoute`, actual terrain-based energy/time/risk, sun, science/RC, one authoritative state |
| Sơn | feat/content-data; src/data/, docs/science/ | NASA citations, 3 terrains, 3 wheel balance configs, solar scientific limits, label mock numbers |
| Cường | feat/content-data; src/content/, docs/design/, public/assets/ui/ | English player tutorials, 2 Mars missions, two-route level design, copy and pitch |

Cường/Sơn share a branch but not folders. Duy approves cross-owner API changes. Avoid editing work in progress in teammate branches.

## Priority / phases
**P0a:** Current WASD game → Planning Map/Waypoints → estimated energy/time/risk → Start Drive → guided MANUAL drive → real telemetry → study science sample → transmit → debrief.  
**P0b:** 3 wheels, full solar/garage budget/mass logic, terrain scanner, Mission 01 tutorial, Mission 02 second route, retry and tests.  
**P1:** crater/slope/shadow, enhanced scanner, asset polish and Mission 03.

**Out:** rocket/delta-v gameplay, autopilot Plan&Execute, multi-planets, click-to-move, ISRU crafting, orbital capsules and rigid-body suspension.

## Integration / acceptance
- First freeze minimal type contract (control mode, rover pose, driving input, route estimate, terrain sample, drive tick) against **current code**, not hypothetical blank scaffold.
- Run manual keyboard/browser smoke tests: no movement on Start Drive alone, WASD changes rover, route remains visible, actual battery changes with movement, replan retains pose.
- Probe two routes × 3 wheels, recharge, risk/failure, science credits, and English-only UI/logs.
- Keep commits small and validate actual build; no claim of deploy until live URL tested.

[Approved GDD](APOGEE_GDD.md) · [Handoff](IMPLEMENTATION_HANDOFF.md).
