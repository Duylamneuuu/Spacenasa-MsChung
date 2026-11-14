> **HISTORICAL / SUPERSEDED HANDOFF (14 Nov 2026):** This teammate-authored Gemini note describes an earlier Mission Control / rockets / delta-v design and an older scaffold state. **DO NOT use it to implement APOGEE.** The approved current model is **Plan & Drive**: click a route in Planning Mode, then manually drive W/S/A/D while following a visual guide. Player-facing game UI and all telemetry/logs must be 100% English. Read [GDD v2](APOGEE_GDD.md), [interfaces v2](INTERFACES.md), and [Work master prompt](WORK_MASTER_PROMPT.md). Original text below is preserved for historical context; Bảo's work must not be overwritten.

---

# BẢN BÀN GIAO TOÀN DIỆN DỰ ÁN APOGEE (NASA SPACE APPS CHALLENGE 2026)
> **Dành cho:** Google Gemini AI / AI Assistant  
> **Mục đích:** Cung cấp đầy đủ 100% ngữ cảnh, mã nguồn, phân công nhân sự và trạng thái hiện tại để AI tiếp quản và hỗ trợ tức thì không bị đứt đoạn.  
> **Người đang tương tác:** **Bảo** (Thành viên phụ trách Three.js 2.5D Scene & Visuals).  
> **Thời điểm xuất:** 14/11/2026 — Hackathon Window: 14–15/11/2026.

---

## 1. THÔNG TIN CHUNG VỀ DỰ ÁN & ĐỀ BÀI

* **Tên dự án:** APOGEE (Space Mission Design Game)
* **Cuộc thi:** NASA Space Apps Challenge 2026
* **Đề tài (Challenge):** Challenge 13 — *Space Mission Design Game* (Danh mục: Games | Đối tượng: Intermediate / Beginner-Youth)
* **Repository chính thức:** `https://github.com/Duylamneuuu/Spacenasa-MsChung` (Public repo)
* **Thư mục local:** `C:\Spacenasa-MsChung`
* **Công nghệ chủ đạo:** React 18, TypeScript, Vite, Three.js (`@react-three/fiber`), pure TypeScript deterministic simulation engine. Không dùng backend/database cho MVP để đảm bảo chạy mượt trực tiếp trên trình duyệt.

### 1.1. Bản chất bài toán của Đề bài
Biến môn học trừu tượng **Kỹ thuật Hệ thống Vũ trụ (Space Systems Engineering)** thành **Game Mô phỏng & Quản lý Tài nguyên (Resource Management & Simulation Game)** cho học sinh/người mới bắt đầu thông qua chu trình thử–sai (trial-and-error):
1. **PLAN / BRIEFING:** Nhận mục tiêu nhiệm vụ (ví dụ: Lunar South Pole Reconnaissance), giới hạn ngân sách và ngưỡng kỹ thuật tối thiểu.
2. **DESIGN / BUILD:** Chọn cấu hình tàu và phương tiện phóng (Launcher, Bus, Power, Comms, Scientific Payloads). Hiểu rõ quy luật đánh đổi (Trade-offs): thiết bị xịn thì nặng (tăng Mass), ngốn điện (Power), tốn băng thông (Comms) và đòi hỏi tên lửa lớn hơn (tăng Budget).
3. **DECIDE / PREFLIGHT & LAUNCH:** Chạy kiểm tra khả thi kỹ thuật (Feasibility Check). Nếu vượt ngân sách, vượt tải trọng tên lửa hoặc thiếu Delta-v ($\Delta v$) thì nhiệm vụ bị chặn hoặc thất bại ngay khi phóng.
4. **SIMULATE / OPERATIONS:** Tàu bay vào không gian, người chơi xử lý 2–3 sự cố thực tế (bão mặt trời Solar Flare, bóng tối nguy cấp Lunar Eclipse, mất liên lạc trạm mặt đất Deep Space Network).
5. **DEBRIEF:** Nghiệm thu kết quả phân hóa 3 tầng rõ rệt: **Full Success**, **Partial / Degraded**, hoặc **Failure** kèm giải thích nguyên nhân gốc rễ (Root Cause Analysis), bài học kỹ thuật và trích dẫn tài liệu NASA.

### 1.2. Năm (05) Nguồn lực giới hạn cốt lõi của APOGEE
1. **Ngân sách (Budget):** Tính bằng triệu USD ($M).
2. **Khối lượng (Mass):** Khối lượng khô + Khối lượng nhiên liệu (kg), bị chặn bởi trần tải trọng của tên lửa.
3. **Năng lượng (Power):** Công suất phát (W) của pin mặt trời / RTG so với công suất tiêu thụ của các thiết bị khoa học và hệ thống sưởi.
4. **Liên lạc (Comms):** Tốc độ truyền dữ liệu (kbps) so với lượng dữ liệu mà thiết bị khoa học sinh ra.
5. **Delta-v ($\Delta v$):** Vận tốc biến thiên khả dụng (km/s) so với vận tốc cần thiết để vào quỹ đạo đích (ví dụ: đi Mặt Trăng cần $\approx 3.9 - 4.1\text{ km/s}$).

---

## 2. PHÂN CÔNG ĐỘI NGŨ (TEAM MS CHUNG — 5 THÀNH VIÊN)

| Thành viên | Vai trò | Nhánh Git | Thư mục sở hữu độc quyền | Trách nhiệm chính |
|---|---|---|---|---|
| **Duy** | Product Lead & Integrator | `feat/ui` | `src/App.tsx`, `src/ui/`, `src/styles.css`, `package.json` | Tích hợp toàn bộ ứng dụng, xây dựng các panel UI, điều phối shared types, làm hồ sơ nộp bài. |
| **Bảo (Người đang chat)** | Scene Contributor | `feat/scene` | `src/scene/`, `public/assets/3d/` | Dựng phòng điều khiển 2.5D Isometric (Three.js / `@react-three/fiber`), mô hình tàu vũ trụ 3D, animation và tương tác click trạm điều khiển. |
| **Hải** | Simulation Engineer | `feat/simulation` | `src/sim/`, tests | Động cơ tính toán tài nguyên, kiểm tra tính khả thi kỹ thuật (Feasibility Checks), tính toán Delta-v, phân hóa kết quả Debrief. |
| **Sơn (HUST)** | Science & Data Lead | `feat/content-data` | `src/data/`, `docs/science/` | Ánh xạ và xác thực số liệu thực tế từ NASA (NASA LSP, JPL Solar System Dynamics, NASA SST-SotA, Moon Fact Sheet). |
| **Cường (PTIT)** | Game Designer & Pitch | `feat/content-data` | `src/content/`, `docs/design/`, `public/assets/ui/` | Viết kịch bản nhiệm vụ, lời thoại, các sự cố operations, thiết kế UX flow, kịch bản pitch 7 slides & video 30s. |

> **Nguyên tắc cộng tác:** "One repository, one React app, one always-buildable `main` branch". Mỗi thành viên chỉ sửa trong thư mục mình sở hữu, không sửa đè file của thành viên khác.

---

## 3. HIỆN TRẠNG KỸ THUẬT & MÃ NGUỒN CỦA REPO

* **Môi trường:** Đã cài đặt xong `node_modules` bằng `npm install` (0 lỗ hổng). Lệnh `npm run build` đã biên dịch thành công (`vite v6.4.6`, thời gian dựng 2.74s).
* **Git Status:** Tất cả các nhánh (`main`, `feat/ui`, `feat/scene`, `feat/simulation`, `feat/content-data`) đều đang ở commit ban đầu `03f0f08` (mới là tầng scaffold wireframe).
* **Chi tiết từng file:**
  1. `src/types/game.ts`: Mới có các type cơ bản (`Phase`, `MissionResources`, `MissionState`, `PlayerAction`). Đang **thiếu** $\Delta v$, Comms, `SpacecraftModule`, `MissionEvent`, `DebriefReport`.
  2. `src/sim/engine.ts`: Đang là mock placeholder, hàm `evaluateMission` luôn trả về `ok: true`, chưa tính toán cộng trừ tài nguyên thật.
  3. `src/scene/MissionScene.tsx`: Mới có 3 khối hộp (`boxGeometry`) cơ bản màu xanh/cam trên nền sàn Three.js Canvas.
  4. `src/ui/ResourcesPanel.tsx`: Mới render 4 dòng thông số thô.
  5. `src/data/` và `src/content/`: Hiện tại hoàn toàn trống rỗng, chỉ có 2 file `README.md` giữ chỗ.
  6. `src/App.tsx`: Mới chỉ có 2 nút bấm chuyển phase tượng trưng và reset.

---

## 4. PHẦN VIỆC CỦA THÀNH VIÊN BẢO (`feat/scene`)

Bảo chịu trách nhiệm độc quyền về mặt thị giác 3D trong `src/scene/`. Mục tiêu là biến 3 khối hộp hiện tại thành **Phòng Điều Khiển Không Gian 2.5D Isometric (NASA Mission Control Diorama)**:

### 4.1. Kiến trúc Scene cần đạt được
1. **Phòng điều khiển cắt vát (Cutaway Diorama Room):** Sàn nhà hình thoi/lục giác nghiêng góc orthographic isometric, viền kim loại công nghệ cao, màu xanh thẫm navy (`#152238` / `#0b1220`).
2. **Màn hình chính treo tường (Main Ops Big Screen):**
   * Hiển thị mô phỏng bản đồ quỹ đạo Trái Đất - Mặt Trăng.
   * Ở phase `launch`: Màn hình chuyển sang vệt sáng quỹ đạo phóng tên lửa màu cam rực rỡ.
   * Ở phase `operations`: Hiển thị tàu bay quanh quỹ đạo cực Mặt Trăng.
3. **Bệ chiếu Hologram trung tâm (Spacecraft Holo-Pedestal):**
   * Bệ tròn phát sáng màu xanh lơ (Cyan `#6bd1e7`).
   * Phía trên bệ là mô hình thu nhỏ của tàu vệ tinh (Spacecraft Miniature) gồm: Thân tàu hình hộp đa giác (Bus), 2 cánh pin mặt trời (Solar Arrays) vươn sang hai bên, đĩa ăng-ten parabol (High-Gain Dish) ngửa lên trên, và đầu xả động cơ đẩy (Engine Nozzle) bên dưới.
   * Tàu tự xoay tròn chậm rãi quanh trục Y bằng hook `useFrame`.
4. **Dãy bàn Console điều khiển tương tác (Interactive Consoles):**
   * Bàn Flight Director, Design Console, Launch Ops Console có màn hình vi tính nhỏ, ghế ngồi xoay.
   * Khi di chuột vào (hover), console phát sáng nhẹ (highlight) và con trỏ chuột đổi thành `pointer`.
   * Khi click, kích hoạt callback `onStationClick` (chuyển sang station tương ứng).
5. **Cột đèn cảnh báo trạng thái (Alert / Status Beacon):**
   * Phase `briefing` / `design`: Đèn xanh dương (Normal Ops).
   * Phase `preflight`: Đèn nhấp nháy kiểm tra.
   * Phase `launch`: Ánh sáng vàng cam rực rỡ.
   * Phase `operations`: Nếu gặp sự cố (bão mặt trời hoặc eclipse), đèn chớp đỏ/amber cảnh báo nguy cấp.

---

## 5. HƯỚNG DẪN DÀNH CHO GEMINI TIẾP QUẢN

Khi người dùng (Bảo) yêu cầu viết code hoặc hướng dẫn:
1. Tập trung tối đa vào thư mục `src/scene/` trên nhánh `feat/scene`.
2. Sử dụng thuần thư viện `@react-three/fiber` và `three` (đã cài đặt trong `package.json`), viết mô hình procedural low-poly đẹp mắt, chạy siêu nhẹ, không phụ thuộc vào tải file `.gltf` bên ngoài để tránh lỗi mạng/CORS.
3. Đảm bảo code tuân thủ contract props:
   ```typescript
   export type MissionSceneProps = {
     state: MissionState;
     onStationClick?: (station: 'briefing' | 'design' | 'launch' | 'operations') => void;
   };
   ```
4. Đảm bảo chạy `npm run build` không bị lỗi TypeScript (`tsc --noEmit`).
