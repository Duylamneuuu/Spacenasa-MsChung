# Bàn giao tích hợp Plan & Drive

- Hợp đồng chạy thực tế: `src/types/expedition.ts`. Scene nhận trạng thái, chế độ, route estimate và callback chọn waypoint; gameplay ở `src/sim/expedition.ts`; dữ liệu cân bằng ở `src/data/expedition.ts`; nội dung English ở `src/content/expedition.ts`.
- `stepDrive` tính pose từ held keys và bước cố định; 1 ô = 4,4 đơn vị bản đồ. W/S là tốc độ có dấu, A/D đổi yaw. Chỉ quãng đường thực mới tiêu điện và thời gian hành trình; pause không dời xe. Không dùng vật lý bánh xe hoặc dữ liệu địa chất thực.
- Rủi ro được chấm theo nền, bánh và độ biến thiên định sẵn của ô; không dùng RNG. Cảnh báo scanner vẫn là khoảng ước tính. Nội dung bản đồ, tải trọng, ngân sách, tốc độ, thời gian và các đơn vị EU/RC là giả định thiết kế.
- Preview chỉ ước lượng di chuyển dọc các đoạn thẳng giữa waypoint, có thể khác khi cua, đi lệch hoặc tiếp cận mẫu từ phía khác. Scan, Analyze, Transmit và sạc dùng thời gian riêng khi dừng.
- Mission 02: Wide Traction có thể đi thẳng theo hướng ban đầu. Lightweight có thể đi vòng về bắc qua các waypoint đã gợi ý. Mission 01 yêu cầu truyền hai mẫu; Standard Storage cần truyền mẫu thứ nhất trước khi phân tích mẫu thứ hai.
- `npm ci`, `npm test`, `npm run build`. Dùng `npm run preview` để xem chính thư mục build. Có thể triển khai `dist/` như site tĩnh.
- Model cuối: xem [MODEL_IMPORT_SPEC.md](MODEL_IMPORT_SPEC.md). Mission 03 là stretch và chưa đưa vào menu.
## Kiểm thử đã chạy

- Node 20 trên GitHub Actions: `npm ci`, 11 engine tests và `npm run build` đều pass.
- Chromium: Start Drive không tự di chuyển; W không có hiệu lực khi Planning/Paused; Replan giữ nguyên vị trí; giữ và nhả phím làm tốc độ và chi phí thay đổi theo đường đi.
- First Survey: phân tích và truyền cả hai mẫu, sạc 10 phút khi đỗ, báo cáo thành công.
- Dune Crossing: bánh tăng bám xuyên cát và bánh nhẹ vòng về bắc đều truyền được mẫu và hoàn thành. Lái thẳng vào cát bằng bánh nhẹ kích hoạt dừng an toàn; kết thúc khi chưa có mẫu cho báo cáo thất bại.
- Bố cục trang chọn nhiệm vụ không tràn ngang ở 320, 375, 768, 1024 và 1440 px. Điều khiển chạy xe cần bàn phím.

Ảnh Chromium: [Chọn nhiệm vụ](evidence/select-preview.png) · [Hangar](evidence/hangar-preview.png) · [Lập tuyến 3D](evidence/planning-preview.png) · [Lái WASD](evidence/driving-preview.png) · [Mission 02](evidence/report-preview.png) · [Mission 01](evidence/first-survey-preview.png) · [Tuyến vòng](evidence/detour-preview.png) · [Thất bại](evidence/failure-preview.png).
