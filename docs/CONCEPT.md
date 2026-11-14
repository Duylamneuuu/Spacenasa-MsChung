# Concept v0 — Mission Control

## Creative direction

**Core fantasy:** You are a mission director in a compact space control room. You cannot afford every instrument or every safety margin. Build a mission, see it launch, respond to failure, and learn the cost of your decisions.

**View:** a fixed 3D **isometric / orthographic** camera over a tiny low-poly mission-control diorama. Think stylized cutaway room, **not** full freely roaming 3D or a huge RimWorld colony.

**Visual identity:** restrained NASA-inspired sci-fi control room; dark navy, warm off-white panels, amber warning lights, cyan active highlights; large readable UI. No NASA endorsement claim. Do not copy copyrighted character art/screenshots from reference games.

**Interaction:** click on stations / obvious buttons, not free movement. Scene objects can animate on state changes; all critical decisions appear in HTML panels.

## UI proposal

- **Top:** mission name / phase progress (Plan → Design → Launch → Operations → Debrief)
- **Left:** mission objectives and build panel / event cards
- **Center:** Three.js diorama with interactable consoles and a spacecraft miniature
- **Right:** always-visible budget, mass, generated/required power, communication reliability, mission risk; exact metrics to be approved by science lead
- **Bottom:** event log and primary action button
- **Accessibility:** readable English labels, non-color-only state indications, lower-motion fallback, desktop-first.

## MVP playable loop

1. **Mission briefing**: one objective (e.g. lunar reconnaissance). Present limits and success criteria.
2. **Design**: pick 1 launcher and choose a payload / solar/power / comm package. Each choice has tangible pros/cons.
3. **Preflight**: show pass/fail checks (cost, mass, power, communications and any scientifically justified simplified flight feasibility). Explain assumptions.
4. **Launch**: short cinematic transition in 3D; no need for realistic flight controls or physics engine.
5. **Operations**: 2–3 scripted but state-aware challenges. Choice affects mission resources and outcome.
6. **Debrief**: success / partial success / failure with *why*, NASA source references and play-again.

## Hard scope limits

- Only **one** fully playable mission for first submission.
- No multiplayer, open-world movement, character AI, procedural colony simulation, or full solar-system engine.
- No complicated backend, realtime NASA API dependency, login or leaderboard.
- 3D visuals are presentation; the simulation engine is a separate pure TypeScript module.
- Do not hardcode scientific facts as true until reviewed by aerospace lead.

## NASA data evidence

A small bundled dataset is fine as long as it is actually used and attributed. Science owner records source URL, date read, units, extraction method, and every simplifying assumption.

Candidate starting references (must be validated before use):
- NASA/JPL Solar System Exploration and planetary/moon facts: https://science.nasa.gov/solar-system/
- NASA NSSDC Moon Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- JPL Horizons (if needed): https://ssd.jpl.nasa.gov/horizons/
- NASA 3D Resources (models; confirm license/attribution for each asset): https://nasa3d.arc.nasa.gov/

## What makes this different

The story and visual world make complex engineering decisions approachable; explainable scoring ties every player action to mission feasibility. *A pretty 3D room without meaningful trade-offs is not a complete answer to the challenge.*
