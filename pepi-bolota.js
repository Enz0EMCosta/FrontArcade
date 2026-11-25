// Pepi Bolota: the robot guide that introduces the Front Arcade from the boot screen.
// The scene is a timeline of small async steps (move, knock, say, look...). Every step
// listens to one AbortSignal, so "Pular introdução", Esc or closing the dialog stops
// the voice, the timers and the animations at once.
(() => {
  const get = id => document.getElementById(id);
  const dialog = get("intro-dialog");
  const openButton = get("open-intro");
  const powerButton = get("power-on");
  const stage = dialog.querySelector(".intro-stage");
  const glass = dialog.querySelector(".intro-glass");
  const rig = dialog.querySelector(".pepi-rig");
  const mover = dialog.querySelector(".pepi-move");
  const pepi = get("pepi");
  const shadow = dialog.querySelector(".pepi-shadow");
  const duo = get("intro-duo");
  const dialogue = dialog.querySelector(".intro-dialogue");
  const lineText = get("intro-line-text");
  const live = get("intro-live");
  const ending = get("intro-end");
  const soundButton = get("intro-sound");
  const voiceNote = get("intro-voice-note");
  const toolbar = dialog.querySelector(".intro-toolbar");
  const os = dialog.querySelector(".intro-os");
  const power = dialog.querySelector(".os-power");
  const build = dialog.querySelector(".intro-build");
  const lab = dialog.querySelector(".intro-lab");
  const buildLog = dialog.querySelector(".build-log");
  const buildProgress = dialog.querySelector(".build-progress > span");
  const buildPercent = dialog.querySelector(".build-percent");
  const buildStatus = dialog.querySelector(".build-status");
  const chapterSteps = [...dialog.querySelectorAll(".intro-chapter-track > i")];
  const chapterName = dialog.querySelector(".intro-chapter-name");
  const chapters = ["Criação", "Apresentação", "A oficina", "Os papais", "Encerramento"];
  const scenery = window.PepiScenery;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const soundKey = "front-arcade.intro.sound.v1";
  const clipManifest = "./assets/pepi/falas.json";
  const speech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window ? window.speechSynthesis : null;

  // `speech` is what the synthesized voice reads when the caption would be mispronounced.
  // The keys also name the recorded clips in assets/pepi/falas.json.
  const lines = {
    hello: { text: "Olá, olá, galerinha! Eu me chamo Pepi Bolota!" },
    guide: { text: "Serei o guia de vocês hoje, galerinha!" },
    origin: {
      text: "Eu fui criado e programado pelos meus dois pais adotivos para a Semana Acadêmica da Universidade Federal de Sergipe.",
      speech: "Eu fui criado e programado pelos meus dois pais adotivos, para a Semana Acadêmica da Universidade Federal de Sergipe.",
    },
    purpose: { text: "Eles me programaram com muito amor e carinho, para ser o guia deste sistema operacional e do nosso acervo de jogos. Eles pensaram em tudo mesmo, até na minha voz, que vocês estão ouvindo. Eu vim para complementar essa palestra." },
    lab: {
      text: "Este é o Front Arcade, o laboratório da nossa oficina de front-end: a parte do site que vocês veem, tocam e usam.",
      speech: "Este é o Front Arcade, o laboratório da nossa oficina de front end: a parte do site que vocês veem, tocam e usam.",
    },
    goal: { text: "A ideia é mostrar, na prática, como cada escolha de interface muda a experiência de quem usa um site." },
    lessons: { text: "Vocês vão ver boas práticas de usabilidade, cores e espaçamentos, telas de carregamento e de erro, animações e desempenho. E a melhor parte: eu!" },
    colors: { text: "Cada minijogo retoma um assunto da palestra. No Olhar Afiado, vocês treinam o olhar para as cores." },
    games: {
      text: "Já nos Pop-ups Infinitos, enfrentam um formulário cheio de interrupções. E no Lag Lab, sentem como um atraso muda tudo.",
      speech: "Já nos Pópaps Infinitos, enfrentam um formulário cheio de interrupções. E no Lég Léb, sentem como um atraso muda tudo.",
    },
    builder: { text: "E, no fim da trilha, vocês ganham o Crie Meu Site: montam o próprio portfólio, do jeitinho de vocês, e ainda podem baixar o resultado. Isso não é animal?" },
    everyone: { text: "Ah, e não precisa saber programar, viu? Dá para aprender tudo isso brincando." },
    call: { text: "Mas antes de começar, deixa eu chamar os meus papais, que prepararam tudo isso!" },
    papais: { text: "Papaaais!", speech: "Papais!" },
    confused: { text: "Nossa… eles estão meio diferentes. Espera aí." },
    summon: { text: "Papai Enzo! Papai PP! Venham aqui!", speech: "Papai Enzo! Papai Pê Pê! Venham aqui!" },
    thanks: { text: "Agora sim! Estamos os três aqui. Ou melhor, os cinco! Muito obrigado a todo mundo que veio participar da nossa oficina. Isso deixa o meu coração de lata quentinho!" },
    start: { text: "Quando estiverem prontos, é só clicar em Começar. Eu vou estar por aqui para guiar vocês durante toda a sua jornada. Bora jogar!" },
    // After "Começar": the first line closes the intro, the second greets the player
    // inside the avatar editor.
    ready: { text: "Vamos começar? Mas antes, eu preciso saber como você é… E qual é o seu nome também? Senão, qual seria a graça de tudo isso?" },
    avatar: { text: "Prontinho! Agora é com você: personalize o seu avatar do jeitinho que quiser. Quando terminar, a gente se encontra na página inicial do Front Arcade!" },
  };
  for (const [id, line] of Object.entries(lines)) line.id = id;

  let controller = null;
  let pose = { x: 0, y: 0, scale: 1 };
  let soundOn = readSoundPreference();
  let voice = null;
  let voiceIsMale = false;
  let audio = null;
  let noise = null;
  let clipsRequest = null;
  let clips = new Map();
  let currentUtterance = null;
  let currentClip = null;

  /* ---------- Pixel art ---------- */

  const color = {
    ink: "#3b2838",
    head: "#e8a0c2", headShade: "#cd7ca7", headLight: "#f8d3e4",
    lilac: "#c6a6d4", lilacDark: "#9c7fae",
    screen: "#47304a", glare: "#654766",
    face: "#ffeef6", nose: "#d79bbd", blush: "#ef6f93",
    body: "#d9bfd3", bodyShade: "#b997b3", bodyLight: "#eedfea",
    red: "#e44d63", redLight: "#ff8a98",
    leg: "#b996b2", panel: "#f7cfe0", vent: "#7d5d78",
    gold: "#ffc96b", goldLight: "#fff0c4", sweat: "#9fd8ff",
  };
  const rect = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
  const dots = (points, fill) => points.map(([x, y]) => rect(x, y, 1, 1, fill)).join("");

  // A rounded rectangle drawn row by row, like a sprite editor would: corners lose
  // `radius` pixels on the first and last rows.
  function blob(x, y, width, height, fill, radius = 2) {
    let rows = "";
    for (let row = 0; row < height; row++) {
      const inset = row < radius ? radius - row : row >= height - radius ? row - (height - radius) + 1 : 0;
      rows += rect(x + inset, y + row, width - inset * 2, 1, fill);
    }
    return rows;
  }

  // A pixel circle drawn as one rectangle per row.
  function disc(cx, cy, radius, fill) {
    let rows = "";
    for (let y = cy - radius; y < cy + radius; y++) {
      const dy = y + .5 - cy;
      const half = Math.round(Math.sqrt(radius * radius - dy * dy));
      if (half > 0) rows += rect(cx - half, y, half * 2, 1, fill);
    }
    return rows;
  }

  const star = (x, y, fill, shine) => `${rect(x + 2, y, 2, 1, fill)}${rect(x + 1, y + 1, 4, 1, fill)}${rect(x, y + 2, 6, 1, fill)}${rect(x + 1, y + 3, 4, 1, fill)}${rect(x + 2, y + 4, 2, 1, fill)}${rect(x + 2, y + 1, 1, 2, shine)}`;
  // A 3x3 plus with a bright centre: the "starry eyes" of an amazed Pepi.
  const sparkle = (x, y, fill, shine) => `${dots([[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]], fill)}${rect(x, y, 1, 1, shine)}`;
  const heart = (x, y, fill) =>`${rect(x, y, 2, 1, fill)}${rect(x + 3, y, 2, 1, fill)}${rect(x, y + 1, 5, 1, fill)}${rect(x + 1, y + 2, 3, 1, fill)}${rect(x + 2, y + 3, 1, 1, fill)}`;

  function arm(side) {
    const left = side === "left";
    const shoulder = left ? 3 : 41;
    const hand = left ? 2 : 40;
    return `<g class="pepi-arm pepi-arm-${side}">
      ${blob(shoulder, 27, 4, 4, color.ink, 1)}${rect(shoulder + 1, 28, 2, 2, color.lilac)}
      ${rect(shoulder + 1, 31, 2, 4, color.ink)}${rect(shoulder + 1, 32, 2, 1, color.lilacDark)}
      ${blob(hand, 35, 6, 4, color.ink, 1)}<rect class="pepi-hand" x="${hand + 1}" y="36" width="4" height="2" fill="${color.red}"/>
      ${rect(hand + 1, 36, 1, 1, color.redLight)}${rect(hand + 1, 39, 1, 1, color.ink)}${rect(hand + 4, 39, 1, 1, color.ink)}
    </g>`;
  }

  // Inspired by the reference sketch: one chubby rounded body with the face screen on
  // top, a little display, buttons and a vent panel, a round belly and tiny feet. The
  // drawn-on face, sparkle antenna and pink palette come from the first reference sheet.
  function robotMarkup() {
    const c = color;
    const vents = [0, 1, 2, 3, 4].map(row => rect(28, 27 + row * 2, 7, 1, c.vent)).join("");
    return `<g class="pepi-robot">
      <g class="pepi-feet">${blob(14, 45, 7, 4, c.ink, 1)}${rect(15, 46, 5, 2, c.red)}${rect(15, 46, 2, 1, c.redLight)}${blob(27, 45, 7, 4, c.ink, 1)}${rect(28, 46, 5, 2, c.red)}${rect(28, 46, 2, 1, c.redLight)}</g>
      <g class="pepi-ear-left">${blob(3, 16, 5, 8, c.ink, 1)}${rect(4, 17, 3, 6, c.lilac)}${rect(5, 19, 1, 2, c.lilacDark)}</g>
      <g class="pepi-ear-right">${blob(40, 16, 5, 8, c.ink, 1)}${rect(41, 17, 3, 6, c.lilac)}${rect(42, 19, 1, 2, c.lilacDark)}</g>
      <g class="pepi-antenna">
        ${rect(23, 5, 2, 2, c.ink)}
        <g class="pepi-star">${star(21, 0, c.gold, c.goldLight)}</g>
      </g>
      <g class="pepi-core">
        ${blob(19, 6, 10, 4, c.ink, 1)}${rect(20, 7, 8, 2, c.lilac)}
        ${blob(10, 37, 28, 10, c.ink, 4)}${blob(11, 38, 26, 8, c.body, 3)}${rect(12, 42, 24, 1, c.lilacDark)}${rect(13, 44, 22, 1, c.bodyShade)}
        ${blob(7, 9, 34, 32, c.ink, 4)}${blob(8, 10, 32, 30, c.head, 3)}
        ${rect(37, 13, 2, 24, c.headShade)}${rect(10, 37, 28, 2, c.headShade)}${rect(11, 11, 6, 1, c.headLight)}${rect(9, 13, 1, 6, c.headLight)}
        ${blob(11, 10, 26, 14, c.ink)}${blob(12, 11, 24, 12, c.screen)}${rect(14, 12, 3, 1, c.glare)}${rect(13, 13, 1, 2, c.glare)}
        <rect class="pepi-boot-line" x="12" y="16" width="24" height="1" fill="${c.face}"/>
        ${blob(11, 26, 10, 8, c.ink, 1)}${rect(12, 27, 8, 6, c.screen)}
        <g class="pepi-heart">${heart(14, 28, c.red)}</g>
        ${rect(22, 27, 2, 2, c.red)}${rect(22, 30, 2, 2, c.gold)}${rect(22, 33, 2, 2, c.lilac)}
        ${blob(26, 25, 11, 12, c.ink, 1)}${rect(27, 26, 9, 10, c.bodyLight)}${vents}
      </g>
      <g class="pepi-face">
        ${rect(14, 18, 3, 2, c.blush)}${rect(31, 18, 3, 2, c.blush)}
        <g class="pepi-blush-strong">${rect(13, 18, 5, 2, c.blush)}${rect(30, 18, 5, 2, c.blush)}${dots([[14, 18], [16, 18], [31, 18], [33, 18]], c.headLight)}</g>
        <g class="pepi-look">
          <g class="pepi-brow pepi-brow-left"><g class="brow-flat">${rect(17, 13, 4, 1, c.face)}</g><g class="brow-worried">${rect(17, 13, 3, 1, c.face)}${rect(20, 12, 1, 1, c.face)}</g></g>
          <g class="pepi-brow pepi-brow-right"><g class="brow-flat">${rect(27, 13, 4, 1, c.face)}</g><g class="brow-worried">${rect(27, 12, 1, 1, c.face)}${rect(28, 13, 3, 1, c.face)}</g></g>
          <g class="pepi-eyes pepi-eyes-normal">${rect(18, 15, 2, 2, c.face)}${rect(28, 15, 2, 2, c.face)}</g>
          <g class="pepi-eyes pepi-eyes-happy">${dots([[18, 16], [19, 15], [20, 16], [28, 16], [29, 15], [30, 16]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-oops">${dots([[18, 15], [19, 16], [18, 17], [30, 15], [29, 16], [30, 17]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-wide">${rect(18, 14, 2, 3, c.face)}${rect(28, 14, 2, 3, c.face)}</g>
          <g class="pepi-eyes pepi-eyes-love">${dots([[18, 15], [20, 15], [28, 15], [30, 15], [19, 17], [29, 17]], c.blush)}${rect(18, 16, 3, 1, c.blush)}${rect(28, 16, 3, 1, c.blush)}</g>
          <g class="pepi-eyes pepi-eyes-laugh">${dots([[17, 17], [18, 16], [19, 15], [20, 16], [21, 17], [27, 17], [28, 16], [29, 15], [30, 16], [31, 17]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-wink">${rect(18, 15, 2, 2, c.face)}${dots([[28, 16], [29, 15], [30, 16]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-star">${sparkle(19, 15, c.gold, c.goldLight)}${sparkle(29, 15, c.gold, c.goldLight)}</g>
          <g class="pepi-eyes pepi-eyes-shy">${rect(18, 17, 2, 1, c.face)}${rect(28, 17, 2, 1, c.face)}</g>
          <g class="pepi-eyes pepi-eyes-sleep">${rect(17, 16, 4, 1, c.face)}${rect(27, 16, 4, 1, c.face)}</g>
          <g class="pepi-eyes pepi-eyes-squint">${rect(17, 15, 4, 1, c.face)}${rect(19, 16, 2, 1, c.face)}${rect(27, 15, 4, 1, c.face)}${rect(29, 16, 2, 1, c.face)}</g>
        </g>
        <g class="pepi-look pepi-look-mouth">
          <g class="pepi-mouth-closed">
            <g class="mouth-smile">${rect(22, 19, 4, 1, c.face)}${rect(21, 18, 1, 1, c.face)}${rect(26, 18, 1, 1, c.face)}</g>
            <g class="mouth-flat">${rect(22, 19, 4, 1, c.face)}</g>
            <g class="mouth-laugh">${rect(21, 18, 6, 1, c.face)}${rect(21, 19, 1, 1, c.face)}${rect(26, 19, 1, 1, c.face)}${rect(23, 19, 2, 1, c.blush)}${rect(22, 20, 4, 1, c.face)}</g>
            <g class="mouth-shy">${dots([[22, 19], [23, 18], [24, 19], [25, 18]], c.face)}</g>
            <g class="mouth-sad">${rect(22, 18, 4, 1, c.face)}${rect(21, 19, 1, 1, c.face)}${rect(26, 19, 1, 1, c.face)}</g>
            <g class="mouth-sleep">${rect(23, 19, 2, 1, c.face)}</g>
            <g class="mouth-hmm">${rect(21, 19, 4, 1, c.face)}${rect(25, 18, 1, 1, c.face)}</g>
          </g>
          <g class="pepi-mouth-open">${rect(22, 18, 4, 3, c.face)}${rect(23, 19, 2, 1, c.screen)}</g>
        </g>
      </g>
      <g class="pepi-sweat">${rect(38, 10, 1, 1, c.sweat)}${rect(37, 11, 3, 2, c.sweat)}${rect(38, 13, 1, 1, c.sweat)}${rect(37, 11, 1, 1, "#ffffff")}</g>
      ${arm("left")}${arm("right")}
    </g>`;
  }

  // Rolled up: a pink ball with a mauve band and the star emblem. Only the inner group
  // spins, so the highlight stays still like light on a real ball.
  function ballMarkup() {
    const c = color;
    let band = "";
    for (let y = 26; y < 31; y++) {
      const dy = y + .5 - 28;
      const half = Math.round(Math.sqrt(15 * 15 - dy * dy));
      band += rect(24 - half, y, half * 2, 1, y === 26 || y === 30 ? c.ink : c.body);
    }
    return `<g class="pepi-ball">
      <g class="pepi-ball-spin">
        ${disc(24, 28, 16, c.ink)}${disc(24, 28, 15, c.headShade)}${disc(23, 27, 14, c.head)}
        ${band}${rect(10, 28, 2, 1, c.lilacDark)}${rect(36, 28, 2, 1, c.lilacDark)}
        ${blob(19, 23, 10, 10, c.ink, 2)}${blob(20, 24, 8, 8, c.screen, 2)}${star(21, 26, c.gold, c.goldLight)}
        ${rect(23, 14, 2, 3, c.ink)}${rect(23, 40, 2, 3, c.ink)}
      </g>
      ${rect(14, 17, 4, 1, c.headLight)}${rect(13, 18, 1, 3, c.headLight)}${rect(15, 16, 2, 1, c.headLight)}
    </g>`;
  }

  function pepiMarkup(viewBox = "0 -1 48 51") {
    return `<svg class="pepi-art" viewBox="${viewBox}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${ballMarkup()}${robotMarkup()}</svg>`;
  }

  // The blueprint drawn before Pepi is printed: the same robot, every pixel outlined.
  // It sits behind the real art, so printed rows cover it as the scan goes down.
  function blueprintMarkup() {
    return `<svg class="pepi-blueprint" viewBox="0 -1 48 51" aria-hidden="true" focusable="false">${robotMarkup()}</svg>`;
  }

  // Brem Daya 2.0, the robot Pepi has a crush on: his chubby build, a newer model in
  // periwinkle and mint, with a heart antenna, a pink bow, eyelashes, lipstick and
  // "2.0" glowing on her chest. Her face groups reuse Pepi's class names, so `data-face`,
  // blinking and the lip sync work on her as well.
  const bremColor = {
    head: "#a9b6f2", headShade: "#8493da", headLight: "#dbe2fd",
    mint: "#86e3c9", mintDark: "#4fb898", mintLight: "#d8fff3",
    skirt: "#d3daf9", skirtShade: "#aab5ec",
    bow: "#ff7eb6", bowDark: "#d64f8d", bowLight: "#ffc2dc", lips: "#ff8fc0",
  };
  const digits = { 2: ["111", "001", "111", "100", "111"], 0: ["111", "101", "101", "101", "111"] };
  const digit = (value, x, y, fill) => digits[value]
    .map((row, line) => [...row].map((bit, column) => (bit === "1" ? rect(x + column, y + line, 1, 1, fill) : "")).join("")).join("");

  function bremArm(side) {
    const b = bremColor;
    const shoulder = side === "left" ? 3 : 41;
    const hand = side === "left" ? 2 : 40;
    return `<g class="pepi-arm pepi-arm-${side}">
      ${blob(shoulder, 27, 4, 4, color.ink, 1)}${rect(shoulder + 1, 28, 2, 2, b.head)}
      ${rect(shoulder + 1, 31, 2, 4, color.ink)}${rect(shoulder + 1, 32, 2, 1, b.headShade)}
      ${blob(hand, 35, 6, 4, color.ink, 1)}<rect class="pepi-hand" x="${hand + 1}" y="36" width="4" height="2" fill="${b.mint}"/>${rect(hand + 1, 36, 1, 1, b.mintLight)}
    </g>`;
  }

  function bremMarkup() {
    const c = color;
    const b = bremColor;
    // Eyelashes on the outer corner of each eye, one pixel above the eye's top row.
    const lashes = top => dots([[17, top], [16, top - 1], [30, top], [31, top - 1]], c.face);
    return `<svg class="pepi-art brem-art" viewBox="0 -1 48 51" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><g class="brem-robot">
      <g class="pepi-feet">${blob(14, 45, 7, 4, c.ink, 1)}${rect(15, 46, 5, 2, b.mint)}${rect(15, 46, 2, 1, b.mintLight)}${blob(27, 45, 7, 4, c.ink, 1)}${rect(28, 46, 5, 2, b.mint)}${rect(28, 46, 2, 1, b.mintLight)}</g>
      <g class="pepi-ear-left">${blob(3, 16, 5, 8, c.ink, 1)}${rect(4, 17, 3, 6, b.mint)}${rect(5, 19, 1, 2, b.mintDark)}</g>
      <g class="pepi-ear-right">${blob(40, 16, 5, 8, c.ink, 1)}${rect(41, 17, 3, 6, b.mint)}${rect(42, 19, 1, 2, b.mintDark)}</g>
      <g class="pepi-antenna">${rect(23, 5, 2, 2, c.ink)}${heart(21, 1, b.bow)}${rect(21, 1, 1, 1, b.bowLight)}</g>
      <g class="pepi-core">
        ${blob(19, 6, 10, 4, c.ink, 1)}${rect(20, 7, 8, 2, b.mint)}
        ${blob(9, 37, 30, 10, c.ink, 4)}${blob(10, 38, 28, 8, b.skirt, 3)}${rect(11, 43, 26, 1, b.bow)}
        ${[16, 21, 26, 31].map(px => rect(px, 41, 1, 2, b.skirtShade)).join("")}
        ${blob(7, 9, 34, 32, c.ink, 4)}${blob(8, 10, 32, 30, b.head, 3)}
        ${rect(37, 13, 2, 24, b.headShade)}${rect(10, 37, 28, 2, b.headShade)}${rect(11, 11, 6, 1, b.headLight)}${rect(9, 13, 1, 6, b.headLight)}
        ${blob(11, 10, 26, 14, c.ink)}${blob(12, 11, 24, 12, c.screen)}${rect(14, 12, 3, 1, c.glare)}${rect(13, 13, 1, 2, c.glare)}
        ${blob(13, 25, 22, 11, c.ink, 1)}${rect(14, 26, 20, 9, c.screen)}
        ${digit(2, 16, 28, c.gold)}${rect(20, 32, 1, 1, c.gold)}${digit(0, 22, 28, c.gold)}
        <g class="pepi-heart">${heart(27, 29, b.bow)}</g>
      </g>
      <g class="brem-bow">${blob(29, 4, 6, 6, c.ink, 1)}${rect(30, 5, 4, 4, b.bow)}${rect(30, 5, 2, 1, b.bowLight)}${blob(37, 4, 6, 6, c.ink, 1)}${rect(38, 5, 4, 4, b.bow)}${rect(38, 5, 2, 1, b.bowLight)}${blob(34, 5, 4, 4, c.ink, 1)}${rect(35, 6, 2, 2, b.bowDark)}</g>
      <g class="pepi-face">
        ${rect(14, 18, 3, 2, c.blush)}${rect(31, 18, 3, 2, c.blush)}
        <g class="pepi-blush-strong">${rect(13, 18, 5, 2, c.blush)}${rect(30, 18, 5, 2, c.blush)}${dots([[14, 18], [16, 18], [31, 18], [33, 18]], b.bowLight)}</g>
        <g class="pepi-look">
          <g class="pepi-eyes pepi-eyes-normal">${rect(18, 15, 2, 2, c.face)}${rect(28, 15, 2, 2, c.face)}${lashes(14)}</g>
          <g class="pepi-eyes pepi-eyes-happy">${dots([[18, 16], [19, 15], [20, 16], [28, 16], [29, 15], [30, 16]], c.face)}${dots([[17, 15], [31, 15]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-wide">${rect(18, 14, 2, 3, c.face)}${rect(28, 14, 2, 3, c.face)}${lashes(13)}</g>
          <g class="pepi-eyes pepi-eyes-love">${dots([[18, 15], [20, 15], [28, 15], [30, 15], [19, 17], [29, 17]], b.bow)}${rect(18, 16, 3, 1, b.bow)}${rect(28, 16, 3, 1, b.bow)}</g>
          <g class="pepi-eyes pepi-eyes-wink">${rect(18, 15, 2, 2, c.face)}${dots([[17, 14], [16, 13]], c.face)}${dots([[28, 16], [29, 15], [30, 16], [31, 15]], c.face)}</g>
          <g class="pepi-eyes pepi-eyes-shy">${rect(18, 17, 2, 1, c.face)}${rect(28, 17, 2, 1, c.face)}${dots([[17, 16], [30, 16]], c.face)}</g>
        </g>
        <g class="pepi-look pepi-look-mouth">
          <g class="pepi-mouth-closed">
            <g class="mouth-smile">${rect(23, 19, 2, 1, b.lips)}${rect(22, 18, 1, 1, b.lips)}${rect(25, 18, 1, 1, b.lips)}</g>
            <g class="mouth-shy">${dots([[22, 19], [23, 18], [24, 19], [25, 18]], b.lips)}</g>
          </g>
          <g class="pepi-mouth-open">${rect(22, 18, 4, 3, b.lips)}${rect(23, 19, 2, 1, c.screen)}</g>
        </g>
      </g>
      ${bremArm("left")}${bremArm("right")}
    </g></svg>`;
  }

  // Little props for Pepi on the desktop: his phone (Brem Daya's photo is a heart on
  // the screen) and the flower he gives her.
  function propMarkup(kind) {
    const c = color;
    const b = bremColor;
    if (kind === "phone") {
      return `<svg viewBox="0 0 9 13" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
        ${blob(0, 0, 9, 13, c.ink, 1)}${rect(1, 1, 7, 10, "#ffe3f1")}${rect(3, 1, 3, 1, c.ink)}
        <g class="phone-heart">${heart(2, 3, b.bow)}${rect(2, 3, 1, 1, b.bowLight)}</g>
        ${rect(2, 8, 3, 1, b.head)}${rect(4, 9, 3, 1, b.bowLight)}${rect(4, 11, 1, 1, c.lilacDark)}
      </svg>`;
    }
    if (kind === "heart") {
      return `<svg viewBox="0 0 5 4" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${heart(0, 0, b.bow)}${rect(0, 0, 1, 1, b.bowLight)}</svg>`;
    }
    return `<svg viewBox="0 0 9 15" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
      ${rect(3, 0, 3, 1, b.bowDark)}${rect(1, 1, 7, 1, b.bowDark)}${rect(0, 2, 9, 3, b.bowDark)}${rect(1, 5, 7, 1, b.bowDark)}${rect(3, 6, 3, 1, b.bowDark)}
      ${rect(3, 1, 3, 1, b.bow)}${rect(1, 2, 7, 3, b.bow)}${rect(2, 5, 5, 1, b.bow)}${rect(2, 2, 2, 1, b.bowLight)}
      ${rect(3, 3, 3, 2, c.gold)}${rect(3, 3, 1, 1, c.goldLight)}
      ${rect(4, 7, 1, 8, "#3f9a4f")}${rect(5, 10, 2, 1, "#5fbf5f")}${rect(6, 9, 1, 1, "#5fbf5f")}${rect(2, 12, 2, 1, "#5fbf5f")}${rect(2, 11, 1, 1, "#5fbf5f")}
    </svg>`;
  }

  // Two small cards about Pepi over the scenery: his status (mood and where he is,
  // updated live) and a voice meter that follows the recorded clips.
  const moods = {
    normal: "Tranquilo", happy: "Feliz", love: "Apaixonado", oops: "Ops!", wide: "Surpreso", unsure: "Desconfiado",
    laugh: "Rindo", wink: "Charmoso", star: "Encantado", shy: "Tímido", sleep: "Dormindo", sad: "Preocupado", squint: "Desconfiado",
  };
  const osCards = `
    <div class="os-window os-status">
      <div class="os-window-bar"><span class="build-dots"><i></i><i></i><i></i></span><span>pepi_bolota · status</span></div>
      <dl class="os-window-body os-facts">
        <div><dt>Humor</dt><dd class="os-mood">Feliz</dd></div>
        <div><dt>Local</dt><dd class="os-place"></dd></div>
        <div><dt>Coração</dt><dd><span class="os-beat"></span> batendo</dd></div>
      </dl>
    </div>
    <div class="os-window os-voice">
      <div class="os-window-bar"><span class="build-dots"><i></i><i></i><i></i></span><span>voz.wav</span></div>
      <div class="os-window-body"><div class="os-meter">${Array.from({ length: 18 }, (_, bar) => `<i style="--f:${(.35 + Math.abs(Math.sin(bar * 1.7)) * .65).toFixed(2)}; --d:${(bar * 47 % 300)}ms"></i>`).join("")}</div></div>
    </div>`;
  dialog.querySelector(".os-windows").innerHTML = osCards;
  const moodLabel = dialog.querySelector(".os-mood");
  const placeLabel = dialog.querySelector(".os-place");

  const heartMarkup = `<svg viewBox="0 0 5 4" shape-rendering="crispEdges" aria-hidden="true">${heart(0, 0, color.red)}${rect(0, 0, 1, 1, color.redLight)}</svg>`;
  const starMarkup = `<svg viewBox="0 0 6 5" shape-rendering="crispEdges" aria-hidden="true">${star(0, 0, color.gold, color.goldLight)}</svg>`;

  // The duo reuses the avatar renderer from art.js on a transparent canvas, then swaps
  // a few palette colours and adds the details the editor does not offer.
  const people = {
    enzo: {
      avatar: { skin: 1, eyes: 0, eyeColor: 0, mouth: 0, hair: 2, hairColor: 0, hairGradient: 0, outfit: 6, shirt: 7, costume: 0, accessory: 0, held: 0 },
      swaps: { "#405978": "#22252f", "#293a56": "#15171e" },
      details(box) {
        box(24, 54, 16, 1, "#22252f");
        box(29, 47, 6, 1, "#c3cad2");
        box(26, 60, 5, 9, "#2b2f3b");
        box(33, 60, 5, 9, "#1f222b");
        box(25, 59, 8, 1, "#aab3bd");
        box(28, 33, 3, 1, "#3b2a2c");
        box(33, 33, 3, 1, "#3b2a2c");
        box(43, 31, 1, 3, "#d7dde0");
        box(42, 33, 1, 1, "#d7dde0");
      },
    },
    // From PP's photo: a washed charcoal cap with the yellow and red film patch, thick
    // brows, full moustache and goatee with a light beard on the jaw, a white earbud,
    // a dusty rose button-up shirt and light-wash jeans.
    pp: {
      avatar: { skin: 2, eyes: 0, eyeColor: 0, mouth: 2, hair: 0, hairColor: 0, hairGradient: 0, outfit: 7, shirt: 2, costume: 0, accessory: 0, held: 0 },
      swaps: { "#fa8b90": "#b8766b", "#bd4265": "#925650" },
      details(box, clear) {
        const ink = "#232940";
        const cap = "#45433f";
        const capLight = "#5d5a55";
        const capShade = "#34322f";
        const hair = "#211816";
        const skinShade = "#874e37";

        // Cap: crown, washed highlights, the patch and a visor wider than the head.
        clear(16, 4, 34, 17);
        box(25, 9, 14, 1, ink);
        box(23, 10, 18, 1, ink);
        box(22, 11, 20, 9, ink);
        box(26, 10, 12, 1, cap);
        box(24, 11, 16, 1, cap);
        box(23, 12, 18, 8, cap);
        box(26, 11, 7, 1, capLight);
        box(24, 12, 3, 3, capLight);
        box(37, 16, 2, 2, capLight);
        box(39, 12, 2, 8, capShade);
        box(31, 8, 2, 1, ink);
        box(28, 13, 8, 2, "#f3c437");
        box(28, 15, 8, 2, "#d23a2c");
        box(29, 14, 1, 1, "#a32a22");
        box(31, 14, 2, 1, "#a32a22");
        box(34, 14, 1, 1, "#a32a22");
        box(33, 16, 1, 1, "#f3c437");
        box(34, 15, 1, 1, "#f3c437");
        // Curved visor: wide at the sides, lowest in the middle, shading the forehead.
        box(19, 19, 26, 2, ink);
        box(20, 21, 24, 1, ink);
        box(23, 22, 18, 1, ink);
        box(20, 20, 24, 1, capLight);
        box(23, 21, 18, 1, cap);
        box(24, 23, 16, 1, skinShade);

        // Short hair: sideburns under the cap.
        box(21, 23, 2, 5, hair);
        box(41, 23, 2, 5, hair);

        // Thick brows, moustache, lips, goatee and a light beard along the jaw.
        box(26, 25, 5, 1, hair);
        box(27, 24, 3, 1, hair);
        box(35, 25, 5, 1, hair);
        box(36, 24, 3, 1, hair);
        box(27, 33, 11, 1, hair);
        box(27, 34, 2, 1, hair);
        box(36, 34, 2, 1, hair);
        box(30, 35, 5, 1, "#8f5040");
        box(24, 37, 16, 1, "#94603f");
        box(25, 38, 14, 1, "#94603f");
        box(31, 36, 3, 1, hair);
        box(30, 37, 5, 2, hair);

        // White earbud.
        box(43, 29, 2, 2, "#f4f4f2");
        box(43, 31, 1, 2, "#f4f4f2");

        // Open collar of the shirt and light-wash jeans.
        box(24, 44, 5, 5, "#cf9488");
        box(35, 44, 5, 5, "#cf9488");
        box(28, 47, 1, 2, "#925650");
        box(35, 47, 1, 2, "#925650");
        box(26, 60, 5, 9, "#7193bf");
        box(33, 60, 5, 9, "#5a79a2");
        box(27, 61, 1, 6, "#8eaad0");
      },
    },
  };

  function swapColors(context, swaps) {
    const toKey = hex => Number.parseInt(hex.slice(1), 16);
    const palette = new Map(Object.entries(swaps).map(([from, to]) => [toKey(from), toKey(to)]));
    const image = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const { data } = image;
    for (let index = 0; index < data.length; index += 4) {
      if (!data[index + 3]) continue;
      const swap = palette.get((data[index] << 16) | (data[index + 1] << 8) | data[index + 2]);
      if (swap === undefined) continue;
      data[index] = swap >> 16;
      data[index + 1] = (swap >> 8) & 255;
      data[index + 2] = swap & 255;
    }
    context.putImageData(image, 0, 0);
  }

  function paintPerson(canvas, { avatar, swaps, details }) {
    const buffer = document.createElement("canvas");
    buffer.width = 64;
    buffer.height = 80;
    const context = buffer.getContext("2d", { willReadFrequently: true });
    const box = (x, y, width, height, fill) => {
      context.fillStyle = fill;
      context.fillRect(x, y, width, height);
    };
    const clear = (x, y, width, height) => context.clearRect(x, y, width, height);
    paintCharacter(context, box, avatar, null);
    swapColors(context, swaps);
    details(box, clear);
    const output = canvas.getContext("2d");
    output.imageSmoothingEnabled = false;
    output.drawImage(buffer, 12, 6, 40, 68, 0, 0, canvas.width, canvas.height);
  }

  /* ---------- Sound: effects, recorded clips and the browser's voice ---------- */

  function readSoundPreference() {
    try { return localStorage.getItem(soundKey) !== "off"; } catch { return true; }
  }

  function renderSoundButton() {
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.querySelector(".intro-sound-label").textContent = soundOn ? "Som ligado" : "Som desligado";
  }

  function audioContext() {
    if (!audio) {
      const Context = window.AudioContext ?? window.webkitAudioContext;
      if (!Context) return null;
      audio = new Context();
      noise = audio.createBuffer(1, audio.sampleRate * .5, audio.sampleRate);
      const samples = noise.getChannelData(0);
      for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }

  function tone(context, { type = "sine", from, to, start, length, volume }) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + length);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(.001, start + length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + length);
  }

  function hiss(context, { filter, frequency, start, length, volume }) {
    const source = context.createBufferSource();
    const shape = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noise;
    shape.type = filter;
    shape.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(.001, start + length);
    source.connect(shape).connect(gain).connect(context.destination);
    source.start(start, 0, length);
  }

  function sfx(kind) {
    if (!soundOn) return;
    const context = audioContext();
    if (!context) return;
    const now = context.currentTime;
    if (kind === "knock" || kind === "crack") {
      tone(context, { from: 170, to: 55, start: now, length: .14, volume: .5 });
      hiss(context, { filter: "bandpass", frequency: 1900, start: now, length: .05, volume: .3 });
    }
    if (kind === "crack") {
      // A heavier thud, the long crunch of the glass and a few tinkling chips.
      tone(context, { from: 90, to: 38, start: now, length: .3, volume: .35 });
      hiss(context, { filter: "highpass", frequency: 2400, start: now + .02, length: .5, volume: .4 });
      hiss(context, { filter: "bandpass", frequency: 900, start: now + .03, length: .7, volume: .22 });
      for (let chip = 0; chip < 5; chip++) {
        const note = 3200 + Math.random() * 2600;
        tone(context, { type: "triangle", from: note, to: note * .97, start: now + .15 + Math.random() * .6, length: .06, volume: .03 });
      }
    }
    // The cracks creeping on: a short, dry tick of glass.
    if (kind === "creak") {
      hiss(context, { filter: "highpass", frequency: 3200, start: now, length: .22, volume: .18 });
      tone(context, { type: "square", from: 2300, to: 1700, start: now, length: .04, volume: .015 });
    }
    if (kind === "blip") tone(context, { type: "square", from: 660, to: 990, start: now, length: .07, volume: .04 });
    if (kind === "pop") tone(context, { from: 380, to: 920, start: now, length: .13, volume: .18 });
    if (kind === "reveal") {
      [523, 659, 784, 1047].forEach((note, index) => tone(context, { type: "triangle", from: note, to: note * 1.01, start: now + index * .07, length: .18, volume: .12 }));
    }
    if (kind === "love") {
      tone(context, { from: 880, to: 1320, start: now, length: .1, volume: .08 });
      tone(context, { from: 1175, to: 1760, start: now + .1, length: .12, volume: .08 });
    }
    // A soft three-note chime, like an operating system waking up.
    if (kind === "boot") {
      [392, 523, 784].forEach((note, index) => tone(context, { type: "triangle", from: note, to: note * 1.005, start: now + index * .12, length: .9, volume: .07 }));
    }
    // Something falling from the sky: a long, descending whistle.
    if (kind === "fall") tone(context, { type: "triangle", from: 1900, to: 420, start: now, length: .78, volume: .05 });
    // A beam of light switching on: a rising sweep with a shimmer on top.
    if (kind === "beam") {
      tone(context, { from: 260, to: 1300, start: now, length: .7, volume: .07 });
      [1568, 2093, 2637, 3136].forEach((note, index) => tone(context, { type: "triangle", from: note, to: note * 1.01, start: now + .2 + index * .08, length: .22, volume: .03 }));
    }
    if (kind === "tick") tone(context, { type: "square", from: 1400, to: 1300, start: now, length: .03, volume: .025 });
    if (kind === "sparkle") {
      [1319, 1760, 2349].forEach((note, index) => tone(context, { from: note, to: note * 1.02, start: now + index * .06, length: .25, volume: .06 }));
    }
    // "Hi-hi-hi... hi-hi": two bursts of little chirps for the giggle.
    if (kind === "giggle") {
      [0, .1, .2, .5, .6].forEach((offset, index) => {
        const pitch = 1050 - (index % 3) * 70;
        tone(context, { type: "triangle", from: pitch, to: pitch * 1.25, start: now + offset, length: .07, volume: .09 });
      });
    }
  }

  // Recorded clips (e.g. a cartoon voice made with a TTS service) win over the browser
  // voice. assets/pepi/falas.json maps a line id to a file in the same folder.
  async function loadClips() {
    const context = audioContext();
    if (!context) return new Map();
    try {
      const response = await fetch(clipManifest, { cache: "no-cache" });
      if (!response.ok) return new Map();
      const manifest = await response.json();
      const entries = await Promise.all(Object.entries(manifest).map(async ([id, file]) => {
        if (!Object.hasOwn(lines, id) || !/^[\w-]+\.(mp3|ogg|wav)$/.test(file)) return null;
        try {
          const clip = await fetch(`./assets/pepi/${file}`);
          if (!clip.ok) return null;
          return [id, await context.decodeAudioData(await clip.arrayBuffer())];
        } catch {
          return null;
        }
      }));
      return new Map(entries.filter(Boolean));
    } catch {
      return new Map();
    }
  }

  // Prefer a Brazilian male voice; with a higher pitch it sounds like a kid robot.
  function pickVoice() {
    const voices = speech?.getVoices() ?? [];
    const brazilian = voices.filter(item => /^pt[-_]BR$/i.test(item.lang));
    const male = item => /antonio|ant[oô]nio|daniel|felipe|f[aá]bio|thiago|donato|humberto|julio|nicolau|valerio|male|masculin/i.test(item.name);
    const natural = item => /natural|online/i.test(item.name);
    voice = brazilian.find(item => male(item) && natural(item))
      ?? brazilian.find(male)
      ?? brazilian.find(natural)
      ?? brazilian[0]
      ?? voices.find(item => /^pt/i.test(item.lang))
      ?? null;
    voiceIsMale = Boolean(voice && male(voice));
    if (clips.size) {
      voiceNote.textContent = "";
    } else if (!speech) {
      voiceNote.textContent = "Este navegador não tem voz sintetizada. Acompanhe pelas legendas.";
    } else if (voices.length && !voice) {
      voiceNote.textContent = "Sem voz em português neste navegador. Acompanhe pelas legendas.";
    } else {
      voiceNote.textContent = "";
    }
  }

  // Opens Pepi's mouth while the clip is loud: a tiny lip sync from the audio itself.
  function playClip(buffer, signal, target = pepi) {
    return new Promise((resolve, reject) => {
      const context = audioContext();
      const source = context.createBufferSource();
      const analyser = context.createAnalyser();
      const samples = new Float32Array(analyser.fftSize);
      let frame;
      let lastSwitch = 0;
      source.buffer = buffer;
      source.connect(analyser).connect(context.destination);
      target.classList.add("is-lipsync");
      const listen = time => {
        analyser.getFloatTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) energy += sample * sample;
        const level = Math.sqrt(energy / samples.length);
        const open = level > .045;
        os.style.setProperty("--level", Math.min(1, level * 7).toFixed(3));
        if (open !== target.classList.contains("mouth-open") && time - lastSwitch > 70) {
          target.classList.toggle("mouth-open", open);
          lastSwitch = time;
        }
        frame = requestAnimationFrame(listen);
      };
      const settle = done => {
        cancelAnimationFrame(frame);
        signal.removeEventListener("abort", onAbort);
        target.classList.remove("is-lipsync", "mouth-open");
        os.style.setProperty("--level", "0");
        currentClip = null;
        done();
      };
      const onAbort = () => {
        source.onended = null;
        source.stop();
        settle(() => reject(signal.reason));
      };
      source.onended = () => settle(resolve);
      signal.addEventListener("abort", onAbort, { once: true });
      currentClip = source;
      source.start();
      frame = requestAnimationFrame(listen);
    });
  }

  function speak(line, signal, target = pepi) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(line.speech ?? line.text);
      utterance.lang = "pt-BR";
      if (voice) utterance.voice = voice;
      utterance.pitch = voiceIsMale ? 1.6 : 1.3;
      utterance.rate = 1.08;
      let timeout;
      const settle = done => {
        clearTimeout(timeout);
        signal.removeEventListener("abort", onAbort);
        target.classList.remove("is-talking");
        os.classList.remove("is-voicing");
        done();
      };
      const onAbort = () => settle(() => reject(signal.reason));
      utterance.onstart = () => {
        target.classList.add("is-talking");
        os.classList.add("is-voicing");
      };
      utterance.onend = utterance.onerror = () => settle(resolve);
      signal.addEventListener("abort", onAbort, { once: true });
      // Some browsers never fire `end` (no voices installed, or a dropped utterance).
      timeout = setTimeout(() => settle(resolve), 3000 + line.text.length * 120);
      currentUtterance = utterance;
      speech.speak(utterance);
    });
  }

  /* ---------- Timeline helpers ---------- */

  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const stop = () => {
      clearTimeout(id);
      reject(signal.reason);
    };
    const id = setTimeout(() => {
      signal.removeEventListener("abort", stop);
      resolve();
    }, ms);
    signal.addEventListener("abort", stop, { once: true });
  });

  function animate(element, keyframes, { duration, ...options }) {
    return element.animate(keyframes, {
      fill: "forwards",
      easing: "ease",
      ...options,
      duration: reduceMotion.matches ? 1 : duration,
    }).finished;
  }

  // Gestures run beside the speech; an aborted scene cancels them, which is expected.
  const gesture = promise => promise.catch(() => {});

  const poseTransform = ({ x, y, scale }) => `translate(${x}px, ${y}px) scale(${scale})`;

  function moveTo(next, duration, easing = "cubic-bezier(.45, 0, .25, 1)") {
    const from = poseTransform(pose);
    pose = { ...pose, ...next };
    return animate(mover, [{ transform: from }, { transform: poseTransform(pose) }], { duration, easing });
  }

  // normal, happy, love, oops, wide (surprised) or unsure (flat mouth).
  function setFace(expression) {
    pepi.dataset.face = expression ?? "normal";
    moodLabel.textContent = moods[pepi.dataset.face];
  }

  function setBrows(mood) {
    pepi.classList.toggle("brows-worried", mood === "worried");
    pepi.classList.toggle("brows-up", mood === "up");
  }

  function setLook(direction) {
    pepi.classList.toggle("look-right", direction === "right");
    pepi.classList.toggle("look-left", direction === "left");
  }

  function setChapter(index) {
    chapterSteps.forEach((step, position) => {
      step.classList.toggle("is-done", position < index);
      step.classList.toggle("is-current", position === index);
    });
    chapterName.textContent = chapters[index];
  }

  /* ---------- Camera: where Pepi stands and how big he is ---------- */

  // Pepi's box without the current pose, in viewport pixels. The pose scales around
  // the centre, so undoing it is a subtraction and a division.
  function naturalBox() {
    const box = mover.getBoundingClientRect();
    return {
      x: box.left + box.width / 2 - pose.x,
      y: box.top + box.height / 2 - pose.y,
      width: box.width / pose.scale,
      height: box.height / pose.scale,
    };
  }

  // The pose that puts Pepi's centre on (x, y) at a given scale.
  function poseAt(x, y, scale, box = naturalBox()) {
    return { x: x - box.x, y: y - box.y, scale };
  }

  // Free room between the toolbar and the dialogue box (or the bottom of the screen).
  function stageArea() {
    const top = toolbar.getBoundingClientRect().bottom + 12;
    const bottom = dialogue.hidden ? innerHeight - 24 : dialogue.getBoundingClientRect().top - 18;
    return { top, bottom, height: bottom - top, x: innerWidth / 2 };
  }

  function fadeShadow(visible, duration) {
    const from = getComputedStyle(shadow).opacity;
    return animate(shadow, [{ opacity: from }, { opacity: visible ? 1 : 0 }], { duration });
  }

  // "close": Pepi comes to the centre, bigger, and a spotlight dims Pepi OS around him.
  // "wide": back to his place on the floor, next to where the duo will stand.
  async function shot(kind, duration = 800) {
    const easing = "cubic-bezier(.65, 0, .35, 1)";
    if (kind === "close") {
      const area = stageArea();
      const box = naturalBox();
      const scale = Math.max(1, Math.min(1.8, area.height * .8 / box.height, innerWidth * .55 / box.width));
      const y = area.top + area.height / 2;
      dialog.style.setProperty("--spot-x", `${area.x}px`);
      dialog.style.setProperty("--spot-y", `${y}px`);
      dialog.style.setProperty("--spot-r", `${Math.round(box.height * scale * .55)}px`);
      dialog.dataset.shot = "close";
      await Promise.all([moveTo(poseAt(area.x, y, scale, box), duration, easing), fadeShadow(false, duration * .5)]);
    } else {
      delete dialog.dataset.shot;
      await Promise.all([moveTo({ x: 0, y: 0, scale: 1 }, duration, easing), fadeShadow(true, duration)]);
    }
  }

  const art = () => pepi.querySelector(".pepi-art");
  const armLeft = () => pepi.querySelector(".pepi-arm-left");
  const armRight = () => pepi.querySelector(".pepi-arm-right");

  function hop(height = 14) {
    return animate(art(), [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(2px) scale(1.06, .94)", offset: .2 },
      { transform: `translateY(-${height}px) scale(.97, 1.04)`, offset: .55 },
      { transform: "translateY(0) scale(1)" },
    ], { duration: 420, fill: "none" });
  }

  function wave(side = "left") {
    const sign = side === "left" ? 1 : -1;
    return animate(side === "left" ? armLeft() : armRight(), [
      { transform: "rotate(0)" }, { transform: `rotate(${sign * 150}deg)`, offset: .2 },
      { transform: `rotate(${sign * 115}deg)`, offset: .4 }, { transform: `rotate(${sign * 150}deg)`, offset: .6 },
      { transform: `rotate(${sign * 115}deg)`, offset: .8 }, { transform: "rotate(0)" },
    ], { duration: 1600, fill: "none" });
  }

  // A thank-you bow: two quick nods of the whole body.
  function bow() {
    const nod = { transform: "translateY(4px) scale(1.03, .92)" };
    const rest = { transform: "translateY(0) scale(1)" };
    return animate(art(), [rest, nod, rest, nod, rest], { duration: 1100, fill: "none" });
  }

  function cheer() {
    const up = sign => [
      { transform: "rotate(0)" }, { transform: `rotate(${sign * 160}deg)`, offset: .25 },
      { transform: `rotate(${sign * 140}deg)`, offset: .5 }, { transform: `rotate(${sign * 160}deg)`, offset: .75 },
      { transform: "rotate(0)" },
    ];
    return Promise.all([
      animate(armLeft(), up(1), { duration: 1300, fill: "none" }),
      animate(armRight(), up(-1), { duration: 1300, fill: "none" }),
      hop(18),
    ]);
  }

  // A double take: a tiny startled jump when he finally sees who is there.
  function doubleTake() {
    return animate(art(), [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-10px) scale(.95, 1.06)", offset: .35 },
      { transform: "translateY(1px) scale(1.04, .96)", offset: .7 },
      { transform: "translateY(0) scale(1)" },
    ], { duration: 420, fill: "none" });
  }

  // A mini giggle for the audience: squeezed eyes, blush, a hand over the mouth,
  // the body shaking with each "hi" and little letters popping out.
  async function giggle() {
    setBrows("up");
    setFace("laugh");
    pepi.classList.add("is-blushing");
    sfx("giggle");
    particles("giggle", 3);
    const shake = [];
    for (let step = 0; step <= 8; step++) {
      const up = step % 2 === 1;
      shake.push({ transform: `translateY(${up ? -3 : 0}px) rotate(${up ? (step % 4 === 1 ? -2 : 2) : 0}deg)` });
    }
    await Promise.all([
      // The hand comes up to the cheek and stays there, trembling, while he laughs.
      animate(armRight(), [
        { transform: "rotate(0)" }, { transform: "rotate(150deg) scale(1.2)", offset: .15 },
        { transform: "rotate(140deg) scale(1.2)", offset: .3 }, { transform: "rotate(150deg) scale(1.2)", offset: .45 },
        { transform: "rotate(140deg) scale(1.2)", offset: .6 }, { transform: "rotate(150deg) scale(1.2)", offset: .8 },
        { transform: "rotate(0)" },
      ], { duration: 1800, fill: "none" }),
      animate(art(), shake, { duration: 1300, easing: "ease-in-out", fill: "none" }),
    ]);
    pepi.classList.remove("is-blushing");
    setBrows(null);
  }

  // The question marks fade out instead of vanishing.
  async function clearThinking(signal) {
    pepi.classList.add("is-thinking-out");
    pepi.classList.remove("is-confused");
    await wait(280, signal);
    pepi.classList.remove("is-thinking-out");
  }

  // Hearts rise from the chest; stars burst outwards when he transforms.
  function particles(kind, count, target = pepi) {
    if (reduceMotion.matches) return;
    if (kind === "hearts") sfx("love");
    for (let index = 0; index < count; index++) {
      const particle = document.createElement("span");
      particle.className = "pepi-particle";
      if (kind === "giggle") {
        particle.classList.add("is-giggle");
        particle.textContent = "hi";
      } else {
        particle.innerHTML = kind === "hearts" ? heartMarkup : starMarkup;
      }
      target.append(particle);
      let path;
      if (kind === "giggle") {
        const tilt = index % 2 ? 12 : -8;
        path = [
          { transform: `translate(0, 0) scale(.3) rotate(${tilt}deg)`, opacity: 0 },
          { transform: `translate(${12 + index * 10}px, -18px) scale(1) rotate(${tilt}deg)`, opacity: 1, offset: .25 },
          { transform: `translate(${30 + index * 18}px, -70px) scale(.9) rotate(${-tilt}deg)`, opacity: 0 },
        ];
      } else if (kind === "hearts") {
        const drift = (Math.random() - .5) * 60;
        path = [
          { transform: "translate(-50%, -50%) scale(.4)", opacity: 0 },
          { transform: "translate(-50%, calc(-50% - 20px)) scale(1)", opacity: 1, offset: .2 },
          { transform: `translate(calc(-50% + ${drift}px), calc(-50% - 120px)) scale(.8)`, opacity: 0 },
        ];
      } else {
        const angle = index / count * Math.PI * 2 + Math.random() * .4;
        const reach = 90 + Math.random() * 50;
        path = [
          { transform: "translate(-50%, -50%) scale(.3) rotate(0)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * reach}px), calc(-50% + ${Math.sin(angle) * reach}px)) scale(1.1) rotate(90deg)`, opacity: 1, offset: .6 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * reach * 1.2}px), calc(-50% + ${Math.sin(angle) * reach * 1.2}px)) scale(.5) rotate(140deg)`, opacity: 0 },
        ];
      }
      particle.animate(path, {
        duration: kind === "hearts" ? 1500 : kind === "giggle" ? 900 : 750,
        delay: kind === "hearts" ? index * 220 : kind === "giggle" ? index * 260 : 0,
        easing: "ease-out",
        fill: "both",
      }).finished.then(() => particle.remove(), () => particle.remove());
    }
  }

  async function typewrite(text, signal, target = lineText) {
    target.textContent = "";
    if (reduceMotion.matches) {
      target.textContent = text;
      return;
    }
    for (let index = 1; index <= text.length; index++) {
      target.textContent = text.slice(0, index);
      await wait(32, signal);
    }
  }

  // Cues fire a reaction on a given word. `at` is the second where the word starts in
  // the recorded clip; without the clip, the cue follows the caption to `phrase`.
  function cueDelay(line, cue, mode, clip) {
    if (mode === "clip" && cue.at !== undefined) return cue.at * 1000;
    const share = Math.max(0, line.text.indexOf(cue.phrase)) / line.text.length;
    // A clip without measured cues: assume the words are spread evenly over it.
    if (mode === "clip") return share * clip.duration * 1000;
    return share * line.text.length * (mode === "speech" ? 62 : 32);
  }

  async function say(line, signal, cues = []) {
    sfx("blip");
    live.textContent = line.text;
    const typing = typewrite(line.text, signal);
    const clip = clips.get(line.id);
    const mode = soundOn && clip ? "clip" : soundOn && speech ? "speech" : "text";
    // Cues belong to this line only: they are dropped once it ends or the scene stops.
    const cueRun = new AbortController();
    const stopCues = () => cueRun.abort();
    signal.addEventListener("abort", stopCues, { once: true });
    for (const cue of cues) {
      wait(cueDelay(line, cue, mode, clip), cueRun.signal).then(() => gesture(Promise.resolve().then(cue.run)), () => {});
    }
    try {
      await speakLine(line, signal, clip, mode, typing);
    } finally {
      stopCues();
      signal.removeEventListener("abort", stopCues);
    }
    await wait(350, signal);
  }

  async function speakLine(line, signal, clip, mode, typing) {
    if (mode === "clip") {
      await Promise.all([typing, playClip(clip, signal)]);
    } else if (mode === "speech") {
      await Promise.all([typing, speak(line, signal)]);
    } else {
      pepi.classList.add("is-talking");
      try {
        await typing;
        await wait(700 + line.text.length * 25, signal);
      } finally {
        pepi.classList.remove("is-talking");
      }
    }
  }

  /* ---------- Scene beats ---------- */

  function ripple(x, y, strong) {
    const ring = document.createElement("span");
    ring.className = "glass-ripple";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    glass.append(ring);
    ring.animate([
      { transform: "translate(-50%, -50%) scale(.2)", opacity: .9 },
      { transform: `translate(-50%, -50%) scale(${strong ? 2.4 : 1.6})`, opacity: 0 },
    ], { duration: 650, easing: "ease-out" }).finished.then(() => ring.remove(), () => ring.remove());
  }

  // A realistic impact: a crushed, frosted point; long jagged radial cracks that taper
  // and branch, racing outwards; rings of the spider web between them; facets that
  // catch the light; chips of glass falling off. A moment later a few cracks creep on.
  function crack(x, y) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("glass-crack");
    const reach = Math.hypot(innerWidth, innerHeight) * .42;
    const speed = 2.6; // px per ms: how fast the cracks run
    const parts = [];
    const segment = (points, width, delay) => {
      const d = points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join("");
      const length = points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);
      parts.push(`<path d="${d}" pathLength="1" stroke-width="${width.toFixed(2)}" style="animation-delay:${Math.round(delay)}ms;animation-duration:${Math.max(30, Math.round(length / speed))}ms"/>`);
    };
    // Main rays: a random walk outwards, drawn as short pieces that get thinner.
    const count = 13;
    const rays = [];
    for (let ray = 0; ray < count; ray++) {
      let angle = (ray + Math.random() * .7) / count * Math.PI * 2;
      const length = reach * (.35 + Math.random() * .65);
      const points = [[x, y]];
      const distances = [0];
      let travelled = 0;
      while (travelled < length) {
        const step = 14 + Math.random() * 26;
        angle += (Math.random() - .5) * .38;
        const [px, py] = points.at(-1);
        points.push([px + Math.cos(angle) * step, py + Math.sin(angle) * step]);
        travelled += step;
        distances.push(travelled);
      }
      rays.push({ points, distances, length });
      for (let index = 1; index < points.length; index++) {
        const share = distances[index] / length;
        segment([points[index - 1], points[index]], 2.8 - share * 2.1, distances[index - 1] / speed);
        // Branches split off now and then, thinner and shorter.
        if (distances[index] > 40 && index < points.length - 2 && Math.random() < .16) {
          let turn = angle + (Math.random() < .5 ? -1 : 1) * (.35 + Math.random() * .5);
          const branch = [points[index]];
          const size = 30 + Math.random() * 120 * (1 - share * .5);
          for (let gone = 0; gone < size;) {
            const step = 10 + Math.random() * 18;
            turn += (Math.random() - .5) * .4;
            const [bx, by] = branch.at(-1);
            branch.push([bx + Math.cos(turn) * step, by + Math.sin(turn) * step]);
            gone += step;
          }
          segment(branch, Math.max(.6, 1.6 - share * 1.2), distances[index] / speed);
        }
      }
    }
    const along = (ray, distance) => {
      const index = ray.distances.findIndex(value => value >= distance);
      if (index <= 0) return null;
      const [a, b] = [ray.points[index - 1], ray.points[index]];
      const t = (distance - ray.distances[index - 1]) / (ray.distances[index] - ray.distances[index - 1]);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    };
    // Facets between the first rays catch the light, each a little differently.
    const facets = [];
    const firstRing = 30 + Math.random() * 14;
    rays.forEach((ray, index) => {
      const [a, b] = [along(ray, firstRing * 2.2), along(rays[(index + 1) % count], firstRing * 2.2)];
      if (!a || !b || Math.random() < .35) return;
      facets.push(`<polygon class="glass-facet" points="${x},${y} ${a.join(",")} ${b.join(",")}" style="--o:${(.04 + Math.random() * .12).toFixed(2)};animation-delay:${Math.round(firstRing / speed)}ms"/>`);
    });
    // The spider web: rings that join neighbouring rays, kinked towards the centre.
    [firstRing, 70, 118, 180, 255].forEach((radius, ring) => {
      rays.forEach((ray, index) => {
        if (Math.random() > [1, .9, .7, .45, .28][ring]) return;
        const size = radius * (.85 + Math.random() * .3);
        const [a, b] = [along(ray, size), along(rays[(index + 1) % count], size * (.85 + Math.random() * .3))];
        if (!a || !b) return;
        const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const pull = .82 + Math.random() * .12;
        const kink = [x + (middle[0] - x) * pull, y + (middle[1] - y) * pull];
        segment([a, kink, b], Math.max(.6, 1.5 - ring * .22), size / speed + 30);
      });
    });
    // The crushed point: tiny cracks all around it.
    for (let crumb = 0; crumb < 14; crumb++) {
      const angle = Math.random() * Math.PI * 2;
      const from = Math.random() * 8;
      const to = from + 5 + Math.random() * 12;
      segment([[x + Math.cos(angle) * from, y + Math.sin(angle) * from], [x + Math.cos(angle + .4) * to, y + Math.sin(angle + .4) * to]], 1, 0);
    }
    // A moment later the longest cracks creep a little further.
    const creep = 950;
    for (const ray of [...rays].sort((a, b) => b.length - a.length).slice(0, 3)) {
      let [px, py] = ray.points.at(-1);
      const [qx, qy] = ray.points.at(-2);
      let angle = Math.atan2(py - qy, px - qx);
      const points = [[px, py]];
      for (let gone = 0, size = 60 + Math.random() * 110; gone < size;) {
        const step = 12 + Math.random() * 20;
        angle += (Math.random() - .5) * .35;
        px += Math.cos(angle) * step;
        py += Math.sin(angle) * step;
        points.push([px, py]);
        gone += step;
      }
      segment(points, .8, creep + Math.random() * 250);
    }
    svg.innerHTML = '<defs><radialGradient id="glass-frost"><stop offset="0" stop-color="#fff" stop-opacity=".85"/>'
      + '<stop offset=".45" stop-color="#eef9ff" stop-opacity=".45"/><stop offset="1" stop-color="#eef9ff" stop-opacity="0"/></radialGradient></defs>'
      + `<circle class="glass-frost" cx="${x}" cy="${y}" r="${(firstRing * .9).toFixed(1)}" fill="url(#glass-frost)"/>${facets.join("")}${parts.join("")}`;
    glass.append(svg);
    chips(x, y);
    setTimeout(() => { if (svg.isConnected) sfx("creak"); }, creep);
    return x;
  }

  // Little chips of glass fall from the impact.
  function chips(x, y) {
    if (reduceMotion.matches) return;
    for (let index = 0; index < 9; index++) {
      const chip = document.createElement("span");
      chip.className = "glass-chip";
      const size = 4 + Math.random() * 8;
      chip.style.cssText = `left:${x}px;top:${y}px;width:${size.toFixed(1)}px;height:${(size * (.6 + Math.random() * .8)).toFixed(1)}px`;
      glass.append(chip);
      const vx = (Math.random() - .5) * 160;
      const up = 20 + Math.random() * 60;
      const fall = 220 + Math.random() * 260;
      const spin = (Math.random() - .5) * 720;
      chip.animate([0, .25, .5, .75, 1].map(t => ({
        transform: `translate(${(vx * t).toFixed(1)}px, ${(-up * 4 * t * (1 - t) + fall * t * t).toFixed(1)}px) rotate(${(spin * t).toFixed(0)}deg)`,
        opacity: t < .7 ? 1 : 1 - (t - .7) / .3,
      })), { duration: 700 + Math.random() * 500, easing: "linear", delay: Math.random() * 80, fill: "both" })
        .finished.then(() => chip.remove(), () => chip.remove());
    }
  }

  function shake(strength) {
    if (reduceMotion.matches) return;
    const s = strength;
    gesture(animate(stage, [
      { transform: "translate(0, 0)" },
      { transform: `translate(${-s}px, ${s / 2}px)` },
      { transform: `translate(${s}px, ${-s / 2}px)` },
      { transform: `translate(${-s / 2}px, ${s / 3}px)` },
      { transform: "translate(0, 0)" },
    ], { duration: 260, easing: "linear", fill: "none" }));
  }

  const ball = () => pepi.querySelector(".pepi-ball-spin");

  function flash() {
    if (reduceMotion.matches) return;
    const ring = document.createElement("span");
    ring.className = "pepi-flash";
    pepi.append(ring);
    ring.animate([
      { transform: "translate(-50%, -50%) scale(.3)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.8)", opacity: 0 },
    ], { duration: 520, easing: "ease-out" }).finished.then(() => ring.remove(), () => ring.remove());
  }

  // The face screen boots like an old TV: a bright line, then the face flickers on.
  async function bootFace() {
    pepi.classList.add("is-booting");
    await animate(pepi.querySelector(".pepi-boot-line"), [
      { opacity: 1, transform: "scaleX(0)" }, { opacity: 1, transform: "scaleX(1)", offset: .5 },
      { opacity: 0, transform: "scaleX(1) scaleY(8)" },
    ], { duration: 420, fill: "none" });
    pepi.classList.remove("is-booting");
    setFace("happy");
    await animate(pepi.querySelector(".pepi-face"), [{ opacity: 0 }, { opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: 320, fill: "none" });
  }

  // Ball -> robot. The full version wobbles and plays the reveal jingle; the short one
  // just pops open. Either way every part springs out with a small stagger.
  async function unfold(full) {
    if (full) {
      await animate(ball(), [
        { transform: "rotate(0)" }, { transform: "rotate(-20deg)" }, { transform: "rotate(14deg)" },
        { transform: "rotate(-7deg)" }, { transform: "rotate(0)" },
      ], { duration: 650, fill: "none" });
    }
    await animate(ball(), [
      { transform: "scale(1)" }, { transform: "scale(1.15, .85)" }, { transform: "scale(.92, 1.08)" },
    ], { duration: full ? 280 : 160, fill: "none" });
    sfx(full ? "reveal" : "pop");
    flash();
    particles("stars", full ? 8 : 5);
    pepi.classList.remove("is-ball");
    const spring = "cubic-bezier(.3, 1.5, .5, 1)";
    const pop = (selector, keyframes, delay) => animate(pepi.querySelector(selector), keyframes, { duration: 340, delay, easing: spring, fill: "backwards" });
    const grow = [{ transform: "scale(0)" }, { transform: "scale(1)" }];
    await Promise.all([
      animate(pepi.querySelector(".pepi-core"), [
        { transform: "scale(.78)" }, { transform: "scale(1.07)", offset: .6 }, { transform: "scale(1)" },
      ], { duration: 420, fill: "none" }),
      pop(".pepi-feet", [{ transform: "translateY(-6px) scaleY(0)" }, { transform: "translateY(0) scaleY(1)" }], 100),
      pop(".pepi-ear-left", grow, 160),
      pop(".pepi-ear-right", grow, 160),
      pop(".pepi-arm-left", grow, 220),
      pop(".pepi-arm-right", grow, 280),
      pop(".pepi-antenna", [{ transform: "translateY(7px) scale(.3)" }, { transform: "translateY(0) scale(1)" }], 340),
    ]);
  }

  // Robot -> ball: squash down and pop into the rolled-up shape.
  async function curl() {
    await animate(art(), [{ transform: "scale(1)" }, { transform: "scale(1.1, .85)" }], { duration: 160, fill: "none" });
    sfx("pop");
    pepi.classList.add("is-ball");
    await animate(ball(), [{ transform: "scale(1.15, .85)" }, { transform: "scale(1)" }], { duration: 200, fill: "none" });
  }

  /* ---------- Entrance: Pepi OS boots, builds Pepi, and he rushes to the glass ---------- */

  async function bootSystem(signal) {
    setChapter(0);
    live.textContent = "A introdução está começando.";
    sfx("boot");
    if (!reduceMotion.matches) {
      // A CRT power-on: a thin line opens into the whole screen, then fades.
      power.animate([
        { opacity: 1, transform: "scale(0, .004)" },
        { opacity: 1, transform: "scale(1, .004)", offset: .45 },
        { opacity: .85, transform: "scale(1, 1)", offset: .7 },
        { opacity: 0, transform: "scale(1, 1)" },
      ], { duration: 900, easing: "ease-out" });
      await wait(520, signal);
    }
    os.classList.remove("is-off");
    await wait(reduceMotion.matches ? 0 : 650, signal);
  }

  const buildSteps = [
    ["Desenhando a planta", 12],
    ["Montando o chassi rosa", 34],
    ["Instalando o coração de lata", 57],
    ["Calibrando o sorriso", 79],
    ["Ligando a antena de estrela", 93],
  ];

  // The log keeps the last three lines; finished steps get a check mark.
  function logLine(text, state = "is-running") {
    for (const item of buildLog.querySelectorAll(".is-running")) item.classList.replace("is-running", "is-ok");
    const item = document.createElement("li");
    item.className = state;
    item.textContent = text;
    buildLog.append(item);
    while (buildLog.children.length > 3) buildLog.firstElementChild.remove();
    sfx("tick");
  }

  function setProgress(percent) {
    buildProgress.style.transform = `scaleX(${percent / 100})`;
    buildPercent.textContent = `${percent}%`;
  }

  // The window frames Pepi: title bar, room around him, and the log underneath.
  function placeBuildWindow(x, y, width, height) {
    const bar = 40;
    const above = 30;
    const below = 26;
    const foot = 104;
    const frameWidth = Math.min(innerWidth - 32, Math.max(380, width * 2.3));
    const frameHeight = bar + above + height + below + foot;
    const top = Math.max(12, y - height / 2 - above - bar);
    Object.assign(build.style, {
      left: `${x - frameWidth / 2}px`,
      top: `${top}px`,
      width: `${frameWidth}px`,
      height: `${frameHeight}px`,
    });
  }

  // Pepi is created on screen: first his blueprint, then a printer head lays down
  // one pixel row at a time while the log reports each part, and finally his face boots.
  async function buildPepi(signal) {
    const area = stageArea();
    const box = naturalBox();
    const scale = Math.max(.8, Math.min(1.5, area.height * .44 / box.height));
    const x = area.x;
    const y = area.top + area.height * .42;
    pose = poseAt(x, y, scale, box);
    mover.animate({ transform: poseTransform(pose) }, { duration: 0, fill: "forwards" });
    placeBuildWindow(x, y, box.width * scale, box.height * scale);

    const print = art();
    print.style.clipPath = "inset(0 0 100% 0)";
    pepi.classList.remove("is-ball");
    pepi.classList.add("is-building", "is-booting");
    mover.style.opacity = "";
    build.hidden = false;
    placeLabel.textContent = "Oficina do Pepi";
    live.textContent = "O Pepi Bolota está sendo criado.";
    await animate(build, [
      { opacity: 0, transform: "translateY(16px) scale(.97)" },
      { opacity: 1, transform: "none" },
    ], { duration: 420, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "none" });
    logLine(buildSteps[0][0]);
    setProgress(buildSteps[0][1]);
    await wait(reduceMotion.matches ? 0 : 700, signal);

    const timing = { duration: reduceMotion.matches ? 1 : 3000, easing: "steps(51, end)", fill: "forwards" };
    pepi.classList.add("is-printing");
    const printing = print.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], timing);
    pepi.querySelector(".pepi-scan").animate([{ top: "0%" }, { top: "100%" }], timing);
    for (const [text, percent] of buildSteps.slice(1)) {
      logLine(text);
      setProgress(percent);
      await wait(reduceMotion.matches ? 0 : 720, signal);
    }
    await printing.finished;
    // The art must not stay clipped: raised arms reach outside its box.
    print.style.clipPath = "";
    printing.cancel();
    pepi.classList.remove("is-printing", "is-building");

    setProgress(100);
    await bootFace();
    logLine("Pepi Bolota pronto!", "is-done");
    buildStatus.textContent = "concluído";
    build.classList.add("is-complete");
    sfx("reveal");
    flash();
    particles("stars", 6);
    gesture(hop(10));
    gesture(wave("left"));
    await wait(1400, signal);
    await animate(build, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], { duration: 300, easing: "ease-in", fill: "none" });
    build.hidden = true;
  }

  // Ready, Pepi opens the workshop onto the world: a hole grows from him and the
  // seafront of Aracaju appears behind it, while he looks around in wonder.
  async function openSeafront(signal) {
    scenery?.focus("orla");
    if (reduceMotion.matches) {
      lab.classList.add("is-open");
      return;
    }
    const box = pepi.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 60;
    lab.style.setProperty("--hole-x", `${Math.round(cx)}px`);
    lab.style.setProperty("--hole-y", `${Math.round(cy)}px`);
    lab.classList.add("is-opening");
    sfx("boot");
    setFace("star");
    const opening = animate(lab, [
      { "--hole": "0px", opacity: 1 },
      { "--hole": `${Math.round(box.width * .45)}px`, opacity: 1, offset: .25 },
      { "--hole": `${Math.round(far)}px`, opacity: 1, offset: .9 },
      { "--hole": `${Math.round(far)}px`, opacity: 0 },
    ], { duration: 1500, easing: "cubic-bezier(.6, 0, .3, 1)" });
    await wait(500, signal);
    setLook("left");
    await wait(450, signal);
    setLook("right");
    await opening;
    lab.classList.replace("is-opening", "is-open");
    setLook(null);
    setFace("happy");
    await wait(250, signal);
  }

  // Rolled up again, he bounces out of the build window straight at the glass,
  // growing as he gets closer to the audience.
  async function launch() {
    const box = naturalBox();
    const end = Math.max(1.6, Math.min(5, innerHeight * .85 / box.height, innerWidth * .9 / box.width));
    const target = poseAt(innerWidth / 2, innerHeight * .55, end, box);
    if (reduceMotion.matches) {
      await moveTo(target, 1);
      return;
    }
    await curl();
    const from = { ...pose };
    const at = (share, lift = 0) => ({
      x: from.x + (target.x - from.x) * share,
      y: from.y + (target.y - from.y) * share - lift,
      scale: from.scale + (target.scale - from.scale) * share,
    });
    pose = target;
    const bounce = "cubic-bezier(.3, 0, .6, 1)";
    await Promise.all([
      animate(mover, [
        { transform: poseTransform(from), easing: bounce },
        { transform: poseTransform(at(.28, 70)), offset: .28, easing: bounce },
        { transform: poseTransform(at(.52)), offset: .52, easing: bounce },
        { transform: poseTransform(at(.76, 45)), offset: .76, easing: bounce },
        { transform: poseTransform(target) },
      ], { duration: 1500, easing: "linear" }),
      animate(ball(), [{ transform: "rotate(0)" }, { transform: "rotate(1080deg)" }], {
        duration: 1500, easing: "cubic-bezier(.25, .6, .4, 1)", fill: "none",
      }),
    ]);
    sfx("knock");
  }

  async function rollBack() {
    if (reduceMotion.matches) {
      await moveTo({ x: 0, y: 0, scale: 1 }, 1);
      shadow.style.opacity = "";
      return;
    }
    await curl();
    await Promise.all([
      moveTo({ x: 0, y: 0, scale: 1 }, 1100),
      animate(ball(), [{ transform: "rotate(0)" }, { transform: "rotate(-1080deg)" }], { duration: 1100, fill: "none", easing: "cubic-bezier(.45, 0, .25, 1)" }),
      animate(shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 1100 }),
    ]);
    shadow.style.opacity = "";
    await unfold(false);
  }

  const knockPose = "rotate(-135deg)";

  async function knock(strong, signal) {
    const arm = armRight();
    await animate(arm, [{ transform: knockPose }, { transform: `${knockPose} scale(1.5)` }], { duration: 110, easing: "ease-in" });
    const hand = pepi.querySelector(".pepi-arm-right .pepi-hand").getBoundingClientRect();
    const x = hand.left + hand.width / 2;
    const y = hand.top + hand.height / 2;
    ripple(x, y, strong);
    if (strong) {
      crack(x, y);
      sfx("crack");
      setFace("oops");
      setBrows("worried");
      shake(14);
    } else {
      sfx("knock");
      shake(4);
    }
    await animate(arm, [{ transform: `${knockPose} scale(1.5)` }, { transform: knockPose }], { duration: 160, easing: "ease-out" });
    await wait(strong ? 650 : 330, signal);
    return x;
  }

  async function entrance(signal) {
    await bootSystem(signal);
    await buildPepi(signal);
    await openSeafront(signal);
    await launch();
    await wait(120, signal);
    await unfold(true);
    await wait(400, signal);
    setFace(null);
    await animate(armRight(), [{ transform: "rotate(0)" }, { transform: knockPose }], { duration: 280 });
    await wait(200, signal);
    await knock(false, signal);
    await knock(false, signal);
    await wait(250, signal);
    const crackX = await knock(true, signal);
    pepi.classList.add("is-nervous");
    await animate(armRight(), [{ transform: knockPose }, { transform: "rotate(0)" }], { duration: 250 });
    await rollBack();

    // "Oops." He checks the crack, then gives the audience a sheepish smile.
    setFace("oops");
    const pepiBox = pepi.getBoundingClientRect();
    setLook(crackX > pepiBox.left + pepiBox.width / 2 ? "right" : "left");
    await wait(800, signal);
    setLook(null);
    setFace("happy");
    await wait(900, signal);
    pepi.classList.remove("is-nervous");
    setFace(null);
    setBrows(null);
    for (const crackLines of glass.querySelectorAll(".glass-crack")) {
      crackLines.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1400, delay: 300, fill: "forwards" })
        .finished.then(() => crackLines.remove(), () => {});
    }
  }

  async function bringDuo(signal) {
    // FLIP: the duo enters the layout and pushes Pepi aside. Measure Pepi before and
    // after, start from the old spot and glide to the new one instead of jumping.
    const before = rig.getBoundingClientRect().left;
    duo.hidden = false;
    const after = rig.getBoundingClientRect().left;
    pose = { ...pose, x: pose.x + before - after };
    mover.animate({ transform: poseTransform(pose) }, { duration: 0, fill: "forwards" });
    const glide = moveTo({ x: 0 }, 900);
    // They come in from the right and keep their spacing; the one nearest Pepi leads.
    const figures = [...duo.querySelectorAll(".intro-person")];
    const distance = innerWidth - duo.getBoundingClientRect().left + 30;
    const walks = figures.map((figure, index) => {
      figure.classList.add("is-walking");
      return animate(figure, [{ transform: `translateX(${distance}px)` }, { transform: "translateX(0)" }], {
        duration: 1700, delay: index * 260, easing: "cubic-bezier(.3, .1, .4, 1)", fill: "both",
      }).then(() => {
        figure.classList.remove("is-walking");
        figure.classList.add("has-arrived");
        sfx("pop");
        return animate(figure, [{ transform: "translateY(0)" }, { transform: "translateY(-12px)" }, { transform: "translateY(0)" }], { duration: 300, fill: "none" });
      });
    });
    await Promise.all([glide, ...walks]);
    await wait(150, signal);
  }

  async function play(signal) {
    clipsRequest ??= loadClips();
    await wait(200, signal);
    await entrance(signal);
    clips = await clipsRequest;
    pickVoice();
    await wait(300, signal);

    // Hello: a close-up, Pepi in the spotlight.
    setChapter(1);
    dialogue.hidden = false;
    setFace("happy");
    await shot("close", 750);
    gesture(wave("left"));
    await say(lines.hello, signal);
    gesture(cheer());
    await say(lines.guide, signal);
    setFace(null);
    gesture(shot("wide", 900));
    // "...para a Semana Acadêmica da Universidade Federal de Sergipe": the camera
    // travels from Aracaju's seafront to the UFS campus.
    await say(lines.origin, signal, [
      { at: 3.3, phrase: "para a Semana", run: () => scenery?.focus("ufs", 3400) },
    ]);

    // Made with love: back in close-up, the heart racing.
    setFace("love");
    pepi.classList.add("is-loving");
    particles("hearts", 3);
    gesture(shot("close", 700));
    await say(lines.purpose, signal, [
      { at: 6.62, phrase: "Eles pensaram", run: () => { pepi.classList.remove("is-loving"); setFace("happy"); } },
      { at: 8.5, phrase: "até na minha voz", run: () => { setFace("wink"); sfx("sparkle"); } },
      { at: 11.08, phrase: "Eu vim para", run: () => { setFace("happy"); return hop(10); } },
    ]);
    pepi.classList.remove("is-loving");

    // What the workshop is about, one topic at a time.
    setChapter(2);
    setFace("happy");
    gesture(shot("wide", 800));
    particles("stars", 6);
    gesture(hop(12));
    await say(lines.lab, signal);
    setFace(null);
    await say(lines.goal, signal);
    setFace("happy");
    gesture(wave("right"));
    await say(lines.lessons, signal, [
      // "E a melhor parte: eu!" A quick push-in, a wink and a burst of stars.
      { at: 8.18, phrase: "E a melhor parte", run: () => shot("close", 500) },
      { at: 9.5, phrase: "eu!", run: () => { setFace("wink"); sfx("sparkle"); particles("stars", 6); return hop(10); } },
    ]);
    setFace(null);
    gesture(shot("wide", 700));
    await say(lines.colors, signal);
    setFace("wide");
    await say(lines.games, signal);
    setFace("happy");
    gesture(cheer());
    await say(lines.builder, signal, [
      { at: 8.54, phrase: "Isso não é animal", run: () => { setFace("star"); sfx("sparkle"); particles("stars", 5); } },
    ]);
    setFace("love");
    particles("hearts", 3);
    await say(lines.everyone, signal);

    // The presenters stand on the left of the projected screen.
    setChapter(3);
    setFace(null);
    await say(lines.call, signal);
    await wait(400, signal);
    setLook("left");
    await moveTo({ x: -Math.min(80, innerWidth * .08) }, 600);
    gesture(wave("left"));
    await say(lines.papais, signal);
    await wait(500, signal);
    // He sees them for real: a double take, then question marks over his head.
    setFace("wide");
    setBrows("up");
    sfx("pop");
    await doubleTake();
    await wait(600, signal);
    setBrows(null);
    setFace("unsure");
    pepi.classList.add("is-confused");
    sfx("pop");
    await wait(1400, signal);
    // ...then he turns to the audience, the camera pushes in, and he giggles.
    await clearThinking(signal);
    setLook(null);
    setFace("happy");
    await shot("close", 650);
    await giggle();
    setFace("unsure");
    setBrows("up");
    await say(lines.confused, signal);
    setBrows(null);
    await wait(300, signal);

    // ...and their pixel versions arrive from the right.
    setFace("happy");
    setLook("right");
    await shot("wide", 700);
    await moveTo({ x: Math.min(40, innerWidth * .04) }, 400);
    gesture(cheer());
    await say(lines.summon, signal);
    await bringDuo(signal);

    // Closing: Pepi stays a bit smaller than the duo, who are the stars now.
    setChapter(4);
    setLook(null);
    particles("hearts", 4);
    await hop(16);
    setFace("love");
    await say(lines.thanks, signal, [
      { at: 2.44, phrase: "Ou melhor", run: () => { setFace("wink"); setLook("left"); } },
      { at: 4.04, phrase: "Muito obrigado", run: () => { setLook(null); setFace("love"); return bow(); } },
      { at: 7.38, phrase: "Isso deixa", run: () => { setFace("shy"); pepi.classList.add("is-blushing", "is-loving"); particles("hearts", 3); } },
    ]);
    pepi.classList.remove("is-blushing", "is-loving");
    setFace("happy");
    gesture(wave("left"));
    await say(lines.start, signal);
    showEnding();
  }

  function showEnding() {
    ending.hidden = false;
    get("intro-start").focus();
  }

  /* ---------- After "Começar": Pepi hands the player over to the avatar editor ---------- */

  const avatarDialog = get("avatar-dialog");
  const desktop = get("arcade-desktop");
  const editAvatarButton = get("edit-avatar");
  let handingOff = false;

  // Instead of the arcade's usual boot screen, the desktop is switched on underneath
  // and the intro closes like an iris onto Pepi, rolled up in the middle of the screen:
  // the scene shrinks into the ball, the ball gives a little bounce and winks out.
  // The same circle that opened the seafront now closes the story.
  let irisCentre = null;
  async function irisOut() {
    document.dispatchEvent(new CustomEvent("frontarcade:boot"));
    if (reduceMotion.matches) return;
    await curl();
    const box = naturalBox();
    const scale = Math.max(1.4, Math.min(2.2, innerHeight * .3 / box.height));
    await Promise.all([
      moveTo(poseAt(innerWidth / 2, innerHeight * .48, scale, box), 750, "cubic-bezier(.45, 0, .25, 1)"),
      animate(ball(), [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 750, fill: "none", easing: "cubic-bezier(.45, 0, .25, 1)" }),
      fadeShadow(false, 400),
      // Captions and the duo step aside, leaving Pepi alone in the scenery.
      animate(dialogue, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
      animate(duo, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
    ]);
    const ballBox = pepi.querySelector(".pepi-ball").getBoundingClientRect();
    const cx = ballBox.left + ballBox.width / 2;
    const cy = ballBox.top + ballBox.height / 2;
    irisCentre = { x: cx, y: cy };
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40;
    const snug = ballBox.width * .5 + 34;
    dialog.style.setProperty("--iris-x", `${Math.round(cx)}px`);
    dialog.style.setProperty("--iris-y", `${Math.round(cy)}px`);
    dialog.classList.add("is-leaving");
    sfx("boot");
    await animate(dialog, [{ "--iris": `${Math.round(far)}px` }, { "--iris": `${Math.round(snug)}px` }], {
      duration: 1300, easing: "cubic-bezier(.65, 0, .35, 1)",
    });
    await animate(ball(), [
      { transform: "scale(1)" }, { transform: "scale(1.18, .84)", offset: .35 }, { transform: "scale(.9, 1.1)", offset: .7 }, { transform: "scale(1)" },
    ], { duration: 360, fill: "none" });
    sfx("pop");
    await Promise.all([
      animate(dialog, [{ "--iris": `${Math.round(snug)}px` }, { "--iris": "0px" }], { duration: 420, easing: "cubic-bezier(.55, 0, .75, .2)" }),
      animate(ball(), [{ transform: "scale(1)" }, { transform: "scale(0)" }], { duration: 420, easing: "cubic-bezier(.55, 0, .75, .2)" }),
    ]);
  }

  // Where the iris closed, a little star twinkles over the desktop for a moment.
  function twinkleOnDesktop() {
    if (!irisCentre || reduceMotion.matches) return;
    const spark = document.createElement("span");
    spark.className = "pepi-iris-spark";
    spark.innerHTML = starMarkup;
    spark.style.left = `${Math.round(irisCentre.x)}px`;
    spark.style.top = `${Math.round(irisCentre.y)}px`;
    irisCentre = null;
    document.body.append(spark);
    sfx("sparkle");
    spark.animate([
      { transform: "translate(-50%, -50%) scale(0) rotate(0)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.3) rotate(90deg)", opacity: 1, offset: .35 },
      { transform: "translate(-50%, -50%) scale(.2) rotate(180deg)", opacity: 0 },
    ], { duration: 900, easing: "ease-out" }).finished.then(() => spark.remove(), () => spark.remove());
  }

  async function handOff() {
    if (handingOff) return;
    handingOff = true;
    const signal = controller?.signal;
    try {
      if (signal && !signal.aborted) {
        ending.hidden = true;
        setLook(null);
        setFace("happy");
        gesture(cheer());
        await say(lines.ready, signal, [
          { at: 2.66, phrase: "como você é", run: () => setFace("wink") },
          { at: 4.04, phrase: "E qual é o seu nome", run: () => { setFace("wide"); setBrows("up"); } },
          { at: 5.78, phrase: "Senão", run: () => { setBrows(null); setFace("laugh"); sfx("giggle"); } },
        ]);
        setBrows(null);
        setFace("happy");
        await irisOut();
      }
    } catch {
      // Skipped halfway: still go on to the arcade.
    }
    handingOff = false;
    if (dialog.open) dialog.close();
    powerButton.click(); // only boots if the iris did not already
    twinkleOnDesktop();
    await openEditorForGuide();
  }

  // The arcade boots first. Without a saved avatar it opens the editor by itself;
  // with one, Pepi opens it so the player can make it their own again.
  async function openEditorForGuide() {
    const deadline = performance.now() + 8000;
    while (!avatarDialog.open && performance.now() < deadline) {
      if (!desktop.hidden) {
        editAvatarButton.click();
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (avatarDialog.open) showGuide(lines.avatar);
  }

  // In the editor Pepi becomes a little companion: he peeks in from the right edge of
  // the screen, leaning in, waves and says his line in a speech bubble. Then he stays
  // around (when there is room beside the editor) and reacts to what the player does:
  // his eyes follow the pointer, he cheers every choice, greets the name typed in the
  // form and giggles when tickled.
  const guide = document.createElement("section");
  guide.className = "pepi-guide";
  guide.setAttribute("aria-label", "Recado do Pepi Bolota");
  guide.hidden = true;
  guide.innerHTML = `
    <div class="pepi-guide-bubble" hidden>
      <p class="pepi-guide-name">Pepi Bolota</p>
      <p class="pepi-guide-text" aria-hidden="true"></p>
      <p class="intro-sr" aria-live="polite"></p>
      <button class="pepi-guide-close" type="button">Entendi</button>
    </div>
    <div class="pepi-guide-peek" aria-hidden="true"><div class="pepi pepi-guide-bot" data-face="happy">${pepiMarkup()}</div></div>`;
  const guideBot = guide.querySelector(".pepi-guide-bot");
  const guidePeek = guide.querySelector(".pepi-guide-peek");
  const guideBubble = guide.querySelector(".pepi-guide-bubble");
  const guideText = guide.querySelector(".pepi-guide-text");
  const guideLive = guide.querySelector("[aria-live]");
  const guideClose = guide.querySelector(".pepi-guide-close");
  const nameField = get("player-name");
  let session = null; // everything the companion does while visible
  let speechRun = null; // the spoken line, stopped by "Entendi"
  let bubbleTimer = 0;
  let faceTimer = 0;
  let lastReaction = 0;
  let greetedName = "";

  const guideArt = () => guideBot.querySelector(".pepi-art");
  const hasRoom = () => innerWidth - avatarDialog.getBoundingClientRect().right >= 150;

  function guideFace(face, hold = 0) {
    clearTimeout(faceTimer);
    guideBot.dataset.face = face;
    // Reactions fade back to the resting face, which blinks and follows the pointer.
    if (hold) faceTimer = setTimeout(() => { guideBot.dataset.face = "normal"; }, hold);
  }

  function guideHop(height = 10) {
    return gesture(animate(guideArt(), [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(2px) scale(1.06, .94)", offset: .2 },
      { transform: `translateY(-${height}px) scale(.97, 1.04)`, offset: .55 },
      { transform: "translateY(0) scale(1)" },
    ], { duration: 420, fill: "none" }));
  }

  function guideWave(duration = 1600) {
    return gesture(animate(guideBot.querySelector(".pepi-arm-left"), [
      { transform: "rotate(0)" }, { transform: "rotate(150deg)", offset: .18 }, { transform: "rotate(115deg)", offset: .36 },
      { transform: "rotate(150deg)", offset: .54 }, { transform: "rotate(115deg)", offset: .72 }, { transform: "rotate(0)" },
    ], { duration, fill: "none" }));
  }

  async function openBubble() {
    clearTimeout(bubbleTimer);
    if (!guideBubble.hidden) return;
    guideBubble.hidden = false;
    await animate(guideBubble, [{ opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "scale(1)" }], {
      duration: 260, easing: "cubic-bezier(.3, 1.5, .5, 1)", fill: "none",
    });
  }

  async function closeBubble() {
    clearTimeout(bubbleTimer);
    if (guideBubble.hidden) return;
    await animate(guideBubble, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.9)" }], { duration: 180, fill: "none" });
    guideBubble.hidden = true;
  }

  // A short caption-only remark, for reactions that have no recorded voice.
  function remark(text, hold = 2600) {
    guideText.textContent = text;
    guideLive.textContent = text;
    guideClose.hidden = true;
    guideBubble.classList.add("is-remark");
    openBubble();
    bubbleTimer = setTimeout(closeBubble, hold);
  }

  async function showGuide(line) {
    session?.abort();
    session = new AbortController();
    const { signal } = session;
    speechRun = new AbortController();
    const speaking = AbortSignal.any ? AbortSignal.any([signal, speechRun.signal]) : speechRun.signal;
    avatarDialog.append(guide);
    guide.hidden = false;
    guideBubble.hidden = true;
    guideBubble.classList.remove("is-remark");
    guideClose.hidden = false;
    guideFace("happy");
    guideText.textContent = "";
    guideLive.textContent = line.text;
    try {
      sfx("pop");
      // He slides in from the edge with a little overshoot and waves hello.
      await animate(guidePeek, [
        { transform: "translateX(110%)" }, { transform: "translateX(-8%)", offset: .7 }, { transform: "translateX(0)" },
      ], { duration: 700, easing: "cubic-bezier(.2, .8, .3, 1)", fill: "backwards" });
      guideWave(2600);
      guideHop(8);
      await openBubble();
      clipsRequest ??= loadClips();
      clips = await clipsRequest;
      const clip = clips.get(line.id);
      const typing = typewrite(line.text, speaking, guideText);
      try {
        if (soundOn && clip) await Promise.all([typing, playClip(clip, speaking, guideBot)]);
        else if (soundOn && speech) await Promise.all([typing, speak(line, speaking, guideBot)]);
        else await typing;
      } catch {
        if (signal.aborted) throw signal.reason; // the editor closed; "Entendi" just ends the line
      }
      guideFace("wink", 1400);
      await wait(1800, signal);
      await closeBubble();
      if (!hasRoom()) {
        // No room beside the editor: a goodbye wave, then he steps out of the way.
        guideWave(1200);
        await wait(1200, signal);
        hideGuide();
      }
    } catch {
      // The editor was closed.
    }
  }

  async function hideGuide() {
    if (guide.hidden) return;
    session?.abort();
    clearTimeout(bubbleTimer);
    clearTimeout(faceTimer);
    await Promise.all([
      closeBubble(),
      animate(guidePeek, [{ transform: "translateX(0)" }, { transform: "translateX(110%)" }], { duration: 420, easing: "ease-in", fill: "forwards" }),
    ]);
    guide.hidden = true;
    for (const animation of guide.getAnimations({ subtree: true })) {
      if (animation.constructor === Animation) animation.cancel();
    }
  }

  // Eyes (and a little lean of the body) follow the pointer.
  avatarDialog.addEventListener("pointermove", event => {
    if (guide.hidden || reduceMotion.matches) return;
    const box = guideBot.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / 260));
    const dy = Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / 260));
    guideBot.style.setProperty("--look-x", `${Math.round(dx * 2)}px`);
    guideBot.style.setProperty("--look-y", `${Math.round(dy)}px`);
    guideBot.style.rotate = `${(dx * 4).toFixed(1)}deg`;
  });

  // Every choice in the editor gets a cheer.
  const cheers = [["love", "hearts"], ["star", "stars"], ["happy", "stars"], ["wink", "hearts"]];
  avatarDialog.addEventListener("change", event => {
    if (guide.hidden || event.target === nameField) return;
    const now = performance.now();
    if (now - lastReaction < 450) return;
    lastReaction = now;
    const [face, burst] = cheers[Math.floor(Math.random() * cheers.length)];
    guideFace(face, 1300);
    guideHop(10);
    sfx("blip");
    if (burst === "stars") particles("stars", 4, guideBot);
    else particles("hearts", 2, guideBot);
  });

  get("randomize").addEventListener("click", () => {
    if (guide.hidden) return;
    guideFace("wide", 500);
    setTimeout(() => { if (!guide.hidden) { guideFace("laugh", 1200); guideHop(14); particles("stars", 6, guideBot); } }, 450);
  });

  // He greets the name once the player stops typing.
  let nameTimer = 0;
  nameField.addEventListener("input", () => {
    if (guide.hidden) return;
    guideFace("happy");
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const name = nameField.value.trim().slice(0, 24);
      if (!name || name === greetedName || guide.hidden) return;
      greetedName = name;
      guideFace("love", 2200);
      guideHop(12);
      particles("hearts", 3, guideBot);
      remark(`Prazer, ${name}!`);
    }, 900);
  });

  // Tickles: hovering makes him giggle, a click makes him jump with joy.
  guidePeek.addEventListener("pointerenter", () => {
    if (guide.hidden) return;
    guideFace("laugh", 1400);
    guideBot.classList.add("is-blushing");
    sfx("giggle");
    particles("giggle", 2, guideBot);
  });
  guidePeek.addEventListener("pointerleave", () => guideBot.classList.remove("is-blushing"));
  guidePeek.addEventListener("click", () => {
    guideFace("love", 1500);
    guideHop(16);
    particles("hearts", 3, guideBot);
  });

  guideClose.addEventListener("click", () => {
    speechRun?.abort();
    closeBubble();
  });
  avatarDialog.addEventListener("close", () => {
    session?.abort();
    clearTimeout(bubbleTimer);
    clearTimeout(faceTimer);
    clearTimeout(nameTimer);
    guide.hidden = true;
    greetedName = "";
  });

  /* ---------- Lifecycle ---------- */

  function resetScene() {
    for (const animation of dialog.getAnimations({ subtree: true })) {
      if (animation.constructor === Animation) animation.cancel();
    }
    pose = { x: 0, y: 0, scale: 1 };
    pepi.className = "pepi is-ball";
    setFace(null);
    pepi.querySelectorAll(".pepi-particle, .pepi-flash").forEach(item => item.remove());
    art().style.clipPath = "";
    mover.style.opacity = "0";
    shadow.style.opacity = "0";
    delete dialog.dataset.shot;
    os.classList.add("is-off");
    os.classList.remove("is-voicing");
    os.style.setProperty("--level", "0");
    build.hidden = true;
    build.classList.remove("is-complete");
    buildLog.replaceChildren();
    buildStatus.textContent = "compilando";
    setProgress(0);
    setChapter(0);
    scenery?.focus("orla");
    placeLabel.textContent = "Oficina do Pepi";
    lab.classList.remove("is-opening", "is-open");
    dialog.classList.remove("is-leaving");
    glass.replaceChildren();
    duo.hidden = true;
    duo.querySelectorAll(".intro-person").forEach(figure => figure.classList.remove("is-walking", "has-arrived"));
    dialogue.hidden = true;
    ending.hidden = true;
    lineText.textContent = "";
    live.textContent = "";
  }

  function silence() {
    speech?.cancel();
    currentUtterance = null;
    if (currentClip) {
      // Ending the clip resolves the line, so the scene simply moves on in silence.
      currentClip.stop();
    }
  }

  async function start() {
    controller?.abort();
    const run = new AbortController();
    controller = run;
    silence();
    resetScene();
    if (!dialog.open) dialog.showModal();
    scenery?.start();
    get("intro-title").focus();
    try {
      await play(run.signal);
    } catch (error) {
      if (run.signal.aborted) return;
      // Never leave the audience stuck in front of a frozen scene.
      console.error(error);
      os.classList.remove("is-off");
      lab.classList.add("is-open");
      scenery?.focus("orla");
      build.hidden = true;
      art().style.clipPath = "";
      mover.style.opacity = "";
      pepi.classList.remove("is-ball", "is-booting", "is-building", "is-printing");
      dialogue.hidden = false;
      showEnding();
    }
  }

  function stop() {
    controller?.abort();
    controller = null;
    silence();
    resetScene();
    scenery?.stop();
  }

  pepi.insertAdjacentHTML("afterbegin", pepiMarkup());
  // After the real art, so `querySelector` keeps finding the real arms and face first.
  pepi.insertAdjacentHTML("beforeend", `${blueprintMarkup()}<span class="pepi-scan" aria-hidden="true"></span>`);
  dialog.querySelector(".os-brand-mark").innerHTML = starMarkup;
  // Bits of data drifting up through the workshop, each at its own pace.
  lab.querySelector(".lab-bits").innerHTML = Array.from({ length: 18 }, (_, index) =>
    `<i style="left:${(index * 37 + 11) % 97 + 1.5}%; --t:${(5 + (index * 7 % 5) * .9).toFixed(1)}s; --d:${(-index * 1.3 % 6).toFixed(1)}s"></i>`).join("");
  scenery?.mount(dialog.querySelector(".scenery"), { onPlaceChange: label => { placeLabel.textContent = label; } });
  const icon = openButton.querySelector(".intro-button-icon");
  icon.innerHTML = pepiMarkup("1 -1 46 46");
  icon.dataset.face = "happy";
  for (const canvas of duo.querySelectorAll("canvas[data-person]")) paintPerson(canvas, people[canvas.dataset.person]);
  renderSoundButton();
  pickVoice();
  speech?.addEventListener("voiceschanged", pickVoice);
  // The button ships hidden: it only appears once this script and its styles are ready.
  openButton.hidden = false;

  openButton.addEventListener("click", () => {
    audioContext();
    start();
  });
  get("intro-skip").addEventListener("click", () => dialog.close());
  get("intro-replay").addEventListener("click", start);
  get("intro-start").addEventListener("click", handOff);
  function setSound(value) {
    soundOn = Boolean(value);
    if (!soundOn) silence();
    try { localStorage.setItem(soundKey, soundOn ? "on" : "off"); } catch { /* Preference lasts for this visit. */ }
    renderSoundButton();
    document.dispatchEvent(new CustomEvent("pepi:sound", { detail: { on: soundOn } }));
  }
  soundButton.addEventListener("click", () => setSound(!soundOn));
  dialog.addEventListener("close", () => {
    stop();
    if (!powerButton.disabled) openButton.focus({ preventScroll: true });
  });

  // Pepi on the desktop (pepi-companion.js) shares his art, voice and sound effects.
  // Pepi or Brem as a standalone SVG for an <img> or a canvas, where the page styles do
  // not reach: the few rules that pick one face come along inside the SVG.
  function canvasMarkup(who = "pepi", face = "happy") {
    const art = who === "brem" ? bremMarkup() : pepiMarkup();
    const style = `<style>.pepi-ball,.pepi-sweat,.brow-worried,.pepi-eyes,.pepi-blush-strong,.pepi-blueprint,.pepi-scan,.pepi-mouth-closed>g{display:none}`
      + `.pepi-eyes-${face},.pepi-mouth-closed>.mouth-smile{display:inline}.pepi-mouth-open{opacity:0}</style>`;
    return art.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${style}`);
  }

  window.PepiBolota = {
    markup: pepiMarkup,
    canvasMarkup,
    bremMarkup,
    propMarkup,
    sfx,
    particles,
    typewrite,
    playClip,
    audioContext,
    reduceMotion,
    get soundOn() { return soundOn; },
    setSound,
  };
})();
