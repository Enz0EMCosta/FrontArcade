// A Casa Assombrada do Dark UX: the final challenge, unlocked after Labirinto do Tab. It
// brings back every earlier topic, one per room of a haunted mansion: colour and contrast
// (hall), forms (library), perceived performance (kitchen), Hick's law (dining room),
// consistency (bedroom), semantics and empty states (basement) and keyboard focus (attic).
//
// The lantern: each room is a little website in the dark, and a flashlight beam (a CSS
// radial mask that follows the pointer, or the keyboard focus) reveals it. Every piece
// of the page is a real button. Some are haunted by a dark pattern: examining one makes
// its ghost appear and asks for the right fix among three; the others are fine. Pointing
// at a fine piece, or picking a wrong fix, costs courage (five hearts per attempt; at zero
// the room starts over). Fixed pieces turn into their healthy version, so a cleared room
// is a clean page. A floor plan shows the way: rooms open in order, the boss last.
//
// The boss, O Fantasma do Dark UX, throws patterns from every room against the clock, in
// three phases that get faster; in the last one its answer buttons keep swapping places
// (habits) and one attack must be answered with the keyboard alone. The score is the share
// of haunted pieces fixed at the first try, averaged with the hits against the boss; 70%
// with the ghost defeated finishes the game, which reports `house-finished` (the big
// celebration and the certificate live elsewhere).
//
// The first time the house unlocks, a creepy sequence plays over the desktop before its
// card shows up: photosensitivity-safe flicker (under three flashes a second), a drone and
// thunder from the Web Audio API and a pixel ghost slowly emerging. It can be skipped, and
// prefers-reduced-motion gets a calm version. ?casa unlocks the game for testing and
// ?casa-intro forces the unlock sequence.
(() => {
  const get = id => document.getElementById(id);
  const section = get("house-game");
  const card = get("house-card");
  const play = get("play-house");
  const cardStatus = get("house-card-status");
  const library = get("game-library");
  const solo = get("games-solo");
  const gamesWindow = get("games-window");
  if (!section || !card || !play) return;

  const keys = {
    done: "front-arcade.casa-assombrada.completed.v1",
    revealed: "front-arcade.casa-assombrada.revealed.v1",
    progress: "front-arcade.casa-assombrada.progress.v1",
    lights: "front-arcade.casa-assombrada.lights.v1",
    previous: "front-arcade.labirinto-tab.completed.v1",
  };
  const params = new URLSearchParams(location.search);
  const testing = params.has("casa");
  const forceIntro = params.has("casa-intro");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;
  const passing = 70;
  const fullCourage = 5;

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));
  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("stopped"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); reject(new Error("stopped")); }, { once: true });
  });
  const esc = text => String(text).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const animate = (element, frames, options) => (!element || reduceMotion.matches ? null : element.animate(frames, options));
  const shuffle = list => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const flag = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };
  const setFlag = key => {
    try { localStorage.setItem(key, "true"); } catch { /* Only a preference. */ }
  };

  /* ---------- Pixel art ---------- */

  const pixelSvg = (rows, colours, className = "") => {
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (colours[key]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colours[key]}"/>`;
    }));
    return `<svg class="${className}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  };
  const ghostRows = [
    ".....wwwwww.....",
    "...wwwwwwwwww...",
    "..wwwwwwwwwwww..",
    ".wwwwwwwwwwwwwws",
    ".wwweewwwweewwws",
    ".wwweeewweeewwws",
    ".wwwwwwwwwwwwwws",
    "wwwwwwmmmmwwwwws",
    "wwwwwmmmmmmwwwws",
    "wwwwwwwwwwwwwwss",
    "wwwwwwwwwwwwwwss",
    "ww.www..www.www.",
    "w...ww....ww..w.",
  ];
  const ghost = (className = "", eyes = "#24123f", body = "#ece6ff", shade = "#bdb0f0") => pixelSvg(ghostRows, { w: body, s: shade, e: eyes, m: "#24123f" }, `house-ghost ${className}`);
  // The boss: the same ghost, angrier, in violet, with a crown of tangled cables.
  const bossRows = [
    "..y..y..y..y..y.",
    "..yy.yy.yy.yy.y.",
    ".....wwwwww.....",
    "...wwwwwwwwww...",
    "..wwwwwwwwwwww..",
    ".wweewwwwwweewws",
    ".wwweewwwweewwws",
    ".wwweeewweeewwws",
    ".wwwwwwwwwwwwwws",
    "wwwwwmmmmmmwwwws",
    "wwwwmmwmmwmmwwws",
    "wwwwwwwwwwwwwwss",
    "wwwwwwwwwwwwwwss",
    "ww.www..www.www.",
    "w...ww....ww..w.",
  ];
  // The face that rises in the unlock sequence: hollow glowing eyes under angry brows,
  // a jagged grin and a dripping hem.
  const faceRows = [
    "......wwwwwwww......",
    "....wwwwwwwwwwww....",
    "...wwwwwwwwwwwwwww..",
    "..wwwwwwwwwwwwwwwww.",
    ".wwwbbwwwwwwwwbbwwww",
    ".wwwwbbwwwwwwbbwwwww",
    ".wwweeeewwwweeeewwww",
    ".wwweeeewwwweeeewwww",
    ".wwwweewwwwwweewwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwwwmmmmmmmmmmmwwwww",
    "wwwwmwmwmwmwmwmwwwww",
    "wwwwwmmmmmmmmmwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "www.wwww..wwww.wwww.",
    "w....ww....ww....ww.",
    ".....w......w.......",
  ];
  const scaryFace = () => pixelSvg(faceRows, { w: "#d9d0ff", b: "#1a0f2e", e: "#8ffcf0", m: "#1a0f2e" }, "house-face");
  // The house itself, for the ending: lit windows when it is free.
  const houseArt = free => pixelSvg(["....nn....", "...nppn...", "..nppppn..", ".nnnnnnnn.", ".npyppypn.", ".nppppppn.", ".nppnnppn.", ".nnnnnnnn."], { n: "#1a0f2e", p: free ? "#8b6fe0" : "#3a2d5c", y: free ? "#ffe08a" : "#6b4fa0" }, `house-end-house${free ? " is-free" : ""}`);
  // The mansion of the unlock scene: two crooked towers, a pointed roof, windows that
  // light up one by one, and the door the ghost comes out of.
  function mansion() {
    const r = (x, y, width, height, fill, extra = "") => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"${extra}/>`;
    const [wall, dark, roof, trim] = ["#2a1f45", "#120a22", "#1a1230", "#4a3a78"];
    const spire = (cx, top, rows) => Array.from({ length: rows }, (_, index) => r(cx - index, top + index, index * 2 + 1, 1, roof)).join("");
    let art = spire(8, 1, 7) + spire(36, 0, 7) + r(27, 3, 2, 6, roof) + spire(22, 3, 10);
    art += r(3, 8, 11, 20, wall) + r(31, 7, 11, 21, wall) + r(11, 12, 22, 16, wall);
    art += r(3, 8, 11, 1, trim) + r(31, 7, 11, 1, trim) + r(11, 12, 22, 1, trim) + r(13, 27, 18, 1, trim);
    art += r(0, 28, 44, 2, dark) + r(18, 27, 8, 1, "#3a2d5c");
    for (const [x, y] of [[6, 11], [6, 19], [34, 10], [34, 17], [14, 15], [27, 15], [14, 21], [27, 21], [21, 8]]) {
      art += r(x - .5, y - .5, 4, 4, dark) + r(x, y, 3, 3, "#0d0818", ' class="haunt-window"') + r(x + 1, y, 1, 3, dark) + r(x, y + 1, 3, 1, dark);
    }
    art += r(19, 19, 6, 9, dark) + r(20, 20, 4, 8, "#3b2414", ' class="haunt-door"') + r(23, 24, 1, 1, "#f6c445", ' class="haunt-knob"');
    for (const x of [1, 5, 38, 42]) art += r(x, 25, 1, 3, dark) + r(x - .5, 24, 2, 1, dark);
    return `<svg class="haunt-mansion" viewBox="0 0 44 30" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${art}</svg>`;
  }
  const bossSprite = () => pixelSvg(bossRows, { w: "#b9a2ff", s: "#8b6fe0", e: "#ff5c8a", m: "#1a0f2e", y: "#f6c445" }, "house-boss-sprite");
  const heart = full => pixelSvg([".nn.nn.", "nrrnrrn", "nrrrrrn", ".nrrrn.", "..nrn..", "...n..."], { n: "#1d1033", r: full ? "#ff5c8a" : "#43325f" }, "house-heart");
  const chest = () => pixelSvg([".nnnnnnnn.", "nbbbbbbbbn", "nbBBBBBBbn", "nnnnyynnnn", "nbbbyybbbn", "nbbbbbbbbn", "nbbbbbbbbn", "nnnnnnnnnn"], { n: "#3b2414", b: "#8a5a2b", B: "#b07a42", y: "#f6c445" }, "house-chest");
  const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const trashIcon = icon("M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6");
  const archiveIcon = icon("M3 4h18v4H3ZM5 8v12h14V8M10 12h4");

  // Pepi as a nervous ghost hunter: a headlamp and a torch with its beam, over his grid.
  function outfit() {
    const r = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    const ink = "#3b2838";
    const band = r(9, 7, 30, 3, ink) + r(10, 8, 28, 1, "#6b4fa0");
    const lamp = r(20, 2, 8, 7, ink) + r(21, 3, 6, 5, "#cfd6e2") + r(22, 4, 4, 3, "#ffe08a");
    const torch = r(35, 29, 10, 5, ink) + r(36, 30, 8, 3, "#9aa3b5") + r(44, 28, 3, 7, ink) + r(45, 29, 1, 5, "#ffe08a");
    const beam = '<polygon points="47,28 62,20 62,43 47,35" fill="#ffe08a" opacity=".28"/>';
    return `<g class="house-outfit">${band}${lamp}${torch}${beam}</g>`;
  }

  /* ---------- The rooms ---------- */

  // Each piece: what it looks like, an aria label that describes how it looks, and either
  // a note (when it is fine) or its haunting: name, why it is bad and three fixes, the
  // first one right, each with its reason. `fixed` is how it looks once exorcised.
  const fix = (text, reason, ok = false) => ({ text, reason, ok });
  const rooms = [
    {
      key: "hall", name: "Hall de entrada", topic: "Cor e contraste", from: "Olhar Afiado", site: "bailedemascaras.com",
      brief: "O convite do baile está cheio de coisas que não se leem direito. Passe a lanterna e ache o que está assombrado.",
      layout: s => `<div class="m-hero">${s("h-title")}${s("h-faint")}</div><div class="m-row">${s("h-field")}${s("h-buy")}</div><p class="m-text">Dúvidas? ${s("h-link")}</p>`,
      pieces: {
        "h-title": { label: "Título “Baile de Máscaras”, escuro sobre fundo claro", look: '<span class="m-title">Baile de Máscaras</span>', note: "Título escuro sobre fundo claro: contraste de sobra." },
        "h-faint": {
          label: "Texto cinza-claro sobre fundo cinza: Inscrições só até sexta-feira", look: '<span class="m-text is-faint">Inscrições só até sexta-feira</span>', fixed: '<span class="m-text is-strong">Inscrições só até sexta-feira</span>',
          name: "Texto fantasma", why: "Cinza-claro sobre cinza: o contraste fica muito abaixo de 4,5:1. Quem tem baixa visão, ou está no sol, simplesmente não lê.",
          fixes: [fix("Escurecer o texto até o contraste passar de 4,5:1", "Com contraste suficiente, todo mundo lê, em qualquer tela.", true), fix("Deixar o texto em itálico", "Itálico não muda o contraste: o texto continua sumindo."), fix("Deixar o texto mais transparente", "Mais transparência deixa tudo ainda mais apagado.")],
        },
        "h-field": {
          label: "Campo de e-mail com a borda vermelha e nenhuma mensagem", look: '<span class="m-field is-red"><small>E-mail</small><span>pepi@casa</span></span>', fixed: '<span class="m-field is-error"><small>E-mail</small><span>pepi@casa</span><em>⚠ Falta o final, como “.com”.</em></span>',
          name: "Só a cor avisa", why: "O erro aparece só como uma borda vermelha. Quem não distingue vermelho, ou usa leitor de tela, nem percebe que algo deu errado.",
          fixes: [fix("Somar um ícone e uma mensagem em texto ao vermelho", "A cor ajuda, mas o texto e o ícone garantem que todo mundo entenda.", true), fix("Usar um vermelho ainda mais forte", "Mais forte ou não, continua sendo só cor."), fix("Fazer a borda piscar", "Piscar incomoda e ainda não explica qual é o erro.")],
        },
        "h-buy": { label: "Botão “Comprar ingresso”, texto branco sobre roxo escuro", look: '<span class="m-btn">Comprar ingresso</span>', note: "Texto branco sobre roxo escuro: legível e com cara de botão." },
        "h-link": {
          label: "Link “fale com a gente”, da mesma cor do texto e sem sublinhado", look: '<span class="m-link is-camo">fale com a gente</span>', fixed: '<span class="m-link">fale com a gente</span>',
          name: "Link camuflado", why: "O link tem a mesma cor do texto e nenhum sublinhado. Ninguém adivinha que dá para clicar.",
          fixes: [fix("Sublinhar o link e dar a ele uma cor com contraste", "Sublinhado e cor própria: o link se apresenta sozinho.", true), fix("Deixar em negrito, igual aos destaques do texto", "Negrito também marca destaque comum: não diz “clique aqui”."), fix("Mostrar o sublinhado só quando o mouse passar", "Quem usa toque ou teclado nunca vai ver.")],
        },
      },
    },
    {
      key: "biblioteca", name: "Biblioteca", topic: "Formulários sem atrito", from: "Os Pop-ups Infinitos", site: "clubedolivro.com",
      brief: "O formulário do Clube do Livro esconde armadilhas para a pessoa aceitar o que não quer.",
      layout: s => `<div class="m-hero">${s("b-title")}</div>${s("b-name")}${s("b-check")}<div class="m-row">${s("b-join")}${s("b-shame")}</div><div class="m-float">${s("b-pop")}</div>`,
      pieces: {
        "b-title": { label: "Título “Clube do Livro Assombrado”", look: '<span class="m-title">Clube do Livro Assombrado</span>', note: "Um título direto: nada de errado aqui." },
        "b-name": { label: "Campo “Seu nome”, com rótulo visível em cima", look: '<span class="m-field"><small>Seu nome</small><span>Pepi Bolota</span></span>', note: "Campo com rótulo visível: tudo certo." },
        "b-check": {
          label: "Caixa já marcada: Quero receber 12 e-mails por dia", look: '<span class="m-check is-on"><i>✓</i>Quero receber 12 e-mails por dia</span>', fixed: '<span class="m-check"><i></i>Quero receber novidades por e-mail</span>',
          name: "Caixa já marcada", why: "A caixa veio marcada: o site decidiu pela pessoa, que nem percebe que aceitou.",
          fixes: [fix("Deixar a caixa desmarcada, para a pessoa escolher", "Consentimento é algo que a pessoa dá, não algo que o site presume.", true), fix("Escrever o aviso em letra menor", "Letra pequena esconde ainda mais a armadilha."), fix("Marcar e travar a caixa", "Aí a pessoa nem consegue recusar.")],
        },
        "b-join": { label: "Botão “Entrar no clube”", look: '<span class="m-btn">Entrar no clube</span>', note: "Uma ação principal, clara e única." },
        "b-shame": {
          label: "Link de recusa: Não, prefiro continuar lendo pouco", look: '<span class="m-link is-muted">Não, prefiro continuar lendo pouco</span>', fixed: '<span class="m-link is-muted">Não, obrigado</span>',
          name: "Vergonha na recusa", why: "A opção de recusar tenta envergonhar a pessoa. Esse padrão sombrio tem nome: confirmshaming.",
          fixes: [fix("Trocar por um “Não, obrigado” neutro", "Recusar precisa ser tão tranquilo quanto aceitar.", true), fix("Deixar a frase ainda mais engraçada", "Com piada ou sem, continua culpando quem recusa."), fix("Tirar a opção de recusar", "Sem saída, a pessoa se sente encurralada.")],
        },
        "b-pop": {
          label: "Janela que surge no meio do formulário, sem botão de fechar", look: '<span class="m-pop"><b>Espera! Não vá!</b><small>Assine antes de continuar</small></span>', fixed: '<span class="m-pop is-gentle"><b>Inscrição feita!</b><small>Quer dicas de leitura? <u>Fechar</u></small></span>',
          name: "Pop-up sem fim", why: "A janela interrompe no meio do preenchimento e não tem como fechar. A pessoa perde o que estava fazendo.",
          fixes: [fix("Não interromper: oferecer depois do envio, com botão de fechar", "Respeita a tarefa da pessoa e deixa a saída à vista.", true), fix("Reabrir a janela a cada 10 segundos", "Interromper mais só aumenta a irritação."), fix("Pôr o “fechar” num cantinho bem pequeno", "Um fechar escondido continua sendo armadilha.")],
        },
      },
    },
    {
      key: "cozinha", name: "Cozinha", topic: "Desempenho percebido", from: "Lag Lab", site: "pocoesdelivery.com",
      brief: "O delivery de poções demora, pula e não responde. Ache as esperas assombradas.",
      layout: s => `<div class="m-hero">${s("k-title")}</div>${s("k-shift")}<div class="m-row">${s("k-spin")}${s("k-order")}</div>${s("k-menu")}`,
      pieces: {
        "k-title": { label: "Título “Poções em 20 minutos”", look: '<span class="m-title">Poções em 20 minutos</span>', note: "Informação direta, sem espera nenhuma." },
        "k-shift": {
          label: "Lista de produtos que pula para baixo quando um anúncio carrega atrasado", look: '<span class="m-shift"><i>⇣ anúncio chegou atrasado</i><span class="m-card">Poção do sono · R$ 12</span></span>', fixed: '<span class="m-shift is-reserved"><i>espaço reservado</i><span class="m-card">Poção do sono · R$ 12</span></span>',
          name: "Tela que pula", why: "Uma imagem chega atrasada e empurra tudo para baixo. A pessoa mira numa coisa e acerta outra.",
          fixes: [fix("Reservar o espaço da imagem antes de ela carregar", "Com o lugar guardado, nada sai do lugar.", true), fix("Carregar o anúncio ainda mais tarde", "O pulo só muda de hora."), fix("Animar o pulo para ficar charmoso", "Animado ou não, o clique continua errando.")],
        },
        "k-spin": {
          label: "Indicador de carregamento girando sem fim, sem dizer quanto falta", look: '<span class="m-spin"><i class="m-spinner"></i>Carregando…</span>', fixed: '<span class="m-spin is-progress"><i class="m-bar"><b></b></i>Preparando sua poção · 2 de 3</span>',
          name: "Ampulheta eterna", why: "Um giro sem fim e sem pista de quanto falta faz a espera parecer o dobro.",
          fixes: [fix("Mostrar o progresso e o que está acontecendo", "Saber quanto falta acalma: a espera parece menor.", true), fix("Trocar por um ícone mais bonito", "Bonito ou não, continua sem informar nada."), fix("Esconder o carregamento e deixar a tela parada", "Tela parada parece travada.")],
        },
        "k-order": {
          label: "Botão “Pedir poção”, que não responde ao clique por 3 segundos", look: '<span class="m-btn">Pedir poção</span>', fixed: '<span class="m-btn is-busy">Pedindo…</span>',
          name: "Botão mudo", why: "O clique não dá resposta nenhuma por 3 segundos. A pessoa clica de novo e acaba pedindo duas poções.",
          fixes: [fix("Responder na hora: mostrar “Pedindo…” e bloquear o clique duplo", "Em até 100 ms a pessoa sabe que foi ouvida.", true), fix("Deixar como está, a resposta já vem", "Três segundos sem resposta parecem uma eternidade."), fix("Mostrar um aviso depois dos 3 segundos", "O aviso chega tarde demais.")],
        },
        "k-menu": { label: "Link “Ver cardápio”, que abre na hora", look: '<span class="m-link">Ver cardápio</span>', note: "Responde na hora: tudo certo." },
      },
    },
    {
      key: "jantar", name: "Sala de jantar", topic: "Lei de Hick", from: "Garçom Relâmpago", site: "banquete.com",
      brief: "No banquete, escolher um prato virou um pesadelo. Ache o que atrapalha a decisão.",
      layout: s => `<div class="m-hero">${s("d-title")}${s("d-dots")}</div>${s("d-select")}${s("d-drinks")}${s("d-book")}`,
      pieces: {
        "d-title": { label: "Destaque “Prato do dia: sopa de abóbora”", look: '<span class="m-title">Prato do dia: sopa de abóbora</span>', note: "Uma recomendação clara ajuda a decidir rápido." },
        "d-dots": {
          label: "Menu de três pontinhos que esconde a busca e os filtros", look: '<span class="m-dots">⋯</span>', fixed: '<span class="m-filter">Buscar · Vegetariano · Sem glúten</span>',
          name: "Filtro escondido", why: "A busca e os filtros que ajudariam a decidir estão escondidos atrás de três pontinhos.",
          fixes: [fix("Deixar a busca e os filtros à vista no topo", "O que ajuda a decidir precisa estar à vista.", true), fix("Mover os três pontinhos para o rodapé", "Continua escondido, só que mais longe."), fix("Tirar os filtros de vez", "Sem filtro, a pessoa volta aos 40 pratos.")],
        },
        "d-select": {
          label: "Lista com 40 pratos de uma vez, sem categorias", look: '<span class="m-select"><b>Escolha seu prato (40 opções)</b><small>Abóbora assada · Abóbora cozida · Abóbora frita · Abóbora recheada · Abóbora…</small></span>', fixed: '<span class="m-select"><b>Mais pedidos</b><small>Sopa · Torta · Assado · <u>ver por categoria</u></small></span>',
          name: "Cardápio infinito", why: "Quarenta pratos de uma vez: cada opção a mais aumenta o tempo para decidir. É a Lei de Hick.",
          fixes: [fix("Agrupar por categoria e mostrar os mais pedidos primeiro", "Menos escolhas por vez, decisão mais rápida.", true), fix("Embaralhar os 40 a cada visita", "Continuam 40, e agora sem ordem."), fix("Dobrar para 80 opções", "Mais opções, mais tempo para decidir.")],
        },
        "d-drinks": {
          label: "Doze bebidas iguais, sem nenhuma sugestão", look: `<span class="m-chips">${["Chá", "Suco", "Café", "Água", "Leite", "Soda", "Mate", "Kefir", "Cidra", "Ponche", "Xarope", "Néctar"].map(name => `<i>${name}</i>`).join("")}</span>`, fixed: '<span class="m-chips"><i class="is-pick">★ Suco de amora · sugestão da casa</i><i>Chá</i><i>Água</i><i>ver todas</i></span>',
          name: "Sem sugestão", why: "Doze bebidas iguais e nenhuma sugestão: a pessoa precisa comparar tudo sozinha.",
          fixes: [fix("Destacar uma sugestão da casa como padrão", "Um bom padrão encurta a escolha.", true), fix("Deixar todas iguais, por justiça", "Justo com as bebidas, cansativo para a pessoa."), fix("Esconder as bebidas", "Aí não dá nem para escolher.")],
        },
        "d-book": { label: "Botão “Reservar mesa”", look: '<span class="m-btn">Reservar mesa</span>', note: "Uma ação principal e clara. Sem fantasmas." },
      },
    },
    {
      key: "quarto", name: "Quarto", topic: "Consistência", from: "Armadilha dos Hábitos Ruins", site: "caixao.app/config",
      brief: "Nas configurações do caixão, nada fica onde o hábito espera. Ache as pegadinhas.",
      layout: s => `${s("q-crumb")}${s("q-toggle")}<div class="m-row">${s("q-icon")}</div>${s("q-danger")}${s("q-modal")}`,
      pieces: {
        "q-crumb": { label: "Navegação “Conta › Preferências”", look: '<span class="m-crumb">Conta › Preferências</span>', note: "O mesmo caminho de navegação de sempre." },
        "q-toggle": { label: "Chave “Modo noturno”, ligada, com rótulo", look: '<span class="m-toggle"><i></i>Modo noturno</span>', note: "Rótulo claro e estado visível: tudo certo." },
        "q-icon": {
          label: "Ícone de lixeira que, nesta tela, arquiva em vez de apagar", look: `<span class="m-iconbtn">${trashIcon}<small>(aqui ele arquiva)</small></span>`, fixed: `<span class="m-iconbtn">${archiveIcon}Arquivar</span>`,
          name: "Ícone de duas caras", why: "A lixeira apaga em todo o site, mas aqui ela só arquiva. O mesmo ícone com dois sentidos engana o hábito.",
          fixes: [fix("Um ícone para cada significado, com rótulo em texto", "Ícone consistente e texto: sem adivinhação.", true), fix("Trocar a lixeira por uma caveira", "Assusta mais e explica menos."), fix("Explicar num tutorial de 10 telas", "Ninguém lê, e o ícone continua mentindo.")],
        },
        "q-danger": {
          label: "“Apagar tudo” em verde chamativo e “Salvar” em cinza apagado", look: '<span class="m-row"><span class="m-btn is-green">Apagar tudo</span><span class="m-btn is-grey">Salvar</span></span>', fixed: '<span class="m-row"><span class="m-btn is-danger">Apagar tudo</span><span class="m-btn">Salvar</span></span>',
          name: "Perigo disfarçado", why: "A ação destrutiva ganhou a cor principal e convidativa, e o Salvar ficou apagado. Parece que o caminho certo é apagar.",
          fixes: [fix("Estilo de perigo para apagar, cor principal para salvar", "Cada cor no seu papel, sempre.", true), fix("Pintar os dois de verde", "Iguais, ninguém sabe qual é perigoso."), fix("Tirar todas as cores", "Sem hierarquia, o risco fica escondido.")],
        },
        "q-modal": {
          label: "Janela “Apagar conta?” com o Confirmar à esquerda, fora do lugar de sempre", look: '<span class="m-modal"><b>Apagar conta?</b><span class="m-row"><span class="m-btn is-danger">Confirmar</span><span class="m-btn is-ghost">Cancelar</span></span></span>', fixed: '<span class="m-modal"><b>Apagar conta?</b><span class="m-row"><span class="m-btn is-ghost">Cancelar</span><span class="m-btn is-danger">Confirmar</span></span></span>',
          name: "Botões trocados", why: "Em todo o site o Confirmar fica à direita. Aqui ele trocou de lugar, e o hábito leva ao clique errado, numa ação sem volta.",
          fixes: [fix("Manter a mesma posição dos botões em todo o site", "Consistência faz o hábito trabalhar a favor.", true), fix("Trocar de lugar a cada tela, para a pessoa prestar atenção", "Isso transforma cada clique numa armadilha."), fix("Deixar os dois botões iguais", "Sem diferença, o erro fica ainda mais fácil.")],
        },
      },
    },
    {
      key: "porao", name: "Porão", topic: "Semântica e estados vazios", from: "Tela em Obras", site: "arquivo.casa/baus",
      brief: "No arquivo do porão, as peças parecem certas, mas os crachás mentem. Ache as falsas.",
      layout: s => `${s("p-title")}<div class="m-row">${s("p-img")}${s("p-fake")}</div>${s("p-empty")}${s("p-help")}`,
      pieces: {
        "p-title": { label: "Título nível 2 “Seus baús”", look: '<span class="m-title">Seus baús</span>', note: "Um título de verdade, no nível certo." },
        "p-img": {
          label: "Imagem de um baú sem descrição: o leitor de tela lê o nome do arquivo", look: `<span class="m-img">${chest()}<small>bau-final-v2.png</small></span>`, fixed: `<span class="m-img">${chest()}<small>“Baú de madeira trancado”</small></span>`,
          name: "Imagem sem crachá", why: "A imagem não tem descrição, então o leitor de tela lê o nome do arquivo: “bau final v2 ponto png”.",
          fixes: [fix("Descrever o que a imagem mostra, ou marcar como enfeite", "O leitor de tela passa a contar o que a imagem mostra.", true), fix("Renomear o arquivo para bau.png", "Melhorou o nome, mas ainda não é descrição."), fix("Escrever a descrição dentro da imagem", "Texto dentro da imagem também não é lido.")],
        },
        "p-fake": {
          label: "“Abrir baú”, que parece botão, mas é só uma caixa pintada", look: '<span class="m-btn is-fake">Abrir baú</span>', fixed: '<span class="m-btn">Abrir baú</span>',
          name: "Botão de mentira", why: "É uma div pintada de botão: o teclado não chega nela, e o leitor de tela não avisa que dá para clicar.",
          fixes: [fix("Trocar por um botão de verdade", "Um botão de verdade já vem com teclado e crachá.", true), fix("Pintar a div de uma cor mais forte", "A cor não muda o que o leitor de tela sabe."), fix("Colocar o cursor de mãozinha", "Só quem usa mouse percebe a mãozinha.")],
        },
        "p-empty": {
          label: "Lista vazia que diz apenas “ERRO: 0 itens”", look: '<span class="m-empty is-cold">ERRO: 0 itens</span>', fixed: '<span class="m-empty"><b>Nenhum baú por aqui ainda</b><small>Os baús que você guardar aparecem aqui.</small><u>Guardar o primeiro baú</u></span>',
          name: "Vazio gelado", why: "O vazio fala como máquina e não diz o que fazer agora.",
          fixes: [fix("Explicar por que está vazio e oferecer o próximo passo", "Um vazio gentil orienta em vez de assustar.", true), fix("Trocar por “ERRO 404”", "Outro código, o mesmo susto."), fix("Deixar a tela em branco", "Tudo em branco parece que quebrou.")],
        },
        "p-help": { label: "Link “Precisa de ajuda?”, sublinhado", look: '<span class="m-link">Precisa de ajuda?</span>', note: "Um link de verdade, com sublinhado: tudo certo." },
      },
    },
    {
      key: "sotao", name: "Sótão", topic: "Teclado e foco", from: "Labirinto do Tab", site: "sotao.casa",
      brief: "No sótão, quem navega só pelo teclado se perde. Ache o que prende e o que some.",
      layout: s => `${s("s-skip")}${s("s-menu")}<div class="m-row">${s("s-ghostlink")}${s("s-ring")}</div>${s("s-trap")}`,
      pieces: {
        "s-skip": { label: "Link “Pular para o conteúdo”, visível com o foco", look: '<span class="m-skip">Pular para o conteúdo</span>', note: "Um atalho que aparece com o foco: ótimo para quem usa teclado." },
        "s-menu": { label: "Menu em ordem: Início, Fotos, Diário", look: '<span class="m-crumb">Início · Fotos · Diário</span>', note: "A ordem do foco é a mesma ordem da tela." },
        "s-ghostlink": {
          label: "Área vazia onde um link invisível recebe o foco", look: '<span class="m-invisible" aria-hidden="true"> </span>', fixed: '<span class="m-invisible is-gone">nada aqui</span>',
          name: "Link invisível", why: "Um link invisível continua recebendo foco: o foco some da tela, e a pessoa fica perdida.",
          fixes: [fix("Tirar do caminho do Tab tudo o que não está visível", "O que não aparece não pode receber foco.", true), fix("Deixar o link transparente", "Transparente continua no caminho do Tab."), fix("Mover o link para fora da tela", "Fora da tela, o foco some do mesmo jeito.")],
        },
        "s-ring": {
          label: "Botão “Abrir o baú do sótão” com o contorno de foco removido", look: '<span class="m-btn is-noring">Abrir o baú do sótão</span>', fixed: '<span class="m-btn is-ring">Abrir o baú do sótão</span>',
          name: "Foco sem contorno", why: "O contorno de foco foi apagado. Quem navega pelo teclado não sabe onde está.",
          fixes: [fix("Manter um contorno de foco bem visível", "O foco visível é o mapa de quem usa teclado.", true), fix("Trocar por uma sombra quase invisível", "Sutil demais: ninguém vê."), fix("Mostrar o foco só para quem usa mouse", "É justamente o teclado que precisa dele.")],
        },
        "s-trap": {
          label: "Janela “Assine o boletim do sótão”, sem botão de fechar: o Tab só gira dentro dela", look: '<span class="m-modal"><b>Assine o boletim do sótão</b><small>Tab: Assinar → Assinar → Assinar…</small></span>', fixed: '<span class="m-modal"><b>Assine o boletim do sótão</b><span class="m-row"><span class="m-btn">Assinar</span><span class="m-btn is-ghost">Fechar ✕</span></span></span>',
          name: "Janela sem saída", why: "O foco entra na janela e não sai mais: não há botão de fechar ao alcance do teclado.",
          fixes: [fix("Um fechar alcançável, devolvendo o foco ao sair", "Presa só enquanto a pessoa quiser: a saída está sempre ali.", true), fix("Prender o foco com ainda mais força", "Uma armadilha mais forte ainda é armadilha."), fix("Fechar sozinha depois de um minuto", "Um minuto preso é tempo demais.")],
        },
      },
    },
  ];
  for (const room of rooms) {
    room.haunted = Object.entries(room.pieces).filter(([, piece]) => piece.fixes).map(([id]) => id);
    for (const [id, piece] of Object.entries(room.pieces)) Object.assign(piece, { id, room: room.key });
  }
  // "do hall", "da cozinha": the right contraction for each room's name.
  const of = { hall: "do", biblioteca: "da", cozinha: "da", jantar: "da", quarto: "do", porao: "do", sotao: "do" };
  const allHaunts = rooms.flatMap(room => room.haunted.map(id => room.pieces[id]));
  const roomByKey = Object.fromEntries(rooms.map(room => [room.key, room]));

  /* ---------- Pepi, the ghost hunter ---------- */

  const voice = {
    houseHello: { text: "Ai, ai… A Casa do Dark UX. Eu trouxe a lanterna; você traz a coragem. Combinado?", face: "oops" },
    houseRoom: { text: "Mais um cômodo. Passa a lanterna devagar e procura o que está assombrado.", face: "wide" },
    houseFound: { text: "Achou uma assombração! Agora escolhe o conserto certo.", face: "wink" },
    houseScared: { text: "Aaai! Que susto. Cuidado, que a coragem está acabando!", face: "oops" },
    houseCleared: { text: "Cômodo limpo! As luzes voltaram.", face: "laugh" },
    houseFled: { text: "A coragem acabou… Respira fundo e tenta esse cômodo de novo.", face: "squint" },
    houseBoss: { text: "Ele chegou! O Fantasma do Dark UX! Ele mistura tudo de ruim que a gente viu. Bora!", face: "wide" },
    houseBossHit: { text: "Acertou em cheio! Ele sentiu essa.", face: "laugh" },
    houseWin: { text: "A casa está livre! Nenhum padrão sombrio sobreviveu à sua lanterna.", face: "star" },
    houseRetry: { text: "Ele caiu, mas a casa ainda não está limpa. Pra vencer, a média precisa chegar a setenta por cento.", face: "oops" },
  };

  // The Fantasma do Dark UX speaks too, in a voice of its own (recorded separately).
  const ghostLines = {
    ghostWake: "Hahaha! Então você escapou do labirinto? Que gracinha. Venha me visitar na minha casa… se tiver coragem!",
    ghostBoss: "Hahaha! Quem ousa subir até o meu torreão? Aqui todo botão engana e toda tela confunde. Vamos ver se você escapa!",
    ghostPhase: "Chega de brincadeira! Agora eu embaralho tudo, e o seu mouse vai trabalhar pra mim! Hahaha!",
    ghostDefeat: "Nããão! Botões honestos… telas claras… eu… estou… desaparecendo!",
    ghostWin: "Hahaha! A sua coragem acabou. Volte quando a sua lanterna brilhar mais!",
    // Short cries when a fix lands. One is picked at random, never the same twice in a row.
    ghostHurt1: "Ai!",
    ghostHurt2: "Urgh!",
    ghostHurt3: "Aaargh, isso doeu!",
    ghostHurt4: "Nããão, minhas pegadinhas!",
    ghostHurt5: "Uurgh! Você vai pagar por isso!",
  };
  const hurtLines = ["ghostHurt1", "ghostHurt2", "ghostHurt3", "ghostHurt4", "ghostHurt5"];

  /* ---------- The markup ---------- */

  const lightIcon = icon("M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z");
  section.innerHTML = `
    <div class="color-game-header house-header">
      <div><h2 id="house-title" tabindex="-1">A Casa Assombrada do Dark UX</h2><p>O desafio final: limpe sete cômodos e enfrente o fantasma que mistura todos os maus padrões.</p></div>
      <div class="house-header-tools">
        <button id="house-lights" class="house-lights" type="button" aria-pressed="false">${lightIcon}<span>Acender as luzes</span></button>
        <button id="back-from-house" class="secondary-button" type="button">Voltar aos jogos</button>
      </div>
    </div>
    <div class="house-porch">
      <div class="house-host"></div>
      <p class="house-bubble" aria-live="polite" hidden><strong>Pepi Bolota</strong><span class="house-bubble-text"></span></p>
      <span class="house-moon" aria-hidden="true"></span>
      <span class="house-bats" aria-hidden="true">${ghost("is-tiny")}</span>
    </div>

    <div id="house-intro" class="house-intro">
      <div class="house-intro-lead">
        <h3>Sete cômodos, um fantasma e a sua lanterna</h3>
        <p>Tudo o que você aprendeu nos outros jogos mora nesta casa, agora assombrado por padrões sombrios: as escolhas de design que enganam, cansam ou excluem as pessoas. Cada cômodo é um site no escuro. Ilumine, encontre o que está assombrado e escolha o conserto certo.</p>
      </div>
      <ol class="house-rules">
        <li><span aria-hidden="true">${icon("M9 18h6M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z")}</span><p><strong>Lanterna.</strong> Mova o mouse, ou use o Tab, para iluminar a tela. Cada peça pode ser examinada.</p></li>
        <li><span aria-hidden="true">${icon("M12 3a7 7 0 0 0-7 7v10l2.3-1.6L9.7 20 12 18.4l2.3 1.6 2.4-1.6L19 20V10a7 7 0 0 0-7-7ZM9.5 10h.01M14.5 10h.01")}</span><p><strong>Assombrações.</strong> Três por cômodo. Ao achar uma, escolha entre três consertos: só um é certo.</p></li>
        <li><span aria-hidden="true">${heart(true)}</span><p><strong>Coragem.</strong> Cinco corações por tentativa. Examinar uma peça sem problema ou errar o conserto custa um.</p></li>
        <li><span aria-hidden="true">${ghost("is-mini")}</span><p><strong>O fantasma.</strong> Depois do sótão, ele ataca com tudo, contra o relógio. Média de 70% para libertar a casa.</p></li>
      </ol>
      <div class="house-start">
        <p class="house-goal">A nota conta os consertos acertados de primeira e os golpes no fantasma.</p>
        <button id="house-enter" class="primary-button house-cta" type="button">Entrar na casa</button>
      </div>
    </div>

    <div id="house-map" class="house-map-view" hidden>
      <div class="house-map-head">
        <div><h3 id="house-map-title" tabindex="-1">Planta da casa</h3><p id="house-map-note" class="house-muted"></p></div>
        <div class="house-map-tools"><span id="house-map-score" class="house-score-chip"></span><button id="house-reset" class="house-link-button" type="button">Recomeçar a casa</button></div>
      </div>
      <div class="house-plan">
        <div class="house-roof" aria-hidden="true"></div>
        <div id="house-plan-grid" class="house-plan-grid"></div>
      </div>
    </div>

    <div id="house-room" class="house-room-view" hidden>
      <div class="house-room-head">
        <div>
          <p class="house-kicker"><span id="house-room-topic"></span></p>
          <h3 id="house-room-title" tabindex="-1"></h3>
          <p id="house-room-brief" class="house-muted"></p>
        </div>
        <div class="house-room-status">
          <span id="house-room-hearts" class="house-hearts"></span>
          <span id="house-room-found" class="house-found"></span>
          <button id="house-to-map" class="house-link-button" type="button">Voltar à planta</button>
        </div>
      </div>
      <div class="house-room-body">
        <div class="house-screen-wrap">
          <div id="house-screen" class="house-screen">
            <div class="house-browser"><i></i><i></i><i></i><span id="house-url"></span></div>
            <div id="house-page" class="house-page"></div>
            <div class="house-dark" aria-hidden="true"></div>
          </div>
          <p class="house-screen-hint house-muted">Mova o mouse ou use o Tab para iluminar. Clique ou aperte Enter para examinar.</p>
        </div>
        <aside id="house-notes" class="house-notes" aria-labelledby="house-notes-title" tabindex="-1">
          <h4 id="house-notes-title">Caderno do caça-fantasmas</h4>
          <div id="house-notes-body"></div>
        </aside>
      </div>
    </div>

    <div id="house-boss" class="house-boss-view" hidden>
      <div class="house-arena" id="house-arena">
        <div class="house-arena-bg" aria-hidden="true">
          <span class="bg-pop">Espera! Não vá!</span><span class="bg-faint">texto que ninguém lê</span><span class="bg-spin"></span>
          <span class="bg-chips">40 opções · 40 opções</span><span class="bg-trash">${trashIcon}</span><span class="bg-err">ERRO: 0 itens</span>
        </div>
        <div class="house-boss-top">
          <div class="house-boss-name"><strong>O Fantasma do Dark UX</strong><span id="house-boss-phase"></span></div>
          <div class="house-hp" role="meter" aria-label="Vida do fantasma" aria-valuemin="0" aria-valuemax="9" id="house-hp"><i id="house-hp-fill"></i></div>
          <span id="house-boss-hearts" class="house-hearts"></span>
        </div>
        <div class="house-boss-stage">
          <div id="house-boss-ghost" class="house-boss-ghost">${bossSprite()}</div>
          <p id="house-taunt" class="house-taunt" aria-live="polite"></p>
        </div>
        <div id="house-attack" class="house-attack" tabindex="-1" aria-labelledby="house-attack-name">
          <div class="house-attack-head"><span class="house-kicker" id="house-attack-from"></span><h3 id="house-attack-name"></h3></div>
          <p id="house-attack-why" class="house-attack-why"></p>
          <div class="house-timer" aria-hidden="true"><i id="house-timer-bar"></i></div>
          <p id="house-attack-warn" class="house-attack-warn" hidden></p>
          <div id="house-attack-options" class="house-options" role="group" aria-label="Consertos"></div>
          <p id="house-attack-result" class="house-attack-result" aria-live="polite"></p>
        </div>
      </div>
    </div>

    <div id="house-end" class="house-end" hidden>
      <div class="house-end-art" aria-hidden="true"></div>
      <h3 id="house-end-title" tabindex="-1"></h3>
      <p id="house-end-verdict" class="house-end-verdict" role="status"></p>
      <div class="house-end-row"><div id="house-end-score" class="house-end-score"></div><div id="house-end-bars" class="house-end-bars"></div></div>
      <p class="house-end-lesson">Padrões sombrios funcionam porque exploram o atalho do cérebro: a pressa, o hábito, a vergonha, o que a gente não consegue ver. Um bom design faz o contrário: deixa o caminho visível, previsível e gentil para todas as pessoas.</p>
      <div id="house-end-actions" class="house-end-actions"></div>
    </div>
    <p id="house-live" class="visually-hidden" aria-live="polite"></p>`;

  const $ = selector => section.querySelector(selector);
  const views = { intro: get("house-intro"), map: get("house-map"), room: get("house-room"), boss: get("house-boss"), end: get("house-end") };
  const host = $(".house-host");
  const bubble = $(".house-bubble");
  const bubbleText = $(".house-bubble-text");
  const screen = get("house-screen");
  const page = get("house-page");
  const notes = get("house-notes-body");
  const live = get("house-live");
  const speak = text => { live.textContent = text; };

  function show(name) {
    for (const [key, view] of Object.entries(views)) view.hidden = key !== name;
    section.dataset.view = name;
  }

  /* ---------- Pepi's voice ---------- */

  let pepi = null;
  function buildHost() {
    if (pepi || !P()?.markup) return;
    host.innerHTML = `<div class="pepi house-pepi" data-face="oops">${P().markup()}<svg class="house-props" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true" overflow="visible">${outfit()}</svg></div>`;
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
        await wait(1500 + line.text.length * 25, controller.signal);
      }
    } catch {
      // Cut short by the next line or by leaving the game.
    } finally {
      if (pepi && talk === controller) pepi.dataset.face = "oops";
    }
  }
  // Plays a ghost line (if recorded) and types its caption into `target`. Resolves when
  // both are done; rejects if `signal` aborts.
  async function ghostVoice(id, signal) {
    const clip = P()?.soundOn ? await clipFor(id) : null;
    const context = P()?.audioContext?.();
    if (!clip || !context || signal?.aborted) return false;
    context.resume?.();
    const source = context.createBufferSource();
    source.buffer = clip;
    source.connect(context.destination);
    const ended = new Promise(resolve => { source.onended = resolve; });
    signal?.addEventListener("abort", () => { try { source.stop(); } catch { /* Already over. */ } }, { once: true });
    source.start();
    await ended;
    return true;
  }
  let ghostSpeaking = 0; // a longer line is playing: the cries of pain stay silent
  async function ghostTalk(id, target, signal) {
    const text = ghostLines[id];
    target.textContent = "";
    ghostSpeaking += 1;
    try {
      const typing = P()?.typewrite ? P().typewrite(text, signal, target) : Promise.resolve(target.textContent = text);
      const [spoken] = await Promise.all([ghostVoice(id, signal), typing]);
      if (!spoken) await wait(900 + text.length * 32, signal);
    } finally {
      ghostSpeaking -= 1;
    }
  }

  // The sound of a hit: a dull thump of filtered noise and a ghostly wail sliding down,
  // with a wobble. Synthesised, so it plays even before any cry is recorded.
  function hurtSound() {
    if (!P()?.soundOn) return;
    const context = P().audioContext?.();
    if (!context) return;
    context.resume?.();
    const now = context.currentTime;
    const length = .18;
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * length), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length) ** 3;
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    const band = context.createBiquadFilter();
    band.type = "lowpass";
    band.frequency.value = 900;
    const thump = context.createGain();
    thump.gain.value = .55;
    noise.connect(band).connect(thump).connect(context.destination);
    noise.start(now);
    const wail = context.createOscillator();
    wail.type = "triangle";
    wail.frequency.setValueAtTime(720, now + .03);
    wail.frequency.exponentialRampToValueAtTime(170, now + .55);
    const wobble = context.createOscillator();
    wobble.frequency.value = 11;
    const depth = context.createGain();
    depth.gain.value = 26;
    wobble.connect(depth).connect(wail.frequency);
    const voice = context.createGain();
    voice.gain.setValueAtTime(.0001, now);
    voice.gain.exponentialRampToValueAtTime(.22, now + .05);
    voice.gain.exponentialRampToValueAtTime(.0001, now + .6);
    wail.connect(voice).connect(context.destination);
    wail.start(now);
    wobble.start(now);
    wail.stop(now + .65);
    wobble.stop(now + .65);
  }

  // A hit: the sound, a cry (recorded if there is a clip) and the cry popping over it.
  let lastHurt = "";
  function hurt() {
    hurtSound();
    const pick = hurtLines.filter(id => id !== lastHurt);
    const id = pick[Math.floor(Math.random() * pick.length)];
    lastHurt = id;
    const stage = section.querySelector(".house-boss-stage");
    const pop = document.createElement("span");
    pop.className = "house-hurt-pop";
    pop.setAttribute("aria-hidden", "true");
    pop.innerHTML = `<b>${esc(ghostLines[id])}</b><i>−1</i>`;
    pop.style.setProperty("--tilt", `${Math.round(Math.random() * 16 - 8)}deg`);
    stage.append(pop);
    setTimeout(() => pop.remove(), 1300);
    taunt(ghostLines[id]);
    if (!ghostSpeaking) ghostVoice(id, boss?.voice?.signal).catch(() => {});
  }

  const saidOnce = new Set();
  const sayOnce = id => { if (!saidOnce.has(id)) { saidOnce.add(id); say(id); } };
  const sfx = kind => P()?.sfx?.(kind);

  /* ---------- Progress ---------- */

  // Best first-try score per room, the rooms cleared and the best boss result, kept in
  // the browser so a long haunting can be continued another day.
  let progress = { rooms: {}, boss: null };
  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(keys.progress) ?? "null");
      if (saved && typeof saved === "object") progress = { rooms: saved.rooms ?? {}, boss: saved.boss ?? null };
    } catch { /* A fresh house. */ }
  }
  function saveProgress() {
    try { localStorage.setItem(keys.progress, JSON.stringify(progress)); } catch { /* Still playable. */ }
  }
  const cleared = key => Boolean(progress.rooms[key]);
  const nextRoom = () => rooms.find(room => !cleared(room.key));
  const roomsAverage = () => {
    const done = rooms.filter(room => cleared(room.key));
    return done.length ? Math.round(done.reduce((sum, room) => sum + progress.rooms[room.key].score, 0) / done.length) : 0;
  };

  /* ---------- Lights ---------- */

  const lightsButton = get("house-lights");
  let lightsOn = flag(keys.lights);
  function applyLights() {
    section.classList.toggle("lights-on", lightsOn);
    lightsButton.setAttribute("aria-pressed", String(lightsOn));
    lightsButton.querySelector("span").textContent = lightsOn ? "Apagar as luzes" : "Acender as luzes";
  }
  lightsButton.addEventListener("click", () => {
    lightsOn = !lightsOn;
    try { localStorage.setItem(keys.lights, String(lightsOn)); } catch { /* Only a preference. */ }
    applyLights();
    speak(lightsOn ? "Luzes acesas: a tela inteira fica visível." : "Luzes apagadas: use a lanterna.");
  });
  applyLights();

  /* ---------- The map ---------- */

  const hearts = count => `${Array.from({ length: fullCourage }, (_, index) => heart(index < count)).join("")}<span class="visually-hidden">Coragem: ${count} de ${fullCourage}</span>`;

  function drawMap() {
    show("map");
    const current = nextRoom();
    const tile = (room, area) => {
      const done = cleared(room.key);
      const open = done || room === current;
      return `<button type="button" class="house-tile ${done ? "is-clear" : open ? "is-open" : "is-locked"}" style="grid-area:${area}" data-room="${room.key}"${open ? "" : " disabled"}>
        <span class="house-window" aria-hidden="true"><i></i><i></i></span>
        <strong>${room.name}</strong><small>${room.topic}</small>
        <em>${done ? `${progress.rooms[room.key].score}% de primeira` : open ? "Entrar" : "Trancado"}</em>
      </button>`;
    };
    const areas = { sotao: "attic", quarto: "bed", biblioteca: "lib", hall: "hall", jantar: "dine", cozinha: "kitchen", porao: "cellar" };
    const bossOpen = !current;
    get("house-plan-grid").innerHTML = rooms.map(room => tile(room, areas[room.key])).join("")
      + `<button type="button" class="house-tile is-boss ${bossOpen ? "is-open" : "is-locked"}" style="grid-area:boss" data-room="boss"${bossOpen ? "" : " disabled"}>
          <span class="house-boss-icon" aria-hidden="true">${ghost("is-mini", "#ff5c8a", "#b9a2ff", "#8b6fe0")}</span>
          <strong>O Fantasma</strong><small>Todos os temas</small><em>${bossOpen ? (progress.boss ? `Melhor: ${progress.boss.acc}% dos golpes` : "Enfrentar") : "Depois do sótão"}</em>
        </button>`;
    const count = rooms.filter(room => cleared(room.key)).length;
    get("house-map-note").textContent = current ? `${count} de ${rooms.length} cômodos limpos. Próximo: ${current.name}.` : "Todos os cômodos estão limpos. O fantasma espera no torreão.";
    get("house-map-score").textContent = count ? `Consertos de primeira: ${roomsAverage()}%` : "Nenhum cômodo limpo ainda";
    get("house-map-title").focus({ preventScroll: true });
  }
  get("house-plan-grid").addEventListener("click", event => {
    const tile = event.target.closest("[data-room]");
    if (!tile || tile.disabled) return;
    sfx("creak");
    if (tile.dataset.room === "boss") startBoss();
    else enterRoom(roomByKey[tile.dataset.room]);
  });
  get("house-reset").addEventListener("click", () => {
    progress = { rooms: {}, boss: null };
    saveProgress();
    speak("A casa foi assombrada de novo. Tudo recomeça do hall.");
    drawMap();
  });

  /* ---------- A room ---------- */

  let room = null; // { def, courage, state: {id: "found"|"cleansed"|"safe"}, missed: Set, first: number, pending, over }

  function spotHtml(def, id) {
    const piece = def.pieces[id];
    const state = room.state[id];
    const visual = state === "cleansed" ? piece.fixed ?? piece.look : piece.look;
    const label = state === "cleansed" ? `Consertado: ${piece.name}` : state === "safe" ? `Sem assombração: ${piece.label}` : `Examinar: ${piece.label}`;
    return `<span class="house-spot-wrap" data-wrap="${id}"><button type="button" class="house-spot${state ? ` is-${state}` : ""}" data-spot="${id}" aria-label="${esc(label)}"${state === "cleansed" || state === "safe" ? ' aria-disabled="true"' : ""}>${visual}</button>${state === "found" ? `<span class="house-haunt-mark" aria-hidden="true">${ghost("is-pop")}</span>` : ""}${state === "cleansed" ? '<span class="house-clean-mark" aria-hidden="true">✓</span>' : ""}</span>`;
  }
  function drawPage() {
    page.className = `house-page is-${room.def.key}`;
    page.innerHTML = room.def.layout(id => spotHtml(room.def, id));
  }
  function drawStatus() {
    get("house-room-hearts").innerHTML = hearts(room.courage);
    const done = room.def.haunted.filter(id => room.state[id] === "cleansed").length;
    get("house-room-found").innerHTML = `<span aria-hidden="true">${ghost("is-mini")}</span>${done} de ${room.def.haunted.length} exorcizadas`;
  }
  function idleNotes(text) {
    notes.innerHTML = `<p class="house-note-idle">${esc(text)}</p><ul class="house-note-list">${room.def.haunted.map(id => {
      const piece = room.def.pieces[id];
      return room.state[id] === "cleansed" ? `<li class="is-done"><span aria-hidden="true">✓</span>${esc(piece.name)}</li>` : '<li><span aria-hidden="true">?</span>Assombração escondida</li>';
    }).join("")}</ul>`;
  }

  function enterRoom(def) {
    room = { def, courage: fullCourage, state: {}, missed: new Set(), first: 0, pending: null, over: false };
    show("room");
    get("house-room-topic").textContent = `${def.topic} · lembra o ${def.from}`;
    get("house-room-title").textContent = def.name;
    get("house-room-brief").textContent = def.brief;
    get("house-url").textContent = def.site;
    screen.style.setProperty("--x", "50%");
    screen.style.setProperty("--y", "40%");
    drawPage();
    drawStatus();
    idleNotes("Passe a lanterna pela tela. Quando algo parecer errado, examine.");
    get("house-room-title").focus({ preventScroll: true });
    section.scrollIntoView({ block: "start" });
    report("house-room", { room: def.key });
    say("houseRoom");
  }

  // The lantern follows the pointer, and the keyboard focus.
  function aim(x, y) {
    const box = screen.getBoundingClientRect();
    screen.style.setProperty("--x", `${Math.round(x - box.left)}px`);
    screen.style.setProperty("--y", `${Math.round(y - box.top)}px`);
  }
  screen.addEventListener("pointermove", event => aim(event.clientX, event.clientY));
  screen.addEventListener("focusin", event => {
    const spot = event.target.closest(".house-spot");
    if (!spot) return;
    const box = spot.getBoundingClientRect();
    aim(box.left + box.width / 2, box.top + box.height / 2);
  });

  page.addEventListener("click", event => {
    const spot = event.target.closest("[data-spot]");
    if (!spot || !room || room.over) return;
    examine(spot.dataset.spot);
  });

  function loseCourage(reason) {
    room.courage -= 1;
    drawStatus();
    sfx("knock");
    animate(screen, [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 260 });
    if (room.courage <= 0) {
      room.over = true;
      notes.innerHTML = `<div class="house-note-fled"><p class="house-note-title">A coragem acabou!</p><p>${esc(reason)}</p><p>Você saiu correndo ${of[room.def.key]} ${esc(room.def.name.toLowerCase())}. Respire fundo: dá para tentar de novo.</p><button type="button" class="primary-button" data-again>Tentar o cômodo de novo</button></div>`;
      notes.querySelector("[data-again]").focus();
      say("houseFled");
      return true;
    }
    if (room.courage === 2) sayOnce("houseScared");
    return false;
  }

  function examine(id) {
    const piece = room.def.pieces[id];
    const state = room.state[id];
    if (state === "cleansed" || state === "safe") return speak(state === "safe" ? "Essa peça já foi examinada: está tudo certo com ela." : "Essa assombração já foi exorcizada.");
    if (room.pending && room.pending !== id) {
      notes.querySelector(".house-question")?.focus();
      return speak("Resolva a assombração aberta primeiro.");
    }
    if (!piece.fixes) {
      room.state[id] = "safe";
      drawPage();
      page.querySelector(`[data-spot="${id}"]`)?.focus({ preventScroll: true });
      if (!loseCourage(`${piece.note}`)) {
        notes.innerHTML = `<div class="house-note-safe"><p class="house-note-title">Nada de fantasma aqui</p><p>${esc(piece.note)}</p><p class="house-muted">Examinar o que está certo custa um coração de coragem.</p></div>`;
        speak(`Nada de fantasma aqui. ${piece.note} Você perdeu um coração.`);
      }
      return;
    }
    // A haunted piece: its ghost shows up, and the notebook asks for the fix.
    room.state[id] = "found";
    room.pending = id;
    drawPage();
    sfx("reveal");
    const mark = page.querySelector(`[data-wrap="${id}"] .house-haunt-mark`);
    animate(mark, [{ opacity: 0, transform: "translate(-50%, 10px) scale(.4)" }, { opacity: 1, transform: "translate(-50%, -6px) scale(1.1)" }, { opacity: 1, transform: "translate(-50%, 0) scale(1)" }], { duration: 420, easing: "cubic-bezier(.3, 1.4, .5, 1)" });
    askFix(piece);
    sayOnce("houseFound");
  }

  function askFix(piece) {
    const options = room.optionOrder?.[piece.id] ?? shuffle(piece.fixes.map((_, index) => index));
    room.optionOrder = { ...room.optionOrder, [piece.id]: options };
    notes.innerHTML = `<div class="house-question" tabindex="-1" aria-labelledby="house-q-name">
      <p class="house-kicker">Assombração encontrada</p>
      <p id="house-q-name" class="house-note-title">${ghost("is-mini")}${esc(piece.name)}</p>
      <p>${esc(piece.why)}</p>
      <p class="house-ask">Qual é o conserto certo?</p>
      <div class="house-fixes">${options.map(index => `<button type="button" class="house-fix" data-fix="${index}">${esc(piece.fixes[index].text)}</button>`).join("")}</div>
      <p class="house-fix-result" aria-live="polite"></p>
    </div>`;
    notes.querySelector(".house-question").focus();
    if (window.matchMedia("(max-width: 900px)").matches) get("house-notes").scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  notes.addEventListener("click", event => {
    if (event.target.closest("[data-again]")) return enterRoom(room.def);
    if (event.target.closest("[data-map]")) return drawMap();
    const choice = event.target.closest("[data-fix]");
    if (!choice || !room?.pending || room.over || choice.disabled) return;
    const piece = room.def.pieces[room.pending];
    const option = piece.fixes[Number(choice.dataset.fix)];
    const result = notes.querySelector(".house-fix-result");
    if (!option.ok) {
      room.missed.add(piece.id);
      choice.disabled = true;
      choice.classList.add("is-wrong");
      result.className = "house-fix-result is-bad";
      result.textContent = `Não é bem isso: ${option.reason}`;
      loseCourage(`O conserto “${option.text}” não resolve: ${option.reason}`);
      return;
    }
    // Exorcised: the piece turns into its healthy version.
    room.state[piece.id] = "cleansed";
    if (!room.missed.has(piece.id)) room.first += 1;
    room.pending = null;
    drawPage();
    drawStatus();
    sfx("sparkle");
    const wrap = page.querySelector(`[data-wrap="${piece.id}"]`);
    animate(wrap, [{ filter: "brightness(2.2)" }, { filter: "none" }], { duration: 600, easing: "ease-out" });
    const remaining = room.def.haunted.filter(id => room.state[id] !== "cleansed").length;
    if (!remaining) return clearRoom(option);
    notes.innerHTML = `<div class="house-note-good"><p class="house-note-title">Exorcizado: ${esc(piece.name)}</p><p>${esc(option.reason)}</p><p class="house-muted">Faltam ${remaining} ${remaining === 1 ? "assombração" : "assombrações"} neste cômodo.</p></div>`;
    speak(`Exorcizado! ${option.reason} Faltam ${remaining}.`);
    page.querySelector(`[data-spot="${piece.id}"]`)?.focus({ preventScroll: true });
  });

  function clearRoom(option) {
    room.over = true;
    const score = Math.round(room.first / room.def.haunted.length * 100);
    const before = progress.rooms[room.def.key]?.score ?? -1;
    progress.rooms[room.def.key] = { score: Math.max(before, score) };
    saveProgress();
    screen.classList.add("is-cleared");
    setTimeout(() => screen.classList.remove("is-cleared"), 2400);
    const next = nextRoom();
    notes.innerHTML = `<div class="house-note-cleared"><p class="house-kicker">Cômodo limpo</p><p class="house-note-title">As luzes voltaram!</p><p>${esc(option.reason)}</p>
      <p><strong>${room.first} de ${room.def.haunted.length}</strong> consertos acertados de primeira (${score}%).${before >= 0 && score > before ? " Novo recorde!" : ""}</p>
      <button type="button" class="primary-button" data-map>${next ? "Voltar à planta" : "Ir até o fantasma"}</button></div>`;
    notes.querySelector("[data-map]").focus();
    report("house-room-cleared", { room: room.def.key, score });
    say("houseCleared");
  }
  get("house-to-map").addEventListener("click", () => { quiet(); drawMap(); });

  /* ---------- The boss ---------- */

  const phases = [
    { name: "Fase 1 · Aquecimento", time: 15000, taunt: "Uuuuh… Você limpou meus cômodos? Vamos ver se reconhece minhas assombrações de longe!" },
    { name: "Fase 2 · Tudo misturado", time: 11000, taunt: "Vou misturar tudo! Contraste, pop-up, espera, cem opções… Escolha rápido!" },
    { name: "Fase 3 · Pesadelo", time: 8000, taunt: "Agora nem seus botões ficam parados. E o seu mouse? É meu!" },
  ];
  const maxHp = 9;
  let boss = null; // { hp, courage, hits, misses, deck, attack, timer, shuffler, keyboardDone, phase }

  function startBoss() {
    show("boss");
    boss = { hp: maxHp, courage: fullCourage, hits: 0, misses: 0, deck: shuffle(allHaunts), attack: null, timer: 0, shuffler: 0, keyboardDone: false, phase: -1 };
    get("house-boss-hearts").innerHTML = hearts(boss.courage);
    updateHp();
    section.scrollIntoView({ block: "start" });
    report("house-boss");
    get("house-attack").hidden = true;
    quiet();
    const voice = new AbortController();
    boss.voice = voice;
    (async () => {
      try {
        await ghostTalk("ghostBoss", get("house-taunt"), voice.signal);
      } catch {
        return;
      }
      if (!boss || views.boss.hidden) return;
      say("houseBoss");
      setTimeout(() => { if (boss && !views.boss.hidden) nextAttack(); }, reduceMotion.matches ? 400 : 1400);
    })();
  }

  function updateHp() {
    const hp = get("house-hp");
    hp.setAttribute("aria-valuenow", String(boss.hp));
    hp.setAttribute("aria-valuetext", `${boss.hp} de ${maxHp}`);
    get("house-hp-fill").style.width = `${boss.hp / maxHp * 100}%`;
  }
  function taunt(text) {
    const line = get("house-taunt");
    line.textContent = text;
    animate(line, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300 });
  }
  const phaseOf = hp => (hp > 6 ? 0 : hp > 3 ? 1 : 2);

  function nextAttack() {
    if (!boss || views.boss.hidden) return;
    clearInterval(boss.shuffler);
    if (boss.hp <= 0) return bossDefeated();
    const phase = phaseOf(boss.hp);
    if (phase !== boss.phase) {
      boss.phase = phase;
      get("house-boss-phase").textContent = phases[phase].name;
      section.querySelector(".house-arena").dataset.phase = String(phase + 1);
      if (phase === 2) ghostTalk("ghostPhase", get("house-taunt"), boss.voice?.signal).catch(() => {});
      else taunt(phases[phase].taunt);
    }
    if (!boss.deck.length) boss.deck = shuffle(allHaunts);
    const piece = boss.deck.pop();
    // In the last phase, one attack bewitches the mouse: keyboard only.
    const keyboardOnly = phase === 2 && !boss.keyboardDone && (boss.hp <= 2 || Math.random() < .5);
    if (keyboardOnly) boss.keyboardDone = true;
    boss.attack = { piece, keyboardOnly, done: false, order: shuffle([0, 1, 2]) };
    const attack = get("house-attack");
    attack.hidden = false;
    attack.classList.toggle("is-keyboard", keyboardOnly);
    get("house-attack-from").textContent = `Ataque ${of[piece.room]} ${roomByKey[piece.room].name.toLowerCase()} · ${roomByKey[piece.room].topic}`;
    get("house-attack-name").textContent = piece.name;
    get("house-attack-why").textContent = piece.why;
    get("house-attack-result").textContent = "";
    get("house-attack-result").className = "house-attack-result";
    const warn = get("house-attack-warn");
    warn.hidden = !keyboardOnly;
    warn.textContent = keyboardOnly ? "O fantasma enfeitiçou o seu mouse! Responda só com Tab e Enter." : "";
    const options = get("house-attack-options");
    options.innerHTML = boss.attack.order.map((index, position) => `<button type="button" class="house-fix" data-boss-fix="${index}" style="order:${position}">${esc(piece.fixes[index].text)}</button>`).join("");
    animate(attack, [{ opacity: 0, transform: "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" });
    animate(get("house-boss-ghost"), [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(10px) scale(1.12)" }, { transform: "translateY(0) scale(1)" }], { duration: 420, easing: "ease-in-out" });
    sfx("blip");
    if (keyboardOnly) {
      attack.focus();
      speak("O fantasma enfeitiçou o seu mouse. Use Tab para chegar ao conserto e Enter para escolher.");
    } else options.querySelector("button").focus({ preventScroll: true });
    // The clock, faster every phase.
    const time = phases[phase].time;
    const bar = get("house-timer-bar");
    boss.timerRun?.cancel();
    boss.timerRun = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: time, easing: "linear", fill: "forwards" });
    clearTimeout(boss.timer);
    const attackNow = boss.attack;
    boss.timer = setTimeout(() => { if (boss?.attack === attackNow && !attackNow.done) resolveAttack(null); }, time);
    // Phase 3: the answers swap places every so often, like a bad habit's trap. Only the
    // visual order changes (CSS order), so the keyboard focus never jumps away.
    if (phase === 2) {
      boss.shuffler = setInterval(() => {
        const buttons = [...options.children];
        const first = buttons.map(button => button.getBoundingClientRect());
        const order = shuffle([0, 1, 2]);
        buttons.forEach((button, index) => { button.style.order = String(order[index]); });
        buttons.forEach((button, index) => {
          const last = button.getBoundingClientRect();
          animate(button, [{ transform: `translate(${first[index].left - last.left}px, ${first[index].top - last.top}px)` }, { transform: "none" }], { duration: 260, easing: "ease-out" });
        });
      }, 1500);
    }
  }

  get("house-attack-options").addEventListener("click", event => {
    const choice = event.target.closest("[data-boss-fix]");
    if (!choice || !boss?.attack || boss.attack.done) return;
    // A mouse click carries a click count; Enter on a focused button does not.
    if (boss.attack.keyboardOnly && event.detail !== 0) {
      get("house-attack-result").className = "house-attack-result is-bad";
      get("house-attack-result").textContent = "O mouse está enfeitiçado! Use Tab e Enter.";
      sfx("knock");
      return;
    }
    resolveAttack(Number(choice.dataset.bossFix));
  });

  function resolveAttack(index) {
    const attack = boss.attack;
    attack.done = true;
    clearTimeout(boss.timer);
    clearInterval(boss.shuffler);
    boss.timerRun?.pause();
    const piece = attack.piece;
    const right = piece.fixes.find(option => option.ok);
    const result = get("house-attack-result");
    for (const button of get("house-attack-options").children) {
      button.disabled = true;
      if (piece.fixes[Number(button.dataset.bossFix)].ok) button.classList.add("is-right");
    }
    const ghostSprite = get("house-boss-ghost");
    if (index !== null && piece.fixes[index].ok) {
      boss.hp -= 1;
      boss.hits += 1;
      updateHp();
      result.className = "house-attack-result is-good";
      result.textContent = `Golpe certeiro! ${right.reason}`;
      sfx("sparkle");
      ghostSprite.classList.add("is-hit");
      setTimeout(() => ghostSprite.classList.remove("is-hit"), 500);
      animate(ghostSprite, [{ transform: "translateX(0)" }, { transform: "translateX(-14px) rotate(-6deg)" }, { transform: "translateX(12px) rotate(5deg)" }, { transform: "none" }], { duration: 420 });
      if (boss.hits === 1) say("houseBossHit");
      hurt();
    } else {
      boss.misses += 1;
      boss.courage -= 1;
      get("house-boss-hearts").innerHTML = hearts(boss.courage);
      result.className = "house-attack-result is-bad";
      result.textContent = `${index === null ? "O tempo acabou!" : `Não: ${piece.fixes[index].reason}`} O conserto certo era “${right.text}”.`;
      sfx("knock");
      animate(get("house-arena"), [{ transform: "translate(0, 0)" }, { transform: "translate(-8px, 4px)" }, { transform: "translate(7px, -4px)" }, { transform: "translate(-4px, 2px)" }, { transform: "none" }], { duration: 380 });
      taunt(index === null ? "Hahaha! Lento demais!" : "Hahaha! Caiu direitinho!");
      if (boss.courage <= 0) return setTimeout(bossWon, 1500);
    }
    setTimeout(() => { if (boss && !views.boss.hidden) nextAttack(); }, index === null || !piece.fixes[index]?.ok ? 2600 : 1600);
  }

  const bossAccuracy = () => Math.round(boss.hits / Math.max(1, boss.hits + boss.misses) * 100);

  function stopBoss() {
    if (!boss) return;
    boss.voice?.abort();
    clearTimeout(boss.timer);
    clearInterval(boss.shuffler);
    boss.timerRun?.cancel();
  }

  // The ghost wins: the hunter flees, and can try again.
  async function bossWon() {
    stopBoss();
    get("house-attack").hidden = true;
    const voice = new AbortController();
    boss.voice = voice;
    try { await ghostTalk("ghostWin", get("house-taunt"), voice.signal); } catch { /* Left the fight. */ }
    if (views.boss.hidden) return;
    show("end");
    get("house-end-title").textContent = "O fantasma venceu desta vez…";
    get("house-end-verdict").className = "house-end-verdict is-fail";
    get("house-end-verdict").innerHTML = `A coragem acabou com o fantasma ainda com ${boss.hp} de ${maxHp} de vida. Os cômodos continuam limpos: dá para enfrentá-lo de novo.`;
    drawEnd(null);
    get("house-end-actions").innerHTML = '<button type="button" class="primary-button" data-end="boss">Enfrentar o fantasma de novo</button><button type="button" class="secondary-button" data-end="map">Voltar à planta</button>';
    get("house-end-title").focus();
    say("houseFled");
  }

  async function bossDefeated() {
    stopBoss();
    // The ghost's last words while it fades away.
    get("house-attack").hidden = true;
    get("house-boss-ghost").classList.add("is-vanishing");
    const voice = new AbortController();
    boss.voice = voice;
    try { await ghostTalk("ghostDefeat", get("house-taunt"), voice.signal); } catch { /* Left the fight. */ }
    get("house-boss-ghost").classList.remove("is-vanishing");
    if (views.boss.hidden) return;
    const accuracy = bossAccuracy();
    progress.boss = { acc: Math.max(progress.boss?.acc ?? 0, accuracy) };
    saveProgress();
    const score = Math.round((roomsAverage() + progress.boss.acc) / 2);
    const passed = score >= passing;
    show("end");
    drawEnd(score);
    if (passed) {
      const first = !flag(keys.done);
      setFlag(keys.done);
      get("house-end-title").textContent = "A casa está livre!";
      get("house-end-verdict").className = "house-end-verdict is-pass";
      get("house-end-verdict").innerHTML = `<strong>Você exorcizou o Fantasma do Dark UX!</strong> A nota final ficou em ${score}%.${first ? " O desafio final está concluído." : ""}`;
      get("house-end-actions").innerHTML = '<button type="button" class="primary-button" data-end="leave">Sair da casa</button><button type="button" class="secondary-button" data-end="map">Ver a planta</button>';
      section.classList.add("is-free");
      unlock();
      report("house-finished", { score });
      say("houseWin");
    } else {
      get("house-end-title").textContent = "Ele caiu… mas a casa ainda range.";
      get("house-end-verdict").className = "house-end-verdict is-fail";
      get("house-end-verdict").innerHTML = `A nota final ficou em ${score}%. Para libertar a casa, a média precisa chegar a ${passing}%: refaça cômodos para acertar mais de primeira, ou enfrente o fantasma de novo.`;
      get("house-end-actions").innerHTML = '<button type="button" class="primary-button" data-end="boss">Enfrentar o fantasma de novo</button><button type="button" class="secondary-button" data-end="map">Refazer um cômodo</button>';
      report("house-failed", { score });
      say("houseRetry");
    }
    get("house-end-title").focus();
  }

  function drawEnd(score) {
    const average = roomsAverage();
    $(".house-end-art").innerHTML = houseArt(section.classList.contains("is-free"));
    get("house-end-score").innerHTML = score === null ? `<strong>${boss.hits}</strong><span>golpes no fantasma</span>` : `<strong>${score}%</strong><span>nota final</span>`;
    const rows = rooms.map(room => [room.name, progress.rooms[room.key]?.score ?? 0]);
    rows.push(["Golpes no fantasma", bossAccuracy()]);
    get("house-end-bars").innerHTML = rows.map(([name, value], index) => `<div class="house-bar${index === rows.length - 1 ? " is-boss" : ""}" style="--share:${value / 100}"><span>${esc(name)}</span><i><b></b></i><em>${value}%</em></div>`).join("")
      + `<p class="house-muted">Média dos cômodos: ${average}% de primeira.</p>`;
    for (const [index, fill] of [...get("house-end-bars").querySelectorAll("b")].entries()) animate(fill, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, delay: 100 + index * 90, easing: "cubic-bezier(.2, .8, .3, 1)", fill: "backwards" });
  }
  get("house-end-actions").addEventListener("click", event => {
    const action = event.target.closest("[data-end]")?.dataset.end;
    if (action === "boss") startBoss();
    else if (action === "map") drawMap();
    else if (action === "leave") { closeGame(); play.focus(); }
  });

  /* ---------- Opening and closing ---------- */

  function unlock() {
    if (!(testing || flag(keys.previous))) return;
    play.disabled = false;
    card.classList.add("is-unlocked");
    cardStatus.textContent = flag(keys.done) ? "Casa libertada · jogue novamente" : "Desbloqueado · o desafio final espera por você";
  }

  function stop() {
    stopBoss();
    boss = null;
    room = null;
    quiet();
  }
  function closeGame() {
    stop();
    section.hidden = true;
    library.hidden = false;
    report("house-closed");
  }

  play.addEventListener("click", () => {
    if (play.disabled) return;
    loadProgress();
    library.hidden = true;
    section.hidden = false;
    section.classList.remove("is-free");
    buildHost();
    show("intro");
    get("house-enter").textContent = Object.keys(progress.rooms).length ? "Continuar a exploração" : "Entrar na casa";
    get("house-title").focus();
    report("house-opened");
    setTimeout(() => { if (!section.hidden && !views.intro.hidden) say("houseHello"); }, 500);
  });
  get("house-enter").addEventListener("click", () => {
    report("house-started");
    sfx("creak");
    drawMap();
  });
  get("back-from-house").addEventListener("click", () => {
    closeGame();
    play.focus();
  });
  new MutationObserver(() => {
    if (gamesWindow.hidden && !section.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- The unlock sequence ---------- */

  let haunting = false;
  let forcedOnce = false;
  const libraryVisible = () => !gamesWindow.hidden && !library.hidden && solo && !solo.hidden;

  function maybeHaunt() {
    if (haunting || !(testing || flag(keys.previous)) || !libraryVisible()) return;
    if (forceIntro ? forcedOnce : flag(keys.revealed)) return;
    forcedOnce = true;
    playHaunt();
  }

  // A low drone of detuned saws under a lowpass, and a thunder roll of filtered noise.
  function haunted(signal) {
    if (!P()?.soundOn) return () => {};
    const context = P().audioContext?.();
    if (!context) return () => {};
    context.resume?.();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(.0001, now);
    master.gain.exponentialRampToValueAtTime(.22, now + 1.6);
    master.connect(context.destination);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.linearRampToValueAtTime(420, now + 5);
    filter.connect(master);
    const voices = [41.2, 43.65, 61.7].map(frequency => {
      const oscillator = context.createOscillator();
      oscillator.type = "sawtooth";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (Math.random() - .5) * 18;
      oscillator.connect(filter);
      oscillator.start(now);
      return oscillator;
    });
    const thunder = at => {
      const length = 2.4;
      const buffer = context.createBuffer(1, context.sampleRate * length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length) ** 2;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      const low = context.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.setValueAtTime(380, at);
      low.frequency.exponentialRampToValueAtTime(70, at + length);
      const gain = context.createGain();
      gain.gain.setValueAtTime(.0001, at);
      gain.gain.exponentialRampToValueAtTime(.55, at + .08);
      gain.gain.exponentialRampToValueAtTime(.0001, at + length);
      noise.connect(low).connect(gain).connect(context.destination);
      noise.start(at);
    };
    thunder(now + 1.5);
    thunder(now + 5.2);
    const stopAll = () => {
      const end = context.currentTime;
      master.gain.cancelScheduledValues(end);
      master.gain.setValueAtTime(Math.max(.0001, master.gain.value), end);
      master.gain.exponentialRampToValueAtTime(.0001, end + .6);
      for (const oscillator of voices) oscillator.stop(end + .7);
    };
    signal.addEventListener("abort", stopAll, { once: true });
    return stopAll;
  }

  async function playHaunt() {
    haunting = true;
    const controller = new AbortController();
    const { signal } = controller;
    const calm = reduceMotion.matches;
    const overlay = document.createElement("div");
    overlay.className = `house-haunt${calm ? " is-calm" : ""}`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Algo acordou na Casa do Dark UX");
    const message = "Algo acordou na Casa do Dark UX…";
    overlay.innerHTML = `
      <div class="house-haunt-dark"></div>
      <div class="house-haunt-fog"></div>
      <div class="haunt-scene"><span class="haunt-moon"></span><div class="haunt-house">${mansion()}</div></div>
      <div class="haunt-specter">${scaryFace()}</div>
      <p class="haunt-say" hidden><strong>Fantasma do Dark UX</strong><span></span></p>
      <p class="house-haunt-text" data-text="${message}"></p>
      <button type="button" class="house-haunt-skip">Pular <kbd>Esc</kbd></button>
      <p class="visually-hidden" aria-live="assertive"></p>`;
    document.body.append(overlay);
    const announce = overlay.querySelector("[aria-live]");
    const skip = overlay.querySelector(".house-haunt-skip");
    const dark = overlay.querySelector(".house-haunt-dark");
    const face = overlay.querySelector(".haunt-specter");
    const scene = overlay.querySelector(".haunt-scene");
    const say = overlay.querySelector(".haunt-say");
    const text = overlay.querySelector(".house-haunt-text");
    const previousFocus = document.activeElement;
    skip.focus({ preventScroll: true });
    const onKey = event => {
      if (event.key === "Escape") { event.preventDefault(); controller.abort(); }
      if (event.key === "Tab") { event.preventDefault(); skip.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    skip.addEventListener("click", () => controller.abort());
    const stopSound = haunted(signal);
    announce.textContent = "As luzes se apagam. Algo acordou na Casa do Dark UX.";
    try {
      if (!calm) {
        // Flicker: a change every 380 ms, so the flashes stay well under three per second.
        for (const level of [.55, .12, .78, .25, .92]) {
          dark.style.opacity = String(level);
          await wait(380, signal);
        }
      }
      dark.style.opacity = "1";
      // The house comes out of the dark, lit by two slow flashes of lightning.
      scene.classList.add("is-on");
      await wait(calm ? 400 : 1500, signal);
      if (!calm) {
        for (let flash = 0; flash < 2; flash++) {
          scene.classList.add("is-flash");
          await wait(140, signal);
          scene.classList.remove("is-flash");
          await wait(520, signal);
        }
      }
      // Its windows light up one by one, then the door creaks open.
      for (const window of overlay.querySelectorAll(".haunt-window")) {
        window.classList.add("is-lit");
        await wait(calm ? 40 : 230, signal);
      }
      sfx("creak");
      overlay.querySelector(".haunt-door").classList.add("is-open");
      await wait(calm ? 300 : 1000, signal);
      // The ghost slips out of the door and floats towards the player.
      const door = overlay.querySelector(".haunt-door").getBoundingClientRect();
      const box = face.getBoundingClientRect();
      const dx = door.left + door.width / 2 - (box.left + box.width / 2);
      const dy = door.top + door.height / 2 - (box.top + box.height / 2);
      face.classList.add("is-out");
      if (!calm) {
        const flight = face.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(.05)`, opacity: 0 },
          { transform: `translate(${dx * .7 - 60}px, ${dy * .75}px) scale(.18)`, opacity: 1, offset: .2 },
          { transform: `translate(${dx * .35 + 90}px, ${dy * .45}px) scale(.45)`, offset: .5 },
          { transform: `translate(-40px, ${dy * .12}px) scale(.8)`, offset: .78 },
          { transform: "none", opacity: 1 },
        ], { duration: 3600, easing: "ease-in-out", fill: "backwards" });
        signal.addEventListener("abort", () => flight.cancel(), { once: true });
        await wait(3600, signal);
      } else await wait(600, signal);
      scene.classList.add("is-dim");
      sfx("knock");
      // It speaks.
      say.hidden = false;
      await ghostTalk("ghostWake", say.querySelector("span"), signal);
      await wait(calm ? 300 : 700, signal);
      say.hidden = true;
      // The words appear letter by letter, glitching.
      text.classList.add("is-on");
      for (let index = 1; index <= message.length; index++) {
        text.textContent = message.slice(0, index);
        text.dataset.text = message.slice(0, index);
        if (!calm && index % 4 === 0) sfx("blip");
        await wait(calm ? 18 : 55, signal);
      }
      await wait(calm ? 900 : 1100, signal);
      if (!calm) {
        sfx("crack");
        face.classList.add("is-lunge");
        await wait(650, signal);
      }
      await wait(calm ? 300 : 400, signal);
    } catch {
      // Skipped.
    }
    stopSound();
    overlay.classList.add("is-leaving");
    await new Promise(resolve => setTimeout(resolve, calm ? 200 : 700));
    document.removeEventListener("keydown", onKey, true);
    overlay.remove();
    setFlag(keys.revealed);
    haunting = false;
    // The card shows up with a spooky glow.
    unlock();
    card.classList.add("is-haunted-reveal");
    card.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
    speak("Nova fase desbloqueada: A Casa Assombrada do Dark UX.");
    setTimeout(() => card.classList.remove("is-haunted-reveal"), 7000);
    if (previousFocus && document.contains(previousFocus) && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    else play.focus({ preventScroll: true });
    report("house-revealed");
  }

  // Watch for the library becoming visible (the games window, the solo list).
  const watch = new MutationObserver(() => setTimeout(maybeHaunt, 450));
  for (const element of [gamesWindow, library, solo]) if (element) watch.observe(element, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", ({ detail }) => {
    if (detail?.type === "maze-finished") unlock();
    if (detail?.type === "maze-closed") setTimeout(maybeHaunt, 450);
  });

  loadProgress();
  unlock();
  setTimeout(maybeHaunt, 600);
})();
