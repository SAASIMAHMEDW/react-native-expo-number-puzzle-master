import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

export interface ToastMessageType {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  position?: "top" | "bottom" | "bottom-right";
}

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  position?: "top" | "bottom" | "bottom-right";
  duration?: number;
  onHide?: () => void;
}

const TYPE_COLORS = {
  success: "#00C851",
  error: "#ff4b5c",
  warning: "#FFD93D",
  info: "#4D96FF",
};

const TYPE_BG_COLORS = {
  success: "#E8F8F0",
  error: "#FFE8EB",
  warning: "#FFF9E6",
  info: "#E8F4FF",
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  position = "bottom-right",
  duration = 2500,
  onHide,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    // Entry animation
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 180,
    });

    // Exit animation after duration
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(30, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      scale.value = withTiming(0.9, {
        duration: 250,
      });

      // Call onHide after animation completes
      setTimeout(() => {
        onHide?.();
      }, 250);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const color = TYPE_COLORS[type];
  const bgColor = TYPE_BG_COLORS[type];

  const positionStyle =
    position === "bottom"
      ? { bottom: 80, alignSelf: "center" as const }
      : position === "bottom-right"
      ? { bottom: 80, right: 20, alignSelf: "flex-end" as const }
      : { top: 60, alignSelf: "center" as const };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          borderColor: color,
          backgroundColor: bgColor,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2.5,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99999,
    maxWidth: "80%",
    minWidth: 180,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
