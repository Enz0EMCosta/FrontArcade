(() => {
  const key = "front-arcade.site-builder.v1";
  const get = id => document.getElementById(id);
  const page = get("builder-page");
  const workbench = get("builder-workbench");
  const materials = get("builder-material-list");
  const inspector = get("builder-inspector-form");
  const status = get("builder-status");
  const exportButton = get("builder-export");
  const symbols = { "✦": "Brilho", "◆": "Diamante", "◉": "Círculo", "✿": "Flor", "♥": "Coração", "⌘": "Atalho", "▦": "Grade", "◎": "Alvo", "★": "Estrela", "☁": "Nuvem", "☀": "Sol", "↗": "Seta" };
  const styles = { soft: "Suave", editorial: "Editorial", bold: "Marcante" };
  const shapes = { square: "Quadrado", circle: "Círculo", badge: "Selo" };
  const templates = {
    nav: { label: "Menu", icon: "▦", title: "Estúdio Horizonte", body: "Início\nProjetos\nContato" },
    hero: { label: "Capa", icon: "✦", title: "Ideias que ganham forma", body: "Um espaço para compartilhar projetos, experiências e novas ideias.", note: "Conhecer projetos" },
    cards: { label: "Cartões", icon: "◆", title: "O que fazemos", body: "Design | Interfaces claras e fáceis de usar.\nConteúdo | Histórias com intenção.\nDesenvolvimento | Experiências para a web." },
    gallery: { label: "Galeria", icon: "◉", title: "Projetos", body: "Coleção de cores\nIdentidade visual\nExperimentos digitais" },
    quote: { label: "Depoimento", icon: "♥", title: "O que dizem", body: "O projeto tornou uma ideia complexa fácil de entender.", note: "Pessoa convidada" },
    callout: { label: "Chamada para ação", icon: "↗", title: "Vamos conversar?", body: "Conte um pouco sobre o seu próximo projeto.", note: "Entrar em contato" },
    footer: { label: "Rodapé", icon: "⌘", title: "Estúdio Horizonte", body: "Projetos independentes e experiências digitais.", note: "Voltar ao início" },
    photo: { label: "Foto", icon: "◉", title: "", body: "" },
    sticker: { label: "Adesivo", icon: "✿", title: "Feito à mão" },
  };
  const logoPresets = [
    { label: "Estrela suave", icon: "✦", shape: "square", color: "#7453a5" },
    { label: "Selo botânico", icon: "✿", shape: "badge", color: "#377963" },
    { label: "Sol editorial", icon: "☀", shape: "circle", color: "#c56d59" },
    { label: "Ícone de interface", icon: "▦", shape: "square", color: "#365d93" },
  ];
  const stickerPresets = [
    { label: "Moranguinho", art: "berry" }, { label: "Gatinho", art: "cat" },
    { label: "Flor do quintal", art: "flower" }, { label: "Estrelinha", art: "star" },
    { label: "Laço de fita", art: "bow" }, { label: "Coração pintado", art: "heart" },
    { label: "Cogumelo", art: "mushroom" }, { label: "Carta de amor", art: "letter" },
  ];
  const stickerStyles = Object.fromEntries(stickerPresets.map(item => [item.art, item.label]));
  const legacyStickerArt = { "▦": "letter", "◎": "flower", "✿": "flower", "★": "star", "☁": "bow", "♥": "heart" };
  const defaults = { title: "Meu cantinho", accent: "#527761", paper: "#fffaf0", style: "editorial", icon: "✿", shape: "circle", logoColor: "#a6627c" };
  const text = (value, limit = 500) => typeof value === "string" ? value.slice(0, limit) : "";
  const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  const within = (value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(value, max)) : fallback;
  const photoValue = value => typeof value === "string" && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : "";
  const option = (value, options, fallback) => Object.hasOwn(options, value) ? value : fallback;
  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };

  function block(type, id, settings = {}) {
    const template = templates[type];
    return {
      id, type,
      title: text(settings.title ?? template.title, 90),
      body: text(settings.body ?? template.body),
      note: text(settings.note ?? template.note, 80),
      link: text(settings.link, 240),
      icon: option(settings.icon, symbols, template.icon),
      color: color(settings.color, ""),
      art: option(settings.art, stickerStyles, type === "sticker" ? legacyStickerArt[settings.icon] ?? "flower" : ""),
      photo: photoValue(settings.photo),
      scale: within(settings.scale, 15, 100, type === "photo" ? 80 : 33),
      position: within(settings.position, 0, 100, 50),
      rotation: within(settings.rotation, -35, 35, -5),
      radius: within(settings.radius, 0, 48, 12),
      border: within(settings.border, 0, 16, type === "photo" ? 3 : 0),
      borderColor: color(settings.borderColor, "#e7b29d"),
    };
  }

  function readProject() {
    const sample = {
      identity: { ...defaults },
      blocks: [
        block("nav", 1, { title: defaults.title, body: "Início\nSobre mim" }),
        block("hero", 2, { title: "Um cantinho na internet", icon: "✿", body: "Aqui quero guardar ideias, fotos e coisas que gosto de compartilhar.", note: "Sobre mim" }),
        block("cards", 3, { title: "Coisas que eu gosto", icon: "✦", body: "Fotografia | Momentos do dia a dia.\nMúsica | Canções que me acompanham.\nProjetos | Ideias que estou colocando em prática." }),
      ],
      nextId: 4,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved?.identity || !Array.isArray(saved.blocks)) return sample;
      const source = saved.identity;
      const ids = new Set();
      const blocks = [];
      for (const item of saved.blocks.slice(0, 60)) {
        if (!item || !Object.hasOwn(templates, item.type) || !Number.isSafeInteger(item.id) || item.id < 1 || ids.has(item.id)) continue;
        ids.add(item.id);
        blocks.push(block(item.type, item.id, item));
      }
      return {
        identity: {
          title: text(source.title, 70),
          accent: color(source.accent, defaults.accent),
          paper: color(source.paper, defaults.paper),
          style: option(source.style, styles, defaults.style),
          icon: option(source.icon, symbols, defaults.icon),
          shape: option(source.shape, shapes, defaults.shape),
          logoColor: color(source.logoColor, defaults.logoColor),
        },
        blocks,
        nextId: Math.max(0, ...ids) + 1,
      };
    } catch {
      return sample;
    }
  }

  const project = readProject();
  const photoPicker = get("builder-photo-input");
  let replacingPhoto;
  let selectedId = project.blocks[0]?.id;
  let activeTab = "blocks";
  let previewing = false;
  const stickerImages = new Map();

  function stickerPicture(art) {
    if (stickerImages.has(art)) return stickerImages.get(art);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 120;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const outline = (shape, fill) => {
      const path = new Path2D(shape);
      ctx.strokeStyle = "#fffdf7";
      ctx.lineWidth = 13;
      ctx.stroke(path);
      ctx.fillStyle = fill;
      ctx.fill(path);
      ctx.strokeStyle = "#694e58";
      ctx.lineWidth = 2;
      ctx.stroke(path);
    };
    const detail = (shape, stroke, width = 2) => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke(new Path2D(shape));
    };
    const dot = (x, y, size, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    };
    switch (art) {
      case "berry":
        outline("M59 31C38 22 22 36 23 54C23 75 47 96 60 102C75 96 99 71 98 51C96 31 79 24 59 31Z", "#ed8693");
        outline("M57 38q-15-13-23-12q14-14 27 0q12-20 28-9q-11 4-17 17q-5 8-15 4Z", "#91ab71");
        for (const [x, y] of [[42, 47], [64, 53], [82, 44], [52, 70], [76, 67], [60, 87]]) detail(`M${x} ${y}l-2 4`, "#ffebad", 3);
        break;
      case "cat":
        outline("M26 52L24 25Q24 18 31 23L47 36Q60 31 72 36L91 21Q97 19 96 28L94 54Q105 67 97 81Q88 96 59 96Q29 96 22 79Q16 66 26 52Z", "#e6b483");
        detail("M29 31l11 12m50-13l-12 13M17 66l16 5m-15 8l15-3m55-5l15-5m-15 10l14 4", "#795665");
        dot(44, 64, 3, "#51404a"); dot(76, 64, 3, "#51404a");
        detail("M57 71l4 3l4-3m-4 3q2 7 8 2m-8-2q-4 7-9 2", "#7f4b5c");
        break;
      case "flower":
        outline("M60 26C54 9 33 15 35 35C14 30 10 52 26 62C11 75 26 94 44 88C47 108 70 107 75 88C93 98 109 80 94 65C112 53 105 33 86 37C90 18 68 12 60 26Z", "#dca6bd");
        dot(60, 61, 19, "#ffd789");
        dot(54, 59, 2.5, "#604550"); dot(66, 59, 2.5, "#604550");
        detail("M55 67q5 5 10 0", "#795665");
        break;
      case "star":
        outline("M61 16L75 44L106 48L84 70L91 101L62 86L33 103L37 71L14 50L46 44Z", "#f6cd73");
        detail("M28 49l21-3m22 40l13 7", "#fff1bc", 4);
        dot(49, 60, 3, "#755560"); dot(73, 60, 3, "#755560");
        detail("M55 69q6 5 12 0", "#755560");
        break;
      case "bow":
        outline("M54 51Q22 23 16 39Q6 63 20 77Q30 85 50 71L39 97L54 91L61 76L74 98L89 98L74 72Q99 86 106 64Q115 34 98 35Q85 35 67 51Z", "#eca3b3");
        detail("M27 44q12 4 26 15m22 0q11-11 23-13M52 63q9-10 20 0", "#bc687d", 3);
        break;
      case "heart":
        outline("M61 42Q45 17 28 29Q12 37 22 62Q30 81 60 102Q90 84 101 60Q108 36 91 27Q75 19 61 42Z", "#eb8c85");
        detail("M31 47q4-10 13-9m33 42l11-9", "#ffd2c2", 5);
        break;
      case "mushroom":
        outline("M46 65h28q-2 13 4 26q3 13-17 13Q42 104 43 92Q48 78 46 65Z", "#fff0d4");
        outline("M16 68C18 43 38 20 60 21C82 20 103 45 105 66Q106 78 60 77Q17 79 16 68Z", "#cc7e8c");
        dot(43, 45, 7, "#ffe0c2"); dot(75, 40, 7, "#ffe0c2"); dot(88, 61, 5, "#ffe0c2"); dot(32, 62, 4, "#ffe0c2");
        break;
      case "letter":
        outline("M20 39L96 27Q101 27 102 32L108 80Q108 86 102 88L26 98Q21 97 20 92L14 45Q15 40 20 39Z", "#d3bad9");
        detail("M18 46l45 26l35-38m-74 55l23-24m25-4l31 19", "#806380", 2.5);
        ctx.fillStyle = "#c65f83";
        ctx.fill(new Path2D("M62 59q7-10 13-3q6 7-9 17q-15-6-12-13q3-6 8-1Z"));
        break;
    }
    const url = canvas.toDataURL();
    stickerImages.set(art, url);
    return url;
  }

  function saveProject() {
    try {
      localStorage.setItem(key, JSON.stringify(project));
    } catch {
      status.textContent = "As alterações estão disponíveis nesta visita. O navegador não conseguiu salvá-las.";
    }
  }

  function inkFor(hex) {
    const [r, g, b] = hex.slice(1).match(/../g).map(pair => {
      const value = Number.parseInt(pair, 16) / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b > .179 ? "#000000" : "#ffffff";
  }

  function actionLink(label, url, fallback) {
    const link = make("a", "", label);
    const candidate = url.trim();
    link.href = /^(https?:\/\/|mailto:|#[\w-]+$)/i.test(candidate) ? candidate : fallback;
    return link;
  }

  function applyIdentity(root) {
    const { accent, paper, style, logoColor } = project.identity;
    root.dataset.style = style;
    root.style.setProperty("--site-accent", accent);
    root.style.setProperty("--site-paper", paper);
    const ink = inkFor(paper);
    root.style.setProperty("--site-ink", ink);
    root.style.setProperty("--site-muted", `color-mix(in srgb, ${ink} 78%, ${paper})`);
    root.style.setProperty("--logo-color", logoColor);
    root.style.setProperty("--logo-ink", inkFor(logoColor));
  }

  function applyMediaLayout(frame, item) {
    frame.style.setProperty("--media-width", `${item.scale}%`);
    frame.style.setProperty("--media-offset", `${(100 - item.scale) * item.position / 100}%`);
    frame.style.setProperty("--media-angle", `${item.rotation}deg`);
  }

  function applyBorder(element, item) {
    if (item.border) {
      element.style.border = `${item.border}px solid ${item.borderColor}`;
      element.style.borderRadius = `${item.radius}px`;
    }
  }

  function renderBlock(item) {
    const section = make(item.type === "nav" ? "header" : item.type === "footer" ? "footer" : "section", "site-part");
    section.id = "recorte-" + item.id;
    const tone = item.color || project.identity.accent;
    section.style.setProperty("--block-tone", tone);
    section.style.setProperty("--block-ink", inkFor(tone));
    if (item.type !== "photo" && item.type !== "sticker") applyBorder(section, item);
    const fallback = "#recorte-" + (project.blocks.find(part => part.id !== item.id && ["cards", "gallery", "footer"].includes(part.type))?.id ?? item.id);
    const title = make(item.type === "hero" ? "h1" : "h2", "", item.title);
    const parts = item.body.split("\n").map(line => line.trim()).filter(Boolean);
    switch (item.type) {
      case "nav": {
        section.classList.add("site-nav");
        const brand = make("div", "site-brand");
        const mark = make("span", "site-mark", project.identity.icon);
        mark.dataset.shape = project.identity.shape;
        mark.setAttribute("aria-hidden", "true");
        brand.append(mark, make("strong", "", item.title));
        const nav = make("nav", "site-nav-links");
        nav.setAttribute("aria-label", "Menu");
        const anchors = project.blocks.filter(part => part.type !== "nav" && part.type !== "sticker");
        parts.slice(0, 5).forEach((label, index) => {
          nav.append(actionLink(label, "", "#recorte-" + (anchors[index]?.id ?? item.id)));
        });
        section.append(brand, nav);
        break;
      }
      case "hero": {
        section.classList.add("site-hero");
        const body = make("div");
        body.append(title, make("p", "", item.body));
        if (item.note) {
          const link = actionLink(item.note, item.link, fallback);
          link.className = "site-cta-button";
          body.append(link);
        }
        const art = make("div", "site-hero-art");
        art.setAttribute("aria-hidden", "true");
        art.append(make("span", "site-emblem", item.icon));
        section.append(body, art);
        break;
      }
      case "cards":
      case "gallery": {
        section.append(title);
        const grid = make("div", "site-grid");
        for (const line of parts.slice(0, 6)) {
          const [heading, ...rest] = line.split("|");
          const tile = make("div", "site-tile");
          const icon = make("span", item.type === "gallery" ? "site-gallery-swatch" : "site-card-icon", item.icon);
          icon.setAttribute("aria-hidden", "true");
          tile.append(icon, make("h3", "", heading.trim()));
          if (rest.length) tile.append(make("p", "", rest.join("|").trim()));
          grid.append(tile);
        }
        section.append(grid);
        break;
      }
      case "quote":
        section.classList.add("site-quote");
        section.append(title, make("blockquote", "", item.body), make("cite", "", item.note));
        break;
      case "callout":
      case "footer": {
        section.classList.add(item.type === "footer" ? "site-footer" : "site-callout");
        section.append(title, make("p", "", item.body));
        if (item.note) {
          const link = actionLink(item.note, item.link, item.type === "footer" ? "#inicio" : fallback);
          if (item.type === "callout") link.className = "site-cta-button";
          section.append(link);
        }
        break;
      }
      case "sticker": {
        section.classList.add("site-sticker-row");
        const frame = make("figure", "site-media site-media-sticker");
        applyMediaLayout(frame, item);
        const image = make("img", "site-sticker-picture");
        image.src = stickerPicture(item.art);
        image.alt = item.title ? "" : stickerStyles[item.art];
        image.draggable = false;
        applyBorder(image, item);
        frame.append(image);
        if (item.title) frame.append(make("figcaption", "", item.title));
        section.append(frame);
        break;
      }
      case "photo": {
        section.classList.add("site-photo-row");
        if (item.title) section.append(title);
        const frame = make("figure", "site-media site-media-photo");
        applyMediaLayout(frame, item);
        if (item.photo) {
          const image = make("img");
          image.src = item.photo;
          image.alt = item.note;
          applyBorder(image, item);
          image.style.borderRadius = `${item.radius}px`;
          frame.append(image);
        } else {
          frame.append(make("p", "site-photo-placeholder", "Escolha uma foto para este espaço."));
        }
        if (item.body) frame.append(make("figcaption", "", item.body));
        section.append(frame);
        break;
      }
    }
    return section;
  }

  function renderPage() {
    applyIdentity(page);
    page.replaceChildren();
    get("builder-empty").hidden = project.blocks.length !== 0;
    for (const item of project.blocks) {
      const section = renderBlock(item);
      const wrapper = make("div", "builder-block");
      wrapper.classList.toggle("is-selected", item.id === selectedId);
      const edit = make("button", "builder-select", "Editar");
      edit.type = "button";
      edit.setAttribute("aria-label", `Editar ${item.title || templates[item.type].label}`);
      edit.addEventListener("click", () => selectBlock(item.id));
      if (item.type === "sticker") enableStickerDrag(section, item);
      if (item.type === "photo" && !item.photo && !previewing) {
        section.querySelector(".site-photo-placeholder")?.addEventListener("click", () => pickPhoto(item.id));
      }
      wrapper.append(edit, section);
      page.append(wrapper);
    }
  }

  function enableStickerDrag(section, item) {
    const frame = section.querySelector(".site-media");
    frame.classList.add("builder-drag-sticker");
    let gesture;
    frame.addEventListener("pointerdown", event => {
      if (previewing || event.button !== 0) return;
      const room = frame.offsetWidth * (100 - item.scale) / item.scale;
      if (room <= 0) return;
      frame.setPointerCapture(event.pointerId);
      gesture = { start: event.clientX, position: item.position, room };
    });
    frame.addEventListener("pointermove", event => {
      if (!gesture) return;
      item.position = Math.round(within(gesture.position + (event.clientX - gesture.start) / gesture.room * 100, 0, 100, 50));
      applyMediaLayout(frame, item);
    });
    frame.addEventListener("lostpointercapture", () => {
      if (!gesture) return;
      gesture = null;
      saveProject();
      if (selectedId === item.id) renderInspector();
    });
  }

  function field(label, value, update, settings = {}) {
    const wrapper = make("label", "", label);
    const control = make(settings.options ? "select" : settings.multiline ? "textarea" : "input");
    if (settings.options) {
      Object.entries(settings.options).forEach(([name, caption]) => {
        const choice = make("option", "", caption);
        choice.value = name;
        control.append(choice);
      });
    } else if (!settings.multiline) {
      control.type = settings.type ?? "text";
      if (settings.type === "range") {
        control.min = settings.min;
        control.max = settings.max;
      } else {
        control.maxLength = settings.limit ?? 90;
      }
    } else {
      control.maxLength = 500;
    }
    control.value = value;
    const reading = settings.type === "range" ? make("span", "builder-range-value", value + settings.unit) : null;
    control.addEventListener("input", () => {
      if (reading) reading.textContent = control.value + settings.unit;
      update(settings.type === "range" ? control.valueAsNumber : control.value);
      renderPage();
      saveProject();
    });
    if (reading) wrapper.append(reading);
    wrapper.append(control);
    return wrapper;
  }

  function materialButton(label, icon, activate, illustration) {
    const button = make("button", "builder-material");
    button.type = "button";
    const mark = illustration ? make("img", "builder-sticker-thumb") : make("span", "", icon);
    if (illustration) {
      mark.src = stickerPicture(illustration);
      mark.alt = "";
      button.classList.add("builder-sticker-option");
    }
    mark.setAttribute("aria-hidden", "true");
    button.append(mark, make("span", "", label));
    button.addEventListener("click", activate);
    return button;
  }

  function renderMaterials() {
    materials.replaceChildren();
    if (activeTab === "identity") {
      for (const preset of logoPresets) {
        materials.append(materialButton(preset.label, preset.icon, () => {
          Object.assign(project.identity, { icon: preset.icon, shape: preset.shape, logoColor: preset.color });
          renderMaterials();
          materials.querySelector("button").focus({ preventScroll: true });
          renderPage();
          saveProject();
        }));
      }
      const identity = make("div", "builder-identity");
      const settings = [
        ["title", "Nome do site", { limit: 70 }],
        ["style", "Estilo de tipografia", { options: styles }],
        ["icon", "Símbolo da logo", { options: symbols }],
        ["shape", "Formato da logo", { options: shapes }],
        ["logoColor", "Cor da logo", { type: "color" }],
        ["accent", "Cor de destaque", { type: "color" }],
        ["paper", "Fundo da página", { type: "color" }],
      ];
      for (const [key, label, options] of settings) {
        identity.append(field(label, project.identity[key], value => {
          const previous = project.identity[key];
          project.identity[key] = value;
          if (key === "title") {
            for (const item of project.blocks) {
              if (["nav", "footer"].includes(item.type) && item.title === previous) item.title = value;
            }
            renderInspector();
          }
        }, options));
      }
      materials.append(identity);
    } else if (activeTab === "stickers") {
      for (const preset of stickerPresets) materials.append(materialButton(preset.label, "", () => addBlock("sticker", { art: preset.art, title: "" }), preset.art));
    } else {
      for (const [type, template] of Object.entries(templates)) {
        if (type === "photo") materials.append(materialButton("Adicionar uma foto", template.icon, () => pickPhoto()));
        else if (type !== "sticker") materials.append(materialButton(template.label, template.icon, () => addBlock(type)));
      }
    }
  }

  function renderInspector() {
    const index = project.blocks.findIndex(item => item.id === selectedId);
    const item = project.blocks[index];
    inspector.hidden = !item;
    get("builder-inspector-empty").hidden = Boolean(item);
    inspector.replaceChildren();
    if (!item) return;
    const addField = (property, label, config) => {
      const value = property === "color" ? item.color || project.identity.accent : item[property];
      inspector.append(field(label, value, update => { item[property] = update; }, config));
    };
    const slider = (min, max, unit) => ({ type: "range", min, max, unit });
    if (item.type === "photo") {
      const replace = make("button", "secondary-button", item.photo ? "Trocar foto" : "Escolher foto");
      replace.type = "button";
      replace.addEventListener("click", () => pickPhoto(item.id));
      inspector.append(replace);
    }
    addField("title", item.type === "sticker" ? "Texto do adesivo (opcional)" : "Título");
    if (item.type !== "sticker" && item.type !== "photo") {
      const rows = { nav: "Links do menu, um por linha", cards: "Cartões, um por linha (título | descrição)", gallery: "Itens, um por linha (título | descrição)" };
      addField("body", rows[item.type] ?? "Texto", { multiline: true });
    }
    if (item.type === "photo") {
      addField("body", "Legenda (opcional)", { multiline: true });
      addField("note", "Descrição da foto (para leitores de tela)");
    }
    if (item.type === "sticker") {
      inspector.append(make("p", "builder-drag-hint", "Arraste o adesivo na prévia ou ajuste a posição aqui."));
      addField("art", "Ilustração", { options: stickerStyles });
    }
    if (["photo", "sticker"].includes(item.type)) {
      addField("scale", "Tamanho", slider(15, 100, "%"));
      addField("position", "Posição na página", slider(0, 100, "%"));
      if (item.type === "sticker") addField("rotation", "Inclinação", slider(-35, 35, "°"));
    }
    addField("border", "Espessura da borda", slider(0, 16, " px"));
    addField("borderColor", "Cor da borda", { type: "color" });
    addField("radius", "Arredondamento", slider(0, 48, " px"));
    if (["hero", "callout", "footer", "quote"].includes(item.type)) {
      addField("note", item.type === "quote" ? "Autoria do depoimento" : "Texto do link");
      if (item.type !== "quote") addField("link", "Endereço do link", { limit: 240 });
    }
    if (["hero", "cards", "gallery"].includes(item.type)) addField("icon", "Ícone", { options: symbols });
    if (!["nav", "footer"].includes(item.type)) addField("color", "Cor do recorte", { type: "color" });

    const controls = make("div", "builder-order");
    const actions = [
      ["Subir", index === 0, () => moveBlock(index, -1)],
      ["Descer", index === project.blocks.length - 1, () => moveBlock(index, 1)],
      ["Remover", false, () => {
        project.blocks.splice(index, 1);
        selectBlock(project.blocks[Math.min(index, project.blocks.length - 1)]?.id);
        saveProject();
      }],
    ];
    for (const [label, disabled, activate] of actions) {
      const button = make("button", "secondary-button", label);
      button.type = "button";
      button.disabled = disabled;
      button.addEventListener("click", activate);
      controls.append(button);
    }
    inspector.append(controls);
  }

  function selectBlock(id) {
    selectedId = id;
    renderPage();
    renderInspector();
    const desktopLayout = matchMedia("(min-width: 851px)").matches;
    if (desktopLayout) page.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
    (inspector.querySelector("input") ?? get("builder-export")).focus({ preventScroll: desktopLayout });
  }

  function addBlock(type, settings) {
    if (project.blocks.length >= 60) {
      status.textContent = "O scrapbook está cheio. Remova um recorte para adicionar outro.";
      return;
    }
    status.textContent = "";
    const identity = ["nav", "footer"].includes(type) ? { title: project.identity.title } : {};
    const item = block(type, project.nextId++, settings ?? identity);
    project.blocks.push(item);
    selectBlock(item.id);
    saveProject();
  }

  function pickPhoto(id) {
    replacingPhoto = id;
    photoPicker.value = "";
    photoPicker.click();
  }

  async function optimizePhoto(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Formato de imagem incompatível");
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, 1150 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/webp", .82);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  photoPicker.addEventListener("change", async () => {
    const file = photoPicker.files[0];
    const id = replacingPhoto;
    if (!file) return;
    status.textContent = "";
    try {
      const photo = await optimizePhoto(file);
      const item = project.blocks.find(part => part.id === id && part.type === "photo");
      if (item) {
        item.photo = photo;
        selectBlock(id);
        saveProject();
      } else if (id === undefined) {
        addBlock("photo", { photo });
      }
    } catch {
      status.textContent = "Não foi possível abrir essa foto. Escolha um arquivo JPG, PNG ou WebP.";
    }
  });

  function moveBlock(index, offset) {
    const destination = index + offset;
    [project.blocks[index], project.blocks[destination]] = [project.blocks[destination], project.blocks[index]];
    selectBlock(selectedId);
    saveProject();
  }

  async function exportSite() {
    exportButton.disabled = true;
    status.textContent = "";
    try {
      const response = await fetch("./site-preview.css");
      if (!response.ok) throw new Error("Estilos indisponíveis");
      const css = await response.text();
      const output = document.implementation.createHTMLDocument(project.identity.title || "Meu site");
      output.documentElement.lang = "pt-BR";
      const charset = make("meta");
      charset.setAttribute("charset", "utf-8");
      const viewport = make("meta");
      viewport.name = "viewport";
      viewport.content = "width=device-width, initial-scale=1";
      output.head.prepend(charset, viewport);
      output.head.append(make("style", "", "body { margin: 0; }\n" + css));
      const site = make("main", "site-draft");
      site.id = "inicio";
      applyIdentity(site);
      site.append(...project.blocks.map(renderBlock));
      output.body.append(site);
      const file = new Blob(["<!doctype html>\n", output.documentElement.outerHTML], { type: "text/html;charset=utf-8" });
      const objectUrl = URL.createObjectURL(file);
      const link = make("a");
      link.href = objectUrl;
      const filename = project.identity.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      link.download = (filename || "meu-site") + ".html";
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      status.textContent = "HTML pronto para abrir no navegador.";
    } catch {
      status.textContent = "Não foi possível gerar o HTML. Tente novamente.";
    } finally {
      exportButton.disabled = false;
    }
  }

  inspector.addEventListener("submit", event => event.preventDefault());
  document.querySelectorAll("[data-builder-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.builderTab;
      for (const tab of document.querySelectorAll("[data-builder-tab]")) {
        tab.setAttribute("aria-pressed", String(tab === button));
      }
      renderMaterials();
    });
  });
  get("builder-preview-mode").addEventListener("click", event => {
    previewing = !previewing;
    workbench.classList.toggle("is-preview", previewing);
    event.currentTarget.setAttribute("aria-pressed", String(previewing));
    event.currentTarget.textContent = previewing ? "Voltar à edição" : "Ver página";
  });
  get("builder-size").addEventListener("click", event => {
    const narrow = page.classList.toggle("is-narrow");
    event.currentTarget.setAttribute("aria-pressed", String(narrow));
    event.currentTarget.textContent = narrow ? "Como fica no computador" : "Como fica no celular";
  });
  page.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    if (!previewing) {
      event.preventDefault();
    } else if (link.getAttribute("href").startsWith("#")) {
      event.preventDefault();
      const destination = link.hash === "#inicio" ? page : document.getElementById(link.hash.slice(1));
      destination?.scrollIntoView({ block: "start" });
    } else {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
  exportButton.addEventListener("click", exportSite);
  get("builder-add-photo").addEventListener("click", () => {
    if (previewing) get("builder-preview-mode").click();
    pickPhoto();
  });

  renderMaterials();
  renderPage();
  renderInspector();
})();
