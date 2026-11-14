# Thư mục mô hình rover APOGEE

Dùng thư mục này để bàn giao `rover.glb` cho Plan & Drive. Xem [đặc tả nhập mô hình](../../../../docs/MODEL_IMPORT_SPEC.md) để biết hợp đồng node, ngân sách và cách kiểm tra.

- [ ] Ưu tiên `rover.glb` tự chứa; nếu dùng `rover.gltf`, giữ nguyên đường dẫn tương đối đến .bin và texture. Không xuất bản cần Draco, Meshopt hoặc KTX2.
- [ ] Kiểm tra tệp đã xuất: 1 đơn vị = 1 m, mũi **+Z**, trên **+Y**, gốc ở tâm vệt bánh trên mặt đất (**Y = 0**). Các node bánh dùng **X cục bộ** làm trục quay và đặt tại tâm trục.
- [ ] Để adapter dựng bánh theo loadout, dùng đúng các node tùy chọn `Wheel_FL`, `Wheel_FR`, `Wheel_ML`, `Wheel_MR`, `Wheel_RL`, `Wheel_RR`. Các gá tùy chọn là `Scanner_Mount`, `Instrument_Mount`, `Solar_Mount`. Dùng node rỗng và bỏ mesh tĩnh ở vị trí sẽ gắn. Thiếu node nào thì không sinh chi tiết ở đó; adapter không remap tên hay ẩn mesh đã xuất.
- [ ] Khi có tệp, đặt `ROVER_ASSET` trong [roverAsset.ts](../../../../src/scene/roverAsset.ts) thành `{ url: import.meta.env.BASE_URL + 'assets/3d/rover/rover.glb' }`. Có thể hiệu chỉnh bằng `scale` (đồng nhất), `yaw` (radian quanh Y), `lift` (dịch theo Y). Hiện cấu hình là `undefined`; game dùng rover dựng bằng mã khi chưa cấu hình, đang tải hoặc khi tải/render asset gặp lỗi được adapter bắt.
- [ ] Kiểm tra độ rõ khi lập tuyến, khi lái và trong bản xem trước trang bị. Mục tiêu riêng cho model nhập: ≤ 15.000 tam giác, ≤ 12 lượt vẽ mỗi lượt render, ≤ 4 material, texture ≤ 1024 × 1024 mỗi ảnh và tổng tải ≤ 2 MB. Đo cả scene với bánh/phụ kiện đang bật.
