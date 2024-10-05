const fs = require("fs/promises");
const path = require("path");

const gameStateFilePath = path.join(__dirname, "../assets/gameState.json");
const recommendedMoveFilePath = path.join(
  __dirname,
  "../assets/recommendedMove.json"
);

// Function to read the game state from a file
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file at ${filePath}:`, err);
    throw err;
  }
};

// Function to write JSON data to a file
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Data saved successfully:", data);
  } catch (err) {
    console.error(`Error saving data to ${filePath}:`, err);
  }
};

// Function to validate the game state
const validateGameState = (gameState) => {
  if (!Array.isArray(gameState.gameBoard) || gameState.gameBoard.length !== 9) {
    throw new Error("Invalid game board.");
  }
  if (!["X", "O"].includes(gameState.currentPlayer)) {
    throw new Error("Invalid current player.");
  }
  return gameState;
};

// Function to check for a win
const checkWin = (gameBoard, currentPlayer) => {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Use a for loop to iterate over each winning combination
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];

    if (
      gameBoard[a] === currentPlayer &&
      gameBoard[b] === currentPlayer &&
      gameBoard[c] === currentPlayer
    ) {
      return true; // Found a winning combination
    }
  }

  return false; // No winning combination found
};


// Function to recommend a move
const recommendMove = (gameBoard, currentPlayer) => {
  const opponent = currentPlayer === "X" ? "O" : "X";

  // Check if the current player can win
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      const hypotheticalBoard = [...gameBoard];
      hypotheticalBoard[i] = currentPlayer;
      if (checkWin(hypotheticalBoard, currentPlayer)) {
        return i; // Return winning move
      }
    }
  }

  // Check if the opponent can win and we need to block
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      const hypotheticalBoard = [...gameBoard];
      hypotheticalBoard[i] = opponent;
      if (checkWin(hypotheticalBoard, opponent)) {
        return i; // Return blocking move
      }
    }
  }

  // If no immediate win/block, recommend center or corners
  const preferredMoves = [4, 0, 2, 6, 8]; // Center and corners first
  for (let i = 0; i < preferredMoves.length; i++) {
    if (gameBoard[preferredMoves[i]] === " ") {
      return preferredMoves[i]; // Return first available preferred move
    }
  }

  // If no preferred move is available, take the first available
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      return i; // Return first available move
    }
  }

  return null; // No moves available
};


// Main function to execute the recommendation and saving
const main = async () => {
  try {
    const gameState = await readJsonFile(gameStateFilePath);
    validateGameState(gameState);

    const { gameBoard, currentPlayer } = gameState;
    const move = recommendMove(gameBoard, currentPlayer);

    if (move !== null) {
      console.log(`Recommended move: ${move}`);
      await writeJsonFile(recommendedMoveFilePath, {
        move,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("No available moves.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Execute the main function
main();
