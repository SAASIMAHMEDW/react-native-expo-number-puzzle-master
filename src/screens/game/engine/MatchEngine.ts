import {
  CellData,
  Position,
  MatchResult,
  IEventEmitter,
  GameEvent,
} from "./types";
import { GridEngine } from "./GridEngine";

// ============================================
// MATCH ENGINE - Handles Matching Logic
// ============================================

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

    // Validate cells exist and have values
    if (!cell1 || !cell2 || cell1.value === null || cell2.value === null) {
      return { isValid: false, reason: "Invalid cells" };
    }

    // Don't match same cell
    if (pos1.row === pos2.row && pos1.col === pos2.col) {
      return { isValid: false, reason: "Same cell selected" };
    }

    // Don't match faded cells
    if (cell1.faded || cell2.faded) {
      return { isValid: false, reason: "Cell already faded" };
    }

    // Check matching rules: same number OR sum equals 10
    const matchesRule =
      cell1.value === cell2.value || cell1.value + cell2.value === 10;

    if (!matchesRule) {
      return { isValid: false, reason: "Numbers do not match" };
    }

    // Check if there's a valid path
    const path = this.findPath(pos1, pos2);
    if (!path) {
      return { isValid: false, reason: "No valid path found" };
    }

    return { isValid: true, path };
  }

  // ============================================
  // PATH FINDING WITH WRAP-AROUND
  // ============================================

  private findPath(start: Position, end: Position): Position[] | null {
    // Try direct paths (horizontal, vertical, diagonal)
    const directPath = this.findDirectPath(start, end);
    if (directPath) return directPath;

    // Try wrap-around paths
    const wrapPath = this.findWrapAroundPath(start, end);
    if (wrapPath) return wrapPath;

    return null;
  }

  private findDirectPath(start: Position, end: Position): Position[] | null {
    // Horizontal path
    if (start.row === end.row) {
      const path = this.getHorizontalPath(start, end);
      if (this.isPathClear(path)) return path;
    }

    // Vertical path
    if (start.col === end.col) {
      const path = this.getVerticalPath(start, end);
      if (this.isPathClear(path)) return path;
    }

    // Diagonal path
    if (Math.abs(start.row - end.row) === Math.abs(start.col - end.col)) {
      const path = this.getDiagonalPath(start, end);
      if (this.isPathClear(path)) return path;
    }

    return null;
  }

  private findWrapAroundPath(
    start: Position,
    end: Position
  ): Position[] | null {
    const grid = this.gridEngine.getGrid();
    const rows = grid.length;
    const cols = grid[0].length;

    // Horizontal wrap-around
    if (start.row === end.row) {
      const leftPath = this.getHorizontalWrapPath(start, end, cols, "left");
      if (this.isPathClear(leftPath)) return leftPath;

      const rightPath = this.getHorizontalWrapPath(start, end, cols, "right");
      if (this.isPathClear(rightPath)) return rightPath;
    }

    // Vertical wrap-around
    if (start.col === end.col) {
      const topPath = this.getVerticalWrapPath(start, end, rows, "top");
      if (this.isPathClear(topPath)) return topPath;

      const bottomPath = this.getVerticalWrapPath(start, end, rows, "bottom");
      if (this.isPathClear(bottomPath)) return bottomPath;
    }

    return null;
  }

  // ============================================
  // PATH GENERATION HELPERS
  // ============================================

  private getHorizontalPath(start: Position, end: Position): Position[] {
    const path: Position[] = [];
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    for (let col = minCol; col <= maxCol; col++) {
      path.push({ row: start.row, col });
    }
    return path;
  }

  private getVerticalPath(start: Position, end: Position): Position[] {
    const path: Position[] = [];
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    for (let row = minRow; row <= maxRow; row++) {
      path.push({ row, col: start.col });
    }
    return path;
  }

  private getDiagonalPath(start: Position, end: Position): Position[] {
    const path: Position[] = [];
    const rowStep = start.row < end.row ? 1 : -1;
    const colStep = start.col < end.col ? 1 : -1;

    let row = start.row;
    let col = start.col;

    while (row !== end.row || col !== end.col) {
      path.push({ row, col });
      if (row !== end.row) row += rowStep;
      if (col !== end.col) col += colStep;
    }
    path.push({ row: end.row, col: end.col });

    return path;
  }

  private getHorizontalWrapPath(
    start: Position,
    end: Position,
    cols: number,
    direction: "left" | "right"
  ): Position[] {
    const path: Position[] = [];
    const row = start.row;

    if (direction === "left") {
      // Go left from start to 0, then from cols-1 to end
      for (let col = start.col; col >= 0; col--) {
        path.push({ row, col });
      }
      for (let col = cols - 1; col >= end.col; col--) {
        path.push({ row, col });
      }
    } else {
      // Go right from start to cols-1, then from 0 to end
      for (let col = start.col; col < cols; col++) {
        path.push({ row, col });
      }
      for (let col = 0; col <= end.col; col++) {
        path.push({ row, col });
      }
    }

    return path;
  }

  private getVerticalWrapPath(
    start: Position,
    end: Position,
    rows: number,
    direction: "top" | "bottom"
  ): Position[] {
    const path: Position[] = [];
    const col = start.col;

    if (direction === "top") {
      // Go up from start to 0, then from rows-1 to end
      for (let row = start.row; row >= 0; row--) {
        path.push({ row, col });
      }
      for (let row = rows - 1; row >= end.row; row--) {
        path.push({ row, col });
      }
    } else {
      // Go down from start to rows-1, then from 0 to end
      for (let row = start.row; row < rows; row++) {
        path.push({ row, col });
      }
      for (let row = 0; row <= end.row; row++) {
        path.push({ row, col });
      }
    }

    return path;
  }

  // ============================================
  // PATH VALIDATION
  // ============================================

  private isPathClear(path: Position[]): boolean {
    if (path.length === 0) return false;

    // All cells in path (except start and end) must be null or faded
    for (let i = 1; i < path.length - 1; i++) {
      const cell = this.gridEngine.getCell(path[i].row, path[i].col);
      if (!cell) return false;
      if (cell.value !== null && !cell.faded) {
        return false;
      }
    }

    return true;
  }

  // ============================================
  // EXECUTE MATCH
  // ============================================

  executeMatch(pos1: Position, pos2: Position): boolean {
    const result = this.canMatch(pos1, pos2);

    if (result.isValid) {
      // Fade the matched cells
      this.gridEngine.fadeCells([pos1, pos2]);

      // Emit match event
      this.eventEmitter.emit(GameEvent.CELLS_MATCHED, {
        positions: [pos1, pos2],
        path: result.path,
      });

      return true;
    }

    return false;
  }
}
