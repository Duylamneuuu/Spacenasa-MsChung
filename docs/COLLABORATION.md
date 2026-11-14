# Team MS Chung — GitHub collaboration guide

## Main principle

**One GitHub repository, one React app, one always-buildable `main` branch.**

Code ownership (by folders) and Git branches are different:
- Duy: `src/App.tsx`, `src/ui/`, `src/styles.css`, integrator, `package.json`
- Bảo: `src/scene/`, `public/assets/3d/`
- Hải: `src/sim/`, simulation and rule tests — **consumes** data, does not own it
- Sơn: `src/data/`, `docs/science/` — NASA sources, structured data, units, assumptions
- Cường: `src/content/`, `docs/design/`, `public/assets/ui/` — story, events, game flow, design and pitch

**Workstream 4 — Sơn + Cường:** both use `feat/content-data`, but own separate folders. Coordinate commits/pulls so neither overwrites the other's work.

**Shared contracts:** `src/types/game.ts` and `docs/INTERFACES.md`. Duy coordinates proposed interface changes *before* they are coded. Every module should compile with its neighbor's placeholder.

## Branch workflow — fast, safe, visible

Four workstream branches are `feat/ui` (Duy), `feat/scene` (Bảo), `feat/simulation` (Hải), and `feat/content-data` (Sơn + Cường). Use these for first PRs. For subsequent tasks, prefer short-lived branches such as `feat/scene-launch-effect` from the *latest main*.

```bash
git clone https://github.com/Duylamneuuu/Spacenasa-MsChung.git
cd Spacenasa-MsChung
npm install
npm run dev
# Pick your team's agreed branch:
git fetch origin
git switch feat/scene
git pull --ff-only origin feat/scene
# edit files in your own folder...
git add src/scene
git commit -m "feat(scene): add clickable control panels"
git push -u origin feat/scene
```

**Open a Draft Pull Request into `main` as soon as you have a working slice.** PRs let others see *Files changed*, review code, and inspect Build check even before completion. When ready: update with `main` (merge or rebase), mark PR ready, request Duy's review, and merge after CI passes. **Do not push to main directly.**

For a new task after merging:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/scene-launch-effect
# work; commit; push; open PR
```

If sticking with a workstream branch and it has not been deleted, update it after each merge:

```bash
git switch feat/scene
git fetch origin
git merge origin/main
git push origin feat/scene
```

Never force-push another person's branch or overwrite its changes.

## Workstream 4 procedure (Sơn + Cường)

- Cường defines mission narrative, event options and player-facing text in `src/content/`, with UX assets / references in `docs/design/`.
- Sơn validates actual NASA facts, numbers, mission constraints and sources in `src/data/` and `docs/science/`.
- Both work on `feat/content-data` and run `git pull --ff-only origin feat/content-data` before starting their next commit.
- Never let an agent edit `src/sim/`, `src/App.tsx`, shared types or both owners' files from this branch without agreement.
- Post a Draft PR early so Hải can review the schema and consume mock content without blocking.
- See `docs/CONTENT_DATA.md` for deliverables.

## Update routine (throughout the day, not just once per day)

- Every 60–120 min: push a coherent working commit to the branch.
- Open/update a Draft PR with screenshot, preview, or simple test instructions.
- Check GitHub Issues for task progress; each task is one issue with an owner named in the title/body.
- Duy merges small PRs into `main` after checking Build check and the integration demo.
- Every 2–3 hours: Duy validates end-to-end `briefing → design → launch → events → outcome` to catch incompatibilities early.
- Changes to `package.json`, shared types, routing and global CSS need Duy's approval.
- Last few hours: freeze new features; fix integration issues only.

## See what others are doing

- **GitHub Issues**: assignment, planned/doing/done, and acceptance criteria.
- **GitHub Pull Requests**: see current branch diff, draft PR status and reviews.
- **GitHub Actions**: see whether the combined React/Three.js build passes.
- **GitHub network/compare**: visualize branch progress and commits.
- **Vercel (optional):** Duy connects the repository to Vercel and lets it generate a shared `main` production URL and individual PR preview URLs (provider configuration and access still required).

Useful links:
- https://github.com/Duylamneuuu/Spacenasa-MsChung/issues
- https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls
- https://github.com/Duylamneuuu/Spacenasa-MsChung/actions

## Access and safe sharing

Duy should invite the other contributors at GitHub **Settings → Collaborators** using their actual usernames (not their Vietnamese names). Never put personal access tokens in chat or source code. Repo is currently public — avoid private data and account keys.

## MVP discipline

Game logic (Hải) must be plain TypeScript with no React/Three.js imports. Scene (Bảo) only renders state and emits clicks. UI (Duy) routes clicks to simulation and renders the results. Sơn and Cường own the input data and game content, without editing the app entrypoint. Hải imports those sources and implements their effects; Duy coordinates cross-module integration.

Current `src/sim/engine.ts` and `src/scene/MissionScene.tsx` are **wiring-only placeholders**, not validated game mechanics or NASA mission calculations.
