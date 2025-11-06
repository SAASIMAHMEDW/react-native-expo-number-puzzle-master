import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GameCell from "./GameCell";
import { CELL_NUMBER_COLORS } from "../constants";
import { generateGrid } from "../utils";

const { width } = Dimensions.get("window");

interface GameGridProps {
  rows: number;
  cols: number;
}

const GameGrid: React.FC<GameGridProps> = ({ rows, cols }) => {
  const gridData = useMemo(() => generateGrid(rows, cols), [rows, cols]);

  const gridWidth = width * 0.9;
  const cellWidth = gridWidth / cols;
  const cellHeight = gridWidth / rows;

  return (
    <View
      style={[styles.gridContainer, { width: gridWidth, height: gridWidth }]}
    >
      {/* Draw grid lines with fading effect */}
      <View style={styles.gridLines}>
        {/* Vertical lines */}
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <LinearGradient
            key={`v-${i}`}
            colors={[
              "rgba(255,255,255,0.05)",
              "rgba(255,255,255,0.15)",
              "rgba(255,255,255,0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.line,
              {
                left: i * cellWidth,
                height: gridWidth,
                width: 1,
                opacity: fadeFactor(i, cols),
              },
            ]}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <LinearGradient
            key={`h-${i}`}
            colors={[
              "rgba(255,255,255,0.05)",
              "rgba(255,255,255,0.15)",
              "rgba(255,255,255,0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.line,
              {
                top: i * cellHeight,
                width: gridWidth,
                height: 1,
                opacity: fadeFactor(i, rows),
              },
            ]}
          />
        ))}
      </View>

      {/* Number Cells */}
      <View style={styles.cellsOverlay}>
        {gridData.map((row, rIdx) => (
          <View
            key={`row-${rIdx}`}
            style={[styles.row, { height: cellHeight }]}
          >
            {row.map((cell) => (
              <View
                key={cell.id}
                style={{ width: cellWidth, height: cellHeight }}
              >
                <GameCell
                  value={cell.value}
                  color={
                    CELL_NUMBER_COLORS[
                      (cell.value - 1 + CELL_NUMBER_COLORS.length) %
                        CELL_NUMBER_COLORS.length
                    ]
                  }
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

// ---------- Helpers ----------
const fadeFactor = (i: number, total: number) => {
  const dist = Math.abs(i - total / 2);
  const maxDist = total / 2;
  const fade = 1 - dist / maxDist;
  return fade * 0.8 + 0.2;
};

const styles = StyleSheet.create({
  gridContainer: {
    position: "relative",
    alignSelf: "center",
    marginTop: 20,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: "absolute",
  },
  cellsOverlay: {
    flex: 1,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
});
