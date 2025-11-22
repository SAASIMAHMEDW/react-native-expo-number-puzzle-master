import { LevelConfig, IEventEmitter, GameEvent } from "./types";

// ============================================
// LEVEL MANAGER - Reusable Across Games
// ============================================

export interface LevelProgressionStrategy {
  shouldLevelUp(currentState: any): boolean;
  shouldLevelFail(currentState: any): boolean;
  getNextLevel(currentLevel: number): number | null;
}

export interface LevelManagerConfig {
  levels: Record<number, LevelConfig>;
  sequence: number[];
  progressionStrategy: LevelProgressionStrategy;
}

export class LevelManager {
  private levels: Record<number, LevelConfig>;
  private sequence: number[];
  private currentLevelIndex: number;
  private progressionStrategy: LevelProgressionStrategy;
  private eventEmitter: IEventEmitter;
  private isLevelActive: boolean;

  constructor(config: LevelManagerConfig, eventEmitter: IEventEmitter) {
    this.levels = config.levels;
    this.sequence = config.sequence;
    this.progressionStrategy = config.progressionStrategy;
    this.eventEmitter = eventEmitter;
    this.currentLevelIndex = 0;
    this.isLevelActive = false;
  }

  // ============================================
  // LEVEL INFORMATION
  // ============================================

  getCurrentLevel(): LevelConfig {
    const levelId = this.sequence[this.currentLevelIndex];
    return this.levels[levelId];
  }

  getCurrentLevelNumber(): number {
    return this.sequence[this.currentLevelIndex];
  }

  getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  getTotalLevels(): number {
    return this.sequence.length;
  }

  hasNextLevel(): boolean {
    return this.currentLevelIndex < this.sequence.length - 1;
  }

  isLastLevel(): boolean {
    return this.currentLevelIndex === this.sequence.length - 1;
  }

  isActive(): boolean {
    return this.isLevelActive;
  }

  // ============================================
  // LEVEL LIFECYCLE
  // ============================================

  startLevel(levelIndex?: number): LevelConfig {
    if (
      levelIndex !== undefined &&
      levelIndex >= 0 &&
      levelIndex < this.sequence.length
    ) {
      this.currentLevelIndex = levelIndex;
    }

    const level = this.getCurrentLevel();
    this.isLevelActive = true;

    this.eventEmitter.emit(GameEvent.LEVEL_STARTED, {
      level,
      levelIndex: this.currentLevelIndex,
      levelNumber: this.getCurrentLevelNumber(),
    });

    return level;
  }

  completeLevel(): void {
    const level = this.getCurrentLevel();
    this.isLevelActive = false;

    this.eventEmitter.emit(GameEvent.LEVEL_COMPLETED, {
      level,
      levelIndex: this.currentLevelIndex,
      levelNumber: this.getCurrentLevelNumber(),
      hasNextLevel: this.hasNextLevel(),
    });
  }

  failLevel(): void {
    const level = this.getCurrentLevel();
    this.isLevelActive = false;

    this.eventEmitter.emit(GameEvent.LEVEL_FAILED, {
      level,
      levelIndex: this.currentLevelIndex,
      levelNumber: this.getCurrentLevelNumber(),
    });
  }

  // ============================================
  // LEVEL PROGRESSION
  // ============================================

  advanceToNextLevel(): LevelConfig | null {
    if (!this.hasNextLevel()) {
      return null;
    }

    this.currentLevelIndex++;
    return this.startLevel();
  }

  restartCurrentLevel(): LevelConfig {
    return this.startLevel(this.currentLevelIndex);
  }

  goToLevel(levelIndex: number): LevelConfig | null {
    if (levelIndex < 0 || levelIndex >= this.sequence.length) {
      return null;
    }

    this.currentLevelIndex = levelIndex;
    return this.startLevel();
  }

  // ============================================
  // PROGRESSION EVALUATION
  // ============================================

  evaluateProgression(gameState: any): "continue" | "level_up" | "level_fail" {
    if (!this.isLevelActive) {
      return "continue";
    }

    if (this.progressionStrategy.shouldLevelFail(gameState)) {
      return "level_fail";
    }

    if (this.progressionStrategy.shouldLevelUp(gameState)) {
      return "level_up";
    }

    return "continue";
  }

  // ============================================
  // RESET
  // ============================================

  reset(): void {
    this.currentLevelIndex = 0;
    this.isLevelActive = false;
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  updateProgressionStrategy(strategy: LevelProgressionStrategy): void {
    this.progressionStrategy = strategy;
  }

  getLevelConfig(levelId: number): LevelConfig | null {
    return this.levels[levelId] || null;
  }

  getAllLevels(): LevelConfig[] {
    return this.sequence.map((id) => this.levels[id]);
  }
}

// ============================================
// SCORE-BASED PROGRESSION STRATEGY
// ============================================

export class ScoreBasedProgressionStrategy implements LevelProgressionStrategy {
  constructor(
    private getCurrentScore: () => number,
    private getTimer: () => number
  ) {}

  shouldLevelUp(currentState: any): boolean {
    const score = this.getCurrentScore();
    const targetScore = currentState.targetScore;
    return score >= targetScore;
  }

  shouldLevelFail(currentState: any): boolean {
    const timer = this.getTimer();
    return timer <= 0;
  }

  getNextLevel(currentLevel: number): number | null {
    return currentLevel + 1;
  }
}

// ============================================
// XP-BASED PROGRESSION STRATEGY
// ============================================

export class XPBasedProgressionStrategy implements LevelProgressionStrategy {
  constructor(private getXP: () => number) {}

  shouldLevelUp(currentState: any): boolean {
    const xp = this.getXP();
    const requiredXP = currentState.requiredXP || 0;
    return xp >= requiredXP;
  }

  shouldLevelFail(currentState: any): boolean {
    // XP-based games typically don't have level failure
    return false;
  }

  getNextLevel(currentLevel: number): number | null {
    return currentLevel + 1;
  }
}

// ============================================
// WAVE-BASED PROGRESSION STRATEGY
// ============================================

export class WaveBasedProgressionStrategy implements LevelProgressionStrategy {
  constructor(
    private getCurrentWave: () => number,
    private getPlayerHealth: () => number
  ) {}

  shouldLevelUp(currentState: any): boolean {
    const wave = this.getCurrentWave();
    const targetWave = currentState.targetWave || 0;
    return wave >= targetWave;
  }

  shouldLevelFail(currentState: any): boolean {
    const health = this.getPlayerHealth();
    return health <= 0;
  }

  getNextLevel(currentLevel: number): number | null {
    return currentLevel + 1;
  }
}
