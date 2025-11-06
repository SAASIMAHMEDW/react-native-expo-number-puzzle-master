import makeId from "./makeId";

interface CellData {
  id: string;
  row: number;
  col: number;
  value: number;
  faded: boolean;
}
const generateRow = (rowIndex: number, cols: number): CellData[] =>
  Array.from({ length: cols }).map((_, c) => ({
    id: makeId(rowIndex, c),
    row: rowIndex,
    col: c,
    value: Math.floor(Math.random() * 10),
    faded: false,
  }));


export default generateRow;