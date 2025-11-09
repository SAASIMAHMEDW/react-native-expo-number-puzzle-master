import MainGameScreen from "@screens/game";
import MainHomeScreen from "@screens/home";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@shared/types";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    // <SafeAreaView style={styles.container}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={MainHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={MainGameScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
