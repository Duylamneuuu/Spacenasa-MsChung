# MS Chung — GitHub collaboration / APOGEE Plan & Drive

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).


## Ownership
Duy: feat/ui, App/UI/CSS & coordinated types. Bảo: feat/scene and public/assets/3d. Hải: feat/simulation and tests. Sơn: src/data/ + docs/science/. Cường: src/content/ + docs/design/ + public/assets/ui/. Last two share feat/content-data but **do not share edited files**.

## Read the source
[Approved GDD](APOGEE_GDD.md) · [Interface contract](INTERFACES.md) · [Work prompt](WORK_MASTER_PROMPT.md). The current repository already contains manual WASD implementation, but **Planning Mode** and English-language cleanup still require verification/implementation.

## Safe workflow
```bash
git clone https://github.com/Duylamneuuu/Spacenasa-MsChung.git
cd Spacenasa-MsChung
git fetch origin
git switch feat/scene  # choose the branch for your role
git pull --ff-only origin feat/scene
npm install
npm run dev
npm run build
```

1. Create small, reviewable PRs with evidence. Avoid pushing shared changes without coordination; never force-push team branches.
2. Before edits, fetch latest main and inspect active PRs/commits; **do not reset** work already written by teammates.
3. Duy owns shared interfaces; inspect actual code rather than implementing hypothetical APIs in isolation.
4. Scene emits user actions and renders rover; simulation owns the actual physics/game resource state; UI displays and dispatches.
5. Demo every 2–3 hours: Plan waypoint → Start Drive → manually drive WASD → energy/time/risk update → science analysis → transmit → report.
6. Every player-visible string must be English (including logs/errors, image alt and ARIA). Docs can remain Vietnamese.
7. Source NASA figures with units and label game balance as mock. No claim of NASA endorsement.

[GitHub Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [PRs](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions).
