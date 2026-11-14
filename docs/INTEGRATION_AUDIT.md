> **Historical audit (14 Nov 2026), written before the Plan & Drive build.** It describes `main` at `7606934`. For the current state read [IMPLEMENTATION_HANDOFF](IMPLEMENTATION_HANDOFF.md) and [PLAN_DRIVE_IMPLEMENTATION](PLAN_DRIVE_IMPLEMENTATION.md).

# Kiểm tra tích hợp — 14/11/2026

- Mốc tích hợp: `main` tại `7606934`. PR #6 đã hợp nhất, chốt Plan & Drive và giao diện hoàn toàn tiếng Anh. Bốn nhánh feat cùng ở `aa938fc`; không có PR mở ở thời điểm kiểm tra; Issues #1–#5 là phạm vi P0. Nhánh tích hợp riêng không sửa nhánh nhóm.
- Commit `802fd0d` đã có rover thủ tục, quán tính, lái tiến/lùi, đánh lái và camera bám xe. Nhưng scene giữ pose, trả callback trừ điện/sạc và cùng tồn tại với logic bề mặt theo lượt có Math.random. Luồng chính còn tên lửa, Δv, ISRU và nội dung cũ. Không có GLB/GLTF/FBX được commit.
- Giữ quy ước +Z và thiết kế sáu bánh, cột camera, tấm pin, điều khiển yaw có quán tính. App mới dùng duy nhất engine `src/sim/expedition.ts`: nhập phím → bước cố định 60 Hz → cập nhật pose, địa hình, năng lượng và thời gian. R3F đọc trạng thái để vẽ, không tính chi phí. Tệp legacy vẫn ở repo để nhóm đối chiếu, không nằm trong cây import của App đang chạy.
- Preview lấy cùng hàm chi phí di chuyển và trả khoảng ước lượng. Xe tự lái bằng WASD theo hướng dẫn, không nhận lệnh bám tuyến. Chạm vùng có nguy cơ vượt giới hạn bám sẽ giữ vị trí trước biên và chuyển Paused.
- Đã đọc bản GDD trong Git; bản Google Docs công khai xuất văn bản được, nhưng quyết định sản phẩm mới nhất là PR #6. Đã xác minh nguồn NASA về thời lượng sol (xem README); các hệ số còn lại là cân bằng trò chơi.
