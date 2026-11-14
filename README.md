# MS Chung — Space Mission Design Game

NASA Space Apps Challenge 2026 · **Challenge 13: Space Mission Design Game**.

**Working concept (proposal, not locked):** A short, decision-driven 2.5D isometric space mission simulator. Visual influence: The Sims (cutaway room view), RimWorld (resource management), 60 Seconds! (meaningful crisis choices). All artwork and designs must be original or appropriately licensed, not copied.

> IMPORTANT: Our game must let users **design, manage, and simulate an entire space mission**, showing engineering trade-offs and consequences. It is **not** an endless space colony builder.

## Start here — team collaboration

- [Collaboration guide: clone, branches, PRs, merge cadence](docs/COLLABORATION.md)
- [UI–3D–simulation shared interfaces](docs/INTERFACES.md)
- [Tasks: Duy, Bảo, Hải, Sơn, Cường](https://github.com/Duylamneuuu/Spacenasa-MsChung/issues)
- [Pull requests — see current code changes](https://github.com/Duylamneuuu/Spacenasa-MsChung/pulls)
- [Build check](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions)

Run the scaffold with **Node.js 20+**:

```bash
npm install
npm run dev
npm run build
```

The current 3D scene, simulation and resource values are **mock placeholders**, not a finished game or NASA-verified physics. Duy owns integration; contributors use PRs, never push directly to `main`.

## Mission loop (MVP)

1. **Plan:** Select one mission objective, inspect constraints and available budget.
2. **Build:** Choose a spacecraft/launcher configuration and scientific payload; see budget, mass, power and communication trade-offs.
3. **Launch:** Run a simplified, explainable mission feasibility check; mission may fail if constraints are violated.
4. **Operate:** Play 2–3 decision events (power shortfall, communications issue, instrument risk) with persistent resource effects.
5. **Debrief:** Display mission outcome, science return, and *why* the engineering choices mattered.

**MVP target:** one mission scenario (suggested lunar reconnaissance orbiter), ~3 meaningful module choices, 2–3 events, one failure case and one success case; a browser-playable demo.

## Technical direction

- React + TypeScript + Vite
- Three.js via **@react-three/fiber** and **@react-three/drei**; fixed orthographic camera for low-poly 2.5D/isometric scene
- HTML/CSS UI overlay for readable panels, decisions, mission dashboard
- Pure TypeScript simulation engine; a simple local, deterministic data model
- No backend/database required for the MVP; add one only if the chosen functionality demonstrably needs it
- Mission reference data: source and verify real NASA/JPL documentation, stored with URLs, units, and simplification notes. **Do not invent NASA data or present an educational approximation as a validated aerospace simulator.**

## Team workflow

### Team MS Chung

| Member | Responsibility | Working branch |
|---|---|---|
| **Duy** | Product Lead, UI/UX, frontend integration | `feat/ui` |
| **Bảo** | Three.js 2.5D scene, visual interactions, 3D assets/animation | `feat/scene` |
| **Hải** | Simulation engine, NASA data integration, tests | `feat/simulation` |
| **Sơn (HUST)** | Aerospace/science reviewer, NASA sources, scientific validation | Science documentation / review |
| **Cường (PTIT)** | Game design, visual assets, event flow, pitch materials | Design documentation / assets |

- **One repository, one application.**
- Integrator owns `src/App.tsx`, app entrypoints, styles and dependency changes.
- Scene/gameplay contributor owns `src/scene/`, animation, 3D assets.
- Simulation contributor owns `src/sim/`, `src/data/`, game rules and tests.
- Aerospace reviewer validates science, data and any simplified equations.
- Game designer owns experience flow, event wording, asset guide, usability, slides/demo.
- Agree the shared interfaces in `docs/INTERFACES.md` **before** coding independently.
- Branches: `feat/ui`, `feat/scene`, `feat/simulation`; PR into `main` or the coordinator's agreed integration branch. Do not rewrite another person's folder or overwrite `package.json` independently.
- Integrate a minimal end-to-end slice early, not three standalone apps.

See `docs/CONCEPT.md`, `docs/INTERFACES.md`, and `docs/TEAM_PLAN.md`.

## Official context

- https://www.spaceappschallenge.org/2026/challenges/
- https://www.spaceappschallenge.org/resources/project-submission-guide/

This repo is a working concept and collaboration scaffold; implementation and scientific assumptions must be documented and verified during the hackathon.
