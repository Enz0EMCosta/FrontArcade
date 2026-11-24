// Pepi Bolota on the desktop. After the avatar is saved he lives on top of the taskbar:
// he rolls around as a ball (and turns back into the robot when he stops), follows the
// pointer with his eyes, naps when nobody plays and reacts to the games with short lines
// in a speech bubble. While a window is open he keeps to the free space beside it (or
// peeks up from behind the taskbar), so he never covers the game, and his bubble lets
// clicks through. He can be picked up and dragged around: he dangles from where he was
// grabbed (by the feet he hangs upside down), and falls back to the taskbar when let go.
//
// The games report their moments with `frontarcade:event` (see app.js and each game).
// Recorded clips come from assets/pepi/falas.json, under the same ids as `lines` below;
// a line without its clip is shown as a caption only.
(() => {
  const P = window.PepiBolota;
  const desktop = document.getElementById("arcade-desktop");
  if (!P || !desktop) return;

  const taskbar = desktop.querySelector(".taskbar");
  const windows = [...desktop.querySelectorAll(".workspace > .window")];
  const gamesShortcut = desktop.querySelector(".desktop-shortcut[data-games]");
  const profileAvatar = document.getElementById("profile-avatar");
  const rebootDialog = document.getElementById("popup-reboot");
  const rebootButton = document.getElementById("confirm-reboot");
  const reduceMotion = P.reduceMotion;
  const prefKey = "front-arcade.pepi.companion.v1";
  const manifestUrl = "./assets/pepi/falas.json";

  // priority: 1 small talk, 2 guidance, 3 milestones. A new line replaces one of the same
  // or lower priority and is dropped otherwise. `face` and `act` start with the line,
  // `end` is the face he keeps afterwards, `brows` "worried" makes him empathetic.
  // The texts match the recordings word for word.
  const lines = {
    saved: { text: "Caramba, então você é assim? Nossa… acho que o meu coração de lata bateu mais forte!", face: "love", act: "heart", end: "happy", priority: 3 },
    restyled: { text: "Visual novo? Ficou incrível! Por um segundo, eu quase não te reconheci!", face: "star", act: "cheer", end: "happy", priority: 3 },
    welcome: { text: "Essa aqui é a nossa área de trabalho! Os jogos ficam bem ali, ó. Eu vou ficar dando umas voltinhas por aqui. Se quiser companhia, é só clicar em mim!", face: "happy", act: "point", end: "happy", priority: 2 },
    gamesOpen: { text: "Uau, quanto jogo! Comece pelo Olhar Afiado: os outros vão sendo desbloqueados pelo caminho.", face: "wide", act: "hop", end: "happy", priority: 2 },
    colorOpen: { text: "Olhar Afiado! Repare na matiz, na saturação e na luminosidade. Ai, ai… os seus olhos são o melhor conta-gotas de todos!", face: "star", act: "hop", end: "happy", priority: 2 },
    colorHit: { text: "Acertou em cheio! Que olhar afiado você tem, hein?", face: "star", act: "cheer", end: "happy", priority: 3 },
    colorHit2: { text: "Na mosca! Essa cor ficou idêntica!", face: "wink", act: "cheer", end: "happy", priority: 3 },
    colorClose: { text: "Quase lá! Só mais um tiquinho de ajuste.", face: "wide", act: "hop", end: "happy", priority: 2 },
    colorStuck: { text: "Ei, tá tudo bem. Cor engana mesmo! Tenta mexer só na luminosidade primeiro.", face: "happy", brows: "worried", act: "comfort", end: "happy", priority: 2 },
    cheerUp: { text: "Respira fundo. Errar faz parte, até os meus papais erram… e muito! Eu acredito em você.", face: "happy", brows: "worried", act: "comfort", end: "love", priority: 2 },
    colorUnlock: { text: "Parabéns! Dez acertos! Você desbloqueou os Pop-ups Infinitos. Que orgulho!", face: "star", act: "party", end: "love", priority: 3 },
    popupsOpen: { text: "Os Pop-ups Infinitos! Feche os anúncios pelo xis e não clique em nada com pressa. Tô torcendo por você!", face: "wink", act: "hop", end: "happy", priority: 2 },
    popupsTrap: { text: "Ai, ai! Aquele anúncio era uma pegadinha. Viu como dá raiva perder tudo o que você preencheu?", face: "oops", act: "oops", end: "unsure", priority: 2 },
    popupsRefused: { text: "Opa, algum dado não bateu com a ficha. Confere com calma, sem pressa.", face: "sad", brows: "worried", act: "comfort", end: "happy", priority: 2 },
    popupsVirus: { text: "Eita! Esse anúncio era perigoso! Na vida real, sempre desconfie de avisos assim.", face: "wide", act: "oops", end: "wide", priority: 3 },
    popupsReboot: { text: "Alerta, alerta! O vírus tomou conta da simulação. Mas calma: as suas conquistas estão salvas! Clique em “Reiniciar Front Arcade” e a gente começa de novo, novinho em folha.", face: "wide", brows: "worried", act: "pointReboot", end: "wide", priority: 3 },
    popupsTimeout: { text: "O tempo acabou, mas a culpa é dos pop-ups, não sua! Bora mais uma?", face: "sad", brows: "worried", act: "comfort", end: "happy", priority: 3 },
    popupsWin: { text: "Ficha enviada! Você venceu os pop-ups infinitos! Que paciência de monge!", face: "star", act: "party", end: "love", priority: 3 },
    lagOpen: { text: "Lag Lab! Desenhe com calma e repare: quando a tela demora para responder, tudo fica mais difícil.", face: "happy", act: "hop", end: "happy", priority: 2 },
    lagSlow: { text: "Sentiu o atraso? Não é a sua mão, é a interface! É por isso que cada milissegundo importa.", face: "wide", act: "nod", end: "happy", priority: 2 },
    lagDone: { text: "Experimento concluído! Agora você sabe por que site rápido é site gostoso de usar.", face: "star", act: "party", end: "happy", priority: 3 },
    builderOpen: { text: "Construa Meu Site! Aqui quem manda é você! Solta essa criatividade!", face: "star", act: "cheer", end: "happy", priority: 2 },
    builderExport: { text: "Seu site está prontinho! Agora é só mostrar para todo mundo!", face: "love", act: "party", end: "happy", priority: 3 },
    aboutUs: { text: "Esses são os meus papais! Eles são engraçados, né?", face: "love", act: "heart", end: "happy", priority: 2 },
    idle: { text: "Ei! Os jogos estão te esperando. Vamos jogar?", face: "wink", act: "wave", end: "happy", priority: 1 },
    poke: { text: "Hahaha! Ei, isso faz cócegas!", face: "laugh", act: "giggle", end: "happy", priority: 1 },
    poke2: { text: "Hihi! Tô aqui, tô aqui!", face: "laugh", act: "wave", end: "happy", priority: 1 },
    wakeUp: { text: "Hã? Eu não tava dormindo, não! Só… descansando a tela.", face: "wide", act: "startle", end: "shy", priority: 1 },
    goodbye: { text: "Já vai descansar? Tudo bem! Eu fico aqui te esperando. Você é a minha melhor companhia, sabia?", face: "happy", act: "wave", end: "love", priority: 1 },
    grabbed: { text: "Ei, ei… pra onde você tá me levando? Tô de olho em você, hein!", face: "squint", end: "squint", priority: 1 },
    upsideDown: { text: "Opa, opa! Tá tudo de cabeça pra baixo! Me desvira, por favor!", face: "oops", end: "shy", priority: 2 },
    landed: { text: "Ufa… pousei! Da próxima vez, avisa antes, tá?", face: "oops", brows: "worried", end: "shy", priority: 1 },
  };

  /* ---------- Markup ---------- */

  const root = document.createElement("div");
  root.className = "pepi-pal";
  root.hidden = true;
  root.innerHTML = `
    <div class="pepi-pal-ground">
      <div class="pepi-pal-walker">
        <div class="pepi-pal-body">
          <div class="pepi pepi-pal-bot" data-face="happy" aria-hidden="true">${P.markup()}</div>
        </div>
      </div>
    </div>
    <div class="pepi-pal-bubble" hidden aria-hidden="true">
      <p class="pepi-pal-name">Pepi Bolota</p>
      <p class="pepi-pal-text"></p>
    </div>
    <p class="intro-sr" aria-live="polite"></p>`;
  document.body.append(root);
  const ground = root.querySelector(".pepi-pal-ground");
  const walker = root.querySelector(".pepi-pal-walker");
  const body = root.querySelector(".pepi-pal-body");
  const bot = root.querySelector(".pepi-pal-bot");
  const bubble = root.querySelector(".pepi-pal-bubble");
  const bubbleText = root.querySelector(".pepi-pal-text");
  const live = root.querySelector("[aria-live]");
  const art = () => bot.querySelector(".pepi-art");
  const part = selector => bot.querySelector(`.pepi-robot ${selector}`);
  const arm = side => part(`.pepi-arm-${side}`);
  const ball = () => bot.querySelector(".pepi-ball-spin");

  // Taskbar control: show or hide Pepi and turn his voice on or off.
  const tray = document.createElement("div");
  tray.className = "pepi-tray";
  tray.innerHTML = `
    <button class="pepi-tray-button" type="button" aria-expanded="false" aria-controls="pepi-tray-menu" title="Pepi Bolota">
      <span class="pepi-tray-icon" data-face="happy" aria-hidden="true">${P.markup("1 -1 46 46")}</span>
      <span class="intro-sr">Opções do Pepi Bolota</span>
    </button>
    <div id="pepi-tray-menu" class="pepi-tray-menu" hidden>
      <p class="pepi-tray-title">Pepi Bolota</p>
      <label class="pepi-switch"><span>Pepi na tela</span><input type="checkbox" role="switch" data-pref="visible"></label>
      <label class="pepi-switch"><span>Voz do Pepi</span><input type="checkbox" role="switch" data-pref="voice"></label>
    </div>`;
  desktop.querySelector(".system-status").prepend(tray);
  const trayButton = tray.querySelector(".pepi-tray-button");
  const trayMenu = tray.querySelector(".pepi-tray-menu");
  const visibleSwitch = tray.querySelector("[data-pref=visible]");
  const voiceSwitch = tray.querySelector("[data-pref=voice]");

  /* ---------- State ---------- */

  let enabled = readPreference();
  let present = false;
  let arriving = null;
  let x = innerWidth - 140; // centre of Pepi, in viewport pixels
  let lift = 0; // how high above the floor, while held or falling
  let tucked = false;
  let travelling = null; // { move, spin }
  let travelToken = 0;
  let morphs = []; // the robot -> ball animations in progress
  let talking = null; // { line, controller }
  let sleeping = false;
  let held = null; // being dragged
  let flying = null; // falling after being let go
  let landing = false;
  let alarm = null; // "pending" while the virus alert shakes in, then "on"
  let snoreTimer = 0;
  let wanderTimer = 0;
  let faceTimer = 0;
  let lastInput = performance.now();
  let lastTickle = 0;
  let pokeTurn = 0;
  let dragged = false;
  const said = new Map(); // line id -> when it was last said
  const score = { colorMisses: 0, colorHits: 0, popupsLosses: 0, played: false, lagSlowSaid: false };
  const busy = () => Boolean(held || flying || landing);

  function readPreference() {
    try { return localStorage.getItem(prefKey) !== "off"; } catch { return true; }
  }

  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(() => { signal?.removeEventListener("abort", stop); resolve(); }, ms);
    const stop = () => { clearTimeout(id); reject(signal.reason); };
    signal?.addEventListener("abort", stop, { once: true });
  });

  function animate(element, keyframes, options) {
    if (!element) return Promise.resolve();
    return element.animate(keyframes, { fill: "none", easing: "ease", ...options, duration: reduceMotion.matches ? 1 : options.duration })
      .finished.catch(() => {});
  }

  /* ---------- Where he can stand ---------- */

  const width = () => bot.offsetWidth;
  const height = () => bot.offsetHeight;
  // The virus alert counts as the open window: he stands beside it, not over it.
  const openWindow = () => (rebootDialog?.open ? rebootDialog : windows.find(item => !item.hidden));
  const coversScreen = () => Boolean(document.fullscreenElement) || Boolean(desktop.querySelector(".window.window-expanded:not([hidden])"));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // He follows the top layer: inside the virus alert or a fullscreen window, otherwise
  // the page. While the alert still shakes into place (its transform would move him
  // along) he waits outside.
  function rehost() {
    const inAlert = rebootDialog?.open && alarm !== "pending";
    const host = inAlert ? rebootDialog : document.fullscreenElement ?? document.body;
    if (root.parentElement !== host) {
      stopTravel();
      host.append(root);
    }
    root.style.setProperty("--ground", `${floor()}px`);
  }

  // How much of the taskbar shows at the bottom of the screen (a tall window can push it
  // below the fold); he stands on it, or on the bottom edge of the screen.
  function floor() {
    if (coversScreen()) return 0;
    return Math.round(clamp(innerHeight - taskbar.getBoundingClientRect().top, 0, taskbar.offsetHeight));
  }
  const groundY = () => innerHeight - floor();

  // The stretch of floor he may roll on: the whole taskbar, or the free space beside an
  // open window. Without room he "tucks": only his head peeks up in the corner.
  function zone() {
    const half = width() / 2;
    const edge = 18;
    const corner = { from: innerWidth - width() * .42, to: innerWidth - width() * .42, tuck: true, gaps: [] };
    const open = openWindow();
    if (coversScreen() && open !== rebootDialog) return corner;
    if (!open) return { from: half + edge, to: innerWidth - half - edge, tuck: false, gaps: [] };
    const box = open.getBoundingClientRect();
    const gaps = [
      { from: box.right + half + 10, to: innerWidth - half - edge, side: "right" },
      { from: half + edge, to: box.left - half - 10, side: "left" },
    ].filter(gap => gap.to >= gap.from);
    if (!gaps.length) return corner;
    const distance = gap => x < gap.from ? gap.from - x : x > gap.to ? x - gap.to : 0;
    const current = gaps.reduce((best, gap) => distance(gap) < distance(best) ? gap : best);
    return { ...current, tuck: false, gaps };
  }

  const place = (value, up = 0) => `translate(${Math.round(value - width() / 2)}px, ${Math.round(-up)}px)`;

  function setTuck(value) {
    tucked = value;
    root.classList.toggle("is-tucked", value);
    body.style.setProperty("--sink", value ? `${Math.round(height() * .52)}px` : "0px");
  }

  // While talking in the corner he rises a little so his face is fully visible.
  function rise(value) {
    if (!tucked) return;
    body.style.setProperty("--sink", `${Math.round(height() * (value ? .2 : .52))}px`);
  }

  /* ---------- Robot <-> ball ---------- */

  function flash() {
    if (reduceMotion.matches) return;
    const ring = document.createElement("span");
    ring.className = "pepi-flash";
    bot.append(ring);
    ring.animate([
      { transform: "translate(-50%, -50%) scale(.3)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0 },
    ], { duration: 420, easing: "ease-out" }).finished.then(() => ring.remove(), () => ring.remove());
  }

  // A few puffs of dust behind him when he speeds off or lands.
  function dust(direction = 0) {
    if (reduceMotion.matches) return;
    const sides = direction ? [-direction] : [-1, 1];
    for (const side of sides) {
      for (let index = 0; index < 3; index++) {
        const puff = document.createElement("span");
        puff.className = "pepi-pal-dust";
        puff.style.left = `${Math.round(x + side * width() * .28)}px`;
        ground.append(puff);
        puff.animate([
          { transform: "translate(-50%, 0) scale(.4)", opacity: .9 },
          { transform: `translate(calc(-50% + ${side * (18 + index * 16)}px), -${6 + index * 7}px) scale(${1.1 - index * .15})`, opacity: 0 },
        ], { duration: 460 + index * 90, easing: "ease-out" }).finished.then(() => puff.remove(), () => puff.remove());
      }
    }
  }

  function trackPart(selector, keyframes, options) {
    const element = part(selector);
    if (!element) return Promise.resolve();
    const run = element.animate(keyframes, { duration: 190, easing: "cubic-bezier(.55, 0, .8, .2)", fill: "forwards", ...options });
    morphs.push(run);
    return run.finished.catch(() => {});
  }

  function cancelMorph() {
    for (const run of morphs) run.cancel();
    morphs = [];
    bot.classList.remove("is-morphing");
  }

  // Robot -> ball: the screen switches off, antenna, arms, ears and feet retract into
  // the body one after another, the body squashes round and pops into the ball.
  async function curl(token) {
    if (bot.classList.contains("is-ball")) return;
    bot.classList.add("is-morphing");
    look(0, 0);
    await Promise.all([
      trackPart(".pepi-face", [{ opacity: 1 }, { opacity: .2 }, { opacity: 0 }], { duration: 150, easing: "steps(2, end)" }),
      trackPart(".pepi-antenna", [{ transform: "none" }, { transform: "translateY(7px) scale(.3)" }]),
      // Arms are pulled in towards the belly as they shrink (SVG units).
      trackPart(".pepi-arm-left", [{ transform: "none" }, { transform: "translate(12px, -4px) rotate(-30deg) scale(0)" }], { delay: 40 }),
      trackPart(".pepi-arm-right", [{ transform: "none" }, { transform: "translate(-12px, -4px) rotate(30deg) scale(0)" }], { delay: 40 }),
      trackPart(".pepi-ear-left", [{ transform: "scale(1)" }, { transform: "scale(0)" }], { delay: 100 }),
      trackPart(".pepi-ear-right", [{ transform: "scale(1)" }, { transform: "scale(0)" }], { delay: 100 }),
      trackPart(".pepi-feet", [{ transform: "none" }, { transform: "translateY(-6px) scaleY(0)" }], { delay: 130 }),
      trackPart(".pepi-core", [
        { transform: "scale(1)" }, { transform: "scale(1.06, .9)", offset: .5 }, { transform: "scale(.8) rotate(-10deg)" },
      ], { duration: 320, delay: 40 }),
    ]);
    if (token !== travelToken) return;
    bot.classList.add("is-ball");
    cancelMorph();
    P.sfx("pop");
    flash();
    await animate(ball(), [
      { transform: "scale(.7) rotate(-70deg)" }, { transform: "scale(1.14, .88) rotate(0)", offset: .6 }, { transform: "scale(1)" },
    ], { duration: 260, easing: "cubic-bezier(.3, 1.4, .5, 1)" });
  }

  // Ball -> robot: a squash, a pop, and every part springs back out, the screen last.
  async function unfold() {
    await animate(ball(), [{ transform: "scale(1)" }, { transform: "scale(1.15, .85)" }, { transform: "scale(.92, 1.08)" }], { duration: 160 });
    P.sfx("pop");
    flash();
    bot.classList.remove("is-ball");
    bot.classList.add("is-morphing");
    const spring = "cubic-bezier(.3, 1.5, .5, 1)";
    const pop = (selector, keyframes, delay) => animate(part(selector), keyframes, { duration: 340, delay, easing: spring, fill: "backwards" });
    const grow = [{ transform: "scale(0)" }, { transform: "scale(1)" }];
    await Promise.all([
      animate(part(".pepi-core"), [{ transform: "scale(.8)" }, { transform: "scale(1.07)", offset: .6 }, { transform: "scale(1)" }], { duration: 420 }),
      pop(".pepi-feet", [{ transform: "translateY(-6px) scaleY(0)" }, { transform: "translateY(0) scaleY(1)" }], 80),
      pop(".pepi-ear-left", grow, 140),
      pop(".pepi-ear-right", grow, 140),
      pop(".pepi-arm-left", grow, 200),
      pop(".pepi-arm-right", grow, 240),
      pop(".pepi-antenna", [{ transform: "translateY(7px) scale(.3)" }, { transform: "translateY(0) scale(1)" }], 300),
      animate(part(".pepi-face"), [{ opacity: 0 }, { opacity: 0, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: .3, offset: .75 }, { opacity: 1 }], { duration: 520 }),
    ]);
    bot.classList.remove("is-morphing");
  }

  function stopTravel() {
    travelToken += 1;
    if (travelling) {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(walker).transform);
      x = matrix.m41 + width() / 2;
      travelling.move.cancel();
      travelling.spin?.cancel();
      travelling = null;
      walker.style.transform = place(x, lift);
    }
    if (morphs.length || bot.classList.contains("is-ball")) {
      cancelMorph();
      bot.classList.remove("is-ball");
    }
  }

  // Every trip is made as a ball: he curls up, revs in place, rolls and unfolds.
  async function travel(target) {
    stopTravel();
    const token = travelToken;
    const distance = Math.abs(target - x);
    if (distance < 4) return;
    if (reduceMotion.matches) {
      x = target;
      walker.style.transform = place(x);
      return;
    }
    const direction = Math.sign(target - x);
    look(direction * 2, 0);
    await curl(token);
    if (token !== travelToken) return;
    dust(direction);
    const rev = 220; // ms spinning on the spot before he shoots off
    const roll = Math.max(420, distance / 520 * 1000);
    const duration = rev + roll;
    const start = rev / duration;
    const turns = distance / (Math.PI * width() * .66) * 360 * direction;
    const easing = "cubic-bezier(.35, 0, .3, 1)";
    const run = {
      move: walker.animate([
        { transform: place(x), offset: 0 }, { transform: place(x), offset: start, easing }, { transform: place(target) },
      ], { duration, fill: "forwards" }),
      spin: ball().animate([
        { transform: "rotate(0)", offset: 0, easing: "ease-in" },
        { transform: `rotate(${direction * 260}deg)`, offset: start, easing },
        { transform: `rotate(${direction * 260 + turns}deg)` },
      ], { duration }),
    };
    travelling = run;
    try {
      await run.move.finished;
    } catch {
      return; // stopTravel() already settled the position
    }
    if (travelling !== run) return;
    travelling = null;
    x = target;
    walker.style.transform = place(x);
    run.move.cancel();
    await unfold();
    look(0, 0);
  }

  /* ---------- Face and gestures ---------- */

  function face(expression, hold = 0) {
    clearTimeout(faceTimer);
    bot.dataset.face = expression;
    if (hold) faceTimer = setTimeout(() => { if (!talking && !sleeping && !busy()) bot.dataset.face = alarm ? "wide" : "happy"; }, hold);
  }

  function brows(mood) {
    bot.classList.toggle("brows-worried", mood === "worried");
    bot.classList.toggle("brows-up", mood === "up");
  }

  function look(dx, dy) {
    bot.style.setProperty("--look-x", `${Math.round(dx)}px`);
    bot.style.setProperty("--look-y", `${Math.round(dy)}px`);
  }

  function lookAt(element) {
    const box = element?.getBoundingClientRect();
    if (!box?.width) return;
    const own = bot.getBoundingClientRect();
    look(clamp((box.left + box.width / 2 - (own.left + own.width / 2)) / 120, -2, 2), clamp((box.top + box.height / 2 - (own.top + own.height / 2)) / 120, -1, 1));
  }

  function hop(lift = 10) {
    return animate(art(), [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(2px) scale(1.06, .94)", offset: .2 },
      { transform: `translateY(-${lift}px) scale(.97, 1.04)`, offset: .55 },
      { transform: "translateY(0) scale(1)" },
    ], { duration: 420 });
  }

  const swing = (side, angles, duration) => animate(arm(side), angles.map(angle => ({ transform: `rotate(${angle}deg)` })), { duration, easing: "ease-in-out" });

  // Points the arm on that side straight at an element. Arms hang down at 0deg; the
  // CSS rotation that turns "down" towards the target is atan2(-dx, dy).
  function pointAt(element, duration = 3800) {
    const box = element?.getBoundingClientRect();
    if (!box?.width) return;
    const own = bot.getBoundingClientRect();
    const side = box.left + box.width / 2 < own.left + own.width / 2 ? "left" : "right";
    const shoulder = { x: own.left + own.width * (side === "left" ? .1 : .9), y: own.top + own.height * .58 };
    const angle = Math.atan2(-(box.left + box.width / 2 - shoulder.x), box.top + box.height / 2 - shoulder.y) * 180 / Math.PI;
    const wobble = side === "left" ? -6 : 6;
    lookAt(element);
    swing(side, [0, angle, angle + wobble, angle, angle + wobble, angle, angle + wobble, 0], duration);
  }

  // Arms pivot at the shoulder: positive angles lift the left arm outwards, negative
  // angles bring it in front of the body (and the opposite for the right arm).
  const acts = {
    hop: () => hop(12),
    wave: () => swing("left", [0, 150, 115, 150, 115, 150, 0], 1700),
    heart() {
      bot.classList.add("is-blushing", "is-loving");
      P.particles("hearts", 4, bot);
      hop(10);
      setTimeout(() => bot.classList.remove("is-blushing", "is-loving"), 2600);
    },
    cheer() {
      swing("left", [0, 160, 140, 160, 0], 1300);
      swing("right", [0, -160, -140, -160, 0], 1300);
      hop(16);
      P.particles("stars", 6, bot);
      P.sfx("sparkle");
    },
    // The big celebrations: three jumps, arms up, stars and hearts.
    async party() {
      P.sfx("reveal");
      swing("left", [0, 160, 135, 160, 135, 160, 0], 2000);
      swing("right", [0, -160, -135, -160, -135, -160, 0], 2000);
      P.particles("stars", 8, bot);
      for (let jump = 0; jump < 3; jump++) await hop(18 - jump * 4);
      P.particles("hearts", 3, bot);
    },
    // A hug for the player: arms crossed over his heart, a slow squeeze, one heart.
    comfort() {
      swing("left", [0, -40, -46, -40, -46, 0], 2400);
      swing("right", [0, 40, 46, 40, 46, 0], 2400);
      animate(art(), [
        { transform: "scale(1)" }, { transform: "scale(1.05, .95)", offset: .3 },
        { transform: "scale(1.02, .98)", offset: .6 }, { transform: "scale(1)" },
      ], { duration: 2400, easing: "ease-in-out" });
      bot.classList.add("is-loving");
      setTimeout(() => bot.classList.remove("is-loving"), 2400);
      setTimeout(() => P.particles("hearts", 1, bot), 600);
    },
    // Hands on his cheeks and a startled shake.
    oops() {
      swing("left", [0, -150, -142, -150, -142, -150, 0], 1800);
      swing("right", [0, 150, 142, 150, 142, 150, 0], 1800);
      bot.classList.add("is-nervous");
      setTimeout(() => bot.classList.remove("is-nervous"), 2400);
      animate(art(), [
        { transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" },
        { transform: "translateX(-2px)" }, { transform: "translateX(0)" },
      ], { duration: 420 });
    },
    nod() {
      const down = { transform: "translateY(4%) scale(1.03, .93)" };
      const rest = { transform: "translateY(0) scale(1)" };
      return animate(art(), [rest, down, rest, down, rest], { duration: 1100 });
    },
    giggle() {
      bot.classList.add("is-blushing");
      P.sfx("giggle");
      P.particles("giggle", 3, bot);
      swing("right", [0, 150, 140, 150, 140, 0], 1600);
      animate(art(), [0, 1, 0, 1, 0, 1, 0].map(up => ({ transform: `translateY(${up ? -3 : 0}px) rotate(${up ? 2 : 0}deg)` })), { duration: 1100 });
      setTimeout(() => bot.classList.remove("is-blushing"), 1800);
    },
    startle() {
      return animate(art(), [
        { transform: "translateY(0) scale(1)" }, { transform: "translateY(-14px) scale(.95, 1.06)", offset: .35 },
        { transform: "translateY(1px) scale(1.04, .96)", offset: .7 }, { transform: "translateY(0) scale(1)" },
      ], { duration: 460 });
    },
    // Points up at the Jogos icon, which glows for a moment.
    point() {
      pointAt(gamesShortcut);
      gamesShortcut?.classList.add("pepi-hint");
      setTimeout(() => gamesShortcut?.classList.remove("pepi-hint"), 4200);
    },
    // Points at "Reiniciar Front Arcade", which keeps pulsing while the alert is open.
    pointReboot() {
      pointAt(rebootButton, 5200);
      rebootButton?.classList.add("pepi-hint");
    },
  };

  /* ---------- Speech ---------- */

  let manifest = null;
  const clipCache = new Map();

  // Clips are decoded on first use. `null` when there is no recording (yet) for the line.
  async function clipFor(id) {
    manifest ??= fetch(manifestUrl, { cache: "no-cache" }).then(response => response.ok ? response.json() : {}).catch(() => ({}));
    const file = (await manifest)[id];
    if (typeof file !== "string" || !/^[\w-]+\.(mp3|ogg|wav)$/.test(file)) return null;
    if (!clipCache.has(id)) {
      clipCache.set(id, fetch(`./assets/pepi/${file}`)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error(file)))
        .then(data => P.audioContext()?.decodeAudioData(data) ?? null)
        .catch(() => null));
    }
    return clipCache.get(id);
  }

  // Above his head (below it when he is dragged near the top), inside the screen, with
  // the tail pointing at him. Beside an open window it grows away from the window.
  function placeBubble() {
    if (bubble.hidden) return;
    const bubbleWidth = bubble.offsetWidth;
    let centre = x;
    let headTop;
    let feet;
    if (busy()) {
      const box = bot.getBoundingClientRect();
      centre = box.left + box.width / 2;
      headTop = box.top;
      feet = box.bottom;
    } else {
      const sink = Number.parseFloat(body.style.getPropertyValue("--sink")) || 0;
      headTop = innerHeight - (floor() + height() - sink);
    }
    const open = openWindow()?.getBoundingClientRect();
    const anchor = open && centre > open.right ? .28 : .72;
    const left = clamp(centre - bubbleWidth * anchor, 12, innerWidth - bubbleWidth - 12);
    const below = feet !== undefined && headTop - bubble.offsetHeight - 22 < 8;
    bubble.classList.toggle("is-below", below);
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = below ? `${Math.round(feet + 14)}px` : "auto";
    bubble.style.bottom = below ? "auto" : `${Math.round(innerHeight - headTop + 8)}px`;
    bubble.style.setProperty("--tail-x", `${Math.round(clamp(centre - left, 26, bubbleWidth - 26))}px`);
  }

  async function openBubble() {
    if (!bubble.hidden) return;
    bubble.classList.remove("is-see-through");
    bubble.hidden = false;
    placeBubble();
    await animate(bubble, [{ opacity: 0, transform: "translateY(8px) scale(.9)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "cubic-bezier(.3, 1.5, .5, 1)" });
  }

  async function closeBubble() {
    if (bubble.hidden) return;
    await animate(bubble, [{ opacity: 1 }, { opacity: 0, transform: "translateY(4px) scale(.95)" }], { duration: 180 });
    bubble.hidden = true;
  }

  const canSay = (id, gap = 0) => !said.has(id) || performance.now() - said.get(id) >= gap;

  // Resolves true when the whole line was said, false when it was skipped or cut off.
  async function say(id) {
    const line = lines[id];
    if (!line || !enabled || !present) return false;
    if (talking && line.priority < talking.line.priority) return false;
    talking?.controller.abort();
    const controller = new AbortController();
    const { signal } = controller;
    const run = { line, controller };
    talking = run;
    said.set(id, performance.now());
    clearTimeout(wanderTimer);
    if (sleeping) wake();
    if (!busy()) stopTravel();
    let finished = false;
    try {
      rise(true);
      if (!held) look(0, 0);
      face(line.face);
      brows(line.brows);
      acts[line.act]?.();
      live.textContent = line.text;
      bubbleText.textContent = "";
      await openBubble();
      const clip = P.soundOn ? await clipFor(id) : null;
      if (signal.aborted) throw signal.reason;
      const typing = P.typewrite(line.text, signal, bubbleText);
      if (clip) {
        await Promise.all([typing, P.playClip(clip, signal, bot)]);
      } else {
        // Captions only: enough time to read the line after it is typed.
        await typing;
        await wait(1500 + line.text.length * 24, signal);
      }
      brows(null);
      face(line.end ?? "happy");
      await wait(clip ? 1300 : 500, signal);
      finished = true;
    } catch {
      // Cut off by a more important line, or Pepi was hidden.
    }
    if (talking === run) {
      talking = null;
      brows(null);
      await closeBubble();
      rise(false);
      schedule();
    }
    return finished;
  }

  function silenceLine() {
    talking?.controller.abort();
    talking = null;
    bubble.hidden = true;
  }

  /* ---------- Life on the desktop ---------- */

  function schedule(delay = 2200 + Math.random() * 3600) {
    clearTimeout(wanderTimer);
    if (present) wanderTimer = setTimeout(wander, delay);
  }

  async function wander() {
    if (!present || talking || travelling || busy() || alarm || document.hidden) return schedule();
    const idle = performance.now() - lastInput;
    if (sleeping) return schedule(6000);
    if (idle > 80000) {
      sleep();
      return schedule(6000);
    }
    const area = zone();
    if (area.tuck !== tucked) setTuck(area.tuck);
    if (x < area.from - 1 || x > area.to + 1) {
      await travel(clamp(x, area.from, area.to));
      return schedule(1200);
    }
    if (!openWindow() && idle > 40000 && canSay("idle", 240000)) {
      say("idle");
      return;
    }
    const roll = Math.random();
    if (reduceMotion.matches || area.tuck) {
      // In the corner (or with reduced motion) he only looks around.
      if (roll < .5) await lookAround();
    } else if (area.gaps.length > 1 && roll < .12) {
      // Now and then he rolls across to the space on the other side of the window.
      const other = area.gaps.find(gap => gap.from !== area.from);
      await travel(other.from + Math.random() * (other.to - other.from));
    } else if (area.to - area.from > 70 && roll < .62) {
      let target = area.from + Math.random() * (area.to - area.from);
      if (Math.abs(target - x) < 90) target = clamp(x + (target > x ? 140 : -140), area.from, area.to);
      await travel(target);
    } else if (roll < .76) {
      await lookAround();
    } else if (roll < .86) {
      await stretch();
    } else if (roll < .93) {
      face("wink", 900);
      await hop(8);
    }
    schedule();
  }

  async function lookAround() {
    look(-2, 0);
    await wait(700);
    if (talking || travelling || busy()) return;
    look(2, -1);
    await wait(700);
    if (!talking && !travelling && !busy()) look(0, 0);
  }

  async function stretch() {
    face("laugh");
    await Promise.all([
      swing("left", [0, 165, 165, 0], 1300),
      swing("right", [0, -165, -165, 0], 1300),
      animate(art(), [{ transform: "scale(1)" }, { transform: "scale(.96, 1.06)", offset: .4 }, { transform: "scale(.96, 1.06)", offset: .7 }, { transform: "scale(1)" }], { duration: 1300 }),
    ]);
    if (!talking && !busy()) face("happy");
  }

  function sleep() {
    if (sleeping) return;
    sleeping = true;
    look(0, 0);
    face("sleep");
    bot.classList.add("is-sleeping");
    snoreTimer = setInterval(snore, 1700);
  }

  function wake(quiet = false) {
    if (!sleeping) return;
    sleeping = false;
    clearInterval(snoreTimer);
    bot.classList.remove("is-sleeping");
    if (quiet) return;
    face("wide", 900);
    acts.startle();
  }

  // Little "z" letters float up while he naps.
  function snore() {
    if (reduceMotion.matches || document.hidden) return;
    const letter = document.createElement("span");
    letter.className = "pepi-pal-z";
    letter.textContent = "z";
    bot.append(letter);
    letter.animate([
      { transform: "translate(0, 0) scale(.5)", opacity: 0 },
      { transform: "translate(8px, -14px) scale(1)", opacity: 1, offset: .3 },
      { transform: "translate(26px, -60px) scale(1.3)", opacity: 0 },
    ], { duration: 2400, easing: "ease-out" }).finished.then(() => letter.remove(), () => letter.remove());
  }

  // He rolls in from the right edge, unfolds and waves.
  function arrive() {
    if (arriving) return arriving;
    if (present || !enabled || desktop.hidden) return Promise.resolve(present);
    arriving ??= (async () => {
      rehost();
      root.hidden = false;
      present = true;
      const area = zone();
      setTuck(area.tuck);
      x = innerWidth + width();
      walker.style.transform = place(x);
      face("happy");
      await travel(area.tuck ? area.from : clamp(innerWidth - width() * 1.6, area.from, area.to));
      acts.wave();
      schedule();
      arriving = null;
      return true;
    })();
    return arriving;
  }

  async function leave() {
    if (!present) return;
    silenceLine();
    clearTimeout(wanderTimer);
    wake(true);
    if (held || flying) settle();
    acts.wave();
    await wait(reduceMotion.matches ? 0 : 700);
    await travel(innerWidth + width() * 1.2);
    present = false;
    root.hidden = true;
  }

  const anyDialogOpen = () => Boolean(document.querySelector("dialog[open]:not(#popup-reboot)"));

  // Waits until the editor or the intro are closed.
  async function whenClear() {
    while (anyDialogOpen() || desktop.hidden) await wait(300);
  }

  /* ---------- Picked up by the player ---------- */

  // While held he is a pendulum hanging from the grab point: gravity pulls his centre
  // below the hand, and moving the hand makes him swing. Grabbed by the feet, he ends
  // up hanging upside down. Angles are in radians, clockwise on screen, 0 = straight down.
  const GRAVITY = 2400; // px/s², cartoon gravity
  const normalize = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

  function grab(start) {
    stopTravel();
    clearTimeout(wanderTimer);
    wake(true);
    if (talking && talking.line.priority < 3) silenceLine();
    dragged = true;
    const before = body.getBoundingClientRect();
    root.classList.add("is-held");
    setTuck(false);
    lift = 0;
    const w = width();
    const h = height();
    const offX = clamp(start.x - before.left, 4, w - 4);
    const offY = clamp(start.y - before.top, 4, h - 4);
    const rx = w / 2 - offX;
    const ry = h * .58 - offY;
    const psi0 = Math.atan2(-rx, ry);
    held = {
      offX, offY, psi0, length: Math.max(20, Math.hypot(rx, ry)),
      // Held exactly over his centre (by the feet) he would balance; a nudge tips him over.
      psi: psi0 + (Math.abs(psi0) > 2.9 ? (offX < w / 2 ? .08 : -.08) : 0),
      omega: 0, px: start.x, py: start.y, lastX: start.x, lastY: start.y, vx: 0, vy: 0, ax: 0, ay: 0,
      time: performance.now(), since: performance.now(), upsideSince: 0, arms: 0, glance: 0, frame: 0,
    };
    body.style.transformOrigin = `${Math.round(offX)}px ${Math.round(offY)}px`;
    body.style.rotate = "0deg";
    bot.classList.add("is-confused");
    face("wide");
    brows(null);
    P.sfx("pop");
    animate(art(), [{ transform: "scale(1)" }, { transform: "scale(.92, 1.1)", offset: .4 }, { transform: "scale(1)" }], { duration: 300 });
    setTimeout(() => {
      if (held && !talking && !held.upsideSince) face("squint");
    }, 380);
    positionHeld();
    held.frame = requestAnimationFrame(stepHeld);
  }

  function positionHeld() {
    const h = height();
    x = held.px - held.offX + width() / 2;
    lift = Math.max(0, groundY() - h - (held.py - held.offY));
    walker.style.transform = place(x, lift);
    body.style.rotate = `${((held.psi - held.psi0) * 180 / Math.PI).toFixed(2)}deg`;
  }

  // His arms hang with gravity too, whatever way up he is.
  function dangleArms(theta, rate) {
    const target = clamp(-theta * 180 / Math.PI, -165, 165);
    held.arms += (target - held.arms) * rate;
    arm("left").style.transform = `rotate(${(held.arms + 8).toFixed(1)}deg)`;
    arm("right").style.transform = `rotate(${(held.arms - 8).toFixed(1)}deg)`;
  }

  function stepHeld(now) {
    if (!held) return;
    const dt = clamp((now - held.time) / 1000, .001, .034);
    held.time = now;
    // Hand velocity and acceleration, sampled once per frame and smoothed.
    const vx = (held.px - held.lastX) / dt;
    const vy = (held.py - held.lastY) / dt;
    held.lastX = held.px;
    held.lastY = held.py;
    const nvx = held.vx + (vx - held.vx) * .45;
    const nvy = held.vy + (vy - held.vy) * .45;
    held.ax = clamp((nvx - held.vx) / dt, -9000, 9000);
    held.ay = clamp((nvy - held.vy) / dt, -9000, 9000);
    held.vx = nvx;
    held.vy = nvy;
    if (reduceMotion.matches) {
      held.psi = held.psi0 + (Math.abs(held.psi0) > Math.PI / 2 ? Math.PI : 0);
    } else {
      const g = GRAVITY - clamp(held.ay, -GRAVITY, GRAVITY * 2);
      const alpha = (held.ax * Math.cos(held.psi) - g * Math.sin(held.psi)) / held.length - 3 * held.omega;
      held.omega = clamp(held.omega + alpha * dt, -16, 16);
      held.psi += held.omega * dt;
    }
    positionHeld();
    const theta = normalize(held.psi - held.psi0);
    dangleArms(theta, .25);
    // Upside down he panics; the right way up he eyes the hand that holds him.
    const upside = Math.abs(theta) > 2.1;
    if (upside && !held.upsideSince) {
      held.upsideSince = now;
      bot.classList.add("is-nervous");
      if (!talking) face("oops");
    } else if (!upside && held.upsideSince && Math.abs(theta) < 1.6) {
      held.upsideSince = 0;
      bot.classList.remove("is-nervous");
      if (!talking) face("squint");
    }
    if (held.upsideSince && now - held.upsideSince > 700 && canSay("upsideDown", 25000)) say("upsideDown");
    else if (!held.upsideSince && now - held.since > 900 && canSay("grabbed", 45000) && canSay("upsideDown", 4000)) say("grabbed");
    if (!held.upsideSince && now > held.glance) {
      // Suspicious glances: at the hand, at the player, back at the hand.
      const atHand = Math.random() < .6;
      look(atHand ? clamp((held.offX - width() / 2) / 14, -2, 2) : 0, atHand ? -1 : 0);
      held.glance = now + 700 + Math.random() * 900;
    }
    placeBubble();
    held.frame = requestAnimationFrame(stepHeld);
  }

  // Let go: he keeps his speed and a little of his swing, and falls back to the floor.
  // Most of the swing is dropped, so the way up he was let go is the way he lands.
  function release() {
    const state = held;
    cancelAnimationFrame(state.frame);
    held = null;
    bot.classList.remove("is-nervous");
    const w = width();
    const h = height();
    const theta = normalize(state.psi - state.psi0);
    const left = x - w / 2;
    const top = groundY() - h - lift;
    const dx = w / 2 - state.offX;
    const dy = h / 2 - state.offY;
    const cx = left + state.offX + dx * Math.cos(theta) - dy * Math.sin(theta);
    const cy = top + state.offY + dx * Math.sin(theta) + dy * Math.cos(theta);
    body.style.transformOrigin = "50% 50%";
    flying = {
      cx, cy, theta, from: cy,
      vx: clamp(state.vx, -1400, 1400), vy: clamp(state.vy, -1300, 1100),
      omega: clamp(state.omega * .3, -4, 4), arms: state.arms, time: performance.now(), frame: 0,
    };
    positionFlying();
    if (reduceMotion.matches) return land();
    flying.frame = requestAnimationFrame(stepFlying);
  }

  function positionFlying() {
    const h = height();
    x = flying.cx;
    lift = groundY() - flying.cy - h / 2;
    walker.style.transform = place(x, lift);
    body.style.rotate = `${(flying.theta * 180 / Math.PI).toFixed(2)}deg`;
  }

  function stepFlying(now) {
    if (!flying) return;
    const f = flying;
    const dt = clamp((now - f.time) / 1000, .001, .034);
    f.time = now;
    const w = width();
    const h = height();
    f.vy += GRAVITY * dt;
    f.cx += f.vx * dt;
    f.cy += f.vy * dt;
    f.theta += f.omega * dt;
    f.omega *= 1 - 1.1 * dt;
    // Bounces off the sides of the screen.
    if (f.cx < w / 2) { f.cx = w / 2; f.vx = Math.abs(f.vx) * .5; }
    if (f.cx > innerWidth - w / 2) { f.cx = innerWidth - w / 2; f.vx = -Math.abs(f.vx) * .5; }
    const reach = Math.abs(h / 2 * Math.cos(f.theta)) + Math.abs(w / 2 * Math.sin(f.theta));
    if (f.cy + reach >= groundY()) {
      f.cy = groundY() - reach;
      positionFlying();
      land();
      return;
    }
    positionFlying();
    placeBubble();
    f.frame = requestAnimationFrame(stepFlying);
  }

  // On the floor: feet first he squashes and recovers; on his head he does an
  // involuntary headstand, kicks, and flips back over.
  async function land() {
    const f = flying;
    flying = null;
    landing = true;
    const impact = f.vy;
    const height0 = groundY() - f.from;
    x = clamp(f.cx, width() / 2 + 8, innerWidth - width() / 2 - 8);
    lift = 0;
    walker.style.transform = place(x);
    const theta = normalize(f.theta);
    const upside = Math.abs(theta) > Math.PI / 2;
    const rest = upside ? Math.sign(theta || 1) * 180 : 0;
    const from = theta * 180 / Math.PI;
    body.style.rotate = `${rest}deg`;
    for (const side of ["left", "right"]) arm(side).style.transform = "";
    P.sfx("knock");
    dust();
    const squash = animate(art(), [
      { transform: "translateY(0) scale(1)" }, { transform: "translateY(5%) scale(1.16, .8)", offset: .3 },
      { transform: "translateY(-3%) scale(.96, 1.05)", offset: .65 }, { transform: "translateY(0) scale(1)" },
    ], { duration: 440 });
    await Promise.all([squash, animate(body, [{ rotate: `${from}deg` }, { rotate: `${rest}deg` }], { duration: 160, easing: "ease-in" })]);
    if (!landing) return;
    if (upside) {
      bot.classList.add("is-kicking", "is-nervous");
      if (!talking) face("oops");
      if (canSay("upsideDown", 25000)) say("upsideDown");
      await wait(reduceMotion.matches ? 600 : 1900);
      if (!landing) return;
      bot.classList.remove("is-kicking");
      // A little hop and half a turn puts him back on his feet.
      const turn = rest + (rest > 0 ? 180 : -180);
      P.sfx("pop");
      body.style.rotate = `${turn}deg`;
      await animate(body, [
        { rotate: `${rest}deg`, translate: "0 0" },
        { rotate: `${(rest + turn) / 2}deg`, translate: `0 -${Math.round(height() * .7)}px`, offset: .5, easing: "ease-in" },
        { rotate: `${turn}deg`, translate: "0 0" },
      ], { duration: 560, easing: "ease-out" });
      if (!landing) return;
      bot.classList.remove("is-nervous");
      animate(art(), [{ transform: "scale(1)" }, { transform: "translateY(4%) scale(1.1, .88)" }, { transform: "scale(1)" }], { duration: 260 });
      dust();
      face("laugh", 1600);
      P.particles("stars", 5, bot);
      settle();
    } else if (impact > 1500 || height0 > 260) {
      // A long drop: a little dizzy.
      settle();
      face("oops", 1800);
      bot.classList.add("is-nervous");
      P.particles("stars", 4, bot);
      setTimeout(() => bot.classList.remove("is-nervous"), 1800);
      if (canSay("landed", 40000)) say("landed");
    } else {
      settle();
      face("wink", 1200);
      hop(6);
    }
    schedule(2400);
  }

  // Back to normal standing: no rotation, no lift, the usual faces.
  function settle() {
    if (held) cancelAnimationFrame(held.frame);
    if (flying) cancelAnimationFrame(flying.frame);
    held = null;
    flying = null;
    landing = false;
    lift = 0;
    walker.style.transform = place(x);
    body.style.rotate = "";
    body.style.transformOrigin = "";
    getComputedStyle(body).rotate; // commit without the tuck transition spinning him
    root.classList.remove("is-held");
    bot.classList.remove("is-confused", "is-kicking", "is-nervous");
    for (const side of ["left", "right"]) arm(side).style.transform = "";
    if (!talking && bot.dataset.face === "squint") face("happy");
    if (alarm === "on") face("wide");
  }

  bot.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !present || busy() || bot.classList.contains("is-ball")) return;
    event.preventDefault(); // no text selection while dragging
    const start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    const move = moved => {
      if (moved.pointerId !== start.id) return;
      if (!held && !flying && !landing && Math.hypot(moved.clientX - start.x, moved.clientY - start.y) > 6) grab(start);
      if (!held) return;
      held.px = moved.clientX;
      held.py = moved.clientY;
    };
    const up = ended => {
      if (ended.pointerId !== start.id) return;
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      if (held) release();
      setTimeout(() => { dragged = false; }); // after the click that may follow
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
  });

  /* ---------- Virus alert ---------- */

  // A short "wee-woo" siren under the alert.
  function siren() {
    const context = P.soundOn && !reduceMotion.matches ? P.audioContext() : null;
    if (!context) return;
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.05, now + .05);
    gain.gain.setValueAtTime(.05, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(.0001, now + 1.3);
    gain.connect(context.destination);
    const tone = context.createOscillator();
    tone.type = "square";
    for (let step = 0; step < 4; step++) tone.frequency.setValueAtTime(step % 2 ? 620 : 880, now + step * .3);
    tone.connect(gain);
    tone.start(now);
    tone.stop(now + 1.32);
  }

  async function raiseAlarm() {
    alarm = "pending";
    await wait(reduceMotion.matches ? 50 : 900); // the alert shakes into place first
    if (!rebootDialog?.open || !present) {
      alarm = null;
      return;
    }
    silenceLine();
    settle();
    stopTravel();
    clearTimeout(wanderTimer);
    wake(true);
    alarm = "on";
    rehost();
    setTuck(false);
    bot.classList.add("is-alarm");
    face("wide");
    siren();
    // He bursts in from the nearest edge and stops right beside the alert.
    const area = zone();
    const target = area.tuck ? area.from : area.side === "left" ? area.to : area.from;
    x = area.side === "left" ? -width() : innerWidth + width();
    walker.style.transform = place(x);
    await travel(target);
    if (alarm !== "on") return;
    acts.startle();
    if (await say("popupsVirus") && alarm === "on") {
      await wait(400);
      say("popupsReboot");
    }
  }

  function lowerAlarm() {
    alarm = null;
    bot.classList.remove("is-alarm");
    rebootButton?.classList.remove("pepi-hint");
    if (!talking) face("happy");
    requestAnimationFrame(relocate);
  }

  /* ---------- Reactions to the games ---------- */

  let saving = false; // the avatar-saved reaction says the welcome itself

  async function greet() {
    await whenClear();
    if (await arrive() && !saving && canSay("welcome", Infinity)) say("welcome");
  }

  // Small, silent reactions for the moments that don't deserve a line.
  function flinch() {
    if (!present || talking || busy()) return;
    face("oops", 1200);
    brows("worried");
    setTimeout(() => { if (!talking) brows(null); }, 1200);
    acts.nod();
  }

  function applaud() {
    if (!present || talking || busy()) return;
    face("star", 1400);
    hop(14);
    P.particles("stars", 5, bot);
    P.sfx("sparkle");
  }

  const reactions = {
    async "desktop-ready"({ hasProfile }) {
      if (!hasProfile) return; // the editor opens first; Pepi waits for the avatar
      await wait(700);
      greet();
    },
    async "avatar-saved"({ created }) {
      saving = true;
      try {
        await whenClear();
        if (!await arrive()) return;
        // He looks down at the new avatar in the taskbar before turning to the player.
        lookAt(profileAvatar);
        await wait(500);
        const done = await say(created ? "saved" : "restyled");
        if (done && canSay("welcome", Infinity)) {
          await wait(900);
          say("welcome");
        }
      } finally {
        saving = false;
      }
    },
    "games-opened": () => { if (canSay("gamesOpen", Infinity)) say("gamesOpen"); },
    "games-closed": () => { if (score.played && canSay("goodbye", 180000)) say("goodbye"); },
    "builder-opened": () => { if (canSay("builderOpen", Infinity)) say("builderOpen"); },
    "builder-exported": () => say("builderExport"),
    "about-opened": () => { if (canSay("aboutUs", Infinity)) say("aboutUs"); },
    "color-opened"() {
      score.played = true;
      if (canSay("colorOpen", Infinity)) say("colorOpen");
    },
    "color-miss"({ score: similarity }) {
      score.colorMisses += 1;
      const misses = score.colorMisses;
      if (similarity >= 75 && canSay("colorClose", 25000)) say("colorClose");
      else if (misses === 3) say("colorStuck");
      else if (misses === 6 || (misses > 6 && misses % 5 === 1 && canSay("cheerUp", 60000))) say("cheerUp");
      else flinch();
    },
    "color-hit"({ unlocked }) {
      score.colorMisses = 0;
      score.colorHits += 1;
      // Spoken praise on the first hit and every third one; a silent cheer otherwise.
      if (unlocked) say("colorUnlock");
      else if (score.colorHits === 1 || score.colorHits % 3 === 0) say(score.colorHits % 2 ? "colorHit" : "colorHit2");
      else applaud();
    },
    "popups-opened"() {
      score.played = true;
      if (canSay("popupsOpen", Infinity)) say("popupsOpen");
    },
    "popups-trap": () => { if (canSay("popupsTrap", 20000)) say("popupsTrap"); else flinch(); },
    "popups-refused": () => { if (canSay("popupsRefused", 15000)) say("popupsRefused"); else flinch(); },
    "popups-virus": () => { if (present) raiseAlarm(); },
    "popups-ended"({ won }) {
      if (won) {
        score.popupsLosses = 0;
        say("popupsWin");
        return;
      }
      score.popupsLosses += 1;
      say(score.popupsLosses >= 2 && canSay("cheerUp", 60000) ? "cheerUp" : "popupsTimeout");
    },
    "lag-opened"() {
      score.played = true;
      if (canSay("lagOpen", Infinity)) say("lagOpen");
    },
    "lag-scored"({ trial, delay, score: points, scores }) {
      if (trial === 0) score.lagSlowSaid = false;
      const best = Math.max(0, ...scores.slice(0, trial));
      if (delay >= 400 && !score.lagSlowSaid && points < best - 8) {
        score.lagSlowSaid = true;
        say("lagSlow");
      } else if (points >= 60) {
        applaud();
      } else {
        flinch();
      }
    },
    "lag-finished": () => say("lagDone"),
  };

  document.addEventListener("frontarcade:event", ({ detail }) => {
    lastInput = performance.now();
    reactions[detail?.type]?.(detail);
  });

  /* ---------- The player ---------- */

  let pointer = null;
  let lookFrame = 0;
  function followPointer() {
    lookFrame = 0;
    if (!present || !pointer || sleeping || travelling || talking || busy() || alarm) return;
    const box = bot.getBoundingClientRect();
    const dx = (pointer.x - (box.left + box.width / 2)) / 220;
    const dy = (pointer.y - (box.top + box.height / 2)) / 220;
    look(clamp(dx * 2, -2, 2), clamp(dy, -1, 1));
  }

  // Any key or click wakes him up; so does the pointer coming close.
  const noticeInput = event => {
    lastInput = performance.now();
    if (sleeping && !bot.contains(event.target)) {
      wake();
      schedule(2500);
    }
  };
  document.addEventListener("pointermove", event => {
    lastInput = performance.now();
    pointer = { x: event.clientX, y: event.clientY };
    if (!bubble.hidden && !held) {
      const box = bubble.getBoundingClientRect();
      const near = pointer.x > box.left - 24 && pointer.x < box.right + 24 && pointer.y > box.top - 24 && pointer.y < box.bottom + 24;
      bubble.classList.toggle("is-see-through", near);
    }
    if (sleeping) {
      const box = bot.getBoundingClientRect();
      if (Math.hypot(pointer.x - (box.left + box.width / 2), pointer.y - (box.top + box.height / 2)) < 160) noticeInput(event);
    }
    lookFrame ||= requestAnimationFrame(followPointer);
  }, { passive: true });
  document.addEventListener("keydown", noticeInput, true);
  document.addEventListener("pointerdown", noticeInput, true);

  // Tickles: hovering makes him giggle, a click gets a line (or wakes him up).
  bot.addEventListener("pointerenter", () => {
    if (sleeping || talking || travelling || busy() || alarm || performance.now() - lastTickle < 1500) return;
    lastTickle = performance.now();
    face("laugh", 1300);
    bot.classList.add("is-blushing");
    P.sfx("giggle");
    P.particles("giggle", 2, bot);
  });
  bot.addEventListener("pointerleave", () => bot.classList.remove("is-blushing"));
  bot.addEventListener("click", () => {
    if (dragged || busy()) return;
    if (sleeping) {
      say("wakeUp");
      return;
    }
    if (talking || alarm) return;
    if (canSay("poke", 6000) && canSay("poke2", 6000)) {
      pokeTurn += 1;
      say(pokeTurn % 2 ? "poke" : "poke2");
    } else {
      face("love", 1400);
      hop(16);
      P.particles("hearts", 2, bot);
    }
  });

  /* ---------- Taskbar menu ---------- */

  function renderTray() {
    visibleSwitch.checked = enabled;
    voiceSwitch.checked = P.soundOn;
    voiceSwitch.disabled = !enabled;
    tray.querySelector(".pepi-tray-icon").dataset.face = enabled ? "happy" : "sleep";
  }

  // The menu is a popover: it opens in the top layer, above Pepi himself, and closes
  // with Escape or a click outside. Older browsers get a plain toggled panel.
  const popover = typeof trayMenu.showPopover === "function";
  function placeMenu() {
    const box = trayButton.getBoundingClientRect();
    trayMenu.style.right = `${Math.round(innerWidth - box.right)}px`;
    trayMenu.style.bottom = `${Math.round(innerHeight - box.top + 10)}px`;
  }
  if (popover) {
    trayMenu.hidden = false;
    trayMenu.popover = "auto";
    trayButton.popoverTargetElement = trayMenu;
    trayMenu.addEventListener("beforetoggle", event => {
      if (event.newState === "open") placeMenu();
      trayButton.setAttribute("aria-expanded", String(event.newState === "open"));
    });
  } else {
    const setMenu = open => {
      trayMenu.hidden = !open;
      trayButton.setAttribute("aria-expanded", String(open));
    };
    trayButton.addEventListener("click", () => setMenu(trayMenu.hidden));
    document.addEventListener("pointerdown", event => { if (!tray.contains(event.target)) setMenu(false); });
    tray.addEventListener("keydown", event => {
      if (event.key !== "Escape" || trayMenu.hidden) return;
      event.stopPropagation();
      setMenu(false);
      trayButton.focus();
    });
  }
  visibleSwitch.addEventListener("change", () => {
    enabled = visibleSwitch.checked;
    try { localStorage.setItem(prefKey, enabled ? "on" : "off"); } catch { /* Lasts for this visit. */ }
    renderTray();
    if (enabled) arrive();
    else leave();
  });
  voiceSwitch.addEventListener("change", () => P.setSound(voiceSwitch.checked));
  document.addEventListener("pepi:sound", renderTray);

  /* ---------- Keeping up with the screen ---------- */

  function relocate() {
    if (!present || alarm === "pending") return;
    rehost();
    if (busy()) return;
    const area = zone();
    if (area.tuck !== tucked) setTuck(area.tuck);
    if (x < area.from - 1 || x > area.to + 1) {
      if (talking) {
        stopTravel();
        x = clamp(x, area.from, area.to);
        walker.style.transform = place(x);
      } else {
        travel(clamp(x, area.from, area.to));
      }
    }
    placeBubble();
  }

  const watcher = new MutationObserver(() => requestAnimationFrame(relocate));
  for (const item of windows) watcher.observe(item, { attributes: true, attributeFilter: ["hidden", "class"] });
  rebootDialog?.addEventListener("close", lowerAlarm);
  addEventListener("resize", () => {
    if (!present) return;
    if (busy()) settle();
    stopTravel();
    relocate();
  });
  document.addEventListener("fullscreenchange", () => requestAnimationFrame(relocate));
  addEventListener("scroll", () => { if (present) relocate(); }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(1500); });
  for (const dialog of document.querySelectorAll("dialog:not(#popup-reboot)")) {
    // Closing the editor without saving still brings him in (once there is a desktop).
    dialog.addEventListener("close", () => setTimeout(() => {
      if (!desktop.hidden && !anyDialogOpen() && !present) arrive();
    }, 200));
  }

  renderTray();
})();
