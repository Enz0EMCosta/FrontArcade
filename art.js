const avatarCategories = [
  { id: "face", label: "Rosto" },
  { id: "hair", label: "Cabelo" },
  { id: "clothes", label: "Roupas" },
  { id: "costumes", label: "Fantasias" },
  { id: "extras", label: "Acessórios" },
  { id: "items", label: "Mãos" },
  { id: "scenes", label: "Cenários" },
];

function colorChoices(...colors) {
  return colors.map(([label, color, shade]) => ({ label, color, shade }));
}

function styleChoices(...labels) {
  return labels.map(label => ({ label }));
}

const hairColors = colorChoices(
  ["Preto", "#302839", "#574659"], ["Castanho", "#754444", "#a66854"],
  ["Loiro", "#d38943", "#ffe08d"], ["Roxo", "#7146bc", "#ae87ef"],
  ["Ruivo", "#a74632", "#f28757"], ["Rosa", "#ce4c79", "#ff99bd"],
  ["Azul", "#2879ac", "#76c7ea"], ["Prata", "#8c859e", "#dbd6e4"],
  ["Verde", "#277b68", "#69c5a8"], ["Cobre", "#9c542d", "#eca474"],
  ["Branco", "#cdd5eb", "#fdf5ea"]
);

const avatarScenes = [
  { label: "Cor sólida" },
  { label: "Praia", effect: ["Ver pôr do sol", "Voltar ao dia"] },
  { label: "Jardim", effect: ["Atrair borboletas", "Dispersar borboletas"] },
  { label: "Espaço", effect: ["Ligar os propulsores", "Desligar os propulsores"] },
  { label: "Arcade", effect: ["Trocar as luzes", "Restaurar as luzes"] },
  { label: "Montanhas", effect: ["Fazer nevar", "Parar a neve"] },
  { label: "Cidade à noite", effect: ["Acender as janelas", "Apagar as janelas"] },
  { label: "Floresta", effect: ["Atrair vaga-lumes", "Dispersar vaga-lumes"] },
  { label: "Aquário", effect: ["Atrair cardumes", "Dispersar cardumes"] },
  { label: "Deserto", effect: ["Revelar o oásis", "Ocultar o oásis"] },
  { label: "Castelo", effect: ["Hastear bandeiras", "Recolher bandeiras"] },
  { label: "Noite chuvosa", effect: ["Intensificar chuva", "Abrandar chuva"] },
  { label: "Aurora polar", effect: ["Trocar cor da aurora", "Restaurar cor da aurora"] },
  { label: "Festival", effect: ["Soltar lanternas", "Recolher lanternas"] },
  { label: "Vulcão", effect: ["Avivar a lava", "Acalmar a lava"] },
];

const avatarItems = [
  { label: "Nenhum" },
  { label: "Celular", action: "Abrir notificações" },
  { label: "Melancia", action: "Dar uma mordida" },
  { label: "Livro", action: "Virar a página" },
  { label: "Café", action: "Aquecer o café" },
  { label: "Flor", action: "Soltar pétalas" },
  { label: "Varinha", action: "Lançar faíscas" },
  { label: "Câmera", action: "Tirar foto" },
  { label: "Controle", action: "Apertar os botões" },
  { label: "Sorvete", action: "Dar uma lambida" },
  { label: "Balão", action: "Balançar o balão" },
  { label: "Pelúcia", action: "Abraçar a pelúcia" },
];

const avatarOptions = {
  skin: {
    category: "face", label: "Tom de pele",
    choices: colorChoices(
      ["Bege", "#ffd1ad", "#de9474"], ["Dourado", "#e8ad73", "#b87547"],
      ["Marrom", "#b77554", "#874e37"], ["Marrom escuro", "#81513c", "#57322a"],
      ["Porcelana", "#ffe5d4", "#eab0a0"], ["Caramelo", "#d08a54", "#a25939"],
      ["Ébano", "#603d32", "#402620"]
    ),
  },
  eyes: {
    category: "face", label: "Olhos", crop: [18, 22, 28, 13],
    choices: styleChoices("Clássicos", "Redondos", "Com cílios", "Fechados", "Piscadinha", "Felizes", "Sonolentos", "Brilhantes", "Em coração", "De lado", "Curiosos"),
  },
  eyeColor: {
    category: "face", label: "Cor dos olhos",
    choices: colorChoices(
      ["Castanho", "#7b442e"], ["Azul", "#2076ba"], ["Verde", "#278368"],
      ["Âmbar", "#b56813"], ["Violeta", "#794bba"], ["Cinza", "#637691"],
      ["Turquesa", "#208d92"], ["Rosa", "#bb4d7e"]
    ),
  },
  mouth: {
    category: "face", label: "Boca", crop: [24, 31, 16, 8],
    choices: styleChoices("Sorriso", "Risada", "Neutra", "Batom", "Sorriso de lado", "Surpresa", "Língua de fora", "Assobio", "Dentinho", "Aparelho", "Beijinho", "Rabugenta"),
  },
  hair: {
    category: "hair", label: "Penteado", crop: [9, 2, 46, 49],
    choices: styleChoices("Curto", "Longo", "Crespo", "Raspado", "Chanel", "Rabo de cavalo", "Dois coques", "Franja", "Ondulado", "Tranças", "Pixie", "Moicano", "Lateral raspada", "Black power", "Coque alto", "Locs"),
  },
  hairColor: {
    category: "hair", label: "Cor do cabelo",
    choices: hairColors,
  },
  hairGradient: {
    category: "hair", label: "Degradê das mechas",
    choices: [{ label: "Sem degradê", color: "repeating-linear-gradient(135deg, #fff 0 6px, #dce4ed 6px 12px)" }, ...hairColors],
  },
  outfit: {
    category: "clothes", label: "Modelo", crop: [12, 41, 40, 34],
    choices: styleChoices(
      "Camiseta", "Moletom", "Jardineira", "Vestido", "Jaqueta", "Conjunto com saia", "Regata", "Camisa social",
      "Terno", "Quimono", "Macacão", "Pijama", "Colete", "Uniforme esportivo", "Capa de chuva", "Suéter", "Poncho", "Saia plissada",
      "Moletom grafite", "Oversized xadrez", "Camiseta listrada", "Jaqueta varsity", "Camiseta de chamas", "Conjunto cargo", "Jaqueta tie-dye", "Jeans com patches"
    ),
  },
  shirt: {
    category: "clothes", label: "Cor da roupa",
    choices: colorChoices(
      ["Lilás", "#b58afe", "#7954c4"], ["Verde menta", "#69dec0", "#318c78"],
      ["Coral", "#fa8b90", "#bd4265"], ["Azul", "#76acff", "#4270b9"],
      ["Amarelo", "#ffd66f", "#c48728"], ["Vinho", "#9a3f63", "#642846"],
      ["Areia", "#f1d2a3", "#ae865d"], ["Marinho", "#405978", "#293a56"],
      ["Laranja", "#f4a56d", "#bb5c42"], ["Verde musgo", "#90ac73", "#557150"],
      ["Céu", "#9fdee8", "#528baf"], ["Rosa", "#f6a8cb", "#b45c94"]
    ),
  },
  costume: {
    category: "costumes", label: "Fantasia", crop: [8, 0, 48, 76],
    choices: styleChoices(
      "Nenhuma", "Dinossauro", "Bruxa", "Astronauta", "Robô", "Abelha", "Fantasma", "Gatinho", "Pirata",
      "Dragão", "Unicórnio", "Coelho", "Raposa", "Cogumelo", "Cavaleiro", "Super-herói", "Vampiro",
      "Múmia", "Esqueleto", "Sereia", "Mago",
      "Mestre do Vento", "Mestre das Marés", "Mestre das Brasas", "Mestre da Rocha",
      "Lêmure Elétrico", "Axolote-Coral", "Mariposa-Folha", "Tartaruga de Gelo",
      "Nômade do Horizonte", "Mascote Faísca", "Guardiã da Correnteza",
      "Guardiã Joaninha", "Guardião Gato Preto", "Guardião Minotauro", "Guardiã Medusa",
      "Guardiã Coruja", "Guardião Lobo Lunar", "Guardião Escaravelho", "Guardiã Cervo", "Guardião Corvo", "Guardiã Fênix"
    ),
  },
  accessory: {
    category: "extras", label: "Acessório", crop: [9, 2, 46, 52],
    choices: styleChoices(
      "Nenhum", "Óculos", "Brincos", "Laço", "Fones", "Boné", "Óculos escuros", "Tiara", "Bandana", "Coroa", "Máscara", "Cachecol", "Tapa-olho", "Boina", "Presilha", "Estrelas no rosto",
      "Tiara de morango", "Brincos de cereja", "Presilha de amora", "Colar de miçangas", "Brincos de framboesa", "Boina uva", "Óculos rosa", "Presilhas de estrela"
    ),
  },
  held: {
    category: "items", label: "Objeto de mão", crop: [40, 27, 24, 38],
    choices: avatarItems,
  },
  scene: {
    category: "scenes", label: "Cenário", crop: [0, 0, 64, 80],
    choices: avatarScenes,
  },
  backdrop: {
    category: "scenes", label: "Cor do fundo sólido",
    choices: colorChoices(
      ["Menta", "#bdece0", "#88c7bd"], ["Céu", "#c5e2f7", "#8bb6df"],
      ["Pêssego", "#f9d4b7", "#e2aa84"], ["Lavanda", "#e4d7f5", "#bbaddf"],
      ["Rosa", "#f9d5e7", "#ddabca"]
    ),
  },
};

const avatarBuffer = document.createElement("canvas");
avatarBuffer.width = 64;
avatarBuffer.height = 80;

const activeItemFrame = 2;

function paintAvatar(canvas, avatar, crop = [0, 0, 64, 80], {
  frame = 0, alternate = avatar.sceneAlternate, sceneOnly = false,
  itemFrame = avatar.itemActionActive ? activeItemFrame : null,
} = {}) {
  const ctx = avatarBuffer.getContext("2d");
  const box = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };
  const background = avatarOptions.backdrop.choices[avatar.backdrop];
  paintScenery(box, background, avatar.scene, frame, alternate);
  if (!sceneOnly) paintCharacter(ctx, box, avatar, itemFrame);
  const result = canvas.getContext("2d");
  result.imageSmoothingEnabled = false;
  result.drawImage(avatarBuffer, ...crop, 0, 0, canvas.width, canvas.height);
}

function paintHairPalette(ctx, style, base, tint) {
  if (!tint?.shade) return base;

  const tip = [27, 44, 23, 24, 37, 41, 25, 30, 42, 45, 27, 19, 25, 24, 21, 45][style];
  const gradient = (root, end, start) => {
    const fill = ctx.createLinearGradient(27, Math.min(13, tip - 12), 35, tip);
    fill.addColorStop(start, root);
    fill.addColorStop(1, end);
    return fill;
  };
  return {
    color: gradient(base.color, tint.color, 0.35),
    shade: gradient(base.shade, tint.shade, 0),
  };
}

function paintCharacter(ctx, box, avatar, itemFrame) {
  const palette = key => avatarOptions[key].choices[avatar[key]];
  const skin = palette("skin");
  const hair = paintHairPalette(ctx, avatar.hair, palette("hairColor"), palette("hairGradient"));
  const eye = palette("eyeColor").color;
  const hairStyle = avatar.hair;
  const ink = "#232940";
  const white = "#fff5e6";

  box(15, 46, 8, 13, ink);
  box(41, 46, 8, 13, ink);
  box(17, 48, 5, 9, skin.color);
  box(42, 48, 5, 9, skin.shade);

  if (avatar.costume) {
    paintCostumeBody(box, avatar.costume);
  } else {
    paintEverydayOutfit(box, avatar.outfit, palette("shirt"), skin);
  }

  // Hair behind the head and shoulders
  if (hairStyle === 1 || hairStyle === 4) {
    const length = hairStyle === 1 ? 28 : 21;
    box(16, 18, 32, length, ink);
    box(18, 18, 28, length - 2, hair.color);
    box(19, 22, 3, length - 8, hair.shade);
    box(43, 22, 2, length - 8, hair.shade);
  }
  if (hairStyle === 5) {
    box(42, 19, 9, 26, ink);
    box(44, 21, 6, 21, hair.color);
    box(48, 23, 2, 12, hair.shade);
    box(43, 20, 4, 3, "#e8779b");
  }
  if (hairStyle === 6) {
    box(13, 9, 11, 11, ink);
    box(40, 9, 11, 11, ink);
    box(15, 9, 7, 9, hair.color);
    box(42, 9, 7, 9, hair.color);
    box(16, 11, 4, 2, hair.shade);
    box(44, 11, 4, 2, hair.shade);
  }
  if (hairStyle === 8 || hairStyle === 9 || hairStyle === 15) {
    for (const x of [16, 43]) {
      box(x, 19, 6, 25, ink);
      box(x + 1, 20, 4, 22, hair.color);
      for (const y of [25, 30, 36, 41]) box(x + 1, y, 3, 2, hair.shade);
    }
  }

  // Face, ears and neck
  box(27, 39, 10, 7, ink);
  box(29, 39, 6, 6, skin.shade);
  box(21, 16, 22, 24, ink);
  box(18, 25, 28, 10, ink);
  box(24, 39, 16, 2, ink);
  box(23, 18, 18, 20, skin.color);
  box(20, 27, 24, 6, skin.color);
  box(40, 28, 3, 4, skin.shade);
  box(24, 36, 16, 4, skin.color);
  box(31, 32, 3, 2, skin.shade);

  // Hair visible around the face
  if (hairStyle === 3) {
    box(23, 16, 18, 5, hair.color);
    box(25, 17, 14, 2, hair.shade);
    box(22, 19, 2, 6, hair.color);
    box(40, 19, 2, 6, hair.color);
  } else {
    box(19, 16, 26, 8, ink);
    box(22, 12, 20, 7, ink);
    box(21, 17, 22, 6, hair.color);
    box(24, 13, 16, 7, hair.color);
    box(24, 15, 13, 2, hair.shade);
    box(21, 22, 3, 5, hair.color);
    box(40, 21, 3, 6, hair.color);
  }
  if (hairStyle === 1 || hairStyle === 4 || hairStyle === 7) {
    box(22, 20, 15, 5, hair.color);
    box(22, 24, 7, 2, hair.color);
  }
  if (hairStyle === 7) {
    box(19, 16, 5, 15, hair.color);
    box(38, 19, 6, 6, hair.color);
    box(26, 23, 12, 3, hair.color);
  }
  if (hairStyle === 2) {
    box(18, 14, 28, 9, hair.color);
    box(23, 10, 18, 7, hair.color);
    box(26, 9, 5, 3, hair.shade);
    box(19, 16, 6, 3, hair.shade);
    box(32, 13, 5, 3, hair.shade);
    box(38, 18, 5, 3, hair.shade);
  }
  paintHairDetails(box, hairStyle, hair, skin.color);

  paintEyes(box, avatar.eyes, eye);

  switch (avatar.mouth) {
    case 0:
      box(29, 34, 6, 1, ink);
      box(30, 35, 4, 1, ink);
      break;
    case 1:
      box(28, 34, 8, 3, ink);
      box(29, 34, 6, 1, white);
      box(30, 36, 4, 1, "#ee7e89");
      break;
    case 2:
      box(30, 35, 5, 1, ink);
      break;
    case 3:
      box(28, 34, 8, 2, "#a23452");
      box(30, 33, 4, 4, "#c24c67");
      box(30, 35, 4, 1, "#74304b");
      break;
    case 4:
      box(29, 35, 5, 1, ink);
      box(33, 34, 3, 1, ink);
      box(35, 33, 1, 1, ink);
      break;
    case 5:
      box(30, 33, 4, 5, ink);
      box(29, 34, 6, 3, ink);
      box(31, 36, 2, 1, "#d67588");
      break;
    case 6:
      box(28, 34, 8, 2, ink);
      box(32, 35, 3, 3, "#e6618b");
      box(33, 36, 1, 1, "#f8a0b2");
      break;
    case 7:
      box(32, 34, 2, 3, ink);
      box(31, 35, 4, 1, ink);
      box(36, 33, 2, 1, white);
      break;
    case 8:
      box(28, 34, 8, 3, ink);
      box(30, 34, 2, 2, white);
      break;
    case 9:
      box(28, 34, 8, 3, ink);
      box(29, 34, 6, 2, white);
      box(30, 35, 4, 1, "#729abc");
      break;
    case 10:
      box(29, 33, 2, 2, "#da728e");
      box(33, 33, 2, 2, "#da728e");
      box(30, 34, 4, 2, "#ba5575");
      box(31, 36, 2, 1, "#ba5575");
      break;
    case 11:
      box(30, 34, 4, 1, ink);
      box(29, 35, 1, 1, ink);
      box(34, 35, 1, 1, ink);
      break;
  }

  paintCostumeHead(box, avatar.costume);
  if (avatar.costume) paintCostumeHair(box, hairStyle, hair);
  switch (avatar.accessory) {
    case 1:
      ctx.strokeStyle = ink;
      ctx.strokeRect(22.5, 26.5, 8, 6);
      ctx.strokeRect(33.5, 26.5, 8, 6);
      box(30, 28, 4, 1, ink);
      break;
    case 2:
      box(20, 32, 3, 4, "#e49f36");
      box(41, 32, 3, 4, "#e49f36");
      box(21, 34, 1, 1, white);
      box(42, 34, 1, 1, white);
      break;
    case 3:
      box(37, 12, 11, 6, "#b73561");
      box(37, 13, 4, 3, "#ff8bb0");
      box(44, 13, 4, 3, "#ff8bb0");
      box(41, 14, 3, 3, "#ffd17a");
      break;
    case 4:
      box(20, 12, 24, 3, ink);
      box(17, 15, 4, 15, ink);
      box(43, 15, 4, 15, ink);
      box(16, 24, 5, 8, "#5db9b8");
      box(43, 24, 5, 8, "#5db9b8");
      break;
    case 5:
      box(20, 14, 24, 7, "#225bb2");
      box(24, 11, 16, 5, "#337bcf");
      box(21, 20, 26, 3, ink);
      box(29, 14, 5, 3, "#ffe282");
      break;
    case 6:
      box(23, 26, 8, 6, "#343e58");
      box(33, 26, 8, 6, "#343e58");
      box(30, 27, 4, 2, "#343e58");
      box(24, 27, 4, 1, "#9bbdd6");
      box(34, 27, 4, 1, "#9bbdd6");
      break;
    case 7:
      box(22, 18, 20, 2, "#e98ba4");
      box(24, 16, 16, 2, "#fbb8c3");
      box(30, 15, 4, 3, "#fff2c8");
      break;
    case 8:
      box(19, 20, 26, 5, "#b54d68");
      box(19, 24, 3, 9, "#a44460");
      for (const x of [23, 29, 35, 41]) box(x, 21, 2, 2, white);
      break;
    case 9:
      box(22, 13, 20, 7, "#e2a843");
      for (const x of [22, 30, 39]) box(x, 9, 3, 5, "#ffe085");
      box(30, 14, 4, 4, "#c95d82");
      break;
    case 10:
      box(23, 31, 18, 3, "#81c8da");
      box(25, 34, 14, 5, "#9bd6e5");
      box(26, 35, 12, 1, "#dff7f9");
      break;
    case 11:
      box(25, 41, 14, 5, "#d76c90");
      box(35, 45, 5, 8, "#d76c90");
      box(36, 48, 4, 2, "#f4aabd");
      box(26, 42, 13, 1, "#f4aabd");
      break;
    case 12:
      box(22, 26, 11, 1, ink);
      box(30, 25, 11, 1, ink);
      box(34, 26, 7, 7, "#3d3653");
      box(35, 27, 5, 2, "#675674");
      break;
    case 13:
      box(18, 13, 26, 8, "#762e51");
      box(22, 11, 24, 7, "#b64a71");
      box(30, 9, 5, 3, "#b64a71");
      box(20, 19, 23, 2, "#5e2647");
      break;
    case 14:
      box(38, 20, 7, 2, "#ffdd84");
      box(39, 23, 7, 2, "#90d6e4");
      break;
    case 15:
      for (const x of [22, 41]) {
        box(x - 1, 33, 3, 1, "#fff0a5");
        box(x, 32, 1, 3, "#fff0a5");
      }
      break;
    case 16:
      box(20, 19, 24, 3, "#ea87a2");
      box(29, 12, 9, 7, "#d64f76");
      box(31, 10, 5, 3, "#72ae79");
      box(31, 14, 2, 1, "#ffe4a8");
      box(34, 16, 2, 1, "#ffe4a8");
      break;
    case 17:
      for (const x of [19, 41]) {
        box(x + 2, 31, 2, 5, "#659673");
        box(x, 35, 3, 4, "#bf325c");
        box(x + 3, 34, 3, 5, "#da6180");
      }
      break;
    case 18:
      box(35, 19, 10, 2, "#a77cd1");
      box(36, 15, 6, 5, "#76508b");
      box(38, 14, 4, 3, "#ae74bc");
      box(41, 16, 3, 3, "#9d609f");
      box(35, 14, 3, 2, "#88b783");
      break;
    case 19:
      for (const [index, color] of ["#db91ab", "#ac9be0", "#ffc578", "#84cfb2", "#e297ba"].entries()) {
        box(25 + index * 3, index === 0 || index === 4 ? 42 : 44, 3, 3, color);
      }
      break;
    case 20:
      for (const x of [18, 42]) {
        box(x + 2, 30, 2, 5, "#f7cb92");
        box(x, 34, 6, 5, "#cb537b");
        box(x + 1, 35, 2, 2, "#f1a4b6");
        box(x + 2, 39, 2, 2, "#9d3d71");
      }
      break;
    case 21:
      box(17, 13, 28, 8, "#64497f");
      box(21, 9, 25, 8, "#a77bc8");
      box(31, 7, 4, 3, "#75539c");
      box(22, 18, 18, 3, "#855fa3");
      break;
    case 22:
      box(22, 26, 9, 5, "#c25f94");
      box(33, 26, 9, 5, "#c25f94");
      box(30, 27, 4, 1, "#f395be");
      box(24, 27, 6, 3, "#efb3ce");
      box(34, 27, 6, 3, "#efb3ce");
      break;
    case 23:
      for (const [x, y, color] of [[19, 21, "#f4bbd2"], [42, 16, "#ffd595"]]) {
        box(x - 2, y, 5, 1, color);
        box(x, y - 2, 1, 5, color);
      }
      break;
  }

  paintHeldItem(box, avatar.held, skin.color, itemFrame);
  if (itemFrame !== null) paintItemEffect(box, avatar.held, itemFrame);
}

function paintEverydayOutfit(box, outfit, shirt, skin) {
  const ink = "#232940";
  const white = "#fff5e6";
  box(24, 58, 16, 13, ink);
  box(26, 60, 5, 10, skin.color);
  box(33, 60, 5, 10, skin.shade);
  box(21, 68, 11, 5, ink);
  box(32, 68, 11, 5, ink);
  box(22, 69, 8, 2, white);
  box(34, 69, 8, 2, white);
  box(20, 43, 24, 16, ink);
  box(23, 42, 18, 17, ink);
  box(22, 45, 20, 13, shirt.color);
  box(17, 46, 6, 5, shirt.color);
  box(41, 46, 6, 5, shirt.shade);
  box(22, 55, 20, 3, shirt.shade);
  box(23, 58, 18, 7, ink);

  switch (outfit) {
    case 0:
      box(30, 49, 4, 4, white);
      box(31, 48, 2, 6, white);
      box(25, 59, 14, 4, "#4a6589");
      break;
    case 1:
      box(24, 43, 16, 5, shirt.shade);
      box(27, 48, 1, 5, white);
      box(36, 48, 1, 5, white);
      box(27, 55, 10, 3, shirt.shade);
      box(17, 50, 5, 5, shirt.color);
      box(42, 50, 5, 5, shirt.shade);
      box(25, 59, 14, 5, "#45506b");
      break;
    case 2:
      box(24, 43, 3, 10, shirt.shade);
      box(37, 43, 3, 10, shirt.shade);
      box(26, 49, 12, 13, shirt.shade);
      box(26, 50, 2, 2, white);
      box(36, 50, 2, 2, white);
      box(25, 59, 6, 7, shirt.shade);
      box(33, 59, 6, 7, shirt.shade);
      break;
    case 3:
      box(19, 55, 26, 11, ink);
      box(21, 56, 22, 8, shirt.color);
      box(20, 62, 24, 3, shirt.shade);
      box(22, 53, 20, 3, white);
      break;
    case 4:
      box(28, 45, 8, 13, "#f5ddbb");
      box(26, 45, 3, 13, shirt.shade);
      box(35, 45, 3, 13, shirt.shade);
      box(25, 59, 14, 5, "#476889");
      break;
    case 5:
      box(20, 54, 24, 11, ink);
      box(22, 55, 20, 8, shirt.shade);
      box(22, 55, 20, 2, white);
      box(26, 58, 1, 5, shirt.color);
      box(37, 58, 1, 5, shirt.color);
      break;
    case 6:
      box(17, 46, 5, 6, skin.color);
      box(42, 46, 5, 6, skin.shade);
      box(22, 44, 4, 6, shirt.shade);
      box(38, 44, 4, 6, shirt.shade);
      box(27, 45, 10, 3, skin.color);
      box(24, 54, 16, 1, white);
      break;
    case 7:
      box(24, 44, 5, 5, white);
      box(35, 44, 5, 5, white);
      box(31, 47, 2, 11, shirt.shade);
      for (const y of [49, 52, 55]) box(31, y, 2, 1, white);
      box(18, 50, 4, 2, shirt.shade);
      box(42, 50, 4, 2, shirt.shade);
      break;
    case 8:
      box(22, 45, 20, 13, shirt.shade);
      box(28, 44, 8, 10, white);
      box(31, 46, 2, 9, "#cf626b");
      box(25, 49, 3, 6, shirt.color);
      box(36, 49, 3, 6, shirt.color);
      box(25, 59, 6, 10, shirt.shade);
      box(33, 59, 6, 10, shirt.shade);
      break;
    case 9:
      box(16, 47, 8, 8, shirt.color);
      box(40, 47, 8, 8, shirt.shade);
      box(27, 45, 3, 4, white);
      box(30, 48, 3, 4, white);
      box(33, 45, 3, 4, shirt.shade);
      box(21, 53, 22, 4, "#d09266");
      box(22, 58, 20, 10, shirt.color);
      box(22, 65, 20, 3, shirt.shade);
      break;
    case 10:
      box(21, 45, 22, 17, shirt.color);
      box(25, 60, 6, 8, shirt.color);
      box(33, 60, 6, 8, shirt.shade);
      box(30, 45, 3, 15, shirt.shade);
      box(34, 47, 6, 4, white);
      box(35, 48, 4, 1, "#4c7fa0");
      break;
    case 11:
      box(17, 49, 5, 5, shirt.color);
      box(42, 49, 5, 5, shirt.shade);
      box(25, 58, 6, 10, shirt.color);
      box(33, 58, 6, 10, shirt.shade);
      for (const [x, y] of [[25, 48], [34, 47], [30, 52], [38, 54], [27, 60], [35, 63]]) {
        box(x, y, 3, 1, white);
        box(x + 1, y - 1, 1, 3, white);
      }
      break;
    case 12:
      box(17, 46, 5, 6, white);
      box(42, 46, 5, 6, "#dbe6eb");
      box(22, 45, 20, 13, shirt.shade);
      box(29, 45, 6, 5, white);
      box(30, 49, 4, 3, white);
      box(25, 54, 14, 2, shirt.color);
      break;
    case 13:
      box(17, 47, 5, 2, white);
      box(42, 47, 5, 2, white);
      box(28, 48, 8, 2, white);
      box(34, 50, 2, 2, white);
      box(31, 52, 4, 4, white);
      box(25, 59, 14, 4, shirt.shade);
      box(23, 61, 3, 2, white);
      box(38, 61, 3, 2, white);
      break;
    case 14:
      box(17, 44, 30, 12, shirt.shade);
      box(19, 45, 26, 15, shirt.color);
      box(23, 59, 18, 4, shirt.color);
      box(32, 46, 1, 14, shirt.shade);
      box(20, 53, 27, 2, "#f5edbd");
      break;
    case 15:
      box(17, 48, 5, 7, shirt.color);
      box(42, 48, 5, 7, shirt.shade);
      for (const y of [47, 51, 55]) {
        for (const x of [25, 30, 35]) box(x + y % 3, y, 3, 2, shirt.shade);
      }
      break;
    case 16:
      box(15, 48, 34, 9, shirt.shade);
      box(18, 45, 28, 11, shirt.color);
      box(20, 56, 24, 3, shirt.color);
      box(19, 51, 26, 2, white);
      for (const x of [23, 28, 34, 39]) box(x, 58, 2, 3, shirt.shade);
      break;
    case 17:
      box(22, 45, 20, 10, white);
      box(28, 45, 8, 3, shirt.shade);
      box(18, 56, 28, 11, shirt.shade);
      box(20, 57, 24, 8, shirt.color);
      for (const x of [24, 30, 36, 41]) box(x, 59, 2, 6, shirt.shade);
      break;
    case 18:
      box(17, 48, 6, 8, shirt.color);
      box(41, 48, 6, 8, shirt.shade);
      box(24, 44, 16, 4, shirt.shade);
      box(24, 50, 15, 6, "#273044");
      box(26, 49, 4, 5, "#f3bd76");
      box(31, 52, 7, 2, "#9cddc6");
      box(32, 50, 3, 2, "#eb91ac");
      break;
    case 19:
      box(17, 48, 6, 7, shirt.color);
      box(41, 48, 6, 7, shirt.shade);
      for (const y of [47, 51, 55]) box(21, y, 22, 1, shirt.shade);
      for (const x of [24, 29, 34, 39]) box(x, 46, 1, 12, "#f5eee085");
      box(24, 59, 16, 3, "#6983a0");
      break;
    case 20:
      for (const y of [47, 50, 53, 56]) box(22, y, 20, 1, white);
      box(28, 45, 8, 2, shirt.shade);
      box(18, 49, 4, 1, white);
      box(42, 49, 4, 1, white);
      break;
    case 21:
      box(17, 46, 6, 9, "#f3e8d7");
      box(41, 46, 6, 9, "#e1d5c8");
      box(31, 46, 2, 12, shirt.shade);
      box(24, 49, 4, 4, "#e8bb77");
      box(36, 53, 5, 2, white);
      box(21, 55, 22, 2, shirt.shade);
      break;
    case 22:
      box(22, 52, 20, 6, "#ed795f");
      for (const [x, y] of [[24, 50], [29, 47], [34, 50], [38, 48]]) box(x, y, 2, 6, "#faa96d");
      box(24, 54, 16, 2, "#ffe28c");
      break;
    case 23:
      box(21, 54, 22, 3, "#435770");
      box(24, 58, 7, 10, shirt.shade);
      box(33, 58, 7, 10, shirt.shade);
      box(24, 60, 5, 4, shirt.color);
      box(35, 61, 5, 4, shirt.color);
      box(30, 54, 4, 2, "#d3be95");
      break;
    case 24:
      box(23, 47, 6, 5, "#90d5c6");
      box(27, 50, 7, 5, "#a5a5e4");
      box(35, 47, 7, 6, "#f1a4c1");
      box(29, 54, 9, 4, "#f4d29d");
      box(31, 46, 2, 12, shirt.shade);
      break;
    case 25:
      box(17, 48, 6, 7, shirt.color);
      box(41, 48, 6, 7, shirt.shade);
      box(31, 45, 2, 12, shirt.shade);
      box(23, 49, 5, 4, "#addcca");
      box(35, 46, 5, 4, "#f1bc83");
      box(36, 53, 4, 3, "#e99bb6");
      box(25, 59, 14, 5, "#657b9e");
      break;
  }
}

function paintCostumeHair(box, style, hair) {
  // Leave each hairstyle visible at the edge of hats and hoods.
  const strands = [
    [[22, 24, 5, 2], [39, 24, 3, 3]],
    [[21, 24, 8, 2], [16, 32, 3, 11], [45, 31, 3, 12]],
    [[22, 23, 4, 3], [27, 24, 4, 2], [38, 23, 4, 3]],
    [[22, 24, 2, 2], [40, 24, 2, 2]],
    [[20, 25, 3, 3], [17, 32, 4, 7], [44, 32, 4, 7]],
    [[21, 24, 4, 3], [46, 32, 5, 10]],
    [[19, 22, 4, 4], [41, 22, 4, 4], [14, 12, 4, 3], [46, 12, 4, 3]],
    [[21, 23, 17, 3], [24, 26, 3, 1]],
    [[21, 24, 7, 3], [16, 34, 4, 4], [17, 39, 4, 4], [44, 33, 4, 5]],
    [[24, 23, 4, 3], [37, 23, 4, 3], [18, 34, 3, 11], [43, 34, 3, 11]],
    [[20, 24, 7, 2], [21, 26, 3, 2]],
    [[29, 23, 6, 3]],
    [[21, 23, 8, 3], [40, 25, 2, 2]],
    [[19, 22, 4, 5], [24, 23, 5, 3], [35, 23, 6, 3], [42, 22, 3, 5]],
    [[23, 24, 4, 2], [39, 24, 3, 2], [30, 6, 4, 3]],
    [[22, 23, 4, 3], [34, 23, 4, 3], [16, 32, 4, 10], [44, 34, 4, 11]],
  ];
  for (const [x, y, width, height] of strands[style]) {
    box(x, y, width, height, hair.color);
    if (width > 2) box(x, y, width - 1, 1, hair.shade);
  }
}

function paintHairDetails(box, style, hair, skin) {
  switch (style) {
    case 8:
      box(19, 15, 22, 8, hair.color);
      box(19, 21, 8, 4, hair.color);
      box(21, 17, 14, 2, hair.shade);
      box(37, 14, 6, 4, hair.shade);
      box(42, 21, 5, 6, hair.color);
      break;
    case 9:
      box(20, 18, 24, 5, hair.color);
      box(31, 14, 2, 7, skin);
      box(19, 37, 4, 2, "#f4b8b5");
      box(41, 37, 4, 2, "#f4b8b5");
      box(20, 40, 3, 6, hair.color);
      box(41, 40, 3, 6, hair.color);
      break;
    case 10:
      box(21, 14, 12, 3, hair.color);
      box(21, 17, 9, 7, hair.color);
      box(19, 23, 6, 4, hair.color);
      box(28, 18, 12, 2, hair.shade);
      box(38, 22, 2, 3, skin);
      break;
    case 11:
      box(30, 5, 6, 14, hair.color);
      box(27, 9, 12, 9, hair.color);
      box(32, 6, 3, 9, hair.shade);
      box(21, 20, 6, 5, skin);
      box(37, 20, 7, 5, skin);
      break;
    case 12:
      box(18, 13, 20, 6, hair.color);
      box(18, 19, 13, 5, hair.color);
      box(39, 17, 5, 9, skin);
      box(39, 18, 4, 2, hair.shade);
      box(39, 22, 3, 1, hair.shade);
      break;
    case 13:
      box(14, 12, 36, 11, hair.color);
      box(19, 8, 26, 16, hair.color);
      box(24, 5, 16, 4, hair.color);
      box(16, 14, 7, 3, hair.shade);
      box(25, 9, 8, 3, hair.shade);
      box(34, 14, 9, 3, hair.shade);
      box(45, 18, 4, 4, hair.shade);
      break;
    case 14:
      box(25, 5, 14, 8, hair.color);
      box(28, 3, 8, 5, hair.color);
      box(28, 6, 6, 2, hair.shade);
      box(26, 11, 12, 2, "#e884a9");
      break;
    case 15:
      for (const x of [20, 26, 33, 40]) {
        box(x, 13 + x % 3, 4, 10, hair.color);
        box(x + 1, 15 + x % 3, 2, 4, hair.shade);
      }
      box(18, 32, 2, 6, hair.shade);
      box(45, 36, 2, 7, hair.shade);
      break;
  }
}

function paintEyes(box, style, color) {
  const ink = "#232940";
  for (const x of [25, 35]) {
    if (style === 3 || (style === 4 && x === 35)) {
      box(x, 29, 4, 1, ink);
      box(x + 1, 30, 2, 1, ink);
      continue;
    }
    switch (style) {
      case 5:
        box(x + 1, 27, 2, 1, ink);
        box(x, 28, 1, 2, ink);
        box(x + 3, 28, 1, 2, ink);
        break;
      case 6:
        box(x, 28, 4, 2, "#fff5e6");
        box(x + 1, 28, 2, 2, color);
        box(x, 27, 4, 1, ink);
        break;
      case 7:
        box(x, 26, 5, 6, ink);
        box(x + 1, 28, 3, 4, color);
        box(x, 26, 2, 2, "#fff5e6");
        box(x + 3, 30, 1, 1, "#fff5e6");
        break;
      case 8:
        box(x, 27, 2, 2, "#cf496f");
        box(x + 3, 27, 2, 2, "#cf496f");
        box(x, 29, 5, 1, "#db6183");
        box(x + 1, 30, 3, 1, "#cf496f");
        box(x + 2, 31, 1, 1, "#cf496f");
        break;
      case 9:
        box(x - 1, 27, 6, 4, "#fff5e6");
        box(x + 2, 27, 3, 4, ink);
        box(x + 2, 29, 3, 2, color);
        break;
      case 10:
        box(x, 26, 4, 6, "#fff5e6");
        box(x + 2, 27, 2, 4, ink);
        box(x + 2, 29, 2, 2, color);
        box(x - 1, x === 25 ? 23 : 25, 5, 1, ink);
        break;
      default: {
        const height = style === 1 ? 6 : 4;
        box(x, 27, 4, height, "#fff5e6");
        box(x + 1, 27, 3, height, ink);
        box(x + 1, 29, 3, height - 2, color);
        if (style === 2) {
          box(x - 1, 26, 5, 1, ink);
          box(x - 1, 25, 1, 1, ink);
        }
      }
    }
  }
}

function paintScenery(box, background, scene, frame, alternate) {
  const cloud = (x, y, color) => {
    box(x + 3, y, 8, 2, color);
    box(x, y + 2, 16, 3, color);
    box(x + 2, y + 5, 12, 1, color);
  };
  const spark = (x, y, color) => {
    box(x - 1, y, 3, 1, color);
    box(x, y - 1, 1, 3, color);
  };

  switch (scene) {
    case 1: {
      const sun = alternate ? "#ffb673" : "#fff19c";
      box(0, 0, 64, 31, alternate ? "#8355a5" : "#78d9f2");
      box(0, 21, 64, 17, alternate ? "#eb8b87" : "#acecff");
      box(45, alternate ? 20 : 8, 11, 11, sun);
      cloud((frame + 8) % 72 - 8, 8, alternate ? "#f9bfbd" : "#f0fdff");
      box(0, 34, 64, 46, "#f7d08a");
      box(0, 31, 64, 23, alternate ? "#535ca4" : "#3093c3");
      box(0, 43, 64, 15 + frame % 4, alternate ? "#7776c8" : "#64cfda");
      box(0, 56 + frame % 4, 64, 2, "#fff0ce");
      for (const [x, y] of [[4, 45], [11, 39], [49, 41], [56, 50], [3, 65], [53, 70]]) {
        box(x + frame % 3, y, 5, 1, y < 60 ? "#c3f6f2" : "#deb071");
      }
      break;
    }
    case 2:
      box(0, 0, 64, 80, "#b4e9f4");
      cloud(6 + frame % 12, 7, "#fff7dc");
      cloud(44, 15, "#fff7dc");
      box(0, 31, 64, 49, "#9bd586");
      for (const x of [0, 7, 15, 43, 51, 58]) {
        box(x, 28 + x % 6, 8, 15, "#65ad77");
        box(x + 2, 25 + x % 6, 4, 4, "#84c785");
      }
      box(0, 55, 64, 25, "#80c786");
      for (const [x, y, color] of [[8, 49, "#fa9bad"], [4, 65, "#ffd966"], [14, 71, "#f5aeeb"], [49, 50, "#f9bd78"], [55, 65, "#e893db"], [60, 73, "#fff2a4"]]) {
        box(x, y, 1, 5, "#417f62");
        spark(x, y, color);
      }
      for (let index = 0; index < (alternate ? 5 : 1); index++) {
        const x = index % 2 === 0 ? 5 + (frame + index * 3) % 12 : 49 + (frame + index * 2) % 12;
        const y = 10 + 7 * index + frame % 3;
        box(x, y, 2, 2 + frame % 2, "#dc709d");
        box(x + 3, y, 2, 2 + frame % 2, "#e673a6");
        box(x + 2, y + 1, 1, 2, "#67456f");
      }
      break;
    case 3:
      box(0, 0, 64, 80, "#1c2857");
      box(0, 34, 64, 46, "#292c64");
      for (const [index, x] of [3, 10, 17, 49, 53, 60, 5, 55, 12, 58].entries()) {
        spark(x, 4 + index * 7, (index + frame) % 5 === 0 ? "#d9a8f9" : "#8ba1d8");
      }
      box(46, 10, 13, 10, "#eab189");
      box(49, 8, 7, 14, "#eab189");
      box(43, 15, 19, 2, "#fae4a7");
      box(0, 70, 64, 10, "#463b6c");
      box(0, 68, 64, 2, "#afa3ca");
      if (alternate) {
        for (const x of [5, 53]) {
          box(x, 41, 7, 18, "#6775a6");
          box(x + 2, 38, 3, 5, "#a1b2d8");
          box(x + 2, 59, 3, 7 + frame % 5, "#ffad68");
          box(x + 3, 61, 1, 5 + frame % 4, "#fff2a7");
        }
      }
      break;
    case 4: {
      const neon = alternate ? "#6affe1" : "#ff89c5";
      const screen = alternate ? "#d996ff" : "#81ebeb";
      box(0, 0, 64, 80, "#262046");
      for (const x of [3, 17, 46]) {
        box(x, 21, 13, 33, "#463767");
        box(x + 1, 23, 11, 2, neon);
        box(x + 2, 28, 9, 10, "#1a2247");
        box(x + 3, 29, 7, 7, screen);
        box(x + 3 + frame % 4, 33, 2, 2, "#fff4be");
        box(x + 2, 41, 9, 2, neon);
      }
      box(0, 54, 64, 26, "#4a355e");
      for (const y of [59, 68, 77]) {
        box(0, y, 64, 1, "#85578c");
        for (let x = (y % 2) * 5; x < 64; x += 12) box(x, y, 1, 9, "#85578c");
      }
      break;
    }
    case 5:
      box(0, 0, 64, 80, alternate ? "#95a9cf" : "#85c9e9");
      cloud((frame + 44) % 70 - 6, 12, "#f5f6fd");
      for (const [x, y, color] of [[11, 20, "#6b9ab4"], [47, 17, "#718ab2"], [29, 26, "#8faabd"]]) {
        for (let row = 0; row < 40; row += 2) {
          box(x - row / 2, y + row, 2 + row, 2, row < 12 ? "#ecf0f9" : color);
        }
      }
      box(0, 56, 64, 24, alternate ? "#e7eff9" : "#89bfb1");
      box(0, 62, 64, 2, alternate ? "#c4d8ec" : "#77ab9e");
      if (alternate) {
        for (let i = 0; i < 13; i++) box((i * 17 + frame) % 64, (i * 29 + frame * 2) % 65, 1, 2, "#fff");
      }
      break;
    case 6:
      box(0, 0, 64, 80, "#27365e");
      box(48, 7, 8, 8, "#f9e5a5");
      box(52, 6, 5, 6, "#27365e");
      for (const [x, y] of [[0, 32], [10, 20], [21, 37], [33, 24], [45, 31], [55, 23]]) {
        box(x, y, 9, 57 - y, (x % 2) ? "#455076" : "#394669");
        for (let floor = y + 4; floor < 54; floor += 5) {
          box(x + 2, floor, 2, 2, alternate || (floor + frame) % 7 === 0 ? "#ffd481" : "#536184");
          box(x + 6, floor, 1, 2, alternate ? "#ffbb86" : "#536184");
        }
      }
      box(0, 57, 64, 23, "#4b516a");
      box(0, 61, 64, 2, "#8a8ca0");
      for (let x = 0; x < 64; x += 12) box(x, 65, 6, 1, "#dac19c");
      break;
    case 7:
      box(0, 0, 64, 80, "#427a79");
      box(0, 45, 64, 35, "#529079");
      for (const [x, top] of [[3, 8], [14, 14], [47, 13], [57, 5]]) {
        box(x, top, 5, 48, "#315f60");
        box(x - 5, top + 5, 16, 13, "#2a6866");
        box(x - 3, top + 2, 12, 8, "#368477");
        box(x + 1, top + 8, 1, 41, "#568c7a");
      }
      box(0, 58, 64, 22, "#6ba78b");
      box(4, 62, 9, 3, "#ea8e94");
      box(8, 65, 2, 4, "#fee5bd");
      box(52, 56, 7, 3, "#e5ac8e");
      box(55, 59, 1, 4, "#fee5bd");
      for (let i = 0; i < (alternate ? 10 : 3); i++) {
        const x = i % 2 ? 47 + (frame + i * 4) % 15 : 4 + (frame + i * 5) % 12;
        spark(x, 11 + (i * 13 + frame) % 55, "#f5e991");
      }
      break;
    case 8:
      box(0, 0, 64, 80, "#245d8d");
      box(0, 0, 64, 5, "#7bd3e1");
      box(0, 5, 64, 3, "#55afca");
      box(0, 64, 64, 16, "#c5a88b");
      for (let i = 0; i < 8; i++) {
        const x = i % 2 ? 50 + i : 3 + i * 2;
        const y = 61 - (i * 8 + frame) % 55;
        box(x, y, 2, 2, "#79c9de");
        box(x, 60, 2, 11 + i % 4, "#50a695");
      }
      for (let i = 0; i < (alternate ? 7 : 3); i++) {
        const x = (i * 17 + frame) % 72 - 8;
        const y = 12 + i * 6;
        const color = i % 2 ? "#eaa596" : "#f0cc78";
        box(x, y, 6, 3, color);
        box(x - 2, y - 1, 2, 5, color);
        box(x + 4, y, 1, 1, "#2b516f");
      }
      break;
    case 9:
      box(0, 0, 64, 80, "#facc94");
      box(48, 7, 11, 11, "#fff1ae");
      box(0, 31, 64, 49, "#d59b68");
      box(0, 38, 24, 10, "#d59b68");
      box(0, 27, 14, 12, "#deab79");
      box(37, 34, 27, 12, "#e6ac70");
      box(0, 48, 64, 32, "#edbd7f");
      for (const [x, y] of [[4, 57], [15, 46], [49, 56], [10, 65], [51, 72]]) {
        box(x + frame % 5, y, 4, 1, "#fff0b6");
      }
      if (alternate) {
        box(2, 54, 18, 5, "#75bdad");
        box(4, 58, 14, 2, "#93d9c5");
        box(13, 39, 2, 15, "#8a634f");
        box(8, 39, 14, 3, "#609b74");
        box(12, 36, 5, 4, "#73ab78");
      }
      break;
    case 10:
      box(0, 0, 64, 80, "#b6bdec");
      cloud((frame + 51) % 72 - 10, 11, "#f7e8ed");
      box(0, 48, 64, 32, "#78a798");
      box(7, 34, 50, 27, "#9692b2");
      for (const x of [8, 47]) {
        box(x, 24, 9, 35, "#b0a8c7");
        for (const notch of [0, 4, 8]) box(x + notch, 21, 2, 5, "#b0a8c7");
        box(x + 3, 37, 3, 8, "#5f5c87");
        if (alternate) {
          box(x + 4, 10, 1, 12, "#62567e");
          box(x + 5, 10 + frame % 2, 8, 4, x < 20 ? "#d185ae" : "#dfaa6d");
        }
      }
      box(27, 45, 10, 15, "#595776");
      box(0, 61, 64, 19, "#8db3a1");
      box(23, 61, 18, 19, "#b9afaa");
      break;
    case 11:
      box(0, 0, 64, 80, "#303957");
      cloud(4, 8, "#485773");
      cloud(42, 14, "#485773");
      for (const [x, y] of [[0, 31], [10, 38], [44, 34], [55, 28]]) {
        box(x, y, 8, 20, "#394968");
        box(x + 2, y + 6, 4, 3, "#b59b93");
      }
      box(0, 47, 64, 33, "#49536c");
      box(0, 52, 64, 2, "#6d8192");
      box(4, 63, 16, 2, "#8b92a8");
      box(47, 70, 16, 2, "#7989aa");
      for (let i = 0; i < (alternate ? 20 : 10); i++) {
        const x = (i * 13 + frame) % 64;
        const y = (i * 17 + frame * 3) % 79;
        box(x, y, 1, alternate ? 4 : 2, "#a1bac99e");
      }
      break;
    case 12:
      box(0, 0, 64, 80, "#222f60");
      for (let x = 0; x < 64; x += 2) {
        const y = 12 + Math.round(Math.sin((frame % 84) / 7 + x / 9) * 5);
        box(x, y, 2, 10 + x % 5, alternate ? "#b879ca" : "#4b9fa4");
        box(x, y + 9, 2, 2, alternate ? "#dda6e9" : "#8bdfbc");
      }
      for (const [x, y] of [[5, 7], [16, 29], [56, 5], [51, 30]]) spark(x, y, "#eff4f9");
      box(0, 55, 64, 25, "#c7dbe7");
      box(0, 51, 14, 6, "#c7dbe7");
      box(51, 48, 13, 10, "#c7dbe7");
      box(0, 65, 64, 2, "#a5bed8");
      break;
    case 13:
      box(0, 0, 64, 80, "#543a68");
      box(0, 52, 64, 28, "#9e695d");
      for (const x of [0, 11, 42, 53]) {
        box(x, 41, 10, 15, "#d88e6d");
        box(x, 39, 10, 4, "#ae5570");
        box(x + 2, 45, 5, 4, "#f6ba78");
      }
      for (let i = 0; i < (alternate ? 10 : 5); i++) {
        const x = (i * 11 + 2) % 62;
        const y = 5 + (38 + i * 9 - frame % 38) % 38;
        box(x, y, 4, 5, "#e49a64");
        box(x + 1, y + 1, 2, 3, "#ffdd82");
      }
      break;
    case 14:
      box(0, 0, 64, 80, "#61415c");
      cloud((frame + 42) % 76 - 7, 8, "#947286");
      for (let row = 0; row < 35; row++) {
        box(37 - row, 22 + row, 20 + row, 1, row % 4 < 2 ? "#4b364a" : "#564051");
      }
      box(46, 23, 8, 3, "#ffbe71");
      box(49, 26, 7, 7, "#d97a63");
      box(50, 33, 10, 22, "#ba5d59");
      box(0, 56, 64, 24, "#79605a");
      box(0, 62 + frame % 3, 64, 3, alternate ? "#f5905d" : "#aa665a");
      if (alternate) {
        for (let i = 0; i < 8; i++) spark(4 + (i * 7 + frame) % 55, 28 + (i * 11 + frame) % 35, "#ffc47c");
      }
      break;
    default:
      box(0, 0, 64, 80, background.color);
      for (let x = 0; x < 64; x += 8) box(x, 0, 1, 80, `${background.shade}6b`);
      for (let y = 0; y < 80; y += 8) box(0, y, 64, 1, `${background.shade}6b`);
      spark(11, 21, "#fff5e6");
      spark(54, 39, "#fff5e6");
      box(50, 14, 2, 2, "#fff5e6");
      break;
  }
  box(13, 73, 38, 3, "#182c4933");
  box(9, 74, 46, 1, "#182c4933");
}

const guardianCostumes = [
  {
    fabric: "#a63f57",
    body: [
      [15, 43, 34, 19, "#dd6470"], [30, 43, 4, 20, "#50354c"],
      [20, 47, 5, 5, "#50354c"], [39, 47, 5, 5, "#50354c"], [23, 56, 4, 4, "#50354c"], [37, 56, 4, 4, "#50354c"],
    ],
    head: [[18, 15, 28, 9, "#d45a69"], [22, 9, 2, 8, "#50354c"], [40, 9, 2, 8, "#50354c"], [20, 8, 5, 4, "#a63f57"], [39, 8, 5, 4, "#a63f57"]],
  },
  {
    fabric: "#30344d",
    body: [[18, 44, 28, 18, "#353955"], [27, 45, 10, 14, "#5d597e"], [10, 54, 7, 13, "#30344d"], [8, 51, 5, 5, "#30344d"], [17, 59, 8, 5, "#30344d"], [30, 45, 4, 4, "#e8ba78"]],
    head: [[17, 15, 30, 10, "#30344d"], [17, 8, 8, 12, "#30344d"], [39, 8, 8, 12, "#30344d"], [19, 11, 4, 6, "#a77c9e"], [41, 11, 4, 6, "#a77c9e"], [18, 30, 6, 1, "#695b83"], [40, 30, 6, 1, "#695b83"]],
  },
  {
    fabric: "#714b4e",
    body: [[16, 43, 32, 14, "#a66d58"], [20, 47, 24, 15, "#825750"], [26, 47, 12, 14, "#d1a073"], [22, 55, 20, 3, "#593f47"], [29, 54, 6, 5, "#e8bf77"]],
    head: [[18, 14, 28, 10, "#89594d"], [12, 9, 5, 10, "#f0d9ad"], [47, 9, 5, 10, "#f0d9ad"], [14, 16, 8, 5, "#d6ad83"], [42, 16, 8, 5, "#d6ad83"], [25, 19, 14, 3, "#deb383"]],
  },
  {
    fabric: "#3d6459",
    body: [[17, 44, 30, 13, "#547c67"], [20, 54, 24, 12, "#426858"], [22, 54, 20, 3, "#d5ad6e"], [29, 46, 6, 7, "#a7cea5"], [28, 61, 8, 2, "#8cba9b"]],
    head: [[17, 16, 30, 8, "#4d785e"], [14, 11, 6, 16, "#729c72"], [43, 8, 6, 17, "#729c72"], [23, 8, 5, 11, "#91b47a"], [34, 12, 5, 7, "#8ab768"], [16, 11, 2, 2, "#efd78e"], [46, 9, 2, 2, "#efd78e"]],
  },
  {
    fabric: "#775b84",
    body: [[9, 44, 46, 8, "#976d91"], [13, 51, 10, 13, "#775b84"], [41, 51, 10, 13, "#775b84"], [23, 46, 18, 16, "#d7ad9c"], [28, 49, 8, 2, "#f6d5b2"], [28, 56, 8, 2, "#f6d5b2"]],
    head: [[17, 13, 30, 12, "#815d83"], [17, 9, 7, 8, "#815d83"], [40, 9, 7, 8, "#815d83"], [24, 20, 16, 4, "#f0c59f"], [30, 23, 4, 3, "#d89571"]],
  },
  {
    fabric: "#4a5d7e",
    body: [[17, 43, 30, 19, "#667c9d"], [24, 44, 16, 17, "#98aac4"], [11, 52, 9, 12, "#4a5d7e"], [8, 60, 9, 5, "#b0bad0"], [29, 48, 7, 7, "#e8d9ae"], [32, 47, 5, 5, "#98aac4"]],
    head: [[18, 14, 28, 10, "#667c9d"], [16, 7, 8, 14, "#4a5d7e"], [40, 7, 8, 14, "#4a5d7e"], [19, 11, 3, 5, "#b0bad0"], [42, 11, 3, 5, "#b0bad0"], [30, 16, 4, 4, "#e8d9ae"]],
  },
  {
    fabric: "#326d70",
    body: [[14, 43, 36, 14, "#518e8a"], [18, 48, 28, 16, "#397975"], [22, 51, 20, 2, "#7fc3a7"], [22, 56, 20, 2, "#7fc3a7"], [29, 46, 6, 5, "#d8bf7d"]],
    head: [[17, 15, 30, 9, "#518e8a"], [23, 11, 18, 7, "#75b4a2"], [19, 7, 3, 12, "#345c68"], [42, 7, 3, 12, "#345c68"], [28, 16, 8, 4, "#dfc782"]],
  },
  {
    fabric: "#826452",
    body: [[17, 44, 30, 17, "#a47e61"], [24, 45, 16, 14, "#ead4aa"], [18, 50, 5, 3, "#d5bd8e"], [41, 50, 5, 3, "#d5bd8e"], [26, 59, 12, 3, "#749b81"]],
    head: [[18, 15, 28, 9, "#a47e61"], [16, 9, 5, 9, "#785449"], [42, 9, 5, 9, "#785449"], [18, 6, 3, 5, "#785449"], [42, 6, 3, 5, "#785449"], [15, 7, 4, 3, "#785449"], [45, 7, 4, 3, "#785449"], [28, 18, 8, 3, "#e1cc9e"]],
  },
  {
    fabric: "#414466",
    body: [[10, 45, 44, 10, "#535478"], [12, 50, 9, 15, "#414466"], [43, 50, 9, 15, "#414466"], [23, 44, 18, 18, "#726791"], [25, 50, 14, 3, "#9585a6"]],
    head: [[18, 14, 28, 11, "#535478"], [21, 10, 24, 7, "#414466"], [26, 7, 9, 6, "#414466"], [31, 22, 11, 3, "#c5a4a2"], [36, 24, 8, 2, "#a98b9a"]],
  },
  {
    fabric: "#aa5268",
    body: [[8, 42, 48, 8, "#d36b69"], [11, 46, 13, 13, "#ea9368"], [40, 46, 13, 13, "#ea9368"], [14, 53, 9, 8, "#f4b67a"], [41, 53, 9, 8, "#f4b67a"], [24, 45, 16, 16, "#d8736c"], [28, 50, 8, 8, "#ffd28a"]],
    head: [[17, 15, 30, 10, "#d36b69"], [22, 12, 23, 6, "#ea9368"], [27, 7, 8, 11, "#f2ab6f"], [32, 5, 5, 10, "#f6c180"], [29, 18, 8, 4, "#ffd28a"]],
  },
];

function paintGuardianLayer(box, rectangles) {
  for (const [x, y, width, height, color] of rectangles) box(x, y, width, height, color);
}

const costumeFabrics = [
  null, "#47a568", "#503b77", "#d7e1ee", "#739cae", "#bf9648", "#d1c8ed",
  "#966f60", "#974755", "#a33f59", "#cdb5ed", "#ddadba", "#cd7549", "#bea87f", "#718da6",
  "#4288b5", "#582e4e", "#bca88f", "#38405a", "#478e91", "#5b6ba5", "#79b4a9", "#285488",
  "#7c3d58", "#696849", "#427c91", "#d7799e", "#446f75", "#647ba4", "#b65c43", "#4c4f86", "#307e8b",
];

function paintCostumeBody(box, costume) {
  const ink = "#232940";
  const guardian = guardianCostumes[costume - costumeFabrics.length];
  const cloth = guardian?.fabric ?? costumeFabrics[costume];
  const accent = "#efc47e";
  // Each costume supplies its own sleeves, lower half and footwear.
  box(20, 43, 24, 18, ink);
  box(23, 43, 18, 19, cloth);
  box(16, 46, 7, 7, cloth);
  box(41, 46, 7, 7, cloth);
  if (costume !== 6 && costume !== 19) {
    box(23, 59, 18, 11, ink);
    box(25, 60, 6, 9, cloth);
    box(33, 60, 6, 9, cloth);
    box(21, 68, 11, 5, ink);
    box(32, 68, 11, 5, ink);
    box(22, 69, 8, 2, cloth);
    box(34, 69, 8, 2, cloth);
  }
  if (guardian) {
    paintGuardianLayer(box, guardian.body);
    return;
  }
  switch (costume) {
    case 1:
      box(11, 55, 10, 8, ink);
      box(7, 51, 6, 8, ink);
      box(8, 54, 15, 6, "#359364");
      box(18, 43, 28, 18, "#47a568");
      box(24, 46, 16, 13, "#f0d881");
      box(25, 61, 6, 8, "#31835b");
      box(33, 61, 6, 8, "#31835b");
      box(22, 69, 8, 2, "#a5d178");
      box(34, 69, 8, 2, "#a5d178");
      box(11, 53, 3, 3, "#e78c67");
      break;
    case 2:
      box(19, 43, 26, 13, "#48366b");
      box(17, 55, 30, 12, ink);
      box(19, 55, 26, 10, "#503b77");
      box(22, 52, 20, 4, accent);
      box(29, 51, 6, 5, "#f6c675");
      box(31, 52, 2, 3, "#423451");
      break;
    case 3:
      box(16, 42, 32, 21, "#d7e1ee");
      box(24, 43, 16, 17, "#f7f4e7");
      box(26, 48, 12, 7, "#58768b");
      box(28, 50, 2, 2, "#ee855e");
      box(32, 50, 4, 2, "#95ddc9");
      box(25, 62, 14, 7, "#d7e1ee");
      box(23, 69, 19, 2, "#576783");
      break;
    case 4:
      box(17, 44, 30, 14, "#739cae");
      box(22, 42, 20, 20, "#9fb9c3");
      box(26, 47, 12, 10, "#425871");
      box(28, 49, 8, 3, "#88e8c3");
      box(28, 54, 5, 1, "#ecac72");
      box(25, 62, 14, 8, "#627e98");
      break;
    case 5:
      box(11, 42, 42, 13, "#c6def0");
      box(14, 42, 36, 9, "#ebeff9");
      box(19, 43, 26, 21, "#ffd264");
      box(19, 48, 26, 4, ink);
      box(19, 56, 26, 4, ink);
      break;
    case 6:
      box(17, 44, 30, 17, "#eee9fa");
      box(15, 55, 34, 14, "#d1c8ed");
      box(18, 54, 28, 13, "#eee9fa");
      for (const x of [18, 29, 41]) box(x, 68, 6, 2, "#d1c8ed");
      break;
    case 7:
      box(18, 43, 28, 19, "#bc916e");
      box(25, 47, 14, 13, "#f4daba");
      box(21, 43, 22, 3, accent);
      box(30, 45, 4, 5, "#f1bb6b");
      box(24, 62, 16, 6, "#966f60");
      break;
    case 8:
      box(18, 44, 28, 16, "#974755");
      box(25, 43, 14, 14, "#fff0d6");
      box(21, 54, 22, 4, "#3e324b");
      box(29, 53, 6, 6, "#e9b85f");
      box(31, 55, 2, 2, "#3e324b");
      break;
    case 9:
      for (const x of [7, 43]) {
        box(x, 44, 14, 12, "#752e52");
        box(x + 2, 42, 10, 11, "#b95370");
        box(x + 4, 48, 5, 8, "#df846e");
      }
      box(18, 45, 28, 17, "#a33f59");
      box(24, 47, 16, 14, "#efaa7e");
      box(25, 63, 14, 6, "#8a3755");
      break;
    case 10:
      box(19, 44, 26, 16, "#e7d9f8");
      box(21, 55, 22, 7, "#cdb5ed");
      for (const [i, color] of ["#de84a8", "#edc176", "#91d3bf", "#95b8eb"].entries()) {
        box(25 + i * 4, 48, 3, 7, color);
      }
      break;
    case 11:
      box(19, 43, 26, 20, "#ddadba");
      box(23, 45, 18, 15, "#fff1e3");
      box(22, 65, 9, 6, "#ddadba");
      box(33, 65, 9, 6, "#ddadba");
      break;
    case 12:
      box(5, 54, 14, 6, "#b9593d");
      box(6, 51, 8, 8, "#fff0db");
      box(12, 55, 10, 8, "#d17a4d");
      box(18, 45, 28, 17, "#cd7549");
      box(25, 44, 14, 15, "#ffe7c9");
      box(23, 64, 18, 5, "#543448");
      break;
    case 13:
      box(20, 43, 24, 20, "#e9ca9b");
      box(23, 47, 18, 13, "#f6e1b8");
      box(26, 63, 12, 6, "#bea87f");
      for (const x of [28, 34]) box(x, 49, 2, 9, "#d2ac7d");
      break;
    case 14:
      box(17, 44, 30, 9, "#718da6");
      box(21, 46, 22, 17, "#9daec0");
      box(26, 49, 12, 10, "#535f87");
      box(31, 50, 2, 8, "#e6c480");
      box(28, 52, 8, 2, "#e6c480");
      box(24, 64, 16, 6, "#6a7f9a");
      break;
    case 15:
      box(12, 45, 40, 18, "#a94b70");
      box(10, 62, 14, 7, "#a94b70");
      box(40, 62, 14, 7, "#a94b70");
      box(21, 44, 22, 19, "#4288b5");
      box(28, 49, 8, 2, "#ffe288");
      box(31, 47, 2, 8, "#ffe288");
      box(23, 59, 18, 3, accent);
      break;
    case 16:
      box(14, 48, 36, 19, "#582e4e");
      box(19, 45, 26, 17, "#362e4b");
      box(25, 43, 14, 9, "#d2718a");
      box(28, 47, 8, 9, "#f8e7cf");
      box(30, 49, 4, 3, "#ae516e");
      break;
    case 17:
      box(18, 44, 28, 19, "#bca88f");
      box(24, 63, 16, 7, "#d2bca0");
      for (const y of [44, 49, 54, 59]) box(18 + y % 3, y, 26, 3, "#f0e0bd");
      box(20, 50, 3, 13, "#d9c6a7");
      break;
    case 18:
      box(18, 44, 28, 20, "#38405a");
      box(24, 63, 16, 7, "#38405a");
      box(31, 45, 2, 16, "#f2e8d8");
      for (const y of [47, 51, 55]) box(25, y, 14, 2, "#f2e8d8");
      for (const x of [27, 35]) box(x, 62, 2, 8, "#f2e8d8");
      break;
    case 19:
      box(21, 47, 22, 7, "#d78bb9");
      box(26, 54, 12, 6, "#8fbbbb");
      box(20, 59, 24, 14, "#478e91");
      box(25, 59, 15, 8, "#6dc9b0");
      box(37, 66, 11, 5, "#91dbbf");
      box(44, 62, 6, 5, "#91dbbf");
      box(19, 70, 26, 3, "#478e91");
      break;
    case 20:
      box(16, 44, 32, 18, "#4b538d");
      box(19, 50, 26, 18, "#5b6ba5");
      box(19, 55, 26, 2, accent);
      for (const [x, y] of [[24, 48], [36, 61], [28, 64]]) {
        box(x - 1, y, 3, 1, "#f4d48e");
        box(x, y - 1, 1, 3, "#f4d48e");
      }
      break;
    case 21:
      box(19, 44, 26, 18, "#79b4a9");
      box(22, 45, 20, 15, "#dff2dd");
      box(15, 43, 33, 4, "#edf4d4");
      box(9, 46, 17, 4, "#edf4d4");
      box(11, 50, 11, 3, "#99c8bb");
      box(22, 57, 20, 4, accent);
      break;
    case 22:
      box(17, 44, 30, 19, "#285488");
      box(22, 46, 20, 15, "#4b85b0");
      box(29, 43, 6, 14, "#c5efeb");
      box(21, 54, 22, 4, "#66bdce");
      box(24, 60, 16, 8, "#375e9b");
      break;
    case 23:
      box(18, 43, 28, 20, "#7c3d58");
      box(21, 46, 22, 14, "#b85358");
      box(18, 45, 7, 6, "#e59160");
      box(39, 45, 7, 6, "#e59160");
      box(31, 47, 3, 9, "#ffcf82");
      box(28, 51, 9, 3, "#ffcf82");
      box(22, 57, 20, 3, accent);
      break;
    case 24:
      box(16, 44, 32, 18, "#696849");
      box(18, 44, 9, 8, "#aaa276");
      box(37, 44, 9, 8, "#aaa276");
      box(24, 47, 16, 16, "#8b865f");
      box(29, 49, 6, 8, "#d9c173");
      box(31, 51, 2, 4, "#54746a");
      box(25, 63, 14, 6, "#544f42");
      break;
    case 25:
      box(9, 50, 6, 14, "#305973");
      box(13, 58, 10, 6, "#305973");
      box(10, 52, 4, 3, "#f8d77b");
      box(11, 58, 4, 3, "#f8d77b");
      box(19, 44, 26, 18, "#427c91");
      box(24, 48, 16, 12, "#a3e6e2");
      box(31, 49, 4, 8, "#ffe38d");
      box(29, 52, 8, 3, "#ffe38d");
      break;
    case 26:
      box(19, 43, 26, 20, "#d7799e");
      box(24, 47, 16, 13, "#f6b7c1");
      box(16, 49, 6, 8, "#b65f94");
      box(42, 49, 6, 8, "#b65f94");
      box(24, 63, 16, 5, "#c472a4");
      break;
    case 27:
      box(8, 43, 48, 12, "#71a293");
      box(11, 49, 13, 13, "#86b7ab");
      box(40, 49, 13, 13, "#86b7ab");
      for (const x of [12, 44]) {
        box(x, 46, 8, 5, "#d5d69d");
        box(x + 3, 54, 6, 4, "#a0c3b0");
      }
      box(22, 44, 20, 18, "#446f75");
      box(27, 49, 10, 8, "#c7debb");
      break;
    case 28:
      box(15, 46, 34, 15, "#647ba4");
      box(19, 43, 26, 19, "#93b6d9");
      box(24, 47, 16, 14, "#e2f2ef");
      box(29, 49, 6, 9, "#a8c8ea");
      box(21, 64, 10, 6, "#7095b9");
      box(33, 64, 10, 6, "#7095b9");
      break;
    case 29:
      box(11, 45, 19, 7, "#d9844d");
      box(8, 50, 15, 5, "#b65c43");
      box(23, 43, 22, 19, "#e99d6b");
      box(16, 45, 30, 5, "#f7d9a9");
      box(33, 45, 7, 13, "#e7c18e");
      box(23, 58, 18, 4, "#477d7c");
      break;
    case 30:
      box(18, 43, 28, 19, "#d9a653");
      box(22, 45, 20, 15, "#f8d586");
      box(27, 48, 10, 10, "#fff0bb");
      box(31, 48, 2, 10, "#79a2c6");
      box(27, 52, 10, 2, "#79a2c6");
      box(11, 50, 5, 9, "#4c4f86");
      box(13, 57, 10, 5, "#4c4f86");
      break;
    case 31:
      box(18, 43, 28, 14, "#4aaeb0");
      box(15, 55, 34, 11, "#286675");
      box(19, 54, 26, 10, "#338f9c");
      box(18, 64, 29, 3, "#91d2c9");
      box(24, 44, 5, 8, "#e0efe3");
      box(29, 49, 5, 4, "#e0efe3");
      box(23, 54, 20, 3, "#e59a8b");
      break;
  }
}

function paintCostumeHead(box, costume) {
  const guardian = guardianCostumes[costume - costumeFabrics.length];
  if (guardian) {
    paintGuardianLayer(box, guardian.head);
    return;
  }
  const ink = "#232940";
  switch (costume) {
    case 1:
      box(15, 15, 34, 10, ink);
      box(19, 8, 26, 9, ink);
      box(17, 16, 30, 7, "#52ac71");
      box(21, 10, 22, 8, "#52ac71");
      box(25, 5, 5, 5, "#e58c67");
      box(33, 5, 5, 5, "#e58c67");
      box(36, 14, 5, 4, "#fff5ce");
      box(38, 15, 2, 3, ink);
      box(17, 21, 4, 15, "#31835b");
      box(43, 21, 4, 15, "#31835b");
      for (const x of [22, 28, 34, 40]) box(x, 22, 2, 3, "#fff5ce");
      break;
    case 2:
      box(12, 22, 40, 4, ink);
      box(19, 17, 26, 6, "#57417a");
      box(23, 11, 17, 7, "#4d376d");
      box(26, 6, 10, 6, "#4d376d");
      box(29, 3, 10, 4, "#4d376d");
      box(21, 18, 24, 4, "#b676c1");
      box(31, 17, 6, 6, "#ffcf74");
      box(33, 19, 2, 2, "#55406d");
      break;
    case 3:
      box(15, 13, 5, 25, "#b9cbdc");
      box(44, 13, 5, 25, "#b9cbdc");
      box(19, 8, 26, 9, "#ebedf2");
      box(18, 36, 28, 5, "#ebedf2");
      box(21, 16, 22, 2, "#9bd7df");
      box(20, 20, 2, 13, "#b9edf1");
      box(43, 21, 2, 13, "#b9edf1");
      box(19, 39, 26, 3, "#82a6ba");
      break;
    case 4:
      box(18, 12, 28, 12, "#8fb8c5");
      box(16, 17, 5, 21, "#5e889e");
      box(43, 17, 5, 21, "#5e889e");
      box(30, 6, 3, 7, "#627e98");
      box(28, 4, 7, 4, "#ee9177");
      box(23, 16, 7, 2, "#def1e8");
      break;
    case 5:
      box(19, 14, 26, 10, "#f5bd53");
      box(19, 11, 3, 6, ink);
      box(42, 11, 3, 6, ink);
      box(16, 8, 7, 5, ink);
      box(41, 8, 7, 5, ink);
      box(19, 19, 26, 2, "#5d4a4c");
      break;
    case 6:
      box(15, 16, 6, 24, "#d1c8ed");
      box(43, 16, 6, 24, "#d1c8ed");
      box(19, 11, 26, 11, "#eee9fa");
      box(22, 8, 20, 5, "#eee9fa");
      box(19, 36, 5, 8, "#eee9fa");
      box(40, 36, 5, 8, "#eee9fa");
      break;
    case 7:
      box(17, 9, 7, 13, "#bc916e");
      box(40, 9, 7, 13, "#bc916e");
      box(19, 13, 4, 6, "#edaaac");
      box(41, 13, 4, 6, "#edaaac");
      box(21, 22, 22, 3, "#bc916e");
      box(19, 33, 5, 1, "#966f60");
      box(40, 33, 5, 1, "#966f60");
      break;
    case 8:
      box(14, 19, 36, 8, "#373246");
      box(19, 12, 26, 11, "#373246");
      box(22, 10, 20, 6, "#373246");
      box(18, 22, 28, 2, "#e2a85f");
      box(29, 15, 6, 5, "#fff0d6");
      box(31, 19, 2, 2, "#fff0d6");
      break;
    case 9:
      box(15, 15, 34, 10, "#a33f59");
      box(19, 10, 26, 7, "#bc5267");
      box(18, 5, 5, 10, "#f1b98a");
      box(41, 5, 5, 10, "#f1b98a");
      box(16, 22, 5, 13, "#a33f59");
      box(43, 22, 5, 13, "#a33f59");
      box(23, 20, 6, 3, "#ffd282");
      box(35, 20, 6, 3, "#ffd282");
      break;
    case 10:
      box(17, 15, 30, 9, "#ece0f6");
      box(29, 5, 7, 12, "#e5aa70");
      box(31, 2, 3, 7, "#ffe0a0");
      box(16, 9, 6, 9, "#d997b7");
      box(42, 9, 6, 9, "#d997b7");
      box(40, 19, 7, 14, "#ae8fdd");
      box(43, 28, 4, 12, "#8dbde5");
      break;
    case 11:
      box(17, 17, 30, 8, "#e3b5c1");
      box(19, 3, 8, 15, "#e3b5c1");
      box(36, 3, 8, 15, "#e3b5c1");
      box(21, 4, 4, 12, "#f6d1cd");
      box(38, 4, 4, 12, "#f6d1cd");
      box(17, 22, 4, 10, "#e3b5c1");
      box(43, 22, 4, 10, "#e3b5c1");
      break;
    case 12:
      box(17, 15, 30, 10, "#ce7449");
      box(17, 7, 7, 14, "#b9593d");
      box(40, 7, 7, 14, "#b9593d");
      box(19, 11, 3, 6, "#ffddba");
      box(42, 11, 3, 6, "#ffddba");
      box(16, 26, 7, 7, "#fff0db");
      box(41, 26, 7, 7, "#fff0db");
      break;
    case 13:
      box(13, 15, 38, 8, "#ac4a68");
      box(16, 11, 32, 8, "#d76576");
      box(21, 7, 22, 7, "#d76576");
      box(22, 10, 5, 4, "#ffedce");
      box(35, 8, 4, 4, "#ffedce");
      box(43, 14, 4, 4, "#ffedce");
      break;
    case 14:
      box(17, 13, 30, 10, "#9eafc3");
      box(21, 9, 22, 5, "#bfcbd7");
      box(17, 22, 5, 16, "#647c99");
      box(42, 22, 5, 16, "#647c99");
      box(19, 24, 26, 2, "#a1b2c6");
      box(18, 37, 28, 3, "#8296b0");
      box(30, 7, 4, 7, "#d58183");
      break;
    case 15:
      box(21, 26, 10, 6, "#9d456e");
      box(33, 26, 10, 6, "#9d456e");
      box(30, 28, 4, 2, "#9d456e");
      box(25, 27, 4, 3, "#fff5df");
      box(35, 27, 4, 3, "#fff5df");
      break;
    case 16:
      box(16, 37, 8, 10, "#79395d");
      box(40, 37, 8, 10, "#79395d");
      box(28, 34, 7, 1, "#532a44");
      box(28, 35, 2, 2, "#fff5db");
      box(33, 35, 2, 2, "#fff5db");
      break;
    case 17:
      box(18, 15, 28, 10, "#dcc9a7");
      box(20, 11, 24, 7, "#f0e0bd");
      box(17, 23, 5, 13, "#d3bc9e");
      box(42, 23, 5, 13, "#d3bc9e");
      box(18, 21, 28, 2, "#f0e0bd");
      box(21, 38, 22, 3, "#f0e0bd");
      break;
    case 18:
      box(18, 14, 28, 10, "#f2eadb");
      box(22, 10, 20, 6, "#f2eadb");
      box(18, 24, 4, 12, "#dfd5cd");
      box(42, 24, 4, 12, "#dfd5cd");
      box(21, 38, 22, 3, "#f2eadb");
      box(28, 37, 2, 3, "#f2eadb");
      box(34, 37, 2, 3, "#f2eadb");
      break;
    case 19:
      box(20, 16, 24, 3, "#f0c778");
      box(29, 10, 6, 7, "#9fe2d2");
      box(27, 13, 10, 3, "#a6e7d3");
      box(19, 30, 3, 5, "#b5e7d8");
      box(42, 30, 3, 5, "#b5e7d8");
      break;
    case 20:
      box(12, 22, 40, 4, "#3d477e");
      box(19, 15, 26, 9, "#5b6ba5");
      box(24, 9, 17, 8, "#5b6ba5");
      box(31, 4, 9, 7, "#5b6ba5");
      box(29, 14, 3, 9, "#e8ca87");
      box(26, 17, 9, 3, "#e8ca87");
      break;
    case 21:
      box(20, 20, 24, 4, "#78aba1");
      box(24, 19, 16, 2, "#d8eee0");
      box(15, 22, 7, 3, "#b3d4bf");
      box(12, 24, 8, 2, "#d8eee0");
      break;
    case 22:
      box(19, 19, 26, 5, "#335a94");
      box(28, 18, 8, 3, "#81ccdd");
      box(31, 16, 3, 3, "#a8e1ed");
      box(24, 20, 5, 2, "#a8e1ed");
      break;
    case 23:
      box(19, 20, 26, 4, "#954b64");
      box(36, 13, 5, 8, "#d17b60");
      box(38, 10, 3, 5, "#f5b477");
      box(29, 19, 5, 3, "#ffd285");
      break;
    case 24:
      box(18, 19, 28, 6, "#796f51");
      box(26, 18, 12, 4, "#c5ac70");
      box(30, 17, 4, 6, "#7fac8c");
      break;
    case 25:
      for (const x of [14, 42]) {
        box(x, 11, 8, 11, "#305973");
        box(x + 2, 13, 4, 5, "#f5d878");
      }
      box(20, 14, 24, 9, "#427c91");
      box(26, 15, 12, 3, "#8ddccb");
      break;
    case 26:
      box(19, 13, 26, 11, "#d7799e");
      for (const x of [12, 44]) {
        box(x, 17, 8, 4, "#f391aa");
        box(x - 1, 23, 9, 4, "#e37fab");
        box(x, 29, 8, 4, "#cd6d9e");
      }
      break;
    case 27:
      box(20, 15, 24, 9, "#527f80");
      box(19, 9, 3, 9, "#527f80");
      box(42, 9, 3, 9, "#527f80");
      box(16, 7, 6, 3, "#9bbf9c");
      box(42, 7, 6, 3, "#9bbf9c");
      box(28, 16, 8, 3, "#dce8b5");
      break;
    case 28:
      box(17, 15, 30, 10, "#88afd1");
      box(21, 11, 22, 8, "#a7c6e5");
      box(17, 24, 5, 8, "#7199c0");
      box(42, 24, 5, 8, "#7199c0");
      box(30, 14, 4, 10, "#f1fff7");
      box(27, 17, 10, 4, "#f1fff7");
      break;
    case 29:
      box(18, 15, 28, 9, "#b65c43");
      box(23, 11, 18, 6, "#d9844d");
      box(19, 20, 26, 3, "#f7d9a9");
      box(34, 16, 7, 3, "#74b5aa");
      break;
    case 30:
      box(18, 15, 28, 9, "#d9a653");
      box(13, 14, 9, 10, "#4c4f86");
      box(42, 14, 9, 10, "#4c4f86");
      box(15, 16, 5, 5, "#f8d586");
      box(44, 16, 5, 5, "#f8d586");
      box(31, 8, 2, 8, "#4c4f86");
      box(29, 6, 6, 4, "#91d2df");
      break;
    case 31:
      box(19, 20, 26, 4, "#307e8b");
      box(36, 14, 7, 4, "#a9ddd4");
      box(38, 11, 4, 4, "#e59a8b");
      box(41, 16, 4, 3, "#e59a8b");
      break;
  }
}

function paintHeldItem(box, item, hand, frame) {
  const ink = "#26324e";
  switch (item) {
    case 1:
      box(49, 42, 10, 16, ink);
      box(50, 44, 8, 11, "#89cdf2");
      box(51, 46, 4, 5, "#e2f7ff");
      box(53, 56, 2, 1, "#f0edf3");
      break;
    case 2:
      box(46, 43, frame !== null && frame >= 2 ? 13 : 17, 5, "#f27286");
      box(48, 48, 13, 4, "#e95871");
      box(50, 52, 9, 2, "#9ed688");
      box(49, 51, 11, 2, "#a8db83");
      box(52, 54, 5, 2, "#36765d");
      box(50, 46, 1, 2, ink);
      box(55, 48, 1, 2, ink);
      if (frame === null || frame < 2) box(59, 45, 1, 2, ink);
      break;
    case 3:
      box(47, 44, 14, 13, "#684970");
      box(49, 45, 10, 11, "#fff1d0");
      box(53, 45, 1, 11, "#bd8c80");
      box(50, 48, 2, 1, "#8597af");
      box(55, 51, 3, 1, "#8597af");
      break;
    case 4:
      box(49, 46, 10, 11, "#f6e3bf");
      box(48, 44, 12, 3, "#77504f");
      box(50, 49, 8, 5, "#c26857");
      box(52, 40, 1, 2, "#fff2dd");
      box(54, 37, 1, 3, "#fff2dd");
      break;
    case 5:
      box(53, 43, 2, 15, "#3b8460");
      box(55, 49, 4, 2, "#5d9c65");
      box(50, 36, 8, 8, "#ec8aa7");
      box(52, 34, 4, 12, "#ec8aa7");
      box(48, 38, 12, 4, "#ec8aa7");
      box(52, 38, 4, 4, "#ffd475");
      break;
    case 6:
      box(52, 40, 2, 16, "#77558b");
      box(49, 36, 8, 3, "#e3a159");
      box(52, 33, 2, 9, "#ffd67f");
      box(48, 31, 2, 2, "#fff0b5");
      box(58, 39, 2, 2, "#fff0b5");
      break;
    case 7:
      box(46, 46, 16, 11, ink);
      box(48, 44, 6, 3, ink);
      box(47, 48, 14, 7, "#969fbc");
      box(52, 48, 6, 7, "#475d78");
      box(53, 49, 4, 4, "#8dc9de");
      box(59, 49, 1, 2, "#f4df90");
      break;
    case 8:
      box(46, 47, 16, 9, ink);
      box(48, 48, 12, 6, "#e4d7ba");
      box(50, 49, 1, 4, ink);
      box(49, 50, 3, 1, ink);
      box(57, 49, 2, 2, "#e47d83");
      box(55, 51, 2, 2, "#6ba9d0");
      break;
    case 9:
      box(50, 46, 8, 5, "#d79861");
      box(52, 51, 4, 5, "#b87851");
      box(49, 41, 10, 6, "#f2a0be");
      box(51, 39, 6, 3, "#f6c5da");
      box(52, 41, 2, 3, "#ffdfed");
      break;
    case 10: {
      const sway = frame === null ? 0 : Math.round(Math.sin(frame) * 3);
      box(53 + sway, 40, 1, 9, "#765574");
      box(53, 49, 1, 7, "#765574");
      box(Math.min(53, 53 + sway), 48, Math.abs(sway) + 1, 1, "#765574");
      box(50 + sway, 27, 8, 12, "#d875aa");
      box(48 + sway, 29, 12, 8, "#d875aa");
      box(51 + sway, 29, 2, 4, "#f5bfdc");
      box(52 + sway, 39, 3, 2, "#9a4f83");
      break;
    }
    case 11:
      box(48, 46, 13, 13, "#cb9a75");
      box(48, 42, 4, 5, "#cb9a75");
      box(57, 42, 4, 5, "#cb9a75");
      box(51, 51, 7, 5, "#f4d7ab");
      box(51, 48, 1, 2, ink);
      box(57, 48, 1, 2, ink);
      box(54, 52, 2, 1, ink);
      break;
    default:
      return;
  }
  box(43, 52, 6, 4, hand);
  box(46, 51, 3, 2, hand);
}

function paintItemEffect(box, item, frame) {
  const glint = (x, y, color) => {
    box(x - 2, y, 5, 1, color);
    box(x, y - 2, 1, 5, color);
  };
  const rise = Math.floor(frame / 2);
  switch (item) {
    case 1:
      box(49, 35 - rise, 12, 7, "#ffe9af");
      box(52, 37 - rise, 6, 1, "#b66b67");
      box(52, 39 - rise, 4, 1, "#b66b67");
      break;
    case 2:
      box(59, 42 - rise, 2, 2, "#ff98ab");
      box(55 - rise, 40 - rise, 2, 2, "#f48e9b");
      break;
    case 3:
      box(50 + rise, 42 - rise % 3, 3, 11, "#fff8e4");
      box(51 + rise, 44 - rise % 3, 2, 1, "#d0a489");
      break;
    case 4:
      box(52 + frame % 3, 37 - rise, 2, 5, "#fff1dce0");
      box(55 - frame % 3, 33 - rise, 2, 4, "#fff1dcb0");
      break;
    case 5:
      box(54 + rise, 32 - frame % 3, 3, 2, "#fbb3ce");
      box(49 - rise, 36 + frame % 4, 2, 2, "#ec94b6");
      box(59, 40 + rise, 2, 2, "#f2b0cf");
      break;
    case 6:
      glint(49 - rise, 29 - rise, "#ffdf8c");
      glint(58, 32 - frame % 5, "#baf0f1");
      box(61 - rise, 37, 2, 2, "#f7add5");
      break;
    case 7:
      if (frame < 3) {
        glint(57, 43, "#fff2c0");
        box(60, 39, 2, 2, "#fff2c0");
      } else {
        box(51, 33 - rise, 10, 9, "#faf0df");
        box(52, 34 - rise, 8, 5, "#9dd4c6");
        box(54, 36 - rise, 3, 2, "#59789e");
      }
      break;
    case 8:
      glint(51 + frame % 3, 41 - rise, "#8de2bc");
      glint(58, 43 - rise, "#f5ac94");
      break;
    case 9:
      box(54 - rise, 38 - frame % 3, 2, 3, "#f5bad1");
      box(51, 35 - rise, 2, 2, "#ffe6e4");
      break;
    case 10:
      glint(58 - rise, 25 + frame % 3, "#f8d1e8");
      break;
    case 11:
      for (const [x, y] of [[47, 41], [55, 37]]) {
        box(x, y - rise, 2, 2, "#f794ae");
        box(x + 3, y - rise, 2, 2, "#f794ae");
        box(x + 1, y + 2 - rise, 3, 1, "#ed6e99");
        box(x + 2, y + 3 - rise, 1, 1, "#ed6e99");
      }
      break;
  }
}

function paintGamesIcon(canvas) {
  const ctx = canvas.getContext("2d");
  const layers = [
    // Cartridge and its label
    ["#142842", [[12, 4, 8, 1], [10, 5, 12, 8]]],
    ["#e5a545", [[11, 6, 10, 7]]],
    ["#ffdb80", [[12, 5, 8, 2], [12, 7, 2, 4]]],
    ["#fff1bc", [[15, 7, 5, 3]]],
    // Stepped controller silhouette and green edge
    ["#142842", [[7, 11, 18, 1], [4, 12, 24, 2], [3, 14, 26, 12], [5, 26, 22, 2], [7, 28, 18, 1]]],
    ["#2b7558", [[4, 15, 24, 10], [6, 24, 20, 3], [8, 27, 16, 1]]],
    ["#61b087", [[5, 23, 22, 2], [7, 25, 18, 2]]],
    // Shell, directional pad and buttons
    ["#e4d5aa", [[7, 13, 18, 1], [5, 14, 22, 8], [7, 22, 18, 2]]],
    ["#fff1ce", [[7, 13, 17, 2], [5, 15, 3, 6]]],
    ["#263a55", [[9, 15, 2, 8], [6, 18, 8, 2], [14, 21, 3, 1], [18, 22, 3, 1]]],
    ["#526b85", [[9, 16, 1, 4], [7, 18, 5, 1]]],
    ["#994537", [[22, 15, 4, 4]]],
    ["#ef785a", [[22, 15, 3, 3]]],
    ["#245a98", [[18, 17, 3, 3]]],
    ["#79b9e0", [[18, 17, 2, 2]]],
  ];
  for (const [color, pixels] of layers) {
    ctx.fillStyle = color;
    for (const rect of pixels) ctx.fillRect(...rect);
  }
}

function paintEnzoPortrait(canvas) {
  const ctx = canvas.getContext("2d");
  const layers = [
    ["#b8e1db", [[0, 0, 64, 64]]],
    ["#a4d4d1", [[5, 0, 1, 64], [57, 0, 1, 64], [0, 9, 64, 1], [0, 54, 64, 1]]],
    ["#eaf8eb", [[9, 19, 7, 1], [12, 16, 1, 7], [49, 10, 7, 1], [52, 7, 1, 7]]],
    // Shoulders, black shirt and chain
    ["#171d2b", [[7, 58, 50, 6], [10, 53, 44, 7], [14, 49, 36, 5], [20, 46, 24, 4]]],
    ["#2c3141", [[12, 55, 9, 5], [43, 52, 6, 3], [18, 50, 6, 2]]],
    ["#d98c70", [[27, 42, 12, 10], [26, 48, 14, 3]]],
    ["#f5ad8b", [[26, 48, 9, 2], [34, 46, 5, 3]]],
    ["#a4afbb", [[24, 48, 2, 4], [25, 51, 4, 2], [28, 53, 9, 1], [37, 52, 3, 1], [39, 49, 1, 4]]],
    // Face, jaw and ears
    ["#603d3b", [[18, 17, 28, 24], [21, 30, 23, 14], [25, 40, 15, 7], [29, 46, 8, 1]]],
    ["#da9074", [[19, 18, 26, 20], [22, 37, 21, 6], [25, 42, 15, 3], [27, 44, 11, 2], [15, 27, 5, 9], [44, 26, 5, 10]]],
    ["#ecaa87", [[20, 18, 21, 17], [22, 34, 18, 7], [25, 40, 12, 4], [18, 28, 4, 5]]],
    ["#c77865", [[16, 30, 2, 4], [46, 28, 2, 5], [40, 35, 3, 4], [32, 32, 3, 2]]],
    ["#e59380", [[21, 32, 5, 3], [37, 32, 5, 3]]],
    ["#f5ba97", [[29, 27, 2, 6], [29, 33, 3, 1], [26, 42, 8, 1]]],
    // Curly top and faded sides
    ["#22212a", [[16, 15, 31, 8], [17, 11, 29, 7], [20, 8, 24, 5], [24, 6, 14, 3], [16, 21, 5, 7], [41, 19, 5, 8]]],
    ["#35303a", [[15, 14, 6, 5], [20, 10, 5, 4], [25, 7, 7, 4], [34, 7, 6, 4], [40, 10, 6, 4], [44, 14, 4, 5], [23, 15, 7, 4], [32, 12, 5, 4]]],
    ["#494047", [[21, 11, 3, 1], [26, 8, 3, 1], [35, 9, 3, 1], [41, 12, 3, 1], [27, 16, 3, 1], [33, 13, 2, 1]]],
    ["#4b3a3e", [[17, 23, 3, 4], [43, 22, 3, 4]]],
    // Eyebrows, eyes, moustache and mouth
    ["#503237", [[21, 24, 6, 2], [26, 25, 2, 1], [34, 24, 7, 2], [20, 25, 2, 1]]],
    ["#fff2de", [[22, 27, 6, 3], [34, 27, 7, 3]]],
    ["#34262e", [[24, 27, 3, 3], [36, 27, 3, 3]]],
    ["#594044", [[25, 35, 4, 1], [31, 35, 5, 1], [24, 36, 2, 1], [35, 36, 2, 1]]],
    ["#a95b57", [[27, 38, 8, 1]]],
    ["#ce7d70", [[28, 39, 6, 1]]],
    // Silver hoop
    ["#7a737a", [[46, 34, 3, 1], [48, 35, 1, 4], [45, 38, 3, 1]]],
    ["#e1e7e6", [[46, 34, 2, 1], [45, 35, 1, 3], [46, 38, 2, 1]]],
  ];
  for (const [color, rectangles] of layers) {
    ctx.fillStyle = color;
    for (const rectangle of rectangles) ctx.fillRect(...rectangle);
  }
}

document.querySelectorAll(".games-icon").forEach(paintGamesIcon);
