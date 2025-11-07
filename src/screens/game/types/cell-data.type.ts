export default interface CellData {
  id: string;
  row: number;
  col: number;
  value: number | null;
  faded: boolean;
}
