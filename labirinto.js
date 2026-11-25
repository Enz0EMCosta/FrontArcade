// Labirinto do Tab: keyboard navigation and focus order. Each level is a small web page
// that can only be crossed with Tab, Shift+Tab and Enter, from where the focus starts
// to the "Saída" button. The first levels follow a logical order (forward, backward,
// a skip link); then come focus traps: a queue jumped by positive tabindex, invisible
// links in a closed menu that still take focus, a collapsed section, and dialogs that
// hold the focus (one polite, one that hides its close button and throws the focus
// back to the top when it closes). Past the last element the focus goes through the
// browser's address bar and starts over, in both directions, as in a real browser.
//
// The page is a model: the keys are intercepted and the focus moves by its rules, so
// every level can be solved by a breadth-first search to find the ideal path. The score
// is the efficiency, the ideal number of keys over the keys pressed. A level only opens
// the next one at 70% or more; it can be replayed and the best try counts. The pieces
// are real links and buttons, so a screen reader announces each step. Mouse and touch
// players get on-screen keys. ?labirinto in the address unlocks the game for testing.
(() => {
  const get = id => document.getElementById(id);
  const card = get("maze-card");
  const play = get("play-maze");
  const cardStatus = get("maze-card-status");
  const library = get("game-library");
  const game = get("maze-game");
  const intro = get("maze-intro");
  const board = get("maze-level");
  const results = get("maze-results");
  const frame = get("maze-frame");
  const pageBox = get("maze-page");
  const address = get("maze-address");
  const token = get("maze-focus");
  const trail = get("maze-trail");
  const status = get("maze-status");
  const live = get("maze-live");
  const keypad = get("maze-keypad");
  const done = get("maze-done");
  const host = game.querySelector(".maze-host");
  const bubble = game.querySelector(".maze-bubble");
  const bubbleText = game.querySelector(".maze-bubble-text");
  const gamesWindow = get("games-window");
  const completionKey = "front-arcade.labirinto-tab.completed.v1";
  const testing = new URLSearchParams(location.search).has("labirinto");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;
  const passing = 70; // efficiency needed to pass each level (and so the game)
  const BROWSER = "browser";

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));
  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("stopped"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); reject(new Error("stopped")); }, { once: true });
  });
  const esc = text => String(text).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const animate = (element, frames, options) => (!element || reduceMotion.matches ? null : element.animate(frames, options));

  /* ---------- Pixel art for the little sites ---------- */

  const colours = { k: "#1c2b40", w: "#ffffff", g: "#c9d3df", y: "#f6c445", o: "#ff8a3d", r: "#e44d63", p: "#f08bb4", b: "#4fa3e0", B: "#b8dcf7", G: "#3fa45b", L: "#9fd67a", n: "#8a5a2b", c: "#f3dcb5", v: "#7b5cc4", s: "#7d8ca0" };
  const pixelSvg = rows => {
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (colours[key]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${colours[key]}"/>`;
    }));
    return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  };
  const sprites = {
    robot: ["....yy......", ".....kk.....", "..kkkkkkkk..", "..kbbbbbbk..", "..kbwbbwbk..", "..kbkbbkbk..", "..kbbbbbbk..", "..kbrrrrbk..", "..kkkkkkkk..", ".kssssssssk.", ".ksyssssysk.", ".kkkkkkkkkk."],
    oil: ["....kk......", "...kyyk.....", "..kkkkkkkkk.", "..kooooooook", "..kowoooooko", "..kooooooook", "..kooooooook", "..kkkkkkkkkk"],
    bolt: ["..kkkk..", ".kssssk.", ".kkkkkk.", "..kssk..", "..kssk..", "..kssk..", "..kssk..", "...kk..."],
    battery: ["kkkkkkkkkk..", "kGGGGGGLLkk.", "kGGGGGGLLkkk", "kGGGGGGLLkk.", "kkkkkkkkkk.."],
    book: ["kkkkk..kkkkk", "kwwwwkkwwwwk", "kwggwkkwggwk", "kwwwwkkwwwwk", "kwggwkkwggwk", "kwwwwkkwwwwk", "kkkkkkkkkkkk", ".....kk....."],
    bag: ["...kkkk...", "..k....k..", "..k....k..", "kkkkkkkkkk", "krrrrrrrrk", "krrwrrrrrk", "krrrrrrrrk", "krrrrrrrrk", "kkkkkkkkkk"],
    shirt: ["..kkk..kkk..", ".kbbbkkbbbk.", "kbbbbbbbbbbk", "kkkbbbbbbkkk", "..kbbbbbbk..", "..kbbwwbbk..", "..kbbbbbbk..", "..kkkkkkkk.."],
    ball: ["...kkkk...", "..kwwwwk..", ".kwkkwwwk.", "kwkkkwwwwk", "kwwkwwwkwk", "kwwwwwkkwk", ".kwwwwkkk.", "..kwwwwk..", "...kkkk..."],
    mountain: ["..........yy..", ".........yyyy.", "....k.....yy..", "...kwk........", "..kwwgk...k...", ".kggggk..kgk..", "kggggggkkgggk.", "kggggggggggggk", "kkkkkkkkkkkkkk"],
    plane: [".....kk.....", ".....kbk....", "kk...kbbk...", "kbkkkkbbbkkk", "kbbbbbbbbbbk", "kkkkkbbbkkkk", ".....kbk....", ".....kk....."],
    suitcase: ["...kkkk...", "...k..k...", "kkkkkkkkkk", "koookoooko", "koookoooko", "kkkkkkkkkk", "koookoooko", "kkkkkkkkkk", ".k......k."],
    cup: ["...k.k.k....", "....k.k.....", "kkkkkkkkk...", "kcccccccckk.", "kcnnnnnnckck", "kcnnnnnnckck", "kccccccccck.", ".kcccccck...", "..kkkkkk....", "kkkkkkkkkkk."],
    croissant: ["...kkkkkk...", "..kooooooook", ".kooyoooyook", "kooyoooyoook", ".kkk....kkk."],
    cake: ["....r.....", "....k.....", ".kkkkkkkk.", ".kppppppk.", ".kwwwwwwk.", ".kppppppk.", ".kcccccck.", "kkkkkkkkkk"],
    paper: ["kkkkkkkkkk..", "kwwwwwwwwkk.", "kwkkkkkkwkwk", "kwwwwwwwwkwk", "kwggwkkkwkwk", "kwggwwwwwkwk", "kwggwkkkwkwk", "kwwwwwwwwkwk", "kkkkkkkkkkwk", ".kkkkkkkkkk."],
    trophy: ["kkkkkkkkkk", "kyyyyyyyyk", ".kyyyyyyk.", "..kyyyyk..", "...kyyk...", "....kk....", "...kyyk...", "..kkkkkk..", "..kkkkkk.."],
    rain: ["...kkkk.....", "..kwwwwkkk..", ".kwwwwwwwwk.", "kwwwwwwwwwwk", "kkkkkkkkkkkk", "..s...s...s.", ".s...s...s..", "s...s...s..."],
  };
  // Scenery only: a hero banner and a shelf of products. Never in the Tab order.
  const hero = (sprite, title, text) => ({ deco: true, kind: "hero", sprite, title, text });
  const shelf = items => ({ deco: true, kind: "shelf", items });

  /* ---------- The levels ---------- */

  // Pieces of a page. Focusable ones are "stops"; `deco` pieces are only scenery.
  const link = (id, label, extra = {}) => ({ id, label, kind: "link", ...extra });
  const button = (id, label, extra = {}) => ({ id, label, kind: "button", ...extra });
  const field = (id, label, extra = {}) => ({ id, label, kind: "field", ...extra });
  const exit = (extra = {}) => ({ id: "exit", label: "Saída", kind: "exit", enter: { type: "exit" }, ...extra });
  const deco = (text, kind = "p") => ({ deco: true, text, kind });

  const levels = [
    {
      key: "corredor", name: "O corredor", concept: "Tab anda para a frente", site: "pepistore.com", sprite: "robot", theme: { a: "#ff5d9e", b: "#ffd166", bg: "#fff4f8" },
      brief: "Aperte <kbd>Tab</kbd> para levar o foco para a frente, peça por peça. Quando chegar na <strong>Saída</strong>, aperte <kbd>Enter</kbd>.",
      hint: "Continue no Tab: a Saída está na parte principal da página, depois de “Ver novidades”.",
      lesson: "Sem mouse, o Tab é o jeito de andar pela página. Ele segue a ordem do código, que aqui é a mesma ordem em que a gente lê: de cima para baixo, da esquerda para a direita.",
      start: "logo",
      zones: {
        header: [link("logo", "Pepi Store", { kind: "logo" }), link("n1", "Início"), link("n2", "Produtos"), link("n3", "Ofertas")],
        main: [hero("robot", "Bem-vindo à Pepi Store!", "Tudo para o seu robô favorito: óleo, parafusos e muito carinho."), shelf([["oil", "Óleo premium", "R$ 9"], ["bolt", "Parafusos", "R$ 2"], ["battery", "Bateria", "R$ 15"]]), button("news", "Ver novidades"), exit()],
        footer: [link("f1", "Ajuda"), link("f2", "Termos"), link("f3", "Privacidade"), link("f4", "Instagram")],
      },
    },
    {
      key: "re", name: "Marcha a ré", concept: "Shift+Tab volta", site: "blogdopepi.com", sprite: "book", theme: { a: "#1fae9c", b: "#ffe28a", bg: "#eefbf8" },
      brief: "Você começa no meio da página, e a <strong>Saída</strong> ficou lá atrás, no menu. Segure <kbd>Shift</kbd> e aperte <kbd>Tab</kbd> para voltar.",
      hint: "Shift+Tab: segure Shift e aperte Tab. A Saída está no menu do topo.",
      lesson: "Shift+Tab faz o caminho inverso. Quem navega pelo teclado usa os dois sentidos o tempo todo, por isso a ordem precisa fazer sentido tanto indo quanto voltando.",
      start: "read",
      zones: {
        header: [link("logo", "Blog do Pepi", { kind: "logo" }), link("n1", "Artigos"), exit({ kind: "exit" }), link("n3", "Sobre")],
        main: [hero("book", "Últimos posts", "Histórias, tutoriais e pixel art fresquinhos toda semana."), link("p1", "Robôs também sonham?"), link("p2", "Guia do óleo de motor"), link("p3", "10 dicas de pixel art"), button("read", "Continuar lendo"), link("comment", "Comentar")],
        footer: [link("f1", "Contato"), link("f2", "RSS")],
      },
    },
    {
      key: "atalho", name: "Atalho secreto", concept: "Link para pular o menu", site: "megaloja.com", sprite: "bag", theme: { a: "#ff7a2f", b: "#4b36b0", bg: "#fff6ee" },
      brief: "Esta loja tem um menu enorme. O foco começa na barra do navegador. Dê o primeiro <kbd>Tab</kbd> e repare no que aparece no canto: é um atalho.",
      hint: "O primeiro Tab mostra “Pular para o conteúdo”. Aperte Enter nele: o foco salta o menu inteiro.",
      lesson: "O link “Pular para o conteúdo” é o primeiro da página e só aparece quando recebe o foco. Ele poupa quem usa teclado de atravessar o menu inteiro, em todas as páginas do site.",
      start: BROWSER,
      zones: {
        header: [link("skip", "Pular para o conteúdo", { kind: "skip", enter: { type: "skip", to: "coupon" } }), link("logo", "Mega Loja", { kind: "logo" }),
          ...["Moda", "Infantil", "Casa", "Esporte", "Beleza", "Tech", "Livros", "Pets", "Promo"].map((label, index) => link(`n${index}`, label))],
        main: [hero("bag", "Ofertas do dia", "Frete grátis para robôs acima de 3 parafusos."), button("coupon", "Ver cupom"), exit(), shelf([["shirt", "Camiseta", "R$ 39"], ["ball", "Bola", "R$ 25"], ["bag", "Sacola", "R$ 12"]])],
        footer: [link("f1", "Trocas"), link("f2", "Entregas"), link("f3", "Lojas"), link("f4", "Carreiras")],
      },
    },
    {
      key: "fila", name: "Fila furada", concept: "tabindex fora de ordem", site: "pepiviagens.com", sprite: "plane", theme: { a: "#2f8fe0", b: "#ffd166", bg: "#eef6ff" },
      brief: "Alguém mexeu na fila deste site. O foco começa na barra do navegador: dê <kbd>Tab</kbd> e observe para onde ele pula.",
      hint: "Três peças furam a fila e vêm antes de tudo. A Saída está logo depois de “Ver pacotes”; às vezes é mais curto chegar por trás, com Shift+Tab.",
      lesson: "Um tabindex maior que zero fura a fila: o elemento recebe o foco antes de todos os outros, não importa onde esteja na tela. A regra é simples: não use tabindex positivo e deixe a ordem do código seguir a ordem visual.",
      start: BROWSER,
      zones: {
        header: [link("logo", "Pepi Viagens", { kind: "logo" }), link("n1", "Destinos"), link("n2", "Pacotes"), link("n3", "Contato")],
        main: [hero("mountain", "Promoção de inverno", "Neve de verdade para robôs que nunca enferrujam."), button("packs", "Ver pacotes"), exit(), button("agent", "Falar com agente"), shelf([["plane", "Voo + hotel", "R$ 899"], ["suitcase", "Mala de mão", "R$ 120"]])],
        float: [button("chat", "Chat", { tab: 2 })],
        footer: [field("mail", "Seu e-mail", { tab: 1 }), button("sub", "Assinar"), link("secret", "Promo secreta", { tab: 3 }), link("terms", "Termos")],
      },
    },
    {
      key: "fantasmas", name: "Fantasmas", concept: "Elementos invisíveis e seções fechadas", site: "pepicafe.com", sprite: "cup", theme: { a: "#9a6331", b: "#f0b35a", bg: "#fbf3e8" },
      brief: "A <strong>Saída</strong> está guardada numa seção fechada: abra com <kbd>Enter</kbd>. E cuidado: este café tem fantasmas no caminho.",
      hint: "Abra “Perguntas frequentes” com Enter. Dica de mestre: do começo da página, Shift+Tab dá a volta pelo fim e chega lá mais rápido.",
      lesson: "O menu fechado sumiu da tela, mas os links dele continuaram recebendo foco, e quem usa teclado fica sem saber onde está. O que está escondido precisa sair da ordem do Tab (com display: none ou inert). Já o conteúdo recolhido, como um acordeão, só entra no caminho depois de aberto.",
      start: "logo",
      zones: {
        header: [link("logo", "Pepi Café", { kind: "logo" }), button("menu", "Menu", { kind: "menu", enter: { type: "toggle", group: "menu" } })],
        menu: [link("m1", "Cardápio", { ghost: "menu" }), link("m2", "Reservas", { ghost: "menu" }), link("m3", "Delivery", { ghost: "menu" }), link("m4", "Eventos", { ghost: "menu" })],
        main: [hero("cup", "Café quentinho, robô feliz", "Grãos torrados na hora e bolo de óleo de motor (só para robôs)."), shelf([["croissant", "Croissant", "R$ 7"], ["cake", "Bolo do dia", "R$ 9"]]), link("story", "Ler a nossa história"),
          button("faq", "Perguntas frequentes", { kind: "toggle", enter: { type: "toggle", group: "faq" } }),
          link("how", "Como reservar uma mesa?", { group: "faq" }), exit({ group: "faq" })],
        footer: [link("f1", "Contato"), link("f2", "Blog")],
      },
    },
    {
      key: "janela", name: "Janela que prende", concept: "Armadilhas de foco", site: "jornaldopepi.com", sprite: "paper", theme: { a: "#e44d63", b: "#1c2b40", bg: "#f8f5ef" },
      brief: "Duas janelas vão tentar prender o seu foco. Uma é bem-educada; a outra, nem tanto. <kbd>Esc</kbd> não está no seu chaveiro hoje: ache o jeito de sair.",
      hint: "Nos cookies, “Recusar” fecha e devolve o foco ao lugar. Para fugir da newsletter, vá por trás: do topo, Shift+Tab chega na Saída sem passar pela manchete.",
      lesson: "Prender o foco dentro de uma janela é correto, desde que haja um jeito fácil de sair e que, ao fechar, o foco volte para onde estava. A janela de cookies fez isso. A da newsletter escondeu o × do teclado e, ao fechar, jogou você de volta para o topo da página.",
      start: "cfg", startDialog: "cookies", startReturn: "logo",
      zones: {
        header: [link("logo", "Jornal do Pepi", { kind: "logo" }), link("n1", "Notícias"), link("n2", "Esportes")],
        main: [hero("paper", "Edição de hoje", "Tudo o que aconteceu na cidade dos robôs."), shelf([["trophy", "Esportes", "Maratona"], ["rain", "Clima", "Parafusos"]]), link("lead", "Manchete: robô vence maratona", { popup: "news" }), link("weather", "Clima: chuva de parafusos"), exit()],
        footer: [link("f1", "Expediente"), link("f2", "Anuncie")],
      },
      dialogs: {
        cookies: { title: "Este site usa cookies", text: "Escolha como quer seguir.", polite: true,
          stops: [button("cfg", "Configurar", { enter: { type: "none", note: "As configurações não abrem nesta página. Nada mudou." } }), button("deny", "Recusar", { enter: { type: "close", back: "trigger" } }), button("allow", "Aceitar", { enter: { type: "close", back: "trigger" } })] },
        news: { title: "Assine a newsletter!", text: "Notícias fresquinhas toda manhã.", fakeClose: true,
          stops: [field("email", "Seu e-mail", { enter: { type: "none", note: "É só um campo: Enter não faz nada aqui." } }), button("join", "Assinar", { enter: { type: "none", note: "Sem e-mail, nada acontece." } }), button("later", "Agora não", { enter: { type: "close", back: "top" } })] },
      },
    },
  ];

  // Flatten each level: stops in code order, with their zone; dialog stops apart.
  for (const level of levels) {
    level.stops = [];
    for (const [zone, pieces] of Object.entries(level.zones)) for (const piece of pieces) if (!piece.deco) level.stops.push({ ...piece, zone });
    for (const [name, dialog] of Object.entries(level.dialogs ?? {})) for (const stop of dialog.stops) level.stops.push({ ...stop, zone: "dialog", dialog: name });
    level.byId = Object.fromEntries(level.stops.map(stop => [stop.id, stop]));
  }

  /* ---------- The rules of focus ---------- */

  const initial = level => ({ focus: level.start, open: [], dialog: level.startDialog ?? null, returnTo: level.startReturn ?? null, seen: [], done: false, note: null });

  // The Tab order: inside an open dialog, only its own buttons (the trap); otherwise
  // positive tabindex first, then code order, then the browser's address bar.
  function order(level, state) {
    if (state.dialog) return level.dialogs[state.dialog].stops.map(stop => stop.id);
    const visible = level.stops.filter(stop => !stop.dialog && (!stop.group || state.open.includes(stop.group)));
    const jumpers = visible.filter(stop => stop.tab > 0).sort((a, b) => a.tab - b.tab);
    return [...jumpers, ...visible.filter(stop => !(stop.tab > 0)), BROWSER].map(stop => stop.id ?? stop);
  }

  function step(level, state, key) {
    const next = { ...state, note: null };
    if (key === "enter") {
      const action = level.byId[state.focus]?.enter;
      if (!action) next.note = { type: "nothing" };
      else if (action.type === "exit") next.done = true;
      else if (action.type === "skip") { next.focus = action.to; next.note = { type: "skip" }; }
      else if (action.type === "toggle") {
        const opened = !state.open.includes(action.group);
        next.open = opened ? [...state.open, action.group].sort() : state.open.filter(group => group !== action.group);
        next.note = { type: opened ? "open" : "shut", group: action.group };
      } else if (action.type === "close") {
        next.dialog = null;
        next.focus = action.back === "top" ? BROWSER : state.returnTo;
        next.returnTo = null;
        next.note = { type: action.back === "top" ? "dropped" : "closed" };
      } else next.note = { type: "nothing", text: action.note };
      return next;
    }
    const list = order(level, state);
    let index = list.indexOf(state.focus);
    if (index < 0) index = key === "tab" ? list.length - 1 : 0;
    next.focus = list[(index + (key === "tab" ? 1 : -1) + list.length) % list.length];
    const popup = level.byId[next.focus]?.popup;
    if (popup && !state.seen.includes(popup)) {
      next.seen = [...state.seen, popup].sort();
      next.dialog = popup;
      next.returnTo = next.focus;
      next.focus = level.dialogs[popup].stops[0].id;
      next.note = { type: "trap" };
    }
    return next;
  }

  // The shortest sequence of keys that ends with Enter on the exit.
  function idealPath(level) {
    const id = state => [state.focus, state.open.join(), state.dialog, state.returnTo, state.seen.join()].join("|");
    const start = initial(level);
    const queue = [[start, []]];
    const visited = new Set([id(start)]);
    while (queue.length) {
      const [state, path] = queue.shift();
      for (const key of ["tab", "shift", "enter"]) {
        const next = step(level, state, key);
        if (next.done) return [...path, key];
        if (visited.has(id(next))) continue;
        visited.add(id(next));
        queue.push([next, [...path, key]]);
      }
    }
    return [];
  }
  for (const level of levels) level.ideal = idealPath(level);

  /* ---------- Pepi, the explorer ---------- */

  // A pith helmet with a band, and a lantern in his right hand, over his 48 × 51 grid.
  function outfit() {
    const r = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    const ink = "#3b2838";
    let hat = "";
    const dome = [[18, 12], [15, 18], [13, 22], [12, 24], [11, 26], [11, 26]];
    dome.forEach(([x, width], row) => { hat += r(x - 1, 2 + row, width + 2, 1, ink) + r(x, 2 + row, width, 1, "#e8d3a2"); });
    hat += r(11, 6, 26, 2, "#8a5a2b") + r(3, 8, 42, 3, ink) + r(4, 9, 40, 1, "#cdb27a") + r(16, 3, 4, 1, "#fff4d6") + r(13, 4, 2, 1, "#fff4d6");
    const lantern = r(39, 24, 6, 2, ink) + r(41, 22, 2, 2, ink) + r(38, 26, 8, 10, ink) + r(39, 27, 6, 8, "#ffd166") + r(40, 28, 2, 4, "#fff6d6") + r(38, 36, 8, 2, ink);
    return `<g class="maze-outfit">${hat}<g class="maze-lantern">${lantern}</g></g>`;
  }

  const voice = {
    mazeHello: { text: "Bem-vindo ao Labirinto do Tab! Aqui o mouse não entra: só Tab, Shift+Tab e Enter. Bora achar a saída?", face: "star" },
    mazeGood: { text: "Saída encontrada, quase sem passos perdidos. Que faro!", face: "laugh" },
    mazeSlow: { text: "Achou a saída! Mas deu umas voltinhas. Será que tem um caminho mais curto?", face: "wink" },
    mazeGhost: { text: "Ué, cadê o foco? Ele entrou num elemento invisível. Isso deixa muita gente perdida!", face: "wide" },
    mazeTrap: { text: "Uma janela prendeu o foco! Procure um botão pra fechar.", face: "oops" },
    mazeMouse: { text: "Opa, aqui o mouse não funciona! Use o teclado, ou as teclas aqui embaixo.", face: "squint" },
    mazeDone: { text: "Você saiu do labirinto! Lembra: tem gente que navega só pelo teclado, todo santo dia.", face: "star" },
    mazeRetry: { text: "Quase! Pra concluir, a eficiência média precisa chegar a setenta por cento. Bora mais uma volta?", face: "oops" },
  };

  let pepi = null;
  function buildHost() {
    if (pepi || !P()?.markup) return;
    host.innerHTML = `<div class="pepi maze-pepi" data-face="happy">${P().markup()}<svg class="maze-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true">${outfit()}</svg></div>`;
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
        await wait(1400 + line.text.length * 25, controller.signal);
      }
    } catch {
      // Cut short by the next line or by leaving the game.
    } finally {
      if (pepi && talk === controller) pepi.dataset.face = "happy";
    }
  }
  const saidOnce = new Set();
  const sayOnce = id => { if (saidOnce.has(id)) return; saidOnce.add(id); say(id); };

  /* ---------- Drawing a level ---------- */

  const glyph = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const flag = glyph("M5 21V4M5 4h11l-2 4 2 4H5");
  const chevron = glyph("M6 9l6 6 6-6");
  const burger = glyph("M4 7h16M4 12h16M4 17h16");

  function stopHtml(stop) {
    const common = `data-stop="${stop.id}" tabindex="-1"`;
    if (stop.kind === "field") return `<span class="maze-stop is-field" role="textbox" aria-readonly="true" aria-label="${esc(stop.label)}" ${common}><span>${esc(stop.label)}</span></span>`;
    if (stop.kind === "exit") return `<button type="button" class="maze-stop is-exit" ${common}>${flag}${esc(stop.label)}</button>`;
    if (stop.kind === "toggle") return `<button type="button" class="maze-stop is-toggle" aria-expanded="false" ${common}>${esc(stop.label)}${chevron}</button>`;
    if (stop.kind === "menu") return `<button type="button" class="maze-stop is-menu" aria-expanded="false" ${common}>${burger}${esc(stop.label)}</button>`;
    if (stop.kind === "button") return `<button type="button" class="maze-stop is-button" ${common}>${esc(stop.label)}</button>`;
    return `<a href="#" class="maze-stop is-${stop.kind}" ${common}>${esc(stop.label)}</a>`;
  }
  function decoHtml(piece) {
    if (piece.kind === "hero") return `<div class="maze-hero"><div><p class="maze-deco is-h">${esc(piece.title)}</p><p class="maze-deco">${esc(piece.text)}</p></div><span class="maze-hero-art">${pixelSvg(sprites[piece.sprite])}</span></div>`;
    if (piece.kind === "shelf") return `<div class="maze-shelf" aria-hidden="true">${piece.items.map(([sprite, name, price]) => `<div class="maze-product"><span class="maze-product-art">${pixelSvg(sprites[sprite])}</span><b>${esc(name)}</b><small>${esc(price)}</small></div>`).join("")}</div>`;
    return piece.kind === "h" ? `<p class="maze-deco is-h">${esc(piece.text)}</p>` : `<p class="maze-deco">${esc(piece.text)}</p>`;
  }

  function zoneHtml(level, zone) {
    const pieces = level.zones[zone] ?? [];
    let html = "";
    let group = null;
    for (const piece of pieces) {
      if (piece.group !== group) {
        if (group) html += "</div>";
        if (piece.group) html += `<div class="maze-panel" data-group="${piece.group}" hidden>`;
        group = piece.group ?? null;
      }
      html += piece.deco ? decoHtml(piece) : stopHtml(level.byId[piece.id]);
    }
    if (group) html += "</div>";
    return html;
  }

  function drawLevel(level) {
    const dialogs = Object.entries(level.dialogs ?? {}).map(([name, dialog]) => `
      <div class="maze-veil" data-dialog="${name}" hidden>
        <div class="maze-dialog" role="dialog" aria-modal="true" aria-label="${esc(dialog.title)}">
          ${dialog.fakeClose ? '<span class="maze-fake-x" aria-hidden="true" title="Este × não recebe foco">×</span>' : ""}
          <p class="maze-dialog-title">${esc(dialog.title)}</p><p class="maze-dialog-text">${esc(dialog.text)}</p>
          <div class="maze-dialog-actions">${dialog.stops.map(stop => stopHtml(level.byId[stop.id])).join("")}</div>
        </div>
      </div>`).join("");
    pageBox.className = `maze-page is-${level.key}`;
    pageBox.style.cssText = `--lv-a:${level.theme.a};--lv-b:${level.theme.b};--lv-bg:${level.theme.bg}`;
    board.style.setProperty("--lv-a", level.theme.a);
    board.style.setProperty("--lv-b", level.theme.b);
    pageBox.innerHTML = `
      <header class="maze-zone is-header">${zoneHtml(level, "header")}</header>
      ${level.zones.menu ? `<nav class="maze-zone is-drawer" aria-label="Menu">${zoneHtml(level, "menu")}</nav>` : ""}
      <main class="maze-zone is-main">${zoneHtml(level, "main")}</main>
      <footer class="maze-zone is-footer">${zoneHtml(level, "footer")}</footer>
      ${level.zones.float ? `<div class="maze-zone is-float">${zoneHtml(level, "float")}</div>` : ""}
      ${dialogs}`;
    get("maze-url").textContent = level.site;
  }

  // Applies the state to the page: open sections, the menu, dialogs.
  function sync() {
    const { level, state } = current;
    for (const panel of pageBox.querySelectorAll(".maze-panel")) panel.hidden = !state.open.includes(panel.dataset.group);
    for (const toggle of pageBox.querySelectorAll(".is-toggle, .is-menu")) toggle.setAttribute("aria-expanded", String(state.open.includes(level.byId[toggle.dataset.stop].enter.group)));
    pageBox.querySelector(".is-drawer")?.classList.toggle("is-open", state.open.includes("menu"));
    for (const veil of pageBox.querySelectorAll(".maze-veil")) veil.hidden = veil.dataset.dialog !== state.dialog;
    pageBox.classList.toggle("has-dialog", Boolean(state.dialog));
  }

  const target = id => id === BROWSER ? address : pageBox.querySelector(`[data-stop="${id}"]`);
  const isGhost = (level, state, id) => {
    const ghost = level.byId[id]?.ghost;
    return Boolean(ghost && !state.open.includes(ghost));
  };

  // The focus token: a glowing ring that glides to whatever has the focus, and a trail
  // of where it has been. On an invisible element it turns into a lost "?".
  function placeToken(jump = false) {
    const { level, state } = current;
    const element = target(state.focus);
    if (!element) return;
    const lost = isGhost(level, state, state.focus);
    const outer = frame.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const edge = pageBox.getBoundingClientRect();
    const pad = 5;
    // Off screen, the lost focus shows at the page's left edge, at the link's height.
    const place = lost
      ? { left: edge.left - outer.left + 6, top: box.top - outer.top + box.height / 2 - 18, width: 36, height: 36 }
      : { left: box.left - outer.left - pad, top: box.top - outer.top - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
    token.classList.toggle("is-lost", lost);
    token.classList.toggle("no-glide", jump || reduceMotion.matches);
    Object.assign(token.style, { left: `${place.left}px`, top: `${place.top}px`, width: `${place.width}px`, height: `${place.height}px` });
    token.hidden = false;
    const center = [place.left + place.width / 2, place.top + place.height / 2].map(value => Math.round(value));
    if (!jump) {
      current.trail.push(center);
      current.trail = current.trail.slice(-14);
    } else current.trail = [center];
    trail.setAttribute("viewBox", `0 0 ${Math.round(outer.width)} ${Math.round(outer.height)}`);
    trail.innerHTML = current.trail.length > 1 ? `<polyline points="${current.trail.map(point => point.join(",")).join(" ")}"/>${current.trail.slice(0, -1).map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="3" opacity="${((index + 1) / current.trail.length).toFixed(2)}"/>`).join("")}` : "";
  }

  function describe(level, id) {
    if (id === BROWSER) return "Barra do navegador";
    const stop = level.byId[id];
    const role = { link: "Link", logo: "Link", skip: "Link", button: "Botão", exit: "Botão", toggle: "Botão", menu: "Botão", field: "Campo" }[stop.kind];
    return `${role} “${stop.label}”`;
  }

  /* ---------- Playing ---------- */

  let current = null; // { index, level, state, used, keys, trail, finished, hinted }
  const best = [];
  let session = null;

  function hud() {
    const { level, keys, used } = current;
    get("maze-count").innerHTML = `
      <span class="maze-tally"><kbd>Tab</kbd><b>${keys.tab}</b></span>
      <span class="maze-tally"><kbd>Shift+Tab</kbd><b>${keys.shift}</b></span>
      <span class="maze-tally"><kbd>Enter</kbd><b>${keys.enter}</b></span>
      <span class="maze-total">${used} ${used === 1 ? "tecla" : "teclas"} <small>· caminho ideal: ${level.ideal.length}</small></span>`;
  }

  function focusCurrent() {
    const element = target(current.state.focus);
    element?.focus({ preventScroll: true });
    for (const other of frame.querySelectorAll(".is-here")) other.classList.remove("is-here");
    element?.classList.add("is-here");
    status.innerHTML = `<span class="maze-status-label">Foco em</span> ${esc(describe(current.level, current.state.focus))}${isGhost(current.level, current.state, current.state.focus) ? ' <em class="maze-warn">invisível!</em>' : ""}`;
  }

  function notice(text, tone = "info") {
    const line = get("maze-note");
    line.textContent = text;
    line.className = `maze-note is-${tone}`;
    live.textContent = text;
    animate(line, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 200, easing: "ease-out" });
  }

  function press(key) {
    if (!current || current.finished) return;
    const { level } = current;
    const before = current.state;
    const next = step(level, before, key);
    current.state = next;
    current.used += 1;
    current.keys[key] += 1;
    sync();
    focusCurrent();
    placeToken();
    hud();
    flash(key);
    const note = next.note;
    if (next.done) return finishLevel();
    P()?.sfx(key === "enter" ? "pop" : "tick");
    if (note?.type === "nothing") notice(note.text ?? "Nada acontece aqui. Esse Enter não levou a lugar nenhum.", "warn");
    else if (note?.type === "skip") notice("Atalho! O foco pulou o menu e foi direto para o conteúdo.", "good");
    else if (note?.type === "open") notice(note.group === "menu" ? "Menu aberto: agora dá para ver os links dele." : "Seção aberta: o que estava dentro entrou no caminho do Tab.", "good");
    else if (note?.type === "shut") notice(note.group === "menu" ? "Menu fechado." : "Seção fechada.", "info");
    else if (note?.type === "trap") { notice("Uma janela abriu e prendeu o foco. O Tab só anda dentro dela agora.", "bad"); sayOnce("mazeTrap"); }
    else if (note?.type === "closed") notice("Janela fechada, e o foco voltou para onde você estava. Bem-educada!", "good");
    else if (note?.type === "dropped") notice("A janela fechou e jogou o foco lá para o topo da página.", "bad");
    else if (current.level.dialogs && before.dialog && next.dialog && key !== "enter") notice("Ainda preso na janela: o Tab dá voltas só aqui dentro.", "bad");
    else if (isGhost(level, next, next.focus)) { notice("Cadê o foco? Ele entrou num link do menu fechado, que está invisível.", "bad"); sayOnce("mazeGhost"); }
    else if (next.focus === BROWSER) notice("Fim da página: o foco foi para a barra do navegador. Mais um Tab e ele recomeça do topo.", "info");
    else if (level.byId[next.focus]?.tab > 0 && key === "tab") notice("Furou a fila! Esse elemento tem tabindex positivo e passou na frente.", "bad");
    else get("maze-note").textContent = "";
    if (!current.hinted && current.used >= level.ideal.length + 6) {
      current.hinted = true;
      get("maze-hint").hidden = false;
      get("maze-hint").innerHTML = `<strong>Dica:</strong> ${esc(level.hint)}`;
    }
  }

  // The on-screen key lights up, whichever way it was pressed.
  function flash(key) {
    const button = keypad.querySelector(`[data-key="${key}"]`);
    button?.classList.add("is-pressed");
    setTimeout(() => button?.classList.remove("is-pressed"), 140);
  }

  frame.addEventListener("keydown", event => {
    if (!current || current.finished || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Tab") {
      event.preventDefault();
      press(event.shiftKey ? "shift" : "tab");
    } else if (event.key === "Enter") {
      event.preventDefault();
      press("enter");
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      notice("Aqui o Espaço não vale: no labirinto, quem aciona é o Enter.", "warn");
    } else if (event.key === "Escape") {
      event.preventDefault();
      notice("O Esc não está no seu chaveiro hoje. Ache um botão para fechar.", "warn");
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      notice("As setas não andam por aqui: use Tab e Shift+Tab.", "warn");
    }
  });
  // No mouse in the maze: clicks are swallowed, and the focus stays where it was.
  frame.addEventListener("mousedown", event => {
    if (!current || current.finished) return;
    event.preventDefault();
    notice("Sem mouse no labirinto! Use Tab, Shift+Tab e Enter (ou as teclas aqui embaixo).", "warn");
    sayOnce("mazeMouse");
    focusCurrent();
  });
  frame.addEventListener("click", event => {
    if (event.target.closest("[data-stop]")) event.preventDefault();
  });
  // If the focus wanders off (a click elsewhere), a button brings it back.
  frame.addEventListener("focusout", () => {
    setTimeout(() => {
      if (current && !current.finished && !frame.contains(document.activeElement) && !board.hidden) get("maze-resume").hidden = false;
    }, 0);
  });
  frame.addEventListener("focusin", () => { get("maze-resume").hidden = true; });
  get("maze-resume").addEventListener("click", () => { get("maze-resume").hidden = true; focusCurrent(); });
  keypad.addEventListener("mousedown", event => { if (event.target.closest("[data-key]")) event.preventDefault(); });
  keypad.addEventListener("click", event => {
    const key = event.target.closest("[data-key]");
    if (!key) return;
    press(key.dataset.key);
    if (current && !current.finished) focusCurrent();
  });
  addEventListener("resize", () => { if (current && !board.hidden) placeToken(true); });

  function stepper() {
    get("maze-steps").innerHTML = levels.map((level, index) => {
      const score = best[index];
      const passed = score >= passing;
      const state = index === current?.index ? "is-now" : passed ? "is-done" : "";
      return `<li class="${state}" style="--lv-a:${level.theme.a}"${index === current?.index ? ' aria-current="step"' : ""}><span>${passed && index !== current?.index ? "✓" : index + 1}</span>${esc(level.name)}</li>`;
    }).join("");
  }

  function startLevel(index, replay = false) {
    const level = levels[index];
    intro.hidden = true;
    results.hidden = true;
    board.hidden = false;
    done.hidden = true;
    keypad.hidden = false;
    get("maze-restart").hidden = false;
    get("maze-hint").hidden = true;
    get("maze-resume").hidden = true;
    current = { index, level, state: initial(level), used: 0, keys: { tab: 0, shift: 0, enter: 0 }, trail: [], finished: false, hinted: false, replay };
    get("maze-level-title").textContent = `Nível ${index + 1} · ${level.name}`;
    get("maze-level-art").innerHTML = pixelSvg(sprites[level.sprite]);
    get("maze-concept").textContent = level.concept;
    get("maze-brief").innerHTML = level.brief;
    get("maze-note").textContent = "";
    drawLevel(level);
    sync();
    stepper();
    hud();
    board.scrollIntoView({ block: "nearest" });
    requestAnimationFrame(() => {
      focusCurrent();
      placeToken(true);
      if (current.state.dialog) notice("Uma janela de cookies já está aberta e segurando o foco.", "bad");
    });
    report("maze-level", { level: level.key });
  }

  const efficiency = (level, used) => Math.min(100, Math.round(level.ideal.length / Math.max(1, used) * 100));
  const keyName = { tab: "Tab", shift: "Shift+Tab", enter: "Enter" };

  // The ideal path, squashed: "Tab ×5, Enter".
  function pathHtml(path) {
    const runs = [];
    for (const key of path) {
      if (runs.at(-1)?.[0] === key) runs.at(-1)[1] += 1;
      else runs.push([key, 1]);
    }
    return runs.map(([key, count]) => `<span class="maze-run"><kbd>${keyName[key]}</kbd>${count > 1 ? `<small>×${count}</small>` : ""}</span>`).join('<span class="maze-arrow" aria-hidden="true">→</span>');
  }

  function finishLevel() {
    const { level, index, used } = current;
    current.finished = true;
    const score = efficiency(level, used);
    const before = best[index];
    best[index] = Math.max(before ?? 0, score);
    keypad.hidden = true;
    get("maze-restart").hidden = true;
    done.hidden = false;
    const stars = score >= 100 ? 3 : score >= passing ? 2 : 1;
    const cleared = best[index] >= passing;
    done.classList.toggle("is-short", !cleared);
    get("maze-done-title").textContent = score >= passing ? "Saída encontrada!" : "Saída encontrada… mas com voltas demais";
    get("maze-done-score").innerHTML = `<strong>${score}%</strong><span>eficiência</span><span class="maze-stars" aria-label="${stars} de 3 estrelas">${"★".repeat(stars)}<i>${"★".repeat(3 - stars)}</i></span>`;
    get("maze-done-detail").textContent = `Você usou ${used} ${used === 1 ? "tecla" : "teclas"}; o caminho ideal usa ${level.ideal.length}.${before !== undefined && score > before ? " Novo recorde neste nível!" : ""}${cleared ? "" : ` Para passar de fase, a eficiência precisa chegar a ${passing}%.`}`;
    get("maze-done-lesson").textContent = level.lesson;
    get("maze-ideal").hidden = true;
    get("maze-ideal").innerHTML = `<span class="maze-ideal-label">Caminho ideal</span>${pathHtml(level.ideal)}`;
    get("maze-show-ideal").hidden = score >= 100;
    get("maze-next").textContent = index < levels.length - 1 && !current.replay ? "Próximo nível" : "Ver resultado final";
    get("maze-next").hidden = !cleared;
    get("maze-retry").className = cleared ? "secondary-button" : "primary-button";
    get("maze-gate").hidden = cleared;
    get("maze-gate").innerHTML = `<strong>Fase trancada.</strong> Faça pelo menos ${passing}% para abrir a próxima. Dica: veja o caminho ideal e tente de novo.`;
    stepper();
    P()?.sfx(score >= 80 ? "sparkle" : "reveal");
    animate(token, [{ scale: 1 }, { scale: 1.25 }, { scale: 1 }], { duration: 420, easing: "ease-out" });
    get("maze-done-title").focus({ preventScroll: true });
    done.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
    report("maze-level-done", { level: level.key, score });
    say(score >= 80 ? "mazeGood" : "mazeSlow");
    if (!cleared) get("maze-show-ideal").hidden = false;
  }

  get("maze-show-ideal").addEventListener("click", () => {
    get("maze-ideal").hidden = false;
    get("maze-show-ideal").hidden = true;
    get("maze-ideal").focus();
  });
  get("maze-retry").addEventListener("click", () => startLevel(current.index, current.replay));
  get("maze-restart").addEventListener("click", () => { if (current && !current.finished) startLevel(current.index, current.replay); });
  get("maze-next").addEventListener("click", () => {
    if (current.index < levels.length - 1 && !current.replay) startLevel(current.index + 1);
    else finish();
  });

  const flagSet = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };

  function finish() {
    board.hidden = true;
    results.hidden = false;
    quiet();
    const scores = levels.map((_, index) => best[index] ?? 0);
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const passed = scores.every(score => score >= passing);
    const before = flagSet(completionKey);
    get("maze-final").innerHTML = `<strong>${average}%</strong><span>eficiência média</span>`;
    get("maze-verdict").className = `maze-verdict ${passed ? "is-pass" : "is-fail"}`;
    get("maze-verdict").innerHTML = passed
      ? `<strong>Você saiu do labirinto!</strong> A eficiência média ficou em ${average}%.${before ? "" : " Mais um jogo para o seu certificado."}`
      : `<strong>Ainda perdido no labirinto.</strong> Todos os níveis precisam de pelo menos ${passing}%: repita os que ficaram abaixo.`;
    get("maze-bars").innerHTML = levels.map((level, index) => `<div class="maze-bar" style="--share:${scores[index] / 100}"><span class="maze-bar-label">${esc(level.name)}</span><span class="maze-bar-track"><span class="maze-bar-fill"></span></span><span class="maze-bar-value">${scores[index]}%</span></div>`).join("");
    for (const [index, fill] of [...get("maze-bars").querySelectorAll(".maze-bar-fill")].entries()) animate(fill, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, delay: 120 + index * 120, easing: "cubic-bezier(.2, .8, .3, 1)", fill: "backwards" });
    get("maze-summary").innerHTML = levels.map((level, index) => `<tr><th scope="row">${esc(level.name)}</th><td>${esc(level.concept)}</td><td>${level.ideal.length}</td><td>${scores[index]}%</td></tr>`).join("");
    get("maze-replay").innerHTML = levels.map((level, index) => `<li><button type="button" class="secondary-button" data-replay="${index}">${esc(level.name)} · ${scores[index]}%</button></li>`).join("");
    get("again-maze").textContent = passed ? "Jogar do começo" : "Recomeçar do nível 1";
    if (passed) {
      try { localStorage.setItem(completionKey, "true"); } catch { /* The result still shows. */ }
    }
    unlock();
    get("maze-result-title").focus();
    report(passed ? "maze-finished" : "maze-failed", { average });
    say(passed ? "mazeDone" : "mazeRetry");
  }
  get("maze-replay").addEventListener("click", event => {
    const replay = event.target.closest("[data-replay]");
    if (replay) startLevel(Number(replay.dataset.replay), true);
  });

  /* ---------- Opening and closing ---------- */

  const previousDone = () => testing || flagSet("front-arcade.tela-em-obras.completed.v1");
  function unlock() {
    if (!previousDone()) return;
    play.disabled = false;
    card.classList.add("is-unlocked");
    cardStatus.textContent = flagSet(completionKey) ? "Labirinto vencido · jogue novamente" : "Desbloqueado · seis níveis só no teclado";
  }

  function stop() {
    session?.abort();
    current = null;
    quiet();
  }
  function showIntro() {
    stop();
    intro.hidden = false;
    board.hidden = true;
    results.hidden = true;
  }
  function closeGame() {
    stop();
    game.hidden = true;
    library.hidden = false;
    report("maze-closed");
  }

  // The intro's banner: a pixel maze crossed by a dotted path through six coloured
  // stops, one per level, to a golden exit.
  function mazeMap() {
    const rows = [
      "################################################",
      "#..............#..........#...................##",
      "#.######.#####.#.########.#.#######.#########..#",
      "#.#....#.#...#...#......#...#.....#.#.......#..#",
      "#.#.##.#.#.#.#####.####.#####.###.#.#.#####.#..#",
      "#...#..#...#.......#..#.......#.#...#.#...#....#",
      "#####.######.#######..#########.#####.#.#.######",
      "#.....#......#......................#...#......E",
      "################################################",
    ];
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === "#") rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#2f7d4f"/>`;
      else if (cell === "E") rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#ffbf1f"/>`;
    }));
    const stops = [[1, 1], [9, 1], [17, 1], [26, 3], [34, 5], [44, 7]];
    const path = "M1.5 1.5H14.5V3.5H16.5V1.5H25.5V3.5H27.5V1.5H45.5V7.5H47.5";
    const dots = stops.map(([x, y], index) => `<rect x="${x}" y="${y}" width="1" height="1" rx=".2" fill="${levels[index].theme.a}" stroke="#fff" stroke-width=".18"/>`).join("");
    return `<svg viewBox="0 0 48 9" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect width="48" height="9" fill="#d9f0dd"/>${rects}<path d="${path}" fill="none" stroke="#ffbf1f" stroke-width=".22" stroke-dasharray=".5 .5" shape-rendering="auto"/>${dots}</svg>`;
  }

  // The intro lists the levels ahead.
  get("maze-level-list").innerHTML = levels.map((level, index) => `<li style="--lv-a:${level.theme.a};--lv-b:${level.theme.b};--lv-bg:${level.theme.bg}"><span class="maze-level-art">${pixelSvg(sprites[level.sprite])}</span><span class="maze-level-number">${index + 1}</span><strong>${esc(level.name)}</strong><small>${esc(level.concept)}</small></li>`).join("");
  get("maze-map").innerHTML = mazeMap();

  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    buildHost();
    showIntro();
    get("maze-title").focus();
    report("maze-opened");
    setTimeout(() => { if (!game.hidden && !intro.hidden) say("mazeHello"); }, 500);
  });
  get("start-maze").addEventListener("click", () => {
    session?.abort();
    session = new AbortController();
    best.length = 0;
    saidOnce.clear();
    report("maze-started");
    startLevel(0);
  });
  get("again-maze").addEventListener("click", () => {
    best.length = 0;
    startLevel(0);
  });
  get("back-from-maze").addEventListener("click", () => {
    closeGame();
    play.focus();
  });
  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", ({ detail }) => { if (detail?.type === "obra-finished") unlock(); });
  unlock();
})();
