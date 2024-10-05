class Player {
  constructor(symbol) {
    this.symbol = symbol; // Symbol of the player (X or O)
    this.agent = null; // Agent for the player (Human or Computer)
  }

  makeMove(cell) {
    cell.textContent = this.symbol; // Assign the symbol to the cell
  }
}

class Game {
  constructor() {
    this.players = [new Player("X"), new Player("O")];
    this.isHumanFirst = Math.random() < 0.5; // true if human goes first
    // set agent for each player
    this.players[0].agent = this.isHumanFirst ? "Human" : "Computer";
    this.players[1].agent = this.isHumanFirst ? "Computer" : "Human";
    this.currentPlayer = this.players[0];
    this.init();
  }

  init() {
    console.log(`Human player goes first: ${this.isHumanFirst}`);
    console.log(`Current Player: ${this.currentPlayer.symbol}`);

    this.resetBoard();
    this.updateTurnDisplay();
    this.setUpEventListeners();

    // If the computer goes first, make a move
    if (this.currentPlayer.agent === "Computer") {
      this.switchPlayer();
      this.suggestMove();
    }
  }

  setUpEventListeners() {
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.addEventListener("click", (event) => this.handleClick(event));
    });
  }

  updateTurnDisplay() {
    const turnDisplay = document.getElementById("turn-display");
    turnDisplay.textContent = `Current Turn: ${
      this.currentPlayer.symbol === "X" ? "Human (X)" : "Computer (O)"
    }`;
  }

  handleClick(event) {
    const cell = event.target;

    // Only allow the current player to play
    if (
      cell.textContent !== " " ||
      (this.currentPlayer.symbol === "O" && this.isHumanFirst)
    )
      return;

    this.currentPlayer.makeMove(cell);
    this.checkGameState();
  }

  async checkGameState() {
    const winningCells = this.checkWin();

    if (winningCells) {
      this.highlightWinningCells(winningCells);
      alert(`Player ${this.currentPlayer.symbol} wins!`);
      this.resetBoard();
    } else if (this.isBoardFull()) {
      alert("It's a tie!");
      this.resetBoard();
    } else {
      this.switchPlayer();
      if (this.currentPlayer.symbol === "O") {
        await this.suggestMove();
      }
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === this.players[0] ? this.players[1] : this.players[0];
    this.removeHints();
    this.updateTurnDisplay(); // Update display for the new current player

    // Show hints only for the computer's turn
    if (this.currentPlayer.symbol === "O") {
      this.showHints();
    }
  }

  async suggestMove() {
    try {
      await this.saveCurrentGameState();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay before fetching recommendation
      const data = await this.fetchRecommendation();
      this.fillInComputerMove(data.move);
    } catch (error) {
      console.error("Error fetching recommended move:", error);
      alert(
        "An error occurred while fetching the move recommendation. Please try again."
      );
    }
  }

  async saveCurrentGameState() {
    const saveResponse = await fetch("/recommend-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameBoard: this.getGameBoard(),
        currentPlayer: this.currentPlayer.symbol,
      }),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to save recommendation");
    }
  }

  async fetchRecommendation() {
    const recommendationResponse = await fetch("/recommendation");
    if (!recommendationResponse.ok) {
      throw new Error("Failed to get recommendation");
    }
    return await recommendationResponse.json();
  }

  fillInComputerMove(recommendedMove) {
    const cell = document.querySelectorAll(".cell")[recommendedMove];
    if (cell && cell.textContent === " ") {
      // Ensure the cell is empty
      this.currentPlayer.makeMove(cell);
      this.checkGameState(); // Check for win or tie after the computer's move
    }
  }

  highlightWinningCells(cells) {
    cells.forEach((index) => {
      document.querySelectorAll(".cell")[index].classList.add("winning-cell");
    });
    this.resetBoard();
  }

  removeHints() {
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("hint-x", "hint-o", "winning-cell");
    });
  }

  showHints() {
    const possibleMoves = this.getPossibleMoves();
    possibleMoves.forEach((index) => {
      document.querySelectorAll(".cell")[index].classList.add("hint-o"); // Add hint class for computer
    });
  }

  getPossibleMoves() {
    return Array.from(document.querySelectorAll(".cell"))
      .map((cell, index) => (cell.textContent === " " ? index : null))
      .filter((index) => index !== null);
  }

  getGameBoard() {
    return Array.from(document.querySelectorAll(".cell")).map(
      (cell) => cell.textContent
    );
  }

  checkWin() {
    const cells = this.getGameBoard();
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

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (cells[a] === cells[b] && cells[a] === cells[c] && cells[a] !== " ") {
        return combination; // Return the winning combination
      }
    }
    return null; // No winner found
  }

  isBoardFull() {
    return Array.from(document.querySelectorAll(".cell")).every(
      (cell) => cell.textContent !== " "
    );
  }

  resetBoard() {
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = " ";
    });

    this.updateTurnDisplay(); // Reset the turn display
  }
}

// Initialize the game when the script is loaded
new Game();
