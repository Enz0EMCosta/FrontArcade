(() => {
  const get = id => document.getElementById(id);
  const game = get("popup-game");
  const gamesWindow = get("games-window");
  const library = get("game-library");
  const play = get("play-popups");
  const lobby = get("popup-lobby");
  const round = get("popup-round");
  const result = get("popup-end");
  const layer = get("popup-layer");
  const alert = get("popup-reboot");
  const form = get("patience-form");
  const fields = [...form.querySelectorAll("fieldset")];
  const name = get("patience-name");
  const year = get("patience-year");
  const phone = get("patience-phone");
  const next = get("patience-next");
  const feedback = get("patience-feedback");
  const duration = 40;
  const spawnInterval = 1700;
  const completionKey = "front-arcade.popups-infinitos.completed.v1";
  const instagram = "https://www.instagram.com/lawd.ufs/";
  const stageNotice = { heading: "Oficina da SEMAC", action: "Ver detalhes da oficina", kind: "surprise", photo: "pedro" };
  const notices = [
    { heading: "Venha fazer parte da LAWD", action: "Conheça a liga", kind: "social", photo: "enzo", featured: true },
    { heading: "Atualização da ficha", action: "Reiniciar formulário", kind: "reset" },
    { heading: "Bastidores da SEMAC", action: "Ver Instagram da LAWD", kind: "social" },
    { heading: "Conheça a equipe", action: "Ver bastidores da LAWD", kind: "social", photo: "equipe", featured: true },
    { heading: "Introdução à Web", action: "Acompanhe a LAWD", kind: "social", photo: "lauane" },
    { heading: "Sessão da oficina", action: "Voltar à primeira etapa", kind: "reset" },
  ];
  const slots = [5, 4, 1, 0, 2, 3];
  let running = false;
  let timer;
  let deadline;
  let lastSpawn;
  let sequence;
  let step = 0;
  let phoneNumber = 0;

  const report = (type, detail = {}) => document.dispatchEvent(new CustomEvent("frontarcade:event", { detail: { type, ...detail } }));

  function completedBefore() {
    try {
      return localStorage.getItem(completionKey) === "true";
    } catch {
      return false;
    }
  }

  function formatPhone() {
    return `0000-00${String(phoneNumber).padStart(2, "0")}`;
  }

  function changePhone(amount) {
    phoneNumber = Math.max(0, Math.min(99, phoneNumber + amount));
    phone.value = formatPhone();
  }

  function renderStep(focus = true) {
    fields.forEach((field, index) => { field.hidden = index !== step; });
    get("popup-step").textContent = `Etapa ${step + 1} de 4 · ${fields[step].querySelector("legend").textContent}`;
    get("patience-back").hidden = step === 0;
    next.textContent = step === fields.length - 1 ? "Enviar ficha" : "Avançar";
    if (step === 3) {
      const review = get("patience-review");
      review.replaceChildren();
      for (const [label, value] of [["Nome", name.value || "Em branco"], ["Ano", year.value], ["Telefone", formatPhone()]]) {
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = label;
        detail.textContent = value;
        review.append(term, detail);
      }
    }
    renderStageNotice();
    if (focus) (fields[step].querySelector("input, button") ?? next).focus({ preventScroll: true });
  }

  function resetForm(message = "") {
    form.reset();
    changePhone(-99);
    get("patience-year-value").value = year.value;
    step = 0;
    renderStep();
    feedback.textContent = message;
  }

  function removeNotice(notice, restoreFocus = false) {
    if (restoreFocus && notice.contains(document.activeElement)) {
      (fields[step].querySelector("input, button") ?? next).focus({ preventScroll: true });
    }
    notice.remove();
  }

  function createNotice(notice, slot) {
    const card = document.createElement("article");
    card.className = "popup-notice";
    if (slot !== undefined) card.dataset.slot = String(slot);
    card.classList.toggle("is-featured", Boolean(notice.featured));
    const bar = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = notice.photo ? "Publicidade · LAWD" : notice.heading;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", `Fechar ${notice.heading}`);
    close.addEventListener("click", () => removeNotice(card, true));
    bar.append(title, close);
    const action = document.createElement(notice.kind === "social" ? "a" : "button");
    if (notice.photo) {
      const photo = document.createElement("img");
      photo.src = `./assets/lawd-${notice.photo}.webp`;
      photo.alt = "";
      photo.dataset.photo = notice.photo;
      const copy = document.createElement("span");
      const headline = document.createElement("strong");
      headline.textContent = notice.heading;
      const cta = document.createElement("span");
      cta.className = "popup-ad-cta";
      cta.textContent = notice.action;
      copy.append(headline, cta);
      action.className = "popup-ad";
      action.append(photo, copy);
    } else {
      action.textContent = notice.action;
    }
    if (notice.kind === "social") {
      action.href = instagram;
      action.target = "_blank";
      action.rel = "noopener noreferrer";
      action.setAttribute("aria-label", `${notice.action} (nova aba)`);
      action.addEventListener("click", () => setTimeout(() => removeNotice(card, true), 0));
    } else {
      action.type = "button";
      action.addEventListener("click", () => {
        removeNotice(card, true);
        if (notice.kind === "surprise") {
          clearInterval(timer);
          running = false;
          alert.showModal();
          report("popups-virus");
        } else {
          resetForm("A ficha voltou para a primeira etapa.");
          report("popups-trap");
        }
      });
    }
    card.append(bar, action);
    return card;
  }

  function spawnNotice() {
    for (let offset = 0; offset < slots.length; offset++) {
      const slot = slots[(sequence + offset) % slots.length];
      const previous = layer.querySelector(`[data-slot="${slot}"]`);
      if (previous?.contains(document.activeElement)) continue;
      previous?.remove();
      const notice = notices[sequence % notices.length];
      sequence = (sequence + offset + 1) % notices.length;
      layer.append(createNotice(notice, slot));
      return;
    }
  }

  function placeStageNotice() {
    const card = layer.querySelector(".stage-notice");
    if (!card) return;
    const control = (step === 0 ? name : next).getBoundingClientRect();
    const bounds = layer.getBoundingClientRect();
    const action = card.querySelector(".popup-ad");
    const x = control.left + control.width / 2 - bounds.left - card.offsetWidth / 2;
    const y = control.top + control.height / 2 - bounds.top - action.offsetTop - action.offsetHeight / 2;
    card.style.left = `${Math.max(4, Math.min(x, bounds.width - card.offsetWidth - 4))}px`;
    card.style.top = `${Math.max(4, Math.min(y, bounds.height - card.offsetHeight - 4))}px`;
  }

  function renderStageNotice() {
    layer.querySelector(".stage-notice")?.remove();
    if (!running || (step !== 0 && step !== 3)) return;
    const card = createNotice(stageNotice);
    card.classList.add("stage-notice");
    layer.append(card);
    placeStageNotice();
  }

  function tick() {
    const now = performance.now();
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    get("popup-clock").textContent = `${seconds} s`;
    if (!seconds) {
      finish(false);
    } else if (now - lastSpawn >= spawnInterval) {
      lastSpawn = now;
      spawnNotice();
    }
  }

  function start() {
    if (play.disabled) return;
    stop();
    lobby.hidden = true;
    result.hidden = true;
    round.hidden = false;
    running = true;
    sequence = 0;
    resetForm();
    deadline = performance.now() + duration * 1000;
    lastSpawn = performance.now();
    for (let index = 0; index < 3; index++) spawnNotice();
    tick();
    timer = setInterval(tick, 200);
  }

  function stop() {
    clearInterval(timer);
    running = false;
    layer.replaceChildren();
    if (alert.open) alert.close();
  }

  function finish(won) {
    stop();
    round.hidden = true;
    result.hidden = false;
    get("popup-end-title").textContent = won ? "Ficha enviada!" : "O tempo acabou";
    get("popup-end-message").textContent = won
      ? "Você concluiu o formulário apesar das interrupções."
      : "Você pode tentar novamente e comparar quais interrupções mais atrasaram a tarefa.";
    if (won) {
      try { localStorage.setItem(completionKey, "true"); } catch { /* The current result still displays. */ }
      document.dispatchEvent(new Event("frontarcade:popups-completed"));
      play.textContent = "Jogar novamente";
    }
    get("popup-end-title").focus();
    report("popups-ended", { won });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!running) return;
    if (performance.now() >= deadline) {
      finish(false);
      return;
    }
    feedback.textContent = "";
    if (step < fields.length - 1) {
      step += 1;
      renderStep();
    } else if (name.value.trim().toLocaleLowerCase("pt-BR") === "lia" && year.valueAsNumber === 2004 && phoneNumber === 12) {
      finish(true);
    } else {
      resetForm("Envio recusado. Preencha a ficha novamente.");
      report("popups-refused");
    }
  });
  year.addEventListener("input", () => { get("patience-year-value").value = year.value; });
  get("patience-plus").addEventListener("click", () => changePhone(1));
  get("patience-minus").addEventListener("click", () => changePhone(-1));
  get("patience-back").addEventListener("click", () => {
    if (step === 0) return;
    step -= 1;
    renderStep();
  });
  get("start-popups").addEventListener("click", start);
  get("retry-popups").addEventListener("click", start);
  play.addEventListener("click", () => {
    if (play.disabled) return;
    library.hidden = true;
    game.hidden = false;
    get("popup-game-title").focus();
    report("popups-opened");
  });
  get("back-from-popups").addEventListener("click", () => {
    resetGameView();
    play.focus();
  });
  alert.addEventListener("cancel", event => event.preventDefault());
  get("confirm-reboot").addEventListener("click", () => window.location.reload());

  function resetGameView() {
    stop();
    game.hidden = true;
    round.hidden = true;
    result.hidden = true;
    lobby.hidden = false;
    library.hidden = false;
  }

  new MutationObserver(() => {
    if (gamesWindow.hidden && !game.hidden) resetGameView();
  }).observe(gamesWindow, { attributes: true, attributeFilter: ["hidden"] });
  new ResizeObserver(placeStageNotice).observe(layer);
  if (completedBefore()) play.textContent = "Jogar novamente";
})();
