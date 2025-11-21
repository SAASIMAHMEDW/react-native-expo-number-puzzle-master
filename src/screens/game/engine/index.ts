// ============================================
// ENGINE EXPORTS
// Clean API for consuming components
// ============================================

export { EventEmitter } from "./EventEmitter";
export { GridEngine } from "./GridEngine";
export { MatchEngine } from "./MatchEngine";
export {
  LevelManager,
  ScoreBasedProgressionStrategy,
  XPBasedProgressionStrategy,
  WaveBasedProgressionStrategy,
  type LevelProgressionStrategy,
  type LevelManagerConfig,
} from "./LevelManager";
export { GameState } from "./GameState";

export type {
  CellData,
  Position,
  MatchResult,
  LevelConfig,
  GameStateData,
  EventCallback,
  IEventEmitter,
} from "./types";

export { GameEvent } from "./types";
