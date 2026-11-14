# Kiểm tra tích hợp — 14/11/2026

- Mốc tích hợp: main `802fd0d`. Bốn nhánh feat cùng ở `aa938fc`, không có PR mở; Issues #1–#5 mô tả đúng phạm vi P0. Nhánh và worktree mới giữ nguyên main và các nhánh nhóm.
- Bản GDD đã chốt được đọc từ Git; bản Google Docs xuất văn bản công khai cùng tiêu đề và ngày phê duyệt. GDD trong repo là nguồn chuẩn cho thay đổi này.
- App ở mốc trên có diorama Mission Control, chọn tên lửa, bản đồ lái tự do và hai đường logic bề mặt. Chi phí/rủi ro có nhánh dùng Math.random, UI lái trực tiếp; RIMFAX, sạc và ISRU lệch phạm vi GDD. Không có tệp GLB/GLTF, FBX hay bản vẽ cảnh độc lập: rover là JSX primitives trong Mars3DRover.tsx.
- Build gốc chạy được với lockfile; chưa có script test. Có thể giữ hình học sáu bánh, đèn, cột camera và tấm pin làm nền cho model thay thế.
- Hợp đồng đường mới nằm trong src/types/expedition.ts. Mỗi bước thực thi phát snapshot và tọa độ, không chuyển logic pin/thời gian vào Three.js. Chỉ trình bày số liệu đo từ NASA ở nơi có nguồn và giải thích; mọi hệ số cân bằng vẫn là giả lập.

