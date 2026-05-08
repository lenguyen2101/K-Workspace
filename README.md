# K-Workspace · K-SPACE 3D Interactive HQ

Interactive 3D model of the K-SPACE office building (10m × 14m, 5 floors + rooftop) — built with Three.js, with photoreal AI render via Gemini 3.

**Concept:** Contemporary Industrial Luxury — gạch mộc, walnut perforated, polished concrete, brushed inox, kính teal, mid-century furniture.

## Tính năng

- **Mô hình 3D đúng tỷ lệ kiến trúc** theo bản vẽ KT-00: cao độ FFL T1 ±0.000, T2 +3.800, T3 +7.200, T4 +10.600, T5 +14.000, mái +17.400
- **40+ furniture components** custom Three.js (`furniture.js`): meeting tables, glass partitions, bench desks, shell/task chairs, capsule beds, pool table, kitchen counter, Unitree G1 + Go2 robots…
- **Bố trí công năng đa tầng**: T1 Sảnh & Showroom · T2 Sales & All-hands · T3 K-City HQ · T4 AirCity Tech Lab · T5 Pantry & Chill
- **Tính năng đặc biệt**:
  - T2 toggle "Chế độ họp" — 30 ghế xếp tween smooth từ stack → grid 5×6 hướng projector
  - T4 robot animation — Unitree G1 + Go2 di chuyển trong robot test zone
  - Thang máy kính animate + cầu thang bê tông
  - Exploded view tách tầng
- **Interactions**: OrbitControls (drag rotate / scroll zoom / right-pan), click furniture → tooltip name+dims+ref+price, BoxHelper outline, view modes Solid/X-ray/Wireframe
- **Comments per floor** — localStorage, badge count trên sidebar
- **AI Render** — chụp 3D scene + gọi Gemini 3 Pro Image Preview để generate photorealistic interior photo giữ nguyên composition

## Performance

- Render-on-demand (skip `renderer.render()` khi cảnh tĩnh)
- `shadowMap.autoUpdate = false`, dirty-trigger thủ công
- Geometry segments giảm (cyl 8, sph 8) + share materials/geometries
- Furniture per-floor visibility toggle khi chọn tầng cụ thể
- Shadow casters chỉ giữ tường ngoài + cột + slab + bàn lớn

## Tech stack

- **Three.js** r160 (qua `<script type="importmap">` từ unpkg)
- **OrbitControls** với damping + zoomToCursor + touch DOLLY_PAN cho trackpad
- Vanilla JS — không build step, không framework
- **Gemini API** — `gemini-3-pro-image-preview` cho image-to-image render

## Chạy local

```bash
python3 -m http.server 8765
# rồi mở http://localhost:8765
```

ES modules cần HTTP server, không chạy được qua `file://`.

## API Key cho AI Render

Tính năng AI Render gọi Gemini 3 Pro Image Preview cần API key của bạn:

1. Lấy free key tại https://aistudio.google.com/apikey
2. Mở app → click **★ AI Render** → modal tự prompt nhập key
3. Key lưu trong `localStorage` của browser, chỉ gửi tới `generativelanguage.googleapis.com`
4. Đổi key bất kỳ lúc nào qua nút **Edit** ở footer modal

**Quan trọng**: KHÔNG hardcode key vào source rồi push public — bot scrape GitHub sẽ phát hiện trong vài phút và lạm dụng billing.

## Cấu trúc

```
├── index.html       # UI: sidebar + topbar + info panel + AI modal
├── styles.css       # Dark theme industrial luxury palette
├── main.js          # Three.js scene + building shell + populate floors + interactions + AI render
├── furniture.js     # 40+ exported furniture components (M = shared materials)
└── README.md
```

## Bản vẽ tham chiếu

5 tầng + tum mái theo bản vẽ KT-00 của TTT Corporation. Lưới cột A-D × 1-2 (nhịp 5.85 + 3.75 + 4.4 × 5+5m). Cầu thang 2 vế bê tông + thang máy 1.85×1.85m ở khu B-C giáp trục 1.

---

© 2026 · K-City. Built with Claude Code (Opus 4.7).
