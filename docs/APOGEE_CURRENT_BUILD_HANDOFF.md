# APOGEE — Ghi chép bàn giao cho lượt sửa docs

Ghi ngày **14/11/2026, giờ Việt Nam**. Tài liệu cho người hoặc AI tiếp quản. Đây là ghi chép theo phiên bản đã kiểm tra. Đội đã có slide riêng; dùng cùng [prompt viết script cho Gemini](design/GEMINI_PITCH_SCRIPT_PROMPT.md).

## 1. Đọc đúng phiên bản trước khi viết

| Nguồn | Trạng thái lúc kiểm tra | Sử dụng thế nào |
| --- | --- | --- |
| [GitHub `main` tại `023113b`](https://github.com/Duylamneuuu/Spacenasa-MsChung/tree/023113b91672efdcc8657897b8c50188d9bd0c36) | Cùng SHA với nhánh `codex/apogee-game-ui` ở thời điểm audit. Có UI toàn màn hình từ `9668515`, cộng merge giữ phần diorama cũ của Bảo. [CI Node 20](https://github.com/Duylamneuuu/Spacenasa-MsChung/actions/runs/43599790711) pass `npm ci`, 11 test engine và build. | Baseline của ghi chép này. Khi tiếp quản, kiểm tra lại tip của `main` và chạy đúng commit mới nếu đã thay đổi. |
| [Vercel public](https://apogee-mars-rover.vercel.app/) | HTTP 200, tiêu đề **APOGEE — Mars Rover Architect**, asset chính `/assets/index-BaEWgKCx.js`, khớp HTML build local đã kiểm tra. Mở từ trình duyệt sạch thấy nút **Start expedition**. | Đã chơi hết cả hai nhiệm vụ trên URL này. Dùng nội dung màn hình và asset để nhận diện build; HTTP 200 tự nó không đủ. |
| Nhánh game sau `023113b` | EN/VI và tutorial tương tác đang được phát triển lúc audit. | Sau khi nhóm chốt commit, thử EN/VI và tutorial trên build mới trước khi mô tả là đã phát hành. |
| `58206fc`, PR #7/#8, `stratmenu` và nhánh diorama | Bản playable cũ, tài liệu QA lịch sử và thử nghiệm hình ảnh. `stratmenu` còn nhắc chọn tên lửa/quỹ đạo và ba địa danh cũ. | Giữ làm lịch sử hoặc nguồn asset chọn lọc. Không chép mô tả cơ chế hay ảnh HUD cũ sang tài liệu của bản mới. |

Quyết định **Plan & Drive** vẫn nhất quán. **100% English** mô tả baseline đã thử; hướng cập nhật là thêm **EN/VI, mặc định English**. Chỉ cập nhật chính sách ngôn ngữ trong docs khi xác nhận bản đó đã phát hành và các trạng thái đã được dịch.

## 2. Game đang chạy thế nào

1. **Title:** quả Mars 3D có thể kéo xoay; **Start expedition** mở màn chọn nhiệm vụ dạng hồ sơ. Hai nhiệm vụ hiện có là **First Survey** và **The Dune Crossing** trên cùng khu vực. Không có Mission 03 trong menu.
2. **Design rover / Earth Hangar:** xem rover 3D, chọn bánh, camera, dụng cụ phân tích, bộ nhớ và phụ tùng. Tổng khối lượng tính cả đồ dự phòng; Preflight kiểm tra tải trọng, ngân sách và thiết bị. **Deploy to Mars** chuyển sang khảo sát bề mặt. Bản hiện hành không có màn tính Δv hay chọn tên lửa.
3. **Planning:** cảnh 3D chiếm toàn bộ viewport trên desktop, camera nhìn tổng quan từ trên xuống. Bấm địa hình đặt waypoint hoặc chọn tuyến gợi ý; HUD dự báo khoảng năng lượng, thời gian và mức rủi ro. Bản đồ chiến thuật mở với **M** hoặc nút minimap khi hiện.
4. **Driving:** **Start drive** bật điều khiển thủ công; rover chỉ di chuyển khi có input. **W/S** tiến/lùi, **A/D** đổi hướng, **Space** phanh. Camera chuyển ra sau rover. `Esc` tạm dừng khi đang lái, `Enter` bắt đầu/tiếp tục khi phù hợp. **Replan** cho sửa tuyến từ vị trí hiện tại. Tuyến là chỉ dẫn; chi phí tính theo địa hình thực tế đi qua. Bánh không phù hợp có thể khiến rover dừng an toàn.
5. **Field science:** dừng xe. **Q** quét và thu hẹp khoảng ước lượng rủi ro; **F** phân tích khi ở sát điểm mẫu; **T** truyền dữ liệu đang lưu; **R** sạc trong 10 phút mô phỏng, cần còn thời gian và đủ nắng. Với Standard Storage, phải truyền mẫu đầu tiên trước khi phân tích mẫu thứ hai. Chỉ nhận điểm khi downlink xong.
6. **Garage / Report:** garage chỉ lắp phụ tùng đã mang theo khi đỗ gần lander; mỗi lần lắp tốn 4 RC và 4 phút mô phỏng. Report cho xem mục tiêu đã truyền, quãng đường, điện tiêu hao/sạc và thời gian còn lại. **Energy Used** gồm cả thao tác khoa học; dự báo trên tuyến chỉ tính di chuyển.

| Nhiệm vụ | Mục tiêu | Điều cần hiểu |
| --- | --- | --- |
| **01 — First Survey** (`first-survey`) | Basalt Outcrop (S-01) và Mineral Vein (S-02). | Có nút **Survey sites** để đặt hai waypoint. Cấu hình mặc định: Lightweight Wheels, Navigation Camera, Rock Analyzer, Standard Storage. Truyền riêng từng mẫu. Điểm cơ sở khi hoàn tất: **50 Science Score / 20 RC**. |
| **02 — The Dune Crossing** (`dune-crossing`) | Sedimentary Cliff (S-03) ở phía đông, bên kia dải cát. | Với bánh nhẹ, **North detour** giảm rủi ro và điện so với đường tắt; với Wide Traction, đường tắt khả thi. Điểm cơ sở: **60 Science Score / 24 RC**. |

## 3. Bằng chứng kiểm thử trên Vercel

Đã dùng Chromium ở viewport **1280×720** và **1366×768**. Đây là kết quả của bản live nhận diện ở mục 1; không dùng làm bằng chứng cho thay đổi EN/VI hoặc tutorial.

| Case | Quan sát trực tiếp |
| --- | --- |
| **Mission 01 thành công** | Từ title tới Report; dùng WASD để đến hai điểm, dừng và dùng F/T ở từng điểm; cả hai hiện **Transmitted**. Sạc bằng R thêm **7.9 EU trong 10 phút**, report **Mission Complete**, **50 Science Score**, **20 RC**. |
| **Mission 02 thành công** | Wide Traction → Dune shortcut → Start drive → W → nhả phím khi thấy **Sample in range** → Pause → Q/F/T → Report. Quét cập nhật ước lượng, dữ liệu chuyển **Stored → Sent**, report **Mission Complete**, **60 Science Score**, **24 RC**. Lượt này đi **43.0 m**, dùng **80.6 EU** gồm khoa học, còn **68.6 phút**. Pin/quãng đường có thể khác khi lái lại. Không có lỗi JS hoặc request lỗi trong lượt này. |
| **So sánh trước khi lái** | HUD làm tròn: bánh nhẹ + đường tắt **77–83 EU / High**, bánh nhẹ + đi vòng bắc **57–59 EU / Low**, Wide Traction + đường tắt **56–60 EU / Medium**. Số của bản live, dành cho chi phí đi đường. |
| **Dừng an toàn** | Bánh nhẹ lái thẳng vào cát: **Safety stop: soft sand ahead exceeds the grip limit. Replan or back away.** Xe chuyển sang Paused. Chưa lái hết North detour trên HUD này; lượt thành công tuyến bắc ở bản cũ và test engine là bằng chứng riêng. |
| **Viewport và mobile** | Canvas đầy đủ **1280×720** trong màn chơi. Ở giả lập điện thoại **390×844** mở được Mission 01 và tạo tuyến, không tràn ngang; không thấy điều khiển lái cảm ứng. Mô tả an toàn: chơi đầy đủ trên desktop có bàn phím. |
| **Lỗi phím Enter trên bản đồ** | Từ Planning, nhấn **M**, focus bản đồ chiến thuật, dùng mũi tên rồi **Enter** để thêm điểm. HUD chuyển sang `mode-driving` trong khi đang mở map. Bản đồ dùng Enter đặt waypoint; handler toàn cục cũng dùng Enter đổi chế độ. Cần kiểm tra lại sau cập nhật Opus; nếu còn, sửa việc truyền sự kiện/guard dialog rồi test cả Enter trên bản đồ và Enter ngoài bản đồ. Dùng chuột đặt waypoint để tránh lỗi khi demo. |

Ảnh từ lượt thử trên Vercel: [Planning](evidence/023113b/apogee-main-plan.png), [Mission 02 Report](evidence/023113b/apogee-main-report.png), [Mission 01 Report](evidence/023113b/apogee-main-first-survey.png). Nếu bản nộp dùng commit mới hơn, kiểm tra lại và chụp ảnh của đúng bản đó.

## 4. Bản đồ code cho AI tiếp quản

Đọc các tệp ở **commit đích**, không dựa vào đường dẫn checkout cũ cùng tên.

| Cần hiểu | Tệp đang được app dùng |
| --- | --- |
| Điểm vào, các màn, input, đồng hồ và action | `src/main.tsx` → `src/App.tsx`; trạng thái mô phỏng cập nhật theo bước cố định. |
| Menu, chọn nhiệm vụ, hangar, preflight và report | `src/ui/TitleScreen.tsx`, `src/scene/TitleMars.tsx`, `src/ui/ExpeditionUI.tsx`, `src/ui/screens.css`. |
| HUD, kế hoạch, phím tắt và bản đồ chiến thuật | `src/ui/ExpeditionOperations.tsx`, `src/ui/hud.css`. |
| Cảnh bề mặt, hai chế độ camera, rover và model adapter | `src/scene/ExpeditionScene.tsx`, `src/scene/RoverModel.tsx`, `src/scene/roverAsset.ts`. `ROVER_ASSET` chưa cấu hình GLB ở baseline; app đang render rover dựng bằng mã. |
| Định nghĩa nhiệm vụ, module, địa hình; logic và test | `src/content/expedition.ts`, `src/data/expedition.ts`, `src/types/expedition.ts`, `src/sim/expedition.ts`, `tests/expedition.test.cjs`. Mô phỏng không phụ thuộc camera. Không có diff trong các file logic/data/test này giữa `58206fc` và `023113b`. |
| Phần cũ còn trong repository | `MarsOpenWorld.tsx`, `Mars3DRover.tsx`, `MissionScene.tsx`, `OperationsView.tsx`, `styles.legacy.css` có phần liên quan prototype/diorama. Tệp còn tồn tại không đồng nghĩa app đang gọi; kiểm tra import từ `src/main.tsx`. |

Stack: React + TypeScript + Vite + Three.js/React Three Fiber. Kiểm tra `npm test` và `npm run build`. Chạy `npm run preview` để thử build xuất ra, rồi tiếp tục thử link public. Bản mới gọi Google Fonts; đã chạy được Mission 02 từ build local của UI tương ứng khi chặn font ngoài. Không dùng trạng thái file `dist` cũ để suy ra thay đổi đang sửa đã có mặt.

## 5. Khi được giao sửa docs

1. **Trước hết xác định bản phát hành.** So tip `main`, CI và link Vercel; xem bản mới đã có nút EN/VI và hướng dẫn theo từng bước chưa. Nếu có, thử đổi ngôn ngữ rồi đi một lượt Mission 01 từ title tới report, gồm hai lượt truyền, log/cảnh báo, trạng thái lỗi, lưu lựa chọn khi reload và mở lại tutorial sau khi bỏ qua.
2. **README là cửa vào.** Cập nhật link chơi, hành trình ngắn từ Start expedition tới Report, phím tắt, hai nhiệm vụ, yêu cầu bàn phím và commit kiểm chứng. Link PR #7 và ảnh `58206fc` có thể nằm trong lịch sử. Tránh để người đọc tưởng đó là bản live.
3. **GDD, checklist ngôn ngữ và tài liệu bàn giao:** giữ Plan & Drive; chỉ cập nhật khác biệt đã kiểm chứng so với bản phát hành: full screen, camera theo mode, tactical map, tên nút mới, giá trị làm tròn, EN/VI và tutorial sau khi hoàn tất. `docs/design/DEMO_QA.md` có nút/ảnh của UI cũ; giữ kết quả theo SHA và thêm một lượt mới có ngày/commit riêng.
4. **Khoa học:** [NASA Mars Facts](https://science.nasa.gov/mars/facts/) là nguồn cho chu kỳ sáng tối đơn giản ~24,6 giờ trong `sunlight()`. Bản đồ, EU, RC, các hệ số bánh và mức rủi ro là quy tắc game. WASD là thao tác để học, không phải NASA điều khiển trực tiếp từ Trái Đất. Kiểm tra tab Resources chính thức trước khi khẳng định dự án dùng nguồn đủ điều kiện Global.
5. **Còn mở:** lỗi Enter trong tactical map, thử garage trong browser, thử complete trên tuyến bắc của HUD mới, mobile touch nếu team muốn hỗ trợ; không có bằng chứng bản hiện tại chạy được bằng touch. Chưa có lý do thay engine hay thêm tính năng cũ cho lượt sửa docs.
