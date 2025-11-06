import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GameCellProps {
  value: number;
  color: string;
}

const GameCell: React.FC<GameCellProps> = ({ value, color }) => {
  return (
    <View style={styles.cell}>
      <Text style={[styles.text, { color }]}>{value}</Text>
    </View>
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
    fontSize: 28,
    fontWeight: "800",
  },
});
