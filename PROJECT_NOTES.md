# Project Notes for Internship Discussion

## Project title

Connect Four – A Web-Based Two-Player Game

## Problem statement

The aim was to recreate the classic Connect Four game in a browser and use it to understand how JavaScript manages changing data and user interactions.

## My approach

1. I represented the game board with a 6 × 7 JavaScript array.
2. When a player clicks a column, I search upward from the bottom for an empty position.
3. I store the move in the array and update the matching HTML cell.
4. I check the four possible winning directions from the latest move.
5. I keep the scores and round history separate from the board so a new round can start without losing the match score.

## Main challenges

- Checking diagonal wins without repeating a large amount of code
- Preventing moves after a round or match has finished
- Making the board usable on both desktop and small mobile screens
- Restoring the correct player's turn when the latest move is undone

## Two-minute explanation

“I built Connect Four as a front-end internship project using plain HTML, CSS and JavaScript. The main part is a two-dimensional array that represents six rows and seven columns. When a player selects a column, JavaScript finds the lowest empty row and updates both the array and the page. After each move, I check horizontal, vertical and both diagonal directions for four connected discs. I also added player names, multi-round scoring, undo and round history to practise managing a larger game state. I kept it framework-free so I could understand the underlying JavaScript rather than relying on a library.”

## Honest skill level

This is a beginner-to-intermediate front-end project. It demonstrates JavaScript fundamentals, DOM manipulation, responsive CSS, accessibility labels and structured problem-solving.
