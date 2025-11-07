import { Button, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeBackground, HomeButton } from "./components";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
const MainHomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.gameMainContainer}>
      <HomeBackground />

      <View style={styles.gameSecondaryContainer}>
        <HomeButton
          title="New Game"
          scolor="#FFC44D"
          ecolor="#FF7A00"
          onPress={() => navigation.navigate("Game")}
        />
      </View>
    </View>
  );
};

export default MainHomeScreen;

const styles = StyleSheet.create({
  gameMainContainer: {
    position: "relative",
    flex: 1,
  },
  gameSecondaryContainer: {
    position: "absolute",
    bottom: 150,
    width: "100%",
    alignItems: "center",
  },
});
