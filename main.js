import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as F from './furniture.js';
import { M } from './furniture.js';

// ============================================================
// CONSTANTS — kích thước thực theo bản vẽ KT-00 (đơn vị: mét)
// ============================================================
const W = 10, D = 14;
const LEVELS = { T1: 0.0, T2: 3.8, T3: 7.2, T4: 10.6, T5: 14.0, ROOF: 17.4, TUM: 18.5 };
const FLOOR_HEIGHTS = [3.8, 3.4, 3.4, 3.4, 3.4];
const FLOOR_BASE = [LEVELS.T1, LEVELS.T2, LEVELS.T3, LEVELS.T4, LEVELS.T5, LEVELS.ROOF];
const SLAB = 0.15;
const WALL_T = 0.22;
const COL_W = 0.25;

const AX_A = 0, AX_B = 5.85, AX_C = 9.6, AX_D = 14;
const AX_1 = 0, AX_2 = 10;

const ELEV_X = 1.95, ELEV_Z = 7.05;
const ELEV_W = 1.85, ELEV_D = 1.85;
const STAIR_X1 = 0.2, STAIR_X2 = ELEV_X;
const STAIR_X3 = ELEV_X + ELEV_W;
const STAIR_X4 = STAIR_X3 + 1.65;
const STAIR_Z = ELEV_Z, STAIR_DEPTH = ELEV_D;
const BALCONY_DEPTH = 1.2;

const FLOOR_INFO = [
  { name: 'Sảnh & Showroom', tag: 'T1 · Lobby', title: 'Tầng 1 — Sảnh & Showroom',
    body: 'Reception + 2 phòng họp 6/8 người (vách kính cách âm), tủ trưng bày achievements dọc tường gạch, art wall focal point.',
    kv: [['Cao tầng', '3.8 m'], ['FFL', '±0.000'], ['Phòng họp', '8p + 6p'], ['Showroom', '2 display case']] },
  { name: 'Sales & All-hands', tag: 'T2 · War Room', title: 'Tầng 2 — Sales War Room + All-hands',
    body: '10 chỗ sales bench-desk + zone all-hands 30 ghế xếp với projector. Bấm "Chế độ họp" để xem ghế tự xếp thành 5×6 hướng màn chiếu.',
    kv: [['Sales', '10 chỗ'], ['All-hands', '30 ghế'], ['Projection', '2.4×1.5m screen'], ['Toggle', 'Stack ↔ Meeting']] },
  { name: 'K-City HQ', tag: 'T3 · Back Office', title: 'Tầng 3 — K-City HQ',
    body: '12 nhân sự back-office (HR, kế toán, marketing) ngồi 3 hàng bench desk + phòng BOD 6 chỗ kín kính với meeting table + TV + whiteboard + bookshelf.',
    kv: [['Back Office', '12 chỗ cố định'], ['BOD room', '6 chỗ kín'], ['Lockers', '12 ô'], ['Display', 'KPI dashboard']] },
  { name: 'AirCity Tech Lab', tag: 'T4 · Robotics', title: 'Tầng 4 — AirCity + Oliver Tech Lab',
    body: 'Command center quản lý property (2× TV65) + robot test zone 5×5m demo Unitree G1 (humanoid) & Go2 (quadruped) + dev workspace 4 chỗ + server rack.',
    kv: [['Robot zone', '5×5m + 2 robot demo'], ['Command', '3 ops + 2× TV65'], ['Dev', '4 chỗ'], ['Server', 'Rack 42U']] },
  { name: 'Pantry & Chill', tag: 'T5 · Lifestyle', title: 'Tầng 5 — Pantry, Bida & Dorm',
    body: 'Quầy bếp marble + 4 ghế bar + 2 bàn ăn 4 chỗ, bàn bida 8-ball, capsule dorm nam/nữ (8 giường), chill zone với sofa L + sách.',
    kv: [['Pantry', 'Bếp 3m + bar'], ['Pool', '2.74×1.52m'], ['Capsules', '8 giường (4×2)'], ['Chill', 'Sofa L + 2 ban game']] },
  { name: 'Mái', tag: 'Mái · Rooftop Terrace', title: 'Mái — Rooftop Terrace',
    body: 'Sân thượng với sofa outdoor, string lights tạo vibe rooftop bar, 4 cây xanh ở các góc. Tum thang máy + skylight i=5%.',
    kv: [['FFL mái', '+17.400'], ['Tum', '+18.500'], ['Vibe', 'Rooftop bar'], ['Plants', '4 cây lớn']] },
];

// ============================================================
// SCENE / RENDERER / CAMERA
// ============================================================
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, powerPreference: 'high-performance',
  preserveDrawingBuffer: true, // cần thiết để toDataURL() chụp được canvas (image-to-image input cho Gemini)
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;          // chỉ update shadow khi cần (cảnh tĩnh ⇒ tiết kiệm 1 pass/frame)
renderer.shadowMap.needsUpdate = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// === Render-on-demand state ===
let needsRender = true;
let pendingShadowUpdate = true;
let idleFrames = 0;
function requestRender() { needsRender = true; idleFrames = 0; }
function markShadowDirty() { pendingShadowUpdate = true; requestRender(); }

const scene = new THREE.Scene();
scene.background = makeSkyTexture();
scene.fog = new THREE.Fog(0x12110f, 60, 220);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const CAM_HOME = new THREE.Vector3(W / 2 + 14, 11, -10);
const TARGET_HOME = new THREE.Vector3(W / 2, 5, D / 2);
camera.position.copy(CAM_HOME);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(TARGET_HOME);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.minDistance = 5;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI / 2.1;
controls.enableZoom = true;
controls.zoomToCursor = true;       // zoom đến vị trí cursor (trackpad-friendly)
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,        // pinch zoom + 2-finger pan
};
controls.update();
controls.addEventListener('change', requestRender);

// ============================================================
// LIGHTING — Tăng sáng tổng thể, giữ feel industrial luxury
// ============================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
scene.add(new THREE.HemisphereLight(0xF5F0E8, 0x3D3B36, 0.5));

const sun = new THREE.DirectionalLight(0xfff1d8, 1.0);
sun.position.set(10, 25, -10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -25; sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -25;
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 80;
sun.shadow.bias = -0.001;
scene.add(sun);

// Daylight giả lập từ phía cửa kính (front, z < 0)
const dayLight = new THREE.DirectionalLight(0xE8F0F5, 0.4);
dayLight.position.set(W / 2, 15, -10);
dayLight.target.position.set(W / 2, 5, D / 2);
scene.add(dayLight);
scene.add(dayLight.target);

// ============================================================
// TEXTURES (procedural)
// ============================================================
function makeSkyTexture() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#5a7a96');
  g.addColorStop(0.55, '#9cb1c2');
  g.addColorStop(1, '#c8b898');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

function makeBrickTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a2818'; ctx.fillRect(0, 0, 512, 512);
  const cols = 8, rows = 24;
  const bw = 512 / cols, bh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    for (let col = -1; col < cols + 1; col++) {
      const x = col * bw + (r % 2 ? bw / 2 : 0);
      const y = r * bh;
      const h = 14 + Math.random() * 14;
      const s = 38 + Math.random() * 22;
      const l = 24 + Math.random() * 16;
      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
      ctx.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
      ctx.fillStyle = `rgba(255,220,180,${Math.random() * 0.05})`;
      ctx.fillRect(x + 1.5, y + 1.5, bw - 3, bh / 3);
    }
  }
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 1.2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function makeWalnutTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6B4D3A'; ctx.fillRect(0, 0, 512, 512);
  // dải dọc walnut panel
  const panelW = 64;
  for (let x = 0; x < 512; x += panelW) {
    const variation = (Math.random() - 0.5) * 14;
    const r = 0x6b + variation, gg = 0x4d + variation * 0.5, b = 0x3a + variation * 0.3;
    ctx.fillStyle = `rgb(${Math.max(50, r | 0)},${Math.max(38, gg | 0)},${Math.max(28, b | 0)})`;
    ctx.fillRect(x, 0, panelW - 1, 512);
    // groove giữa các panel
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(x + panelW - 2, 0, 2, 512);
  }
  // wood grain
  for (let i = 0; i < 200; i++) {
    ctx.strokeStyle = `rgba(${30 + Math.random() * 30},${20 + Math.random() * 20},${10 + Math.random() * 15},${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    const y = Math.random() * 512;
    ctx.moveTo(0, y);
    let cy = y;
    for (let x = 0; x <= 512; x += 8) {
      cy += (Math.random() - 0.5) * 1.5;
      ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }
  // highlight stripe per panel
  for (let x = 0; x < 512; x += panelW) {
    ctx.fillStyle = `rgba(255,200,150,${0.04 + Math.random() * 0.06})`;
    ctx.fillRect(x + 3, 0, 6, 512);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function makeConcreteTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5A5853'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 14000; i++) {
    const a = Math.random() * 0.22;
    const v = 65 + Math.random() * 45;
    ctx.fillStyle = `rgba(${v},${v},${v - 5},${a})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }
  // subtle bands
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
    ctx.fillRect(0, Math.random() * 512, 512, 1 + Math.random() * 2);
  }
  // glossy specks
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(220,220,220,${0.15 + Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeGroundTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3a36'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8000; i++) {
    const v = 40 + Math.random() * 35;
    ctx.fillStyle = `rgba(${v},${v - 2},${v - 5},${Math.random() * 0.4})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);
  return tex;
}

const brickTex = makeBrickTexture(); brickTex.repeat.set(5, 3);
const walnutTex = makeWalnutTexture(); walnutTex.repeat.set(3, 2);
const walnutTexBig = makeWalnutTexture(); walnutTexBig.repeat.set(4, 2);
const floorTex = makeConcreteTexture(); floorTex.repeat.set(3, 4);
const ceilingTex = makeConcreteTexture(); ceilingTex.repeat.set(2, 3);

// ============================================================
// MATERIAL PALETTE — Industrial Luxury
// ============================================================
const matBrick = new THREE.MeshPhongMaterial({
  map: brickTex, color: 0xffffff, shininess: 4, specular: 0x0a0807,
});
const matWalnutWall = new THREE.MeshPhongMaterial({
  map: walnutTex, color: 0xffffff, shininess: 22, specular: 0x2a1810,
});
const matWalnutBig = new THREE.MeshPhongMaterial({
  map: walnutTexBig, color: 0xffffff, shininess: 22, specular: 0x2a1810,
});
const matFloor = new THREE.MeshPhongMaterial({
  map: floorTex, color: 0xffffff, shininess: 60, specular: 0x6a6a65,
});
const matCeiling = new THREE.MeshPhongMaterial({ color: 0x8A867E, shininess: 8, specular: 0x333 });
const matSlab = new THREE.MeshPhongMaterial({ color: 0x6a6862, shininess: 10 });
const matColumn = new THREE.MeshPhongMaterial({ color: 0xa8a5a2, shininess: 25, specular: 0x555 });
const matInox = new THREE.MeshPhongMaterial({ color: 0x9A9894, shininess: 110, specular: 0x807d78 });
const matGlass = new THREE.MeshPhongMaterial({
  color: 0xA8D5C2, transparent: true, opacity: 0.08,
  shininess: 130, specular: 0xffffff, side: THREE.DoubleSide,
});
const matGlassDark = new THREE.MeshPhongMaterial({
  color: 0x8aa6a6, transparent: true, opacity: 0.18,
  shininess: 110, specular: 0xffffff, side: THREE.DoubleSide,
});
const matAluminum = new THREE.MeshPhongMaterial({ color: 0xb8bcc2, shininess: 70, specular: 0x666 });
const matRailing = new THREE.MeshPhongMaterial({ color: 0x1a1d22, shininess: 40 });
const matConcrete = new THREE.MeshPhongMaterial({ color: 0xb6b2aa, shininess: 8 });
const matHighlight = new THREE.MeshBasicMaterial({
  color: 0x7CB69A, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false,
});

// ============================================================
// HELPERS
// ============================================================
function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  m.userData.isShell = true;
  return m;
}

// ============================================================
// GROUND + EXTERIOR
// ============================================================
const groundTex = makeGroundTexture();
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(140, 140),
  new THREE.MeshPhongMaterial({ map: groundTex, color: 0x6c685e, shininess: 2 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(W / 2, -0.01, D / 2);
ground.receiveShadow = true;
scene.add(ground);

const sidewalk = new THREE.Mesh(
  new THREE.PlaneGeometry(W + 4, 4.5),
  new THREE.MeshPhongMaterial({ color: 0x8a867d, shininess: 6 }),
);
sidewalk.rotation.x = -Math.PI / 2;
sidewalk.position.set(W / 2, 0.005, -2.6);
sidewalk.receiveShadow = true;
scene.add(sidewalk);

const PAD_MAT = new THREE.MeshPhongMaterial({ color: 0x2a2a26, shininess: 8 });
const PAD_DOT_MAT = new THREE.MeshBasicMaterial({ color: 0xc8c4b8 });
const PAD_DOT_GEO = new THREE.CircleGeometry(0.045, 6);
function parkingPad(cx) {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.4), PAD_MAT);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(cx, 0.012, -2.6);
  pad.receiveShadow = true;
  g.add(pad);
  for (let i = 0; i < 24; i++) {
    const dot = new THREE.Mesh(PAD_DOT_GEO, PAD_DOT_MAT);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(cx + (Math.random() - 0.5) * 2.2, 0.014, -2.6 + (Math.random() - 0.5) * 4);
    g.add(dot);
  }
  return g;
}
scene.add(parkingPad(2.5));
scene.add(parkingPad(7.5));

// ============================================================
// BUILDING — 6 floor groups
// ============================================================
const building = new THREE.Group();
scene.add(building);
const floorGroups = [];
const floorFurnitureGroups = []; // subgroup riêng cho furniture để toggle visible nhanh
for (let i = 0; i < 6; i++) {
  const g = new THREE.Group();
  g.userData.floorIndex = i;
  floorGroups.push(g);
  building.add(g);
  const fg = new THREE.Group();
  fg.userData.isFurnitureGroup = true;
  g.add(fg);
  floorFurnitureGroups.push(fg);
}

function addColumns(group, baseY, height) {
  const positions = [
    [AX_1, AX_A], [AX_2, AX_A], [AX_1, AX_B], [AX_2, AX_B],
    [AX_1, AX_C], [AX_2, AX_C], [AX_1, AX_D], [AX_2, AX_D],
    [W / 2, AX_B], [W / 2, AX_C], [W / 2, AX_D],
  ];
  for (const [x, z] of positions) {
    const c = box(COL_W, height, COL_W, matColumn);
    c.position.set(x, baseY + height / 2, z);
    group.add(c);
  }
}

function addSlabAndCeiling(group, idx) {
  const baseY = FLOOR_BASE[idx];
  // Slab structural (top face = floor of this level)
  const slab = box(W, SLAB, D, matSlab);
  slab.position.set(W / 2, baseY - SLAB / 2, D / 2);
  group.add(slab);
  // Polished concrete floor surface ON TOP of slab
  const floorSurf = new THREE.Mesh(
    new THREE.PlaneGeometry(W - WALL_T * 2, D - WALL_T * 2),
    matFloor,
  );
  floorSurf.rotation.x = -Math.PI / 2;
  floorSurf.position.set(W / 2, baseY + 0.003, D / 2);
  floorSurf.receiveShadow = true;
  floorSurf.userData.isShell = true;
  group.add(floorSurf);

  // Ceiling cho TẦNG DƯỚI (mặt dưới của slab này) — chỉ idx > 0
  if (idx > 0) {
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(W - WALL_T * 2, D - WALL_T * 2),
      matCeiling,
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(W / 2, baseY - SLAB - 0.002, D / 2);
    ceil.userData.isShell = true;
    group.add(ceil);
  }

  // Ban công slab cho T2-T4
  if (idx >= 1 && idx <= 3) {
    const bal = box(W, SLAB, BALCONY_DEPTH, matSlab);
    bal.position.set(W / 2, baseY - SLAB / 2, -BALCONY_DEPTH / 2);
    group.add(bal);
  }
}

function addPerimeterWalls(group, baseY, height, opts = {}) {
  const wallH = height - 0.15;
  const yMid = baseY + wallH / 2;

  // Tường trái (X=0) — GẠCH MỘC
  const leftWall = box(WALL_T, wallH, D, matBrick);
  leftWall.position.set(WALL_T / 2, yMid, D / 2);
  group.add(leftWall);

  // Tường phải (X=W) — WALNUT panels
  const rightWall = box(WALL_T, wallH, D, matWalnutWall);
  rightWall.position.set(W - WALL_T / 2, yMid, D / 2);
  group.add(rightWall);

  // Tường sau (Z=D) — WALNUT, trừ T5 dùng kính
  if (!opts.glassRear) {
    const rear = box(W, wallH, WALL_T, matWalnutBig);
    rear.position.set(W / 2, yMid, AX_D - WALL_T / 2);
    group.add(rear);
  } else {
    const rearGlass = box(W - 0.5, wallH - 0.4, 0.06, matGlass);
    rearGlass.position.set(W / 2, baseY + wallH / 2, AX_D - 0.05);
    group.add(rearGlass);
    const frame = box(W, 0.1, WALL_T, matAluminum);
    frame.position.set(W / 2, baseY + wallH - 0.05, AX_D - WALL_T / 2);
    group.add(frame);
    // mullions
    for (const x of [W / 4, W / 2, 3 * W / 4]) {
      const mu = box(0.08, wallH - 0.4, 0.1, matAluminum);
      mu.position.set(x, baseY + wallH / 2, AX_D - 0.06);
      group.add(mu);
    }
  }
}

function addFacade(group, baseY, height, type) {
  const yMid = baseY + height / 2;
  if (type === 'shopfront') {
    const frameTop = box(W, 0.18, 0.18, matAluminum);
    frameTop.position.set(W / 2, baseY + height - 0.09, AX_A);
    group.add(frameTop);
    const frameBot = box(W, 0.15, 0.18, matAluminum);
    frameBot.position.set(W / 2, baseY + 0.075, AX_A);
    group.add(frameBot);
    for (const x of [0.05, 3.7, 6.3, W - 0.05]) {
      const mu = box(0.08, height, 0.18, matAluminum);
      mu.position.set(x, yMid, AX_A);
      group.add(mu);
    }
    for (const x of [4.6, 5.4]) {
      const mu = box(0.06, height - 0.3, 0.15, matAluminum);
      mu.position.set(x, baseY + (height - 0.3) / 2 + 0.15, AX_A);
      group.add(mu);
    }
    const gL = box(3.55, height - 0.35, 0.04, matGlass);
    gL.position.set(0.05 + 3.55 / 2 + 0.05, baseY + (height - 0.35) / 2 + 0.18, AX_A);
    group.add(gL);
    const gR = box(3.55, height - 0.35, 0.04, matGlass);
    gR.position.set(W - 0.05 - 3.55 / 2 - 0.05, baseY + (height - 0.35) / 2 + 0.18, AX_A);
    group.add(gR);
    const door = box(1.6, height - 0.4, 0.04, matGlassDark);
    door.position.set(W / 2, baseY + (height - 0.4) / 2 + 0.2, AX_A - 0.03);
    group.add(door);
    const handle = box(0.04, 0.5, 0.04, matInox);
    handle.position.set(W / 2 + 0.4, baseY + 1.1, AX_A - 0.1);
    group.add(handle);
    const step = box(W + 0.4, 0.15, 0.4, matConcrete);
    step.position.set(W / 2, baseY - 0.075, AX_A - 0.2);
    group.add(step);
  }
  if (type === 'balcony') {
    const beam = box(W, 0.35, 0.2, matWalnutBig);
    beam.position.set(W / 2, baseY + height - 0.175, AX_A);
    group.add(beam);
    const sill = box(W, 0.2, 0.15, matConcrete);
    sill.position.set(W / 2, baseY + 0.1, AX_A);
    group.add(sill);
    const panelH = height - 0.6;
    const panelY = baseY + 0.2 + panelH / 2;
    const pw = (W - 0.4) / 4;
    for (let i = 0; i < 4; i++) {
      const px = 0.2 + pw * i + pw / 2;
      const isSlide = i === 1 || i === 2;
      const m = box(pw - 0.05, panelH, 0.04, isSlide ? matGlassDark : matGlass);
      m.position.set(px, panelY, AX_A - (isSlide ? 0.01 : 0));
      group.add(m);
      const mu = box(0.06, panelH + 0.05, 0.12, matAluminum);
      mu.position.set(0.2 + pw * i, panelY, AX_A);
      group.add(mu);
    }
    const muR = box(0.06, panelH + 0.05, 0.12, matAluminum);
    muR.position.set(W - 0.2, panelY, AX_A);
    group.add(muR);
    const muMid = box(0.06, panelH + 0.05, 0.12, matAluminum);
    muMid.position.set(W / 2, panelY, AX_A);
    group.add(muMid);
    addBalconyRailing(group, baseY, AX_A - BALCONY_DEPTH);
  }
  if (type === 'glass') {
    const frameTop = box(W, 0.15, 0.15, matAluminum);
    frameTop.position.set(W / 2, baseY + height - 0.075, AX_A);
    group.add(frameTop);
    const frameBot = box(W, 0.18, 0.15, matAluminum);
    frameBot.position.set(W / 2, baseY + 0.09, AX_A);
    group.add(frameBot);
    const pw = (W - 0.3) / 4;
    for (let i = 0; i < 4; i++) {
      const px = 0.15 + pw * i + pw / 2;
      const m = box(pw - 0.05, height - 0.35, 0.04, matGlass);
      m.position.set(px, baseY + (height - 0.35) / 2 + 0.18, AX_A);
      group.add(m);
      const mu = box(0.06, height, 0.12, matAluminum);
      mu.position.set(0.15 + pw * i, baseY + height / 2, AX_A);
      group.add(mu);
    }
    const muR = box(0.06, height, 0.12, matAluminum);
    muR.position.set(W - 0.15, baseY + height / 2, AX_A);
    group.add(muR);
  }
}

function addBalconyRailing(group, baseY, frontZ) {
  const H = 1.0;
  const top = box(W + 0.05, 0.05, 0.05, matRailing);
  top.position.set(W / 2, baseY + H, frontZ + 0.025);
  group.add(top);
  const bot = box(W + 0.05, 0.05, 0.05, matRailing);
  bot.position.set(W / 2, baseY + 0.1, frontZ + 0.025);
  group.add(bot);
  const glassInfill = box(W - 0.1, H - 0.2, 0.02, matGlassDark);
  glassInfill.position.set(W / 2, baseY + H / 2 + 0.05, frontZ + 0.025);
  group.add(glassInfill);
  for (const x of [0, W / 2, W]) {
    const p = box(0.05, H, 0.05, matRailing);
    p.position.set(x, baseY + H / 2 + 0.05, frontZ + 0.025);
    group.add(p);
  }
  const div = box(0.08, H, BALCONY_DEPTH, matWalnutWall);
  div.position.set(W / 2, baseY + H / 2 + 0.05, frontZ + BALCONY_DEPTH / 2);
  group.add(div);
}

function addInteriorWalls(group, baseY, height, withWC = true) {
  const wallH = height - 0.2;
  const yMid = baseY + wallH / 2;
  const coreWall = box(STAIR_X4 + 0.1, wallH, 0.15, matConcrete);
  coreWall.position.set((STAIR_X4 + 0.1) / 2, yMid, AX_C - 0.075);
  group.add(coreWall);
  const coreWall2 = box(STAIR_X4 + 0.1, wallH, 0.15, matConcrete);
  coreWall2.position.set((STAIR_X4 + 0.1) / 2, yMid, ELEV_Z - 0.075);
  group.add(coreWall2);
  const shaftLeft = box(0.12, wallH, ELEV_D + 0.2, matConcrete);
  shaftLeft.position.set(ELEV_X - 0.06, yMid, ELEV_Z + ELEV_D / 2);
  group.add(shaftLeft);
  const shaftRight = box(0.12, wallH, ELEV_D + 0.2, matConcrete);
  shaftRight.position.set(ELEV_X + ELEV_W + 0.06, yMid, ELEV_Z + ELEV_D / 2);
  group.add(shaftRight);

  if (withWC) {
    const wcWall = box(4.5, wallH, 0.12, matWalnutWall);
    wcWall.position.set(4.5 / 2, yMid, AX_D - 4.4 + 0.06);
    group.add(wcWall);
    const wcDiv = box(0.12, wallH, 4.4, matWalnutWall);
    wcDiv.position.set(2.0, yMid, AX_D - 4.4 / 2);
    group.add(wcDiv);
  }
}

function addStairs(group, baseY, height) {
  const flightRise = height / 2;
  const steps = 11;
  const stepRise = flightRise / steps;
  const stepRun = (STAIR_X2 - STAIR_X1) / steps;
  const stairW = STAIR_DEPTH;
  for (let i = 0; i < steps; i++) {
    const s = box(stepRun + 0.02, stepRise + 0.02, stairW, matConcrete);
    s.position.set(STAIR_X1 + stepRun * (i + 0.5), baseY + stepRise * (i + 0.5), STAIR_Z + stairW / 2);
    group.add(s);
  }
  const landing = box(ELEV_W + 0.4, 0.12, stairW, matConcrete);
  landing.position.set(ELEV_X + ELEV_W / 2, baseY + flightRise + 0.06, STAIR_Z + stairW / 2);
  group.add(landing);
  const stepRun2 = (STAIR_X4 - STAIR_X3) / steps;
  for (let i = 0; i < steps; i++) {
    const s = box(stepRun2 + 0.02, stepRise + 0.02, stairW, matConcrete);
    s.position.set(STAIR_X3 + stepRun2 * (i + 0.5), baseY + flightRise + stepRise * (i + 0.5), STAIR_Z + stairW / 2);
    group.add(s);
  }
  const landingBot = box(STAIR_X4 + 0.2, 0.12, 0.6, matConcrete);
  landingBot.position.set((STAIR_X4 + 0.2) / 2, baseY - 0.06, STAIR_Z + stairW + 0.3);
  group.add(landingBot);
  for (const [x1, x2, y1, y2] of [
    [STAIR_X1, STAIR_X2, baseY + 0.95, baseY + flightRise + 0.95],
    [STAIR_X3, STAIR_X4, baseY + flightRise + 0.95, baseY + height - 0.05],
  ]) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 8), matInox);
    rail.castShadow = true;
    rail.position.set((x1 + x2) / 2, (y1 + y2) / 2, STAIR_Z + 0.05);
    rail.rotation.z = Math.PI / 2 - Math.atan2(dy, dx);
    rail.userData.isShell = true;
    group.add(rail);
  }
}

const ELEV_LED_MAT = new THREE.MeshBasicMaterial({ color: 0x7CB69A });
const ELEV_LED_GEO = new THREE.BoxGeometry(0.1, 0.05, 0.02);
function addElevatorDoor(group, baseY) {
  const door = box(1.0, 2.1, 0.08, matInox);
  door.position.set(ELEV_X + ELEV_W / 2, baseY + 1.05, ELEV_Z - 0.04);
  group.add(door);
  const panel = box(0.18, 0.4, 0.04, matAluminum);
  panel.position.set(ELEV_X + ELEV_W + 0.3, baseY + 1.4, ELEV_Z - 0.04);
  group.add(panel);
  const led = new THREE.Mesh(ELEV_LED_GEO, ELEV_LED_MAT);
  led.position.set(ELEV_X + ELEV_W + 0.3, baseY + 1.6, ELEV_Z - 0.06);
  led.userData.isShell = true;
  group.add(led);
}

function buildFloor(idx) {
  const g = floorGroups[idx];
  const baseY = FLOOR_BASE[idx];
  const h = FLOOR_HEIGHTS[idx];
  addSlabAndCeiling(g, idx);
  addColumns(g, baseY, h);
  if (idx === 0) {
    addPerimeterWalls(g, baseY, h);
    addFacade(g, baseY, h, 'shopfront');
    addInteriorWalls(g, baseY, h, false);
  } else if (idx >= 1 && idx <= 3) {
    addPerimeterWalls(g, baseY, h);
    addFacade(g, baseY, h, 'balcony');
    addInteriorWalls(g, baseY, h, true);
  } else {
    addPerimeterWalls(g, baseY, h, { glassRear: true });
    addFacade(g, baseY, h, 'glass');
    addInteriorWalls(g, baseY, h, false); // T5 không có WC theo bản vẽ
  }
  addStairs(g, baseY, h);
  addElevatorDoor(g, baseY);
}
for (let i = 0; i < 5; i++) buildFloor(i);

function buildRoof() {
  const g = floorGroups[5];
  const baseY = LEVELS.ROOF;
  const slab = box(W, 0.18, D, matSlab);
  slab.position.set(W / 2, baseY - 0.09, D / 2);
  g.add(slab);
  // ceiling cho T5 (mặt dưới slab mái)
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(W - WALL_T * 2, D - WALL_T * 2),
    matCeiling,
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(W / 2, baseY - 0.18 - 0.002, D / 2);
  ceil.userData.isShell = true;
  g.add(ceil);
  // sàn ngoài mái (outdoor)
  const matRoofFloor = new THREE.MeshPhongMaterial({ color: 0x3a3833, shininess: 25 });
  const tile = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.4, D - 4 - 0.6),
    matRoofFloor,
  );
  tile.rotation.x = -Math.PI / 2;
  tile.position.set(W / 2, baseY + 0.005, D / 2 + 1.5);
  tile.receiveShadow = true;
  tile.userData.isShell = true;
  g.add(tile);
  // parapet
  const pH = 0.9, pT = 0.15;
  for (const [w, hh, d, x, y, z] of [
    [W, pH, pT, W / 2, baseY + pH / 2, AX_A + pT / 2],
    [W, pH, pT, W / 2, baseY + pH / 2, AX_D - pT / 2],
    [pT, pH, D, AX_1 + pT / 2, baseY + pH / 2, D / 2],
    [pT, pH, D, AX_2 - pT / 2, baseY + pH / 2, D / 2],
  ]) {
    const m = box(w, hh, d, matWalnutBig);
    m.position.set(x, y, z);
    g.add(m);
  }
  // tum thang máy
  const tumW = 5.0, tumD = 2.5, tumH = 1.4;
  const tumX = STAIR_X1, tumZ = STAIR_Z - 0.3;
  for (const [w, hh, d, x, y, z] of [
    [tumW, tumH, 0.18, tumX + tumW / 2, baseY + tumH / 2, tumZ + 0.09],
    [tumW, tumH, 0.18, tumX + tumW / 2, baseY + tumH / 2, tumZ + tumD - 0.09],
    [0.18, tumH, tumD, tumX + 0.09, baseY + tumH / 2, tumZ + tumD / 2],
    [0.18, tumH, tumD, tumX + tumW - 0.09, baseY + tumH / 2, tumZ + tumD / 2],
  ]) {
    const m = box(w, hh, d, matWalnutBig);
    m.position.set(x, y, z);
    g.add(m);
  }
  const roofPlate = box(tumW + 0.4, 0.12, tumD + 0.4, matConcrete);
  roofPlate.position.set(tumX + tumW / 2, baseY + tumH + 0.06, tumZ + tumD / 2);
  roofPlate.rotation.z = -0.05;
  g.add(roofPlate);
  for (let i = 0; i < 3; i++) {
    const sx = 1.5 + i * 1.6;
    const sky = box(0.7, 0.05, 3.0, matGlassDark);
    sky.position.set(sx, baseY + 0.05, 8.5);
    g.add(sky);
  }
}
buildRoof();

// ============================================================
// THANG MÁY KÍNH
// ============================================================
const elevatorGroup = new THREE.Group();
const cabinShell = new THREE.Mesh(
  new THREE.BoxGeometry(ELEV_W - 0.1, 2.3, ELEV_D - 0.1),
  new THREE.MeshPhongMaterial({
    color: 0xc8e0ec, transparent: true, opacity: 0.45,
    shininess: 130, specular: 0xffffff, side: THREE.DoubleSide,
  }),
);
cabinShell.position.set(ELEV_X + ELEV_W / 2, 1.15, ELEV_Z + ELEV_D / 2);
cabinShell.userData.isShell = true;
elevatorGroup.add(cabinShell);
const cabinFloor = box(ELEV_W - 0.15, 0.05, ELEV_D - 0.15, matInox);
cabinFloor.position.set(ELEV_X + ELEV_W / 2, 0.025, ELEV_Z + ELEV_D / 2);
elevatorGroup.add(cabinFloor);
const cabinCeil = box(ELEV_W - 0.15, 0.05, ELEV_D - 0.15, matInox);
cabinCeil.position.set(ELEV_X + ELEV_W / 2, 2.27, ELEV_Z + ELEV_D / 2);
elevatorGroup.add(cabinCeil);
const cabinLight = new THREE.PointLight(0xffe6b8, 0.55, 3, 2);
cabinLight.castShadow = false;
cabinLight.position.set(ELEV_X + ELEV_W / 2, 2.1, ELEV_Z + ELEV_D / 2);
elevatorGroup.add(cabinLight);
for (const [dx, dz] of [[0, 0], [ELEV_W - 0.1, 0], [0, ELEV_D - 0.1], [ELEV_W - 0.1, ELEV_D - 0.1]]) {
  const post = box(0.06, 2.3, 0.06, matInox);
  post.position.set(ELEV_X + 0.05 + dx, 1.15, ELEV_Z + 0.05 + dz);
  elevatorGroup.add(post);
}
scene.add(elevatorGroup);
// rails
const railL = box(0.06, LEVELS.ROOF, 0.06, matInox);
railL.position.set(ELEV_X - 0.04, LEVELS.ROOF / 2, ELEV_Z + ELEV_D / 2);
scene.add(railL);
const railR = box(0.06, LEVELS.ROOF, 0.06, matInox);
railR.position.set(ELEV_X + ELEV_W + 0.04, LEVELS.ROOF / 2, ELEV_Z + ELEV_D / 2);
scene.add(railR);

// ============================================================
// FURNITURE PLACEMENT — bố trí từng tầng
// ============================================================
// Chỉ những furniture lớn/cao mới cast shadow — phần còn lại tắt để tiết kiệm.
const SHADOW_KEEP_TYPES = new Set([
  'desk_shared', 'desk_standing', 'reception_counter',
  'sofa_module', 'pantry', 'phone_booth', 'art_wall',
]);

function place(g, item, x, y, z, rotY = 0) {
  item.position.set(x, y, z);
  item.rotation.y = rotY;
  // chuyển vào furniture subgroup của tầng (g là floorGroups[i])
  const target = g.userData.floorIndex !== undefined
    ? floorFurnitureGroups[g.userData.floorIndex]
    : g;
  const keepShadow = SHADOW_KEEP_TYPES.has(item.userData?.tooltip?.type);
  item.traverse(c => {
    if (c.isMesh) {
      c.castShadow = keepShadow;
      c.receiveShadow = false;
    }
  });
  target.add(item);
  return item;
}

// --- State cho tính năng đặc biệt ---
const t2Chairs = []; // 30 stackable chairs cho T2 toggle
let t2Mode = 'stack'; // 'stack' | 'meeting'
let t2AnimT = 1; // 0..1, 1 = settled
let t4Robot1 = null, t4Robot2 = null; // Unitree G1 + Go2
let robotTime = 0;

// --- TẦNG 1: Sảnh & Showroom ---
function populateT1() {
  const g = floorGroups[0];
  const Y = LEVELS.T1;

  // Reception zone (left front)
  place(g, F.reception_counter(), 2.0, Y, 3.0, Math.PI / 2);
  place(g, F.reception_kiosk(), 3.5, Y, 3.0, Math.PI);

  // Display cases (showroom along left brick wall)
  place(g, F.display_case(3.0), 0.4, Y, 2.5, -Math.PI / 2);
  place(g, F.display_case(2.0), 0.4, Y, 5.5, -Math.PI / 2);

  // MEETING ROOM 1 (8 người) — right front, kín bằng vách kính
  place(g, F.glass_partition(3.1, 2.7), 5.5, Y, 1.95, -Math.PI / 2);  // wall x=5.5, z=0.4..3.5
  place(g, F.glass_partition(4.3, 2.7), 7.65, Y, 3.5, 0);              // wall z=3.5 ngang
  place(g, F.meeting_table(8), 7.6, Y, 1.95);
  for (const [cx, cz, rot] of [
    [6.5, 1.45, Math.PI], [7.3, 1.45, Math.PI], [7.9, 1.45, Math.PI], [8.7, 1.45, Math.PI],
    [6.5, 2.45, 0], [7.3, 2.45, 0], [7.9, 2.45, 0], [8.7, 2.45, 0],
  ]) place(g, F.chair_task(), cx, Y, cz, rot);
  place(g, F.tv_large(65), 9.95, Y + 1.5, 1.95, -Math.PI / 2);
  place(g, F.whiteboard(), 9.95, Y + 1.4, 0.8, -Math.PI / 2);

  // MEETING ROOM 2 (6 người) — right mid
  place(g, F.glass_partition(3.0, 2.7), 5.5, Y, 5.0, -Math.PI / 2);   // wall x=5.5, z=3.5..6.5
  place(g, F.meeting_table(6), 7.6, Y, 5.0);
  for (const [cx, cz, rot] of [
    [6.7, 4.55, Math.PI], [7.6, 4.55, Math.PI], [8.5, 4.55, Math.PI],
    [6.7, 5.45, 0], [7.6, 5.45, 0], [8.5, 5.45, 0],
  ]) place(g, F.chair_task(), cx, Y, cz, rot);
  place(g, F.tv_large(55), 9.95, Y + 1.5, 5.0, -Math.PI / 2);

  // Lobby waiting (giữa, trước cầu thang)
  place(g, F.chair_shell(), 3.4, Y, 5.5, 0);
  place(g, F.chair_shell(), 4.3, Y, 5.5, 0);
  place(g, F.coffee_table(), 3.85, Y, 6.5);

  // ART WALL — focal point trên rear walnut wall
  place(g, F.art_wall(2.5, 2.6), 7.5, Y + 1.55, 13.96, Math.PI);

  // Starlight panel + track lights
  place(g, F.starlight_panel(), 3.5, Y + 3.62, 3.5);
  place(g, F.track_light(3.5), 3.5, Y + 3.55, 1.5);
  place(g, F.track_light(3.5), 7.5, Y + 3.55, 7.5);
  place(g, F.track_light(3.5), 5.0, Y + 3.55, 11.5);

  // LED floor strip dẫn từ entrance → stairs
  place(g, F.led_floor_strip(6, 'z'), 4.7, Y + 0.005, 3.5);
  place(g, F.led_floor_strip(2.5, 'x'), 5.5, Y + 0.005, 6.5);

  // Plants 2 bên cửa vào
  place(g, F.plant('lg'), 1.0, Y, 0.8);
  place(g, F.plant('lg'), 4.7, Y, 0.8);

  // Display wall trên tường gạch (info)
  place(g, F.display_wall(), 0.13, Y + 2.0, 8.5, Math.PI / 2);
}

// --- TẦNG 2: Sales & All-hands ---
function populateT2() {
  const g = floorGroups[1];
  const Y = LEVELS.T2;

  // 2 BENCH DESK (5 chỗ mỗi cái) dọc tường gạch — rotated -π/2 để long axis Z
  place(g, F.bench_desk(6.0, 5), 1.7, Y, 3.5, Math.PI / 2);
  place(g, F.bench_desk(6.0, 5), 4.3, Y, 3.5, Math.PI / 2);
  // 10 chair_task — 5 mỗi bench, ngồi phía +X (hướng -X về modesty panel)
  // Bench rot π/2: front của bench ở -X tương đối với bench center
  for (const [bx, ux] of [[1.7, 1.05], [4.3, 3.65]]) {
    for (let i = 0; i < 5; i++) {
      const cz = 0.5 + 1.2 * (i + 0.5);
      place(g, F.chair_task(), ux, Y, cz, Math.PI / 2);
    }
  }
  // 10 monitor (1 mỗi slot, đặt trên bàn)
  for (const bx of [1.7, 4.3]) {
    for (let i = 0; i < 5; i++) {
      const cz = 0.5 + 1.2 * (i + 0.5);
      place(g, F.monitor(), bx + 0.32, Y + 0.74, cz, -Math.PI / 2);
    }
  }
  // Locker 12 ô trên rear walnut wall
  place(g, F.locker_unit(12), 8.5, Y, 13.6, Math.PI);

  // TOWN HALL (right side)
  place(g, F.projector_screen(), 9.95, Y + 2.6, 2.5, -Math.PI / 2);
  place(g, F.projector_box(), 6.5, Y + 3.05, 2.5, -Math.PI / 2);
  place(g, F.tv_large(65), 9.95, Y + 1.5, 6.0, -Math.PI / 2);

  // 30 STACKABLE CHAIRS — default stack mode (5 stacks × 6 chairs)
  const STACK_X = [6.0, 6.9, 7.8, 8.5, 9.2];
  const STACK_Z = 12.5;
  for (let s = 0; s < 5; s++) {
    for (let k = 0; k < 6; k++) {
      const chair = F.stackable_chair();
      const stackY = Y + k * 0.13;
      // meeting position: 5 cols × 6 rows facing +X (toward projector x=9.95)
      const r = s, c = k;
      chair.userData.stackPos = { x: STACK_X[s], y: stackY, z: STACK_Z };
      chair.userData.stackRot = 0;
      chair.userData.meetingPos = { x: 8.4 - r * 0.85, y: Y, z: 1.0 + c * 0.95 };
      chair.userData.meetingRot = Math.PI / 2;
      place(g, chair, STACK_X[s], stackY, STACK_Z, 0);
      t2Chairs.push(chair);
    }
  }

  // Track lights, display, plants
  place(g, F.track_light(4), 3.0, Y + 3.15, 2.0);
  place(g, F.track_light(4), 3.0, Y + 3.15, 5.0);
  place(g, F.track_light(3.5), 7.5, Y + 3.15, 11);
  place(g, F.display_wall(), 0.13, Y + 2.0, 11.5, Math.PI / 2); // KPI dashboard
  place(g, F.plant('lg'), 7.0, Y, 0.8);
  place(g, F.plant('lg'), 6.0, Y, 11.0);
  place(g, F.led_floor_strip(7, 'z'), 5.3, Y + 0.005, 4);
}

// --- TẦNG 3: K-City HQ ---
function populateT3() {
  const g = floorGroups[2];
  const Y = LEVELS.T3;

  // 3 hàng bench desk × 4 chỗ
  for (const [z, label] of [[2.0, 'HR'], [4.0, 'Acc'], [6.0, 'Mkt']]) {
    place(g, F.bench_desk(4.8, 4), 2.6, Y, z);
    for (let i = 0; i < 4; i++) {
      const cx = 0.6 + 1.2 * i + (2.6 - 2.4); // bench center 2.6, slots from x=0.4 to x=4.8
      const cxAdj = 2.6 - 2.4 + 0.6 + 1.2 * i;
      place(g, F.chair_task(), cxAdj, Y, z + 0.6);
      place(g, F.monitor(), cxAdj, Y + 0.74, z - 0.25);
    }
  }
  // Locker 12 ô bên hông phải, gần BOD
  place(g, F.locker_unit(12), 9.55, Y, 7.0, -Math.PI / 2);

  // PHÒNG BOD (6 chỗ kín kính) — back-right (x=6..9.8, z=9.6..13.5)
  place(g, F.glass_partition(3.9, 2.7), 6.0, Y, 11.55, -Math.PI / 2); // vách dọc x=6
  place(g, F.glass_partition(3.8, 2.7), 7.9, Y, 9.6, 0);                // vách ngang z=9.6
  place(g, F.meeting_table(6), 8.0, Y, 11.5);
  for (const [cx, cz, rot] of [
    [7.0, 11.0, Math.PI / 2], [8.0, 11.0, Math.PI / 2], [9.0, 11.0, Math.PI / 2],
    [7.0, 12.0, -Math.PI / 2], [8.0, 12.0, -Math.PI / 2], [9.0, 12.0, -Math.PI / 2],
  ]) place(g, F.chair_task(), cx, Y, cz, rot);
  place(g, F.tv_large(65), 9.95, Y + 1.5, 11.5, -Math.PI / 2);
  place(g, F.whiteboard(), 7.0, Y + 1.4, 13.96, Math.PI);
  place(g, F.bookshelf(), 6.4, Y, 13.4, Math.PI);

  // Display wall trên tường gạch (company KPI)
  place(g, F.display_wall(), 0.13, Y + 2.0, 4.0, Math.PI / 2);

  // Track lights, plants
  place(g, F.track_light(4), 3.0, Y + 3.15, 2.0);
  place(g, F.track_light(4), 3.0, Y + 3.15, 5.0);
  place(g, F.track_light(3.5), 8.0, Y + 3.15, 11.5);
  place(g, F.plant('lg'), 5.5, Y, 1.0);
  place(g, F.plant('lg'), 5.0, Y, 6.8);
  place(g, F.plant('sm'), 4.6, Y, 0.7);
  place(g, F.plant('sm'), 0.7, Y, 6.5);
}

// --- TẦNG 4: AirCity Tech Lab ---
function populateT4() {
  const g = floorGroups[3];
  const Y = LEVELS.T4;

  // ROBOT TEST ZONE — front 5×5m (x=1..6, z=1..6)
  place(g, F.robot_zone_marker(5, 5), 3.5, Y, 3.5);
  // Display wall labelling zone (left brick wall)
  place(g, F.display_wall(), 0.13, Y + 2.0, 3.5, Math.PI / 2);
  // 2 robots (animated)
  t4Robot1 = F.unitree_g1();
  place(g, t4Robot1, 2.5, Y, 4.0);
  t4Robot2 = F.unitree_go2();
  place(g, t4Robot2, 4.5, Y, 2.5);

  // COMMAND CENTER — back-right (x=6..9.5, z=9.6..13.5)
  place(g, F.tv_large(65), 7.0, Y + 1.7, 13.96, Math.PI);
  place(g, F.tv_large(65), 8.6, Y + 1.7, 13.96, Math.PI);
  place(g, F.desk_shared(2.4), 7.8, Y, 12.0);
  place(g, F.chair_task(), 6.8, Y, 12.0, Math.PI / 2);
  place(g, F.chair_task(), 7.8, Y, 12.0, Math.PI / 2);
  place(g, F.chair_task(), 8.8, Y, 12.0, Math.PI / 2);
  place(g, F.server_rack(), 9.2, Y, 10.5);

  // DEV WORKSPACE — front-right (4 chỗ)
  place(g, F.bench_desk(2.4, 2), 7.8, Y, 2.5);
  place(g, F.bench_desk(2.4, 2), 7.8, Y, 4.5);
  for (const z of [2.5, 4.5]) {
    for (const cx of [7.2, 8.4]) {
      place(g, F.chair_task(), cx, Y, z + 0.6);
      place(g, F.monitor(), cx, Y + 0.74, z - 0.25);
    }
  }
  place(g, F.bookshelf(), 9.6, Y, 6.2, -Math.PI / 2);

  // Plants + lights + LED divider
  place(g, F.plant('lg'), 5.7, Y, 0.8);
  place(g, F.track_light(4), 3.5, Y + 3.15, 3.5);
  place(g, F.track_light(3), 7.8, Y + 3.15, 3.5);
  place(g, F.track_light(3), 7.8, Y + 3.15, 12.0);
  place(g, F.led_floor_strip(6.5, 'z'), 6.0, Y + 0.005, 3.5);
  place(g, F.led_floor_strip(8, 'x'), 5.0, Y + 0.005, 8.5);
}

// --- TẦNG 5: Pantry & Chill ---
function populateT5() {
  const g = floorGroups[4];
  const Y = LEVELS.T5;

  // PANTRY (front-left)
  place(g, F.kitchen_counter(3), 0.5, Y, 2.5, -Math.PI / 2); // along left wall
  // Bar stools
  for (let i = 0; i < 4; i++) {
    place(g, F.bar_stool(), 1.5, Y, 1.2 + i * 0.7, -Math.PI / 2);
  }
  // 2 dining tables + 8 stackable chairs around
  for (let t = 0; t < 2; t++) {
    const dz = 1.5 + t * 2.3;
    place(g, F.dining_table(4), 4.0, Y, dz);
    place(g, F.stackable_chair(), 3.4, Y, dz, Math.PI / 2);
    place(g, F.stackable_chair(), 4.6, Y, dz, -Math.PI / 2);
    place(g, F.stackable_chair(), 4.0, Y, dz - 0.6, Math.PI);
    place(g, F.stackable_chair(), 4.0, Y, dz + 0.6, 0);
  }

  // POOL ZONE (front-right)
  place(g, F.pool_table(), 8.0, Y, 2.5);
  place(g, F.sofa_module(2), 8.0, Y, 5.0, Math.PI);
  place(g, F.coffee_table(), 8.0, Y, 6.0);
  // Pendant-style track over pool (lower)
  place(g, F.track_light(2.5), 8.0, Y + 1.8, 2.5);

  // DORM NAM (back, x=6..8) — 2 capsule_bed
  place(g, F.capsule_bed(2), 6.5, Y, 11.0, Math.PI);  // mở mặt -Z
  place(g, F.capsule_bed(2), 7.5, Y, 11.0, Math.PI);
  // Curtain ngăn nam/nữ
  place(g, F.partition_curtain(2.5), 8.2, Y, 10.5, Math.PI / 2);
  // DORM NỮ (back, x=8.5..10) — 2 capsule_bed
  place(g, F.capsule_bed(2), 8.8, Y, 11.0, Math.PI);
  place(g, F.capsule_bed(2), 9.6, Y, 11.0, Math.PI);

  // CHILL ZONE (back-left, T5 không có WC nên đây là khu thoáng)
  place(g, F.sofa_module(3), 2.5, Y, 10.5);
  place(g, F.sofa_module(2), 4.5, Y, 12.5, -Math.PI / 2);
  place(g, F.coffee_table(), 2.5, Y, 11.8);
  place(g, F.bookshelf(), 0.38, Y, 11.5, -Math.PI / 2);
  place(g, F.plant('lg'), 5.5, Y, 0.8);
  place(g, F.plant('lg'), 5.5, Y, 12.5);
  place(g, F.plant('sm'), 1.5, Y, 13.0);
  place(g, F.plant('sm'), 4.5, Y, 13.5);

  // Track lights
  place(g, F.track_light(4), 3.0, Y + 3.15, 2.5);
  place(g, F.track_light(3), 8.0, Y + 3.15, 5.0);
  place(g, F.track_light(3), 7.5, Y + 3.15, 11.0);
  place(g, F.track_light(3.5), 3.0, Y + 3.15, 11.5);
  // LED floor strips chia zone
  place(g, F.led_floor_strip(8, 'z'), 5.6, Y + 0.005, 4);
  place(g, F.led_floor_strip(4, 'x'), 5.5, Y + 0.005, 9);
}

// --- MÁI: Rooftop Terrace ---
function populateRoof() {
  const g = floorGroups[5];
  const Y = LEVELS.ROOF;
  // 2 sofa outdoor
  place(g, F.sofa_module(2), 7.5, Y + 0.005, 11.5);
  place(g, F.sofa_module(2), 7.5, Y + 0.005, 13.0, Math.PI);
  place(g, F.coffee_table(), 7.5, Y + 0.005, 12.25);
  // 4 plants lg ở 4 góc
  place(g, F.plant('lg'), 0.6, Y + 0.005, 12.0);
  place(g, F.plant('lg'), 0.6, Y + 0.005, 13.5);
  place(g, F.plant('lg'), 9.4, Y + 0.005, 9.8);
  place(g, F.plant('lg'), 6.0, Y + 0.005, 13.6);
  // String lights
  // 4 cột thấp để mắc dây
  for (const [x, z] of [[0.5, 9.8], [9.5, 9.8], [0.5, 13.7], [9.5, 13.7]]) {
    const post = box(0.06, 2.6, 0.06, matInox);
    post.position.set(x, Y + 1.3, z);
    g.add(post);
  }
  // dây nối 2 cột bên front
  const sl1 = F.string_light(9.0);
  sl1.position.set(5.0, Y + 2.5, 9.8);
  g.add(sl1);
  // dây chéo
  const sl2 = F.string_light(9.0);
  sl2.position.set(5.0, Y + 2.5, 11.7);
  g.add(sl2);
  const sl3 = F.string_light(9.0);
  sl3.position.set(5.0, Y + 2.5, 13.7);
  g.add(sl3);
}

populateT1(); populateT2(); populateT3(); populateT4(); populateT5(); populateRoof();

// Tắt castShadow cho shell mesh không cần đổ bóng ra ngoài (mullion, stair step,
// ceiling, frame, door, glass...). Chỉ giữ cast cho tường ngoài + cột + slab structural.
const SHELL_CAST_MATS = new Set([matBrick, matWalnutWall, matWalnutBig, matColumn, matSlab]);
building.traverse(c => {
  if (!c.isMesh || !c.userData.isShell) return;
  if (!SHELL_CAST_MATS.has(c.material)) c.castShadow = false;
});

// AmbientLight cho rooftop để bù vibe ấm sau khi remove pointLights khỏi string_light
const rooftopAmbient = new THREE.PointLight(0xffd9a0, 0.7, 14, 2);
rooftopAmbient.castShadow = false;
rooftopAmbient.position.set(W / 2, LEVELS.ROOF + 2.5, 11.8);
floorGroups[5].add(rooftopAmbient);

// ============================================================
// HIGHLIGHT BOX cho từng tầng
// ============================================================
const highlightBoxes = [];
for (let i = 0; i < 6; i++) {
  const baseY = FLOOR_BASE[i];
  const h = i < 5 ? FLOOR_HEIGHTS[i] - 0.05 : 2.5;
  const yMid = i < 5 ? baseY + h / 2 : LEVELS.ROOF + 1.25;
  const hb = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, h, D + 0.4), matHighlight);
  hb.position.set(W / 2, yMid, D / 2);
  hb.visible = false;
  scene.add(hb);
  highlightBoxes.push(hb);
}

// ============================================================
// SELECTION (click furniture)
// ============================================================
let selectedObj = null;
let selectionHelper = null;

function selectFurniture(group, screenX, screenY) {
  if (selectionHelper) {
    scene.remove(selectionHelper);
    selectionHelper.geometry.dispose();
    selectionHelper = null;
  }
  selectedObj = group;
  if (group) {
    selectionHelper = new THREE.BoxHelper(group, 0x7CB69A);
    if (selectionHelper.material) selectionHelper.material.linewidth = 2;
    scene.add(selectionHelper);
    showTooltip(screenX, screenY, group.userData.tooltip);
  } else {
    hideTooltip();
  }
}

const tooltipEl = document.getElementById('tooltip');
function showTooltip(x, y, data) {
  if (!data) return;
  tooltipEl.innerHTML = `
    <div class="tt-name">${data.name}</div>
    <div class="tt-row"><span>Kích thước</span><b>${data.dims}</b></div>
    <div class="tt-row"><span>Tham khảo</span><b>${data.ref}</b></div>
    <div class="tt-row tt-price"><span>Giá tham khảo</span><b>${data.price}</b></div>
  `;
  const margin = 18;
  const tw = 280, th = 130;
  let lx = x + margin, ly = y + margin;
  if (lx + tw > window.innerWidth) lx = x - tw - margin;
  if (ly + th > window.innerHeight) ly = y - th - margin;
  tooltipEl.style.left = lx + 'px';
  tooltipEl.style.top = ly + 'px';
  tooltipEl.classList.add('visible');
}
function hideTooltip() { tooltipEl.classList.remove('visible'); }

// ============================================================
// VIEW MODES (solid / xray / wireframe)
// ============================================================
let viewMode = 'solid';
function applyViewMode(mode) {
  viewMode = mode;
  building.traverse(obj => {
    if (!obj.isMesh) return;
    if (!obj.userData.isShell) return;
    const mat = obj.material;
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach(m => applyMatMode(m, obj));
      return;
    }
    applyMatMode(mat, obj);
  });
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === mode);
  });
}
function applyMatMode(mat, obj) {
  if (mat.userData.origOpacity === undefined) {
    mat.userData.origOpacity = mat.opacity ?? 1;
    mat.userData.origTransparent = mat.transparent ?? false;
    mat.userData.origWireframe = mat.wireframe ?? false;
  }
  if (viewMode === 'solid') {
    mat.opacity = mat.userData.origOpacity;
    mat.transparent = mat.userData.origTransparent;
    mat.wireframe = false;
  } else if (viewMode === 'xray') {
    mat.transparent = true;
    mat.opacity = Math.min(0.12, mat.userData.origOpacity);
    mat.wireframe = false;
  } else if (viewMode === 'wireframe') {
    mat.wireframe = true;
    mat.opacity = mat.userData.origOpacity;
    mat.transparent = mat.userData.origTransparent;
  }
  mat.needsUpdate = true;
}

// ============================================================
// CAMERA FLY-TO
// ============================================================
// Pattern cố định: target = (W/2, FFL+1.5, D/2); camera = (W/2+12, FFL+8, -5).
// Cho cảm giác "đứng ngoài cửa kính nhìn vào giữa tầng" — đẹp + hiển thị nhiều furniture.
function floorCamFor(ffl) {
  return {
    pos: new THREE.Vector3(W / 2 + 12, ffl + 8, -5),
    tgt: new THREE.Vector3(W / 2, ffl + 1.5, D / 2),
  };
}
const FLOOR_CAM = [
  floorCamFor(LEVELS.T1),
  floorCamFor(LEVELS.T2),
  floorCamFor(LEVELS.T3),
  floorCamFor(LEVELS.T4),
  floorCamFor(LEVELS.T5),
  // Mái: nhìn từ cao hơn, target tum + sân thượng
  { pos: new THREE.Vector3(W / 2 + 14, LEVELS.ROOF + 11, -8), tgt: new THREE.Vector3(W / 2, LEVELS.ROOF + 1.5, D / 2 + 1) },
];

let camTweenT = 1, camTweenStart = null, camTweenEnd = null, tgtTweenStart = null, tgtTweenEnd = null;
function flyTo(pos, tgt) {
  camTweenStart = camera.position.clone();
  camTweenEnd = pos.clone();
  tgtTweenStart = controls.target.clone();
  tgtTweenEnd = tgt.clone();
  camTweenT = 0;
}

// ============================================================
// UI — sidebar, info panel, comments
// ============================================================
let currentFloor = -1;
let exploded = false;

function buildFloorList() {
  const list = document.getElementById('floorList');
  list.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const info = FLOOR_INFO[i];
    const itemCount = countFurniture(i);
    const commentCount = getComments(i).length;
    const li = document.createElement('button');
    li.className = 'floor-item';
    li.dataset.floor = i;
    li.innerHTML = `
      <div class="fi-row">
        <span class="fi-tag">${i === 5 ? 'Mái' : 'T' + (i + 1)}</span>
        <span class="fi-name">${info.name}</span>
        ${commentCount > 0 ? `<span class="badge">${commentCount}</span>` : ''}
      </div>
      <div class="fi-meta">${itemCount} items</div>
    `;
    li.addEventListener('click', () => selectFloor(i));
    list.appendChild(li);
  }
  const allBtn = document.createElement('button');
  allBtn.className = 'floor-item floor-item--all';
  allBtn.dataset.floor = -1;
  allBtn.innerHTML = `<div class="fi-row"><span class="fi-tag">All</span><span class="fi-name">Tổng quan</span></div>`;
  allBtn.addEventListener('click', () => selectFloor(-1));
  list.appendChild(allBtn);
}

function countFurniture(floorIdx) {
  let n = 0;
  floorGroups[floorIdx].traverse(obj => { if (obj.userData?.isFurniture) n++; });
  return n;
}

function buildFurnitureList(floorIdx) {
  const wrap = document.getElementById('furnitureList');
  if (floorIdx < 0) {
    wrap.innerHTML = '<p class="muted">Chọn 1 tầng để xem danh sách nội thất.</p>';
    return;
  }
  const counts = {};
  floorGroups[floorIdx].traverse(obj => {
    if (obj.userData?.isFurniture) {
      const name = obj.userData.tooltip.name;
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    wrap.innerHTML = '<p class="muted">Tầng này chưa có nội thất.</p>';
    return;
  }
  wrap.innerHTML = entries.map(([name, c]) =>
    `<div class="furn-row"><span>${name}</span><b>×${c}</b></div>`).join('');
}

function updateFurnitureVisibility() {
  const showAll = currentFloor === -1 || exploded;
  for (let i = 0; i < floorFurnitureGroups.length; i++) {
    floorFurnitureGroups[i].visible = showAll || i === currentFloor;
  }
}

function selectFloor(idx) {
  currentFloor = idx;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.floor, 10) === idx);
  });
  document.querySelectorAll('.floor-item').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.floor, 10) === idx);
  });
  highlightBoxes.forEach(b => b.visible = false);
  if (idx >= 0) {
    highlightBoxes[idx].visible = true;
    flyTo(FLOOR_CAM[idx].pos, FLOOR_CAM[idx].tgt);
    if (idx <= 4) targetElevatorY = FLOOR_BASE[idx];
    else targetElevatorY = LEVELS.T5;
  }
  showInfo(idx);
  buildFurnitureList(idx);
  renderComments(idx);
  renderSpecialActions(idx);
  updateFurnitureVisibility();
  markShadowDirty();
}

// ---------- T2 MEETING TOGGLE ----------
function setT2Mode(mode) {
  if (mode === t2Mode) return;
  t2Mode = mode;
  t2AnimT = 0;
  for (const c of t2Chairs) {
    c.userData.startPos = { x: c.position.x, y: c.position.y, z: c.position.z };
    c.userData.startRot = c.rotation.y;
    c.userData.targetPos = mode === 'meeting' ? c.userData.meetingPos : c.userData.stackPos;
    c.userData.targetRot = mode === 'meeting' ? c.userData.meetingRot : c.userData.stackRot;
  }
  requestRender();
  markShadowDirty();
}

function renderSpecialActions(idx) {
  const wrap = document.getElementById('specialActions');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (idx === 1) {
    const btn = document.createElement('button');
    btn.className = 'btn btn--accent special-btn';
    const updateLabel = () => {
      btn.textContent = t2Mode === 'meeting' ? '↺ Chế độ thường' : '⇆ Chế độ họp';
    };
    updateLabel();
    btn.onclick = () => {
      setT2Mode(t2Mode === 'meeting' ? 'stack' : 'meeting');
      updateLabel();
    };
    wrap.appendChild(btn);
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.style.marginTop = '8px';
    hint.textContent = '30 ghế xếp tự xếp thành 5×6 hướng màn chiếu.';
    wrap.appendChild(hint);
  } else if (idx === 3) {
    const note = document.createElement('p');
    note.className = 'muted';
    note.innerHTML = 'Robot Unitree <b style="color:var(--accent)">G1</b> (humanoid) + <b style="color:var(--accent)">Go2</b> (quadruped) đang demo trong vùng test.';
    wrap.appendChild(note);
  }
}

function showInfo(idx) {
  const tag = document.getElementById('infoTag');
  const title = document.getElementById('infoTitle');
  const body = document.getElementById('infoBody');
  if (idx < 0) {
    tag.textContent = 'Tổng quan';
    title.textContent = 'K-SPACE — Industrial Luxury';
    body.innerHTML = `
      <p>Concept <b>Contemporary Industrial Luxury</b>: bê tông đánh bóng, walnut perforated, inox xước, kính teal. Click tab T1–T5/Mái để fly camera vào từng tầng.</p>
      <ul class="kv">
        <li><span>Diện tích sàn</span><b>140 m²/tầng</b></li>
        <li><span>Tổng diện tích</span><b>~840 m²</b></li>
        <li><span>Cao công trình</span><b>~17.4 m</b></li>
        <li><span>Tổng nội thất</span><b>${countAllFurniture()} items</b></li>
      </ul>`;
    return;
  }
  const info = FLOOR_INFO[idx];
  tag.textContent = info.tag;
  title.textContent = info.title;
  let kv = '<ul class="kv">';
  for (const [k, v] of info.kv) kv += `<li><span>${k}</span><b>${v}</b></li>`;
  kv += '</ul>';
  body.innerHTML = `<p>${info.body}</p>${kv}`;
}

function countAllFurniture() {
  let n = 0;
  for (let i = 0; i < 6; i++) n += countFurniture(i);
  return n;
}

// ============================================================
// COMMENTS (localStorage)
// ============================================================
const COMMENT_KEY = 'kspace-comments-v1';
const NAME_KEY = 'kspace-name-v1';

function getAllComments() {
  try { return JSON.parse(localStorage.getItem(COMMENT_KEY) || '[]'); }
  catch { return []; }
}
function getComments(idx) {
  return getAllComments().filter(c => c.floor === idx).sort((a, b) => b.time - a.time);
}
function saveComment(c) {
  const all = getAllComments();
  all.push(c);
  localStorage.setItem(COMMENT_KEY, JSON.stringify(all));
}
function deleteComment(time) {
  const all = getAllComments().filter(c => c.time !== time);
  localStorage.setItem(COMMENT_KEY, JSON.stringify(all));
}

function renderComments(idx) {
  const wrap = document.getElementById('commentSection');
  if (idx < 0) {
    wrap.innerHTML = '';
    return;
  }
  const list = getComments(idx);
  const savedName = localStorage.getItem(NAME_KEY) || '';
  wrap.innerHTML = `
    <h3>Góp ý cho ${FLOOR_INFO[idx].name}</h3>
    <form id="commentForm" class="comment-form">
      <input type="text" id="cName" placeholder="Tên" value="${escapeHtml(savedName)}" required maxlength="40" />
      <textarea id="cText" placeholder="Góp ý / đề xuất cho tầng này..." required maxlength="500"></textarea>
      <button type="submit" class="btn btn--accent">Gửi góp ý</button>
    </form>
    <div class="comment-list">
      ${list.length === 0 ? '<p class="muted">Chưa có góp ý nào.</p>' :
      list.map(c => `
        <div class="comment-item">
          <div class="ci-head">
            <b>${escapeHtml(c.name)}</b>
            <span class="ci-time">${formatTime(c.time)}</span>
            <button class="ci-del" data-time="${c.time}" title="Xóa">×</button>
          </div>
          <p>${escapeHtml(c.text)}</p>
        </div>`).join('')}
    </div>
  `;
  const form = document.getElementById('commentForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const text = document.getElementById('cText').value.trim();
    if (!name || !text) return;
    localStorage.setItem(NAME_KEY, name);
    saveComment({ floor: idx, name, text, time: Date.now() });
    renderComments(idx);
    buildFloorList();
  });
  wrap.querySelectorAll('.ci-del').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteComment(parseInt(btn.dataset.time, 10));
      renderComments(idx);
      buildFloorList();
    });
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatTime(t) {
  const d = new Date(t);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// EVENTS — clicks, tabs, buttons
// ============================================================
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => selectFloor(parseInt(t.dataset.floor, 10)));
});
document.getElementById('explodeBtn').addEventListener('click', () => {
  exploded = !exploded;
  const btn = document.getElementById('explodeBtn');
  btn.classList.toggle('active', exploded);
  btn.textContent = exploded ? 'Gộp tầng' : 'Tách tầng';
  updateFurnitureVisibility();
  markShadowDirty();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  selectFloor(-1);
  flyTo(CAM_HOME, TARGET_HOME);
});
document.querySelectorAll('.view-btn').forEach(b => {
  b.addEventListener('click', () => { applyViewMode(b.dataset.view); markShadowDirty(); });
});
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('app').classList.toggle('sidebar-collapsed');
});

// click furniture
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let downPos = null;
canvas.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
  requestRender();
});
canvas.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
  if (Math.hypot(dx, dy) > 4) { downPos = null; return; }
  downPos = null;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(building, true);
  if (hits.length === 0) {
    selectFurniture(null);
    return;
  }
  // tìm ancestor có isFurniture
  let furnGroup = null;
  let h = hits[0];
  let o = h.object;
  while (o && o !== building) {
    if (o.userData && o.userData.isFurniture) { furnGroup = o; break; }
    o = o.parent;
  }
  if (furnGroup) {
    selectFurniture(furnGroup, e.clientX, e.clientY);
  } else {
    const y = h.point.y;
    let idx = 0;
    for (let i = 0; i < 6; i++) {
      const top = i < 5 ? FLOOR_BASE[i] + FLOOR_HEIGHTS[i] : LEVELS.ROOF + 3;
      if (y < top) { idx = i; break; }
      idx = 5;
    }
    selectFurniture(null);
    selectFloor(idx);
  }
  requestRender();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { selectFurniture(null); }
});

// ============================================================
// ANIMATION LOOP
// ============================================================
const EXPLODE_GAP = 1.8;
let elevatorY = 0, targetElevatorY = 0;
let elevAutoIdx = 0, elevAutoTimer = 0;
const ELEV_STOPS = [LEVELS.T1, LEVELS.T2, LEVELS.T3, LEVELS.T4, LEVELS.T5];

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  let anyAnimating = false;

  // EXPLODE TWEEN — chỉ update khi chưa settle
  for (let i = 0; i < floorGroups.length; i++) {
    const target = exploded ? i * EXPLODE_GAP : 0;
    const cur = floorGroups[i].position.y;
    if (Math.abs(target - cur) > 0.001) {
      floorGroups[i].position.y = cur + (target - cur) * Math.min(1, dt * 4);
      anyAnimating = true;
    } else if (cur !== target) {
      floorGroups[i].position.y = target;
    }
  }
  if (anyAnimating) {
    for (let i = 0; i < highlightBoxes.length; i++) {
      const baseTarget = exploded ? i * EXPLODE_GAP : 0;
      const baseY = i < 5 ? FLOOR_BASE[i] + FLOOR_HEIGHTS[i] / 2 : LEVELS.ROOF + 1.25;
      highlightBoxes[i].position.y = baseY + baseTarget;
    }
  }

  // ELEVATOR auto-loop khi ở tổng quan; trigger render khi cabin đang move
  if (currentFloor === -1) {
    elevAutoTimer -= dt;
    if (elevAutoTimer <= 0) {
      elevAutoIdx = (elevAutoIdx + 1) % ELEV_STOPS.length;
      targetElevatorY = ELEV_STOPS[elevAutoIdx];
      elevAutoTimer = 2.4;
    }
  }
  if (Math.abs(targetElevatorY - elevatorY) > 0.001) {
    elevatorY += (targetElevatorY - elevatorY) * Math.min(1, dt * 1.6);
    let elevExplode = 0;
    if (exploded) {
      let nearIdx = 0, nd = 1e9;
      for (let i = 0; i < 5; i++) {
        const d = Math.abs(ELEV_STOPS[i] - elevatorY);
        if (d < nd) { nd = d; nearIdx = i; }
      }
      elevExplode = nearIdx * EXPLODE_GAP;
    }
    elevatorGroup.position.y = elevatorY + elevExplode;
    anyAnimating = true;
  }

  // CAM TWEEN
  if (camTweenT < 1) {
    camTweenT = Math.min(1, camTweenT + dt * 1.0);
    const k = 1 - Math.pow(1 - camTweenT, 3);
    camera.position.lerpVectors(camTweenStart, camTweenEnd, k);
    controls.target.lerpVectors(tgtTweenStart, tgtTweenEnd, k);
    anyAnimating = true;
  }

  // T2 MEETING TOGGLE — tween 30 ghế giữa stack và meeting positions
  if (t2AnimT < 1) {
    t2AnimT = Math.min(1, t2AnimT + dt * 0.7);
    const k = 1 - Math.pow(1 - t2AnimT, 3);
    for (const c of t2Chairs) {
      const s = c.userData.startPos, t = c.userData.targetPos;
      c.position.x = s.x + (t.x - s.x) * k;
      c.position.y = s.y + (t.y - s.y) * k;
      c.position.z = s.z + (t.z - s.z) * k;
      c.rotation.y = c.userData.startRot + (c.userData.targetRot - c.userData.startRot) * k;
    }
    anyAnimating = true;
  }

  // T4 ROBOT DEMO — chỉ animate khi T4 visible
  const t4Visible = currentFloor === 3 || currentFloor === -1 || exploded;
  if (t4Visible && t4Robot1 && t4Robot2) {
    robotTime += dt;
    // G1 đi quanh zone hình elip chậm
    const r1 = 1.6;
    t4Robot1.position.x = 3.5 + Math.sin(robotTime * 0.45) * r1;
    t4Robot1.position.z = 3.5 + Math.cos(robotTime * 0.45) * r1 * 1.1;
    t4Robot1.rotation.y = robotTime * 0.45 + Math.PI / 2;
    // Go2 chạy circle nhanh hơn
    const r2 = 2.0;
    t4Robot2.position.x = 3.5 + Math.cos(robotTime * 0.85) * r2;
    t4Robot2.position.z = 3.5 + Math.sin(robotTime * 0.85) * r2 * 0.9;
    t4Robot2.rotation.y = -robotTime * 0.85 + Math.PI;
    anyAnimating = true;
  }

  if (selectionHelper && selectedObj) selectionHelper.update();

  controls.update(); // damping fires 'change' nếu camera vẫn di chuyển → set needsRender

  if (anyAnimating) needsRender = true;

  if (needsRender) {
    if (anyAnimating || pendingShadowUpdate) {
      renderer.shadowMap.needsUpdate = true;
      pendingShadowUpdate = false;
    }
    renderer.render(scene, camera);
    if (anyAnimating) {
      idleFrames = 0;
    } else {
      idleFrames++;
      if (idleFrames > 3) needsRender = false;
    }
  }
}
requestAnimationFrame(animate);

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  markShadowDirty();
});

// ============================================================
// INIT
// ============================================================
// ============================================================
// AI RENDER (Gemini 2.0 Flash Image Generation)
// ============================================================
const API_KEY_KEY = 'gemini-api-key';
const RENDER_HISTORY_KEY = 'ai-render-history';
const RATE_LIMIT_MS = 30000;
const DEFAULT_API_KEY = ''; // KHÔNG hardcode key trong source — leak public!
// Thử lần lượt các model image-gen mới nhất; rotate qua khi 404 (Google hay đổi tên).
const GEMINI_IMAGE_MODELS = [
  'gemini-3-pro-image-preview',
  'gemini-3-pro-preview-image',
  'gemini-3-flash-image-preview',
  'gemini-2.5-flash-image-preview',
  'gemini-2.5-flash-image',
];
let lastWorkingModel = null; // cache model đầu tiên thành công để lần sau không thử lại từ đầu
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Vì giờ Gemini lấy góc nhìn từ canvas screenshot, dropdown giờ chọn STYLE thay vì angle
const VIEW_ANGLES = [
  { label: '✨ Photoreal — Sony A7R IV', value: 'magazine-quality architectural photography, shot on Sony A7R IV, 35mm prime lens, natural lighting, sharp focus, photorealistic' },
  { label: '🎬 Cinematic — film grain warm', value: 'cinematic interior photography, film grain, warm color grade, slight vignette, anamorphic feel, Wong Kar-wai style' },
  { label: '☀️ Bright daylight', value: 'bright sunny daylight pouring through windows, light and airy mood, white balance neutral, high key lighting' },
  { label: '🌙 Evening warm', value: 'golden hour evening lighting, warm 2700K interior lights glowing, soft shadows, cozy atmosphere, dusk through windows' },
  { label: '🏗️ Architectural visualization', value: 'high-end architectural visualization, Vray-style CGI render, dramatic lighting, ambient occlusion, slight depth of field' },
];

const FLOOR_CONFIGS = [
  {
    name: 'Tầng 1 — Sảnh & Showroom', width: 10, depth: 14, ceilingHeight: 3.8,
    concept: 'lobby showroom and meeting',
    description: `lobby and showroom with glass display cases showing company awards
and project achievements along the brick wall,
reception counter in brushed stainless steel and walnut wood,
digital check-in kiosk with glowing teal screen,
large geometric art wall mosaic in pastel teal coral and beige
on perforated walnut panel as focal point near staircase,
starlight LED ceiling panel with tiny embedded lights,
2 glass-walled meeting rooms: one for 8 people with 65-inch TV,
one for 6 people with sliding glass door,
mid-century walnut shell chairs in waiting area with marble coffee table,
LED floor strips forming L-shaped path from entrance to elevator,
large indoor plants in concrete planters flanking the entrance,
"K-SPACE" signage in brushed metal above reception`,
  },
  {
    name: 'Tầng 2 — Sales & All-hands', width: 10, depth: 14, ceilingHeight: 3.4,
    concept: 'sales team workspace and town hall',
    description: `open workspace for 10-person sales team along the brick wall side,
2 long bench desks 6 meters each with walnut tops and brushed steel legs,
each desk slot has monitor arm and integrated power rail with green LED indicators,
ergonomic task chairs in black mesh,
opposite side: large 2.4m motorized projector screen on wall for 30-person all-hands meetings,
stackable chairs neatly stored in 5 stacks along the right wall when not in use,
65-inch backup TV mounted on wall,
KPI sales dashboard display glowing on the brick wall,
12-slot personal locker unit in brushed steel,
LED floor strip dividing work zone from town hall zone,
indoor plants as natural dividers`,
  },
  {
    name: 'Tầng 3 — K-City HQ', width: 10, depth: 14, ceilingHeight: 3.4,
    concept: 'corporate back-office headquarters',
    description: `organized corporate back-office for 12 employees,
3 rows of bench desks with walnut tops grouped by department:
front row HR and Admin, middle row Accounting, back row Marketing,
each person has task chair monitor arm and personal desk divider screen,
glass-enclosed boardroom in the back-right corner for 6 people,
boardroom has 65-inch TV for video calls and a whiteboard and a bookshelf,
premium task chairs in the boardroom,
company announcement dashboard display on brick wall,
12-slot locker unit along right wall,
professional clean organized atmosphere with warm 3000K lighting,
indoor plants at each end of the room`,
  },
  {
    name: 'Tầng 4 — AirCity Tech Lab', width: 10, depth: 14, ceilingHeight: 3.4,
    concept: 'technology command center and robotics lab',
    description: `high-tech floor divided into three distinct zones,
COMMAND CENTER in back-right: 2 large 65-inch screens mounted side-by-side
showing colorful property management dashboards with data visualization graphs and maps glowing in teal and blue,
operator desk with 3 task chairs facing the screens,
small black server rack with blinking green LEDs in corner,
darker ambient lighting in command zone for screen visibility,

ROBOT TEST ZONE: large 5x5 meter open area in the front-center,
marked clearly with yellow-orange LED floor strips forming a rectangle border,
warning hatched markers at the 4 corners,
completely empty polished concrete floor inside the zone,
a humanoid robot Unitree G1 (white and blue, 1.3m tall) standing in the zone,
a quadruped robot Unitree Go2 (black and yellow, 0.4m tall) nearby,

DEVELOPER WORKSPACE along the right side: 2 bench desks for 4 engineers,
monitors task chairs and a tall walnut bookshelf,
LED floor strips clearly separating all three zones`,
  },
  {
    name: 'Tầng 5 — Pantry & Chill', width: 10, depth: 14, ceilingHeight: 3.4,
    concept: 'staff recreation and rest area',
    description: `warm relaxing staff recreation floor,
KITCHEN AREA along brick wall: 3-meter L-shaped counter with white marble top
and walnut cabinets below, stainless steel sink, 4-burner stove, microwave,
4 bar stools with charcoal cushions along the counter facing the kitchen,
2 dining tables for 4 people each with stackable chairs,

ENTERTAINMENT: full-size 8-ball billiards pool table with green felt surface
and walnut wood rails and thick walnut legs, low-hanging pendant light above,
2-seat sofa nearby for spectators with marble coffee table,

CHILL LOUNGE: large L-shaped modular sofa in dark charcoal fabric,
marble coffee table, walnut bookshelf with books and board games,
large indoor plants in concrete planters,

NAP DORM: capsule-style bunk beds with soft fabric curtain dividers,
separate male and female sections (2 capsule units each = 4 beds per side),
soft dim warm lighting inside each capsule,
overall warm cozy atmosphere with 2700K ambient lighting throughout`,
  },
];

let aiRateLimitUntil = 0;
let aiRateLimitTimer = null;

function getApiKey() {
  return localStorage.getItem(API_KEY_KEY) || DEFAULT_API_KEY || '';
}
function maskApiKey(k) {
  if (!k) return '(chưa có)';
  if (k.length < 12) return '••••••';
  return k.slice(0, 6) + '••••••' + k.slice(-4);
}

function getFurnitureForPrompt(floorIdx) {
  const counts = {};
  floorFurnitureGroups[floorIdx].traverse(obj => {
    if (obj.userData?.tooltip?.name) {
      const name = obj.userData.tooltip.name;
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([n, c]) => `${c}× ${n}`)
    .join(', ');
}

function buildImagePrompt(floorIdx, viewAngle, customNote, hasImageInput = true) {
  const cfg = FLOOR_CONFIGS[floorIdx];
  const furniture = getFurnitureForPrompt(floorIdx);

  if (!hasImageInput) {
    // text-only fallback (giữ prompt cũ)
    let p = `Photorealistic interior architecture render, ${viewAngle}, ${cfg.concept} space, ${cfg.width}m × ${cfg.depth}m, ceiling ${cfg.ceilingHeight}m.\n\n${cfg.description.trim()}\n\nFurniture: ${furniture}.\n\nStyle: contemporary industrial luxury, photorealistic, 8K.`;
    if (customNote?.trim()) p += `\n\nADDITIONAL: ${customNote.trim()}`;
    return p;
  }

  // === IMAGE-TO-IMAGE PROMPT — preserve composition, enhance materials ===
  let prompt = `Transform this 3D architectural rendering into a photorealistic interior photograph.

CRITICAL — PRESERVE EXACTLY from the input image:
- Camera angle, perspective, and framing
- Every furniture position, scale, and orientation
- Room layout, spatial proportions, and architectural elements
- Overall composition and depth

ENHANCE TO PHOTOREAL — replace each material with realistic counterpart:
- Brick wall (left long wall): exposed red-brown brick with mortar joints, slight weathering, matte sealed finish
- Walnut panel walls (right + rear): rich dark walnut wood with vertical grooves, visible wood grain, warm brown tone, subtle satin reflection
- Concrete floor: polished dark charcoal concrete, semi-glossy, soft reflections of furniture and lights
- Concrete ceiling: exposed grey concrete with formwork marks
- Glass facade: tempered glass with realistic refraction, reflecting interior subtly, tropical greenery + city skyline visible outside
- Brushed stainless steel: directional brush texture on furniture frames and reception
- Walnut wood furniture (desks/tables/cabinets): warm brown wood grain, satin matte finish
- Charcoal upholstery (chairs/sofas): textured fabric, soft cushion creases
- LED strips on floor: glowing warm white linear light
- Black linear track lights on ceiling: matte black housing with warm 2700K spotlight pools

LIGHTING:
- Natural daylight from front glass facade (cool 5500K)
- Warm interior 2700-3000K from track lights and pendants
- Soft shadows, ambient occlusion in corners
- Subtle bounce light on ceilings and walls

ADDITIONS for realism:
- Subtle props on desks: laptops, ceramic mugs, plants in concrete pots, papers, books
- Lush tropical greenery + Vietnamese city skyline visible through windows
- Tiny atmospheric particles / haze in light beams

ROOM CONTEXT: ${cfg.name} — ${cfg.concept} space.
${cfg.description.trim().split('\n').slice(0, 3).join(' ')}

STYLE: Contemporary industrial luxury, premium architectural photography,
shot on Sony A7R IV with 35mm prime lens, natural lighting,
photorealistic, sharp focus, 8K resolution, magazine-quality.

DO NOT change layout, camera angle, or furniture positions — only upgrade materials and lighting.`;

  if (customNote?.trim()) {
    prompt += `\n\nADDITIONAL REQUEST: ${customNote.trim()}`;
  }
  return prompt;
}

// Chụp 3D scene hiện tại làm reference image cho Gemini.
// Tạm ẩn helper/highlight box trước khi chụp để ảnh sạch.
function captureCanvasBase64() {
  const helperWasVisible = selectionHelper?.visible;
  if (selectionHelper) selectionHelper.visible = false;
  const boxesVisible = highlightBoxes.map(b => b.visible);
  highlightBoxes.forEach(b => (b.visible = false));

  // Force render với state mới — preserveDrawingBuffer:true đảm bảo canvas còn pixel
  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL('image/png');
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');

  if (selectionHelper) selectionHelper.visible = helperWasVisible;
  highlightBoxes.forEach((b, i) => (b.visible = boxesVisible[i]));
  requestRender();
  return base64;
}

async function tryModel(model, prompt, apiKey, imageBase64) {
  const url = `${GEMINI_BASE}/${model}:generateContent`;
  const parts = [];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/png', data: imageBase64 } });
  }
  parts.push({ text: prompt });
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });
  if (response.status === 404) return { notFound: true, model };
  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch {}
    const err = new Error(`HTTP ${response.status}`);
    err.status = response.status;
    err.body = body;
    err.model = model;
    throw err;
  }
  const data = await response.json();
  return { data, model };
}

async function generateImage(prompt, apiKey, imageBase64) {
  const order = lastWorkingModel
    ? [lastWorkingModel, ...GEMINI_IMAGE_MODELS.filter(m => m !== lastWorkingModel)]
    : GEMINI_IMAGE_MODELS;

  for (const model of order) {
    try {
      const result = await tryModel(model, prompt, apiKey, imageBase64);
      if (result.notFound) {
        console.warn(`[AI] Model 404: ${model}, thử tiếp...`);
        continue;
      }
      lastWorkingModel = result.model;
      console.info(`[AI] Generate qua model: ${result.model}`);
      return result.data;
    } catch (err) {
      if (err.status && err.status !== 404) throw err;
    }
  }
  const err = new Error('Tất cả Gemini image models đều 404. Có thể API key chưa enable cho image gen.');
  err.status = 404;
  err.allTried = GEMINI_IMAGE_MODELS;
  throw err;
}

function extractImage(response) {
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return {
        mimeType: part.inlineData.mimeType,
        base64: part.inlineData.data,
        src: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
      };
    }
  }
  const textPart = parts.find(p => p.text);
  return { error: true, text: textPart?.text || 'Không generate được hình. Gemini không trả về image part.' };
}

function getHistory() {
  try { return JSON.parse(sessionStorage.getItem(RENDER_HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveToHistory(entry) {
  const all = getHistory();
  all.unshift(entry);
  while (all.length > 3) all.pop();
  try { sessionStorage.setItem(RENDER_HISTORY_KEY, JSON.stringify(all)); }
  catch (e) { console.warn('AI history sessionStorage save failed:', e.message); }
}

function renderAiHistory() {
  const wrap = document.getElementById('aiHistory');
  const all = getHistory();
  if (all.length === 0) {
    wrap.innerHTML = '<span class="muted">Chưa có history.</span>';
    return;
  }
  wrap.innerHTML = all.map((e, i) => {
    const fname = `K-Space-T${e.floor + 1}-${e.timestamp}.png`;
    const ts = new Date(e.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    return `<img class="ai-history-thumb" data-idx="${i}" src="${e.src}" title="T${e.floor + 1} · ${ts}" alt="render ${i}">`;
  }).join('');
  wrap.querySelectorAll('.ai-history-thumb').forEach(t => {
    t.addEventListener('click', () => {
      const e = all[parseInt(t.dataset.idx, 10)];
      showResultImage(e.src, e);
    });
  });
}

function showResultImage(src, meta) {
  const wrap = document.getElementById('aiResult');
  const ts = meta?.timestamp || Date.now();
  const fname = `K-Space-T${(meta?.floor ?? currentFloor) + 1}-${ts}.png`;
  wrap.innerHTML = `
    <div class="ai-img-wrap">
      <img class="ai-result-img" src="${src}" alt="AI render result">
      <button class="ai-download-btn">⬇ Save PNG</button>
    </div>
  `;
  wrap.querySelector('.ai-download-btn').addEventListener('click', () => downloadImage(src, fname));
}

function showResultText(text) {
  document.getElementById('aiResult').innerHTML = `
    <div class="ai-text-result">
      <p><b>Gemini không trả về hình. Phản hồi:</b></p>
      <p>${escapeHtml(text)}</p>
      <button id="aiCopyTextBtn" class="btn btn--ghost">Copy prompt</button>
      <button id="aiRetryBtn" class="ai-generate-btn" style="display:inline-block; flex:0 0 auto;">Thử lại</button>
    </div>
  `;
  document.getElementById('aiCopyTextBtn').addEventListener('click', copyPromptToClipboard);
  document.getElementById('aiRetryBtn').addEventListener('click', handleAiGenerate);
}

function showResultError(msg) {
  document.getElementById('aiResult').innerHTML = `
    <div class="ai-error">
      <p>⚠ ${escapeHtml(msg)}</p>
      <button id="aiCopyErrBtn" class="btn btn--ghost">Copy prompt fallback</button>
    </div>
  `;
  document.getElementById('aiCopyErrBtn').addEventListener('click', copyPromptToClipboard);
}

function showResultPlaceholder() {
  document.getElementById('aiResult').innerHTML = `
    <div class="ai-placeholder">Chưa generate. Bấm <b>★ Generate</b> để bắt đầu.<br>(Mỗi lần ~ 15–30 giây)</div>
  `;
}

function showResultLoading() {
  document.getElementById('aiResult').innerHTML = `
    <div class="ai-loading">
      <div class="ai-spinner"></div>
      <p>Đang generate qua Gemini... (~15–30 giây)</p>
      <div class="ai-progress"><div class="ai-progress-bar"></div></div>
    </div>
  `;
}

function downloadImage(src, filename) {
  const a = document.createElement('a');
  a.href = src;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function copyPromptToClipboard() {
  const va = document.getElementById('aiViewAngle').value;
  const note = document.getElementById('aiCustomNote').value;
  const idx = (currentFloor >= 0 && currentFloor <= 4) ? currentFloor : 0;
  const prompt = buildImagePrompt(idx, va, note);
  navigator.clipboard.writeText(prompt).then(() => {
    const btn = document.getElementById('aiCopyBtn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Đã copy';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
    }
  }).catch(err => alert('Không copy được: ' + err.message));
}

async function handleAiGenerate() {
  if (Date.now() < aiRateLimitUntil) return;
  if (currentFloor < 0 || currentFloor > 4) {
    showResultError('Tầng "Mái" chưa có config render. Chọn T1–T5.');
    return;
  }
  let apiKey = getApiKey();
  if (!apiKey) {
    promptForApiKey();
    apiKey = getApiKey();
    if (!apiKey) {
      showResultError('Cần nhập Gemini API key trước. Tạo free key tại aistudio.google.com/apikey');
      return;
    }
  }

  const va = document.getElementById('aiViewAngle').value;
  const note = document.getElementById('aiCustomNote').value;

  // Chụp 3D scene hiện tại làm reference cho image-to-image
  const imageBase64 = captureCanvasBase64();
  const prompt = buildImagePrompt(currentFloor, va, note, true);

  showResultLoading();
  const btn = document.getElementById('aiGenerateBtn');
  btn.disabled = true;
  btn.textContent = 'Đang generate...';

  try {
    const resp = await generateImage(prompt, apiKey, imageBase64);
    const result = extractImage(resp);
    if (result.error) {
      showResultText(result.text);
    } else {
      const entry = {
        floor: currentFloor,
        viewAngle: va,
        timestamp: Date.now(),
        src: result.src,
      };
      saveToHistory(entry);
      renderAiHistory();
      showResultImage(result.src, entry);
    }
    startAiRateLimit();
  } catch (err) {
    let msg = err.message || 'Lỗi không xác định';
    if (err.status === 401 || err.status === 403) msg = 'API key không hợp lệ hoặc chưa enable Generative Language API. Tạo key mới ở aistudio.google.com.';
    else if (err.status === 429) { msg = 'Vượt rate limit. Thử lại sau 60 giây.'; startAiRateLimit(60000); }
    else if (err.status === 500 || err.status === 503) msg = 'Gemini đang bận. Thử lại sau.';
    else if (err.status === 400) msg = 'Prompt bị reject (có thể do safety filter). Thử "Copy prompt" và paste sang aistudio.google.com.';
    else if (err.status === 404 && err.allTried) msg = `Đã thử ${err.allTried.length} model image-gen, tất cả đều 404. Có thể region/API key chưa được enable. Dùng "Copy prompt" → aistudio.google.com.`;
    showResultError(msg);
  } finally {
    btn.disabled = false;
    updateAiGenerateButton();
  }
}

function startAiRateLimit(ms = RATE_LIMIT_MS) {
  aiRateLimitUntil = Date.now() + ms;
  if (aiRateLimitTimer) clearInterval(aiRateLimitTimer);
  aiRateLimitTimer = setInterval(updateAiGenerateButton, 250);
  updateAiGenerateButton();
}
function updateAiGenerateButton() {
  const btn = document.getElementById('aiGenerateBtn');
  if (!btn) return;
  const remain = aiRateLimitUntil - Date.now();
  if (remain > 0) {
    btn.disabled = true;
    btn.textContent = `Thử lại sau ${Math.ceil(remain / 1000)}s`;
  } else {
    btn.disabled = false;
    btn.textContent = '★ Generate';
    if (aiRateLimitTimer) { clearInterval(aiRateLimitTimer); aiRateLimitTimer = null; }
  }
}

function promptForApiKey() {
  const cur = localStorage.getItem(API_KEY_KEY) || '';
  const k = window.prompt('Nhập Gemini API Key (lưu localStorage, chỉ gửi tới generativelanguage.googleapis.com):', cur);
  if (k && k.trim()) {
    localStorage.setItem(API_KEY_KEY, k.trim());
    const km = document.getElementById('aiKeyMask');
    if (km) km.textContent = maskApiKey(k.trim());
  }
}

function openAiModal() {
  if (currentFloor < 0 || currentFloor > 4) {
    alert('Chọn 1 tầng (T1–T5) trước khi AI Render.');
    return;
  }
  document.getElementById('aiFloorName').textContent = FLOOR_CONFIGS[currentFloor].name;
  document.getElementById('aiCustomNote').value = '';
  const km = document.getElementById('aiKeyMask');
  if (km) km.textContent = maskApiKey(getApiKey()) || '(chưa có — bấm Edit)';
  showResultPlaceholder();
  renderAiHistory();
  document.getElementById('aiModal').hidden = false;
  updateAiGenerateButton();
}
function closeAiModal() {
  document.getElementById('aiModal').hidden = true;
}

// Populate dropdown + wire up
(function initAiUi() {
  const sel = document.getElementById('aiViewAngle');
  sel.innerHTML = VIEW_ANGLES.map(a => `<option value="${escapeHtml(a.value)}">${escapeHtml(a.label)}</option>`).join('');
  document.getElementById('aiRenderBtn').addEventListener('click', openAiModal);
  document.getElementById('aiCloseBtn').addEventListener('click', closeAiModal);
  document.getElementById('aiGenerateBtn').addEventListener('click', handleAiGenerate);
  document.getElementById('aiCopyBtn').addEventListener('click', copyPromptToClipboard);
  // aiEditKeyBtn đã được ẩn khỏi UI; nếu cần đổi key, dùng DevTools clear localStorage
  const editBtn = document.getElementById('aiEditKeyBtn');
  if (editBtn) editBtn.addEventListener('click', promptForApiKey);
  document.getElementById('aiModal').addEventListener('click', (e) => {
    if (e.target.id === 'aiModal') closeAiModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('aiModal').hidden) closeAiModal();
  });
})();

// ============================================================
// INIT
// ============================================================
buildFloorList();
showInfo(-1);
buildFurnitureList(-1);
renderSpecialActions(-1);
applyViewMode('solid');
updateFurnitureVisibility();
markShadowDirty();

setTimeout(() => {
  document.getElementById('loader').classList.add('hidden');
}, 350);
