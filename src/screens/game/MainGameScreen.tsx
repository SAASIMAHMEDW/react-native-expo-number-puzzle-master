import { StyleSheet, View, Text, Button } from "react-native";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  GameAddButton,
  GameBackground,
  GameCard,
  GameGrid,
  GameStars,
} from "./components";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const MainGameScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <GameBackground />
      <GameStars />

      <GameAddButton count={6} onPress={() => console.log("Add pressed")} />
      <GameCard stage={1} score={50} timer="01:23" />

      <View style={styles.content}>
        <GameGrid rows={7} cols={6} />
      </View>
    </View>
  );
};

export default MainGameScreen;

// -------------- STYLES --------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#05000d",
    overflow: "hidden",
  },
  content: {
    marginTop: "23%",
    zIndex: 10,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
  },
});
