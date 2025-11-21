import React, { memo, useId } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import GameCell from "./GameCell";
import { CellData } from "../engine";

const { width, height } = Dimensions.get("window");

interface GameGridProps {
  grid: CellData[][];
  onCellPress: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  invalidCells?: { row: number; col: number }[];
}

const GameGrid: React.FC<GameGridProps> = ({
  grid,
  onCellPress,
  selectedCell,
  invalidCells = [],
}) => {
  const cols = grid[0]?.length || 9;
  const rows = grid.length;

  // // ✅ Calculate based on actual screen dimensions
  // const TOP_BAR_HEIGHT = height * 0.2;
  // const FOOTER_HEIGHT = 100;
  // const PADDING = 20;
  // ✅ FIXED CELL SIZE - doesn't change with number of rows
  const availableWidth = width * 0.94;
  const FIXED_CELL_SIZE = availableWidth / cols; // Only based on columns, not rows!
  // // Available space = total height - (top bar + footer + padding)
  // const availableHeight = height - TOP_BAR_HEIGHT - FOOTER_HEIGHT - PADDING;
  // const availableWidth = width * 0.94; // Account for horizontal padding

  // // Calculate cell size from both dimensions and use the smaller one
  // const cellSizeFromWidth = availableWidth / cols;
  // const cellSizeFromHeight = availableHeight / rows;
  // const cellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.gridWrapper,
          {
            borderWidth: 1.5,
            borderColor: "rgba(107, 76, 230, 0.3)",
          },
        ]}
      >
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isSelected =
                selectedCell?.row === cell.row &&
                selectedCell?.col === cell.col;

              const shouldShake = invalidCells.some(
                (ic) => ic.row === cell.row && ic.col === cell.col
              );

              return (
                <View
                  key={cell.id}
                  style={[
                    styles.cellContainer,
                    {
                      width: FIXED_CELL_SIZE,
                      // height: cellSize,
                      height: FIXED_CELL_SIZE,
                      borderRightWidth: colIndex < cols - 1 ? 0.5 : 0,
                      borderBottomWidth: rowIndex < rows - 1 ? 0.5 : 0,
                      borderColor: "rgba(107, 76, 230, 0.2)",
                    },
                  ]}
                >
                  <GameCell
                    value={cell.value}
                    color={cell.color}
                    faded={cell.faded}
                    selected={isSelected}
                    onPress={() => onCellPress(cell.row, cell.col)}
                    size={FIXED_CELL_SIZE - 6}
                    shouldShake={shouldShake}
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
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    // flex: 1,
  },
  gridWrapper: {
    backgroundColor: "rgba(107, 76, 230, 0.05)",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
  },
  cellContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
