import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from "react-native";

interface GameCellProps {
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
  isFaded: boolean;
  isInvalid?: boolean;
  onPress: (row: number, col: number, value: number) => void;
}

const COLORS = [
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

const XGameCell = ({
  value,
  row,
  col,
  isSelected,
  isFaded,
  isInvalid,
  onPress,
}: GameCellProps) => {
  const color = COLORS[value % COLORS.length];
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.18 : 1,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: isFaded ? 0.2 : 1,
      duration: isFaded ? 320 : 200,
      useNativeDriver: true,
    }).start();
  }, [isFaded]);

  useEffect(() => {
    if (isInvalid) {
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 8,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -8,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isInvalid]);

  return (
    <TouchableWithoutFeedback
      onPress={() => !isFaded && onPress(row, col, value)}
    >
      <Animated.View
        style={[
          styles.cell,
          {
            transform: [{ scale }, { translateX: shake }],
            opacity: fade,
            borderColor: isSelected ? "#FFD93D" : "#2E2E4D",
          },
        ]}
      >
        <Text style={[styles.text, { color }]}>{value}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default GameCell;

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 10,
    borderWidth: 2,
  },
  text: { fontSize: 22, fontWeight: "bold" },
});
