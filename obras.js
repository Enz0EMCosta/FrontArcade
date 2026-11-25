// Tela em Obras: semantic HTML and empty states. The player gets three empty screens
// (an inbox with no messages, an empty cart, a search with no results) and, against the
// clock, builds each empty state out of named blocks, like Lego bricks: a heading with
// its level, an image with or without a description, a text, a button, a labelled
// field. Some bricks are traps (a <div> that looks like a button, a heading that skips
// levels, a cold error message). When the time runs out or the player hands it in,
// Pepi, the site foreman, audits the screen: four semantic checks (heading hierarchy,
// labels, descriptions, focus order) and four empty-state checks (explains why, points
// to an action, friendly tone, visual hierarchy), shown next to what a screen reader
// would announce. An average of 60% over the three screens finishes the game.
// ?obras in the address unlocks the game for testing.
(() => {
  const get = id => document.getElementById(id);
  const card = get("obra-card");
  const play = get("play-obra");
  const cardStatus = get("obra-card-status");
  const library = get("game-library");
  const game = get("obra-game");
  const intro = get("obra-intro");
  const round = get("obra-round");
  const audit = get("obra-audit");
  const results = get("obra-results");
  const palette = get("obra-palette");
  const stage = get("obra-stage");
  const timerBar = get("obra-timer-bar");
  const clock = get("obra-clock");
  const live = get("obra-live");
  const host = game.querySelector(".obra-host");
  const bubble = game.querySelector(".obra-bubble");
  const bubbleText = game.querySelector(".obra-bubble-text");
  const gamesWindow = get("games-window");
  const completionKey = "front-arcade.tela-em-obras.completed.v1";
  const testing = new URLSearchParams(location.search).has("obras");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;
  const passing = 60; // average audit score that finishes the game

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
  const esc = text => String(text).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

  /* ---------- Pixel art: the illustrations, the hard hat and the clipboard ---------- */

  const pixelSvg = rows => {
    const palette = { n: "#33435a", w: "#ffffff", g: "#dfe6ee", y: "#f6c445", b: "#9fd0f0", B: "#d8eefb", p: "#f08bb4", s: "#edc45b" };
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (palette[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[key]}"/>`;
    }));
    return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  };
  const art = {
    inbox: pixelSvg(["..s..........s..", ".sss.........ss.", "..s.............", ".nnnnnnnnnnnnnn.", ".nwwwwwwwwwwwwn.", ".nnwwwwwwwwwwnn.", ".ngnwwwwwwwwngn.", ".nggnwwwwwwnggn.", ".ngggnnwwnngggn.", ".ngggggnngggggn.", ".nnnnnnnnnnnnnn.", "................"]),
    cart: pixelSvg(["nnn.........p...", "..n........ppp..", "..nnnnnnnnnnnnn.", "..nwwwwwwwwwwwn.", "..nwgwgwgwgwgwn.", "...nwwwwwwwwwn..", "...nwgwgwgwgwn..", "....nwwwwwwwn...", "....nnnnnnnnn...", "....n...........", "....nnnnnnnnnnn.", ".....nn....nn..."]),
    search: pixelSvg(["....nnnnn.......", "...nBBBBBn......", "..nBwBBBBBn.....", "..nBwBBbBBn.....", "..nBBBbbBBn.....", "..nBBBBBBBn.....", "...nBBBBBn......", "....nnnnnnn.....", "..........nn....", "...........nn...", "....g.......nn..", "...ggg.......n.."]),
  };

  // Pepi's site-foreman outfit, drawn over his own 48 × 51 grid: a yellow hard hat
  // with the star on the front, an orange safety vest with reflective stripes, and a
  // clipboard in his right hand.
  function outfit() {
    const r = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    const ink = "#3b2838";
    let hat = "";
    const dome = [[18, 12], [15, 18], [13, 22], [12, 24], [11, 26], [11, 26], [10, 28]];
    dome.forEach(([x, width], row) => { hat += r(x - 1, 2 + row, width + 2, 1, ink) + r(x, 2 + row, width, 1, "#f6c445"); });
    hat += r(5, 9, 38, 3, ink) + r(6, 10, 36, 1, "#e0a92a") + r(23, 2, 2, 7, "#ffe08a") + r(14, 5, 3, 1, "#fff6d6") + r(12, 6, 2, 1, "#fff6d6");
    hat += r(21, 4, 6, 4, "#e44d63") + r(22, 3, 4, 6, "#e44d63") + r(23, 5, 2, 2, "#ff8a98");
    let vest = "";
    for (let y = 25; y <= 37; y++) {
      const [left, right] = y === 37 ? [9, 38] : [8, 39];
      const gap = Math.max(1, Math.round(5 - (y - 25) * .4));
      vest += r(left, y, 24 - gap - left, 1, "#ff8a3d") + r(24 + gap, y, right - 23 - gap, 1, "#ff8a3d");
    }
    vest += r(8, 30, 13, 2, "#e8eef5") + r(27, 30, 13, 2, "#e8eef5") + r(8, 34, 13, 2, "#e8eef5") + r(27, 34, 13, 2, "#e8eef5");
    vest += r(8, 25, 1, 12, "#ffb27a") + r(39, 25, 1, 12, "#d9651e");
    const board = r(37, 27, 11, 14, ink) + r(38, 28, 9, 12, "#b77b52") + r(39, 30, 7, 9, "#ffffff") + r(40, 32, 5, 1, "#9fb4c8") + r(40, 34, 4, 1, "#9fb4c8") + r(40, 36, 5, 1, "#9fb4c8") + r(41, 26, 3, 3, "#8a96a8");
    return `<g class="obra-outfit">${vest}${hat}${board}</g>`;
  }

  /* ---------- The three screens and their bricks ---------- */

  // Kinds of brick: the Lego colour and the name on the brick.
  const kinds = {
    field: { name: "Campo" },
    image: { name: "Ilustração" },
    heading: { name: "Título" },
    text: { name: "Texto" },
    action: { name: "Ação" },
  };
  const screens = [
    {
      key: "inbox", title: "Caixa de entrada", brief: "Uma caixa de entrada sem nenhuma mensagem.", time: 90, line: "obraInbox",
      order: ["image", "heading", "text", "action"],
      pieces: [
        { kind: "image", alt: "Envelope aberto e vazio, com estrelinhas em volta" },
        { kind: "image", alt: null },
        { kind: "heading", level: 2, text: "Tudo em dia por aqui!" },
        { kind: "heading", level: 4, text: "Tudo em dia por aqui!" },
        { kind: "heading", level: 0, tag: "p", text: "Nenhuma mensagem" },
        { kind: "text", why: true, friendly: true, text: "Você ainda não recebeu mensagens. Quando alguém escrever, elas aparecem aqui." },
        { kind: "text", why: false, friendly: false, text: "ERRO 404: 0 registros na tabela mensagens." },
        { kind: "action", semantic: true, clear: true, text: "Escrever mensagem" },
        { kind: "action", semantic: false, clear: false, text: "Clique aqui" },
        { kind: "action", semantic: true, clear: false, text: "OK" },
      ],
    },
    {
      key: "cart", title: "Meu carrinho", brief: "Um carrinho de compras vazio.", time: 75, line: "obraCart",
      order: ["image", "heading", "text", "action"],
      pieces: [
        { kind: "image", alt: "Carrinho de compras vazio" },
        { kind: "image", alt: "imagem123.png", useless: true },
        { kind: "heading", level: 2, text: "Seu carrinho está vazio" },
        { kind: "heading", level: 1, text: "Seu carrinho está vazio" },
        { kind: "heading", level: 0, tag: "span", text: "CARRINHO VAZIO" },
        { kind: "text", why: true, friendly: true, text: "Os produtos que você escolher aparecem aqui. Que tal dar uma olhada nas ofertas da semana?" },
        { kind: "text", why: false, friendly: false, text: "Você não adicionou nenhum item!!!" },
        { kind: "action", semantic: true, clear: true, text: "Ver ofertas" },
        { kind: "action", semantic: false, clear: true, text: "Ir às compras" },
        { kind: "action", semantic: true, clear: false, text: "Fechar" },
      ],
    },
    {
      key: "search", title: "Busca", brief: "Uma busca por “bicicleta azul turbo” que não achou nada.", time: 60, line: "obraSearch",
      order: ["field", "image", "heading", "text", "action"], needsField: true,
      pieces: [
        { kind: "field", labelled: true, text: "Buscar produtos", value: "bicicleta azul turbo" },
        { kind: "field", labelled: false, text: "Buscar…", value: "bicicleta azul turbo" },
        { kind: "image", alt: "" },
        { kind: "image", alt: null },
        { kind: "heading", level: 2, text: "Nenhum resultado para “bicicleta azul turbo”" },
        { kind: "heading", level: 3, text: "Nenhum resultado para “bicicleta azul turbo”" },
        { kind: "text", why: true, friendly: true, text: "Confira se a palavra está certinha ou tente termos mais gerais, como “bicicleta”." },
        { kind: "text", why: false, friendly: false, text: "Sua busca é inválida." },
        { kind: "action", semantic: true, clear: true, text: "Limpar filtros" },
        { kind: "action", semantic: false, clear: false, text: "Tentar" },
      ],
    },
  ];
  screens.forEach(screen => screen.pieces.forEach((piece, index) => { piece.id = `${screen.key}-${index}`; }));

  // What the brick says about its HTML.
  function tagOf(piece) {
    if (piece.kind === "heading") return piece.level ? `<h${piece.level}>` : piece.tag === "p" ? "<p> em negrito" : "<span> grande";
    if (piece.kind === "image") return piece.alt === null ? "<img> sem alt" : piece.alt === "" ? '<img alt=""> decorativa' : "<img alt>";
    if (piece.kind === "action") return piece.semantic ? "<button>" : "<div> clicável";
    if (piece.kind === "field") return piece.labelled ? "<label> + <input>" : "<input> só com placeholder";
    return "<p>";
  }
  function brickText(piece) {
    if (piece.kind === "image") return piece.alt === null ? "vazio.png" : piece.alt === "" ? "(sem descrição: só enfeite)" : `“${piece.alt}”`;
    if (piece.kind === "field") return piece.labelled ? `Rótulo: ${piece.text}` : `Placeholder: ${piece.text}`;
    return piece.text;
  }

  /* ---------- The audit ---------- */

  const criteria = [
    { key: "headings", group: "Semântica", name: "Hierarquia de títulos" },
    { key: "labels", group: "Semântica", name: "Rótulos" },
    { key: "descriptions", group: "Semântica", name: "Descrições" },
    { key: "focus", group: "Semântica", name: "Ordem de foco" },
    { key: "why", group: "Estado vazio", name: "Explica o porquê" },
    { key: "action", group: "Estado vazio", name: "Indica a ação" },
    { key: "tone", group: "Estado vazio", name: "Tom amigável" },
    { key: "layout", group: "Estado vazio", name: "Hierarquia visual" },
  ];

  // Each check returns [passed, why]. `built` is the list of placed pieces, in order.
  function inspect(screen, built) {
    const of = kind => built.filter(piece => piece.kind === kind);
    const headings = of("heading");
    const images = of("image");
    const texts = of("text");
    const actions = of("action");
    const fields = of("field");
    const result = {};

    if (!headings.length) result.headings = [false, "Falta um título: o vazio precisa de um <h2> que diga o que aconteceu."];
    else if (headings.length > 1) result.headings = [false, "Dois títulos para o mesmo vazio competem entre si. Fique com um só."];
    else if (headings[0].level === 0) result.headings = [false, `“${headings[0].text}” parece título, mas é um ${headings[0].tag === "p" ? "<p>" : "<span>"}: o leitor de tela não o encontra na lista de títulos.`];
    else if (headings[0].level === 1) result.headings = [false, "A página já tem um <h1>. Um segundo <h1> embaralha a hierarquia: aqui cabe um <h2>."];
    else if (headings[0].level > 2) result.headings = [false, `Depois do <h1> da página vem o <h2>. Pular para <h${headings[0].level}> quebra a hierarquia.`];
    else result.headings = [true, "Um <h2> logo abaixo do <h1> da página."];

    const controls = [...actions, ...fields];
    if (screen.needsField && !fields.some(field => field.labelled)) {
      result.labels = [false, fields.length
        ? "Placeholder não é rótulo: ele some quando a pessoa digita e nem todo leitor de tela o anuncia."
        : "A busca precisa de um campo com rótulo, para a pessoa tentar de novo ali mesmo."];
    } else if (!controls.length) result.labels = [false, "Nenhum botão ou campo na tela: não há nada para a pessoa acionar."];
    else if (actions.some(action => !action.semantic)) {
      const fake = actions.find(action => !action.semantic);
      result.labels = [false, `“${fake.text}” é uma <div>: não recebe foco pelo teclado e o leitor de tela não a anuncia como botão.`];
    } else if (fields.some(field => !field.labelled)) result.labels = [false, "Placeholder não é rótulo: ele some quando a pessoa digita e nem todo leitor de tela o anuncia."];
    else result.labels = [true, "Botões de verdade e campos com <label>."];

    const blind = images.find(image => image.alt === null || image.useless);
    if (blind) {
      result.descriptions = [false, blind.useless
        ? `“${blind.alt}” é o nome do arquivo, não uma descrição. Descreva o que a imagem mostra.`
        : "A imagem está sem alt: o leitor de tela lê o nome do arquivo. Descreva-a, ou use alt=\"\" se for só enfeite."];
    } else if (!images.length) result.descriptions = [true, "Nenhuma imagem sem descrição."];
    else result.descriptions = [true, images[0].alt === "" ? "Imagem decorativa marcada com alt=\"\": o leitor de tela a ignora, e o texto carrega o sentido." : "A imagem tem uma descrição do que mostra."];

    // Reading and focus order: field, heading, text, action (the illustration is left
    // to the visual check).
    const rank = { field: 0, heading: 1, text: 2, action: 3 };
    const flow = built.filter(piece => piece.kind in rank);
    const broken = flow.findIndex((piece, index) => index > 0 && rank[piece.kind] < rank[flow[index - 1].kind]);
    if (flow.length < 2) result.focus = [false, "Peças de menos para formar um caminho de leitura e de foco."];
    else if (broken > 0) {
      const [before, after] = [flow[broken - 1], flow[broken]];
      result.focus = [false, `${kinds[after.kind].name} depois de ${kinds[before.kind].name.toLowerCase()}: quem navega pelo teclado ou ouve a tela recebe as coisas fora de ordem.`];
    } else result.focus = [true, screen.needsField ? "Campo, título, texto e ação, nessa ordem." : "Título, texto e ação, nessa ordem."];

    result.why = texts.some(text => text.why)
      ? [true, "O texto conta por que a tela está vazia e o que vai aparecer ali."]
      : [false, texts.length ? "O texto não explica por que a tela está vazia." : "Falta o texto que explica por que a tela está vazia."];

    const good = actions.find(action => action.clear);
    result.action = good
      ? [true, `“${good.text}” diz exatamente o que acontece ao clicar.`]
      : [false, actions.length ? `“${actions[0].text}” não diz o que acontece ao clicar. Use um verbo com destino.` : "Falta um botão com o próximo passo."];

    const cold = [...headings, ...texts].find(piece => piece.friendly === false);
    if (cold) result.tone = [false, `“${cold.text}” soa frio ou põe a culpa na pessoa.`];
    else if (!texts.length && !headings.length) result.tone = [false, "Sem texto, não há tom nenhum para avaliar."];
    else result.tone = [true, "Linguagem gentil, sem jargão técnico nem culpa."];

    const index = piece => built.indexOf(piece);
    if (!images.length) result.layout = [false, "Falta a ilustração: ela mostra de cara que o vazio é esperado e dá o tom."];
    else if (images.length > 1 || headings.length > 1 || texts.length > 1 || actions.length > 1) result.layout = [false, "Peças repetidas disputam a atenção. Um vazio pede uma de cada."];
    else if (headings.length && index(images[0]) > index(headings[0])) result.layout = [false, "A ilustração vem antes do título, abrindo o estado vazio."];
    else if (!actions.length || built.at(-1) !== actions[0]) result.layout = [false, "A ação fecha o estado vazio: o botão fica por último."];
    else result.layout = [true, "Ilustração, título, texto e ação, do mais visual ao próximo passo."];

    const passed = criteria.filter(criterion => result[criterion.key][0]).length;
    return { result, score: Math.round(passed / criteria.length * 100) };
  }

  // What a screen reader would announce, in order.
  function announce(screen, built) {
    const lines = [`Título nível 1: ${screen.title}`];
    for (const piece of built) {
      if (piece.kind === "heading") lines.push(piece.level ? `Título nível ${piece.level}: ${piece.text}` : `${piece.text} (lido como texto comum)`);
      else if (piece.kind === "image") lines.push(piece.alt === null ? "Imagem: vazio ponto png" : piece.alt === "" ? null : `Imagem: ${piece.alt}`);
      else if (piece.kind === "text") lines.push(piece.text);
      else if (piece.kind === "action") lines.push(piece.semantic ? `Botão: ${piece.text}` : `${piece.text} (texto, sem papel de botão e fora do Tab)`);
      else if (piece.kind === "field") lines.push(piece.labelled ? `Campo de edição: ${piece.text}, ${piece.value}` : `Campo de edição: ${piece.value} (sem nome)`);
    }
    return lines.filter(Boolean);
  }

  /* ---------- Pepi, the foreman ---------- */

  const voice = {
    obraHello: { text: "Tela em Obras no ar! Hoje eu sou o mestre de obras. Monte cada tela vazia com as peças certas, que no fim eu faço a auditoria!", face: "star" },
    obraInbox: { text: "Primeira obra: uma caixa de entrada sem nenhuma mensagem. Mostra pra pessoa que está tudo bem!", face: "happy" },
    obraCart: { text: "Agora, um carrinho vazio. Dá um motivo pra pessoa voltar às compras!", face: "wink" },
    obraSearch: { text: "Última obra: uma busca que não achou nada. Ajuda a pessoa a tentar de novo!", face: "wide" },
    obraTime: { text: "Acabou o tempo! Vamos auditar o que deu pra montar.", face: "oops" },
    obraGood: { text: "Obra aprovada! Semântica no lugar e um vazio que acolhe. Carimbado!", face: "laugh" },
    obraFix: { text: "Hmm, a auditoria achou uns problemas. Dá uma olhada no relatório!", face: "squint" },
    obraDone: { text: "Fim do expediente na obra! Lembra: quem usa leitor de tela também precisa entender o vazio.", face: "star" },
    obraRetry: { text: "Quase! Pra concluir, a média da auditoria precisa chegar a sessenta por cento. Bora reformar?", face: "oops" },
  };

  let pepi = null;
  function buildHost() {
    if (pepi || !P()?.markup) return;
    host.innerHTML = `<div class="pepi obra-pepi" data-face="happy">${P().markup()}<svg class="obra-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true">${outfit()}</svg></div>`;
    pepi = host.firstElementChild;
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

  let talk = null;
  function quiet() {
    talk?.abort();
    talk = null;
    bubble.hidden = true;
  }

  // A recorded line with lip sync, or the caption alone until it is recorded.
  async function say(id) {
    quiet();
    const controller = new AbortController();
    talk = controller;
    const line = voice[id];
    if (pepi) pepi.dataset.face = line.face;
    bubble.hidden = false;
    bubbleText.textContent = "";
    try {
      const clip = P()?.soundOn ? await clipFor(id) : null;
      if (controller.signal.aborted) return;
      const typing = P()?.typewrite ? P().typewrite(line.text, controller.signal, bubbleText) : Promise.resolve(bubbleText.textContent = line.text);
      if (clip && pepi) await Promise.all([typing, P().playClip(clip, controller.signal, pepi)]);
      else {
        await typing;
        await wait(1200 + line.text.length * 25, controller.signal);
      }
    } catch {
      // Cut short by the next line or by leaving the game.
    } finally {
      if (pepi && talk === controller) pepi.dataset.face = "happy";
    }
  }

  /* ---------- State ---------- */

  let step = 0;
  let current = null; // { screen, placed: [], start, limit }
  let scores = [];
  let session = null;
  let timer = 0;
  let timerRun = null;
  let frame = 0;

  const flag = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };
  // The games open one after the other: this one needs Garçom Relâmpago and Hábitos.
  const previousDone = () => testing || (flag("front-arcade.garcom-relampago.completed.v1") && flag("front-arcade.habitos.completed.v1"));

  function unlock() {
    if (!previousDone()) return;
    play.disabled = false;
    card.classList.add("is-unlocked");
    cardStatus.textContent = flag(completionKey) ? "Obras entregues · jogue novamente" : "Desbloqueado · três telas para construir";
  }

  const byId = id => current.screen.pieces.find(piece => piece.id === id);
  const speak = text => { live.textContent = text; };

  /* ---------- Building ---------- */

  function brickHtml(piece, placed) {
    const controls = placed
      ? `<span class="obra-controls">
          <button type="button" data-move="-1" aria-label="Subir ${esc(kinds[piece.kind].name)}">↑</button>
          <button type="button" data-move="1" aria-label="Descer ${esc(kinds[piece.kind].name)}">↓</button>
          <button type="button" data-remove aria-label="Devolver ${esc(kinds[piece.kind].name)} às peças">×</button>
        </span>`
      : "";
    const body = `<span class="obra-brick-head"><span class="obra-kind">${kinds[piece.kind].name}</span><code class="obra-tag">${esc(tagOf(piece))}</code></span><span class="obra-text">${esc(brickText(piece))}</span>`;
    return placed
      ? `<li class="obra-brick is-${piece.kind}" data-id="${piece.id}"><span class="obra-brick-body">${body}</span>${controls}</li>`
      : `<li><button type="button" class="obra-brick is-${piece.kind}" data-id="${piece.id}" aria-label="Adicionar ${esc(kinds[piece.kind].name)} ${esc(tagOf(piece))}: ${esc(brickText(piece))}">${body}</button></li>`;
  }

  function render() {
    const free = current.order.filter(id => !current.placed.includes(id));
    palette.innerHTML = free.map(id => brickHtml(byId(id), false)).join("");
    stage.innerHTML = current.placed.map(id => brickHtml(byId(id), true)).join("");
    stage.classList.toggle("is-empty", !current.placed.length);
    get("obra-count").textContent = `${current.placed.length} ${current.placed.length === 1 ? "peça" : "peças"} na tela`;
  }

  function place(id, at = current.placed.length) {
    const from = current.placed.indexOf(id);
    if (from >= 0) {
      current.placed.splice(from, 1);
      if (from < at) at -= 1;
    }
    current.placed.splice(Math.max(0, Math.min(at, current.placed.length)), 0, id);
    render();
    P()?.sfx("pop");
    const piece = byId(id);
    speak(`${kinds[piece.kind].name} ${tagOf(piece)} na posição ${current.placed.indexOf(id) + 1} de ${current.placed.length}.`);
    const brick = stage.querySelector(`[data-id="${id}"]`);
    if (brick && !reduceMotion.matches) brick.animate([{ transform: "translateY(-10px) scale(1.04)" }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.3, 1.5, .5, 1)" });
  }

  function unplace(id) {
    current.placed = current.placed.filter(other => other !== id);
    render();
    P()?.sfx("blip");
    speak(`${kinds[byId(id).kind].name} devolvida às peças.`);
  }

  palette.addEventListener("click", event => {
    const brick = event.target.closest(".obra-brick");
    if (!brick || !current || dragged) return;
    place(brick.dataset.id);
    palette.querySelector(".obra-brick")?.focus({ preventScroll: true });
  });
  stage.addEventListener("click", event => {
    if (!current) return;
    const brick = event.target.closest(".obra-brick");
    const move = event.target.closest("[data-move]");
    if (move) {
      const id = brick.dataset.id;
      const at = current.placed.indexOf(id) + Number(move.dataset.move);
      if (at < 0 || at >= current.placed.length) return;
      current.placed.splice(current.placed.indexOf(id), 1);
      current.placed.splice(at, 0, id);
      render();
      P()?.sfx("blip");
      speak(`${kinds[byId(id).kind].name} agora na posição ${at + 1}.`);
      stage.querySelector(`[data-id="${id}"] [data-move="${move.dataset.move}"]`)?.focus();
    } else if (event.target.closest("[data-remove]")) unplace(brick.dataset.id);
  });

  // Dragging with the pointer, from the pieces to the screen or inside the screen.
  // A marker shows where the brick will land; dropping a placed brick outside the
  // screen returns it to the pieces.
  let dragged = null; // { id, from, ghost, startX, startY, moving }
  const marker = document.createElement("li");
  marker.className = "obra-marker";
  marker.setAttribute("aria-hidden", "true");

  function dropIndex(y) {
    const bricks = [...stage.querySelectorAll(".obra-brick")].filter(brick => brick.dataset.id !== dragged.id);
    const index = bricks.findIndex(brick => {
      const box = brick.getBoundingClientRect();
      return y < box.top + box.height / 2;
    });
    return index < 0 ? bricks.length : index;
  }
  const overStage = (x, y) => {
    const box = stage.closest(".obra-screen").getBoundingClientRect();
    return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  };

  game.addEventListener("pointerdown", event => {
    if (!current || event.button !== 0 || event.target.closest(".obra-controls")) return;
    const brick = event.target.closest(".obra-brick");
    if (!brick || !round.contains(brick)) return;
    dragged = { id: brick.dataset.id, from: stage.contains(brick) ? "stage" : "palette", source: brick, startX: event.clientX, startY: event.clientY, moving: false, pointer: event.pointerId };
  });
  window.addEventListener("pointermove", event => {
    if (!dragged || event.pointerId !== dragged.pointer) return;
    if (!dragged.moving) {
      if (Math.hypot(event.clientX - dragged.startX, event.clientY - dragged.startY) < 6) return;
      dragged.moving = true;
      const box = dragged.source.getBoundingClientRect();
      dragged.ghost = dragged.source.cloneNode(true);
      dragged.ghost.classList.add("obra-ghost");
      Object.assign(dragged.ghost.style, { width: `${box.width}px`, left: `${box.left}px`, top: `${box.top}px` });
      dragged.offset = [event.clientX - box.left, event.clientY - box.top];
      document.body.append(dragged.ghost);
      dragged.source.classList.add("is-lifted");
      game.classList.add("is-dragging");
    }
    event.preventDefault();
    dragged.ghost.style.left = `${event.clientX - dragged.offset[0]}px`;
    dragged.ghost.style.top = `${event.clientY - dragged.offset[1]}px`;
    if (overStage(event.clientX, event.clientY)) {
      const index = dropIndex(event.clientY);
      const bricks = [...stage.querySelectorAll(".obra-brick")].filter(brick => brick.dataset.id !== dragged.id);
      if (bricks[index]) stage.insertBefore(marker, bricks[index]);
      else stage.append(marker);
      stage.closest(".obra-screen").classList.add("is-target");
    } else {
      marker.remove();
      stage.closest(".obra-screen").classList.remove("is-target");
    }
  });
  function endDrag(event) {
    if (!dragged || event.pointerId !== dragged.pointer) return;
    const drag = dragged;
    marker.remove();
    stage.closest(".obra-screen").classList.remove("is-target");
    game.classList.remove("is-dragging");
    drag.ghost?.remove();
    drag.source.classList.remove("is-lifted");
    if (drag.moving && current && event.type === "pointerup") {
      if (overStage(event.clientX, event.clientY)) {
        const bricks = [...stage.querySelectorAll(".obra-brick")].filter(brick => brick.dataset.id !== drag.id).map(brick => brick.dataset.id);
        const index = dropIndex(event.clientY);
        const at = bricks[index] ? current.placed.indexOf(bricks[index]) : current.placed.length;
        place(drag.id, at);
      } else if (drag.from === "stage") unplace(drag.id);
    }
    // Swallow the click that follows a drag.
    if (drag.moving) setTimeout(() => { dragged = null; }, 0);
    else dragged = null;
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* ---------- Rounds ---------- */

  function tick() {
    if (!current) return;
    const left = Math.max(0, current.limit - (performance.now() - current.start));
    clock.textContent = `${Math.ceil(left / 1000)} s`;
    frame = requestAnimationFrame(tick);
  }

  async function startRound() {
    const screen = screens[step];
    intro.hidden = true;
    audit.hidden = true;
    results.hidden = true;
    round.hidden = false;
    current = { screen, placed: [], order: shuffle(screen.pieces.map(piece => piece.id)), start: performance.now(), limit: screen.time * 1000 };
    get("obra-step").textContent = `Obra ${step + 1} de ${screens.length}`;
    get("obra-brief").innerHTML = `<strong>${esc(screen.title)}</strong> · ${esc(screen.brief)}`;
    get("obra-screen-title").textContent = screen.title;
    get("obra-screen-art").className = `obra-screen-bar is-${screen.key}`;
    render();
    timerRun?.cancel();
    timerRun = timerBar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: current.limit, easing: "linear", fill: "forwards" });
    timerBar.parentElement.classList.remove("is-tight");
    clearTimeout(timer);
    const turn = current;
    timer = setTimeout(() => { if (current === turn) handIn(true); }, current.limit);
    setTimeout(() => { if (current === turn) timerBar.parentElement.classList.add("is-tight"); }, current.limit * .75);
    tick();
    round.scrollIntoView({ block: "nearest" });
    get("obra-step").focus({ preventScroll: true });
    report("obra-round", { screen: screen.key });
    say(screen.line);
  }

  function handIn(timeUp = false) {
    if (!current) return;
    const turn = current;
    current = null;
    clearTimeout(timer);
    timerRun?.pause();
    cancelAnimationFrame(frame);
    const built = turn.placed.map(id => turn.screen.pieces.find(piece => piece.id === id));
    const used = Math.min(turn.limit, performance.now() - turn.start);
    const { result, score } = inspect(turn.screen, built);
    scores[step] = { screen: turn.screen, score, result, used, timeUp };
    showAudit(turn.screen, built, result, score, used, timeUp);
  }

  function preview(screen, built) {
    const parts = built.map(piece => {
      if (piece.kind === "image") return `<div class="obra-view-art">${art[screen.key]}</div>`;
      if (piece.kind === "heading") return piece.level ? `<p class="obra-view-heading is-h${piece.level}">${esc(piece.text)}</p>` : `<p class="obra-view-fake is-${piece.tag}">${esc(piece.text)}</p>`;
      if (piece.kind === "text") return `<p class="obra-view-text">${esc(piece.text)}</p>`;
      if (piece.kind === "action") return piece.semantic ? `<span class="obra-view-button">${esc(piece.text)}</span>` : `<span class="obra-view-div">${esc(piece.text)}</span>`;
      return `<span class="obra-view-field">${piece.labelled ? `<small>${esc(piece.text)}</small>` : ""}<span>${esc(piece.value)}</span></span>`;
    }).join("");
    return `<div class="obra-view"><div class="obra-view-bar">${esc(screen.title)}</div><div class="obra-view-body">${parts || '<p class="obra-view-none">(tela vazia de verdade)</p>'}</div></div>`;
  }

  function showAudit(screen, built, result, score, used, timeUp) {
    round.hidden = true;
    audit.hidden = false;
    const good = score >= 80;
    get("obra-audit-title").textContent = `Auditoria · ${screen.title}`;
    get("obra-score").innerHTML = `<strong>${score}%</strong><span class="obra-stamp ${good ? "is-good" : "is-fix"}">${good ? "Aprovado" : "Reformar"}</span>`;
    get("obra-time-note").textContent = timeUp ? "O tempo acabou: a auditoria olhou o que estava montado." : `Entregue com ${Math.round((screen.time * 1000 - used) / 1000)} s de sobra.`;
    get("obra-preview").innerHTML = preview(screen, built);
    get("obra-reader").innerHTML = announce(screen, built).map(line => `<li>${esc(line)}</li>`).join("");
    const groups = ["Semântica", "Estado vazio"];
    get("obra-checklist").innerHTML = groups.map(group => `<li class="obra-check-group"><h4>${group}</h4><ul>${criteria.filter(criterion => criterion.group === group).map(criterion => {
      const [ok, why] = result[criterion.key];
      return `<li class="${ok ? "is-ok" : "is-bad"}"><span class="obra-mark" aria-hidden="true">${ok ? "✓" : "✗"}</span><div><strong>${criterion.name}</strong><span class="visually-hidden">${ok ? ": aprovado." : ": reprovado."}</span><p>${esc(why)}</p></div></li>`;
    }).join("")}</ul></li>`).join("");
    get("obra-next").textContent = step < screens.length - 1 ? "Próxima obra" : "Ver resultado final";
    get("obra-audit-title").focus();
    P()?.sfx(good ? "sparkle" : "knock");
    const stamp = get("obra-score").querySelector(".obra-stamp");
    if (!reduceMotion.matches) stamp.animate([{ transform: "scale(2.4) rotate(-18deg)", opacity: 0 }, { transform: "scale(.9) rotate(-8deg)", opacity: 1, offset: .7 }, { transform: "rotate(-8deg)", opacity: 1 }], { duration: 420, easing: "ease-out", delay: 250, fill: "backwards" });
    report("obra-audited", { screen: screen.key, score });
    (async () => {
      if (timeUp) await say("obraTime");
      if (!audit.hidden) say(good ? "obraGood" : "obraFix");
    })();
  }

  get("obra-hand-in").addEventListener("click", () => handIn(false));
  get("obra-next").addEventListener("click", () => {
    step += 1;
    if (step < screens.length) startRound();
    else finish();
  });

  function finish() {
    audit.hidden = true;
    results.hidden = false;
    const average = Math.round(scores.reduce((sum, entry) => sum + entry.score, 0) / scores.length);
    const passed = average >= passing;
    const before = flag(completionKey);
    get("obra-final").innerHTML = `<strong>${average}%</strong><span>média da auditoria</span>`;
    get("obra-verdict").className = `obra-verdict ${passed ? "is-pass" : "is-fail"}`;
    get("obra-verdict").innerHTML = passed
      ? `<strong>Obras entregues!</strong> A média ficou em ${average}%.${before ? "" : " Mais um jogo para o seu certificado."}`
      : `<strong>Obra embargada.</strong> A média ficou em ${average}%. Chegue a ${passing}% para concluir o jogo.`;
    get("obra-bars").innerHTML = scores.map(entry => `<div class="obra-bar" style="--share:${entry.score / 100}"><span class="obra-bar-label">${esc(entry.screen.title)}</span><span class="obra-bar-track"><span class="obra-bar-fill"></span></span><span class="obra-bar-value">${entry.score}%</span></div>`).join("");
    // Which checks held up across the three screens.
    get("obra-summary").innerHTML = criteria.map(criterion => {
      const ok = scores.filter(entry => entry.result[criterion.key][0]).length;
      return `<tr><th scope="row">${criterion.name}</th><td>${criterion.group}</td><td>${ok} de ${scores.length}</td></tr>`;
    }).join("");
    const weakest = criteria.map(criterion => [criterion, scores.filter(entry => !entry.result[criterion.key][0]).length]).sort((a, b) => b[1] - a[1])[0];
    get("obra-lesson").textContent = (weakest[1] ? `O ponto que mais pediu reforma foi “${weakest[0].name}”. ` : "Todas as checagens passaram em todas as telas. ")
      + "Um estado vazio bem feito diz o que aconteceu, por que aconteceu e o que fazer agora, com gentileza. E, por baixo, o HTML precisa contar a mesma história para quem não vê a tela: títulos em ordem, imagens descritas, botões de verdade e campos com rótulo.";
    get("again-obra").textContent = passed ? "Jogar novamente" : "Reformar as obras";
    if (passed) {
      try { localStorage.setItem(completionKey, "true"); } catch { /* The result still shows. */ }
    }
    unlock();
    get("obra-result-title").focus();
    report(passed ? "obra-finished" : "obra-failed", { average });
    say(passed ? "obraDone" : "obraRetry");
  }

  function startSession() {
    session?.abort();
    session = new AbortController();
    step = 0;
    scores = [];
    report("obra-started");
    startRound();
  }

  /* ---------- Opening and closing ---------- */

  function stop() {
    session?.abort();
    current = null;
    clearTimeout(timer);
    timerRun?.cancel();
    cancelAnimationFrame(frame);
    quiet();
  }

  function showIntro() {
    stop();
    intro.hidden = false;
    round.hidden = true;
    audit.hidden = true;
    results.hidden = true;
  }

  function closeGame() {
    stop();
    game.hidden = true;
    library.hidden = false;
    report("obra-closed");
  }

  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    buildHost();
    showIntro();
    get("obra-title").focus();
    report("obra-opened");
    setTimeout(() => { if (!game.hidden && !intro.hidden) say("obraHello"); }, 500);
  });
  get("start-obra").addEventListener("click", startSession);
  get("again-obra").addEventListener("click", () => {
    showIntro();
    get("start-obra").focus();
  });
  get("back-from-obra").addEventListener("click", () => {
    closeGame();
    play.focus();
  });
  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", ({ detail }) => { if (detail?.type === "habit-finished") unlock(); });
  unlock();
})();
