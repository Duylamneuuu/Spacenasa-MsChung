# Bàn giao tích hợp Plan & Drive

- Hợp đồng chạy thực tế: `src/types/expedition.ts`. Scene nhận trạng thái, chế độ, route estimate và callback chọn waypoint; gameplay ở `src/sim/expedition.ts`; dữ liệu cân bằng ở `src/data/expedition.ts`; nội dung English ở `src/content/expedition.ts`.
- `stepDrive` tính pose từ held keys và bước cố định; 1 ô = 4,4 đơn vị bản đồ. W/S là tốc độ có dấu, A/D đổi yaw. Chỉ quãng đường thực mới tiêu điện và thời gian hành trình; pause không dời xe. Không dùng vật lý bánh xe hoặc dữ liệu địa chất thực.
- Rủi ro được chấm theo nền, bánh và độ biến thiên định sẵn của ô; không dùng RNG. Cảnh báo scanner vẫn là khoảng ước tính. Nội dung bản đồ, tải trọng, ngân sách, tốc độ, thời gian và các đơn vị EU/RC là giả định thiết kế.
- Preview chỉ ước lượng di chuyển dọc các đoạn thẳng giữa waypoint, có thể khác khi cua, đi lệch hoặc tiếp cận mẫu từ phía khác. Scan, Analyze, Transmit và sạc dùng thời gian riêng khi dừng.
- Mission 02: Wide Traction có thể đi thẳng theo hướng ban đầu. Lightweight có thể đi vòng về bắc qua các waypoint đã gợi ý. Mission 01 yêu cầu truyền hai mẫu; Standard Storage cần truyền mẫu thứ nhất trước khi phân tích mẫu thứ hai.
- `npm ci`, `npm test`, `npm run build`. Dùng `npm run preview` để xem chính thư mục build. Có thể triển khai `dist/` như site tĩnh.
- Model cuối: xem [MODEL_IMPORT_SPEC.md](MODEL_IMPORT_SPEC.md). Mission 03 là stretch và chưa đưa vào menu.

