import { Cell, GridConfig } from "./types";

export class GridEngine {
  rows: Cell[][];
  cols: number;
  config: GridConfig;

  constructor(config: GridConfig) {
    this.config = config;
    this.cols = config.cols;

    this.rows = this.generateInitialGrid(
      config.rows,
      config.cols,
      config.initialFilled
    );
  }

  private generateInitialGrid(totalRows: number, cols: number, filled: number) {
    const grid: Cell[][] = [];

    for (let r = 0; r < totalRows; r++) {
      const isFilled = r < filled;

      grid.push(
        Array.from({ length: cols }).map((_, c) => ({
          id: `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`,
          row: r,
          col: c,
          value: isFilled ? Math.ceil(Math.random() * 9) : null,
          faded: false,
        }))
      );
    }

    return grid;
  }

  getCell(r: number, c: number) {
    return this.rows[r]?.[c] ?? null;
  }

  fadeCells(a: Cell, b: Cell) {
    this.rows[a.row][a.col].faded = true;
    this.rows[b.row][b.col].faded = true;
  }

  /** -------------------------------------------
   *  PATH CHECKING LOGIC (migrated from GameGrid)
   *  ------------------------------------------- */
  checkPath(a: Cell, b: Cell): { valid: boolean; betweenCells: string[] } {
    const r1 = a.row;
    const c1 = a.col;
    const r2 = b.row;
    const c2 = b.col;

    const betweenFn = (r: number, c: number) => {
      const cell = this.rows[r][c];
      return !(cell.faded || cell.value === null);
    };

    const betweenCells: string[] = [];

    // Horizontal
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);
      for (let c = minC + 1; c < maxC; c++) {
        if (betweenFn(r1, c)) betweenCells.push(`${r1}-${c}`);
      }
      return { valid: betweenCells.length === 0, betweenCells };
    }

    // Vertical
    if (c1 === c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      for (let r = minR + 1; r < maxR; r++) {
        if (betweenFn(r, c1)) betweenCells.push(`${r}-${c1}`);
      }
      return { valid: betweenCells.length === 0, betweenCells };
    }

    // Diagonal
    const rowDiff = r2 - r1;
    const colDiff = c2 - c1;
    if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      const steps = Math.abs(rowDiff);
      const rStep = rowDiff / steps;
      const cStep = colDiff / steps;
      for (let i = 1; i < steps; i++) {
        const r = r1 + rStep * i;
        const c = c1 + cStep * i;
        if (betweenFn(r, c)) betweenCells.push(`${r}-${c}`);
      }
      return { valid: betweenCells.length === 0, betweenCells };
    }

    // Wrap-around (linear sequence) check
    const totalCells = this.rows.length * this.cols;
    const indexOf = (r: number, c: number) => r * this.cols + c;
    const i1 = indexOf(r1, c1);
    const i2 = indexOf(r2, c2);
    let start = Math.min(i1, i2);
    let end = Math.max(i1, i2);

    // direct path
    for (let i = start + 1; i < end; i++) {
      const rr = Math.floor(i / this.cols);
      const cc = i % this.cols;
      if (betweenFn(rr, cc)) betweenCells.push(`${rr}-${cc}`);
    }

    if (betweenCells.length === 0) return { valid: true, betweenCells: [] };

    // try wrap path (end -> start)
    const wrapped: string[] = [];
    for (let i = end + 1; i < totalCells + start; i++) {
      const idx = i % totalCells;
      const rr = Math.floor(idx / this.cols);
      const cc = idx % this.cols;
      if (betweenFn(rr, cc)) wrapped.push(`${rr}-${cc}`);
    }

    if (wrapped.length === 0) {
      return { valid: true, betweenCells: [] }; // wrap path is clear
    }

    // blocks exist => invalid
    return { valid: false, betweenCells };
  }

  checkPathOLD(a: Cell, b: Cell): boolean {
    const r1 = a.row;
    const c1 = a.col;
    const r2 = b.row;
    const c2 = b.col;

    const between = (r: number, c: number) => {
      const cell = this.rows[r][c];
      return !(cell.faded || cell.value === null);
    };

    // ---- Horizontal ---- //
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);

      for (let c = minC + 1; c < maxC; c++) {
        if (between(r1, c)) return false;
      }
      return true;
    }

    // ---- Vertical ---- //
    if (c1 === c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);

      for (let r = minR + 1; r < maxR; r++) {
        if (between(r, c1)) return false;
      }
      return true;
    }

    // ---- Diagonal ---- //
    const rowDiff = r2 - r1;
    const colDiff = c2 - c1;

    if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      const steps = Math.abs(rowDiff);
      const rStep = rowDiff / steps;
      const cStep = colDiff / steps;

      for (let i = 1; i < steps; i++) {
        const r = r1 + rStep * i;
        const c = c1 + cStep * i;
        if (between(r, c)) return false;
      }
      return true;
    }

    // -----------------------------------------------------------
    // WRAP-AROUND CHECK (linear wrap across entire grid sequence)
    // -----------------------------------------------------------
    const totalCells = this.rows.length * this.cols;

    const indexOf = (r: number, c: number) => r * this.cols + c;

    const i1 = indexOf(r1, c1);
    const i2 = indexOf(r2, c2);

    let [start, end] = i1 < i2 ? [i1, i2] : [i2, i1];

    // Check direct path (start → end)
    for (let i = start + 1; i < end; i++) {
      const r = Math.floor(i / this.cols);
      const c = i % this.cols;
      if (between(r, c)) return false;
    }

    // Check WRAP path (end → start by wrapping)
    for (let i = end + 1; i < totalCells + start; i++) {
      const idx = i % totalCells;
      const r = Math.floor(idx / this.cols);
      const c = idx % this.cols;
      if (between(r, c)) return false;
    }

    return true;
  }

  /** ------------------------
   *  ADD ROW (same behavior)
   *  ------------------------ */
  addRowOLD() {
    const newIndex = this.rows.length;

    const newRow = Array.from({ length: this.cols }).map((_, c) => ({
      id: `${newIndex}-${c}-${Math.random().toString(36).slice(2, 6)}`,
      row: newIndex,
      col: c,
      value: Math.ceil(Math.random() * 9),
      faded: false,
    }));

    this.rows.push(newRow);
    return this.rows;
  }

  addRow() {
    const newRow = Array.from({ length: this.cols }).map((_, c) => ({
      id: `${this.rows.length}-${c}-${Math.random().toString(36).slice(2, 6)}`,
      row: this.rows.length,
      col: c,
      value: Math.ceil(Math.random() * 9),
      faded: false,
    }));
    this.rows.push(newRow);
    this.reindex(); // ensure consistent row/col after mutation
    return this.rows;
  }

  reindex() {
    for (let r = 0; r < this.rows.length; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.rows[r][c];
        if (cell) {
          cell.row = r;
          cell.col = c;
          cell.id = `${r}-${c}-${cell.id.split("-").pop()}`;
        } else {
          // if missing, create placeholder to keep shape
          this.rows[r][c] = {
            id: `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`,
            row: r,
            col: c,
            value: null,
            faded: false,
          };
        }
      }
    }
  }
}
