export interface Cell {
  id: string;
  row: number;
  col: number;
  value: number | null;
  faded: boolean;
}

export interface GridConfig {
  rows: number;
  cols: number;
  initialFilled: number;
}

export interface LevelConfig {
  [stage: number]: {
    target: number;
    timeLimit: number;
    bonusTime: number;
    allowBonus: boolean;
  };
}

export type SelectResult =
  | { success: true; updatedGrid: Cell[][] }
  | { success: false; reason: string };
