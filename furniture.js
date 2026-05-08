import * as THREE from 'three';

// ============================================================
// SHARED MATERIALS — Contemporary Industrial Luxury palette
// ============================================================
export const M = {
  walnut: new THREE.MeshPhongMaterial({ color: 0x5C3D2E, shininess: 25, specular: 0x222018 }),
  walnutDark: new THREE.MeshPhongMaterial({ color: 0x432a1f, shininess: 18, specular: 0x1a1612 }),
  steel: new THREE.MeshPhongMaterial({ color: 0x9A9894, shininess: 110, specular: 0x807d78 }),
  steelDark: new THREE.MeshPhongMaterial({ color: 0x4A4843, shininess: 80, specular: 0x33312d }),
  charcoal: new THREE.MeshPhongMaterial({ color: 0x3D3B36, shininess: 5, specular: 0x111111 }),
  charcoalDeep: new THREE.MeshPhongMaterial({ color: 0x2C2B28, shininess: 5, specular: 0x111111 }),
  glassTeal: new THREE.MeshPhongMaterial({
    color: 0xA8D5C2, transparent: true, opacity: 0.18,
    shininess: 120, specular: 0xffffff,
  }),
  marble: new THREE.MeshPhongMaterial({ color: 0xD8D4CC, shininess: 90, specular: 0xffffff }),
  beige: new THREE.MeshPhongMaterial({ color: 0xC8B898, shininess: 12 }),
  black: new THREE.MeshPhongMaterial({ color: 0x1A1918, shininess: 35, specular: 0x222 }),
  whiteWarm: new THREE.MeshPhongMaterial({ color: 0xF0EDE6, shininess: 25 }),
  potConcrete: new THREE.MeshPhongMaterial({ color: 0x7A766E, shininess: 5 }),
  leafGreen: new THREE.MeshPhongMaterial({ color: 0x4B6B5A, shininess: 8, specular: 0x222 }),
  leafGreenLight: new THREE.MeshPhongMaterial({ color: 0x6a8a78, shininess: 8 }),
  trunkBrown: new THREE.MeshPhongMaterial({ color: 0x3a2a1c, shininess: 5 }),
  ledWarm: new THREE.MeshBasicMaterial({ color: 0xF5E6C8 }),
  ledTeal: new THREE.MeshBasicMaterial({ color: 0x7CB69A }),
  ledScreen: new THREE.MeshBasicMaterial({ color: 0x6a8a90 }),
  rail: new THREE.MeshPhongMaterial({ color: 0x1E1D1B, shininess: 30 }),
  // accents
  accentTeal: new THREE.MeshPhongMaterial({ color: 0x7CB69A, shininess: 18 }),
  accentCoral: new THREE.MeshPhongMaterial({ color: 0xD4917A, shininess: 18 }),
  accentBeige: new THREE.MeshPhongMaterial({ color: 0xC8B898, shininess: 18 }),
  accentGrey: new THREE.MeshPhongMaterial({ color: 0xB5B0A6, shininess: 18 }),
};

// shared singletons để tránh tạo material mới mỗi lần build
const BOOK_COLORS = [
  new THREE.MeshPhongMaterial({ color: 0x5C3D2E, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0x3D3B36, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0x7CB69A, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0xD4917A, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0xC8B898, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0x4A4843, shininess: 8 }),
  new THREE.MeshPhongMaterial({ color: 0xB5B0A6, shininess: 8 }),
];
const ART_PERF_MAT = new THREE.MeshBasicMaterial({ color: 0x1A1918 });
const STAR_MAT = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
const BULB_WARM_MAT = new THREE.MeshBasicMaterial({ color: 0xffe0a0 });
const BULB_TRACK_MAT = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
const SCREEN_TEAL_MAT = new THREE.MeshBasicMaterial({ color: 0x7CB69A, transparent: true, opacity: 0.5 });
const SCREEN_TEAL_DIM_MAT = new THREE.MeshBasicMaterial({ color: 0x7CB69A, transparent: true, opacity: 0.42 });
const SCREEN_BLUE_MAT = new THREE.MeshBasicMaterial({ color: 0x6a8a90, transparent: true, opacity: 0.55 });
const TEXT_LIGHT_MAT = new THREE.MeshBasicMaterial({ color: 0xF5F0E8 });
const STARLIGHT_PANEL_MAT = new THREE.MeshPhongMaterial({ color: 0x9A9894, shininess: 35 });
const ART_PALETTE = [M.accentTeal, M.accentCoral, M.accentBeige, M.accentGrey];

// ============================================================
// HELPERS
// ============================================================
function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(r, h, mat, segs = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function sph(r, mat, segs = 8) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, Math.max(4, segs / 2)), mat);
  m.castShadow = true;
  return m;
}
function tag(group, type, name, dims, ref, price) {
  group.userData.tooltip = { type, name, dims, ref, price };
  group.userData.isFurniture = true;
}

// ============================================================
// 1. desk_shared(length)
// ============================================================
export function desk_shared(length = 2.4) {
  const g = new THREE.Group();
  const top = box(length, 0.04, 0.8, M.walnut);
  top.position.y = 0.74;
  g.add(top);
  // chân ống tròn 4 cái
  for (const x of [-length / 2 + 0.18, length / 2 - 0.18]) {
    for (const z of [-0.32, 0.32]) {
      const leg = cyl(0.025, 0.72, M.steel);
      leg.position.set(x, 0.36, z);
      g.add(leg);
    }
  }
  // cable tray ẩn dưới bàn
  const tray = box(length - 0.5, 0.04, 0.16, M.steel);
  tray.position.set(0, 0.55, 0);
  g.add(tray);
  // power rail giữa bàn
  const rail = box(length - 0.6, 0.03, 0.08, M.black);
  rail.position.set(0, 0.768, 0);
  g.add(rail);
  // LED indicator xanh
  for (let i = -length / 2 + 0.5; i <= length / 2 - 0.5; i += 0.55) {
    const led = sph(0.012, M.ledTeal, 6);
    led.position.set(i, 0.785, 0);
    g.add(led);
  }
  tag(g, 'desk_shared', 'Shared Desk',
    `${length.toFixed(1)}×0.8×0.74m`,
    'Custom walnut top + brushed steel legs',
    `~${Math.round(length * 8)}tr VND`);
  return g;
}

// ============================================================
// 2. desk_standing()
// ============================================================
export function desk_standing() {
  const g = new THREE.Group();
  const top = box(1.4, 0.04, 0.7, M.walnut);
  top.position.y = 1.05;
  g.add(top);
  const post = cyl(0.04, 1.0, M.steel);
  post.position.set(0, 0.5, 0);
  g.add(post);
  const baseH = box(0.7, 0.05, 0.06, M.steel);
  baseH.position.set(0, 0.025, 0);
  g.add(baseH);
  const baseV = box(0.06, 0.05, 0.5, M.steel);
  baseV.position.set(0, 0.025, 0);
  g.add(baseV);
  const beam = box(1.0, 0.05, 0.1, M.steel);
  beam.position.set(0, 0.99, 0);
  g.add(beam);
  // control panel
  const ctrl = box(0.12, 0.02, 0.04, M.black);
  ctrl.position.set(0.55, 1.03, 0.34);
  g.add(ctrl);
  tag(g, 'desk_standing', 'Standing Desk',
    '1.4×0.7×1.05m, motorized',
    'Ref: Fully Jarvis Bamboo',
    '~18tr VND');
  return g;
}

// ============================================================
// 3. chair_shell() — Hans Wegner Shell Chair
// ============================================================
export function chair_shell() {
  const g = new THREE.Group();
  // seat curved
  const seat = box(0.55, 0.05, 0.5, M.walnut);
  seat.position.y = 0.42;
  g.add(seat);
  // backrest curved (cylinder partial)
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.55, 14, 1, true, -5 * Math.PI / 6, 2 * Math.PI / 3),
    M.walnut,
  );
  back.material.side = THREE.DoubleSide;
  back.position.set(0, 0.74, -0.05);
  back.castShadow = true;
  g.add(back);
  // 4 chân nghiêng
  for (const [dx, dz] of [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]]) {
    const leg = cyl(0.018, 0.42, M.walnut);
    leg.position.set(dx, 0.21, dz);
    leg.rotation.x = dz < 0 ? -0.08 : 0.08;
    leg.rotation.z = dx < 0 ? -0.08 : 0.08;
    g.add(leg);
  }
  // cushion subtle
  const cushion = box(0.5, 0.04, 0.45, M.charcoal);
  cushion.position.y = 0.46;
  g.add(cushion);
  tag(g, 'chair_shell', 'Shell Chair',
    '0.55×0.55×1.0m',
    'Ref: Hans Wegner CH07',
    '~15tr VND');
  return g;
}

// ============================================================
// 4. chair_task() — Ergonomic Aeron-style
// ============================================================
export function chair_task() {
  const g = new THREE.Group();
  const seat = box(0.5, 0.06, 0.5, M.charcoalDeep);
  seat.position.y = 0.5;
  g.add(seat);
  const back = box(0.48, 0.62, 0.06, M.charcoalDeep);
  back.position.set(0, 0.85, -0.22);
  g.add(back);
  // headrest
  const head = box(0.32, 0.16, 0.05, M.charcoalDeep);
  head.position.set(0, 1.18, -0.22);
  g.add(head);
  // gas cylinder
  const post = cyl(0.025, 0.45, M.steel);
  post.position.y = 0.25;
  g.add(post);
  // 5-star base
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = box(0.32, 0.04, 0.05, M.steel);
    arm.position.set(Math.cos(a) * 0.16, 0.04, Math.sin(a) * 0.16);
    arm.rotation.y = -a;
    g.add(arm);
    const w = cyl(0.022, 0.04, M.black, 8);
    w.position.set(Math.cos(a) * 0.32, 0.02, Math.sin(a) * 0.32);
    w.rotation.x = Math.PI / 2;
    g.add(w);
  }
  // armrests
  for (const x of [-0.27, 0.27]) {
    const arm = box(0.05, 0.22, 0.36, M.charcoalDeep);
    arm.position.set(x, 0.66, -0.05);
    g.add(arm);
    const armtop = box(0.07, 0.025, 0.32, M.charcoal);
    armtop.position.set(x, 0.78, -0.05);
    g.add(armtop);
  }
  tag(g, 'chair_task', 'Task Chair',
    '0.6×0.6×1.18m, ergonomic',
    'Ref: Herman Miller Aeron',
    '~30tr VND');
  return g;
}

// ============================================================
// 5. sofa_module(seats)
// ============================================================
export function sofa_module(seats = 2) {
  const g = new THREE.Group();
  const w = seats === 3 ? 2.2 : 1.6;
  const base = box(w, 0.32, 0.85, M.charcoal);
  base.position.set(0, 0.16, 0);
  g.add(base);
  const back = box(w, 0.55, 0.18, M.charcoal);
  back.position.set(0, 0.62, -0.34);
  g.add(back);
  for (const x of [-w / 2 + 0.09, w / 2 - 0.09]) {
    const arm = box(0.18, 0.32, 0.85, M.charcoal);
    arm.position.set(x, 0.51, 0);
    g.add(arm);
  }
  const seatW = (w - 0.4) / seats;
  for (let i = 0; i < seats; i++) {
    const sx = -w / 2 + 0.2 + seatW * (i + 0.5);
    const cu = box(seatW - 0.04, 0.14, 0.7, M.charcoal);
    cu.position.set(sx, 0.4, 0.05);
    g.add(cu);
    // accent throw pillow
    if (i === 0 && seats >= 2) {
      const pillow = box(0.32, 0.1, 0.32, M.accentTeal);
      pillow.position.set(sx, 0.55, -0.12);
      g.add(pillow);
    }
    if (i === seats - 1 && seats >= 2) {
      const pillow = box(0.3, 0.1, 0.3, M.accentCoral);
      pillow.position.set(sx, 0.55, -0.1);
      g.add(pillow);
    }
  }
  // chân inox thấp
  for (const dx of [-w / 2 + 0.15, w / 2 - 0.15]) {
    for (const dz of [-0.36, 0.36]) {
      const leg = cyl(0.022, 0.08, M.steel);
      leg.position.set(dx, 0.04, dz);
      g.add(leg);
    }
  }
  tag(g, 'sofa_module', `Sofa ${seats}-seat`,
    `${w.toFixed(1)}×0.85×0.85m`,
    'Ref: Muuto Outline / Vitra Soft Modular',
    `~${seats === 3 ? 65 : 45}tr VND`);
  return g;
}

// ============================================================
// 6. coffee_table()
// ============================================================
export function coffee_table() {
  const g = new THREE.Group();
  const top = cyl(0.3, 0.04, M.marble);
  top.position.y = 0.36;
  g.add(top);
  const stand = cyl(0.04, 0.36, M.steel);
  stand.position.y = 0.18;
  g.add(stand);
  const base = cyl(0.22, 0.025, M.steel);
  base.position.y = 0.012;
  g.add(base);
  tag(g, 'coffee_table', 'Coffee Table',
    'Ø0.6×0.4m',
    'Carrara marble + brushed steel',
    '~12tr VND');
  return g;
}

// ============================================================
// 7. reception_kiosk()
// ============================================================
export function reception_kiosk() {
  const g = new THREE.Group();
  const post = box(0.35, 1.1, 0.35, M.steel);
  post.position.y = 0.55;
  g.add(post);
  const screen = box(0.5, 0.35, 0.04, M.black);
  screen.position.set(0, 1.27, 0.05);
  screen.rotation.x = -0.32;
  g.add(screen);
  // emissive screen overlay
  const emiss = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.3),
    SCREEN_TEAL_MAT,
  );
  emiss.position.set(0, 1.275, 0.075);
  emiss.rotation.x = -0.32;
  g.add(emiss);
  // accent stripe at base
  const stripe = box(0.35, 0.02, 0.36, M.ledTeal);
  stripe.position.set(0, 0.02, 0);
  g.add(stripe);
  tag(g, 'reception_kiosk', 'Reception Kiosk',
    '0.35×0.35×1.45m',
    'Custom interactive touchscreen',
    '~45tr VND');
  return g;
}

// ============================================================
// 8. reception_counter()
// ============================================================
export function reception_counter() {
  const g = new THREE.Group();
  const len = 2.8, dep = 0.65, h = 1.05;
  const front = box(len, h, 0.05, M.steel);
  front.position.set(0, h / 2, dep / 2);
  g.add(front);
  const back = box(len, h, 0.05, M.steel);
  back.position.set(0, h / 2, -dep / 2);
  g.add(back);
  for (const x of [-len / 2, len / 2]) {
    const side = box(0.05, h, dep, M.steel);
    side.position.set(x, h / 2, 0);
    g.add(side);
  }
  const top = box(len + 0.06, 0.04, dep + 0.06, M.walnut);
  top.position.set(0, h + 0.02, 0);
  g.add(top);
  // LED strip dưới đáy mặt trước
  const led = box(len - 0.1, 0.02, 0.04, M.ledWarm);
  led.position.set(0, 0.04, dep / 2 + 0.025);
  g.add(led);
  // small kiosk on top
  const computer = box(0.4, 0.02, 0.25, M.black);
  computer.position.set(-0.7, h + 0.05, 0);
  g.add(computer);
  tag(g, 'reception_counter', 'Reception Counter',
    '2.8×0.65×1.05m',
    'Custom inox front + walnut top',
    '~55tr VND');
  return g;
}

// ============================================================
// 9. phone_booth()
// ============================================================
export function phone_booth() {
  const g = new THREE.Group();
  const w = 1.2, d = 1.2, h = 2.3, t = 0.06;
  const back = box(w, h, t, M.walnut);
  back.position.set(0, h / 2, -d / 2);
  g.add(back);
  for (const x of [-w / 2, w / 2]) {
    const side = box(t, h, d, M.walnut);
    side.position.set(x, h / 2, 0);
    g.add(side);
  }
  const front = box(w - 0.06, h - 0.12, 0.04, M.glassTeal);
  front.position.set(0, h / 2, d / 2);
  g.add(front);
  // top + bottom plates
  const top = box(w + 0.06, t, d + 0.06, M.walnutDark);
  top.position.set(0, h, 0);
  g.add(top);
  const bot = box(w + 0.06, 0.04, d + 0.06, M.steelDark);
  bot.position.set(0, 0.02, 0);
  g.add(bot);
  // ceiling lamp inside
  const lamp = sph(0.04, M.ledWarm);
  lamp.position.set(0, h - 0.1, 0);
  g.add(lamp);
  const lt = new THREE.PointLight(0xffe6b8, 0.4, 2.0, 2);
  lt.castShadow = false;
  lt.position.set(0, h - 0.18, 0);
  g.add(lt);
  // small interior bench
  const bench = box(w - 0.2, 0.05, 0.35, M.walnutDark);
  bench.position.set(0, 0.5, -d / 2 + 0.25);
  g.add(bench);
  tag(g, 'phone_booth', 'Phone Booth',
    '1.2×1.2×2.3m, soundproof',
    'Ref: Framery One',
    '~80tr VND');
  return g;
}

// ============================================================
// 10. plant(size)
// ============================================================
export function plant(size = 'sm') {
  const g = new THREE.Group();
  if (size === 'sm') {
    const pot = cyl(0.1, 0.18, M.potConcrete);
    pot.position.y = 0.09;
    g.add(pot);
    const leaf = sph(0.16, M.leafGreen);
    leaf.position.y = 0.32;
    g.add(leaf);
    const leaf2 = sph(0.11, M.leafGreenLight);
    leaf2.position.set(0.07, 0.36, 0.03);
    g.add(leaf2);
    tag(g, 'plant_sm', 'Small Plant',
      'Ø0.2×0.45m',
      'Concrete pot + ficus',
      '~1.5tr VND');
  } else {
    const pot = cyl(0.175, 0.4, M.potConcrete);
    pot.position.y = 0.2;
    g.add(pot);
    // top soil
    const soil = cyl(0.165, 0.02, M.charcoal);
    soil.position.y = 0.41;
    g.add(soil);
    const trunk = cyl(0.04, 1.0, M.trunkBrown);
    trunk.position.y = 0.92;
    trunk.rotation.z = 0.03;
    g.add(trunk);
    const c1 = sph(0.34, M.leafGreen);
    c1.position.y = 1.55;
    g.add(c1);
    const c2 = sph(0.28, M.leafGreenLight);
    c2.position.set(0.2, 1.7, 0.1);
    g.add(c2);
    const c3 = sph(0.25, M.leafGreen);
    c3.position.set(-0.18, 1.62, -0.1);
    g.add(c3);
    tag(g, 'plant_lg', 'Large Plant',
      'Ø0.35×1.85m',
      'Concrete pot + olive tree',
      '~5tr VND');
  }
  return g;
}

// ============================================================
// 11. monitor()
// ============================================================
export function monitor() {
  const g = new THREE.Group();
  const screen = box(0.55, 0.32, 0.025, M.black);
  screen.position.set(0, 0.4, 0);
  g.add(screen);
  const emiss = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.28),
    SCREEN_BLUE_MAT,
  );
  emiss.position.set(0, 0.4, 0.014);
  g.add(emiss);
  const arm = cyl(0.018, 0.25, M.steel);
  arm.position.y = 0.12;
  g.add(arm);
  const baseM = cyl(0.07, 0.02, M.steel);
  baseM.position.y = 0.01;
  g.add(baseM);
  tag(g, 'monitor', 'Monitor 27"',
    '0.6×0.4m + arm',
    'Ref: LG Ergo 4K',
    '~10tr VND');
  return g;
}

// ============================================================
// 12. display_wall()
// ============================================================
export function display_wall() {
  const g = new THREE.Group();
  const panel = box(0.8, 0.5, 0.04, M.black);
  g.add(panel);
  const emiss = new THREE.Mesh(
    new THREE.PlaneGeometry(0.74, 0.44),
    SCREEN_TEAL_DIM_MAT,
  );
  emiss.position.z = 0.022;
  g.add(emiss);
  for (let i = 0; i < 5; i++) {
    const bar = box(0.05 + i * 0.018, 0.04, 0.005, TEXT_LIGHT_MAT);
    bar.position.set(-0.25 + i * 0.1, 0.06, 0.025);
    g.add(bar);
  }
  // dot accents
  for (let i = 0; i < 3; i++) {
    const d = box(0.03, 0.03, 0.005, M.ledTeal);
    d.position.set(-0.25 + i * 0.13, -0.08, 0.025);
    g.add(d);
  }
  tag(g, 'display_wall', 'Display Wall',
    '0.8×0.5m',
    'Smart digital signage 4K',
    '~25tr VND');
  return g;
}

// ============================================================
// 13. art_wall(width, height)
// ============================================================
export function art_wall(width = 2.5, height = 3.0) {
  const g = new THREE.Group();
  // walnut perforated background
  const bg = box(width, height, 0.03, M.walnut);
  g.add(bg);
  // perforation dots — share material + geometry
  const dotGeo = new THREE.CircleGeometry(0.012, 6);
  for (let i = 0; i < 220; i++) {
    const dot = new THREE.Mesh(dotGeo, ART_PERF_MAT);
    dot.position.set(
      (Math.random() - 0.5) * width * 0.96,
      (Math.random() - 0.5) * height * 0.96,
      0.016,
    );
    g.add(dot);
  }
  const palette = ART_PALETTE;
  const used = [];
  for (let i = 0; i < 26; i++) {
    const sw = 0.18 + Math.random() * 0.45;
    const sh = 0.18 + Math.random() * 0.55;
    const x = (Math.random() - 0.5) * (width - sw - 0.1);
    const y = (Math.random() - 0.5) * (height - sh - 0.1);
    // try avoid overlap
    let ok = true;
    for (const [px, py, pw, ph] of used) {
      if (Math.abs(px - x) < (pw + sw) / 2 - 0.04 && Math.abs(py - y) < (ph + sh) / 2 - 0.04) { ok = false; break; }
    }
    if (!ok) continue;
    used.push([x, y, sw, sh]);
    const c = palette[Math.floor(Math.random() * palette.length)];
    const tile = box(sw, sh, 0.025, c);
    tile.position.set(x, y, 0.04);
    g.add(tile);
  }
  // a few triangles overlay (no clone — chia sẻ material)
  for (let i = 0; i < 6; i++) {
    const tri = new THREE.Mesh(
      new THREE.CircleGeometry(0.16 + Math.random() * 0.1, 3),
      palette[Math.floor(Math.random() * palette.length)],
    );
    tri.position.set(
      (Math.random() - 0.5) * (width - 0.4),
      (Math.random() - 0.5) * (height - 0.4),
      0.052,
    );
    tri.rotation.z = Math.random() * Math.PI * 2;
    g.add(tri);
  }
  tag(g, 'art_wall', 'Art Wall',
    `${width.toFixed(1)}×${height.toFixed(1)}m`,
    'Walnut perforated + geometric mosaic',
    `~${Math.round(width * height * 12)}tr VND`);
  return g;
}

// ============================================================
// 14. starlight_panel()
// ============================================================
// shared geometry for stars (90 stars × N panels = lots of geo without share)
const STAR_GEO = new THREE.SphereGeometry(0.012, 6, 4);
export function starlight_panel() {
  const g = new THREE.Group();
  const panel = box(2.0, 0.06, 2.0, STARLIGHT_PANEL_MAT);
  g.add(panel);
  const fr = 0.06;
  for (const [w, d, x, z] of [
    [2.0, fr, 0, 0.97], [2.0, fr, 0, -0.97],
    [fr, 2.0, 0.97, 0], [fr, 2.0, -0.97, 0],
  ]) {
    const b = box(w, 0.07, d, M.rail);
    b.position.set(x, 0, z);
    g.add(b);
  }
  for (let i = 0; i < 90; i++) {
    const s = new THREE.Mesh(STAR_GEO, STAR_MAT);
    s.position.set(
      (Math.random() - 0.5) * 1.85,
      -0.03,
      (Math.random() - 0.5) * 1.85,
    );
    g.add(s);
  }
  // không dùng PointLight — emissive đủ vibe, để render pipeline gọn
  tag(g, 'starlight_panel', 'Starlight Ceiling',
    '2.0×2.0m',
    'Custom LED constellation panel',
    '~35tr VND');
  return g;
}

// ============================================================
// 15. led_floor_strip(length, direction)
// ============================================================
export function led_floor_strip(length, direction = 'x') {
  const g = new THREE.Group();
  const w = direction === 'x' ? length : 0.025;
  const d = direction === 'x' ? 0.025 : length;
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.005, d),
    M.ledWarm,
  );
  g.add(strip);
  // soft glow underneath
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 0.08, d + 0.08),
    new THREE.MeshBasicMaterial({ color: 0xffe6b8, transparent: true, opacity: 0.18 }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.003;
  g.add(glow);
  g.userData.isFurniture = false; // không cần tooltip
  return g;
}

// ============================================================
// 16. track_light(length)
// ============================================================
// Chỉ 1 PointLight ở giữa rail (giảm light count). Bulb dùng emissive material.
export function track_light(length = 3) {
  const g = new THREE.Group();
  const rail = box(length, 0.04, 0.05, M.rail);
  g.add(rail);
  const n = Math.max(3, Math.round(length / 1.0));
  for (let i = 0; i < n; i++) {
    const x = -length / 2 + (length / (n + 1)) * (i + 1);
    const head = box(0.06, 0.06, 0.07, M.rail);
    head.position.set(x, -0.05, 0);
    g.add(head);
    const bulb = sph(0.025, BULB_TRACK_MAT);
    bulb.position.set(x, -0.085, 0);
    g.add(bulb);
  }
  // duy nhất 1 PointLight ở giữa rail, distance + decay tối ưu
  const lt = new THREE.PointLight(0xffd9a0, 0.45, 3.5, 2);
  lt.castShadow = false;
  lt.position.set(0, -0.2, 0);
  g.add(lt);
  return g;
}

// ============================================================
// 17. bookshelf()
// ============================================================
export function bookshelf() {
  const g = new THREE.Group();
  const w = 1.2, h = 1.8, d = 0.32;
  // 4 cột inox
  for (const x of [-w / 2 + 0.025, w / 2 - 0.025]) {
    for (const z of [-d / 2 + 0.025, d / 2 - 0.025]) {
      const post = box(0.04, h, 0.04, M.steel);
      post.position.set(x, h / 2, z);
      g.add(post);
    }
  }
  // 5 kệ walnut
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * h;
    const shelf = box(w - 0.04, 0.025, d - 0.02, M.walnut);
    shelf.position.set(0, y, 0);
    g.add(shelf);
  }
  for (let s = 0; s < 4; s++) {
    const yShelf = (s / 4) * h + 0.013;
    let xpos = -w / 2 + 0.06;
    while (xpos < w / 2 - 0.08) {
      const bw = 0.025 + Math.random() * 0.045;
      const bh = 0.20 + Math.random() * 0.07;
      const tilt = Math.random() < 0.05 ? 0.2 : 0;
      const bk = box(bw, bh, 0.21, BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)]);
      bk.position.set(xpos + bw / 2, yShelf + bh / 2, 0);
      bk.rotation.z = tilt;
      g.add(bk);
      xpos += bw + 0.004;
    }
    // accent object
    if (s === 1) {
      const obj = box(0.18, 0.12, 0.18, M.accentTeal);
      obj.position.set(w / 2 - 0.18, yShelf + 0.06, 0);
      g.add(obj);
    }
    if (s === 2) {
      const vase = cyl(0.05, 0.25, M.accentCoral);
      vase.position.set(-w / 2 + 0.18, yShelf + 0.13, 0);
      g.add(vase);
    }
  }
  tag(g, 'bookshelf', 'Bookshelf',
    '1.2×0.32×1.8m',
    'Inox frame + walnut shelves',
    '~22tr VND');
  return g;
}

// ============================================================
// 18. whiteboard()
// ============================================================
export function whiteboard() {
  const g = new THREE.Group();
  const board = box(1.5, 1.0, 0.025, M.whiteWarm);
  g.add(board);
  const ft = 0.045;
  for (const [w, h, x, y] of [
    [1.5 + ft * 2, ft, 0, 0.5 + ft / 2],
    [1.5 + ft * 2, ft, 0, -0.5 - ft / 2],
    [ft, 1.0, -0.75 - ft / 2, 0],
    [ft, 1.0, 0.75 + ft / 2, 0],
  ]) {
    const f = box(w, h, 0.035, M.steel);
    f.position.set(x, y, 0);
    g.add(f);
  }
  // marker tray
  const tray = box(0.5, 0.04, 0.06, M.steel);
  tray.position.set(0, -0.55, 0.04);
  g.add(tray);
  tag(g, 'whiteboard', 'Whiteboard',
    '1.5×1.0m',
    'Magnetic glass + inox frame',
    '~5tr VND');
  return g;
}

// ============================================================
// EXTRA: string lights for rooftop
// ============================================================
// Bóng chỉ dùng emissive (no PointLight). Vibe rooftop xử lý qua AmbientLight ở main.js.
const BULB_GEO = new THREE.SphereGeometry(0.025, 6, 4);
export function string_light(length = 4) {
  const g = new THREE.Group();
  const segs = Math.max(8, Math.round(length * 2));
  const points = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = -length / 2 + length * t;
    const sag = -0.25 * (1 - Math.pow(2 * t - 1, 2));
    points.push(new THREE.Vector3(x, sag, 0));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segs, 0.005, 4, false),
    M.rail,
  );
  g.add(tube);
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const p = curve.getPointAt(t);
    const b = new THREE.Mesh(BULB_GEO, BULB_WARM_MAT);
    b.position.copy(p);
    b.position.y -= 0.04;
    g.add(b);
  }
  return g;
}

// ============================================================
// EXTRA: small side table (for chair_shell + work)
// ============================================================
export function side_table() {
  const g = new THREE.Group();
  const top = box(0.5, 0.03, 0.4, M.walnut);
  top.position.y = 0.55;
  g.add(top);
  for (const [dx, dz] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) {
    const leg = cyl(0.018, 0.55, M.steel);
    leg.position.set(dx, 0.275, dz);
    g.add(leg);
  }
  tag(g, 'side_table', 'Side Table',
    '0.5×0.4×0.55m',
    'Walnut top + steel legs',
    '~6tr VND');
  return g;
}

// ============================================================
// EXTRA: pantry counter for floor 4
// ============================================================
export function pantry() {
  const g = new THREE.Group();
  const len = 1.6, dep = 0.55, h = 0.9;
  // base cabinet
  const cab = box(len, h, dep, M.walnut);
  cab.position.set(0, h / 2, 0);
  g.add(cab);
  const top = box(len + 0.05, 0.04, dep + 0.05, M.marble);
  top.position.set(0, h + 0.02, 0);
  g.add(top);
  // upper shelf
  for (let i = 0; i < 2; i++) {
    const sh = box(len, 0.025, 0.3, M.walnut);
    sh.position.set(0, h + 0.6 + i * 0.4, -0.1);
    g.add(sh);
  }
  // backsplash walnut perforated
  const back = box(len, 0.95, 0.02, M.walnutDark);
  back.position.set(0, h + 0.5, -dep / 2 - 0.01);
  g.add(back);
  // sink hint
  const sink = box(0.4, 0.02, 0.3, M.steelDark);
  sink.position.set(-0.4, h + 0.045, 0);
  g.add(sink);
  // faucet
  const faucet = cyl(0.015, 0.25, M.steel);
  faucet.position.set(-0.4, h + 0.16, -0.1);
  g.add(faucet);
  // small accent items on counter
  const cup = cyl(0.04, 0.08, M.accentCoral);
  cup.position.set(0.4, h + 0.08, 0);
  g.add(cup);
  tag(g, 'pantry', 'Pantry Corner',
    '1.6×0.55×1.85m',
    'Walnut cabinet + marble top',
    '~35tr VND');
  return g;
}

// ============================================================
// 19. meeting_table(seats)
// ============================================================
export function meeting_table(seats = 6) {
  const g = new THREE.Group();
  const w = seats >= 8 ? 2.8 : 2.4;
  const d = seats >= 8 ? 1.2 : 1.1;
  const top = box(w, 0.04, d, M.walnut);
  top.position.y = 0.74;
  g.add(top);
  // central pedestal
  const ped = cyl(0.07, 0.7, M.steel);
  ped.position.y = 0.35;
  g.add(ped);
  // base star
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    const arm = box(0.42, 0.05, 0.08, M.steel);
    arm.position.set(Math.cos(a) * 0.21, 0.025, Math.sin(a) * 0.21);
    arm.rotation.y = -a;
    g.add(arm);
  }
  // 2 nd pedestal cho bàn 8 chỗ
  if (seats >= 8) {
    const ped2 = cyl(0.07, 0.7, M.steel);
    ped2.position.set(w / 4, 0.35, 0);
    g.add(ped2);
    const ped3 = cyl(0.07, 0.7, M.steel);
    ped3.position.set(-w / 4, 0.35, 0);
    g.add(ped3);
  }
  // power port giữa bàn
  const port = box(0.18, 0.025, 0.06, M.black);
  port.position.set(0, 0.765, 0);
  g.add(port);
  tag(g, 'meeting_table', `Meeting Table ${seats}p`,
    `${w}×${d}×0.74m`,
    'Custom walnut + central inox',
    seats >= 8 ? '~18tr VND' : '~14tr VND');
  return g;
}

// ============================================================
// 20. glass_partition(width, height)
// ============================================================
const PART_GLASS_MAT = new THREE.MeshPhongMaterial({
  color: 0xA8D5C2, transparent: true, opacity: 0.12,
  shininess: 110, specular: 0xffffff, side: THREE.DoubleSide,
});
const PART_FRAME_MAT = new THREE.MeshPhongMaterial({ color: 0x1a1d22, shininess: 60 });
export function glass_partition(width = 4, height = 2.7) {
  const g = new THREE.Group();
  const ft = 0.06;
  const gap = 0.9;
  const sideW = (width - gap) / 2;
  for (const side of [-1, 1]) {
    const cx = side * (gap / 2 + sideW / 2);
    const gl = box(sideW - ft, height - ft * 2, 0.04, PART_GLASS_MAT);
    gl.position.set(cx, height / 2, 0);
    g.add(gl);
  }
  // top + bottom frame
  const topF = box(width, ft, 0.08, PART_FRAME_MAT);
  topF.position.set(0, height - ft / 2, 0);
  g.add(topF);
  const botF = box(width, ft, 0.08, PART_FRAME_MAT);
  botF.position.set(0, ft / 2, 0);
  g.add(botF);
  // mullion ở 4 vị trí
  for (const x of [-width / 2, -gap / 2, gap / 2, width / 2]) {
    const mu = box(ft, height, 0.08, PART_FRAME_MAT);
    mu.position.set(x, height / 2, 0);
    g.add(mu);
  }
  // sliding door (hé mở)
  const slider = box(gap * 0.7, height - ft * 2, 0.04, PART_GLASS_MAT);
  slider.position.set(0, height / 2, 0.03);
  g.add(slider);
  tag(g, 'glass_partition', 'Vách kính cách âm',
    `${width.toFixed(1)}×${height.toFixed(1)}m, gap 0.9m`,
    'Khung inox đen + kính cường lực 10mm',
    `~${Math.round(width * 4)}tr VND`);
  return g;
}

// ============================================================
// 21. display_case(width)
// ============================================================
export function display_case(width = 2.0) {
  const g = new THREE.Group();
  const d = 0.4, h = 2.0;
  const ft = 0.04;
  for (const x of [-width / 2, width / 2]) {
    for (const z of [-d / 2, d / 2]) {
      const post = box(ft, h, ft, M.steel);
      post.position.set(x, h / 2, z);
      g.add(post);
    }
  }
  for (let i = 1; i <= 3; i++) {
    const y = h * (i / 4);
    const sh = box(width - ft, 0.02, d - ft, PART_GLASS_MAT);
    sh.position.set(0, y, 0);
    g.add(sh);
  }
  const top = box(width, ft, d, M.walnut);
  top.position.set(0, h - ft / 2, 0);
  g.add(top);
  const base = box(width, 0.06, d, M.walnut);
  base.position.set(0, 0.03, 0);
  g.add(base);
  const back = box(width, h - ft * 2, ft, M.walnut);
  back.position.set(0, h / 2, -d / 2 + ft / 2);
  g.add(back);
  // LED ấm trong kệ
  for (let i = 1; i <= 3; i++) {
    const y = h * (i / 4) + 0.018;
    const led = box(width - 0.15, 0.005, 0.02, M.ledWarm);
    led.position.set(0, y, -d / 2 + 0.06);
    g.add(led);
  }
  // sample displayed objects
  const d1 = box(0.18, 0.18, 0.18, M.accentTeal);
  d1.position.set(-width / 4, h * 0.27, 0);
  g.add(d1);
  const d2 = cyl(0.08, 0.22, M.accentCoral);
  d2.position.set(width / 4, h * 0.52, 0);
  g.add(d2);
  const d3 = box(0.25, 0.06, 0.12, M.accentBeige);
  d3.position.set(0, h * 0.77, 0);
  g.add(d3);
  tag(g, 'display_case', 'Tủ kính trưng bày',
    `${width.toFixed(1)}×0.4×2.0m`,
    'Inox frame + tempered glass + LED',
    `~${Math.round(width * 10)}tr VND`);
  return g;
}

// ============================================================
// 22. projector_screen() + projector_box()
// ============================================================
export function projector_screen() {
  const g = new THREE.Group();
  const screen = box(2.4, 1.5, 0.02, M.whiteWarm);
  screen.position.set(0, -0.75, 0);
  g.add(screen);
  // top housing
  const housing = box(2.5, 0.1, 0.1, M.steelDark);
  housing.position.set(0, 0.05, 0);
  g.add(housing);
  for (const x of [-1.05, 1.05]) {
    const mt = box(0.06, 0.1, 0.08, M.steelDark);
    mt.position.set(x, 0.04, -0.06);
    g.add(mt);
  }
  tag(g, 'projector_screen', 'Màn chiếu 2.4×1.5m',
    'Motorized roll-down',
    'Da-Lite Tensioned Pro motorized',
    '~12tr VND');
  return g;
}
export function projector_box() {
  const g = new THREE.Group();
  const body = box(0.36, 0.12, 0.26, M.black);
  body.position.set(0, -0.06, 0);
  g.add(body);
  const lens = cyl(0.045, 0.05, M.steelDark);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.06, 0.15);
  g.add(lens);
  const arm = cyl(0.022, 0.18, M.steel);
  arm.position.set(0, 0.09, 0);
  g.add(arm);
  const ceil = box(0.12, 0.025, 0.12, M.steelDark);
  ceil.position.set(0, 0.19, 0);
  g.add(ceil);
  tag(g, 'projector_box', 'Projector 4K',
    '0.36×0.26×0.12m',
    'Sony VPL-FHZ80 (4K Laser)',
    '~70tr VND');
  return g;
}

// ============================================================
// 23. stackable_chair() — 1 chair (stack arrangement do layout xử lý)
// ============================================================
export function stackable_chair() {
  const g = new THREE.Group();
  const seat = box(0.45, 0.04, 0.45, M.charcoalDeep);
  seat.position.y = 0.45;
  g.add(seat);
  const back = box(0.42, 0.5, 0.04, M.charcoalDeep);
  back.position.set(0, 0.71, -0.2);
  g.add(back);
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    const leg = cyl(0.02, 0.45, M.steel);
    leg.position.set(dx, 0.225, dz);
    g.add(leg);
  }
  tag(g, 'stackable_chair', 'Ghế xếp',
    '0.45×0.45×0.95m',
    'Inox frame + charcoal seat',
    '~1.8tr VND');
  return g;
}

// ============================================================
// 24. bench_desk(length, seats) — single row, depth 0.75m
// ============================================================
export function bench_desk(length = 4.8, seats = 4) {
  const g = new THREE.Group();
  const slotW = length / seats;
  const dep = 0.75;
  const top = box(length, 0.04, dep, M.walnut);
  top.position.y = 0.74;
  g.add(top);
  // screen between slots
  for (let i = 1; i < seats; i++) {
    const x = -length / 2 + i * slotW;
    const screen = box(0.04, 0.42, dep - 0.08, M.charcoalDeep);
    screen.position.set(x, 0.95, 0);
    g.add(screen);
  }
  // back modesty panel
  const back = box(length - 0.1, 0.42, 0.04, M.charcoalDeep);
  back.position.set(0, 0.95, -dep / 2 + 0.05);
  g.add(back);
  // legs (2 sets at ends + intermediate)
  const legXs = [-length / 2 + 0.1, length / 2 - 0.1];
  for (let x = -length / 2 + slotW; x < length / 2; x += slotW) legXs.push(x);
  for (const x of legXs) {
    for (const z of [-dep / 2 + 0.05, dep / 2 - 0.05]) {
      const leg = box(0.05, 0.72, 0.05, M.steel);
      leg.position.set(x, 0.36, z);
      g.add(leg);
    }
  }
  // power rail
  const rail = box(length - 0.3, 0.03, 0.08, M.black);
  rail.position.set(0, 0.76, 0);
  g.add(rail);
  // LED indicators per slot
  for (let i = 0; i < seats; i++) {
    const x = -length / 2 + slotW * (i + 0.5);
    const led = sph(0.012, M.ledTeal);
    led.position.set(x, 0.775, 0);
    g.add(led);
  }
  // Monitor arms (post + small mount) per slot
  for (let i = 0; i < seats; i++) {
    const x = -length / 2 + slotW * (i + 0.5);
    const post = cyl(0.02, 0.5, M.steel);
    post.position.set(x, 1.0, -dep / 2 + 0.1);
    g.add(post);
  }
  tag(g, 'bench_desk', `Bench desk ${seats} chỗ`,
    `${length.toFixed(1)}×${dep}×0.74m`,
    'Walnut + inox + screen dividers',
    `~${Math.round(length * 5 + seats * 2)}tr VND`);
  return g;
}

// ============================================================
// 25. tv_large(inches)
// ============================================================
export function tv_large(inches = 55) {
  const g = new THREE.Group();
  const w = inches >= 65 ? 1.45 : 1.22;
  const h = inches >= 65 ? 0.83 : 0.7;
  const bezel = box(w, h, 0.05, M.black);
  g.add(bezel);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.04, h - 0.04),
    SCREEN_BLUE_MAT,
  );
  screen.position.z = 0.026;
  g.add(screen);
  // wall mount bracket (back)
  const mount = box(0.22, 0.22, 0.06, M.steelDark);
  mount.position.z = -0.05;
  g.add(mount);
  // bottom logo / brand strip
  const logo = box(0.06, 0.012, 0.005, M.steel);
  logo.position.set(0, -h / 2 + 0.025, 0.03);
  g.add(logo);
  tag(g, 'tv_large', `TV ${inches}"`,
    `${w}×${h}m`,
    inches >= 65 ? 'LG OLED 65" Commercial' : 'Samsung 55" 4K Commercial',
    inches >= 65 ? '~25tr VND' : '~18tr VND');
  return g;
}

// ============================================================
// 26. robot_zone_marker(width, depth)
// ============================================================
const ROBOT_WARN_MAT = new THREE.MeshBasicMaterial({ color: 0xffaa30 });
const ROBOT_WARN_DARK_MAT = new THREE.MeshBasicMaterial({ color: 0x1a1410 });
const ROBOT_FLOOR_MAT = new THREE.MeshPhongMaterial({
  color: 0x2a2a2a, shininess: 6, emissive: 0x3a2810, emissiveIntensity: 0.8,
});
export function robot_zone_marker(width = 5, depth = 5) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ROBOT_FLOOR_MAT);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.004;
  g.add(floor);
  // 4 LED border strips
  const stripT = 0.04, stripH = 0.012;
  for (const [bw, bd, bx, bz] of [
    [width, stripT, 0, depth / 2],
    [width, stripT, 0, -depth / 2],
    [stripT, depth, width / 2, 0],
    [stripT, depth, -width / 2, 0],
  ]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(bw, stripH, bd), ROBOT_WARN_MAT);
    strip.position.set(bx, stripH / 2 + 0.005, bz);
    g.add(strip);
  }
  // diagonal warning hatches at 4 corners
  for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const cornerX = cx * (width / 2 - 0.4);
    const cornerZ = cz * (depth / 2 - 0.4);
    for (let i = 0; i < 5; i++) {
      const hatch = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.006, 0.05),
        i % 2 === 0 ? ROBOT_WARN_MAT : ROBOT_WARN_DARK_MAT,
      );
      hatch.rotation.y = Math.PI / 4 * cx * cz;
      hatch.position.set(cornerX + i * 0.06 * -cx, 0.011, cornerZ + i * 0.06 * -cz);
      g.add(hatch);
    }
  }
  tag(g, 'robot_zone_marker', 'Robot Test Zone',
    `${width}×${depth}m`,
    'LED safety border + warning hatches',
    `~${width * depth | 0}tr VND`);
  return g;
}

// ============================================================
// 27. server_rack()
// ============================================================
const RACK_LED_GREEN = new THREE.MeshBasicMaterial({ color: 0x40e060 });
const RACK_LED_RED = new THREE.MeshBasicMaterial({ color: 0xe04040 });
export function server_rack() {
  const g = new THREE.Group();
  const w = 0.6, d = 0.8, h = 1.8;
  const body = box(w, h, d, M.black);
  body.position.y = h / 2;
  g.add(body);
  // 18 server bays with LEDs
  for (let i = 0; i < 18; i++) {
    const y = 0.08 + i * 0.092;
    const bay = box(w - 0.06, 0.07, 0.02, M.steelDark);
    bay.position.set(0, y, d / 2 + 0.005);
    g.add(bay);
    const isGreen = Math.random() > 0.18;
    const led = box(0.025, 0.012, 0.008, isGreen ? RACK_LED_GREEN : RACK_LED_RED);
    led.position.set(-w / 2 + 0.06, y, d / 2 + 0.018);
    g.add(led);
    if (isGreen) {
      const led2 = box(0.025, 0.012, 0.008, RACK_LED_GREEN);
      led2.position.set(-w / 2 + 0.10, y, d / 2 + 0.018);
      g.add(led2);
    }
  }
  // top vent
  const vent = box(w - 0.08, 0.04, d - 0.08, M.steelDark);
  vent.position.set(0, h - 0.02, 0);
  g.add(vent);
  // base
  const base = box(w + 0.04, 0.04, d + 0.04, M.steelDark);
  base.position.set(0, 0.02, 0);
  g.add(base);
  tag(g, 'server_rack', 'Server Rack 42U',
    '0.6×0.8×1.8m',
    'Dell PowerEdge / Cisco UCS',
    '~50tr VND');
  return g;
}

// ============================================================
// 28. capsule_bed(stack)
// ============================================================
const CAPSULE_CURTAIN_MAT = new THREE.MeshPhongMaterial({ color: 0x2a2825, shininess: 4 });
export function capsule_bed(stack = 2) {
  const g = new THREE.Group();
  const w = 1.0, d = 2.1, capH = 1.0;
  const totalH = stack * capH;
  // outer frame structure
  for (const [bx, bz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const post = box(0.04, totalH, 0.04, M.steel);
    post.position.set(bx * (w / 2 - 0.02), totalH / 2, bz * (d / 2 - 0.02));
    g.add(post);
  }
  // back wall + side walls (open front)
  const backWall = box(w, totalH, 0.04, M.steelDark);
  backWall.position.set(0, totalH / 2, -d / 2);
  g.add(backWall);
  for (const sx of [-1, 1]) {
    const sideWall = box(0.04, totalH, d, M.steelDark);
    sideWall.position.set(sx * (w / 2), totalH / 2, 0);
    g.add(sideWall);
  }
  // each capsule
  for (let i = 0; i < stack; i++) {
    const yBase = i * capH;
    // floor of capsule (mattress base)
    const matBase = box(w - 0.04, 0.05, d - 0.04, M.steelDark);
    matBase.position.set(0, yBase + 0.05, 0);
    g.add(matBase);
    // mattress
    const mat = box(w - 0.1, 0.14, d - 0.18, M.charcoalDeep);
    mat.position.set(0, yBase + 0.18, 0);
    g.add(mat);
    // pillow
    const pillow = box(0.55, 0.08, 0.32, M.whiteWarm);
    pillow.position.set(0, yBase + 0.29, -d / 2 + 0.25);
    g.add(pillow);
    // curtain
    const curtain = box(w - 0.04, capH - 0.1, 0.02, CAPSULE_CURTAIN_MAT);
    curtain.position.set(0, yBase + capH / 2, d / 2 - 0.04);
    g.add(curtain);
    // reading lamp
    const lamp = sph(0.025, M.ledWarm);
    lamp.position.set(w / 2 - 0.08, yBase + capH - 0.18, d / 2 - 0.5);
    g.add(lamp);
  }
  // top deck
  const topD = box(w + 0.02, 0.04, d + 0.02, M.steel);
  topD.position.set(0, totalH + 0.02, 0);
  g.add(topD);
  tag(g, 'capsule_bed', `Capsule bed ${stack}-tier`,
    `${w}×${d}×${totalH.toFixed(1)}m`,
    'Inox frame + memory foam + curtain',
    `~${stack * 6}tr VND/bộ`);
  return g;
}

// ============================================================
// 29. pool_table()
// ============================================================
const POOL_FELT = new THREE.MeshPhongMaterial({ color: 0x2D5A3D, shininess: 4 });
const POOL_BALL_MATS = [
  new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0xe8a420, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0x1855a0, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0xc02020, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0x8a3aa0, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0xe87020, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0x1a8a3a, shininess: 80 }),
  new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 80 }),
];
export function pool_table() {
  const g = new THREE.Group();
  const w = 2.74, d = 1.52, h = 0.8;
  // body frame underneath felt
  const frame = box(w, 0.18, d, M.walnut);
  frame.position.y = h - 0.13;
  g.add(frame);
  // felt top
  const felt = box(w - 0.08, 0.03, d - 0.08, POOL_FELT);
  felt.position.y = h - 0.018;
  g.add(felt);
  // wooden rails (raised)
  const railH = 0.06;
  for (const xs of [-1, 1]) {
    const rail = box(0.08, railH, d, M.walnut);
    rail.position.set(xs * (w / 2 - 0.04), h + railH / 2 - 0.005, 0);
    g.add(rail);
  }
  for (const zs of [-1, 1]) {
    const rail = box(w, railH, 0.08, M.walnut);
    rail.position.set(0, h + railH / 2 - 0.005, zs * (d / 2 - 0.04));
    g.add(rail);
  }
  // 4 thick walnut legs
  for (const xs of [-1, 1]) {
    for (const zs of [-1, 1]) {
      const leg = box(0.18, h - 0.18, 0.18, M.walnut);
      leg.position.set(xs * (w / 2 - 0.2), (h - 0.18) / 2, zs * (d / 2 - 0.2));
      g.add(leg);
    }
  }
  // 6 pockets
  const pockets = [
    [-w / 2 + 0.06, -d / 2 + 0.06], [w / 2 - 0.06, -d / 2 + 0.06],
    [-w / 2 + 0.06, d / 2 - 0.06], [w / 2 - 0.06, d / 2 - 0.06],
    [0, -d / 2 + 0.04], [0, d / 2 - 0.04],
  ];
  for (const [px, pz] of pockets) {
    const p = cyl(0.07, 0.03, M.black);
    p.position.set(px, h - 0.005, pz);
    g.add(p);
  }
  // ball triangle rack
  const ballR = 0.028;
  const cx = w / 4;
  let idx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const ball = sph(ballR, POOL_BALL_MATS[idx % POOL_BALL_MATS.length]);
      ball.position.set(cx + row * ballR * 1.78, h + ballR + 0.005, (col - row / 2) * ballR * 2.05);
      g.add(ball);
      idx++;
    }
  }
  // cue ball
  const cue = sph(ballR, POOL_BALL_MATS[0]);
  cue.position.set(-w / 4, h + ballR + 0.005, 0);
  g.add(cue);
  tag(g, 'pool_table', 'Bàn bida 8-ball',
    '2.74×1.52×0.8m',
    'Brunswick Gold Crown VI',
    '~35tr VND');
  return g;
}

// ============================================================
// 30. kitchen_counter(length)
// ============================================================
export function kitchen_counter(length = 3) {
  const g = new THREE.Group();
  const dep = 0.6, h = 0.9;
  const cab = box(length, h, dep, M.walnut);
  cab.position.set(0, h / 2, 0);
  g.add(cab);
  const top = box(length + 0.04, 0.04, dep + 0.04, M.marble);
  top.position.set(0, h + 0.02, 0);
  g.add(top);
  // sink (left)
  const sink = box(0.6, 0.025, 0.4, M.steelDark);
  sink.position.set(-length / 4, h + 0.045, 0);
  g.add(sink);
  const faucet = cyl(0.018, 0.3, M.steel);
  faucet.position.set(-length / 4, h + 0.18, -dep / 4);
  g.add(faucet);
  // cabinet handles
  for (let i = -1; i <= 1; i++) {
    const handle = box(0.18, 0.025, 0.025, M.steelDark);
    handle.position.set(i * length / 4, h - 0.2, dep / 2 + 0.013);
    g.add(handle);
  }
  // upper open shelves
  for (let i = 0; i < 2; i++) {
    const sh = box(length, 0.025, 0.3, M.walnut);
    sh.position.set(0, h + 0.6 + i * 0.4, -dep / 2 + 0.15);
    g.add(sh);
  }
  // back splash
  const back = box(length, 1.0, 0.02, M.walnutDark);
  back.position.set(0, h + 0.5, -dep / 2 - 0.01);
  g.add(back);
  // stove (right)
  for (let i = 0; i < 4; i++) {
    const bx = length / 4 + ((i % 2) * 0.2 - 0.1);
    const bz = (i < 2 ? -0.1 : 0.1);
    const burner = cyl(0.075, 0.012, M.black);
    burner.position.set(bx, h + 0.05, bz);
    g.add(burner);
  }
  // microwave
  const mw = box(0.5, 0.32, 0.4, M.steelDark);
  mw.position.set(length / 4 - 0.3, h + 0.18, -dep / 4 - 0.05);
  g.add(mw);
  // accent
  const cup = cyl(0.04, 0.08, M.accentCoral);
  cup.position.set(0, h + 0.085, 0.15);
  g.add(cup);
  const pot = cyl(0.06, 0.1, M.steelDark);
  pot.position.set(length / 4 - 0.5, h + 0.105, 0.15);
  g.add(pot);
  tag(g, 'kitchen_counter', `Pantry counter ${length}m`,
    `${length}×0.6×0.9m`,
    'Walnut cabinet + marble + inox sink',
    `~${Math.round(length * 8)}tr VND`);
  return g;
}

// ============================================================
// 31. bar_stool()
// ============================================================
export function bar_stool() {
  const g = new THREE.Group();
  const seat = cyl(0.18, 0.06, M.charcoalDeep);
  seat.position.y = 0.72;
  g.add(seat);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const leg = cyl(0.018, 0.7, M.steel);
    leg.position.set(Math.cos(a) * 0.13, 0.35, Math.sin(a) * 0.13);
    g.add(leg);
  }
  // foot ring
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const a2 = (i + 1) * Math.PI / 2 + Math.PI / 4;
    const cx = (Math.cos(a) + Math.cos(a2)) / 2 * 0.13;
    const cz = (Math.sin(a) + Math.sin(a2)) / 2 * 0.13;
    const len = Math.hypot(Math.cos(a2) * 0.13 - Math.cos(a) * 0.13, Math.sin(a2) * 0.13 - Math.sin(a) * 0.13);
    const ring = box(len, 0.012, 0.012, M.steel);
    ring.position.set(cx, 0.22, cz);
    ring.rotation.y = -((a + a2) / 2 - Math.PI / 2);
    g.add(ring);
  }
  // small backrest
  const back = box(0.32, 0.14, 0.04, M.charcoalDeep);
  back.position.set(0, 0.85, -0.16);
  g.add(back);
  tag(g, 'bar_stool', 'Bar stool',
    'Ø0.4×0.95m',
    'Inox frame + charcoal cushion',
    '~3tr VND');
  return g;
}

// ============================================================
// 32. dining_table(seats)
// ============================================================
export function dining_table(seats = 4) {
  const g = new THREE.Group();
  const w = seats >= 6 ? 1.6 : 1.2;
  const d = seats >= 6 ? 0.9 : 0.8;
  const top = box(w, 0.04, d, M.walnut);
  top.position.y = 0.74;
  g.add(top);
  for (const xs of [-1, 1]) {
    for (const zs of [-1, 1]) {
      const leg = cyl(0.025, 0.72, M.steel);
      leg.position.set(xs * (w / 2 - 0.1), 0.36, zs * (d / 2 - 0.1));
      g.add(leg);
    }
  }
  // cross stretcher
  const stretchX = box(w - 0.2, 0.04, 0.04, M.steel);
  stretchX.position.y = 0.15;
  g.add(stretchX);
  tag(g, 'dining_table', `Dining table ${seats}p`,
    `${w}×${d}×0.74m`,
    'Solid oak + brushed steel',
    seats >= 6 ? '~12tr VND' : '~8tr VND');
  return g;
}

// ============================================================
// 33. locker_unit(slots)
// ============================================================
export function locker_unit(slots = 8) {
  const g = new THREE.Group();
  const cols = 2, rows = slots / cols;
  const w = 1.2, d = 0.4, h = 1.8;
  const slotW = w / cols, slotH = h / rows;
  const frame = box(w, h, d, M.steel);
  frame.position.y = h / 2;
  g.add(frame);
  // horizontal dividers
  for (let r = 1; r < rows; r++) {
    const div = box(w - 0.04, 0.02, d - 0.04, M.steelDark);
    div.position.set(0, r * slotH, 0);
    g.add(div);
  }
  // vertical dividers
  for (let c = 1; c < cols; c++) {
    const div = box(0.02, h - 0.04, d - 0.04, M.steelDark);
    div.position.set(-w / 2 + c * slotW, h / 2, 0);
    g.add(div);
  }
  // handles + numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -w / 2 + slotW * (c + 0.5);
      const cy = slotH * (r + 0.5);
      const handle = box(0.05, 0.06, 0.025, M.steelDark);
      handle.position.set(cx, cy, d / 2 + 0.013);
      g.add(handle);
      const plate = box(0.12, 0.05, 0.005, M.charcoalDeep);
      plate.position.set(cx, cy + 0.18, d / 2 + 0.022);
      g.add(plate);
    }
  }
  tag(g, 'locker_unit', `Locker ${slots} ô`,
    `${w}×${d}×${h}m`,
    'Inox brushed + safety lock',
    `~${Math.round(slots * 1.8)}tr VND`);
  return g;
}

// ============================================================
// 34. partition_curtain(width)
// ============================================================
const CURTAIN_MAT = new THREE.MeshPhongMaterial({ color: 0x2a2825, shininess: 4 });
export function partition_curtain(width = 2) {
  const g = new THREE.Group();
  const h = 2.4;
  const track = box(width, 0.04, 0.05, M.steelDark);
  track.position.set(0, h, 0);
  g.add(track);
  // segmented panels with slight wave
  const segs = Math.max(5, Math.round(width * 2.5));
  const segW = width / segs;
  for (let i = 0; i < segs; i++) {
    const x = -width / 2 + segW * (i + 0.5);
    const ph = h - 0.05;
    const panel = box(segW * 0.95, ph, 0.025, CURTAIN_MAT);
    const offsetZ = (i % 2 === 0 ? 0.025 : -0.025);
    panel.position.set(x, ph / 2, offsetZ);
    g.add(panel);
  }
  tag(g, 'partition_curtain', 'Rèm ngăn',
    `${width}m wide`,
    'Charcoal acoustic curtain',
    `~${Math.round(width * 1.5)}tr VND`);
  return g;
}

// ============================================================
// EXTRA: Unitree G1 humanoid + Go2 quadruped (cho T4 lab)
// ============================================================
const ROBOT_WHITE = new THREE.MeshPhongMaterial({ color: 0xe8eaef, shininess: 60 });
const ROBOT_BLUE = new THREE.MeshPhongMaterial({ color: 0x2a4a7a, shininess: 50 });
const ROBOT_BLACK = new THREE.MeshPhongMaterial({ color: 0x1a1816, shininess: 70 });
const ROBOT_YELLOW = new THREE.MeshPhongMaterial({ color: 0xe8a020, shininess: 50 });
const ROBOT_GLASS = new THREE.MeshPhongMaterial({ color: 0x2a2825, transparent: true, opacity: 0.6, shininess: 110 });

export function unitree_g1() {
  const g = new THREE.Group();
  // torso
  const torso = box(0.32, 0.45, 0.22, ROBOT_WHITE);
  torso.position.y = 0.95;
  g.add(torso);
  const torsoAcc = box(0.34, 0.12, 0.23, ROBOT_BLUE);
  torsoAcc.position.y = 1.12;
  g.add(torsoAcc);
  // head
  const head = box(0.24, 0.18, 0.2, ROBOT_BLACK);
  head.position.y = 1.32;
  g.add(head);
  const visor = box(0.22, 0.06, 0.005, ROBOT_GLASS);
  visor.position.set(0, 1.34, 0.103);
  g.add(visor);
  // arms — upper + forearm
  for (const sx of [-1, 1]) {
    const shoulder = sph(0.05, ROBOT_BLUE);
    shoulder.position.set(sx * 0.2, 1.16, 0);
    g.add(shoulder);
    const upper = box(0.07, 0.26, 0.07, ROBOT_WHITE);
    upper.position.set(sx * 0.2, 1.0, 0);
    g.add(upper);
    const elbow = sph(0.04, ROBOT_BLACK);
    elbow.position.set(sx * 0.2, 0.86, 0);
    g.add(elbow);
    const forearm = box(0.06, 0.24, 0.06, ROBOT_WHITE);
    forearm.position.set(sx * 0.2, 0.72, 0.04);
    g.add(forearm);
    const hand = box(0.08, 0.08, 0.05, ROBOT_BLACK);
    hand.position.set(sx * 0.2, 0.59, 0.04);
    g.add(hand);
  }
  // hips + legs
  for (const sx of [-1, 1]) {
    const hip = sph(0.06, ROBOT_BLUE);
    hip.position.set(sx * 0.08, 0.7, 0);
    g.add(hip);
    const thigh = box(0.1, 0.34, 0.1, ROBOT_WHITE);
    thigh.position.set(sx * 0.08, 0.52, 0);
    g.add(thigh);
    const knee = sph(0.05, ROBOT_BLACK);
    knee.position.set(sx * 0.08, 0.34, 0);
    g.add(knee);
    const calf = box(0.09, 0.32, 0.09, ROBOT_WHITE);
    calf.position.set(sx * 0.08, 0.18, 0);
    g.add(calf);
    const foot = box(0.12, 0.04, 0.18, ROBOT_BLACK);
    foot.position.set(sx * 0.08, 0.02, 0.02);
    g.add(foot);
  }
  tag(g, 'unitree_g1', 'Unitree G1',
    '0.5×0.3×1.32m, 35kg',
    'Humanoid robot · Unitree Robotics',
    '~150tr VND');
  return g;
}

export function unitree_go2() {
  const g = new THREE.Group();
  // body
  const body = box(0.5, 0.18, 0.26, ROBOT_BLACK);
  body.position.y = 0.32;
  g.add(body);
  const stripe = box(0.46, 0.04, 0.27, ROBOT_YELLOW);
  stripe.position.y = 0.32;
  g.add(stripe);
  // head
  const head = box(0.18, 0.12, 0.16, ROBOT_BLACK);
  head.position.set(0, 0.34, 0.21);
  g.add(head);
  const sensor = sph(0.04, ROBOT_GLASS);
  sensor.position.set(0, 0.36, 0.3);
  g.add(sensor);
  // 4 legs (each = upper + lower)
  for (const xs of [-1, 1]) {
    for (const zs of [-1, 1]) {
      const upper = box(0.05, 0.16, 0.06, ROBOT_BLACK);
      upper.position.set(xs * 0.22, 0.22, zs * 0.1);
      g.add(upper);
      const knee = sph(0.04, ROBOT_YELLOW);
      knee.position.set(xs * 0.22, 0.14, zs * 0.1);
      g.add(knee);
      const lower = box(0.04, 0.14, 0.04, ROBOT_BLACK);
      lower.position.set(xs * 0.22, 0.07, zs * 0.1);
      g.add(lower);
      const foot = sph(0.025, ROBOT_BLACK);
      foot.position.set(xs * 0.22, 0.025, zs * 0.1);
      g.add(foot);
    }
  }
  // tail antenna
  const ant = cyl(0.005, 0.1, M.steel);
  ant.position.set(0, 0.43, -0.18);
  g.add(ant);
  tag(g, 'unitree_go2', 'Unitree Go2',
    '0.7×0.31×0.4m, 15kg',
    'Quadruped robot · Unitree Robotics',
    '~50tr VND');
  return g;
}
