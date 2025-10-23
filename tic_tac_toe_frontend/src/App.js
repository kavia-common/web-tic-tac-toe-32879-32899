import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Theme tokens
 * - primary:   #3b82f6
 * - secondary: #64748b
 * - success:   #06b6d4
 * - error:     #EF4444
 * - background:#f9fafb
 * - surface:   #ffffff
 * - text:      #111827
 */

// Helpers
const WIN_LINES = [
  [0, 1, 2],[3, 4, 5],[6, 7, 8], // rows
  [0, 3, 6],[1, 4, 7],[2, 5, 8], // cols
  [0, 4, 8],[2, 4, 6]            // diags
];

function calculateWinner(squares) {
  for (const [a, b, c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (squares.every(Boolean)) {
    return { winner: null, line: [], draw: true };
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** App state and game logic with localStorage persistence for scores. */
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([]); // stack of previous board states

  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt:scores');
      return saved ? JSON.parse(saved) : { X: 0, O: 0, draw: 0 };
    } catch {
      return { X: 0, O: 0, draw: 0 };
    }
  });

  useEffect(() => {
    localStorage.setItem('ttt:scores', JSON.stringify(scores));
  }, [scores]);

  const result = useMemo(() => calculateWinner(board), [board]);
  const currentPlayer = xIsNext ? 'X' : 'O';

  useEffect(() => {
    if (!result) return;
    if (result.draw) {
      setScores(s => ({ ...s, draw: s.draw + 1 }));
    } else if (result.winner) {
      setScores(s => ({ ...s, [result.winner]: (s[result.winner] || 0) + 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.winner, result?.draw]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    if (board[index] || result?.winner || result?.draw) return;
    setHistory((h) => [...h, board]);
    const next = board.slice();
    next[index] = currentPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const handleKeyDownSquare = (e, index) => {
    // Allow Enter/Space to activate squares for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSquareClick(index);
    }
    // Optional arrow key navigation
    const row = Math.floor(index / 3);
    const col = index % 3;
    let target = null;
    if (e.key === 'ArrowRight') target = row * 3 + ((col + 1) % 3);
    if (e.key === 'ArrowLeft') target = row * 3 + ((col + 2) % 3);
    if (e.key === 'ArrowDown') target = ((row + 1) % 3) * 3 + col;
    if (e.key === 'ArrowUp') target = ((row + 2) % 3) * 3 + col;
    if (target !== null) {
      e.preventDefault();
      const el = document.querySelector(`[data-idx="${target}"]`);
      if (el) el.focus();
    }
  };

  // PUBLIC_INTERFACE
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHistory([]);
  };

  // PUBLIC_INTERFACE
  const newGame = () => {
    resetBoard();
    setScores({ X: 0, O: 0, draw: 0 });
  };

  // PUBLIC_INTERFACE
  const undoLast = () => {
    if (history.length === 0 || result?.winner || result?.draw) {
      // If game ended, allow undo to revert to last in-progress state too
      if (history.length > 0) {
        const last = history[history.length - 1];
        setBoard(last);
        setHistory((h) => h.slice(0, -1));
        setXIsNext((prev) => !prev);
      }
      return;
    }
    const last = history[history.length - 1];
    setBoard(last);
    setHistory((h) => h.slice(0, -1));
    setXIsNext((prev) => !prev);
  };

  const statusText = result?.winner
    ? `Winner: ${result.winner}`
    : result?.draw
    ? 'Draw'
    : `Turn: ${currentPlayer}`;

  return (
    <div className="App">
      <div className="tic-app">
        <header className="tic-header" role="banner" aria-label="Tic Tac Toe">
          <h1 className="app-title">Tic Tac Toe</h1>
          <p className="app-subtitle">Ocean Professional Edition</p>
        </header>

        <main className="tic-main" role="main">
          <TurnIndicator text={statusText} player={currentPlayer} hasEnded={!!(result?.winner || result?.draw)} />
          <Board
            squares={board}
            onClick={handleSquareClick}
            onKeyDown={handleKeyDownSquare}
            winningLine={result?.line || []}
            disabled={!!(result?.winner || result?.draw)}
          />
          <Scoreboard scores={scores} />
          <Controls
            onReset={resetBoard}
            onNew={newGame}
            onUndo={undoLast}
            undoDisabled={history.length === 0}
          />
        </main>

        <footer className="tic-footer" role="contentinfo">
          <small className="footnote">Two players on one device · No data leaves your browser</small>
        </footer>
      </div>
      <InlineStyles />
    </div>
  );
}

function InlineStyles() {
  // Inject component-scoped styles matching the requested theme and layout
  return (
    <style>{`
      :root{
        --primary: #3b82f6;
        --secondary: #64748b;
        --success: #06b6d4;
        --error: #EF4444;
        --bg: #f9fafb;
        --surface: #ffffff;
        --text: #111827;
        --grid: rgba(17,24,39,0.1);
        --shadow: 0 10px 25px rgba(2,6,23,0.08), 0 2px 6px rgba(2,6,23,0.06);
      }
      .App{
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(249,250,251,1));
        color: var(--text);
      }
      .tic-app{
        width: 100%;
        max-width: 680px;
        margin: 24px;
        background: var(--surface);
        border: 1px solid rgba(17,24,39,0.06);
        border-radius: 20px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }
      .tic-header{
        padding: 28px 28px 10px;
        text-align: center;
        background:
          radial-gradient(1200px 200px at 50% -80px, rgba(59,130,246,0.15), transparent 70%),
          linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,1));
      }
      .app-title{
        margin:0;
        font-size: clamp(24px, 3.2vw, 32px);
        letter-spacing: 0.4px;
        color: var(--text);
      }
      .app-subtitle{
        margin: 6px 0 0;
        color: var(--secondary);
        font-size: 14px;
      }
      .tic-main{
        padding: 22px 24px 28px;
        display:flex;
        flex-direction: column;
        align-items:center;
        gap: 18px;
      }

      /* Turn Indicator */
      .turn-indicator{
        display:flex; align-items:center; gap: 10px;
        color: var(--secondary);
        font-weight: 600;
        letter-spacing: .2px;
      }
      .pill{
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
        border: 1px solid rgba(17,24,39,0.08);
        background: linear-gradient(180deg, rgba(255,255,255,0.9), #fff);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
      }
      .pill.turn{ color: var(--primary); }
      .pill.win{ color: #065f46; background: linear-gradient(180deg, #ecfeff, #d9faff); border-color: rgba(6,182,212,0.35); }
      .pill.draw{ color: #92400e; background: linear-gradient(180deg, #fff7ed, #fffbeb); border-color: rgba(250,204,21,0.35); }

      /* Board */
      .board{
        width: min(92vw, 420px);
        aspect-ratio: 1 / 1;
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 14px;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255,255,255,0.9), #fff);
        border: 1px solid rgba(17,24,39,0.06);
        box-shadow: var(--shadow);
        transition: transform .2s ease;
      }
      .board:active{ transform: scale(.998); }

      .square{
        position: relative;
        display:flex; align-items:center; justify-content:center;
        background: var(--bg);
        border: 1px solid var(--grid);
        border-radius: 12px;
        color: var(--text);
        font-size: clamp(32px, 10vw, 56px);
        font-weight: 800;
        cursor: pointer;
        user-select: none;
        outline: none;
        transition: transform .12s ease, box-shadow .12s ease, background .2s ease, border-color .2s ease;
        box-shadow: 0 2px 8px rgba(2,6,23,0.04) inset;
      }
      .square:hover{
        background: #fff;
        border-color: rgba(59,130,246,0.3);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        transform: translateY(-1px);
      }
      .square:active{
        transform: translateY(0);
      }
      .square:focus-visible{
        box-shadow: 0 0 0 3px rgba(59,130,246,0.35);
      }
      .square.disabled{
        cursor: default;
        opacity: .9;
      }
      .square.win{
        background: linear-gradient(180deg, #ecfeff, #d9faff);
        border-color: rgba(6,182,212,0.45);
        box-shadow: 0 0 0 3px rgba(6,182,212,0.18), inset 0 -8px 20px rgba(6,182,212,0.1);
        transform: translateY(-1px);
      }

      /* Scoreboard */
      .scoreboard{
        display:flex; gap: 12px; flex-wrap: wrap; justify-content:center;
        margin-top: 4px;
      }
      .card{
        min-width: 120px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(17,24,39,0.06);
        background: linear-gradient(180deg, rgba(255,255,255,0.95), #fff);
        box-shadow: var(--shadow);
        text-align:center;
      }
      .card h3{
        margin: 2px 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: .8px; color: var(--secondary);
      }
      .card .value{
        font-size: 22px; font-weight: 800; letter-spacing: .5px; color: var(--text);
      }
      .x h3{ color: var(--primary); }
      .o h3{ color: #0ea5e9; }
      .d h3{ color: #f59e0b; }

      /* Controls */
      .controls{
        display:flex; gap: 10px; flex-wrap: wrap; justify-content:center; margin-top: 2px;
      }
      .btn{
        appearance: none;
        border: 1px solid rgba(17,24,39,0.12);
        background: linear-gradient(180deg, rgba(255,255,255,0.95), #fff);
        color: var(--text);
        padding: 10px 14px;
        border-radius: 12px;
        font-weight: 700;
        letter-spacing: .3px;
        cursor: pointer;
        transition: transform .12s ease, box-shadow .12s ease, border-color .2s ease, color .2s ease;
        box-shadow: var(--shadow);
      }
      .btn:hover{
        transform: translateY(-1px);
        border-color: rgba(59,130,246,0.4);
        box-shadow: 0 8px 20px rgba(2,6,23,0.08);
      }
      .btn:active{ transform: translateY(0); }
      .btn.primary{ color: #0b4ebf; border-color: rgba(59,130,246,0.45); }
      .btn.warn{ color: #7c2d12; border-color: rgba(245,158,11,0.5); }
      .btn.danger{ color: #991b1b; border-color: rgba(239,68,68,0.55); }

      .tic-footer{
        padding: 14px;
        text-align:center;
        background: linear-gradient(180deg, #fff, rgba(255,255,255,0.9));
        border-top: 1px solid rgba(17,24,39,0.06);
      }
      .footnote{ color: var(--secondary); font-size: 12px; }
    `}</style>
  );
}

function TurnIndicator({ text, player, hasEnded }) {
  return (
    <div className="turn-indicator" aria-live="polite" aria-atomic="true">
      <span className={`pill ${hasEnded ? (text === 'Draw' ? 'draw' : 'win') : 'turn'}`}>
        {text}
      </span>
      {!hasEnded && <span aria-hidden="true">{player === 'X' ? '✖️' : '⭕'}</span>}
    </div>
  );
}

function Board({ squares, onClick, onKeyDown, winningLine = [], disabled }) {
  return (
    <section
      className="board"
      role="grid"
      aria-label="Tic Tac Toe board"
      aria-disabled={disabled ? 'true' : 'false'}
    >
      {squares.map((val, idx) => {
        const isWinning = winningLine.includes(idx);
        return (
          <Square
            key={idx}
            index={idx}
            value={val}
            onClick={() => onClick(idx)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            isWinning={isWinning}
            disabled={disabled || Boolean(val)}
          />
        );
      })}
    </section>
  );
}

function Square({ index, value, onClick, onKeyDown, isWinning, disabled }) {
  const label = value ? `Cell ${index + 1}, ${value}` : `Cell ${index + 1}, empty`;
  return (
    <div
      role="gridcell"
      aria-label={label}
      aria-selected={!!value}
      tabIndex={0}
      data-idx={index}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={!disabled ? onKeyDown : undefined}
      className={`square ${isWinning ? 'win' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {value}
    </div>
  );
}

function Scoreboard({ scores }) {
  return (
    <section className="scoreboard" aria-label="Scoreboard">
      <div className="card x" role="status" aria-live="polite">
        <h3>X WINS</h3>
        <div className="value" aria-label={`X wins ${scores.X}`}>{scores.X}</div>
      </div>
      <div className="card o" role="status" aria-live="polite">
        <h3>O WINS</h3>
        <div className="value" aria-label={`O wins ${scores.O}`}>{scores.O}</div>
      </div>
      <div className="card d" role="status" aria-live="polite">
        <h3>DRAWS</h3>
        <div className="value" aria-label={`Draws ${scores.draw}`}>{scores.draw}</div>
      </div>
    </section>
  );
}

function Controls({ onReset, onNew, onUndo, undoDisabled }) {
  return (
    <div className="controls" aria-label="Game Controls">
      <button className="btn primary" onClick={onUndo} disabled={undoDisabled} aria-disabled={undoDisabled ? 'true' : 'false'}>
        ⟲ Undo Last
      </button>
      <button className="btn" onClick={onReset}>
        ↺ Reset Board
      </button>
      <button className="btn danger" onClick={onNew}>
        ✖ New Game
      </button>
    </div>
  );
}

export default App;
