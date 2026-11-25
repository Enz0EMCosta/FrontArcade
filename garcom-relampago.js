// Garçom Relâmpago: Hick's law. Orders come in and the player finds each item in menus
// of 4, 8, 16 and 32 options (shuffled every order, so position can't be memorised).
// Every table waits at most 7 seconds; a late order is lost. At the end the player sees
// their own average time grow with the number of options, next to a final round with
// the same 32 options and category filters. Serving 12 of the 20 orders in time
// finishes the shift and frees the next game. Pepi is the waiter, in full costume: he
// reads the orders and carries each snack to the table.
// ?garcom in the address unlocks the game for testing.
(() => {
  const get = id => document.getElementById(id);
  const card = get("waiter-card");
  const play = get("play-waiter");
  const cardStatus = get("waiter-card-status");
  const library = get("game-library");
  const game = get("waiter-game");
  const intro = get("waiter-intro");
  const round = get("waiter-round");
  const results = get("waiter-results");
  const menu = get("waiter-menu");
  const ticket = get("waiter-ticket");
  const phaseLabel = get("waiter-phase");
  const countLabel = get("waiter-count");
  const clock = get("waiter-clock");
  const bars = get("waiter-bars");
  const summary = get("waiter-summary");
  const tableBody = get("waiter-table-body");
  const filters = get("waiter-filters");
  const patienceBar = get("waiter-patience-bar");
  const verdict = get("waiter-verdict");
  const host = game.querySelector(".waiter-host");
  const bubble = game.querySelector(".waiter-bubble");
  const bubbleText = game.querySelector(".waiter-bubble-text");
  const tables = game.querySelector(".waiter-tables");
  const gamesWindow = get("games-window");
  const completionKey = "front-arcade.garcom-relampago.completed.v1";
  const testing = new URLSearchParams(location.search).has("garcom");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;

  const categories = [
    { name: "Salgados", icon: "salgado", items: ["Coxinha", "Pastel", "Kibe", "Empada", "Esfiha", "Pão de queijo", "Enroladinho", "Risole"] },
    { name: "Doces", icon: "doce", items: ["Brigadeiro", "Beijinho", "Cocada", "Quindim", "Pé de moleque", "Bolo de milho", "Cajuzinho", "Pudim"] },
    { name: "Bebidas", icon: "bebida", items: ["Suco de caju", "Suco de mangaba", "Água de coco", "Guaraná", "Café", "Cappuccino", "Chocolate quente", "Limonada"] },
    { name: "Sabores de Sergipe", icon: "regional", items: ["Queijo coalho", "Tapioca", "Cuscuz", "Beiju", "Pamonha", "Canjica", "Caldinho de feijão", "Amendoim cozido"] },
  ];
  const items = categories.flatMap(category => category.items.map(name => ({ name, category })));
  const sizes = [4, 8, 16, 32];
  const perMenu = 4; // orders per menu size
  const blocks = [...sizes.map(size => ({ key: String(size), size, filtered: false })), { key: "filters", size: 32, filtered: true }];
  const byName = new Map(items.map(item => [item.name, item]));
  const patience = 7000; // how long a table waits for its order
  const passing = 12; // orders served in time that finish the shift

  // What Pepi says in the game. The ids also name the recorded clips in falas.json.
  const lines = {
    waiterHello: { text: "Garçom Relâmpago no ar! Hoje eu sou o garçom: os pedidos vão chegando, e você me ajuda a achar cada um no cardápio. Bora, que a freguesia tá com fome!", face: "star" },
    waiterGrow: { text: "Eita, o cardápio cresceu! Quanto mais opções, mais tempo pra decidir.", face: "wide" },
    waiter32: { text: "Trinta e duas opções! Agora o bicho pega!", face: "oops" },
    waiterFilters: { text: "Agora, o mesmo cardápio com filtros! Escolhe a categoria primeiro e vê as opções encolherem.", face: "wink" },
    waiterDone: { text: "Turno encerrado! Olha só: quanto mais opções, mais tempo você levou. Essa é a Lei de Hick!", face: "laugh" },
    waiterRetry: { text: "Ih, muita mesa ficou esperando! Bora de novo? Sirva pelo menos doze pedidos a tempo pra liberar o próximo jogo.", face: "oops" },
  };
  // Little captions while he runs to the tables (too quick to need a recording).
  const quips = ["Saindo!", "Prontinho!", "Bom apetite!", "Ligeirinho!", "Tá na mão!", "Já vai!"];
  const lateQuips = [table => `Ih, a mesa ${table} cansou de esperar!`, table => `A mesa ${table} desistiu…`, table => `Demorou! A mesa ${table} foi embora.`];

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));
  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("stopped"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); reject(new Error("stopped")); }, { once: true });
  });
  const shuffle = list => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const seconds = ms => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

  /* ---------- Pixel art: the snacks, the bow tie and the tray ---------- */

  const pixelSvg = (rows, palette, extra = "") => {
    const width = rows[0].length;
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (palette[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[key]}"/>`;
    }));
    return `<svg viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true" focusable="false"${extra}>${rects}</svg>`;
  };
  const snacks = {
    salgado: pixelSvg(["...nn...", "..nOon..", ".nOooon.", ".nOooon.", "nOooooon", "nOooooon", ".noooon.", "..nnnn.."], { n: "#5a2e14", O: "#c8742c", o: "#eaa04a" }),
    doce: pixelSvg(["..nnnn..", ".nbBbbn.", "nbBbbbbn", "nbbbbbbn", ".nbbbbn.", "nppppppn", ".nPpPpn.", "..nnnn.."], { n: "#2b1a14", b: "#6b3a25", B: "#f7d9e8", p: "#f08bb4", P: "#d6407e" }),
    bebida: pixelSvg(["....rr..", "....r...", ".nnnrnn.", ".nwwrwn.", ".nyyyyn.", ".nyYyyn.", "..nyyn..", "..nnnn.."], { n: "#33435a", w: "#e9f6ff", y: "#f6b93b", Y: "#ffe08a", r: "#e4405f" }),
    regional: pixelSvg(["..nnnn..", ".nqQqqn.", ".nqqqqn.", ".nqqgqn.", ".nqqqqn.", "..nnnn..", "...ss...", "...ss..."], { n: "#7a5a1e", q: "#f5e2a8", Q: "#fff6d6", g: "#d9a55e", s: "#a8794a" }),
  };
  // His waiter costume, drawn over his own pixels (same 48 × 51 grid): a black vest
  // with a V of white shirt, collar and bow tie, gold buttons, a long white apron, a
  // towel over the left arm, a curled moustache and the tray in his right hand.
  function costume() {
    const r = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    const ink = "#1f2433";
    const vest = "#2c3150";
    const vestLight = "#454c74";
    const shirt = "#ffffff";
    const shade = "#d9e1ea";
    let art = "";
    // Vest rows, following the body's rounded bottom, with the shirt's V cut out.
    for (let y = 25; y <= 37; y++) {
      const [left, right] = y === 37 ? [9, 38] : [8, 39];
      const half = Math.max(1, Math.round(7 - (y - 25) * .62));
      art += r(left, y, 24 - half - left, 1, vest) + r(24 + half, y, right - 23 - half, 1, vest);
      art += r(24 - half, y, half * 2, 1, shirt) + r(24 - half - 1, y, 1, 1, vestLight) + r(24 + half, y, 1, 1, vestLight);
    }
    art += r(8, 25, 1, 12, vestLight) + r(39, 25, 1, 12, "#20243a");
    // Gold buttons down the vest.
    for (const y of [29, 32, 35]) art += r(19 + Math.min(3, y - 29 >> 1), y, 1, 1, "#ffc96b") + r(28 - Math.min(3, y - 29 >> 1), y, 1, 1, "#ffc96b");
    // Collar and a red bow tie.
    art += r(17, 24, 14, 1, shirt) + r(18, 25, 3, 1, shade) + r(27, 25, 3, 1, shade);
    art += r(19, 24, 3, 1, "#e44d63") + r(26, 24, 3, 1, "#e44d63") + r(19, 25, 4, 1, "#e44d63") + r(25, 25, 4, 1, "#e44d63");
    art += r(19, 26, 3, 1, "#b8324a") + r(26, 26, 3, 1, "#b8324a") + r(23, 25, 2, 1, "#b8324a") + r(19, 24, 1, 1, "#ff8a98") + r(26, 24, 1, 1, "#ff8a98");
    // The apron: a dark waistband and white cloth down to the feet.
    art += r(10, 38, 28, 1, ink) + r(11, 39, 26, 6, shirt) + r(12, 45, 24, 1, shirt) + r(11, 44, 26, 1, shade) + r(12, 45, 24, 1, shade);
    art += r(16, 40, 1, 4, shade) + r(31, 40, 1, 4, shade) + r(9, 39, 2, 1, ink) + r(8, 40, 1, 2, ink);
    // A towel folded over the left forearm, with a blue stripe.
    art += r(1, 30, 8, 1, ink) + r(1, 31, 8, 6, shirt) + r(1, 37, 1, 2, shirt) + r(8, 37, 1, 2, shirt) + r(1, 33, 8, 1, "#68bce4") + r(1, 36, 8, 1, shade);
    art += r(0, 31, 1, 8, ink) + r(9, 31, 1, 8, ink);
    // A curled golden moustache on the face screen, just above the mouth.
    const tash = "#f2b85c";
    art += `<g class="waiter-moustache">${r(20, 17, 3, 1, tash)}${r(25, 17, 3, 1, tash)}${r(23, 17, 2, 1, "#d8963a")}${r(19, 18, 1, 1, tash)}${r(28, 18, 1, 1, tash)}</g>`;
    return `<g class="waiter-costume">${art}</g>`;
  }
  const tray = '<g class="waiter-tray"><rect x="37" y="33" width="18" height="3" fill="#1f2433"/><rect x="38" y="34" width="16" height="1" fill="#c9d3de"/><rect x="39" y="34" width="5" height="1" fill="#ffffff"/><rect x="44" y="36" width="2" height="2" fill="#1f2433"/></g>';

  /* ---------- Pepi, the waiter ---------- */

  let pepi = null;
  let dish = null;
  function buildHost() {
    if (pepi || !P()?.markup) return;
    host.innerHTML = `<div class="pepi waiter-pepi" data-face="happy">${P().markup()}<svg class="waiter-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true">${costume()}${tray}</svg><span class="waiter-dish"></span></div>`;
    pepi = host.firstElementChild;
    dish = pepi.querySelector(".waiter-dish");
  }

  // Recorded clips, from the same manifest as the rest of Pepi's voice.
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

  let talk = null;
  let bubbleTimer = 0;
  function quiet() {
    talk?.abort();
    talk = null;
    clearTimeout(bubbleTimer);
    bubble.hidden = true;
  }

  // A recorded line (with lip sync) or a short caption. Resolves when he is done.
  async function say(id, caption) {
    quiet();
    const controller = new AbortController();
    talk = controller;
    const line = id ? lines[id] : { text: caption, face: "happy" };
    if (pepi) pepi.dataset.face = line.face;
    bubble.hidden = false;
    bubbleText.textContent = "";
    try {
      const clip = id && P()?.soundOn ? await clipFor(id) : null;
      if (controller.signal.aborted) return;
      if (!id) {
        bubbleText.textContent = caption;
        await wait(900, controller.signal);
      } else {
        const typing = P()?.typewrite ? P().typewrite(line.text, controller.signal, bubbleText) : Promise.resolve(bubbleText.textContent = line.text);
        if (clip && pepi) await Promise.all([typing, P().playClip(clip, controller.signal, pepi)]);
        else {
          await typing;
          await wait(900 + line.text.length * 22, controller.signal);
        }
      }
      bubbleTimer = setTimeout(() => { if (talk === controller) bubble.hidden = true; }, 600);
    } catch {
      // Cut short by the next line or by leaving the game.
    } finally {
      if (pepi && talk === controller) pepi.dataset.face = "happy";
    }
  }

  /* ---------- The tables and the customers ---------- */

  // Random customers from the avatar editor's own parts, drawn from the waist up.
  function customer(canvas) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof paintCharacter !== "function" || typeof avatarOptions === "undefined") return;
    const pick = key => Math.floor(Math.random() * avatarOptions[key].choices.length);
    const avatar = {
      skin: pick("skin"), eyes: pick("eyes"), eyeColor: pick("eyeColor"), mouth: pick("mouth"), hair: pick("hair"),
      hairColor: pick("hairColor"), hairGradient: 0, outfit: pick("outfit"), shirt: pick("shirt"), costume: 0, accessory: 0, held: 0,
    };
    const buffer = document.createElement("canvas");
    buffer.width = 64;
    buffer.height = 80;
    const paper = buffer.getContext("2d");
    paintCharacter(paper, (x, y, width, height, fill) => {
      paper.fillStyle = fill;
      paper.fillRect(x, y, width, height);
    }, avatar, null);
    context.imageSmoothingEnabled = false;
    context.drawImage(buffer, 14, 8, 36, 44, 0, 0, canvas.width, canvas.height);
  }

  function seatCustomers() {
    if (!tables.children.length) {
      for (let index = 0; index < 4; index++) {
        const table = document.createElement("li");
        table.className = "waiter-table-spot";
        table.innerHTML = `<span class="waiter-call">!</span><canvas width="72" height="88"></canvas><span class="waiter-table-top"><span class="waiter-served"></span></span><span class="waiter-table-number">${index + 1}</span>`;
        tables.append(table);
      }
    }
    for (const canvas of tables.querySelectorAll("canvas")) customer(canvas);
  }

  // He carries the dish to the table, leaves it there and comes back to the counter.
  let serving = null;
  async function serve(tableIndex, item) {
    if (!pepi) return;
    for (const run of pepi.getAnimations().filter(animation => animation.id === "serve")) {
      run.commitStyles();
      run.cancel();
    }
    const token = {};
    serving = token;
    const table = tables.children[tableIndex];
    dish.innerHTML = snacks[item.category.icon];
    dish.hidden = false;
    const from = new DOMMatrixReadOnly(getComputedStyle(pepi).transform).m41;
    const home = host.getBoundingClientRect().left;
    const spot = table.getBoundingClientRect().left - home - pepi.offsetWidth * .95;
    const move = (start, end, duration) => {
      const run = pepi.animate([{ transform: `translateX(${start}px)` }, { transform: `translateX(${end}px)` }], {
        duration: reduceMotion.matches ? 1 : duration, easing: "cubic-bezier(.35, .05, .3, 1)", fill: "forwards", id: "serve",
      });
      return run.finished.then(() => true, () => false);
    };
    if (!await move(from, spot, 420) || serving !== token) return;
    dish.hidden = true;
    const plate = table.querySelector(".waiter-served");
    plate.innerHTML = snacks[item.category.icon];
    table.classList.remove("is-served");
    void table.offsetWidth;
    table.classList.add("is-served");
    P()?.sfx("love");
    await move(spot, 0, 460);
  }

  /* ---------- The shift ---------- */

  let plan = [];
  let step = 0;
  let current = null; // { block, target, table, start, filtered }
  let times = {};
  let misses = {};
  let lost = {};
  let filterUses = 0;
  let shift = null; // AbortController of the running shift
  let lastTable = -1;
  let frame = 0;
  let patienceTimer = 0;
  let patienceRun = null;
  let impatientTimer = 0;

  const flag = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };
  const readCompleted = () => flag(completionKey);
  // The games open one after the other: this one needs Os Pop-ups Infinitos and Lag Lab.
  const previousDone = () => testing || (flag("front-arcade.popups-infinitos.completed.v1") && flag("front-arcade.lag-lab.completed.v1"));

  function unlock() {
    if (!previousDone()) return;
    play.disabled = false;
    card.classList.add("is-unlocked");
    cardStatus.textContent = readCompleted()
      ? "Turno concluído · jogue novamente"
      : `Desbloqueado · sirva ${passing} pedidos a tempo`;
  }

  function tick() {
    if (!current) return;
    clock.textContent = seconds(performance.now() - current.start);
    frame = requestAnimationFrame(tick);
  }

  function stopPatience() {
    clearTimeout(patienceTimer);
    clearTimeout(impatientTimer);
    patienceRun?.pause();
  }

  function renderMenu(block, target) {
    menu.replaceChildren();
    const button = item => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "waiter-item";
      element.textContent = item.name;
      element.dataset.item = item.name;
      return element;
    };
    const others = shuffle(items.filter(item => item !== target)).slice(0, block.size - 1);
    menu.style.setProperty("--columns", block.size === 32 ? 8 : 4);
    menu.append(...shuffle([target, ...others]).map(button));
    filters.hidden = !block.filtered;
    if (!block.filtered) return;
    // The filter round: the same shuffled 32 options, and a chip per category that
    // narrows the menu down to its 8 items.
    const chip = (key, name, icon) => `<button type="button" class="waiter-filter${icon ? ` is-${icon}` : ""}" data-filter="${key}" aria-pressed="${key === "all"}">${icon ? `<span class="waiter-group-icon">${snacks[icon]}</span>` : ""}${name}</button>`;
    filters.innerHTML = `<span class="waiter-filter-label">Filtrar:</span>${chip("all", "Todos")}${categories.map(category => chip(category.icon, category.name, category.icon)).join("")}`;
  }

  filters.addEventListener("click", event => {
    const chip = event.target.closest(".waiter-filter");
    if (!chip || !current) return;
    const key = chip.dataset.filter;
    for (const other of filters.querySelectorAll(".waiter-filter")) other.setAttribute("aria-pressed", String(other === chip));
    for (const item of menu.children) item.hidden = key !== "all" && byName.get(item.dataset.item).category.icon !== key;
    menu.style.setProperty("--columns", key === "all" ? 8 : 4);
    if (key !== "all") current.filtered = true;
    P()?.sfx("blip");
  });

  // Between menus: what's coming, and Pepi's comment on it. Not timed.
  async function announce(block, signal) {
    current = null;
    menu.replaceChildren();
    filters.hidden = true;
    clock.textContent = "0,0 s";
    patienceRun?.cancel();
    patienceBar.parentElement.classList.remove("is-tight");
    phaseLabel.textContent = block.filtered ? "32 opções com filtros" : `Cardápio com ${block.size} opções`;
    countLabel.textContent = "";
    ticket.innerHTML = block.filtered
      ? "<strong>Rodada extra:</strong> as mesmas 32 opções, agora com filtros por categoria."
      : `<strong>Próximo cardápio:</strong> ${block.size} opções. Cada mesa espera até ${patience / 1000} segundos.`;
    ticket.classList.add("is-announce");
    const id = block.filtered ? "waiterFilters" : block.size === 16 ? "waiterGrow" : block.size === 32 ? "waiter32" : null;
    if (id) await say(id);
    else await wait(1300, signal);
    if (signal.aborted) throw new Error("stopped");
    ticket.classList.remove("is-announce");
  }

  async function nextOrder() {
    const { signal } = shift;
    const block = plan[step];
    const previous = plan[step - 1];
    if (previous !== block) await announce(block, signal);
    const pool = items.filter(item => !(block.used ?? []).includes(item.name)); // no repeats in a menu size
    const target = pool[Math.floor(Math.random() * pool.length)];
    (block.used ??= []).push(target.name);
    let table = Math.floor(Math.random() * 4);
    if (table === lastTable) table = (table + 1 + Math.floor(Math.random() * 3)) % 4;
    lastTable = table;
    renderMenu(block, target);
    // On short screens the page scrolls: keep the order and the whole menu in view.
    round.scrollIntoView({ block: "nearest" });
    const index = plan.slice(0, step).filter(entry => entry === block).length;
    phaseLabel.textContent = block.filtered ? "32 opções com filtros" : `Cardápio com ${block.size} opções`;
    countLabel.textContent = `Pedido ${index + 1} de ${perMenu}`;
    ticket.innerHTML = `Mesa ${table + 1} pediu: <strong>${target.name}</strong>`;
    for (const [spot, element] of [...tables.children].entries()) {
      element.classList.toggle("is-ordering", spot === table);
      element.classList.remove("is-impatient", "is-leaving");
    }
    // Answers count right away; the clock and the table's patience start once the new
    // menu is painted.
    const order = { block, target, table, start: performance.now(), filtered: false };
    current = order;
    stopPatience();
    patienceRun?.cancel();
    requestAnimationFrame(() => {
      if (current !== order) return;
      order.start = performance.now();
      patienceRun = patienceBar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: patience, easing: "linear", fill: "forwards" });
      patienceBar.parentElement.classList.remove("is-tight");
      impatientTimer = setTimeout(() => {
        if (current !== order) return;
        tables.children[table].classList.add("is-impatient");
        patienceBar.parentElement.classList.add("is-tight");
      }, patience * .6);
      patienceTimer = setTimeout(() => giveUp(order), patience);
      tick();
    });
  }

  // Too slow: the customer gives up, the order is lost and the right item is shown.
  function giveUp(order) {
    if (current !== order) return;
    current = null;
    cancelAnimationFrame(frame);
    stopPatience();
    clock.textContent = seconds(patience);
    const { block, target, table } = order;
    (times[block.key] ??= []).push(patience);
    lost[block.key] = (lost[block.key] ?? 0) + 1;
    if (order.filtered) filterUses += 1;
    const spot = tables.children[table];
    spot.classList.remove("is-ordering", "is-impatient");
    spot.classList.add("is-leaving");
    const answer = menu.querySelector(`[data-item="${CSS.escape(target.name)}"]`);
    if (answer) {
      answer.hidden = false;
      answer.classList.add("is-missed");
    }
    for (const item of menu.children) item.disabled = true;
    ticket.innerHTML = `A mesa ${table + 1} desistiu de esperar. O pedido era <strong>${target.name}</strong>.`;
    P()?.sfx("tick");
    say(null, lateQuips[Math.floor(Math.random() * lateQuips.length)](table + 1)).then(() => {}, () => {});
    if (pepi) pepi.dataset.face = "oops";
    report("waiter-lost", { menu: block.key });
    step += 1;
    wait(1600, shift.signal).then(() => {
      customer(spot.querySelector("canvas"));
      spot.classList.remove("is-leaving");
      return step < plan.length ? nextOrder().catch(() => {}) : finish();
    }, () => {});
  }

  menu.addEventListener("click", event => {
    const button = event.target.closest(".waiter-item");
    if (!button || !current) return;
    const { block, target, table, start } = current;
    if (button.dataset.item !== target.name) {
      misses[block.key] = (misses[block.key] ?? 0) + 1;
      button.classList.remove("is-wrong");
      void button.offsetWidth;
      button.classList.add("is-wrong");
      P()?.sfx("knock");
      if (pepi && !talk) {
        pepi.dataset.face = "oops";
        setTimeout(() => { if (pepi.dataset.face === "oops" && !talk) pepi.dataset.face = "happy"; }, 600);
      }
      report("waiter-miss", { menu: block.key });
      return;
    }
    const elapsed = Math.min(patience, performance.now() - start);
    if (current.filtered) filterUses += 1;
    current = null;
    cancelAnimationFrame(frame);
    stopPatience();
    clock.textContent = seconds(elapsed);
    (times[block.key] ??= []).push(elapsed);
    button.classList.add("is-right");
    tables.children[table].classList.remove("is-ordering", "is-impatient");
    P()?.sfx("pop");
    serve(table, target);
    if (!talk && Math.random() < .55) say(null, quips[Math.floor(Math.random() * quips.length)]);
    report("waiter-hit", { menu: block.key, time: Math.round(elapsed) });
    step += 1;
    const { signal } = shift;
    wait(650, signal).then(() => (step < plan.length ? nextOrder().catch(() => {}) : finish()), () => {});
  });

  function startShift() {
    shift?.abort();
    shift = new AbortController();
    plan = blocks.flatMap(block => Array(perMenu).fill(block));
    for (const block of blocks) delete block.used;
    step = 0;
    times = {};
    misses = {};
    lost = {};
    filterUses = 0;
    quiet();
    intro.hidden = true;
    results.hidden = true;
    round.hidden = false;
    report("waiter-started");
    nextOrder().catch(() => {});
  }

  /* ---------- Results: the time grows with the options ---------- */

  const mean = list => list.reduce((sum, value) => sum + value, 0) / list.length;

  // Least squares for T = a + b·log2(n + 1), over the four unorganised menus.
  function hickFit(averages) {
    const points = sizes.map(size => [Math.log2(size + 1), averages[String(size)]]);
    const mx = mean(points.map(([x]) => x));
    const my = mean(points.map(([, y]) => y));
    const b = points.reduce((sum, [x, y]) => sum + (x - mx) * (y - my), 0) / points.reduce((sum, [x]) => sum + (x - mx) ** 2, 0);
    return { a: my - b * mx, b };
  }

  function finish() {
    current = null;
    cancelAnimationFrame(frame);
    stopPatience();
    round.hidden = true;
    results.hidden = false;
    // A lost order counts as the whole wait (7 s): it took at least that long.
    const averages = Object.fromEntries(blocks.map(block => [block.key, mean(times[block.key])]));
    const top = Math.max(...Object.values(averages), patience) * 1.12;
    const lostTotal = Object.values(lost).reduce((sum, value) => sum + value, 0);
    const served = plan.length - lostTotal;
    const passed = served >= passing;
    bars.replaceChildren();
    tableBody.replaceChildren();
    for (const block of blocks) {
      const value = averages[block.key];
      const errors = misses[block.key] ?? 0;
      const late = lost[block.key] ?? 0;
      const label = block.filtered ? "32 com filtros" : `${block.size} opções`;
      const facts = `${errors} ${errors === 1 ? "erro" : "erros"} · ${late} ${late === 1 ? "perdido" : "perdidos"}`;
      const bar = document.createElement("div");
      bar.className = `waiter-bar ${block.filtered ? "is-filtered" : "is-flat"}`;
      bar.style.setProperty("--share", "0");
      bar.innerHTML = `<span class="waiter-bar-value">${seconds(value)}</span><span class="waiter-bar-fill"></span><span class="waiter-bar-label">${label}</span><span class="waiter-bar-tip" role="tooltip">${label}: ${seconds(value)} por pedido · ${facts}</span>`;
      bar.tabIndex = 0;
      bar.setAttribute("aria-label", `${label}: ${seconds(value)} por pedido, ${facts}`);
      bars.append(bar);
      requestAnimationFrame(() => requestAnimationFrame(() => bar.style.setProperty("--share", (value / top).toFixed(3))));
      const row = document.createElement("tr");
      row.innerHTML = `<th scope="row">${label}</th><td>${seconds(value)}</td><td>${errors}</td><td>${late}</td>`;
      tableBody.append(row);
    }
    // The limit line: how long a table waits.
    bars.style.setProperty("--limit", (patience / top).toFixed(3));

    const few = averages["4"];
    const many = averages["32"];
    const filtered = averages.filters;
    const { a, b } = hickFit(averages);
    const growth = (many / few).toFixed(1).replace(".", ",");
    const gain = Math.round((1 - filtered / many) * 100);
    const formula = b > 0
      ? ` O seu tempo seguiu a curva T ≈ ${(a / 1000).toFixed(2).replace(".", ",")} s + ${(b / 1000).toFixed(2).replace(".", ",")} s × log₂(n + 1).`
      : "";
    const used = `Você usou um filtro em ${filterUses} de ${perMenu} pedidos.`;
    const filtersLine = gain > 0
      ? `Com as mesmas 32 opções e filtros por categoria, você levou ${seconds(filtered)}: ${gain}% mais rápido, mesmo com o clique a mais no filtro. ${used} Filtrar reduz o cardápio a 8 opções, e o tempo de decisão cai junto.`
      : `Com as mesmas 32 opções e filtros, você levou ${seconds(filtered)}. ${used} Desta vez o clique a mais pesou, mas em listas longas filtrar reduz as opções que você precisa considerar de cada vez.`;
    const lostLine = lostTotal ? ` ${lostTotal} ${lostTotal === 1 ? "pedido foi perdido e conta" : "pedidos foram perdidos e contam"} como ${patience / 1000} s.` : "";
    summary.textContent = `Com 4 opções você levou ${seconds(few)} por pedido; com 32, ${seconds(many)} (${growth}× mais).${formula}${lostLine} ${filtersLine}`;

    // Finishing the shift needs most orders served in time; that frees the next game.
    const before = readCompleted();
    verdict.className = `waiter-verdict ${passed ? "is-pass" : "is-fail"}`;
    verdict.innerHTML = passed
      ? `<strong>Turno concluído!</strong> ${served} de ${plan.length} pedidos servidos a tempo.${before ? "" : " A <em>Armadilha dos Hábitos Ruins</em> foi liberada."}`
      : `<strong>Turno incompleto.</strong> ${served} de ${plan.length} pedidos servidos a tempo. Sirva pelo menos ${passing} para ${before ? "concluir o turno" : "liberar o próximo jogo"}.`;
    get("again-waiter").textContent = passed ? "Jogar novamente" : "Tentar de novo";
    get("waiter-result-title").textContent = passed ? "Turno encerrado!" : "Faltou pouco!";
    if (passed) {
      try { localStorage.setItem(completionKey, "true"); } catch { /* The result still shows. */ }
    }
    unlock();
    get("waiter-result-title").focus();
    const rounded = Object.fromEntries(Object.entries(averages).map(([key, value]) => [key, Math.round(value)]));
    report(passed ? "waiter-finished" : "waiter-failed", { averages: rounded, served, lost: lostTotal });
    say(passed ? "waiterDone" : "waiterRetry");
  }

  /* ---------- Opening and closing ---------- */

  function showIntro() {
    shift?.abort();
    current = null;
    cancelAnimationFrame(frame);
    stopPatience();
    intro.hidden = false;
    round.hidden = true;
    results.hidden = true;
    for (const table of tables.children) table.classList.remove("is-ordering", "is-served", "is-impatient", "is-leaving");
  }

  function closeGame() {
    shift?.abort();
    current = null;
    cancelAnimationFrame(frame);
    stopPatience();
    quiet();
    game.hidden = true;
    library.hidden = false;
    report("waiter-closed");
  }

  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    buildHost();
    seatCustomers();
    showIntro();
    get("waiter-title").focus();
    report("waiter-opened");
    setTimeout(() => { if (!game.hidden && !intro.hidden) say("waiterHello"); }, 500);
  });
  get("start-waiter").addEventListener("click", startShift);
  get("again-waiter").addEventListener("click", () => {
    seatCustomers();
    showIntro();
    get("start-waiter").focus();
  });
  get("back-from-waiter").addEventListener("click", () => {
    closeGame();
    play.focus();
  });
  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", ({ detail }) => { if (detail?.type === "lag-finished") unlock(); });
  unlock();
})();
