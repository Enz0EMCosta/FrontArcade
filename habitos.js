// Armadilha dos Hábitos Ruins: habits and consistency. The player repeats the same
// task 8, 10 or 12 times (open the new request in the queue, then click "Aprovar") with
// less time on each round, so the hand goes on autopilot. After three warm-up rounds
// most requests hide a trap, and the traps get more chaotic as the session goes on:
//   level 1, one change: the buttons swap places, the colours invert, the green button
//            gets another label, new buttons appear, the action bar jumps to the top,
//            or an urgent request jumps the queue;
//   level 2, two changes at once, or "Aprovar" hidden in a "Mais ações" menu;
//   level 3, three or four at once, and the buttons move again while the player aims.
// The results show how fast the habit formed (the learning curve and the power law of
// practice) and the error rate after each change, level by level. Answering at least
// half of the requests in time finishes the session and counts for the certificate.
// ?habitos in the address unlocks the game for testing.
(() => {
  const get = id => document.getElementById(id);
  const card = get("habit-card");
  const play = get("play-habit");
  const cardStatus = get("habit-card-status");
  const library = get("game-library");
  const game = get("habit-game");
  const intro = get("habit-intro");
  const round = get("habit-round");
  const results = get("habit-results");
  const app = game.querySelector(".habit-app");
  const queue = get("habit-queue");
  const review = get("habit-review");
  const feedback = get("habit-feedback");
  const countLabel = get("habit-count");
  const clock = get("habit-clock");
  const timerBar = get("habit-timer-bar");
  const plot = get("habit-plot");
  const verdict = get("habit-verdict");
  const gamesWindow = get("games-window");
  const completionKey = "front-arcade.habitos.completed.v1";
  const testing = new URLSearchParams(location.search).has("habitos");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const P = () => window.PepiBolota;

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));
  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("stopped"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); reject(new Error("stopped")); }, { once: true });
  });
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const shuffle = list => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  const seconds = ms => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
  const percent = share => `${Math.round(share * 100)}%`;
  const mean = list => list.reduce((sum, value) => sum + value, 0) / list.length;
  // "a", "a e b", "a, b e c".
  const listing = parts => parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
  const capital = text => text[0].toUpperCase() + text.slice(1);

  /* ---------- The task, the buttons and the traps ---------- */

  // Every button the panel can show. Normally: [Ver depois] [Recusar] [Aprovar].
  const actions = {
    later: { label: "Ver depois", tone: "ghost", result: "Para depois" },
    reject: { label: "Recusar", tone: "red", result: "Recusado" },
    approve: { label: "Aprovar", tone: "green", result: "Aprovado" },
    archive: { label: "Arquivar", tone: "gray", result: "Arquivado" },
    forward: { label: "Encaminhar", tone: "blue", result: "Encaminhado" },
    docs: { label: "Pedir documentos", tone: "yellow", result: "Pendente" },
    remove: { label: "Excluir", tone: "red", result: "Excluído" },
    preapprove: { label: "Pré-aprovar", tone: "green", result: "Pré-aprovado" },
    draft: { label: "Salvar rascunho", tone: "green", result: "Rascunho" },
  };
  const normalLayout = ["later", "reject", "approve"];
  const extras = ["archive", "forward", "docs", "remove", "preapprove"];

  // Each change the panel can go through. A trap is a list of them.
  const changes = {
    swap: { name: "Troca de lugar", explain: "o Aprovar e o Recusar trocaram de lugar" },
    invert: { name: "Cores invertidas", explain: "as cores se inverteram (Aprovar vermelho, Recusar verde)" },
    disguise: { name: "Rótulos trocados", explain: "os rótulos trocaram (o botão verde agora diz Recusar)" },
    crowd: { name: "Botões novos", explain: "surgiram botões novos (um deles no lugar do Aprovar)" },
    shuffle: { name: "Embaralhado", explain: "os botões se embaralharam" },
    top: { name: "Barra no topo", explain: "a barra de ações subiu para o topo do pedido" },
    stack: { name: "Coluna", explain: "os botões viraram uma coluna" },
    menu: { name: "Menu escondido", explain: "o Aprovar foi parar dentro do menu Mais ações" },
    mono: { name: "Sem cor", explain: "todos os botões ficaram da mesma cor" },
    urgent: { name: "Fila furada", explain: "um pedido urgente entrou no topo da fila" },
    sink: { name: "Fila invertida", explain: "o pedido novo foi parar no fim da fila" },
    live: { name: "Mudança ao vivo", explain: "os botões mudaram de novo enquanto você mirava" },
  };
  const recipes = {
    1: [["swap"], ["invert"], ["disguise"], ["crowd"], ["urgent"], ["top"]],
    2: [["crowd", "invert"], ["top", "swap"], ["sink", "disguise"], ["stack", "invert"], ["menu"], ["mono", "shuffle"], ["urgent", "crowd"]],
    3: [["crowd", "top", "invert", "live"], ["menu", "urgent", "mono"], ["stack", "disguise", "sink"], ["crowd", "shuffle", "urgent", "live"], ["top", "crowd", "mono", "live"]],
  };
  const trapName = trap => trap.map(key => changes[key].name).join(" + ");
  const trapExplain = trap => listing(trap.map(key => changes[key].explain));

  // Less and less time: from 6.5 s on the first request to 2.4 s on the last one.
  const limitFor = (index, total) => Math.round(6500 * (2400 / 6500) ** (index / (total - 1)));

  // Three warm-up rounds build the habit. Then two traps for every normal round, and
  // the last request is always a trap. The level of chaos rises in thirds.
  function makePlan(total) {
    const warm = 3;
    const plan = Array.from({ length: total }, (_, index) => ({ index, trap: null, level: 0, limit: limitFor(index, total) }));
    const slots = [];
    for (let index = warm; index < total; index++) if ((index - warm) % 3 !== 1 || index === total - 1) slots.push(index);
    const used = new Set();
    slots.forEach((slot, order) => {
      const level = 1 + Math.floor(order * 3 / slots.length);
      const recipe = pick(recipes[level].filter(option => !used.has(option.join())));
      used.add(recipe.join());
      Object.assign(plan[slot], { trap: recipe, level });
    });
    return plan;
  }

  // How the action bar looks for a trap.
  function viewFor(trap) {
    const view = { order: [...normalLayout], tones: {}, top: false, stack: false, menu: null, mono: false, live: false, crowd: false };
    if (!trap) return view;
    const has = key => trap.includes(key);
    if (has("swap") || has("disguise")) view.order = ["later", "approve", "reject"];
    if (has("invert") || has("disguise")) view.tones = { approve: "red", reject: "green" };
    if (has("crowd")) {
      // Two or three new buttons: one lands right where "Aprovar" used to be.
      const [last, ...rest] = shuffle(extras).slice(0, 2 + Math.floor(Math.random() * 2));
      for (const key of rest) view.order.splice(Math.floor(Math.random() * (view.order.length + 1)), 0, key);
      view.order.push(last);
      view.crowd = true;
    }
    if (has("shuffle")) {
      const before = view.order.join();
      do view.order = shuffle(view.order); while (view.order.at(-1) === "approve" || view.order.join() === before);
    }
    if (has("menu")) {
      view.order = ["later", "reject", "more", "draft"];
      view.menu = shuffle(["archive", "approve", "forward"]);
    }
    Object.assign(view, { top: has("top"), stack: has("stack"), mono: has("mono"), live: has("live") });
    return view;
  }

  const firstNames = ["Ana", "Bruno", "Carla", "Davi", "Elisa", "Felipe", "Gabriela", "Heitor", "Iara", "João", "Karina", "Lucas", "Marina", "Nina", "Otávio", "Paula", "Rafael", "Sofia", "Tiago", "Vitória", "Yasmin", "Caio"];
  const lastNames = ["Souza", "Santos", "Lima", "Oliveira", "Costa", "Almeida", "Rocha", "Menezes", "Barreto", "Cardoso", "Prado", "Teles"];
  const courses = ["Ciência da Computação", "Engenharia de Computação", "Sistemas de Informação", "Design", "Matemática", "Engenharia Elétrica"];
  const tones = ["#f78581", "#edc45b", "#63c6a1", "#68bce4", "#a681dc", "#f0a8cc"];
  let serial = 2041;
  function person() {
    const first = pick(firstNames);
    return { id: serial++, name: `${first} ${pick(lastNames)}`, initials: first[0], course: pick(courses), year: 1 + Math.floor(Math.random() * 5), tone: pick(tones) };
  }

  /* ---------- Intro art: a mousetrap with the cheese, and the cursor coming ---------- */

  function trapArt() {
    const rect = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
    const cursor = ["k......", "kk.....", "kwk....", "kwwk...", "kwwwk..", "kwwwwk.", "kwwwwwk", "kwwkkkk", "kwk....", "kk.....", "k......"];
    let arrow = "";
    cursor.forEach((row, y) => [...row].forEach((key, x) => {
      if (key !== ".") arrow += rect(x, y, 1, 1, key === "k" ? "#142842" : "#ffffff");
    }));
    const board = rect(1, 17, 26, 5, "#b77b52") + rect(1, 17, 26, 1, "#e0a477") + rect(1, 21, 26, 1, "#6b452c")
      + rect(4, 18, 1, 1, "#8a5a3c") + rect(22, 19, 1, 1, "#8a5a3c");
    const wire = rect(4, 10, 1, 7, "#8a96a8") + rect(4, 10, 13, 1, "#dfe6ee") + rect(16, 10, 1, 7, "#8a96a8") + rect(9, 16, 5, 1, "#5d6878");
    const plate = rect(17, 16, 7, 1, "#dfe6ee");
    const cheese = rect(18, 13, 5, 3, "#f6c445") + rect(20, 12, 3, 1, "#f6c445") + rect(19, 14, 1, 1, "#d9a21b") + rect(21, 13, 1, 1, "#d9a21b") + rect(18, 13, 5, 1, "#ffe08a");
    return `<svg viewBox="0 0 28 23" shape-rendering="crispEdges" focusable="false">${board}${wire}${plate}${cheese}<g class="habit-cursor" transform="translate(21 1)">${arrow}</g></svg>`;
  }
  game.querySelector(".habit-trap-art").innerHTML = trapArt();

  /* ---------- State ---------- */

  let plan = [];
  let step = 0;
  let total = 10;
  let log = []; // one entry per round
  let current = null; // the round in progress
  let shift = null; // AbortController of the session
  let timer = 0;
  let liveTimer = 0;
  let timerRun = null;
  let frame = 0;
  let records = []; // the queue below the new request: { person, status }
  let chaosShown = false;

  const flag = key => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  };
  const readCompleted = () => flag(completionKey);
  // The games open one after the other: this one needs Lag Lab and Garçom Relâmpago.
  const previousDone = () => testing || (flag("front-arcade.lag-lab.completed.v1") && flag("front-arcade.garcom-relampago.completed.v1"));

  function unlock() {
    if (!previousDone()) return;
    play.disabled = false;
    card.classList.add("is-unlocked");
    cardStatus.textContent = readCompleted()
      ? "Expediente concluído · jogue novamente"
      : "Desbloqueado · 8, 10 ou 12 repetições";
  }

  /* ---------- Rendering a round ---------- */

  function queueItem(entry, kind) {
    const item = document.createElement("li");
    item.className = `habit-ticket is-${kind}`;
    const status = kind === "new" ? "Novo" : kind === "urgent" ? "Urgente" : entry.status;
    const statusTone = kind === "new" ? "new" : kind === "urgent" ? "urgent" : entry.statusTone;
    item.innerHTML = `<button type="button" class="habit-ticket-button" data-kind="${kind}">
      <span class="habit-avatar" style="--tone:${entry.person.tone}">${entry.person.initials}</span>
      <span class="habit-ticket-text"><strong>${entry.person.name}</strong><span>#${entry.person.id} · ${entry.person.course}</span></span>
      <span class="habit-chip is-${statusTone}">${status}</span>
    </button>`;
    return item;
  }

  function renderQueue(fresh, trap) {
    const urgent = trap?.includes("urgent") ? person() : null;
    const sink = trap?.includes("sink");
    queue.replaceChildren();
    const added = queueItem({ person: fresh }, "new");
    const done = records.slice(0, urgent ? 2 : 3).map(record => queueItem(record, "done"));
    if (urgent) queue.append(queueItem({ person: urgent }, "urgent"));
    if (sink) queue.append(...done, added);
    else queue.append(added, ...done);
    if (!reduceMotion.matches) {
      added.animate([{ transform: "translateY(-12px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 220, easing: "ease-out" });
    }
  }

  function buttonHtml(action, view) {
    if (action === "more") {
      return `<button type="button" class="habit-action habit-more is-${view.mono ? "mono" : "gray"}" data-more aria-expanded="false">Mais ações <span aria-hidden="true">▾</span></button>`;
    }
    const tone = view.mono ? "mono" : view.tones[action] ?? actions[action].tone;
    return `<button type="button" class="habit-action is-${tone}" data-action="${action}">${actions[action].label}</button>`;
  }

  function actionsHtml(view) {
    const classes = ["habit-actions", view.top && "is-top", view.stack && "is-stack", view.crowd && "is-crowd"].filter(Boolean).join(" ");
    const menu = view.menu
      ? `<div class="habit-menu" hidden>${view.menu.map(action => `<button type="button" class="habit-menu-item" data-action="${action}">${actions[action].label}</button>`).join("")}</div>`
      : "";
    return `<div class="${classes}">${view.order.map(action => buttonHtml(action, view)).join("")}${menu}</div>`;
  }

  function renderReview(turn) {
    const { person: who, view } = turn;
    const bar = actionsHtml(view);
    review.innerHTML = `<div class="habit-request">
      ${view.top ? bar : ""}
      <header>
        <span class="habit-avatar is-big" style="--tone:${who.tone}">${who.initials}</span>
        <div><h4>${who.name}</h4><p>Pedido #${who.id} · inscrição na oficina</p></div>
      </header>
      <dl>
        <div><dt>Curso</dt><dd>${who.course}</dd></div>
        <div><dt>Período</dt><dd>${who.year}º ano</dd></div>
        <div><dt>Documentos</dt><dd>Conferidos</dd></div>
      </dl>
      ${view.top ? "" : bar}
    </div>`;
    // The busier levels arrive with a glitch, like a page swapping its layout.
    if (turn.entry.level >= 2 && !reduceMotion.matches) {
      review.animate([
        { transform: "translateX(-6px) skewX(4deg)", filter: "hue-rotate(90deg) saturate(2)" },
        { transform: "translateX(5px) skewX(-3deg)", filter: "hue-rotate(-60deg)" },
        { transform: "none", filter: "none" },
      ], { duration: 260, easing: "steps(4)" });
    }
  }

  // Level 3: once the player starts aiming, the buttons jump around again and one more
  // appears where "Aprovar" was. The buttons glide to their new places.
  function moveLive(turn) {
    if (current !== turn) return;
    const bar = review.querySelector(".habit-actions");
    if (!bar) return;
    const view = turn.view;
    const was = view.order.indexOf("approve");
    const unused = extras.filter(key => !view.order.includes(key));
    let order;
    do order = shuffle(view.order); while (order.indexOf("approve") === was);
    if (unused.length) order.splice(was, 0, pick(unused));
    view.order = order;
    view.crowd = true;
    const before = new Map([...bar.querySelectorAll("[data-action]")].map(button => [button.dataset.action, button.getBoundingClientRect()]));
    bar.outerHTML = actionsHtml(view);
    turn.moved = true;
    P()?.sfx("knock");
    if (reduceMotion.matches) return;
    for (const button of review.querySelectorAll(".habit-actions [data-action]")) {
      const from = before.get(button.dataset.action);
      const to = button.getBoundingClientRect();
      if (from) {
        button.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }, { transform: "none" }], { duration: 180, easing: "ease-out" });
      } else {
        button.animate([{ transform: "scale(.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 180, easing: "ease-out" });
      }
    }
  }

  function idleReview(text = "Abra o pedido novo na fila.") {
    review.innerHTML = `<p class="habit-empty"><span aria-hidden="true">←</span>${text}</p>`;
  }

  function tick() {
    if (!current) return;
    clock.textContent = seconds(performance.now() - current.start);
    frame = requestAnimationFrame(tick);
  }

  function startRound() {
    const entry = plan[step];
    const fresh = person();
    renderQueue(fresh, entry.trap);
    idleReview();
    feedback.textContent = "";
    feedback.className = "habit-feedback";
    countLabel.textContent = `Pedido ${step + 1} de ${total}`;
    app.classList.toggle("is-chaos", entry.level === 3);
    timerBar.parentElement.classList.toggle("is-tight", entry.limit < 3000);
    current = { entry, person: fresh, view: viewFor(entry.trap), start: performance.now(), opened: 0, slips: 0, slipAt: null, moved: false };
    timerRun?.cancel();
    timerRun = timerBar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: entry.limit, easing: "linear", fill: "forwards" });
    clearTimeout(timer);
    clearTimeout(liveTimer);
    timer = setTimeout(() => endRound("timeout"), entry.limit);
    round.scrollIntoView({ block: "nearest" });
    tick();
    if (entry.level === 3 && !chaosShown) {
      chaosShown = true;
      report("habit-chaos");
    }
  }

  queue.addEventListener("click", event => {
    const button = event.target.closest(".habit-ticket-button");
    if (!button || !current) return;
    if (button.dataset.kind === "new") {
      if (current.opened) return;
      current.opened = performance.now();
      queue.querySelector(".is-new")?.classList.add("is-open");
      renderReview(current);
      P()?.sfx("blip");
      if (current.view.live) {
        const turn = current;
        liveTimer = setTimeout(() => moveLive(turn), Math.min(520, Math.max(260, turn.entry.limit * .16)));
      }
      return;
    }
    // Opening the wrong request: a slip. It doesn't end the round, but it counts.
    current.slips += 1;
    current.slipAt ??= button.dataset.kind;
    button.classList.remove("is-shake");
    void button.offsetWidth;
    button.classList.add("is-shake");
    P()?.sfx("knock");
    feedback.textContent = button.dataset.kind === "urgent" ? "Esse é o urgente, não o novo!" : "Esse pedido já foi resolvido.";
    feedback.className = "habit-feedback is-slip";
  });

  review.addEventListener("click", event => {
    if (!current) return;
    const more = event.target.closest("[data-more]");
    if (more) {
      const menu = review.querySelector(".habit-menu");
      menu.hidden = !menu.hidden;
      more.setAttribute("aria-expanded", String(!menu.hidden));
      if (!menu.hidden) menu.querySelector("button")?.focus({ preventScroll: true });
      P()?.sfx("blip");
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    endRound(button.dataset.action === "approve" ? "ok" : "wrong", button.dataset.action);
  });

  async function endRound(outcome, action = null) {
    if (!current) return;
    const turn = current;
    current = null;
    clearTimeout(timer);
    clearTimeout(liveTimer);
    timerRun?.pause();
    cancelAnimationFrame(frame);
    const now = performance.now();
    const { entry } = turn;
    const time = outcome === "timeout" ? entry.limit : now - turn.start;
    clock.textContent = seconds(time);
    const record = {
      index: entry.index, trap: entry.trap, level: entry.level, limit: entry.limit, time, outcome, action,
      slips: turn.slips, decision: turn.opened ? now - turn.opened : null, moved: turn.moved,
    };
    record.error = outcome !== "ok" || turn.slips > 0;
    log.push(record);
    const statusAction = outcome === "timeout" ? null : action;
    records.unshift({
      person: turn.person,
      status: statusAction ? actions[statusAction].result : "Expirou",
      statusTone: statusAction === "approve" ? "ok" : ["reject", "remove"].includes(statusAction) ? "bad" : "muted",
    });
    const trap = entry.trap;
    // What happened, and on a mistake, where "Aprovar" really was.
    if (outcome === "ok" && !record.error) {
      feedback.textContent = trap ? `Escapou! Você percebeu: ${trapExplain(trap)}.` : `Aprovado em ${seconds(time)}.`;
      feedback.className = `habit-feedback ${trap ? "is-dodged" : "is-ok"}`;
      P()?.sfx(trap ? "sparkle" : "pop");
    } else {
      const what = outcome === "timeout"
        ? "O tempo acabou!"
        : outcome === "wrong" ? `Ops! Você clicou em ${actions[action].label}.` : "Aprovado, mas você abriu o pedido errado antes.";
      feedback.textContent = trap ? `${what} Pegadinha: ${trapExplain(trap)}.` : `${what} A pressa também derruba.`;
      feedback.className = "habit-feedback is-caught";
      const menu = review.querySelector(".habit-menu");
      if (menu) menu.hidden = false;
      review.querySelector('[data-action="approve"]')?.classList.add("is-reveal");
      if (trap?.some(key => key === "urgent" || key === "sink")) queue.querySelector(".is-new")?.classList.add("is-reveal");
      P()?.sfx(outcome === "timeout" ? "tick" : "knock");
    }
    for (const button of review.querySelectorAll("button")) button.disabled = true;
    report("habit-round", { round: entry.index + 1, trap: trap?.join("+") ?? null, level: entry.level, outcome, error: record.error });
    if (trap) report("habit-trap", { kind: trap.join("+"), level: entry.level, caught: record.error });
    try {
      await wait(record.error ? 2800 : trap ? 1800 : 900, shift.signal);
    } catch {
      return;
    }
    step += 1;
    if (step < plan.length) startRound();
    else finish();
  }

  function startSession() {
    shift?.abort();
    shift = new AbortController();
    total = Number(intro.querySelector('input[name="habit-length"]:checked')?.value ?? 10);
    plan = makePlan(total);
    step = 0;
    log = [];
    chaosShown = false;
    records = Array.from({ length: 3 }, () => ({ person: person(), status: "Aprovado", statusTone: "ok" }));
    intro.hidden = true;
    results.hidden = true;
    round.hidden = false;
    report("habit-started", { total });
    startRound();
  }

  /* ---------- Results ---------- */

  // Least squares on logs: T = a · n^(-b), the power law of practice.
  function practiceFit(points) {
    if (points.length < 2) return null;
    const xs = points.map(([n]) => Math.log(n));
    const ys = points.map(([, t]) => Math.log(t));
    const mx = mean(xs);
    const my = mean(ys);
    const slope = xs.reduce((sum, x, index) => sum + (x - mx) * (ys[index] - my), 0) / xs.reduce((sum, x) => sum + (x - mx) ** 2, 0);
    return { a: Math.exp(my - slope * mx), b: -slope };
  }

  function metrics() {
    const normal = log.filter(entry => !entry.trap);
    const caught = log.filter(entry => entry.trap);
    const clean = normal.filter(entry => !entry.error);
    // The habit is in place where the learning curve flattens: from that request on, a
    // repetition saves less than 10% over the one before.
    const best = clean.length ? Math.min(...clean.map(entry => entry.time)) : null;
    const habitAt = clean.find((entry, index) => index > 0 && entry.time >= clean[index - 1].time * .9)
      ?? clean.find(entry => entry.time <= best * 1.25);
    const firstTime = clean[0]?.time;
    const lastTimes = clean.slice(-2).map(entry => entry.time);
    const faster = clean.length > 1 ? 1 - mean(lastTimes) / firstTime : 0;
    const fit = practiceFit(clean.map(entry => [entry.index + 1, entry.time]));
    const decisions = clean.filter(entry => entry.decision).map(entry => entry.decision);
    const usual = decisions.length ? mean(decisions) : null;
    const levels = [1, 2, 3].map(level => {
      const at = caught.filter(entry => entry.level === level);
      return { level, count: at.length, errors: at.filter(entry => entry.error).length };
    }).filter(level => level.count);
    return {
      normal, caught, clean, habitAt, faster, fit, usual, levels,
      normalError: normal.length ? normal.filter(entry => entry.error).length / normal.length : 0,
      trapError: caught.length ? caught.filter(entry => entry.error).length / caught.length : 0,
      answered: log.filter(entry => entry.outcome !== "timeout").length,
    };
  }

  function tile(label, value, note, tone) {
    return `<div class="habit-tile is-${tone}"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
  }

  const outcomeText = entry => {
    if (entry.outcome === "timeout") return "Tempo esgotado";
    if (entry.outcome === "wrong") return `Clicou em ${actions[entry.action].label}`;
    if (entry.slips) return "Abriu o pedido errado";
    return "Aprovou";
  };

  function finish() {
    current = null;
    round.hidden = true;
    results.hidden = false;
    app.classList.remove("is-chaos");
    const data = metrics();
    const byLevel = data.levels.map(level => `nível ${level.level}: ${level.errors} de ${level.count}`).join(" · ");
    get("habit-tiles").innerHTML = [
      tile("Hábito formado", data.habitAt ? `no ${data.habitAt.index + 1}º pedido` : "—",
        data.faster > 0 ? `Você ficou ${percent(data.faster)} mais rápido do primeiro ao último pedido normal.` : "O ritmo não chegou a acelerar desta vez.", "habit"),
      tile("Erro sem mudança", percent(data.normalError), `${data.normal.filter(entry => entry.error).length} de ${data.normal.length} pedidos normais.`, "calm"),
      tile("Erro depois da mudança", percent(data.trapError), `${data.caught.filter(entry => entry.error).length} de ${data.caught.length} armadilhas (${byLevel}).`, "trap"),
    ].join("");

    const trapList = get("habit-traps");
    trapList.replaceChildren(...data.caught.map(entry => {
      const item = document.createElement("li");
      let detail;
      if (entry.error) {
        detail = entry.outcome === "timeout"
          ? "o tempo acabou enquanto você procurava o botão"
          : entry.outcome === "wrong"
            ? `a mão foi no automático e clicou em ${actions[entry.action].label}`
            : "você abriu o pedido errado na fila antes do novo";
      } else {
        const pause = data.usual && entry.decision ? entry.decision - data.usual : 0;
        detail = pause > 150 ? `você hesitou ${seconds(pause)} a mais e acertou` : "você nem piscou e acertou";
      }
      item.className = entry.error ? "is-caught" : "is-dodged";
      item.innerHTML = `<span class="habit-chip ${entry.error ? "is-bad" : "is-ok"}">${entry.error ? "Caiu" : "Escapou"}</span><div><strong>Pedido ${entry.index + 1} · ${trapName(entry.trap)} <span class="habit-level is-${entry.level}">Caos ${entry.level}</span></strong><p>${capital(trapExplain(entry.trap))}: ${detail}.</p></div>`;
      return item;
    }));

    const practice = data.fit && data.fit.b > 0
      ? ` O seu tempo nos pedidos normais seguiu a lei da prática, T ≈ ${(data.fit.a / 1000).toFixed(1).replace(".", ",")} s × n^−${data.fit.b.toFixed(2).replace(".", ",")}: cada repetição economiza um pouco menos que a anterior, sinal de que o gesto virou automático.`
      : "";
    const gap = data.trapError - data.normalError;
    const summary = gap > 0
      ? `Sem mudanças, você errou ${percent(data.normalError)} das vezes; quando a interface mudou, ${percent(data.trapError)}.`
      : `Você errou ${percent(data.trapError)} nas mudanças e ${percent(data.normalError)} sem elas: atenção de sobra!`;
    get("habit-lesson").textContent = `${summary}${practice} Para quem desenha interfaces, a lição é: mantenha as ações no mesmo lugar, não dê significado só pela cor, não esconda a ação principal num menu, evite que o layout mude enquanto a pessoa mira e nunca coloque uma ação destrutiva onde antes ficava a principal.`;

    const body = get("habit-table-body");
    body.replaceChildren(...log.map(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `<th scope="row">${entry.index + 1}</th><td>${entry.trap ? `${trapName(entry.trap)} (caos ${entry.level})` : "—"}</td><td>${seconds(entry.time)}</td><td>${outcomeText(entry)}</td>`;
      return row;
    }));

    // Finishing needs at least half of the requests answered in time.
    const needed = Math.ceil(total / 2);
    const passed = data.answered >= needed;
    const before = readCompleted();
    verdict.className = `habit-verdict ${passed ? "is-pass" : "is-fail"}`;
    verdict.innerHTML = passed
      ? `<strong>Expediente concluído!</strong> Você respondeu ${data.answered} de ${total} pedidos dentro do tempo.${before ? "" : " Mais um jogo para o seu certificado."}`
      : `<strong>Expediente incompleto.</strong> Você respondeu ${data.answered} de ${total} pedidos dentro do tempo. Responda pelo menos ${needed} para concluir o jogo.`;
    get("habit-result-title").textContent = passed ? "Expediente encerrado!" : "Quase lá!";
    get("again-habit").textContent = passed ? "Jogar novamente" : "Tentar de novo";

    drawChart();
    if (passed) {
      try { localStorage.setItem(completionKey, "true"); } catch { /* The result still shows. */ }
    }
    unlock();
    get("habit-result-title").focus();
    report(passed ? "habit-finished" : "habit-failed", {
      total, normalError: Math.round(data.normalError * 100), trapError: Math.round(data.trapError * 100),
      habitAt: data.habitAt ? data.habitAt.index + 1 : null,
    });
  }

  /* ---------- The chart: time per round, the shrinking limit, and the traps ---------- */

  function drawChart() {
    if (!log.length || results.hidden) return;
    const width = Math.max(300, plot.clientWidth);
    const height = 270;
    const pad = { left: 46, right: 18, top: 26, bottom: 36 };
    const count = log.length;
    const ceiling = Math.ceil(Math.max(...log.map(entry => Math.max(entry.time, entry.limit))) / 1000);
    const x = index => pad.left + (count === 1 ? .5 : index / (count - 1)) * (width - pad.left - pad.right);
    const y = value => pad.top + (1 - value / 1000 / ceiling) * (height - pad.top - pad.bottom);
    const step = ceiling > 8 ? 2 : 1;
    let grid = "";
    for (let tick = 0; tick <= ceiling; tick += step) {
      grid += `<line class="habit-grid" x1="${pad.left}" x2="${width - pad.right}" y1="${y(tick * 1000)}" y2="${y(tick * 1000)}"/>`;
      grid += `<text class="habit-axis" x="${pad.left - 8}" y="${y(tick * 1000) + 4}" text-anchor="end">${tick} s</text>`;
    }
    const labels = log.map(entry => `<text class="habit-axis" x="${x(entry.index)}" y="${height - pad.bottom + 20}" text-anchor="middle">${entry.index + 1}</text>`).join("");
    const limit = `<polyline class="habit-limit" points="${log.map(entry => `${x(entry.index)},${y(entry.limit)}`).join(" ")}"/>`;
    const normal = log.filter(entry => !entry.trap);
    const line = `<polyline class="habit-line" points="${normal.map(entry => `${x(entry.index)},${y(entry.time)}`).join(" ")}"/>`;
    const marks = log.map(entry => {
      const cx = x(entry.index);
      const cy = y(entry.time);
      const glyph = entry.error ? "✖" : "✔";
      if (entry.trap) {
        // Bigger diamonds for more chaos.
        const size = 8 + entry.level * 2;
        return `<rect class="habit-mark is-trap" x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" transform="rotate(45 ${cx} ${cy})"/>`
          + `<text class="habit-glyph" x="${cx}" y="${cy - size / 2 - 9}" text-anchor="middle">${glyph}</text>`;
      }
      return `<circle class="habit-mark is-normal" cx="${cx}" cy="${cy}" r="5"/>${entry.error ? `<text class="habit-glyph" x="${cx}" y="${cy - 11}" text-anchor="middle">✖</text>` : ""}`;
    }).join("");
    const slot = (width - pad.left - pad.right) / Math.max(1, count - 1);
    const hits = log.map(entry => `<rect class="habit-hit" data-index="${entry.index}" x="${x(entry.index) - slot / 2}" y="${pad.top}" width="${slot}" height="${height - pad.top - pad.bottom}"/>`).join("");
    plot.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico do tempo de cada pedido. Os números estão na tabela abaixo.">
      ${grid}<line class="habit-cross" x1="0" x2="0" y1="${pad.top}" y2="${height - pad.bottom}" visibility="hidden"/>${limit}${line}${marks}${labels}${hits}</svg>
      <div class="habit-tip" hidden></div>`;
    const svg = plot.querySelector("svg");
    const tip = plot.querySelector(".habit-tip");
    const cross = plot.querySelector(".habit-cross");
    const show = index => {
      const entry = log[index];
      cross.setAttribute("x1", x(index));
      cross.setAttribute("x2", x(index));
      cross.setAttribute("visibility", "visible");
      tip.innerHTML = `<strong>Pedido ${index + 1}${entry.trap ? ` · caos ${entry.level}` : ""}</strong>${entry.trap ? `<span>${trapName(entry.trap)}</span>` : ""}<span>${seconds(entry.time)} de ${seconds(entry.limit)} · ${outcomeText(entry)}</span>`;
      tip.hidden = false;
      const left = Math.min(Math.max(x(index) - tip.offsetWidth / 2, 0), width - tip.offsetWidth);
      tip.style.left = `${left}px`;
      tip.style.top = `${Math.max(0, y(entry.time) - tip.offsetHeight - 22)}px`;
    };
    svg.addEventListener("pointermove", event => {
      const hit = event.target.closest(".habit-hit");
      if (hit) show(Number(hit.dataset.index));
    });
    svg.addEventListener("pointerleave", () => {
      tip.hidden = true;
      cross.setAttribute("visibility", "hidden");
    });
  }
  new ResizeObserver(() => { if (!results.hidden) drawChart(); }).observe(plot);

  /* ---------- Opening and closing ---------- */

  function stop() {
    shift?.abort();
    current = null;
    clearTimeout(timer);
    clearTimeout(liveTimer);
    timerRun?.cancel();
    cancelAnimationFrame(frame);
    app.classList.remove("is-chaos");
  }

  function showIntro() {
    stop();
    intro.hidden = false;
    round.hidden = true;
    results.hidden = true;
  }

  function closeGame() {
    stop();
    game.hidden = true;
    library.hidden = false;
    report("habit-closed");
  }

  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    showIntro();
    get("habit-title").focus();
    report("habit-opened");
  });
  get("start-habit").addEventListener("click", startSession);
  get("again-habit").addEventListener("click", () => {
    showIntro();
    get("start-habit").focus();
  });
  get("back-from-habit").addEventListener("click", () => {
    closeGame();
    play.focus();
  });
  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:event", ({ detail }) => { if (detail?.type === "waiter-finished") unlock(); });
  unlock();
})();
