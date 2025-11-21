import React, { useEffect, memo } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { CELL_NUMBER_COLORS } from "../constants";

interface GameCellProps {
  value: number | null;
  color?: string;
  faded: boolean;
  selected: boolean;
  onPress: () => void;
  size: number;
  shouldShake?: boolean;
}

const GameCell: React.FC<GameCellProps> = ({
  value,
  color = "#00FFF0",
  faded,
  selected,
  onPress,
  size,
  shouldShake = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  // Selection animation - glow effect
  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.03, {
        damping: 10,
        stiffness: 150,
      });
      glowIntensity.value = withSpring(1);
    } else {
      scale.value = withSpring(1);
      glowIntensity.value = withSpring(0);
    }
  }, [selected]);

  // Smooth glow for selected cells
  useEffect(() => {
    borderOpacity.value = withTiming(selected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected]);

  // Number pop-in animation
  useEffect(() => {
    if (value != null && !faded) {
      opacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withSequence(
        withTiming(0.3, { duration: 0 }),
        withTiming(1.2, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.cubic) })
      );
    }
  }, [value, faded]);

  // Fade animation
  useEffect(() => {
    if (faded) {
      opacity.value = withTiming(0.1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 }); // no shrink
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [faded]);

  // Shake animation for invalid moves
  // useEffect(() => {
  //   if (shouldShake) {
  //     translateX.value = withSequence(
  //       withTiming(-6, { duration: 50 }),
  //       withRepeat(withTiming(6, { duration: 50 }), 5, true),
  //       withTiming(0, { duration: 50 })
  //     );

  //     bgOpacity.value = withSequence(
  //       withTiming(0.8, { duration: 100 }),
  //       withTiming(0, { duration: 500 })
  //     );
  //   }
  // }, [shouldShake]);

  useEffect(() => {
    if (shouldShake) {
      // Shake animation
      translateX.value = withSequence(
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 50 })
      );
      // ADD THIS: Red background flash
      bgOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
    }
  }, [shouldShake]);

  const animatedCellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const animatedShakeStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  // --- BORDER + GLOW STYLE ---
  const cellContainerStyle = useAnimatedStyle(() => {
    const borderColor = color;
    return {
      borderWidth: interpolate(borderOpacity.value, [0, 1], [0, 2]),
      borderColor: borderColor,
      borderRadius: 4,
      backgroundColor: selected ? `${borderColor}22` : "transparent",
      shadowColor: borderColor,
      shadowOpacity: interpolate(borderOpacity.value, [0, 1], [0, 0.5]),
      shadowRadius: interpolate(borderOpacity.value, [0, 1], [0, 8]),
      shadowOffset: { width: 0, height: 0 },
    };
  });

  // --- SHAKE (invalid) STYLE ---
  const shakingBgStyle = useAnimatedStyle(() => ({
    backgroundColor: shouldShake ? "rgba(255, 60, 60, 0.25)" : "transparent",
    borderColor: shouldShake ? "rgba(255, 60, 60, 0.8)" : "transparent",
    borderWidth: shouldShake ? 2 : 0,
    transform: [{ scale: shouldShake ? 1.05 : 1 }],
  }));

  // --- NUMBER ANIMATION STYLE ---
  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${translateX.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (value === null) {
    return <View style={[styles.emptyCell, { width: size, height: size }]} />;
  }

  return (
    <Animated.View
      style={[styles.cellWrapper, animatedCellStyle, cellContainerStyle]}
    >
      {/* Outer Glow for selected tile */}
      {selected && (
        <Animated.View
          style={[
            styles.glowOuter,
            {
              width: size + 8,
              height: size + 8,
              backgroundColor: `${color + "22"}`,
              shadowColor: color,
            },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Red flash for shake */}
      <Animated.View
        style={[
          styles.shakeBg,
          {
            width: size,
            height: size,
          },
          animatedShakeStyle,
          shakingBgStyle,
        ]}
      />

      <Pressable
        onPress={onPress}
        disabled={faded}
        style={({ pressed }) => [
          styles.cell,
          {
            width: size,
            height: size,
            // backgroundColor: color,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: size * 0.7,
              color: selected ? "#FFFFFF" : color, // ✅ White when selected, color when not
              textShadowColor: selected ? "rgba(0, 0, 0, 0.8)" : "transparent",
            },
            numberStyle,
          ]}
        >
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default GameCell;

const styles = StyleSheet.create({
  cellWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    overflow: "visible", // allow glow to extend outside cell
  },
  emptyCell: {
    backgroundColor: "transparent",
  },
  glowOuter: {
    position: "absolute",
    borderRadius: 10,
    opacity: 0.6,
    shadowOpacity: 1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  numberContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  cell: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.4,
    // shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontWeight: "900",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  shakeBg: {
    position: "absolute",
    backgroundColor: "#ff000075",
    borderRadius: 8,
    zIndex: -1,
  },
});
