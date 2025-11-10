export type GridConstants = Readonly<{
  INITIAL_ROWS: number;
  INITIAL_COLS: number;
  INITIAL_FILLED_ROWS: number;
  ADD_BUTTON_USES: number;
}>;

const INITIAL_ROWS: number = 9;
const INITIAL_COLS: number = 9;
const INITIAL_FILLED_ROWS: number = 3;
const ADD_BUTTON_USES: number = 2;

const GRID: GridConstants = {
  INITIAL_ROWS,
  INITIAL_COLS,
  INITIAL_FILLED_ROWS,
  ADD_BUTTON_USES,
};

export default GRID;
