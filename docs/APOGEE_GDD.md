# APOGEE: Mars Rover Architect — Game Design Document v1.0

**Team:** MS Chung · **NASA Space Apps 2026** · **Approved concept:** 2026-11-14

**Editable Google Docs origin:** https://docs.google.com/document/d/1V2svKyaGYkj_hA6f7MTabp8gnvi-QhEMNVChFwML8yE/edit

> This is a Markdown snapshot of the agreed Google Doc. It is not an automatically synchronized mirror. Confirm future concept edits with Duy before changing implementation contracts.

*GAME DESIGN DOCUMENT (GDD) · MS CHUNG · NASA SPACE APPS 2026 · Bản thống nhất 14/11/2026*

Trạng thái: Concept đã chốt để triển khai MVP. Một hành tinh Sao Hỏa, nhiều môi trường/địa hình và nhiều nhiệm vụ khoa học. Trải nghiệm chiến thuật Plan & Execute trong bản đồ Three.js 2.5D/isometric.

## 1. TẦM NHÌN VÀ GIỚI HẠN

APOGEE là trò chơi giáo dục về thiết kế và điều hành một nhiệm vụ rover trên Sao Hỏa. Người chơi lắp cấu hình xe trong giới hạn ngân sách và tải trọng, chọn tuyến khảo sát giữa các loại địa hình, gửi kế hoạch, quan sát rover thực thi, thu dữ liệu khoa học và cải tiến chiến thuật. Mọi lựa chọn kỹ thuật có lợi thế và cái giá phải trả.

Điểm khác biệt: cùng một mission có thể giải bằng nhiều cấu hình và nhiều tuyến đường. Đi qua cát để rút ngắn quãng đường hay vòng qua đá cứng để tiết kiệm pin? Mang bánh nặng để giảm nguy cơ hay giữ xe nhẹ để khảo sát nhanh? Kết quả phải được mô phỏng và giải thích, không quyết định bằng nút chọn A/B/C.

Bám đề Space Mission Design Game: màn Mission Design thể hiện mission objective, payload, khối lượng, ngân sách và năng lượng; màn Simulation cho thấy hậu quả; Debrief giải thích bài toán trade-off. Không làm game phóng tên lửa, chọn quỹ đạo, tính Δv hay mô phỏng hạ cánh vật lý trong MVP. Trước khi triển khai chỉ cần kiểm tra các giới hạn thiết kế (preflight).

## 2. MASTER GAME LOOP

(1) SELECT MISSION → (2) DESIGN ROVER & PAYLOAD → (3) PREFLIGHT CHECK → (4) DEPLOY (chuyển cảnh ngắn) → (5) PLAN ROUTE & SCIENCE TASKS → (6) PREVIEW ENERGY / TIME / RISK → (7) EXECUTE & OBSERVE 3D → (8) SCAN / ANALYZE / TRANSMIT → (9) RESEARCH CREDITS & SCIENCE SCORE → (10) RETURN TO LANDER / RECONFIGURE (nếu có module đã mang theo) → (11) DEBRIEF / NEXT MISSION.

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

Góc camera isometric/orthographic cố định, terrain low-poly; đồ họa có thể hiển thị bề mặt liên tục nhưng logic tính trên lưới/graph đơn giản. Rover có hướng quay, chuyển động mượt, bánh xe quay và hiệu ứng quét/khoan nhẹ. HUD gồm Battery (EU), thời gian mission, dữ liệu chưa truyền, Science Score, Research Credits và cấu hình đang dùng.

Thông tin chưa được scanner xác minh được hiển thị là 'chưa khảo sát' hoặc 'rủi ro ước tính', KHÔNG phải hệ thống biết chắc có hố cát lún bí mật. Mỗi môi trường có màu/vật liệu riêng, tooltip giải thích chi phí dự kiến và độ tin cậy thông tin.

### 3.5 Debrief / Mission Report

Tổng kết: các mục tiêu khoa học đã hoàn thành, dữ liệu truyền thành công, năng lượng đã dùng, thời gian còn lại, số lần gặp rủi ro, cấu hình rover, đường đã đi và lý do thắng/thua. Cho phép Retry với cấu hình khác hoặc mở mission tiếp theo.

## 4. ĐIỀU KHIỂN: PLAN → EXECUTE → OBSERVE → REPLAN

Điều khiển chính thức: KHÔNG WASD; KHÔNG click là rover chạy ngay; KHÔNG phải từng ô đi một lượt như cờ. Người chơi click một hoặc vài waypoint trên bản đồ, thêm thao tác nghiên cứu, xem preview rồi nhấn EXECUTE. Xe tự di chuyển liên tục theo tuyến trong Three.js.

PLANNING: click điểm đích/waypoint; có nút Undo/Clear; click Science Site để thêm SCAN hoặc ANALYZE; có thể thêm TRANSMIT khi đủ điều kiện. Bảng dự toán cho biết thời gian, điện và mức rủi ro. Với ô chưa được quét, dự toán là khoảng/ước tính thay vì số chính xác.

EXECUTE: khóa chỉnh sửa hàng đợi trong lúc thực thi; mô phỏng lần lượt waypoint và hành động. Di chuyển, quét và truyền dữ liệu thay đổi chỉ số thật. Nếu gặp rủi ro vượt ngưỡng, rover tự dừng an toàn, báo nguyên nhân và trả người chơi về Planning để vẽ đường lại. Đây là điểm dừng logic, không phải sự kiện lựa chọn A/B/C.

4 hành động MVP: MOVE (đi tới waypoint), SCAN (kiểm tra vùng xung quanh), ANALYZE (nghiên cứu mẫu), TRANSMIT (gửi dữ liệu). RECHARGE là trạng thái 'dừng để sạc' của pin mặt trời, không cần thêm minigame. Không xây editor lệnh Forward/Turn kiểu lập trình.

## 5. MỘT BẢN ĐỒ SAO HỎA, NHIỀU MÔI TRƯỜNG

A. HARD PLAIN (đồng bằng đá cứng): di chuyển tương đối dễ, có thể phải đi vòng xa. B. SOFT SAND (cát mềm): nguy cơ trượt/lún, tiêu hao điện và thời gian cao với bánh không phù hợp. C. SHARP ROCK (đá sắc/gồ ghề): tăng hao mòn, rủi ro hỏng bánh. D. SLOPE/CRATER (dốc/miệng hố): leo dốc tiêu thụ điện và thời gian nhiều hơn. E. SHADOWED CANYON (vùng khuất nắng): ít/không nạp được điện mặt trời trong thời điểm mô phỏng.

Các môi trường xuất hiện CÙNG TRÊN MỘT BẢN ĐỒ. Cùng một đích có tuyến xuyên cát ngắn nhưng nguy hiểm và tuyến đường cứng dài nhưng an toàn. Đồ họa hiển thị mượt; số ô chỉ là đơn vị logic ẩn bên dưới. Không cần nhiều hành tinh, nhiều model hành tinh hoặc bản đồ 3D hoàn toàn riêng.

## 6. MA TRẬN BÁNH XE & TRADE-OFFS

Ba cấu hình bánh (mọi chỉ số sau đây là game balance, KHÔNG phải dữ liệu NASA):

W1 — LIGHT WHEEL: nhẹ, chi phí thiết kế thấp. Hệ số điện trên nền cứng 0,80×; cát mềm 1,80×; đá sắc 1,60×; dốc 1,40×. Phù hợp đường dễ và đi vòng, nhưng kém ở cát/đá sắc.

W2 — WIDE TRACTION WHEEL: nặng và tốn ngân sách hơn. Nền cứng 1,25×; cát mềm 0,85×; đá sắc 1,25×; dốc 1,10×. Đi qua cát hiệu quả hơn, nhưng trên nền cứng kém tiết kiệm hơn W1.

W3 — REINFORCED WHEEL: chi phí cao, khối lượng lớn. Nền cứng 1,15×; cát mềm 1,30×; đá sắc 0,75×; dốc 1,00×. Bền khi qua vùng đá sắc/dốc, nhưng không phải lựa chọn tốt nhất cho cát.

Công thức MVP: MOVE_ENERGY = BASE_DISTANCE_COST × TERRAIN_FACTOR × WHEEL_FACTOR × LOAD_FACTOR. BASE_DISTANCE_COST và các hệ số do game designer hiệu chỉnh, chưa phải tiêu hao thực của rover NASA. Khi thêm slope, chỉ áp dụng một hệ số dốc có dấu/giới hạn để tránh tính hai lần. Rủi ro kẹt và hao mòn phụ thuộc địa hình, cấu hình, đường đi; không đặt '0% kẹt' cho một loại bánh.

Ví dụ trên cùng điểm đến: W1 có thể chọn đi vòng trên nền cứng; W2 có thể chấp nhận cắt qua vùng cát; W3 có thể vòng qua tuyến đá sắc. Cả ba chiến lược có cơ hội hoàn thành, nhưng khác nhau ở thời gian/điện/rủi ro. Thiết kế level không được ngầm chỉ có một đáp án đúng.

## 7. PIN, SẠC VÀ TERRAIN SCANNER

### 7.1 Một mô hình năng lượng đơn giản

MVP chỉ có một hệ pin dự trữ dùng cho toàn bộ hành động và một cách nạp chính: solar charging khi có ánh sáng. Không có lựa chọn Solar vs MMRTG, không có trạm năng lượng có thể nhặt và không có 'đồi nắng +25 EU lập tức'. Trạng thái Battery có thể hiển thị 0–100 EU (đơn vị cân bằng game).

Điện giảm theo MOVE, SCAN, ANALYZE, TRANSMIT. Muốn sạc, rover phải dừng ở khu vực nhận ánh sáng đủ tốt và hy sinh thời gian; khả năng nạp được tính theo thời gian dừng × hệ số ánh sáng/bụi. Vùng bóng tối hoặc bụi dày giảm sạc; đồi cao không tự động cho bonus nếu không có điều kiện chiếu sáng hợp lý.

Ví dụ số mock để test (có thể hiệu chỉnh): Battery 100 EU; dự trữ an toàn 15 EU; di chuyển cơ bản 5 EU/đoạn chuẩn trước hệ số; SCAN 6 EU; ANALYZE 12 EU; TRANSMIT 6 EU; sạc +8 EU mỗi 10 phút dừng khi đủ sáng. Chỉ là GAME BALANCE; không gán giá trị thật cho NASA.

UI preview cảnh báo khi tổng tuyến + thao tác vượt dung lượng pin, hoặc sau hành động dự kiến dưới 15 EU. Không nhất thiết cấm người chơi dùng hết điện: có thể cho phép quyết định rủi ro nhưng phải báo trước và có logic failure rõ.

### 7.2 Terrain Scanner

Terrain Scanner là hệ thống gameplay tổng hợp dựa trên ý tưởng camera điều hướng/nhận diện nguy hiểm của rover, KHÔNG phải tuyên bố radar xuyên đất nhìn được 100% mọi ổ cát lún. Basic Scan tiêu hao ít điện, quét gần; Enhanced Scan (nếu đủ thời gian) quét xa hơn nhưng nặng/tốn điện/ngân sách hơn. Quét cho người chơi biết vùng hard/sand/rock/slope hoặc đánh giá độ rủi ro, với mức độ bất định được hiển thị.

Nếu dùng tên khoa học: NavCam/HazCam phục vụ quan sát, nhận diện vật cản; thiết bị radar xuyên đất như RIMFAX chủ yếu phục vụ nghiên cứu cấu trúc dưới bề mặt. Không nhập nhằng hai chức năng này.

## 8. SCIENCE SCORE, RESEARCH CREDITS VÀ GARAGE

Science Score = tổng kết quả khoa học nhiệm vụ, không bị trừ khi nâng cấp. Research Credits (RC) = đơn vị phần thưởng HƯ CẤU dành cho progression; nhận khi hoàn tất mục tiêu khảo sát và truyền dữ liệu thành công. NASA thực tế không 'trả tiền ngay theo MB/viên đá' và không gửi thiết bị tức thời sau khi người chơi bấm Transmit.

Một điểm nghiên cứu cho thưởng khám phá đầu tiên; quét lại không farm vô hạn. Data chưa truyền nằm trong bộ nhớ rover, chưa được cộng RC. Có thể có hệ số thưởng theo độ hiếm mục tiêu hoặc chất lượng dữ liệu nhưng phải cân bằng để người chơi không lặp một thao tác kiếm tiền.

Lander Garage: rover quay lại vị trí lander mới thay bánh/thiết bị từ kho. RC chỉ đại diện cho quyền mở khóa hoặc cấp nguồn lực gameplay để kích hoạt MODULE ĐÃ ĐƯỢC MANG THEO. Mua phụ kiện mới giữa Sao Hỏa, chế tạo máy in 3D, nhặt hợp kim phế liệu và thả kén tiếp tế đều nằm ngoài MVP.

Nếu mission tiếp theo cho thay loadout từ Trái Đất, có thể sử dụng RC để mở khóa catalog thiết bị trước khi bước vào mission mới. Cần nêu rõ cơ chế game hóa; không trình bày như cách tài trợ thực tế cho nhiệm vụ NASA.

## 9. CÁC MISSION DÙNG CHUNG BẢN ĐỒ

MISSION 01 — FIRST SURVEY (tutorial): điểm khảo sát gần lander, chủ yếu hard plain xen một ít cát. Dạy Plan/Execute, scanner, truyền dữ liệu và xem pin. Hoàn thành khi thu và truyền dữ liệu của hai điểm khoa học.

MISSION 02 — THE DUNE CROSSING (core demo): điểm nghiên cứu nằm sau một dải cát mềm; tồn tại tuyến xuyên cát ngắn và đường vòng nền cứng dài. Người chơi tự chọn bánh, scanner, đường đi và chiến lược sạc. Đây là mission thể hiện rõ trade-off và nên ưu tiên hoàn chỉnh.

MISSION 03 — INTO THE CRATER (stretch): mục tiêu dưới vùng dốc/đá sắc và đoạn khuất nắng. Người chơi phải dự tính chi phí xuống/lên dốc, khả năng hao mòn và điện để về hoặc truyền dữ liệu. Chỉ hoàn thiện sau khi mission 01–02 chạy end-to-end.

Một bộ engine và scene, ba cấu hình dữ liệu nhiệm vụ; không xây ba map riêng. Ít nhất 2 mission đầu chơi được trong MVP, mission 03 là mục tiêu mở rộng nếu còn thời gian.

## 10. CÁCH TÍNH KẾT QUẢ VÀ TRẠNG THÁI

Full Success: hoàn thành các science objectives bắt buộc và truyền dữ liệu trong hạn, rover không mất khả năng hoạt động. Partial Success: truyền được một phần dữ liệu hoặc hoàn thành thiếu mục tiêu khoa học, vẫn có phần thưởng tương ứng. Mission Failure: hết thời gian quan trọng, không thể tiếp tục do điện dưới mức vận hành hoặc rover bị kẹt/hỏng và không có đường cứu vãn.

Báo cáo chấm riêng SCIENCE, ENERGY EFFICIENCY, TIME, RISK và DESIGN COMPLIANCE thay vì chỉ có một 'chiến lược chuẩn'. Khi fail, người chơi được chỉ ra tuyến nào ngốn năng lượng, bánh nào gây rủi ro, vì sao việc sạc bị hạn chế và có thể thử cách khác.

Ví dụ: rover W1 đi vòng qua nền cứng vẫn có thể thắng; rover W2 cắt qua cát cũng có thể thắng; W3 chấp nhận chi phí thiết kế cao để qua đá sắc. Không hardcode S Rank chỉ dành cho 'bánh nhẹ rồi về thay bánh to'.

## 11. MVP CẦN LÀM VÀ CHỨC NĂNG CẮT BỎ

P0 — BẮT BUỘC: một Mars map isometric low-poly có ít nhất 3 loại nền khác nhau; rover 3D và animation; 3 loại bánh với ma trận bù trừ; một Battery và solar recharge; Plan/Preview/Execute/Replan; 4 hành động MOVE/SCAN/ANALYZE/TRANSMIT; Mission Design có budget/mass, lander/garage dùng module dự phòng; 2 mission; Science Score/RC; Debrief; một luồng demo end-to-end.

P1 — NẾU CÒN THỜI GIAN: môi trường thứ tư/thứ năm, enhanced scanner và thay model scanner, mission 03, ảnh thumbnail mission, hiệu ứng bụi/đá, timeline hiển thị đẹp hơn. Luôn ưu tiên kết nối và test luồng trước khi mở rộng.

OUT OF SCOPE: chọn tên lửa, bay quỹ đạo, tính Δv/hạ cánh vật lý; nhiều hành tinh; xe lái WASD/giữ chuột thời gian thực; hệ sản xuất ISRU/3D printing; mua thiết bị vật lý mới ở Sao Hỏa; orbital supply pods; nhiều kiểu ăng-ten với hệ thống quỹ đạo phức tạp; thế giới mở, mô phỏng lốp bằng rigid-body physics; random crisis không gắn với thiết kế.

## 12. PHÂN CÔNG 5 THÀNH VIÊN / 4 LUỒNG

Duy — UI/UX + Integrator (feat/ui): Mission Select, Hangar, HUD, route preview, Execute, garage/debrief, tích hợp state với scene và simulation; điều phối PR, demo và deploy.

Bảo — Three.js (feat/scene): Mars terrain isometric/orthographic, 3 môi trường rõ rệt, low-poly rover có thay bánh trực quan, click waypoint, chuyển động mượt, hiệu ứng scan/analysis nhẹ.

Hải — Simulation (feat/simulation): game state, action queue, MOVE cost, thời gian, pin/sạc, trade-offs bánh/địa hình, scanner uncertainty, mission outcome, deterministic tests. Không sửa src/data hoặc src/content nếu chưa thống nhất.

Sơn — NASA Science/Data (feat/content-data; src/data/ + docs/science/): rà soát nguồn NASA, điều kiện rover, đơn vị/giả định, ma trận terrain và các con số game hóa; phân biệt science source vs balance mock; giải thích giới hạn mô hình cho giám khảo.

Cường — Game Design/Content (cùng feat/content-data; src/content/ + docs/design/): mục tiêu Mission 01–03, bố cục sa bàn, tutorial, mô tả research site, scoring/credits, gameplay test, demo/pitch. Sơn và Cường không sửa cùng file dù dùng chung nhánh.

Giao diện giữa các luồng: src/types/game.ts làm contract chung. Scene nhận MissionState và callback waypoint; Simulation nhận hành động & dữ liệu terrain/module; UI chỉ hiển thị và gọi API. Giữ PR nhỏ, merge sớm, kiểm tra npm run build; không để logic năng lượng nằm rải rác trong các React component.

## 13. BÀI DEMO CHO GIÁM KHẢO (3–5 PHÚT)

(0:00) Giới thiệu mục tiêu Mission 02. (0:20) Chọn bánh nhẹ: tiết kiệm khối lượng/điện trên nền cứng. (0:50) Bản đồ chỉ ra đường xuyên cát ngắn hoặc đường vòng dài. (1:20) Thử Preview thấy nguy cơ hao pin nếu xuyên cát. (1:40) Scan, điều chỉnh waypoint để đi vòng hoặc đổi chiến lược. (2:10) Execute, rover thực sự chạy qua địa hình và pin/time thay đổi. (3:10) Analyze mẫu đá, Transmit nhận Science Score và RC. (3:40) Debrief giải thích đánh đổi; chạy lại ngắn bằng bánh tăng bám cho tuyến khác.

Giá trị giáo dục cần chứng minh: thiết kế vật lý ảnh hưởng hiệu quả chuyến đi; không chỉ 'nhấn đúng đáp án' mà người chơi phải dự toán, thích nghi, kiểm nghiệm quyết định và học lý do tại sao nhiệm vụ thành công hay thất bại.

## 14. NGUYÊN TẮC TÍNH KHOA HỌC VÀ NGUỒN THAM KHẢO

(A) Tất cả EU/ô, RC, hệ số bánh/địa hình, tỷ lệ rủi ro và ngân sách trong bản prototype là GIẢ ĐỊNH GAMEPLAY, không tự nhận là thông số NASA. (B) Chỉ ghi 'NASA data' khi có tên nguồn, đơn vị, ý nghĩa và cách được sử dụng thực sự trong một phép tính. (C) Không khẳng định Terrain Scanner đọc chính xác 100% địa hình. (D) Không tuyên bố hoạt động thay bánh tại lander hay dùng RC là quy trình NASA ngoài thực tế.

Nguồn đọc và xác minh: NASA Space Apps 2026 — https://www.spaceappschallenge.org/2026/ ; NASA Perseverance Rover Components (NavCam, HazCam, hệ thống) — https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/ ; NASA Curiosity vs Perseverance wheels — https://science.nasa.gov/resource/curiositys-and-perseverances-wheels/ ; JPL Perseverance rover engineering — https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/perseverance_rover/ ; NASA Opportunity mission (pin mặt trời và bão bụi) — https://science.nasa.gov/mission/mer-opportunity/ .

Giới hạn cần nói thẳng: đây là educational mission trade-off simulator, không phải phần mềm lập kế hoạch hàng không vũ trụ cấp bay thật, không mô phỏng đầy đủ vật lý lốp xe, nguồn điện thực hay liên lạc liên hành tinh.

## 15. ACCEPTANCE CHECKLIST

[ ] Mission 01 và 02 chơi end-to-end trong trình duyệt; [ ] có ít nhất 2 tuyến hợp lệ cho Mission 02; [ ] cùng điều kiện đầu vào, engine cho kết quả lặp lại; [ ] thay bánh làm thay đổi kết quả tính thực sự; [ ] preview và kết quả Execute khớp theo quy tắc đã định; [ ] battery không vượt giới hạn và solar recharge chỉ khi đủ nắng, có tốn thời gian; [ ] scanner mở thông tin, không 'hack' biết chắc địa hình; [ ] RC nhận khi dữ liệu được truyền thành công; [ ] phụ kiện dự phòng tính vào payload mass; [ ] có thể thua, có thể chơi lại; [ ] có phần giải thích khoa học, link nguồn và nhãn số liệu giả lập; [ ] npm run build PASS, có link demo và video ngắn.

Ghi chú: concept đã được rút gọn có chủ đích để hoàn thành một trò chơi tương tác thực sự trong hackathon. Không đưa lại các phần tên lửa, Δv, chế tạo ISRU hay hành tinh thứ hai vào phạm vi MVP khi chưa hoàn thành luồng cốt lõi.

