# Team execution plan — November 14–15, 2026

## Exactly 4 workstreams — 5 people

| Workstream | Owner(s) | Branch | Folder ownership / deliverable |
|---|---|---|---|
| **1. Frontend + UI/UX** | **Duy** | `feat/ui` | `src/App.tsx`, `src/ui/`, `src/styles.css`, `src/types/`: app integration, panels, screen flow and shared types coordination |
| **2. Three.js + 2.5D scene** | **Bảo** | `feat/scene` | `src/scene/`, `public/assets/3d/`: low-poly isometric scene, interactions, animations and state feedback |
| **3. Simulation / game logic** | **Hải** | `feat/simulation` | `src/sim/`, tests: resource calculations, mission constraints, event effects, feasibility, results |
| **4. Idea + Content + NASA Data** | **Sơn (HUST) + Cường (PTIT)** | `feat/content-data` | **Sơn:** `src/data/`, `docs/science/`, verified NASA facts and assumptions. **Cường:** `src/content/`, `docs/design/`, `public/assets/ui/`, story/events/visual design/pitch |

**One shared 4th branch, but two separate folder owners:** Sơn edits data/science; Cường edits content/design. They sync before pushing, never independently overwrite the same file. Duy signs off on the concept/scope.

## Four-part integration flow

```
Sơn + Cường: NASA data, missions, event text
                  ↓ (typed data imports)
Hải: deterministic simulation and game rules
                  ↓ (MissionState)
Duy: React UI / decisions  ⇄  Bảo: Three.js scene
                  ↓
            single playable app
```

- Simulation consumes source-backed numbers, but **does not own or silently invent scientific data**.
- Data/content does not decide runtime state calculations: it provides values, choice text and documented effects that Hải validates and implements.
- Duy coordinates contract changes in `src/types/game.ts` and `docs/INTERFACES.md`.
- Keep game design scoped: one complete mission, ~3–5 minutes per playthrough.
- Cường gives Bảo a prioritized asset list and Duy a short UX flow; Sơn gives Hải documented figures early.

## Collaboration / milestones

1. Agree one mission and the minimum content/data schema; use placeholders only while validated figures arrive.
2. First end-to-end slice: a mission option → simulation resource change → UI update → scene reaction.
3. Bảo, Hải and Duy each push small, reviewable PRs; Sơn/Cường push content/data together in their branch.
4. Duy merges after `npm run build` succeeds and a short demo works.
5. Freeze feature scope early enough to test two possible outcomes, data sources, references and demo.

## Branches & merge rules

- Four branches: `feat/ui`, `feat/scene`, `feat/simulation`, `feat/content-data`.
- Long-running streams are initial starting points; prefer short-lived per-task branches from up-to-date `main` after first merge.
- Do not wait until night to merge. Every contributor reviews changes in GitHub Pull Requests.
- Changes to shared types, dependencies or app entrypoint go through Duy.
- Science values and NASA citation data require Sơn's check; narrative/event terms require Cường's check.
- Keep original assets and their licenses/credits documented.

## Minimum acceptance test

1. New player understands the goal within 15 seconds.
2. Two engineering choices produce measurably different results.
3. One complete mission can be finished in 3–5 minutes.
4. Success and failure paths work and are explained.
5. At least one NASA or partner dataset genuinely influences the game, with URL, units, assumptions and attribution.
6. Another device can run the deployed browser demo without secrets.

See [Content & Data handoff](CONTENT_DATA.md) and [GitHub collaboration guide](COLLABORATION.md).
