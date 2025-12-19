// hangman.js
// UI + glue layer

import { buildGameConfig } from "./util.js";
import { createGameState, processGuess, getDisplayState } from "./gameloop.js";
import { getGallowsArt, loadPhraseMode } from "./config.js";


document.getElementById("playerName")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("startBtn").click();
    }
  });

// ===============================
// ASCII BANNER
// ===============================
/*
const FRANKENSTEIN_BANNER = `
*****************************************************
Phrase mode will include snippets from Mary Shelly's
*****************************************************


<pre class="ascii-art">
  ______               _                  _       _
 |  ____|             | |                | |     (_)
 | |__ _ __ __ _ _ __ | | _____ _ __  ___| |_ ___ _ _ __
 |  __| '__/ _' | '_ \| |/ / _ \ '_ \/ __| __/ _ \ | '_ \
 | |  | | | (_| | | | |   <  __/ | | \__ \ ||  __/ | | | |
 |_|  |_|  \__,_|_| |_|_|\_\___|_| |_|___/\__\___|_|_| |_|
`
*/

const FRANKENSTEIN_HEADLINE = 
`
*****************************************************
Phrase mode will include snippets from Mary Shelly's
*****************************************************
`;
const FRANKENSTEIN_BANNER = `
  ______               _                  _       _
 |  ____|             | |                | |     (_)
 | |__ _ __ __ _ _ __ | | _____ _ __  ___| |_ ___ _ _ __
 |  __| '__/ _' | '_ \\| |/ / _ \\ '_ \\/ __| __/ _ \\ | '_ \\
 | |  | | | (_| | | | |   <  __/ | | \\__ \\ ||  __/ | | | |
 |_|  |_|  \\__,_|_| |_|_|\\_\\___|_| |_|___/\\__\\___|_|_| |_|
`;


// ===============================
// DOM ELEMENTS
// ===============================

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const newGameBtn = document.getElementById("newGameBtn");

const phraseModeCheckbox = document.getElementById("phraseMode");
const difficultySelect = document.getElementById("difficulty");

const gallowsEl = document.getElementById("gallows");
const wordEl = document.getElementById("word");
const missesEl = document.getElementById("misses");
const triesEl = document.getElementById("tries");
const hintsEl = document.getElementById("hints");
const messageEl = document.getElementById("message");

// Intro / prompt UI
const introEl = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const playerNameInput = document.getElementById("playerName");

const phrasePromptEl = document.getElementById("phrasePrompt");
const welcomeMessageEl = document.getElementById("welcomeMessage");
const bannerEl = document.getElementById("frankensteinBanner");
const phraseYesBtn = document.getElementById("phraseYes");
const phraseNoBtn = document.getElementById("phraseNo");

const gameEl = document.getElementById("game");

// ===============================
// SESSION STATE (CLI-style)
// ===============================

let playerName = "";
let phraseModeSelected = false;

let WORDS = [];
let PHRASES = [];
let gameState = null;

// ===============================
// DATA LOADING
// ===============================

async function loadWordList(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load word list (${response.status}): ${url}`);
  }

  const text = await response.text();

  if (
    text.trim().startsWith("<!DOCTYPE html") ||
    text.includes("<h1>File not found</h1>")
  ) {
    throw new Error(`Word list fetch returned HTML instead of text: ${url}`);
  }

  return text
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);
}

// ===============================
// INTRO FLOW
// ===============================

startBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  playerName = name;

  introEl.style.display = "none";
  phrasePromptEl.style.display = "block";

welcomeMessageEl.textContent =
  `Welcome, ${playerName}! Do you want to play phrase mode?\n\n${FRANKENSTEIN_HEADLINE}`;
});


bannerEl.textContent = FRANKENSTEIN_BANNER;

// ===============================
// PHRASE MODE CHOICE
// ===============================

phraseYesBtn.addEventListener("click", () => {
  phraseModeSelected = true;
  beginGame();
});

phraseNoBtn.addEventListener("click", () => {
  phraseModeSelected = false;
  beginGame();
});

function beginGame() {
  phrasePromptEl.style.display = "none";
  gameEl.style.display = "flex";

  phraseModeCheckbox.checked = phraseModeSelected;
  difficultySelect.disabled = phraseModeSelected;

  startNewGame();
}

// ===============================
// GAME SETUP
// ===============================

function startNewGame() {
  const phraseMode = phraseModeCheckbox.checked;
  const difficulty = difficultySelect.value;

  const sourceWords = phraseMode ? PHRASES : WORDS;

  const config = buildGameConfig({
    words: sourceWords,
    phraseMode,
    difficulty
  });

  gameState = createGameState({
    ...config,
    difficulty
  });

  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.value = "";

  render();
}

// ===============================
// RENDERING
// ===============================

function render() {
  const display = getDisplayState(gameState);

  gallowsEl.textContent = getGallowsArt(
    gameState.misses.size,
    gameState.difficulty
  );

  wordEl.textContent = display.mask;
  missesEl.textContent = `Misses: ${display.misses || "(none)"}`;
  triesEl.textContent = `Tries left: ${display.remaining}`;
  hintsEl.textContent = `Hints left: ${display.hints}`;
  messageEl.textContent = display.message;

  if (display.status !== "playing") {
    guessInput.disabled = true;
    guessBtn.disabled = true;
  }
}

// ===============================
// GAME EVENTS
// ===============================

guessBtn.addEventListener("click", () => {
  const value = guessInput.value;
  guessInput.value = "";

  gameState = processGuess(gameState, value);
  render();
});

guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    guessBtn.click();
  }
});

newGameBtn.addEventListener("click", startNewGame);

phraseModeCheckbox.addEventListener("change", () => {
  difficultySelect.disabled = phraseModeCheckbox.checked;
});

// ===============================
// INIT (NO AUTO-START)
// ===============================

async function init() {
  WORDS = await loadWordList("assets/words/wordlist.txt");
  PHRASES = await loadPhraseMode("assets/words/Frankenstein.txt");
}

init();
