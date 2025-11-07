import { useFonts } from "expo-font";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GameCellProps {
  value: number;
  color: string;
}

const GameCell: React.FC<GameCellProps> = ({ value, color }) => {
  const [fontsLoaded, fontError] = useFonts({
    "TitanOne-Regular": require("@assets/fonts/TitanOne-Regular.ttf"),
  });
  if (!fontsLoaded || fontError) {
    return null;
  }
  return (
    <View style={styles.cell}>
      <Text style={[styles.text, { color, fontFamily: "TitanOne-Regular" }]}>
        {value}
      </Text>
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
    fontSize: 35,
    fontWeight: "800",
  },
});
