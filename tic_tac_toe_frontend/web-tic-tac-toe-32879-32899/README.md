# Tic Tac Toe — Ocean Professional Edition (React)

## Project Overview and Features
This project is a modern, responsive Tic Tac Toe game built with React. It is designed for two players on the same device, requires no backend, and stores only minimal data (scores) in the browser’s localStorage. The UI follows the “Ocean Professional” theme with a clean layout, subtle gradients, and retro accents.

Key features:
- Two-player Tic Tac Toe on one device.
- Ocean Professional theme with subtle retro accents, smooth transitions, and rounded cards.
- Winner and draw detection with visual highlighting of the winning line.
- Scoreboard tracking X wins, O wins, and draws, persisted in localStorage.
- Undo last move, Reset Board, and New Game controls.
- Keyboard operability and ARIA roles for improved accessibility.
- Responsive layout that adapts from mobile to desktop screens.
- Minimal dependencies using React and vanilla CSS.

## Architecture and Components
The application uses a single-page React structure. All interactive UI and game logic are implemented in `src/App.js`, which defines the main `App` component and its child components.

Main components and responsibilities:
- App
  - Owns top-level state: board (9 cells), current player (X/O), history (for undo), scores (with localStorage persistence), and computed result (winner/draw).
  - Orchestrates data flow and passes props to child components.
  - Exposes public interface handlers: handleSquareClick, handleKeyDownSquare, resetBoard, newGame, undoLast.

- Board
  - Renders the 3x3 grid as a semantic region with role="grid".
  - Iterates over squares and renders a Square for each cell.
  - Receives: squares (array of 9), onClick handler, onKeyDown handler, winningLine (indexes), and disabled flag.

- Square
  - Renders an individual cell as role="gridcell" with keyboard focus and activation.
  - Applies visual styling for winning cells and disabled state.
  - Receives: index, value (X/O/empty), onClick, onKeyDown, isWinning, disabled.

- Scoreboard
  - Presents three stat cards for X wins, O wins, and Draws.
  - Uses aria-live="polite" to announce changes to assistive technologies.
  - Receives: scores object.

- Controls
  - Renders buttons for Undo Last, Reset Board, and New Game.
  - Receives: onUndo, onReset, onNew, and undoDisabled to manage states.

Data flow:
- App holds game state and computes derived values (current player and result).
- App renders Board with current board state and handlers; Board renders Squares and delegates user actions back to App.
- App renders Scoreboard with scores and Controls with callbacks for actions.
- App updates scores and persists them to localStorage when a win or draw is detected.

## State Management and Key Algorithms
State in App:
- board: Array(9). Each entry is 'X', 'O', or null.
- xIsNext: Boolean tracking the current player.
- history: Array of previous board arrays used for Undo.
- scores: Object shape { X: number, O: number, draw: number }, initialized from localStorage key 'ttt:scores' and persisted on change.

Derived values:
- result: Computed using calculateWinner(board), memoized with useMemo. Returns:
  - { winner: 'X'|'O', line: [a,b,c] } when there is a winner
  - { winner: null, line: [], draw: true } when all squares are filled with no winner
  - null when the game is still in progress
- currentPlayer: 'X' if xIsNext is true, else 'O'.

Key algorithms:
- Winner/Draw detection (calculateWinner):
  - Checks all 8 possible win lines (rows, columns, diagonals) for identical non-null marks.
  - If found, returns the winning mark and the winning line indexes.
  - If all cells are filled without a winner, returns draw: true.
- Move handling (handleSquareClick):
  - Ignores clicks if the square is already taken or the game has ended.
  - Pushes current board state to history, writes the player's mark, and toggles xIsNext.
- Keyboard handling (handleKeyDownSquare):
  - Activates a square on Enter/Space.
  - Supports arrow key navigation to adjacent grid cells and manages focus.
- Undo (undoLast):
  - Reverts to the most recent board in history and toggles xIsNext.
  - Supports undo even after game completion, bringing the board back to an in-progress state when history is available.
- Reset and New Game:
  - resetBoard: Clears the board and history, sets X to start.
  - newGame: Resets the board and also clears all persisted scores (X, O, draw set to 0).
- Persistence:
  - Scores are read from localStorage on initialization and saved whenever scores change.

Persistence keys:
- localStorage key: ttt:scores

## UI/UX and Theming
The design implements the Ocean Professional theme with:
- Colors: primary (#3b82f6), secondary (#64748b), success (#06b6d4), error (#EF4444), background (#f9fafb), surface (#ffffff), text (#111827).
- Layout: centered container with the board at the center, scoreboard below, and controls beneath the scoreboard.
- Visual style: rounded corners, soft card shadows, and subtle gradients for depth.
- Retro accents: pill indicators, bold glyphs for X and O, and slight motion on hover/active.
- Responsiveness: the board scales with viewport width; typography and spacing use clamp and flexible units.
- Animations/micro-interactions: hover elevation, small translation effects, and focus outlines for clarity.
- InlineStyles component injects scoped CSS consistent with the theme; base resets live in src/App.css.

## Accessibility
- Semantics:
  - Board uses role="grid" with an aria-label.
  - Each cell uses role="gridcell" and an aria-label describing its state (e.g., “Cell 3, X” or “Cell 5, empty”).
  - Scoreboard sections use role="status" with aria-live="polite".
- Keyboard operability:
  - Squares are focusable (tabIndex=0), actionable via Enter/Space, and support arrow key navigation across the grid.
- Live regions:
  - Turn/winner/draw indicator uses aria-live="polite" to announce changes.
- Focus styles:
  - Strong focus-visible outlines for keyboard users are applied.
- Button states:
  - Controls reflect disabled states with both disabled and aria-disabled.

## How to Run and Use
The preview system typically starts the app automatically, but you can run it locally with the following scripts defined in package.json:

- npm start
  - Starts the app in development mode at http://localhost:3000.
- npm test
  - Launches the test runner in watch mode.
- npm run build
  - Builds the app for production into the build/ folder.

Usage:
- Click or use the keyboard to place X and O alternately.
- The status indicator shows whose turn it is or announces Winner/Draw.
- Use Undo Last to revert one move at a time. Use Reset Board to clear the grid while keeping scores. Use New Game to clear both the grid and all scores.
- Scores persist across page reloads.

## Testing Summary
Tests are located in src/App.test.js:
- Verifies that the Tic Tac Toe board (role="grid") renders with 9 grid cells (role="gridcell").
- Asserts that the control buttons (Undo Last, Reset Board, New Game) are present.

How to run tests:
- npm test
  - Runs the test suite using react-scripts with React Testing Library and jest-dom (initialized via src/setupTests.js).

## File Structure Overview
- web-tic-tac-toe-32879-32899/
  - README.md — Project-level documentation (this file).
  - tic_tac_toe_frontend/
    - README.md — Template README (superseded by this project README for the game).
    - package.json — Dependencies and scripts.
    - eslint.config.mjs — ESLint config for JS/JSX.
    - src/
      - App.js — Main component and child components (App, Board, Square, Scoreboard, Controls, InlineStyles, TurnIndicator) plus game logic.
      - App.css — Base resets and minimal global styles.
      - App.test.js — Test verifying board and control rendering.
      - index.js — React entry point.
      - index.css — Base typography and global resets.
      - setupTests.js — Jest DOM setup.

## Future Enhancements
- Single-player mode with basic/computer AI.
- Highlight last move and move numbers for better step-by-step clarity.
- Full move history list with time-travel navigation.
- Customizable themes or light/dark mode toggle.
- Sound effects and more elaborate animations for retro feel.
- Internationalization (i18n) for labels and statuses.
- PWA support for offline play and “Add to Home Screen.”
- Unit tests for winner detection and undo logic; integration tests for keyboard navigation.
- Optional per-game session persistence (board/history) in localStorage.

## Credits and License
This project is a minimal React implementation created for demonstration and instructional purposes, with no backend. All game logic and UI are contained within the frontend.

---
Theme: “Ocean Professional” — clean, modern, and accessible with subtle retro accents.
