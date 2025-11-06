import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

interface GameCardProps {
  stage: number;
  score: number;
  timer: string; // e.g. "01:23"
}

const GameCard: React.FC<GameCardProps> = ({ stage, score, timer }) => {
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.row}>
        {/* Left: Stage */}
        <View style={styles.sideContainer}>
          <Text style={styles.label}>Stage</Text>
          <Text style={styles.value}>{stage}</Text>
        </View>

        {/* Center: Glowing Score */}
        <View style={styles.centerContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        {/* Right: Timer */}
        <View style={styles.sideContainerRight}>
          <Text style={styles.label}>Timer</Text>
          <Text style={styles.value}>{timer}</Text>
        </View>
      </View>

      {/* Bottom glowing border */}
      <LinearGradient
        colors={[
          "rgba(150, 80, 255, 0)",
          "rgba(150, 80, 255, 0.6)",
          "rgba(150, 80, 255, 0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomBorder}
      />
    </View>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: height * 0.15,
    justifyContent: "flex-end",
    paddingTop: 40,
    zIndex: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
  },
  sideContainer: {
    alignItems: "flex-start",
  },
  sideContainerRight: {
    alignItems: "flex-end",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#ffcf40",
    textShadowColor: "rgba(255, 210, 60, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  bottomBorder: {
    height: 2,
    width: "100%",
  },
});
