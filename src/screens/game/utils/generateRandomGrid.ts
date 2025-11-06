const generateRandomGrid = (rows: number, cols: number) => {
  const temp: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.ceil(Math.random() * 9));
    }
    temp.push(row);
  }
  return temp;
};

export default generateRandomGrid;
