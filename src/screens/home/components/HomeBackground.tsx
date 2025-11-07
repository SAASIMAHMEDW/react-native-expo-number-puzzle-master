import React from "react";
import { StyleSheet, ImageBackground, Dimensions } from "react-native";
import bg from "@assets/images/homebg.png";

const { width, height } = Dimensions.get("window");

const HomeBackground: React.FC = () => {
  return (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover" />
  );
};

export default HomeBackground;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width,
    height,
    top: 0,
    left: 0,
  },
});
