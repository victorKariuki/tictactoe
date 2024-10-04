const express = require("express");
const router = express.Router();

// Render the game UI
router.get("/", (req, res) => {
  try {
    const gameBoard = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    res.render("index", { gameBoard });
  } catch (error) {
    console.error("Error rendering the game UI:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/recommend-move", (req, res) => {
  const { gameBoard, currentPlayer } = req.body;
  const recommendedMove = getRecommendedMove(gameBoard, currentPlayer);
  res.json({ recommendedMove });
});

function getRecommendedMove(gameBoard, currentPlayer) {
  const opponent = currentPlayer === "X" ? "O" : "X";

  // Check if current player can win
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      gameBoard[i] = currentPlayer;
      if (checkWin(gameBoard, currentPlayer)) {
        gameBoard[i] = " "; // Undo the move
        return i;
      }
      gameBoard[i] = " "; // Undo the move
    }
  }

  // Check if current player needs to block the opponent
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      gameBoard[i] = opponent;
      if (checkWin(gameBoard, opponent)) {
        gameBoard[i] = " "; // Undo the move
        return i;
      }
      gameBoard[i] = " "; // Undo the move
    }
  }

  // If no immediate win/block, recommend center or corners
  const preferredMoves = [4, 0, 2, 6, 8]; // Prioritize center, then corners
  for (let move of preferredMoves) {
    if (gameBoard[move] === " ") {
      return move;
    }
  }

  // If no preferred move is available, take the first available
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === " ") {
      return i;
    }
  }
}

// Function to check if there's a win in the current state
function checkWin(gameBoard, currentPlayer) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  return winningCombinations.some((combination) => {
    const [a, b, c] = combination;
    return (
      gameBoard[a] === currentPlayer &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    );
  });
}

module.exports = router;
