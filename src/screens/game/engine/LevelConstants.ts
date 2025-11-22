import { LevelConfig } from "./types";

// ============================================
// LEVEL CONFIGURATIONS
// ============================================

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    id: 1,
    name: "Easy Breeze",
    difficulty: "easy",
    initialRows: 11,
    initialCols: 9,
    initialFilledRows: 3,
    targetScore: 10,
    initialTimer: 60 * 1,
    timerBoostPerScore: 2,
    maxTimerBoosts: 10,
    addRowCount: 1,
    description: `Welcome! Match numbers to score ${10} points. You have ${
      60 * 1
    } seconds!`,
  },
  2: {
    id: 2,
    name: "Medium Challenge",
    difficulty: "medium",
    initialRows: 11,
    initialCols: 9,
    initialFilledRows: 4,
    targetScore: 15,
    initialTimer: 60 * 2,
    timerBoostPerScore: 2,
    maxTimerBoosts: 15,
    addRowCount: 2, // 2 add row uses
    description: `Good job! Now reach ${15} points. You have ${
      60 * 2
    } seconds!`,
  },
  3: {
    id: 3,
    name: "Hard Core",
    difficulty: "hard",
    initialRows: 11,
    initialCols: 9,
    initialFilledRows: 5,
    targetScore: 20,
    initialTimer: 60 * 3,
    timerBoostPerScore: 0, // No timer boosts in hard mode
    maxTimerBoosts: 0,
    addRowCount: 3, // 3 add row uses
    description: `Final challenge! Score ${20} points with no timer boosts. Good luck!`,
  },
};

export const LEVEL_SEQUENCE = [1, 2, 3];

export const MAX_LEVELS = LEVEL_SEQUENCE.length;
