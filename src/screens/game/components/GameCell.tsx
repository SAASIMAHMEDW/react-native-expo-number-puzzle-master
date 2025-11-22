import React, { useEffect } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";

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
  const colorValue = useSharedValue(color);
  const selectedValue = useSharedValue(selected ? 1 : 0);
  const shouldShakeValue = useSharedValue(shouldShake ? 1 : 0);

  // Update shared values when props change
  useEffect(() => {
    selectedValue.value = selected ? 1 : 0;
  }, [selected]);

  useEffect(() => {
    colorValue.value = color;
  }, [color]);

  useEffect(() => {
    shouldShakeValue.value = shouldShake ? 1 : 0;
  }, [shouldShake]);

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
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
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
      opacity.value = withTiming(0.3, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [faded]);

  // Shake animation
  useEffect(() => {
    if (shouldShake) {
      translateX.value = withSequence(
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 50 })
      );
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

  const cellContainerStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(borderOpacity.value, [0, 1], [0, 2]),
      borderColor: color || "#00FFF0", 
      borderRadius: 4,
      backgroundColor: selectedValue.value > 0.5 ? `${color}22` : "transparent",
      shadowColor: color || "#00FFF0",
      shadowOpacity: interpolate(borderOpacity.value, [0, 1], [0, 0.5]),
      shadowRadius: interpolate(borderOpacity.value, [0, 1], [0, 8]),
      shadowOffset: { width: 0, height: 0 },
    };
  });

  // Use shared value instead of prop
  const shakingBgStyle = useAnimatedStyle(() => {
    const isShaking = shouldShakeValue.value > 0.5;
    return {
      backgroundColor: isShaking ? "rgba(255, 60, 60, 0.25)" : "transparent",
      borderColor: isShaking ? "rgba(255, 60, 60, 0.8)" : "transparent",
      borderWidth: isShaking ? 2 : 0,
      // opacity: isShaking ? 1 : 0,
      transform: [{ scale: isShaking ? 1.05 : 1 }],
    };
  });

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
              backgroundColor: `${color}22`,
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
        android_ripple={null}
        style={({ pressed }) => [
          styles.cell,
          {
            width: size,
            height: size,
            opacity: pressed ? 0.85 : 1,
            backgroundColor: "transparent",
            overflow: "hidden",
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.text,
            {
              fontSize: size * 0.7,
              color: selected ? "#FFFFFF" : color,
              textShadowColor: selected ? "rgba(0, 0, 0, 0.8)" : "transparent",
            },
            numberStyle,
          ]}
        >
          {value}
        </Animated.Text>
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
    backgroundColor: "transparent",
    overflow: "hidden",
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
  cell: {
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    // elevation: 5,
  },
  text: {
    fontWeight: "900",
    width: "100%",
    height: "100%",
    textAlign: "center",
    backgroundColor: "transparent",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  shakeBg: {
    position: "absolute",
    // backgroundColor: "transparent",
    borderRadius: 8,
    zIndex: -1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
});
