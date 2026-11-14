# APOGEE — Judge demo script and acceptance checklist

> **Build:** live at https://apogee-mars-rover.vercel.app/ (from `main`). Verified 14 Nov 2026 in Chromium with a keyboard on commit `8657096` and later; 11 engine tests and the production build pass in CI. English is the judged language; the **EN / VI** switch is optional. The previous audit of the pre-game scaffold (`7606934`) and the PR #7 walkthrough (`58206fc`) are in [Git history](https://github.com/Duylamneuuu/Spacenasa-MsChung/blob/1a5ae0a1a996e28b6bd574727b6202138563191b/docs/design/DEMO_QA.md).

## Part 1 — 3–5 minute demo (Mission 02 first)

| Time | What to do on screen | What to say |
|---|---|---|
| 0:00 | Title screen: drag the planet, press **Start expedition**. Select **02 The Dune Crossing**, press **Design rover**. | "One Mars sector, two missions. This one has a science target behind a dune field." |
| 0:20 | Earth Hangar: keep **Lightweight Wheels**; point to the Sand bar at **1.80×**. Optionally pack Wide Traction as a spare and show deployed mass rising. Press **Preflight**, then **Deploy to Mars**. | "Every module costs budget and mass, and spares still ride on the lander." |
| 0:45 | Planning: press **North detour**. Read the **Battery / Time / Risk** estimate and the unscanned-cell warning. | "This is a forecast. What I actually drive decides the real cost." |
| 1:05 | Press **Start drive**. Keep hands off the keyboard for two seconds. | "Start drive hands me the wheel. Nothing moves until I do." |
| 1:15 | Drive with **W** and steer with **A/D**, keeping the yellow diamond centred on the compass. Show Battery and Time changing on the HUD. Press **Esc**, then **Replan**, then **Start drive** to show position is kept. | "The route is guidance, not autopilot." |
| 2:15 | At the Sedimentary Cliff: **Space** to stop, **Q** scan, **F** analyze, **T** transmit. Science 60, RC 24 appear. Press **Report**. | "Points count only when the data reaches Earth, once per sample." |
| 2:45 | Report: distance, energy used, time left, the terrain that cost most. Press **Try another loadout**, choose **Wide Traction Wheels**, deploy, choose **Dune shortcut**, hold **W** straight across the sand, then stop, analyze, transmit. | "A second strategy wins with heavier wheels and a shorter, sandier route." |
| 3:45 | Optional: with Lightweight Wheels on the shortcut, the rover makes a **safety stop** at the sand edge. | "The wrong wheel does not crash; the operator gets a clear stop and has to replan." |
| 4:10 | Close on the honesty note: EU, RC and wheel multipliers are game values; the day–night cycle uses NASA's 24.6-hour sol; real rovers are commanded from Earth with a radio delay. | |

Tip: with the tutorial on, Mission 01 is the gentlest introduction for a judge who wants to try it. Press **?** or **H** to bring the guide back.

## Part 2 — Acceptance checklist

| ID | Check | How | Status |
|---|---|---|---|
| TC-01 | Mission 02, Lightweight + North detour completes | Steps 0:20–2:45 above | Pass (browser) |
| TC-02 | Mission 02, Wide Traction + Dune shortcut completes, 60 / 24 RC | Step 2:45 | Pass (browser) |
| TC-03 | Lightweight + shortcut makes a safety stop; ending without data reports failure | Step 3:45, then **Report** | Pass (browser) |
| TC-04 | Mission 01 tutorial runs all steps; 50 science / 20 RC | New browser or **?**; follow prompts in EN and VI | Pass (browser, VI) |
| TC-05 | Planning and Paused ignore WASD; Start drive alone does not move the rover | Hold W before and after Start drive | Pass (browser) |
| TC-06 | Replan keeps position and heading | Esc → Replan → Start drive | Pass (browser) |
| TC-07 | Cost follows the ground actually driven | Deviate into sand vs. stay on firm ground | Pass (engine test + browser) |
| TC-08 | Recharge only while parked with enough light | R while moving / in the dark corner / parked in sun | Pass (engine test); browser parked charge pass |
| TC-09 | Transmit rewards once; Analyze needs to be at the site | Transmit twice; Analyze away from a sample | Pass (browser + engine test) |
| TC-10 | Garage installs only carried spares; spares count toward mass | Pack a spare, return to lander, **Garage** | Engine test pass; browser not exercised |
| TC-11 | Enter inside the tactical map adds a waypoint without starting the drive | **M**, arrow keys, Enter | Pass (browser, after fix `dc7f02a`) |
| TC-12 | Language: EN default, VI switch persists after reload, engine messages translated | Toggle VI, reload, trigger a safety stop | Pass (browser) |
| TC-13 | Desktop only: play needs a keyboard; no touch controls | Open on a phone | Known limitation |
