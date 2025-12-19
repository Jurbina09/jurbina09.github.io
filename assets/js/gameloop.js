// gameloop.js
// Core game-state transitions (no DOM, no input)

import {
  AUTO_REVEAL,
  renderMask,
  isWin,
  parseGuess,
  pickHint
} from "./util.js";

// ===============================
// GAME INITIALIZATION
// ===============================

export function createGameState({
  secret,
  tries,
  freeHints,
  difficulty
}) {
  return {
    secret,
    guessed: new Set(AUTO_REVEAL),
    misses: new Set(),
    remaining: tries,
    hints: freeHints,
    difficulty,
    status: "playing",
    message: ""
  };
}

// ===============================
// PROCESS ONE GUESS
// ===============================

export function processGuess(gameState, rawInput) {
  if (gameState.status !== "playing") return gameState;

  const parsed = parseGuess(rawInput);

  // ----- INVALID INPUT -----
  if (parsed.type === "invalid") {
    gameState.message = "Invalid input. Enter a single letter.";
    return gameState;
  }

  // ----- QUIT -----
  if (parsed.type === "quit") {
    gameState.status = "quit";
    gameState.message = "You quit the game.";
    return gameState;
  }

  // ----- HINT -----
  if (parsed.type === "hint") {
    if (gameState.hints <= 0) {
      gameState.message = "No hints remaining.";
      return gameState;
    }

    const hintLetter = pickHint(gameState.guessed, gameState.secret);

    if (!hintLetter) {
      gameState.message = "No letters left to reveal.";
      return gameState;
    }

    gameState.guessed.add(hintLetter);
    gameState.hints -= 1;
    gameState.message = `Hint used! Revealed '${hintLetter}'.`;

    if (isWin(gameState.secret, gameState.guessed)) {
      gameState.status = "won";
    }

    return gameState;
  }

  // ----- LETTER GUESS -----
  const letter = parsed.letter;

  if (gameState.guessed.has(letter)) {
    gameState.message = "You already guessed that letter.";
    return gameState;
  }

  gameState.guessed.add(letter);

  if (gameState.secret.includes(letter)) {
    gameState.message = "Correct guess!";

    if (isWin(gameState.secret, gameState.guessed)) {
      gameState.status = "won";
    }
  } else {
    gameState.misses.add(letter);
    gameState.remaining -= 1;
    gameState.message = "Wrong guess.";

    if (gameState.remaining <= 0) {
      gameState.status = "lost";
      gameState.message = `You lost! The word was "${gameState.secret}".`;
    }
  }

  return gameState;
}

// ===============================
// DERIVED DISPLAY HELPERS
// ===============================

export function getDisplayState(gameState) {
  return {
    mask: renderMask(gameState.secret, gameState.guessed),
    misses: [...gameState.misses].sort().join(" "),
    remaining: gameState.remaining,
    hints: gameState.hints,
    status: gameState.status,
    message: gameState.message
  };
}
