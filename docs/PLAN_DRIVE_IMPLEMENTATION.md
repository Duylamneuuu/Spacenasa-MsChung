# Plan & Drive — implementation notes

- Runtime contract: `src/types/expedition.ts`. The scene receives state, control mode, route estimate and a waypoint callback; rules live in `src/sim/expedition.ts`; balance data in `src/data/expedition.ts`; mission IDs and coordinates in `src/content/expedition.ts`; all player-facing text (EN and VI) in `src/i18n.ts`.
- `stepDrive` advances the pose from held keys at a fixed 1/60 s step; one cell is 4.4 m. W/S set a signed speed, A/D change heading. Only distance actually driven costs energy and time; pausing never moves the rover. There is no tyre physics or real geology.
- Risk comes from terrain, wheel and a fixed per-cell roughness; no RNG. The scanner narrows an estimate range.
- The route estimate covers straight legs between waypoints and can differ when the player turns, deviates or approaches a sample from another side. Scan, Analyze, Transmit and Recharge add their own time.
- Mission 02: Wide Traction can drive straight from the starting heading; Lightweight completes via the suggested north detour. Mission 01 needs two transmissions; with Standard Storage the first sample must be sent before analysing the second.
- The tutorial (`tourStep` in `src/ui/ExpeditionOperations.tsx`) derives each step from game state, so it advances only after the player completes the action and cannot drift out of sync.
- `npm ci`, `npm test`, `npm run build`; `npm run preview` serves the build. `main` deploys to Vercel automatically.
- Final model: see [MODEL_IMPORT_SPEC.md](MODEL_IMPORT_SPEC.md). Mission 03 is not built.

## Verification

- Node 20 CI: `npm ci`, 11 engine tests and `npm run build` pass.
- Chromium, keyboard, live build: Mission 01 with the Vietnamese tutorial end to end (50 / 20 RC); Mission 02 on both routes (60 / 24 RC); safety stop with light wheels in sand; Start drive without input stays still; Replan keeps position; Enter in the tactical map no longer starts the drive.
- Not exercised in a browser: garage swap (engine tests only). No touch controls.

Earlier screenshots from the PR #7 build (`58206fc`, previous UI) remain in [evidence/](evidence/) for history.
