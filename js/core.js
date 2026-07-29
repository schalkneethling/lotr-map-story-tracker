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

// Smooth path through pts with quadratic midpoints. For closed paths pass
// the points without a duplicated endpoint. hard[i] = true emits point i
// exactly (a sharp vertex) instead of curving past it.
function smoothPathD(pts, closed, hard) {
  const n = pts.length;
  const P = (p) => `${p[0]} ${p[1]}`;
  let d = `M ${P(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 1; i <= last; i++) {
    const p = pts[i % n], prev = pts[(i - 1) % n];
    if (hard && hard[i % n]) d += ` Q ${P(prev)} ${P(p)}`;
    else d += ` Q ${P(prev)} ${(prev[0] + p[0]) / 2} ${(prev[1] + p[1]) / 2}`;
  }
  if (closed) return d + " Z";
  return hard && hard[n - 1] ? d : d + ` L ${P(pts[n - 1])}`;
}

// Locates the sharpest point of a corner that fell between samples:
// ternary-search the arc span [lo, hi] for the point farthest from the
// chord a→c (unimodal near a corner).
function refineCorner(pathEl, lo, hi, a, c) {
  let ux = c[0] - a[0], uy = c[1] - a[1];
  const um = Math.hypot(ux, uy) || 1;
  ux /= um; uy /= um;
  const dist = (t) => {
    const p = pathEl.getPointAtLength(t);
    return Math.abs((p.x - a[0]) * uy - (p.y - a[1]) * ux);
  };
  for (let it = 0; it < 20; it++) {
    const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
    if (dist(m1) < dist(m2)) lo = m1; else hi = m2;
  }
  const p = pathEl.getPointAtLength((lo + hi) / 2);
  return [p.x, p.y];
}

// Re-samples a path and displaces its points with smooth noise, replacing
// the "d" attribute. Three kinds of points are kept exactly in place so
// the wobble cannot break the drawing's topology:
//   - sharp corners (authored landmarks like the Gulf of Lune notch),
//     recovered to their true position with refineCorner;
//   - endpoints of open paths (river mouths that must stay fused to the
//     coast, whose matching corner is likewise undisplaced);
//   - points matching opts.pin (e.g. the map border, so the sea stays
//     flush with the slab edge).
function roughenPath(pathEl, amp, step, opts) {
  opts = opts || {};
  const len = pathEl.getTotalLength();
  if (!len) return;
  const closed = /z\s*$/i.test(pathEl.getAttribute("d") || "");
  const n = Math.max(4, Math.round(len / step));
  const raw = [];
  for (let i = 0; i <= n; i++) {
    const p = pathEl.getPointAtLength((i / n) * len);
    raw.push([p.x, p.y]);
  }
  if (closed) raw.pop(); // duplicate of raw[0]
  const count = raw.length;
  const seg = len / n;

  // cosine of the direction change at sample i (1 = straight)
  const bendAt = (i) => {
    if (!closed && (i === 0 || i === count - 1)) return 1;
    const a = raw[(i - 1 + count) % count], b = raw[i], c = raw[(i + 1) % count];
    const d1x = b[0] - a[0], d1y = b[1] - a[1], d2x = c[0] - b[0], d2y = c[1] - b[1];
    const m = Math.hypot(d1x, d1y) * Math.hypot(d2x, d2y);
    return m ? (d1x * d2x + d1y * d2y) / m : 1;
  };
  const CORNER = 0.82; // ~35° per sample

  const pts = [], hard = [];
  const push = (p, h) => { pts.push(p); hard.push(h); };
  let i = 0;
  while (i < count) {
    if (bendAt(i) < CORNER) {
      // collapse the run of bent samples into one exact corner vertex
      let j = i;
      while (j + 1 < count && bendAt(j + 1) < CORNER) j++;
      const a = raw[(i - 1 + count) % count], c = raw[(j + 1) % count];
      push(refineCorner(pathEl, Math.max(0, (i - 1) * seg), Math.min(len, (j + 1) * seg), a, c), true);
      i = j + 1;
    } else {
      const p = raw[i];
      const pinned = (!closed && (i === 0 || i === count - 1)) ||
        (opts.pin && opts.pin(p[0], p[1]));
      push(pinned ? p : [
        p[0] + wobbleNoise(p[0], p[1]) * amp,
        p[1] + wobbleNoise(p[0] + 137, p[1] + 91) * amp,
      ], !!pinned);
      i++;
    }
  }
  pathEl.setAttribute("d", smoothPathD(pts, closed, hard));
}
