> **HISTORICAL BUILD PROMPT (14 Nov 2026).** This is the prompt used to build the game. The game is now built and live at https://apogee-mars-rover.vercel.app/. Some rules below are out of date: the game is English by default with an optional **EN / VI** switch, and the drive starts with **Start drive** after planning. For the current state read [README](../README.md), [IMPLEMENTATION_HANDOFF](IMPLEMENTATION_HANDOFF.md), [INTERFACES](INTERFACES.md), [APOGEE_GDD](APOGEE_GDD.md) and [DEMO_QA](design/DEMO_QA.md).

# CHATGPT WORK MASTER PROMPT — APOGEE v2 (PLAN & DRIVE)
**Copy this complete document into ChatGPT Work with GitHub connected.**

## YOUR MISSION
Act as senior game engineer, technical director, UI/UX designer, QA lead and integration coordinator for the **MS Chung / APOGEE — Mars Rover Architect** NASA Space Apps Challenge 2026 project.

Repository: https://github.com/Duylamneuuu/Spacenasa-MsChung
Approved GDD: https://github.com/Duylamneuuu/Spacenasa-MsChung/blob/main/docs/APOGEE_GDD.md (if a docs-only PR is open, use its newer GDD after reviewing).
Editable Google Doc: https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit

**Implement the real playable game. Do not stop at analysis, todo lists, mockups or theoretical architecture.** I am improving the final 3D rover model separately; build a functional provisional rover and a plug-in GLB/GLTF adapter so we can replace it later. Use actual GitHub operations and testing supported by available tools; report honest blockers.

## IMMUTABLE PRODUCT RULES
1. **THE GAME MUST BE 100% ENGLISH.** Every player-visible label, button, notification, tutorial, science description, tooltip, keyboard hint, mission story, telemetry/log, error, score, outcome, accessibility/aria-label, loading/empty state and footer must be English. Internal docs/team discussions may be Vietnamese. Audit hardcoded Vietnamese strings in TypeScript files; do not omit runtime logs.
2. **CONTROL MODEL: PLAN & DRIVE. This replaces Plan & Execute autopilot.** Planning Mode: click Mars map to lay down/edit waypoint route(s), preview estimated battery cost, time and risk; show safe detour versus sandy shortcut. Player presses **START DRIVE**. Driving Mode: chase/follow camera; **W forward, S reverse, A/D steer** (optional Space brake) physically move the rover with responsive lightweight arcade/kinematic controls. The planned route becomes a visible trail/next-waypoint indicator and minimap guide. **The rover MUST NOT drive itself** when the player presses Start Drive. Provide Pause/Replan and Resume while retaining actual rover position.
3. Preview numbers are **estimates for the planned route**, never a guaranteed automatic consumption. During manual driving, calculate **actual** speed, position, distance, terrain exposure, time, risk and battery from the path driven. Deviations off the route change outcomes. Never deduct full planned-route cost on Start Drive; don't double-charge between scene/UI/simulation.
4. **ONE MARS MAP, MULTIPLE ENVIRONMENTS AND MISSIONS.** P0 terrain: hard ground, soft sand, sharp rocks; slopes/shadow P1. Three wheel builds (light, wide traction, reinforced) have distinct trade-offs and visual appearances. Mission 01 First Survey and Mission 02 Dune Crossing are P0; Mission 03 Into the Crater is stretch. Mission 02 requires at least two viable strategies/routes.
5. Battery + solar recharge: driving, scanning, analyzing and transmitting consume energy; charging needs enough illumination, rover stopped, and time. Terrain Scanner gives partial hazard/terrain information, not infallible underground detection.
6. Science Score remains cumulative. **Research Credits** are explicitly fictional game progression awarded once per newly transmitted scientific discovery, not NASA buying rocks. Garage at lander swaps only carried spares; total deployed mass includes lander, rover, installed equipment and spares.
7. No rocket/launcher selection, no orbital mechanics/delta-v gameplay, no other planets, no ISRU crafting, no orbital pods, no mandatory autopilot, no expansive open-world scope, no realistic rigid-body car simulation. The real NASA rover is not joystick-driven instantaneously from Earth: present manual WASD as an **educational operator-control abstraction**, not literal NASA operations.

## START BY AUDITING THE ACTUAL LATEST REPO
Check all branches, latest main, active PRs and ownership before edits. Read docs/APOGEE_GDD.md, docs/CONCEPT.md, docs/INTERFACES.md, docs/IMPLEMENTATION_HANDOFF.md, docs/TEAM_PLAN.md and relevant GitHub Issues. Read code—not just docs—including src/App.tsx, src/scene/MarsOpenWorld.tsx, src/scene/Mars3DRover.tsx, src/ui/OperationsView.tsx, src/sim/roverEngine.ts, src/sim/engine.ts, src/types/game.ts and src/data/. Inspect current scenes, assets, tests, and run a baseline build.

**Critical context (verify against current HEAD):** a prior commit already added WASD driving and MarsOpenWorld, but still contains rocket/delta-v UI, legacy tile-turn logic, ISRU, some Vietnamese log strings and duplicate paths for movement/battery calculations. Do NOT assume all this is still present or assume the app is only an initial scaffold. Reuse good WASD and 3D work; surgically migrate incompatible parts. Do not erase Bảo's, Hải's or anyone else's fresh code.

Produce a short factual audit: what works; what is missing; which scientific/gameplay claims are mocked; what interfaces will change. Then implement without waiting for permission on routine safe decisions.

## SOFTWARE OWNERSHIP / SAFE WORKFLOW
Four workstreams: Duy UI & integrator (src/App.tsx, src/ui/, styles, shared types coordination); Bảo scene and model (src/scene/, assets/3d); Hải simulation (src/sim/, tests); Sơn science/data (src/data/, docs/science/); Cường game design/content (src/content/, docs/design/). Sơn+Cường share feat/content-data but own distinct folders.

Create a **new integration branch off latest main**. Open a PR. Never force-push, rewrite history, reset teammate branches or silently replace current working code. If teammate PRs changed the same files, reconcile carefully, preserve authorship and leave clear notes. Keep commits incremental, testable and reviewable. Do not merge active teammates' code without reading it. Avoid creating duplicate game engines that drift apart.

## REQUIRED TECHNICAL DESIGN
- Keep React + TypeScript + Vite + Three.js / React Three Fiber and a single browser app. Avoid backend/accounts unless absolutely needed.
- Define shared typed contracts: `ControlMode = planning | driving | paused`, `DrivingInput`, `RoverPose(x,z,heading,speed)`, `Waypoint`, `PlannedRoute`, `RouteEstimate`, `TerrainSample`, `DriveStepResult`, mission/science state.
- **Pure deterministic sim:** a single authoritative time/energy/movement/mission state model in src/sim; sampling terrain and advancing state via deltaTime (clamped or fixed step). Input commands are logged/testable. Renderer displays results and emits user intent; it must not mutate mission resource state directly.
- Planning: isometric/map camera; mouse click makes waypoint; Undo/Clear, preview estimated energy/time/risk with uncertainty when unscanned. Preserve current position on replanning. Start Drive is a mode switch, **not a movement command**.
- Driving: chase camera, WASD keyboard with held keys, inertia/capped velocity, steering; collision/terrain boundaries and sensible stuck/recovery handling. Suspend controls when modals or inputs have focus and release throttle on blur. A/D means steering, not sliding sideways. The route guide stays visible during driving; deviating is allowed. Optional secondary minimap.
- Terrain: determine current terrain from rover's **actual x/z** each step, not only waypoint tiles. Wheel and load factors affect distance cost; add slope once at most. Validate camera/world units; avoid frame-rate-dependent drain. Cost estimates and actual use share a central movement cost function.
- Science: park near a valid site, SCAN / ANALYZE / TRANSMIT; clear proximity and stopped-state validation, finite battery and time, no duplicated reward. Solar stop-and-charge; science and RC feedback in English.
- Scene/asset integration: isolate `RoverModel` adapter for GLB/GLTF with normalized scale, origin, forward axis, wheel slots and simple procedural fallback. Do not depend on my final model or spend the sprint on complex new 3D art.

## IMPLEMENT IN THIS ORDER (NO OVERENGINEERING)
**P0a — Golden vertical slice:** Mission 02 rover with existing WASD mechanics → add planning map and visible waypoint route → Start Drive → manual drive along guide → live energy/time/terrain costs → stop at science site → analyze/transmit → mission report. Test a safe detour and sandy shortcut. This must become playable first.

**P0b — Complete core:** 3 visually distinct wheel options; Mission 01 tutorial; science score and RC; scanner; solar charging; mass+budget preflight; spares/lander garage; accessible English UI, results/retry, mobile visual responsiveness (desktop controls prioritized). Make sure feature labels match actual functions. Don't add mission 03 until both P0 missions work end-to-end.

**P1 — Polish and model-ready:** tune camera and controls; UI readability; rover dust/wheel feedback; enhanced scanner, crater/slopes, model import notes. Skip if P0 incomplete.

## TESTS / DEFINITION OF DONE
- Browser test with actual keyboard input: NO WASD movement during planning; Start Drive alone keeps rover still; W/S move, A/D steer, releasing input stops acceleration; pause/replan retains position.
- Route preview renders a real path; planned cost is labeled an **estimate**; manual drift causes actual cost to diverge correctly. No dual state ownership and no duplicate energy drain.
- Two routes and three wheel builds materially affect energy/time/risk; at least two strategies can win Mission 02.
- Safe-stop or clear failure on 0 battery and hazards; terrain boundaries/collisions not broken; sunlight recharge only while stopped and adequately lit.
- SCAN reveals limited terrain, ANALYZE gathers sample data, TRANSMIT grants credits once; full/partial/failure outcomes and retry are functional.
- Deployed mass includes spares; no rocket or ISRU loop appears in the player path.
- **English language audit:** grep/search for Vietnamese in every player-facing source string (including logs, notifications, scenario data, alt text), visually inspect every screen and test runtime error messages. No unsupported NASA claims.
- Run `npm install` if needed, `npm run build`, available tests; run Playwright/browser walkthrough if supported, screenshot start/design/plan/drive/result screens. Do not claim browser/test success without executing them.

## DELIVERABLES
1. GitHub implementation PR(s) and linked commits, with exact files changed and no destructive merges.
2. Working playable vertical slice and, if possible, full P0 loop.
3. Real scene, manual controls, planner, authoritative deterministic engine, UI, missions, tested science/economy.
4. `docs/MODEL_IMPORT_SPEC.md` covering GLB/GLTF, meters/scale, axis convention, transform origins, wheel rig names, materials, performance, swap procedure.
5. Test results, screenshots/browser evidence, clear remaining bugs and limitations, English-language review results.
6. Explicit list of the final assets I need to supply, without making the game wait for them.

Do not promise background completion or invent deployment. Work through available tools now, prioritize real playable code and transparent reporting.
