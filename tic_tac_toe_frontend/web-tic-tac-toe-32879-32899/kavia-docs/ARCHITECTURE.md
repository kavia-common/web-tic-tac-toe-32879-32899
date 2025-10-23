# Architecture and Implementation Details

## Overview
This document provides a deeper look into the core implementation of the Tic Tac Toe app, detailing internal APIs, state transitions, and the core algorithms for winner detection, undo, and persistence. It is intended for developers maintaining or extending the app.

## Component Tree and Responsibilities
- App
  - Owns state and orchestrates the game loop, persistence, and derived values.
  - Exposes handlers: handleSquareClick, handleKeyDownSquare, resetBoard, newGame, undoLast.
  - Renders: TurnIndicator, Board, Scoreboard, Controls, and InlineStyles.

- Board
  - Maps board state to nine Square components.
  - Provides ARIA semantics (role="grid") and disabled semantics.

- Square
  - Focusable, keyboard-activatable grid cell (role="gridcell").
  - Conveys its state via aria-label and aria-selected and applies winning/disabled styling.

- Scoreboard
  - Displays X wins, O wins, and Draws with aria-live announcements.

- Controls
  - Offers Undo, Reset Board, and New Game actions.

- InlineStyles and App.css
  - InlineStyles injects scoped theme CSS.
  - App.css provides minimal global resets.

## State Model
App manages the following state:
- board: string[] of length 9 where each entry is 'X' | 'O' | null.
- xIsNext: boolean that indicates the next player ('X' when true).
- history: string[][] capturing a stack of past board arrays used to support undo.
- scores: { X: number; O: number; draw: number } persisted to localStorage as JSON under key 'ttt:scores'.

Derived:
- result: null | { winner: 'X' | 'O'; line: [number, number, number] } | { winner: null; line: number[]; draw: true }
- currentPlayer: 'X' | 'O' computed from xIsNext.

## Core Algorithms

### Winner and Draw Detection
- WIN_LINES: 8 static line definitions: rows, columns, and diagonals.
- calculateWinner(squares: string[]): 
  - For each line, return winner and the line if three identical non-null marks match.
  - If all squares are set and no winner, return draw: true.
  - Else, return null.

### Move Processing
- handleSquareClick(index):
  - If the square is taken or result is a win/draw, ignore.
  - Push current board into history.
  - Clone board, set squares[index] = currentPlayer, setBoard(next).
  - Toggle xIsNext.

- handleKeyDownSquare(e, index):
  - On 'Enter' or ' ' call handleSquareClick(index).
  - Arrow navigation calculates row/column and selects the target index, then moves focus.

### Undo and Reset
- undoLast():
  - If history is empty, no-op.
  - If game ended (winner/draw) and history exists, allow undo to return to last in-progress state.
  - Pop from history, set board to previous state, and toggle xIsNext.

- resetBoard():
  - Clear board to all nulls, xIsNext = true, history = [].

- newGame():
  - Calls resetBoard() and resets scores to { X: 0, O: 0, draw: 0 }.

### Persistence
- Initialization:
  - scores use a lazy initializer reading localStorage.getItem('ttt:scores').
  - Parsing failures fall back to { X: 0, O: 0, draw: 0 }.

- Updates:
  - useEffect persists scores to localStorage whenever they change.

- Score updates:
  - When result changes to a draw, increment scores.draw.
  - When result changes to a winner, increment scores['X'|'O'].

## Accessibility Details
- Board (role="grid") and Square (role="gridcell") ensure screen reader compatibility.
- Squares have tabIndex=0 for keyboard focus and are activatable with Enter/Space.
- Arrow keys support intuitive navigation across the grid with focus management.
- Live regions:
  - TurnIndicator uses aria-live="polite".
  - Score cards use role="status" with aria-live="polite".

## Styling and Theming
- Theme tokens:
  - primary: #3b82f6
  - secondary: #64748b
  - success: #06b6d4
  - error: #EF4444
  - background: #f9fafb
  - surface: #ffffff
  - text: #111827
- Visual language:
  - Rounded cards, subtle gradients, and soft elevation via box shadows.
  - Board and cells include hover and focus feedback with animated micro-interactions.
- Global CSS in src/App.css is intentionally minimal to keep scope local to components.

## Testing Strategy
- src/App.test.js validates presence of the main grid and controls.
- Recommended future tests:
  - calculateWinner unit tests for all winning lines and draw scenario.
  - Undo flow tests validating state rollback.
  - Accessibility tests: keyboard navigation and aria updates.
  - Snapshot tests for key UI states (turn, winner, draw).

## File Mapping
- src/App.js: All components, logic, and inline scoped CSS.
- src/App.css: Base resets and minimal global styles.
- src/App.test.js: Rendering sanity checks for the board and control buttons.
- src/index.js: React app bootstrapping.
- src/index.css: Base typography.
- src/setupTests.js: jest-dom setup for better assertions.

## Extension Points
- Split components into separate files if the app grows.
- Introduce a reducer or state machine for more complex flows.
- Add AI for single-player mode and difficulty levels.
- Integrate theming toggles and persist user preferences.
- Convert inline styles to CSS Modules or a CSS-in-JS solution if preferred.
