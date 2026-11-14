# Rover missions / game copy — Cường

GDD: ../../docs/APOGEE_GDD.md · Design handoff: ../../docs/CONTENT_DATA.md

**Own this directory:** src/content/. No physics, random secret rules, or React/Three.js dependencies in content.

Build three **mission definitions on ONE Mars map**:
- 01 First Survey — P0 tutorial and near-landed science targets
- 02 The Dune Crossing — P0 sandbox of alternative routes, short sandy shortcut vs longer hard-ground detour
- 03 Into the Crater — P1 only: slope, sharp rock and sunlight constraints

Provide stable mission/site IDs, objective/reward metadata, tutorial prompts, debrief messages, NASA/fictional RC disclaimers, and **more than one viable strategy** for Mission 02. Keep a 3–5 minute judge demo with original/licensed low-poly assets documented in docs/design/.

Sơn owns science/static numeric inputs under src/data/; align IDs without editing each other's files.
