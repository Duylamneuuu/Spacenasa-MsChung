# Rover science and terrain data — Sơn

Source-of-truth design: ../../docs/APOGEE_GDD.md; contract/handoff: ../../docs/CONTENT_DATA.md.

**Own this directory:** src/data/. Hải consumes structured terrain, wheel, mission and solar inputs; he does not silently invent scientific figures.

Expected datasets (proposals, align types with Duy/Hải):
- terrain graph/grid: hard plain, soft sand, sharp rock; slope and shadow are optional overlays
- 3 wheel records: light, wide, reinforced; mass/budget/energy/risk effects
- lander + rover + installed module + spare module total mass constraints
- a mock science/power model and at least one genuinely sourced NASA/partner number, with units and uses documented under docs/science/

**Do not present balance values (EU per segment, RC, wheel coefficients) as NASA engineering measurements.** Record original URL, access date, unit, assumption and where the number affects a calculation. No magical infinite power, instant supply pods or perfect scanner.
