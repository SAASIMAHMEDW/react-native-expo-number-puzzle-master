export class MatchEngine {
  isValidMatch(a: number | null, b: number | null): boolean {
    if (a === null || b === null) return false;
    return a === b || a + b === 10;
  }
}
