(() => {
  const challenges = [
    { name: "Robô", part: "do painel do robô", color: "#38c9ac", point: [160, 151] },
    { name: "Pipa", part: "da parte superior da pipa", color: "#f18451", point: [160, 75] },
    { name: "Foguete", part: "do corpo do foguete", color: "#b37be5", point: [161, 112] },
    { name: "Planta", part: "do vaso da planta", color: "#dc6879", point: [159, 167] },
    { name: "Arcade", part: "do painel abaixo da tela", color: "#e8ac43", point: [157, 163] },
    { name: "Tênis", part: "da lateral do tênis", color: "#4f8ce6", point: [165, 153] },
    { name: "Planeta", part: "do planeta", color: "#c585c1", point: [160, 97] },
    { name: "Rádio", part: "da carcaça do rádio", color: "#73b96d", point: [184, 132] },
    { name: "Picolé", part: "da cobertura do picolé", color: "#f0779e", point: [161, 91] },
    { name: "Balão", part: "do balão", color: "#9574e4", point: [159, 96] },
    { name: "Wallpaper da LAWD em pixels", part: "do centro do símbolo da LAWD", color: "#b100ff", point: [160, 56], pixelImage: "./assets/lawd-wallpaper.png" },
    { name: "Terminal da LAWD", part: "do painel do terminal", color: "#a353e8", point: [160, 133] },
    { name: "Credencial da LAWD", part: "da faixa da credencial", color: "#46a4d0", point: [159, 151] },
    { name: "Satélite", part: "do painel solar", color: "#725bdc", point: [231, 114] },
    { name: "Caneca", part: "do corpo da caneca", color: "#dc8271", point: [153, 140] },
    { name: "Caderno", part: "da capa do caderno", color: "#67b29e", point: [161, 131] },
    { name: "Fones", part: "da almofada direita dos fones", color: "#e48dc3", point: [206, 150] },
    { name: "Câmera", part: "da tampa do corpo da câmera", color: "#e7ad57", point: [209, 138] },
    { name: "Teclado", part: "da tecla de espaço", color: "#88a5db", point: [163, 165] },
    { name: "Patins", part: "da bota do patim", color: "#ee7770", point: [162, 115] },
    { name: "Maçã", part: "da casca da maçã", color: "#db596d", point: [163, 131] },
    { name: "Kiwi", part: "da polpa do kiwi", color: "#9abf64", point: [140, 123] },
    { name: "Bule", part: "do corpo do bule", color: "#9c7ac9", point: [160, 134] },
    { name: "Luminária", part: "da cúpula da luminária", color: "#e2a459", point: [160, 96] },
    { name: "Mochila", part: "do bolso frontal", color: "#4ba6ad", point: [161, 156] },
    { name: "Chapéu", part: "da copa do chapéu", color: "#db926b", point: [160, 107] },
    { name: "Bicicleta", part: "da placa no quadro da bicicleta", color: "#e2889f", point: [155, 119] },
    { name: "Guarda-chuva", part: "do tecido do guarda-chuva", color: "#658bcf", point: [160, 93] },
    { name: "Borboleta", part: "da asa direita da borboleta", color: "#ef9b79", point: [198, 106] },
    { name: "Concha", part: "da superfície da concha", color: "#c77caf", point: [160, 128] },
    { name: "Baleia", part: "do corpo da baleia", color: "#63a9cc", point: [170, 132] },
    { name: "Montanha", part: "da encosta em primeiro plano", color: "#837fba", point: [176, 150] },
    { name: "Lanterna", part: "do corpo da lanterna", color: "#d37c64", point: [160, 121] },
    { name: "Bandeira da LAWD", part: "do tecido da bandeira", color: "#8c55cb", point: [181, 108] },
    { name: "Cartucho", part: "da etiqueta do cartucho", color: "#edbb68", point: [160, 108] },
    { name: "Cometa", part: "do núcleo do cometa", color: "#b68ee5", point: [191, 101] },
    { name: "UFS · São Cristóvão", part: "da placa do campus", color: "#5b91bd", point: [98, 124] },
    { name: "Terminal do DCOMP", part: "da faixa inferior do monitor", color: "#9477cf", point: [163, 154] },
    { name: "BICEN · Biblioteca Central", part: "da capa do livro no meio", color: "#d58374", point: [155, 135] },
    { name: "Engenharia de Computação", part: "do centro do processador", color: "#659b95", point: [160, 116] },
    { name: "Redes de computadores", part: "do nó central da rede", color: "#5d91d2", point: [160, 116] },
    { name: "Arcos da Atalaia", part: "do topo do arco central", color: "#f3d2a0", point: [160, 79] },
    { name: "Passarela do Caranguejo", part: "da carapaça do caranguejo", color: "#df775c", point: [160, 133] },
    { name: "Orla Pôr do Sol", part: "do casco do barco", color: "#8a70b1", point: [163, 166] },
    { name: "Farol da Coroa do Meio", part: "da faixa na torre do farol", color: "#ce7468", point: [161, 116] },
    { name: "Mercados Centrais", part: "do toldo do mercado", color: "#d9a55e", point: [160, 112] },
  ];
  const requiredHits = 10;
  const passScore = 85;
  const progressKey = "front-arcade.olhar-afiado.v1";
  const initialColor = [210, 60, 50];
  const find = id => document.getElementById(id);
  const library = find("game-library");
  const game = find("color-game");
  const form = find("color-round");
  const intro = find("color-intro");
  const progressPanel = find("color-progress");
  const gallery = find("color-gallery");
  const galleryGrid = find("color-gallery-grid");
  const chooseImage = find("choose-color-image");
  const feedback = find("color-feedback");
  const target = find("target-art");
  const copy = find("color-copy");
  const image = find("target-image");
  const targetMarker = find("target-marker");
  const wheel = find("color-wheel");
  const wheelMarker = find("wheel-marker");
  const channels = ["color-hue", "color-saturation", "color-lightness"].map(find);
  const check = find("check-color");
  const next = find("next-color");
  const maskLayer = document.createElement("canvas");
  const referenceWidth = target.width;
  const referenceHeight = target.height;
  const progress = readProgress();
  let roundPassed = false;
  let wheelLightness;
  let challengeIndex;
  let copyColor;
  let copyMask;
  let copySource;
  let imageRequest = 0;

  function readProgress() {
    const initial = { matched: [], unlocked: false };
    const isChallenge = index => Number.isInteger(index) && Boolean(challenges[index]);
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey));
      if (Number.isInteger(saved) && saved > 0 && saved <= requiredHits) {
        return { matched: Array.from({ length: saved }, (_, index) => index), unlocked: saved === requiredHits };
      }
      if (!saved || typeof saved !== "object") return initial;
      const matches = Array.isArray(saved.matched) ? saved.matched : [];
      if (Array.isArray(saved.order) && Number.isInteger(saved.hits) && saved.hits > 0 && saved.hits <= requiredHits) {
        matches.push(...saved.order.slice(0, saved.hits));
      }
      const matched = [...new Set(matches.filter(isChallenge))];
      return { matched, unlocked: saved.unlocked === true || matched.length >= requiredHits };
    } catch {
      return initial;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch {
      // The current run still works when browser storage is unavailable.
    }
  }

  function restartGame() {
    progress.matched = [];
    saveProgress();
    updateProgress();
    showGallery();
  }

  function updateProgress() {
    const nextGame = find("next-game-status");
    const hits = progress.matched.length;
    const { unlocked } = progress;
    find("color-progress-label").textContent = hits >= requiredHits ? `${hits} acertos · meta concluída` : `${hits} de ${requiredHits} acertos`;
    find("color-progress-bar").value = Math.min(hits, requiredHits);
    nextGame.closest(".next-game-card").classList.toggle("is-unlocked", unlocked);
    nextGame.textContent = unlocked
      ? "Desbloqueado · formulário de quatro etapas"
      : "Bloqueado até completar 10 acertos no Olhar Afiado.";
    find("play-popups").disabled = !unlocked;
    find("play-color").textContent = hits ? "Continuar" : "Jogar";
    find("restart-color").hidden = !hits;
    find("color-gallery-caption").textContent = unlocked
      ? "Próximo jogo desbloqueado. Continue experimentando as cores do acervo."
      : `Escolha qualquer imagem. Acerte ${requiredHits} imagens diferentes para desbloquear o próximo jogo.`;
    for (const card of galleryGrid.children) {
      const matched = progress.matched.includes(Number(card.dataset.challenge));
      card.classList.toggle("is-matched", matched);
      card.querySelector(".color-image-status").textContent = matched ? "✓ Acertada" : "";
    }
  }

  function showGallery() {
    imageRequest += 1;
    intro.hidden = true;
    progressPanel.hidden = false;
    form.hidden = true;
    gallery.hidden = false;
    chooseImage.hidden = true;
    if (!galleryGrid.childElementCount) {
      buildGallery();
      updateProgress();
    }
    find("color-gallery-title").focus();
    galleryGrid.querySelector(`[data-challenge="${challengeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }

  function showRound(index) {
    challengeIndex = index;
    gallery.hidden = true;
    chooseImage.hidden = false;
    form.hidden = false;
    roundPassed = false;
    feedback.textContent = "";
    feedback.removeAttribute("data-result");
    next.hidden = true;
    check.hidden = false;
    check.disabled = true;
    copyColor = null;
    copyMask = null;
    copySource = null;
    imageRequest += 1;
    channels.forEach((channel, index) => {
      channel.disabled = false;
      channel.value = initialColor[index];
    });
    const challenge = challenges[challengeIndex];
    find("target-prompt").textContent = `Encontre a cor ${challenge.part}.`;
    image.hidden = !challenge.image;
    target.hidden = Boolean(challenge.image);
    if (challenge.image) {
      image.alt = challenge.name;
      loadImageChallenge(challenge);
    } else if (challenge.pixelImage) {
      target.setAttribute("aria-label", challenge.name);
      loadPixelChallenge(challenge);
    } else {
      copy.width = referenceWidth;
      copy.height = referenceHeight;
      target.setAttribute("aria-label", challenge.name);
      paintChallenge(target, challenge.color, challengeIndex);
      renderCopy();
    }
    const [x, y] = challenge.point;
    targetMarker.style.left = `${x / referenceWidth * 100}%`;
    targetMarker.style.top = `${y / referenceHeight * 100}%`;
    renderSelection(false);
    find("color-game-title").focus();
  }

  async function loadImageChallenge(challenge) {
    const request = imageRequest;
    check.disabled = true;
    copy.getContext("2d").clearRect(0, 0, copy.width, copy.height);
    const mask = new Image();
    image.src = challenge.image;
    mask.src = challenge.mask ?? "";
    try {
      await Promise.all([image.decode(), mask.decode()]);
      if (request !== imageRequest) return;
      copy.width = maskLayer.width = image.naturalWidth;
      copy.height = maskLayer.height = image.naturalHeight;
      copySource = image;
      copyMask = mask;
      check.disabled = !copyColor;
      renderCopy();
    } catch {
      if (request === imageRequest) feedback.textContent = "A imagem desta fase não pôde ser carregada.";
    }
  }

  async function loadPixelChallenge(challenge) {
    const request = imageRequest;
    const source = new Image();
    source.src = challenge.pixelImage;
    const context = target.getContext("2d");
    context.clearRect(0, 0, referenceWidth, referenceHeight);
    copy.getContext("2d").clearRect(0, 0, copy.width, copy.height);
    try {
      await source.decode();
      if (request !== imageRequest) return;
      const pixels = document.createElement("canvas");
      pixels.width = referenceWidth / 4;
      pixels.height = referenceHeight / 4;
      const lowRes = pixels.getContext("2d");
      const cropWidth = source.naturalHeight * referenceWidth / referenceHeight;
      lowRes.imageSmoothingEnabled = false;
      lowRes.drawImage(source, (source.naturalWidth - cropWidth) / 2, 0, cropWidth, source.naturalHeight, 0, 0, pixels.width, pixels.height);
      context.imageSmoothingEnabled = false;
      context.drawImage(pixels, 0, 0, referenceWidth, referenceHeight);
      context.imageSmoothingEnabled = true;
      const colors = lowRes.getImageData(0, 0, pixels.width, pixels.height);
      // Mask only the emblem. The lettering and waves keep their original colors.
      for (let offset = 0; offset < colors.data.length; offset += 4) {
        const y = Math.floor(offset / 4 / pixels.width);
        const [red, green, blue] = colors.data.subarray(offset, offset + 3);
        colors.data[offset + 3] = y < pixels.height / 2 && red > 70 && green < 65 && blue > 100 ? 255 : 0;
      }
      lowRes.putImageData(colors, 0, 0);
      const mask = document.createElement("canvas");
      copy.width = maskLayer.width = mask.width = referenceWidth;
      copy.height = maskLayer.height = mask.height = referenceHeight;
      const maskContext = mask.getContext("2d");
      maskContext.imageSmoothingEnabled = false;
      maskContext.drawImage(pixels, 0, 0, referenceWidth, referenceHeight);
      copySource = target;
      copyMask = mask;
      check.disabled = !copyColor;
      renderCopy();
    } catch {
      if (request === imageRequest) feedback.textContent = "A imagem da LAWD não pôde ser carregada.";
    }
  }

  function renderCopy() {
    const fill = copyColor ?? "#ffffff";
    const challenge = challenges[challengeIndex];
    if (!challenge.image && !challenge.pixelImage) {
      paintChallenge(copy, fill, challengeIndex);
    } else if (copyMask) {
      const layer = maskLayer.getContext("2d");
      const context = copy.getContext("2d");
      layer.clearRect(0, 0, maskLayer.width, maskLayer.height);
      layer.drawImage(copyMask, 0, 0, maskLayer.width, maskLayer.height);
      layer.globalCompositeOperation = "source-in";
      layer.fillStyle = fill;
      layer.fillRect(0, 0, maskLayer.width, maskLayer.height);
      layer.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, copy.width, copy.height);
      context.drawImage(copySource, 0, 0);
      context.drawImage(maskLayer, 0, 0);
    }
  }

  function hslToRgb(hue, sat, light) {
    const l = light / 100;
    const a = sat / 100 * Math.min(l, 1 - l);
    const channel = offset => {
      const k = (offset + hue / 30) % 12;
      return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    };
    return [channel(0), channel(8), channel(4)];
  }

  function oklab(rgb) {
    const [r, g, b] = rgb.map(value => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
    const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
    const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
    return [
      .2104542553 * l + .7936177850 * m - .0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + .4505937099 * s,
      .0259040371 * l + .7827717662 * m - .8086757660 * s,
    ];
  }

  function similarity(rgb, hex) {
    const expected = hex.slice(1).match(/../g).map(value => Number.parseInt(value, 16));
    const actual = oklab(rgb);
    const ideal = oklab(expected);
    const distance = Math.hypot(...actual.map((value, index) => value - ideal[index]));
    return 100 * Math.max(0, 1 - distance / .35);
  }

  function paintWheel(light) {
    if (light === wheelLightness) return;
    wheelLightness = light;
    const context = wheel.getContext("2d");
    const size = wheel.width;
    const radius = size / 2;
    const pixels = context.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x + .5 - radius;
        const dy = y + .5 - radius;
        const saturation = Math.hypot(dx, dy) / radius * 100;
        if (saturation > 100) continue;
        const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const [r, g, b] = hslToRgb(hue, saturation, light);
        const i = (y * size + x) * 4;
        pixels.data[i] = r;
        pixels.data[i + 1] = g;
        pixels.data[i + 2] = b;
        pixels.data[i + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
  }

  function renderSelection(applyColor) {
    const [hue, saturation, light] = channels.map(channel => channel.valueAsNumber);
    const radians = hue * Math.PI / 180;
    const radius = saturation / 2;
    const rgb = hslToRgb(hue, saturation, light).map(Math.round);
    const hex = "#" + rgb.map(value => value.toString(16).padStart(2, "0")).join("").toUpperCase();
    wheelMarker.style.left = `${50 + Math.cos(radians) * radius}%`;
    wheelMarker.style.top = `${50 + Math.sin(radians) * radius}%`;
    if (applyColor) {
      copyColor = hex;
      const challenge = challenges[challengeIndex];
      check.disabled = Boolean((challenge.image || challenge.pixelImage) && !copyMask);
      renderCopy();
    }
    wheelMarker.hidden = !copyColor;
    find("color-swatch").style.background = copyColor ?? "#fff";
    find("color-value").value = copyColor ?? "Escolha uma cor";
    paintWheel(light);
  }

  function chooseFromWheel(event) {
    if (roundPassed) return;
    const bounds = wheel.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    const y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    channels[0].value = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360) % 360;
    channels[1].value = Math.min(100, Math.round(Math.hypot(x, y) * 100));
    renderSelection(true);
  }

  wheel.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0 || roundPassed) return;
    wheel.setPointerCapture(event.pointerId);
    chooseFromWheel(event);
  });
  wheel.addEventListener("pointermove", event => {
    if (wheel.hasPointerCapture(event.pointerId)) chooseFromWheel(event);
  });
  channels.forEach(channel => channel.addEventListener("input", () => renderSelection(true)));

  find("play-color").addEventListener("click", () => {
    library.hidden = true;
    game.hidden = false;
    intro.hidden = false;
    progressPanel.hidden = true;
    gallery.hidden = true;
    form.hidden = true;
    chooseImage.hidden = true;
    find("color-game-title").focus();
  });
  find("start-color").addEventListener("click", showGallery);
  find("back-to-games").addEventListener("click", () => {
    game.hidden = true;
    library.hidden = false;
    find("play-color").focus();
  });
  chooseImage.addEventListener("click", showGallery);
  next.addEventListener("click", showGallery);
  find("restart-color").addEventListener("click", restartGame);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (roundPassed || check.disabled) return;
    const rgb = hslToRgb(...channels.map(channel => channel.valueAsNumber)).map(Math.round);
    const score = similarity(rgb, challenges[challengeIndex].color);
    // The number shown uses the same threshold as the win condition.
    const displayed = Math.min(100, Math.floor(score * 10) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    if (score < passScore) {
      feedback.dataset.result = "retry";
      feedback.textContent = `${displayed}% de semelhança. Ajuste a cor e tente de novo.`;
      return;
    }
    roundPassed = true;
    const alreadyMatched = progress.matched.includes(challengeIndex);
    if (!alreadyMatched) progress.matched.push(challengeIndex);
    const justUnlocked = !progress.unlocked && progress.matched.length >= requiredHits;
    progress.unlocked ||= justUnlocked;
    saveProgress();
    updateProgress();
    feedback.dataset.result = "success";
    feedback.textContent = justUnlocked
      ? `${displayed}% de semelhança. 10 acertos! Próximo jogo desbloqueado.`
      : alreadyMatched ? `${displayed}% de semelhança. Esta imagem já está entre seus acertos.`
        : `${displayed}% de semelhança. Você acertou!`;
    channels.forEach(channel => { channel.disabled = true; });
    check.hidden = true;
    next.hidden = false;
    next.focus();
  });

  function paintChallenge(canvas, color, index) {
    const context = canvas.getContext("2d");
    const palettes = [
      ["#e9f6fa", "#bdddeb"], ["#eaf6f0", "#c3e5df"], ["#efe8fb", "#c8caf2"],
      ["#f0f6df", "#d3e8c2"], ["#f4ecfb", "#ddd1f2"], ["#edf3fc", "#ccdcef"],
      ["#3c3c69", "#262a4b"], ["#f6f3dd", "#dce9cc"], ["#fff2e6", "#f6d7cc"], ["#f2ecfb", "#ded9f4"],
      null, ["#282040", "#483270"], ["#ebe8fc", "#d7cbf5"], ["#28274a", "#423e69"],
      ["#f8e9dc", "#f0d0c9"], ["#edf6e8", "#cadfd0"], ["#f9e7f1", "#e8cce5"],
      ["#f8efd9", "#dfd3b8"], ["#e6e9fb", "#ccd4ef"], ["#ffe9e2", "#f1c8c0"],
      ["#fae9d6", "#efd1c3"], ["#eef1d2", "#d9e5bd"], ["#f5e5ee", "#e6cce4"], ["#f9efd6", "#e9cfaa"],
      ["#e3f3ef", "#b9dfd7"], ["#faead9", "#efd3b7"], ["#e6ecf8", "#c8d6eb"], ["#e7eef8", "#cadcf1"],
      ["#f6e9ef", "#e8d2ed"], ["#f2eafa", "#e3d1ec"], ["#e1f0f6", "#bfdce9"], ["#f0e5f7", "#dbd6f0"],
      ["#faecd8", "#f6d4bd"], ["#eae1fa", "#d8cbee"], ["#eee7fa", "#d1d6ec"], ["#414167", "#292b4e"],
      ["#edf4e5", "#c8e2d3"], ["#e9eafa", "#ccd3ec"], ["#f8f0df", "#eddbc7"], ["#e5f4ee", "#c1e1dc"],
      ["#edf1fa", "#ccd8f0"], ["#daf0f5", "#addde4"], ["#faead7", "#f3c9ae"], ["#f6ceb2", "#bfa8d9"],
      ["#e7f3f5", "#c5e3e9"], ["#faeada", "#efd6b9"],
    ];
    const [sky, horizon] = palettes[index];
    const background = context.createLinearGradient(0, 0, 250, 240);
    background.addColorStop(0, sky);
    background.addColorStop(1, horizon);
    context.fillStyle = background;
    context.fillRect(0, 0, 320, 240);

    const path = (fill, points) => {
      context.fillStyle = fill;
      context.fill(new Path2D(points));
    };
    const line = (stroke, width, points) => {
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke(new Path2D(points));
    };
    const rounded = (x, y, width, height, radius, fill) => {
      context.fillStyle = fill;
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
      context.fill();
    };
    const ellipse = (x, y, rx, ry, fill) => {
      context.fillStyle = fill;
      context.beginPath();
      context.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
      context.fill();
    };
    const sparkle = (x, y, size, fill) => path(fill,
      `M${x} ${y - size} Q${x + 1} ${y - 1} ${x + size} ${y} Q${x + 1} ${y + 1} ${x} ${y + size} Q${x - 1} ${y + 1} ${x - size} ${y} Q${x - 1} ${y - 1} ${x} ${y - size}Z`);
    const ink = "#334663";

    ellipse(83, 67, 62, 47, "#ffffff28");
    ellipse(256, 145, 59, 62, "#ffffff24");
    sparkle(64, 98, 9, "#ffffffb2");
    sparkle(244, 52, 13, "#ffffffb8");
    ellipse(263, 76, 3, 3, "#ffffffa0");
    ellipse(75, 117, 2, 2, "#ffffffba");
    ellipse(160, 208, 77, 8, "#31446325");

    switch (index) {
      case 0:
        line("#627b9b", 5, "M160 49v-16");
        ellipse(160, 30, 8, 8, "#ed9b61");
        rounded(91, 139, 26, 43, 12, "#6885aa");
        rounded(203, 139, 26, 43, 12, "#6885aa");
        rounded(119, 176, 29, 26, 8, ink);
        rounded(172, 176, 29, 26, 8, ink);
        rounded(103, 49, 114, 75, 24, "#678cb3");
        rounded(110, 52, 100, 64, 20, "#a8cfee");
        rounded(120, 64, 80, 41, 14, "#e4f2f9");
        ellipse(142, 82, 5, 7, ink);
        ellipse(178, 82, 5, 7, ink);
        line(ink, 3, "M151 95q9 7 18 0");
        rounded(109, 126, 102, 63, 16, "#7896bb");
        rounded(121, 133, 78, 40, 11, "#4d6586");
        rounded(126, 137, 68, 32, 8, color);
        break;
      case 1:
        line("#587d7e", 3, "M160 145Q185 174 156 183T149 213");
        path("#e7aa70", "M140 181l16 4 14-9-2 13-11-1-12 6z");
        path("#75a6ad", "M133 198l17 6 13-8-2 12-12-1-14 5z");
        path(ink, "M158 40Q160 38 163 41l57 55q3 3 0 7l-57 69q-3 4-6 0l-57-69q-3-4 0-7z");
        path(color, "M160 47l51 50H109z");
        path("#83a3d9", "M110 103h49v60z");
        path("#a6bfeb", "M161 103h49l-49 60z");
        line("#fff4d968", 2, "M159 49v47");
        break;
      case 2:
        path("#efad68", "M143 169H177Q174 193 160 205Q145 191 143 169Z");
        path("#f8d590", "M154 171h12q0 14-6 21q-6-7-6-21z");
        path("#d881a3", "M134 107Q110 129 105 167q-1 5 4 4l35-11zM186 107q24 22 29 60q1 5-4 4l-35-11z");
        path(color, "M160 37Q190 59 193 101v48q0 19-17 21h-32q-17-2-17-21v-48q3-42 33-64z");
        path("#eea3ab", "M160 37Q180 51 188 73h-56q8-22 28-36z");
        ellipse(160, 90, 14, 14, "#746c9d");
        ellipse(160, 89, 10, 10, "#ddedf9");
        line("#fff7fb", 3, "M155 90q0-6 6-6");
        line("#6c58974d", 3, "M136 145h48");
        break;
      case 3:
        line("#4c8767", 5, "M159 141Q151 101 173 61");
        path("#77ab81", "M158 100Q120 106 106 66q37-10 52 34z");
        path("#99c48d", "M159 110q7-46 56-37q-12 36-56 37z");
        path("#5b9875", "M166 78q-5-37 28-45q5 32-28 45z");
        line("#4f866446", 2, "M115 72q27 12 43 28M167 105q19-16 37-21");
        path("#b17d80", "M107 133h106l-13 58q-3 11-14 12h-52q-11-1-14-12z");
        path(color, "M115 141h90l-12 50q-2 6-9 6h-48q-7 0-9-6z");
        rounded(104, 130, 112, 15, 7, "#ef9da4");
        line("#ffddd0a0", 3, "M131 154l6 30");
        break;
      case 4:
        rounded(103, 43, 114, 159, 16, "#845c84");
        rounded(108, 47, 104, 148, 13, color);
        rounded(115, 53, 90, 15, 5, "#fbe4b2");
        line("#b46f84", 3, "M147 61h26");
        rounded(120, 73, 80, 59, 11, "#445274");
        rounded(126, 79, 68, 47, 8, "#a6d9ca");
        path("#eef7d3", "M146 108l11-18 7 12 4-6 10 12z");
        rounded(115, 140, 90, 12, 6, "#f6ce86");
        ellipse(139, 146, 6, 3, "#9c576f");
        ellipse(181, 146, 5, 3, "#6b8cae");
        rounded(139, 173, 42, 10, 4, "#9f6971");
        break;
      case 5:
        path("#445777", "M75 164l25-43q12-14 27-16l21-7q8-2 14 8l24 22q10 10 37 13q33 5 31 24l-2 9H78Z");
        path(color, "M82 161l23-37q11-11 25-13l20-7q4-1 8 5l23 22q11 10 40 15q25 4 27 15z");
        rounded(73, 160, 184, 22, 10, "#f8f2dc");
        line("#c3b398", 2, "M83 174h164");
        line("#ebf3ff", 3, "M135 124l24 1m-18 5l25 2m-18 4l24 3");
        path("#9cc6ed", "M194 144q14 6 31 8l11 5h-41z");
        break;
      case 6:
        sparkle(79, 46, 7, "#f4d7a6");
        sparkle(226, 167, 7, "#f4d7a6");
        ellipse(249, 111, 3, 3, "#ece4f3");
        line("#b596d3", 7, "M74 125C89 102 227 86 245 112");
        ellipse(160, 118, 48, 48, color);
        path("#4e447632", "M119 143q39 17 84-37q6 27-18 48q-34 22-66-11z");
        path("#ffffff50", "M126 101q9-17 29-22q3 1 0 4q-15 7-24 20q-3 4-5-2z");
        line("#eccbaa", 8, "M74 125C58 163 267 145 245 112");
        break;
      case 7:
        line("#687965", 4, "M184 101l44-47");
        ellipse(228, 54, 4, 4, "#c4866c");
        rounded(87, 97, 146, 87, 18, "#567d71");
        rounded(92, 101, 136, 77, 15, color);
        rounded(104, 115, 46, 48, 13, "#e7efd1");
        for (const y of [127, 135, 143, 151]) line("#829e78", 2, `M116 ${y}h22`);
        rounded(156, 111, 58, 12, 6, "#e8deb9");
        line("#b88475", 2, "M191 113v8");
        ellipse(171, 150, 8, 8, "#557a6c");
        ellipse(203, 150, 8, 8, "#557a6c");
        break;
      case 8:
        rounded(151, 141, 18, 63, 8, "#c18c64");
        rounded(154, 155, 12, 44, 5, "#ddb17e");
        rounded(114, 52, 92, 112, 33, "#b76583");
        rounded(119, 54, 82, 104, 29, color);
        line("#fff4e7a0", 4, "M133 79q3-10 9-12");
        path("#a6416945", "M191 112v18q0 22-21 24q16-8 18-31z");
        for (const [x, y] of [[146, 75], [175, 76], [140, 111], [175, 133]]) ellipse(x, y, 2, 2, "#ffdfb8");
        break;
      case 9:
        line("#77749e", 3, "M158 150q-14 12 1 25t-5 31");
        path("#8874a8", "M160 143l-10 16q10 3 20-1z");
        path(color, "M160 55C131 55 113 73 113 103q0 37 38 46q9 4 18 0q38-9 38-46c0-30-18-48-47-48z");
        path("#5c4a9b38", "M201 116q-12 31-42 33q-22-2-30-13q38 13 72-20z");
        line("#fff8f0a0", 5, "M126 101q1-18 14-25");
        ellipse(146, 71, 2.5, 2.5, "#fff8f0a0");
        break;
      case 11:
        rounded(68, 51, 184, 145, 19, "#1a1934");
        rounded(80, 61, 160, 120, 9, "#2b2448");
        rounded(92, 117, 136, 33, 7, color);
        line("#8ed6f1", 3, "M107 87l8 6-8 6m19 0h17");
        line("#dbc4f0", 2, "M110 161h46m8 0h23");
        ellipse(222, 83, 3, 3, "#bc82e5");
        break;
      case 12:
        line("#825cc0", 10, "M153 57L112 19M166 57l41-38");
        rounded(108, 53, 104, 150, 14, "#fbf7ff");
        rounded(124, 60, 72, 9, 4, "#a893cb");
        ellipse(160, 104, 23, 23, "#a05bdc");
        line("#f6e3fe", 2, "M143 95q14-8 36 16m-33 6q17-9 23-32");
        rounded(116, 138, 88, 26, 5, color);
        line("#b7a0d6", 3, "M134 178h52m-38 7h24");
        break;
      case 13:
        rounded(45, 86, 76, 61, 8, "#8b77de");
        rounded(197, 86, 76, 61, 8, color);
        line("#b7a2ee", 2, "M54 105h58m-58 22h58m95-22h58m-58 22h58");
        line("#af96de", 2, "M79 92v50m78-42h34m48-8v50");
        rounded(118, 97, 79, 39, 11, "#d9cde9");
        ellipse(160, 116, 17, 17, "#544a92");
        ellipse(160, 116, 10, 10, "#b4caef");
        line("#e6cef4", 3, "M155 99l-9-23");
        sparkle(229, 62, 6, "#b6abeb");
        break;
      case 14:
        line("#b96861", 11, "M204 111q42-11 42 16q-1 27-41 26");
        path("#a35b61", "M91 88h123v54q0 47-38 48h-49q-36-1-36-48z");
        path(color, "M97 91h111v50q0 42-33 43h-48q-30-1-30-44z");
        ellipse(153, 90, 58, 14, "#f4c8a7");
        ellipse(153, 90, 48, 8, "#8d5553");
        line("#fdf3e0", 4, "M141 64q-12-12 0-21m26 21q12-12 0-22");
        break;
      case 15:
        rounded(102, 55, 118, 143, 14, "#447a76");
        rounded(106, 53, 110, 135, 11, color);
        rounded(122, 71, 75, 24, 5, "#eaf1ca");
        line("#d8f0dd", 3, "M130 114h59m-54 47h49");
        for (const y of [71, 98, 125, 152, 179]) ellipse(105, y, 7, 3, "#416a6b");
        break;
      case 16:
        line("#805986", 14, "M101 134v-23a59 59 0 01118 0v23");
        line("#d9abc9", 7, "M113 109a47 47 0 0194 0");
        rounded(85, 122, 49, 59, 18, "#9876a4");
        rounded(100, 128, 37, 47, 13, "#d4a5e1");
        rounded(186, 122, 49, 59, 18, "#9876a4");
        rounded(188, 128, 37, 47, 13, color);
        break;
      case 17:
        rounded(83, 87, 154, 98, 18, "#826358");
        rounded(87, 92, 146, 86, 14, color);
        rounded(111, 79, 63, 21, 8, "#826358");
        rounded(200, 101, 23, 15, 5, "#f9e2b4");
        ellipse(151, 135, 37, 37, "#756681");
        ellipse(151, 135, 27, 27, "#a2b1cb");
        ellipse(151, 135, 19, 19, "#657fa6");
        ellipse(143, 128, 6, 6, "#cad9ea");
        break;
      case 18:
        rounded(56, 84, 208, 103, 14, "#8192be");
        rounded(61, 85, 198, 92, 12, "#a9b9db");
        for (const y of [96, 117, 138]) {
          for (let x = 73; x < 240; x += 23) rounded(x, y, 17, 14, 4, "#eae9f6");
        }
        rounded(113, 159, 99, 15, 5, color);
        break;
      case 19:
        path("#ac596a", "M111 72h68l12 52q12 13 41 17q12 3 11 16l-5 10H108z");
        path(color, "M117 76h57l13 53q13 9 42 16q10 3 7 12l-3 3H113z");
        line("#f9ddd1", 4, "M128 99h35m-32 12h37m-35 12h39");
        rounded(104, 161, 141, 12, 5, "#745770");
        for (const x of [125, 153, 184, 214]) {
          ellipse(x, 187, 13, 13, "#8b7395");
          ellipse(x, 187, 5, 5, "#f2c2a9");
        }
        break;
      case 20:
        path(color, "M160 98c-23-18-63-5-64 32c-1 30 23 58 46 62c10 1 13-3 22-3c8 0 13 4 23 2c24-6 45-34 43-63c-2-36-38-47-70-30z");
        line("#7c6355", 7, "M164 105q-9-21 5-38");
        path("#82a96d", "M166 87q5-35 39-29q-8 24-39 29z");
        line("#f7b1a9", 6, "M110 126q3-12 13-18");
        break;
      case 21:
        ellipse(160, 124, 67, 58, "#a67b52");
        ellipse(160, 122, 57, 49, color);
        ellipse(160, 121, 15, 12, "#f4e3a1");
        for (const [x, y] of [[136, 98], [162, 94], [185, 100], [191, 122], [177, 145], [155, 149], [127, 144], [119, 121]]) ellipse(x, y, 2, 4, "#46534f");
        break;
      case 22:
        line("#79588f", 9, "M199 109q49-13 45 19q-4 23-41 17");
        path("#ac95d2", "M118 124q-30-13-42-37l7 43q14 16 39 18z");
        ellipse(161, 138, 53, 40, color);
        ellipse(160, 99, 32, 10, "#bd9ddd");
        ellipse(160, 91, 8, 8, "#74598c");
        line("#eddbf1", 4, "M123 133q3-13 15-19");
        break;
      case 23:
        line("#776c85", 7, "M160 119v60");
        rounded(119, 176, 82, 12, 6, "#68647d");
        path(color, "M125 66h70l25 56q2 5-5 5H105q-7 0-5-5z");
        line("#f6d9a1", 3, "M109 119h101");
        break;
      case 24:
        line("#4c757f", 8, "M144 69v-8q16-14 32 0v8");
        rounded(102, 70, 116, 122, 26, "#648eaa");
        rounded(114, 78, 92, 113, 22, "#86b3c7");
        rounded(123, 136, 74, 42, 13, color);
        line("#d9eceb", 3, "M131 146h58");
        break;
      case 25:
        ellipse(160, 154, 102, 22, "#b57965");
        ellipse(160, 148, 101, 20, "#edb58d");
        path(color, "M111 142l13-58q3-12 13-12h46q10 0 13 12l13 58z");
        path("#925d67", "M113 130h94l2 12h-98z");
        break;
      case 26:
        for (const x of [94, 222]) {
          ellipse(x, 154, 31, 31, "#536482");
          ellipse(x, 154, 25, 25, "#c5d9eb");
        }
        line("#658ca8", 5, "M94 154l29-52l36 52zM123 102h57l42 52m-63 0l21-52l-8-18");
        rounded(132, 107, 46, 24, 7, color);
        line("#475774", 5, "M109 93h23m43-12h19");
        break;
      case 27:
        line("#636987", 6, "M160 100v74q0 12 10 12t10-10");
        path(color, "M72 122c4-37 39-64 88-64s84 27 88 64q-18-12-30 0q-27-14-58 0q-30-14-58 0q-12-12-30 0z");
        line("#b5c9ed", 2, "M108 106q9-30 40-42m22 1q28 13 41 41");
        break;
      case 28:
        path("#da927c", "M155 126C130 65 82 56 84 99c1 34 34 55 71 27z");
        path(color, "M165 126c25-61 73-70 71-27c-1 34-34 55-71 27z");
        path("#b182b3", "M158 126c-57 2-61 57-29 45l29-25zm4 0c57 2 61 57 29 45l-29-25z");
        line("#6d5e80", 5, "M160 109v55m0-52l-12-12m12 12l13-12");
        ellipse(214, 98, 4, 4, "#ffd8a3");
        break;
      case 29:
        path(color, "M153 180C105 165 78 137 91 110c8-17 20-18 31-23c14-23 41-25 57-9c20-3 44 9 48 30c18 28-16 49-68 72z");
        line("#f5bae1", 3, "M113 112q21 21 38 60m-20-75q10 13 23 23m23-23q-21 50-16 74m32-63q-5 21-19 48");
        break;
      case 30:
        path("#77c3d3", "M89 134q-35-7-42-39q29 1 43 24q14-20 27-19q0 24-28 34z");
        path(color, "M84 130Q132 82 199 108q39 12 38 41q-3 19-40 21q-74 9-113-40z");
        path("#b5dbe4", "M117 153q64 15 119-7q2 14-28 22q-51 10-91-15z");
        ellipse(209, 135, 5, 5, "#394f74");
        break;
      case 31:
        path("#b5a6d6", "M62 181l64-85q4-5 8 0l26 35l36-67l63 117z");
        path(color, "M73 183l80-102q5-6 9 0l85 102z");
        path("#f7ebfa", "M133 106l20-25q5-6 9 0l22 27l-23-7l-11 7z");
        path("#b7a9d2", "M53 181q70-21 124-2q49-12 90 6z");
        break;
      case 32:
        line("#8b6271", 4, "M147 66v-9q13-13 26 0v9");
        rounded(115, 65, 90, 114, 34, color);
        for (const x of [132, 188]) line("#f1b492", 2, `M${x} 85q${x < 160 ? -15 : 15} 35 0 75`);
        rounded(137, 65, 46, 10, 4, "#a96064");
        rounded(137, 170, 46, 11, 4, "#a96064");
        break;
      case 33:
        line("#665d9a", 6, "M99 60v134");
        path(color, "M103 71q39-16 75 0q32 15 65 0v66q-32 17-65 2q-36-16-75 0z");
        line("#bda2ed", 3, "M115 84q24-8 44-4m44 36q19 3 29-2");
        ellipse(139, 111, 8, 8, "#d3b7f6");
        break;
      case 34:
        rounded(103, 63, 114, 124, 14, "#737d9e");
        rounded(113, 76, 94, 65, 8, color);
        line("#f4da9f", 3, "M131 92h35");
        rounded(119, 149, 82, 26, 5, "#536788");
        for (let x = 129; x <= 191; x += 10) rounded(x, 155, 3, 14, 1, "#e5bd78");
        break;
      case 35:
        path("#7f72b4", "M182 87q8-13 23-5q11 9 7 23q-4 15-21 16l-98 43q46-35 89-77z");
        path("#e3b8df", "M191 94q-27 21-74 41q29-7 64-13z");
        ellipse(191, 101, 17, 17, color);
        ellipse(198, 95, 4, 4, "#e8cdf2");
        break;
      case 36: {
        path("#96bf9e", "M0 152q84-48 160-18q68-27 160 20v86H0z");
        path("#b1cca2", "M0 171q113-38 195-10q65-19 125 6v73H0z");
        rounded(91, 147, 10, 47, 3, "#60746b");
        rounded(218, 147, 10, 47, 3, "#60746b");
        rounded(86, 96, 148, 62, 9, "#657ca1");
        rounded(89, 97, 141, 56, 7, color);
        context.fillStyle = "#f3f9f8";
        context.font = "bold 27px system-ui";
        context.fillText("UFS", 130, 127);
        context.font = "bold 10px system-ui";
        context.fillText("SÃO CRISTÓVÃO", 118, 144);
        break;
      }
      case 37:
        rounded(86, 58, 148, 117, 16, "#475579");
        rounded(94, 64, 132, 86, 10, "#2e395c");
        rounded(94, 148, 132, 17, 6, color);
        line("#a6d9d5", 3, "M110 106l8 5-8 5m15 0h19m-33 12h42");
        context.fillStyle = "#ece8fa";
        context.font = "bold 17px system-ui";
        context.fillText("DCOMP", 134, 99);
        rounded(149, 173, 22, 16, 3, "#616e98");
        rounded(125, 188, 70, 8, 4, "#8a91af");
        break;
      case 38:
        rounded(98, 101, 31, 77, 5, "#7898ac");
        rounded(132, 78, 45, 101, 6, color);
        rounded(180, 99, 28, 79, 5, "#9da97b");
        rounded(139, 91, 31, 20, 4, "#f4d8b7");
        rounded(91, 178, 128, 10, 4, "#9a7661");
        context.fillStyle = "#634f59";
        context.font = "bold 8px system-ui";
        context.fillText("BICEN", 141, 104);
        break;
      case 39:
        rounded(91, 51, 138, 142, 15, "#47736d");
        for (const n of [88, 100, 112, 124, 136, 148]) {
          rounded(n + 14, 68, 5, 21, 2, "#d4bd82");
          rounded(n + 14, 149, 5, 20, 2, "#d4bd82");
        }
        rounded(112, 81, 96, 72, 9, "#2f555b");
        rounded(123, 91, 74, 50, 5, color);
        line("#d2e5c9", 2, "M130 130h14m31-30h13");
        break;
      case 40:
        line("#8299be", 5, "M160 116L95 74m65 42l66-42m-66 42l-65 44m65-44l66 44");
        for (const [x, y, fill] of [[95, 74, "#c7a1cf"], [226, 74, "#7cb6b3"], [95, 160, "#e8ba90"], [226, 160, "#a098d1"]]) {
          ellipse(x, y, 19, 19, fill);
          ellipse(x, y, 5, 5, "#fff7e8");
        }
        ellipse(160, 116, 26, 26, "#435e98");
        ellipse(160, 116, 21, 21, color);
        break;
      case 41:
        path("#85bbc4", "M0 142q80-13 160 0t160-1v42H0z");
        path("#edd2a7", "M0 167q108-10 205 4q57 8 115-1v70H0z");
        for (const [x, top, size] of [[81, 106, 42], [160, 79, 50], [239, 106, 42]]) {
          line("#b78972", 15, `M${x - size / 2} 172v-${145 - top}q0-25 ${size / 2}-25t${size / 2} 25V172`);
          line(color, 10, `M${x - size / 2} 169v-${144 - top}q0-27 ${size / 2}-27t${size / 2} 27V169`);
        }
        break;
      case 42:
        path("#e8c8a1", "M0 158q115-13 220 0q39 2 100-4v86H0z");
        line("#ad625d", 8, "M129 141l-35 12-17 20m53-21l-27 25m88-36l35 12 17 20m-53-21l27 25");
        path(color, "M129 128q-22 3-30-11q-4-9 2-25q12 17 24 5q16 13 4 31zm62 0q22 3 30-11q4-9-2-25q-12 17-24 5q-16 13-4 31z");
        ellipse(160, 134, 40, 26, color);
        line("#995658", 4, "M148 116v-12m25 12v-12");
        ellipse(148, 102, 5, 6, "#5a4857");
        ellipse(173, 102, 5, 6, "#5a4857");
        break;
      case 43:
        ellipse(213, 99, 27, 27, "#f9dc9f");
        path("#8483a4", "M0 123q68-21 130-3q82 17 190-5v32H0z");
        path("#8aadc2", "M0 139h320v101H0z");
        for (const [y, x, width] of [[151, 220, 45], [181, 42, 72], [196, 157, 80]]) line("#dac9ca", 3, `M${x} ${y}h${width}`);
        line("#5c5c82", 4, "M153 157v-47");
        path("#f6e4c8", "M156 114l27 37h-27z");
        path(color, "M112 156h107l-19 23h-64z");
        break;
      case 44:
        path("#a9cfc0", "M0 179q63-33 142-12q77-33 178 2v71H0z");
        path("#f3e8d7", "M140 74h42l15 112h-71z");
        path(color, "M135 104h51l4 24h-58z");
        rounded(135, 61, 52, 21, 4, "#657994");
        path("#6d7897", "M128 62l33-20l34 20z");
        rounded(152, 149, 17, 37, 4, "#8c7b85");
        rounded(153, 65, 16, 9, 3, "#f5d491");
        break;
      case 45:
        path("#c89672", "M75 92l85-38l85 38v10H75z");
        rounded(80, 91, 160, 91, 5, "#eed6a7");
        rounded(97, 96, 126, 19, 5, "#e5c58d");
        path(color, "M93 101h134l12 24H81z");
        for (const x of [104, 148, 192]) rounded(x, 133, 23, 42, 7, "#8d796e");
        rounded(72, 178, 176, 9, 4, "#c3a184");
        break;
    }
  }

  function buildGallery() {
    // Reorder the gallery without changing the IDs stored with completed challenges.
    const featured = [41, 37, 42, 36, 43, 38, 44, 39, 45, 40];
    const order = challenges.map((_, index) => index).filter(index => !featured.includes(index));
    featured.forEach((index, position) => order.splice(1 + position * 4, 0, index));
    for (const index of order) {
      const challenge = challenges[index];
      const card = document.createElement("button");
      card.type = "button";
      card.className = "color-image-card";
      card.dataset.challenge = index;
      const source = challenge.pixelImage ?? challenge.image;
      if (source) {
        const thumbnail = document.createElement("img");
        thumbnail.src = source;
        thumbnail.alt = "";
        thumbnail.loading = "lazy";
        card.append(thumbnail);
      } else {
        const thumbnail = document.createElement("canvas");
        thumbnail.width = referenceWidth;
        thumbnail.height = referenceHeight;
        thumbnail.setAttribute("aria-hidden", "true");
        paintChallenge(thumbnail, challenge.color, index);
        card.append(thumbnail);
      }
      const label = document.createElement("strong");
      label.textContent = challenge.name;
      const status = document.createElement("span");
      status.className = "color-image-status";
      card.append(label, status);
      card.addEventListener("click", () => showRound(index));
      galleryGrid.append(card);
    }
  }
  updateProgress();
})();
