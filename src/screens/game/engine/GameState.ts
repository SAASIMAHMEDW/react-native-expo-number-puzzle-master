import {
  CellData,
  GameStateData,
  Position,
  IEventEmitter,
  GameEvent,
  LevelConfig,
} from "./types";
import { GridEngine } from "./GridEngine";
import { MatchEngine } from "./MatchEngine";
import { LevelManager, ScoreBasedProgressionStrategy } from "./LevelManager";
import { EventEmitter } from "./EventEmitter";
import { LEVEL_CONFIGS, LEVEL_SEQUENCE } from "./LevelConstants";

export class GameState {
  private eventEmitter: IEventEmitter;
  private gridEngine!: GridEngine;
  private matchEngine!: MatchEngine;
  private levelManager: LevelManager;

  private score: number;
  private timer: number;
  private addRowUses: number;
  private isGameOver: boolean;
  private isPaused: boolean;
  private selectedCell: Position | null;
  private timerBoostCount: number;
  private currentLevelTargetScore: number;

  constructor() {
    this.eventEmitter = new EventEmitter();

    this.levelManager = new LevelManager(
      {
        levels: LEVEL_CONFIGS,
        sequence: LEVEL_SEQUENCE,
        progressionStrategy: new ScoreBasedProgressionStrategy(
          () => this.score,
          () => this.timer
        ),
      },
      this.eventEmitter
    );

    this.score = 0;
    this.timer = 0;
    this.addRowUses = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.selectedCell = null;
    this.timerBoostCount = 0;
    this.currentLevelTargetScore = 0;

    this.initializeLevel();
  }

  private initializeLevel(): void {
    const level = this.levelManager.startLevel();

    this.gridEngine = new GridEngine(
      level.initialRows,
      level.initialCols,
      level.initialFilledRows,
      this.eventEmitter
    );

    this.matchEngine = new MatchEngine(this.gridEngine, this.eventEmitter);

    this.score = 0;
    this.timer = level.initialTimer;
    this.addRowUses = level.addRowCount;
    this.isGameOver = false;
    this.isPaused = false;
    this.selectedCell = null;
    this.timerBoostCount = 0;
    this.currentLevelTargetScore = level.targetScore;

    this.eventEmitter.emit(GameEvent.GAME_STARTED, this.getStateSnapshot());
  }

  getEventEmitter(): IEventEmitter {
    return this.eventEmitter;
  }

  on(event: GameEvent, callback: (data?: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: GameEvent, callback: (data?: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  getGrid(): CellData[][] {
    return this.gridEngine.getGrid();
  }

  getScore(): number {
    return this.score;
  }

  getTimer(): number {
    return this.timer;
  }

  getAddRowUses(): number {
    return this.addRowUses;
  }

  isOver(): boolean {
    return this.isGameOver;
  }

  getPaused(): boolean {
    return this.isPaused;
  }

  getCurrentLevel(): LevelConfig {
    return this.levelManager.getCurrentLevel();
  }

  getCurrentLevelNumber(): number {
    return this.levelManager.getCurrentLevelNumber();
  }

  hasNextLevel(): boolean {
    return this.levelManager.hasNextLevel();
  }

  getStateSnapshot(): GameStateData {
    return {
      currentLevel: this.levelManager.getCurrentLevelNumber(),
      score: this.score,
      timer: this.timer,
      addRowUses: this.addRowUses,
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      grid: this.gridEngine.getGrid(),
      currentLevelTargetScore: this.getCurrentLevelTargetScore(),
    };
  }

  //  return match status and path info
  selectCell(
    row: number,
    col: number
  ): { success: boolean; invalidPath?: Position[] } {
    if (this.isGameOver || this.isPaused) return { success: false };

    const cell = this.gridEngine.getCell(row, col);
    if (!cell || cell.value === null || cell.faded) return { success: false };

    const position = { row, col };

    // If same cell is clicked again, deselect it
    if (
      this.selectedCell &&
      this.selectedCell.row === row &&
      this.selectedCell.col === col
    ) {
      this.selectedCell = null;
      this.eventEmitter.emit(GameEvent.CELL_SELECTED, {
        position: null,
        isFirst: false,
      });
      return { success: true };
    }

    if (!this.selectedCell) {
      this.selectedCell = position;
      this.eventEmitter.emit(GameEvent.CELL_SELECTED, {
        position,
        isFirst: true,
      });
      return { success: true };
    }
    // Second selection - attempt match

    const matchResult = this.matchEngine.canMatch(this.selectedCell, position);

    if (matchResult.isValid) {
      // Store the first cell position
      const firstCell = this.selectedCell;

      // Set the second cell as selected (so both show glow)
      this.selectedCell = position;
      this.eventEmitter.emit(GameEvent.CELL_SELECTED, {
        position,
        isFirst: false,
      });

      // Wait 400ms to show both cells selected
      setTimeout(() => {
        // Execute the match
        this.matchEngine.executeMatch(firstCell, position);
        this.incrementScore();

        // Clear selection
        this.selectedCell = null;
        this.eventEmitter.emit(GameEvent.CELL_SELECTED, {
          position: null,
          isFirst: false,
        });

        // Remove faded cells after animation
        setTimeout(() => {
          // this.gridEngine.removeFadedCells();
          this.checkLevelProgression();
        }, 300);
      }, 400); // Delay to show selection

      return { success: true };
    } else {
      // Return path for shake animation
      const invalidPath = matchResult.blockingCells || [];
      this.selectedCell = position;
      this.eventEmitter.emit(GameEvent.CELL_SELECTED, {
        position,
        isFirst: true,
      });
      return { success: false, invalidPath };
    }
  }

  clearSelection(): void {
    this.selectedCell = null;
  }

  getSelectedCell(): Position | null {
    return this.selectedCell;
  }

  getCurrentLevelTargetScore() {
    return this.currentLevelTargetScore;
  }

  private incrementScore(): void {
    this.score += 1;
    this.eventEmitter.emit(GameEvent.SCORE_UPDATED, { score: this.score });

    const level = this.getCurrentLevel();
    if (
      level.timerBoostPerScore > 0 &&
      this.timerBoostCount < level.maxTimerBoosts
    ) {
      this.timer += level.timerBoostPerScore;
      this.timerBoostCount++;
      this.eventEmitter.emit(GameEvent.TIMER_UPDATED, { timer: this.timer });
    }
  }

  decrementTimer(): void {
    if (this.isGameOver || this.isPaused || this.timer <= 0) return;

    this.timer -= 1;
    this.eventEmitter.emit(GameEvent.TIMER_UPDATED, { timer: this.timer });

    if (this.timer <= 0) {
      this.eventEmitter.emit(GameEvent.TIMER_EXPIRED);
      this.checkLevelProgression();
    }
  }

  addRow(): boolean {
    if (this.addRowUses <= 0) return false;

    const success = this.gridEngine.addNewRow();
    if (success) {
      this.addRowUses -= 1;
    }
    return success;
  }

  private checkLevelProgression(): void {
    const level = this.getCurrentLevel();
    const progression = this.levelManager.evaluateProgression({
      targetScore: level.targetScore,
    });

    if (progression === "level_up") {
      this.handleLevelComplete();
    } else if (progression === "level_fail") {
      this.handleLevelFailed();
    }
  }

  private handleLevelComplete(): void {
    this.levelManager.completeLevel();
  }

  private handleLevelFailed(): void {
    this.levelManager.failLevel();
    this.endGame();
  }

  startNextLevel(): void {
    if (!this.hasNextLevel()) {
      this.endGame();
      return;
    }

    const nextLevel = this.levelManager.advanceToNextLevel();
    if (nextLevel) {
      this.gridEngine = new GridEngine(
        nextLevel.initialRows,
        nextLevel.initialCols,
        nextLevel.initialFilledRows,
        this.eventEmitter
      );
      this.matchEngine = new MatchEngine(this.gridEngine, this.eventEmitter);

      this.score = 0;
      this.timer = nextLevel.initialTimer;
      this.addRowUses = nextLevel.addRowCount;
      this.selectedCell = null;
      this.timerBoostCount = 0;
      this.isPaused = false;
      this.currentLevelTargetScore = nextLevel.targetScore;

      this.eventEmitter.emit(GameEvent.GAME_STARTED, this.getStateSnapshot());
    }
  }

  restartLevel(): void {
    const level = this.levelManager.restartCurrentLevel();
    // const level = this.levelManager.startLevel();

    this.gridEngine = new GridEngine(
      level.initialRows,
      level.initialCols,
      level.initialFilledRows,
      this.eventEmitter
    );
    this.matchEngine = new MatchEngine(this.gridEngine, this.eventEmitter);

    this.score = 0;
    this.timer = level.initialTimer;
    this.addRowUses = level.addRowCount;
    this.isGameOver = false;
    this.isPaused = false;
    this.selectedCell = null;
    this.timerBoostCount = 0;
    this.currentLevelTargetScore = level.targetScore;

    this.eventEmitter.emit(GameEvent.GAME_STARTED, this.getStateSnapshot());
  }

  pause(): void {
    if (!this.isGameOver) {
      this.isPaused = true;
      this.eventEmitter.emit(GameEvent.GAME_PAUSED);
    }
  }

  resume(): void {
    if (!this.isGameOver) {
      this.isPaused = false;
      this.eventEmitter.emit(GameEvent.GAME_RESUMED);
    }
  }

  private endGame(): void {
    this.isGameOver = true;
    this.eventEmitter.emit(GameEvent.GAME_OVER, {
      finalScore: this.score,
      level: this.getCurrentLevelNumber(),
      allLevelsComplete:
        !this.hasNextLevel() &&
        this.score >= this.getCurrentLevel().targetScore,
    });
  }

  destroy(): void {
    this.eventEmitter.removeAllListeners();
  }
}
