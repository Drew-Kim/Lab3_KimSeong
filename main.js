document.addEventListener("DOMContentLoaded", function () {
  /* HTML elements */

  const cells = document.querySelectorAll(".cell");
  const message = document.querySelector(".message");
  const displayPlayer = document.querySelector(".display_player");
  const xScoreDisplay = document.querySelector(".x_score");
  const oScoreDisplay = document.querySelector(".o_score");
  const newGameButton = document.querySelector(".new_game");
  const resetButton = document.querySelector(".reset");
  const gameMode = document.querySelector("#game_mode");

  /* Game data */

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

  let currentPlayer = "X";
  let gameOver = false;
  let xMoves = [];
  let oMoves = [];
  let xScore = 0;
  let oScore = 0;
  let computerTimer = null;

  /* Display functions */

  // Shows whose turn it is
  function showTurnMessage() {
    displayPlayer.textContent = currentPlayer;
    message.textContent = "It's your turn, ";
    message.appendChild(displayPlayer);
    message.append(".");
  }

  // Updates the score numbers on the page
  function updateScore() {
    xScoreDisplay.textContent = xScore;
    oScoreDisplay.textContent = oScore;
  }

  /* Game checking functions */

  // Returns the move array for the current player
  function playerMoves() {
    if (currentPlayer === "X") {
      return xMoves;
    }

    return oMoves;
  }

  // Checks if the given moves have any winning combination
  function playerWon(moves) {
    for (let i = 0; i < winningCombinations.length; i++) {
      const combination = winningCombinations[i];
      const firstSquare = combination[0];
      const secondSquare = combination[1];
      const thirdSquare = combination[2];

      if (
        moves.includes(firstSquare) &&
        moves.includes(secondSquare) &&
        moves.includes(thirdSquare)
      ) {
        return true;
      }
    }

    return false;
  }

  // Checks if all 9 squares have been used
  function boardIsFull() {
    return xMoves.length + oMoves.length === 9;
  }

  // Switches from X to O, or from O to X
  function switchPlayer() {
    if (currentPlayer === "X") {
      currentPlayer = "O";
    } else {
      currentPlayer = "X";
    }
  }

  /* Main game functions */

  // Adds 1 point to the player who won
  function addPointToWinner() {
    if (currentPlayer === "X") {
      xScore = xScore + 1;
    } else {
      oScore = oScore + 1;
    }

    updateScore();
  }

  // Places X or O in a clicked square and saves the move
  // Runs when a player clicks a square, or when the computer makes a move
  function makeMove(cell) {
    const squareNumber = Number(cell.dataset.square);
    const cellText = cell.querySelector(".xo");

    if (gameOver || cellText.textContent !== "") {
      return;
    }

    // Place the current player's mark in the square and save the move
    cellText.textContent = currentPlayer;

    if (currentPlayer === "X") {
      xMoves.push(squareNumber);
    } else {
      oMoves.push(squareNumber);
    }

    finishTurn();
  }

  // Checks what should happen after a move
  // Runs after every sinhle move
  function finishTurn() {
    if (playerWon(playerMoves())) {
      message.textContent = "Player " + currentPlayer + " wins!";
      gameOver = true;
      addPointToWinner();
      return;
    }

    if (boardIsFull()) {
      message.textContent = "It's a tie!";
      gameOver = true;
      return;
    }

    switchPlayer();
    showTurnMessage();

    if (gameMode.value === "computer" && currentPlayer === "O") {
      computerTimer = setTimeout(makeComputerMove, 400);
    }
  }

  /* Minimax computer functions */

  // Builds a board array from the current HTML board
  function getBoard() {
    const board = [""];

    cells.forEach(function (cell) {
      const squareNumber = Number(cell.dataset.square);
      board[squareNumber] = cell.querySelector(".xo").textContent;
    });

    return board;
  }

  // Returns all empty square numbers from a board array
  // Represents the possible moves that can be made from a given board state
  function emptySquares(board) {
    const squares = [];

    for (let square = 1; square <= 9; square++) {
      if (board[square] === "") {
        squares.push(square);
      }
    }

    return squares;
  }

  // Checks if the board has a winnder for Minimax
  function evaluateBoard(board) {
    for (let i = 0; i < winningCombinations.length; i++) {
      const combination = winningCombinations[i];
      const firstSquare = combination[0];
      const secondSquare = combination[1];
      const thirdSquare = combination[2];

      if (
        board[firstSquare] !== "" &&
        board[firstSquare] === board[secondSquare] &&
        board[secondSquare] === board[thirdSquare]
      ) {
        if (board[firstSquare] === "O") {
          return 10;
          // If O wins, return a positive score. The computer is O, so it wants to maximize the score.
        }

        if (board[firstSquare] === "X") {
          return -10;
          // If X wins, return a negative score. The computer is O, so it wants to minimize the score.
        }
      }
    }
    // No winner, return 0 for a tie or an ongoing game
    return 0;
  }

  // Looks ahead at future moves and returns the best score
  // The depths allows the computer to prefer faster wins.
  function minimax(board, depth, isComputerTurn) {
    const score = evaluateBoard(board);

    if (score === 10) {
      return score - depth;
    }

    if (score === -10) {
      return score + depth;
    }

    const availableSquares = emptySquares(board);

    if (availableSquares.length === 0) {
      return 0;
    }

    if (isComputerTurn) {
      let bestScore = -Infinity;

      // The computer tries all possible moves and chooses the one with the highest score
      for (let i = 0; i < availableSquares.length; i++) {
        const square = availableSquares[i];
        board[square] = "O";
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
        board[square] = "";
      }

      return bestScore;
    }

    let bestScore = Infinity;

    // The Computer tries from the human player prespective to try all possible moves 
    // and chooses the one with the lowest score
    for (let i = 0; i < availableSquares.length; i++) {
      const square = availableSquares[i];
      board[square] = "X";
      bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
      board[square] = "";
    }

    return bestScore;
  }

  // Finds the best square for the computer to play
  function findBestMove() {
    const board = getBoard();
    const availableSquares = emptySquares(board);
    let bestScore = -Infinity;
    let bestSquare = null;

    for (let i = 0; i < availableSquares.length; i++) {
      const square = availableSquares[i];
      board[square] = "O";
      const moveScore = minimax(board, 0, false);
      board[square] = "";

      // Choose the square with the highest score, which is the best move for the computer
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestSquare = square;
      }
    }

    return bestSquare;
  }

  function makeComputerMove() {
    if (gameMode.value !== "computer" || currentPlayer !== "O" || gameOver) {
      return;
    }

    const bestSquare = findBestMove();

    if (bestSquare === null) {
      return;
    }

    const bestCell = document.querySelector('[data-square="' + bestSquare + '"]');
    makeMove(bestCell);
  }

  /* Restart functions */

  // Clears the board but keeps the scores
  function startNewGame() {
    clearTimeout(computerTimer);

    currentPlayer = "X";
    gameOver = false;
    xMoves = [];
    oMoves = [];

    cells.forEach(function (cell) {
      cell.querySelector(".xo").textContent = "";
    });

    showTurnMessage();
  }

  // Clears the board and resets both scores
  function resetEverything() {
    xScore = 0;
    oScore = 0;
    updateScore();
    startNewGame();
  }

  /* Events */

  cells.forEach(function (cell) {
    cell.addEventListener("click", function () {
      if (gameMode.value === "computer" && currentPlayer === "O") {
        return;
      }

      makeMove(cell);
    });
  });

  newGameButton.addEventListener("click", startNewGame);
  resetButton.addEventListener("click", resetEverything);
  gameMode.addEventListener("change", startNewGame);

  showTurnMessage();
});
