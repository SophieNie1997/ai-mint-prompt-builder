const BLOCKS = {
  value: {
    title: "Value",
    mode: "single",
    options: [
      { id: "5-shells", label: "5 shells", prompt: "5 shells", icon: "5" },
      { id: "10-shells", label: "10 shells", prompt: "10 shells", icon: "10" },
      { id: "20-shells", label: "20 shells", prompt: "20 shells", icon: "20" },
      { id: "100-shells", label: "100 shells", prompt: "100 shells", icon: "100" },
    ],
  },
  symbol: {
    title: "Symbol",
    mode: "single",
    options: [
      { id: "turtle", label: "turtle", prompt: "turtle", icon: "🐢" },
      { id: "tree", label: "tree", prompt: "tree", icon: "🌳" },
      { id: "lighthouse", label: "lighthouse", prompt: "lighthouse", icon: "🗼" },
      { id: "shell", label: "shell", prompt: "shell", icon: "🐚" },
      { id: "star", label: "star", prompt: "star", icon: "⭐" },
    ],
  },
  meaning: {
    title: "Meaning",
    mode: "single",
    options: [
      { id: "teamwork", label: "teamwork", prompt: "teamwork", icon: "🤝" },
      { id: "growth", label: "growth", prompt: "growth", icon: "🌱" },
      { id: "trust", label: "trust", prompt: "trust", icon: "🛡️" },
      { id: "hope", label: "hope", prompt: "hope", icon: "☀️" },
      { id: "special", label: "special", prompt: "special", icon: "✨" },
    ],
  },
  style: {
    title: "Style",
    mode: "multi",
    options: [
      { id: "colorful", label: "colorful", prompt: "colorful", icon: "🌈" },
      { id: "cute", label: "cute", prompt: "cute", icon: "😊" },
      { id: "magical", label: "magical", prompt: "magical", icon: "✨" },
      { id: "clean", label: "clean", prompt: "clean", icon: "🧼" },
      { id: "cartoon", label: "cartoon", prompt: "cartoon", icon: "🎨" },
    ],
  },
  safety: {
    title: "Safety",
    mode: "multi",
    options: [
      { id: "fantasy-only", label: "fantasy only", prompt: "Fantasy only.", icon: "🏝️" },
      { id: "no-real-money", label: "no real money", prompt: "Do not copy real money.", icon: "🚫" },
      { id: "kid-friendly", label: "kid-friendly", prompt: "Kid-friendly.", icon: "🙂" },
    ],
  },
  fix: {
    title: "Prompt Fix",
    mode: "multi",
    options: [
      { id: "big-number", label: "big clear number", prompt: "Make the number big and clear in the center.", icon: "🔢" },
      { id: "main-symbol", label: "main symbol", prompt: "Make the symbol large and easy to see.", icon: "👀" },
      { id: "clean-background", label: "clean background", prompt: "Use a clean background with simple layout.", icon: "🧼" },
      { id: "more-island", label: "more island", prompt: "Add ocean waves and island plants.", icon: "🌊" },
    ],
  },
};

const DEFAULT_SELECTION = {
  value: "10-shells",
  symbol: "turtle",
  meaning: "teamwork",
  style: [],
  safety: ["fantasy-only", "no-real-money"],
  fix: [],
};

const STORAGE_KEY = "ai-mint-prompt-builder-state-v1";

const state = {
  selection: structuredClone(DEFAULT_SELECTION),
  prompt: "",
  versions: [],
  currencySet: null,
  weakMode: false,
  isGenerating: false,
  isGeneratingSet: false,
};

const GENERATION_MESSAGES = [
  "Mixing prompt blocks...",
  "Drawing the main symbol...",
  "Polishing the coin face...",
  "Saving image to the lab...",
];

const SET_VALUES = [
  { value: 5, label: "5 SHELLS", accent: "#57b9ff" },
  { value: 10, label: "10 SHELLS", accent: "#ff8a3d" },
  { value: 20, label: "20 SHELLS", accent: "#64c56a" },
  { value: 100, label: "100 SHELLS", accent: "#f0b83b" },
];

let generationMessageTimer = null;

const els = {
  blocks: document.querySelector("#blocks"),
  promptText: document.querySelector("#promptText"),
  promptStatus: document.querySelector("#promptStatus"),
  selectionSummary: document.querySelector("#selectionSummary"),
  buildButton: document.querySelector("#buildButton"),
  generateButton: document.querySelector("#generateButton"),
  copyButton: document.querySelector("#copyButton"),
  saveButton: document.querySelector("#saveButton"),
  generationStatus: document.querySelector("#generationStatus"),
  resetButton: document.querySelector("#resetButton"),
  weakButton: document.querySelector("#weakButton"),
  clearVersionsButton: document.querySelector("#clearVersionsButton"),
  mintSetButton: document.querySelector("#mintSetButton"),
  setStatus: document.querySelector("#setStatus"),
  setLab: document.querySelector("#setLab"),
  versionList: document.querySelector("#versionList"),
  versionTemplate: document.querySelector("#versionTemplate"),
};

function getSelectedOption(blockKey, optionId) {
  const option = BLOCKS[blockKey].options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Unknown option: ${blockKey}.${optionId}`);
  return option;
}

function selectedList(selection, blockKey) {
  const value = selection[blockKey];
  return Array.isArray(value) ? value : [value];
}

function cleanSelection(selection) {
  const next = structuredClone(DEFAULT_SELECTION);
  Object.entries(BLOCKS).forEach(([blockKey, block]) => {
    const value = selection?.[blockKey];
    if (block.mode === "single") {
      if (block.options.some((option) => option.id === value)) next[blockKey] = value;
      return;
    }
    if (Array.isArray(value)) {
      next[blockKey] = value.filter((id) => block.options.some((option) => option.id === id));
    }
  });
  return next;
}

function wordsFrom(selection, blockKey, field = "prompt") {
  return selectedList(selection, blockKey)
    .filter(Boolean)
    .map((id) => getSelectedOption(blockKey, id)[field]);
}

function joinWords(words) {
  if (words.length <= 1) return words[0] || "";
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(", ")}, and ${words.at(-1)}`;
}

function promptLine(parts) {
  return parts.map((part) => {
    if (typeof part === "string") return { text: part };
    return part;
  });
}

function buildPrompt(selection) {
  if (state.weakMode) return "Draw money.";

  const value = wordsFrom(selection, "value")[0];
  const symbol = wordsFrom(selection, "symbol")[0];
  const meaning = wordsFrom(selection, "meaning")[0];
  const styles = joinWords(wordsFrom(selection, "style"));
  const safety = wordsFrom(selection, "safety").join(" ");
  const fixes = wordsFrom(selection, "fix").join(" ");

  return [
    "Create fantasy island money for Lumi Island.",
    `The value is ${value}.`,
    `Add a ${symbol} symbol because it means ${meaning}.`,
    styles ? `Make it ${styles}.` : "",
    safety,
    fixes,
  ].filter(Boolean).join("\n");
}

function buildCurrencySetPrompt(selection) {
  const symbol = wordsFrom(selection, "symbol")[0];
  const meaning = wordsFrom(selection, "meaning")[0];
  const styles = joinWords(wordsFrom(selection, "style")) || "colorful, clean, and cute";

  return [
    "Create a cohesive fantasy island currency set design base for Lumi Island.",
    "Make one premium rectangular fantasy money artwork template, not four separate notes.",
    "Use one consistent visual system: shell border, ocean wave pattern, small island logo area, polished classroom display style.",
    `Use a ${symbol} motif because it means ${meaning}.`,
    `Style: ${styles}.`,
    "Leave clear space for large value numbers and SHELLS labels.",
    "No words, no numbers, no real money, no famous characters.",
    "Fantasy only. Kid-friendly.",
  ].join("\n");
}

function buildPromptParts(selection) {
  if (state.weakMode) return [[{ text: "Draw money." }]];

  const value = wordsFrom(selection, "value")[0];
  const symbol = wordsFrom(selection, "symbol")[0];
  const meaning = wordsFrom(selection, "meaning")[0];
  const styles = wordsFrom(selection, "style");
  const safety = wordsFrom(selection, "safety");
  const fixes = wordsFrom(selection, "fix");
  const lines = [
    promptLine(["Create fantasy island money for Lumi Island."]),
    promptLine(["The value is ", { text: value, role: "value" }, "."]),
    promptLine(["Add a ", { text: symbol, role: "symbol" }, " symbol because it means ", { text: meaning, role: "meaning" }, "."]),
  ];

  if (styles.length) {
    lines.push(promptLine(["Make it ", ...styles.flatMap((style, index) => [
      index > 0 ? (index === styles.length - 1 ? " and " : ", ") : "",
      { text: style, role: "style" },
    ]), "."]));
  }

  if (safety.length) {
    lines.push(promptLine(safety.flatMap((item, index) => [
      index > 0 ? " " : "",
      { text: item.replace(/\.$/, ""), role: "safety" },
      ".",
    ])));
  }

  if (fixes.length) {
    lines.push(promptLine(fixes.flatMap((fix, index) => [
      index > 0 ? " " : "",
      { text: fix.replace(/\.$/, ""), role: "fix" },
      ".",
    ])));
  }

  return lines;
}

function updateSelection(blockKey, optionId) {
  state.weakMode = false;
  const block = BLOCKS[blockKey];
  if (block.mode === "single") {
    state.selection = { ...state.selection, [blockKey]: optionId };
    return;
  }
  const current = selectedList(state.selection, blockKey);
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  state.selection = { ...state.selection, [blockKey]: next };
}

function getSelectionLabels(selection) {
  return Object.fromEntries(
    Object.keys(BLOCKS).map((blockKey) => [
      blockKey,
      wordsFrom(selection, blockKey, "label").join(", "),
    ]),
  );
}

function renderBlocks() {
  els.blocks.innerHTML = "";
  Object.entries(BLOCKS).forEach(([blockKey, block]) => {
    const section = document.createElement("section");
    section.className = "block";
    section.innerHTML = `
      <div class="block-head">
        <h3 class="block-title">${block.title}</h3>
        <span class="block-mode">${block.mode === "single" ? "pick one" : "pick many"}</span>
      </div>
      <div class="option-grid"></div>
    `;

    const grid = section.querySelector(".option-grid");
    block.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.block = blockKey;
      button.dataset.option = option.id;
      button.innerHTML = `
        <span class="icon">${option.icon}</span>
        <span class="label">${option.label}</span>
      `;
      button.addEventListener("click", () => {
        updateSelection(blockKey, option.id);
        render();
      });
      grid.append(button);
    });

    els.blocks.append(section);
  });
}

function renderSelections() {
  document.querySelectorAll(".option-button").forEach((button) => {
    const blockKey = button.dataset.block;
    const optionId = button.dataset.option;
    button.classList.toggle("is-selected", selectedList(state.selection, blockKey).includes(optionId));
  });
}

function renderPrompt() {
  if (!state.prompt) {
    els.promptText.textContent = state.weakMode ? "Draw money." : "Choose blocks, then press BUILD PROMPT.";
    els.promptStatus.textContent = state.weakMode ? "Weak prompt ready" : "Ready";
  } else {
    renderPromptTokens();
    els.promptStatus.textContent = state.weakMode ? "Weak prompt" : "Strong prompt";
  }

  const labels = getSelectionLabels(state.selection);
  els.selectionSummary.textContent = state.weakMode
    ? "Round 1: let AI guess"
    : [labels.value, labels.symbol, labels.meaning, labels.style].filter(Boolean).join(" · ");
}

function renderPromptTokens() {
  els.promptText.replaceChildren();
  const lines = buildPromptParts(state.selection);
  lines.forEach((line, lineIndex) => {
    const lineElement = document.createElement("div");
    lineElement.className = "prompt-line";
    line.forEach((part) => {
      const node = document.createElement("span");
      node.textContent = part.text;
      if (part.role) {
        node.className = "prompt-token";
        node.dataset.role = part.role;
      }
      lineElement.append(node);
    });
    els.promptText.append(lineElement);
    if (lineIndex < lines.length - 1) {
      els.promptText.append(document.createTextNode("\n"));
    }
  });
}

function setGenerationStatus(message) {
  els.generationStatus.textContent = message;
}

function startGenerationMessages() {
  let index = 0;
  setGenerationStatus(GENERATION_MESSAGES[index]);
  generationMessageTimer = setInterval(() => {
    index = (index + 1) % GENERATION_MESSAGES.length;
    setGenerationStatus(GENERATION_MESSAGES[index]);
  }, 1800);
}

function stopGenerationMessages() {
  clearInterval(generationMessageTimer);
  generationMessageTimer = null;
}

function labelsForCurrentPrompt() {
  return state.weakMode
    ? { value: "weak prompt", symbol: "", meaning: "", style: "", safety: "", fix: "" }
    : getSelectionLabels(state.selection);
}

function completedVersionCount() {
  return state.versions.filter((version) => !version.pending && version.source !== "failed").length;
}

function cleanStoredVersions(versions) {
  if (!Array.isArray(versions)) return [];
  return versions
    .filter((version) => version && !version.pending && version.source !== "pending")
    .slice(0, 12)
    .map((version, index, list) => ({
      number: Number(version.number) || list.length - index,
      prompt: String(version.prompt || ""),
      labels: version.labels && typeof version.labels === "object" ? { ...version.labels } : {},
      image: String(version.image || ""),
      imageRatio: Number.isFinite(Number(version.imageRatio)) ? Number(version.imageRatio) : 1,
      source: ["generated", "manual", "failed"].includes(version.source) ? version.source : "manual",
      error: version.error ? String(version.error) : "",
    }));
}

function cleanStoredCurrencySet(currencySet) {
  if (!currencySet || typeof currencySet !== "object") return null;
  const notes = Array.isArray(currencySet.notes)
    ? currencySet.notes
      .filter((note) => note && note.image && note.label)
      .slice(0, 4)
      .map((note) => ({
        value: Number(note.value) || 0,
        label: String(note.label || ""),
        accent: String(note.accent || "#ff8a3d"),
        image: String(note.image || ""),
      }))
    : [];
  if (notes.length !== 4) return null;
  return {
    prompt: String(currencySet.prompt || ""),
    baseImage: String(currencySet.baseImage || ""),
    labels: currencySet.labels && typeof currencySet.labels === "object" ? { ...currencySet.labels } : {},
    notes,
    createdAt: String(currencySet.createdAt || ""),
  };
}

function persistState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selection: state.selection,
        prompt: state.prompt,
        weakMode: state.weakMode,
        versions: cleanStoredVersions(state.versions),
        currencySet: cleanStoredCurrencySet(state.currencySet),
      }),
    );
  } catch {
    setGenerationStatus("Local save is full. Clear old versions before saving more.");
  }
}

function restoreState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") return;
    state.selection = cleanSelection(stored.selection);
    state.prompt = String(stored.prompt || "");
    state.weakMode = Boolean(stored.weakMode);
    state.versions = cleanStoredVersions(stored.versions);
    state.currencySet = cleanStoredCurrencySet(stored.currencySet);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function versionChips(version) {
  const keys = ["value", "symbol", "meaning", "style", "safety", "fix"];
  return keys
    .map((key) => version.labels[key])
    .filter(Boolean)
    .map((label) => `<span class="chip">${label}</span>`)
    .join("");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function clampImageRatio(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 1;
  return Math.min(2.35, Math.max(0.75, ratio));
}

function applyImageRatio(drop, ratio) {
  drop.style.setProperty("--image-ratio", clampImageRatio(ratio).toFixed(3));
}

function getImageRatioFromSource(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(clampImageRatio(image.naturalWidth / image.naturalHeight));
    });
    image.addEventListener("error", () => resolve(1));
    image.src = src;
  });
}

function watchImageRatio(img, drop, version) {
  img.addEventListener("load", () => {
    const ratio = clampImageRatio(img.naturalWidth / img.naturalHeight);
    version.imageRatio = ratio;
    applyImageRatio(drop, ratio);
    persistState();
  }, { once: true });
}

function attachDropHandlers(card, version) {
  const drop = card.querySelector(".image-drop");
  const input = card.querySelector("input");
  const img = card.querySelector("img");

  async function attachFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    version.image = await readFileAsDataUrl(file);
    version.imageRatio = await getImageRatioFromSource(version.image);
    applyImageRatio(drop, version.imageRatio);
    img.src = version.image;
    drop.classList.add("has-image");
    drop.classList.remove("is-over");
    persistState();
  }

  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") input.click();
  });
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("is-over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    attachFile(event.dataTransfer.files[0]);
  });
  input.addEventListener("change", () => attachFile(input.files[0]));
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => resolve(null));
    image.src = src;
  });
}

function drawImageCover(ctx, image, width, height) {
  if (!image) return;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}

function drawShellDots(ctx, width, height, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 11; i += 1) {
    const x = 52 + i * ((width - 104) / 10);
    ctx.beginPath();
    ctx.arc(x, 38, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, height - 38, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCurrencyNote(ctx, note, baseImage, labels) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.fillStyle = "#fff8ca";
  ctx.fillRect(0, 0, width, height);
  drawImageCover(ctx, baseImage, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = withAlpha(note.accent, 0.24);
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = withAlpha(note.accent, 0.9);
  ctx.fillRect(0, 0, width, 34);
  ctx.fillRect(0, height - 34, width, 34);

  ctx.strokeStyle = "#8c4019";
  ctx.lineWidth = 12;
  ctx.strokeRect(22, 22, width - 44, height - 44);
  ctx.lineWidth = 4;
  ctx.strokeRect(54, 58, width - 108, height - 116);
  drawShellDots(ctx, width, height, withAlpha(note.accent, 0.95));

  ctx.fillStyle = "#8c4019";
  ctx.font = "900 34px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LUMI ISLAND", width / 2, 88);
  ctx.font = "800 18px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("FANTASY CURRENCY", width / 2, 114);

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.strokeStyle = "#8c4019";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(width / 2 - 152, height / 2 - 100, 304, 178, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#241f1b";
  ctx.font = "950 112px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText(String(note.value), width / 2, height / 2 + 10);
  ctx.font = "900 34px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("SHELLS", width / 2, height / 2 + 58);

  const symbol = labels.symbol || "island";
  const meaning = labels.meaning || "trade";
  ctx.fillStyle = withAlpha(note.accent, 0.86);
  ctx.beginPath();
  ctx.arc(100, height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width - 100, height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8c4019";
  ctx.font = `900 ${symbol.length > 7 ? 16 : 22}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText(symbol.toUpperCase(), 100, height / 2 - 2);
  ctx.font = `850 ${meaning.length > 7 ? 15 : 18}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText(meaning.toUpperCase(), width - 100, height / 2 - 2);
}

async function composeCurrencyNotes(baseImageDataUrl, labels) {
  const baseImage = await loadCanvasImage(baseImageDataUrl);
  return SET_VALUES.map((note) => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    drawCurrencyNote(ctx, note, baseImage, labels);
    return {
      ...note,
      image: canvas.toDataURL("image/png"),
    };
  });
}

function renderSetStudio() {
  const count = completedVersionCount();
  const locked = count < 2;
  els.mintSetButton.disabled = locked || state.isGeneratingSet;
  els.mintSetButton.textContent = state.isGeneratingSet ? "MINTING SET..." : "MINT FULL SET";

  if (state.isGeneratingSet) {
    els.setStatus.textContent = "Minting one matching money system...";
  } else if (locked) {
    const needed = 2 - count;
    els.setStatus.textContent = needed === 2
      ? "Save 2 versions to unlock."
      : "Save 1 more version to unlock.";
  } else if (state.currencySet) {
    els.setStatus.textContent = "Full set ready. Compare the family look.";
  } else {
    els.setStatus.textContent = "Ready to mint a full set.";
  }

  els.setLab.innerHTML = "";
  if (!state.currencySet) return;

  const card = document.createElement("article");
  card.className = "currency-set-card";
  card.innerHTML = `
    <div class="currency-set-title">
      <strong>Lumi Island Money Set</strong>
      <button class="mini-copy" type="button">Copy Set Prompt</button>
    </div>
    <div class="currency-set-grid"></div>
  `;
  card.querySelector(".mini-copy").addEventListener("click", () => copyText(state.currencySet.prompt));
  const grid = card.querySelector(".currency-set-grid");
  state.currencySet.notes.forEach((note) => {
    const noteCard = document.createElement("article");
    noteCard.className = "currency-note";
    noteCard.style.setProperty("--accent", note.accent);
    noteCard.innerHTML = `
      <img src="${note.image}" alt="${note.label} Lumi Island money" />
      <strong>${note.label}</strong>
    `;
    grid.append(noteCard);
  });
  els.setLab.append(card);
}

function renderVersions() {
  els.versionList.innerHTML = "";
  if (!state.versions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Generate or save Version 1, 2, 3 to compare prompts and images.";
    els.versionList.append(empty);
    return;
  }

  state.versions.forEach((version) => {
    const fragment = els.versionTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".version-card");
    if (version.pending) card.classList.add("is-pending");
    if (version.source === "failed") card.classList.add("is-failed");
    fragment.querySelector(".version-pill").textContent = version.source === "pending"
      ? `Minting ${version.number}`
      : version.source === "generated"
      ? `AI Image ${version.number}`
      : `Version ${version.number}`;
    fragment.querySelector(".version-chips").innerHTML = versionChips(version);
    fragment.querySelector(".version-prompt").textContent = version.prompt;
    const copyButton = fragment.querySelector(".mini-copy");
    copyButton.addEventListener("click", () => copyText(version.prompt));
    const img = fragment.querySelector("img");
    const drop = fragment.querySelector(".image-drop");
    if (version.image) {
      applyImageRatio(drop, version.imageRatio);
      watchImageRatio(img, drop, version);
      img.src = version.image;
      drop.classList.add("has-image");
    }
    if (version.pending) {
      drop.classList.add("is-minting");
      drop.querySelector(".drop-empty").innerHTML = `
        <div class="mint-loader" aria-hidden="true">
          <span class="mint-coin"></span>
          <span class="mint-spark mint-spark-one"></span>
          <span class="mint-spark mint-spark-two"></span>
        </div>
        <span>Minting image</span>
        <small>prompt + image stay together</small>
      `;
    } else if (version.source === "failed") {
      drop.querySelector(".drop-empty").innerHTML = `
        <span>Image not generated</span>
        <small>${version.error || "try again"}</small>
      `;
    }
    attachDropHandlers(card, version);
    els.versionList.append(fragment);
  });
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 1800);
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Prompt copied");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("Prompt copied");
  }
}

function buildCurrentPrompt() {
  state.prompt = buildPrompt(state.selection);
  renderPrompt();
}

function saveVersion() {
  if (!state.prompt) buildCurrentPrompt();
  state.versions.unshift({
    number: state.versions.length + 1,
    prompt: state.prompt,
    labels: labelsForCurrentPrompt(),
    image: "",
    source: "manual",
  });
  renderSetStudio();
  renderVersions();
  persistState();
  showToast(`Version ${state.versions.length} saved`);
}

async function generateImage() {
  if (state.isGenerating) return;
  if (!state.prompt) buildCurrentPrompt();

  if (window.location.protocol === "file:") {
    setGenerationStatus("Open with local server for one-click image generation.");
    showToast("Use local server for Generate Image");
    return;
  }

  const pendingVersion = {
    number: state.versions.length + 1,
    prompt: state.prompt,
    labels: labelsForCurrentPrompt(),
    image: "",
    source: "pending",
    pending: true,
  };
  state.versions.unshift(pendingVersion);
  renderSetStudio();
  renderVersions();

  state.isGenerating = true;
  els.generateButton.disabled = true;
  els.generateButton.classList.add("is-loading");
  els.generateButton.textContent = "MINTING...";
  startGenerationMessages();

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: state.prompt,
        selection: state.selection,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Image generation failed.");

    pendingVersion.image = data.imageDataUrl;
    pendingVersion.imageRatio = await getImageRatioFromSource(data.imageDataUrl);
    pendingVersion.source = "generated";
    pendingVersion.pending = false;
    renderSetStudio();
    renderVersions();
    setGenerationStatus(`Image saved as AI Image ${pendingVersion.number}.`);
    persistState();
    showToast(`AI Image ${pendingVersion.number} saved`);
  } catch (error) {
    const message = error.message || "Image generation failed.";
    pendingVersion.source = "failed";
    pendingVersion.pending = false;
    pendingVersion.error = message;
    renderSetStudio();
    renderVersions();
    setGenerationStatus(message);
    persistState();
    showToast("Image not generated");
  } finally {
    stopGenerationMessages();
    state.isGenerating = false;
    els.generateButton.disabled = false;
    els.generateButton.classList.remove("is-loading");
    els.generateButton.textContent = "GENERATE IMAGE";
  }
}

async function generateCurrencySet() {
  if (state.isGeneratingSet) return;
  if (completedVersionCount() < 2) {
    renderSetStudio();
    showToast("Save 2 versions to unlock");
    return;
  }

  if (window.location.protocol === "file:") {
    els.setStatus.textContent = "Open with local server for one-click set minting.";
    showToast("Use local server for Mint Full Set");
    return;
  }

  const setPrompt = buildCurrencySetPrompt(state.selection);
  state.isGeneratingSet = true;
  renderSetStudio();
  startGenerationMessages();

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: setPrompt,
        selection: state.selection,
        mode: "currency-set",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Full set generation failed.");

    const labels = getSelectionLabels(state.selection);
    const notes = await composeCurrencyNotes(data.imageDataUrl, labels);
    state.currencySet = {
      prompt: setPrompt,
      baseImage: data.imageDataUrl,
      labels,
      notes,
      createdAt: new Date().toISOString(),
    };
    els.setStatus.textContent = "Full set ready. Compare the family look.";
    setGenerationStatus("Full money set saved in Image Lab.");
    persistState();
    showToast("Full money set ready");
  } catch (error) {
    const message = error.message || "Full set generation failed.";
    els.setStatus.textContent = message;
    setGenerationStatus(message);
    showToast("Set not generated");
  } finally {
    stopGenerationMessages();
    state.isGeneratingSet = false;
    renderSetStudio();
  }
}

function render({ resetPrompt = true } = {}) {
  renderSelections();
  if (resetPrompt) state.prompt = "";
  renderPrompt();
  if (resetPrompt) setGenerationStatus("Build a prompt, then generate in class.");
  renderSetStudio();
  persistState();
}

els.buildButton.addEventListener("click", () => {
  buildCurrentPrompt();
  persistState();
  showToast("Prompt built");
});
els.copyButton.addEventListener("click", () => copyText(state.prompt || buildPrompt(state.selection)));
els.generateButton.addEventListener("click", generateImage);
els.saveButton.addEventListener("click", saveVersion);
els.mintSetButton.addEventListener("click", generateCurrencySet);
els.weakButton.addEventListener("click", () => {
  state.weakMode = true;
  state.prompt = "Draw money.";
  renderSelections();
  renderPrompt();
  persistState();
  showToast("Weak prompt ready");
});
els.resetButton.addEventListener("click", () => {
  state.selection = structuredClone(DEFAULT_SELECTION);
  state.prompt = "";
  state.weakMode = false;
  render();
});
els.clearVersionsButton.addEventListener("click", () => {
  state.versions = [];
  state.currencySet = null;
  renderSetStudio();
  renderVersions();
  persistState();
});

restoreState();
renderBlocks();
render({ resetPrompt: false });
renderVersions();
renderSetStudio();
