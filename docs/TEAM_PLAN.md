# Team execution plan — November 14–15, 2026

## Workstream ownership

| Owner | Folder / files | Deliverable |
|---|---|---|
| **Duy — Product/UI lead (integrator)** | `src/App.tsx`, `src/ui/`, `src/styles/`, `src/types/` | Mission screen, visible metrics, event/decision panels, final integration and browser demo |
| **Bảo — Three.js / 3D builder** | `src/scene/`, low-poly visuals | One performant Three.js cutaway room, clickable stations, visual reactions to game state, one launch transition |
| **Hải — Simulation/data builder** | `src/sim/`, `src/data/`, tests | Deterministic resource tradeoffs, event effects, feasibility evaluation, success/failure result |
| **Sơn (HUST) — Aerospace/science lead** | `docs/science/` and reviewed data notes | Credible NASA/JPL sources and units, validation of simplifications, explanation/technical Q&A |
| **Cường (PTIT) — Game designer** | `docs/design/`, approved assets, pitch content | Player journey, 2–3 choice events, diagram / icon kit, usability, concise slides and demo script |

If the game-design student is not a coder, do **not** assign them ownership of gameplay code or complicated 3D engine integration.

## Critical contract

**One app and one shared state model.** First confirm module/scene types in `docs/INTERFACES.md`.

- UI lead controls app entry and dependencies.
- 3D lead renders only, sends user interactions as callbacks.
- Simulation lead owns all mathematical and scoring rules.
- Science lead verifies sources before data are labeled accurate.
- Design lead supplies assets + copy and reviews clickable UX.

## Suggested sequence (local event schedule)

- **First 20 minutes:** 1 mission, 4–6 choices, science source, interfaces, 3 workstream owners.
- **First build milestone:** UI can click one module and a resource bar visibly changes. Placeholder boxes are fine.
- **Second milestone:** complete briefing → build → launch → event → results, all in-browser.
- **Third milestone:** replace placeholders with low-poly assets, improve feedback and one concise cinematic.
- **Freeze:** build test, manual playthrough, readme/data citations, screenshots, publicly accessible demo and submission.

## Merge rules

- Branch names: `feat/ui`, `feat/scene`, `feat/simulation`.
- PRs should merge in small vertical slices; agree in advance who merges.
- Never have all agents recreate the app from scratch.
- Avoid last-minute upgrades or engine changes.
- The science reviewer and designer can work without waiting for GitHub code.
- Keep original assets and their licenses/credits documented.

## Minimum acceptance test

1. A new player knows the goal within 15 seconds.
2. The game has at least two meaningful spacecraft designs with different outcomes.
3. The player can finish an entire mission in under five minutes.
4. Failure is explained; retry works.
5. NASA data is visibly used and properly referenced, with honest simplification notes.
6. A fresh browser on another laptop loads the production demo without API keys.
