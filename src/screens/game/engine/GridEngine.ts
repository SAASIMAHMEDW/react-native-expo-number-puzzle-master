import { CellData, Position, IEventEmitter, GameEvent } from "./types";
import { EventEmitter } from "./EventEmitter";
import { getRandomNeonColor } from "../constants/NEON_COLORS"; // ✅ Import

export class GridEngine {
  private grid: CellData[][];
  private rows: number;
  private cols: number;
  private eventEmitter: IEventEmitter;
  private lastAddedRowCount: number;

  constructor(
    rows: number,
    cols: number,
    filledRows: number,
    eventEmitter?: IEventEmitter
  ) {
    this.rows = rows;
    this.cols = cols;
    this.eventEmitter = eventEmitter || new EventEmitter();
    this.lastAddedRowCount = filledRows;
    this.grid = this.generateInitialGrid(filledRows);
  }

  private makeId(r: number, c: number): string {
    return `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;
  }

  private generateRowOLDY(rowIndex: number): CellData[] {
    return Array.from({ length: this.cols }).map((_, c) => ({
      id: this.makeId(rowIndex, c),
      row: rowIndex,
      col: c,
      value: Math.ceil(Math.random() * 9),
      faded: false,
      color: getRandomNeonColor(), // ✅ Assign random neon color
    }));
  }
  private generateRow(rowIndex: number): CellData[] {
    return Array.from({ length: this.cols }).map((_, c) => ({
      id: this.makeId(rowIndex, c),
      row: rowIndex, // Uses the actual row index passed in
      col: c,
      value: Math.ceil(Math.random() * 9),
      faded: false,
      color: getRandomNeonColor(),
    }));
  }

  private generateInitialGrid(filledRows: number): CellData[][] {
    const rows: CellData[][] = [];
    for (let r = 0; r < this.rows; r++) {
      if (r < filledRows) {
        rows.push(this.generateRow(r));
      } else {
        rows.push(
          Array.from({ length: this.cols }).map((_, c) => ({
            id: this.makeId(r, c),
            row: r,
            col: c,
            value: null,
            faded: false,
            color: undefined,
          }))
        );
      }
    }
    return rows;
  }

  getGrid(): CellData[][] {
    return this.grid;
  }

  getCell(row: number, col: number): CellData | null {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return this.grid[row][col];
    }
    return null;
  }

  getCellValue(row: number, col: number): number | null {
    const cell = this.getCell(row, col);
    return cell ? cell.value : null;
  }

  updateCellOLDY(row: number, col: number, updates: Partial<CellData>): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = { ...this.grid[row][col], ...updates };
      this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
    }
  }
  // Only emit when necessary
  updateCell(
    row: number,
    col: number,
    updates: Partial<CellData>,
    skipEmit = false
  ): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = { ...this.grid[row][col], ...updates };
      if (!skipEmit) {
        this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
      }
    }
  }

  fadeCellsOLDY(positions: Position[]): void {
    positions.forEach(({ row, col }) => {
      this.updateCell(row, col, { faded: true });
    });
  }
  // Batch multiple cell updates
  fadeCells(positions: Position[]): void {
    positions.forEach(({ row, col }, index) => {
      const skipEmit = index < positions.length - 1;
      this.updateCell(row, col, { faded: true }, skipEmit);
    });
  }

  removeFadedCells(): void {
    // for (let row = 0; row < this.rows; row++) {
    //   for (let col = 0; col < this.cols; col++) {
    //     if (this.grid[row][col].faded) {
    //       this.grid[row][col].value = null;
    //       this.grid[row][col].faded = false;
    //       this.grid[row][col].color = undefined;
    //     }
    //   }
    // }
    this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
  }

  addNewRowOLDY(): boolean {
    const emptyRows: number[] = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].every((cell) => cell.value === null)) {
        emptyRows.push(r);
      }
    }

    if (emptyRows.length === 0) {
      return false;
    }

    const rowsToAdd = Math.min(this.lastAddedRowCount, emptyRows.length);

    if (rowsToAdd === 0) {
      return false;
    }

    for (let i = 0; i < rowsToAdd; i++) {
      if (i < emptyRows.length) {
        const rowIndex = emptyRows[i];
        this.grid[rowIndex] = this.generateRow(rowIndex);
      }
    }

    this.lastAddedRowCount = rowsToAdd * 2;

    this.eventEmitter.emit(GameEvent.ROW_ADDED, { rowsAdded: rowsToAdd });
    this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
    return true;
  }
  addNewRow(): boolean {
    // Find empty rows
    const emptyRows: number[] = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].every((cell) => cell.value === null)) {
        emptyRows.push(r);
      }
    }

    // ✅ NEW: If no empty rows, expand the grid!
    if (emptyRows.length === 0) {
      const rowsToCreate = this.lastAddedRowCount;
      const startRow = this.rows; // Start from current end

      // Create new rows
      for (let i = 0; i < rowsToCreate; i++) {
        const newRowIndex = startRow + i;
        this.grid.push(this.generateRow(newRowIndex));
        this.rows++; // Increase row count
      }

      // Double for next time
      this.lastAddedRowCount = rowsToCreate * 2;

      this.eventEmitter.emit(GameEvent.ROW_ADDED, {
        rowsAdded: rowsToCreate,
        firstNewRowIndex: startRow,
      });
      this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
      return true;
    }

    // ✅ Fill existing empty rows
    const rowsToAdd = Math.min(this.lastAddedRowCount, emptyRows.length);

    if (rowsToAdd === 0) {
      return false;
    }

    for (let i = 0; i < rowsToAdd; i++) {
      if (i < emptyRows.length) {
        const rowIndex = emptyRows[i];
        this.grid[rowIndex] = this.generateRow(rowIndex);
      }
    }

    // Only double if we filled all requested rows
    if (rowsToAdd === this.lastAddedRowCount) {
      this.lastAddedRowCount = rowsToAdd * 2;
    }

    this.eventEmitter.emit(GameEvent.ROW_ADDED, {
      rowsAdded: rowsToAdd,
      firstNewRowIndex: emptyRows[0],
    });
    this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
    return true;
  }

  hasAvailableMoves(): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.grid[row][col];
        if (cell.value !== null && !cell.faded) {
          const neighbors = this.getNeighbors(row, col);
          for (const neighbor of neighbors) {
            const neighborCell = this.getCell(neighbor.row, neighbor.col);
            if (
              neighborCell &&
              neighborCell.value !== null &&
              !neighborCell.faded
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private getNeighbors(row: number, col: number): Position[] {
    return [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ].filter(
      (pos) =>
        pos.row >= 0 &&
        pos.row < this.rows &&
        pos.col >= 0 &&
        pos.col < this.cols
    );
  }

  reset(filledRows: number): void {
    this.lastAddedRowCount = filledRows;
    this.grid = this.generateInitialGrid(filledRows);
    this.eventEmitter.emit(GameEvent.GRID_UPDATED, this.grid);
  }
}
