# Building Stage Engines (Isometric 2:1 & 2D Graph/State)

This document covers the math, the SVG layer structure and the animation loop for the two main simulation stage builders.

## Table of contents
1. [Common contract of every Stage Engine](#1-common-contract-of-every-stage-engine)
2. [Engine 1: Isometric 2:1 SVG Stage](#2-engine-1-isometric-21-svg-stage)
3. [9 Isometric Entity Archetypes](#3-9-isometric-entity-archetypes)
4. [Rounded links, arrow clipping & 60fps packet particles](#4-rounded-links-arrow-clipping--60fps-packet-particles)
5. [Pan, Zoom & viewport Auto-Fit](#5-pan-zoom--viewport-auto-fit)
6. [Engine 2: 2D Graph / Memory / Timeline Stage](#6-engine-2-2d-graph--memory--timeline-stage) *(spec only, not in the starter)*

---

## 1. Common contract of every Stage Engine

Whether it draws a fake-3D isometric view or a flat 2D diagram, every engine should expose the same minimal API surface so the UI Shell can swap engines easily:

```js
class StageEngine {
  constructor(hostElement) {}
  setScene(scene, opts = { animate: true, preserveView: false }) {}
  fit(animate = true) {}
  retheme() {}
  setPaused(paused) {}
  destroy() {}
}
```

---

## 2. Engine 1: Isometric 2:1 SVG Stage

### Isometric 2:1 projection
The standard 2:1 pixel-art / technical ratio gives smooth diagonals, an easy grid, and needs no heavy trigonometry:

```js
const TILE_W = 14; // Half width of the base diamond tile (28px total width)
const TILE_H = 7;  // Half height of the base diamond tile (14px total height)
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Project a 3D grid point (x, y, z) to 2D SVG coordinates [sx, sy]
 * - Increasing x: goes down-right (+14, +7)
 * - Increasing y: goes up-right   (+14, -7)
 * - Increasing z: lifts straight up (-z on the SVG Y axis)
 */
export function iso(x, y, z = 0) {
  return [round2(TILE_W * (x + y)), round2(TILE_H * (x - y) - z)];
}
```

### Transform matrices for text/icons lying on block faces
Use these to place text or an icon flat on a slanted face of a box instead of floating straight toward the camera:
- **Right face:** `matrix(1 -0.5 0 1 tx ty)`
- **Left face:** `matrix(1 0.5 0 1 tx ty)`
- **Top face:** `matrix(1 0.5 -1 0.5 tx ty)`

### The 6 SVG layers (`<svg class="stage-svg">`)
Order them from bottom to top so packets do not draw over warning labels:
1. `<rect class="stage-grid">` — Diamond grid background using `<pattern id="iso-grid">` with a radial `<mask>` (`radialGradient`) that fades toward the edges, so the stage looks endless and not hard-framed.
2. `<g class="layer-floor">` — Network areas / partitions (`zone`, VPC, Region, Shard group) drawn on the ground.
3. `<g class="layer-links">` — Wires between entities and protocol labels.
4. `<g class="layer-packets">` — Packet particles moving along the wires.
5. `<g class="layer-ents">` — The 3D entity blocks, **sorted with the Painter's Algorithm**: entities far from the camera are drawn first, near ones later, using the depth key `depth = (x - y) * 100 + z * 0.1` (in the `iso` system above, a larger `x - y` gives a lower `sy`, closer to the viewer).
6. `<g class="layer-over">` & `<g class="layer-hud">` — CPU load bars, status badges (`DOWN`, `CACHE HIT`, `LEADER`), and entity name labels, always on top.

---

## 3. 9 Isometric Entity Archetypes

Each entity builder takes a `spec` and returns `{ floor?, body, over, anchor, footprint }`:
- `anchor`: center point `[sx, sy]` where links connect by default.
- `footprint`: convex polygon `[sx, sy][]` around the base/body of the block, used to clip arrow heads so they stop flush outside the block.

1. **`block` (Server, Service, Load Balancer, Cache, Worker):**
   - Rectangular box with 3 visible faces: the lightest top face (`top`), a mid-tone left face (`left`), and a darker right face (`right`), which implies a light source from the top-left.
   - Lightly round the corners of the top polygon (`radius = 3`) for a soft, illustrated-book style.
2. **`db` (SQL/NoSQL Database, Object Store, Disk):**
   - Upright cylinder: a rectangular body joined to an elliptical arc base `A rx ry 0 0 0 ...` and an `<ellipse>` lid on top. Add 1–2 horizontal bands to suggest storage platters.
3. **`queue` (Kafka Partition, RabbitMQ, Job Buffer):**
   - Horizontal trough split into several parallel slots. Fill the number of occupied slots through `fill` / `cpu` so the learner sees whether the queue is backing up or clear.
4. **`device` (Client Browser, Mobile App, IoT Sensor):**
   - Thin block with a softly glowing screen frame, representing the user's end device.
5. **`crowd` (User group / Traffic Generator):**
   - Cluster of 3–5 user icons or source dots offset from each other on one grid cell. Use it to show thousands or millions of concurrent users.
6. **`zone` (VPC, Availability Zone, Private Subnet, Cache Layer):**
   - Drawn in `layer-floor`: a large rounded dashed diamond (`stroke-dasharray="5 4"`), a very pale fill (`opacity: 0.35`), and a small uppercase label at the lower edge corner.
7. **`panel` (status board, Routing Table, Config Card on the stage)** — *not in the starter:*
   - Upright board showing a few short key-value lines (e.g. a hash table `A-M → Shard 1`, `N-Z → Shard 2`).
8. **`ring` (Consistent Hash Ring, Quorum Circle)** — *not in the starter:*
   - Isometric ellipse lying flat on the ground, with nodes/tokens attached around its perimeter.
9. **`ghost` (Placeholder / inactive standby replica / just-removed node):**
   - Box drawn with a dashed outline only and a transparent fill, to show a slot waiting for autoscale or a failover state.

### Visual states of an entity
- **`cpu` (`0..1`):** Draws a small progress bar above the block: `< 0.65` green, `0.65..0.85` amber, `> 0.85` bright red.
- **`heat: true`:** Switches the block face palette to a warm orange-red tone and adds a light pulse ring (`pulse`) to signal a bottleneck.
- **`dead: true`:** Lowers the body `opacity` to `0.45`, switches to a cold gray tone, and adds a red `DOWN` badge in `layer-over`.

---

## 4. Rounded links, arrow clipping & 60fps packet particles

### Rounding the corners of a link (`roundedPath`)
A link through grid points `[from, ...via, to]` drawn as a straight `<polyline>` has sharp kinks that are hard to read. Replace each bend vertex `P[i]` with a quadratic curve `Q`:

```js
export function roundedPath(pts, radius = 10) {
  if (pts.length < 2) return '';
  let d = `M${round2(pts[0][0])},${round2(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0);
    const d2 = Math.hypot(x2 - x1, y2 - y1);
    if (d1 < 0.01 || d2 < 0.01) continue;
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const sx = x1 + ((x0 - x1) / d1) * r;
    const sy = y1 + ((y0 - y1) / d1) * r;
    const ex = x1 + ((x2 - x1) / d2) * r;
    const ey = y1 + ((y2 - y1) / d2) * r;
    d += ` L${round2(sx)},${round2(sy)} Q${round2(x1)},${round2(y1)} ${round2(ex)},${round2(ey)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${round2(last[0])},${round2(last[1])}`;
}
```

### Clipping the link end outside the block (`clipPolylineToFootprint`)
If a wire runs from the center of entity A to the center of entity B, the arrow head ends up hidden under block B. The cleanest fix:
- Compute the convex hull (`footprint`) or a radius around the entity center.
- Run a 20-iteration binary search on the segment that enters the center to find the intersection with the polygon boundary, then back off another `margin = 6px` so the arrow head stops right at the block wall.

### The `requestAnimationFrame` packet loop
- After building the `<path>` for each `link`, call `pathElement.getTotalLength()` and store the total length as `totalLen`.
- Each `flow` keeps a spawn timer (`spawnAcc`). Each frame (`dt = Math.min(0.05, (now - last) / 1000)` — clamp to `0.05s`, or a learner returning to the tab spawns hundreds of particles at once):
  - Advance the `t` of each live particle by `speed * dt`.
  - Get the position on the curve with `pathElement.getPointAtLength(progress * totalLen)` and update `transform="translate(x, y)"`.
  - Set packet color/shape through CSS classes: `.pkt--req` (blue), `.pkt--res` (green), `.pkt--write` (violet), `.pkt--slow` (large orange, slow), `.pkt--drop` (red, disappears mid-path at `progress = 0.65` with a small burst ring `fx--fail`).

---

## 5. Pan, Zoom & viewport Auto-Fit

- Compute the bounding box (`bbox = [minX, minY, maxX, maxY]`) of every entity and link in the `scene`, plus `padding = 44px` on each side.
- **Cap the zoom level** (starter: `MAX_ZOOM = 1.6`). Without the cap, a scene with few entities is zoomed 3–4x and text and labels overlap.
- Put a link label at the **midpoint of the middle segment** of the polyline, not at the middle element of the point array (with 2 points, `pts[len/2]` is the end point, so the label slips under the target block).
- Set `svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`)`. When moving between two steps of the same lesson, interpolate the 4 values `[vx, vy, vw, vh]` over `260ms` with the cubic easing `inOut(t) = t < 0.5 ? 4*t*t*t : 1 - (-2*t + 2)**3`, so the camera glides to the newly expanded part of the architecture.
- Attach a `ResizeObserver` to the stage container so it calls `refit()` when the browser window resizes or the sidebar opens/closes.
- Support mouse drag (`pointerdown`/`pointermove`/`pointerup`) to shift the `viewBox` and mouse wheel (`wheel`) to zoom around the pointer, plus a **Fit** button to reset the default view.

---

## 6. Engine 2: 2D Graph / Memory / Timeline Stage

Use it when teaching **Data Structures & Algorithms (DSA), the JS Event Loop, Concurrency, Memory, or packet-by-packet network protocols**:

- **Coordinate system:** A direct flat 2D grid `(col * 96, row * 72)` (no isometric tilt), so adjacent array cells, binary trees, memory page tables and the pointers `i`, `j`, `left`, `right` line up exactly.
- **2D entity archetypes to provide:**
  - `array`: Row of adjacent square cells with indexes `0..n-1` below. Highlight cells being compared (`activeIndices`) or finalized (`sortedIndices`), with arrow pointer labels above (`low`, `mid`, `high`).
  - `treeNode` / `graphNode`: Circle or rounded rectangle with a state of `unvisited | frontier | visited | target`.
  - `stack` / `lane`: Vertical column or horizontal lane for `Call Stack`, `Web APIs`, `Microtask Queue`, `Task Queue`.
  - `lifeline`: Vertical column for a Sequence Diagram (Client, TLS Server, Auth Server), where time arrows flow top to bottom in `step` order.
- Reuse the same `metrics` strip (e.g. `Comparisons`, `Swaps`, `Time Complexity`, `Auxiliary Space`) and the `changes` list in the guide column of the UI Shell.
