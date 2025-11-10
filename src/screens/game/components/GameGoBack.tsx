import React from "react";
import { Pressable, StyleSheet, Dimensions, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
} from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface GameGoBackProps {
  onPress?: () => void;
}

const SIZE = 32; // touch target box
const STROKE = 8; // chevron thickness
const GLOW_STROKE = 12; // slightly larger for soft glow 

const GameGoBack: React.FC<GameGoBackProps> = ({ onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [
        styles.container,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {/* Optional shadow wrapper to add subtle drop shadow */}
      <View style={styles.shadowWrap}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 42 42">
          <Defs>
            <SvgGradient id="chev" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFD93D" />
              <Stop offset="1" stopColor="#FF9900" />
            </SvgGradient>
          </Defs>

          {/* Glow layer behind (larger stroke, low opacity) */}
          <Path
            d="M 26 10 L 16 21 L 26 32"
            fill="none"
            stroke="#FFB200"
            strokeOpacity={0.35}
            strokeWidth={GLOW_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main chevron stroke with gradient */}
          <Path
            d="M 26 10 L 16 21 L 26 32"
            fill="none"
            stroke="url(#chev)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
};

export default GameGoBack;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: height * 0.012,
    left: width * 0.01,
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  shadowWrap: {
    elevation: 8,
  },
});
