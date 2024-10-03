const { Server } = require("socket.io");

let rooms = {}; // Object to hold room states

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A player connected");

    // Handle matchmaking
    socket.on("findMatch", () => {
      let roomId = null;

      // Find a room with only one player
      for (let room in rooms) {
        if (rooms[room].players.length === 1) {
          roomId = room;
          break;
        }
      }

      // If no room found, create a new one
      if (!roomId) {
        roomId = Math.random().toString(36).substring(2, 8); // Generate a random room ID
        rooms[roomId] = {
          players: [],
          gameBoard: Array(9).fill(" "),
          currentPlayer: "X",
        };
      }

      // Join the player to the room
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);

      socket.emit("joinedRoom", roomId);

      // If both players are present, notify them
      if (rooms[roomId].players.length === 2) {
        io.to(roomId).emit("startGame", {
          gameBoard: rooms[roomId].gameBoard,
          currentPlayer: rooms[roomId].currentPlayer,
        });
      }
    });

    // Handle move made by player
    socket.on("makeMove", (roomId, index) => {
      if (rooms[roomId].gameBoard[index] === " ") {
        rooms[roomId].gameBoard[index] = rooms[roomId].currentPlayer;

        // Broadcast the updated board to all clients in the room
        io.to(roomId).emit("updateBoard", rooms[roomId].gameBoard);

        // Check for win or tie and send message to players
        if (checkWin(roomId)) {
          io.to(roomId).emit(
            "gameOver",
            `${rooms[roomId].currentPlayer} wins!`
          );
          resetBoard(roomId);
        } else if (isBoardFull(roomId)) {
          io.to(roomId).emit("gameOver", "It's a tie!");
          resetBoard(roomId);
        } else {
          // Switch player
          rooms[roomId].currentPlayer =
            rooms[roomId].currentPlayer === "X" ? "O" : "X";
          io.to(roomId).emit("currentPlayer", rooms[roomId].currentPlayer);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("A player disconnected");
      // Remove player from room if they disconnect
      for (let roomId in rooms) {
        const index = rooms[roomId].players.indexOf(socket.id);
        if (index !== -1) {
          rooms[roomId].players.splice(index, 1);
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId]; // Delete the room if no players left
          }
          break;
        }
      }
    });
  });

  function checkWin(roomId) {
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
        rooms[roomId].gameBoard[a] === rooms[roomId].currentPlayer &&
        rooms[roomId].gameBoard[a] === rooms[roomId].gameBoard[b] &&
        rooms[roomId].gameBoard[a] === rooms[roomId].gameBoard[c]
      );
    });
  }

  function isBoardFull(roomId) {
    return rooms[roomId].gameBoard.every((cell) => cell !== " ");
  }

  function resetBoard(roomId) {
    rooms[roomId].gameBoard = Array(9).fill(" ");
    rooms[roomId].currentPlayer = "X";
    io.to(roomId).emit("updateBoard", rooms[roomId].gameBoard); // Reset the board for all players
  }
};

module.exports = setupSocketIO;
