// Crie Meu Site: a portfolio builder for people who have never touched HTML. It opens
// on a ready-made portfolio (cover, about me, featured project, gallery, skills and
// contact) and everything is edited right on the page, like a scrapbook:
//   - texts: click and type (the style takes care of fonts and colours);
//   - photos: click a frame and pick a picture;
//   - pages: add ready-made blocks from the drawer, move, recolour, duplicate, delete;
//   - collage: drag stickers and UI doodles anywhere over the page;
//   - style: four looks (blue editorial poster, magazine, minimal, scrapbook notebook)
//     and colour palettes that recolour any of them;
//   - hide: a whole block, or a part of it (a photo, a card, a contact line), stays in
//     the editor but leaves the published site.
// Undo/redo, a phone preview, a 4-step guide and the download of a standalone HTML
// file complete it. The page itself is styled by site-preview.css, shared with the
// downloaded file.
(() => {
  const storageKey = "front-arcade.crie-meu-site.v2";
  const get = id => document.getElementById(id);
  const page = get("builder-page");
  const canvas = get("cms-canvas");
  const paper = get("cms-paper");
  const panel = get("cms-drawer-panel");
  const status = get("builder-status");
  const exportButton = get("cms-export");
  const photoPicker = get("builder-photo-input");
  const fontsUrl = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,700;0,6..96,900;1,6..96,500&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500;1,9..144,900&family=Inter:wght@400;600;700&family=Space+Mono:wght@400;700&family=Gluten:wght@500;700;800&display=swap";
  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));
  const esc = text => String(text).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* ---------- Icons (line icons for the skills cards and the editor) ---------- */

  const line = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const icons = {
    palette: line("M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1-.8-1.2-.8-2.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.6-9-7.6ZM7.5 11.5h.01M10 7.5h.01M15 7.5h.01"),
    pen: line("M15 4l5 5L9 20H4v-5L15 4ZM13 6l5 5"),
    layout: line("M3 4h18v16H3ZM3 9h18M9 9v11"),
    camera: line("M4 7h4l2-3h4l2 3h4v13H4ZM12 17a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"),
    sparkle: line("M12 3c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8Z"),
    heart: line("M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11Z"),
    music: line("M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"),
    code: line("M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"),
  };
  const iconOrder = Object.keys(icons);
  const ui = {
    image: line("M4 5h16v14H4ZM4 15l4-4 4 4 3-3 5 5M15.5 9h.01"),
    up: line("M12 19V5M6 11l6-6 6 6"),
    down: line("M12 5v14M6 13l6 6 6-6"),
    tone: line("M12 3a9 9 0 0 0 0 18ZM12 3a9 9 0 0 1 0 18"),
    copy: line("M8 8h12v12H8ZM4 16V4h12"),
    trash: line("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"),
    plus: line("M12 5v14M5 12h14"),
    minus: line("M5 12h14"),
    rotate: line("M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"),
    undo: line("M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"),
    redo: line("M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"),
    eye: line("M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"),
    level: line("M3 12h18M7 8v8M17 8v8"),
    move: line("M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"),
    lines: line("M4 6h16M4 12h16M4 18h16M2 3v18"),
    eyeOff: line("M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"),
  };

  // A text's own size, spacing, line height, rotation and nudge, as inline style.
  function fmtStyle(format, tag) {
    if (!format) return "";
    const parts = [];
    if (format.z && format.z !== 1) parts.push(`zoom:${format.z}`);
    if (format.ls) parts.push(`letter-spacing:${format.ls}em`);
    if (format.lh) parts.push(`line-height:${format.lh}`);
    if (format.r) parts.push(`rotate:${format.r}deg`);
    if (format.tx || format.ty) parts.push(`translate:${format.tx}cqi ${format.ty}cqi`);
    if ((format.r || format.tx || format.ty) && tag === "span") parts.push("display:inline-block");
    return parts.join(";");
  }

  /* ---------- Collage pieces ---------- */

  // UI doodles are inline SVG that follow the style's colours; the cute stickers are
  // painted once on a canvas.
  function burst(spikes, outer, inner) {
    const points = [];
    for (let index = 0; index < spikes * 2; index++) {
      const radius = index % 2 ? inner : outer;
      const angle = Math.PI * index / spikes - Math.PI / 2;
      points.push(`${(40 + radius * Math.cos(angle)).toFixed(1)},${(40 + radius * Math.sin(angle)).toFixed(1)}`);
    }
    return points.join(" ");
  }
  const doodles = {
    box: { name: "Caixinha ⊠", svg: '<svg viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M1.5 1.5l21 21M22.5 1.5l-21 21" stroke="currentColor" stroke-width="1.6"/></svg>', size: 3.2 },
    arrow: { name: "Seta", svg: '<svg viewBox="0 0 64 48"><path d="M6 40C18 12 40 8 54 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M44 6l12 8-12 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>', size: 9 },
    circle: { name: "Círculo", svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="var(--accent)"/></svg>', size: 10 },
    sparkle: { name: "Brilho", svg: '<svg viewBox="0 0 40 40"><path d="M20 1C22 14 26 18 39 20C26 22 22 26 20 39C18 26 14 22 1 20C14 18 18 14 20 1Z" fill="var(--accent)" stroke="currentColor" stroke-width="1.2"/></svg>', size: 5 },
    tape: { name: "Fita adesiva", svg: '<svg viewBox="0 0 120 34"><path d="M4 4h112l-4 6 4 6-4 6 4 6H4l4-6-4-6 4-6Z" fill="var(--accent)" opacity=".6"/></svg>', size: 14 },
    badge: { name: "Selo NOVO", svg: `<svg viewBox="0 0 80 80"><polygon points="${burst(16, 39, 33)}" fill="var(--accent)" stroke="currentColor" stroke-width="1.2"/><text x="40" y="46" text-anchor="middle" style="font: 700 17px var(--mono); fill: var(--accent-ink)">NOVO</text></svg>`, size: 9 },
    squiggle: { name: "Rabisco", svg: '<svg viewBox="0 0 80 30"><path d="M4 18c8-14 16 14 24 0s16 14 24 0 16 14 24 0" fill="none" stroke="var(--hl)" stroke-width="4" stroke-linecap="round"/></svg>', size: 10 },
    asterisk: { name: "Asterisco", svg: '<svg viewBox="0 0 40 40"><path d="M20 3v34M5 11l30 18M35 11L5 29" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>', size: 5 },
    cursor: { name: "Cursor", svg: '<svg viewBox="0 0 32 40"><path d="M4 2v28l7-7 5 12 5-2-5-12h10Z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>', size: 4 },
    smile: { name: "Carinha", svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--accent)" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="16" r="2" fill="currentColor"/><circle cx="26" cy="16" r="2" fill="currentColor"/><path d="M12 24q8 8 16 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', size: 6 },
  };
  for (const doodle of Object.values(doodles)) doodle.group = "ui";

  // Scrapbook pieces: hand lettering cut out like a sticker, label pills, washi tape,
  // torn paper, a paperclip, a pin, a stamp and hand-drawn doodles.
  function lettering(word, rotate = -4) {
    const width = 40 + word.length * 34;
    return `<svg viewBox="0 0 ${width} 84"><g transform="rotate(${rotate} ${width / 2} 42)"><text x="${width / 2}" y="60" text-anchor="middle" textLength="${width - 36}" lengthAdjust="spacingAndGlyphs" style="font: 800 58px Gluten, 'Comic Sans MS', cursive; fill: var(--accent); stroke: var(--paper); stroke-width: 12px; paint-order: stroke; stroke-linejoin: round">${word}</text></g></svg>`;
  }
  function pill(word) {
    const width = 36 + word.length * 17;
    return `<svg viewBox="0 0 ${width} 40"><rect x="2" y="4" width="${width - 4}" height="32" rx="16" fill="var(--paper)" stroke="currentColor" stroke-width="1.6"/><text x="${width / 2}" y="26" text-anchor="middle" style="font: 500 15px Fraunces, Georgia, serif; letter-spacing: .32em; fill: currentColor">${word}</text></svg>`;
  }
  const tapeBody = fill => `<path d="M6 6l4 4-4 4 4 4-4 4 4 4-4 4h128l-4-4 4-4-4-4 4-4-4-4 4-4-4-4Z" fill="${fill}" opacity=".85"/>`;
  const scrap = {
    wordPortfolio: { name: "Letreiro “portfólio”", svg: lettering("portfólio"), size: 22 },
    wordHello: { name: "Letreiro “olá!”", svg: lettering("olá!", 5), size: 12 },
    wordWow: { name: "Letreiro “uau!”", svg: lettering("uau!", -7), size: 12 },
    wordProjects: { name: "Letreiro “projetos”", svg: lettering("projetos", 3), size: 18 },
    wordAbout: { name: "Letreiro “sobre mim”", svg: lettering("sobre mim"), size: 20 },
    wordLove: { name: "Letreiro “amei!”", svg: lettering("amei!", 6), size: 13 },
    pillDesign: { name: "Etiqueta DESIGN", svg: pill("DESIGN"), size: 13 },
    pillYear: { name: "Etiqueta 2025", svg: pill("2025"), size: 10 },
    tapeStripes: { name: "Washi listrada", svg: `<svg viewBox="0 0 144 36">${tapeBody("var(--accent)")}${[18, 34, 50, 66, 82, 98, 114].map(x => `<rect x="${x}" y="6" width="7" height="24" fill="var(--paper)" opacity=".55"/>`).join("")}</svg>`, size: 15 },
    tapeDots: { name: "Washi de bolinhas", svg: `<svg viewBox="0 0 144 36">${tapeBody("var(--accent)")}${[0, 1, 2, 3, 4, 5, 6].map(index => `<circle cx="${22 + index * 16}" cy="${index % 2 ? 13 : 23}" r="3.2" fill="var(--paper)"/>`).join("")}</svg>`, size: 15 },
    tapeGrid: { name: "Washi quadriculada", svg: `<svg viewBox="0 0 144 36">${tapeBody("color-mix(in srgb, var(--accent) 45%, var(--paper))")}<path d="M14 14h116M14 22h116${[24, 40, 56, 72, 88, 104, 120].map(x => `M${x} 6v24`).join("")}" stroke="var(--ink)" stroke-width=".8" opacity=".35"/></svg>`, size: 15 },
    note: { name: "Papel rasgado", svg: '<svg viewBox="0 0 100 90" style="filter: drop-shadow(0 3px 3px #0002)"><path d="M4 4h92v70l-6 4-5-5-6 6-7-6-5 5-7-6-6 7-6-6-6 5-7-6-5 6-7-5-6 6-5-5-6 4Z" fill="#fffdf6"/><path d="M8 24h86M8 38h86M8 52h86M8 66h80" stroke="#9cc4e8" stroke-width="1"/><path d="M20 4v74" stroke="#f08b9a" stroke-width="1.2"/></svg>', size: 14 },
    clip: { name: "Clipe", svg: '<svg viewBox="0 0 30 60"><path d="M10 14v30a7 7 0 0 0 14 0V10a5 5 0 0 0-10 0v32a2 2 0 0 0 4 0V16" fill="none" stroke="#8d96a3" stroke-width="2.6" stroke-linecap="round"/></svg>', size: 3.4 },
    pin: { name: "Alfinete", svg: '<svg viewBox="0 0 40 50"><path d="M20 26v20" stroke="#8d96a3" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="15" r="12" fill="#e4405f"/><circle cx="15" cy="10" r="3.5" fill="#fff" opacity=".6"/></svg>', size: 3.6 },
    stamp: { name: "Selo postal", svg: '<svg viewBox="0 0 70 84" style="filter: drop-shadow(0 2px 2px #0002)"><rect x="6" y="6" width="58" height="72" fill="#fffdf6" stroke="#fffdf6" stroke-width="8" stroke-dasharray="0 7.2" stroke-linecap="round"/><rect x="6" y="6" width="58" height="72" fill="#fffdf6"/><rect x="13" y="13" width="44" height="46" fill="color-mix(in srgb, var(--accent) 30%, #fff)"/><path d="M35 50C20 40 18 30 24 25c4-3 9-2 11 3 2-5 7-6 11-3 6 5 4 15-11 25Z" fill="var(--accent)"/><text x="35" y="72" text-anchor="middle" style="font: 700 9px var(--mono); fill: #555">2025</text></svg>', size: 8 },
    drawnStar: { name: "Estrela rabiscada", svg: '<svg viewBox="0 0 60 60"><path d="M30 5l7 17 18 2-14 11 5 18-16-10-15 10 4-18L6 24l18-2Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M31 9l6 15" stroke="currentColor" stroke-width="1.2" opacity=".5"/></svg>', size: 6 },
    drawnHeart: { name: "Coração rabiscado", svg: '<svg viewBox="0 0 60 56"><path d="M30 50C10 36 4 26 8 16c4-9 16-10 22 0 6-11 19-9 23 0 4 11-4 21-23 34" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 47C12 36 7 27 11 18" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round" opacity=".6"/></svg>', size: 6 },
    swirl: { name: "Espiral", svg: '<svg viewBox="0 0 60 60"><path d="M31 30c0-3 4-3 4 0 0 5-8 6-9 0-1-8 11-10 14-2 4 10-6 18-15 15-12-4-12-21 0-25 15-5 27 8 22 21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>', size: 6 },
    loop: { name: "Círculo de destaque", svg: '<svg viewBox="0 0 120 60"><path d="M66 8C38 4 10 14 8 30c-2 17 32 25 58 23 28-2 48-12 46-26C110 12 84 5 54 9" fill="none" stroke="var(--hl)" stroke-width="3" stroke-linecap="round"/></svg>', size: 20 },
    underline: { name: "Sublinhado", svg: '<svg viewBox="0 0 120 24"><path d="M4 14c20-8 40-8 58-2 16 5 34 4 54-6M10 20c30-6 60-4 90 0" fill="none" stroke="var(--hl)" stroke-width="3" stroke-linecap="round"/></svg>', size: 16 },
    curlyArrow: { name: "Seta enrolada", svg: '<svg viewBox="0 0 80 60"><path d="M6 46c14 4 26-2 24-14-2-10-14-8-12 1 3 13 26 16 48-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M56 18l11 6-1 12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', size: 9 },
    sparkles: { name: "Brilhinhos", svg: '<svg viewBox="0 0 60 60"><path d="M22 8c1 9 4 12 13 13-9 1-12 4-13 13-1-9-4-12-13-13 9-1 12-4 13-13ZM45 30c1 5 2 7 7 8-5 1-6 3-7 8-1-5-2-7-7-8 5-1 6-3 7-8ZM18 40c.6 4 2 5 5 6-3 .6-4 2-5 5-.6-3-2-4-5-5 3-1 4-2 5-6Z" fill="var(--accent)" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>', size: 6 },
    flower: { name: "Florzinha rabiscada", svg: '<svg viewBox="0 0 60 60"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M30 26c-6-12 6-18 6-6M34 30c12-6 18 6 6 6M30 34c6 12-6 18-6 6M26 30c-12 6-18-6-6-6"/><path d="M30 38c0 8 2 14 6 18"/></g><circle cx="30" cy="30" r="4" fill="var(--accent)"/></svg>', size: 6 },
  };
  for (const [key, piece] of Object.entries(scrap)) {
    piece.group = "scrap";
    piece.wide = /^(word|pill|tape)/.test(key) || ["loop", "underline"].includes(key);
  }
  Object.assign(doodles, scrap);
  // The themed sticker collections (site-stickers.js) keep their own colours.
  const packs = window.CMS_PACKS ?? {};
  for (const [key, pack] of Object.entries(packs)) {
    for (const [art, piece] of Object.entries(pack.pieces)) doodles[art] = { ...piece, group: `pack:${key}` };
  }
  let pack = Object.keys(packs)[0];
  const cute ={ berry: "Moranguinho", cat: "Gatinho", flower: "Flor", star: "Estrelinha", bow: "Laço", heart: "Coração", mushroom: "Cogumelo", letter: "Cartinha" };
  const cuteImages = new Map();
  function cutePicture(art) {
    if (cuteImages.has(art)) return cuteImages.get(art);
    const board = document.createElement("canvas");
    board.width = board.height = 120;
    const ctx = board.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const outline = (shape, fill) => {
      const path = new Path2D(shape);
      ctx.strokeStyle = "#fffdf7";
      ctx.lineWidth = 13;
      ctx.stroke(path);
      ctx.fillStyle = fill;
      ctx.fill(path);
      ctx.strokeStyle = "#694e58";
      ctx.lineWidth = 2;
      ctx.stroke(path);
    };
    const detail = (shape, stroke, width = 2) => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke(new Path2D(shape));
    };
    const dot = (x, y, size, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    };
    switch (art) {
      case "berry":
        outline("M59 31C38 22 22 36 23 54C23 75 47 96 60 102C75 96 99 71 98 51C96 31 79 24 59 31Z", "#ed8693");
        outline("M57 38q-15-13-23-12q14-14 27 0q12-20 28-9q-11 4-17 17q-5 8-15 4Z", "#91ab71");
        for (const [x, y] of [[42, 47], [64, 53], [82, 44], [52, 70], [76, 67], [60, 87]]) detail(`M${x} ${y}l-2 4`, "#ffebad", 3);
        break;
      case "cat":
        outline("M26 52L24 25Q24 18 31 23L47 36Q60 31 72 36L91 21Q97 19 96 28L94 54Q105 67 97 81Q88 96 59 96Q29 96 22 79Q16 66 26 52Z", "#e6b483");
        detail("M29 31l11 12m50-13l-12 13M17 66l16 5m-15 8l15-3m55-5l15-5m-15 10l14 4", "#795665");
        dot(44, 64, 3, "#51404a"); dot(76, 64, 3, "#51404a");
        detail("M57 71l4 3l4-3m-4 3q2 7 8 2m-8-2q-4 7-9 2", "#7f4b5c");
        break;
      case "flower":
        outline("M60 26C54 9 33 15 35 35C14 30 10 52 26 62C11 75 26 94 44 88C47 108 70 107 75 88C93 98 109 80 94 65C112 53 105 33 86 37C90 18 68 12 60 26Z", "#dca6bd");
        dot(60, 61, 19, "#ffd789");
        dot(54, 59, 2.5, "#604550"); dot(66, 59, 2.5, "#604550");
        detail("M55 67q5 5 10 0", "#795665");
        break;
      case "star":
        outline("M61 16L75 44L106 48L84 70L91 101L62 86L33 103L37 71L14 50L46 44Z", "#f6cd73");
        detail("M28 49l21-3m22 40l13 7", "#fff1bc", 4);
        dot(49, 60, 3, "#755560"); dot(73, 60, 3, "#755560");
        detail("M55 69q6 5 12 0", "#755560");
        break;
      case "bow":
        outline("M54 51Q22 23 16 39Q6 63 20 77Q30 85 50 71L39 97L54 91L61 76L74 98L89 98L74 72Q99 86 106 64Q115 34 98 35Q85 35 67 51Z", "#eca3b3");
        detail("M27 44q12 4 26 15m22 0q11-11 23-13M52 63q9-10 20 0", "#bc687d", 3);
        break;
      case "heart":
        outline("M61 42Q45 17 28 29Q12 37 22 62Q30 81 60 102Q90 84 101 60Q108 36 91 27Q75 19 61 42Z", "#eb8c85");
        detail("M31 47q4-10 13-9m33 42l11-9", "#ffd2c2", 5);
        break;
      case "mushroom":
        outline("M46 65h28q-2 13 4 26q3 13-17 13Q42 104 43 92Q48 78 46 65Z", "#fff0d4");
        outline("M16 68C18 43 38 20 60 21C82 20 103 45 105 66Q106 78 60 77Q17 79 16 68Z", "#cc7e8c");
        dot(43, 45, 7, "#ffe0c2"); dot(75, 40, 7, "#ffe0c2"); dot(88, 61, 5, "#ffe0c2"); dot(32, 62, 4, "#ffe0c2");
        break;
      case "letter":
        outline("M20 39L96 27Q101 27 102 32L108 80Q108 86 102 88L26 98Q21 97 20 92L14 45Q15 40 20 39Z", "#d3bad9");
        detail("M18 46l45 26l35-38m-74 55l23-24m25-4l31 19", "#806380", 2.5);
        ctx.fillStyle = "#c65f83";
        ctx.fill(new Path2D("M62 59q7-10 13-3q6 7-9 17q-15-6-12-13q3-6 8-1Z"));
        break;
    }
    const url = board.toDataURL();
    cuteImages.set(art, url);
    return url;
  }
  const stickerName = art => doodles[art]?.name ?? cute[art] ?? "Enfeite";
  const stickerArt = art => doodles[art] ? doodles[art].svg : `<img src="${cutePicture(art)}" alt="" draggable="false">`;

  /* ---------- Page blocks: the ready-made layouts and their starting content ---------- */

  // Each text slot: [default text, multi-line?]. Photos and icons by slot name.
  const layouts = {
    cover: {
      name: "Capa", hint: "Título grande, seu nome e uma foto",
      texts: { kicker: ["Design gráfico"], year: ["2025"], title: ["Portfólio"], name: ["por Seu Nome"] },
      photos: ["photo"],
    },
    about: {
      name: "Sobre mim", hint: "Apresentação com foto",
      texts: { hello: ["Olá!"], intro: ["Meu nome é"], name: ["Seu Nome."], role: ["sou designer em formação"], bio: ["Moro em Aracaju e adoro transformar ideias em imagens: cartazes, marcas, ilustrações e interfaces. Aqui estão alguns dos meus projetos favoritos.", true] },
      photos: ["photo"],
    },
    feature: {
      name: "Projeto em destaque", hint: "Foto grande e a história do projeto",
      texts: { kicker: ["Projeto 01"], title: ["Nome do projeto"], body: ["Conte em poucas linhas o desafio, o que você fez e o resultado. Por exemplo: criei a identidade visual de uma cafeteria do bairro, do logo às embalagens.", true], caption: ["Cliente · 2025"] },
      photos: ["photo"],
    },
    grid: {
      name: "Galeria", hint: "Três trabalhos lado a lado",
      texts: { kicker: ["Mais trabalhos"], title: ["Outros projetos"], cap1: ["Cartaz para festival"], cap2: ["Ilustração digital"], cap3: ["Identidade visual"] },
      photos: ["photo1", "photo2", "photo3"],
    },
    skills: {
      name: "O que eu faço", hint: "Três habilidades com ícones",
      texts: { kicker: ["Habilidades"], title: ["O que eu faço"], t1: ["Identidade visual"], d1: ["Logos e marcas com personalidade.", true], t2: ["Ilustração"], d2: ["Desenhos à mão e no digital.", true], t3: ["Interfaces"], d3: ["Sites e apps fáceis de usar.", true] },
      icons: { i1: "palette", i2: "pen", i3: "layout" },
    },
    quote: {
      name: "Frase", hint: "Uma frase que te inspira",
      texts: { quote: ["“Design não é só a aparência. É como funciona.”", true], author: ["Steve Jobs"] },
    },
    text: {
      name: "Texto livre", hint: "Título e um parágrafo",
      texts: { kicker: ["Minha história"], title: ["Um pouco mais sobre mim"], body: ["Escreva aqui o que quiser contar: sua trajetória, seus interesses, o que te inspira.", true] },
    },
    contact: {
      name: "Contato", hint: "Como falar com você",
      texts: { kicker: ["Contato"], title: ["Vamos criar juntos?"], body: ["Estou aberta a projetos, estágios e boas conversas.", true], email: ["seunome@email.com"], social: ["@seunome"], cta: ["Mande um oi"] },
    },
  };

  let serial = 1;
  const sticker = (art, x, y, s, r = 0) => ({ id: serial++, art, x, y, s: s ?? doodles[art]?.size ?? 12, r });
  function section(layout, tone = 0, stickers = []) {
    return { id: serial++, layout, tone, off: false, hide: {}, texts: {}, photos: {}, icons: {}, fmt: {}, stickers };
  }
  function sampleProject() {
    return {
      theme: "azul",
      palette: null,
      exported: false,
      sections: [
        section("cover", 1, [sticker("box", 36, 12), sticker("box", 39.5, 12), sticker("box", 61, 22), sticker("box", 5, 91), sticker("box", 74, 92), sticker("box", 77.5, 92), sticker("sparkle", 66, 10, 4.5)]),
        section("about", 0, [sticker("arrow", 50, 34, 8, 8)]),
        section("feature", 0),
        section("grid", 0, [sticker("tape", 26, 14, 13, -8)]),
        section("skills", 2),
        section("contact", 1, [sticker("star", 84, 30, 11, 12)]),
      ],
    };
  }

  // Ready-made portfolios: a style, a palette, the blocks with their texts and a few
  // stickers. Picking one replaces the page; Desfazer brings the old one back.
  const filled = (item, texts, fmt = {}) => Object.assign(item, { texts, fmt });
  const templates = {
    designer: { name: "Design gráfico", hint: "Pôster azul, letras de adesivo e colagem.", swatches: ["#2f6fe4", "#e9e9e6", "#121212"], build: sampleProject },
    foto: {
      name: "Fotografia", hint: "Minimal e frio, para as fotos falarem alto.", swatches: ["#38506a", "#e6ecf2", "#071018"],
      build: () => ({ theme: "minimal", palette: "polar", exported: false, sections: [
        filled(section("cover", 1, [sticker("vCamera", 80, 20, 12, 10), sticker("cFilm", 22, 88, 16, -4)]), { kicker: "Fotografia", year: "2025", title: "Luz & Sombra", name: "por Seu Nome" }),
        filled(section("feature", 0), { kicker: "Ensaio 01", title: "Orla ao entardecer", body: "Uma série sobre a luz dourada da Atalaia: pescadores, crianças e o vento no fim da tarde. Fotografei com uma lente fixa, só com luz natural.", caption: "Aracaju · 2025" }),
        filled(section("grid", 0, [sticker("tapeGrid", 18, 12, 13, -6)]), { kicker: "Portfólio", title: "Séries", cap1: "Retratos", cap2: "Paisagens", cap3: "Rua" }),
        filled(section("about", 2), { hello: "Oi!", intro: "Eu sou", name: "Seu Nome.", role: "fotógrafa em formação", bio: "Ando sempre com uma câmera e gosto de gente, de cidade e de luz baixa. Faço retratos, eventos pequenos e ensaios de rua." }),
        filled(section("quote", 1), { quote: "“Fotografar é colocar na mesma linha a cabeça, o olho e o coração.”", author: "Henri Cartier-Bresson" }),
        filled(section("contact", 0), { kicker: "Contato", title: "Vamos fotografar?", body: "Retratos, ensaios e cobertura de eventos.", email: "seunome@email.com", social: "@seunome.foto", cta: "Marcar um ensaio" }),
      ] }),
    },
    ilustra: {
      name: "Ilustração", hint: "Caderno de desenhos lilás, cheio de adesivos.", swatches: ["#7b5cc4", "#f6f2fd", "#2c1d52"],
      build: () => ({ theme: "caderno", palette: "violeta", exported: false, sections: [
        filled(section("cover", 1, [sticker("lFlower", 82, 18, 10, 8), sticker("lButterfly", 16, 84, 9, -12), sticker("lStar", 90, 80, 7, 10)]), { kicker: "Ilustração", year: "2025", title: "Caderno", name: "de Seu Nome" }),
        filled(section("about", 0, [sticker("lLavender", 92, 70, 6, 8)]), { hello: "Olá!", intro: "Me chamo", name: "Seu Nome.", role: "ilustradora e sonhadora", bio: "Desenho bichos, plantas e pessoas com aquarela e no digital. Adoro capas de livro, estampas e personagens fofos." }),
        filled(section("grid", 0, [sticker("lMoon", 90, 14, 8, 0)]), { kicker: "Galeria", title: "Desenhos favoritos", cap1: "Capa de livro", cap2: "Personagem", cap3: "Estampa" }),
        filled(section("skills", 2), { kicker: "Técnicas", title: "Como eu desenho", t1: "Aquarela", d1: "Cores leves e manchas no papel.", t2: "Digital", d2: "Pincéis no tablet e muita camada.", t3: "Personagens", d3: "Do rascunho ao bichinho pronto." }),
        filled(section("contact", 1, [sticker("lHearts", 86, 26, 8, 8)]), { kicker: "Contato", title: "Bora desenhar junto?", body: "Encomendas, capas e parcerias.", email: "seunome@email.com", social: "@seunome.desenha", cta: "Mandar uma ideia" }),
      ] }),
    },
    ux: {
      name: "UX/UI", hint: "Revista colorida com estudo de caso.", swatches: ["#ef0c1a", "#ffbbbc", "#99c13f"],
      build: () => ({ theme: "revista", palette: "guacamole", exported: false, sections: [
        filled(section("cover", 1, [sticker("cursor", 70, 64, 5, -8), sticker("box", 14, 16), sticker("box", 17.5, 16)]), { kicker: "UX/UI Design", year: "2025", title: "Design que acolhe", name: "por Seu Nome" }, { title: { z: .72, ls: 0, lh: 0, r: 0, tx: 0, ty: 0 } }),
        filled(section("feature", 0, [sticker("badge", 88, 16, 8, 12)]), { kicker: "Estudo de caso", title: "App do ônibus", body: "Conversei com 12 pessoas no ponto, desenhei três fluxos e testei protótipos no papel. O tempo para achar a linha certa caiu de 40 para 12 segundos.", caption: "Pesquisa · Protótipo · Teste" }),
        filled(section("skills", 2), { kicker: "Processo", title: "Como eu trabalho", t1: "Pesquisa", d1: "Entrevistas e observação de verdade.", t2: "Protótipos", d2: "Do papel ao Figma, sem pressa.", t3: "Testes", d3: "Ver a pessoa usar e ajustar." }),
        filled(section("grid", 0), { kicker: "Mais projetos", title: "Outros trabalhos", cap1: "Site de ONG", cap2: "Painel de dados", cap3: "App de receitas" }),
        filled(section("contact", 1), { kicker: "Contato", title: "Vamos resolver juntos?", body: "Aberta a estágios e projetos de produto.", email: "seunome@email.com", social: "linkedin.com/in/seunome", cta: "Mandar mensagem" }),
      ] }),
    },
    escrita: {
      name: "Escrita", hint: "Noite estrelada para textos e poesia.", swatches: ["#1d3266", "#eef1f7", "#b8902a"],
      build: () => ({ theme: "minimal", palette: "estrelada", exported: false, sections: [
        filled(section("cover", 2, [sticker("eMoon", 84, 20, 9, 0), sticker("eStar", 18, 84, 11, -10)]), { kicker: "Escrita", year: "2025", title: "Palavras ao luar", name: "por Seu Nome" }, { title: { z: .8, ls: 0, lh: 0, r: -3, tx: 0, ty: 0 } }),
        filled(section("text", 0, [sticker("aQuill", 92, 22, 6, 12)]), { kicker: "Quem escreve", title: "Escrevo para lembrar", body: "Contos curtos, crônicas da cidade e poemas que nascem no ônibus. Aqui estão alguns textos que já saíram da gaveta." }),
        filled(section("quote", 1), { quote: "“Escrever é procurar entender, é procurar reproduzir o irreproduzível.”", author: "Clarice Lispector" }),
        filled(section("grid", 0, [sticker("eCloud", 84, 12, 13, 0)]), { kicker: "Textos", title: "Publicados", cap1: "Conto: A maré", cap2: "Crônica: Calçadão", cap3: "Poema: Farol" }),
        filled(section("contact", 0), { kicker: "Contato", title: "Quer ler mais?", body: "Revisões, oficinas e parcerias.", email: "seunome@email.com", social: "@seunome.escreve", cta: "Escrever para mim" }),
      ] }),
    },
  };

  /* ---------- Styles and colour palettes ---------- */

  const themes = {
    azul: { name: "Azul editorial", hint: "Pôster azul, título em adesivo e letras misturadas.", swatches: ["#2f6fe4", "#e9e9e6", "#121212"] },
    revista: { name: "Revista", hint: "Blocos de cor, colunas e títulos em caixa alta.", swatches: ["#b9d65a", "#ffffff", "#2b2b2b"] },
    minimal: { name: "Minimal", hint: "Fundo creme, serifa elegante e um sol amarelo.", swatches: ["#f9c80e", "#fdfbf0", "#1b1b1b"] },
    caderno: { name: "Caderno", hint: "Papel texturizado, letras desenhadas à mão e fotos de polaroide.", swatches: ["#e3a21a", "#f5f2ea", "#2b2a28"] },
  };
  // A palette recolours any style: paper, ink and accent; the rest is derived in CSS.
  // Each sticker collection brings a palette of its own, listed first.
  const palettes = {
    ...Object.fromEntries(Object.entries(packs).map(([key, collection]) => [key, collection.palette])),
    ...(window.CMS_PALETTES ?? {}),
    mostarda: { name: "Papel e mostarda", paper: "#f6f3ec", ink: "#2a2420", accent: "#e4a11b" },
    cobalto: { name: "Cobalto", paper: "#eef1f6", ink: "#111a2e", accent: "#2f5bea" },
    coral: { name: "Menta e coral", paper: "#f0f8f4", ink: "#1f2b27", accent: "#ff6b57" },
    lavanda: { name: "Lavanda", paper: "#f5f2fb", ink: "#251e3a", accent: "#8a6cf0" },
    tomate: { name: "Tomate", paper: "#fff6ef", ink: "#2a1812", accent: "#e2412b" },
    floresta: { name: "Floresta", paper: "#f2f4ec", ink: "#1c2a1e", accent: "#3c7a4b" },
    chiclete: { name: "Chiclete", paper: "#fff1f6", ink: "#2c1420", accent: "#ff4f9a" },
    noite: { name: "Noite", paper: "#16171d", ink: "#f1efe8", accent: "#ffd166" },
  };
  function inkOn(hex) {
    const [r, g, b] = hex.slice(1).match(/../g).map(pair => {
      const value = Number.parseInt(pair, 16) / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b > .32 ? "#1d1d1d" : "#ffffff";
  }
  const paletteStyle = key => {
    const palette = palettes[key];
    if (!palette) return "";
    let css = `--paper:${palette.paper};--ink:${palette.ink};--accent:${palette.accent};--accent-ink:${inkOn(palette.accent)}`;
    // Five-colour palettes also name the section tone, the highlight and the dark block.
    if (palette.tone) css += `;--tone1:${palette.tone};--tone1-ink:${inkOn(palette.tone)};--tone1-label:${inkOn(palette.tone)}`;
    if (palette.hl) css += `;--hl:${palette.hl}`;
    if (palette.dark) css += `;--dark:${palette.dark};--dark-ink:${inkOn(palette.dark)}`;
    return css;
  };
  const paletteColours = palette => [palette.accent, palette.paper, palette.ink, palette.tone, palette.dark].filter(Boolean);

  /* ---------- State, saving and undo ---------- */

  let project;
  let photos = {}; // photo id -> data URL, kept out of the undo snapshots
  const past = [];
  const future = [];
  let selected = null; // { section, sticker? }
  let previewing = false;
  let saveTimer = 0;

  const validLayout = value => Object.hasOwn(layouts, value);
  function readSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !Array.isArray(saved.project?.sections)) return false;
      const clean = saved.project.sections.filter(item => item && validLayout(item.layout)).slice(0, 40).map(item => ({
        id: serial++,
        layout: item.layout,
        tone: [0, 1, 2].includes(item.tone) ? item.tone : 0,
        off: item.off === true,
        hide: Object.fromEntries(Object.entries(item.hide ?? {}).filter(([key, value]) => /^[a-z]+\d?$/.test(key) && value === true)),
        texts: Object.fromEntries(Object.entries(item.texts ?? {}).filter(([slot, value]) => Object.hasOwn(layouts[item.layout].texts, slot) && typeof value === "string").map(([slot, value]) => [slot, value.slice(0, 600)])),
        photos: Object.fromEntries(Object.entries(item.photos ?? {}).filter(([, value]) => typeof value === "string")),
        icons: Object.fromEntries(Object.entries(item.icons ?? {}).filter(([, value]) => Object.hasOwn(icons, value))),
        fmt: Object.fromEntries(Object.entries(item.fmt ?? {}).filter(([slot, format]) => Object.hasOwn(layouts[item.layout].texts, slot) && format && typeof format === "object").map(([slot, format]) => [slot, {
          z: clamp(Number(format.z) || 1, .4, 3), ls: clamp(Number(format.ls) || 0, -.1, .5), lh: format.lh ? clamp(Number(format.lh), .7, 2.4) : 0,
          r: clamp(Number(format.r) || 0, -180, 180), tx: clamp(Number(format.tx) || 0, -60, 60), ty: clamp(Number(format.ty) || 0, -60, 60),
        }])),
        stickers: (Array.isArray(item.stickers) ? item.stickers : []).filter(piece => piece && (doodles[piece.art] || cute[piece.art])).slice(0, 40).map(piece => ({
          id: serial++, art: piece.art, x: clamp(Number(piece.x) || 50, 0, 100), y: clamp(Number(piece.y) || 50, 0, 100), s: clamp(Number(piece.s) || 10, 2, 60), r: clamp(Number(piece.r) || 0, -180, 180),
        })),
      }));
      const savedPhotos = saved.photos && typeof saved.photos === "object" ? saved.photos : {};
      photos = Object.fromEntries(Object.entries(savedPhotos).filter(([, value]) => typeof value === "string" && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value)));
      project = {
        theme: Object.hasOwn(themes, saved.project.theme) ? saved.project.theme : "azul",
        palette: Object.hasOwn(palettes, saved.project.palette) ? saved.project.palette : null,
        exported: saved.project.exported === true,
        sections: clean,
      };
      return true;
    } catch {
      return false;
    }
  }
  if (!readSaved()) project = sampleProject();

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const used = new Set(project.sections.flatMap(item => Object.values(item.photos)));
      for (const id of Object.keys(photos)) if (!used.has(id) && !past.some(shot => shot.includes(`"${id}"`))) delete photos[id];
      const kept = Object.fromEntries([...used].filter(id => photos[id]).map(id => [id, photos[id]]));
      try {
        localStorage.setItem(storageKey, JSON.stringify({ project, photos: kept }));
      } catch {
        say("O navegador não tem espaço para guardar tantas fotos. O site continua aqui nesta visita: baixe-o para não perder nada.");
      }
    }, 250);
  }

  const snapshot = () => JSON.stringify(project);
  // Every change goes through here, so it can be undone.
  function change(mutate, { keepSelection = true } = {}) {
    past.push(snapshot());
    if (past.length > 60) past.shift();
    future.length = 0;
    mutate();
    if (!keepSelection) selected = null;
    save();
    render();
  }
  function restore(from, to) {
    if (!from.length) return;
    to.push(snapshot());
    project = JSON.parse(from.pop());
    if (selected && !project.sections.some(item => item.id === selected.section)) selected = null;
    save();
    render();
  }
  const undo = () => restore(past, future);
  const redo = () => restore(future, past);

  function say(text) {
    status.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { status.textContent = ""; }, 6000);
  }

  /* ---------- Rendering the page (for editing and for the downloaded file) ---------- */

  const textOf = (item, slot) => item.texts[slot] ?? layouts[item.layout].texts[slot][0];
  // The downloaded page describes each photo with the text that goes with it.
  function altFor(item, slot) {
    if (slot.startsWith("photo") && slot.length > 5) return textOf(item, `cap${slot.slice(5)}`);
    if (item.layout === "feature") return textOf(item, "title");
    if (item.layout === "about") return `Foto de ${textOf(item, "name").replace(/\.$/, "")}`;
    if (item.layout === "cover") return textOf(item, "name").replace(/^por\s+/i, "");
    return "";
  }

  function renderSection(item, mode) {
    const edit = mode === "edit";
    const layout = layouts[item.layout];
    if (!edit && item.off) return "";
    // Parts that can be hidden: photos, skill cards, gallery items, contact lines.
    const hidden = key => item.hide?.[key] === true;
    const eye = (key, label) => edit
      ? `<button type="button" class="cms-eye" data-toggle-part="${key}" aria-pressed="${hidden(key)}" title="${hidden(key) ? "Mostrar" : "Ocultar"} ${esc(label)} no site" aria-label="${hidden(key) ? "Mostrar" : "Ocultar"} ${esc(label)} no site">${hidden(key) ? ui.eyeOff : ui.eye}</button>`
      : "";
    const off = key => hidden(key) ? " is-off" : "";
    const t = (slot, tag, classes = "") => {
      const value = textOf(item, slot);
      const [fallback, multi] = layout.texts[slot];
      if (!edit && !value.trim()) return "";
      const attributes = edit
        ? ` contenteditable="plaintext-only" spellcheck="true" role="textbox" aria-label="${esc(layout.name)}: ${esc(fallback)}"${multi ? ' aria-multiline="true"' : ""} data-slot="${slot}" data-hint="${esc(fallback)}"`
        : "";
      const look = fmtStyle(item.fmt?.[slot], tag);
      return `<${tag} class="cms-t ${classes}"${attributes}${look ? ` style="${look}"` : ""}>${esc(value)}</${tag}>`;
    };
    const photo = (slot, classes = "", own = true) => {
      const source = photos[item.photos[slot]];
      if (!edit && own && hidden(slot)) return "";
      const inside = source
        ? `<img src="${source}" alt="${esc(edit ? "" : altFor(item, slot))}">`
        : `<span class="cms-photo-empty">${ui.image}<span>Adicionar foto</span><small>Sem foto, o quadro some do site</small></span>`;
      if (!edit && !source) return "";
      const tools = edit
        ? source
          ? `<span class="cms-photo-tools"><button type="button" data-photo-pick="${slot}">Trocar foto</button><button type="button" data-photo-clear="${slot}">Tirar</button></span>`
          : `<button type="button" class="cms-photo-hit" data-photo-pick="${slot}" aria-label="Adicionar foto: ${esc(layout.name)}"></button>`
        : "";
      return `<figure class="cms-photo ${classes}${source ? " has-photo" : ""}${own ? off(slot) : ""}">${inside}${tools}${own ? eye(slot, "a foto") : ""}</figure>`;
    };
    const icon = slot => {
      const name = item.icons[slot] ?? layout.icons[slot];
      return edit
        ? `<button type="button" class="cms-skill-icon" data-icon="${slot}" aria-label="Trocar ícone" title="Clique para trocar o ícone">${icons[name]}</button>`
        : `<span class="cms-skill-icon">${icons[name]}</span>`;
    };
    let inner = "";
    switch (item.layout) {
      case "cover":
        inner = `${t("kicker", "p", "cms-label cms-cover-kicker")}${t("year", "p", "cms-label cms-cover-year")}${t("title", "h1", "cms-cover-title")}${t("name", "p", "cms-cover-name")}${photo("photo", "cms-cover-photo")}`;
        break;
      case "about":
        inner = `${t("hello", "p", "cms-about-big cms-about-hello")}${t("intro", "p", "cms-about-big cms-about-intro")}${t("name", "h2", "cms-hl cms-about-name")}${photo("photo", "cms-about-photo")}${t("role", "p", "cms-about-big cms-about-role")}${t("bio", "p", "cms-text cms-about-bio")}`;
        break;
      case "feature":
        inner = `${photo("photo", "cms-feature-photo")}<div class="cms-feature-text">${t("kicker", "p", "cms-label")}${t("title", "h2", "cms-title")}${t("body", "p", "cms-text cms-feature-body")}${t("caption", "p", "cms-caption")}</div>`;
        break;
      case "grid":
        // On the published page a frame without a photo leaves with its caption.
        inner = `<div>${t("kicker", "p", "cms-label")}${t("title", "h2", "cms-title")}</div><div class="cms-gallery">${[1, 2, 3].filter(index => edit || (!hidden(`fig${index}`) && photos[item.photos[`photo${index}`]])).map(index => `<figure class="cms-part${off(`fig${index}`)}">${photo(`photo${index}`, "", false)}${t(`cap${index}`, "figcaption", "cms-caption")}${eye(`fig${index}`, `o trabalho ${index}`)}</figure>`).join("")}</div>`;
        break;
      case "skills":
        inner = `<div>${t("kicker", "p", "cms-label")}${t("title", "h2", "cms-title")}</div><div class="cms-skill-list">${[1, 2, 3].filter(index => edit || !hidden(`card${index}`)).map(index => `<div class="cms-skill cms-part${off(`card${index}`)}">${icon(`i${index}`)}${t(`t${index}`, "h3")}${t(`d${index}`, "p", "cms-text")}${eye(`card${index}`, `o cartão ${index}`)}</div>`).join("")}</div>`;
        break;
      case "quote":
        inner = `${t("quote", "blockquote", "cms-quote-text")}${t("author", "p", "cms-label")}`;
        break;
      case "text":
        inner = `${t("kicker", "p", "cms-label")}${t("title", "h2", "cms-title")}${t("body", "p", "cms-text")}`;
        break;
      case "contact": {
        const email = textOf(item, "email").trim();
        const social = textOf(item, "social").trim();
        const mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : "";
        const lines = edit
          ? `<div class="cms-part${off("email")}">${t("email", "p")}${eye("email", "o e-mail")}</div><div class="cms-part${off("social")}">${t("social", "p")}${eye("social", "a rede social")}</div>`
          : `${email && !hidden("email") ? `<p>${mail ? `<a href="${esc(mail)}">${esc(email)}</a>` : esc(email)}</p>` : ""}${social && !hidden("social") ? `<p>${/^https?:\/\//.test(social) ? `<a href="${esc(social)}">${esc(social)}</a>` : esc(social)}</p>` : ""}`;
        const button = edit
          ? `<div class="cms-part${off("cta")}"><span class="cms-button">${t("cta", "span")}</span>${eye("cta", "o botão")}</div>`
          : textOf(item, "cta").trim() && !hidden("cta") ? `<a class="cms-button" href="${esc(mail || "#inicio")}">${esc(textOf(item, "cta"))}</a>` : "";
        inner = `${t("kicker", "p", "cms-label")}${t("title", "h2", "cms-title cms-contact-title")}${t("body", "p", "cms-text")}<div class="cms-contact-lines">${lines}</div>${button}`;
        break;
      }
    }
    const pieces = item.stickers.map(piece => {
      const style = `--x:${piece.x};--y:${piece.y};--s:${piece.s};--r:${piece.r}`;
      const chosen = edit && selected?.sticker === piece.id;
      const handles = chosen ? `<span class="cms-handles" aria-hidden="true">${["nw", "ne", "sw", "se"].map(corner => `<i class="cms-handle is-${corner}" data-handle="scale" title="Arraste para mudar o tamanho"></i>`).join("")}<i class="cms-handle-rotate" data-handle="rotate" title="Arraste para girar">${ui.rotate}</i></span>` : "";
      return edit
        ? `<span class="cms-sticker${chosen ? " is-selected" : ""}" style="${style}" data-sticker="${piece.id}" tabindex="0" role="button" aria-label="${esc(stickerName(piece.art))}. Arraste para mover. Puxe os cantos para mudar o tamanho e a bolinha de cima para girar. No teclado: setas movem, + e − mudam o tamanho, R gira, Delete apaga.">${stickerArt(piece.art)}${handles}</span>`
        : `<span class="cms-sticker" style="${style}" aria-hidden="true">${stickerArt(piece.art)}</span>`;
    }).join("");
    const bar = edit ? sectionBar(item) : "";
    const stickerBar = edit && selected?.section === item.id && selected.sticker ? stickerTools(item.stickers.find(piece => piece.id === selected.sticker)) : "";
    const chosen = edit && selected?.section === item.id && !selected.sticker;
    const note = edit && item.off ? `<p class="cms-off-note">${ui.eyeOff}<span>Bloco oculto: ele não aparece no seu site.</span></p>` : "";
    return `<section class="cms-section cms-${item.layout}${chosen ? " is-selected" : ""}${edit && item.off ? " is-off" : ""}" data-tone="${item.tone}" data-section="${item.id}"${edit ? ` aria-label="${esc(layout.name)}${item.off ? " (oculto)" : ""}"` : ""}>${bar}${note}<div class="cms-inner cms-${item.layout}-inner">${inner}</div><div class="cms-layer">${pieces}${stickerBar}</div></section>`;
  }

  function sectionBar(item) {
    const index = project.sections.indexOf(item);
    const button = (action, icon, label, disabled = false) => `<button type="button" data-action="${action}" title="${label}"${disabled ? " disabled" : ""}>${ui[icon]}<span>${label}</span></button>`;
    return `<div class="cms-section-bar" role="toolbar" aria-label="Bloco ${esc(layouts[item.layout].name)}">
      <strong>${esc(layouts[item.layout].name)}</strong>
      ${button("up", "up", "Subir", index === 0)}${button("down", "down", "Descer", index === project.sections.length - 1)}
      ${button("tone", "tone", "Cor")}${button("visibility", item.off ? "eyeOff" : "eye", item.off ? "Mostrar" : "Ocultar")}${button("duplicate", "copy", "Duplicar")}${button("remove", "trash", "Apagar")}
    </div>`;
  }

  // Size runs on a logarithmic slider (2 to 60), so small stickers get fine steps too.
  const sizeToRange = size => Math.round(Math.log(size / 2) / Math.log(30) * 100);
  const rangeToSize = value => +(2 * 30 ** (value / 100)).toFixed(2);
  const turnOf = degrees => ((Math.round(degrees) + 540) % 360) - 180;
  function stickerTools(piece) {
    if (!piece) return "";
    const button = (action, icon, label) => `<button type="button" data-sticker-action="${action}" title="${label}" aria-label="${label}">${ui[icon]}</button>`;
    const turn = turnOf(piece.r);
    return `<span class="cms-sticker-bar" data-for="${piece.id}" role="toolbar" aria-label="Enfeite">
      <label class="cms-bar-range" title="Tamanho">${ui.minus}<input type="range" min="0" max="100" step="1" value="${sizeToRange(piece.s)}" data-sticker-range="s" aria-label="Tamanho do enfeite">${ui.plus}</label>
      <label class="cms-bar-range" title="Giro">${ui.rotate}<input type="range" min="-180" max="180" step="1" value="${turn}" data-sticker-range="r" aria-label="Giro do enfeite" aria-valuetext="${turn} graus"><output>${turn}°</output></label>
      ${button("straighten", "level", "Endireitar")}${button("copy", "copy", "Duplicar")}${button("delete", "trash", "Apagar")}</span>`;
  }
  // The toolbar sits under the sticker (or above it, near the bottom of the block),
  // measured from the sticker's real box, so tall, wide and rotated pieces all fit.
  function placeBar() {
    const bar = page.querySelector(".cms-sticker-bar");
    const node = bar && page.querySelector(`[data-sticker="${bar.dataset.for}"]`);
    if (!node) return;
    const layer = bar.parentElement.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    let top = box.bottom - layer.top + 16;
    if (top + bar.offsetHeight > layer.height - 4) top = Math.max(4, box.top - layer.top - bar.offsetHeight - 40);
    bar.style.top = `${top}px`;
    bar.style.left = `${clamp(box.left + box.width / 2 - layer.left, bar.offsetWidth / 2 + 4, Math.max(bar.offsetWidth / 2 + 4, layer.width - bar.offsetWidth / 2 - 4))}px`;
  }
  // Keeps the sliders in step with a sticker changed by its handles or the wheel.
  function syncBar(piece) {
    const bar = page.querySelector(`.cms-sticker-bar[data-for="${piece.id}"]`);
    if (!bar) return;
    const turn = turnOf(piece.r);
    bar.querySelector('[data-sticker-range="s"]').value = sizeToRange(piece.s);
    const rotation = bar.querySelector('[data-sticker-range="r"]');
    rotation.value = turn;
    rotation.setAttribute("aria-valuetext", `${turn} graus`);
    bar.querySelector("output").textContent = `${turn}°`;
    placeBar();
  }

  function render() {
    page.dataset.theme = project.theme;
    page.style.cssText = paletteStyle(project.palette);
    if (project.palette) page.dataset.palette = project.palette;
    else delete page.dataset.palette;
    page.classList.toggle("is-editing", !previewing);
    page.innerHTML = project.sections.map(item => renderSection(item, previewing ? "view" : "edit")).join("")
      || '<div class="cms-blank"><p>Seu site está vazio. Escolha um bloco na gaveta <strong>Páginas</strong> para começar.</p></div>';
    get("cms-undo").disabled = !past.length;
    get("cms-redo").disabled = !future.length;
    renderSteps();
    if (!previewing) {
      placeBar();
      if (textSel) textTools();
    }
  }

  /* ---------- The drawer: pages, collage pieces and styles ---------- */

  let tab = "pages";
  // Tiny wireframes of each block, so the choice is visual.
  const wire = {
    cover: '<i class="w-band"></i><i class="w-big"></i><i class="w-line s"></i>',
    about: '<i class="w-line"></i><i class="w-hl"></i><i class="w-photo r"></i><i class="w-line s"></i>',
    feature: '<i class="w-photo l"></i><i class="w-line r"></i><i class="w-line r s"></i><i class="w-line r s"></i>',
    grid: '<i class="w-line s"></i><i class="w-photo a"></i><i class="w-photo b"></i><i class="w-photo c"></i>',
    skills: '<i class="w-line s"></i><i class="w-dot"></i><i class="w-dot"></i><i class="w-dot"></i>',
    quote: '<i class="w-quote"></i><i class="w-line s c"></i>',
    text: '<i class="w-line s"></i><i class="w-big s"></i><i class="w-line"></i><i class="w-line"></i>',
    contact: '<i class="w-big"></i><i class="w-line s"></i><i class="w-pill"></i>',
  };

  function renderDrawer() {
    for (const button of document.querySelectorAll("[data-cms-tab]")) {
      const active = button.dataset.cmsTab === tab;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", `cms-tab-${tab}`);
    if (tab === "pages") {
      panel.innerHTML = `<h3 class="cms-drawer-title">Modelos prontos</h3><p class="cms-drawer-hint">Comece de um portfólio inteiro. Trocou e não gostou? Use Desfazer.</p>
        <div class="cms-template-list">${Object.entries(templates).map(([key, template]) => `<button type="button" class="cms-template-tile" data-template-pick="${key}"><span class="cms-template-swatch" aria-hidden="true">${template.swatches.map(colour => `<i style="background:${colour}"></i>`).join("")}</span><strong>${template.name}</strong><small>${template.hint}</small></button>`).join("")}</div>
        <h3 class="cms-drawer-title">Blocos</h3><p class="cms-drawer-hint">Clique para colocar um bloco pronto abaixo do bloco selecionado.</p><div class="cms-page-grid">${Object.entries(layouts).map(([key, layout]) => `
        <button type="button" class="cms-page-tile" data-add-section="${key}">
          <span class="cms-wire is-${key}" aria-hidden="true">${wire[key]}</span>
          <strong>${layout.name}</strong><small>${layout.hint}</small>
        </button>`).join("")}</div>`;
    } else if (tab === "stickers") {
      const tile = (art, picture) => `<button type="button" class="cms-sticker-tile${doodles[art]?.wide ? " is-wide" : ""}" data-add-sticker="${art}" aria-label="Adicionar ${esc(stickerName(art))}" title="${esc(stickerName(art))}"><span class="cms-site" data-theme="${project.theme}"${project.palette ? ` data-palette="${project.palette}" style="${paletteStyle(project.palette)}"` : ""}>${picture}</span></button>`;
      const group = name => Object.entries(doodles).filter(([, doodle]) => doodle.group === name).map(([art, doodle]) => tile(art, doodle.svg)).join("");
      const collection = packs[pack];
      const packTile = (art, doodle) => `<button type="button" class="cms-sticker-tile is-pack${doodle.wide ? " is-wide" : ""}" data-add-sticker="${art}" aria-label="Adicionar ${esc(doodle.name)}" title="${esc(doodle.name)}" style="background:${collection.palette.paper}"><span class="cms-site">${doodle.svg}</span></button>`;
      const collections = collection ? `
        <h3 class="cms-drawer-title" id="cms-packs-title">Coleções</h3>
        <div class="cms-pack-tabs" role="group" aria-labelledby="cms-packs-title">${Object.entries(packs).map(([key, item]) => `<button type="button" class="cms-pack-chip" data-pack-pick="${key}" aria-pressed="${key === pack}"><span class="cms-pack-dots" aria-hidden="true">${item.swatches.map(color => `<i style="background:${color}"></i>`).join("")}</span>${item.name}</button>`).join("")}</div>
        <p class="cms-drawer-hint cms-pack-hint">${collection.hint}</p>
        <div class="cms-sticker-grid">${Object.entries(collection.pieces).map(([art]) => packTile(art, doodles[art])).join("")}</div>
        ${project.palette === pack
          ? `<p class="cms-pack-match is-on"><span aria-hidden="true">✓</span> Paleta ${collection.name} aplicada ao site.</p>`
          : `<button type="button" class="cms-pack-match" data-pack-palette="${pack}"><span class="cms-palette-swatch" aria-hidden="true">${[collection.palette.accent, collection.palette.paper, collection.palette.ink].map(color => `<i style="background:${color}"></i>`).join("")}</span>Combinar o site: usar a paleta ${collection.name}</button>`}` : "";
      panel.innerHTML = `<p class="cms-drawer-hint">Arraste um enfeite até a página ou clique para colocá-lo no bloco selecionado.</p>${collections}
        <h3 class="cms-drawer-title">Scrapbook</h3><div class="cms-sticker-grid">${group("scrap")}</div>
        <h3 class="cms-drawer-title">Elementos de interface</h3><div class="cms-sticker-grid">${group("ui")}</div>
        <h3 class="cms-drawer-title">Adesivos</h3><div class="cms-sticker-grid">${Object.keys(cute).map(art => tile(art, `<img src="${cutePicture(art)}" alt="">`)).join("")}</div>`;
    } else {
      panel.innerHTML = `<p class="cms-drawer-hint">O estilo escolhe as fontes e as cores. Seus textos e fotos continuam os mesmos.</p><div class="cms-theme-list">${Object.entries(themes).map(([key, theme]) => `
        <button type="button" class="cms-theme-tile" data-theme-pick="${key}" aria-pressed="${project.theme === key}">
          <span class="cms-site cms-theme-sample" data-theme="${key}" aria-hidden="true"><span class="cms-theme-aa">Aa</span><span class="cms-theme-dots">${theme.swatches.map(color => `<i style="background:${color}"></i>`).join("")}</span></span>
          <strong>${theme.name}</strong><small>${theme.hint}</small>
        </button>`).join("")}</div>
        <h3 class="cms-drawer-title">Paletas de cor</h3>
        <p class="cms-drawer-hint">Troque as cores do site inteiro de uma vez. Funciona com qualquer estilo.</p>
        <div class="cms-palette-list">
          <button type="button" class="cms-palette-tile" data-palette-pick="" aria-pressed="${!project.palette}"><span class="cms-palette-swatch" aria-hidden="true">${themes[project.theme].swatches.map(color => `<i style="background:${color}"></i>`).join("")}</span><strong>Cores do estilo</strong></button>
          ${Object.entries(palettes).map(([key, palette]) => `<button type="button" class="cms-palette-tile" data-palette-pick="${key}" aria-pressed="${project.palette === key}"><span class="cms-palette-swatch" aria-hidden="true">${paletteColours(palette).map(colour => `<i style="background:${colour}"></i>`).join("")}</span><strong>${palette.name}</strong></button>`).join("")}
        </div>`;
    }
  }

  for (const button of document.querySelectorAll("[data-cms-tab]")) {
    button.addEventListener("click", () => { tab = button.dataset.cmsTab; renderDrawer(); });
    button.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const tabs = [...document.querySelectorAll("[data-cms-tab]")];
      const next = tabs[(tabs.indexOf(button) + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      tab = next.dataset.cmsTab;
      renderDrawer();
      next.focus();
    });
  }

  const sectionById = id => project.sections.find(item => item.id === id);
  // Where a new piece goes: the selected block, or the one in the middle of the view.
  function targetSection() {
    if (selected && sectionById(selected.section)) return sectionById(selected.section);
    const middle = canvas.getBoundingClientRect().top + canvas.clientHeight / 2;
    const element = [...page.querySelectorAll(".cms-section")].find(node => node.getBoundingClientRect().bottom > middle);
    return sectionById(Number(element?.dataset.section)) ?? project.sections[0];
  }

  function addSection(layout) {
    const after = selected ? project.sections.findIndex(item => item.id === selected.section) : project.sections.length - 1;
    const fresh = section(layout, layout === "quote" ? 1 : 0);
    change(() => { project.sections.splice(after + 1, 0, fresh); selected = { section: fresh.id }; });
    page.querySelector(`[data-section="${fresh.id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    say(`Bloco “${layouts[layout].name}” adicionado. Clique nos textos para escrever.`);
  }

  function addSticker(art, into = targetSection(), x = 50 + (Math.random() * 30 - 15), y = 50 + (Math.random() * 30 - 15)) {
    if (!into) return;
    const piece = sticker(art, clamp(x, 2, 98), clamp(y, 2, 98));
    change(() => { into.stickers.push(piece); selected = { section: into.id, sticker: piece.id }; });
    page.querySelector(`[data-sticker="${piece.id}"]`)?.focus({ preventScroll: true });
    window.PepiBolota?.sfx("pop");
  }

  panel.addEventListener("click", event => {
    const model = event.target.closest("[data-template-pick]");
    if (model) {
      const fresh = templates[model.dataset.templatePick].build();
      textSel = null;
      change(() => { project.theme = fresh.theme; project.palette = fresh.palette; project.sections = fresh.sections; }, { keepSelection: false });
      canvas.scrollTo({ top: 0, behavior: "smooth" });
      say(`Modelo “${templates[model.dataset.templatePick].name}” aplicado. Mudou de ideia? Use Desfazer.`);
      pepiTip(`Modelo ${templates[model.dataset.templatePick].name}! Agora é só trocar pelos seus textos e fotos.`);
      return;
    }
    const add = event.target.closest("[data-add-section]");
    const stick = event.target.closest("[data-add-sticker]");
    const pick = event.target.closest("[data-theme-pick]");
    const paint = event.target.closest("[data-palette-pick], [data-pack-palette]");
    const shelf = event.target.closest("[data-pack-pick]");
    if (shelf) {
      if (shelf.dataset.packPick === pack) return;
      pack = shelf.dataset.packPick;
      renderDrawer();
      panel.querySelector(`[data-pack-pick="${pack}"]`)?.focus();
      say(`Coleção ${packs[pack].name}: ${Object.keys(packs[pack].pieces).length} enfeites.`);
      return;
    }
    if (paint) {
      const key = (paint.dataset.palettePick ?? paint.dataset.packPalette) || null;
      if (key === project.palette) return;
      change(() => { project.palette = key; });
      renderDrawer();
      panel.querySelector(`[data-palette-pick="${key ?? ""}"]`)?.focus();
      pepiTip(key ? `Paleta “${palettes[key].name}”! Mesmo site, clima novo.` : "Voltamos às cores originais do estilo.");
      return;
    }
    if (add) addSection(add.dataset.addSection);
    else if (stick && !draggingFromDrawer) addSticker(stick.dataset.addSticker);
    else if (pick && pick.dataset.themePick !== project.theme) {
      change(() => { project.theme = pick.dataset.themePick; });
      renderDrawer();
      panel.querySelector(`[data-theme-pick="${project.theme}"]`)?.focus();
      say(`Estilo “${themes[project.theme].name}” aplicado. Use Desfazer para voltar.`);
      pepiTip("Mesmo conteúdo, outro estilo. É a mágica do CSS!");
    }
  });

  /* ---------- The 4-step guide ---------- */

  function steps() {
    const shown = project.sections.filter(item => !item.off);
    const covers = shown.filter(item => item.layout === "cover");
    const named = covers.some(item => item.texts.name !== undefined && item.texts.name.trim() && item.texts.name !== layouts.cover.texts.name[0]);
    const aboutPhoto = shown.some(item => item.layout === "about" && photos[item.photos.photo]);
    const projectPhotos = shown.filter(item => ["feature", "grid"].includes(item.layout)).reduce((sum, item) => sum + Object.values(item.photos).filter(id => photos[id]).length, 0);
    return [
      { done: named, text: "Escreva seu nome na capa", go: covers[0] },
      { done: aboutPhoto, text: "Coloque sua foto no Sobre mim", go: project.sections.find(item => item.layout === "about") },
      { done: projectPhotos >= 3, text: `Mostre 3 projetos com foto (${Math.min(3, projectPhotos)}/3)`, go: project.sections.find(item => ["feature", "grid"].includes(item.layout)) },
      { done: project.exported, text: "Baixe seu site", go: null },
    ];
  }
  function renderSteps() {
    const list = steps();
    const done = list.filter(step => step.done).length;
    get("cms-steps-bar").style.setProperty("--done", done / list.length);
    get("cms-steps-count").textContent = `${done} de ${list.length}`;
    get("cms-steps").innerHTML = list.map((step, index) => `<li class="${step.done ? "is-done" : ""}"><button type="button" data-step="${index}"><span class="cms-check" aria-hidden="true">${step.done ? "✓" : index + 1}</span>${esc(step.text)}<span class="visually-hidden">${step.done ? " (feito)" : ""}</span></button></li>`).join("");
  }
  get("cms-steps").addEventListener("click", event => {
    const button = event.target.closest("[data-step]");
    if (!button) return;
    const step = steps()[Number(button.dataset.step)];
    if (!step.go) {
      exportButton.focus();
      exportButton.classList.remove("is-nudged");
      void exportButton.offsetWidth;
      exportButton.classList.add("is-nudged");
      return;
    }
    if (previewing) togglePreview();
    selected = { section: step.go.id };
    render();
    const node = page.querySelector(`[data-section="${step.go.id}"]`);
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
    (node?.querySelector(Number(button.dataset.step) === 0 ? '[data-slot="name"]' : ".cms-photo-hit, [data-photo-pick]"))?.focus({ preventScroll: true });
  });

  /* ---------- Editing on the page ---------- */

  // Texts: typed straight into the page. The project follows as you type; the undo
  // step is recorded when you leave the text.
  let typing = null; // { before, item, slot }
  page.addEventListener("focusin", event => {
    const slot = event.target.closest("[data-slot]");
    const node = event.target.closest(".cms-section");
    if (!node) return;
    const item = sectionById(Number(node.dataset.section));
    if (slot && item) {
      typing = { before: snapshot(), item, slot: slot.dataset.slot };
      if (textSel?.section !== item.id || textSel?.slot !== slot.dataset.slot) {
        textSel = { section: item.id, slot: slot.dataset.slot };
        textTools();
      }
    }
    if (item && selected?.section !== item.id && !event.target.closest("[data-sticker], .cms-sticker-bar")) {
      selected = { section: item.id };
      for (const other of page.querySelectorAll(".cms-section.is-selected")) other.classList.remove("is-selected");
      node.classList.add("is-selected");
      page.querySelector(".cms-sticker-bar")?.remove();
      for (const piece of page.querySelectorAll(".cms-sticker.is-selected")) piece.classList.remove("is-selected");
    }
  });
  page.addEventListener("input", event => {
    const slot = event.target.closest("[data-slot]");
    if (!slot || !typing) return;
    // textContent, not innerText: innerText would bring the CSS uppercase along.
    let value = slot.textContent.replace(/\n$/, "");
    if (value.length > 600) {
      value = value.slice(0, 600);
      slot.textContent = value;
    }
    typing.item.texts[typing.slot] = value;
    save();
    placeTextTools();
  });
  page.addEventListener("focusout", event => {
    const slot = event.target.closest("[data-slot]");
    if (!slot || !typing) return;
    if (typing.before !== snapshot()) {
      past.push(typing.before);
      future.length = 0;
      get("cms-undo").disabled = false;
      renderSteps();
    }
    typing = null;
  });
  page.addEventListener("keydown", event => {
    const slot = event.target.closest("[data-slot]");
    if (slot && event.key === "Enter" && slot.getAttribute("aria-multiline") !== "true") {
      event.preventDefault();
      slot.blur();
    }
    if (slot && event.key === "Escape") slot.blur();
    const piece = event.target.closest("[data-sticker]");
    if (piece && !event.ctrlKey && !event.metaKey) stickerKeys(event, piece);
  });
  // Pasting keeps only the text.
  page.addEventListener("paste", event => {
    const slot = event.target.closest("[data-slot]");
    if (!slot) return;
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
  });

  let quietUntil = 0; // the click that ends a sticker drag is not a click
  page.addEventListener("click", event => {
    if (performance.now() < quietUntil) return;
    if (previewing) {
      const link = event.target.closest("a");
      if (link) event.preventDefault();
      return;
    }
    const node = event.target.closest(".cms-section");
    const item = node && sectionById(Number(node.dataset.section));
    if (!item) return;
    const action = event.target.closest("[data-action]");
    const pick = event.target.closest("[data-photo-pick]");
    const clear = event.target.closest("[data-photo-clear]");
    const iconButton = event.target.closest("[data-icon]");
    const tool = event.target.closest("[data-sticker-action]");
    const partEye = event.target.closest("[data-toggle-part]");
    if (partEye) {
      const key = partEye.dataset.togglePart;
      change(() => {
        item.hide ??= {};
        if (item.hide[key]) delete item.hide[key];
        else item.hide[key] = true;
      });
      page.querySelector(`[data-section="${item.id}"] [data-toggle-part="${key}"]`)?.focus({ preventScroll: true });
      if (item.hide[key]) pepiTip("Escondido! Continua aqui no editor, mas some do seu site.");
      return;
    }
    if (action) sectionAction(item, action.dataset.action);
    else if (pick) choosePhoto(item, pick.dataset.photoPick);
    else if (clear) change(() => { delete item.photos[clear.dataset.photoClear]; });
    else if (iconButton) {
      const slot = iconButton.dataset.icon;
      const current = item.icons[slot] ?? layouts[item.layout].icons[slot];
      change(() => { item.icons[slot] = iconOrder[(iconOrder.indexOf(current) + 1) % iconOrder.length]; });
      page.querySelector(`[data-section="${item.id}"] [data-icon="${slot}"]`)?.focus();
    } else if (tool) stickerAction(item, tool.dataset.stickerAction);
    else if (!event.target.closest("[data-slot], [data-sticker], .cms-sticker-bar") && (selected?.section !== item.id || selected.sticker)) {
      selected = { section: item.id };
      render();
    }
  });

  function sectionAction(item, action) {
    const index = project.sections.indexOf(item);
    if (action === "up" || action === "down") {
      const to = index + (action === "up" ? -1 : 1);
      if (to < 0 || to >= project.sections.length) return;
      change(() => { project.sections.splice(index, 1); project.sections.splice(to, 0, item); });
      const node = page.querySelector(`[data-section="${item.id}"]`);
      node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      node?.querySelector(`[data-action="${action}"]:not(:disabled)`)?.focus({ preventScroll: true });
    } else if (action === "visibility") {
      change(() => { item.off = !item.off; });
      page.querySelector(`[data-section="${item.id}"] [data-action="visibility"]`)?.focus({ preventScroll: true });
      say(item.off ? `“${layouts[item.layout].name}” está oculto: continua aqui, mas não vai para o site.` : `“${layouts[item.layout].name}” voltou para o site.`);
      if (item.off) pepiTip("Não tem esse conteúdo ainda? Sem problema: o bloco fica guardado e some do site.");
    } else if (action === "tone") {
      change(() => { item.tone = (item.tone + 1) % 3; });
      page.querySelector(`[data-section="${item.id}"] [data-action="tone"]`)?.focus({ preventScroll: true });
    } else if (action === "duplicate") {
      const copy = JSON.parse(JSON.stringify(item));
      copy.id = serial++;
      copy.stickers.forEach(piece => { piece.id = serial++; });
      change(() => { project.sections.splice(index + 1, 0, copy); selected = { section: copy.id }; });
      say(`Bloco “${layouts[item.layout].name}” duplicado.`);
    } else if (action === "remove") {
      change(() => { project.sections.splice(index, 1); }, { keepSelection: false });
      say(`Bloco “${layouts[item.layout].name}” apagado. Use Desfazer se mudar de ideia.`);
    }
  }

  /* ---------- Photos ---------- */

  let photoTarget = null;
  function choosePhoto(item, slot) {
    photoTarget = { id: item.id, slot };
    photoPicker.value = "";
    photoPicker.click();
  }
  async function shrink(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("format");
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const board = document.createElement("canvas");
      const ratio = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
      board.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      board.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      board.getContext("2d").drawImage(image, 0, 0, board.width, board.height);
      return board.toDataURL("image/webp", .8);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  photoPicker.addEventListener("change", async () => {
    const file = photoPicker.files[0];
    const target = photoTarget;
    if (!file || !target) return;
    try {
      const data = await shrink(file);
      const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      photos[id] = data;
      const item = sectionById(target.id);
      if (!item) return;
      change(() => { item.photos[target.slot] = id; selected = { section: item.id }; });
      window.PepiBolota?.sfx("sparkle");
      page.querySelector(`[data-section="${item.id}"] [data-photo-pick="${target.slot}"]`)?.focus({ preventScroll: true });
      pepiTip("Que foto linda! Já está com cara de portfólio de verdade.");
    } catch {
      say("Não deu para abrir essa imagem. Escolha uma foto JPG, PNG ou WebP.");
    }
  });

  /* ---------- Stickers: drag, keyboard and the little toolbar ---------- */

  function stickerAction(item, action) {
    const piece = item.stickers.find(other => other.id === selected?.sticker);
    if (!piece) return;
    change(() => {
      if (action === "smaller") piece.s = clamp(+(piece.s / 1.2).toFixed(2), 2, 60);
      if (action === "bigger") piece.s = clamp(+(piece.s * 1.2).toFixed(2), 2, 60);
      if (action === "turn") piece.r = ((piece.r + 15 + 180) % 360) - 180;
      if (action === "straighten") piece.r = 0;
      if (action === "copy") {
        const copy = { ...piece, id: serial++, x: clamp(piece.x + 4, 2, 98), y: clamp(piece.y + 4, 2, 98) };
        item.stickers.push(copy);
        selected = { section: item.id, sticker: copy.id };
      }
      if (action === "delete") {
        item.stickers = item.stickers.filter(other => other !== piece);
        selected = { section: item.id };
      }
    });
    if (action !== "delete") page.querySelector(`.cms-sticker-bar [data-sticker-action="${action}"]`)?.focus({ preventScroll: true });
  }

  function stickerKeys(event, node) {
    const item = sectionById(Number(node.closest(".cms-section").dataset.section));
    const piece = item?.stickers.find(other => other.id === Number(node.dataset.sticker));
    if (!piece) return;
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const step = event.shiftKey ? 5 : 1;
    let handled = true;
    selected = { section: item.id, sticker: piece.id };
    if (moves[event.key]) change(() => { piece.x = clamp(piece.x + moves[event.key][0] * step, 0, 100); piece.y = clamp(piece.y + moves[event.key][1] * step, 0, 100); });
    else if (event.key === "+" || event.key === "=") change(() => { piece.s = clamp(piece.s * 1.2, 2, 60); });
    else if (event.key === "-") change(() => { piece.s = clamp(piece.s / 1.2, 2, 60); });
    else if (event.key.toLowerCase() === "r") change(() => { piece.r = ((piece.r + 15 + 180) % 360) - 180; });
    else if (event.key === "Delete" || event.key === "Backspace") {
      change(() => { item.stickers = item.stickers.filter(other => other !== piece); selected = { section: item.id }; });
      page.querySelector(`[data-section="${item.id}"]`)?.focus?.();
      return event.preventDefault();
    } else handled = false;
    if (handled) {
      event.preventDefault();
      page.querySelector(`[data-sticker="${piece.id}"]`)?.focus({ preventScroll: true });
    }
  }

  // Moving a sticker with the pointer: it follows in percent of its block. Its corner
  // handles resize it and the knob above rotates it, both around its centre; rotation
  // clicks into place near every 45°.
  let moving = null;
  page.addEventListener("pointerdown", event => {
    const node = event.target.closest("[data-sticker]");
    if (!node || previewing || event.button !== 0) return;
    const block = node.closest(".cms-section");
    const item = sectionById(Number(block.dataset.section));
    const piece = item.stickers.find(other => other.id === Number(node.dataset.sticker));
    event.preventDefault();
    node.setPointerCapture(event.pointerId);
    const handle = event.target.closest("[data-handle]");
    const box = node.getBoundingClientRect();
    const [cx, cy] = [box.left + box.width / 2, box.top + box.height / 2];
    moving = {
      node, block, item, piece, before: snapshot(), startX: event.clientX, startY: event.clientY, x: piece.x, y: piece.y, moved: false,
      mode: handle?.dataset.handle ?? "move", cx, cy, s: piece.s, r: piece.r,
      distance: Math.max(8, Math.hypot(event.clientX - cx, event.clientY - cy)),
      angle: Math.atan2(event.clientY - cy, event.clientX - cx),
    };
    if (handle) node.classList.add(`is-${moving.mode === "scale" ? "scaling" : "turning"}`);
    if (selected?.sticker !== piece.id) {
      selected = { section: item.id, sticker: piece.id };
      for (const other of page.querySelectorAll(".cms-sticker.is-selected, .cms-section.is-selected")) other.classList.remove("is-selected");
      node.classList.add("is-selected");
      page.querySelector(".cms-sticker-bar")?.remove();
    }
    node.focus({ preventScroll: true });
  });
  page.addEventListener("pointermove", event => {
    if (!moving) return;
    if (moving.mode !== "move") {
      moving.moved = true;
      if (moving.mode === "scale") {
        moving.piece.s = +clamp(moving.s * Math.hypot(event.clientX - moving.cx, event.clientY - moving.cy) / moving.distance, 2, 60).toFixed(2);
        moving.node.style.setProperty("--s", moving.piece.s);
      } else {
        let turn = moving.r + (Math.atan2(event.clientY - moving.cy, event.clientX - moving.cx) - moving.angle) * 180 / Math.PI;
        turn = turnOf(turn);
        const snap = Math.round(turn / 45) * 45;
        if (Math.abs(turn - snap) < 5 && !event.altKey) turn = turnOf(snap);
        moving.piece.r = turn;
        moving.node.style.setProperty("--r", turn);
      }
      syncBar(moving.piece);
      return;
    }
    const box = moving.block.getBoundingClientRect();
    const dx = (event.clientX - moving.startX) / box.width * 100;
    const dy = (event.clientY - moving.startY) / box.height * 100;
    if (!moving.moved && Math.hypot(event.clientX - moving.startX, event.clientY - moving.startY) < 3) return;
    moving.moved = true;
    moving.piece.x = +clamp(moving.x + dx, 0, 100).toFixed(1);
    moving.piece.y = +clamp(moving.y + dy, 0, 100).toFixed(1);
    moving.node.style.setProperty("--x", moving.piece.x);
    moving.node.style.setProperty("--y", moving.piece.y);
    placeBar();
  });
  const stopMoving = () => {
    if (!moving) return;
    const done = moving;
    moving = null;
    quietUntil = performance.now() + 250;
    if (done.moved) {
      past.push(done.before);
      future.length = 0;
      save();
    }
    render();
    page.querySelector(`[data-sticker="${done.piece.id}"]`)?.focus({ preventScroll: true });
  };
  page.addEventListener("pointerup", stopMoving);
  page.addEventListener("pointercancel", stopMoving);

  /* ---------- Texts: size, spacing, rotation and position ---------- */

  // Any text can be resized, spaced, turned and nudged, like a sticker. The settings
  // live in item.fmt[slot] and become inline styles, so the downloaded site keeps them.
  // Position is in cqi, a share of the site's width, so it holds on a phone too.
  const fmtDefault = { z: 1, ls: 0, lh: 0, r: 0, tx: 0, ty: 0 };
  const zoomToRange = zoom => Math.round(Math.log(zoom / .4) / Math.log(7.5) * 100);
  const rangeToZoom = value => +(.4 * 7.5 ** (value / 100)).toFixed(3);
  let textSel = null; // { section, slot }
  const textNode = () => textSel && page.querySelector(`[data-section="${textSel.section}"] [data-slot="${textSel.slot}"]`);
  const textFormat = () => ({ ...fmtDefault, ...(sectionById(textSel?.section)?.fmt?.[textSel?.slot] ?? {}) });
  function hideTextTools() {
    textSel = null;
    page.querySelector(".cms-text-tools")?.remove();
    page.querySelector(".cms-text-frame")?.remove();
  }
  function textTools() {
    page.querySelector(".cms-text-tools")?.remove();
    page.querySelector(".cms-text-frame")?.remove();
    const node = textNode();
    if (!node || previewing) return;
    const layer = node.closest(".cms-section").querySelector(".cms-layer");
    const format = textFormat();
    const style = getComputedStyle(node);
    const size = parseFloat(style.fontSize) || 16;
    const spacing = format.ls || (parseFloat(style.letterSpacing) || 0) / size;
    const leading = format.lh || (parseFloat(style.lineHeight) || size * 1.2) / size;
    const turn = turnOf(format.r);
    layer.insertAdjacentHTML("beforeend", `<div class="cms-text-frame" aria-hidden="true"><i class="cms-text-grip" data-text-handle="move" title="Arraste para mover o texto">${ui.move}</i><i class="cms-handle is-se" data-text-handle="scale" title="Arraste para mudar o tamanho"></i><i class="cms-handle-rotate" data-text-handle="rotate" title="Arraste para girar">${ui.rotate}</i></div>
      <div class="cms-text-tools" role="toolbar" aria-label="Ajustes do texto">
        <label class="cms-bar-range" title="Tamanho"><b class="cms-bar-glyph">A</b><input type="range" min="0" max="100" step="1" value="${zoomToRange(format.z)}" data-text-range="z" aria-label="Tamanho do texto"><b class="cms-bar-glyph is-big">A</b></label>
        <label class="cms-bar-range" title="Espaço entre letras"><b class="cms-bar-glyph">A↔A</b><input type="range" min="-10" max="50" step="1" value="${Math.round(spacing * 100)}" data-text-range="ls" aria-label="Espaço entre letras"></label>
        <label class="cms-bar-range" title="Espaço entre linhas">${ui.lines}<input type="range" min="70" max="240" step="5" value="${Math.round(leading * 100)}" data-text-range="lh" aria-label="Espaço entre linhas"></label>
        <label class="cms-bar-range" title="Giro">${ui.rotate}<input type="range" min="-180" max="180" step="1" value="${turn}" data-text-range="r" aria-label="Giro do texto" aria-valuetext="${turn} graus"><output>${turn}°</output></label>
        <button type="button" data-text-action="reset" title="Voltar ao jeito do estilo">${ui.level}<span>Padrão</span></button>
      </div>`);
    placeTextTools();
  }
  function placeTextTools() {
    const node = textNode();
    const frame = page.querySelector(".cms-text-frame");
    const bar = page.querySelector(".cms-text-tools");
    if (!node || !frame || !bar) return;
    const layer = frame.parentElement.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    Object.assign(frame.style, { left: `${box.left - layer.left - 6}px`, top: `${box.top - layer.top - 6}px`, width: `${box.width + 12}px`, height: `${box.height + 12}px` });
    let top = box.bottom - layer.top + 14;
    if (top + bar.offsetHeight > layer.height - 4) top = Math.max(4, box.top - layer.top - bar.offsetHeight - 46);
    bar.style.top = `${top}px`;
    bar.style.left = `${clamp(box.left + box.width / 2 - layer.left, bar.offsetWidth / 2 + 4, Math.max(bar.offsetWidth / 2 + 4, layer.width - bar.offsetWidth / 2 - 4))}px`;
  }
  function setFormat(patch) {
    const item = sectionById(textSel?.section);
    const node = textNode();
    if (!item || !node) return;
    tuning ??= snapshot();
    item.fmt ??= {};
    const format = { ...textFormat(), ...patch };
    item.fmt[textSel.slot] = format;
    node.style.cssText = fmtStyle(format, node.tagName.toLowerCase());
    const turn = turnOf(format.r);
    const rotation = page.querySelector('[data-text-range="r"]');
    if (rotation && document.activeElement !== rotation) rotation.value = turn;
    if (rotation) rotation.setAttribute("aria-valuetext", `${turn} graus`);
    const output = page.querySelector(".cms-text-tools output");
    if (output) output.textContent = `${turn}°`;
    const zoom = page.querySelector('[data-text-range="z"]');
    if (zoom && document.activeElement !== zoom) zoom.value = zoomToRange(format.z);
    placeTextTools();
  }
  page.addEventListener("click", event => {
    if (!event.target.closest('[data-text-action="reset"]') || !textSel) return;
    const item = sectionById(textSel.section);
    if (!item?.fmt?.[textSel.slot]) return;
    change(() => { delete item.fmt[textSel.slot]; });
  });
  // Clicking anywhere else on the page puts the text tools away.
  page.addEventListener("pointerdown", event => {
    if (textSel && !event.target.closest("[data-slot], .cms-text-tools, .cms-text-frame")) hideTextTools();
  }, true);
  let textMoving = null;
  page.addEventListener("pointerdown", event => {
    const handle = event.target.closest("[data-text-handle]");
    const node = handle && textNode();
    if (!node || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    handle.setPointerCapture(event.pointerId);
    const box = node.getBoundingClientRect();
    const [cx, cy] = [box.left + box.width / 2, box.top + box.height / 2];
    textMoving = {
      mode: handle.dataset.textHandle, before: snapshot(), format: textFormat(), startX: event.clientX, startY: event.clientY, cx, cy, moved: false,
      width: page.getBoundingClientRect().width || 1,
      distance: Math.max(8, Math.hypot(event.clientX - cx, event.clientY - cy)),
      angle: Math.atan2(event.clientY - cy, event.clientX - cx),
    };
    page.querySelector(".cms-text-frame")?.classList.add(`is-${textMoving.mode}`);
  });
  page.addEventListener("pointermove", event => {
    if (!textMoving) return;
    const start = textMoving;
    start.moved = true;
    if (start.mode === "move") {
      setFormat({ tx: +clamp(start.format.tx + (event.clientX - start.startX) / start.width * 100, -60, 60).toFixed(2), ty: +clamp(start.format.ty + (event.clientY - start.startY) / start.width * 100, -60, 60).toFixed(2) });
    } else if (start.mode === "scale") {
      setFormat({ z: +clamp(start.format.z * Math.hypot(event.clientX - start.cx, event.clientY - start.cy) / start.distance, .4, 3).toFixed(3) });
    } else {
      let turn = turnOf(start.format.r + (Math.atan2(event.clientY - start.cy, event.clientX - start.cx) - start.angle) * 180 / Math.PI);
      const snap = Math.round(turn / 45) * 45;
      if (Math.abs(turn - snap) < 5 && !event.altKey) turn = turnOf(snap);
      setFormat({ r: turn });
    }
  });
  const stopText = () => {
    if (!textMoving) return;
    page.querySelector(".cms-text-frame")?.classList.remove("is-move", "is-scale", "is-rotate");
    textMoving = null;
    quietUntil = performance.now() + 250;
    commitTuning();
  };
  page.addEventListener("pointerup", stopText);
  page.addEventListener("pointercancel", stopText);

  let tuning = null; // the snapshot before a slider or wheel gesture
  let tuneTimer = 0;
  function commitTuning() {
    if (!tuning) return;
    past.push(tuning);
    future.length = 0;
    tuning = null;
    save();
    get("cms-undo").disabled = false;
    get("cms-redo").disabled = true;
  }
  function tune(piece, size, turn) {
    tuning ??= snapshot();
    if (size !== null) piece.s = +clamp(size, 2, 60).toFixed(2);
    if (turn !== null) piece.r = turnOf(turn);
    const node = page.querySelector(`[data-sticker="${piece.id}"]`);
    node?.style.setProperty("--s", piece.s);
    node?.style.setProperty("--r", piece.r);
    syncBar(piece);
  }
  const chosenSticker = () => sectionById(selected?.section)?.stickers.find(piece => piece.id === selected?.sticker);
  page.addEventListener("input", event => {
    const textRange = event.target.closest("[data-text-range]");
    if (textRange && textSel) {
      const value = Number(textRange.value);
      const key = textRange.dataset.textRange;
      setFormat({ [key]: key === "z" ? rangeToZoom(value) : key === "ls" ? value / 100 : key === "lh" ? value / 100 : value });
      return;
    }
    const range = event.target.closest("[data-sticker-range]");
    const piece = range && chosenSticker();
    if (!piece) return;
    if (range.dataset.stickerRange === "s") tune(piece, rangeToSize(Number(range.value)), null);
    else tune(piece, null, Number(range.value));
  });
  page.addEventListener("change", event => {
    if (event.target.closest("[data-sticker-range], [data-text-range]")) commitTuning();
  });
  page.addEventListener("wheel", event => {
    const node = event.target.closest(".cms-sticker.is-selected");
    const piece = node && chosenSticker();
    if (!piece || previewing || moving) return;
    event.preventDefault();
    const delta = event.deltaY || event.deltaX;
    if (event.shiftKey) tune(piece, null, piece.r + Math.sign(delta) * 5);
    else tune(piece, piece.s * Math.exp(-delta * .0015), null);
    clearTimeout(tuneTimer);
    tuneTimer = setTimeout(commitTuning, 400);
  }, { passive: false });

  // Dragging a new piece from the drawer onto the page.
  let draggingFromDrawer = null;
  panel.addEventListener("pointerdown", event => {
    const tile = event.target.closest("[data-add-sticker]");
    if (!tile || event.button !== 0) return;
    draggingFromDrawer = null;
    const start = { x: event.clientX, y: event.clientY, art: tile.dataset.addSticker, tile, pointer: event.pointerId };
    const move = moveEvent => {
      if (moveEvent.pointerId !== start.pointer) return;
      if (!draggingFromDrawer) {
        if (Math.hypot(moveEvent.clientX - start.x, moveEvent.clientY - start.y) < 6) return;
        const ghost = document.createElement("span");
        ghost.className = "cms-site cms-ghost";
        ghost.dataset.theme = project.theme;
        ghost.innerHTML = stickerArt(start.art);
        document.body.append(ghost);
        draggingFromDrawer = { ghost };
        canvas.classList.add("is-dropping");
      }
      draggingFromDrawer.ghost.style.left = `${moveEvent.clientX}px`;
      draggingFromDrawer.ghost.style.top = `${moveEvent.clientY}px`;
    };
    const up = upEvent => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      canvas.classList.remove("is-dropping");
      if (!draggingFromDrawer) return;
      draggingFromDrawer.ghost.remove();
      const over = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest?.("#builder-page .cms-section");
      if (over && !previewing) {
        const box = over.getBoundingClientRect();
        addSticker(start.art, sectionById(Number(over.dataset.section)), (upEvent.clientX - box.left) / box.width * 100, (upEvent.clientY - box.top) / box.height * 100);
      }
      setTimeout(() => { draggingFromDrawer = null; }, 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });

  /* ---------- Pepi, the helper at the foot of the drawer ---------- */

  // Inside this near-fullscreen window there is no room for him on the taskbar, so he
  // moves in: an artist's beret, a short welcome and quick tips as you build.
  const helper = get("cms-helper");
  const helperHost = helper.querySelector(".cms-helper-host");
  const helperBubble = helper.querySelector(".cms-helper-bubble");
  const helperText = helper.querySelector(".cms-helper-text");
  const P = () => window.PepiBolota;
  const voice = {
    builderOpen: { text: "Você conquistou o Crie Meu Site! Seu portfólio já vem montado: é só clicar e trocar pelo que é seu. Solta essa criatividade!", face: "star" },
    builderExport: { text: "Seu site está prontinho! Agora é só mostrar para todo mundo!", face: "love" },
  };
  let helperPepi = null;
  function beret() {
    const r = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    return r(13, 4, 14, 1, "#3b2838") + r(10, 5, 22, 1, "#3b2838") + r(9, 6, 26, 3, "#3b2838") + r(14, 5, 12, 1, "#c2346f") + r(11, 6, 22, 2, "#c2346f") + r(10, 8, 24, 1, "#a32a5c") + r(14, 6, 6, 1, "#e8619a") + r(19, 2, 3, 2, "#3b2838");
  }
  function buildHelper() {
    if (helperPepi || !P()?.markup) return;
    helperHost.innerHTML = `<div class="pepi cms-helper-pepi" data-face="happy">${P().markup()}<svg class="cms-helper-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true">${beret()}</svg></div>`;
    helperPepi = helperHost.firstElementChild;
  }
  let manifest = null;
  const clips = new Map();
  async function clipFor(id) {
    manifest ??= fetch("./assets/pepi/falas.json", { cache: "no-cache" }).then(response => response.ok ? response.json() : {}).catch(() => ({}));
    const file = (await manifest)[id];
    if (typeof file !== "string" || !/^[\w-]+\.(mp3|ogg|wav)$/.test(file)) return null;
    if (!clips.has(id)) {
      clips.set(id, fetch(`./assets/pepi/${file}`)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error(file)))
        .then(data => P()?.audioContext()?.decodeAudioData(data) ?? null)
        .catch(() => null));
    }
    return clips.get(id);
  }
  let helperTalk = null;
  let helperTimer = 0;
  function helperQuiet() {
    helperTalk?.abort();
    helperTalk = null;
    clearTimeout(helperTimer);
    helperBubble.hidden = true;
  }
  const pause = (ms, signal) => new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(id); reject(new Error("stopped")); }, { once: true });
  });
  // A recorded line with lip sync, or a caption; tips are captions only.
  async function pepiSay(id, caption) {
    if (get("builder-window").hidden) return;
    helperQuiet();
    const controller = new AbortController();
    helperTalk = controller;
    const line = id ? voice[id] : { text: caption, face: "happy" };
    if (helperPepi) helperPepi.dataset.face = line.face;
    helperBubble.hidden = false;
    helperText.textContent = "";
    try {
      const clip = id && P()?.soundOn ? await clipFor(id) : null;
      if (controller.signal.aborted) return;
      const typing = P()?.typewrite ? P().typewrite(line.text, controller.signal, helperText) : Promise.resolve(helperText.textContent = line.text);
      if (clip && helperPepi) await Promise.all([typing, P().playClip(clip, controller.signal, helperPepi)]);
      else {
        await typing;
        await pause(1800 + line.text.length * 30, controller.signal);
      }
      helperTimer = setTimeout(() => { if (helperTalk === controller) helperBubble.hidden = true; }, 400);
    } catch {
      // Cut short by the next line or by closing the window.
    } finally {
      if (helperPepi && helperTalk === controller) helperPepi.dataset.face = "happy";
    }
  }
  const pepiTip = text => { if (!helperTalk || helperBubble.hidden) pepiSay(null, text); };
  let welcomed = false;
  new MutationObserver(() => {
    if (get("builder-window").hidden) {
      helperQuiet();
      return;
    }
    buildHelper();
    if (!welcomed) {
      welcomed = true;
      setTimeout(() => pepiSay("builderOpen"), 600);
    }
  }).observe(get("builder-window"), { attributes: true, attributeFilter: ["hidden"] });
  helperHost.addEventListener("click", () => pepiSay(null, ["Dica: o olhinho em cada bloco esconde o que você ainda não tem.", "Dica: arraste os enfeites da gaveta direto para a página.", "Dica: em Estilo tem paletas prontas para trocar todas as cores.", "Dica: errou? Desfazer resolve tudo, até apagar um bloco."][Math.floor(Math.random() * 4)]));

  /* ---------- Top bar: undo, views, preview, download, start over ---------- */

  get("cms-undo").addEventListener("click", undo);
  get("cms-redo").addEventListener("click", redo);
  get("builder-window").addEventListener("keydown", event => {
    if (event.target.closest("[data-slot]") || !(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); undo(); }
    if (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) { event.preventDefault(); redo(); }
  });
  for (const button of document.querySelectorAll("[data-cms-view]")) {
    button.addEventListener("click", () => {
      const phone = button.dataset.cmsView === "phone";
      paper.classList.toggle("is-phone", phone);
      for (const other of document.querySelectorAll("[data-cms-view]")) other.setAttribute("aria-pressed", String(other === button));
    });
  }
  function togglePreview() {
    previewing = !previewing;
    const button = get("cms-preview");
    button.setAttribute("aria-pressed", String(previewing));
    button.lastElementChild.textContent = previewing ? "Voltar a editar" : "Ver como visitante";
    get("builder-window").classList.toggle("is-previewing", previewing);
    render();
  }
  get("cms-preview").addEventListener("click", togglePreview);
  get("cms-reset").addEventListener("click", () => {
    const fresh = sampleProject();
    change(() => { project.theme = fresh.theme; project.sections = fresh.sections; }, { keepSelection: false });
    canvas.scrollTo({ top: 0, behavior: "smooth" });
    say("O modelo de portfólio voltou. Mudou de ideia? Use Desfazer.");
  });
  // Clicking the desk around the page clears the selection.
  canvas.addEventListener("click", event => {
    if (event.target === canvas || event.target === paper) {
      selected = null;
      render();
    }
  });

  async function exportSite() {
    exportButton.disabled = true;
    try {
      const response = await fetch("./site-preview.css");
      if (!response.ok) throw new Error("css");
      const css = await response.text();
      const title = (project.sections.find(item => item.layout === "cover") && textOf(project.sections.find(item => item.layout === "cover"), "name").replace(/^por\s+/i, "")) || "Meu portfólio";
      const body = project.sections.map(item => renderSection(item, "view")).join("");
      const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Portfólio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="${fontsUrl}">
<style>
body { margin: 0; }
${css}
</style>
</head>
<body>
<main id="inicio" class="cms-site" data-theme="${project.theme}"${project.palette ? ` data-palette="${project.palette}" style="${paletteStyle(project.palette)}"` : ""}>
${body}
<footer class="cms-footer">Feito com o Crie Meu Site · Front Arcade</footer>
</main>
</body>
</html>
`;
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      link.download = `${slug || "meu-portfolio"}.html`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      if (!project.exported) {
        project.exported = true;
        save();
        renderSteps();
      }
      say("Pronto! Seu site foi baixado: é um arquivo .html que abre em qualquer navegador.");
      report("builder-exported");
      pepiSay("builderExport");
    } catch {
      say("Não foi possível gerar o site agora. Tente de novo.");
    } finally {
      exportButton.disabled = false;
    }
  }
  exportButton.addEventListener("click", exportSite);

  renderDrawer();
  render();
})();
