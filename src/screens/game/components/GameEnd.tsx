import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@shared/components";

const { width, height } = Dimensions.get("window");

type GameEndProps = {
  message?: string;
  score?: number;
  onPressRestart?: () => void;
  onPressHome?: () => void;
};

const GameEnd = ({
  message,
  score,
  onPressRestart,
  onPressHome,
}: GameEndProps) => {
  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#2a0040", "#120020", "#05000d"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>Game Over!</Text>
        <Text style={styles.subheading}>
          {message || "Your journey ends here..."}
        </Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score:</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Restart"
            scolor="#5CFF5C"
            ecolor="#1BAE1B"
            onPress={onPressRestart}
            style={styles.button}
          />
          <Button
            title="Home"
            scolor="#FFD85C"
            ecolor="#FF9E00"
            onPress={onPressHome}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

export default GameEnd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#05000d47",
  },
  card: {
    width: width * 0.85,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: "rgba(30, 0, 50, 0.71)",

    elevation: 10,
  },
  heading: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFD85C",
    textShadowColor: "rgba(255, 220, 100, 0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 18,
    color: "#ffffffcc",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    color: "#ffffffcc",
    marginRight: 10,
  },
  scoreValue: {
    fontSize: 24,
    color: "#ffffffcc",
  },
});
