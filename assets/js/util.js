// util.js
// Pure game logic helpers (no DOM, no fetch)

// ===============================
// AUTO-REVEAL CHARACTERS
// ===============================

export const AUTO_REVEAL = new Set([
  ".", ",", ";", ":", "?", "!", "-", "—", "…",
  "'", "’", "”", "\"", "(", ")", "[", "]", "{", "}", " "
]);

// ===============================
// MASK RENDERING
// ===============================

export function renderMask(secret, guessed) {
  return secret
    .split("")
    .map(ch => guessed.has(ch) || AUTO_REVEAL.has(ch) ? ch : "_")
    .join(" ");
}

// ===============================
// WIN CHECK
// ===============================

export function isWin(secret, guessed) {
  for (const ch of secret) {
    if (/[a-z]/i.test(ch) && !guessed.has(ch)) return false;
  }
  return true;
}

// ===============================
// INPUT PARSING
// ===============================

export function parseGuess(input) {
  const value = (input || "").trim().toLowerCase();

  if (!value) return { type: "invalid" };
  if (value.includes("hint")) return { type: "hint" };
  if (value.includes("exit") || value.includes("quit")) return { type: "quit" };

  if (value.length === 1 && /^[a-z]$/.test(value)) {
    return { type: "letter", letter: value };
  }

  return { type: "invalid" };
}

// ===============================
// HINT SELECTION
// ===============================

export function pickHint(guessed, secret) {
  const missing = [];

  for (const ch of secret) {
    if (/[a-z]/i.test(ch) && !guessed.has(ch)) {
      missing.push(ch.toLowerCase());
    }
  }

  return missing.length
    ? missing[Math.floor(Math.random() * missing.length)]
    : null;
}

// ===============================
// WORD SELECTION HELPERS
// ===============================

export function chooseRandom(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function filterWordsByLength(words, minLen, maxLen) {
  return (words || []).filter(
    w => w.length >= minLen && w.length <= maxLen
  );
}

// ===============================
// DIFFICULTY CONFIG
// ===============================

export function getDifficultyConfig(difficulty, baseTries = 6) {
  switch (difficulty) {
    case "e":
      return { tries: baseTries + 3, minLen: 4, maxLen: 5, freeHints: 0 };
    case "m":
      return { tries: baseTries,     minLen: 5, maxLen: 7, freeHints: 1 };
    case "h":
      return { tries: baseTries - 3, minLen: 7, maxLen: 15, freeHints: 2 };
    default:
      throw new Error("Invalid difficulty");
  }
}

// ===============================
// PHRASE MODE CONFIG
// ===============================

export function getPhraseModeConfig() {
  return { tries: 9, minLen: 11, freeHints: 2 };
}

// ===============================
// GAME CONFIG BUILDER
// ===============================

export function buildGameConfig({
  words,
  phraseMode,
  difficulty,
  baseTries = 6
}) {
  let filteredWords;
  let tries;
  let freeHints;

  if (phraseMode) {
    const cfg = getPhraseModeConfig();
    filteredWords = words.filter(w => w.length >= cfg.minLen);
    tries = cfg.tries;
    freeHints = cfg.freeHints;
  } else {
    const cfg = getDifficultyConfig(difficulty, baseTries);
    filteredWords = filterWordsByLength(words, cfg.minLen, cfg.maxLen);
    tries = cfg.tries;
    freeHints = cfg.freeHints;
  }

  const secret = chooseRandom(filteredWords);

  if (!secret) {
    throw new Error("No words available for the selected settings.");
  }

  return {
    secret,
    tries,
    freeHints
  };
}
