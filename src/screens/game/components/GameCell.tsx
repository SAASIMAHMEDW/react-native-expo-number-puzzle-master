import React, { useEffect } from "react";
import { Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface GameCellProps {
  value: number;
  row: number;
  col: number;
  fontSize?: number;
  isSelected: boolean;
  isFaded: boolean;
  isInvalid?: boolean;
  onPress: (row: number, col: number, value: number) => void;
}
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

const GameCell: React.FC<GameCellProps> = ({
  value,
  fontSize = 36,
  onPress,
  row,
  col,
  isSelected,
  isFaded,
  isInvalid,
}) => {
  const scale = useSharedValue(value != null ? 1 : 0.6);
  const opacity = useSharedValue(value != null ? 1 : 0);

  useEffect(() => {
    if (value != null) {
      // Animate in (pop effect)
      opacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Animate out (shrink + fade)
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(0.6, { duration: 120 });
    }
  }, [value]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const color =
    value != null
      ? CELL_NUMBER_COLORS[value % CELL_NUMBER_COLORS.length]
      : "#fff";

  return (
    <TouchableWithoutFeedback onPress={() => onPress(row, col, value)}>
      <Animated.View style={[styles.cell, aStyle]}>
        {value != null && (
          <Text style={[styles.text, { color, fontSize }]}>{value}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default GameCell;

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "800",
  },
});
