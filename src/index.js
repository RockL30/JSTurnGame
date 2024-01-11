import { Board } from './components/board/board.js';
import { Player } from './components/player/player.js';

document.addEventListener('DOMContentLoaded', function () {
  function initializeGame() {
    // Create player instances
    const player1 = new Player("Player 1", "P1", '100');
    const player2 = new Player("Player 2", "P2", '100');

    // Create a new game board instance
    const gameBoard = new Board(10, 10, player1, player2);

    // Clear the existing board (if any) and then initialize the new board
    gameBoard.clearBoard();
    gameBoard.initializeBoard();

    // Highlight moveable cells for player1 (or whichever player goes first)
    gameBoard.highlightMoveableCells(player1);
  }
  initializeGame();
  // Event listener for the 'Reset-Game' button
  document.getElementById('resetGameButton').addEventListener('click', function () {
    window.location.reload();
  });
});