import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import GameCell from "./GameCell";
import { CellData } from "../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Props {
  rowsData: CellData[][];
  cols: number;
  disabled?: boolean;
  onScore?: (delta: number) => void;
  onGridUpdate?: (rows: CellData[][]) => void;
}

const GameGrid: React.FC<Props> = ({
  rowsData,
  cols,
  disabled,
  onScore,
  onGridUpdate,
}) => {
  const [localGrid, setLocalGrid] = useState<CellData[][]>(rowsData);
  const [selected, setSelected] = useState<CellData[]>([]);
  const [shakingCells, setShakingCells] = useState<string[]>([]);

  // Update local grid when parent updates
  useEffect(() => {
    setLocalGrid(rowsData);
  }, [rowsData]);

  const rows = localGrid.length;
  const availableWidth = screenWidth * 0.94;
  const cellSize = availableWidth / cols;
  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;
  const fontSize = cellSize * 0.55;

  // Check if cells are connected without active cells in between
  const checkPath = useCallback(
    (
      cell1: CellData,
      cell2: CellData
    ): { valid: boolean; betweenCells: string[] } => {
      const inBetween: string[] = [];

      // Horizontal
      if (cell1.row === cell2.row) {
        const minCol = Math.min(cell1.col, cell2.col);
        const maxCol = Math.max(cell1.col, cell2.col);
        for (let c = minCol + 1; c < maxCol; c++) {
          const cell = localGrid[cell1.row][c];
          if (!cell.faded) {
            inBetween.push(`${cell.row}-${cell.col}`);
          }
        }
        return { valid: inBetween.length === 0, betweenCells: inBetween };
      }

      // Vertical
      if (cell1.col === cell2.col) {
        const minRow = Math.min(cell1.row, cell2.row);
        const maxRow = Math.max(cell1.row, cell2.row);
        for (let r = minRow + 1; r < maxRow; r++) {
          const cell = localGrid[r][cell1.col];
          if (!cell.faded) {
            inBetween.push(`${cell.row}-${cell.col}`);
          }
        }
        return { valid: inBetween.length === 0, betweenCells: inBetween };
      }

      // Diagonal
      const rowDiff = cell2.row - cell1.row;
      const colDiff = cell2.col - cell1.col;
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        const steps = Math.abs(rowDiff);
        const rowStep = rowDiff / steps;
        const colStep = colDiff / steps;
        for (let i = 1; i < steps; i++) {
          const r = cell1.row + rowStep * i;
          const c = cell1.col + colStep * i;
          const cell = localGrid[r][c];
          if (!cell.faded) {
            inBetween.push(`${cell.row}-${cell.col}`);
          }
        }
        return { valid: inBetween.length === 0, betweenCells: inBetween };
      }

      // --- WRAP-AROUND CHECK (horizontal across rows) ---
      const totalCells = localGrid.length * cols;

      const cellIndex = (r: number, c: number) => r * cols + c;

      const idx1 = cellIndex(cell1.row, cell1.col);
      const idx2 = cellIndex(cell2.row, cell2.col);

      let betweenCells: string[] = [];

      // Always traverse in one direction (lowest → highest)
      const [start, end] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];

      // Collect cells between the two selections, wrapping if necessary
      for (let i = start + 1; i < end; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const cell = localGrid[r][c];
        if (!cell.faded && cell.value !== null) {
          betweenCells.push(`${cell.row}-${cell.col}`);
        }
      }

      // --- handle wrap-around (end of grid → start of grid) ---
      if (betweenCells.length > 0) {
        // if there are blocking cells, it's not valid — but we’ll still check wrap path
        const wrappedCells: string[] = [];
        for (let i = end + 1; i < totalCells + start; i++) {
          const r = Math.floor((i % totalCells) / cols);
          const c = i % cols;
          const cell = localGrid[r][c];
          if (!cell.faded && cell.value !== null) {
            wrappedCells.push(`${cell.row}-${cell.col}`);
          }
        }

        // if wrap path clear and we have faded cells only → valid
        if (wrappedCells.length === 0) {
          return { valid: true, betweenCells: [] };
        }
      }

      // no obstacles in direct path
      if (betweenCells.length === 0) {
        return { valid: true, betweenCells: [] };
      }

      return { valid: false, betweenCells: [] };
    },
    [localGrid, cols]
  );

  const handleRowCompletion = useCallback(() => {
    setLocalGrid((prev) => {
      const newGrid = [...prev];
      let modified = false;

      // Find rows that are completely faded
      const fadedRows: number[] = [];
      newGrid.forEach((row, idx) => {
        if (row.every((cell) => cell.value !== null && cell.faded)) {
          fadedRows.push(idx);
        }
      });

      if (fadedRows.length === 0) return prev;

      fadedRows.forEach((rowIdx) => {
        // Check if it's the last row with numbers
        const isLastRow =
          rowIdx === newGrid.length - 1 ||
          newGrid
            .slice(rowIdx + 1)
            .every((row) => row.every((c) => c.value === null));

        // if (isLastRow) {
        if (false) {
          // Regenerate numbers for this row
          newGrid[rowIdx] = newGrid[rowIdx].map((cell) => ({
            ...cell,
            value: Math.ceil(Math.random() * 9),
            faded: false,
          }));
          modified = true;
        } else {
          // Move all rows below upward
          for (let r = rowIdx; r < newGrid.length - 1; r++) {
            newGrid[r] = newGrid[r + 1].map((cell) => ({
              ...cell,
              row: r,
              id: `${r}-${cell.col}-${Math.random().toString(36).slice(2, 6)}`,
            }));
          }
          // Clear last row
          const lastIdx = newGrid.length - 1;
          newGrid[lastIdx] = newGrid[lastIdx].map((cell) => ({
            ...cell,
            value: null,
            faded: false,
          }));
          modified = true;
        }
      });

      if (modified && onGridUpdate) {
        // onGridUpdate(newGrid);
        setTimeout(() => onGridUpdate(newGrid), 0);
      }

      return modified ? newGrid : prev;
    });
  }, [onGridUpdate]);

  useEffect(() => {
    if (onGridUpdate) {
      onGridUpdate(localGrid);
    }
  }, [localGrid]);

  const handleSelect = useCallback(
    (row: number, col: number, value: number | null) => {
      if (disabled || value === null) return;

      const cell = localGrid[row][col];
      if (cell.faded) return;

      // First selection
      if (selected.length === 0) {
        setSelected([cell]);
        return;
      }

      // Clicking same cell - deselect
      if (selected[0].row === row && selected[0].col === col) {
        setSelected([]);
        return;
      }

      // Second selection - let it select first, then validate
      const firstCell = selected[0];
      const secondCell = cell;

      // Add second to selection temporarily
      setSelected([firstCell, secondCell]);

      // Small delay to show selection before validation
      setTimeout(() => {
        const sameNumber = firstCell.value === secondCell.value;
        const sumIsTen =
          firstCell.value !== null &&
          secondCell.value !== null &&
          firstCell.value + secondCell.value === 10;
        const { valid: pathValid, betweenCells } = checkPath(
          firstCell,
          secondCell
        );

        if ((sameNumber || sumIsTen) && pathValid) {
          // VALID MOVE
          setLocalGrid((prev) => {
            const newGrid = prev.map((r) =>
              r.map((c) => {
                if (
                  (c.row === firstCell.row && c.col === firstCell.col) ||
                  (c.row === secondCell.row && c.col === secondCell.col)
                ) {
                  return { ...c, faded: true };
                }
                return c;
              })
            );
            if (onGridUpdate) {
              // onGridUpdate(newGrid);
              setTimeout(() => onGridUpdate(newGrid), 0);
            }
            return newGrid;
          });

          if (onScore) {
            onScore(1);
          }

          setSelected([]);

          // Check for row completion after a short delay
          setTimeout(handleRowCompletion, 300);
        } else {
          // INVALID MOVE
          // Shake in-between cells
          if (betweenCells.length > 0) {
            setShakingCells(betweenCells);
            setTimeout(() => setShakingCells([]), 500);
          }

          // Deselect first, make second the new first
          // setSelected([secondCell]);
          setSelected([]);
        }
      }, 100); // Small delay to show second selection
    },
    [
      disabled,
      localGrid,
      selected,
      checkPath,
      onScore,
      onGridUpdate,
      handleRowCompletion,
    ]
  );

  return (
    <View
      style={[styles.gridContainer, { width: gridWidth, height: gridHeight }]}
    >
      {/* Border lines */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            "rgba(150,80,255,0)",
            "rgba(150,80,255,0.6)",
            "rgba(150,80,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.borderLine, { left: 0, width: 1, height: gridHeight }]}
        />
        <LinearGradient
          colors={[
            "rgba(150,80,255,0)",
            "rgba(150,80,255,0.6)",
            "rgba(150,80,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.borderLine,
            { right: 0, width: 1, height: gridHeight },
          ]}
        />
      </View>

      {/* Internal grid lines */}
      <View style={StyleSheet.absoluteFill}>
        {/* Vertical lines */}
        {Array.from({ length: cols }).map((_, i) => (
          <LinearGradient
            key={`v-${i}`}
            colors={[
              "rgba(150,80,255,0)",
              "rgba(150,80,255,0.4)",
              "rgba(150,80,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.line,
              { left: i * cellSize, height: gridHeight, width: 1 },
            ]}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <LinearGradient
            key={`h-${i}`}
            colors={[
              "rgba(150,80,255,0)",
              "rgba(150,80,255,0.4)",
              "rgba(150,80,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.line,
              { top: i * cellSize, width: gridWidth, height: 1 },
            ]}
          />
        ))}
      </View>

      {/* Cells */}
      <View style={styles.cellsOverlay}>
        {localGrid.map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={[styles.row, { height: cellSize }]}>
            {row.map((cell) => {
              const isSelected = selected.some(
                (s) => s.row === cell.row && s.col === cell.col
              );
              const isShaking = shakingCells.includes(
                `${cell.row}-${cell.col}`
              );

              return (
                <View
                  key={cell.id}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <GameCell
                    value={cell.value as number}
                    fontSize={fontSize}
                    row={cell.row}
                    col={cell.col}
                    isSelected={isSelected}
                    isFaded={cell.faded}
                    isShaking={isShaking}
                    onPress={handleSelect}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default GameGrid;

const styles = StyleSheet.create({
  gridContainer: {
    overflow: "visible",
    alignSelf: "center",
  },
  borderLine: { position: "absolute" },
  line: { position: "absolute" },
  cellsOverlay: { flex: 1, zIndex: 2 },
  row: {
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
