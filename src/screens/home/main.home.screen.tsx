import { Button, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
const MainHomeScreen = ({ navigation }: Props) => {
  return (
    <View>
      <Text>MainHomeScreen</Text>

      <Button title="Go Game" onPress={() => navigation.navigate("Game")} />
    </View>
  );
};

export default MainHomeScreen;

const styles = StyleSheet.create({});
