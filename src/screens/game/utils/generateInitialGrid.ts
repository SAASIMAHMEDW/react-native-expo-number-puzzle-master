import { CellData } from "../types";
import generateRow from "./generateRow";
import makeId from "./makeId";

// Generate fresh grid
const generateInitialGrid = (
  INITIAL_ROWS: number = 9,
  INITIAL_COLS: number = 9,
  INITIAL_FILLED_ROWS: number = 3
): CellData[][] => {
  const rows: CellData[][] = [];
  for (let r = 0; r < INITIAL_ROWS; r++) {
    if (r < INITIAL_FILLED_ROWS) {
      rows.push(generateRow(r, INITIAL_COLS));
    } else {
      rows.push(
        Array.from({ length: INITIAL_COLS }).map((_, c) => ({
          id: makeId(r, c),
          row: r,
          col: c,
          value: null,
          faded: false,
        }))
      );
    }
  }
  return rows;
};

export default generateInitialGrid;
