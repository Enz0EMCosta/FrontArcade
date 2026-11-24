// Pixel-art scenery behind Pepi Bolota, in daylight: Aracaju's seafront (Orla de
// Atalaia, with the arches and the giant crab statue) and the UFS campus. Three
// canvases scroll at different speeds (parallax) when the camera travels between them.
(() => {
  const HEIGHT = 270; // art pixels; the layers are scaled to the full viewport height
  const WIDTH = 1100;
  const HORIZON = 160;
  const SHORE = 200;
  const WALK = 208;
  const places = {
    orla: { x: 260, label: "Orla de Atalaia, Aracaju" },
    ufs: { x: 830, label: "UFS, São Cristóvão" },
  };

  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCanvas() {
    const element = document.createElement("canvas");
    element.width = WIDTH;
    element.height = HEIGHT;
    return element;
  }

  function tools(context) {
    const box = (x, y, width, height, fill) => {
      context.fillStyle = fill;
      context.fillRect(Math.round(x), Math.round(y), width, height);
    };
    const disc = (cx, cy, radius, fill) => {
      for (let y = -radius; y < radius; y++) {
        const half = Math.round(Math.sqrt(radius * radius - (y + .5) ** 2));
        if (half > 0) box(cx - half, cy + y, half * 2, 1, fill);
      }
    };
    const clear = (x, y, width, height) => context.clearRect(Math.round(x), Math.round(y), width, height);
    return { box, disc, clear };
  }

  // A tiny variable-width pixel font, only for the words on the scenery.
  const glyphs = {
    S: ["111", "100", "111", "001", "111"], E: ["111", "100", "110", "100", "111"],
    M: ["10001", "11011", "10101", "10001", "10001"], A: ["010", "101", "111", "101", "101"],
    C: ["111", "100", "100", "100", "111"], U: ["101", "101", "101", "101", "111"],
    F: ["111", "100", "110", "100", "100"],
  };
  const textWidth = (text, scale = 1) => [...text].reduce((sum, letter) => sum + (glyphs[letter][0].length + 1) * scale, -scale);
  function write(box, text, x, y, fill, scale = 1) {
    for (const letter of text) {
      const rows = glyphs[letter];
      rows.forEach((row, line) => [...row].forEach((bit, column) => {
        if (bit === "1") box(x + column * scale, y + line * scale, scale, scale, fill);
      }));
      x += (rows[0].length + 1) * scale;
    }
  }

  /* ---------- Sky: a clear blue day, the sun, drifting clouds and seagulls ---------- */

  const skyBands = [
    [0, "#3f9ee6"], [40, "#55ade9"], [75, "#6dbbee"], [104, "#86c8f1"],
    [126, "#a3d6f4"], [144, "#bfe3f7"], [155, "#d6eef9"],
  ];

  function paintSky(context) {
    const { box, disc } = tools(context);
    skyBands.forEach(([y, fill], index) => {
      const end = skyBands[index + 1]?.[0] ?? HEIGHT;
      box(0, y, WIDTH, end - y, fill);
      const next = skyBands[index + 1]?.[1];
      // Two dithered rows soften each step, the way pixel artists paint gradients.
      if (next) for (let x = 0; x < WIDTH; x += 2) { box(x, end - 2, 1, 1, next); box(x + 1, end - 1, 1, 1, next); }
    });
    context.globalAlpha = .22;
    disc(130, 36, 24, "#fff6c9");
    context.globalAlpha = .4;
    disc(130, 36, 15, "#fff6c9");
    context.globalAlpha = 1;
    disc(130, 36, 10, "#ffe98a");
    disc(130, 36, 7, "#fff8d6");
  }

  function makeSkyLife(random) {
    const clouds = Array.from({ length: 9 }, () => ({
      x: random() * WIDTH,
      y: 30 + random() * 90,
      width: 30 + Math.floor(random() * 46),
      speed: 1 + random() * 2,
    }));
    const gulls = Array.from({ length: 4 }, () => ({ x: random() * WIDTH, y: 50 + random() * 60, speed: 6 + random() * 5, phase: random() * 6 }));
    return { clouds, gulls };
  }

  function paintSkyLife(context, { clouds, gulls }, time) {
    const { box } = tools(context);
    for (const cloud of clouds) {
      const x = ((cloud.x + time * cloud.speed) % (WIDTH + 120)) - 60;
      const { y, width } = cloud;
      box(x + 6, y - 3, width * .4, 3, "#ffffff");
      box(x + width * .45, y - 5, width * .3, 5, "#ffffff");
      box(x, y, width, 4, "#ffffff");
      box(x + 2, y + 4, width - 4, 2, "#dcebf6");
    }
    for (const gull of gulls) {
      const x = ((gull.x + time * gull.speed) % (WIDTH + 40)) - 20;
      const y = gull.y + Math.round(Math.sin(time + gull.phase) * 3);
      const up = Math.sin(time * 8 + gull.phase) > 0;
      box(x - 3, y + (up ? 0 : 1), 3, 1, "#f7fbff");
      box(x, y + 1, 1, 1, "#f7fbff");
      box(x + 1, y + (up ? 0 : 1), 3, 1, "#f7fbff");
    }
  }

  /* ---------- Back: open sea on the seafront, fields and trees around the campus ---------- */

  const smooth = (from, to, x) => {
    const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
    return t * t * (3 - 2 * t);
  };
  // Between the seafront and the campus the land curves gently into the sea, like a
  // headland seen from the promenade, instead of a straight cut.
  // A rounded, slightly bumpy hill: it rises quickly from the water and flattens out.
  const landTop = x => {
    const t = smooth(430, 545, x);
    const rise = Math.sin(t * Math.PI / 2);
    const bumps = (Math.sin(x / 6) * 1.2 + Math.sin(x / 17) * 2.2) * 4 * t * (1 - t);
    return Math.round(SHORE - (SHORE - HORIZON) * rise - bumps);
  };

  function paintBack(context, random) {
    const { box, disc } = tools(context);
    const sea = [[HORIZON, "#1f7fb4"], [HORIZON + 4, "#2389bb"], [HORIZON + 12, "#2a98c4"], [HORIZON + 22, "#33a9cc"], [HORIZON + 32, "#41bbd2"]];
    sea.forEach(([y, fill], index) => box(0, y, 580, (sea[index + 1]?.[0] ?? SHORE) - y, fill));
    for (let x = 400; x < WIDTH; x++) {
      const top = landTop(x);
      if (top >= SHORE) continue;
      box(x, top, 1, SHORE - top, "#7dbf68");
      box(x, top, 1, 1, "#5aa553");
      // Sand and foam only where the hill actually touches the water.
      if (top > SHORE - 9) {
        box(x, SHORE - 3, 1, 3, "#f0d29a");
        box(x - 1, SHORE - 4, 1, 1, "#f4fbff");
      }
    }
    // Bushes and trees sit on the hill's crest, small near the water and fuller inland,
    // which gives the hill an organic outline.
    for (let x = 446; x < WIDTH; x += 5 + Math.floor(random() * 6)) {
      const grow = smooth(446, 600, x);
      const radius = Math.round((3 + Math.floor(random() * 5)) * (.45 + grow * .55));
      disc(x, Math.max(landTop(x), HORIZON) + radius - 2, radius, random() < .5 ? "#4a9d5b" : "#57a862");
    }
    for (let x = 480; x < WIDTH; x += 3) if (landTop(x) < HORIZON + 12) box(x, HORIZON + 14 + (x % 7), 1, 1, "#6aae5c");
  }

  function paintBackMotion(context, time) {
    const { box } = tools(context);
    // Sunlight glinting on the water, never on the land.
    for (let row = 0; row < 12; row++) {
      const y = HORIZON + 3 + row * 3;
      const drift = (time * (5 + row) + row * 37) % 44;
      for (let x = -44 + drift; x < 580; x += 44) {
        if (y < landTop(x + 8) - 1) box(x, y, 4 + (row % 3) * 3, 1, row < 4 ? "#7cc4e6" : "#bfeaf5");
      }
    }
  }

  /* ---------- Front: the promenade, palms, the arches, the crab and the UFS campus ---------- */

  function palm(box, x, height, lean) {
    let top = { x, y: WALK };
    for (let step = 0; step < height; step++) {
      const px = x + Math.round(lean * (step / height) ** 2 * 12);
      box(px, WALK - step, 3, 1, step % 4 === 0 ? "#7a5233" : "#9b6b43");
      top = { x: px + 1, y: WALK - step };
    }
    for (const angle of [-2.8, -2.2, -1.6, -1, -.4, .3]) {
      for (let s = 0; s < 16; s++) {
        const fx = top.x + Math.cos(angle) * s;
        const fy = top.y + Math.sin(angle) * s * .8 + (s * s) / 22;
        box(fx, fy, 2, 2, s > 11 ? "#6cc05c" : "#3f9a4f");
      }
    }
    box(top.x - 2, top.y + 1, 4, 3, "#7a5a2e");
  }

  // Three white arches over the promenade, left of the camera's centre so they frame
  // the scene instead of growing out of Pepi.
  const arches = [{ x: 96, width: 40, height: 60 }, { x: 148, width: 56, height: 80 }, { x: 200, width: 40, height: 60 }];

  function paintArches(box) {
    const lights = ["#ff8fbf", "#ffc94d", "#58c7f0", "#a78bfa"];
    arches.forEach((arch, archIndex) => {
      const radius = arch.width / 2;
      const top = WALK - arch.height;
      for (const side of [arch.x - radius, arch.x + radius - 4]) {
        box(side, top + radius, 4, WALK - top - radius, "#ffffff");
        box(side + (side < arch.x ? 3 : 0), top + radius, 1, WALK - top - radius, "#c9d3e0");
      }
      for (let x = -radius; x <= radius; x++) {
        const y = top + radius - Math.round(Math.sqrt(Math.max(0, radius * radius - x * x)));
        box(arch.x + x, y, 1, 4, "#ffffff");
        box(arch.x + x, y + 3, 1, 1, "#c9d3e0");
        if ((x + radius) % 5 === 0) box(arch.x + x, y + 1, 1, 2, lights[(x + radius + archIndex) % lights.length]);
      }
    });
  }

  // The giant crab statue of the Orla de Atalaia: claws up, eyes on stalks, on a plinth.
  function paintCrab(box, disc, clear, cx) {
    const red = "#e2512b";
    const dark = "#6e2414";
    const shade = "#b23a1f";
    box(cx - 26, 192, 52, 3, "#ece6dc");
    box(cx - 24, 195, 48, WALK - 195, "#d9d2c7");
    box(cx + 18, 195, 6, WALK - 195, "#bdb4a7");
    box(cx - 8, 199, 16, 5, "#c99a46");
    // Legs, three on each side, stepping down to the plinth.
    for (const side of [-1, 1]) {
      for (let leg = 0; leg < 3; leg++) {
        const startX = cx + side * (8 + leg * 4);
        for (let step = 0; step < 6; step++) box(startX + side * step, 184 + step + (step > 3 ? step - 3 : 0), 2, 2, step > 3 ? dark : shade);
      }
      // A thick arm up to the claw.
      for (let step = 0; step < 11; step++) box(cx + side * (14 + step), 176 - step, 4, 4, step % 3 ? red : shade);
      const clawX = cx + side * 28;
      disc(clawX, 156, 8, dark);
      disc(clawX, 156, 7, red);
      box(clawX - 3, 151, 4, 2, "#f2845a");
      clear(clawX - 2 + side * 2, 147, 4, 7); // the open pincer
    }
    // A wide, flat shell.
    const shell = (rx, ry, fill) => {
      for (let y = -ry; y < ry; y++) {
        const half = Math.round(rx * Math.sqrt(1 - ((y + .5) / ry) ** 2));
        if (half > 0) box(cx - half, 176 + y, half * 2, 1, fill);
      }
    };
    shell(20, 11, dark);
    shell(19, 10, red);
    box(cx - 12, 168, 24, 2, "#f2845a");
    box(cx - 15, 183, 30, 2, shade);
    for (const side of [-1, 1]) {
      box(cx + side * 6 - 1, 156, 2, 10, shade);
      box(cx + side * 6 - 2, 152, 4, 4, "#ffffff");
      box(cx + side * 6 - 1, 153, 2, 2, "#1d1d1d");
    }
    box(cx - 4, 181, 8, 1, dark);
    box(cx - 5, 180, 1, 1, dark);
    box(cx + 4, 180, 1, 1, dark);
  }

  function paintFront(context, random) {
    const { box, disc, clear } = tools(context);
    // Sand on the seafront turning into the campus lawn: across the middle stretch the
    // pixels are dithered, more grass the further right, and the lawn rises a little.
    for (let x = 0; x < WIDTH; x++) {
      const grass = smooth(460, 650, x);
      const top = SHORE - Math.round(4 * grass);
      for (let y = top; y < WALK; y++) {
        const isGrass = y < SHORE ? random() < grass * 1.4 : random() < grass;
        if (y < SHORE && !isGrass) continue;
        const speck = random() < .12;
        box(x, y, 1, 1, isGrass ? (speck ? "#4c9a4b" : "#5fae5a") : (speck ? "#e2bd7f" : "#f0d29a"));
      }
    }
    // Beach shrubs (restinga) and little dunes cover the seam between the two.
    for (let x = 480; x < 660; x += 6 + Math.floor(random() * 8)) {
      const grow = smooth(470, 560, x);
      if (grow < .15) {
        disc(x, SHORE + 1, 3, "#ead0a0");
        continue;
      }
      disc(x, SHORE - 1, 2 + Math.round(grow * 4), random() < .5 ? "#3f8f52" : "#4f9e57");
      if (random() < .4) box(x - 1, SHORE - 3 - Math.round(grow * 3), 2, 1, "#6cc05c");
    }
    // The promenade everyone stands on, with a wave pattern in its paving.
    box(0, WALK, WIDTH, HEIGHT - WALK, "#d9c4a6");
    box(0, WALK, WIDTH, 2, "#efe2cc");
    box(0, WALK + 2, WIDTH, 1, "#bfa888");
    for (const base of [226, 244, 262]) {
      for (let x = 0; x < WIDTH; x++) box(x, base + Math.round(Math.sin(x / 9 + base) * 3), 1, 1, "#c7ae8c");
    }

    // Orla de Atalaia: palms, lamp posts, the arches and the crab.
    for (const [x, height, lean] of [[24, 54, 1], [300, 60, -1], [470, 56, 1], [512, 50, -1], [560, 64, 1], [596, 52, -1]]) palm(box, x, height, lean);
    paintArches(box);
    for (const x of [56, 228, 334, 448]) {
      box(x, WALK - 38, 2, 38, "#5d6b78");
      box(x - 3, WALK - 38, 8, 2, "#5d6b78");
      box(x - 2, WALK - 36, 6, 2, "#e9eef2");
    }
    paintCrab(box, disc, clear, 398);

    // UFS: the SEMAC block on the left and the main UFS building on the right.
    const windows = (left, width, top, bottom) => {
      for (let y = top; y < bottom; y += 8) {
        for (let x = left; x < left + width; x += 7) {
          box(x, y, 4, 5, random() < .25 ? "#a9d6f2" : "#6fa6d2");
          box(x, y, 4, 1, "#cfe8f8");
        }
      }
    };
    box(640, 134, 104, SHORE - 134, "#efe6d8");
    box(640, 134, 104, 3, "#d6cbb8");
    box(738, 137, 6, SHORE - 137, "#ddd3c3");
    windows(646, 92, 160, SHORE - 6);
    const semac = textWidth("SEMAC", 2) + 12;
    box(692 - semac / 2, 141, semac, 15, "#e8a0c2");
    box(692 - semac / 2, 155, semac, 1, "#b5658f");
    write(box, "SEMAC", 692 - semac / 2 + 6, 143, "#3b2838", 2);

    box(868, 78, 224, SHORE - 78, "#f4efe6");
    box(868, 78, 224, 4, "#ddd3c3");
    box(1084, 82, 8, SHORE - 82, "#ddd3c3");
    for (let y = 126; y < SHORE - 10; y += 16) box(868, y, 224, 2, "#d9cfbe");
    windows(876, 204, 128, SHORE - 12);
    for (let x = 874; x < 1088; x += 14) box(x, SHORE - 10, 4, 10, "#c9bfae");
    box(936, 90, 92, 30, "#3a6fc0");
    box(938, 92, 88, 26, "#1d4f9c");
    write(box, "UFS", 982 - Math.round(textWidth("UFS", 4) / 2), 95, "#ffffff", 4);

    // Ipê trees in bloom and bushes on the lawn.
    for (const x of [778, 1098]) {
      box(x, 176, 3, SHORE - 176, "#7a5233");
      disc(x + 1, 170, 12, "#d7609b");
      disc(x - 4, 168, 8, "#e77fb2");
      for (let dot = 0; dot < 14; dot++) box(x - 10 + random() * 22, 160 + random() * 18, 1, 1, "#ffc2df");
      for (let dot = 0; dot < 6; dot++) box(x - 12 + random() * 26, SHORE - 3 + random() * 3, 1, 1, "#e77fb2");
    }
    for (const x of [656, 720, 860, 940, 1040]) disc(x, SHORE - 1, 5, "#3f8f52");
  }

  // Foam rolling onto the sand.
  function paintFrontMotion(context, time) {
    const { box } = tools(context);
    for (let x = 0; x < 480; x++) {
      const wave = Math.sin(x / 7 + time * 2.2) + Math.sin(x / 3.1 - time * 1.3) * .5;
      // The foam thins out where the land starts, instead of stopping at a line.
      if (wave > .2 + smooth(400, 480, x) * 1.4) box(x, SHORE - (wave > .9 ? 1 : 0), 1, 1, "#f4fbff");
    }
  }

  /* ---------- Layers, camera and the animation loop ---------- */

  const layers = [];
  let cameraX = places.orla.x;
  let frame = 0;
  let last = 0;
  let running = false;
  let onPlace = () => {};
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function layer(host, factor, paint, motion) {
    const element = makeCanvas();
    element.className = "scenery-layer";
    const still = makeCanvas();
    paint(still.getContext("2d"));
    const context = element.getContext("2d");
    context.drawImage(still, 0, 0);
    host.append(element);
    layers.push({ element, still, context, factor, motion });
  }

  function offsetFor(factor, x) {
    const scale = innerHeight / HEIGHT;
    const view = innerWidth / scale;
    return Math.max(0, Math.min(WIDTH - view, factor * (x - view / 2))) * scale;
  }

  function place(x) {
    cameraX = x;
    for (const item of layers) item.element.style.transform = `translateX(${-offsetFor(item.factor, x)}px)`;
  }

  function draw(time) {
    for (const item of layers) {
      if (!item.motion) continue;
      // Clear first: the layers are transparent in places, so old frames would pile up.
      item.context.clearRect(0, 0, WIDTH, HEIGHT);
      item.context.drawImage(item.still, 0, 0);
      item.motion(item.context, time);
    }
  }

  function loop(now) {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    if (now - last < 160) return; // about six frames a second is plenty for this scenery
    last = now;
    draw(now / 1000);
  }

  window.PepiScenery = {
    places,
    mount(host, { onPlaceChange } = {}) {
      onPlace = onPlaceChange ?? onPlace;
      const random = seeded(7);
      const life = makeSkyLife(random);
      layer(host, .3, paintSky, (context, time) => paintSkyLife(context, life, time));
      layer(host, .85, context => paintBack(context, random), paintBackMotion);
      layer(host, 1, context => paintFront(context, random), paintFrontMotion);
      draw(0);
      place(cameraX);
      addEventListener("resize", () => place(cameraX));
    },
    // Travels to a place; the layers glide at their own speeds.
    focus(name, duration = 0) {
      const target = places[name].x;
      onPlace(places[name].label);
      if (!duration || reduceMotion.matches) {
        place(target);
        return Promise.resolve();
      }
      const from = cameraX;
      cameraX = target;
      return Promise.all(layers.map(item => item.element.animate([
        { transform: `translateX(${-offsetFor(item.factor, from)}px)` },
        { transform: `translateX(${-offsetFor(item.factor, target)}px)` },
      ], { duration, easing: "cubic-bezier(.65, 0, .35, 1)" }).finished.then(() => {
        item.element.style.transform = `translateX(${-offsetFor(item.factor, target)}px)`;
      }, () => {})));
    },
    start() {
      if (running || reduceMotion.matches) return;
      running = true;
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
  };
})();
