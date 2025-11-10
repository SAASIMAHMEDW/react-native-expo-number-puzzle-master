import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import bg from "@assets/images/homebg.png";

const HomeBackground: React.FC = () => {
  const { height, width } = useWindowDimensions();
  return (
    <ImageBackground
      source={bg}
      style={[styles.background, { height, width }]}
      resizeMode="cover"
    />
  );
};

export default HomeBackground;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
