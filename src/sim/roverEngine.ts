// Core simulation engine for APOGEE: MARS ROVER ARCHITECT
// Implements realistic Martian surface exploration mechanics, energy management,
// sand trap hazards, ISRU economy, and NASA mission outcome evaluation.

import type {
  RoverSurfaceState,
  RoverMapTile,
  RoverModuleCategory,
  OutcomeRank,
  MissionResources,
  LandingSiteId,
} from '../types/game';
import { ROVER_MODULES, DEFAULT_STARTING_EQUIPMENT } from '../data/roverModules';
import { createInitialMarsMap, MARS_GRID_WIDTH, MARS_GRID_HEIGHT } from '../data/marsMap';
import { LANDING_SITES } from '../data/missionObjective';

/**
 * Initializes the Martian surface exploration state.
 */
export function createInitialSurfaceState(
  equipped = DEFAULT_STARTING_EQUIPMENT,
  initialInventory: string[] = ['slim_aluminum', 'wide_titan'],
  siteId: LandingSiteId = 'jezero_crater'
): RoverSurfaceState {
  const site = LANDING_SITES[siteId] ?? LANDING_SITES.jezero_crater;
  return {
    roverX: 0,
    roverY: 0,
    isStuck: false,
    batteryPower: 100,
    maxBatteryPower: 100,
    equippedModules: { ...equipped },
    landerInventory: Array.from(new Set([...initialInventory, equipped.wheels])),
    gridWidth: MARS_GRID_WIDTH,
    gridHeight: MARS_GRID_HEIGHT,
    tiles: createInitialMarsMap(siteId),
    rawScienceMB: 0,
    transmittedScienceMB: 0,
    isruAlloyScrap: 0,
    missionCreditsMUSD: 0,
    turnCount: 0,
    logs: [
      `🚀 Touchdown confirmed at ${site.name}! Lander Base operational at [0,0].`,
      '🔋 Rover deployed with 100⚡ battery. Active loadout ready for surface science.',
    ],
  };
}

/**
 * Moves rover by one tile in the specified direction.
 */
export function moveRover(
  surface: RoverSurfaceState,
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
): RoverSurfaceState {
  const next = cloneSurface(surface);
  next.turnCount += 1;

  // 1. Stuck check
  if (next.isStuck) {
    next.logs.unshift('⚠️ BÁNH XE BỊ KẸT CÁT: Xe đang sa lầy! Nhấn nút [Thoát Lầy - Unstuck] (tốn 15⚡).');
    return next;
  }

  // 2. Battery check
  if (next.batteryPower <= 0) {
    next.logs.unshift('🚨 SẬP NGUỒN (0⚡): Pin xe đã cạn sạch! Toàn bộ hệ thống ngừng hoạt động.');
    return next;
  }

  // 3. Calculate target position
  let targetX = next.roverX;
  let targetY = next.roverY;

  switch (direction) {
    case 'UP': targetY -= 1; break;
    case 'DOWN': targetY += 1; break;
    case 'LEFT': targetX -= 1; break;
    case 'RIGHT': targetX += 1; break;
  }

  // Bounds check
  if (targetX < 0 || targetX >= next.gridWidth || targetY < 0 || targetY >= next.gridHeight) {
    next.logs.unshift(`🚫 CHẶN ĐƯỜNG: Vách đá / sườn dốc hẻm vực hiểm trở tại [${targetX}, ${targetY}].`);
    return next;
  }

  const targetTile = next.tiles[targetY][targetX];
  const wheels = ROVER_MODULES[next.equippedModules.wheels] || ROVER_MODULES.slim_aluminum;

  // 4. Calculate terrain power drain based on equipped wheels
  const isSand = targetTile.type === 'HIDDEN_SAND_TRAP';
  const drain = isSand ? (wheels.powerDrainSand ?? 25) : (wheels.powerDrainFlat ?? 4);

  next.batteryPower = Math.max(0, next.batteryPower - drain);
  next.roverX = targetX;
  next.roverY = targetY;

  // 5. Reveal tile
  targetTile.isScanned = true;
  if (isSand) {
    targetTile.isSandTrapRevealed = true;
  }

  let moveLog = '';
  if (wheels.id === 'slim_aluminum') {
    if (isSand) {
      moveLog = `⚠️ Đi vào CÁT LÚN bằng Lốp Nhôm: Tiêu hao -25⚡! (Ma sát bùn cát lớn). Pin còn: ${next.batteryPower}⚡.`;
    } else {
      moveLog = `🪨 Đi trên ĐƯỜNG BẰNG bằng Lốp Nhôm: Tiêu hao -4⚡ (Cực kỳ tiết kiệm!). Pin còn: ${next.batteryPower}⚡.`;
    }
  } else if (wheels.id === 'wide_titan') {
    if (isSand) {
      moveLog = `🛡️ Đi vào CÁT LÚN bằng Lốp Titan To: Tiêu hao -9⚡ (Vượt cạn an toàn, 0% kẹt!). Pin còn: ${next.batteryPower}⚡.`;
    } else {
      moveLog = `🪨 Đi trên ĐƯỜNG BẰNG bằng Lốp Titan To: Tiêu hao -11⚡ (Hao pin gấp 3 lốp nhôm do ma sát lăn!). Pin còn: ${next.batteryPower}⚡.`;
    }
  } else {
    // adaptive_sma
    if (isSand) {
      moveLog = `🌀 Đi vào CÁT LÚN bằng Lốp Biến Hình SMA: Tiêu hao -10⚡ (Nitinol tự dàn trải). Pin còn: ${next.batteryPower}⚡.`;
    } else {
      moveLog = `🪨 Đi trên ĐƯỜNG BẰNG bằng Lốp Biến Hình SMA: Tiêu hao -6⚡. Pin còn: ${next.batteryPower}⚡.`;
    }
  }

  // 6. Hazard Check: Sand Trap stuck roll
  if (isSand) {
    const stuckChance = wheels.stuckRiskSand ?? 0;
    if (stuckChance > 0 && Math.random() < stuckChance) {
      next.isStuck = true;
      moveLog += ' 🚨 BÁO ĐỘNG ĐỎ: Bánh xe đã lún sâu vào cồn cát mềm! Cần 15⚡ để kích hoạt mô-tơ thoát lầy.';
    } else if (stuckChance === 0) {
      moveLog += ' (0% kẹt bánh nhờ bản lốp rộng)';
    }
  }

  // 7. Science sample collection
  if (targetTile.type === 'SCIENCE_SAMPLE' && !targetTile.hasCollectedSample) {
    targetTile.hasCollectedSample = true;
    next.rawScienceMB += 50;
    moveLog += ' 💎 KHOAN MẪU ĐÁ CỔ: Thu thập +50 MB dữ liệu dấu vết sinh học vũ trụ!';
  }

  // 8. Debris scrap salvage
  if (targetTile.type === 'DEBRIS_SCRAP' && !targetTile.hasCollectedScrap) {
    targetTile.hasCollectedScrap = true;
    next.isruAlloyScrap += 2;
    moveLog += ' 🛰️ THU THẬP MẢNH VỠ: Thu gom +2 Hợp kim Titan ISRU để in 3D!';
  }

  // 9. Turn-end power generation
  const powerMod = ROVER_MODULES[next.equippedModules.power] || ROVER_MODULES.solar_array;
  if (powerMod.id === 'mmrtg') {
    const gain = powerMod.chargeRateEverywhere ?? 8;
    next.batteryPower = Math.min(next.maxBatteryPower, next.batteryPower + gain);
    moveLog += ` ⚡ MMRTG phân rã hạt nhân tự hồi phục +${gain}⚡.`;
  } else if (powerMod.id === 'solar_array' && targetTile.type === 'SOLAR_RIDGE') {
    const gain = powerMod.chargeRateRidge ?? 25;
    next.batteryPower = Math.min(next.maxBatteryPower, next.batteryPower + gain);
    moveLog += ` ☀️ Đồi Đón Nắng sạc quang điện +${gain}⚡!`;
  }

  // Battery depletion check
  if (next.batteryPower <= 0) {
    moveLog += ' 🚨 NGUY CẤP: Pin tụt về 0⚡! Xe tự hành bị đóng băng giữa bề mặt Sao Hỏa.';
  }

  next.logs.unshift(moveLog);
  return next;
}

/**
 * Moves rover directly to an adjacent tile.
 */
export function moveRoverTo(
  surface: RoverSurfaceState,
  targetX: number,
  targetY: number
): RoverSurfaceState {
  const dx = targetX - surface.roverX;
  const dy = targetY - surface.roverY;

  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    const next = cloneSurface(surface);
    next.logs.unshift('🚫 Chỉ có thể click di chuyển sang ô liền kề (khoảng cách 1 ô)!');
    return next;
  }

  let dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'UP';
  if (dx === 1) dir = 'RIGHT';
  else if (dx === -1) dir = 'LEFT';
  else if (dy === 1) dir = 'DOWN';
  else if (dy === -1) dir = 'UP';

  return moveRover(surface, dir);
}

/**
 * Manually charges battery when positioned on a Solar Ridge using solar panels.
 */
export function solarCharge(surface: RoverSurfaceState): RoverSurfaceState {
  const next = cloneSurface(surface);
  const currentTile = next.tiles[next.roverY][next.roverX];
  const powerMod = ROVER_MODULES[next.equippedModules.power] || ROVER_MODULES.solar_array;

  if (currentTile.type !== 'SOLAR_RIDGE') {
    next.logs.unshift('☀️ SẠC KHÔNG THÀNH CÔNG: Xe không đứng trên ô Đồi Đón Nắng (Solar Ridge)!');
    return next;
  }

  if (powerMod.id !== 'solar_array') {
    next.logs.unshift('ℹ️ Xe đang dùng nguồn MMRTG (tự hồi pin liên tục +8⚡/lượt mọi lúc mọi nơi).');
    return next;
  }

  if (next.batteryPower >= next.maxBatteryPower) {
    next.logs.unshift('🔋 Pin đã đầy 100⚡! Không cần sạc thêm.');
    return next;
  }

  const gain = 25;
  const oldBattery = next.batteryPower;
  next.batteryPower = Math.min(next.maxBatteryPower, next.batteryPower + gain);
  const actualGain = next.batteryPower - oldBattery;

  next.logs.unshift(`☀️ ĐÓN NẮNG THÀNH CÔNG: Pin quang điện nạp thêm +${actualGain}⚡! Pin hiện tại: ${next.batteryPower}⚡.`);
  return next;
}

/**
 * Scans the surrounding area using the equipped sensor package.
 */
export function scanTerrain(surface: RoverSurfaceState): RoverSurfaceState {
  const next = cloneSurface(surface);
  const sensor = ROVER_MODULES[next.equippedModules.sensors] || ROVER_MODULES.navcam;
  const drain = sensor.scanPowerDrain ?? 2;

  if (next.batteryPower < drain) {
    next.logs.unshift(`⚡ Không đủ pin để quét Radar (Cần ${drain}⚡, hiện có ${next.batteryPower}⚡).`);
    return next;
  }

  next.batteryPower = Math.max(0, next.batteryPower - drain);
  const radius = sensor.scanRadius ?? 1;
  let revealedHazards = 0;
  let revealedSamples = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = next.roverX + dx;
      const ny = next.roverY + dy;
      if (nx >= 0 && nx < next.gridWidth && ny >= 0 && ny < next.gridHeight) {
        const tile = next.tiles[ny][nx];
        tile.isScanned = true;
        if (sensor.revealsHiddenSand && tile.type === 'HIDDEN_SAND_TRAP') {
          tile.isSandTrapRevealed = true;
          revealedHazards += 1;
        }
        if (tile.type === 'SCIENCE_SAMPLE' && !tile.hasCollectedSample) {
          revealedSamples += 1;
        }
      }
    }
  }

  if (sensor.revealsHiddenSand) {
    next.logs.unshift(
      `📡 RADAR XUYÊN ĐẤT RIMFAX (-${drain}⚡): Đã quét bán kính ${radius} ô! Soi rõ ${revealedHazards} bẫy cát ngầm ⚠️ và ${revealedSamples} mẫu vật khoa học 💎!`
    );
  } else {
    next.logs.unshift(
      `📷 CAMERA QUANG HỌC NavCam (-${drain}⚡): Đã chụp quang cảnh 1 ô sát cạnh. Cảnh báo: NavCam KHÔNG THỂ phát hiện cát lún ngầm dưới bụi!`
    );
  }

  return next;
}

/**
 * Transmits raw collected science data to NASA Earth via DSN.
 */
export function transmitData(surface: RoverSurfaceState): RoverSurfaceState {
  const next = cloneSurface(surface);
  const comms = ROVER_MODULES[next.equippedModules.comms] || ROVER_MODULES.uhf_antenna;
  const drain = comms.transmitPowerDrain ?? 5;

  if (next.batteryPower < drain) {
    next.logs.unshift(`⚡ Không đủ pin để phát sóng truyền dữ liệu (Cần ${drain}⚡).`);
    return next;
  }

  // Distance check from Lander Base at [0, 0]
  const distToLander = Math.abs(next.roverX - 0) + Math.abs(next.roverY - 0);
  const maxRange = comms.maxDistanceToLanderForComms ?? Infinity;

  if (distToLander > maxRange) {
    next.logs.unshift(
      `📡 MẤT TÍN HIỆU: Ăng-ten UHF đòi hỏi khoảng cách <= ${maxRange} ô từ Trạm Đổ Bộ (Hiện đang cách ${distToLander} ô). Hãy lái xe lại gần trạm hoặc nâng cấp Đĩa Cao Tần!`
    );
    return next;
  }

  if (next.rawScienceMB <= 0) {
    next.logs.unshift('ℹ️ Bộ nhớ đệm không có dữ liệu khoa học mới nào để truyền về Trái Đất.');
    return next;
  }

  next.batteryPower = Math.max(0, next.batteryPower - drain);
  const amount = next.rawScienceMB;
  next.transmittedScienceMB += amount;
  next.rawScienceMB = 0;

  // Economy: $1M mission credit per 2.5 MB transmitted (0.4 multiplier)
  const creditsEarned = Math.round(amount * 0.4);
  next.missionCreditsMUSD += creditsEarned;

  next.logs.unshift(
    `📶 TRUYỀN DỮ LIỆU THÀNH CÔNG (-${drain}⚡): Đã gửi ${amount} MB dữ liệu về NASA qua mạng lưới DSN! Nhận thưởng +$${creditsEarned}M Quỹ Tiếp Vận.`
  );

  return next;
}

/**
 * Executes high-torque motor burst to unstick wheels from a sand trap.
 */
export function unstuckRover(surface: RoverSurfaceState): RoverSurfaceState {
  const next = cloneSurface(surface);
  if (!next.isStuck) {
    next.logs.unshift('ℹ️ Bánh xe đang quay tự do, không bị kẹt lún.');
    return next;
  }

  const cost = 15;
  if (next.batteryPower < cost) {
    next.logs.unshift(`🚨 NGUY CẤP: Cần ${cost}⚡ để kích hoạt mô-tơ giật lùi, nhưng chỉ còn ${next.batteryPower}⚡. Xe bị kẹt vĩnh viễn!`);
    return next;
  }

  next.batteryPower -= cost;
  next.isStuck = false;
  next.logs.unshift(`⚙️ THOÁT LẦY THÀNH CÔNG (-${cost}⚡): Mô-tơ xoay ngược góc bánh, giải thoát xe khỏi cồn cát lún!`);
  return next;
}

/**
 * Swaps an equipped module with one available in the Lander Base inventory.
 * Rover MUST be docked at [0, 0].
 */
export function swapModuleAtLander(
  surface: RoverSurfaceState,
  category: RoverModuleCategory,
  newModuleId: string
): RoverSurfaceState {
  const next = cloneSurface(surface);
  if (next.roverX !== 0 || next.roverY !== 0) {
    next.logs.unshift('🚫 Để thay phụ kiện, xe Rover phải đỗ tại [0, 0] (Trạm Đổ Bộ Lander Base)!');
    return next;
  }

  if (!next.landerInventory.includes(newModuleId)) {
    next.logs.unshift(`🚫 Phụ kiện [${newModuleId}] không có trong Kho Trạm Đổ Bộ.`);
    return next;
  }

  const oldModuleId = next.equippedModules[category];
  next.equippedModules[category] = newModuleId;

  // Keep old module stored in inventory
  if (!next.landerInventory.includes(oldModuleId)) {
    next.landerInventory.push(oldModuleId);
  }

  const mod = ROVER_MODULES[newModuleId];
  next.logs.unshift(`🔧 THAY THẾ PHỤ KIỆN: Đã lắp [${mod.name}] vào hệ thống ${category} của xe!`);
  return next;
}

/**
 * 3D prints a new module at the Lander Base fabricator using ISRU scrap or credits.
 */
export function craftModuleAtLander(
  surface: RoverSurfaceState,
  moduleId: string
): RoverSurfaceState {
  const next = cloneSurface(surface);
  if (next.roverX !== 0 || next.roverY !== 0) {
    next.logs.unshift('🚫 Máy in 3D Fabricator đặt bên trong Trạm Đổ Bộ tại [0, 0]!');
    return next;
  }

  const mod = ROVER_MODULES[moduleId];
  if (!mod) {
    next.logs.unshift(`🚫 Mã phụ kiện không hợp lệ: [${moduleId}].`);
    return next;
  }

  if (next.landerInventory.includes(moduleId) || Object.values(next.equippedModules).includes(moduleId)) {
    next.logs.unshift(`ℹ️ Bạn đã sở hữu [${mod.name}] trong kho hoặc đang gắn trên xe.`);
    return next;
  }

  const scrapCost = mod.craftCostScrap;
  const creditsCost = mod.craftCostCredits;

  const hasScrap = next.isruAlloyScrap >= scrapCost;
  const hasCredits = next.missionCreditsMUSD >= creditsCost;

  if (!hasScrap && !hasCredits) {
    next.logs.unshift(
      `🚫 Không đủ tài nguyên chế tạo [${mod.name}]. Cần ${scrapCost} Mảnh Hợp Kim ISRU HOẶC $${creditsCost}M Quỹ Tiếp Vận!`
    );
    return next;
  }

  if (hasScrap) {
    next.isruAlloyScrap -= scrapCost;
    next.logs.unshift(`🖨️ IN 3D HOÀN TẤT: Sử dụng ${scrapCost} Hợp Kim ISRU để đúc mới [${mod.name}]!`);
  } else {
    next.missionCreditsMUSD -= creditsCost;
    next.logs.unshift(`💳 TIẾP VẬN THÀNH CÔNG: Dùng $${creditsCost}M Quỹ Tiếp Vận để mua [${mod.name}]!`);
  }

  next.landerInventory.push(moduleId);
  return next;
}

/**
 * Evaluates the mission ranking based on the 3-tier consequence matrix:
 * S-Rank (Full Success), B-Rank (Partial), F-Rank (Failure).
 */
export function calculateMissionOutcome(
  surface: RoverSurfaceState,
  resources: MissionResources
): { rank: OutcomeRank; title: string; explanation: string; details: string[] } {
  // 1. Launch / Transit Failure checks
  if (resources.massKg > resources.massLimitKg) {
    return {
      rank: 'F-Rank',
      title: 'THẤT BẠI NHIỆM VỤ (F-Rank) — Quá tải bệ phóng tên lửa',
      explanation: 'Tổng khối lượng xe và phụ kiện vượt quá sức nâng của tên lửa đẩy. Tàu không thể vào quỹ đạo bay tới Sao Hỏa.',
      details: [
        `Khối lượng thực tế (${resources.massKg} kg) vượt tải trọng tối đa (${resources.massLimitKg} kg).`,
        'Bài học kỹ thuật: Khi mang theo pin nặng hoặc lốp to, bắt buộc phải chọn Tên lửa hạng nặng tương ứng.',
      ],
    };
  }

  if (resources.deltaVAvailableKmS < resources.deltaVRequiredKmS) {
    return {
      rank: 'F-Rank',
      title: 'THẤT BẠI NHIỆM VỤ (F-Rank) — Thiếu hụt Delta-v bay tới Sao Hỏa',
      explanation: 'Tàu vũ trụ không đủ gia tốc Delta-v để thoát lực hút Trái Đất và hãm phanh vào quỹ đạo Sao Hỏa.',
      details: [
        `Delta-v khả dụng (${resources.deltaVAvailableKmS.toFixed(2)} km/s) < Yêu cầu tối thiểu (${resources.deltaVRequiredKmS.toFixed(2)} km/s).`,
        'Tàu trôi dạt vào không gian sâu vô định.',
      ],
    };
  }

  // 2. Surface Failure: Battery 0 and stuck
  if (surface.batteryPower <= 0 && surface.isStuck) {
    return {
      rank: 'F-Rank',
      title: 'THẤT BẠI NHIỆM VỤ (F-Rank) — Chết máy do sa lầy cát lún',
      explanation: 'Xe tự hành bị chôn bánh trong cồn cát lún với lượng pin cạn kiệt (0⚡), không thể kích hoạt mô-tơ thoát lầy.',
      details: [
        'Nguyên nhân: Sử dụng Lốp Nhôm mỏng đi vào vùng cát lún mà không quét Radar GPR trước.',
        `Tổng dữ liệu khoa học gửi về Trái Đất: ${surface.transmittedScienceMB} MB.`,
        'Khuyến nghị: Lắp Radar RIMFAX để soi cát ngầm hoặc đổi sang Lốp Lưới Titan to (0% nguy cơ kẹt).',
      ],
    };
  }

  // 3. Surface Failure: Battery 0 with 0 science transmitted
  if (surface.batteryPower <= 0 && surface.transmittedScienceMB === 0) {
    return {
      rank: 'F-Rank',
      title: 'THẤT BẠI NHIỆM VỤ (F-Rank) — Cạn kiệt năng lượng (Loss of Power)',
      explanation: 'Xe tự hành cạn sạch pin (0⚡) ở vùng không có ánh sáng mặt trời trước khi kịp truyền bất kỳ dữ liệu nào về NASA.',
      details: [
        'Pin tụt về 0⚡ do di chuyển đường dài hoặc quét radar quá mức.',
        'Bài học: Luôn theo dõi thanh năng lượng và dừng nghỉ tại Đồi Đón Nắng ☀️ để nạp điện!',
      ],
    };
  }

  // 4. S-Rank: Full Success (>= 150 MB transmitted, rover alive)
  if (surface.transmittedScienceMB >= 150 && surface.batteryPower > 0) {
    return {
      rank: 'S-Rank',
      title: 'THÀNH CÔNG XUẤT SẮC (S-Rank) — Thắng lợi khoa học toàn diện',
      explanation: 'Xuất sắc! Xe tự hành hoàn thành toàn bộ chỉ tiêu khoa học, thu thập và truyền đầy đủ mẫu vật cổ về NASA Trái Đất.',
      details: [
        `Tổng dữ liệu khoa học đã truyền: ${surface.transmittedScienceMB} MB (Vượt mốc 150 MB).`,
        `Xe Rover sống sót an toàn với ${surface.batteryPower}⚡ pin dự trữ.`,
        `Hợp kim ISRU thu hoạch: ${surface.isruAlloyScrap} mảnh | Quỹ Tiếp Vận: $${surface.missionCreditsMUSD}M.`,
        'Đạt chuẩn mực tối cao về Quản lý Kỹ thuật Hệ thống Không gian (NASA Systems Engineering)!',
      ],
    };
  }

  // 5. B-Rank: Partial / Degraded
  if (surface.transmittedScienceMB > 0) {
    return {
      rank: 'B-Rank',
      title: 'THÀNH CÔNG MỘT PHẦN (B-Rank) — Thu thập dữ liệu hạn chế',
      explanation: 'Xe tự hành đã gửi được một số mẫu dữ liệu giá trị về Trái Đất, nhưng chưa đạt đủ chỉ tiêu khoa học toàn diện (150 MB).',
      details: [
        `Dữ liệu đã truyền: ${surface.transmittedScienceMB} MB / Chỉ tiêu 150 MB.`,
        surface.batteryPower <= 0
          ? 'Xe đã cạn pin nhưng dữ liệu truyền trước đó đã được NASA lưu trữ an toàn.'
          : `Xe còn ${surface.batteryPower}⚡ pin.`,
        'Góp ý: Tận dụng trạm đổi lốp tại Lander Base để tối ưu hóa quãng đường di chuyển.',
      ],
    };
  }

  // Fallback: Failure
  return {
    rank: 'F-Rank',
    title: 'THẤT BẠI NHIỆM VỤ (F-Rank) — Không có dữ liệu khoa học',
    explanation: 'Nhiệm vụ kết thúc khi chưa có bất kỳ mẫu dữ liệu khoa học nào được truyền về Trái Đất.',
    details: [
      'Không thu thập hoặc chưa kịp bật ăng-ten truyền dữ liệu trước khi kết thúc nhiệm vụ.',
    ],
  };
}

function cloneSurface(s: RoverSurfaceState): RoverSurfaceState {
  return {
    ...s,
    equippedModules: { ...s.equippedModules },
    landerInventory: [...s.landerInventory],
    tiles: s.tiles.map(row => row.map(t => ({ ...t }))),
    logs: [...s.logs],
  };
}
