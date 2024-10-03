const express = require("express");
const router = express.Router();

// Render the game UI
router.get("/game", (req, res) => {
  try {
    const gameBoard = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    res.render("index", { gameBoard });
  } catch (error) {
    console.error("Error rendering the game UI:", error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
