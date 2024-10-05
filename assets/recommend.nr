tumia mtandao
tumia jsoni


// Function to check kwa a win
fanya checkWin = unda(gameBoard, currentPlayer){
  fanya winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  // Use a kwa loop to iterate over each winning combination
  kwa idx, combination ktk winningCombinations {
    fanya a = combination[0]
    fanya b = combination[1]
    fanya c = combination[2]

    kama (
      gameBoard[a] == currentPlayer &&
      gameBoard[b] == currentPlayer &&
      gameBoard[c] == currentPlayer
    ) {
      rudisha kweli // Found a winning combination
    }
  }

  rudisha sikweli // No winning combination found
}


// Function to recommend a move
fanya recommendMove = unda(gameBoard, currentPlayer){
    fanya opponent =  "X"
    kama (currentPlayer == "X")  { 
     opponent =  "O"
     } 

  // Check kama the current player can win
  kwa idx, mark ktk gameBoard {
    kama (mark == -1) {
      fanya hypotheticalBoard = gameBoard
      hypotheticalBoard[idx] = currentPlayer
      kama (checkWin(hypotheticalBoard, currentPlayer)) {
        rudisha idx // rudisha winning move
      }
    }
  }

  // Check kama the opponent can win and we need to block
  kwa idx, mark ktk gameBoard {
    kama (mark == -1) {
      fanya hypotheticalBoard = gameBoard
      hypotheticalBoard[idx] = opponent
      kama (checkWin(hypotheticalBoard, opponent)) {
        rudisha idx // rudisha blocking move
      }
    }
  }

  // kama no immediate win/block, recommend center or corners
  fanya preferredMoves = [4, 0, 2, 6, 8] // Center and corners first
  kwa idx, station ktk preferredMoves {
    kama (gameBoard[station] == -1) {
      rudisha idx // rudisha first available preferred move
    }
  }

  // kama no preferred move is available, take the first available
  kwa idx, mark ktk gameBoard {
    kama (mark == -1) {
      rudisha idx // rudisha first available move
    }
  }

  rudisha tupu // No moves available
}



// Main function to execute the recommendation and saving
fanya main = unda(){
    fanya game = mtandao.peruzi("http://localhost:4000/game-state")
    fanya gameState = jsoni.dikodi(game)
    andika(game,gameState)
    fanya gameBoard = gameState["gameBoard"]
    fanya currentPlayer = gameState["currentPlayer"]

    fanya move = recommendMove(gameBoard, currentPlayer)
    headers = {"Authentication": "Bearer XXXX"}
    mtandao.tuma(yuareli="http://localhost:4000/recommend-a-move", vichwa=headers, mwili={"move": move})
}

main()