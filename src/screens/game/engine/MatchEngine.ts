import {
  CellData,
  Position,
  MatchResult,
  IEventEmitter,
  GameEvent,
} from "./types";
import { GridEngine } from "./GridEngine";

export class MatchEngine {
  private gridEngine: GridEngine;
  private eventEmitter: IEventEmitter;

  constructor(gridEngine: GridEngine, eventEmitter: IEventEmitter) {
    this.gridEngine = gridEngine;
    this.eventEmitter = eventEmitter;
  }

  // ============================================
  // MATCH VALIDATION
  // ============================================

  canMatch(pos1: Position, pos2: Position): MatchResult {
    const cell1 = this.gridEngine.getCell(pos1.row, pos1.col);
    const cell2 = this.gridEngine.getCell(pos2.row, pos2.col);

    if (!cell1 || !cell2 || cell1.value === null || cell2.value === null) {
      return { isValid: false, reason: "Invalid cells" };
    }

    if (pos1.row === pos2.row && pos1.col === pos2.col) {
      return { isValid: false, reason: "Same cell selected" };
    }

    if (cell1.faded || cell2.faded) {
      return { isValid: false, reason: "Cell already faded" };
    }

    const matchesRule =
      cell1.value === cell2.value || cell1.value + cell2.value === 10;

    if (!matchesRule) {
      return { isValid: false, reason: "Numbers do not match" };
    }

    // ✅ NEW: Check path with blocking cells
    const pathResult = this.findPath(pos1, pos2);
    if (!pathResult.isValid) {
      return {
        isValid: false,
        reason: "No valid path found",
        blockingCells: pathResult.blockingCells, // ✅ Return blocking cells
      };
    }

    return { isValid: true, path: pathResult.path };
  }

  // ============================================
  // PATH FINDING WITH CONTINUOUS LOOP
  // ============================================

  private findPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    // Try direct paths first
    const directResult = this.findDirectPath(start, end);
    if (directResult.isValid) {
      return directResult;
    }

    // Try continuous loop wrap-around
    const loopResult = this.findContinuousLoopPath(start, end);
    if (loopResult.isValid) {
      return loopResult;
    }

    // Return blocking cells from direct path for shake animation
    return {
      isValid: false,
      blockingCells: directResult.blockingCells,
    };
  }

  private findDirectPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    // Horizontal
    if (start.row === end.row) {
      return this.checkHorizontalPath(start, end);
    }

    // Vertical
    if (start.col === end.col) {
      return this.checkVerticalPath(start, end);
    }

    // Diagonal
    if (Math.abs(start.row - end.row) === Math.abs(start.col - end.col)) {
      return this.checkDiagonalPath(start, end);
    }

    return { isValid: false };
  }

  // ✅ NEW: Continuous loop wrap-around (like checkPath)
  private findContinuousLoopPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    const grid = this.gridEngine.getGrid();
    const rows = grid.length;
    const cols = grid[0].length;
    const totalCells = rows * cols;

    // Convert positions to flat indices
    const cellIndex = (r: number, c: number) => r * cols + c;
    const idx1 = cellIndex(start.row, start.col);
    const idx2 = cellIndex(end.row, end.col);

    // Always traverse from lowest to highest index
    const [startIdx, endIdx] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];

    // Check direct path (lowest → highest)
    const directBlocking: Position[] = [];
    for (let i = startIdx + 1; i < endIdx; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const cell = grid[r][c];
      if (cell.value !== null && !cell.faded) {
        directBlocking.push({ row: r, col: c });
      }
    }

    // If direct path is clear, use it
    if (directBlocking.length === 0) {
      const path: Position[] = [];
      for (let i = startIdx; i <= endIdx; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        path.push({ row: r, col: c });
      }
      return { isValid: true, path };
    }

    // ✅ Check wrap-around path (end → totalCells → 0 → start)
    const wrapBlocking: Position[] = [];
    for (let i = endIdx + 1; i < totalCells + startIdx; i++) {
      const actualIdx = i % totalCells;
      const r = Math.floor(actualIdx / cols);
      const c = actualIdx % cols;
      const cell = grid[r][c];
      if (cell.value !== null && !cell.faded) {
        wrapBlocking.push({ row: r, col: c });
      }
    }

    // If wrap path is clear, use it
    if (wrapBlocking.length === 0) {
      const path: Position[] = [];
      // From end to grid end
      for (let i = endIdx; i < totalCells; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        path.push({ row: r, col: c });
      }
      // From grid start to start
      for (let i = 0; i <= startIdx; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        path.push({ row: r, col: c });
      }
      return { isValid: true, path };
    }

    // Both paths blocked - return blocking cells from direct path
    return { isValid: false, blockingCells: directBlocking };
  }

  // ============================================
  // PATH CHECKING HELPERS WITH BLOCKING CELLS
  // ============================================

  private checkHorizontalPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const path: Position[] = [];
    const blocking: Position[] = [];

    for (let col = minCol; col <= maxCol; col++) {
      const cell = this.gridEngine.getCell(start.row, col);
      path.push({ row: start.row, col });

      // Check if cell is blocking (not start/end, has value, not faded)
      if (
        col > minCol &&
        col < maxCol &&
        cell &&
        cell.value !== null &&
        !cell.faded
      ) {
        blocking.push({ row: start.row, col });
      }
    }

    return blocking.length === 0
      ? { isValid: true, path }
      : { isValid: false, blockingCells: blocking };
  }

  private checkVerticalPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const path: Position[] = [];
    const blocking: Position[] = [];

    for (let row = minRow; row <= maxRow; row++) {
      const cell = this.gridEngine.getCell(row, start.col);
      path.push({ row, col: start.col });

      if (
        row > minRow &&
        row < maxRow &&
        cell &&
        cell.value !== null &&
        !cell.faded
      ) {
        blocking.push({ row, col: start.col });
      }
    }

    return blocking.length === 0
      ? { isValid: true, path }
      : { isValid: false, blockingCells: blocking };
  }

  private checkDiagonalPath(
    start: Position,
    end: Position
  ): { isValid: boolean; path?: Position[]; blockingCells?: Position[] } {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const steps = Math.abs(rowDiff);
    const rowStep = rowDiff / steps;
    const colStep = colDiff / steps;

    const path: Position[] = [];
    const blocking: Position[] = [];

    for (let i = 0; i <= steps; i++) {
      const row = start.row + rowStep * i;
      const col = start.col + colStep * i;
      const cell = this.gridEngine.getCell(row, col);
      path.push({ row, col });

      if (i > 0 && i < steps && cell && cell.value !== null && !cell.faded) {
        blocking.push({ row, col });
      }
    }

    return blocking.length === 0
      ? { isValid: true, path }
      : { isValid: false, blockingCells: blocking };
  }

  // ============================================
  // EXECUTE MATCH
  // ============================================

  executeMatch(pos1: Position, pos2: Position): boolean {
    const result = this.canMatch(pos1, pos2);

    if (result.isValid) {
      this.gridEngine.fadeCells([pos1, pos2]);
      this.eventEmitter.emit(GameEvent.CELLS_MATCHED, {
        positions: [pos1, pos2],
        path: result.path,
      });
      return true;
    }

    return false;
  }
}
