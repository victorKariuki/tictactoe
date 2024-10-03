const socket = io();

// Handle click event on cells
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", handleClick);
});

let currentPlayer;
let myTurn = false; // Will be set when it's this client's turn
let roomId;

socket.emit("findMatch"); // Request to find a match

// Event listener for when a room is joined
socket.on("joinedRoom", (id) => {
  roomId = id; // Store the room ID
});

// Start the game
socket.on("startGame", ({ gameBoard, currentPlayer: firstPlayer }) => {
  currentPlayer = firstPlayer;
  myTurn = currentPlayer === "X";
  document.getElementById(
    "status"
  ).textContent = `It's ${currentPlayer}'s turn`;
  updateBoard(gameBoard);
});

// Handle cell click
function handleClick(event) {
  if (!myTurn) return; // If it's not the player's turn, ignore the click

  const cell = event.target;
  const index = cell.getAttribute("data-index");

  // Send move to the server
  socket.emit("makeMove", roomId, index);
}

// Update the board UI
function updateBoard(gameBoard) {
  document.querySelectorAll(".cell").forEach((cell, index) => {
    cell.textContent = gameBoard[index];
  });
}

// Listen for board updates from the server
socket.on("updateBoard", (gameBoard) => {
  updateBoard(gameBoard);
});

// Listen for current player updates from the server
socket.on("currentPlayer", (player) => {
  currentPlayer = player;
  myTurn = currentPlayer === "X";
  document.getElementById(
    "status"
  ).textContent = `It's ${currentPlayer}'s turn`;
});

// Listen for game over messages
socket.on("gameOver", (message) => {
  alert(message);
  myTurn = false; // Prevent any further moves until the board is reset
});
