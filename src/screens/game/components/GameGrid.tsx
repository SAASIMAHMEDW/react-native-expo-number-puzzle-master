// GameGrid.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import GameCell from "./GameCell";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export interface CellData {
  id: string;
  row: number;
  col: number;
  value: number | null;
  faded: boolean;
}

interface Props {
  rowsData: CellData[][];
  cols: number;
  disabled?: boolean;
  onScore?: (delta: number) => void;
}

const GameGrid: React.FC<Props> = ({ rowsData, cols, disabled, onScore }) => {
  const rows = rowsData.length;

  const [selected, setSelected] = useState<CellData[]>([]);
  const [invalidShake, setInvalidShake] = useState<string | null>(null);
  // use the same sizing logic you had
  const availableWidth = screenWidth * 0.94;
  const maxGridWidth = screenWidth * 0.92;
  const maxGridHeight = screenHeight * 0.8;
  const cellWidth = maxGridWidth / cols;
  const cellHeight = maxGridHeight / Math.max(1, rows - 1); // -1 if last is fade row
  // const cellSize = Math.min(Math.max(Math.min(cellWidth, cellHeight), 40), 70);
  const cellSize = availableWidth / cols;
  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;

  // const fontSize = cellSize * 0.45;
  const fontSize = cellSize * 0.55;

  const handleSelect = (row: number, col: number, value: number | null) => {
    console.log("Selected cell at:", row, col, "with value:", value);
  };

  return (
    <View style={[styles.gridContainer, { width: "100%", height: "100%" }]}>
      {/* border and lines  */}
      <View style={StyleSheet.absoluteFill}>
        {/* left/right/borders */}
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

      {/* internal lines */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: cols + 1 }).map((_, i) => (
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
        {Array.from({ length: rows + 1 }).map((_, i) => {
          if (i === 0 || i === rows) {
            // skip fade row
            return null;
          }

          return (
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
          );
        })}
      </View>

      {/* cells */}
      <View style={styles.cellsOverlay}>
        {rowsData.map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={[styles.row, { height: cellSize }]}>
            {row.map((cell) => (
              <View key={cell.id} style={{ width: cellSize, height: cellSize }}>
                <GameCell
                  key={cell.id}
                  value={cell.value as number}
                  row={cell.row}
                  col={cell.col}
                  isSelected={selected.some(
                    (s) => s.row === cell.row && s.col === cell.col
                  )}
                  isFaded={cell.faded}
                  isInvalid={invalidShake === `${cell.row}-${cell.col}`}
                  onPress={handleSelect}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default GameGrid;

/* AnimatedCell: animates when value changes from null -> number */

const styles = StyleSheet.create({
  gridContainer: {
    borderBlockColor: "red",
    borderWidth: 3,
  },
  borderLine: { position: "absolute" },
  line: { position: "absolute" },
  cellsOverlay: { flex: 1, zIndex: 2 },
  row: { flexDirection: "row" },
  cell: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontWeight: "800", fontFamily: "MomoTrustDisplay-Regular" },
});
