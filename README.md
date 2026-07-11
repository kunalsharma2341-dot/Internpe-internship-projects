# Connect Four Web Game

Connect Four is a two-player browser game created as a web development internship project. The purpose of the project is to practise JavaScript logic and DOM manipulation through a familiar game, without using a game library or framework.

## Features

- Local two-player gameplay
- Custom player names and match target
- Horizontal, vertical and diagonal win detection
- Draw detection
- Score tracking across rounds
- Move counter and undo option
- Alternating starting player between rounds
- Round history for the current match
- Restart round and new game controls
- Responsive layout for desktop and mobile

## Technologies used

- HTML5 for page structure
- CSS3 for layout, colours and responsive design
- JavaScript for game logic and user interaction

## How to run

Open `index.html` in any modern web browser. No installation or server is required.

## What I learned

While building this project, I practised working with two-dimensional arrays, event listeners, functions, conditional logic and updating webpage elements with JavaScript. I also learned how to separate the game state from the visible board and how to test different winning combinations.

## Game logic

The board is stored as a 6 × 7 two-dimensional array. After every move, the program checks four directions from the latest disc: horizontal, vertical, diagonal down-right and diagonal down-left. A round ends when four matching discs are found or when the board becomes full.

## Possible future improvements

- Optional computer opponent
- Saved scores using local storage
- Keyboard controls for selecting columns
- Sound effects with an on/off setting

## Developer

Kunal Sharma
