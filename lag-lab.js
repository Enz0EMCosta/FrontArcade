(() => {
  const get = id => document.getElementById(id);
  const delays = [0, 100, 400, 1000];
  const themes = {
    arcos: ["Arcos da Atalaia", "M35 182V139a34 34 0 0168 0v43M103 182v-61a57 57 0 01114 0v61M217 182v-43a34 34 0 0168 0v43"],
    peixe: ["Peixe", "M232 121Q160 36 81 112L38 81v78l43-30q79 78 151-8ZM202 104a4 4 0 11-8 0a4 4 0 018 0"],
    foguete: ["Foguete", "M159 29q41 29 41 86v42h-80v-42q0-57 39-86ZM120 118l-34 45h34m80-45l34 45h-34M159 111a16 16 0 100-32a16 16 0 000 32Zm-14 58l14 38 15-38"],
  };
  const play = get("play-lag");
  const game = get("lag-game");
  const library = get("game-library");
  const intro = get("lag-intro");
  const round = get("lag-round");
  const results = get("lag-results");
  const drawing = get("lag-drawing");
  const reference = get("lag-reference");
  const cursor = get("lag-cursor");
  const context = drawing.getContext("2d", { willReadFrequently: true });
  const model = reference.getContext("2d", { willReadFrequently: true });
  const feedback = get("lag-feedback");
  const check = get("score-lag");
  const clear = get("clear-lag");
  const next = get("next-lag");
  const width = drawing.width;
  const height = drawing.height;
  let trial = 0;
  let scores = [];
  let queue = [];
  let timer;
  let previous;
  let pointer;
  let accepting = false;
  let waitingForScore = false;
  let keyPen = false;
  let keyPoint;

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));

  function readFlag(key) {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  }

  function unlock() {
    play.disabled = false;
    get("lag-card").classList.add("is-unlocked");
    get("lag-card-status").textContent = readFlag("front-arcade.lag-lab.completed.v1")
      ? "Experimento concluído · jogue novamente"
      : "Desbloqueado · quatro atrasos para comparar";
  }

  function drawReference() {
    const [name, lines] = themes[get("lag-theme").value];
    reference.setAttribute("aria-label", name);
    model.clearRect(0, 0, width, height);
    Object.assign(model, { strokeStyle: "#28596b", lineWidth: 6, lineCap: "round", lineJoin: "round" });
    model.stroke(new Path2D(lines));
  }

  function resetBoard() {
    clearTimeout(timer);
    timer = undefined;
    queue = [];
    if (pointer !== undefined && drawing.hasPointerCapture(pointer)) drawing.releasePointerCapture(pointer);
    pointer = undefined;
    previous = undefined;
    keyPen = false;
    keyPoint = { x: width / 2, y: height / 2 };
    waitingForScore = false;
    cursor.hidden = true;
    context.clearRect(0, 0, width, height);
  }

  function showTrial() {
    resetBoard();
    accepting = true;
    drawReference();
    get("lag-trial").textContent = `Tentativa ${trial + 1} de ${delays.length}`;
    get("lag-delay").textContent = `${delays[trial]} ms de atraso`;
    feedback.textContent = "";
    check.hidden = false;
    check.disabled = false;
    clear.disabled = false;
    next.hidden = true;
    drawing.focus({ preventScroll: true });
  }

  function applyPoint({ mode, x, y }) {
    if (mode === "hide") {
      cursor.hidden = true;
      return;
    }
    cursor.hidden = false;
    cursor.style.left = `${x / width * 100}%`;
    cursor.style.top = `${y / height * 100}%`;
    if (mode === "down") {
      context.fillStyle = "#296a75";
      context.beginPath();
      context.arc(x, y, 3, 0, 2 * Math.PI);
      context.fill();
      previous = { x, y };
    } else if (mode === "stroke" && previous) {
      Object.assign(context, { strokeStyle: "#296a75", lineWidth: 6, lineCap: "round" });
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(x, y);
      context.stroke();
      previous = { x, y };
    } else if (mode === "up") {
      previous = undefined;
    }
  }

  function flush() {
    timer = undefined;
    const now = performance.now();
    while (queue.length && queue[0].due <= now) applyPoint(queue.shift());
    if (queue.length) {
      timer = setTimeout(flush, Math.max(0, queue[0].due - now));
    } else if (waitingForScore) {
      scoreDrawing();
    }
  }

  function enqueue(mode, point) {
    const delay = delays[trial];
    if (!delay) return applyPoint({ mode, ...point });
    queue.push({ mode, ...point, due: performance.now() + delay });
    if (timer === undefined) timer = setTimeout(flush, delay);
  }

  function pointFrom(event) {
    const box = drawing.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width, (event.clientX - box.left) * width / box.width)),
      y: Math.max(0, Math.min(height, (event.clientY - box.top) * height / box.height)),
    };
  }

  drawing.addEventListener("pointerdown", event => {
    if (!accepting || pointer !== undefined || !event.isPrimary || event.button !== 0) return;
    if (keyPen) enqueue("up", keyPoint);
    keyPen = false;
    pointer = event.pointerId;
    drawing.setPointerCapture(pointer);
    enqueue("down", pointFrom(event));
  });
  drawing.addEventListener("pointermove", event => {
    if (!accepting || !event.isPrimary) return;
    enqueue(pointer === event.pointerId ? "stroke" : "hover", pointFrom(event));
  });
  function liftPointer(event) {
    if (pointer !== event.pointerId) return;
    pointer = undefined;
    if (accepting) enqueue("up", pointFrom(event));
  }
  drawing.addEventListener("pointerup", liftPointer);
  drawing.addEventListener("pointercancel", liftPointer);
  drawing.addEventListener("lostpointercapture", liftPointer);
  drawing.addEventListener("pointerleave", () => { if (accepting && pointer === undefined) enqueue("hide"); });
  drawing.addEventListener("keydown", event => {
    if (!accepting || pointer !== undefined) return;
    const directions = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] };
    if (Object.hasOwn(directions, event.key)) {
      event.preventDefault();
      const [dx, dy] = directions[event.key];
      keyPoint = { x: Math.max(0, Math.min(width, keyPoint.x + dx)), y: Math.max(0, Math.min(height, keyPoint.y + dy)) };
      enqueue(keyPen ? "stroke" : "hover", keyPoint);
    } else if (event.key === " ") {
      event.preventDefault();
      if (event.repeat) return;
      keyPen = !keyPen;
      enqueue(keyPen ? "down" : "up", keyPoint);
    }
  });

  function maskOf(canvasContext) {
    const pixels = canvasContext.getImageData(0, 0, width, height).data;
    return Uint8Array.from({ length: width * height }, (_, index) => Number(pixels[index * 4 + 3] > 100));
  }

  function nearbyMask(mask) {
    const distance = Uint8Array.from(mask, pixel => pixel ? 0 : 30);
    for (let i = 0; i < distance.length; i++) {
      if (i % width) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
      if (i >= width) distance[i] = Math.min(distance[i], distance[i - width] + 1);
    }
    for (let i = distance.length - 1; i >= 0; i--) {
      if (i % width < width - 1) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
      if (i + width < distance.length) distance[i] = Math.min(distance[i], distance[i + width] + 1);
    }
    return distance;
  }

  function coverage(source, target) {
    let total = 0;
    let matches = 0;
    for (let index = 0; index < source.length; index++) {
      if (source[index]) {
        total += 1;
        matches += Number(target[index] <= 8);
      }
    }
    return total ? matches / total : 0;
  }

  function scoreDrawing() {
    waitingForScore = false;
    const attempt = maskOf(context);
    if (!attempt.some(Boolean)) {
      accepting = true;
      check.disabled = false;
      clear.disabled = false;
      feedback.textContent = "Faça um traço antes de conferir.";
      return;
    }
    const example = maskOf(model);
    const precision = coverage(attempt, nearbyMask(example));
    const recall = coverage(example, nearbyMask(attempt));
    const score = precision + recall ? Math.round(200 * precision * recall / (precision + recall)) : 0;
    scores[trial] = score;
    cursor.hidden = true;
    feedback.textContent = `${score}% de semelhança`;
    check.hidden = true;
    next.textContent = trial === delays.length - 1 ? "Comparar tentativas" : "Próximo atraso";
    next.hidden = false;
    next.focus();
    report("lag-scored", { trial, delay: delays[trial], score, scores: [...scores] });
  }

  check.addEventListener("click", () => {
    accepting = false;
    check.disabled = true;
    clear.disabled = true;
    if (queue.length) {
      waitingForScore = true;
      feedback.textContent = "Esperando o último traço…";
    } else {
      scoreDrawing();
    }
  });
  clear.addEventListener("click", () => {
    resetBoard();
    feedback.textContent = "";
    drawing.focus({ preventScroll: true });
  });
  next.addEventListener("click", () => {
    if (trial < delays.length - 1) {
      trial += 1;
      showTrial();
      return;
    }
    round.hidden = true;
    results.hidden = false;
    const list = get("lag-scores");
    list.replaceChildren();
    delays.forEach((delay, index) => {
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = `${delay} ms`;
      description.textContent = `${scores[index]}%`;
      list.append(term, description);
    });
    try { localStorage.setItem("front-arcade.lag-lab.completed.v1", "true"); } catch { /* The current result still displays. */ }
    unlock();
    get("lag-result-title").focus();
    report("lag-finished", { scores: [...scores] });
  });

  function showIntro() {
    accepting = false;
    resetBoard();
    intro.hidden = false;
    round.hidden = true;
    results.hidden = true;
    get("lag-title").focus();
  }
  function closeGame() {
    accepting = false;
    resetBoard();
    game.hidden = true;
    library.hidden = false;
  }
  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    showIntro();
    report("lag-opened");
  });
  get("start-lag").addEventListener("click", () => {
    intro.hidden = true;
    round.hidden = false;
    trial = 0;
    scores = [];
    showTrial();
  });
  get("again-lag").addEventListener("click", showIntro);
  get("back-from-lag").addEventListener("click", () => { closeGame(); play.focus(); });
  const gamesWindow = get("games-window");
  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) closeGame();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("frontarcade:popups-completed", unlock);
  if (readFlag("front-arcade.popups-infinitos.completed.v1")) unlock();
})();
