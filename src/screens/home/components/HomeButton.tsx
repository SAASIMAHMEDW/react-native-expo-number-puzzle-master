import React from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

const { width } = Dimensions.get("window");

type HomeButtonProps = {
  onPress?: () => void;
  title: string;
  disabled?: boolean;
  scolor?: string;
  ecolor?: string;
  style?: ViewStyle;
};

const HomeButton = ({
  onPress,
  title,
  disabled = false,
  scolor = "#5CFF5C", // default green
  ecolor = "#1BAE1B",
  style,
}: HomeButtonProps) => {
  const [fontsLoaded, fontError] = useFonts({
    "MomoTrustDisplay-Regular": require("@assets/fonts/MomoTrustDisplay-Regular.ttf"),
  });
  if (!fontsLoaded || fontError) {
    return null;
  }
  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !disabled ? { transform: [{ scale: 0.97 }] } : null,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <LinearGradient
        colors={[scolor, ecolor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

export default HomeButton;

const styles = StyleSheet.create({
  wrapper: {
    width: width * 0.65,
    borderRadius: 40,
    overflow: "hidden",
    marginVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.0,
    shadowRadius: 0,
    elevation: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#131313ff",
    fontSize: 24,
    fontFamily: "MomoTrustDisplay-Regular",
    fontWeight: "800",
    textShadowColor: "rgba(255, 255, 255, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
