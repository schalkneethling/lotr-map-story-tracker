/* ============================================================
 * core.js — shared rendering utilities: SVG helpers, seeded
 * randomness, the isometric projection, constant-screen-size
 * label scaling, depth-sorted scenery, and geometry "roughing".
 *
 * The hand-drawn wobble is baked into path geometry once at
 * build time instead of using an feDisplacementMap filter:
 * live SVG filters are CPU-rasterized on every zoom/pan frame,
 * which is what caused rendering flicker.
 * ============================================================ */

// World (flat map) coordinate space
const WORLD_W = 1000;
const WORLD_H = 780;

// Screen viewBox
const MAP_W = 1500;
const MAP_H = 1000;

const SVG_NS = "http://www.w3.org/2000/svg";

// Isometric projection: 30° dimetric, slightly scaled down
const ISO_SC = 0.9;
const ISO_CX = ISO_SC * Math.cos(Math.PI / 6); // ~0.779
const ISO_CY = ISO_SC * Math.sin(Math.PI / 6); // 0.45
const ISO_OX = 640;
const ISO_OY = 70;

// world (x, y[, height above ground]) -> screen point
function isoPoint(x, y, z) {
  return {
    x: (x - y) * ISO_CX + ISO_OX,
    y: (x + y) * ISO_CY + ISO_OY - (z || 0),
  };
}

// Deterministic pseudo-random, so the map looks the same every load
function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function el(name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

/* ---------- constant screen-size labels & tokens ---------- */

// Groups that keep a constant on-screen size: they get scale(k) applied,
// where k is the current zoom ratio (1 = whole map, smaller = zoomed in).
const ZOOM_SCALED = [];
let lastZoomK = null;

// pre = map-unit offset (applied before scaling), post = screen-unit offset.
// force re-applies even at an unchanged zoom (after pre/post edits).
function setLabelZoom(k, force) {
  if (!force && lastZoomK !== null && Math.abs(k - lastZoomK) < 0.002) return;
  lastZoomK = k;
  for (let i = 0; i < ZOOM_SCALED.length; i++) {
    const n = ZOOM_SCALED[i];
    n.setAttribute("transform", `${n.dataset.pre || ""} scale(${k}) ${n.dataset.post || ""}`);
  }
}

/* ---------- depth-sorted upright scenery ---------- */

// items: { depth, el } — depth is world x+y (bigger = nearer the viewer)
function makeScene() {
  const items = [];
  return {
    add(wx, wy, node) { items.push({ depth: wx + wy, el: node }); return node; },
    mount(parent) {
      items.sort((a, b) => a.depth - b.depth);
      items.forEach((it) => parent.appendChild(it.el));
    },
  };
}

/* ---------- baked hand-drawn wobble ---------- */

// Smooth deterministic 2D noise in roughly [-1, 1]; cheap sine mix.
function wobbleNoise(x, y) {
  return Math.sin(x * 0.043 + Math.sin(y * 0.031) * 2.7) *
         Math.cos(y * 0.037 + Math.sin(x * 0.029) * 1.9);
}

// Re-samples a path and displaces its points with smooth noise, replacing
// the "d" attribute. The element must be in the document (getTotalLength).
function roughenPath(pathEl, amp, step) {
  const len = pathEl.getTotalLength();
  if (!len) return;
  const closed = /z\s*$/i.test(pathEl.getAttribute("d") || "");
  const n = Math.max(4, Math.round(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = pathEl.getPointAtLength((i / n) * len);
    pts.push([
      p.x + wobbleNoise(p.x, p.y) * amp,
      p.y + wobbleNoise(p.x + 137, p.y + 91) * amp,
    ]);
  }
  // smooth through displaced points with quadratic midpoints
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], p = pts[i];
    d += ` Q ${prev[0]} ${prev[1]} ${(prev[0] + p[0]) / 2} ${(prev[1] + p[1]) / 2}`;
  }
  pathEl.setAttribute("d", closed ? d + " Z" : d + ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`);
}
