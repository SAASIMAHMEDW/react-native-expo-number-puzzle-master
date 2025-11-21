import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

const { width, height } = Dimensions.get("window");

interface GameEndProps {
  message?: string;
  score: number;
  onPressRestart: () => void;
  onPressHome: () => void;
}

const GameEnd: React.FC<GameEndProps> = ({
  message,
  score,
  onPressRestart,
  onPressHome,
}) => {
  const [fontsLoaded] = useFonts({
    "MomoTrustDisplay-Regular": require("@assets/fonts/MomoTrustDisplay-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Modal visible={true} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#1a1a2e", "#16213e"]}
            style={styles.gradient}
          >
            {/* Title */}
            <Text style={styles.title}>Game Over!</Text>
            <Text style={styles.subtitle}>
              {message || "Your journey ends here..."}
            </Text>

            {/* Score Display */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Score:</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Restart Button */}
              <Pressable
                onPress={onPressRestart}
                style={({ pressed }) => [
                  styles.buttonWrapper,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <LinearGradient
                  colors={["#5CFF5C", "#1BAE1B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Restart</Text>
                </LinearGradient>
              </Pressable>

              {/* Home Button */}
              <Pressable
                onPress={onPressHome}
                style={({ pressed }) => [
                  styles.buttonWrapper,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <LinearGradient
                  colors={["#FFC44D", "#FF7A00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Home</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default GameEnd;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  gradient: {
    padding: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffcf40",
    fontFamily: "MomoTrustDisplay-Regular",
    marginBottom: 8,
    textShadowColor: "rgba(255, 207, 64, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCC",
    marginBottom: 30,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  scoreLabel: {
    fontSize: 18,
    color: "#999",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "MomoTrustDisplay-Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#131313",
    fontSize: 20,
    fontFamily: "MomoTrustDisplay-Regular",
    fontWeight: "800",
  },
});
