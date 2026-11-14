# Prompt Gemini — Viết lời trình bày và demo APOGEE

**Cách dùng:** Đưa Gemini bộ slide nhóm đã chốt, [ghi chép bản game đã thử](../APOGEE_CURRENT_BUILD_HANDOFF.md), rồi dán phần dưới. Nếu đã biết thời lượng do BTC ấn định, điền trước khi gửi.

---

Bạn viết lời trình bày và kịch bản thao tác cho **Team MS Chung** tại NASA Space Apps Challenge. Dự án là **APOGEE — Mars Rover Architect**. Nhóm đã có slide.

**Đọc trước khi viết:**

1. Bộ slide tôi gửi: đi theo đúng thứ tự và nội dung nhóm đã chọn. Nếu thiếu file, hãy viết kịch bản theo cảnh demo và đánh dấu chỗ cần ghép slide; đừng đoán số slide.
2. `docs/APOGEE_CURRENT_BUILD_HANDOFF.md`: nguồn về phiên bản, những gì đã thử trên trình duyệt, kết quả, ảnh và các điểm chưa xác nhận. Nếu bản trình chiếu đã đổi, lấy thông tin đã kiểm chứng của bản mới hơn. Ghi riêng các chỗ slide lệch với game.

Tóm tắt game trong 3 dòng trước khi vào script. **Plan & Drive** là đặt waypoint, xem ước lượng, rồi tự lái WASD trong cảnh Mars 3D. Đường đã vạch giúp định hướng. Người chơi phải dừng xe, phân tích và truyền dữ liệu để nhận điểm. Chỉ nhắc Việt hóa hoặc tutorial mới nếu có bằng chứng trong bản đem trình chiếu. Tên lửa, Δv và MMRTG thuộc mẫu cũ, không kể như tính năng đang chạy.

**Câu chuyện:** Cùng một điểm lấy mẫu, đường ngắn hơn có thể hao pin hơn. Trong Mission 02 — The Dune Crossing, bánh nhẹ đi tắt qua cát được dự báo **77–83 EU / High**, còn đi vòng bắc **57–59 EU / Low**. Wide Traction Wheels đưa đường tắt về **56–60 EU / Medium** trên bản đã thử. Đó là chi phí đi đường, chưa tính đo mẫu và truyền dữ liệu. Với Wide Traction, lượt chạy đã kiểm chứng kết thúc ở **Mission Complete, 60 Science Score, 24 Research Credits**.

**Đầu ra:**

1. Kịch bản **[thời lượng BTC]**, nếu chưa có thì dùng **3 phút để tập** và ghi đây là giả định. Mỗi đoạn có mốc thời gian, slide/màn hình, lời nói nguyên văn và thao tác của người cầm máy. Dùng tiếng Việt tự nhiên, giữ tên nút như trong bản trình chiếu. Mở đầu bằng tình huống chọn đường thay vì liệt kê tính năng.
2. Chỉ lái một lượt trực tiếp: chọn Wide Traction → Dune shortcut → Start drive → W → nhả khi trong tầm mẫu → Pause → Analyze → Transmit → Report. Dùng slide để so sánh tuyến còn lại. Đánh dấu chỗ chuyển từ slide sang game, lời nói trong lúc lái và lúc dừng để giám khảo nhìn số điểm. Nếu thao tác trên build mới khác, cập nhật theo nút đang hiện. Dùng chuột để đặt waypoint trong bản đã thử.
3. Một câu chuyển sang ảnh/clip nếu demo lỗi, và ba câu trả lời ngắn cho giám khảo: NASA được dùng ở đâu, vì sao dùng WASD, đổi cấu hình làm kết quả thay đổi thế nào. Chu kỳ ngày Mars khoảng **24,6 giờ** là đầu vào cho mô hình ánh sáng đơn giản; EU, RC và hệ số bánh là giá trị của game. Đừng gọi đó là mô phỏng vật lý NASA.

Chỉ viết nội dung lời nói, thao tác và ghi chú về chỗ lệch với game. Không làm lại slide hay sửa code/README/GDD. Kịch bản phải đủ cụ thể để người nói và người cầm máy tập ngay.
