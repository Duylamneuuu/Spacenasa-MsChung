# APOGEE — Implementation handoff v2 (Plan & Drive)

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Reality check
Latest observed repo has a large gameplay commit with manual WASD rover controls already in `src/scene/MarsOpenWorld.tsx` and `src/ui/OperationsView.tsx`. Do not waste time rebuilding controls or describing it as blank scaffold. **But** the approved pre-drive route planner does not exist yet; rocket/delta-v/ISRU logic and some Vietnamese runtime strings remain. First audit exact current HEAD, then reuse functioning parts and reconcile.

## Golden vertical slice to build NOW
1. **Duy UI**: add Planning Mode overlay above Mars world, click-waypoint route creation, Undo/Clear, estimated battery/time/risk, **START DRIVE** / Pause / Replan. Present English-only player-facing copy.
2. **Bảo scene**: expose two camera modes (planning isometric, driving chase), route line + next-waypoint guidance; keep existing WASD/chase model if viable. Do not move rover automatically on Start Drive. Ensure GLB/GLTF adapter + placeholder.
3. **Hải sim**: single pure deterministic per-tick rover pose/terrain/time/battery cost model. Preview traverses planned path. Actual gameplay consumes along actual WASD movement; never double-charge in 3D and state. Tests for route deviations.
4. **Sơn data**: three terrain types, three wheel coefficients, solar source assumptions and NASA citations; clear tags GAME BALANCE vs verified.
5. **Cường missions**: Mission 01 tutorial + Mission 02 sand crossing with two routes; only English player-facing labels/tutorials and science descriptions.
6. **Duy integrates**: in 3–5 minutes show plan route → estimate → Start Drive → WASD → deviation changes battery → analyze/transmit → report/retry.

## P0 done when
- Start Drive alone does not move rover; W/S throttle & reverse, A/D steer; focus/blur handling correct.
- Path is an overlay or in-world navigation guidance, not autopilot. Pause/Replan from current position.
- Estimated vs actual energy/time/risk have honest labels and are consistent at equal conditions.
- Each of 3 wheels has measurable effect on both route choices; at least two strategies finish Mission 02.
- Battery/solar, science/RC, preflight mass+budget, lander spares and report work with one authority.
- Both missions play through; no rocket selection, ISRU, infinite mining, orbital pods.
- **All visible game content is English**: menus, logs, errors, ARIA, tooltips, tutorial, mission data and report.
- Production build, keyboard browser walkthrough and deterministic tests pass.

## P1 if time
Additional slopes/shadow, Mission 03, richer low-poly materials, dust/scan FX, polished model import.

## Collaboration
**Do not directly reset other workstream branches, overwrite unreviewed team code, or merge with a blind force push.** Duy coordinates `src/types/game.ts`; Bảo scene, Hải sim, Sơn data, Cường content. Make a new integration branch from main with small PRs.

[Approved GDD](APOGEE_GDD.md) · [Interfaces](INTERFACES.md) · [Work master prompt](WORK_MASTER_PROMPT.md).
