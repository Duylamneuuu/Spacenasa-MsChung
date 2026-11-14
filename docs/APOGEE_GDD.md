# APOGEE: MARS ROVER ARCHITECT

**Editable source:** [Google Docs](https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit). This file is a snapshot synced on 14 Nov 2026; if they differ, the Google Doc wins.

*GAME DESIGN DOCUMENT (GDD) · MS CHUNG · NASA SPACE APPS 2026 · Bản thống nhất 14/11/2026 · Cập nhật theo bản đang chạy trên main*

Trạng thái: CONCEPT ĐÃ CHỐT và ĐÃ CHƠI ĐƯỢC — APOGEE dùng Plan & Drive (lập tuyến trước, tự lái WASD sau). Một Sao Hỏa, nhiều địa hình và hai nhiệm vụ khoa học. Bản live: https://apogee-mars-rover.vercel.app/ (build từ nhánh main). Khi vào màn chơi, cảnh 3D chiếm toàn màn hình; camera nhìn chéo từ trên khi lập kế hoạch và bám sau rover khi lái. NGÔN NGỮ: tiếng Anh là ngôn ngữ mặc định và là bản dùng để chấm; game có thêm nút chuyển EN/VI (bản Việt hóa) cho toàn bộ menu, HUD, hướng dẫn, thông báo của engine và Mission Report. Tài liệu nội bộ có thể viết tiếng Việt.

## 1. TẦM NHÌN VÀ GIỚI HẠN

APOGEE là trò chơi giáo dục thiết kế và điều hành nhiệm vụ rover trên Sao Hỏa. Người chơi chọn rover, phụ kiện và giới hạn tải trọng, vạch tuyến thám hiểm trước khi xuất phát, xem dự báo năng lượng/thời gian/rủi ro, rồi tự lái xe theo đường hướng dẫn bằng WASD. Lái lệch tuyến sẽ có chi phí thực tế riêng; người chơi khảo sát, truyền kết quả khoa học và học các đánh đổi thiết kế. Không phải game tự lái autopilot.

Điểm khác biệt: cùng một mission có thể giải bằng nhiều cấu hình và nhiều tuyến đường. Đi qua cát để rút ngắn quãng đường hay vòng qua đá cứng để tiết kiệm pin? Mang bánh nặng để giảm nguy cơ hay giữ xe nhẹ để khảo sát nhanh? Kết quả phải được mô phỏng và giải thích, không quyết định bằng nút chọn A/B/C.

Bám đề Space Mission Design Game: màn Mission Design thể hiện mission objective, payload, khối lượng, ngân sách và năng lượng; màn Simulation cho thấy hậu quả; Debrief giải thích bài toán trade-off. Không làm game phóng tên lửa, chọn quỹ đạo, tính Δv hay mô phỏng hạ cánh vật lý trong MVP. Trước khi triển khai chỉ cần kiểm tra các giới hạn thiết kế (preflight).

## 2. MASTER GAME LOOP

(1) SELECT MISSION → (2) DESIGN ROVER & PAYLOAD → (3) PREFLIGHT CHECK → (4) DEPLOY (chuyển cảnh ngắn) → (5) PLANNING MODE: CHỌN WAYPOINTS & SCIENCE SITES → (6) PREVIEW PLANNED ENERGY / TIME / RISK → (7) START DRIVE: NGƯỜI CHƠI TỰ LÁI WASD THEO ĐƯỜNG CHỈ DẪN → (8) SCAN / ANALYZE / TRANSMIT / STOP TO RECHARGE → (9) SCIENCE SCORE & RESEARCH CREDITS → (10) QUAY VỀ LANDER, ĐỔI MODULE DỰ PHÒNG → (11) DEBRIEF / NEXT MISSION. Không có chế độ tự lái bắt buộc.

Không có hệ thống chế tạo ISRU phức tạp, bán đá lấy tiền, nhặt 'cục năng lượng', thả kén tiếp tế từ quỹ đạo hay bay qua nhiều hành tinh. Thu thập mẫu đá là hoạt động khoa học; các địa hình và mission đều trên Sao Hỏa.

## 3. CÁC MÀN HÌNH VÀ TƯƠNG TÁC

### 3.1 Mission Select

Màn chọn nhiệm vụ dạng hồ sơ: bên trái là danh sách nhiệm vụ (Mission 01 có nhãn "Start here"), bên phải là mô tả, bản đồ khu vực có lander và các điểm mẫu, số mục tiêu, thời gian, ngân sách, giới hạn tải, và nút Design rover. Quả cầu Sao Hỏa 3D xoay ở nền. Hai nhiệm vụ dùng chung một bản đồ với điểm xuất phát và mục tiêu khác nhau.

### 3.2 Earth Hangar — Mission Design

Chọn cấu hình theo 4 tab: Wheels (Lightweight / Wide Traction / Reinforced), Scanner (Navigation Camera / Extended Stereo Camera), Science (Rock Analyzer / Mineral Spectrometer), Storage (Standard / Extended), cộng ngăn Spare modules để mang phụ tùng xuống lander. Rover 3D xoay trên bệ toàn màn hình và đổi bánh theo lựa chọn; mỗi loại bánh hiện thanh hệ số tiêu hao trên Firm/Sand/Rock. Thanh dưới hiển thị ngân sách (BU) và tổng khối lượng triển khai so với giới hạn của nhiệm vụ. Mỗi nhiệm vụ có một mẹo ngắn (Mission 01: cấu hình mặc định đã đủ; Mission 02: bánh nhẹ dễ mất bám trên cát). Không có một cấu hình tối ưu cho mọi mission.

Quy tắc khối lượng: TOTAL DEPLOYED MASS = LANDER + ROVER BASE + MODULES INSTALLED + SPARE MODULES + SUPPORT EQUIPMENT. Phụ kiện đã đóng trong kho lander VẪN tính vào tải trọng. Khi trở về lander, chỉ đổi sang module đã mang theo; không thể nhận phụ kiện vật lý mới một cách tức thời từ Trái Đất.

### 3.3 Preflight / Deploy

Màn Preflight là checklist: Budget, Deployed mass, Terrain scanner, Science instrument, Wheels, Solar battery; mỗi dòng đánh dấu đạt/không đạt kèm giá trị. Nếu có lỗi, nút Deploy bị khóa và hiển thị lý do để quay lại Hangar sửa. Nếu đạt, nhấn Deploy to Mars để xem chuyển cảnh ngắn rồi vào màn chơi; không có gameplay điều khiển tên lửa hoặc quỹ đạo.

### 3.4 Mars Operations — Bản đồ 3D

Cảnh 3D phủ toàn màn hình. PLANNING MODE: camera phối cảnh nhìn chéo từ trên toàn khu vực, viền khu khảo sát hiện bằng nét đứt; bấm mặt đất để đặt waypoint hoặc chọn tuyến gợi ý trong bảng Route Plan bên phải. DRIVING MODE: camera bám sau rover, có la bàn chỉ hướng tới waypoint hoặc mẫu đá kế tiếp kèm khoảng cách, minimap góc phải (phím M mở bản đồ chiến thuật), bụi bánh xe và cột sáng đánh dấu mẫu đá. Tuyến chỉ là chỉ dẫn, xe không tự chạy. W tiến, S lùi, A/D đổi hướng, Space phanh. HUD nổi trên cảnh: Battery, Time left, Speed, Sun, Ground, Data; mục tiêu, Science Score và RC ở trên; 4 nút hành động Scan (Q) / Analyze (F) / Transmit (T) / Recharge (R) ở góc phải dưới, mỗi nút hiện lý do khi bị khóa.

Ô chưa quét hiện tuyến nét đứt và ước tính dạng khoảng; Scan (Q) thu hẹp khoảng này cho các ô trong tầm camera, KHÔNG biết chắc có ổ cát lún. Mỗi loại địa hình có màu riêng; trên bản đồ chiến thuật, rê chuột vào ô hiện tên địa hình.

### 3.5 Debrief / Mission Report

Màn Debrief: tiêu đề kết quả (Mission complete / Partial success / Mission failed) và lý do; số đếm Science score, Research credits, Distance driven, Energy used, Energy recharged, Time left; bản đồ đường rover thực sự đã đi; trạng thái từng mẫu (Transmitted / Stored, not sent / Not analyzed); một nhận xét tiêu hao pin chủ yếu ở địa hình nào với loại bánh nào. Nút Missions, Try another loadout, và Next mission sau khi hoàn thành Mission 01.

## 4. ĐIỀU KHIỂN: PLAN → DRIVE (WASD) → REPLAN

CƠ CHẾ CHÍNH THỨC — PLAN & DRIVE, KHÔNG PHẢI AUTOPILOT: (A) Planning Mode: người chơi click map tạo waypoint và điểm nghiên cứu; path chỉ đường và game ước lượng năng lượng, thời gian, mức rủi ro. (B) Chọn START DRIVE; chuyển sang camera theo rover và kích hoạt điều khiển W/S tiến/lùi, A/D đánh lái. Người chơi PHẢI tự lái trên địa hình; không bấm Execute để xe tự chạy. (C) Người chơi có thể dừng/PAUSE hoặc trở về Planning để vạch lại đường. Đường hướng dẫn chỉ là gợi ý, không ép xe bám sát.

PLANNING: bấm địa hình để thêm waypoint; tuyến gợi ý có sẵn (Mission 01: Plot both samples; Mission 02: North detour / Dune shortcut); mỗi waypoint có nút xóa; nút Clear; nút Return về lander khi đã rời. Bảng ước tính Battery / Time / Risk thể hiện dạng khoảng (ví dụ 27–28 EU), kèm cảnh báo khi đi qua ô chưa quét, có nguy cơ vượt khả năng bám hoặc chạm mức pin dự phòng. Dòng chú thích luôn nhắc đây chỉ là ước tính. Người chơi quyết định đi xuyên cát ngắn hay vòng trên đường cứng dài, rồi nhấn START DRIVE (hoặc Enter). Chế độ này không có xe tự chạy.

DRIVING: WASD điều khiển liên tục theo deltaTime với chuyển động arcade/kinematic đơn giản, gia tốc, giới hạn tốc độ, khả năng quay, ảnh hưởng bánh và địa hình; không dùng mô phỏng rigid-body phức tạp. Chỉ khi XE THỰC SỰ DI CHUYỂN mới trừ năng lượng di chuyển và cộng thời gian/quãng đường. Terrain sampling theo tọa độ thực của rover, không theo đường vạch sẵn; lái lệch tuyến vào cát hoặc đá nguy hiểm làm thay đổi điện, tốc độ, rủi ro. Nếu kẹt/hết pin/đụng ranh giới thì dừng an toàn, cho cảnh báo và cho phép replan, reset hoặc failure có giải thích. Không tự teleport khi đổi mode.

MODE & ACTIONS: PLANNING → START DRIVE (Enter) → PAUSE (Esc) / REPLAN → RESUME (Enter). Khi lái, dừng gần mẫu đá để SCAN (Q), ANALYZE (F), TRANSMIT (T); RECHARGE (R) cần đứng yên và đủ nắng, mỗi lần 10 phút mô phỏng. Lander Garage mở được khi đỗ gần lander và có mang phụ tùng. Khi đang mở bản đồ chiến thuật hoặc garage, Enter chỉ thao tác trong hộp thoại đó. Nhả phím, mất focus hoặc chuyển tab thì xe phanh an toàn. Đường waypoint chỉ để định hướng (la bàn / minimap), không có click-to-move hay autopilot.

### 4.1 Hướng dẫn tương tác (tutorial)

Hướng dẫn chạy tự động ở lần đầu mỗi nhiệm vụ. Mỗi bước chỉ yêu cầu một việc, khoanh sáng đúng nút hoặc chỉ số cần nhìn, hiện phím cần bấm, và chỉ chuyển bước khi người chơi đã làm xong việc đó trong game. Thanh tiến độ 5 giai đoạn: Plan → Drive → Analyze → Send → Report.

Các bước của Mission 01: (1) Welcome to Mars, giới thiệu mục tiêu; (2) Plot a route, bấm Plot both samples; (3) Check the forecast, đọc Battery/Time/Risk; (4) Take the wheel, bấm Start drive; (5) Drive to the rock, giữ W, A/D để giữ hình thoi vàng giữa la bàn; (6) Stop here, Space tới khi tốc độ về 0; (7) Analyze the rock, F; (8) Send it to Earth, T; (9) One more rock, lặp lại cho mẫu thứ hai; cuối cùng Mission done, mở Report. Các bước phụ tự chen vào khi cần: Paused (nhắc Resume) và Battery is low (nhắc sạc R). Mission 02 dùng lời dẫn riêng về chọn bánh và hai tuyến.

Có nút Skip tutorial; nút ? trên HUD hoặc phím H để bật lại. Lựa chọn tắt/bật được nhớ theo trình duyệt cho từng nhiệm vụ.

### 4.2 Ngôn ngữ EN / VI

Tiếng Anh là mặc định và là bản dùng để chấm. Nút EN/VI ở màn đầu, thanh trên cùng các màn thiết kế và trên HUD. Bản Việt dịch toàn bộ menu, tên nhiệm vụ, mẫu đá, module, HUD, hướng dẫn, thông báo của engine (ví dụ: dừng an toàn, đã nhận dữ liệu) và Mission Report. Lựa chọn được nhớ theo trình duyệt; mở thẳng bản Việt bằng đường dẫn ?lang=vi.

## 5. MỘT BẢN ĐỒ SAO HỎA, NHIỀU MÔI TRƯỜNG

Bản hiện tại có 3 loại nền trên cùng một bản đồ 15 × 11 ô (mỗi ô 4,4 m), bao quanh bởi viền núi: A. FIRM GROUND (nền cứng): đi dễ, có thể phải đi vòng xa. B. SOFT SAND (cát mềm): tốn pin và thời gian, bánh không đủ bám sẽ bị dừng an toàn. C. SHARP ROCK (đá sắc): rủi ro cao, bánh gia cường đi tốt nhất. Có một vùng góc đông nam ít nắng, sạc pin gần như không được. Chưa làm (P1): D. SLOPE/CRATER (dốc/miệng hố) và E. SHADOWED CANYON (hẻm núi khuất nắng riêng).

Các môi trường xuất hiện CÙNG TRÊN MỘT BẢN ĐỒ. Cùng một đích có tuyến xuyên cát ngắn nhưng nguy hiểm và tuyến đường cứng dài nhưng an toàn. Đồ họa hiển thị mượt; số ô chỉ là đơn vị logic ẩn bên dưới. Không cần nhiều hành tinh, nhiều model hành tinh hoặc bản đồ 3D hoàn toàn riêng.

## 6. MA TRẬN BÁNH XE & TRADE-OFFS

Ba cấu hình bánh (mọi chỉ số sau đây là game balance, KHÔNG phải dữ liệu NASA):

W1 — LIGHTWEIGHT WHEELS (14 kg, 10 BU): nền cứng 0,80×; cát mềm 1,80×; đá sắc 1,60×. Phù hợp đường dễ và đi vòng, kém ở cát/đá sắc.

W2 — WIDE TRACTION WHEELS (32 kg, 23 BU): nền cứng 1,25×; cát mềm 0,85×; đá sắc 1,25×. Đi qua cát hiệu quả hơn, nhưng trên nền cứng kém tiết kiệm hơn W1.

W3 — REINFORCED WHEELS (39 kg, 29 BU): nền cứng 1,15×; cát mềm 1,30×; đá sắc 0,75×. Bền khi qua vùng đá sắc, nhưng không phải lựa chọn tốt nhất cho cát. Hệ số dốc trong bản thiết kế ban đầu chưa dùng vì bản đồ hiện chưa có dốc.

Công thức tính di chuyển dự kiến cho mỗi đoạn: MOVE_ENERGY_ESTIMATE = BASE_DISTANCE_COST × TERRAIN_FACTOR × WHEEL_FACTOR × LOAD_FACTOR. Lái thực tế: tích lũy MOVEMENT_ENERGY theo quãng đường thực chạy qua mỗi loại địa hình, thời gian và cấu hình; KHÔNG tự trừ cả tuyến ngay khi Start Drive. Cả hai dùng chung hàm chi phí cơ bản; chênh lệch do người lái đổi tuyến/tốc độ/dừng. Tránh nhân đôi hệ số dốc; dùng deltaTime clamp, hạn chế phụ thuộc FPS. Các hệ số là GAME BALANCE, không phải số đo NASA. Rủi ro không bảo đảm 0% cho bất cứ bánh xe nào.

Ví dụ trên cùng điểm đến: W1 có thể chọn đi vòng trên nền cứng; W2 có thể chấp nhận cắt qua vùng cát; W3 có thể vòng qua tuyến đá sắc. Cả ba chiến lược có cơ hội hoàn thành, nhưng khác nhau ở thời gian/điện/rủi ro. Thiết kế level không được ngầm chỉ có một đáp án đúng.

## 7. PIN, SẠC VÀ TERRAIN SCANNER

### 7.1 Một mô hình năng lượng đơn giản

MVP chỉ có một hệ pin dự trữ dùng cho toàn bộ hành động và một cách nạp chính: solar charging khi có ánh sáng. Không có lựa chọn Solar vs MMRTG, không có trạm năng lượng có thể nhặt và không có 'đồi nắng +25 EU lập tức'. Trạng thái Battery có thể hiển thị 0–100 EU (đơn vị cân bằng game).

Pin giảm khi xe thực sự di chuyển (theo quãng đường/địa hình/cấu hình), khi SCAN, ANALYZE hoặc TRANSMIT. Đứng yên khi có ánh sáng tốt có thể sạc, nhưng tiêu tốn thời gian nhiệm vụ; không có ô 'năng lượng miễn phí'. Khu vực râm/bụi dày làm giảm tốc độ nạp. Đồng hồ và Battery phải cập nhật từ một nguồn state có thẩm quyền, tránh trừ pin cả trong renderer và engine.

Số đang dùng trong game (GAME BALANCE, không phải số NASA): Battery 100 EU; dự trữ an toàn 15 EU; di chuyển cơ bản 4,8 EU cho mỗi ô 4,4 m trước khi nhân hệ số địa hình/bánh/tải; SCAN 6 EU (Stereo 8 EU), 4 phút; ANALYZE 12 EU (Spectrometer 16 EU), 7 phút; TRANSMIT 6 EU, 4 phút; RECHARGE tối đa +8 EU mỗi 10 phút, nhân với mức nắng tại chỗ (vùng tối dưới 25% thì không sạc được). Chu kỳ ngày-đêm dùng độ dài sol 24,6 giờ theo NASA Mars Facts.

PLANNING PREVIEW hiển thị năng lượng và thời gian ƯỚC TÍNH nếu đi gần tuyến đã chọn, có cảnh báo khi dưới ngưỡng an toàn 15 EU. DRIVING HUD hiển thị tiêu hao THỰC TẾ khi xe lái, và có thể hiển thị remaining-route estimate dựa trên vị trí thật. Lái lệch tuyến làm dự báo thay đổi. Battery luôn clamp trong [0, max]; cạn điện phải có trạng thái hỏng/hết nhiệm vụ rõ ràng.

### 7.2 Terrain Scanner

Terrain Scanner là hệ thống gameplay tổng hợp dựa trên ý tưởng camera điều hướng/nhận diện nguy hiểm của rover, KHÔNG phải tuyên bố radar xuyên đất nhìn được 100% mọi ổ cát lún. Basic Scan tiêu hao ít điện, quét gần; Enhanced Scan (nếu đủ thời gian) quét xa hơn nhưng nặng/tốn điện/ngân sách hơn. Quét cho người chơi biết vùng hard/sand/rock/slope hoặc đánh giá độ rủi ro, với mức độ bất định được hiển thị.

Nếu dùng tên khoa học: NavCam/HazCam phục vụ quan sát, nhận diện vật cản; thiết bị radar xuyên đất như RIMFAX chủ yếu phục vụ nghiên cứu cấu trúc dưới bề mặt. Không nhập nhằng hai chức năng này.

## 8. SCIENCE SCORE, RESEARCH CREDITS VÀ GARAGE

Science Score = tổng kết quả khoa học nhiệm vụ, không bị trừ khi nâng cấp. Research Credits (RC) = đơn vị phần thưởng HƯ CẤU dành cho progression; nhận khi hoàn tất mục tiêu khảo sát và truyền dữ liệu thành công. NASA thực tế không 'trả tiền ngay theo MB/viên đá' và không gửi thiết bị tức thời sau khi người chơi bấm Transmit.

Một điểm nghiên cứu cho thưởng khám phá đầu tiên; quét lại không farm vô hạn. Data chưa truyền nằm trong bộ nhớ rover, chưa được cộng RC. Có thể có hệ số thưởng theo độ hiếm mục tiêu hoặc chất lượng dữ liệu nhưng phải cân bằng để người chơi không lặp một thao tác kiếm tiền.

Lander Garage: đỗ gần lander và có phụ tùng đã mang theo thì nút Garage xuất hiện; mỗi lần lắp tốn 4 RC và 4 phút mô phỏng. RC chỉ đại diện cho quyền kích hoạt MODULE ĐÃ ĐƯỢC MANG THEO. Mua phụ kiện mới giữa Sao Hỏa, chế tạo máy in 3D, nhặt hợp kim phế liệu và thả kén tiếp tế đều nằm ngoài MVP.

Nếu mission tiếp theo cho thay loadout từ Trái Đất, có thể sử dụng RC để mở khóa catalog thiết bị trước khi bước vào mission mới. Cần nêu rõ cơ chế game hóa; không trình bày như cách tài trợ thực tế cho nhiệm vụ NASA.

## 9. CÁC MISSION DÙNG CHUNG BẢN ĐỒ

MISSION 01 — FIRST SURVEY (tutorial, gắn nhãn "Start here"): hai mẫu Basalt Outcrop (20 điểm / 8 RC) và Mineral Vein (30 điểm / 12 RC) gần lander, chủ yếu nền cứng; giới hạn 90 phút, ngân sách 132 BU, tải 322 kg. Hướng dẫn tương tác chạy tự động lần đầu (xem mục 4.1). Với Standard Storage phải truyền mẫu thứ nhất trước khi phân tích mẫu thứ hai. Hoàn thành đủ hai mẫu: 50 điểm khoa học, 20 RC.

MISSION 02 — THE DUNE CROSSING (core demo): mục tiêu Sedimentary Cliff (60 điểm / 24 RC) nằm sau dải cát mềm; giới hạn 106 phút, ngân sách 146 BU, tải 337 kg. Hai tuyến gợi ý: North detour đi vòng trên nền cứng, Dune shortcut cắt thẳng qua cát. Đã kiểm chứng trên trình duyệt: bánh nhẹ + North detour hoàn thành; bánh bản rộng + Dune shortcut hoàn thành; bánh nhẹ đi thẳng vào cát thì rover dừng an toàn vì vượt khả năng bám.

MISSION 03 — INTO THE CRATER (stretch, CHƯA LÀM, không có trong menu): mục tiêu dưới vùng dốc/đá sắc và đoạn khuất nắng. Chỉ làm sau khi Mission 01–02 ổn định.

Một bộ engine và scene dùng cho mọi nhiệm vụ; không xây map riêng. Bản hiện tại có Mission 01 và 02; Mission 03 là mục tiêu mở rộng.

## 10. CÁCH TÍNH KẾT QUẢ VÀ TRẠNG THÁI

Full Success: hoàn thành các science objectives bắt buộc và truyền dữ liệu trong hạn, rover không mất khả năng hoạt động. Partial Success: truyền được một phần dữ liệu hoặc hoàn thành thiếu mục tiêu khoa học, vẫn có phần thưởng tương ứng. Mission Failure: hết thời gian quan trọng, không thể tiếp tục do điện dưới mức vận hành hoặc rover bị kẹt/hỏng và không có đường cứu vãn.

Bản hiện tại: Debrief hiển thị Science, RC, quãng đường, pin đã dùng/đã sạc, thời gian còn lại, số lần dừng an toàn và địa hình tốn pin nhất. Chưa có bảng chấm riêng ENERGY EFFICIENCY / RISK / DESIGN COMPLIANCE và chưa có cột so sánh Estimate với Actual trong Debrief; khi demo, so dự báo ở Route Plan với Battery/Time thực trên HUD.

Ví dụ: rover W1 đi vòng qua nền cứng vẫn có thể thắng; rover W2 cắt qua cát cũng có thể thắng; W3 chấp nhận chi phí thiết kế cao để qua đá sắc. Không hardcode S Rank chỉ dành cho 'bánh nhẹ rồi về thay bánh to'.

## 11. MVP CẦN LÀM VÀ CHỨC NĂNG CẮT BỎ

P0 — ĐÃ CÓ TRONG BẢN LIVE: bản đồ Mars low-poly 3 loại nền (Firm ground, Soft sand, Sharp rock) có viền núi bao quanh; rover 3D lái WASD, camera bám theo; 3 loại bánh có trade-off và đổi hình trên rover; một Battery và solar recharge; Planning bấm waypoint + ước tính Battery/Time/Risk; Start Drive tự lái theo chỉ dẫn; Pause/Replan; chi phí theo đường chạy thực; Scan/Analyze/Transmit; Hangar budget/mass, Preflight checklist, Lander Garage với phụ tùng đã mang; 2 mission; Science Score/RC; Debrief; hướng dẫn tương tác; giao diện EN mặc định và EN/VI. Chỉ chơi đầy đủ bằng bàn phím trên desktop; chưa có điều khiển cảm ứng.

P1 — CHƯA LÀM: môi trường thứ tư/thứ năm (dốc, vùng khuất nắng riêng), Mission 03, model GLB cuối của rover (adapter đã sẵn, đặc tả ở docs/MODEL_IMPORT_SPEC.md), điều khiển cảm ứng, bảng Estimate vs Actual trong Debrief. Luôn ưu tiên giữ luồng chính ổn định trước khi mở rộng.

OUT OF SCOPE: tên lửa/quỹ đạo/Δv/hạ cánh vật lý; nhiều hành tinh; autopilot Plan & Execute (click rồi xe tự chạy); click-to-move; chuyển thủ công/tự động phức tạp; ISRU/3D printing; mua đồ vật lý mới ở Mars; orbital supply pods; nhiều ăng-ten; open-world khổng lồ; rigid-body physics xe; multiplayer; random crisis không gắn với thiết kế. WASD ĐƯỢC GIỮ LÀ ĐIỀU KHIỂN CHÍNH, nhưng không đòi mô phỏng vật lý lái xe nặng.

## 12. PHÂN CÔNG 5 THÀNH VIÊN / 4 LUỒNG

Duy — UI/UX + Integrator (feat/ui): thiết kế Mission Select, Hangar, Planning UI (waypoints, Preview, Start Drive), Driving HUD (WASD instructions, actual power/time), Pause/Replan, garage/debrief, tất cả player-facing copy bằng tiếng Anh. Duy điều phối event input/focus, tích hợp state giữa scene và simulation, PR, test và deploy.

Bảo — Three.js (feat/scene): map Mars low-poly với ba nền rõ rệt, rover 3D đổi bánh, hai camera planning isometric + driving chase, vạch waypoint và HUD indicator, điều khiển WASD/đánh lái, chuyển động mượt, feedback terrain và scan. Reuse hiện trạng MarsOpenWorld nếu hợp lý, tránh viết lại toàn bộ. Không tự tính/trừ Battery trong scene.

Hải — Simulation (feat/simulation): một nguồn state thật cho battery/time/position, hàm route preview và drive-step/travel cost dựa trên tọa độ thật (deltaTime), hệ số bánh/địa hình, solar, scanner uncertainty, science/credits, mission outcome và deterministic tests. Xóa/đánh dấu legacy tile-turn/Math.random nếu ảnh hưởng hệ thống mới; không chỉnh src/data hay src/content khi chưa thống nhất.

Sơn — NASA Science/Data (feat/content-data; src/data/ + docs/science/): nguồn NASA, định nghĩa terrain/mass/energy/wheel/solar và giới hạn dữ liệu; nêu rõ WASD là abstraction điều khiển để học chiến thuật, không mô phỏng điều khiển thời gian thực từ Trái Đất. Kiểm tra nhãn số liệu GAME BALANCE và các dữ liệu được dùng thật; không đụng src/sim.

Cường — Game Design/Content (cùng feat/content-data; src/content/ + docs/design/): Mission 01–03 với nhiều đường và chiến thuật, tutorial tiếng Anh cho Planning/Start Drive/WASD, sci-site text, labels/scoring/credits, kịch bản pitch và asset checklist; chỉ dùng nội dung tiếng Anh trong game.

Code đang chạy: hợp đồng chung ở src/types/expedition.ts (ControlMode, DrivingInput, RoverPose, PlanPreview/RouteEstimate, DriveStepResult, MissionState). Mô phỏng thuần ở src/sim/expedition.ts là nguồn duy nhất tính pin/thời gian/vị trí; scene (src/scene/ExpeditionScene.tsx) chỉ vẽ trạng thái; HUD và tutorial ở src/ui/ExpeditionOperations.tsx; chữ EN/VI ở src/i18n.ts. Các file cũ src/types/game.ts, MarsOpenWorld, OperationsView vẫn trong repo nhưng app không dùng. Kiểm tra bằng npm test, npm run build và chơi thử bằng bàn phím.

## 13. BÀI DEMO CHO GIÁM KHẢO (3–5 PHÚT)

(0:00) Màn đầu, bấm Start expedition. (0:15) Chọn Mission 02 The Dune Crossing. (0:30) Hangar: giữ bánh nhẹ, chỉ ra hệ số Sand 1,80×; Preflight, Deploy to Mars. (0:50) Planning: chọn North detour, đọc ước tính Battery/Time/Risk. (1:10) Start drive; để tay khỏi bàn phím 2 giây cho thấy xe không tự chạy. (1:20–2:30) Lái WASD theo la bàn tới vách trầm tích. (2:30) Space dừng, Q quét, F phân tích, T truyền; điểm và RC hiện ở HUD. (2:50) Mở Report. (3:10) Try another loadout: chọn bánh bản rộng, Dune shortcut, lái thẳng qua cát để thấy chiến lược thứ hai. Nếu cần trình bày cho khán giả Việt, có thể bật VI ở góc trên, nhưng bản chấm dùng tiếng Anh.

Giá trị giáo dục cần chứng minh: thiết kế vật lý ảnh hưởng hiệu quả chuyến đi; không chỉ 'nhấn đúng đáp án' mà người chơi phải dự toán, thích nghi, kiểm nghiệm quyết định và học lý do tại sao nhiệm vụ thành công hay thất bại.

## 14. NGUYÊN TẮC TÍNH KHOA HỌC VÀ NGUỒN THAM KHẢO

(A) EU, RC, wheel/terrain factors, risk và ngân sách prototype là GAME BALANCE, không tự nhận số NASA. (B) Chỉ ghi 'NASA data' khi có URL, đơn vị, vai trò thực trong phép tính. (C) Terrain Scanner không biết chắc 100% địa hình. (D) Thay bánh tại lander và RC là giả lập phục vụ game. (E) WASD/chase camera là cách điều khiển TRỰC TIẾP CHO NGƯỜI CHƠI trong mô phỏng giáo dục, KHÔNG phải NASA lái rover từ Trái Đất theo thời gian thực; rover thực chịu trễ liên lạc và thường lập chuỗi lệnh tự hành. Mọi lời giải thích cho người chơi được viết bằng tiếng Anh.

Nguồn đọc và xác minh: NASA Space Apps 2026 — https://www.spaceappschallenge.org/2026/ ; NASA Perseverance Rover Components (NavCam, HazCam, hệ thống) — https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/ ; NASA Curiosity vs Perseverance wheels — https://science.nasa.gov/resource/curiositys-and-perseverances-wheels/ ; JPL Perseverance rover engineering — https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/perseverance_rover/ ; NASA Opportunity mission (pin mặt trời và bão bụi) — https://science.nasa.gov/mission/mer-opportunity/ .

Giới hạn cần nói thẳng: đây là educational mission trade-off simulator, không phải phần mềm lập kế hoạch hàng không vũ trụ cấp bay thật, không mô phỏng đầy đủ vật lý lốp xe, nguồn điện thực hay liên lạc liên hành tinh.

## 15. ACCEPTANCE CHECKLIST

Trạng thái kiểm thử bản live (commit 8657096, ngày 14/11/2026, Chromium, bàn phím): [x] Mission 01 & 02 chơi end-to-end; [x] hai tuyến hoàn thành Mission 02 (North detour với bánh nhẹ, Dune shortcut với bánh bản rộng); [x] bấm waypoint → ước tính → Start drive → tự lái WASD, tuyến vẫn hiển thị; [x] xe không tự chạy khi không bấm phím; [x] chi phí tính theo đường chạy thực; [x] cùng input và bước thời gian cho kết quả lặp lại (test engine); [x] 3 loại bánh đổi kết quả thật; [x] sạc khi đứng yên và đủ sáng; [x] Terrain Scanner chỉ thu hẹp ước lượng; [x] truyền một lần mới nhận RC, không nhận lại; [x] tổng khối lượng tính phụ tùng; [x] Mission complete / Partial / Failed + thử lại; [x] tutorial tiếng Việt đi hết 9 bước Mission 01; [x] 11 test engine và npm run build pass. [ ] Garage chưa thử trên trình duyệt (đã có test engine); [ ] chưa có điều khiển cảm ứng; [ ] chưa có model GLB cuối.

Ghi chú: concept đã được rút gọn có chủ đích để hoàn thành một trò chơi tương tác thực sự trong hackathon. Không đưa lại các phần tên lửa, Δv, chế tạo ISRU hay hành tinh thứ hai vào phạm vi MVP khi chưa hoàn thành luồng cốt lõi.
