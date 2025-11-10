import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

const { height, width } = Dimensions.get("window");

interface GameCardProps {
  stage: number;
  score: number;
  timer: string;
  target: number;
}

const labelFontSize = width * 0.035;
const valueFontSize = width * 0.05;
const scoreFontSize = width * 0.09;

const GameCard: React.FC<GameCardProps> = ({ stage, score, timer, target }) => {
  const [fontsLoaded, fontError] = useFonts({
    "MomoTrustDisplay-Regular": require("@assets/fonts/MomoTrustDisplay-Regular.ttf"),
  });
  if (!fontsLoaded || fontError) return null;

  const [minutes, seconds] = timer?.split(":").map(Number) || [0, 0];
  const timerTextColor = seconds <= 10 ? "#ff0909ba" : "#fff";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: Stage */}
        <View style={styles.sideContainer}>
          <Text style={styles.label}>Stage</Text>
          <Text style={styles.value}>{stage}</Text>
        </View>

        {/* Center: Target + Score */}
        <View style={styles.centerContainer}>
          <Text style={styles.targetLabel}>
            Target: <Text style={styles.targetValue}>{target}</Text>
          </Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        {/* Right: Timer */}
        <View style={styles.sideContainerRight}>
          <Text style={styles.label}>Timer</Text>
          <Text
            style={[
              styles.value,
              {
                color: timerTextColor,
              },
            ]}
          >
            {timer}
          </Text>
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
    width: width * 0.25,
    alignItems: "flex-start",
  },
  sideContainerRight: {
    width: width * 0.25,
    alignItems: "flex-end",
  },

  label: {
    color: "#fff",
    fontSize: labelFontSize,
    fontFamily: "Typographica-Regular",
  },
  value: {
    color: "#fff",
    fontSize: valueFontSize,
    fontWeight: "600",
    marginTop: 2,
  },

  centerContainer: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    bottom: 5,
    left: 0,
    right: 0,
  },
  targetLabel: {
    color: "#FFFFFFCC",
    fontSize: labelFontSize,
    // fontFamily: "Typographica-Regular",
    marginBottom: 2,
    position: "absolute",
    bottom: "90%",
    fontWeight: "500",
  },
  targetValue: {
    color: "#ffcf40",
    textShadowColor: "rgba(255, 210, 60, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontSize: valueFontSize,
    fontWeight: "600",
  },
  scoreText: {
    fontSize: scoreFontSize,
    fontFamily: "MomoTrustDisplay-Regular",
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
