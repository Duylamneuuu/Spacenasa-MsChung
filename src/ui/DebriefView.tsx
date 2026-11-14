import React from 'react';
import type { MissionState, PlayerAction } from '../types/game';
import { calculateMissionOutcome } from '../sim/roverEngine';
import { LANDING_SITES } from '../data/missionObjective';
import { ROVER_MODULES } from '../data/roverModules';

interface DebriefViewProps {
  state: MissionState;
  send: (action: PlayerAction) => void;
}

export function DebriefView({ state, send }: DebriefViewProps) {
  const { surface, resources, activeLandingSite } = state;
  const site = LANDING_SITES[activeLandingSite] ?? LANDING_SITES.jezero_crater;
  const outcome = calculateMissionOutcome(surface, resources);

  const rankBadgeColor =
    outcome.rank === 'S-Rank' ? '#4ade80' : outcome.rank === 'B-Rank' ? '#fbbf24' : '#f87171';

  const equippedWheels = ROVER_MODULES[surface.equippedModules.wheels];
  const equippedPower = ROVER_MODULES[surface.equippedModules.power];
  const equippedSensors = ROVER_MODULES[surface.equippedModules.sensors];
  const equippedComms = ROVER_MODULES[surface.equippedModules.comms];

  // Dynamic engineering analysis based on actual gameplay logs and actions
  const hadStuckIncident = surface.logs.some(l => l.includes('BÁNH XE BỊ KẸT') || l.includes('sa lầy') || l.includes('BOGGED DOWN'));
  const didSwapModules = surface.logs.some(l => l.includes('THAY THẾ PHỤ KIỆN') || l.includes('SWAPPED'));
  const did3DPrint = surface.logs.some(l => l.includes('IN 3D') || l.includes('3D PRINT'));
  const usedSolarRecharge = surface.logs.some(l => l.includes('ĐÓN NẮNG') || l.includes('Recharged'));

  let tradeOffDiagnosis = '';
  if (equippedWheels.id === 'slim_aluminum') {
    if (hadStuckIncident) {
      tradeOffDiagnosis = 'Bạn chọn Lốp Nhôm mỏng: Tuy tiết kiệm pin trên đường phẳng (4⚡/ô) nhưng đã gặp sự cố sa lầy cát lún, phải kích hoạt mô-tơ giật lùi tiêu tốn 15⚡ quý giá.';
    } else {
      tradeOffDiagnosis = 'Bạn vận hành xuất sắc Lốp Nhôm mỏng: Khéo léo tránh các bãi cát lún, tận dụng triệt để mức tiêu hao thấp 4⚡/ô giúp tiết kiệm hơn 40% dung lượng pin tổng.';
    }
  } else if (equippedWheels.id === 'wide_titan') {
    tradeOffDiagnosis = 'Bạn trang bị Lốp Lưới Titan to: Bản lốp rộng mang lại sự an tâm tuyệt đối (0% nguy cơ sa lầy), nhưng ma sát lớn ngốn 11⚡/ô trên đường bằng (tiêu tốn pin gấp gần 3 lần lốp nhôm).';
  } else {
    tradeOffDiagnosis = 'Bạn sử dụng Lốp Biến Hình SMA: Hiệu năng cân bằng toàn diện trên cả cát và đá cứng, nhưng tải trọng nặng 95 kg đã cắt giảm biên độ Delta-v khi cất cánh từ Trái Đất.';
  }

  return (
    <div className="debrief-view">
      <div className="section-intro">
        <span className="badge-kicker">PHASE 5: DEBRIEF & FLIGHT POST-MORTEM</span>
        <h2>Báo Cáo Nghiệm Thu & Đánh Giá Kỹ Thuật Nhiệm Vụ Sao Hỏa</h2>
        <p className="description">
          Phân tích kết quả nhiệm vụ dựa trên các tiêu chuẩn kỹ thuật hàng không vũ trụ của NASA: Cân đối Ngân sách, Khối lượng cấu trúc, Năng lượng pin, Mạng lưới liên lạc DSN và Cơ học quỹ đạo Delta-v.
        </p>
      </div>

      {/* Main Outcome Banner */}
      <div
        className="outcome-banner-card"
        style={{ borderColor: rankBadgeColor, boxShadow: `0 0 25px ${rankBadgeColor}28` }}
      >
        <div className="banner-top">
          <div className="rank-badge" style={{ backgroundColor: rankBadgeColor }}>
            {outcome.rank}
          </div>
          <div>
            <h3 style={{ color: rankBadgeColor }}>{outcome.title}</h3>
            <p className="outcome-explanation">{outcome.explanation}</p>
          </div>
        </div>

        <div className="outcome-details-box">
          <span className="details-header">Kết luận chi tiết từ Giám đốc Chuyến bay (Flight Director):</span>
          <ul>
            {outcome.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real-time Dynamic Engineering Trade-off Analysis */}
      <div className="dynamic-tradeoff-card">
        <h4>⚖️ Phân Tích Đánh Đổi Kỹ Thuật Thực Tế (Engineering Trade-off Analysis)</h4>
        <div className="tradeoff-diagnosis-bubble">
          <span className="diagnosis-icon">💡</span>
          <p className="diagnosis-text">{tradeOffDiagnosis}</p>
        </div>

        <div className="tradeoff-metrics-row">
          <div className="tradeoff-metric-item">
            <span>Chiến thuật Lốp xe:</span>
            <strong>{equippedWheels.name} ({hadStuckIncident ? '⚠️ Từng Sa Lầy' : '🛡️ Vượt Cạn An Toàn'})</strong>
          </div>
          <div className="tradeoff-metric-item">
            <span>Quản lý Năng lượng:</span>
            <strong>{equippedPower.name} {usedSolarRecharge ? '(☀️ Đã Sạc Trên Đồi Nắng)' : ''}</strong>
          </div>
          <div className="tradeoff-metric-item">
            <span>Trinh sát Bẫy ngầm:</span>
            <strong>{equippedSensors.name}</strong>
          </div>
          <div className="tradeoff-metric-item">
            <span>Tráo đổi tại Trạm [0,0]:</span>
            <strong className={didSwapModules || did3DPrint ? 'text-green' : 'text-amber'}>
              {didSwapModules ? 'Đã Thay Phụ Kiện' : did3DPrint ? 'Đã In 3D ISRU' : 'Chưa Tráo Đổi'}
            </strong>
          </div>
        </div>
      </div>

      {/* Mission Metrics Scorecard */}
      <div className="metrics-scorecard-grid">
        <div className="metric-box">
          <span className="metric-lbl">BÃI ĐÁP THỰC ĐỊA</span>
          <strong className="metric-val text-cyan">{site.name}</strong>
          <span className="metric-sub">Độ khó: {site.difficulty} ({site.sandTrapPct}% cát lún)</span>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">DỮ LIỆU KHOA HỌC DSN</span>
          <strong className="metric-val text-purple">
            {surface.transmittedScienceMB} / 150 MB
          </strong>
          <span className="metric-sub">
            {surface.transmittedScienceMB >= 150 ? '✅ Hoàn thành 100% mục tiêu' : '⚠️ Thiếu chỉ tiêu'}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">PIN NĂNG LƯỢNG XE</span>
          <strong
            className={`metric-val ${surface.batteryPower > 40 ? 'text-green' : surface.batteryPower > 0 ? 'text-amber' : 'text-red'}`}
          >
            {surface.batteryPower}⚡ / 100⚡
          </strong>
          <span className="metric-sub">{equippedPower?.name}</span>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">QUÃNG ĐƯỜNG THỰC ĐỊA</span>
          <strong className="metric-val text-amber">{surface.turnCount} Bước di chuyển</strong>
          <span className="metric-sub">{equippedWheels?.name}</span>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">HỢP KIM ISRU & IN 3D</span>
          <strong className="metric-val text-green">{surface.isruAlloyScrap} Mảnh vỡ</strong>
          <span className="metric-sub">Kho tiếp vận: {surface.landerInventory.length} món</span>
        </div>

        <div className="metric-box">
          <span className="metric-lbl">QUỸ TIẾP VẬN THẶNG DƯ</span>
          <strong className="metric-val text-cyan">${surface.missionCreditsMUSD}M</strong>
          <span className="metric-sub">Ngân sách gốc: ${site.budgetMUSD}M</span>
        </div>
      </div>

      {/* NASA DATA & SCIENCE VALIDITY CITATIONS BOX (Tiêu chí Validity) */}
      <div className="nasa-validity-card">
        <div className="nasa-card-header">
          <div className="nasa-logo-badge">NASA DATA & SCIENTIFIC VALIDITY</div>
          <h4>Cơ Sở Khoa Học & Đối Chiếu Dữ Liệu Thực Tế NASA</h4>
        </div>
        <p className="nasa-intro">
          Các cơ chế kỹ thuật trong APOGEE được mô phỏng bám sát các báo cáo kỹ thuật và bài học xương máu có thật từ các sứ mệnh khám phá Sao Hỏa của NASA/JPL:
        </p>

        <div className="nasa-citations-grid">
          {/* Citation 1 */}
          <div className="citation-item">
            <div className="citation-badge">BÁNH XE & ĐỊA HÌNH</div>
            <h5>Thảm họa Cát lún Spirit (2009) & NASA Glenn SMA Tires</h5>
            <p>
              Tháng 4/2009, xe tự hành <strong>Spirit (MER-A)</strong> bị lún ngập bánh nhôm tại cồn cát <em>Troy Sand Trap</em> ở hố Gusev. Lớp bụi ngụy trang đã che giấu lớp regolith mềm chứa muối sulfat trơn trượt bên dưới, khiến bánh xe mất hoàn toàn lực bám và xe đóng băng khi mùa đông sao Hỏa ập tới.
            </p>
            <p className="citation-solution">
              <strong>Giải pháp thực tế:</strong> Trung tâm Nghiên cứu <strong>NASA Glenn (GRC)</strong> đã phát triển bánh xe hợp kim nhớ hình <em>Nitinol SMA Spring Tires</em> có khả năng tự phục hồi hình dạng đàn hồi và diện tích tiếp xúc lớn, triệt tiêu 100% nguy cơ sa lầy.
            </p>
          </div>

          {/* Citation 2 */}
          <div className="citation-item">
            <div className="citation-badge">RADAR XUYÊN ĐẤT</div>
            <h5>RIMFAX Ground Penetrating Radar (Perseverance 2020)</h5>
            <p>
              Được trang bị ở đuôi xe tự hành <strong>Perseverance (Mars 2020)</strong>, <strong>RIMFAX</strong> là thiết bị radar xuyên đất đầu tiên hoạt động trên bề mặt Sao Hỏa. Thiết bị sử dụng dải tần 150-1200 MHz quét sâu hơn 10 mét dưới lòng hồ cổ Jezero.
            </p>
            <p className="citation-solution">
              <strong>Ứng dụng game:</strong> Tái hiện chính xác nguyên lý radar xuyên thấu lớp bụi mù bề mặt để phát hiện các túi cát trũng nguy hiểm và các phiến đá trầm tích chứa mẫu vật astrobiology.
            </p>
          </div>

          {/* Citation 3 */}
          <div className="citation-item">
            <div className="citation-badge">NĂNG LƯỢNG & TÁI CHẾ</div>
            <h5>Nguồn Nhiệt Điện MMRTG & Công Nghệ Tái Chế ISRU</h5>
            <p>
              Các xe tự hành hiện đại như <strong>Curiosity</strong> và <strong>Perseverance</strong> sử dụng khối nguồn <strong>MMRTG</strong> nặng 45 kg chứa Plutonium-238 để phát 110W điện và nhiệt lượng liên tục suốt 14 năm mà không lo bụi bám che lấp pin mặt trời như InSight hay Opportunity.
            </p>
            <p className="citation-solution">
              <strong>Chế tạo tại chỗ:</strong> Công nghệ <strong>NASA ISRU (In-Situ Resource Utilization)</strong> và in 3D kim loại từ phế liệu hạ cánh (skycrane debris) là định hướng sống còn cho các căn cứ lâu dài trên Sao Hỏa.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="phase-actions-footer">
        <button
          type="button"
          className="secondary"
          onClick={() => send({ type: 'SET_PHASE', phase: 'operations' })}
        >
          ← Trở lại Bản Đồ Thực Địa (Tiếp tục điều khiển)
        </button>

        <button
          type="button"
          className="primary-action-btn"
          onClick={() => send({ type: 'RESET' })}
        >
          ↺ Thiết Kế Nhiệm Vụ Mới (Architect a New Mars Mission)
        </button>
      </div>
    </div>
  );
}
