import makeId from "./makeId";
import { CellData } from "../types";
const generateRow = (rowIndex: number, cols: number): CellData[] =>
  Array.from({ length: cols }).map((_, c) => ({
    id: makeId(rowIndex, c),
    row: rowIndex,
    col: c,
    value: Math.ceil(Math.random() * 9),
    faded: false,
  }));

export default generateRow;
