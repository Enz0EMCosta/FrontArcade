// Tela em Obras: empty states and the semantics underneath them, for people who have
// never written a line of HTML. Every piece is shown as it looks on screen, with a
// "crachá" (name badge) that says what a screen reader knows about it: two pieces can
// look the same and wear different badges (a real button and a box that only looks
// like one). The player gets three empty screens (an inbox with no messages, an empty
// cart, a search with no results) and, against the clock, picks one piece of each kind
// and puts them in order, following the recipe taught in the intro: image, title, text,
// button. Picking another piece of a kind swaps it in place. Pepi, the site foreman,
// then inspects the screen: four badge checks (titles in order, real buttons and named
// fields, described images, reading order) and four recipe checks (explains why, shows
// the next step, kind tone, visual order). Failed checks are pinned on the screen, and
// the player can listen to the screen as a screen reader would read it. Code tags stay
// one toggle away. An average of 70% over the three screens finishes the game.
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
  const screenBox = stage.closest(".obra-screen");
  const timerBar = get("obra-timer-bar");
  const clock = get("obra-clock");
  const live = get("obra-live");
  const host = game.querySelector(".obra-host");
  const bubble = game.querySelector(".obra-bubble");
  const bubbleText = game.querySelector(".obra-bubble-text");
  const gamesWindow = get("games-window");
  const completionKey = "front-arcade.tela-em-obras.completed.v1";
  const viewKey = "front-arcade.tela-em-obras.view.v1";
  const testing = new URLSearchParams(location.search).has("obras");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;
  const passing = 70; // average score that finishes the game

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
  const animate = (element, frames, options) => (!element || reduceMotion.matches ? null : element.animate(frames, options));

  /* ---------- Pixel art: the illustrations, the hard hat and the clipboard ---------- */

  const pixelSvg = rows => {
    const colours = { n: "#33435a", w: "#ffffff", g: "#dfe6ee", y: "#f6c445", b: "#9fd0f0", B: "#d8eefb", p: "#f08bb4", s: "#edc45b" };
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (colours[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colours[key]}"/>`;
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

  /* ---------- The kinds of piece, the three screens and their pieces ---------- */

  const glyph = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const badgeIcon = glyph("M3 12V4h8l10 10-8 8L3 12ZM7.5 8h.01");
  // In recipe order: what each kind of piece is for, in plain words.
  const kinds = {
    field: { name: "Campo de busca", job: "deixa tentar de novo ali mesmo", icon: glyph("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5") },
    image: { name: "Imagem", job: "mostra que o vazio é esperado", icon: glyph("M3 5h18v14H3ZM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01") },
    heading: { name: "Título", job: "diz o que aconteceu", icon: glyph("M6 4v16M18 4v16M6 12h12") },
    text: { name: "Texto", job: "explica o porquê e o que vem depois", icon: glyph("M4 6h16M4 10h16M4 14h11M4 18h8") },
    action: { name: "Botão", job: "leva ao próximo passo", icon: glyph("M4 8h16v8H4ZM9 12h6") },
  };
  const screens = [
    {
      key: "inbox", title: "Caixa de entrada", brief: "Uma caixa de entrada sem nenhuma mensagem.", time: 90, line: "obraInbox",
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
      key: "search", title: "Busca", brief: "Uma busca por “bicicleta azul turbo” que não achou nada.", time: 75, line: "obraSearch", needsField: true,
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

  // The badge: what a screen reader knows about the piece, in plain words, and the
  // same thing in code.
  function badgeOf(piece) {
    if (piece.kind === "heading") return piece.level ? `Título · nível ${piece.level}` : "Texto comum";
    if (piece.kind === "image") return piece.alt === null ? "Imagem · sem descrição" : piece.alt === "" ? "Enfeite · o leitor pula" : "Imagem · com descrição";
    if (piece.kind === "action") return piece.semantic ? "Botão" : "Só texto · não é botão";
    if (piece.kind === "field") return piece.labelled ? `Campo · nome “${piece.text}”` : "Campo · sem nome";
    return "Texto";
  }
  function tagOf(piece) {
    if (piece.kind === "heading") return piece.level ? `<h${piece.level}>` : piece.tag === "p" ? "<p> em negrito" : "<span> grande";
    if (piece.kind === "image") return piece.alt === null ? "<img> sem alt" : piece.alt === "" ? '<img alt="">' : `<img alt="${piece.alt}">`;
    if (piece.kind === "action") return piece.semantic ? "<button>" : "<div> clicável";
    if (piece.kind === "field") return piece.labelled ? "<label> + <input>" : "<input placeholder>";
    return "<p>";
  }
  // A described image also shows what its description says.
  const badge = piece => `<span class="obra-badge">${badgeIcon}<span class="obra-badge-plain">${esc(badgeOf(piece))}</span><code class="obra-badge-code">${esc(tagOf(piece))}</code></span>${piece.kind === "image" && piece.alt ? `<span class="obra-alt">“${esc(piece.alt)}”</span>` : ""}`;

  // How the piece looks on the screen. The traps look exactly like the real thing.
  function look(piece, screen) {
    if (piece.kind === "image") return `<div class="obra-view-art">${art[screen.key]}</div>`;
    if (piece.kind === "heading") return piece.level ? `<p class="obra-view-heading is-h${piece.level}">${esc(piece.text)}</p>` : `<p class="obra-view-fake is-${piece.tag}">${esc(piece.text)}</p>`;
    if (piece.kind === "text") return `<p class="obra-view-text">${esc(piece.text)}</p>`;
    if (piece.kind === "action") return `<span class="obra-view-button">${esc(piece.text)}</span>`;
    // An unlabelled field only had a hint inside, and the hint is gone once there is text.
    return `<span class="obra-view-field">${piece.labelled ? `<small>${esc(piece.text)}</small>` : ""}<span>${glyph("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5")}${esc(piece.value)}</span></span>`;
  }

  /* ---------- The inspection ---------- */

  const criteria = [
    { key: "headings", group: "badges", name: "Títulos em ordem", code: "<h1>, <h2>…" },
    { key: "labels", group: "badges", name: "Botões e campos de verdade", code: "<button>, <label>" },
    { key: "descriptions", group: "badges", name: "Imagens descritas", code: "alt da <img>" },
    { key: "focus", group: "badges", name: "Ordem de leitura", code: "ordem no HTML" },
    { key: "why", group: "recipe", name: "Explica o porquê" },
    { key: "action", group: "recipe", name: "Mostra o próximo passo" },
    { key: "tone", group: "recipe", name: "Tom gentil" },
    { key: "layout", group: "recipe", name: "Organização visual" },
  ];
  const groups = { badges: "Crachás · para quem usa leitor de tela", recipe: "Receita do vazio · para todo mundo" };
  const lower = kind => kinds[kind].name.toLowerCase();

  // Each check gives [passed, why, culprit]: the culprit is the piece to pin on the screen.
  function inspect(screen, built) {
    const of = kind => built.filter(piece => piece.kind === kind);
    const headings = of("heading");
    const images = of("image");
    const texts = of("text");
    const actions = of("action");
    const fields = of("field");
    const result = {};

    const title = headings[0];
    if (!title) result.headings = [false, "Faltou o título que diz o que aconteceu."];
    else if (headings.length > 1) result.headings = [false, "Dois títulos para o mesmo vazio competem entre si. Fique com um só.", headings[1]];
    else if (!title.level) result.headings = [false, `“${title.text}” parece título, mas o crachá diz “texto comum”: quem usa leitor de tela pula de título em título e não o encontra.`, title];
    else if (title.level === 1) result.headings = [false, "A página já tem um título nível 1: o nome da tela. Um segundo nível 1 embaralha o mapa da página. Aqui cabe o nível 2.", title];
    else if (title.level > 2) result.headings = [false, `Depois do nível 1 vem o nível 2. Pular para o nível ${title.level} é como pular capítulos no sumário.`, title];
    else result.headings = [true, "Título nível 2, logo abaixo do título da página."];

    const fake = actions.find(action => !action.semantic);
    const nameless = fields.find(field => !field.labelled);
    if (screen.needsField && !fields.length) result.labels = [false, "A busca precisa de um campo com nome, para a pessoa tentar de novo ali mesmo."];
    else if (!actions.length && !fields.length) result.labels = [false, "Nenhum botão nem campo: não há nada para a pessoa acionar."];
    else if (fake) result.labels = [false, `“${fake.text}” só parece botão: o teclado não chega até ele e o leitor de tela não avisa que dá para clicar.`, fake];
    else if (nameless) result.labels = [false, "O campo só tinha uma dica dentro, que sumiu quando a pessoa digitou. Sem nome no crachá, o leitor de tela anuncia só “campo de edição”.", nameless];
    else result.labels = [true, screen.needsField ? "Botão de verdade e campo com nome." : "Um botão de verdade: o teclado alcança e o leitor de tela anuncia."];

    const blind = images.find(image => image.alt === null || image.useless);
    if (blind) {
      result.descriptions = [false, blind.useless
        ? `“${blind.alt}” é o nome do arquivo, não uma descrição do que a imagem mostra.`
        : "A imagem está sem descrição: o leitor de tela lê o nome do arquivo. Descreva o que ela mostra, ou marque como enfeite.", blind];
    } else if (!images.length) result.descriptions = [true, "Nenhuma imagem sem descrição."];
    else result.descriptions = [true, images[0].alt === "" ? "A imagem está marcada como enfeite: o leitor de tela pula, e o texto carrega o sentido." : "A imagem tem uma descrição do que mostra."];

    // Reading and focus order: field, title, text, button. The image is left to the
    // visual check.
    const rank = { field: 0, heading: 1, text: 2, action: 3 };
    const flow = built.filter(piece => piece.kind in rank);
    const broken = flow.findIndex((piece, index) => index > 0 && rank[piece.kind] < rank[flow[index - 1].kind]);
    if (flow.length < 2) result.focus = [false, "Peças de menos para formar um caminho de leitura."];
    else if (broken > 0) {
      const [before, after] = [flow[broken - 1], flow[broken]];
      result.focus = [false, `O ${lower(after.kind)} veio depois do ${lower(before.kind)}: quem navega pelo teclado ou ouve a tela recebe tudo fora de ordem.`, after];
    } else result.focus = [true, screen.needsField ? "Campo, título, texto e botão, nessa ordem." : "Título, texto e botão, nessa ordem."];

    result.why = texts.some(text => text.why)
      ? [true, "O texto conta por que a tela está vazia e o que vai aparecer ali."]
      : texts.length ? [false, "O texto não explica por que a tela está vazia.", texts[0]] : [false, "Faltou o texto que explica por que a tela está vazia."];

    const good = actions.find(action => action.clear);
    result.action = good
      ? [true, `“${good.text}” diz exatamente o que acontece ao clicar.`]
      : actions.length ? [false, `“${actions[0].text}” não diz o que acontece ao clicar. Prefira um verbo com destino, como “Ver ofertas”.`, actions[0]] : [false, "Faltou um botão com o próximo passo."];

    const cold = [...headings, ...texts].find(piece => piece.friendly === false);
    if (cold) result.tone = [false, `“${cold.text}” soa frio ou põe a culpa na pessoa.`, cold];
    else if (!texts.length && !headings.length) result.tone = [false, "Sem texto, não há tom para avaliar."];
    else result.tone = [true, "Linguagem gentil, sem jargão técnico nem culpa."];

    const index = piece => built.indexOf(piece);
    if (!images.length) result.layout = [false, "Faltou a imagem: ela mostra de cara que o vazio é esperado e dá o tom."];
    else if (title && index(images[0]) > index(title)) result.layout = [false, "A imagem abre o vazio: ela vem antes do título.", images[0]];
    else if (!actions.length || built.at(-1) !== actions[0]) result.layout = [false, "O botão fecha o vazio: ele fica por último.", actions[0] ?? built.at(-1)];
    else result.layout = [true, "Imagem, título, texto e botão: do mais visual ao próximo passo."];

    const passed = criteria.filter(criterion => result[criterion.key][0]).length;
    return { result, score: Math.round(passed / criteria.length * 100) };
  }

  // What a screen reader would say, in order, and which piece each line belongs to.
  function announce(screen, built) {
    const lines = [{ text: `Título nível 1: ${screen.title}`, ref: "h1" }];
    for (const piece of built) {
      let text = null;
      if (piece.kind === "heading") text = piece.level ? `Título nível ${piece.level}: ${piece.text}` : `${piece.text}.`;
      else if (piece.kind === "image") text = piece.alt === null ? `Imagem: ${{ inbox: "envelope", cart: "carrinho", search: "lupa" }[screen.key]} ponto png` : piece.alt === "" ? null : `Imagem: ${piece.alt}`;
      else if (piece.kind === "text") text = piece.text;
      else if (piece.kind === "action") text = piece.semantic ? `Botão: ${piece.text}` : `${piece.text}.`;
      else if (piece.kind === "field") text = piece.labelled ? `Campo de edição, ${piece.text}: ${piece.value}` : `Campo de edição: ${piece.value}`;
      if (text) lines.push({ text, ref: piece.id, note: piece.kind === "action" && !piece.semantic ? "lido como texto comum, e o Tab não chega até ele" : piece.kind === "heading" && !piece.level ? "lido como texto comum" : piece.kind === "field" && !piece.labelled ? "sem nome: para que serve?" : "" });
      else lines.push({ text: "(imagem pulada: é só enfeite)", ref: piece.id, skipped: true });
    }
    return lines;
  }

  /* ---------- Pepi, the foreman ---------- */

  const voice = {
    obraHello: { text: "Tela em Obras no ar! Hoje eu sou o mestre de obras. Escolha as melhores peças pra cada tela vazia, que no fim eu faço a vistoria!", face: "star" },
    obraInbox: { text: "Primeira obra: uma caixa de entrada sem nenhuma mensagem. Mostra pra pessoa que está tudo bem!", face: "happy" },
    obraCart: { text: "Agora, um carrinho vazio. Dá um motivo pra pessoa voltar às compras!", face: "wink" },
    obraSearch: { text: "Última obra: uma busca que não achou nada. Ajuda a pessoa a tentar de novo!", face: "wide" },
    obraTime: { text: "Acabou o tempo! Vamos vistoriar o que deu pra montar.", face: "oops" },
    obraGood: { text: "Obra aprovada! Crachás certinhos e um vazio que acolhe. Carimbado!", face: "laugh" },
    obraFix: { text: "Hmm, a vistoria achou uns problemas. Olha os alfinetes vermelhos na tela!", face: "squint" },
    obraDone: { text: "Fim do expediente na obra! Lembra: quem usa leitor de tela também precisa entender o vazio.", face: "star" },
    obraRetry: { text: "Quase! Pra concluir, a média da vistoria precisa chegar a setenta por cento. Bora reformar?", face: "oops" },
  };

  let pepi = null;
  function buildHost() {
    if (pepi || !P()?.markup) return;
    host.innerHTML = `<div class="pepi obra-pepi" data-face="happy">${P().markup()}<svg class="obra-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true">${outfit()}</svg></div>`;
    pepi = host.firstElementChild;
  }
  const hop = () => animate(pepi, [{ translate: "0 0" }, { translate: "0 -10px" }, { translate: "0 0" }], { duration: 300, easing: "ease-out" });

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

  /* ---------- How the pieces are shown: badges on or off, plain words or code ---------- */

  const view = (() => {
    try { return { badges: true, code: false, ...JSON.parse(localStorage.getItem(viewKey) ?? "{}") }; } catch { return { badges: true, code: false }; }
  })();
  function applyView() {
    game.classList.toggle("hide-badges", !view.badges);
    game.classList.toggle("show-code", view.code);
    for (const button of game.querySelectorAll("[data-obra-view]")) button.setAttribute("aria-pressed", String(view[button.dataset.obraView]));
    try { localStorage.setItem(viewKey, JSON.stringify(view)); } catch { /* Only a preference. */ }
  }
  for (const button of game.querySelectorAll("[data-obra-view]")) {
    button.addEventListener("click", () => {
      view[button.dataset.obraView] = !view[button.dataset.obraView];
      if (button.dataset.obraView === "code" && view.code) view.badges = true;
      applyView();
      P()?.sfx("blip");
    });
  }
  applyView();
  // The intro's recipe card uses the inbox illustration.
  const recipeArt = game.querySelector(".obra-recipe-art");
  if (recipeArt) recipeArt.innerHTML = art.inbox;

  /* ---------- State ---------- */

  let step = 0;
  let current = null; // { screen, placed: [ids], rows: [kinds], cards: {kind: [ids]}, start, limit }
  let scores = [];
  let session = null;
  let timer = 0;
  let timerRun = null;
  let frame = 0;
  let lastSecond = 0;
  let listening = null;

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

  function render() {
    const { screen, placed } = current;
    palette.innerHTML = current.rows.map(kind => {
      const chosen = placed.find(id => byId(id).kind === kind);
      return `<section class="obra-row is-${kind}${chosen ? " is-done" : ""}" aria-labelledby="obra-row-${kind}">
        <header><span class="obra-row-icon">${kinds[kind].icon}</span><h4 id="obra-row-${kind}">${kinds[kind].name}</h4><small>${kinds[kind].job}</small><span class="obra-row-state">${chosen ? "✓ na tela" : "escolha 1"}</span></header>
        <ul class="obra-cards">${current.cards[kind].map(id => {
          const piece = byId(id);
          const on = placed.includes(id);
          return `<li><button type="button" class="obra-brick obra-card is-${kind}" data-id="${id}" aria-pressed="${on}" aria-label="${esc(kinds[kind].name)}: ${esc(piece.kind === "image" ? "ilustração" : piece.kind === "field" ? piece.value : piece.text)}. Crachá: ${esc(badgeOf(piece))}${piece.kind === "image" && piece.alt ? `: ${esc(piece.alt)}` : ""}.${on ? " Está na tela." : ""}">
            <span class="obra-look">${look(piece, screen)}</span>${badge(piece)}${on ? '<span class="obra-card-on" aria-hidden="true">✓</span>' : ""}
          </button></li>`;
        }).join("")}</ul></section>`;
    }).join("");
    stage.innerHTML = placed.map((id, index) => {
      const piece = byId(id);
      return `<li class="obra-brick obra-placed is-${piece.kind}" data-id="${id}">
        ${badge(piece)}<div class="obra-look">${look(piece, screen)}</div>
        <span class="obra-controls" role="group" aria-label="${esc(kinds[piece.kind].name)}, posição ${index + 1}">
          <button type="button" data-move="-1" aria-label="Subir ${esc(lower(piece.kind))}"${index === 0 ? " disabled" : ""}>↑</button>
          <button type="button" data-move="1" aria-label="Descer ${esc(lower(piece.kind))}"${index === placed.length - 1 ? " disabled" : ""}>↓</button>
          <button type="button" data-remove aria-label="Tirar ${esc(lower(piece.kind))} da tela">×</button>
        </span></li>`;
    }).join("");
    stage.classList.toggle("is-empty", !placed.length);
    const total = current.rows.length;
    get("obra-count").innerHTML = `<span class="obra-dots" aria-hidden="true">${current.rows.map(kind => `<i class="${placed.some(id => byId(id).kind === kind) ? "is-on" : ""}"></i>`).join("")}</span>${placed.length} de ${total} peças na tela`;
    get("obra-hand-in").classList.toggle("is-ready", placed.length === total);
  }

  // Glides a piece from where it was (a card, or its old spot) to its place on the screen.
  function glide(id, from) {
    const target = stage.querySelector(`[data-id="${id}"]`);
    if (!target || !from) return;
    const to = target.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = Math.min(1.2, Math.max(.4, from.width / to.width));
    animate(target, [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: .6 }, { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2, .9, .3, 1.15)" });
  }

  // One piece of each kind: picking another piece of a kind swaps it in, in the same spot.
  function place(id, at = null) {
    const piece = byId(id);
    const from = (stage.querySelector(`[data-id="${id}"]`) ?? palette.querySelector(`[data-id="${id}"]`))?.getBoundingClientRect();
    const rival = current.placed.find(other => other !== id && byId(other).kind === piece.kind);
    const before = current.placed.indexOf(id);
    if (before >= 0) {
      current.placed.splice(before, 1);
      if (at !== null && before < at) at -= 1;
    }
    if (rival) {
      const spot = current.placed.indexOf(rival);
      current.placed.splice(spot, 1);
      if (at === null) at = spot;
      else if (spot < at) at -= 1;
    }
    at ??= current.placed.length;
    current.placed.splice(Math.max(0, Math.min(at, current.placed.length)), 0, id);
    render();
    glide(id, from);
    hop();
    P()?.sfx(rival ? "blip" : "pop");
    speak(`${kinds[piece.kind].name} ${rival ? "trocado" : "na tela"}, na posição ${current.placed.indexOf(id) + 1} de ${current.placed.length}. Crachá: ${badgeOf(piece)}.`);
  }

  function unplace(id) {
    const piece = byId(id);
    const spot = stage.querySelector(`[data-id="${id}"]`);
    const finish = () => {
      if (!current) return;
      current.placed = current.placed.filter(other => other !== id);
      render();
      speak(`${kinds[piece.kind].name} saiu da tela.`);
    };
    P()?.sfx("blip");
    const leaving = animate(spot, [{ transform: "none", opacity: 1 }, { transform: "scale(.85)", opacity: 0 }], { duration: 160, easing: "ease-in" });
    if (leaving) leaving.onfinish = finish;
    else finish();
  }

  palette.addEventListener("click", event => {
    const brick = event.target.closest(".obra-card");
    if (!brick || !current || dragged) return;
    if (current.placed.includes(brick.dataset.id)) unplace(brick.dataset.id);
    else place(brick.dataset.id);
    palette.querySelector(`[data-id="${brick.dataset.id}"]`)?.focus({ preventScroll: true });
  });
  stage.addEventListener("click", event => {
    if (!current) return;
    const brick = event.target.closest(".obra-placed");
    const move = event.target.closest("[data-move]");
    if (move && brick) {
      const id = brick.dataset.id;
      const at = current.placed.indexOf(id) + Number(move.dataset.move);
      if (at < 0 || at >= current.placed.length) return;
      const from = brick.getBoundingClientRect();
      current.placed.splice(current.placed.indexOf(id), 1);
      current.placed.splice(at, 0, id);
      render();
      glide(id, from);
      P()?.sfx("blip");
      speak(`${kinds[byId(id).kind].name} agora na posição ${at + 1}.`);
      const again = stage.querySelector(`[data-id="${id}"] [data-move="${move.dataset.move}"]`);
      (again && !again.disabled ? again : stage.querySelector(`[data-id="${id}"] [data-remove]`))?.focus();
    } else if (event.target.closest("[data-remove]") && brick) unplace(brick.dataset.id);
  });

  // Dragging with the pointer, from a card to the screen or inside the screen. A marker
  // shows where the piece will land; dropping a placed piece outside the screen takes
  // it off.
  let dragged = null; // { id, from, ghost, startX, startY, moving }
  const marker = document.createElement("li");
  marker.className = "obra-marker";
  marker.setAttribute("aria-hidden", "true");

  function dropIndex(y) {
    const bricks = [...stage.querySelectorAll(".obra-placed")].filter(brick => brick.dataset.id !== dragged.id);
    const index = bricks.findIndex(brick => {
      const box = brick.getBoundingClientRect();
      return y < box.top + box.height / 2;
    });
    return index < 0 ? bricks.length : index;
  }
  const overStage = (x, y) => {
    const box = screenBox.getBoundingClientRect();
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
      const bricks = [...stage.querySelectorAll(".obra-placed")].filter(brick => brick.dataset.id !== dragged.id);
      if (bricks[index]) stage.insertBefore(marker, bricks[index]);
      else stage.append(marker);
      screenBox.classList.add("is-target");
    } else {
      marker.remove();
      screenBox.classList.remove("is-target");
    }
  });
  function endDrag(event) {
    if (!dragged || event.pointerId !== dragged.pointer) return;
    const drag = dragged;
    marker.remove();
    screenBox.classList.remove("is-target");
    game.classList.remove("is-dragging");
    drag.source.classList.remove("is-lifted");
    if (drag.moving && current && event.type === "pointerup") {
      const ghostBox = drag.ghost.getBoundingClientRect();
      if (overStage(event.clientX, event.clientY)) {
        const bricks = [...stage.querySelectorAll(".obra-placed")].filter(brick => brick.dataset.id !== drag.id).map(brick => brick.dataset.id);
        const index = dropIndex(event.clientY);
        const at = bricks[index] ? current.placed.indexOf(bricks[index]) : current.placed.length;
        place(drag.id, at);
        glide(drag.id, ghostBox);
      } else if (drag.from === "stage") unplace(drag.id);
    }
    drag.ghost?.remove();
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
    const seconds = Math.ceil(left / 1000);
    clock.textContent = `${seconds} s`;
    if (seconds !== lastSecond) {
      lastSecond = seconds;
      if (seconds <= 10 && seconds > 0) {
        round.classList.add("is-tight");
        P()?.sfx("tick");
        animate(clock, [{ scale: 1.25 }, { scale: 1 }], { duration: 260, easing: "ease-out" });
        if (seconds === 10 && pepi) pepi.dataset.face = "oops";
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function stepper() {
    get("obra-steps").innerHTML = screens.map((screen, index) => `<li class="${index < step ? "is-done" : index === step ? "is-now" : ""}"${index === step ? ' aria-current="step"' : ""}><span>${index < step ? "✓" : index + 1}</span>${esc(screen.title)}</li>`).join("");
  }

  async function startRound() {
    stopListening();
    const screen = screens[step];
    intro.hidden = true;
    audit.hidden = true;
    results.hidden = true;
    round.hidden = false;
    const rows = shuffle([...new Set(screen.pieces.map(piece => piece.kind))]);
    const cards = Object.fromEntries(rows.map(kind => [kind, shuffle(screen.pieces.filter(piece => piece.kind === kind).map(piece => piece.id))]));
    current = { screen, placed: [], rows, cards, start: performance.now(), limit: screen.time * 1000 };
    get("obra-step").textContent = `Obra ${step + 1} de ${screens.length}`;
    stepper();
    get("obra-brief").innerHTML = `<strong>${esc(screen.title)}</strong> ${esc(screen.brief)}`;
    get("obra-screen-title").textContent = screen.title;
    get("obra-screen-url").textContent = `app.exemplo/${screen.key === "inbox" ? "mensagens" : screen.key === "cart" ? "carrinho" : "busca?q=bicicleta+azul+turbo"}`;
    render();
    timerRun?.cancel();
    timerRun = timerBar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: current.limit, easing: "linear", fill: "forwards" });
    round.classList.remove("is-tight");
    lastSecond = 0;
    clearTimeout(timer);
    const turn = current;
    timer = setTimeout(() => { if (current === turn) handIn(true); }, current.limit);
    tick();
    round.scrollIntoView({ block: "nearest" });
    get("obra-step").focus({ preventScroll: true });
    animate(palette, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
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

  /* ---------- The inspection screen ---------- */

  function showAudit(screen, built, result, score, used, timeUp) {
    round.hidden = true;
    audit.hidden = false;
    const good = score >= 80;
    // Failed checks are numbered, and the number is pinned on the piece at fault.
    const failed = criteria.filter(criterion => !result[criterion.key][0]);
    const pins = new Map();
    failed.forEach((criterion, index) => {
      const culprit = result[criterion.key][2];
      if (culprit) pins.set(culprit.id, [...(pins.get(culprit.id) ?? []), index + 1]);
    });
    get("obra-audit-title").textContent = `Vistoria · ${screen.title}`;
    get("obra-time-note").textContent = timeUp ? "O tempo acabou: a vistoria olhou o que estava montado." : `Entregue com ${Math.round((screen.time * 1000 - used) / 1000)} s de sobra.`;
    get("obra-score").innerHTML = `<strong><span id="obra-score-value">0</span>%</strong><span class="obra-stamp ${good ? "is-good" : "is-fix"}">${good ? "Aprovado" : "Reformar"}</span>`;
    const items = built.map(piece => `<div class="obra-view-item${pins.has(piece.id) ? " is-flagged" : ""}" data-ref="${piece.id}">${look(piece, screen)}${pins.has(piece.id) ? `<span class="obra-pins">${pins.get(piece.id).map(number => `<b class="obra-pin">${number}</b>`).join("")}</span>` : ""}</div>`).join("");
    get("obra-preview").innerHTML = `<div class="obra-view"><div class="obra-view-bar" data-ref="h1">${esc(screen.title)}</div><div class="obra-view-body">${items || '<p class="obra-view-none">(a tela ficou vazia de verdade)</p>'}</div></div>`;
    get("obra-reader").innerHTML = announce(screen, built).map(line => `<li data-ref="${line.ref}"${line.skipped ? ' class="is-skipped"' : ""}><span>${esc(line.text)}</span>${line.note ? `<small>${esc(line.note)}</small>` : ""}</li>`).join("");
    let order = 0;
    get("obra-checklist").innerHTML = Object.entries(groups).map(([key, title]) => `<li class="obra-check-group"><h4>${title}</h4><ul>${criteria.filter(criterion => criterion.group === key).map(criterion => {
      const [ok, why] = result[criterion.key];
      const number = failed.indexOf(criterion) + 1;
      return `<li class="${ok ? "is-ok" : "is-bad"}" style="--i:${order++}"><span class="obra-mark" aria-hidden="true">${ok ? "✓" : number}</span><div><strong>${criterion.name}</strong>${criterion.code ? `<code>${esc(criterion.code)}</code>` : ""}<span class="visually-hidden">${ok ? ": aprovado." : `: reprovado, alfinete ${number}.`}</span><p>${esc(why)}</p></div></li>`;
    }).join("")}</ul></li>`).join("");
    get("obra-next").textContent = step < screens.length - 1 ? "Próxima obra" : "Ver resultado final";
    get("obra-listen").textContent = "▶ Ouvir como o leitor de tela";
    get("obra-audit-title").focus();
    report("obra-audited", { screen: screen.key, score });

    // The checks come in one by one, the score counts up and the stamp lands.
    const signal = session?.signal;
    (async () => {
      try {
        const marks = [...get("obra-checklist").querySelectorAll(".obra-check-group li")];
        for (const [index, mark] of marks.entries()) {
          await wait(reduceMotion.matches ? 0 : 140, signal);
          mark.classList.add("is-in");
          if (!reduceMotion.matches) P()?.sfx(mark.classList.contains("is-ok") ? "tick" : "knock");
          const okSoFar = marks.slice(0, index + 1).filter(item => item.classList.contains("is-ok")).length;
          get("obra-score-value").textContent = String(Math.round(okSoFar / marks.length * 100));
        }
        get("obra-score-value").textContent = String(score);
        const stamp = get("obra-score").querySelector(".obra-stamp");
        stamp.classList.add("is-in");
        animate(stamp, [{ transform: "scale(2.4) rotate(-18deg)", opacity: 0 }, { transform: "scale(.9) rotate(-8deg)", opacity: 1, offset: .7 }, { transform: "rotate(-8deg)", opacity: 1 }], { duration: 420, easing: "ease-out" });
        P()?.sfx(good ? "sparkle" : "knock");
        for (const pin of get("obra-preview").querySelectorAll(".obra-pin")) animate(pin, [{ scale: 0 }, { scale: 1.3 }, { scale: 1 }], { duration: 300, easing: "ease-out" });
        if (timeUp) await say("obraTime");
        if (!audit.hidden) say(good ? "obraGood" : "obraFix");
      } catch {
        // Left the screen in the middle.
      }
    })();
  }

  // "Listen to the screen": each line lights up with its piece, read aloud by the
  // browser's speech synthesis when the sound is on (a screen reader's voice), or just
  // highlighted, one after the other, when it is off.
  function stopListening() {
    listening?.abort();
    listening = null;
    try { speechSynthesis?.cancel(); } catch { /* No speech here. */ }
    for (const element of game.querySelectorAll(".is-reading")) element.classList.remove("is-reading");
    get("obra-listen").textContent = "▶ Ouvir como o leitor de tela";
  }
  function speakLine(text, signal) {
    const synth = window.speechSynthesis;
    if (!P()?.soundOn || !synth || typeof SpeechSynthesisUtterance !== "function") return wait(900 + text.length * 35, signal);
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.15;
      const done = () => { clearTimeout(guard); resolve(); };
      const guard = setTimeout(done, 1500 + text.length * 90);
      utterance.onend = done;
      utterance.onerror = done;
      signal.addEventListener("abort", done, { once: true });
      synth.speak(utterance);
    });
  }
  get("obra-listen").addEventListener("click", async () => {
    if (listening) return stopListening();
    quiet();
    const controller = new AbortController();
    listening = controller;
    get("obra-listen").textContent = "■ Parar";
    const lines = [...get("obra-reader").children];
    try {
      for (const line of lines) {
        if (controller.signal.aborted) return;
        for (const element of game.querySelectorAll(".is-reading")) element.classList.remove("is-reading");
        line.classList.add("is-reading");
        get("obra-preview").querySelector(`[data-ref="${line.dataset.ref}"]`)?.classList.add("is-reading");
        line.scrollIntoView({ block: "nearest" });
        await speakLine(line.classList.contains("is-skipped") ? "" : line.querySelector("span").textContent, controller.signal);
        if (!line.classList.contains("is-skipped")) await wait(250, controller.signal);
      }
    } catch {
      // Stopped.
    } finally {
      if (listening === controller) stopListening();
    }
  });

  get("obra-hand-in").addEventListener("click", () => handIn(false));
  get("obra-next").addEventListener("click", () => {
    stopListening();
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
    get("obra-final").innerHTML = `<strong>${average}%</strong><span>média da vistoria</span>`;
    get("obra-verdict").className = `obra-verdict ${passed ? "is-pass" : "is-fail"}`;
    get("obra-verdict").innerHTML = passed
      ? `<strong>Obras entregues!</strong> A média ficou em ${average}%.${before ? "" : " Mais um jogo para o seu certificado."}`
      : `<strong>Obra embargada.</strong> A média ficou em ${average}%. Chegue a ${passing}% para concluir o jogo.`;
    get("obra-bars").innerHTML = scores.map(entry => `<div class="obra-bar" style="--share:${entry.score / 100}"><span class="obra-bar-label">${esc(entry.screen.title)}</span><span class="obra-bar-track"><span class="obra-bar-fill"></span></span><span class="obra-bar-value">${entry.score}%</span></div>`).join("");
    for (const [index, fill] of [...get("obra-bars").querySelectorAll(".obra-bar-fill")].entries()) animate(fill, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, delay: 150 + index * 150, easing: "cubic-bezier(.2, .8, .3, 1)", fill: "backwards" });
    // Which checks held up across the three screens.
    get("obra-summary").innerHTML = criteria.map(criterion => {
      const ok = scores.filter(entry => entry.result[criterion.key][0]).length;
      return `<tr><th scope="row">${criterion.name}</th><td>${criterion.group === "badges" ? "Crachás" : "Receita do vazio"}</td><td>${ok} de ${scores.length}</td></tr>`;
    }).join("");
    const weakest = criteria.map(criterion => [criterion, scores.filter(entry => !entry.result[criterion.key][0]).length]).sort((a, b) => b[1] - a[1])[0];
    get("obra-lesson").textContent = (weakest[1] ? `O ponto que mais pediu reforma foi “${weakest[0].name}”. ` : "Todas as checagens passaram em todas as telas. ")
      + "Um bom vazio diz o que aconteceu, por que aconteceu e o que fazer agora, com gentileza. E os crachás precisam contar a mesma história para quem não vê a tela: títulos em ordem, imagens descritas, botões de verdade e campos com nome.";
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
    stopListening();
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
