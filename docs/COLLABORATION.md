# Team MS Chung — GitHub workflow for APOGEE

**One repo, one web app, four branches, five contributors.**

## Owners and paths

- **Duy** — feat/ui: App and UI, styles, integration, shared types and dependency changes.
- **Bảo** — feat/scene: Mars terrain, rover/3D assets, waypoint callbacks and animations.
- **Hải** — feat/simulation: pure TypeScript rules and tests, consuming but not owning scientific data.
- **Sơn** — feat/content-data: src/data/ and docs/science/ (NASA source/units/scientific caveats).
- **Cường** — feat/content-data: src/content/, docs/design/, public/assets/ui/ (missions, tutorial, design and pitch).

Sơn/Cường work on one shared branch but **different files**, always pulling before pushing. Duy coordinates src/types/game.ts, package.json and integration boundaries.

## Setup

```bash
git clone https://github.com/Duylamneuuu/Spacenasa-MsChung.git
cd Spacenasa-MsChung
npm install
git fetch origin
git switch feat/scene           # example for Bảo
git pull --ff-only origin feat/scene
npm run dev
```

## PR / merge discipline

1. Open **Draft PR** from your branch to main early; link its GitHub Issue and include screenshot/demo or state transition.
2. Make small working changes and push every 60–120 minutes where possible; **do not force-push** or overwrite another owner's files.
3. Fetch and merge the latest main on your workstream branch before proposing final merge; validate npm run build.
4. Duy reviews and merges a coherent end-to-end slice first, not isolated non-interacting modules.
5. If changing interfaces: discuss and let Duy merge the shared types first; everyone then pulls new main.

The old Mission Control scaffold is NOT the new APOGEE implementation. **Use docs/APOGEE_GDD.md + docs/INTERFACES.md**, not legacy examples in src/, to agree the target API.

## What to demo every 2–3 hours

Mission 02: Design rover → Preview short sand vs long safe route → Execute → Sample → Transmit → Debrief. Verify battery/time/RC and scene animation react consistently.

## Access

The repo is public, but public access does not let teammates push. Duy invites collaborators through Settings → Collaborators using actual GitHub usernames, or teammates can fork and create PRs. Never commit secrets or third-party restricted assets.

## Tracking

[Issues](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues) · [PRs](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls) · [Actions](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)

Dashboard: https://docs.google.com/spreadsheets/d/1vQaIcRW_29K1SndlQK_s5gxr29AArEWeHHig4Z-sVzQ/edit

**Google Sheet progress is manual**, not auto-synced with GitHub. Each task has one accountable owner. Do not assume an open GitHub Issue means the task has not been started.
