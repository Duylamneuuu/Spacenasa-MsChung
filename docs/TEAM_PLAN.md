# MS Chung — APOGEE execution plan (Nov 14–15, 2026)

**5 people, exactly 4 concurrent workstreams.** This supersedes the old 60-Seconds-style Mission Control plan.

| Workstream | Owner | Branch | Folder / output |
|---|---|---|---|
| **UI / product integration** | Duy | feat/ui | src/App.tsx, src/ui/, src/styles.css, src/types/game.ts coordination; hangar, command HUD, preview, reports |
| **3D Mars scene** | Bảo | feat/scene | src/scene/, public/assets/3d/; isometric terrain, rover, clickable waypoints, continuous Execute animation, visible wheel variants |
| **Pure gameplay simulation** | Hải | feat/simulation | src/sim/ and tests; route/time/battery/solar/scanner science/RC, mission results |
| **Concept + NASA data** | Sơn and Cường | feat/content-data | Sơn: src/data/, docs/science/ sources + scientific checks; Cường: src/content/, docs/design/, public/assets/ui/ missions, sites, tutorial, assets and pitch |

**Sơn and Cường share feat/content-data but have separate file ownership.** Pull before push. Duy integrates contracts and merges via PR.

## Scope priorities

**P0 / must demo**
- One Mars map with hard, soft-sand and sharp-rock routes.
- 3 wheel types (light, wide, reinforced), with different energy/risk outcomes.
- Mission 01 First Survey (tutorial) and Mission 02 Dune Crossing (short sandy shortcut vs long detour).
- Mission selection + hangar loadout, budget and full deployed mass preflight.
- Click waypoints → preview power/time/risk → Execute → animated rover → replan if safe-stop.
- One battery, solar stop-and-charge, basic scanner, analyze and transmit, Science Score/fictional Research Credits.
- Return to lander to use preloaded spares and show debrief/retry.
- Tests, NASA attribution and limitations, browser build + demo.

**P1 / optional after P0 complete:** slopes, shadows, enhanced scanner, Mission 03 crater, graphics polish, better visual timeline.

**Out:** launch/rocket/delta-v, multiple planets, WASD, orbital pods, crafting/ISRU, full tire physics, multiple antenna models, expansive open world.

## Integration order (do not let four separate implementations diverge)

1. **Duy + Bảo + Hải — freeze v1 types** from docs/INTERFACES.md. The current source is an old scaffold. Agree waypoint format, PlanPreview and ExecuteResult.
2. **Cường → Duy/Bảo:** mission site locations, layout reference, player copy and low-poly essentials.
3. **Sơn → Hải:** terrain kinds, game-balance assumptions clearly labeled as mock, NASA/JPL source list and units.
4. **First shared vertical slice:** Mission 02, one rover, two possible routes, one Scan/Analyze/Transmit sequence.
5. Add all 3 wheel variants; solar recharge; lander swap + RC; mission 01 tutorial; debrief.
6. Only then extend to more environments/mission 03 if time remains.

## Done / review gates

- Same route + wheel setup produces same result; preview matches the executed cost model.
- Each of two distinct routes to the same site can work with an appropriate loadout.
- No part of UI or scene secretly changes simulation resources.
- Payload cap includes installed + spare inventory, not just the visible rover.
- Real NASA values are source-backed; mock multipliers are plainly disclosed.
- Full science objective → transmit → score/RC → debrief loop works, plus failure/partial paths.
- npm run build and manual run-through pass; UI screenshots/GIF and PR link accompany each merge.

**No claim that all features are coded yet.** The checked-in app is a compilation scaffold until owner PRs land.

Links: [GDD](APOGEE_GDD.md) · [Handoff](IMPLEMENTATION_HANDOFF.md) · [Interfaces](INTERFACES.md) · [Collaboration](COLLABORATION.md).
