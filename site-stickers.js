// Crie Meu Site: the sticker collections. Five themed packs of die-cut stickers, drawn
// as original inline SVG in the spirit of collage sticker sheets: Vintage (kraft paper,
// sepia and black), Sálvia (soft greens), Anil (indigo and sky blue), Stargirl (black,
// white and a touch of red) and Cereja (cherry red). Unlike the UI doodles, they keep
// their own colours; each pack brings a palette that matches it. The white edge of a
// die-cut sticker comes from the `is-cut` class (see site-preview.css), so the drawings
// stay simple. Everything is generated with a seeded random, so every load (and every
// exported file) draws exactly the same stickers.
(() => {
  const seeded = seed => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const n = value => Number(value.toFixed(1));
  const svg = (box, body) => `<svg viewBox="${box}" class="is-cut" aria-hidden="true">${body}</svg>`;
  // The same drawing again, flipped around the vertical middle of a `width`-wide box.
  const mirror = (width, body) => `${body}<g transform="matrix(-1 0 0 1 ${width} 0)">${body}</g>`;
  const mono = (size, weight = 700) => `font: ${weight} ${size}px 'Space Mono', ui-monospace, monospace`;
  const hand = (size, weight = 700) => `font: ${weight} ${size}px Gluten, 'Comic Sans MS', cursive`;
  const serif = (size, weight = 500) => `font: italic ${weight} ${size}px Fraunces, Georgia, serif`;

  function starPoints(cx, cy, outer, inner, points = 5, jitter = 0, random = Math.random) {
    const list = [];
    for (let index = 0; index < points * 2; index++) {
      const radius = (index % 2 ? inner : outer) + (jitter ? (random() - .5) * jitter : 0);
      const angle = Math.PI * index / points - Math.PI / 2;
      list.push(`${n(cx + radius * Math.cos(angle))},${n(cy + radius * Math.sin(angle))}`);
    }
    return list.join(" ");
  }
  // A four-pointed sparkle.
  const twinkle = (cx, cy, r) => `M${cx} ${cy - r}Q${n(cx + r * .16)} ${n(cy - r * .16)} ${cx + r} ${cy}Q${n(cx + r * .16)} ${n(cy + r * .16)} ${cx} ${cy + r}Q${n(cx - r * .16)} ${n(cy + r * .16)} ${cx - r} ${cy}Q${n(cx - r * .16)} ${n(cy - r * .16)} ${cx} ${cy - r}Z`;
  // A heart in a 100 × 90 box, placed and scaled with a transform.
  const HEART = "M50 88C20 66 4 48 4 30 4 16 15 6 28 6c9 0 17 5 22 13C55 11 63 6 72 6c13 0 24 10 24 24 0 18-16 36-46 58Z";
  const heart = (x, y, scale, attributes) => `<path transform="translate(${x} ${y}) scale(${scale})" d="${HEART}" ${attributes}/>`;
  // An irregular round blob (wax, the dark seas of the moon).
  function blob(cx, cy, radius, wobble, seed, points = 18) {
    const random = seeded(seed);
    const list = [];
    for (let index = 0; index < points; index++) {
      const angle = Math.PI * 2 * index / points;
      const r = radius + (random() - .5) * wobble;
      list.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    // Smooth closed curve through the points (midpoints as anchors).
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(list.at(-1), list[0]).map(n).join(" ")}`;
    list.forEach((point, index) => {
      const next = list[(index + 1) % list.length];
      d += `Q${point.map(n).join(" ")} ${mid(point, next).map(n).join(" ")}`;
    });
    return `${d}Z`;
  }

  /* ---------- Vintage ---------- */

  function camera() {
    let leather = "";
    for (let y = 36; y < 66; y += 4) for (let x = 8 + (y % 8 ? 2 : 0); x < 114; x += 4) leather += `<circle cx="${x}" cy="${y}" r=".9" fill="#3d3732"/>`;
    return svg("0 0 120 84", `
      <rect x="44" y="4" width="32" height="16" rx="3" fill="#bdb5a6" stroke="#2a2622" stroke-width="2"/><rect x="50" y="8" width="20" height="8" rx="2" fill="#3b4a52"/>
      <rect x="12" y="10" width="20" height="10" rx="2" fill="#bdb5a6" stroke="#2a2622" stroke-width="2"/><rect x="88" y="8" width="20" height="12" rx="2" fill="#bdb5a6" stroke="#2a2622" stroke-width="2"/>
      <rect x="4" y="18" width="112" height="62" rx="8" fill="#2a2622"/>${leather}
      <rect x="4" y="18" width="112" height="14" rx="6" fill="#d8d1c3"/><rect x="4" y="68" width="112" height="12" rx="6" fill="#d8d1c3"/>
      <text x="22" y="28.5" style="${mono(7)}" fill="#2a2622">35 mm</text><circle cx="100" cy="25" r="4" fill="#9aa7ad" stroke="#2a2622" stroke-width="1.2"/>
      <circle cx="60" cy="50" r="27" fill="#e4ddcf" stroke="#2a2622" stroke-width="2"/><circle cx="60" cy="50" r="21" fill="#4a4540"/>
      <circle cx="60" cy="50" r="15" fill="#141210"/><circle cx="60" cy="50" r="8" fill="#26343c"/><circle cx="55" cy="45" r="3.5" fill="#fff" opacity=".55"/>`);
  }
  function cassette(label, { body = "#1d1c1b", sticker = "#f3eee2", ink = "#1d1c1b", see = false } = {}) {
    return svg("0 0 120 78", `
      <rect x="3" y="3" width="114" height="72" rx="7" fill="${body}"/>
      ${see ? `<rect x="7" y="7" width="106" height="64" rx="5" fill="#fff" opacity=".12"/>` : ""}
      ${[[9, 9], [111, 9], [9, 69], [111, 69]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#8a8580"/>`).join("")}
      <rect x="13" y="9" width="94" height="19" rx="2" fill="${sticker}"/><text x="19" y="22.5" style="${hand(10.5)}" fill="${ink}">${label}</text>
      <rect x="28" y="33" width="64" height="24" rx="12" fill="#3b3936"/><rect x="46" y="38" width="28" height="14" fill="#6b5a48"/>
      ${[42, 78].map(x => `<circle cx="${x}" cy="45" r="8.5" fill="#ece6da"/><circle cx="${x}" cy="45" r="4.6" fill="none" stroke="#3b3936" stroke-width="2.4" stroke-dasharray="2 1.6"/>`).join("")}
      <path d="M24 75l8-13h56l8 13Z" fill="#000" opacity=".25"/>${[44, 76].map(x => `<circle cx="${x}" cy="69" r="2.6" fill="#111"/>`).join("")}`);
  }
  const ticket = () => svg("0 0 136 70", `
    <path d="M4 4h128v20a6 6 0 0 0 0 12v30H4V36a6 6 0 0 0 0-12Z" fill="#dcc69a"/>
    <path d="M4 4h128v20a6 6 0 0 0 0 12v30H4V36a6 6 0 0 0 0-12Z" fill="none" stroke="#b39463" stroke-width="1"/>
    <rect x="12" y="10" width="112" height="50" fill="none" stroke="#8a6a43" stroke-width="1.2" stroke-dasharray="3 2"/>
    <path d="M100 10v50" stroke="#8a6a43" stroke-width="1.2" stroke-dasharray="2 3"/>
    <text x="56" y="32" text-anchor="middle" style="${mono(9.2)}" fill="#3a2f22">Bilhete para</text>
    <text x="56" y="47" text-anchor="middle" style="${mono(9.2)}" fill="#3a2f22">qualquer lugar</text>
    <text transform="translate(110 35) rotate(90)" text-anchor="middle" style="${mono(9)}" fill="#3a2f22">146017</text>`);
  function butterfly({ wing = "#c98a3e", ink = "#2b1d12", dots = "#fff" } = {}) {
    const half = `
      <path d="M49 36C42 20 28 6 12 8 3 9 2 20 8 28c6 8 22 12 41 10Z" fill="${wing}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M49 42C38 42 22 48 18 60c-3 9 6 14 15 10 9-5 15-15 16-28Z" fill="${wing}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M47 36C38 26 26 16 14 14M47 37C36 32 22 26 10 24M47 38C34 38 22 34 12 32M47 44C40 50 32 58 26 66M47 46C42 54 38 62 36 70" stroke="${ink}" stroke-width="1.4" fill="none"/>
      ${[[11, 13], [7, 19], [8, 25], [21, 66], [27, 70], [16, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${dots}"/>`).join("")}`;
    return svg("0 0 100 80", `${mirror(100, half)}<ellipse cx="50" cy="44" rx="3" ry="16" fill="${ink}"/><circle cx="50" cy="26" r="3.5" fill="${ink}"/><path d="M49 24c-3-8-7-12-10-13M51 24c3-8 7-12 10-13" stroke="${ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  }
  function envelopes() {
    const envelope = (x, y, turn, fill) => `<g transform="translate(${x} ${y}) rotate(${turn})"><rect x="-34" y="-22" width="68" height="44" rx="2" fill="${fill}" stroke="#7a5a35" stroke-width="1.5"/><path d="M-34 22L-8 0M34 22L8 0" stroke="#7a5a35" stroke-width="1" opacity=".6"/><path d="M-34 -22L0 4 34 -22" fill="${fill}" stroke="#7a5a35" stroke-width="1.5" stroke-linejoin="round"/></g>`;
    return svg("0 0 112 96", envelope(50, 32, -12, "#c9a46e") + envelope(62, 50, 7, "#d4b07a") + envelope(52, 66, -3, "#dcbb86"));
  }
  function moon(tone, sea, rim, seed) {
    const random = seeded(seed);
    let craters = "";
    for (let index = 0; index < 9; index++) {
      const angle = random() * Math.PI * 2;
      const distance = random() * 32;
      craters += `<circle cx="${n(45 + Math.cos(angle) * distance)}" cy="${n(45 + Math.sin(angle) * distance)}" r="${n(2 + random() * 4)}" fill="none" stroke="${sea}" stroke-width="1.1" opacity=".7"/>`;
    }
    return svg("0 0 90 90", `<circle cx="45" cy="45" r="42" fill="${tone}" stroke="${rim}" stroke-width="2"/>
      <path d="${blob(34, 34, 13, 8, seed + 1)}" fill="${sea}" opacity=".75"/><path d="${blob(58, 54, 11, 7, seed + 2)}" fill="${sea}" opacity=".6"/>
      <path d="${blob(30, 62, 8, 5, seed + 3)}" fill="${sea}" opacity=".55"/><path d="${blob(60, 26, 6, 4, seed + 4)}" fill="${sea}" opacity=".5"/>${craters}
      <path d="M16 30a32 32 0 0 1 18-16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>`);
  }
  function books(covers, pages = "#ece0c4", edge = "#c9b48c") {
    const sizes = [[8, 84, 84, -2], [12, 68, 78, 3], [6, 52, 86, -3], [14, 36, 72, 2], [10, 20, 80, -4]];
    return svg("0 0 100 104", sizes.map(([x, y, width, turn], index) => {
      const cover = covers[index % covers.length];
      const lines = [5, 8, 11].map(dy => `<path d="M${x + 9} ${y + dy}h${width - 13}" stroke="${edge}" stroke-width=".7"/>`).join("");
      return `<g transform="rotate(${turn} ${x + width / 2} ${y + 8})"><rect x="${x}" y="${y}" width="${width}" height="16" rx="2" fill="${cover}"/><rect x="${x + 6}" y="${y + 3}" width="${width - 7}" height="10" fill="${pages}"/>${lines}<rect x="${x}" y="${y}" width="7" height="16" rx="2" fill="${cover}"/><path d="M${x + 2} ${y + 5}h3M${x + 2} ${y + 11}h3" stroke="${pages}" stroke-width="1" opacity=".7"/></g>`;
    }).join(""));
  }
  // A torn newspaper heart: the classic parametric heart with a ragged edge, and rows of
  // "text" that fit inside it.
  function newsHeart() {
    const random = seeded(11);
    const points = [];
    for (let index = 0; index < 72; index++) {
      const t = Math.PI * 2 * index / 72;
      const x = 16 * Math.sin(t) ** 3;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const tear = 1 + (random() - .5) * .06;
      points.push([50 + x * 2.8 * tear, 40 + y * 2.8 * tear]);
    }
    const outline = `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}Z`;
    let rows = "";
    for (let y = 14; y <= 82; y += 4.4) {
      const hits = [];
      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length];
        if ((point[1] - y) * (next[1] - y) <= 0 && point[1] !== next[1]) hits.push(point[0] + (y - point[1]) / (next[1] - point[1]) * (next[0] - point[0]));
      });
      if (hits.length < 2) continue;
      let x = Math.min(...hits) + 4;
      const end = Math.max(...hits) - 4;
      const headline = y > 24 && y < 34;
      while (x < end - 3) {
        const length = Math.min(end - x, 6 + random() * 16);
        rows += `<path d="M${n(x)} ${n(y)}h${n(length)}" stroke="#6f695e" stroke-width="${headline ? 3.2 : 1.5}"/>`;
        x += length + 2.4;
      }
    }
    return svg("0 0 100 94", `<path d="${outline}" fill="#ece4d2" stroke="#cfc4ac" stroke-width="1"/>${rows}<path d="M50 10v70" stroke="#6f695e" stroke-width=".6" opacity=".5"/>`);
  }
  const woodButton = () => svg("0 0 64 64", `<circle cx="32" cy="32" r="29" fill="#b68655" stroke="#6f4a2a" stroke-width="2"/><circle cx="32" cy="32" r="21" fill="none" stroke="#9a6c40" stroke-width="3"/>
    <path d="M12 26c10-6 30-6 40 2M10 38c14 6 30 6 44-2M18 18c8-3 20-3 28 2" stroke="#8a5e36" stroke-width="1.2" fill="none" opacity=".7"/>
    ${[[27, 27], [37, 27], [27, 37], [37, 37]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#3b2614"/>`).join("")}`);

  /* ---------- Sálvia ---------- */

  const layeredStar = () => svg("0 0 100 100", [[48, 21, "#9fc29a", "#6f9a6b"], [36, 16, "#bdd7b4", "none"], [24, 10.5, "#d9eacf", "none"], [12, 5.2, "#f4faef", "none"]]
    .map(([outer, inner, fill, stroke]) => `<polygon points="${starPoints(50, 53, outer, inner)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`).join(""));
  function clover() {
    const leaf = `<path d="M40 40C33 34 24 24 28 16c3-6 10-6 12 0 2-6 9-6 12 0 4 8-5 18-12 24Z" fill="#3f8f3a"/><path d="M40 37V22" stroke="#86c97a" stroke-width="1.4" stroke-linecap="round"/>`;
    return svg("0 0 84 94", `<path d="M40 44c2 16 6 30 16 44" stroke="#3f7a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>${[0, 90, 180, 270].map(turn => `<g transform="rotate(${turn} 40 40)">${leaf}</g>`).join("")}<circle cx="40" cy="40" r="3" fill="#2f6f2a"/>`);
  }
  function bow(main, dark, light) {
    const half = `
      <path d="M52 46C44 60 36 72 28 84l12-2 6 6c4-14 8-30 10-42Z" fill="${main}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M55 38C42 18 16 8 10 22c-6 14 10 28 45 18Z" fill="${main}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M18 20c8-4 18 0 26 8" stroke="${light}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>`;
    return svg("0 0 110 92", `${mirror(110, half)}<rect x="46" y="30" width="18" height="17" rx="6" fill="${light}" stroke="${dark}" stroke-width="2"/><rect x="46" y="30" width="18" height="17" rx="6" fill="${main}" opacity=".55"/>`);
  }
  const heartColumn = () => svg("0 0 44 142", ["#a7bf9e", "#8fa886", "#768f6e", "#5d7556"].map((fill, index) => heart(4, 4 + index * 34, .36, `fill="${fill}"`)).join(""));
  const recordPlayer = () => svg("0 0 120 92", `
    <rect x="12" y="4" width="96" height="30" rx="6" fill="#c3cca9" stroke="#6d7a58" stroke-width="2"/>
    <rect x="6" y="28" width="108" height="58" rx="8" fill="#dfe5cc" stroke="#6d7a58" stroke-width="2"/>
    <circle cx="50" cy="52" r="20" fill="#2a2a2a"/><circle cx="50" cy="52" r="14" fill="none" stroke="#474747" stroke-width="1"/><circle cx="50" cy="52" r="6" fill="#c9d4ae"/><circle cx="50" cy="52" r="1.4" fill="#2a2a2a"/>
    <circle cx="96" cy="38" r="4.5" fill="#b5bca2" stroke="#6d7a58" stroke-width="1.2"/><path d="M96 38v18l-14 8" stroke="#8a9175" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="6" y="74" width="108" height="12" rx="4" fill="#c5cdaf"/>${[20, 28, 36, 84, 92, 100].map(x => `<circle cx="${x}" cy="80" r="1.6" fill="#8a9175"/>`).join("")}
    <rect x="54" y="76" width="12" height="7" rx="2" fill="#a6b08c"/>`);
  const sunglasses = () => svg("0 0 124 58", `${mirror(124, `
    <path d="M8 16c12-6 34-8 48-2 2 14-4 26-20 28C18 44 8 32 8 16Z" fill="#5f8d78" fill-opacity=".85" stroke="#6e9f86" stroke-width="6" stroke-linejoin="round"/>
    <path d="M17 21c6-3 14-4 22-3" stroke="#d8efe3" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>`)}<path d="M56 18c4-3 8-3 12 0" stroke="#6e9f86" stroke-width="5" fill="none"/>`);
  const frog = () => svg("0 0 100 86", `
    <circle cx="28" cy="30" r="14" fill="#8dbb7c" stroke="#4f7d45" stroke-width="3"/><circle cx="72" cy="30" r="14" fill="#8dbb7c" stroke="#4f7d45" stroke-width="3"/>
    <ellipse cx="50" cy="56" rx="44" ry="27" fill="#8dbb7c" stroke="#4f7d45" stroke-width="3"/>
    <circle cx="28" cy="30" r="12.4" fill="#8dbb7c"/><circle cx="72" cy="30" r="12.4" fill="#8dbb7c"/>
    <circle cx="28" cy="32" r="4" fill="#2d3b26"/><circle cx="72" cy="32" r="4" fill="#2d3b26"/><circle cx="29.5" cy="30.5" r="1.2" fill="#fff"/><circle cx="73.5" cy="30.5" r="1.2" fill="#fff"/>
    <ellipse cx="22" cy="56" rx="7" ry="4" fill="#f2a7a0" opacity=".75"/><ellipse cx="78" cy="56" rx="7" ry="4" fill="#f2a7a0" opacity=".75"/>
    <path d="M42 52c3 4 5 4 8 0 3 4 5 4 8 0" stroke="#2d3b26" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  const createStamp = () => svg("0 0 84 104", `
    <rect x="5" y="5" width="74" height="94" fill="#f4f7ef" stroke="#f4f7ef" stroke-width="8" stroke-dasharray="0 7.4" stroke-linecap="round"/><rect x="5" y="5" width="74" height="94" fill="#f4f7ef"/>
    <rect x="11" y="11" width="62" height="82" fill="none" stroke="#3f6b48" stroke-width="2.5"/><rect x="15" y="15" width="54" height="74" fill="none" stroke="#3f6b48" stroke-width="1"/>
    <text x="42" y="30" text-anchor="middle" style="${mono(8.5)}" fill="#3f6b48">HORA DE</text>
    <text x="42" y="47" text-anchor="middle" style="${mono(15)}" fill="#3f6b48">CRIAR</text>
    <path d="M20 74l12-15 8 8 10-14 16 21Z" fill="#3f6b48"/><path d="M46 57l4-4 3 4" fill="#f4f7ef"/>
    <path d="M20 80c8-4 16-4 22 0 6-4 14-4 22 0v6c-8-4-16-4-22 0-6-4-14-4-22 0Z" fill="#f4f7ef" stroke="#3f6b48" stroke-width="1.6" stroke-linejoin="round"/>`);

  /* ---------- Anil ---------- */

  // A crescent: the outer disc minus an offset one, found from where the two circles meet.
  function crescentPath(cx1, cy1, r1, cx2, cy2, r2) {
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const [mx, my] = [cx1 + a * dx / d, cy1 + a * dy / d];
    const p1 = [mx + h * dy / d, my - h * dx / d];
    const p2 = [mx - h * dy / d, my + h * dx / d];
    return `M${p1.map(n).join(" ")}A${r1} ${r1} 0 1 0 ${p2.map(n).join(" ")}A${r2} ${r2} 0 0 1 ${p1.map(n).join(" ")}Z`;
  }
  const moonFace = () => svg("0 0 92 100", `
    <path d="${crescentPath(48, 50, 45, 72, 44, 38)}" fill="#22398f" stroke="#c9d0dc" stroke-width="3" stroke-linejoin="round"/>
    <path d="M14 42q6 5 13 0" stroke="#c9d0dc" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16 45l-2 3M20 46.5v3.5M24 45.5l2 3" stroke="#c9d0dc" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M21 52c-2 3-2.5 5.5 0 6.5 2.5-1 2-3.5 0-6.5Z" fill="#8fb2e8"/><path d="M18 70q4-3 8 0" stroke="#c9d0dc" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  const evilEye = () => svg("0 0 84 84", `<circle cx="42" cy="42" r="39" fill="#1d4fb8" stroke="#2f63cc" stroke-width="3" stroke-dasharray="1 1.6"/><circle cx="42" cy="42" r="26" fill="#fdfdfd"/><circle cx="42" cy="42" r="18" fill="#6fb3e8"/><circle cx="42" cy="42" r="8.5" fill="#111"/><circle cx="38" cy="38" r="3" fill="#fff"/>`);
  function shell() {
    // A scallop fanning out of the hinge: ridges between scalloped bumps.
    const [hx, hy, radius] = [45, 74, 64];
    const angles = Array.from({ length: 10 }, (_, index) => Math.PI * (1.12 + index * .084));
    const at = (angle, r = radius) => [hx + r * Math.cos(angle), hy + r * Math.sin(angle)];
    let d = `M${hx} ${hy}L${at(angles[0]).map(n).join(" ")}`;
    for (let index = 0; index < angles.length - 1; index++) {
      const middle = (angles[index] + angles[index + 1]) / 2;
      d += `Q${at(middle, radius + 7).map(n).join(" ")} ${at(angles[index + 1]).map(n).join(" ")}`;
    }
    d += "Z";
    const ridges = angles.slice(1, -1).map(angle => `<path d="M${hx} ${hy}L${at(angle, radius - 2).map(n).join(" ")}" stroke="#2f5596" stroke-width="1.3"/>`).join("");
    return svg("0 0 90 84", `<path d="${d}" fill="#8fb0e0" stroke="#2f5596" stroke-width="2" stroke-linejoin="round"/>${ridges}<path d="M34 72h22l-3 9H37Z" fill="#6e93cf" stroke="#2f5596" stroke-width="1.6" stroke-linejoin="round"/>`);
  }
  const quill = () => svg("0 0 72 112", `
    <path d="M37 74C30 54 36 30 62 6c-2 26-10 50-23 70Z" fill="#2c4ea8"/>
    <path d="M38 70C40 52 48 30 60 10" stroke="#9cbaf0" stroke-width="1.2" fill="none"/>${[[42, 52, 34, 46], [46, 40, 38, 34], [50, 30, 44, 22], [44, 46, 52, 42], [48, 36, 56, 30]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#7c9ee0" stroke-width="1"/>`).join("")}
    <path d="M37 74l-2 10" stroke="#13265e" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="25" y="78" width="20" height="9" rx="1" fill="#1d3a8a"/><path d="M14 86h42l4 8v12a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V94Z" fill="#13265e"/>
    <rect x="15" y="94" width="4" height="12" rx="2" fill="#5d7fd0" opacity=".7"/>`);
  const starrySparkles = () => svg("0 0 100 100", [[32, 58, 28], [68, 28, 18], [72, 74, 21]].map(([x, y, r]) => `
    <path d="${twinkle(x, y, r)}" fill="#2f5fc4" stroke="#183a8a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${x - r * .45} ${y + r * .1}c${n(r * .2)} ${n(-r * .3)} ${n(r * .6)} ${n(-r * .3)} ${n(r * .8)} 0M${x - r * .3} ${y + r * .3}c${n(r * .3)} ${n(-r * .15)} ${n(r * .5)} ${n(-r * .05)} ${n(r * .6)} ${n(r * .1)}" stroke="#9cc0f2" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join("") + `<circle cx="32" cy="54" r="3" fill="#f2cf5b"/>`);
  function jellyfish() {
    let tentacles = "";
    [20, 31, 42, 53, 64].forEach((x, index) => {
      let d = `M${x} 48`;
      for (let y = 48; y < 108; y += 10) d += `q${index % 2 ? 4 : -4} 5 0 10`;
      tentacles += `<path d="${d}" stroke="${index % 2 ? "#7fc2ea" : "#3c86c4"}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    });
    return svg("0 0 84 116", `${tentacles}<path d="M8 46C8 22 24 6 42 6s34 16 34 40Z" fill="#4f9fd6"/>${[12, 22, 32, 42, 52, 62, 72].map(x => `<circle cx="${x}" cy="46" r="5" fill="#4f9fd6"/>`).join("")}
      <path d="M20 30c4-10 12-16 22-16" stroke="#bfe2f7" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/>`);
  }
  const whale = () => svg("0 0 116 76", `
    <path d="M42 12c-2-6 0-9 4-9M42 12c2-6 6-9 10-7M42 12c-4-4-8-5-11-3" stroke="#8fb7e8" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M10 44c0-18 18-28 42-28 26 0 40 14 44 26l12-10-2 18 6 10-14-4c-6 14-24 18-46 18C26 74 10 62 10 44Z" fill="#8fb7e8" stroke="#3e6fb8" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 52c8 14 44 16 68 6-6 10-22 14-38 14-14 0-26-6-30-20Z" fill="#d6e6fa"/>
    <circle cx="30" cy="40" r="3.2" fill="#1b2e57"/><ellipse cx="38" cy="50" rx="5" ry="3" fill="#f4b2c0" opacity=".75"/><path d="M52 54c4 6 10 8 16 6" stroke="#3e6fb8" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  function discoBall() {
    const random = seeded(7);
    const shades = ["#e8eef8", "#c9d3e6", "#8a9bbf", "#5c6f99", "#3d4f78"];
    let tiles = "";
    for (let y = 22; y < 94; y += 7) {
      for (let x = 6; x < 78; x += 7) {
        const [cx, cy] = [x + 3, y + 3];
        if (Math.hypot(cx - 42, cy - 58) > 33.5) continue;
        const light = Math.max(0, Math.min(4, Math.round((cx - 42 + cy - 58) / 22 + 2 + (random() - .5) * 2.2)));
        tiles += `<rect x="${x}" y="${y}" width="6.2" height="6.2" fill="${shades[light]}"/>`;
      }
    }
    return svg("0 0 84 100", `<path d="M42 2v14" stroke="#666" stroke-width="2"/><rect x="37" y="14" width="10" height="7" rx="1.5" fill="#8b93a3"/><circle cx="42" cy="58" r="36" fill="#2f3d5f"/>${tiles}<circle cx="42" cy="58" r="36" fill="none" stroke="#2f3d5f" stroke-width="1.6"/><path d="${twinkle(26, 42, 9)}" fill="#fff"/>`);
  }
  const puffyHeart = () => svg("0 0 100 92", `${heart(3, 2, .94, 'fill="#4a8fe0" stroke="#24539c" stroke-width="3.2" stroke-linejoin="round"')}
    <path d="M19 26c4-10 14-14 22-10" stroke="#d8ebff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="72" cy="24" r="4" fill="#d8ebff"/>
    <path d="M30 62c8 8 16 14 20 16" stroke="#2c66b8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`);

  /* ---------- Stargirl ---------- */

  const blackStar = () => svg("0 0 100 100", `<polygon points="${starPoints(50, 53, 48, 19)}" fill="#111" stroke="#111" stroke-width="2" stroke-linejoin="round"/>`);
  const eightBall = () => svg("0 0 84 84", `<circle cx="42" cy="42" r="40" fill="#111"/><ellipse cx="26" cy="24" rx="13" ry="7" fill="#fff" opacity=".16" transform="rotate(-32 26 24)"/><circle cx="46" cy="38" r="15" fill="#fff"/><text x="46" y="45.5" text-anchor="middle" style="font: 800 20px Inter, Arial, sans-serif" fill="#111">8</text>`);
  const polaroid = () => svg("0 0 84 100", `<rect x="3" y="3" width="78" height="94" fill="#fbfbf8" stroke="#dedbd2" stroke-width="1"/><rect x="10" y="10" width="64" height="62" fill="#dfe4ec"/><path d="M10 60l18-16 14 12 10-8 22 18v6H10Z" fill="#c6cedb"/><circle cx="58" cy="26" r="6" fill="#eef1f6"/>
    <text x="42" y="88" text-anchor="middle" style="${hand(9.5)}" fill="#222">eu amo isso &lt;3</text>`);
  function roughSpiral() {
    const random = seeded(3);
    const turns = 4.4;
    const end = Math.PI * 2 * turns;
    let d = "";
    for (let angle = 0; angle <= end; angle += .16) {
      const radius = 3 + 37 * angle / end + (random() - .5) * 1.6;
      d += `${d ? "L" : "M"}${n(45 + radius * Math.cos(angle))} ${n(45 + radius * Math.sin(angle))}`;
    }
    return svg("0 0 90 90", `<circle cx="45" cy="45" r="43" fill="#fff"/><path d="${d}" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  function receipt() {
    let edge = "M4 4h84v114";
    for (let x = 88; x > 4; x -= 6) edge += `l-3 5-3 -5`;
    edge += "Z";
    const row = (y, left, right, weight = 400) => `<text x="12" y="${y}" style="${mono(6.4, weight)}" fill="#1a1a1a">${left}</text>${right ? `<text x="80" y="${y}" text-anchor="end" style="${mono(6.4, weight)}" fill="#1a1a1a">${right}</text>` : ""}`;
    const random = seeded(5);
    let bars = "";
    for (let x = 18; x < 74;) {
      const width = .8 + Math.round(random() * 2) * .8;
      bars += `<rect x="${n(x)}" y="102" width="${n(width)}" height="11" fill="#1a1a1a"/>`;
      x += width + .8 + random() * 1.4;
    }
    return svg("0 0 92 128", `<path d="${edge}" fill="#f7f7f4" stroke="#e1e0da" stroke-width=".8"/><path d="M8 40l30 10 20-6 26 12M10 76l40-8 30 10" stroke="#000" stroke-opacity=".05" stroke-width="1.2" fill="none"/>
      <text x="46" y="17" text-anchor="middle" style="${mono(8.5)}" fill="#1a1a1a">CRIE MEU SITE</text>${row(27, "PEDIDO: 01")}
      <path d="M10 32h72" stroke="#1a1a1a" stroke-width=".7" stroke-dasharray="2 1.5"/>${row(41, "ITEM", "QTD", 700)}
      ${row(51, "01. CAPA", "1")}${row(60, "02. SOBRE MIM", "1")}${row(69, "03. PROJETOS", "3")}${row(78, "04. CONTATO", "1")}
      <path d="M10 83h72" stroke="#1a1a1a" stroke-width=".7" stroke-dasharray="2 1.5"/>${row(93, "TOTAL:", "100%", 700)}${bars}`);
  }
  const clapper = () => svg("0 0 104 90", `
    <g transform="rotate(-12 6 28)"><rect x="4" y="14" width="96" height="14" rx="2" fill="#151515"/>${[10, 30, 50, 70, 90].map(x => `<path d="M${x} 14h8l-8 14h-8Z" fill="#f2f2f2"/>`).join("")}</g>
    <rect x="4" y="30" width="96" height="56" rx="3" fill="#151515"/>${[10, 30, 50, 70, 90].map(x => `<path d="M${x} 30h8l-8 10h-8Z" fill="#f2f2f2"/>`).join("")}
    <path d="M4 50h96M4 68h96M52 50v36" stroke="#eee" stroke-width="1"/>
    <text x="8" y="48" style="${mono(5.6)}" fill="#eee">PRODUÇÃO</text><text x="8" y="60" style="${mono(5.6)}" fill="#eee">CENA</text><text x="56" y="60" style="${mono(5.6)}" fill="#eee">TOMADA</text>
    <text x="8" y="78" style="${mono(5.6)}" fill="#eee">DIREÇÃO</text><text x="56" y="78" style="${mono(5.6)}" fill="#eee">DATA</text>`);
  const cherries = () => svg("0 0 84 94", `
    <path d="M30 60C32 40 40 22 52 10M58 64C56 44 54 24 52 10" stroke="#5a3a1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M52 10c8-8 20-6 26 0-8 6-18 8-26 0Z" fill="#4f8a3a"/><path d="M54 10c6-1 14-1 22 0" stroke="#8cc56f" stroke-width="1" fill="none"/>
    <circle cx="28" cy="72" r="16" fill="#c4161c" stroke="#7d0e12" stroke-width="1.5"/><circle cx="58" cy="74" r="16" fill="#c4161c" stroke="#7d0e12" stroke-width="1.5"/>
    <ellipse cx="22" cy="66" rx="4" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-30 22 66)"/><ellipse cx="52" cy="68" rx="4" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-30 52 68)"/>`);
  function fingerprintHeart() {
    const random = seeded(9);
    let rings = "";
    for (let index = 0; index < 9; index++) {
      const scale = 1 - index * .105;
      const dash = `${n(14 + random() * 30)} ${n(2 + random() * 3)} ${n(8 + random() * 20)} ${n(2 + random() * 3)}`;
      rings += `<path transform="translate(${n(50 * (1 - scale))} ${n(47 * (1 - scale))}) scale(${n(scale * 100) / 100})" d="${HEART}" fill="none" stroke="#111" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
    }
    return svg("0 0 100 94", heart(0, 0, 1, 'fill="#fff"') + rings);
  }
  const redStar = () => svg("0 0 92 92", `<polygon points="${starPoints(46, 49, 42, 17, 5, 5, seeded(4))}" fill="#d42a33" stroke="#111" stroke-width="5" stroke-linejoin="round"/>`);
  const designWord = () => svg("0 0 156 46", `<rect x="2" y="4" width="152" height="38" fill="#fff"/><text x="78" y="34" text-anchor="middle" style="font: 800 30px 'Space Mono', ui-monospace, monospace; letter-spacing: -1px" fill="#111">DE<tspan fill="#c8202f">★</tspan>IGN</text>`);

  /* ---------- Cereja ---------- */

  const redClip = () => svg("0 0 36 104", `<path d="M10 24v56a8 8 0 0 0 16 0V14a6.5 6.5 0 0 0-13 0v62a3 3 0 0 0 6 0V26" stroke="#d3293a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M12 30v46" stroke="#ff8f9a" stroke-width="1" opacity=".7"/>`);
  const waxSeal = () => svg("0 0 84 84", `<path d="${blob(42, 42, 38, 7, 21, 22)}" fill="#a8131f"/><circle cx="42" cy="42" r="27" fill="#8f0f1a" stroke="#c43a44" stroke-width="1.5"/>
    <path d="M42 66V42" stroke="#5c0a11" stroke-width="2.2"/><path d="M42 58c-8-2-12-8-12-12 6 0 10 4 12 12ZM42 52c8-2 12-8 12-12-6 0-10 4-12 12Z" fill="#5c0a11"/>
    <path d="M34 34c0-8 6-12 8-12s8 4 8 12c0 5-4 8-8 8s-8-3-8-8Z" fill="#6d0c15" stroke="#c43a44" stroke-width="1"/><path d="M38 31c2-4 6-4 8 0M40 35c1-2 3-2 4 0" stroke="#c43a44" stroke-width="1" fill="none"/>
    <path d="M17 32a27 27 0 0 1 14-15" stroke="#e06a72" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`);
  function rotaryPhone() {
    const holes = Array.from({ length: 10 }, (_, index) => {
      const angle = Math.PI * (-.35 + index * .155);
      return `<circle cx="${n(62 + 13.5 * Math.cos(angle))}" cy="${n(74 + 13.5 * Math.sin(angle))}" r="3.1" fill="#fff" stroke="#c9b9a8" stroke-width=".8"/>`;
    }).join("");
    return svg("0 0 124 104", `
      <path d="M18 46h88l12 50a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" fill="#d21f2b" stroke="#8e1018" stroke-width="2" stroke-linejoin="round"/>
      <rect x="40" y="36" width="44" height="12" rx="3" fill="#b8161f"/>
      <path d="M12 30c0-12 10-18 20-18h60c10 0 20 6 20 18v4c0 4-3 6-6 6H92c-3 0-5-2-5-5v-3H37v3c0 3-2 5-5 5H18c-3 0-6-2-6-6Z" fill="#e02a36" stroke="#8e1018" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30 16h62" stroke="#ff8a90" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
      <circle cx="62" cy="74" r="21" fill="#f3ece0" stroke="#8e1018" stroke-width="2"/>${holes}<circle cx="62" cy="74" r="6.5" fill="#d21f2b"/>
      <path d="M22 56h26" stroke="#ff8a90" stroke-width="3" stroke-linecap="round" opacity=".55"/>`);
  }
  const redVinyl = () => svg("0 0 90 90", `<circle cx="45" cy="45" r="43" fill="#c8182a"/>${[38, 33, 28, 23].map(r => `<circle cx="45" cy="45" r="${r}" fill="none" stroke="#a01020" stroke-width=".9"/>`).join("")}
    <path d="M17 30a32 32 0 0 1 20-15" stroke="#ff8a95" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>
    <circle cx="45" cy="45" r="13" fill="#fff"/><rect x="35" y="43" width="20" height="4" rx="2" fill="#c8182a"/><circle cx="45" cy="45" r="2" fill="#111"/>`);
  const redLips = () => svg("0 0 112 60", `
    <path d="M4 30C16 18 30 6 42 8c6 1 10 6 14 6s8-5 14-6c12-2 26 10 38 22-18 2-36 2-52 0-16 2-34 2-52 0Z" fill="#b3121c"/>
    <path d="M4 30c16 2 34 2 52 0 18 2 36 2 52 0C96 46 78 56 56 56S16 46 4 30Z" fill="#c81d27"/>
    <path d="M4 30c18 4 36 2 52 0s34 4 52 0" stroke="#6a070d" stroke-width="2" fill="none"/>
    <path d="M66 44c8 0 14-2 18-6" stroke="#ff9aa0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/><path d="M30 18c4-3 8-4 10-4" stroke="#ff9aa0" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>`);
  function bolts() {
    const bolt = "M14 0L0 22h10L4 42 24 14H13L21 0Z";
    const one = (x, y, scale, turn) => `<g transform="translate(${x} ${y}) rotate(${turn}) scale(${scale})"><path d="${bolt}" fill="#2a4aa8" transform="translate(1.6 1.6)"/><path d="${bolt}" fill="#d4202c" stroke="#e3e6ea" stroke-width="1.3" stroke-dasharray="1 .8" stroke-linejoin="round"/></g>`;
    return svg("0 0 104 96", one(6, 4, 1.5, 0) + one(52, 2, 1.5, 4) + one(34, 34, 1.45, 10));
  }
  function filmStrip() {
    const holes = [];
    for (let x = 8; x < 150; x += 10) holes.push(`<rect x="${x}" y="5" width="5" height="5" rx="1" fill="#f1e6cf"/><rect x="${x}" y="52" width="5" height="5" rx="1" fill="#f1e6cf"/>`);
    return svg("0 0 158 62", `<rect x="2" y="2" width="154" height="58" rx="2" fill="#3a2416"/>${holes.join("")}${[8, 57, 106].map(x => `<rect x="${x}" y="14" width="44" height="34" rx="2" fill="#d8bf8c"/>`).join("")}`);
  }
  const quoteStrip = () => svg("0 0 170 34", `<path d="M6 4h158l-4 13 4 13H6l4-13Z" fill="#f4ebd9" stroke="#b3121c" stroke-width="1.5" stroke-linejoin="round"/><text x="85" y="22" text-anchor="middle" style="${serif(13)}" fill="#8e1018">é você e eu. sempre.</text>`);
  const redGuitar = () => svg("0 0 60 134", `
    <path d="M24 2h11l3 5-3 15H25Z" fill="#efe9dc" stroke="#2a2a2a" stroke-width="1.4" stroke-linejoin="round"/>${[6, 10, 14, 18].map(y => `<circle cx="37.5" cy="${y}" r="1.4" fill="#9a9a9a"/>`).join("")}
    <rect x="25.5" y="20" width="9" height="56" fill="#c58b4f"/><rect x="26.5" y="20" width="7" height="56" fill="#4a2a16"/>${[28, 36, 44, 52, 60, 68].map(y => `<path d="M26.5 ${y}h7" stroke="#c9c2b4" stroke-width=".8"/>`).join("")}
    <path d="M30 72c-6-2-12-6-16-2-6 6-2 14-4 20-2 8-8 12-6 22 2 12 14 18 26 18s24-6 26-18c2-10-4-14-6-22-2-6 2-14-4-20-4-4-10 0-16 2Z" fill="#d4202c" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 82c4-2 12-2 16 2v24c-4 6-16 8-20 2-2-10 4-14 4-28Z" fill="#f7f4ec"/>${[88, 97, 106].map(y => `<rect x="24" y="${y}" width="12" height="3" rx="1.5" fill="#2a2a2a"/>`).join("")}
    <rect x="23" y="113" width="14" height="4" rx="1" fill="#bdbdbd"/><circle cx="44" cy="106" r="2.2" fill="#f7f4ec"/><circle cx="46" cy="113" r="2.2" fill="#f7f4ec"/>
    <path d="M28.2 6v109M30 6v109M31.8 6v109" stroke="#e8e8e8" stroke-width=".35"/>`);

  /* ---------- Noite estrelada ---------- */

  function nightCloud() {
    const puffs = [[30, 44, 22], [56, 34, 26], [82, 42, 22], [102, 52, 15], [16, 56, 13]];
    const glow = [[52, 28, 14], [28, 40, 11], [80, 36, 10]];
    return svg("0 0 120 80", `${puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d3266"/>`).join("")}<rect x="8" y="48" width="104" height="24" rx="12" fill="#1d3266"/>
      ${glow.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2f4a8a" opacity=".7"/>`).join("")}
      <path d="${crescentPath(40, 44, 7, 43, 41, 6)}" fill="#e2c06a"/><path d="${crescentPath(86, 52, 6, 89, 49, 5)}" fill="#e2c06a"/>
      <path d="${twinkle(64, 30, 4)}" fill="#f3dfa0"/><path d="${twinkle(24, 60, 3)}" fill="#f3dfa0"/><path d="${twinkle(100, 40, 2.5)}" fill="#f3dfa0"/>
      ${[[54, 56], [70, 62], [36, 30], [92, 62], [62, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#f3dfa0"/>`).join("")}`);
  }
  const nightMoon = () => svg("0 0 80 80", `<path d="${blob(40, 40, 35, 6, 41, 20)}" fill="#16295a"/><circle cx="40" cy="40" r="26" fill="#24407a" opacity=".6"/><path d="${crescentPath(40, 40, 20, 48, 34, 18)}" fill="#e2c06a"/><circle cx="58" cy="20" r="1.5" fill="#f3dfa0"/><circle cx="20" cy="56" r="1.2" fill="#f3dfa0"/>`);
  const nightSwirl = () => {
    const d = "M12 70C28 20 58 92 78 42S110 8 112 30";
    return svg("0 0 124 92", `<path d="${d}" stroke="#1f3d86" stroke-width="24" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#4f7fd0" stroke-width="16" fill="none" stroke-linecap="round" stroke-dasharray="14 5"/>
      <path d="${d}" stroke="#a8c6f0" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="6 7"/><path d="${d}" stroke="#ecd47e" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="3 9"/>`);
  };
  function seal(base, inner, rim, art, seed) {
    return svg("0 0 84 84", `<path d="${blob(42, 42, 38, 7, seed, 22)}" fill="${base}"/><circle cx="42" cy="42" r="27" fill="${inner}" stroke="${rim}" stroke-width="1.5"/>${art}<path d="M17 32a27 27 0 0 1 14-15" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".3"/>`);
  }
  const goldFlower = `${[0, 72, 144, 216, 288].map(turn => `<ellipse cx="42" cy="32" rx="5" ry="9" fill="#e2c06a" transform="rotate(${turn} 42 42)"/>`).join("")}<circle cx="42" cy="42" r="4" fill="#b08a2e"/>`;
  function octopus() {
    let arms = "";
    for (let index = 0; index < 8; index++) {
      const turn = -70 + index * 20;
      const curl = index % 2 ? 1 : -1;
      arms += `<path d="M50 50q${curl * 6} 18 0 30q${curl * -7} 8 -2 12" transform="rotate(${turn} 50 46)" stroke="#6a7cc4" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    return svg("0 0 100 104", `${arms}<ellipse cx="50" cy="34" rx="20" ry="22" fill="#7d8fd0" stroke="#2b3a78" stroke-width="2"/><path d="M38 24c4-6 14-8 20-4" stroke="#c3cdf0" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="43" cy="40" r="2.6" fill="#1b2550"/><circle cx="57" cy="40" r="2.6" fill="#1b2550"/>`);
  }
  const seahorse = () => svg("0 0 64 104", `
    <path d="M32 24C46 28 44 42 36 50S26 68 34 76C42 84 36 96 26 92C20 89 22 82 28 84" stroke="#3d6fb8" stroke-width="11" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="18" r="9.5" fill="#3d6fb8"/><path d="M36 15l15-4 1.5 5.5-14 4.5Z" fill="#3d6fb8"/><path d="M42 40l11 4-9 6Z" fill="#8fb0e0"/>
    <path d="M22 12l-3-5M26 9l-1-5M31 9l1-5" stroke="#8fb0e0" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="16" r="2" fill="#fff"/>
    ${[34, 44, 56, 66].map(y => `<path d="M${y < 50 ? 30 : 28} ${y}h8" stroke="#8fb0e0" stroke-width="1.4" opacity=".7"/>`).join("")}`);
  const starWhale = () => {
    const stars = [[34, 36], [48, 30], [62, 38], [76, 32], [56, 50]];
    return svg("0 0 120 72", `<path d="M10 44c0-18 18-28 42-28 26 0 40 14 44 26l12-10-2 18 6 10-14-4c-6 14-24 18-46 18C26 74 10 62 10 44Z" fill="#1d3266" stroke="#0f1d40" stroke-width="2" stroke-linejoin="round"/>
      <path d="M${stars.map(point => point.join(" ")).join("L")}" stroke="#e2c06a" stroke-width=".9" fill="none" opacity=".8"/>${stars.map(([x, y]) => `<path d="${twinkle(x, y, 2.6)}" fill="#f3dfa0"/>`).join("")}
      <path d="${crescentPath(88, 48, 5, 90, 46, 4.2)}" fill="#e2c06a"/><circle cx="24" cy="40" r="2.6" fill="#f3dfa0"/>`);
  };
  const shootingStar = () => svg("0 0 104 64", `<path d="M98 6L24 40 28 48Z" fill="#e2c06a" opacity=".45"/><path d="M98 6L30 44" stroke="#f3dfa0" stroke-width="1.5" opacity=".8"/><polygon points="${starPoints(26, 46, 15, 6.5)}" fill="#e2c06a" stroke="#b08a2e" stroke-width="1.5" stroke-linejoin="round"/>`);
  const goldRiver = () => {
    const d = "M52 4C8 20 64 42 30 62S8 100 42 118";
    return svg("0 0 72 122", `<path d="${d}" stroke="#1f5e66" stroke-width="24" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#e8c86a" stroke-width="13" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fbeec0" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="5 7"/>`);
  };
  const betta = () => svg("0 0 104 84", `
    <path d="M44 40C30 18 8 14 4 30c-3 14 14 30 40 22Z" fill="#4d6fc4" opacity=".9"/><path d="M44 46C30 60 18 78 30 82c12 4 22-14 20-32Z" fill="#6f8fd8" opacity=".9"/>
    <path d="M10 30c10 0 22 4 32 12M14 44c10-2 20-2 28 2M32 74c4-8 8-16 14-24" stroke="#e2c06a" stroke-width="1.4" fill="none" opacity=".85"/>
    <ellipse cx="66" cy="44" rx="26" ry="13" fill="#2f4a8a"/><path d="M58 32c6-8 16-10 24-6" stroke="#8fb0e0" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="84" cy="41" r="2.6" fill="#f3dfa0"/>`);

  /* ---------- Violeta ---------- */

  const fuzzyFlower = () => svg("0 0 90 90", `${[0, 72, 144, 216, 288].map(turn => `<circle cx="45" cy="24" r="19" fill="#4b2f8a" stroke="#6b4fa0" stroke-width="3" stroke-dasharray="1.5 2" transform="rotate(${turn} 45 45)"/>`).join("")}
    ${[0, 72, 144, 216, 288].map(turn => `<ellipse cx="45" cy="30" rx="7" ry="12" fill="#c9b6ee" opacity=".55" transform="rotate(${turn} 45 45)"/>`).join("")}<circle cx="45" cy="45" r="7" fill="#f1ebfd"/>${[[43, 43], [47, 44], [45, 47], [42, 47], [48, 41]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#e8a83a"/>`).join("")}`);
  const stitchStar = () => svg("0 0 100 100", `<polygon points="${starPoints(50, 53, 47, 22)}" fill="#7b5cc4" stroke="#5a3f9a" stroke-width="2" stroke-linejoin="round"/><polygon points="${starPoints(50, 53, 39, 18)}" fill="none" stroke="#e7dcfb" stroke-width="1.6" stroke-dasharray="3 3"/>`);
  const mushrooms = () => svg("0 0 92 90", [[30, 30, 22, 52], [58, 22, 18, 44], [72, 46, 13, 36]].map(([x, y, r, h]) => `
    <rect x="${x - 4}" y="${y}" width="8" height="${h - y + 40}" rx="3" fill="#efe7fb" stroke="#4b2f8a" stroke-width="1.6"/>
    <path d="M${x - r} ${y + 2}A${r} ${r * .8} 0 0 1 ${x + r} ${y + 2}Z" fill="#c9b6ee" stroke="#4b2f8a" stroke-width="1.8" stroke-linejoin="round"/>
    ${[-.6, -.2, .2, .6].map(f => `<path d="M${x + r * f} ${y + 2}l${n(-f * 3)} 4" stroke="#4b2f8a" stroke-width="1"/>`).join("")}`).join(""));
  const chromeStar = () => svg("0 0 100 100", `<ellipse cx="50" cy="54" rx="44" ry="13" fill="none" stroke="#9aa3b5" stroke-width="2.4" transform="rotate(-18 50 54)"/>
    <polygon points="${starPoints(50, 52, 40, 18)}" fill="#7d63c0" stroke="#4b2f8a" stroke-width="2" stroke-linejoin="round"/><polygon points="${starPoints(46, 48, 26, 11)}" fill="#c9b6ee" opacity=".7"/>
    <path d="${twinkle(38, 36, 6)}" fill="#fff"/><ellipse cx="50" cy="54" rx="44" ry="13" fill="none" stroke="#c4cad6" stroke-width="2.4" stroke-dasharray="70 200" transform="rotate(-18 50 54)"/>`);
  function lavender() {
    let sprigs = "";
    [[22, 6, -10], [36, 2, 0], [50, 8, 10]].forEach(([x, top, lean]) => {
      sprigs += `<path d="M${x} ${top + 30}q${lean / 3} 30 ${lean / 2 + 6} 60" stroke="#6c8f62" stroke-width="2.4" fill="none"/>`;
      for (let y = top; y < top + 34; y += 5) sprigs += `<ellipse cx="${x + (y % 10 ? 3 : -3)}" cy="${y}" rx="3.4" ry="5" fill="${y % 10 ? "#7b5cc4" : "#9b7fd4"}" transform="rotate(${y % 10 ? 25 : -25} ${x} ${y})"/>`;
    });
    return svg("0 0 72 100", sprigs);
  }
  function lilacSpiral() {
    let d = "";
    const end = Math.PI * 2 * 3.4;
    for (let angle = 0; angle <= end; angle += .2) {
      const radius = 4 + 32 * angle / end;
      d += `${d ? "L" : "M"}${n(42 + radius * Math.cos(angle))} ${n(42 + radius * Math.sin(angle))}`;
    }
    return svg("0 0 84 84", `<path d="${d}" stroke="#a99be8" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  const purpleVinyl = () => svg("0 0 90 90", `<circle cx="45" cy="45" r="43" fill="#2a1650"/>${[38, 32, 26, 21].map(r => `<circle cx="45" cy="45" r="${r}" fill="none" stroke="#3e2470" stroke-width=".9"/>`).join("")}<path d="M17 30a32 32 0 0 1 20-15" stroke="#8a6fc8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/><circle cx="45" cy="45" r="13" fill="#8a6fc8"/><circle cx="45" cy="45" r="2" fill="#111"/>`);
  const daisy = () => svg("0 0 80 80", `${[0, 72, 144, 216, 288].map(turn => `<circle cx="40" cy="20" r="14" fill="#c3a8ef" stroke="#8a6fc8" stroke-width="1.2" transform="rotate(${turn} 40 40)"/>`).join("")}<circle cx="40" cy="40" r="9" fill="#f2d65a"/><circle cx="37" cy="37" r="2.5" fill="#fff" opacity=".6"/>`);
  const lavenderArt = `<path d="M42 64V30" stroke="#3a2470" stroke-width="2"/>${[30, 36, 42, 48].map(y => `<ellipse cx="38" cy="${y}" rx="3" ry="4.5" fill="#3a2470" transform="rotate(-30 38 ${y})"/><ellipse cx="46" cy="${y + 3}" rx="3" ry="4.5" fill="#3a2470" transform="rotate(30 46 ${y + 3})"/>`).join("")}`;
  const candles = () => svg("0 0 92 104", [[20, 40, 46], [46, 28, 58], [72, 46, 40]].map(([x, top, h]) => `
    <ellipse cx="${x}" cy="${top - 10}" rx="9" ry="14" fill="#ffd166" opacity=".25"/>
    <path d="M${x} ${top - 16}c4 6 4 10 0 13-4-3-4-7 0-13Z" fill="#ffb347"/><path d="M${x} ${top - 10}c2 3 2 5 0 6-2-1-2-3 0-6Z" fill="#fff3c4"/>
    <path d="M${x} ${top - 3}v4" stroke="#222" stroke-width="1.4"/>
    <path d="M${x - 11} ${top}h22v${h}H${x - 11}Z" fill="#2b2238"/><path d="M${x - 11} ${top}h22v6c-3 0-3 8-6 8s-2-5-5-5-3 9-6 9-3-6-5-6Z" fill="#4a3a63"/>`).join(""));
  const crumpledHearts = () => svg("0 0 100 92", `${heart(22, 18, .74, 'fill="#7b5cc4"')}${heart(2, 2, .74, 'fill="#a98bd0"')}
    <path d="M14 22l12 8 6-6 10 10M20 44l10-6 8 8 10-4M48 60l8-10 10 4" stroke="#fff" stroke-width="1.1" fill="none" opacity=".45"/>`);

  /* ---------- The packs ---------- */

  const packs = {
    vintage: {
      name: "Vintage", hint: "Papel kraft, sépia e preto, como um diário antigo.", swatches: ["#c9a46e", "#efe6d4", "#2a221b"],
      palette: { name: "Vintage", paper: "#efe6d4", ink: "#2a221b", accent: "#9a6b3c" },
      pieces: {
        vCamera: { name: "Câmera antiga", svg: camera(), size: 12 },
        vTape: { name: "Fita cassete", svg: cassette("mixtape ♡"), size: 12 },
        vTicket: { name: "Bilhete para qualquer lugar", svg: ticket(), size: 15, wide: true },
        vButterfly: { name: "Borboleta sépia", svg: butterfly(), size: 10 },
        vLetters: { name: "Envelopes kraft", svg: envelopes(), size: 12 },
        vMoon: { name: "Lua antiga", svg: moon("#cbbd9b", "#6d634f", "#3a3328", 31), size: 10 },
        vBooks: { name: "Livros empilhados", svg: books(["#5b4330", "#2f2620", "#7a5a3a", "#3d3025", "#8a6a43"]), size: 11 },
        vNews: { name: "Coração de jornal", svg: newsHeart(), size: 10 },
        vButton: { name: "Botão de madeira", svg: woodButton(), size: 6 },
      },
    },
    salvia: {
      name: "Sálvia", hint: "Verdes suaves: trevo, laço, sapinho e vitrola.", swatches: ["#6f9a6b", "#eef3e9", "#1f3326"],
      palette: { name: "Sálvia", paper: "#eef3e9", ink: "#1f3326", accent: "#5e8f5c" },
      pieces: {
        sStar: { name: "Estrela em camadas", svg: layeredStar(), size: 10 },
        sClover: { name: "Trevo de quatro folhas", svg: clover(), size: 9 },
        sBow: { name: "Laço verde", svg: bow("#5a9e6c", "#2f6a45", "#bfe5c9"), size: 11 },
        sHearts: { name: "Coraçõezinhos em degradê", svg: heartColumn(), size: 5 },
        sPlayer: { name: "Vitrola", svg: recordPlayer(), size: 13 },
        sGlasses: { name: "Óculos de sol", svg: sunglasses(), size: 12 },
        sFrog: { name: "Sapinho", svg: frog(), size: 10 },
        sStamp: { name: "Selo “hora de criar”", svg: createStamp(), size: 9 },
        sBooks: { name: "Livros verdes", svg: books(["#3f6b48", "#7fa07a", "#24402b", "#5e8f5c", "#a9c39a"], "#eef0e2", "#b9c4a8"), size: 11 },
      },
    },
    anil: {
      name: "Anil", hint: "Azuis do mar e da noite: lua, olho grego e água-viva.", swatches: ["#2f5fc4", "#eef3fc", "#13214d"],
      palette: { name: "Anil", paper: "#eef3fc", ink: "#13214d", accent: "#2f5fc4" },
      pieces: {
        aMoon: { name: "Lua com rosto", svg: moonFace(), size: 10 },
        aEye: { name: "Olho grego", svg: evilEye(), size: 8 },
        aShell: { name: "Concha", svg: shell(), size: 9 },
        aQuill: { name: "Pena e tinteiro", svg: quill(), size: 8 },
        aSparkles: { name: "Estrelas pintadas", svg: starrySparkles(), size: 10 },
        aJelly: { name: "Água-viva", svg: jellyfish(), size: 8 },
        aWhale: { name: "Baleia", svg: whale(), size: 12 },
        aDisco: { name: "Globo espelhado", svg: discoBall(), size: 9 },
        aHeart: { name: "Coração brilhante", svg: puffyHeart(), size: 9 },
        aBow: { name: "Laço azul", svg: bow("#2d4fa8", "#13265e", "#9cbaf0"), size: 11 },
      },
    },
    stargirl: {
      name: "Stargirl", hint: "Preto, branco e um toque de vermelho: estrelas, polaroide e recibo.", swatches: ["#d42a33", "#f5f5f2", "#111111"],
      palette: { name: "Stargirl", paper: "#f5f5f2", ink: "#111111", accent: "#d42a33" },
      pieces: {
        gStar: { name: "Estrela preta", svg: blackStar(), size: 9 },
        gBall: { name: "Bola 8", svg: eightBall(), size: 8 },
        gPolaroid: { name: "Polaroide “eu amo isso”", svg: polaroid(), size: 10 },
        gSpiral: { name: "Espiral", svg: roughSpiral(), size: 9 },
        gReceipt: { name: "Recibo do portfólio", svg: receipt(), size: 11 },
        gClapper: { name: "Claquete", svg: clapper(), size: 11 },
        gCherries: { name: "Cerejinhas", svg: cherries(), size: 8 },
        gPrint: { name: "Coração digital", svg: fingerprintHeart(), size: 9 },
        gRedStar: { name: "Estrela vermelha", svg: redStar(), size: 9 },
        gWord: { name: "Letreiro DE★IGN", svg: designWord(), size: 17, wide: true },
      },
    },
    cereja: {
      name: "Cereja", hint: "Vermelho intenso: telefone, lacre, guitarra e raios.", swatches: ["#e3263a", "#1b0d0f", "#f6e7e2"],
      palette: { name: "Cereja", paper: "#1b0d0f", ink: "#f6e7e2", accent: "#e3263a" },
      pieces: {
        cPhone: { name: "Telefone vermelho", svg: rotaryPhone(), size: 13 },
        cSeal: { name: "Lacre de cera", svg: waxSeal(), size: 8 },
        cVinyl: { name: "Disco vermelho", svg: redVinyl(), size: 10 },
        cLips: { name: "Beijo", svg: redLips(), size: 11 },
        cGuitar: { name: "Guitarra vermelha", svg: redGuitar(), size: 8 },
        cBolts: { name: "Raios", svg: bolts(), size: 10 },
        cTape: { name: "Fita vermelha", svg: cassette("lado A", { body: "#c9152a", sticker: "#fff", ink: "#c9152a", see: true }), size: 12 },
        cFilm: { name: "Filme fotográfico", svg: filmStrip(), size: 16, wide: true },
        cQuote: { name: "Faixa “é você e eu”", svg: quoteStrip(), size: 17, wide: true },
        cClip: { name: "Clipe vermelho", svg: redClip(), size: 3.6 },
      },
    },
    estrelada: {
      name: "Noite estrelada", hint: "Azul-marinho e dourado: céu de pinceladas, luas e bichos do mar.", swatches: ["#1d3266", "#eef1f7", "#c9a23a"],
      palette: { name: "Noite estrelada", paper: "#eef1f7", ink: "#12224a", accent: "#b8902a", tone: "#1d3266", hl: "#b8902a", dark: "#0f1d40" },
      pieces: {
        eCloud: { name: "Nuvem com luas", svg: nightCloud(), size: 15, wide: true },
        eMoon: { name: "Lua dourada", svg: nightMoon(), size: 9 },
        eSwirl: { name: "Pincelada em espiral", svg: nightSwirl(), size: 14 },
        eSeal: { name: "Lacre azul", svg: seal("#1d3266", "#16295a", "#4f6fb0", goldFlower, 51), size: 8 },
        eOctopus: { name: "Polvo", svg: octopus(), size: 10 },
        eSeahorse: { name: "Cavalo-marinho azul", svg: seahorse(), size: 7 },
        eWhale: { name: "Baleia constelação", svg: starWhale(), size: 13 },
        eStar: { name: "Estrela cadente", svg: shootingStar(), size: 11 },
        eRiver: { name: "Rio dourado", svg: goldRiver(), size: 8 },
        eFish: { name: "Peixe-de-briga", svg: betta(), size: 11 },
      },
    },
    violeta: {
      name: "Violeta", hint: "Lilases e roxos: flores, lavanda, velas e estrelas.", swatches: ["#7b5cc4", "#f6f2fd", "#2c1d52"],
      palette: { name: "Violeta", paper: "#f6f2fd", ink: "#2c1d52", accent: "#7b5cc4", tone: "#e7dcfb", hl: "#7b5cc4", dark: "#2c1d52" },
      pieces: {
        lFlower: { name: "Flor de pelúcia", svg: fuzzyFlower(), size: 10 },
        lStar: { name: "Estrela costurada", svg: stitchStar(), size: 9 },
        lMoon: { name: "Lua lilás", svg: moon("#c3b0ec", "#7b5cc4", "#5a3f9a", 61), size: 10 },
        lMushrooms: { name: "Cogumelos", svg: mushrooms(), size: 10 },
        lChrome: { name: "Estrela cromada", svg: chromeStar(), size: 10 },
        lBow: { name: "Laço lilás", svg: bow("#c9b6ee", "#7b5cc4", "#f6f0ff"), size: 11 },
        lLavender: { name: "Ramos de lavanda", svg: lavender(), size: 7 },
        lSpiral: { name: "Espiral lilás", svg: lilacSpiral(), size: 8 },
        lButterfly: { name: "Borboleta lilás", svg: butterfly({ wing: "#a98be0", ink: "#4b2f8a", dots: "#f1ebfd" }), size: 10 },
        lVinyl: { name: "Disco roxo", svg: purpleVinyl(), size: 10 },
        lDaisy: { name: "Florzinha", svg: daisy(), size: 7 },
        lSeal: { name: "Lacre de lavanda", svg: seal("#7b5cc4", "#6a4bb2", "#b9a3e6", lavenderArt, 71), size: 8 },
        lCandles: { name: "Velas", svg: candles(), size: 10 },
        lHearts: { name: "Corações amassados", svg: crumpledHearts(), size: 9 },
      },
    },
  };
  // Palettes taken from colour references, without a sticker pack of their own: they
  // use every colour, the extras going to the section tone, the dark block and the
  // highlights.
  window.CMS_PALETTES = {
    pomar: { name: "Pomar", paper: "#f9f890", ink: "#1f1a17", accent: "#ef0c1a", tone: "#ffbbbc", hl: "#ef0c1a", dark: "#77b5cf" },
    guacamole: { name: "Guacamole", paper: "#ffbbbc", ink: "#1f1a17", accent: "#ef0c1a", tone: "#99c13f", hl: "#ef0c1a", dark: "#77b5cf" },
    artico: { name: "Ártico", paper: "#1c2b38", ink: "#e9eef4", accent: "#7991a8", tone: "#38506a", hl: "#9fb3c8", dark: "#071018" },
    polar: { name: "Polar", paper: "#e6ecf2", ink: "#071018", accent: "#38506a", tone: "#7991a8", hl: "#446983", dark: "#1c2b38" },
  };

  window.CMS_PACKS = packs;
})();
