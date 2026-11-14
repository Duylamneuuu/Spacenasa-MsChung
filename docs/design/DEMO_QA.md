# APOGEE — Mars Rover Architect: Judge Demo Script & Acceptance QA Checklist

> **Target Specification:** Approved GDD v2 (**Plan & Drive**, 100% English player-facing experience)  
> **Reference Docs:** [GDD](../APOGEE_GDD.md) · [Work Master Prompt](../WORK_MASTER_PROMPT.md) · [English checklist](../UI_LANGUAGE_CHECKLIST.md) · [NASA/JPL sources](../science/SOURCES.md)
> **Audited Baseline Commit:** `origin/main` (`760693474bbdfdb4a832ba427c11095977d7f339`) · **Audit Date:** 2026-11-14

> **Honesty Notice:** At audited commit `7606934`, the approved **Plan & Drive** architecture (waypoint planning map, `RouteEstimate`, `START DRIVE` mode gate, Mission 01/02 definitions, stopped solar charging, and English-only UI/log cleanup) is **not yet implemented on `main`**, and `node_modules` is not installed locally. Accordingly, the baseline column and case notes below retain **`NOT RUN`** where applicable, and no waypoint coordinates, scores, or run outcomes are fabricated. Direct static-code audit findings on `7606934` are separated clearly in **Appendix A**.

---

## Verified on the playable build

Build: [PR #7](https://github.com/Duylamneuuu/Spacenasa-MsChung/pull/7), commit `58206fc` · [Node 20 CI](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions/runs/43576039325/job/132390394596) · [Browser evidence](https://github.com/Duylamneuuu/Spacenasa-MsChung/tree/58206fc16292dbafd2bc0b1f1c9092bf0c5ea390/docs/evidence).

| Cases | Verified result |
| --- | --- |
| TC-01, TC-02 | Chromium: the firm-ground detour with Lightweight Wheels and the dune shortcut with Wide Traction Wheels both ended in Mission Complete. The shortcut run earned 60 Science Score and 24 RC. |
| TC-03 | Chromium: click on the 3D terrain added a waypoint; manual W changed live telemetry. Engine test: deviating from the estimate changed the cost. Compare Navigation estimates with Live Telemetry; Mission Report records actuals rather than storing the initial estimate. |
| TC-04 | Chromium: both First Survey samples transmitted and the mission completed. Engine test: one transmitted sample yields partial credit. |
| TC-05, TC-06 | Chromium: W did not move the rover while Planning or Paused; Start Drive without input stayed idle; Replan preserved position. Browser focus-loss and modal combinations were not verified in that walkthrough. |
| TC-07 | Chromium: the lightweight shortcut triggered a safe stop and an unfinished report with no downlink showed failure. Engine tests also verified power and deadline limits. |
| TC-08, TC-09 | Chromium: a stopped 10-minute solar charge succeeded, and Transmit was disabled after downlink. Engine tests covered moving/low-light recharge rejection and duplicate rewards. |
| TC-10 | Engine tests verified spare mass, availability and lander swaps. Browser garage swap was not exercised in the walkthrough. |
| TC-11 | The active screens used by the walkthrough were in English. A comprehensive accessibility and all-states language pass is not recorded. |


## Part 1: 3–5 Minute Judge Demo Script (Mission 02 First)

**Goal:** Prove in under 5 minutes that APOGEE is a hands-on engineering trade-off simulator—not an autopilot movie or a multiple-choice quiz—by contrasting **two viable strategies** on **Mission 02: The Dune Crossing** while showing how **pre-drive estimates** compare with **actual manual `W/S/A/D` driving**.

| Time | Segment | Presenter Actions & On-Screen Proof | Key Engineering Message (English UI) |
|---|---|---|---|
| **0:00 – 0:45** | **1. Mission 02 Setup: Light Wheels (`W1`) + Firm-Ground Detour Plan** | 1. Select **Mission 02: The Dune Crossing**.<br>2. In **Earth Hangar**, equip **Lightweight Wheels (`W1`)** and pack **Wide Traction Wheels (`W2`)** as an optional spare in the **Lander Depot**, pointing out that **Total Deployed Mass** includes both installed modules and carried spares.<br>3. Pass **Preflight Check** (budget and mass limits only; no rocket/Δv selection) and deploy to Mars.<br>4. In **Planning Mode** (isometric tactical map), choose **North detour · recommended** to plot the firm-ground route, or click the terrain to place waypoints manually.<br>5. Point out the **Route Estimate** (`Estimated Energy`, `Estimated Time`, `Risk Level`, and `Unscanned Terrain` uncertainty). | *"Same map, multiple viable engineering choices: Light Wheels are cheap and efficient on firm basalt, so we plan a longer detour around soft sand."* |
| **0:45 – 2:00** | **2. `START DRIVE` & Manual `W/S/A/D` Driving (Route Is Guidance)** | 1. Press **START DRIVE**.<br>2. **Keep hands off the keyboard for 2–3 seconds** so judges observe the rover remains **stationary**—confirming the route is visual guidance, **not autopilot**.<br>3. Drive manually with **W** (forward), **S** (reverse), and **A/D** (steer) along the 3D guidance trail and minimap.<br>4. Point out **Energy used** and **Time left** in Live Telemetry as the rover travels on firm ground.<br>5. Press **Pause drive** and show that the rover stays in place. Use **Resume drive** to continue, or **Replan route** then **Start drive** to edit from that position. | *"Pressing Start Drive hands control to the operator. Deviations off the planned path immediately change actual speed, energy burn, and mission time."* |
| **2:00 – 2:50** | **3. Park, Scan, Analyze, Transmit & Mission Report** | 1. Drive up to the Mission 02 Science Site and **stop completely**.<br>2. Run **Terrain Scanner** (highlight partial terrain/hazard readout, not 100% underground certainty), **Analyze Sample**, and **Transmit Data**.<br>3. Point out cumulative **Science Score** and one-time **Research Credits (`RC`)**.<br>4. Compare the initial **Navigation** estimate with **Live Telemetry** before opening **Mission Report**. Use the report for actual distance, energy, time, stops and configuration. | *"Research Credits are fictional progression unlocked once per newly transmitted discovery; Live Telemetry reflects how you actually drove, and the Mission Report records your final outcome and trade-offs."* |
| **2:50 – 4:00** | **4. Second Strategy: Wide Traction Wheels (`W2`) + Sandy Shortcut** | 1. Click **Try Another Loadout** from the Mission Report and equip **Wide Traction Wheels (`W2`)**.<br>2. In **Planning Mode**, select **Dune shortcut** to set a direct guide across the soft sand to the same site.<br>3. Show the updated **Route Estimate** (shorter distance, lower sand penalty vs. `W1`, higher mass/budget trade-off).<br>4. Press **START DRIVE**, hold **W** across the soft sand from the starting heading, showing the change in speed and energy use; release **W** near the site, park, select **Analyze sample** and **Transmit**, then open **Mission report**. | *"Two completely different wheel-and-route strategies both succeed—with measurable trade-offs in budget, mass, time, and energy."* |
| **4:00 – 4:30** | **5. NASA Science Grounding & Scope Transparency** | 1. Summarize the real NASA inspiration (MER `Spirit` sand entrapment at Troy, `Curiosity` vs. `Perseverance` wheels, `Opportunity` solar dust/shadow limits, `NavCam`/`HazCam` vs. `RIMFAX` subsurface radar).<br>2. State openly that **WASD is an educational control abstraction** (real Mars rovers have up to ~44 min round-trip radio latency and use sequenced plans + onboard `AutoNav`), and that `EU`, `RC`, and wheel multipliers are **GAME BALANCE** constants. | *"Honest educational simulation: real engineering trade-offs without claiming fake NASA numbers or real-time joystick Mars driving."* |

---

## Part 2: Reproducible Acceptance Test Checklist

**Status Legend:**
- **`NOT RUN`** — Cannot execute yet because Plan & Drive gameplay (`Planning Mode`, `RouteEstimate`, `START DRIVE` mode gate, Mission 01/02 content, unified sim) is not implemented on `origin/main` (`7606934`) and `node_modules` is not installed locally.
- **`FAIL (Legacy Code)`** — Directly observed non-compliant behavior or text in source files at `origin/main` (`7606934`).

### Summary Matrix (Mission 02 Prioritized)

| Test ID | Scenario | Priority | Status on `7606934` | Notes |
|---|---|---|---|---|
| **TC-01** | Mission 02: Light Wheels (`W1`) + Firm-Ground Detour | P0 | `NOT RUN` | Needs Plan & Drive map, `W1` GDD multipliers, and Mission 02 |
| **TC-02** | Mission 02: Wide Traction Wheels (`W2`) + Sandy Shortcut | P0 | `NOT RUN` | Needs Plan & Drive map, `W2` GDD multipliers, and Mission 02 |
| **TC-03** | Planned Estimates vs. Actual Driving & Park/Analyze/Transmit/Report | P0 | `NOT RUN` | Compare the Navigation estimate with Live Telemetry and report actuals |
| **TC-04** | Mission 01 (`First Survey`): Two Science Samples Tutorial Loop | P0 | `NOT RUN` | Needs Mission 01 scenario data and two tutorial sample sites |
| **TC-05** | `START DRIVE` Keeps Rover Still Without Input (No Autopilot) | P0 | `NOT RUN` | Needs `ControlMode` (`planning \| driving \| paused`) gate |
| **TC-06** | Pause / Replan Retains Actual Rover Position & Heading | P0 | `NOT RUN` | Needs Pause/Replan UI & pose preservation in `src/sim/` |
| **TC-07** | Unsafe or Failed Run (`0 EU` Battery Depletion or Hazard) | P0 | `NOT RUN` | Needs unified Plan & Drive debrief failure/retry flow |
| **TC-08** | Solar Recharge Only While Stopped in Adequate Sunlight | P0 | `NOT RUN` | `MarsOpenWorld.tsx:425-428` currently charges while moving |
| **TC-09** | Duplicate Rewards Prevention (One-Time Science Score & `RC`) | P0 | `NOT RUN` | Legacy code uses `rawScienceMB` + `missionCreditsMUSD`, no `RC` per site |
| **TC-10** | Lander Garage Swaps Carried Spares Only (In Deployed Mass) | P0 | `NOT RUN` | Mass sum verified in `engine.ts`; UI still has legacy ISRU 3D printer |
| **TC-11** | 100% English UI, Runtime Telemetry Logs, Errors & Accessibility Labels | P0 | `FAIL (Legacy Code)` | Verified Vietnamese strings in `src/sim/roverEngine.ts` & `src/ui/` |

---

### Detailed Test Cases (Setup → Actions → Expected Result)

#### TC-01 — Mission 02 (`The Dune Crossing`): Light Wheels (`W1`) + Firm-Ground Detour
- **Status:** `NOT RUN` (awaiting playable Plan & Drive build).
- **Setup:** Fresh session; select **Mission 02: The Dune Crossing**. In **Earth Hangar**, equip **Light Wheels (`W1`)** and standard Mission 02 loadout within budget and mass caps. Complete **Preflight Check** and deploy to Mars.
- **Actions:**
  1. In **Planning Mode**, inspect the tactical map showing the Lander, soft-sand dune belt, firm-ground detour corridor, and target Science Site.
  2. Click a sequence of waypoints along the **firm-ground detour** avoiding the soft-sand zone.
  3. Record the displayed **Route Estimate** (`Estimated Energy`, `Estimated Time`, `Risk Level`).
  4. Press **START DRIVE** and manually drive along the visible guidance trail using **W/S/A/D** without entering deep soft sand.
  5. Park at the Science Site, complete science actions, and finish the mission.
- **Expected Result:**
  - `W1` passes Preflight within budget/mass limits.
  - Planning Mode renders the detour polyline and shows a realistic **estimate** (longer distance/time, moderate/low sand risk, `W1` hard-ground efficiency).
  - Manual driving along the firm detour preserves enough battery (`> 0 EU`, ideally above the `15 EU` safety reserve) to reach the site, perform science operations, and earn a **Full Success** outcome.

#### TC-02 — Mission 02 (`The Dune Crossing`): Wide Traction Wheels (`W2`) + Sandy Shortcut
- **Status:** `NOT RUN` (awaiting playable Plan & Drive build).
- **Setup:** Retry Mission 02 from the start (or swap to **Wide Traction Wheels (`W2`)** from carried spares if testing garage flow). Complete **Preflight Check** (verify higher wheel mass/cost still fits Mission 02 limits) and deploy.
- **Actions:**
  1. In **Planning Mode**, click waypoints along the **direct sandy shortcut** through the soft-sand belt to the same Mission 02 Science Site.
  2. Compare the `W2` **Route Estimate** against the `W1` detour estimate from TC-01 (and optionally compare what happens if `W1` tries the same sandy shortcut).
  3. Press **START DRIVE** and manually drive with **W/S/A/D** across the soft-sand belt along the guidance markers.
  4. Park at the Science Site, complete **Analyze** and **Transmit**, and open the **Mission Report**.
- **Expected Result:**
  - Visually distinct wide traction wheels are rendered on the 3D rover.
  - Crossing soft sand with `W2` yields viable speed and lower sand energy drain (`0.85×` vs. `W1`'s `1.80×` per GDD v2 balance) with reduced sand immobilization risk, allowing **Mission 02 to be completed successfully via a second distinct strategy**.
  - Hard-ground segments with `W2` consume more energy per meter than `W1` (`1.25×` vs. `0.80×`), confirming neither wheel is universally superior.

#### TC-03 — Planned Estimates vs. Actual Manual Driving & Science Loop (Park → Analyze → Transmit → Mission Report)
- **Status:** `NOT RUN` (awaiting playable Plan & Drive build).
- **Setup:** Mission 02 active in **Planning Mode** with a plotted waypoint route and recorded **Estimated Energy** and **Estimated Time**.
- **Actions:**
  1. Verify the pre-drive preview is explicitly labeled as an **estimate** and that rover battery remains at full starting charge (`100 EU`) upon pressing **START DRIVE** (no upfront deduction).
  2. Manually drive **off the planned guidance line** (e.g., weave extra distance, reverse with **S**, or drive onto soft sand / sharp rock) for several seconds, then steer back toward the Science Site.
  3. Attempt **Analyze Sample** while still moving; then **stop completely** within site radius and execute **Analyze Sample** → **Transmit Data**.
  4. Finish the mission and read the **Mission Report**.
- **Expected Result:**
  - **Actual Energy** and **Elapsed Time** increase dynamically from actual `(x, z)` terrain sampling and `deltaTime` movement—not from the pre-drive estimate—and **never double-charge** between scene and simulation.
  - **Analyze Sample** requires stopping within proximity of the site (rejecting or prompting clearly if still moving or out of range).
  - **Transmit Data** transfers collected sample data, increments cumulative **Science Score**, and awards one-time fictional **Research Credits (`RC`)**.
  - **Mission Report** summarizes the actual route, energy used, time remaining and safety stops. Compare with the estimate recorded before Start Drive.

#### TC-04 — Mission 01 (`First Survey`): Two Science Samples Tutorial Loop
- **Status:** `NOT RUN` (awaiting Mission 01 tutorial scenario and Plan & Drive UI).
- **Setup:** Launch a new game and select **Mission 01: First Survey**.
- **Actions:**
  1. Follow the English-only tutorial prompts through Rover Design, Preflight, and deployment.
  2. In **Planning Mode**, lay waypoints to visit **both** Mission 01 Science Samples; test **Remove waypoint** and **Clear route** before finalizing the plan.
  3. Press **START DRIVE**, manually drive with **W/S/A/D** to Sample 1, park, run **Terrain Scanner** and **Analyze Sample**.
  4. With **Standard Storage**, **Transmit** Sample 1 before analyzing Sample 2. Drive to Sample 2, park, select **Analyze Sample** and **Transmit**, then recharge if needed.
  5. Open **Mission Report**; also test finishing after transmitting only **one** of the two samples in a separate run to verify **Partial Success**.
- **Expected Result:**
  - All tutorial instructions for Planning, Start Drive, `W/S/A/D`, Scanner, Solar Recharge, Analyze, and Transmit are clear and 100% English.
  - Collecting and transmitting both samples completes Mission 01 (**Full Success**); transmitting only one sample produces **Partial Success** with accurate explanation.

#### TC-05 — `START DRIVE` Stays Still Without Input & Planning Mode Locks `WASD`
- **Status:** `NOT RUN` (awaiting `ControlMode` state machine in `src/sim/` and `src/ui/`).
- **Setup:** Any playable mission (Mission 01 or Mission 02) deployed on Mars in **Planning Mode** with at least two waypoints placed.
- **Actions:**
  1. While still in **Planning Mode**, hold **W**, **A**, **S**, and **D** for 2 seconds each. Verify rover position `(x, z)` and battery.
  2. Click **START DRIVE** and wait **5 seconds without pressing any keyboard or D-pad control**.
  3. Hold **W** for 2 seconds, then release **W**.
  4. Hold **A** and **D** while driving forward, then verify **A/D** steer heading rather than sliding sideways without forward/reverse motion.
  5. Focus any open modal or text control while holding **W**, or blur the browser window (`Alt+Tab` / click outside canvas), then return.
- **Expected Result:**
  - Rover does **not** move or drain driving energy during **Planning Mode**.
  - Pressing **START DRIVE** switches mode only; with zero input, rover speed remains `0`, `(x, z)` stays unchanged, and no driving battery drain occurs.
  - Holding **W/S** accelerates forward/reverse; releasing keys decelerates smoothly to a stop.
  - Holding **A/D** steers vehicle yaw (heading) rather than strafing sideways.
  - Opening a modal or blurring window focus safely releases held throttle/steering inputs.

#### TC-06 — Pause / Replan Retains Actual Rover Position & Heading
- **Status:** `NOT RUN` (awaiting Pause/Replan controls).
- **Setup:** Rover actively driven in **Driving Mode** partway away from the Lander (non-zero `(x, z)` and rotated heading, partial battery consumed).
- **Actions:**
  1. Note exact current coordinates `(x, z)`, heading, `Actual Energy`, and `Elapsed Time`.
  2. Click **Pause / Replan**.
  3. Wait 3 seconds and verify movement keys (`WASD`) are suspended.
  4. Clear or edit remaining waypoints from the rover's current position, inspect the updated **Remaining Route Estimate**, and click **Resume** / **START DRIVE**.
- **Expected Result:**
  - Rover does **not** teleport back to the Lander `(0, 0)` or snap onto the old route line.
  - Physical `(x, z)`, heading, remaining battery, and elapsed mission time are preserved across `Driving → Planning/Paused → Driving`.

#### TC-07 — Unsafe or Failed Run (`0 EU` Battery Depletion or Unrecoverable Hazard)
- **Status:** `NOT RUN` (awaiting Plan & Drive failure evaluation and retry flow).
- **Setup:** Select **Mission 02** with **Light Wheels (`W1`)** and purposefully plan/drive an inefficient path into a **Soft Sand** sector that exceeds the grip limit, or run short on battery or mission time through unnecessary travel.
- **Actions:**
  1. Drive directly into the dunes with Lightweight Wheels until the rover stops for safety, or trigger a power/time-limit failure.
  2. Attempt to drive while paused after the stop, or after mission-ending power loss.
  3. Proceed to **Mission Report** and click **Retry**.
- **Expected Result:**
  - Battery remains within 0–100 EU. The engine can stop before 0 EU at the operating threshold.
  - Rover halts safely and stops accepting drive propulsion; an English-language failure notification explains why power/mobility was lost.
  - **Mission Report** classifies the outcome as **Failure** (or **Partial Success** if partial science was already transmitted before failure), explains which terrain/wheel choices drove the failure, and **Retry** cleanly resets mission state.

#### TC-08 — Solar Recharge Only While Stopped in Adequate Sunlight
- **Status:** `NOT RUN` (on `7606934`, `src/scene/MarsOpenWorld.tsx:425-428` still applies `+15.0 * delta` solar recharge while moving on a Solar Ridge).
- **Setup:** Rover deployed with `< 100 EU` battery (e.g., driven until battery drops below `70 EU`).
- **Actions:**
  1. Drive **continuously** across a sunlit area without stopping: check whether battery increases while moving.
  2. Stop completely (`speed = 0`) in an **adequately lit** zone and trigger/hold **Recharge**. Observe both `Battery EU` and `Elapsed Time`.
  3. Stop completely in a **shadowed canyon / low-light zone** (if present in Mission 02/03) and trigger **Recharge**.
- **Expected Result:**
  - Rover **cannot** farm net solar recharge while driving; charging occurs **only while stopped** in adequate illumination.
  - Solar recharge advances **Elapsed Mission Time** (no instant free energy burst) and clamps battery at `maxBattery` (`100 EU`).
  - Shadowed or low-illumination areas yield reduced or zero charge with a clear English explanation.

#### TC-09 — Duplicate Rewards Prevention (One-Time Science Score & `RC`)
- **Status:** `NOT RUN` (awaiting Plan & Drive Science Site state + `RC` model).
- **Setup:** Rover parked within interaction radius of an uncollected Science Site with sufficient battery for two `ANALYZE` / `TRANSMIT` cycles.
- **Actions:**
  1. Park, run **Analyze Sample**, and verify sample state changes to collected/analyzed.
  2. Attempt **Analyze Sample** a second time on the **same** Science Site.
  3. Run **Transmit Data** once; observe **Science Score** and **Research Credits (`RC`)** deltas.
  4. Immediately press **Transmit Data** again with an empty data buffer (or revisit the already-transmitted site).
- **Expected Result:**
  - Un-transmitted sample data stored onboard does **not** award `RC` until successfully transmitted.
  - Each unique Science Site grants its discovery **Science Score** and fictional **`RC` exactly once**.
  - Re-analyzing the same site or pressing **Transmit Data** with zero new data grants `0` additional `Science Score` and `0` additional `RC`, displaying an English status message.

#### TC-10 — Lander Garage Swaps Carried Spares Only (Counted in Total Deployed Mass)
- **Status:** `NOT RUN` (mass sum verified statically in `src/sim/engine.ts:38-62`; Plan & Drive UI/garage cleanup pending).
- **Setup:** In **Earth Hangar**, equip **Light Wheels (`W1`)**, pack **Wide Traction Wheels (`W2`)** as a carried spare in the Lander Depot, and intentionally **leave Reinforced Wheels (`W3`) unpacked**. Record `Rover Mass`, `Depot Spares Mass`, and `Total Deployed Mass`.
- **Actions:**
  1. Confirm `Total Deployed Mass` increases when `W2` is added to the Lander Depot and check Preflight validation against the mass cap.
  2. Deploy to Mars and drive **outside** Lander Garage radius (`> landerRadius`); attempt to open **Lander Garage** and swap wheels.
  3. Drive **back into** Lander Garage radius; swap `W1` → `W2` (carried spare).
  4. Verify `W3` (not carried from Earth) is **unavailable** to buy, craft, or 3D-print on Mars.
- **Expected Result:**
  - Total Deployed Mass strictly includes carried spares (`Lander + Rover + Installed + Spares + Support`).
  - Swapping is blocked when far from the Lander and succeeds only at the Lander Garage.
  - Only pre-packed spares can be swapped (`W2` succeeds and visibly updates the 3D rover wheels; `W3` cannot be fabricated/bought mid-mission; legacy ISRU 3D printing does not appear).

#### TC-11 — 100% English-Only Player UI, Runtime Logs, Errors & Accessibility Labels
- **Status:** **`FAIL (Legacy Code)` on `origin/main` (`7606934`)** · **`NOT RUN` on target Plan & Drive build**.
- **Setup:** Build and inspect every screen (`Home`, `Mission Select`, `Design`, `Preflight`, `Planning Mode`, `Driving Mode`, `Pause/Replan`, `Scanner`, `Analyze/Transmit`, `Lander Garage`, `Mission Report`, `Retry`) plus browser console/telemetry log feed and DOM `aria-label` / `alt` / `title` attributes.
- **Actions:**
  1. Run static character scan across `src/` for Vietnamese diacritics in JSX, data files, and runtime log generators.
  2. Walk through normal completion, partial completion, low-battery (`0 EU`), out-of-range transmit, duplicate transmit, and boundary/stuck states in a live browser.
  3. Inspect interactive buttons (including D-pad/camera buttons and 3D canvas containers) for English `aria-label` / `title` / `alt` strings.
- **Expected Result:**
  - Zero Vietnamese or mixed-language strings appear anywhere in player-visible UI, tooltips, mission descriptions, error alerts, telemetry logs, debrief diagnoses, or accessibility labels.
  - All controls have meaningful English `aria-label` or visible text labels.

---

## Appendix A: Direct Verification & Static Audit on `origin/main` (`7606934`)

### A.1 Local Build & Browser Environment Check (2026-11-14)
- **Git Baseline:** `origin/main` at `760693474bbdfdb4a832ba427c11095977d7f339`.
- **Runtime Toolchain Observed:** `node v24.14.0`, `npm 11.6.2`.
- **`node_modules` Present:** `False` — dependencies are not installed in this clean workspace, and per workstream rules (`docs/science/SOURCES.md` & `docs/design/DEMO_QA.md` scope only), `package.json` and `node_modules` were not modified. Therefore `npm run build` and live browser Playwright walkthroughs remain **`NOT RUN`**.

### A.2 Directly Observed Non-Compliant Legacy Code on `7606934`
While auditing `origin/main` (`7606934`) without modifying `src/`, the following items were directly observed and must be resolved before **TC-01..TC-11** can pass:

1. **Legacy Rocket / Δv / ISRU / Autopilot-Adjacent Flows Still Present:**
   - `src/data/roverModules.ts`: Still includes `launcher` category (`falcon_heavy_rideshare`, `atlas_v_dedicated`, `sls_cargo_class`), `mmrtg` power module, `craftCostScrap` / `craftCostCredits`, and `revealsHiddenSand: true` claiming `100%` sand-trap reveal on `rimfax_gpr` (lines 85–89).
   - `src/ui/PreflightLaunchView.tsx`: Still renders launcher selection and Tsiolkovsky Δv feasibility checks.
   - `src/sim/engine.ts` (`calculateResources`, lines 63–66; `LAUNCH_MISSION`, lines 267–296): Still computes Tsiolkovsky Δv penalty and `-30⚡` hard-landing damage.
   - `src/scene/MarsOpenWorld.tsx` (lines 425–428) & `src/ui/OperationsView.tsx` (lines 202–212): Scene directly triggers battery drain and continuous moving solar ridge recharge (`+15.0 * delta`) through UI callbacks rather than a single pure deterministic `src/sim/` tick, and `OperationsView.tsx` mutates `surface.rawScienceMB` / `surface.isruAlloyScrap` directly (lines 175, 191).

2. **Vietnamese Player-Facing Strings Found by Direct Regex Audit on `7606934`:**
   - `src/sim/roverEngine.ts` (72 matching lines across lines `61–526`): Vietnamese surface logs (`moveRover`, `solarCharge`, `scanTerrain`, `transmitData`, `unstuckRover`, `swapModuleAtLander`, `craftModuleAtLander`) and Vietnamese `calculateMissionOutcome` titles/explanations/details.
   - `src/ui/DebriefView.tsx` (46 matching lines across lines `26–220`): Vietnamese headings, trade-off diagnosis text, scorecard labels, NASA citations, and navigation buttons.
   - `src/ui/OperationsView.tsx` (40 matching lines across lines `177–583`): Vietnamese logs (`177, 193`), HUD labels/subtitles (`250, 267–281`), camera button `title` tooltips (`304, 312, 320`), proximity banners (`332–353`), action pill labels (`417–467`), and Lander Depot / 3D Fabricator modal text (`492–583`).
   - `src/ui/MarsMinimap.tsx` (lines `150–154`): Vietnamese minimap legend (`Trạm Đổ Bộ`, `Đồi Nắng`, `Cát Lún`, `Mẫu Đá`, `Mảnh Vỡ`).
   - `src/ui/DesignView.tsx` (line `217`): Mixed bilingual heading `Lander Depot Spare Inventory (Mang theo trên Trạm Đổ Bộ)`.
   - `src/scene/MissionScene.tsx` (line `405`): Vietnamese `.scene-caption` text (`Phòng Điều Khiển NASA & Mô hình xe Rover thời gian thực...`).
   - *(Note: 5 lines in `src/data/roverModules.ts` lines `7, 59, 95, 129, 163` are internal code comments only and are exempt per `docs/UI_LANGUAGE_CHECKLIST.md`.)*
