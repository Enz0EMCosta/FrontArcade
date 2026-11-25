// Certificado do Front Arcade: unlocked when the player has completed the three
// individual games of the workshop. It is drawn on a canvas (name, avatar, the games
// and what each one trains, Pepi's seal, date and a verification code) and can be
// downloaded as a PNG or as an A4 PDF. The PDF is written by hand: one page with the
// canvas embedded as a JPEG, no library needed. ?certificado in the address unlocks it
// for testing.
(() => {
  const get = id => document.getElementById(id);
  const card = get("certificate-card");
  const status = get("certificate-status");
  const open = get("open-certificate");
  const view = get("certificate-view");
  const canvas = get("certificate-canvas");
  const library = get("game-library");
  const gamesWindow = get("games-window");
  const issuedKey = "front-arcade.certificate.v1";
  const testing = new URLSearchParams(location.search).has("certificado");
  const W = canvas.width;
  const H = canvas.height;
  const font = "MuseoModerno, 'Segoe UI', system-ui, sans-serif";
  const mono = "ui-monospace, 'Cascadia Code', Consolas, monospace";
  const ink = { navy: "#142842", blue: "#2056a4", muted: "#4d6176", pink: "#d6407e", pinkSoft: "#fde3ef", gold: "#edc45b", goldDark: "#c58f22", paper: "#fbf6ea", line: "#becbd6", green: "#287b66" };

  const flag = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };
  // Olhar Afiado keeps a list of matched colours; ten of them complete it.
  function colorDone() {
    try {
      const saved = JSON.parse(localStorage.getItem("front-arcade.olhar-afiado.v1"));
      if (Number.isInteger(saved)) return saved >= 10;
      return saved?.unlocked === true || (Array.isArray(saved?.matched) && saved.matched.length >= 10);
    } catch {
      return false;
    }
  }
  const games = [
    { name: "Olhar Afiado", skill: "Cor e percepção visual", detail: "Matiz, saturação e luz", icon: "color", done: colorDone },
    { name: "Os Pop-ups Infinitos", skill: "Formulários sem atrito", detail: "Interrupções, esforço e erros", icon: "popup", done: () => flag("front-arcade.popups-infinitos.completed.v1") },
    { name: "Lag Lab", skill: "Desempenho percebido", detail: "Respostas em até 400 ms", icon: "lag", done: () => flag("front-arcade.lag-lab.completed.v1") },
    { name: "Garçom Relâmpago", skill: "Lei de Hick", detail: "Menos opções, mais rapidez", icon: "waiter", done: () => flag("front-arcade.garcom-relampago.completed.v1") },
    { name: "Armadilha dos Hábitos Ruins", skill: "Consistência", detail: "Hábitos e mudanças de layout", icon: "habit", done: () => flag("front-arcade.habitos.completed.v1") },
    { name: "Tela em Obras", skill: "Semântica e estados vazios", detail: "Títulos, rótulos e vazios gentis", icon: "obra", done: () => flag("front-arcade.tela-em-obras.completed.v1") },
  ];
  const completed = () => games.filter(game => game.done()).length;

  // Each game's pixel emblem: rows of palette keys, the palette, and a horizontal offset.
  // The same art is drawn on the certificate and on the game cards in the library.
  const emblems = {
    popup: [["nnnnnnnnnn", "nbbbbbbrwn", "nwwwwwwwwn", "nwnnnnnwwn", "nwwwwwwwwn", "nwnnnnwwwn", "nwwwwwwwwn", "nnnnnnnnnn"], { n: ink.navy, b: ink.blue, r: ink.pink, w: "#fff" }, 0],
    waiter: [["....nn....", "...nwwn...", "..nwwwwn..", ".nwWwwwwn.", ".nwWwwwwn.", "nnnnnnnnnn", "nggggggggn", ".........."], { n: ink.navy, w: "#dfe6ee", W: "#fff", g: ink.gold }, 0],
    lag: [["nnnnnnnnn", ".nyyyyyn.", "..nyyyn..", "...nyn...", "...nyn...", "..n.y.n..", ".n..y..n.", "nnnnnnnnn"], { n: ink.navy, y: ink.gold }, .5],
    // A cursor about to step on a mousetrap's cheese.
    habit: [["n.........", "nn........", "nwn.......", "nwwn..yy..", "nwwwn.yyy.", "nwnnnyyyyy", "nn..bbbbbb", "n...bbbbbb"], { n: ink.navy, w: "#fff", y: "#f6c445", b: "#b77b52" }, 0],
    // A builder's hard hat with a red star on the front.
    obra: [["...nnnn...", "..nyyYyn..", ".nyyrryyn.", ".nyrrrryn.", ".nyyrryyn.", "nnnnnnnnnn", "noooooooon", ".........."], { n: ink.navy, y: "#f6c445", Y: "#ffe08a", r: "#e44d63", o: "#e0a92a" }, 0],
  };
  function emblemSvg(kind) {
    const [rows, palette] = emblems[kind];
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (palette[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[key]}"/>`;
    }));
    return `<svg class="game-emblem" viewBox="0 0 ${rows[0].length} ${rows.length}" width="${rows[0].length * 3}" height="${rows.length * 3}" shape-rendering="crispEdges" focusable="false">${rects}</svg>`;
  }
  for (const icon of document.querySelectorAll(".game-icon[data-icon]")) icon.insertAdjacentHTML("afterbegin", emblemSvg(icon.dataset.icon));
  // Cards of finished games get a check on their icon.
  function markDone() {
    for (const game of games) document.querySelector(`.game-card[data-game="${game.icon}"]`)?.classList.toggle("is-done", game.done());
  }
  const unlocked = () => testing || completed() === games.length;

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));

  /* ---------- The card in the games library ---------- */

  // Until the last individual game is done it is a wrapped "surprise prize"; the first
  // time the player sees it unlocked, the box opens into the certificate's medal.
  const revealedKey = "front-arcade.certificate.revealed.v1";
  const soloList = get("games-solo");
  function renderCard() {
    markDone();
    const count = completed();
    const ready = unlocked();
    card.classList.toggle("is-unlocked", ready);
    open.disabled = !ready;
    open.textContent = ready ? "Ver certificado" : "Bloqueado";
    get("certificate-name").textContent = ready ? "Certificado do Front Arcade" : "Prêmio surpresa";
    status.textContent = ready
      ? "Surpresa! Você concluiu todos os jogos individuais e ganhou um certificado com o seu nome."
      : `${count} de ${games.length} jogos individuais concluídos. Termine todos para abrir.`;
    const visible = !gamesWindow.hidden && !library.hidden && !soloList.hidden;
    if (ready && visible && !testing && !flag(revealedKey)) {
      try { localStorage.setItem(revealedKey, "true"); } catch { /* Reveals again next time. */ }
      card.classList.add("is-revealing");
      card.addEventListener("animationend", () => card.classList.remove("is-revealing"), { once: true });
      window.PepiBolota?.sfx("reveal");
      window.PepiBolota?.particles("stars", 6, card);
      report("certificate-unlocked");
    }
  }
  window.FrontArcadeTrail = { progress: () => ({ done: completed(), total: games.length }), complete: unlocked };

  /* ---------- Issue data: date and verification code ---------- */

  // The first time it is opened, the issue date is kept so the certificate never changes.
  function issue(name) {
    let issued = null;
    try { issued = JSON.parse(localStorage.getItem(issuedKey)); } catch { /* A new one below. */ }
    if (typeof issued?.date !== "string" || Number.isNaN(Date.parse(issued.date))) {
      issued = { date: new Date().toISOString() };
      try { localStorage.setItem(issuedKey, JSON.stringify(issued)); } catch { /* Lasts for this visit. */ }
    }
    return { date: new Date(issued.date), code: verification(`${name}|${issued.date}`) };
  }

  // FNV-1a over the name and the date, written as FA-XXXX-XXXX without look-alike letters.
  function verification(text) {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let hash = 0x811c9dc5;
    let second = 0x9e3779b9;
    for (const char of text) {
      hash = Math.imul(hash ^ char.codePointAt(0), 0x01000193) >>> 0;
      second = Math.imul(second ^ hash, 0x85ebca6b) >>> 0;
    }
    let code = "";
    for (const value of [hash, second]) {
      let rest = value;
      for (let index = 0; index < 4; index++) {
        code += alphabet[rest % 32];
        rest = Math.floor(rest / 32);
      }
      code += "-";
    }
    return `FA-${code.slice(0, -1)}`;
  }

  /* ---------- Drawing ---------- */

  const ctx = canvas.getContext("2d");

  function text(value, x, y, { size, weight = 500, color = ink.navy, align = "center", family = font, spacing = 0, max } = {}) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    let px = size;
    ctx.font = `${weight} ${px}px ${family}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
    while (max && ctx.measureText(value).width > max && px > 14) {
      px -= 2;
      ctx.font = `${weight} ${px}px ${family}`;
    }
    ctx.fillText(value, x, y);
    ctx.restore();
  }

  function roundRect(x, y, w, h, r, fill, stroke, width = 3) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = width;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  // A pixel-art picture from rows of characters; each character maps to a colour.
  function pixels(rows, x, y, size, palette) {
    rows.forEach((row, line) => [...row].forEach((key, column) => {
      if (!palette[key]) return;
      ctx.fillStyle = palette[key];
      ctx.fillRect(x + column * size, y + line * size, size, size);
    }));
  }
  const star = ["..g..", ".gGg.", "gGGGg", ".gGg.", "..g.."];
  const heart = [".pp.pp.", "pPPpPPp", "pPPPPPp", ".pPPPp.", "..pPp..", "...p..."];

  function paper() {
    ctx.fillStyle = ink.paper;
    ctx.fillRect(0, 0, W, H);
    // A faint pixel grid, like graph paper.
    ctx.fillStyle = "#efe6d2";
    for (let x = 60; x < W; x += 44) for (let y = 60; y < H; y += 44) ctx.fillRect(x, y, 4, 4);
    // Frame: a thick navy band with notched pixel corners, then a thin pink line.
    ctx.fillStyle = ink.navy;
    ctx.fillRect(60, 34, W - 120, 26);
    ctx.fillRect(60, H - 60, W - 120, 26);
    ctx.fillRect(34, 60, 26, H - 120);
    ctx.fillRect(W - 60, 60, 26, H - 120);
    for (const [cx, cy] of [[47, 47], [W - 60, 47], [47, H - 60], [W - 60, H - 60]]) ctx.fillRect(cx, cy, 13, 13);
    ctx.strokeStyle = ink.pink;
    ctx.lineWidth = 5;
    ctx.strokeRect(86, 86, W - 172, H - 172);
    const palette = { g: ink.goldDark, G: ink.gold };
    for (const [sx, sy] of [[100, 100], [W - 140, 100], [100, H - 140], [W - 140, H - 140]]) pixels(star, sx, sy, 8, palette);
  }

  function header() {
    pixels(heart, W / 2 - 330, 150, 7, { p: "#a92c60", P: ink.pink });
    pixels(heart, W / 2 + 281, 150, 7, { p: "#a92c60", P: ink.pink });
    text("FRONT ARCADE", W / 2, 192, { size: 40, weight: 700, color: ink.blue, family: mono, spacing: 14 });
    text("Certificado de Conclusão", W / 2, 318, { size: 112, weight: 750, color: ink.navy });
    text("Trilha individual · Jogos da oficina", W / 2, 386, { size: 40, weight: 500, color: ink.muted });
  }

  function avatar(profile) {
    const x = 172;
    const y = 446;
    const w = 256;
    const h = 320;
    roundRect(x - 14, y - 14, w + 28, h + 28, 18, "#fff", ink.navy, 6);
    if (profile && typeof paintAvatar === "function") {
      const small = document.createElement("canvas");
      small.width = 64;
      small.height = 80;
      paintAvatar(small, profile);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.clip();
      ctx.drawImage(small, x, y, w, h);
      ctx.restore();
    } else {
      roundRect(x, y, w, h, 8, "#e8eef5");
      text("?", x + w / 2, y + h / 2 + 40, { size: 120, weight: 700, color: ink.line });
    }
    text("Jogador(a)", x + w / 2, y + h + 56, { size: 26, weight: 600, color: ink.muted, family: mono, spacing: 4 });
  }

  // A round pink seal with Pepi in the middle and the words around it.
  function seal(pepi) {
    const cx = 1704;
    const cy = 600;
    const r = 168;
    // Two ribbon tails under the seal.
    ctx.fillStyle = ink.pink;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 40, cy + r - 16);
      ctx.lineTo(cx + side * 96, cy + r + 62);
      ctx.lineTo(cx + side * 66, cy + r + 46);
      ctx.lineTo(cx + side * 50, cy + r + 74);
      ctx.lineTo(cx + side * 4, cy + r - 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.save();
    ctx.fillStyle = ink.pinkSoft;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = ink.pink;
    ctx.stroke();
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (pepi) ctx.drawImage(pepi, cx - 92, cy - 120, 184, 196);
    // Curved text along the bottom of the seal.
    const words = "APROVADO PELO PEPI";
    ctx.save();
    ctx.font = `800 25px ${font}`;
    ctx.fillStyle = ink.pink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const radius = r - 44;
    const spread = 2.75;
    [...words].forEach((char, index) => {
      const angle = Math.PI / 2 + spread / 2 - index / (words.length - 1) * spread;
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.rotate(angle - Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  function body(name) {
    text("Certificamos que", W / 2, 494, { size: 42, weight: 500, color: ink.muted });
    text(name, W / 2, 618, { size: 124, weight: 800, color: ink.pink, max: 960 });
    ctx.fillStyle = ink.navy;
    ctx.fillRect(W / 2 - 430, 652, 860, 5);
    text("concluiu todos os desafios individuais do Front Arcade", W / 2, 726, { size: 40, weight: 500 });
    text("e treinou o olhar de quem constrói interfaces.", W / 2, 778, { size: 40, weight: 500 });
  }

  // Each game's little emblem, `s` pixels per art pixel (the art is about 10 × 8).
  function gameIcon(kind, x, y, s = 8) {
    if (kind === "color") {
      const colors = ["#f78581", "#edc45b", "#63c6a1", "#68bce4", "#a681dc"];
      const [cx, cy, r] = [x + 5 * s, y + 5 * s, 4.5 * s];
      for (let index = 0; index < 5; index++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, index / 5 * Math.PI * 2 - Math.PI / 2, (index + 1) / 5 * Math.PI * 2 - Math.PI / 2);
        ctx.fillStyle = colors[index];
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 1.6 * s, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      return;
    }
    const art = emblems[kind];
    pixels(art[0], x + art[2] * s, y + s, s, art[1]);
  }

  // One row of four or fewer; with more, rows of three (the last one centred).
  function gamesRow() {
    const many = games.length > 4;
    const perRow = many ? 3 : games.length;
    const w = many ? 540 : 404;
    const h = many ? 128 : 196;
    const gap = many ? 18 : 20;
    games.forEach((game, index) => {
      const row = Math.floor(index / perRow);
      const inRow = Math.min(perRow, games.length - row * perRow);
      const start = W / 2 - (w * inRow + gap * (inRow - 1)) / 2;
      const x = start + (index % perRow) * (w + gap);
      const y = (many ? 852 : 850) + row * (h + gap);
      roundRect(x, y, w, h, 22, "#fff", ink.line, 3);
      if (many) {
        gameIcon(game.icon, x + 22, y + 28, 7);
        text(game.name, x + 110, y + 46, { size: 30, weight: 750, align: "left", max: w - 170 });
        text(game.skill, x + 110, y + 82, { size: 24, weight: 650, color: ink.blue, align: "left", max: w - 130 });
        text(game.detail, x + 110, y + 112, { size: 20, weight: 500, color: ink.muted, align: "left", max: w - 130 });
      } else {
        gameIcon(game.icon, x + 22, y + 58);
        text(game.name, x + 118, y + 72, { size: 32, weight: 750, align: "left", max: w - 176 });
        text(game.skill, x + 118, y + 116, { size: 25, weight: 650, color: ink.blue, align: "left", max: w - 136 });
        text(game.detail, x + 118, y + 156, { size: 21, weight: 500, color: ink.muted, align: "left", max: w - 136 });
      }
      // A green check badge in the corner.
      const [bx, by, br] = [x + w - 28, y + 28, many ? 18 : 22];
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = ink.green;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = many ? 5 : 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(bx - br * .45, by + br * .05);
      ctx.lineTo(bx - br * .12, by + br * .38);
      ctx.lineTo(bx + br * .5, by - br * .35);
      ctx.stroke();
    });
  }

  function footer(date, code) {
    const y = 1206;
    const when = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(date);
    const columns = [
      { x: 430, label: "Data de emissão", value: when, family: font, size: 38 },
      { x: 1570, label: "Código de verificação", value: code, family: mono, size: 38 },
    ];
    for (const column of columns) {
      text(column.value, column.x, y, { size: column.size, weight: 700, family: column.family });
      ctx.fillStyle = ink.navy;
      ctx.fillRect(column.x - 230, y + 24, 460, 3);
      text(column.label, column.x, y + 70, { size: 26, weight: 600, color: ink.muted, family: mono, spacing: 3 });
    }
    // Pepi's signature in the middle.
    ctx.save();
    ctx.translate(W / 2, y - 6);
    ctx.transform(1, 0, -.22, 1, 0, 0); // slanted, like handwriting
    text("Pepi Bolota", 0, 0, { size: 64, weight: 700, color: ink.pink });
    ctx.restore();
    ctx.strokeStyle = ink.pink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 170, y + 14);
    ctx.bezierCurveTo(W / 2 - 60, y + 34, W / 2 + 60, y - 4, W / 2 + 190, y + 18);
    ctx.stroke();
    ctx.fillStyle = ink.navy;
    ctx.fillRect(W / 2 - 230, y + 24, 460, 3);
    text("Mascote e guia do Front Arcade", W / 2, y + 70, { size: 26, weight: 600, color: ink.muted, family: mono, spacing: 3 });
  }

  // Pepi's art as a standalone SVG image (with the styles that pick his face).
  function pepiImage() {
    const markup = window.PepiBolota?.canvasMarkup?.("pepi", "happy");
    if (!markup) return Promise.resolve(null);
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    return image.decode().then(() => image, () => null);
  }

  let drawn = null; // { name } of the last drawing
  async function draw() {
    const profile = typeof loadProfile === "function" ? loadProfile() : null;
    const name = profile?.name ?? "Jogador(a)";
    const { date, code } = issue(name);
    await document.fonts.load(`700 80px MuseoModerno`).catch(() => {});
    const pepi = await pepiImage();
    paper();
    header();
    avatar(profile);
    seal(pepi);
    body(name);
    gamesRow();
    footer(date, code);
    canvas.setAttribute("aria-label", `Certificado de conclusão do Front Arcade para ${name}, emitido em ${date.toLocaleDateString("pt-BR")}, código ${code}. Jogos concluídos: ${games.map(game => game.name).join(", ")}.`);
    drawn = { name };
  }

  /* ---------- Downloads ---------- */

  const slug = () => (drawn?.name ?? "jogador").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jogador";

  function save(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  }

  // A one-page A4 (landscape) PDF with the certificate as a full-page JPEG.
  function pdf(jpeg, width, height) {
    const page = [841.89, 595.28];
    const encoder = new TextEncoder();
    const parts = [];
    const offsets = [];
    let length = 0;
    const push = chunk => {
      const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
      parts.push(bytes);
      length += bytes.length;
    };
    const object = (number, dictionary, stream) => {
      offsets[number] = length;
      push(`${number} 0 obj\n${dictionary}\n`);
      if (stream) {
        push("stream\n");
        push(stream);
        push("\nendstream\n");
      }
      push("endobj\n");
    };
    const content = `q ${page[0]} 0 0 ${page[1]} 0 0 cm /Certificado Do Q`;
    push("%PDF-1.4\n");
    object(1, "<< /Type /Catalog /Pages 2 0 R >>");
    object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page[0]} ${page[1]}] /Resources << /XObject << /Certificado 4 0 R >> >> /Contents 5 0 R >>`);
    object(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
    object(5, `<< /Length ${content.length} >>`, content);
    object(6, "<< /Title (Certificado - Front Arcade) /Creator (Front Arcade) >>");
    const table = length;
    push(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}`);
    push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${table}\n%%EOF\n`);
    return new Blob(parts, { type: "application/pdf" });
  }

  const toBlob = (type, quality) => new Promise(resolve => canvas.toBlob(resolve, type, quality));

  get("download-certificate-png").addEventListener("click", async () => {
    save(await toBlob("image/png"), `certificado-front-arcade-${slug()}.png`);
    report("certificate-downloaded", { format: "png" });
  });
  get("download-certificate-pdf").addEventListener("click", async () => {
    const jpeg = new Uint8Array(await (await toBlob("image/jpeg", .92)).arrayBuffer());
    save(pdf(jpeg, W, H), `certificado-front-arcade-${slug()}.pdf`);
    report("certificate-downloaded", { format: "pdf" });
  });

  /* ---------- Opening and closing the view ---------- */

  function close() {
    view.hidden = true;
    library.hidden = false;
  }
  open.addEventListener("click", async () => {
    if (!unlocked()) return;
    library.hidden = true;
    view.hidden = false;
    get("certificate-title").focus();
    await draw();
    report("certificate-opened");
  });
  get("back-from-certificate").addEventListener("click", () => {
    close();
    open.focus();
  });
  const watcher = new MutationObserver(() => {
    if (gamesWindow.hidden && !view.hidden) close();
    if (!gamesWindow.hidden) renderCard();
  });
  for (const element of [gamesWindow, library, soloList]) watcher.observe(element, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", renderCard);
  document.addEventListener("frontarcade:popups-completed", renderCard);
  renderCard();
})();
