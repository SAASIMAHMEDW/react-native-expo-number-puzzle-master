// GameGrid.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const CELL_NUMBER_COLORS = [
  "#FF6F61",
  "#FFB400",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF4B91",
  "#FFD93D",
  "#00C2A8",
  "#FF8B13",
  "#FF69B4",
];

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
}

const GameGrid: React.FC<Props> = ({ rowsData, cols }) => {
  const rows = rowsData.length;
  // use the same sizing logic you had
  const maxGridWidth = screenWidth * 0.92;
  const maxGridHeight = screenHeight * 0.8;
  const cellWidth = maxGridWidth / cols;
  const cellHeight = maxGridHeight / Math.max(1, rows - 1); // -1 if last is fade row
  const cellSize = Math.min(Math.max(Math.min(cellWidth, cellHeight), 40), 70);
  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;

  const fontSize = cellSize * 0.45;

  return (
    <View style={[styles.gridContainer, { width: "100%", height: "100%" }]}>
      {/* border and lines (kept as earlier, trimmed for brevity) */}
      <View style={StyleSheet.absoluteFill}>
        {/* left/right/top borders */}
        <LinearGradient
          colors={[
            "rgba(150,80,255,0)",
            "rgba(150,80,255,0.6)",
            "rgba(150,80,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.borderLine, { top: 0, height: 1, width: gridWidth }]}
        />
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

      {/* cells */}
      <View style={styles.cellsOverlay}>
        {rowsData.map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={[styles.row, { height: cellSize }]}>
            {row.map((cell) => (
              <View key={cell.id} style={{ width: cellSize, height: cellSize }}>
                <AnimatedCell
                  value={cell.value}
                  fontSize={fontSize}
                  color={
                    cell.value != null
                      ? CELL_NUMBER_COLORS[
                          (cell.value - 1 + CELL_NUMBER_COLORS.length) %
                            CELL_NUMBER_COLORS.length
                        ]
                      : undefined
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

/* AnimatedCell: animates when value changes from null -> number */
const AnimatedCell: React.FC<{
  value: number | null;
  fontSize: number;
  color?: string;
}> = ({ value, fontSize, color }) => {
  const scale = useSharedValue(value != null ? 1 : 0.6);
  const opacity = useSharedValue(value != null ? 1 : 0);

  // detect changes via effect (value will be new on mount and updates)
  useEffect(() => {
    if (value != null) {
      // pop animation
      opacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // empty cell, hide
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(0.6, { duration: 120 });
    }
  }, [value]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cell, aStyle]}>
      {value != null ? (
        <Text
          style={[
            styles.text,
            {
              color: color || "#fff",
              fontSize,
              textShadowColor: color || "#fff",
              textShadowRadius: 0,
            },
          ]}
        >
          {value}
        </Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    position: "relative",
    alignSelf: "center",
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  borderLine: { position: "absolute" },
  line: { position: "absolute" },
  cellsOverlay: { flex: 1, zIndex: 2 },
  row: { flexDirection: "row" },
  cell: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontWeight: "800" },
});
