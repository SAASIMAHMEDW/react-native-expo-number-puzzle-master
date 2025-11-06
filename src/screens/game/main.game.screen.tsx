import { Button, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;
const MainGameScreen = ({ navigation }: Props) => {
  return (
    <View>
      <Text>MainGameScreen</Text>

      <Button title="Go Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
};

export default MainGameScreen;

const styles = StyleSheet.create({});
