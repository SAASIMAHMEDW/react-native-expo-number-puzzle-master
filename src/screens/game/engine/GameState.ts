import { GridEngine } from "./GridEngine";
import { MatchEngine } from "./MatchEngine";
import { LevelManager } from "./LevelManager";
import { Cell, GridConfig, LevelConfig, SelectResult } from "./types";

interface GameStateConfig {
  grid: GridConfig;
  levels: LevelConfig;
}

export class GameState {
  grid: GridEngine;
  match: MatchEngine;
  levels: LevelManager;

  onGridChange?: (g: Cell[][]) => void;
  onScore?: (s: number) => void;
  onStageChange?: (s: number) => void;

  constructor(config: GameStateConfig) {
    this.grid = new GridEngine(config.grid);
    this.match = new MatchEngine();
    this.levels = new LevelManager(config.levels);
  }

  select(a: Cell, b: Cell) {
    const path = this.grid.checkPath(a, b);
    const validPath = path.valid;
    const validMatch = this.match.isValidMatch(a.value, b.value);

    if (!validPath) {
      return {
        success: false,
        reason: "path",
        betweenCells: path.betweenCells,
      };
    }
    if (!validMatch) {
      return { success: false, reason: "match", betweenCells: [] };
    }

    this.grid.fadeCells(a, b);
    this.levels.addScore(1);

    this.onScore?.(this.levels.score);
    this.onGridChange?.(this.grid.rows);

    if (this.levels.shouldAdvance()) {
      const newStage = this.levels.advance();
      this.onStageChange?.(newStage);
    }

    return { success: true, updatedGrid: this.grid.rows };
  }

  selectOLD(a: Cell, b: Cell): SelectResult {
    const validPath = this.grid.checkPath(a, b);
    const validMatch = this.match.isValidMatch(a.value, b.value);

    if (!validPath) return { success: false, reason: "path" };
    if (!validMatch) return { success: false, reason: "match" };

    this.grid.fadeCells(a, b);
    this.levels.addScore(1);

    this.onScore?.(this.levels.score);
    this.onGridChange?.(this.grid.rows);

    if (this.levels.shouldAdvance()) {
      const newStage = this.levels.advance();
      this.onStageChange?.(newStage);
    }

    return {
      success: true,
      updatedGrid: this.grid.rows,
    };
  }

  addRow() {
    this.grid.addRow();
    this.onGridChange?.(this.grid.rows);
  }
}
