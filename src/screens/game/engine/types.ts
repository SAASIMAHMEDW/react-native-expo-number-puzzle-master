// ============================================
// CORE ENGINE TYPES
// ============================================

export interface CellData {
  id: string;
  row: number;
  col: number;
  value: number | null;
  faded: boolean;
  color?: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface MatchResult {
  isValid: boolean;
  path?: Position[];
  reason?: string;
  blockingCells?: Position[];
}

export interface LevelConfig {
  id: number;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  initialRows: number;
  initialCols: number;
  initialFilledRows: number;
  targetScore: number;
  initialTimer: number;
  timerBoostPerScore: number;
  maxTimerBoosts: number;
  addRowCount: number;
  description: string;
}

export interface GameStateData {
  currentLevel: number;
  score: number;
  timer: number;
  addRowUses: number;
  isGameOver: boolean;
  isPaused: boolean;
  grid: CellData[][];
  currentLevelTargetScore: number;
}

// ============================================
// EVENT TYPES FOR EVENT-BASED ARCHITECTURE
// ============================================

export enum GameEvent {
  // Grid Events
  GRID_UPDATED = "grid:updated",
  CELL_SELECTED = "cell:selected",
  CELLS_MATCHED = "cells:matched",
  ROW_ADDED = "row:added",

  // Score Events
  SCORE_UPDATED = "score:updated",

  // Timer Events
  TIMER_UPDATED = "timer:updated",
  TIMER_EXPIRED = "timer:expired",

  // Level Events
  LEVEL_STARTED = "level:started",
  LEVEL_COMPLETED = "level:completed",
  LEVEL_FAILED = "level:failed",

  // Game State Events
  GAME_STARTED = "game:started",
  GAME_PAUSED = "game:paused",
  GAME_RESUMED = "game:resumed",
  GAME_OVER = "game:over",
}

export type EventCallback = (data?: any) => void;

export interface IEventEmitter {
  on(event: GameEvent, callback: EventCallback): void;
  off(event: GameEvent, callback: EventCallback): void;
  emit(event: GameEvent, data?: any): void;
  removeAllListeners(event?: GameEvent): void;
}
