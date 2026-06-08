const CUSTOM_OPTION_ID = "custom";

const DEFAULT_CUSTOM_VALUES = {
  value: "",
  symbol: "",
  meaning: "",
  style: "",
  safety: "",
  fix: "",
};

const CUSTOM_OPTION = { id: CUSTOM_OPTION_ID, label: "custom", prompt: "", icon: "✏️" };

const CUSTOM_PROMPT_FALLBACKS = {
  value: "custom value",
  symbol: "custom symbol",
  meaning: "special idea",
  style: "custom style",
  safety: "",
  fix: "",
};

const CUSTOM_PLACEHOLDERS = {
  value: "type value, e.g. 50 shells",
  symbol: "type symbol, e.g. rainbow bridge",
  meaning: "type meaning, e.g. courage",
  style: "type style, e.g. watercolor",
  safety: "type rule, e.g. no scary faces",
  fix: "type fix, e.g. simple border",
};

const BLOCKS = {
  value: {
    title: "Value",
    mode: "single",
    options: [
      { id: "5-shells", label: "5 shells", prompt: "5 shells", icon: "5" },
      { id: "10-shells", label: "10 shells", prompt: "10 shells", icon: "10" },
      { id: "20-shells", label: "20 shells", prompt: "20 shells", icon: "20" },
      { id: "100-shells", label: "100 shells", prompt: "100 shells", icon: "100" },
      CUSTOM_OPTION,
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
      CUSTOM_OPTION,
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
      CUSTOM_OPTION,
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
      CUSTOM_OPTION,
    ],
  },
  safety: {
    title: "Safety",
    mode: "multi",
    options: [
      { id: "fantasy-only", label: "fantasy only", prompt: "Fantasy only.", icon: "🏝️" },
      { id: "no-real-money", label: "no real money", prompt: "Do not copy real money.", icon: "🚫" },
      { id: "kid-friendly", label: "kid-friendly", prompt: "Kid-friendly.", icon: "🙂" },
      CUSTOM_OPTION,
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
      CUSTOM_OPTION,
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
  customValues: structuredClone(DEFAULT_CUSTOM_VALUES),
  prompt: "",
  versions: [],
  currencySet: null,
  studentName: "",
  posterImage: "",
  weakMode: false,
  isGenerating: false,
  isGeneratingSet: false,
  isMakingPoster: false,
};

const GENERATION_MESSAGES = [
  "Mixing prompt blocks...",
  "Drawing the main symbol...",
  "Polishing the coin face...",
  "Saving image to the lab...",
];

const SET_VALUES = [
  { value: 5, label: "5 SHELLS", accent: "#57b9ff", tone: "aqua blue", scene: "small starter details around the same main symbol" },
  { value: 10, label: "10 SHELLS", accent: "#ff8a3d", tone: "warm coral orange", scene: "small trade details around the same main symbol" },
  { value: 20, label: "20 SHELLS", accent: "#64c56a", tone: "fresh leaf green", scene: "small growth details around the same main symbol" },
  { value: 100, label: "100 SHELLS", accent: "#f0b83b", tone: "golden yellow with a little royal purple", scene: "small premium celebration details around the same main symbol" },
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
  makePosterButton: document.querySelector("#makePosterButton"),
  downloadPosterButton: document.querySelector("#downloadPosterButton"),
  printPosterButton: document.querySelector("#printPosterButton"),
  studentName: document.querySelector("#studentName"),
  setStatus: document.querySelector("#setStatus"),
  setLab: document.querySelector("#setLab"),
  posterStatus: document.querySelector("#posterStatus"),
  posterLab: document.querySelector("#posterLab"),
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

function cleanCustomValue(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanCustomValues(customValues) {
  return Object.fromEntries(
    Object.keys(BLOCKS).map((blockKey) => [
      blockKey,
      cleanCustomValue(customValues?.[blockKey]),
    ]),
  );
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
    .map((id) => {
      if (id === CUSTOM_OPTION_ID) {
        const custom = cleanCustomValue(state.customValues[blockKey]);
        if (custom) return custom;
        return field === "label" ? "custom" : CUSTOM_PROMPT_FALLBACKS[blockKey];
      }
      return getSelectedOption(blockKey, id)[field];
    })
    .filter(Boolean);
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

function buildCurrencySetPrompt(selection, step2Prompt = buildPrompt(selection)) {
  const labels = getSelectionLabels(selection);
  const styles = labels.style || "colorful, clean, and cute";
  const safety = labels.safety || "fantasy only, no real money, kid-friendly";
  const setValues = SET_VALUES.map((note) => note.value).join(", ");

  return [
    "Use this Step 2 prompt as the design brief:",
    step2Prompt.trim(),
    "",
    "Now expand the same block choices into one matching Lumi Island money system.",
    `Keep the selected symbol: ${labels.symbol}.`,
    `Keep the selected meaning: ${labels.meaning}.`,
    `Keep the selected style: ${styles}.`,
    `Keep the selected safety rules: ${safety}.`,
    `Change the single value into a full set of values: ${setValues} shells.`,
    "Make four related but not identical fantasy money notes.",
    "Each note should have a different value, color tone, and small scene motif while staying in one visual family.",
    "Create every note as a square 1:1 currency design, not a long horizontal banknote.",
    "Keep the whole note inside the square frame with safe margins.",
    "Use a consistent Lumi Island brand, border language, symbol style, and classroom-friendly illustration style.",
    "No words, no numbers, no real money, no famous characters.",
    "Fantasy only. Kid-friendly.",
  ].join("\n");
}

function buildCurrencyMasterPrompt(step2Prompt, masterValue) {
  return [
    "Use this Step 2 prompt as the design brief:",
    step2Prompt.trim(),
    "",
    `Create ONE square 1:1 Lumi Island fantasy money note for ${masterValue} shells.`,
    `The value must be exactly ${masterValue} shells.`,
    "Use a square 1:1 composition, not a long horizontal banknote.",
    "Keep the whole currency design inside the square frame with safe margins.",
    "Leave the bottom-right corner calm enough for a small denomination badge.",
    "Fantasy only. Kid-friendly. Do not copy real money. No famous characters.",
  ].join("\n");
}

function selectedValueNumber(selection) {
  return Number.parseInt(wordsFrom(selection, "value")[0], 10) || 0;
}

function buildCurrencyNotePrompt(selection, step2Prompt, note, masterValue) {
  const labels = getSelectionLabels(selection);
  const styles = labels.style || "colorful, clean, and cute";
  const safety = labels.safety || "fantasy only, no real money, kid-friendly";

  return [
    "Use this Step 2 prompt as the style brief:",
    step2Prompt.trim(),
    "",
    `The class already has a master note for ${masterValue} shells from the Step 2 prompt.`,
    `Create ONE sister note for the ${note.label} denomination.`,
    `The value must be exactly ${note.value} shells.`,
    `Show the number ${note.value} clearly and do not show any other denomination number.`,
    `Keep the selected symbol: ${labels.symbol}.`,
    `Keep the selected meaning: ${labels.meaning}.`,
    `Keep the selected style: ${styles}.`,
    `Keep the selected safety rules: ${safety}.`,
    `Use this denomination color tone: ${note.tone}.`,
    `Use this small denomination detail: ${note.scene}.`,
    "Use a square 1:1 composition, not a long horizontal banknote.",
    "Keep the whole currency design inside the square frame with safe margins.",
    "Leave the bottom-right corner calm enough for a small denomination badge.",
    "Match the master note closely: same overall composition, same central symbol placement, same border density, same line style, same cute classroom illustration style.",
    "Only change the denomination number, color tone, and small supporting details. Do not change the whole layout.",
    "Make it a sister note in the same money family, not a new poster, not a new scene, not a different art style.",
    "Fantasy only. Kid-friendly. Do not copy real money. No famous characters.",
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

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
      <label class="custom-row" data-custom-row="${blockKey}">
        <span>Custom word</span>
        <input
          type="text"
          data-custom-block="${blockKey}"
          maxlength="48"
          autocomplete="off"
          spellcheck="false"
          placeholder="${CUSTOM_PLACEHOLDERS[blockKey]}"
          value="${escapeAttribute(state.customValues[blockKey])}"
        />
      </label>
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

    const input = section.querySelector(`[data-custom-block="${blockKey}"]`);
    input.addEventListener("focus", () => {
      if (selectedList(state.selection, blockKey).includes(CUSTOM_OPTION_ID)) return;
      updateSelection(blockKey, CUSTOM_OPTION_ID);
      render();
    });
    input.addEventListener("input", () => {
      state.weakMode = false;
      state.customValues = {
        ...state.customValues,
        [blockKey]: input.value,
      };
      state.prompt = "";
      renderSelections();
      renderPrompt();
      renderSetStudio();
      persistState();
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
  document.querySelectorAll(".custom-row").forEach((row) => {
    const blockKey = row.dataset.customRow;
    const input = row.querySelector("input");
    const isActive = selectedList(state.selection, blockKey).includes(CUSTOM_OPTION_ID);
    row.classList.toggle("is-active", isActive);
    input.disabled = !isActive;
    if (input.value !== state.customValues[blockKey]) input.value = state.customValues[blockKey] || "";
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

function isCanvasSafeImageSource(src) {
  return typeof src === "string" && src.startsWith("data:image/");
}

function findGeneratedVersionForPrompt(prompt) {
  const cleanPrompt = String(prompt || "").trim();
  return state.versions.find((version) => (
    version
    && version.source === "generated"
    && isCanvasSafeImageSource(version.image)
    && !version.pending
    && String(version.prompt || "").trim() === cleanPrompt
  ));
}

function findVersionByNumber(number) {
  return state.versions.find((version) => Number(version.number) === Number(number));
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
        ratio: Number.isFinite(Number(note.ratio)) ? Number(note.ratio) : 12 / 7,
        source: String(note.source || ""),
        versionNumber: Number(note.versionNumber) || 0,
        prompt: String(note.prompt || ""),
      }))
    : [];
  if (notes.length !== 4) return null;
  return {
    prompt: String(currencySet.prompt || ""),
    sourcePrompt: String(currencySet.sourcePrompt || ""),
    baseImage: String(currencySet.baseImage || ""),
    baseImageSource: String(currencySet.baseImageSource || ""),
    masterVersionNumber: Number(currencySet.masterVersionNumber) || 0,
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
        customValues: cleanCustomValues(state.customValues),
        prompt: state.prompt,
        weakMode: state.weakMode,
        studentName: state.studentName,
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
    state.customValues = cleanCustomValues(stored.customValues);
    state.prompt = String(stored.prompt || "");
    state.weakMode = Boolean(stored.weakMode);
    state.studentName = String(stored.studentName || "");
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

function drawImageContain(ctx, image, width, height, padding = 24) {
  if (!image) return;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const scale = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, dx, dy, dw, dh);
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

  ctx.strokeStyle = withAlpha(note.accent, 0.92);
  ctx.lineWidth = Math.max(8, Math.round(width * 0.014));
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.strokeStyle = "#8c4019";
  ctx.lineWidth = Math.max(3, Math.round(width * 0.005));
  ctx.strokeRect(28, 28, width - 56, height - 56);

  const badgeHeight = Math.max(56, Math.min(92, Math.round(height * 0.16)));
  const badgeWidth = Math.max(190, Math.min(width - 64, Math.round(width * 0.42 + String(note.value).length * 18)));
  const badgeX = width / 2 - badgeWidth / 2;
  const badgeY = height - badgeHeight - Math.max(22, Math.round(height * 0.045));

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 18);
  ctx.fill();
  ctx.strokeStyle = withAlpha(note.accent, 0.95);
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "#241f1b";
  ctx.textAlign = "center";
  ctx.font = `950 ${Math.round(badgeHeight * 0.58)}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText(String(note.value), width / 2, badgeY + Math.round(badgeHeight * 0.55));
  ctx.font = `900 ${Math.round(badgeHeight * 0.2)}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText("SHELLS", width / 2, badgeY + Math.round(badgeHeight * 0.82));
}

async function composeCurrencyNotes(baseImageDataUrl, labels) {
  const baseImage = await loadCanvasImage(baseImageDataUrl);
  const ratio = baseImage
    ? clampImageRatio(baseImage.naturalWidth / baseImage.naturalHeight)
    : 12 / 7;
  return SET_VALUES.map((note) => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = Math.round(canvas.width / ratio);
    const ctx = canvas.getContext("2d");
    drawCurrencyNote(ctx, note, baseImage, labels);
    return {
      ...note,
      ratio,
      image: canvas.toDataURL("image/png"),
    };
  });
}

async function prepareCurrencySetNote(generatedImageDataUrl, note) {
  const image = await loadCanvasImage(generatedImageDataUrl);
  const sourceRatio = image
    ? clampImageRatio(image.naturalWidth / image.naturalHeight)
    : 1;
  const ratio = 1;
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff8ca";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (Math.abs(sourceRatio - 1) <= 0.12) {
    drawImageCover(ctx, image, canvas.width, canvas.height);
  } else {
    drawImageContain(ctx, image, canvas.width, canvas.height, 24);
  }

  const badgeHeight = Math.max(48, Math.min(72, Math.round(canvas.height * 0.12)));
  const badgeWidth = Math.max(150, Math.min(230, Math.round(canvas.width * 0.28 + String(note.value).length * 18)));
  const badgeX = canvas.width - badgeWidth - 24;
  const badgeY = canvas.height - badgeHeight - 24;

  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 14);
  ctx.fill();
  ctx.strokeStyle = withAlpha(note.accent, 0.95);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#241f1b";
  ctx.textAlign = "center";
  ctx.font = `950 ${Math.round(badgeHeight * 0.52)}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText(String(note.value), badgeX + badgeWidth / 2, badgeY + Math.round(badgeHeight * 0.5));
  ctx.font = `900 ${Math.round(badgeHeight * 0.18)}px Arial Rounded MT Bold, Arial, sans-serif`;
  ctx.fillText("SHELLS", badgeX + badgeWidth / 2, badgeY + Math.round(badgeHeight * 0.78));

  return {
    ...note,
    ratio,
    image: canvas.toDataURL("image/jpeg", 0.88),
  };
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
    els.setStatus.textContent = state.currencySet.baseImageSource
      ? `Full set ready from ${state.currencySet.baseImageSource}.`
      : "Full set ready. Compare the family look.";
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
    <div class="currency-set-bridge">
      <span>Built from Step 2 Prompt</span>
      <small>Master note style kept, set badge added</small>
      <pre></pre>
    </div>
    <div class="currency-set-grid"></div>
  `;
  card.querySelector(".mini-copy").addEventListener("click", () => copyText(state.currencySet.prompt));
  card.querySelector(".currency-set-bridge pre").textContent = state.currencySet.sourcePrompt || state.currencySet.prompt;
  const grid = card.querySelector(".currency-set-grid");
  state.currencySet.notes.forEach((note) => {
    const linkedVersion = note.versionNumber ? findVersionByNumber(note.versionNumber) : null;
    const imageSource = note.image || linkedVersion?.image || "";
    const noteCard = document.createElement("article");
    noteCard.className = "currency-note";
    noteCard.style.setProperty("--accent", note.accent);
    noteCard.style.setProperty("--note-ratio", String(note.ratio || linkedVersion?.imageRatio || 12 / 7));
    noteCard.innerHTML = `
      <img src="${imageSource}" alt="${note.label} Lumi Island money" />
      <strong>${note.label}</strong>
    `;
    grid.append(noteCard);
  });
  els.setLab.append(card);
}

function posterImageVersions() {
  return state.versions
    .filter((version) => (
      version
      && !version.pending
      && version.source !== "failed"
      && isCanvasSafeImageSource(version.image)
    ))
    .sort((a, b) => Number(a.number) - Number(b.number));
}

function hasPosterInputs() {
  return posterImageVersions().length > 0 || Boolean(state.currencySet?.notes?.length);
}

function posterLabels() {
  const finalVersion = posterImageVersions().at(-1);
  return state.currencySet?.labels
    || finalVersion?.labels
    || labelsForCurrentPrompt()
    || getSelectionLabels(state.selection);
}

function posterRecipeChips(labels) {
  return ["value", "symbol", "meaning", "style", "safety", "fix"]
    .map((key) => labels?.[key])
    .filter(Boolean);
}

function describePromptChange(previous, current, index) {
  if (!previous) return index === 0 ? "First try" : "New idea";
  const order = ["value", "symbol", "meaning", "style", "fix", "safety"];
  const changed = order.find((key) => previous.labels?.[key] !== current.labels?.[key] && current.labels?.[key]);
  if (!changed) return "Prompt improved";
  if (changed === "fix") return "Added a fix";
  return `Changed ${changed}`;
}

function posterJourneySteps() {
  const versions = posterImageVersions();
  if (versions.length <= 3) return versions;
  return [versions[0], versions.at(-2), versions.at(-1)];
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const lines = wrapCanvasText(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function drawPosterBox(ctx, x, y, width, height, fill = "#ffffff", stroke = "#8c4019", lineWidth = 6) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();
}

function drawPosterChip(ctx, label, x, y, maxWidth = 320) {
  ctx.font = "900 28px Arial Rounded MT Bold, Arial, sans-serif";
  const width = Math.min(maxWidth, Math.max(124, ctx.measureText(label).width + 42));
  drawPosterBox(ctx, x, y, width, 54, "#fff8ca", "#8c4019", 4);
  ctx.fillStyle = "#8c4019";
  ctx.textAlign = "center";
  ctx.fillText(label, x + width / 2, y + 36);
  return width;
}

function drawPosterImage(ctx, image, x, y, width, height, fill = "#fffaf0") {
  drawPosterBox(ctx, x, y, width, height, fill, "#8c4019", 6);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 16, y + 16, width - 32, height - 32);
  ctx.clip();
  ctx.translate(x + 16, y + 16);
  drawImageContain(ctx, image, width - 32, height - 32, 0);
  ctx.restore();
}

async function drawJourneySection(ctx, steps, x, y, width) {
  ctx.fillStyle = "#8c4019";
  ctx.font = "950 46px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Prompt Journey", x, y);

  const cardGap = 30;
  const cardWidth = Math.floor((width - cardGap * 2) / 3);
  const cardHeight = 390;
  const labels = ["First Try", "Better Prompt", "Final Image"];

  for (let index = 0; index < 3; index += 1) {
    const version = steps[index] || steps.at(-1);
    const left = x + index * (cardWidth + cardGap);
    drawPosterBox(ctx, left, y + 58, cardWidth, cardHeight, index === 0 ? "#ffe5e5" : index === 1 ? "#dff4ff" : "#e6f7d9");
    ctx.fillStyle = "#8c4019";
    ctx.font = "950 30px Arial Rounded MT Bold, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[index], left + cardWidth / 2, y + 102);

    if (version?.image) {
      const image = await loadCanvasImage(version.image);
      drawPosterImage(ctx, image, left + 26, y + 124, cardWidth - 52, 210, "#ffffff");
      ctx.fillStyle = "#8c4019";
      ctx.font = "900 24px Arial Rounded MT Bold, Arial, sans-serif";
      ctx.textAlign = "center";
      const note = describePromptChange(steps[index - 1], version, index);
      ctx.fillText(note, left + cardWidth / 2, y + 368);
      ctx.font = "850 20px Arial, sans-serif";
      drawWrappedText(ctx, version.labels?.style || version.labels?.symbol || version.prompt, left + cardWidth / 2, y + 402, cardWidth - 60, 24, 2);
    } else {
      ctx.fillStyle = "#8c4019";
      ctx.font = "900 25px Arial Rounded MT Bold, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add one more image", left + cardWidth / 2, y + 236);
    }
  }
}

async function drawFinalSetSection(ctx, x, y, width, labels) {
  ctx.fillStyle = "#8c4019";
  ctx.font = "950 46px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Final Money", x, y);

  const setBoxWidth = Math.floor(width * 0.58);
  const recipeX = x + setBoxWidth + 34;
  drawPosterBox(ctx, x, y + 58, setBoxWidth, 560, "#ffffff");

  if (state.currencySet?.notes?.length) {
    const gap = 22;
    const noteW = Math.floor((setBoxWidth - 72 - gap) / 2);
    const noteH = 206;
    for (let index = 0; index < state.currencySet.notes.length; index += 1) {
      const note = state.currencySet.notes[index];
      const col = index % 2;
      const row = Math.floor(index / 2);
      const noteX = x + 28 + col * (noteW + gap);
      const noteY = y + 88 + row * (noteH + 58);
      const linkedVersion = note.versionNumber ? findVersionByNumber(note.versionNumber) : null;
      const image = await loadCanvasImage(note.image || linkedVersion?.image || "");
      drawPosterImage(ctx, image, noteX, noteY, noteW, noteH, "#fff8ca");
      ctx.fillStyle = "#8c4019";
      ctx.font = "950 27px Arial Rounded MT Bold, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(note.label, noteX + noteW / 2, noteY + noteH + 36);
    }
  } else {
    const finalVersion = posterImageVersions().at(-1);
    const image = await loadCanvasImage(finalVersion?.image || "");
    drawPosterImage(ctx, image, x + 44, y + 100, setBoxWidth - 88, 396, "#fff8ca");
    ctx.fillStyle = "#8c4019";
    ctx.font = "950 30px Arial Rounded MT Bold, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Final Image", x + setBoxWidth / 2, y + 548);
  }

  drawPosterBox(ctx, recipeX, y + 58, width - setBoxWidth - 34, 560, "#fff8ca");
  ctx.fillStyle = "#8c4019";
  ctx.font = "950 34px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Prompt Recipe", recipeX + 36, y + 112);
  let chipX = recipeX + 36;
  let chipY = y + 154;
  posterRecipeChips(labels).slice(0, 7).forEach((chip) => {
    const chipWidth = Math.min(width - setBoxWidth - 108, Math.max(142, chip.length * 18 + 46));
    if (chipX + chipWidth > x + width - 30) {
      chipX = recipeX + 36;
      chipY += 68;
    }
    drawPosterChip(ctx, chip, chipX, chipY, chipWidth);
    chipX += chipWidth + 16;
  });

  ctx.fillStyle = "#c00000";
  ctx.font = "950 31px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Today I Learned", recipeX + 36, y + 428);
  ctx.fillStyle = "#241f1b";
  ctx.font = "900 28px Arial Rounded MT Bold, Arial, sans-serif";
  drawWrappedText(ctx, "Clear words help AI create better pictures.", recipeX + 36, y + 472, width - setBoxWidth - 108, 38, 3);
}

async function composePosterImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2263;
  const ctx = canvas.getContext("2d");
  const labels = posterLabels();
  const designer = cleanCustomValue(state.studentName) || "Junior AI Mint Designer";

  ctx.fillStyle = "#faf6f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ff7a1a";
  ctx.fillRect(0, 0, canvas.width, 34);
  ctx.fillStyle = "#0fb2ee";
  ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
  ctx.strokeStyle = "#8c4019";
  ctx.lineWidth = 12;
  ctx.strokeRect(48, 56, canvas.width - 96, canvas.height - 112);

  ctx.fillStyle = "#8c4019";
  ctx.textAlign = "center";
  ctx.font = "950 82px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("MY AI MINT POSTER", canvas.width / 2, 166);
  ctx.font = "900 34px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText(designer, canvas.width / 2, 220);

  drawPosterBox(ctx, 270, 256, 1060, 72, "#fff8ca", "#8c4019", 5);
  ctx.fillStyle = "#8c4019";
  ctx.font = "950 34px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("Better prompt  →  better image", canvas.width / 2, 303);

  await drawJourneySection(ctx, posterJourneySteps(), 112, 420, 1376);
  await drawFinalSetSection(ctx, 112, 982, 1376, labels);

  drawPosterBox(ctx, 112, 1710, 1376, 320, "#dff4ff", "#8c4019", 6);
  ctx.fillStyle = "#8c4019";
  ctx.textAlign = "left";
  ctx.font = "950 44px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("My Design Sentence", 164, 1772);
  ctx.fillStyle = "#241f1b";
  ctx.font = "900 32px Arial Rounded MT Bold, Arial, sans-serif";
  const sentence = `My island money uses ${labels.symbol || "a symbol"} to show ${labels.meaning || "an idea"}.`;
  drawWrappedText(ctx, sentence, 164, 1830, 1268, 46, 3);
  ctx.fillStyle = "#8c4019";
  ctx.font = "900 28px Arial Rounded MT Bold, Arial, sans-serif";
  drawWrappedText(ctx, "I tested prompts, compared images, and improved my design.", 164, 1950, 1268, 38, 2);

  ctx.fillStyle = "#8c4019";
  ctx.textAlign = "center";
  ctx.font = "900 24px Arial Rounded MT Bold, Arial, sans-serif";
  ctx.fillText("Lumi Finance AI · Lesson 6 · AI Mint Studio", canvas.width / 2, 2138);

  return canvas.toDataURL("image/png");
}

function renderPosterStudio() {
  if (els.studentName && els.studentName.value !== state.studentName) {
    els.studentName.value = state.studentName || "";
  }

  const ready = hasPosterInputs();
  els.makePosterButton.disabled = !ready || state.isMakingPoster;
  els.makePosterButton.textContent = state.isMakingPoster ? "MAKING..." : "MAKE POSTER";
  els.downloadPosterButton.disabled = !state.posterImage;
  els.printPosterButton.disabled = !state.posterImage;

  if (state.isMakingPoster) {
    els.posterStatus.textContent = "Arranging images, prompt blocks, and final money...";
  } else if (state.posterImage) {
    els.posterStatus.textContent = "Poster ready. Download or print it for take-home sharing.";
  } else if (ready) {
    const imageCount = posterImageVersions().length;
    els.posterStatus.textContent = state.currencySet
      ? "Ready to make a poster with the money set."
      : `Ready to make a poster with ${imageCount} image${imageCount === 1 ? "" : "s"}.`;
  } else {
    els.posterStatus.textContent = "Generate one image to unlock.";
  }

  els.posterLab.innerHTML = "";
  if (!state.posterImage) return;
  const image = document.createElement("img");
  image.src = state.posterImage;
  image.alt = "AI Mint Studio take-home poster";
  els.posterLab.append(image);
}

async function makePoster() {
  if (!hasPosterInputs() || state.isMakingPoster) {
    showToast("Generate one image first");
    return;
  }
  state.isMakingPoster = true;
  renderPosterStudio();
  try {
    state.posterImage = await composePosterImage();
    showToast("Poster ready");
  } catch {
    state.posterImage = "";
    showToast("Poster not made");
    els.posterStatus.textContent = "Poster could not be made. Try again after images finish loading.";
  } finally {
    state.isMakingPoster = false;
    renderPosterStudio();
  }
}

async function downloadPoster() {
  if (!state.posterImage) await makePoster();
  if (!state.posterImage) return;
  const link = document.createElement("a");
  const name = cleanCustomValue(state.studentName) || "ai-mint-poster";
  link.href = state.posterImage;
  link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-mint-poster"}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  showToast("Poster downloaded");
}

async function printPoster() {
  if (!state.posterImage) await makePoster();
  if (!state.posterImage) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Download poster instead");
    return;
  }
  printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <title>AI Mint Poster</title>
        <style>
          body { margin: 0; background: #faf6f3; display: grid; min-height: 100vh; place-items: center; }
          img { width: min(100vw, 900px); height: auto; display: block; }
          @media print {
            body { background: white; }
            img { width: 100%; }
          }
        </style>
      </head>
      <body><img src="${state.posterImage}" alt="AI Mint Studio poster" /></body>
    </html>
  `);
  printWindow.document.close();
  printWindow.addEventListener("load", () => printWindow.print(), { once: true });
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
  state.posterImage = "";
  state.versions.unshift({
    number: state.versions.length + 1,
    prompt: state.prompt,
    labels: labelsForCurrentPrompt(),
    image: "",
    source: "manual",
  });
  renderSetStudio();
  renderPosterStudio();
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
  state.posterImage = "";
  state.versions.unshift(pendingVersion);
  renderSetStudio();
  renderPosterStudio();
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
    renderPosterStudio();
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
    renderPosterStudio();
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

  if (!state.prompt) buildCurrentPrompt();
  const sourcePrompt = state.prompt;
  const setPrompt = buildCurrencySetPrompt(state.selection, sourcePrompt);
  const masterValue = selectedValueNumber(state.selection);
  const labels = getSelectionLabels(state.selection);
  let masterVersion = findGeneratedVersionForPrompt(sourcePrompt);
  state.posterImage = "";
  state.isGeneratingSet = true;
  renderSetStudio();
  renderPosterStudio();
  startGenerationMessages();

  try {
    if (!masterVersion) {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildCurrencyMasterPrompt(sourcePrompt, masterValue),
          selection: state.selection,
          denomination: masterValue,
          mode: "currency-set-master",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Master note generation failed.");

      masterVersion = {
        number: state.versions.length + 1,
        prompt: sourcePrompt,
        labels,
        image: data.imageDataUrl,
        imageRatio: await getImageRatioFromSource(data.imageDataUrl),
        source: "generated",
      };
      state.versions.unshift(masterVersion);
      renderPosterStudio();
      renderVersions();
    }

    const notes = await Promise.all(SET_VALUES.map(async (note) => {
      if (note.value === masterValue) {
        return prepareCurrencySetNote(masterVersion.image, {
          ...note,
          source: "master",
          versionNumber: masterVersion.number,
          prompt: sourcePrompt,
        });
      }

      const notePrompt = buildCurrencyNotePrompt(state.selection, sourcePrompt, note, masterValue);
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: notePrompt,
          selection: state.selection,
          denomination: note.value,
          mode: "currency-set-note",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `${note.label} generation failed.`);

      return prepareCurrencySetNote(data.imageDataUrl, { ...note, prompt: notePrompt });
    }));
    state.currencySet = {
      prompt: setPrompt,
      sourcePrompt,
      baseImage: masterVersion.image,
      baseImageSource: `AI Image ${masterVersion.number}`,
      masterVersionNumber: masterVersion.number,
      labels,
      notes,
      createdAt: new Date().toISOString(),
    };
    els.setStatus.textContent = `Full set ready from AI Image ${masterVersion.number}.`;
    setGenerationStatus(`Full money set built from master AI Image ${masterVersion.number}.`);
    persistState();
    renderPosterStudio();
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
    renderPosterStudio();
  }
}

function render({ resetPrompt = true } = {}) {
  renderSelections();
  if (resetPrompt) state.prompt = "";
  renderPrompt();
  if (resetPrompt) setGenerationStatus("Build a prompt, then generate in class.");
  renderSetStudio();
  renderPosterStudio();
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
els.makePosterButton.addEventListener("click", makePoster);
els.downloadPosterButton.addEventListener("click", downloadPoster);
els.printPosterButton.addEventListener("click", printPoster);
els.studentName.addEventListener("input", () => {
  state.studentName = els.studentName.value;
  state.posterImage = "";
  renderPosterStudio();
  persistState();
});
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
  state.customValues = structuredClone(DEFAULT_CUSTOM_VALUES);
  state.prompt = "";
  state.weakMode = false;
  render();
});
els.clearVersionsButton.addEventListener("click", () => {
  state.versions = [];
  state.currencySet = null;
  state.posterImage = "";
  renderSetStudio();
  renderPosterStudio();
  renderVersions();
  persistState();
});

restoreState();
renderBlocks();
render({ resetPrompt: false });
renderVersions();
renderSetStudio();
renderPosterStudio();
