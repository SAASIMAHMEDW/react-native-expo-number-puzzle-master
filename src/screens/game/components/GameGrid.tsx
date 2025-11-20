import React from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import GameCell from "./GameCell";
import { Cell } from "@screens/game/engine";
import { GRID } from "../constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Props {
  grid?: Cell[][];
  cols?: number; // optional override
  selectedCells?: Cell[];
  shakingCells?: string[];
  disabled?: boolean;
  onCellPress: (cell: Cell) => void;
}

const GRID_FALLBACK_COLS = 9;

const GameGrid: React.FC<Props> = ({
  grid = [],
  cols: overrideCols,
  selectedCells = [],
  shakingCells = [],
  disabled,
  onCellPress,
}) => {
  const rowsCount = grid.length;
  const inferredCols = grid[0]?.length || 0;
  const cols = overrideCols ?? inferredCols;
  const availableWidth = screenWidth * 0.94;

  // guard
  const safeCols = cols > 0 ? cols : GRID.INITIAL_COLS ?? 9;
  const cellSize = availableWidth / safeCols;

  return (
    <View style={[styles.gridContainer, { width: cellSize * safeCols }]}>
      {Array.from({ length: rowsCount }).map((_, rIdx) => {
        const row =
          grid[rIdx] ??
          Array.from({ length: safeCols }).map((c, ci) => ({
            id: `${rIdx}-${ci}-empty`,
            row: rIdx,
            col: ci,
            value: null,
            faded: false,
          }));
        return (
          <View key={`row-${rIdx}`} style={[styles.row, { height: cellSize }]}>
            {Array.from({ length: safeCols }).map((_, cIdx) => {
              const cell = row[cIdx] ?? {
                id: `${rIdx}-${cIdx}-empty`,
                row: rIdx,
                col: cIdx,
                value: null,
                faded: false,
              };
              const isSelected = selectedCells.some(
                (s) => s.row === cell.row && s.col === cell.col
              );
              const isShaking = shakingCells.includes(
                `${cell.row}-${cell.col}`
              );

              return (
                <Pressable
                  key={cell.id}
                  disabled={disabled}
                  onPress={() => onCellPress(cell)}
                  style={{ width: cellSize, height: cellSize }}
                >
                  <GameCell
                    value={cell.value as number}
                    row={cell.row}
                    col={cell.col}
                    isSelected={isSelected}
                    isFaded={cell.faded}
                    isShaking={isShaking}
                    fontSize={cellSize * 0.55}
                    onPress={() => onCellPress(cell)}
                  />
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export default GameGrid;

const styles = StyleSheet.create({
  gridContainer: {
    alignSelf: "center",
    borderColor: "#00ffffff",
    borderWidth: 2,
  },
  row: {
    flexDirection: "row",
  },
});
