/* ============================================================
 * app.js — UI wiring: book/chapter selection, character marker
 * placement + animation, legend, fullscreen, pan/zoom, saving.
 * ============================================================ */

(function () {
  const svg = document.getElementById("map");
  const bookSel = document.getElementById("book-select");
  const chapterSel = document.getElementById("chapter-select");
  const updateBtn = document.getElementById("update-btn");
  const fsBtn = document.getElementById("fullscreen-btn");
  const sceneToggle = document.getElementById("scene-toggle");
  const legendEl = document.getElementById("legend");
  const captionEl = document.getElementById("caption");
  const wrapper = document.getElementById("map-wrapper");

  const STORAGE_KEY = "lotr-reading-tracker";

  drawMap(svg);
  const markersLayer = document.getElementById("markers");

  // Character glyph (from js/icons.js), scaled to fit a token of the given radius
  function glyphGroup(id, radius, dark) {
    const icon = typeof CHAR_ICONS !== "undefined" && CHAR_ICONS[id];
    if (!icon) return null;
    const size = radius * 1.55;
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "marker-glyph" + (dark ? " marker-glyph-dark" : ""));
    g.setAttribute("transform", `translate(${-size / 2} ${-size / 2}) scale(${size / 512})`);
    icon.paths.forEach((d) => {
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      g.appendChild(p);
    });
    return g;
  }

  /* ---------- marker creation ---------- */
  const markers = {}; // charId -> { g, label }
  for (const id in CHARACTERS) {
    const c = CHARACTERS[id];
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "marker hidden");
    g.dataset.char = id;

    // inner group keeps the token at constant on-screen size while zooming
    const sc = document.createElementNS(SVG_NS, "g");
    ZOOM_SCALED.push(sc);

    const halo = document.createElementNS(SVG_NS, "circle");
    halo.setAttribute("r", "13");
    halo.setAttribute("class", "marker-halo");
    sc.appendChild(halo);

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("r", "10");
    circle.setAttribute("class", "marker-dot");
    circle.setAttribute("fill", c.color);
    sc.appendChild(circle);

    const glyph = glyphGroup(id, 10, c.dark);
    if (glyph) {
      sc.appendChild(glyph);
    } else {
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("class", "marker-init" + (c.dark ? " marker-init-dark" : ""));
      text.setAttribute("y", "3.2");
      text.setAttribute("text-anchor", "middle");
      text.textContent = c.init;
      sc.appendChild(text);
    }

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "marker-name");
    label.setAttribute("y", "22");
    label.setAttribute("text-anchor", "middle");
    label.textContent = c.name;
    sc.appendChild(label);

    const title = document.createElementNS(SVG_NS, "title");
    title.textContent = c.name;
    sc.appendChild(title);

    g.appendChild(sc);
    markersLayer.appendChild(g);
    markers[id] = { g: g, sc: sc, label: label };
  }

  /* ---------- state & selectors ---------- */
  function currentBook() {
    return BOOKS[Number(bookSel.value)];
  }

  function populateBooks() {
    BOOKS.forEach((b, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = b.title;
      bookSel.appendChild(opt);
    });
  }

  function populateChapters() {
    chapterSel.innerHTML = "";
    currentBook().chapters.forEach((c, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = c.title;
      chapterSel.appendChild(opt);
    });
  }

  function buildLegend() {
    legendEl.innerHTML = "";
    currentBook().cast.forEach((id) => {
      const c = CHARACTERS[id];
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.dataset.char = id;
      const mini = document.createElementNS(SVG_NS, "svg");
      mini.setAttribute("viewBox", "-11 -11 22 22");
      mini.setAttribute("class", "chip-token");
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("r", "10");
      dot.setAttribute("fill", c.color);
      dot.setAttribute("class", "marker-dot");
      mini.appendChild(dot);
      const glyph = glyphGroup(id, 10, c.dark);
      if (glyph) mini.appendChild(glyph);
      chip.appendChild(mini);
      chip.appendChild(document.createTextNode(c.name));
      chip.addEventListener("mouseenter", () => markers[id].g.classList.add("highlight"));
      chip.addEventListener("mouseleave", () => markers[id].g.classList.remove("highlight"));
      legendEl.appendChild(chip);
    });
  }

  /* ---------- placing characters ---------- */
  function applyChapter() {
    const book = currentBook();
    const chapter = book.chapters[Number(chapterSel.value)];
    const pos = chapter.pos;

    // group visible characters by location for declutter offsets
    const byLoc = {};
    for (const id of book.cast) {
      let p = pos[id];
      if (!p) continue;
      const faded = p.endsWith("?");
      const loc = faded ? p.slice(0, -1) : p;
      (byLoc[loc] = byLoc[loc] || []).push({ id: id, faded: faded });
    }

    const placed = new Set();
    const scenePoints = [];
    for (const loc in byLoc) {
      const L = LOCATIONS[loc];
      if (!L) { console.warn("Unknown location:", loc); continue; }
      const group = byLoc[loc];
      const n = group.length;
      const P = isoPoint(L.x, L.y);
      scenePoints.push(P);
      group.forEach((entry, i) => {
        const m = markers[entry.id];
        // ring offsets live inside the zoom-scaled group, so clusters keep
        // constant on-screen spread instead of scattering when zoomed in
        let post = "";
        if (n > 1) {
          // inner ring holds up to 6 markers; overflow goes to an outer ring
          const inner = Math.min(n, 6);
          const onInner = i < 6;
          const ringCount = onInner ? inner : n - 6;
          const ringIndex = onInner ? i : i - 6;
          const r = onInner ? 19 : 37;
          const a = (ringIndex / ringCount) * Math.PI * 2 - Math.PI / 2 + (onInner ? 0 : Math.PI / ringCount);
          post = `translate(${Math.cos(a) * r} ${Math.sin(a) * r})`;
        }
        m.sc.dataset.post = post;
        m.g.style.transform = `translate(${P.x}px, ${P.y}px)`;
        m.g.classList.remove("hidden");
        m.g.classList.toggle("faded", entry.faded);
        m.g.classList.toggle("clustered", n > 2);
        placed.add(entry.id);
      });
    }

    // hide everyone not placed (not in this book's cast, not yet met, or gone)
    for (const id in markers) {
      if (!placed.has(id)) markers[id].g.classList.add("hidden");
    }

    // dim legend chips for hidden characters
    legendEl.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("chip-off", !placed.has(chip.dataset.char));
    });

    captionEl.textContent = book.title + " — " + chapter.title;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ book: bookSel.value, chapter: chapterSel.value }));

    // re-apply zoom scaling so new ring offsets take effect immediately
    setLabelZoom(currentZoomK());

    // cinematic scene: fly the camera to frame this chapter's action
    if (sceneToggle.checked && scenePoints.length) flyToScene(scenePoints);
  }

  /* ---------- scene camera ---------- */
  function flyToScene(points) {
    const ASPECT = MAP_W / MAP_H;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach((p) => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    const PAD = 110;
    let w = Math.max(maxX - minX + PAD * 2, 380);
    let h = Math.max(maxY - minY + PAD * 2, 380 / ASPECT);
    if (w / h > ASPECT) h = w / ASPECT; else w = h * ASPECT;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    animateViewBox({ x: cx - w / 2, y: cy - h / 2, w: w, h: h });
  }

  let camAnim = null;
  function animateViewBox(target) {
    if (camAnim) cancelAnimationFrame(camAnim);
    const from = Object.assign({}, vb);
    const start = performance.now();
    const DUR = 1100;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function step(now) {
      const t = Math.min(1, (now - start) / DUR);
      const k = ease(t);
      vb.x = from.x + (target.x - from.x) * k;
      vb.y = from.y + (target.y - from.y) * k;
      vb.w = from.w + (target.w - from.w) * k;
      vb.h = from.h + (target.h - from.h) * k;
      setViewBox();
      if (t < 1) camAnim = requestAnimationFrame(step);
      else camAnim = null;
    }
    camAnim = requestAnimationFrame(step);
  }

  /* ---------- pan & zoom ---------- */
  const HOME = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  let vb = Object.assign({}, HOME);

  function currentZoomK() {
    return Math.max(0.28, Math.min(1, vb.w / MAP_W));
  }

  function setViewBox() {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    // labels & tokens keep constant screen size (never larger than at home view)
    setLabelZoom(currentZoomK());
    // detail labels (minor places, character names) appear once zoomed in
    svg.classList.toggle("zoomed", vb.w / MAP_W < 0.62);
  }

  function clientToMap(cx, cy) {
    const rect = svg.getBoundingClientRect();
    return {
      x: vb.x + ((cx - rect.left) / rect.width) * vb.w,
      y: vb.y + ((cy - rect.top) / rect.height) * vb.h,
    };
  }

  function stopCamera() {
    if (camAnim) { cancelAnimationFrame(camAnim); camAnim = null; }
  }

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    stopCamera();
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    const newW = Math.min(MAP_W * 1.2, Math.max(140, vb.w * factor));
    const scale = newW / vb.w;
    const p = clientToMap(e.clientX, e.clientY);
    vb.x = p.x - (p.x - vb.x) * scale;
    vb.y = p.y - (p.y - vb.y) * scale;
    vb.w = newW;
    vb.h = vb.h * scale;
    setViewBox();
  }, { passive: false });

  let dragging = null;
  svg.addEventListener("pointerdown", (e) => {
    stopCamera();
    dragging = { x: e.clientX, y: e.clientY };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add("grabbing");
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    vb.x -= ((e.clientX - dragging.x) / rect.width) * vb.w;
    vb.y -= ((e.clientY - dragging.y) / rect.height) * vb.h;
    dragging = { x: e.clientX, y: e.clientY };
    setViewBox();
  });
  svg.addEventListener("pointerup", () => { dragging = null; svg.classList.remove("grabbing"); });
  svg.addEventListener("dblclick", () => { stopCamera(); vb = Object.assign({}, HOME); setViewBox(); });

  /* ---------- fullscreen ---------- */
  fsBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      (wrapper.requestFullscreen || wrapper.webkitRequestFullscreen).call(wrapper);
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fsBtn.textContent = document.fullscreenElement ? "Exit fullscreen" : "Fullscreen";
  });

  /* ---------- events & boot ---------- */
  bookSel.addEventListener("change", () => {
    populateChapters();
    buildLegend();
    applyChapter();
  });
  updateBtn.addEventListener("click", applyChapter);
  chapterSel.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyChapter();
  });

  populateBooks();

  // URL hash (#book=2&ch=12) overrides the saved position — handy for sharing
  let saved = null;
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has("book")) {
    saved = { book: hash.get("book"), chapter: hash.get("ch") || "0" };
  } else {
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* ignore */ }
  }
  if (saved && BOOKS[Number(saved.book)]) {
    bookSel.value = saved.book;
    populateChapters();
    if (currentBook().chapters[Number(saved.chapter)]) chapterSel.value = saved.chapter;
  } else {
    populateChapters();
  }
  buildLegend();
  applyChapter();
})();
