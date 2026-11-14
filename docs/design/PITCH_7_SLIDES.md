# APOGEE — Mars Rover Architect
## NASA Space Apps Challenge 2026 · Challenge 13: Space Mission Design Game
### Official 7-Slide Project Demonstration Pitch Deck (Team MS Chung — Hanoi, Vietnam)

---

## SLIDE 1: Title & Overview
- **Slide Title:** APOGEE — Mars Rover Architect
- **Subtitle:** Space Systems Engineering & Mission Design Simulator
- **Challenge:** Challenge 13: Space Mission Design Game
- **Team Name:** Team MS Chung (Hanoi, Vietnam)
- **Tagline:** *"Transforming abstract aerospace trade-offs into an interactive, hands-on 3D mission simulator."*
- **Visual Suggestion:**
  - Background: 3D interactive Mars globe from the Start Menu / Mission Control diorama.
  - Logos: NASA Space Apps Challenge 2026 & Team MS Chung logo.
- **Presenter Script (15s):**
  > "Welcome to APOGEE. We are Team MS Chung from Hanoi, Vietnam. Space mission engineering is often taught through dry equations, but on Mars, every single gram and watt matters. We built APOGEE to let students design, launch, and operate their own Martian rover missions from concept to touchdown."

---

## SLIDE 2: The Core Problem & Challenge
- **Slide Title:** The Problem: Space Systems Trade-Offs Are Abstract
- **NASA Challenge Prompt:**
  - Design a game balancing **9 competing demands**: Mission objectives, Spacecraft design, Scientific instruments, Launch vehicles, Budgets, Power, Mass, Communications, and Orbital constraints ($\Delta v$).
- **The Student Dilemma:**
  - Textbook formulas don't show the pain of failure.
  - Students rarely get to experience the interconnected consequences of aerospace decisions from initial concept to live surface operations.
- **Our Goal:**
  - Replace passive quiz mechanics with a **deterministic trial-and-error simulation** where poor design leads to realistic, memorable mission outcomes.
- **Visual Suggestion:**
  - Diagram showing the "Vicious Cycle of Aerospace Trade-Offs":
    *More Heavy Instruments ➔ Increased Mass ➔ Bigger Rocket Needed ➔ Higher Budget ➔ Reduced Orbital Delta-v.*
- **Presenter Script (20s):**
  > "NASA's challenge highlights nine competing demands. In the classroom, these trade-offs feel abstract. If you choose heavier tires, your rocket payload increases, requiring more fuel and a bigger budget. APOGEE makes these invisible trade-offs visual and interactive through trial-and-error gameplay."

---

## SLIDE 3: The Solution: "Plan & Drive" Gameplay
- **Slide Title:** Our Solution: The "Plan & Drive" Architecture
- **Key Differentiator:**
  - **Not a Multiple-Choice Quiz.**
  - **Not a Hands-Off Autopilot Game.**
- **The Dual-Phase Tactical Loop:**
  1. **Planning Mode (Earth-side Mission Control):**
     - Click waypoints across 3D Martian terrain.
     - Generates real-time estimates for energy consumption (⚡), travel time, and hazard risk bands.
  2. **Driving Mode (Operator WASD Control):**
     - Hit **START DRIVE** to take direct manual control using W/A/S/D.
     - Planned route serves as guidance, not autopilot.
     - Deviating into rough terrain or sand dunes incurs actual friction and battery penalties.
- **Visual Suggestion:**
  - Split screen: Left shows Planning Mode with waypoints & energy forecast; Right shows 3D chase-camera rover driving over Martian sand ripples.
- **Presenter Script (25s):**
  > "Instead of automated autopilot, APOGEE introduces 'Plan & Drive'. Players plan their route on Earth with energy and risk estimates, then manually drive the rover across Mars using WASD. Lured by a sandy shortcut? Take it, but face the real physics of sinkage and battery drain."

---

## SLIDE 4: Complete Mission Lifecycle (Concept to Operations)
- **Slide Title:** The Complete 5-Phase Mission Lifecycle
- **Step 1: PLAN (Landing Site & Objectives):**
  - Choose between *Utopia Planitia* (basalt lowlands, high sun), *Jezero Crater* (lakebed biosignatures, 35% sand), and *Valles Marineris* (deep shadows).
- **Step 2: DESIGN (Rover Subsystems & Depot Spares):**
  - Select wheels, sensors (NavCam vs. RIMFAX GPR), power (Solar vs. MMRTG), and comms (UHF vs. DSN dish). Pack spare modules into the Lander Depot.
- **Step 3: DECIDE (Launch Vehicle & Preflight Check):**
  - Balance Falcon Heavy, Atlas V, or SLS Cargo. Test Tsiolkovsky rocket equation feasibility ($\Delta v$).
- **Step 4: SIMULATE (Martian Surface Operations):**
  - Manage battery life, park on solar ridges to recharge, extract astrobiology core samples, and transmit data.
- **Step 5: DEBRIEF (Engineering Post-Mortem):**
  - Automated root-cause analysis diagnosing why choices led to S-Rank, B-Rank, or F-Rank.
- **Visual Suggestion:**
  - Stepper workflow showing screenshots of Briefing ➔ Design ➔ Preflight ➔ Operations ➔ Debrief screens.
- **Presenter Script (25s):**
  > "APOGEE covers the full mission lifecycle across 5 stages: selecting landing targets, configuring modular subsystems, calculating orbital Delta-v feasibility, executing tactical surface operations, and receiving an in-depth engineering debrief explaining exactly why the mission succeeded or failed."

---

## SLIDE 5: Real NASA Heritage & Scientific Grounding
- **Slide Title:** Grounded in Real NASA Heritage & Data
- **Real-World Missions Mapped to Gameplay Mechanics:**
  - **Spirit Rover at Troy (2009):** Milled aluminum wheels bogged down in disguised sulfate sands ➔ models a 50% immobilization risk and emergency reverse power drain.
  - **NASA Glenn Superelastic SMA Tires:** Airless Nitinol shape-memory alloy tires eliminate sand entrapment at a mass and budget premium.
  - **Perseverance RIMFAX Ground Radar:** 150–1200 MHz radar penetrates 10 m regolith to reveal subsurface hazards and buried samples.
  - **Solar Arrays vs. Nuclear MMRTG:** Solar relies on solar ridges and degrades in canyon shadows (Opportunity lessons); Plutonium-238 MMRTG provides 24/7 continuous power at heavy payload mass.
  - **NASA Deep Space Network (DSN):** Proximity UHF antenna requires staying near the lander; High-Gain X-band dish connects to Earth from anywhere on Mars.
- **Visual Suggestion:**
  - Comparison table linking NASA mission photos (Spirit at Troy, Perseverance RIMFAX, Glenn SMA wheel) with in-game module cards.
- **Presenter Script (25s):**
  > "Every parameter in APOGEE is rooted in NASA history. We model the Spirit rover's 2009 sand entrapment at Troy, NASA Glenn's superelastic Nitinol spring tires, Perseverance's RIMFAX subsurface radar, and the trade-off between solar arrays and nuclear MMRTG power."

---

## SLIDE 6: Technical Architecture & Rigorous QA
- **Slide Title:** Technical Architecture & Verification
- **Architecture Highlights:**
  - **Pure Client-Side Web App:** React 18, TypeScript, and Vite. Zero backend servers required; runs instantly in any modern browser.
  - **Custom 3D WebGL Engine:** Three.js and React Three Fiber rendering procedural Mars topography, diorama mission control, and interactive globes.
  - **Deterministic Simulation Core:** Dedicated `src/sim/` engine using clamped $\Delta t$ integration for reproducible travel cost, battery drain, and Delta-v physics.
- **Engineering QA & Verification:**
  - Automated GitHub Actions CI pipeline (Node 20 build pass).
  - Validated test cases (TC-01 through TC-11) testing safe stops, solar recharge rates, and two distinct winning routes in Mission 02.
  - 100% English player-facing copy, logs, and telemetry.
- **Visual Suggestion:**
  - Tech stack badges (React, Three.js, TypeScript, Vite, GitHub CI) alongside automated test run summary.
- **Presenter Script (20s):**
  > "Built with React, TypeScript, and Three.js, APOGEE runs 100% in the browser with zero installations. Our custom deterministic simulation engine ensures reproducible results, validated by automated GitHub CI test suites covering every mobility and power scenario."

---

## SLIDE 7: Educational Impact, Team & Open Source
- **Slide Title:** Educational Impact & Future Roadmap
- **Educational Impact:**
  - Teaches students systems thinking: seeing how a decision in Phase 2 impacts survival in Phase 4.
  - Completely free and open-source for classrooms and space enthusiasts worldwide.
- **Future Roadmap:**
  - Additional planetary bodies (Lunar South Pole, Titan), multiplayer collaborative mission control, and classroom teacher dashboards.
- **Team MS Chung (Hanoi, Vietnam):**
  - **Đoàn Lâm Duy:** Product Lead & Integrator
  - **Đào Hoàng Hải:** Simulation & Math Engineer
  - **Hoàng Mầu Sơn:** NASA Science & Data Lead
  - **Tống Gia Bảo:** 3D Scene & Visual Contributor
  - **Nguyễn Quốc Cường:** Game Designer & Pitch
- **Links:**
  - Code: `https://github.com/Duylamneuuu/Spacenasa-MsChung`
- **Presenter Script (15s):**
  > "APOGEE proves that space systems engineering doesn't have to be intimidating. By embracing trial, failure, and adaptation, we inspire the next generation of aerospace engineers. Thank you, and we invite you to take the wheel of your own Mars mission on GitHub!"
