/* ============================================================
 * map.js — renders a 2.5D isometric "diorama" of Middle-earth
 * into the #map SVG. The ground plane (parchment, sea, rivers,
 * forests, region names) is projected isometrically; mountains,
 * trees, towers and smoke stand upright and are depth-sorted.
 * Original artwork built from geometry primitives; no
 * copyrighted map images are used.
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

// Groups that keep a constant on-screen size: they get scale(k) applied,
// where k is the current zoom ratio (1 = whole map, smaller = zoomed in).
const ZOOM_SCALED = [];

// pre = map-unit offset (applied before scaling), post = screen-unit offset
function setLabelZoom(k) {
  for (let i = 0; i < ZOOM_SCALED.length; i++) {
    const n = ZOOM_SCALED[i];
    n.setAttribute("transform", `${n.dataset.pre || ""} scale(${k}) ${n.dataset.post || ""}`);
  }
}

/* ---------- upright (billboard) scenery, depth-sorted ---------- */

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

function makePeak(wx, wy, size, lone) {
  const p = isoPoint(wx, wy);
  const h = size * 1.6;
  const g = el("g", { class: "peak" + (lone ? " peak-lone" : "") });
  // sunlit west face and shaded east face
  el("path", {
    d: `M ${p.x - size} ${p.y} L ${p.x} ${p.y - h} L ${p.x + size * 0.22} ${p.y} Z`,
    class: "mtn-light",
  }, g);
  el("path", {
    d: `M ${p.x} ${p.y - h} L ${p.x + size} ${p.y} L ${p.x + size * 0.22} ${p.y} Z`,
    class: "mtn-dark",
  }, g);
  return g;
}

function drawMountainRange(scene, points, rng, opts) {
  opts = opts || {};
  const spacing = opts.spacing || 13;
  const size = opts.size || 8;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.round(len / spacing));
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const wx = x1 + dx * t + (rng() - 0.5) * 10;
      const wy = y1 + dy * t + (rng() - 0.5) * 8;
      const s = size * (0.7 + rng() * 0.6);
      scene.add(wx, wy, makePeak(wx, wy, s));
    }
  }
}

function makeTree(wx, wy) {
  const p = isoPoint(wx, wy);
  const g = el("g", { class: "tree" });
  el("line", { x1: p.x, y1: p.y, x2: p.x, y2: p.y - 2.2, class: "tree-trunk" }, g);
  el("path", {
    d: `M ${p.x - 2.4} ${p.y - 1.6} L ${p.x} ${p.y - 8} L ${p.x + 2.4} ${p.y - 1.6} Z`,
    class: "tree-cone",
  }, g);
  return g;
}

// Small isometric prism marking a major settlement
function makeTower(wx, wy) {
  const p = isoPoint(wx, wy);
  const w = 6, hw = w * 0.5, h = 13;
  const g = el("g", { class: "tower" });
  el("polygon", {
    points: `${p.x - w},${p.y - h} ${p.x},${p.y - h + hw} ${p.x},${p.y + hw} ${p.x - w},${p.y}`,
    class: "tower-left",
  }, g);
  el("polygon", {
    points: `${p.x},${p.y - h + hw} ${p.x + w},${p.y - h} ${p.x + w},${p.y} ${p.x},${p.y + hw}`,
    class: "tower-right",
  }, g);
  el("polygon", {
    points: `${p.x},${p.y - h - hw} ${p.x + w},${p.y - h} ${p.x},${p.y - h + hw} ${p.x - w},${p.y - h}`,
    class: "tower-top",
  }, g);
  return g;
}

function blobPath(cx, cy, rx, ry, rng, wobble) {
  const n = 14;
  let d = "";
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + (rng() - 0.5) * (wobble || 0.35);
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    const prev = pts[i - 1];
    const mx = (prev[0] + p[0]) / 2, my = (prev[1] + p[1]) / 2;
    d += ` Q ${prev[0]} ${prev[1]} ${mx} ${my}`;
  }
  return d + " Z";
}

function drawForest(ground, scene, cx, cy, rx, ry, rng, treeCount) {
  el("path", { d: blobPath(cx, cy, rx, ry, rng), class: "forest" }, ground);
  for (let i = 0; i < treeCount; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * 0.75;
    const wx = cx + Math.cos(a) * rx * r;
    const wy = cy + Math.sin(a) * ry * r;
    scene.add(wx, wy, makeTree(wx, wy));
  }
}

function drawMap(svg) {
  const rng = makeRng(3019); // T.A. 3019
  svg.setAttribute("viewBox", `0 0 ${MAP_W} ${MAP_H}`);

  // ---- defs: subtle hand-drawn wobble for the ground terrain ----
  const defs = el("defs", {}, svg);
  const filter = el("filter", { id: "rough", x: "-5%", y: "-5%", width: "110%", height: "110%" }, defs);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.015", numOctaves: "2", seed: "7", result: "noise" }, filter);
  el("feDisplacementMap", { in: "SourceGraphic", in2: "noise", scale: "3" }, filter);

  // ---- the table slab: extruded edges under the ground plane ----
  const T = 26; // slab thickness
  const A = isoPoint(0, 0), B = isoPoint(WORLD_W, 0), C = isoPoint(WORLD_W, WORLD_H), D = isoPoint(0, WORLD_H);
  const slab = el("g", { id: "slab" }, svg);
  el("polygon", {
    points: `${D.x},${D.y} ${C.x},${C.y} ${C.x},${C.y + T} ${D.x},${D.y + T}`,
    class: "slab-left",
  }, slab);
  el("polygon", {
    points: `${C.x},${C.y} ${B.x},${B.y} ${B.x},${B.y + T} ${C.x},${C.y + T}`,
    class: "slab-right",
  }, slab);

  // ---- ground plane: everything inside is in world coords ----
  const ground = el("g", {
    id: "ground",
    transform: `matrix(${ISO_CX} ${ISO_CY} ${-ISO_CX} ${ISO_CY} ${ISO_OX} ${ISO_OY})`,
    filter: "url(#rough)",
  }, svg);

  el("rect", { x: 0, y: 0, width: WORLD_W, height: WORLD_H, class: "parchment" }, ground);

  // ---- the Great Sea (west and south coast) ----
  const seaD =
    "M 0 0 L 118 0 " +
    "C 128 60 122 110 108 160 " +
    "C 100 195 96 230 92 262 " +
    "L 148 292 L 92 306 " + // Gulf of Lune notch at the Grey Havens
    "C 100 350 112 400 128 450 " +
    "C 145 505 168 555 205 600 " +
    "C 250 650 320 668 385 665 " + // Bay of Belfalas begins
    "C 450 668 520 680 575 700 " +
    "C 610 712 616 700 622 688 " + // Mouths of Anduin
    "C 632 702 660 718 700 735 " +
    "C 760 758 900 768 1000 770 " +
    "L 1000 780 L 0 780 Z";
  el("path", { d: seaD, class: "sea" }, ground);
  // wave dashes
  for (let i = 0; i < 26; i++) {
    const wx = 15 + rng() * 90;
    const wy = 60 + rng() * 560;
    el("path", { d: `M ${wx} ${wy} q 6 -2.5 12 0 q 6 2.5 12 0`, class: "wave" }, ground);
  }
  for (let i = 0; i < 14; i++) {
    const wx = 250 + rng() * 420;
    const wy = 690 + rng() * 60;
    el("path", { d: `M ${wx} ${wy} q 6 -2.5 12 0 q 6 2.5 12 0`, class: "wave" }, ground);
  }

  // ---- rivers ----
  const rivers = el("g", { id: "rivers" }, ground);
  // Brandywine
  el("path", { d: "M 212 210 C 226 250 240 280 238 315 C 236 355 218 400 196 440 C 180 470 160 495 140 515", class: "river" }, rivers);
  // Hoarwell/Greyflood
  el("path", { d: "M 415 285 C 400 330 372 370 340 400 C 300 440 250 480 205 505", class: "river" }, rivers);
  // Anduin, the Great River
  el("path", { d: "M 565 85 C 560 150 548 210 540 270 C 533 325 528 355 532 390 C 538 425 560 445 580 462 C 596 476 605 500 612 525 C 620 552 630 570 636 588 C 640 612 632 650 622 688", class: "river river-major" }, rivers);
  // Forest River (to the Long Lake)
  el("path", { d: "M 592 205 C 615 205 632 198 648 198", class: "river" }, rivers);
  // River Running (from Erebor past Lake-town)
  el("path", { d: "M 645 152 C 648 172 650 185 650 198 C 660 240 700 280 760 310", class: "river" }, rivers);
  // Isen
  el("path", { d: "M 438 468 C 400 480 350 492 300 496 C 265 498 235 505 210 512", class: "river" }, rivers);

  // ---- region labels: painted on the ground plane ----
  const regions = el("g", { id: "regions" }, ground);
  const region = (x, y, text, size, angle) => {
    const t = el("text", { x, y, class: "region-label", style: `font-size:${size}px`, "text-anchor": "middle" }, regions);
    if (angle) t.setAttribute("transform", `rotate(${angle} ${x} ${y})`);
    t.textContent = text;
  };
  region(180, 268, "THE SHIRE", 11);
  region(280, 405, "E R I A D O R", 20);
  region(700, 340, "R H O V A N I O N", 16);
  region(517, 480, "R O H A N", 15);
  region(520, 630, "G O N D O R", 17);
  region(778, 608, "M O R D O R", 17);
  region(120, 580, "BELEGAER", 13, -62);
  region(120, 610, "The Great Sea", 9, -62);
  region(583, 262, "Mirkwood", 12, 78);
  region(468, 250, "Misty Mts.", 9, 80);

  // ---- upright scenery: forests' trees, mountains, towers ----
  const scene = makeScene();

  // forest floors go on the ground; trees stand up in the scene
  // Mirkwood — great and vertical, with a narrower waist
  drawForest(ground, scene, 585, 210, 52, 68, rng, 26);
  drawForest(ground, scene, 580, 268, 38, 34, rng, 10);
  drawForest(ground, scene, 575, 320, 42, 62, rng, 22);
  // Fangorn
  drawForest(ground, scene, 497, 442, 34, 24, rng, 12);
  // Lothlórien
  drawForest(ground, scene, 504, 386, 22, 15, rng, 7);
  // The Old Forest
  drawForest(ground, scene, 256, 320, 15, 11, rng, 5);
  // Woods of Ithilien
  drawForest(ground, scene, 649, 562, 15, 30, rng, 8);

  // Blue Mountains (Ered Luin), split by the Gulf of Lune
  drawMountainRange(scene, [[52, 190], [80, 240], [88, 272]], rng, { size: 7 });
  drawMountainRange(scene, [[90, 330], [110, 365], [128, 400]], rng, { size: 7 });
  // Misty Mountains
  drawMountainRange(scene, [[482, 128], [470, 200], [462, 268], [452, 330], [456, 380], [448, 430], [442, 455]], rng, { size: 9 });
  // Grey Mountains
  drawMountainRange(scene, [[498, 92], [560, 80], [625, 92]], rng, { size: 8 });
  // Iron Hills
  drawMountainRange(scene, [[820, 150], [880, 145], [935, 155]], rng, { size: 7 });
  // Erebor, the Lonely Mountain
  scene.add(644, 143, makePeak(644, 143, 12, true));
  // White Mountains (Ered Nimrais)
  drawMountainRange(scene, [[365, 545], [430, 528], [495, 542], [555, 568], [598, 585]], rng, { size: 9 });
  // Ered Lithui (Ash Mountains, north wall of Mordor)
  drawMountainRange(scene, [[678, 512], [745, 502], [815, 510], [880, 520]], rng, { size: 8 });
  // Ephel Dúath (Mountains of Shadow, west wall of Mordor)
  drawMountainRange(scene, [[672, 518], [668, 560], [674, 602], [700, 640], [755, 660], [815, 665]], rng, { size: 8 });
  // Emyn Muil hills
  drawMountainRange(scene, [[590, 462], [615, 468], [632, 478]], rng, { size: 4, spacing: 9 });

  // Mount Doom, with its smoke plume
  const md = LOCATIONS.mountdoom;
  const mdg = makePeak(md.x, md.y + 6, 11, true);
  const mp = isoPoint(md.x, md.y + 6);
  el("path", { d: `M ${mp.x} ${mp.y - 19} q -3 -6 1 -11 q 4 -5 2 -10`, class: "smoke" }, mdg);
  scene.add(md.x, md.y + 6, mdg);

  // towers for major settlements
  for (const id in LOCATIONS) {
    const L = LOCATIONS[id];
    if (L.major && id !== "mountdoom") scene.add(L.x, L.y, makeTower(L.x, L.y));
  }

  scene.mount(el("g", { id: "scenery" }, svg));

  // ---- location markers & labels (billboarded, crisp) ----
  const locs = el("g", { id: "locations" }, svg);
  for (const id in LOCATIONS) {
    const L = LOCATIONS[id];
    const p = isoPoint(L.x, L.y);
    const g = el("g", {
      class: "loc" + (L.minor ? " loc-minor" : "") + (L.major ? " loc-major" : ""),
      transform: `translate(${p.x} ${p.y})`,
    }, locs);
    el("circle", { cx: 0, cy: 0, r: L.major ? 3.2 : 2.4, class: "loc-dot" }, g);
    // label lives in a billboard group that keeps constant screen size
    const bb = el("g", { class: "loc-billboard" }, g);
    // towers stay map-scaled, so the clearance above them must too
    if (L.major) bb.dataset.pre = "translate(0 -12)";
    ZOOM_SCALED.push(bb);
    const defaultDx = L.anchor === "end" ? -5.5 : 5.5;
    const label = el("text", {
      x: L.dx != null ? L.dx : defaultDx,
      y: L.dy != null ? L.dy : -4.5,
      class: "loc-label",
    }, bb);
    if (L.anchor) label.setAttribute("text-anchor", L.anchor);
    label.textContent = L.name;
    const t = el("title", {}, g);
    t.textContent = L.name;
  }

  // ---- title cartouche & compass (screen space) ----
  const deco = el("g", { id: "deco" }, svg);
  el("rect", { x: 1180, y: 34, width: 290, height: 66, class: "cartouche" }, deco);
  el("rect", { x: 1186, y: 40, width: 278, height: 54, class: "cartouche-inner" }, deco);
  const t1 = el("text", { x: 1325, y: 64, class: "map-title", "text-anchor": "middle" }, deco);
  t1.textContent = "M I D D L E - E A R T H";
  const t2 = el("text", { x: 1325, y: 84, class: "map-subtitle", "text-anchor": "middle" }, deco);
  t2.textContent = "There and Back Again — a Reader's Map";

  // compass rose: NE points up-right on an isometric board
  const cg = el("g", { transform: "translate(150 860)", class: "compass" }, deco);
  el("circle", { cx: 0, cy: 0, r: 26, class: "compass-ring" }, cg);
  el("path", { d: "M 0 -24 L 5 0 L 0 24 L -5 0 Z", class: "compass-n", transform: "rotate(30)" }, cg);
  el("path", { d: "M -24 0 L 0 5 L 24 0 L 0 -5 Z", class: "compass-e", transform: "rotate(30)" }, cg);
  const nt = el("text", { x: 13, y: -30, class: "compass-label", "text-anchor": "middle" }, cg);
  nt.textContent = "N";

  // marker layer goes on top of everything
  el("g", { id: "markers" }, svg);
}
