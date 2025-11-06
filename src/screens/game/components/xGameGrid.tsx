import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import GameCell from "./xGameCell";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GameGridProps {
  rows?: number;
  columns?: number;
  disabled?: boolean;
  onScore?: (delta: number) => void;
  onCleared?: () => void;
  onOutOfTime?: boolean;
}

interface CellData {
  id: string;
  row: number;
  col: number;
  value: number;
  faded: boolean;
}

const makeId = (r: number, c: number) =>
  `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;

const generateGrid = (rows: number, cols: number): CellData[][] =>
  Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: cols }).map((_, c) => ({
      id: makeId(r, c),
      row: r,
      col: c,
      value: Math.floor(Math.random() * 10),
      faded: false,
    }))
  );

const generateRow = (rowIndex: number, cols: number): CellData[] =>
  Array.from({ length: cols }).map((_, c) => ({
    id: makeId(rowIndex, c),
    row: rowIndex,
    col: c,
    value: Math.floor(Math.random() * 10),
    faded: false,
  }));

const XGameGrid = ({
  rows = 9,
  columns = 7,
  disabled = false,
  onScore,
  onCleared,
  onOutOfTime,
}: GameGridProps) => {
  const [grid, setGrid] = useState<CellData[][]>(() =>
    generateGrid(rows, columns)
  );
  const [selected, setSelected] = useState<CellData[]>([]);
  const [invalidShake, setInvalidShake] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);

  // fade-in anim for newly added last row
  const addedRowOpacity = useRef(new Animated.Value(1)).current;

  // ----------------------------
  // Selection
  // ----------------------------
  const handleSelect = (row: number, col: number) => {
    if (disabled || onOutOfTime) return;
    const cell = grid[row][col];
    if (cell.faded) return;

    // deselect same
    if (
      selected.length === 1 &&
      selected[0].row === row &&
      selected[0].col === col
    ) {
      setSelected([]);
      return;
    }

    if (selected.length === 0) {
      setSelected([cell]);
      return;
    }

    const first = selected[0];
    const second = cell;

    // wrapped-aligned check (horizontal/vertical/diagonal with column wrap)
    const aligned = isAlignedWrapped(first, second, grid[0].length);
    if (!aligned) {
      shake(second);
      return;
    }

    const match =
      first.value === second.value || first.value + second.value === 10;

    // check between (no active cells), with wrap support
    const blocked = hasActiveBetweenWrapped(first, second, grid);

    if (match && !blocked) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setGrid((prev) =>
        prev.map((r) =>
          r.map((c) =>
            (c.row === first.row && c.col === first.col) ||
            (c.row === second.row && c.col === second.col)
              ? { ...c, faded: true }
              : c
          )
        )
      );
      setSelected([]);
      onScore?.(1);
    } else {
      shake(second);
    }
  };

  const shake = (cell: CellData) => {
    setInvalidShake(`${cell.row}-${cell.col}`);
    setTimeout(() => setInvalidShake(null), 300);
    setSelected([]);
  };

  // ----------------------------
  // Recompute moves, remove rows/cols
  // ----------------------------
  useEffect(() => {
    const active = grid.flat().filter((c) => !c.faded);
    if (active.length === 0) {
      onCleared?.();
      return;
    }

    const pairs = findAllPairsWrapped(grid);
    setShowAddRow(pairs.length === 0 && active.length > 0);

    // Remove fully faded rows
    const fadedRows: number[] = [];
    grid.forEach((r, i) => r.every((c) => c.faded) && fadedRows.push(i));
    // Remove fully faded cols
    const fadedCols: number[] = [];
    const colCount = grid[0]?.length ?? 0;
    for (let c = 0; c < colCount; c++) {
      let all = true;
      for (let r = 0; r < grid.length; r++) {
        if (!grid[r][c]?.faded) {
          all = false;
          break;
        }
      }
      if (all) fadedCols.push(c);
    }

    if (fadedRows.length || fadedCols.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setGrid((prev) => {
        // remove rows
        let next = prev.filter((_, i) => !fadedRows.includes(i));
        // remove columns
        if (fadedCols.length) {
          next = next.map((row) =>
            row.filter((_, c) => !fadedCols.includes(c))
          );
        }
        // reindex rows/cols
        next = next.map((r, ri) =>
          r.map((cell, ci) => ({ ...cell, row: ri, col: ci }))
        );
        return next;
      });
    }
  }, [grid, onCleared]);

  // ----------------------------
  // Add Row (animated)
  // ----------------------------
  const handleAddRow = () => {
    const newRowIndex = grid.length;
    const newRow = generateRow(newRowIndex, grid[0].length);

    addedRowOpacity.setValue(0);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGrid((prev) => [...prev, newRow]);
    Animated.timing(addedRowOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAddRow(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => {
          const isLast = rowIndex === grid.length - 1;
          return (
            <Animated.View
              key={`row-${rowIndex}`}
              style={[styles.row, isLast && { opacity: addedRowOpacity }]}
            >
              {row.map((cell) => (
                <GameCell
                  key={cell.id}
                  value={cell.value}
                  row={cell.row}
                  col={cell.col}
                  isSelected={selected.some(
                    (s) => s.row === cell.row && s.col === cell.col
                  )}
                  isFaded={cell.faded}
                  isInvalid={invalidShake === `${cell.row}-${cell.col}`}
                  onPress={handleSelect}
                />
              ))}
            </Animated.View>
          );
        })}
      </View>

      {showAddRow && !disabled && !onOutOfTime && (
        <TouchableOpacity onPress={handleAddRow} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Row</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GameGrid;

/* ------------------------- Wrapped geometry helpers ------------------------ */

function isAlignedWrapped(a: CellData, b: CellData, cols: number): boolean {
  if (a.row === b.row) return true; // horizontal (wrap allowed)
  if (a.col === b.col) return true; // vertical
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  const dcWrap = Math.min(dc, cols - dc); // wrapped column distance
  return dr === dcWrap; // diagonal with wrap
}

function hasActiveBetweenWrapped(
  a: CellData,
  b: CellData,
  grid: CellData[][]
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  // Horizontal (same row) → check straight or wrapped shortest path
  if (a.row === b.row) {
    const path = getWrappedHorizontalBetween(a.col, b.col, cols);
    for (const c of path) if (!grid[a.row][c].faded) return true;
    return false;
  }

  // Vertical (same col, no wrap vertically)
  if (a.col === b.col) {
    const min = Math.min(a.row, b.row);
    const max = Math.max(a.row, b.row);
    for (let r = min + 1; r < max; r++) if (!grid[r][a.col].faded) return true;
    return false;
  }

  // Diagonal with column wrap (rows change by ±1 per step, columns wrap)
  const dr = b.row - a.row;
  const stepR = dr > 0 ? 1 : -1;
  const absDr = Math.abs(dr);

  // try forward (+1 col each step, wrapped) and backward (-1 col each step)
  const forwardSteps = (b.col - a.col + cols) % cols;
  const backwardSteps = (a.col - b.col + cols) % cols;

  let stepC: 1 | -1 | null = null;
  if (forwardSteps === absDr) stepC = 1;
  else if (backwardSteps === absDr) stepC = -1;

  if (stepC === null) return true; // not properly diagonal when considering wrap → treat as blocked

  let r = a.row + stepR;
  let c = (a.col + stepC + cols) % cols;
  for (let i = 1; i < absDr; i++) {
    if (!grid[r][c].faded) return true;
    r += stepR;
    c = (c + stepC + cols) % cols;
  }
  return false;
}

function getWrappedHorizontalBetween(
  aCol: number,
  bCol: number,
  cols: number
): number[] {
  const forward = (bCol - aCol + cols) % cols;
  const backward = (aCol - bCol + cols) % cols;

  const path: number[] = [];
  if (forward <= backward) {
    for (let i = 1; i < forward; i++) path.push((aCol + i) % cols);
  } else {
    for (let i = 1; i < backward; i++) path.push((aCol - i + cols) % cols);
  }
  return path;
}

function findAllPairsWrapped(grid: CellData[][]): [CellData, CellData][] {
  const pairs: [CellData, CellData][] = [];
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  for (let r1 = 0; r1 < rows; r1++) {
    for (let c1 = 0; c1 < cols; c1++) {
      const a = grid[r1][c1];
      if (!a || a.faded) continue;

      for (let r2 = r1; r2 < rows; r2++) {
        for (let c2 = 0; c2 < cols; c2++) {
          const b = grid[r2][c2];
          if (!b || b.faded || (a.row === b.row && a.col === b.col)) continue;

          if (!isAlignedWrapped(a, b, cols)) continue;
          const blocked = hasActiveBetweenWrapped(a, b, grid);
          const match = a.value === b.value || a.value + b.value === 10;

          if (match && !blocked) pairs.push([a, b]);
        }
      }
    }
  }
  return pairs;
}

/* ---------------------------------- styles --------------------------------- */

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  grid: { marginTop: 20, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  addButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFD93D",
  },
  addButtonText: { fontWeight: "bold", color: "#0F0F2D", fontSize: 16 },
});
