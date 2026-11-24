const storageKey = "front-arcade.avatar.v1";
const bootScreen = document.querySelector("#boot-screen");
const bootStatus = document.querySelector("#boot-status");
const powerButton = document.querySelector("#power-on");
const desktop = document.querySelector("#arcade-desktop");
const gamesWindow = document.querySelector("#games-window");
const builderWindow = document.querySelector("#builder-window");
const builderShortcut = document.querySelector("#open-builder");
const fullscreenButtons = [...document.querySelectorAll("[data-fullscreen]")];
const desktopShortcut = document.querySelector(".desktop-shortcut[data-games]");
const editAvatarButton = document.querySelector("#edit-avatar");
const aboutWindow = document.querySelector("#about-window");
const aboutShortcut = document.querySelector(".desktop-shortcut[data-about]");
const aboutTaskButton = document.querySelector(".task-button[data-about]");
const aboutFolder = document.querySelector("#about-folder");
const aboutFile = document.querySelector("#about-file");
const aboutStatus = document.querySelector("#about-status");
const authorProfile = document.querySelector("#author-profile");
const gamesTitle = document.querySelector("#window-title");
const taskProfile = document.querySelector(".task-profile");
const dialog = document.querySelector("#avatar-dialog");
const editorTitle = document.querySelector("#avatar-title");
const form = document.querySelector("#avatar-form");
const nameField = document.querySelector("#player-name");
const categoriesRoot = document.querySelector("#avatar-categories");
const optionsRoot = document.querySelector("#avatar-options");
const costumeClothesNote = document.querySelector("#costume-clothes-note");
const avatarCanvas = document.querySelector("#avatar-art");
const profileCanvas = document.querySelector("#profile-avatar");
const previewTools = document.querySelector("#preview-tools");
const sceneEffect = document.querySelector("#scene-effect");
const itemAction = document.querySelector("#item-action");
const previewMotion = document.querySelector("#preview-motion");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const fields = Object.entries(avatarOptions);
const categoryButtons = new Map();
const optionGroups = new Map();
const thumbnails = [];
const paletteLabels = new Map();

let profile = loadProfile();
let activeCategory = avatarCategories[0].id;
let previewAppearance;
let sceneFrame = 0;
let sceneAlternate = false;
let itemActionActive = false;
let itemFrame = null;
let motionEnabled = !motionPreference.matches;
let previewTimer;
let profileRequest;
let openedFile;

const authorAssets = {
  Enzo: { portrait: paintEnzoPortrait, resume: "Curriculo-Enzo-Costa.pdf" },
};

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (typeof saved?.name !== "string" || !saved.name.trim()) return null;

    const appearance = Object.fromEntries(fields.map(([key, { choices }]) => {
      const value = saved[key];
      const valid = Number.isInteger(value) && value >= 0 && value < choices.length;
      return [key, valid ? value : 0];
    }));
    return {
      name: saved.name.trim().slice(0, nameField.maxLength),
      ...appearance,
      sceneAlternate: saved.sceneAlternate === true && Boolean(avatarScenes[appearance.scene].effect),
      itemActionActive: saved.itemActionActive === true && Boolean(avatarItems[appearance.held].action),
    };
  } catch {
    return null;
  }
}

function setGamesWindow(open) {
  if (!open) leaveWindowFullscreen(gamesWindow);
  gamesWindow.hidden = !open;
  desktopShortcut.setAttribute("aria-expanded", String(open));
}

function setBuilderWindow(open) {
  if (!open) leaveWindowFullscreen(builderWindow);
  builderWindow.hidden = !open;
  builderShortcut.setAttribute("aria-expanded", String(open));
}

function updateFullscreenButtons() {
  for (const button of fullscreenButtons) {
    const windowElement = document.getElementById(button.dataset.fullscreen);
    const expanded = document.fullscreenElement === windowElement || windowElement.classList.contains("window-expanded");
    button.setAttribute("aria-pressed", String(expanded));
    button.title = expanded ? "Sair da tela cheia" : "Tela cheia";
    button.setAttribute("aria-label", button.title);
  }
}

function leaveWindowFullscreen(windowElement) {
  windowElement.classList.remove("window-expanded");
  if (document.fullscreenElement === windowElement) document.exitFullscreen().catch(() => {});
  updateFullscreenButtons();
}

document.addEventListener("fullscreenchange", updateFullscreenButtons);
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
  const fallback = document.querySelector(".window-expanded");
  if (fallback) leaveWindowFullscreen(fallback);
});
for (const button of fullscreenButtons) {
  button.addEventListener("click", async () => {
    const windowElement = document.getElementById(button.dataset.fullscreen);
    if (button.getAttribute("aria-pressed") === "true") {
      leaveWindowFullscreen(windowElement);
      return;
    }
    try {
      await windowElement.requestFullscreen();
    } catch {
      if (!windowElement.hidden) windowElement.classList.add("window-expanded");
    }
    updateFullscreenButtons();
  });
}

function setAboutWindow(state) {
  aboutWindow.hidden = state !== "open";
  aboutTaskButton.hidden = state === "closed";
  aboutTaskButton.classList.toggle("is-open", state === "open");
  aboutTaskButton.classList.toggle("is-minimized", state === "minimized");
  aboutTaskButton.setAttribute("aria-expanded", String(state === "open"));
}

function showAboutFolder() {
  profileRequest?.abort();
  aboutFile.hidden = true;
  aboutFolder.hidden = false;
  openedFile?.focus();
  openedFile = null;
}

async function openAboutFile(button) {
  profileRequest?.abort();
  const request = new AbortController();
  profileRequest = request;
  openedFile = button;
  aboutFolder.hidden = true;
  aboutFile.hidden = false;
  authorProfile.hidden = true;
  aboutStatus.textContent = "Carregando perfil…";
  document.querySelector("#back-to-folder").focus();

  try {
    const file = button.dataset.file;
    const response = await fetch(`./sobre/${file}.txt`, { signal: request.signal });
    if (!response.ok) throw new Error("Perfil indisponível");
    const [name, ...sections] = (await response.text()).trim().split(/^## /m);
    if (request.signal.aborted) return;

    const header = document.createElement("header");
    header.className = "author-heading";
    const title = document.createElement("h2");
    title.tabIndex = -1;
    title.textContent = name.trim();
    const identity = document.createElement("div");
    identity.append(title);
    const { portrait, resume } = authorAssets[file] ?? {};
    if (portrait) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `Retrato em pixel art de ${title.textContent}`);
      portrait(canvas);
      header.append(canvas);
    }
    if (resume) {
      const download = document.createElement("a");
      download.className = "resume-download";
      download.href = `./sobre/${resume}`;
      download.download = resume;
      download.textContent = "Baixar currículo";
      const icon = document.createElement("span");
      icon.className = "download-icon";
      icon.setAttribute("aria-hidden", "true");
      download.prepend(icon);
      identity.append(download);
    }
    header.append(identity);
    authorProfile.replaceChildren(header);
    for (const section of sections) {
      const [label, ...lines] = section.split(/\r?\n/);
      const heading = document.createElement("h3");
      heading.textContent = label;
      const paragraph = document.createElement("p");
      paragraph.textContent = lines.join("\n").trim();
      authorProfile.append(heading, paragraph);
    }
    aboutStatus.textContent = "";
    authorProfile.hidden = false;
    if (!aboutWindow.hidden) title.focus();
  } catch {
    if (request.signal.aborted) return;
    aboutStatus.textContent = "Não foi possível abrir o perfil. Volte à pasta para tentar novamente.";
  }
}

function renderProfile() {
  taskProfile.hidden = !profile;
  profileCanvas.hidden = !profile;
  editAvatarButton.textContent = profile ? "Editar avatar" : "Criar avatar";
  if (!profile) return;

  taskProfile.textContent = profile.name;
  taskProfile.title = profile.name;
  const crop = profile.sceneAlternate || profile.itemActionActive ? [0, 0, 64, 64] : [10, 4, 44, 44];
  paintAvatar(profileCanvas, profile, crop);
}

function createEditor() {
  for (const { id, label } of avatarCategories) {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-controls", "avatar-options");
    button.addEventListener("click", () => selectCategory(id));
    categoryButtons.set(id, button);
    categoriesRoot.append(button);
  }

  for (const [key, { label, choices, category, crop }] of fields) {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = label;
    if (!crop) {
      const selection = document.createElement("span");
      selection.className = "selection-label";
      selection.setAttribute("aria-hidden", "true");
      paletteLabels.set(key, selection);
      legend.append(selection);
    }
    const list = document.createElement("div");
    list.className = crop ? "choice-list tile-list" : "choice-list";
    if (["costume", "held", "scene"].includes(key)) list.classList.add("illustrated-tiles");

    choices.forEach(({ label: optionLabel, color }, index) => {
      const option = document.createElement("label");
      option.className = "choice";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = key;
      radio.value = index;
      radio.setAttribute("aria-label", optionLabel);
      const display = document.createElement("span");
      display.setAttribute("aria-hidden", "true");
      if (color) {
        display.className = "swatch";
        display.style.setProperty("--swatch", color);
        option.title = optionLabel;
      } else {
        display.className = "style-tile";
        const image = document.createElement("canvas");
        image.width = crop[2];
        image.height = crop[3];
        const caption = document.createElement("span");
        caption.textContent = optionLabel;
        display.append(image, caption);
        thumbnails.push({ image, category, key, index, crop });
      }
      option.append(radio, display);
      list.append(option);
    });

    fieldset.append(legend, list);
    optionGroups.set(fieldset, category);
    optionsRoot.append(fieldset);
  }
}

function selectCategory(category) {
  activeCategory = category;
  for (const [id, button] of categoryButtons) {
    button.setAttribute("aria-pressed", String(id === category));
  }
  optionsRoot.scrollTop = 0;
  previewAvatar();
}

function readAppearance() {
  return Object.fromEntries(fields.map(([key]) => [key, Number(form.elements[key].value)]));
}

function previewAvatar() {
  const appearance = readAppearance();
  if (appearance.scene !== previewAppearance?.scene) {
    sceneFrame = 0;
    sceneAlternate = false;
  }
  if (appearance.held !== previewAppearance?.held) {
    itemActionActive = false;
    itemFrame = null;
  }
  previewAppearance = appearance;
  paintLivePreview();
  updatePreviewTools();
  updatePreviewAnimation();

  const costumeCoversClothes = activeCategory === "clothes" && appearance.costume !== 0;
  costumeClothesNote.hidden = !costumeCoversClothes;
  const backdropGroup = paletteLabels.get("backdrop").closest("fieldset");
  for (const [fieldset, category] of optionGroups) {
    fieldset.hidden = category !== activeCategory || costumeCoversClothes
      || (fieldset === backdropGroup && appearance.scene !== 0);
  }
  for (const [key, label] of paletteLabels) {
    label.textContent = avatarOptions[key].choices[appearance[key]].label;
  }
  for (const { image, category, key, index, crop } of thumbnails) {
    if (category !== activeCategory || costumeCoversClothes) continue;
    const thumbnail = { ...appearance, costume: 0, held: 0, scene: 0, [key]: index };
    paintAvatar(image, thumbnail, crop, { sceneOnly: key === "scene" });
  }
}

function paintLivePreview() {
  paintAvatar(avatarCanvas, previewAppearance, undefined, {
    frame: sceneFrame,
    alternate: sceneAlternate,
    itemFrame: itemActionActive ? (motionEnabled ? itemFrame ?? activeItemFrame : activeItemFrame) : null,
  });
}

function updatePreviewTools() {
  const { effect } = avatarScenes[previewAppearance.scene];
  const { action } = avatarItems[previewAppearance.held];
  previewTools.hidden = !effect && !action;
  sceneEffect.hidden = !effect;
  itemAction.hidden = !action;
  sceneEffect.textContent = effect?.[Number(sceneAlternate)] ?? "";
  itemAction.textContent = itemActionActive ? "Desativar ação do objeto" : action ?? "";
  previewMotion.textContent = motionEnabled ? "Pausar movimento" : "Ativar movimento";
}

function updatePreviewAnimation() {
  clearInterval(previewTimer);
  const animateScene = motionEnabled && Boolean(previewAppearance?.scene);
  if (!dialog.open || document.hidden || (!animateScene && itemFrame === null)) return;

  previewTimer = setInterval(() => {
    if (animateScene) sceneFrame = (sceneFrame + 1) % 2520;
    if (itemFrame !== null) itemFrame = itemFrame < 8 ? itemFrame + 1 : null;
    paintLivePreview();
    if (!animateScene && itemFrame === null) clearInterval(previewTimer);
  }, 135);
}

function openEditor() {
  editorTitle.textContent = profile ? "Edite seu avatar" : "Crie seu avatar";
  document.querySelector("#save-avatar").textContent = profile ? "Salvar alterações" : "Salvar avatar";
  nameField.value = profile?.name ?? "";
  nameField.setCustomValidity("");
  for (const [key] of fields) form.elements[key].value = String(profile?.[key] ?? 0);
  previewAppearance = readAppearance();
  sceneFrame = 0;
  sceneAlternate = profile?.sceneAlternate ?? false;
  itemActionActive = profile?.itemActionActive ?? false;
  itemFrame = null;
  selectCategory(avatarCategories[0].id);
  dialog.querySelector(".editor-body").scrollTop = 0;
  dialog.showModal();
  updatePreviewAnimation();
}

function openGames() {
  setBuilderWindow(false);
  if (!aboutWindow.hidden) setAboutWindow("minimized");
  setGamesWindow(true);
  gamesTitle.focus();
}

powerButton.addEventListener("click", () => {
  powerButton.disabled = true;
  bootStatus.textContent = "Preparando a área de trabalho…";
  bootScreen.classList.add("is-booting");

  setTimeout(() => {
    bootScreen.hidden = true;
    desktop.hidden = false;
    (profile ? desktopShortcut : editAvatarButton).focus({ preventScroll: true });
    if (!profile) openEditor();
  }, motionPreference.matches ? 150 : Number.parseInt(getComputedStyle(bootScreen).getPropertyValue("--boot-duration"), 10));
});

desktopShortcut.addEventListener("click", openGames);
builderShortcut.addEventListener("click", () => {
  setGamesWindow(false);
  if (!aboutWindow.hidden) setAboutWindow("minimized");
  setBuilderWindow(true);
  document.querySelector("#builder-window-title").focus({ preventScroll: true });
});
document.querySelector("#close-builder").addEventListener("click", () => {
  setBuilderWindow(false);
  builderShortcut.focus({ preventScroll: true });
});
document.querySelectorAll("[data-about]").forEach(button => button.addEventListener("click", () => {
  setGamesWindow(false);
  setBuilderWindow(false);
  setAboutWindow("open");
  document.querySelector("#about-window-title").focus();
}));
document.querySelectorAll("[data-file]").forEach(button => {
  button.addEventListener("click", () => openAboutFile(button));
});
document.querySelector("#back-to-folder").addEventListener("click", showAboutFolder);
document.querySelector("#minimize-about").addEventListener("click", () => {
  setAboutWindow("minimized");
  aboutTaskButton.focus();
});
document.querySelector("#close-about").addEventListener("click", () => {
  setAboutWindow("closed");
  showAboutFolder();
  aboutShortcut.focus();
});
editAvatarButton.addEventListener("click", openEditor);
document.querySelector("#close-avatar").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => clearInterval(previewTimer));
document.addEventListener("visibilitychange", updatePreviewAnimation);
motionPreference.addEventListener("change", ({ matches }) => {
  motionEnabled = !matches;
  if (previewAppearance) {
    updatePreviewTools();
    paintLivePreview();
  }
  updatePreviewAnimation();
});
sceneEffect.addEventListener("click", () => {
  sceneAlternate = !sceneAlternate;
  paintLivePreview();
  updatePreviewTools();
});
itemAction.addEventListener("click", () => {
  itemActionActive = !itemActionActive;
  itemFrame = itemActionActive && motionEnabled ? 0 : null;
  paintLivePreview();
  updatePreviewTools();
  updatePreviewAnimation();
});
previewMotion.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  updatePreviewTools();
  paintLivePreview();
  updatePreviewAnimation();
});
document.querySelector("#close-window").addEventListener("click", () => {
  setGamesWindow(false);
  desktopShortcut.focus();
});

optionsRoot.addEventListener("change", previewAvatar);
nameField.addEventListener("input", () => nameField.setCustomValidity(""));
document.querySelector("#randomize").addEventListener("click", () => {
  for (const [key, { choices }] of fields) {
    const current = Number(form.elements[key].value);
    const next = (current + 1 + Math.floor(Math.random() * (choices.length - 1))) % choices.length;
    form.elements[key].value = String(next);
  }
  previewAvatar();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameField.value.trim();
  if (!name) {
    nameField.setCustomValidity("Digite seu nome para continuar.");
    nameField.reportValidity();
    return;
  }

  profile = { name, ...readAppearance(), sceneAlternate, itemActionActive };
  try {
    localStorage.setItem(storageKey, JSON.stringify(profile));
  } catch {
    // The current session still works when browser storage is unavailable.
  }
  dialog.close();
  renderProfile();
  editAvatarButton.focus({ preventScroll: true });
});

const clock = document.querySelector(".system-clock");
const systemDate = document.querySelector(".system-date");
const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const machineDateFormat = new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function updateClock() {
  const now = new Date();
  systemDate.textContent = dateFormat.format(now);
  systemDate.dateTime = machineDateFormat.format(now);
  clock.textContent = timeFormat.format(now);
  clock.dateTime = clock.textContent;
}

createEditor();
setGamesWindow(false);
setAboutWindow("closed");
renderProfile();
updateClock();
setInterval(updateClock, 1000);
