import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface GameAddButtonProps {
  count?: number;
  onPress?: () => void;
}

const GameAddButton: React.FC<GameAddButtonProps> = ({
  count = 6,
  onPress,
}) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Plus symbol */}
      <View style={styles.plusWrapper}>
        {/* Horizontal bar */}
        <LinearGradient
          colors={["#59D3FF", "#0090FF"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.bar, styles.horizontal]}
        />
        {/* Vertical bar */}
        <LinearGradient
          colors={["#59D3FF", "#0090FF"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.bar, styles.vertical]}
        />
      </View>

      {/* Notification badge */}
      {typeof count === "number" && count > 0 && (
        <LinearGradient
          colors={["#FF4B4B", "#C80000"]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>{count}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
};

export default GameAddButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: height * 0.1,
    left: width * 0.1,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    zIndex: 100,
  },
  plusWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
  },
  bar: {
    position: "absolute",
    shadowColor: "#00bfff5f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  horizontal: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  vertical: {
    width: 20,
    height: 60,
    borderRadius: 10,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});
