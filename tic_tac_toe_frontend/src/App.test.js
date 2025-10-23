import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe board and controls', () => {
  render(<App />);
  // Board is a grid with 9 cells
  const grid = screen.getByRole('grid', { name: /tic tac toe board/i });
  expect(grid).toBeInTheDocument();
  const cells = grid.querySelectorAll('[role="gridcell"]');
  expect(cells.length).toBe(9);

  // Controls present
  expect(screen.getByRole('button', { name: /undo last/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reset board/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
});
