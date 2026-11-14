# NASA SCIENTIFIC DATA & VALIDITY CITATIONS
> **Project APOGEE: Mars Rover Architect**  
> **NASA Space Apps Challenge 2026** — *Challenge 13: Space Mission Design Game*  
> **Submission Track:** Games (Intermediate / Beginner-Youth)

---

## 1. SCOPE & METHODOLOGY
To convert **Space Systems Engineering** into an accessible yet mathematically and scientifically rigorous simulation game, APOGEE maps real-world NASA engineering trade-offs into deterministic resource constraints:
$$\text{Trade-off Matrix: } \text{Mass } (kg) \longleftrightarrow \text{Power } (\text{Watts } / ⚡) \longleftrightarrow \text{Comms } (MB / kbps) \longleftrightarrow \text{Delta-v } (\Delta v - m/s) \longleftrightarrow \text{Budget } (\$M)$$

---

## 2. NASA SOURCE GROUNDING & DATA MAPPING TABLE

| Component / Subsystem | NASA Primary Reference Source | Actual Metric / Real-world Value | Game Parameter & Simplification | Educational Insight |
|---|---|---|---|---|
| **Wheels & Regolith Mechanics (Slim vs. Wide vs. SMA)** | NASA GRC Spring Tire Program & JPL Spirit MER-A Troy Sand Trap Incident Report (2009) | MER aluminum wheels: 25 cm dia, 7075-T73 Al. Spirit bogged down in sulfate sand at Troy. NASA GRC Nitinol SMA tires provide superelastic compliance. | • Slim Al: $10M, 20 kg, 4⚡ (rock) / 25⚡ (sand) + 50% stuck risk.<br>• Wide Titan: $30M, 75 kg, 11⚡ (rock) / 9⚡ (sand), 0% stuck.<br>• Adaptive SMA: $55M, 95 kg, 6⚡ (rock) / 10⚡ (sand). | Teaches why wide wheels with low ground pressure prevent entrapment in drift sand, but carry rolling resistance penalties on hard rock. |
| **Ground Penetrating Radar (RIMFAX GPR)** | NASA Mars 2020 Mission / Perseverance Rover RIMFAX Instrument Technical Description | GPR ultra-wideband operating at 150–1200 MHz, probing subsurface regolith and stratigraphy down to 10+ meters depth. | • NavCam: $10M, 10 kg, 2⚡/scan, radius 1, blind to sub-surface sand.<br>• RIMFAX GPR: $35M, 45 kg, 14⚡/scan, radius 3, reveals 100% hidden sand traps & buried samples. | Illustrates the trade-off of active radar sensors: massive power consumption and mass for deep situational awareness. |
| **Power Generation (Solar Array vs. MMRTG)** | NASA Solar System Exploration & InSight / MSL Curiosity Power System Reports | • MER/InSight Triple-junction GaAs panels: ~140–900 W/sol depending on solar angle and dust storms.<br>• MMRTG: 4.8 kg Plutonium-238 dioxide, ~110 W continuous electrical output, 2000 W thermal output. | • Solar Array: $15M, 25 kg, recharges +25⚡ on sunlit Solar Ridges; 0⚡ in craters.<br>• MMRTG: $60M, 110 kg, delivers continuous +8⚡/step everywhere. | Teaches that solar arrays are cheap and light but geodirectionally vulnerable, whereas RTGs provide continuous energy at steep mass and financial cost. |
| **Deep Space Communications (UHF Relay vs. X-Band DSN Dish)** | NASA Deep Space Network (DSN) & Mars Relay Network Architecture (Electra UHF Transceiver) | • Electra UHF: Relays through Mars Reconnaissance Orbiter (MRO) / Odyssey at 2 Mb/s when overhead.<br>• Steerable X-band High-Gain Antenna (HGA): Direct-to-Earth uplink linking with 34m/70m DSN ground stations. | • UHF Proximity: $10M, 15 kg, 5⚡/uplink, range $\le 3$ tiles from Lander.<br>• High-Gain Dish: $35M, 55 kg, 20⚡/uplink, transmits from ANY tile on Mars. | Demonstrates relay economics: low-power UHF requires geographic proximity to base, while high-gain direct links burn high power. |
| **Launch Vehicle Capacity & Tsiolkovsky $\Delta v$** | NASA Launch Services Program (LSP) Vehicle Performance Tool & JPL Horizons Dynamics | • Earth-to-Mars Trans-Mars Injection (TMI): $\approx 3.8 - 4.2\text{ km/s}$.<br>• Falcon Heavy / Atlas V 541 / SLS payload envelopes. | $\Delta v_{\text{effective}} = \Delta v_{\text{base}} - \left(\frac{TotalMass}{100}\right) \times 0.25\text{ km/s}$. Overweight leads to launch abortion or hard landing penalty (-30⚡). | Demonstrates the fundamental rocket equation: every kilogram of spacecraft hardware reduces orbital velocity margin. |
| **In-Situ Resource Utilization (ISRU)** | NASA Space Technology Mission Directorate (STMD) ISRU Capability Roadmap & MOXIE Experiment | Mars 2020 MOXIE extracted 98% pure oxygen from $CO_2$. Future architectures recycle titanium descent stages and sintered regolith. | Skycrane debris salvage (+2 ISRU Alloy Scrap) allows 3D printing spare tires and instrument upgrades directly on Mars. | Shows how field manufacturing reduces the need to launch high initial mass from Earth. |

---

## 3. NASA DATA CITATIONS & LINKS
1. **NASA Jet Propulsion Laboratory (JPL) — Mars 2020 Perseverance Rover Science Instruments:**  
   https://mars.nasa.gov/mars2020/spacecraft/instruments/
2. **NASA Glenn Research Center (GRC) — Shape Memory Alloy Spring Tires Program:**  
   https://www.nasa.gov/general/superelastic-tires/
3. **NASA Launch Services Program (LSP) — Performance Curves & Spacecraft Envelopes:**  
   https://elvperf.ksc.nasa.gov/
4. **NASA Jet Propulsion Laboratory (JPL) — Spirit Rover Sand Trap Investigation (Troy, 2009):**  
   https://www.jpl.nasa.gov/news/spirit-faced-hidden-hazard-on-mars
5. **NASA Space Communications and Navigation (SCaN) — Deep Space Network (DSN):**  
   https://www.nasa.gov/directorates/somd/space-communications-navigation-program/
6. **NASA In-Situ Resource Utilization (ISRU) Technology Plan:**  
   https://www.nasa.gov/isru
