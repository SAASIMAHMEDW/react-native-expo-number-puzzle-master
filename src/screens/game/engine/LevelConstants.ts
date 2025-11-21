import { LevelConfig } from "./types";

// // ============================================
// // LEVEL CONFIGURATIONS
// // ============================================

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    id: 1,
    name: "Easy Breeze",
    difficulty: "easy",
    initialRows: 11,
    initialCols: 9,
    initialFilledRows: 3,
    targetScore: 20,
    initialTimer: 60 * 3,
    timerBoostPerScore: 3,
    maxTimerBoosts: 10,
    addRowCount: 0, // No add row in easy mode
    description:
      "Welcome! Match numbers to score 50 points. You have 60 seconds!",
  },
  2: {
    id: 2,
    name: "Medium Challenge",
    difficulty: "medium",
    initialRows: 9,
    initialCols: 9,
    initialFilledRows: 4,
    targetScore: 100,
    initialTimer: 90,
    timerBoostPerScore: 2,
    maxTimerBoosts: 15,
    addRowCount: 2, // 2 add row uses
    description: "Good job! Now reach 100 points. Time boosts reduced!",
  },
  3: {
    id: 3,
    name: "Hard Core",
    difficulty: "hard",
    initialRows: 9,
    initialCols: 9,
    initialFilledRows: 5,
    targetScore: 200,
    initialTimer: 120,
    timerBoostPerScore: 0, // No timer boosts in hard mode
    maxTimerBoosts: 0,
    addRowCount: 3, // 3 add row uses
    description:
      "Final challenge! Score 200 points with no timer boosts. Good luck!",
  },
};

export const LEVEL_SEQUENCE = [1, 2, 3];

export const MAX_LEVELS = LEVEL_SEQUENCE.length;

// export const LEVEL_CONFIGS: LevelConfig[] = [
//   // ============== EASY LEVELS ==============
//   {
//     id: 1,
//     name: "Warm Up",
//     initialRows: 12,
//     initialCols: 9,

//     initialFilledRows: 3,
//     targetScore: 15,
//     initialTimer: 180, // 3 minutes
//     addRowCount: 6,
//     timerBoostPerScore: 5,
//     maxTimerBoosts: 10,
//   },
//   {
//     id: "level_2",
//     name: "Getting Started",
//     initialRows: 12,
//     initialCols: 9,
//     initialFilledRows: 4,
//     targetScore: 25,
//     initialTimer: 200,
//     addRowCount: 5,
//     timerBoostPerScore: 4,
//     maxTimerBoosts: 12,
//   },

//   // ============== MEDIUM LEVELS ==============
//   {
//     id: "level_3",
//     name: "Challenge Begins",
//     initialRows: 15,
//     initialCols: 9,
//     initialFilledRows: 5,
//     targetScore: 40,
//     initialTimer: 220,
//     addRowCount: 4,
//     timerBoostPerScore: 3,
//     maxTimerBoosts: 15,
//   },
//   {
//     id: "level_4",
//     name: "Mind Bender",
//     initialRows: 15,
//     initialCols: 9,
//     initialFilledRows: 6,
//     targetScore: 60,
//     initialTimer: 240,
//     addRowCount: 4,
//     timerBoostPerScore: 3,
//     maxTimerBoosts: 20,
//   },

//   // ============== HARD LEVELS ==============
//   {
//     id: "level_5",
//     name: "Expert Mode",
//     initialRows: 18,
//     initialCols: 9,
//     initialFilledRows: 7,
//     targetScore: 80,
//     initialTimer: 280,
//     addRowCount: 3,
//     timerBoostPerScore: 2,
//     maxTimerBoosts: 25,
//   },
//   {
//     id: "level_6",
//     name: "Master Challenge",
//     initialRows: 20,
//     initialCols: 9,
//     initialFilledRows: 8,
//     targetScore: 100,
//     initialTimer: 300,
//     addRowCount: 3,
//     timerBoostPerScore: 2,
//     maxTimerBoosts: 30,
//   },

//   // ============== INSANE LEVELS ==============
//   {
//     id: "level_7",
//     name: "Impossible",
//     initialRows: 25,
//     initialCols: 9,
//     initialFilledRows: 10,
//     targetScore: 150,
//     initialTimer: 350,
//     addRowCount: 2,
//     timerBoostPerScore: 1,
//     maxTimerBoosts: 40,
//   },
// ];

// export const LEVEL_SEQUENCE = [
//   "level_1",
//   "level_2",
//   "level_3",
//   "level_4",
//   "level_5",
//   "level_6",
//   "level_7",
// ];
