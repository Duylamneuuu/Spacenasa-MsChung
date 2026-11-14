# APOGEE — Mars Rover Architect | Approved GDD v2: Plan & Drive

**Team:** MS Chung · **NASA Space Apps 2026** · **Approved on:** 2026-11-14

**Editable Google Doc:** https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit

> **LATEST PRODUCT DECISION — 14 November 2026:** **PLAN & DRIVE**, not Plan & Execute. Player clicks waypoints in Planning Mode and receives an energy/time/risk estimate, then presses **START DRIVE** and manually drives with **W/S (forward/reverse) + A/D (steering)**. The route is guidance, **not autopilot**. All player-facing text is **English only** (including telemetry, mission copy, errors and accessibility labels).

> Markdown snapshot of the Google Doc at the time of this commit. Further document edits require re-sync; only the GDD, not the current code, is approved by this specification.

*GAME DESIGN DOCUMENT (GDD) · MS CHUNG · NASA SPACE APPS 2026 · Bản thống nhất 14/11/2026*

Trạng thái: CONCEPT ĐÃ CHỐT — APOGEE dùng Plan & Drive (lập tuyến trước, tự lái WASD sau). Một Sao Hỏa, nhiều địa hình và nhiều nhiệm vụ khoa học. Bản đồ Three.js low-poly 2.5D/isometric khi lập kế hoạch; camera bám theo xe khi lái. QUY ĐỊNH BẮT BUỘC: toàn bộ trải nghiệm trong game 100% TIẾNG ANH, gồm menu, HUD, tên mission, tutorial, thông báo, logs, nút, cảnh báo, accessibility labels, science copy và Mission Report. Tài liệu nội bộ có thể viết tiếng Việt.

## 1. TẦM NHÌN VÀ GIỚI HẠN

APOGEE là trò chơi giáo dục thiết kế và điều hành nhiệm vụ rover trên Sao Hỏa. Người chơi chọn rover, phụ kiện và giới hạn tải trọng, vạch tuyến thám hiểm trước khi xuất phát, xem dự báo năng lượng/thời gian/rủi ro, rồi tự lái xe theo đường hướng dẫn bằng WASD. Lái lệch tuyến sẽ có chi phí thực tế riêng; người chơi khảo sát, truyền kết quả khoa học và học các đánh đổi thiết kế. Không phải game tự lái autopilot.

Điểm khác biệt: cùng một mission có thể giải bằng nhiều cấu hình và nhiều tuyến đường. Đi qua cát để rút ngắn quãng đường hay vòng qua đá cứng để tiết kiệm pin? Mang bánh nặng để giảm nguy cơ hay giữ xe nhẹ để khảo sát nhanh? Kết quả phải được mô phỏng và giải thích, không quyết định bằng nút chọn A/B/C.

Bám đề Space Mission Design Game: màn Mission Design thể hiện mission objective, payload, khối lượng, ngân sách và năng lượng; màn Simulation cho thấy hậu quả; Debrief giải thích bài toán trade-off. Không làm game phóng tên lửa, chọn quỹ đạo, tính Δv hay mô phỏng hạ cánh vật lý trong MVP. Trước khi triển khai chỉ cần kiểm tra các giới hạn thiết kế (preflight).

## 2. MASTER GAME LOOP

(1) SELECT MISSION → (2) DESIGN ROVER & PAYLOAD → (3) PREFLIGHT CHECK → (4) DEPLOY (chuyển cảnh ngắn) → (5) PLANNING MODE: CHỌN WAYPOINTS & SCIENCE SITES → (6) PREVIEW PLANNED ENERGY / TIME / RISK → (7) START DRIVE: NGƯỜI CHƠI TỰ LÁI WASD THEO ĐƯỜNG CHỈ DẪN → (8) SCAN / ANALYZE / TRANSMIT / STOP TO RECHARGE → (9) SCIENCE SCORE & RESEARCH CREDITS → (10) QUAY VỀ LANDER, ĐỔI MODULE DỰ PHÒNG → (11) DEBRIEF / NEXT MISSION. Không có chế độ tự lái bắt buộc.

Không có hệ thống chế tạo ISRU phức tạp, bán đá lấy tiền, nhặt 'cục năng lượng', thả kén tiếp tế từ quỹ đạo hay bay qua nhiều hành tinh. Thu thập mẫu đá là hoạt động khoa học; các địa hình và mission đều trên Sao Hỏa.

## 3. CÁC MÀN HÌNH VÀ TƯƠNG TÁC

### 3.1 Mission Select

Một vùng Sao Hỏa, nhiều nhiệm vụ có mục tiêu và điều kiện khác nhau. Chọn mission để xem ảnh preview bản đồ, danh sách mục tiêu, thời gian/điện dự kiến, rủi ro địa hình và phần thưởng khoa học. Một bản đồ 3D có thể tái sử dụng với điểm xuất phát, khu vực mở khóa và mục tiêu khác nhau.

### 3.2 Earth Hangar — Mission Design

Chọn cấu hình bánh, gói Terrain Scanner, bộ lưu trữ và module khoa học; chỉ mang theo các phụ kiện dự phòng được chọn từ trước. Xem thay đổi hình mẫu rover 3D, tổng ngân sách thiết kế, tổng tải trọng và mức điện tiêu thụ. Có thể giảm trang bị để mang thêm phụ kiện dự phòng; không có một cấu hình tối ưu cho mọi mission.

Quy tắc khối lượng: TOTAL DEPLOYED MASS = LANDER + ROVER BASE + MODULES INSTALLED + SPARE MODULES + SUPPORT EQUIPMENT. Phụ kiện đã đóng trong kho lander VẪN tính vào tải trọng. Khi trở về lander, chỉ đổi sang module đã mang theo; không thể nhận phụ kiện vật lý mới một cách tức thời từ Trái Đất.

### 3.3 Preflight / Deploy

Kiểm tra tự động: mission requirements đạt chưa, ngân sách có vượt trần không, tổng payload mass có vượt giới hạn không, có nguồn điện/thiết bị khoa học cần thiết không. Nếu không đạt, hiển thị lý do và cho sửa cấu hình. Nếu đạt, chuyển cảnh lander/rover được triển khai trên Sao Hỏa; không có gameplay điều khiển tên lửa hoặc quỹ đạo.

### 3.4 Mars Operations — Bản đồ 3D

Ở PLANNING MODE dùng camera isometric/orthographic xem sa bàn Mars low-poly và click chọn các waypoint; ở DRIVING MODE camera chase/follow theo rover, đường vạch thể hiện bằng vệt sáng/mốc chỉ dẫn 3D hoặc minimap, tuyệt đối không tự kéo xe chạy theo path. W đi tới, S lùi, A/D đổi hướng; có thể dùng Space để phanh, camera xoay nếu kịp. Di chuyển mượt, va chạm nhẹ, bánh xe quay. HUD theo thời gian thực: Battery EU, speed, mission time, planned route / distance-to-next-waypoint, actual drain, science data, Science Score, RC, current wheel. Toàn bộ chuỗi hiển thị cho người chơi phải là tiếng Anh.

Thông tin chưa được scanner xác minh được hiển thị là 'chưa khảo sát' hoặc 'rủi ro ước tính', KHÔNG phải hệ thống biết chắc có hố cát lún bí mật. Mỗi môi trường có màu/vật liệu riêng, tooltip giải thích chi phí dự kiến và độ tin cậy thông tin.

### 3.5 Debrief / Mission Report

Tổng kết: các mục tiêu khoa học đã hoàn thành, dữ liệu truyền thành công, năng lượng đã dùng, thời gian còn lại, số lần gặp rủi ro, cấu hình rover, đường đã đi và lý do thắng/thua. Cho phép Retry với cấu hình khác hoặc mở mission tiếp theo.

## 4. ĐIỀU KHIỂN: PLAN → DRIVE (WASD) → REPLAN

CƠ CHẾ CHÍNH THỨC — PLAN & DRIVE, KHÔNG PHẢI AUTOPILOT: (A) Planning Mode: người chơi click map tạo waypoint và điểm nghiên cứu; path chỉ đường và game ước lượng năng lượng, thời gian, mức rủi ro. (B) Chọn START DRIVE; chuyển sang camera theo rover và kích hoạt điều khiển W/S tiến/lùi, A/D đánh lái. Người chơi PHẢI tự lái trên địa hình; không bấm Execute để xe tự chạy. (C) Người chơi có thể dừng/PAUSE hoặc trở về Planning để vạch lại đường. Đường hướng dẫn chỉ là gợi ý, không ép xe bám sát.

PLANNING: click địa hình để thêm waypoint, click science site để chọn mục tiêu; Undo, Clear, Change Route; Preview theo cấu hình rover và đường dự kiến. Màn hình phải phân biệt Estimate với Actual: điện và thời gian trước khi lái chỉ là dự báo (nhất là đoạn chưa scanner), KHÔNG phải con số bảo đảm. Người chơi quyết định đi xuyên cát ngắn hay vòng trên đường cứng dài, rồi nhấn START DRIVE. Chế độ này không có xe tự chạy.

DRIVING: WASD điều khiển liên tục theo deltaTime với chuyển động arcade/kinematic đơn giản, gia tốc, giới hạn tốc độ, khả năng quay, ảnh hưởng bánh và địa hình; không dùng mô phỏng rigid-body phức tạp. Chỉ khi XE THỰC SỰ DI CHUYỂN mới trừ năng lượng di chuyển và cộng thời gian/quãng đường. Terrain sampling theo tọa độ thực của rover, không theo đường vạch sẵn; lái lệch tuyến vào cát hoặc đá nguy hiểm làm thay đổi điện, tốc độ, rủi ro. Nếu kẹt/hết pin/đụng ranh giới thì dừng an toàn, cho cảnh báo và cho phép replan, reset hoặc failure có giải thích. Không tự teleport khi đổi mode.

MODE & ACTIONS (MVP): PLANNING → START DRIVE (WASD) → PAUSE/REPLAN → RESUME. Trong Driving, người chơi có thể dừng tại science site để SCAN, ANALYZE, TRANSMIT; RECHARGE cần đứng yên và đủ sáng. Khi bấm vào ô nhập liệu/overlay, WASD không được kích hoạt; nhả phím hoặc mất focus phải ngừng ga an toàn. Đường waypoint chỉ để định hướng (indicator / minimap), KHÔNG là AI autopilot. Không làm tính năng click-to-move, chế độ lái tự động song song hay editor lệnh Forward/Turn.

## 5. MỘT BẢN ĐỒ SAO HỎA, NHIỀU MÔI TRƯỜNG

A. HARD PLAIN (đồng bằng đá cứng): di chuyển tương đối dễ, có thể phải đi vòng xa. B. SOFT SAND (cát mềm): nguy cơ trượt/lún, tiêu hao điện và thời gian cao với bánh không phù hợp. C. SHARP ROCK (đá sắc/gồ ghề): tăng hao mòn, rủi ro hỏng bánh. D. SLOPE/CRATER (dốc/miệng hố): leo dốc tiêu thụ điện và thời gian nhiều hơn. E. SHADOWED CANYON (vùng khuất nắng): ít/không nạp được điện mặt trời trong thời điểm mô phỏng.

Các môi trường xuất hiện CÙNG TRÊN MỘT BẢN ĐỒ. Cùng một đích có tuyến xuyên cát ngắn nhưng nguy hiểm và tuyến đường cứng dài nhưng an toàn. Đồ họa hiển thị mượt; số ô chỉ là đơn vị logic ẩn bên dưới. Không cần nhiều hành tinh, nhiều model hành tinh hoặc bản đồ 3D hoàn toàn riêng.

## 6. MA TRẬN BÁNH XE & TRADE-OFFS

Ba cấu hình bánh (mọi chỉ số sau đây là game balance, KHÔNG phải dữ liệu NASA):

W1 — LIGHT WHEEL: nhẹ, chi phí thiết kế thấp. Hệ số điện trên nền cứng 0,80×; cát mềm 1,80×; đá sắc 1,60×; dốc 1,40×. Phù hợp đường dễ và đi vòng, nhưng kém ở cát/đá sắc.

W2 — WIDE TRACTION WHEEL: nặng và tốn ngân sách hơn. Nền cứng 1,25×; cát mềm 0,85×; đá sắc 1,25×; dốc 1,10×. Đi qua cát hiệu quả hơn, nhưng trên nền cứng kém tiết kiệm hơn W1.

W3 — REINFORCED WHEEL: chi phí cao, khối lượng lớn. Nền cứng 1,15×; cát mềm 1,30×; đá sắc 0,75×; dốc 1,00×. Bền khi qua vùng đá sắc/dốc, nhưng không phải lựa chọn tốt nhất cho cát.

Công thức tính di chuyển dự kiến cho mỗi đoạn: MOVE_ENERGY_ESTIMATE = BASE_DISTANCE_COST × TERRAIN_FACTOR × WHEEL_FACTOR × LOAD_FACTOR. Lái thực tế: tích lũy MOVEMENT_ENERGY theo quãng đường thực chạy qua mỗi loại địa hình, thời gian và cấu hình; KHÔNG tự trừ cả tuyến ngay khi Start Drive. Cả hai dùng chung hàm chi phí cơ bản; chênh lệch do người lái đổi tuyến/tốc độ/dừng. Tránh nhân đôi hệ số dốc; dùng deltaTime clamp, hạn chế phụ thuộc FPS. Các hệ số là GAME BALANCE, không phải số đo NASA. Rủi ro không bảo đảm 0% cho bất cứ bánh xe nào.

Ví dụ trên cùng điểm đến: W1 có thể chọn đi vòng trên nền cứng; W2 có thể chấp nhận cắt qua vùng cát; W3 có thể vòng qua tuyến đá sắc. Cả ba chiến lược có cơ hội hoàn thành, nhưng khác nhau ở thời gian/điện/rủi ro. Thiết kế level không được ngầm chỉ có một đáp án đúng.

## 7. PIN, SẠC VÀ TERRAIN SCANNER

### 7.1 Một mô hình năng lượng đơn giản

MVP chỉ có một hệ pin dự trữ dùng cho toàn bộ hành động và một cách nạp chính: solar charging khi có ánh sáng. Không có lựa chọn Solar vs MMRTG, không có trạm năng lượng có thể nhặt và không có 'đồi nắng +25 EU lập tức'. Trạng thái Battery có thể hiển thị 0–100 EU (đơn vị cân bằng game).

Pin giảm khi xe thực sự di chuyển (theo quãng đường/địa hình/cấu hình), khi SCAN, ANALYZE hoặc TRANSMIT. Đứng yên khi có ánh sáng tốt có thể sạc, nhưng tiêu tốn thời gian nhiệm vụ; không có ô 'năng lượng miễn phí'. Khu vực râm/bụi dày làm giảm tốc độ nạp. Đồng hồ và Battery phải cập nhật từ một nguồn state có thẩm quyền, tránh trừ pin cả trong renderer và engine.

Ví dụ số mock để test (có thể hiệu chỉnh): Battery 100 EU; dự trữ an toàn 15 EU; di chuyển cơ bản 5 EU/đoạn chuẩn trước hệ số; SCAN 6 EU; ANALYZE 12 EU; TRANSMIT 6 EU; sạc +8 EU mỗi 10 phút dừng khi đủ sáng. Chỉ là GAME BALANCE; không gán giá trị thật cho NASA.

PLANNING PREVIEW hiển thị năng lượng và thời gian ƯỚC TÍNH nếu đi gần tuyến đã chọn, có cảnh báo khi dưới ngưỡng an toàn 15 EU. DRIVING HUD hiển thị tiêu hao THỰC TẾ khi xe lái, và có thể hiển thị remaining-route estimate dựa trên vị trí thật. Lái lệch tuyến làm dự báo thay đổi. Battery luôn clamp trong [0, max]; cạn điện phải có trạng thái hỏng/hết nhiệm vụ rõ ràng.

### 7.2 Terrain Scanner

Terrain Scanner là hệ thống gameplay tổng hợp dựa trên ý tưởng camera điều hướng/nhận diện nguy hiểm của rover, KHÔNG phải tuyên bố radar xuyên đất nhìn được 100% mọi ổ cát lún. Basic Scan tiêu hao ít điện, quét gần; Enhanced Scan (nếu đủ thời gian) quét xa hơn nhưng nặng/tốn điện/ngân sách hơn. Quét cho người chơi biết vùng hard/sand/rock/slope hoặc đánh giá độ rủi ro, với mức độ bất định được hiển thị.

Nếu dùng tên khoa học: NavCam/HazCam phục vụ quan sát, nhận diện vật cản; thiết bị radar xuyên đất như RIMFAX chủ yếu phục vụ nghiên cứu cấu trúc dưới bề mặt. Không nhập nhằng hai chức năng này.

## 8. SCIENCE SCORE, RESEARCH CREDITS VÀ GARAGE

Science Score = tổng kết quả khoa học nhiệm vụ, không bị trừ khi nâng cấp. Research Credits (RC) = đơn vị phần thưởng HƯ CẤU dành cho progression; nhận khi hoàn tất mục tiêu khảo sát và truyền dữ liệu thành công. NASA thực tế không 'trả tiền ngay theo MB/viên đá' và không gửi thiết bị tức thời sau khi người chơi bấm Transmit.

Một điểm nghiên cứu cho thưởng khám phá đầu tiên; quét lại không farm vô hạn. Data chưa truyền nằm trong bộ nhớ rover, chưa được cộng RC. Có thể có hệ số thưởng theo độ hiếm mục tiêu hoặc chất lượng dữ liệu nhưng phải cân bằng để người chơi không lặp một thao tác kiếm tiền.

Lander Garage: rover quay lại vị trí lander mới thay bánh/thiết bị từ kho. RC chỉ đại diện cho quyền mở khóa hoặc cấp nguồn lực gameplay để kích hoạt MODULE ĐÃ ĐƯỢC MANG THEO. Mua phụ kiện mới giữa Sao Hỏa, chế tạo máy in 3D, nhặt hợp kim phế liệu và thả kén tiếp tế đều nằm ngoài MVP.

Nếu mission tiếp theo cho thay loadout từ Trái Đất, có thể sử dụng RC để mở khóa catalog thiết bị trước khi bước vào mission mới. Cần nêu rõ cơ chế game hóa; không trình bày như cách tài trợ thực tế cho nhiệm vụ NASA.

## 9. CÁC MISSION DÙNG CHUNG BẢN ĐỒ

MISSION 01 — FIRST SURVEY (tutorial): khảo sát hai điểm khoa học gần lander, nền cứng xen cát. Dạy chuyển từ Plan sang Drive, WASD điều khiển, waypoint guidance, điều chỉnh đường khi lái, scanner, sạc và transmit. Game yêu cầu người chơi tự lái để tiếp cận điểm khảo sát.

MISSION 02 — THE DUNE CROSSING (core demo): điểm nghiên cứu nằm sau một dải cát mềm; tồn tại tuyến xuyên cát ngắn và đường vòng nền cứng dài. Người chơi tự chọn bánh, scanner, đường đi và chiến lược sạc. Đây là mission thể hiện rõ trade-off và nên ưu tiên hoàn chỉnh.

MISSION 03 — INTO THE CRATER (stretch): mục tiêu dưới vùng dốc/đá sắc và đoạn khuất nắng. Người chơi phải dự tính chi phí xuống/lên dốc, khả năng hao mòn và điện để về hoặc truyền dữ liệu. Chỉ hoàn thiện sau khi mission 01–02 chạy end-to-end.

Một bộ engine và scene, ba cấu hình dữ liệu nhiệm vụ; không xây ba map riêng. Ít nhất 2 mission đầu chơi được trong MVP, mission 03 là mục tiêu mở rộng nếu còn thời gian.

## 10. CÁCH TÍNH KẾT QUẢ VÀ TRẠNG THÁI

Full Success: hoàn thành các science objectives bắt buộc và truyền dữ liệu trong hạn, rover không mất khả năng hoạt động. Partial Success: truyền được một phần dữ liệu hoặc hoàn thành thiếu mục tiêu khoa học, vẫn có phần thưởng tương ứng. Mission Failure: hết thời gian quan trọng, không thể tiếp tục do điện dưới mức vận hành hoặc rover bị kẹt/hỏng và không có đường cứu vãn.

Báo cáo chấm riêng SCIENCE, ENERGY EFFICIENCY, TIME, RISK và DESIGN COMPLIANCE thay vì chỉ có một 'chiến lược chuẩn'. Khi fail, người chơi được chỉ ra tuyến nào ngốn năng lượng, bánh nào gây rủi ro, vì sao việc sạc bị hạn chế và có thể thử cách khác.

Ví dụ: rover W1 đi vòng qua nền cứng vẫn có thể thắng; rover W2 cắt qua cát cũng có thể thắng; W3 chấp nhận chi phí thiết kế cao để qua đá sắc. Không hardcode S Rank chỉ dành cho 'bánh nhẹ rồi về thay bánh to'.

## 11. MVP CẦN LÀM VÀ CHỨC NĂNG CẮT BỎ

P0 — BẮT BUỘC: một Mars map low-poly có ít nhất 3 loại nền; rover 3D lái WASD thực, camera bám theo; 3 loại bánh có trade-off; một Battery và solar recharge; PLANNING click waypoint + Preview energy/time/risk; START DRIVE để người chơi TỰ lái theo vệt chỉ đường; PAUSE/REPLAN; tính chi phí theo đường chạy THỰC; SCAN/ANALYZE/TRANSMIT; Mission Design budget/mass, lander/garage module dự phòng; 2 mission; Science Score/RC; Debrief; chơi end-to-end. 100% PLAYER-FACING ENGLISH: nút, labels, keyboard hints, HUD, tutorial, error, success, telemetry logs, science facts, alt/aria. Tài liệu nội bộ có thể là tiếng Việt.

P1 — NẾU CÒN THỜI GIAN: môi trường thứ tư/thứ năm, enhanced scanner và thay model scanner, mission 03, ảnh thumbnail mission, hiệu ứng bụi/đá, timeline hiển thị đẹp hơn. Luôn ưu tiên kết nối và test luồng trước khi mở rộng.

OUT OF SCOPE: tên lửa/quỹ đạo/Δv/hạ cánh vật lý; nhiều hành tinh; autopilot Plan & Execute (click rồi xe tự chạy); click-to-move; chuyển thủ công/tự động phức tạp; ISRU/3D printing; mua đồ vật lý mới ở Mars; orbital supply pods; nhiều ăng-ten; open-world khổng lồ; rigid-body physics xe; multiplayer; random crisis không gắn với thiết kế. WASD ĐƯỢC GIỮ LÀ ĐIỀU KHIỂN CHÍNH, nhưng không đòi mô phỏng vật lý lái xe nặng.

## 12. PHÂN CÔNG 5 THÀNH VIÊN / 4 LUỒNG

Duy — UI/UX + Integrator (feat/ui): thiết kế Mission Select, Hangar, Planning UI (waypoints, Preview, Start Drive), Driving HUD (WASD instructions, actual power/time), Pause/Replan, garage/debrief, tất cả player-facing copy bằng tiếng Anh. Duy điều phối event input/focus, tích hợp state giữa scene và simulation, PR, test và deploy.

Bảo — Three.js (feat/scene): map Mars low-poly với ba nền rõ rệt, rover 3D đổi bánh, hai camera planning isometric + driving chase, vạch waypoint và HUD indicator, điều khiển WASD/đánh lái, chuyển động mượt, feedback terrain và scan. Reuse hiện trạng MarsOpenWorld nếu hợp lý, tránh viết lại toàn bộ. Không tự tính/trừ Battery trong scene.

Hải — Simulation (feat/simulation): một nguồn state thật cho battery/time/position, hàm route preview và drive-step/travel cost dựa trên tọa độ thật (deltaTime), hệ số bánh/địa hình, solar, scanner uncertainty, science/credits, mission outcome và deterministic tests. Xóa/đánh dấu legacy tile-turn/Math.random nếu ảnh hưởng hệ thống mới; không chỉnh src/data hay src/content khi chưa thống nhất.

Sơn — NASA Science/Data (feat/content-data; src/data/ + docs/science/): nguồn NASA, định nghĩa terrain/mass/energy/wheel/solar và giới hạn dữ liệu; nêu rõ WASD là abstraction điều khiển để học chiến thuật, không mô phỏng điều khiển thời gian thực từ Trái Đất. Kiểm tra nhãn số liệu GAME BALANCE và các dữ liệu được dùng thật; không đụng src/sim.

Cường — Game Design/Content (cùng feat/content-data; src/content/ + docs/design/): Mission 01–03 với nhiều đường và chiến thuật, tutorial tiếng Anh cho Planning/Start Drive/WASD, sci-site text, labels/scoring/credits, kịch bản pitch và asset checklist; chỉ dùng nội dung tiếng Anh trong game.

Shared contracts: src/types/game.ts là chỗ thống nhất định nghĩa PlanRoute, DrivingInput (forward/back/left/right), RoverPose (x,z,heading,speed), TerrainSample, TravelTelemetry, energy/time budget, result/outcome. Scene nhận state và phát input/telemetry sự kiện, simulation là nguồn duy nhất tính chi phí/time/mission state, UI chỉ hiển thị/gửi command. Duy chốt hợp đồng với Bảo và Hải trước khi sửa code phụ thuộc. Không sửa đè công việc mới của nhau; test npm run build + thao tác thực tế bằng keyboard.

## 13. BÀI DEMO CHO GIÁM KHẢO (3–5 PHÚT)

(0:00) Mission 02 Dune Crossing. (0:20) Chọn rover và bánh nhẹ. (0:50) Planning: click vạch tuyến đường vòng hoặc xuyên cát, xem estimate điện/thời gian/rủi ro. (1:20) Nhấn START DRIVE. (1:30–2:30) Người chơi lái W/S/A/D thật theo các waypoint; thử lệch vào cát để thấy tốc độ và battery thay đổi. (2:30) Dừng tại site, SCAN/ANALYZE rồi TRANSMIT để nhận Science Score và RC. (3:10) Mission Report so sánh planned vs actual energy/time; (3:40) thử bánh rộng với tuyến cát để cho thấy chiến lược thứ hai. 100% chữ và voice/text trên game bằng tiếng Anh.

Giá trị giáo dục cần chứng minh: thiết kế vật lý ảnh hưởng hiệu quả chuyến đi; không chỉ 'nhấn đúng đáp án' mà người chơi phải dự toán, thích nghi, kiểm nghiệm quyết định và học lý do tại sao nhiệm vụ thành công hay thất bại.

## 14. NGUYÊN TẮC TÍNH KHOA HỌC VÀ NGUỒN THAM KHẢO

(A) EU, RC, wheel/terrain factors, risk và ngân sách prototype là GAME BALANCE, không tự nhận số NASA. (B) Chỉ ghi 'NASA data' khi có URL, đơn vị, vai trò thực trong phép tính. (C) Terrain Scanner không biết chắc 100% địa hình. (D) Thay bánh tại lander và RC là giả lập phục vụ game. (E) WASD/chase camera là cách điều khiển TRỰC TIẾP CHO NGƯỜI CHƠI trong mô phỏng giáo dục, KHÔNG phải NASA lái rover từ Trái Đất theo thời gian thực; rover thực chịu trễ liên lạc và thường lập chuỗi lệnh tự hành. Mọi lời giải thích cho người chơi được viết bằng tiếng Anh.

Nguồn đọc và xác minh: NASA Space Apps 2026 — https://www.spaceappschallenge.org/2026/ ; NASA Perseverance Rover Components (NavCam, HazCam, hệ thống) — https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/ ; NASA Curiosity vs Perseverance wheels — https://science.nasa.gov/resource/curiositys-and-perseverances-wheels/ ; JPL Perseverance rover engineering — https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/perseverance_rover/ ; NASA Opportunity mission (pin mặt trời và bão bụi) — https://science.nasa.gov/mission/mer-opportunity/ .

Giới hạn cần nói thẳng: đây là educational mission trade-off simulator, không phải phần mềm lập kế hoạch hàng không vũ trụ cấp bay thật, không mô phỏng đầy đủ vật lý lốp xe, nguồn điện thực hay liên lạc liên hành tinh.

## 15. ACCEPTANCE CHECKLIST

[ ] Mission 01 & 02 chơi end-to-end; [ ] có ít nhất 2 tuyến viable tới một site; [ ] click waypoint → preview → START DRIVE → tự lái WASD và đường được vẽ còn hiển thị; [ ] xe KHÔNG tự chạy nếu người chơi không nhấn W/S; [ ] lái chệch tuyến thay đổi actual time/energy/risk; [ ] cùng đường lái và deltaTime đã định cho kết quả tái lập; [ ] 3 loại bánh thay đổi kết quả thật; [ ] pin/time không bị trừ hai lần trong scene + engine; [ ] solar sạc khi đứng yên & đủ sáng; [ ] Terrain Scanner không biết 100%; [ ] truyền data một lần mới nhận RC; [ ] tổng mass tính phụ kiện dự phòng; [ ] Full/Partial/Failure + Retry; [ ] 100% game UI/tutorial/HUD/errors/logs/aria bằng tiếng Anh; [ ] npm run build PASS, keyboard/browser smoke test và ảnh demo.

Ghi chú: concept đã được rút gọn có chủ đích để hoàn thành một trò chơi tương tác thực sự trong hackathon. Không đưa lại các phần tên lửa, Δv, chế tạo ISRU hay hành tinh thứ hai vào phạm vi MVP khi chưa hoàn thành luồng cốt lõi.

