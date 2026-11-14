# APOGEE — Đặc tả nhập mô hình rover GLB/GLTF

Tài liệu bàn giao cho scene Plan & Drive. Hành vi bên dưới được đối chiếu với [RoverModel.tsx](../src/scene/RoverModel.tsx) và [roverAsset.ts](../src/scene/roverAsset.ts). Cả rover trong cảnh thám hiểm và bản xem trước trang bị dùng cùng adapter.

## Hệ trục, tỉ lệ và gốc

- [ ] Xuất glTF 2.0, ưu tiên một tệp `.glb` có sẵn texture. Dùng mét: 1 đơn vị trong mô hình đã xuất = 1 m trong scene khi `scale: 1`. Kiểm tra trên tệp đã xuất sau khi chuyển hệ trục từ phần mềm dựng hình.
- [ ] Mũi xe hướng **+Z**, phía trên là **+Y**. Trục quay của bánh là **X cục bộ** tại từng node bánh. Giữ scale của node gá và các node cha ở 1; tránh scale âm hoặc không đều. Với node bánh, đặt trục X cục bộ song song và cùng chiều với X của rover để sáu bánh quay nhất quán.
- [ ] Đặt gốc của mô hình tại tâm vệt bánh theo X/Z, trên mặt phẳng tiếp đất **Y = 0**. Đặt node bánh ở **tâm trục**, cao hơn mặt đất, thay vì ở điểm tiếp đất. Adapter không tự căn tâm, chuẩn hóa kích thước hoặc dò mặt đất.
- [ ] Lấy rover dựng sẵn bằng mã làm mốc kích thước nếu cần: tâm bánh ở X = ±0,98 m; ba hàng ở Z = +0,87 / 0 / −0,87 m. Bán kính danh nghĩa của bánh `light` / `wide` / `reinforced` lần lượt là 0,31 / 0,34 / 0,35 m. Với model nhập, tâm bánh giữ nguyên theo node khi đổi loại bánh. Kiểm tra cả ba biến thể, kể cả gờ lốp, để hạn chế lún, hở hoặc cạ thân.

## Node tùy chọn cho bánh và phụ kiện

Adapter tìm node theo tên chính xác, phân biệt hoa/thường, trong cây của scene đã nạp. Đặt tên duy nhất. Nên dùng node rỗng được giữ lại khi xuất; adapter thêm một group con tại gốc node và thừa hưởng vị trí, xoay, scale, cùng trạng thái hiển thị từ cây cha.

| Node | Vị trí / hành vi |
| --- | --- |
| `Wheel_FL`, `Wheel_FR` | Tâm trục hàng trước (+Z); trái (−X), phải (+X). |
| `Wheel_ML`, `Wheel_MR` | Tâm trục hàng giữa; trái (−X), phải (+X). |
| `Wheel_RL`, `Wheel_RR` | Tâm trục hàng sau (−Z); trái (−X), phải (+X). |
| `Scanner_Mount` | Chân gá scanner, ví dụ trên nóc. Phụ kiện dựng lên theo +Y cục bộ; mặt trước hướng +Z cục bộ. Chỉ hiện khi loadout có scanner. |
| `Instrument_Mount` | Gá thiết bị, ví dụ gần mũi xe. Phụ kiện vươn theo +Z và có phần thò xuống −Y cục bộ. Chỉ hiện khi loadout có instrument. |
| `Solar_Mount` | Tâm tấm pin, ví dụ trên nóc. Tấm pin trải theo X/Z cục bộ và luôn hiện nếu có node, không phụ thuộc loadout. |

- Có node bánh thì adapter dựng bánh theo `loadout.wheel` ngay tại gốc node, không cộng bán kính vào chiều cao. Bánh do adapter tạo quay quanh X cục bộ theo `spin.current / radius`; adapter không quay mesh gốc trong GLB/GLTF.
- Thiếu node nào thì không sinh bánh hoặc phụ kiện ở vị trí đó. Một mô hình nạp thành công vẫn được hiển thị dù thiếu cả chín node. Nếu cần bánh hoặc thiết bị tĩnh, có thể gộp chúng vào mesh và bỏ node tương ứng. Với bộ phận muốn thay theo loadout, bỏ mesh tĩnh trùng vị trí trước khi xuất: adapter không ẩn hoặc thay mesh có sẵn.
- [ ] Kiểm tra bằng tệp đã xuất: mỗi node tùy chọn cần dùng vẫn tồn tại, tên không bị thêm hậu tố, cha của node hiển thị, và bộ phận gắn vào không bị chồng với mesh thân.

## Đường dẫn, hiệu chỉnh và dự phòng

Đặt tệp tại `public/assets/3d/rover/rover.glb`. Khi sẵn sàng kích hoạt, cấu hình [roverAsset.ts](../src/scene/roverAsset.ts) như sau:

```ts
export const ROVER_ASSET: RoverAsset | undefined = {
  url: import.meta.env.BASE_URL + 'assets/3d/rover/rover.glb',
};
```

Nếu dùng `rover.gltf`, đổi đuôi ở URL và giữ các tệp .bin/texture cùng cấu trúc đường dẫn tương đối như lúc xuất. Dùng `BASE_URL` để URL hoạt động khi app được phục vụ dưới đường dẫn con. Adapter gọi `GLTFLoader` trực tiếp, không cấu hình bộ giải mã Draco, Meshopt hoặc KTX2; dùng bản xuất không yêu cầu các bộ giải mã đó. Adapter cũng không phát animation có sẵn trong tệp.

| Trường hiệu chỉnh | Tác dụng |
| --- | --- |
| `scale` (mặc định `1`) | Scale đồng nhất toàn bộ model nhập, gồm bánh/phụ kiện sinh tại node. Ưu tiên sửa đơn vị trong tệp để giữ kích thước bánh theo thiết kế. |
| `yaw` (mặc định `0`) | Xoay quanh Y, đơn vị radian; ví dụ `Math.PI` nếu mũi tệp hướng −Z. |
| `lift` (mặc định `0`) | Dịch toàn bộ model nhập theo Y, tính theo đơn vị scene (mét theo quy ước trên); giá trị dương nâng xe. |

Không có bảng remap tên node hay tham số đổi trục quay bánh. Với tên khác, đổi tên trong tệp nguồn hoặc lúc xuất. Dùng `scale`, `yaw`, `lift` để hiệu chỉnh model nhập; sai trục X của một node bánh thì sửa ngay tại node.

`ROVER_ASSET` hiện là `undefined`: chỉ chép tệp vào thư mục sẽ không bật model. Khi không có cấu hình asset, trong lúc đang tải, hoặc khi tải/render model phát sinh lỗi được adapter bắt, game hiện rover dựng bằng mã với bánh và phụ kiện theo loadout. Rover dự phòng không nhận `scale`, `yaw`, `lift`. Model nạp được nhưng quay sai hướng, bị ẩn hay thiếu node sẽ không tự chuyển sang bản dự phòng.

## Độ rõ và ngân sách hiệu năng

- [ ] Nhìn rõ thân xe, mũi và các bánh ở mức zoom lập tuyến; khi lái, kiểm tra mũi theo hướng tiến và bánh quay quanh trục. Trong bản xem trước trang bị, đổi cả ba loại bánh và bật/tắt scanner, instrument. Kiểm tra tấm pin nếu có node, độ hở với thân, và mặt lốp trên nền tương đối phẳng.
- [ ] Ưu tiên dáng xe dễ nhận ra, mặt lớn có tương phản và vật liệu đục. Kiểm tra mặt mesh bị mất do normal hoặc culling, node/cha bị ẩn trong scene xuất, và vật liệu chìm vào màu nền dưới ánh sáng trong game.
- [ ] Ngân sách bàn giao đề xuất cho **riêng model nhập**: ≤ 15.000 tam giác, ≤ 12 lượt vẽ mỗi lượt render, ≤ 4 material, texture tối đa 1024 × 1024 mỗi ảnh, tổng dung lượng tải ≤ 2 MB (gồm .bin và texture ngoài nếu có). Đây là mục tiêu cho asset, adapter không kiểm tra hay ép giới hạn. Giảm số primitive/material và dùng chung texture trước khi thêm chi tiết.
- [ ] Đo lại trong scene với cấu hình trang bị nặng nhất. Sáu bánh `wide` có tối đa 84 mesh và ba cụm phụ kiện cộng thêm 14 mesh khi đều hiện; phần này nằm ngoài ngân sách riêng của model nhập. Kiểm tra lúc chạy xe và lúc mở bản xem trước trên thiết bị mục tiêu, đồng thời thử tải chậm và URL lỗi để thấy rover dự phòng.
