document.addEventListener("DOMContentLoaded", function () {
  // Get the HTML elements that JavaScript needs to control
  const cells = document.querySelectorAll(".cell");
  const message = document.querySelector(".message");
  const displayPlayer = document.querySelector(".display_player");
  const xScoreDisplay = document.querySelector(".x_score");
  const oScoreDisplay = document.querySelector(".o_score");
  const newGameButton = document.querySelector(".new_game");
  const resetButton = document.querySelector(".reset");
  const gameMode = document.querySelector("#game_mode");

  // These are all 8 possible ways to win Tic Tac Toe
  const winningCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
  ];

  // These variables store the current state of the game
  let currentPlayer = "X";
  let gameOver = false;
  let xMoves = [];
  let oMoves = [];
  let xScore = 0;
  let oScore = 0;
  let computerTimer = null;

  // Updates the message at the top of the page to show whose turn it is
  function showTurnMessage() {
    displayPlayer.textContent = currentPlayer;
    message.textContent = "It's your turn, ";
    message.appendChild(displayPlayer);
    message.append(".");
  }

  // Returns the move array for the player whose turn it currently is
  function playerMoves() {
    if (currentPlayer === "X") {
      return xMoves;
    }

    return oMoves;
  }

  // Checks if the given move array contains any full winning combination
  function playerWon(moves) {
    return winningCombinations.some(function (combination) {
      return combination.every(function (square) {
        return moves.includes(square);
      });
    });
  }

  // Checks if all 9 squares have been used
  function boardIsFull() {
    return xMoves.length + oMoves.length === 9;
  }

  // Changes the turn from X to O, or from O back to X
  function switchPlayer() {
    if (currentPlayer === "X") {
      currentPlayer = "O";
    } else {
      currentPlayer = "X";
    }
  }

  // Shows the current score values on the page
  function updateScore() {
    xScoreDisplay.textContent = xScore;
    oScoreDisplay.textContent = oScore;
  }

  // Runs after every move to check for a win, tie, or next turn
  function finishTurn() {
    if (playerWon(playerMoves())) {
      message.textContent = "Player " + currentPlayer + " wins!";
      gameOver = true;

      // Add 1 point to the player who just won
      if (currentPlayer === "X") {
        xScore = xScore + 1;
      } else {
        oScore = oScore + 1;
      }

      updateScore();
      return;
    }

    // If there is no winner and no empty spaces, the game is a tie
    if (boardIsFull()) {
      message.textContent = "It's a tie!";
      gameOver = true;
      return;
    }

    switchPlayer();
    showTurnMessage();

    // In computer mode, the computer plays as O after the human plays X
    if (gameMode.value === "computer" && currentPlayer === "O") {
      computerTimer = setTimeout(makeComputerMove, 400);
    }
  }

  // Places X or O in a clicked square and stores the move
  function makeMove(cell) {
    const squareNumber = Number(cell.dataset.square);
    const cellText = cell.querySelector(".xo");

    // Stop the move if the game ended or the square is already filled
    if (gameOver || cellText.textContent !== "") {
      return;
    }

    // Display the current player's mark in the clicked square
    cellText.textContent = currentPlayer;

    // Save the square number into the correct player's move array
    if (currentPlayer === "X") {
      xMoves.push(squareNumber);
    } else {
      oMoves.push(squareNumber);
    }

    finishTurn();
  }




  // Lets the computer choose and play the best move using Minimax
  function makeComputerMove() {
    if (gameMode.value !== "computer" || currentPlayer !== "O" || gameOver) {
      return;
    }

    const bestSquare = findBestMove();

    // If no square is available, the computer does nothing
    if (bestSquare === null) {
      return;
    }

    const bestCell = document.querySelector('[data-square="' + bestSquare + '"]');
    makeMove(bestCell);
  }


  
  // Builds a simple board array from the current HTML board
  function getBoard() {
    const board = [""];

    cells.forEach(function (cell) {
      const squareNumber = Number(cell.dataset.square);
      board[squareNumber] = cell.querySelector(".xo").textContent;
    });

    return board;
  }

  // Scores the board for Minimax: O win is good, X win is bad, tie is neutral
  function evaluateBoard(board) {
    for (let i = 0; i < winningCombinations.length; i++) {
      const first = winningCombinations[i][0];
      const second = winningCombinations[i][1];
      const third = winningCombinations[i][2];

      if (
        board[first] !== "" &&
        board[first] === board[second] &&
        board[second] === board[third]
      ) {
        if (board[first] === "O") {
          return 10;
        }

        if (board[first] === "X") {
          return -10;
        }
      }
    }

    return 0;
  }

  // Checks if the Minimax board still has at least one empty square
  function boardHasEmptySquare(board) {
    for (let square = 1; square <= 9; square++) {
      if (board[square] === "") {
        return true;
      }
    }

    return false;
  }




  // Minimax tests future moves and returns the best score for that path
  function minimax(board, depth, isComputerTurn) {
    const score = evaluateBoard(board);

    if (score === 10) {
      return score - depth;
    }

    if (score === -10) {
      return score + depth;
    }

    if (!boardHasEmptySquare(board)) {
      return 0;
    }

    // The computer is O, so it wants the highest score MAX
    if (isComputerTurn) {
      let bestScore = -Infinity;

      for (let square = 1; square <= 9; square++) {
        if (board[square] === "") {
          board[square] = "O";
          bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
          board[square] = "";
        }
      }

      return bestScore;
    }

    // The human is X, so this part assumes X chooses the lowest score for O MIN
    let bestScore = Infinity;

    for (let square = 1; square <= 9; square++) {
      if (board[square] === "") {
        board[square] = "X";
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
        board[square] = "";
      }
    }

    return bestScore;
  }




  // Tries every empty square and picks the move with the best Minimax score
  function findBestMove() {
    const board = getBoard();
    let bestScore = -Infinity;
    let bestSquare = null;

    for (let square = 1; square <= 9; square++) {
      if (board[square] === "") {
        // Try placing O here temporarily (computer is always O)
        board[square] = "O";
        const moveScore = minimax(board, 0, false);
        // Undo the temporary move before testing the next square
        board[square] = "";

        if (moveScore > bestScore) {
          bestScore = moveScore;
          bestSquare = square;
        }
      }
    }

    return bestSquare;
  }



  // Clears the board and starts a new game, but keeps the scores
  function startNewGame() {
    clearTimeout(computerTimer);

    currentPlayer = "X";
    gameOver = false;
    xMoves = [];
    oMoves = [];

    // Remove all X and O marks from the board
    cells.forEach(function (cell) {
      cell.querySelector(".xo").textContent = "";
    });

    showTurnMessage();
  }

  // Clears the board and resets both players' scores back to 0
  function resetEverything() {
    xScore = 0;
    oScore = 0;
    updateScore();
    startNewGame();
  }

  // Add a click event to every board square
  cells.forEach(function (cell) {
    cell.addEventListener("click", function () {
      if (gameMode.value === "computer" && currentPlayer === "O") {
        return;
      }

      makeMove(cell);
    });
  });

  // Connect the buttons and dropdown to their functions
  newGameButton.addEventListener("click", startNewGame);
  resetButton.addEventListener("click", resetEverything);
  gameMode.addEventListener("change", startNewGame);

  // Show the first turn message when the page opens
  showTurnMessage();
});
