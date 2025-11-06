import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const GameBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base gradient: subtle violet top → rich black bottom */}
      <LinearGradient
        colors={["#2a0040", "#120020", "#05000d"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft radial-like overlay: adds glow in the upper center */}
      <LinearGradient
        colors={[
          "rgba(100, 0, 140, 0.35)",
          "rgba(50, 0, 70, 0.1)",
          "rgba(10, 0, 20, 0)",
        ]}
        start={{ x: 0.5, y: 0.15 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export default GameBackground;
