const ROWS = 6;
const COLUMNS = 7;

const boardElement = document.getElementById('game-board');
const statusElement = document.getElementById('game-status');
const moveCountElement = document.getElementById('move-count');
const playerOneScoreElement = document.getElementById('player-one-score');
const playerTwoScoreElement = document.getElementById('player-two-score');
const playerOneLabel = document.getElementById('player-one-label');
const playerTwoLabel = document.getElementById('player-two-label');
const playerOneInput = document.getElementById('player-one-name');
const playerTwoInput = document.getElementById('player-two-name');
const targetScoreInput = document.getElementById('target-score');
const historyElement = document.getElementById('round-history');
const startMatchButton = document.getElementById('start-match');
const undoButton = document.getElementById('undo-move');
const restartButton = document.getElementById('restart-round');
const newGameButton = document.getElementById('new-game');

let board = [];
let currentPlayer = 1;
let roundFinished = false;
let matchFinished = false;
let moves = [];
let roundNumber = 1;
let scores = { 1: 0, 2: 0 };
let playerNames = { 1: 'Player 1', 2: 'Player 2' };
let targetScore = 2;

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  boardElement.innerHTML = '';
  moves = [];
  updateMoveCount();

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.type = 'button';
      cell.dataset.row = row;
      cell.dataset.column = column;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Empty space at row ${row + 1}, column ${column + 1}`);
      cell.addEventListener('click', handleColumnClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleColumnClick(event) {
  if (roundFinished || matchFinished) return;

  const column = Number(event.currentTarget.dataset.column);
  const emptyRow = findEmptyRow(column);

  if (emptyRow === -1) {
    statusElement.textContent = 'That column is full';
    return;
  }

  board[emptyRow][column] = currentPlayer;
  moves.push({ row: emptyRow, column, player: currentPlayer });
  updateCell(emptyRow, column, currentPlayer);
  updateMoveCount();

  const winningCells = findWinningCells(emptyRow, column, currentPlayer);

  if (winningCells.length === 4) {
    finishRound(winningCells);
    return;
  }

  if (isBoardFull()) {
    roundFinished = true;
    statusElement.textContent = "It's a draw!";
    addHistory(`Round ${roundNumber}: Draw`);
    roundNumber += 1;
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  showCurrentTurn();
}

function findEmptyRow(column) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][column] === 0) return row;
  }
  return -1;
}

function updateCell(row, column, player) {
  const cell = getCell(row, column);
  cell.classList.add(`player-${player}`);
  cell.setAttribute('aria-label', `${playerNames[player]} disc at row ${row + 1}, column ${column + 1}`);
}

function getCell(row, column) {
  return boardElement.querySelector(`[data-row="${row}"][data-column="${column}"]`);
}

function findWinningCells(row, column, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [rowStep, columnStep] of directions) {
    const line = [];
    collectMatchingCells(line, row, column, -rowStep, -columnStep, player);
    line.reverse();
    line.push([row, column]);
    collectMatchingCells(line, row, column, rowStep, columnStep, player);

    if (line.length >= 4) return line.slice(0, 4);
  }

  return [];
}

function collectMatchingCells(line, startRow, startColumn, rowStep, columnStep, player) {
  let row = startRow + rowStep;
  let column = startColumn + columnStep;

  while (
    row >= 0 && row < ROWS &&
    column >= 0 && column < COLUMNS &&
    board[row][column] === player
  ) {
    line.push([row, column]);
    row += rowStep;
    column += columnStep;
  }
}

function finishRound(winningCells) {
  roundFinished = true;
  scores[currentPlayer] += 1;
  updateScores();
  addHistory(`Round ${roundNumber}: ${playerNames[currentPlayer]} won`);
  roundNumber += 1;

  winningCells.forEach(([row, column]) => {
    getCell(row, column).classList.add('winning');
  });

  if (scores[currentPlayer] === targetScore) {
    matchFinished = true;
    statusElement.textContent = `${playerNames[currentPlayer]} won the match!`;
  } else {
    statusElement.textContent = `${playerNames[currentPlayer]} wins the round!`;
  }
}

function undoLastMove() {
  if (roundFinished || matchFinished || moves.length === 0) return;

  const lastMove = moves.pop();
  board[lastMove.row][lastMove.column] = 0;
  const cell = getCell(lastMove.row, lastMove.column);
  cell.classList.remove(`player-${lastMove.player}`);
  cell.setAttribute('aria-label', `Empty space at row ${lastMove.row + 1}, column ${lastMove.column + 1}`);
  currentPlayer = lastMove.player;
  updateMoveCount();
  showCurrentTurn();
}

function isBoardFull() {
  return board[0].every(cell => cell !== 0);
}

function cleanName(value, fallback) {
  const name = value.trim().replace(/\s+/g, ' ');
  return name || fallback;
}

function startMatch() {
  playerNames[1] = cleanName(playerOneInput.value, 'Player 1');
  playerNames[2] = cleanName(playerTwoInput.value, 'Player 2');
  targetScore = Number(targetScoreInput.value);
  playerOneLabel.textContent = playerNames[1];
  playerTwoLabel.textContent = playerNames[2];
  resetMatch();
}

function resetMatch() {
  scores = { 1: 0, 2: 0 };
  roundNumber = 1;
  matchFinished = false;
  historyElement.innerHTML = '<li class="empty-history">No rounds completed yet.</li>';
  updateScores();
  restartRound();
}

function updateScores() {
  playerOneScoreElement.textContent = scores[1];
  playerTwoScoreElement.textContent = scores[2];
}

function updateMoveCount() {
  moveCountElement.textContent = moves.length;
}

function showCurrentTurn() {
  statusElement.textContent = `${playerNames[currentPlayer]}'s turn`;
}

function addHistory(message) {
  const emptyItem = historyElement.querySelector('.empty-history');
  if (emptyItem) emptyItem.remove();

  const item = document.createElement('li');
  item.textContent = message;
  historyElement.appendChild(item);
}

function restartRound() {
  if (matchFinished) return;
  currentPlayer = roundNumber % 2 === 0 ? 2 : 1;
  roundFinished = false;
  showCurrentTurn();
  createBoard();
}

startMatchButton.addEventListener('click', startMatch);
undoButton.addEventListener('click', undoLastMove);
restartButton.addEventListener('click', restartRound);
newGameButton.addEventListener('click', resetMatch);

createBoard();
