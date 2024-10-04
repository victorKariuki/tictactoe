document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", handleClick);
});

let currentPlayer = "X";

function handleClick(event) {
  const cell = event.target;

  if (cell.textContent !== " ") return;

  cell.textContent = currentPlayer;

  // Allow the rendering to happen first before checking win or tie
  setTimeout(() => {
    if (checkWin()) {
      alert(`${currentPlayer} wins!`);
      resetBoard();
    } else if (isBoardFull()) {
      alert("It's a tie!");
      resetBoard();
    } else {
      // Switch player only if no one has won
      currentPlayer = currentPlayer === "X" ? "O" : "X";

      // Use recommender API to suggest a move for the next player
      fetch("/recommend-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameBoard: getGameBoard(),
          currentPlayer: currentPlayer,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const recommendedMove = data.recommendedMove;
          document
            .querySelectorAll(".cell")
            [recommendedMove].classList.add("hint");
        });
    }
  }, 0); // Delay checking to let rendering happen
}

function getGameBoard() {
  return Array.from(document.querySelectorAll(".cell")).map(
    (cell) => cell.textContent
  );
}

function checkWin() {
  const cells = getGameBoard();
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
      cells[a] === currentPlayer &&
      cells[a] === cells[b] &&
      cells[a] === cells[c]
    );
  });
}

function isBoardFull() {
  return Array.from(document.querySelectorAll(".cell")).every(
    (cell) => cell.textContent !== " "
  );
}

function resetBoard() {
  document
    .querySelectorAll(".cell")
    .forEach((cell) => (cell.textContent = " "));
  currentPlayer = "X";
}
function handleClick(event) {
  const cell = event.target;

  if (cell.textContent !== " ") return;

  cell.textContent = currentPlayer;

  // Allow the rendering to happen first before checking win or tie
  setTimeout(() => {
    if (checkWin()) {
      alert(`${currentPlayer} wins!`);
      resetBoard();
    } else if (isBoardFull()) {
      alert("It's a tie!");
      resetBoard();
    } else {
      // Switch player only if no one has won
      currentPlayer = currentPlayer === "X" ? "O" : "X";

      // Remove previous hint before setting a new one
      removeHints();

      // Use recommender API to suggest a move for the next player
      fetch("/recommend-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameBoard: getGameBoard(),
          currentPlayer: currentPlayer,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const recommendedMove = data.recommendedMove;
          const hintClass = currentPlayer === "X" ? "hint-x" : "hint-o";
          document
            .querySelectorAll(".cell")
            [recommendedMove].classList.add(hintClass);
        });
    }
  }, 0); // Delay checking to let rendering happen
}

// Function to remove any hint classes from all cells
function removeHints() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("hint-x", "hint-o");
  });
}

function getGameBoard() {
  return Array.from(document.querySelectorAll(".cell")).map(
    (cell) => cell.textContent
  );
}

function checkWin() {
  const cells = getGameBoard();
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
      cells[a] === currentPlayer &&
      cells[a] === cells[b] &&
      cells[a] === cells[c]
    );
  });
}

function isBoardFull() {
  return Array.from(document.querySelectorAll(".cell")).every(
    (cell) => cell.textContent !== " "
  );
}

function resetBoard() {
  document
    .querySelectorAll(".cell")
    .forEach((cell) => (cell.textContent = " "));
  currentPlayer = "X";
  removeHints(); // Clear hints on reset
}
