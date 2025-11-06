import makeId from "./makeId";

interface CellData {
  id: string;
  row: number;
  col: number;
  value: number;
  faded: boolean;
}

const generateGrid = (rows: number, cols: number): CellData[][] =>
  Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: cols }).map((_, c) => ({
      id: makeId(r, c),
      row: r,
      col: c,
      value: Math.floor(Math.random() * 10),
      faded: false,
    }))
  );

export default generateGrid;
