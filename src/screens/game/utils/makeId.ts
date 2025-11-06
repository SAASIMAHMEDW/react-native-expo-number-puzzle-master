const makeId = (r: number, c: number) =>
  `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;

export default makeId;
