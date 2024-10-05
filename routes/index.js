const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

const router = express.Router();

const gameStateFilePath = path.join(__dirname, "../assets/gameState.json");
const recommendedMoveFilePath = path.join(
  __dirname,
  "../assets/recommendedMove.json"
);

// Helper function to read the recommendations file
const readRecommendationsFile = async () => {
  try {
    const data = await fs.readFile(recommendedMoveFilePath, "utf8");
    return JSON.parse(data) || [];
  } catch (err) {
    if (err.code === "ENOENT") {
      return []; // Return an empty array if file doesn't exist
    }
    console.error("Error reading recommendations file:", err);
    throw err; // Rethrow other errors
  }
};

// Function to execute the recommendation service
const executeRecommendationService = () => {
  const recommendScriptPath = path.join(__dirname, "../services/recommend.js");
  console.log("Starting recommend.js process...", recommendScriptPath);

  const child = spawn("node", [recommendScriptPath], { stdio: "inherit" });

  child.on("close", (code) => {
    console.log(`recommend.js process exited with code ${code}`);
  });

  child.on("error", (err) => {
    console.error("Failed to start recommend.js:", err);
  });
};

// Function to save game state to a file
const saveGameState = async (gameBoard, currentPlayer) => {
  const gameState = { gameBoard, currentPlayer };

  try {
    await fs.writeFile(gameStateFilePath, JSON.stringify(gameState, null, 2));
    console.log("Game state saved successfully.");

    // Introduce a delay before executing the recommendation service
    setTimeout(executeRecommendationService, 1000); // Delay of 1000 milliseconds (1 second)
  } catch (err) {
    console.error("Error saving game state:", err);
    throw err; // Rethrow the error for further handling
  }
};

// Middleware for input validation
const validateGameInput = (req, res, next) => {
  const { gameBoard, currentPlayer } = req.body;
  if (
    !Array.isArray(gameBoard) ||
    gameBoard.length !== 9 ||
    !["X", "O"].includes(currentPlayer)
  ) {
    return res.status(400).send("Invalid game board or current player.");
  }
  next();
};

// Render the game UI
router.get("/", (req, res) => {
  try {
    const gameBoard = Array(9).fill(" "); // Initialize an empty game board
    res.render("index", { gameBoard });
  } catch (error) {
    console.error("Error rendering the game UI:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Recommend a move for the current player
router.post("/recommend-move", validateGameInput, async (req, res) => {
  const { gameBoard, currentPlayer } = req.body;

  try {
    await saveGameState(gameBoard, currentPlayer);
    res.json({ message: "Game state saved. Ready for recommendation." });
  } catch (err) {
    res.status(500).send("Error saving game state.");
  }
});

// Get the latest recommendation
router.get("/recommendation", async (req, res) => {
  try {
    const recommendations = await readRecommendationsFile();

    if (recommendations.length === 0) {
      return res.status(404).send("No recommendations found.");
    }

    res.json(recommendations);
  } catch (err) {
    console.error("Error retrieving recommendations:", err);
    res.status(500).send("Error retrieving recommendations.");
  }
});

// New endpoint to get the game state from the file
router.get("/game-state", async (req, res) => {
  try {
    const gameState = await getGameStateFromFile();

    if (!gameState) {
      return res.status(404).send("Game state not found.");
    }

    res.json(gameState);
  } catch (err) {
    console.error("Error retrieving game state:", err);
    res.status(500).send("Error retrieving game state.");
  }
});

// Export the router module
module.exports = router;
