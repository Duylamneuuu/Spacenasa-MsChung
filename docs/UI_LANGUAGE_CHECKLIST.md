# APOGEE — English-only game language checklist

**Policy:** All **player-visible** game content is 100% English. Internal team communication and technical documents may be Vietnamese. Do not infer that source-code comments must be translated; focus on strings reaching gameplay UI or logs.

## Required audit scope
- Home, mission selection, rover design, preflight, planning, driving, scanner, analyze/transmit, garage, debrief, retry.
- All headings, labels, buttons, tooltips, warnings/errors/empty/loading states, progress messages, keyboard hints and camera hints.
- Narration/science facts, mission site descriptions, HUD telemetry, unit captions, score/credit feedback, failure explanations.
- Runtime strings emitted in `src/sim/roverEngine.ts`, `src/sim/engine.ts`, `src/data/` and `src/content/` if rendered in the UI.
- Image alt text, aria-labels, titles, keyboard instruction popups, modal controls, console messages shown to players.
- No stray Vietnamese strings from old rover logs, ISRU crafting or rocket stepper.

## Recommended English UI terms
- Planning Mode · Start Drive · Driving Mode · Pause · Replan Route · Resume
- Add Waypoint · Undo · Clear Route · Route Estimate · Estimated Energy · Actual Energy · Estimated Time · Elapsed Time · Risk Level · Unscanned Terrain
- Forward (W) · Reverse (S) · Steer Left (A) · Steer Right (D) · Brake (Space)
- Terrain Scanner · Analyze Sample · Transmit Data · Recharge · Battery · Science Score · Research Credits · Lander Garage · Mission Report
- First Survey · The Dune Crossing · Into the Crater

## Test acceptance
1. Navigate every screen in a real browser and capture screenshots.
2. Trigger at least one success, one partial/failure, low battery, scan, transmit duplicate, module swap and a boundary/stuck state.
3. Confirm text remains English under each state, including unexpected errors.
4. Search source for Vietnamese diacritics in JSX/quoted strings and the log/data pathways; manually classify code comments and researcher notes as exempt.
5. Keep string copy semantic and concise; report any untranslated string with file and line number.

**Note:** Manual WASD is a game-based educational simplification, not literal real-time Earth control of a Mars rover.
