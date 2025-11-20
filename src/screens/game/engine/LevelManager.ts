import { LevelConfig } from "./types";

export class LevelManager {
  stage = 1;
  score = 0;
  config: LevelConfig;

  constructor(config: LevelConfig) {
    this.config = config;
  }

  addScore(n: number) {
    this.score += n;
  }

  shouldAdvance() {
    return this.score >= this.config[this.stage].target;
  }

  advance() {
    this.stage++;
    this.score = 0;
    return this.stage;
  }

  getCurrent() {
    return this.config[this.stage];
  }
}
