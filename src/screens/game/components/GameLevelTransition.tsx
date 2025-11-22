import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LevelConfig } from "../engine";
import { useFonts } from "expo-font";

const { width, height } = Dimensions.get("window");

interface GameLevelTransitionProps {
  visible: boolean;
  level: LevelConfig;
  onStartLevel: () => void;
  isVictory?: boolean;
}

const GameLevelTransition: React.FC<GameLevelTransitionProps> = ({
  visible,
  level,
  onStartLevel,
  isVictory = false,
}) => {
  const [fontsLoaded] = useFonts({
    "MomoTrustDisplay-Regular": require("@assets/fonts/MomoTrustDisplay-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  const getDifficultyColor = (): [string, string] => {
    switch (level.difficulty) {
      case "easy":
        return ["#5CFF5C", "#1BAE1B"];
      case "medium":
        return ["#FFD93D", "#FF8B13"];
      case "hard":
        return ["#FF6F61", "#C70039"];
      default:
        return ["#4D96FF", "#0090FF"];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={["#1a1a2e", "#16213e"]}
            style={styles.cardGradient}
          >
            {/* Level Badge */}
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={getDifficultyColor()}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>LEVEL {level.id}</Text>
                {isVictory && <Text style={styles.badgeText}>VICTORY</Text>}
              </LinearGradient>
            </View>

            {/* Level Name */}
            <Text style={styles.levelName}>{level.name}</Text>

            {/* Difficulty Indicator */}
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyLabel}>Difficulty:</Text>
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      level.difficulty === "easy"
                        ? "#5CFF5C"
                        : level.difficulty === "medium"
                        ? "#FFD93D"
                        : "#FF6F61",
                  },
                ]}
              >
                {level.difficulty.toUpperCase()}
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{level.description}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Target Score</Text>
                <Text style={styles.statValue}>{level.targetScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{level.initialTimer}s</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Add Rows</Text>
                <Text style={styles.statValue}>{level.addRowCount}</Text>
              </View>
            </View>

            {/* Start Button */}
            <Pressable
              onPress={onStartLevel}
              style={({ pressed }) => [
                styles.buttonWrapper,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={getDifficultyColor()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {isVictory ? "CONTINUE" : "START LEVEL"}
                </Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default GameLevelTransition;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  cardGradient: {
    padding: 30,
    alignItems: "center",
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131313",
    fontFamily: "MomoTrustDisplay-Regular",
    letterSpacing: 1,
  },
  levelName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "MomoTrustDisplay-Regular",
    marginBottom: 12,
    textAlign: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  difficultyLabel: {
    fontSize: 14,
    color: "#999",
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: "#CCC",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "MomoTrustDisplay-Regular",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#131313",
    fontSize: 20,
    fontFamily: "MomoTrustDisplay-Regular",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
