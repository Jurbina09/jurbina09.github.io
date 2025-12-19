// config.js
// Browser-safe replacement for config.py

// ===============================
// GALLOWS ART (by difficulty)
// ===============================

const GALLOWS = {
  e: [
`+---+
    |
    |
    |
    |
   ===`,
`+---+
(   |
    |
    |
    |
   ===`,
`+---+
(_  |
    |
    |
    |
   ===`,
`+---+
(_) |
    |
    |
    |
   ===`,
`+---+
(_) |
/   |
    |
    |
   ===`,
`+---+
(_) |
/|  |
    |
    |
   ===`,
`+---+
(_) |
/|\\ |
    |
    |
   ===`,
`+---+
(_) |
/|\\ |
 |  |
    |
   ===`,
`+---+
(_) |
/|\\ |
 |  |
/   |
   ===`,
`+---+
(_) |
/|\\ |
|   |
/ \\ |
    ===`
  ],

  m: [
`+---+
    |
    |
    |
   ===`,
`+---+
O   |
    |
    |
   ===`,
`+---+
O   |
|   |
    |
   ===`,
`+---+
O   |
/|   |
    |
   ===`,
`+---+
O   |
/|\\  |
    |
   ===`,
`+---+
O   |
/|\\  |
/    |
   ===`,
`+---+
O   |
/|\\  |
/ \\  |
   ===`
  ],

  h: [
`+---+
    |
    |
    |
   ===`,
`+---+
O   |
    |
    |
   ===`,
`+---+
O   |
/|\\  |
    |
   ===`,
`+---+
O   |
/|\\  |
/ \\  |
   ===`
  ]
};

// ===============================
// GALLOWS ACCESSOR
// ===============================

export function getGallowsArt(errors, difficulty) {
  const pics = GALLOWS[difficulty];
  if (!pics) return "";
  return pics[Math.min(errors, pics.length - 1)];
}

// ===============================
// PHRASE MODE LOADER
// ===============================

export async function loadPhraseMode(url) {
  const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to load phrase file (${response.status}): ${url}`);
}

const text = await response.text();

if (
  text.trim().startsWith("<!DOCTYPE html") ||
  text.includes("<h1>File not found</h1>")
) {
  throw new Error(`Phrase file fetch returned HTML instead of text: ${url}`);
}


  let phrase = "";

  for (const line of text.split("\n")) {
    if (line.length > 15 && line.length < 30) {
      phrase += line.trim();
    }
  }

  return phrase
    .split(".")
    .map(p => p.trim())
    .filter(Boolean);
}