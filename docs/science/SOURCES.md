# NASA Scientific References, Control Abstraction & Data Boundaries

> **Project:** APOGEE — Mars Rover Architect (Team MS Chung)  
> **Competition:** NASA Space Apps Challenge 2026 — Challenge 13: *Space Mission Design Game*  
> **Specification Alignment:** Approved GDD v2 (**Plan & Drive**, English-only player experience)  
> **Last Audited Against Repo:** `origin/main` (`7606934`) · **Verification Date:** 2026-11-14

---

## 1. Scientific Honesty Policy & Scope

APOGEE is an **educational space mission trade-off simulator**, not flight-certified aerospace mission planning software, a rigid-body terramechanics solver, or a real-time spacecraft teleoperation console.

Every mechanism in this document is explicitly separated into three categories:
1. **Verified NASA / JPL Physical Fact:** Supported directly by primary NASA/JPL/NTRS references listed below (URLs checked live HTTP `200 OK` on 2026-11-14).
2. **Approved Gameplay Rule (`GAME BALANCE — NOT NASA DATA`):** Fictional numerical parameters defined in `docs/APOGEE_GDD.md` for balanced 3–5 minute educational decision-making.
3. **Current Codebase Verification (`origin/main` @ `7606934`):** Whether the rule is actually present in `src/` today or still awaiting the **Plan & Drive** migration. No reference in this file is claimed to drive gameplay unless directly verified in code.

---

## 2. Primary NASA / JPL References & What Each Supports

### 2.1 Navigation & Hazard Cameras (`NavCam` / `HazCam`) vs. Subsurface Radar (`RIMFAX`)

| System | Verified NASA / JPL Facts | Primary Reference URL | What It Supports in APOGEE |
|---|---|---|---|
| **Engineering Cameras (`NavCam` & `HazCam`)** | NASA's Perseverance carries **two color stereo Navigation Cameras (`NavCam`)** high on the mast (able to resolve an object the size of a golf ball at 25 m / 82 ft) and **six Hazard Avoidance Cameras (`HazCam`: 4 front, 2 rear)** mounted low on the body. Stereo 3D terrain meshes detect geometric surface hazards—such as boulders, trenches, and visible sand dunes—and enable local autonomous pathing, but **cannot see beneath surface dust or crust**. When "blind-driving" without visual checks, rovers cannot detect wheel slippage directly from wheel rotation counts alone. | • [NASA Perseverance Rover Components](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/)<br>• [JPL Mars 2020 Perseverance Press Kit](https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/perseverance_rover/) | Supports APOGEE's **Terrain Scanner** as a surface-line-of-sight and partial hazard-estimation system. Unscanned sectors retain uncertainty (`Unscanned Terrain` / estimated risk band) rather than granting infallible map knowledge. |
| **Subsurface Ground-Penetrating Radar (`RIMFAX`)** | **RIMFAX** (*Radar Imager for Mars' Subsurface Experiment*) is mounted on the **lower rear** of Perseverance beneath the power unit. It transmits radio waves downward as the rover drives to image subsurface geological stratigraphy down to roughly **10 m (33 ft)** depth, using signal travel time and rock dielectric permittivity to distinguish igneous vs. sedimentary layers. It is a **scientific geological profiler along the rear track**, **not** a forward-looking safety radar that guarantees 100% early detection of buried soft-sand traps ahead of the wheels. | • [NASA Science — Searching for Buried Treasure on Mars With RIMFAX](https://science.nasa.gov/blog/searching-for-buried-treasure-on-mars-with-rimfax/)<br>• [NASA Science — RIMFAX Location on Perseverance Illustration](https://science.nasa.gov/resource/rimfax-location-on-nasas-perseverance-rover-illustration/) | Prevents conflating optical hazard cameras (`NavCam`/`HazCam`) with subsurface geological radar (`RIMFAX`). Explains why APOGEE's **Basic / Enhanced Terrain Scanner** offers only partial, range-limited terrain confidence and **never guarantees 0% hazard risk**. |

---

### 2.2 Martian Terrain & Wheel Engineering Trade-Offs

| Topic | Verified NASA / JPL Facts | Primary Reference URL | What It Supports in APOGEE |
|---|---|---|---|
| **Concealed Soft Sand & Entrapment (`Spirit` at Troy, 2009)** | In April 2009, NASA's Mars Exploration Rover **Spirit** broke through a thin, crusted top layer into hidden, unconsolidated sulfate-rich sand at a site called **Troy** in Gusev Crater. Combined with a previously failed right-front wheel, high sinkage and slip permanently immobilized the rover, preventing it from tilting its solar panels toward the Sun for Martian winter and ending its mobile mission. | • [JPL — NASA Trapped Mars Rover Finds Evidence of Subsurface Water](https://www.jpl.nasa.gov/news/nasa-trapped-mars-rover-finds-evidence-of-subsurface-water/)<br>• [NASA NTRS — MER Spirit End of Mission Report (20160001767)](https://ntrs.nasa.gov/citations/20160001767)<br>• [NASA Science — Mars Exploration Rover Spirit](https://science.nasa.gov/mission/mer-spirit/) | Supports the **Soft Sand** terrain hazard: dust-covered regolith can hide loose material that sharply raises energy cost, slows travel speed, and risks immobilization—especially for narrow/light wheels (`W1`). |
| **Sharp Rock Wear vs. Tread Redesign (`Curiosity` vs. `Perseverance`)** | **Curiosity's** aluminum wheels (**50.8 cm / 20 in** diameter, **24** pointed chevron grousers) suffered dents and punctures from sharp, wind-carved rocks in Gale Crater. **Perseverance's** aluminum wheels were redesigned to **52.6 cm (20.7 in)** diameter (also cited as 52.5 cm in NASA overview specs), narrower profile, **twice as thick** wheel skin, and **48** gently curved grousers—improving damage tolerance over sharp rocks and performance across both rocks and sand while altering mass and contact behavior. | • [NASA Science — Curiosity's and Perseverance's Wheels](https://science.nasa.gov/resource/curiositys-and-perseverances-wheels/)<br>• [NASA Perseverance Rover Components](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/)<br>• [JPL Mars 2020 Perseverance Press Kit](https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/perseverance_rover/) | Supports separating **Hard Plain**, **Soft Sand**, and **Sharp Rock** terrain penalties and explains why **no single wheel dominates every surface** (wide traction wheels help on sand; thicker reinforced treads trade mass/budget for sharp-rock durability). |
| **Superelastic Shape Memory Alloy (SMA) Tires** | Researchers at **NASA Glenn Research Center** developed airless nickel-titanium (**NiTi**) **Superelastic Tires** capable of large reversible lattice deformation (absorbing sharp rock impacts without permanent plastic denting) while conforming to terrain to lower peak ground pressure. | • [NASA Technology Transfer — Superelastic Tire (LEW-TOPS-99)](https://technology.nasa.gov/patent/LEW-TOPS-99) | Provides real aerospace engineering inspiration for durable/compliant wheel variants (**W3 Reinforced** / advanced wheel builds) while keeping numeric mass, budget, and durability penalties strictly **GAME BALANCE**. |

---

### 2.3 Sunlight, Atmospheric Dust, Shadows & Solar Power on Mars

| Factor | Verified NASA / JPL Facts | Primary Reference URL | What It Supports in APOGEE |
|---|---|---|---|
| **Solar Flux, Dust Deposition & Global Storms (`MER Opportunity` & `Spirit`)** | Mars orbits at an average **1.5 AU (228 million km)** from the Sun with a **24.6-hour solar day (sol)**, receiving substantially less solar irradiance than Earth. Solar-powered rovers (**Spirit** and **Opportunity**) relied on deployable solar panels to recharge batteries. Accumulated surface dust degraded array output until occasional wind gusts swept panels clean (boosting Spirit's array output from **~60% to ~93%** in March 2005). Conversely, severe dust storms slashed Opportunity's energy to **128 watt-hours** in July 2007 (forcing indefinite suspension of science), entering the **Perseverance Valley** gully in 2016 reduced Sun exposure and energy levels, and the **2018 Mars-wide dust storm** cut solar charging until Opportunity lost contact on June 10, 2018. | • [NASA Science — Mars Exploration Rover Opportunity](https://science.nasa.gov/mission/mer-opportunity/)<br>• [NASA Science — Mars Exploration Rover Spirit](https://science.nasa.gov/mission/mer-spirit/)<br>• [NASA Science — Mars Facts](https://science.nasa.gov/mars/facts/) | Supports APOGEE's unified **Battery + Solar Recharge** model: driving and science operations drain battery; recharging requires **adequate sunlight, stationary parking (no free movement power), and elapsed mission time**, while shadowed canyons/dust suppress charge rate. |

---

### 2.4 Why Manual `WASD` Driving Is an Educational Control Abstraction

| Constraint | Verified NASA / JPL Facts | Primary Reference URL | What It Supports in APOGEE |
|---|---|---|---|
| **Light-Time Latency, Low Physical Speed, & Onboard `AutoNav`** | Radio signals through NASA's **Deep Space Network (DSN)** (34 m and 70 m antennas) suffer up to a **44-minute round-trip communication delay** between Earth and Mars at maximum orbital separation (~3 to 22 minutes one-way). Furthermore, Perseverance's top speed on flat, hard ground is under **0.1 mph (152 meters per hour, ~4.2 cm/s)** while consuming under **200 W** for mobility. Consequently, **NASA never drives Mars rovers interactively with a live joystick from Earth**. Instead, Earth-based rover planners build route plans with specific stops on 3D stereo maps and uplink command sequences; onboard **AutoNav** generates local 3D hazard maps and routes around boulders autonomously. | • [NASA NTRS — Assessment of Communication Delay Research (20250000703)](https://ntrs.nasa.gov/citations/20250000703)<br>• [NASA SCaN — Communicating with Missions (DSN)](https://www.nasa.gov/communicating-with-missions/)<br>• [NASA Science — How Perseverance Drives on Mars](https://science.nasa.gov/resource/how-perseverance-drives-on-mars/)<br>• [NASA Perseverance Rover Components](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/) | Explains APOGEE's **Plan & Drive** pedagogy:<br>1. **Planning Mode** models Earth-side waypoint selection and pre-drive energy/time/risk estimation.<br>2. **Driving Mode (`W/S/A/D` + chase camera)** is explicitly an **educational operator-control abstraction**—not real-time Earth teleoperation—designed to let students directly feel terrain resistance, speed penalties, and route-deviation costs during a 3–5 minute demo. |

---

## 3. Fictional Gameplay Balance Parameters (`GAME BALANCE — NOT NASA DATA`)

All numeric units, currencies, scores, and multipliers specified for APOGEE v2 (`docs/APOGEE_GDD.md`) are **fictional gameplay constants** calibrated for playability and engineering contrast, not empirical NASA measurements:

| Parameter / System | Approved GDD v2 Value (`GAME BALANCE — NOT NASA DATA`) | Engineering Concept Taught |
|---|---|---|
| **Battery Capacity & Safety Reserve** | `0–100 EU` (Energy Units); low-battery warning below `15 EU` | Finite surface energy budget; reserve margin for communications and recovery |
| **Action Costs (Baseline)** | Base drive `5 EU / segment` (before terrain/wheel/load factors); `SCAN = 6 EU`; `ANALYZE = 12 EU`; `TRANSMIT = 6 EU` | Power allocation between mobility, sensing, science sampling, and DSN uplink |
| **Solar Recharge Rate** | `+8 EU per 10 min` stopped in adequate sunlight (reduced/blocked in shadowed canyons or storms) | Charging trades mission time for energy recovery and depends on illumination |
| **W1 — Light Wheel** | Hard `0.80×` · Soft Sand `1.80×` · Sharp Rock `1.60×` · Slope `1.40×` | Lowest mass and highest efficiency on firm ground; poor sand/sharp-rock performance |
| **W2 — Wide Traction Wheel** | Hard `1.25×` · Soft Sand `0.85×` · Sharp Rock `1.25×` · Slope `1.10×` | Improved flotation and efficiency in soft sand; higher rolling resistance on hard flat rock |
| **W3 — Reinforced Wheel** | Hard `1.15×` · Soft Sand `1.30×` · Sharp Rock `0.75×` · Slope `1.00×` | Higher mass/budget cost in exchange for durability on jagged rocks and slopes |
| **Science Score & Research Credits (`RC`)** | Cumulative `Science Score`; one-time fictional `RC` granted per newly transmitted site discovery (not NASA paying per rock/MB) | Distinguishes scientific return from game progression unlocks; prevents infinite rescanning |
| **Total Deployed Mass** | `Lander + Rover Base + Installed Modules + Carried Spares + Support Equipment` | Spares packed for Lander Garage swaps still impose mass trade-offs |

---

## 4. Direct Code Verification Against `origin/main` (`7606934`)

To avoid claiming unimplemented rules as live behavior, this table records what was directly verified in `src/` at commit `7606934`:

| Area | Status on `origin/main` (`7606934`) | Observed Code Evidence |
|---|---|---|
| **Manual WASD Kinematics & Continuous Drain** | **Implemented (Provisional / Scene-Coupled)** | `src/scene/MarsOpenWorld.tsx` (lines 300–428): `RoverSimulationRig` reads `W/S/A/D` `inputMovement`, scales max speed and battery drain per second across `slim_aluminum` (`14.0 m/s` / `0.35 ⚡/s` flat vs. `2.5 m/s` / `4.2 ⚡/s` sand), `wide_titan` (`9.5 m/s` / `1.15 ⚡/s` flat vs. `8.5 m/s` / `0.85 ⚡/s` sand), and `adaptive_sma` (`11.5 m/s` / `0.55 ⚡/s` flat vs. `9.0 m/s` / `0.95 ⚡/s` sand), and stops at `batteryPower <= 0`. Drain uses `GAME BALANCE` constants, not NASA numbers, and is currently emitted from `MarsOpenWorld.tsx` via callbacks mutating `surface.batteryPower` in `src/ui/OperationsView.tsx` (lines 202–212) rather than a pure `src/sim` `stepDrive`. |
| **Deployed Mass Includes Depot Spares** | **Implemented (With Legacy Launcher Cap)** | `src/sim/engine.ts` (`calculateResources`, lines 25–91): sums `roverMass` from `selectedModuleIds` and `depotMass` from `depotModuleIds` into `massKg`. |
| **Plan & Drive Loop (`Planning Mode`, `RouteEstimate`, `START DRIVE`, Pause/Replan)** | **Not Yet Implemented on `main`** | No waypoint click planner, `previewRoute`, `RouteEstimate`, or `ControlMode` (`planning \| driving \| paused`) exists in `src/types/game.ts`, `src/sim/`, or `src/ui/OperationsView.tsx` on `7606934`. |
| **GDD v2 Wheel Multipliers (`0.80×`–`1.80×`), Sharp Rock / Slope Terrains, & Mission 01–02** | **Not Yet Implemented on `main`** | `src/data/roverModules.ts` still uses legacy tile turn drains (`4`/`25`, `11`/`9`, `6`/`10` ⚡/tile) and `0%` stuck risk on `wide_titan`/`adaptive_sma`. `src/data/missionObjective.ts` defines 3 landing sites (`utopia_planitia`, `jezero_crater`, `valles_marineris`) rather than Mission 01 (`First Survey`) & Mission 02 (`The Dune Crossing`). |
| **Stopped Solar Recharge & Uncertain Terrain Scanner** | **Not Yet Implemented on `main`** | `src/scene/MarsOpenWorld.tsx` (lines 425–428) still applies `+15.0 * delta` ⚡/s solar ridge recharge even while driving, and `src/ui/OperationsView.tsx` (lines 147–159) / `src/data/roverModules.ts` (lines 85–89) still model `rimfax_gpr` as revealing `100%` of sand traps within range. |

---

## 5. Retired / Obsolete Claims Removed from Active Science Reference

Per `docs/APOGEE_GDD.md` and `docs/WORK_MASTER_PROMPT.md` (approved 2026-11-14), the following legacy claims from the initial scaffold are **retired** and must not be presented as active APOGEE science or MVP scope:
- **Removed:** Claim that `RIMFAX` GPR reveals 100% of concealed sand traps ahead of the rover.
- **Removed:** Instant `+25⚡/turn` Solar Ridge energy boosts and selectable `MMRTG` nuclear power source in the MVP power model.
- **Removed:** Launch vehicle selection (`Falcon Heavy`, `Atlas V`, `SLS`), orbital Tsiolkovsky $\Delta v$ mechanics, and `-30⚡` hard-landing penalties.
- **Removed:** Salvaging skycrane debris for `ISRU Alloy Scrap` and 3D-printing replacement hardware on Mars.
- **Replaced Broken URLs:** Previous citations to `rimfax/` (`404`), `spirit-faced-hidden-hazard-on-mars/` (`404`), `superelastic-tires/` (`404`), and the redirected SCaN URL have been replaced with verified live NASA/JPL/NTRS URLs above.
